# Assistant

The assistant is a [FastAPI](https://fastapi.tiangolo.com/) service built with [LangChain](https://python.langchain.com/). It does two jobs.

1. It reads the profile content from Strapi and stores it as vectors in PostgreSQL.
2. It answers visitor questions using that content, streaming the answer back as it is written.

It runs on port 8000. In development the interactive API docs are at http://localhost:8000/docs. They are switched off in production.

## Folder layout

```
assistant/
  app.py              application setup, lifespan, health endpoint
  config.py           settings read from the environment
  core/               logging, exceptions and request signing
  db/                 tables, session handling
  strapi/             typed client for the Strapi content API
  embedding/          loaders, chunker, provider, vector store
  llm/                chat model provider
  models/             request, response and internal state types
  routes/             the HTTP endpoints
  services/           sync, chat, context and knowledge logic
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check, open |
| `POST` | `/sync` | Queue a knowledge re index, signed |
| `GET` | `/sync/status` | Read the last sync run, signed |
| `POST` | `/chat` | Ask a question, returns a Server Sent Event stream, signed |

## How authentication works

The assistant has no login. It is called by two machines, the Next.js website and the Strapi plugin, and both prove who they are with a signature. There is one shared secret, set as `CLIENT_SECRET` in the assistant and as `ASSISTANT_SECRET` in the other two services.

### Building the signature

The caller builds a canonical string from five parts joined by newlines.

```
POST
/chat
1740489600
0f1c2b3a-4d5e-6f70-8192-a3b4c5d6e7f8
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
```

The parts are the HTTP method in upper case, the request path, a Unix timestamp in seconds, a fresh nonce, and the SHA256 hash of the request body. That string is signed with HMAC SHA256 using the shared secret, and the result is sent as three headers.

| Header | Value |
| --- | --- |
| `X-Timestamp` | The same timestamp used in the string |
| `X-Nonce` | The same nonce, a fresh UUID for every request |
| `X-Signature` | `sha256=` followed by the hex digest |

Because the body hash is part of the signed string, a request cannot be modified in transit without breaking the signature.

### Verifying the signature

```mermaid
flowchart TD
    A[Request arrives] --> B{Headers present}
    B -->|no| R1[401 Missing signature headers]
    B -->|yes| C{Timestamp is a number}
    C -->|no| R2[401 Invalid timestamp]
    C -->|yes| D{Age under 120 seconds}
    D -->|no| R3[401 Signature expired]
    D -->|yes| E[Rebuild the signature]
    E --> F{Digests match}
    F -->|no| R4[401 Invalid signature]
    F -->|yes| G[Insert the nonce]
    G --> H{Nonce already stored}
    H -->|yes| R5[409 Request already processed]
    H -->|no| I[Request accepted]
```

Four protections come out of this.

**The secret is never sent.** Only the digest travels, so watching the traffic does not reveal the secret. The comparison uses `hmac.compare_digest`, which takes the same time whether the first byte differs or the last one does.

**Requests expire.** A signature older than 120 seconds is rejected, so a captured request is useless within a couple of minutes.

**Requests cannot be replayed.** Every nonce is written to a table with a unique constraint. A second request with the same nonce hits the constraint and gets a 409. The database enforces this, so it holds even with several workers running at once.

**Old nonces are cleaned up.** A background task started with the application wakes every 12 hours and deletes nonces older than two days, so the table does not grow forever.

### The daily cap

The chat endpoint has one more limit. Because every accepted chat request stores a nonce with its path, counting today's `/chat` nonces gives the number of answers given today. That count is compared against `MaxDailyResponses` from the CMS.

When the cap is reached the request is not rejected with an error. The assistant streams a short, polite message pointing the visitor at the contact page, so the chat panel behaves normally.

## How sync works

Sync reads everything in the AIKnowledge collection and makes the vector store match it.

```mermaid
flowchart TD
    A[POST /sync] --> B{A sync is already running}
    B -->|yes| C[409 Already in Sync]
    B -->|no| D[Create a sync row and queue the job]
    D --> E[202 Accepted, returned immediately]

    D --> F[Read model settings from Strapi]
    F --> G[Read AIKnowledge entries]
    G --> H[Load each source]
    H --> I[Split into chunks and hash each one]
    I --> J{Chunk changed}
    J -->|unchanged| K[Skip, no embedding call]
    J -->|new or changed| L[Send to the embedding model]
    L --> M[Store the vector in PostgreSQL]
    K --> N[Reconcile deletions]
    M --> N
    N --> O[Mark the sync completed]
```

### Loading the sources

What happens depends on the `SourceType` of the entry.

- `Blog` ignores the entry body. The assistant fetches every entry from `blog-contents`, joins the description and the article body, and indexes each article as its own source.
- `Resume` usually has a PDF attached. The text is extracted with `PdfmuseLoader`. If the PDF holds no extractable text, the assistant falls back to the entry body and writes a warning.
- `Custom` and `FAQ` use the rich text body directly.

### Chunking

Long documents do not fit in one embedding, so they are split.

Markdown is split first on headings, then each section is split again into pieces of about 2800 characters with 280 characters of overlap. The overlap keeps sentences from being cut in half at a boundary.

Every chunk is stored with a header that gives the model context about where the text came from.

```
# Building a RAG pipeline
Backend > Python
Introduction > Why vectors

The actual chunk text starts here.
```

Without the header, a chunk taken from the middle of an article reads as an orphan. With it, the model knows the title, the skill it belongs to and the section it came from.

### Only changed chunks are embedded

Embedding calls cost money, so the assistant avoids repeating them.

Every chunk is hashed with SHA256 before anything is sent to the model. The hash is stored next to the vector. On the next sync the new hash is compared with the stored one, and a chunk is embedded again only when one of these is true.

- The chunk is new.
- The content hash changed.
- The chunk was embedded with a different model than the one now configured.

Running a sync twice without editing anything makes zero embedding calls the second time.

Chunk ids are derived, not random.

```python
def build_chunk_id(source_type: str, source_id: str, chunk_index: int) -> UUID:
    return uuid5(NAMESPACE_URL, f"knowledge:{source_type}:{source_id}:{chunk_index}")
```

The same chunk always lands on the same id, so an update overwrites the old row instead of creating a duplicate.

### Cleaning up

Two kinds of leftovers are removed.

**Shorter documents.** If an article had 10 chunks and now has 6, chunks 6 to 9 are deleted.

**Deleted sources.** After the sync the stored sources are compared with the sources Strapi returned, and anything no longer in Strapi is deleted. This step is skipped when Strapi returns nothing at all, so a CMS outage cannot wipe the index.

### Status

The whole job runs in the background, so `POST /sync` returns straight away with `202 Accepted`. The `Syncing` table tracks the run through `started`, `processing`, and then `completed` or `failed` with the error message. The Strapi plugin page reads this through `GET /sync/status`.

A new sync is refused with a 409 while another one is running. A run older than 30 minutes is treated as abandoned, so a crash does not block syncing forever.

## How chat gives a response

A question goes through two models. The first decides what data is needed, the second writes the answer.

```mermaid
flowchart TD
    A[Question arrives] --> B{Daily cap reached}
    B -->|yes| C[Stream a polite message and stop]
    B -->|no| D[Planner model]
    D --> E{Action}
    E -->|respond| F[Return the planner message as the answer]
    E -->|retrieve| G[Run both lookups at the same time]
    G --> H[Read Strapi collections]
    G --> I[Vector search in PostgreSQL]
    H --> J[Build the context document]
    I --> J
    J --> K[Answer model]
    K --> L[Stream the answer word by word]
```

### The planner

The first model does not write prose. It returns a structured decision.

| Field | Meaning |
| --- | --- |
| `action` | `respond` or `retrieve` |
| `question` | The question, rewritten to stand on its own |
| `message` | The reply text, used when the action is `respond` |
| `structured` | Which Strapi collections to read, with filters |
| `semantic` | Whether to run a vector search, and with what query |

`respond` is used for greetings, thanks and questions that are out of scope. Those never reach the second model, which saves a call.

`retrieve` means the question needs data. The planner names the collections it wants, for example projects or experience, and decides whether a vector search would help.

The planner is asked for structured output and runs with streaming disabled, because a structured result only makes sense once it is complete. If it fails or returns nothing usable, the assistant falls back to a plain semantic search rather than giving up.

### The chain

The whole flow is one LangChain expression.

```python
return RunnableLambda(plan).with_config(
    run_name="plan", tags=["planner"]
) | RunnableBranch(
    (is_refusal, RunnableLambda(refuse).with_config(run_name="refusal")),
    RunnableParallel(
        state=RunnablePassthrough(),
        sources=RunnableLambda(read_sources),
        documents=RunnableLambda(search_knowledge),
    )
    | RunnableLambda(build_context)
    | answer_chain,
)
```

Reading it top to bottom.

1. `plan` runs the planner and attaches its decision to the state.
2. `RunnableBranch` checks the action. When it is `respond`, the planner message becomes the answer and nothing else runs.
3. `RunnableParallel` runs the Strapi reads and the vector search at the same time, so the slower of the two sets the wait, not the sum.
4. `build_context` merges both results into one markdown document.
5. `answer_chain` writes the answer with the history and the context in the prompt.

### Building the context

The Strapi sections and the vector search results are joined into one document. The retrieved chunks are added under a `## Reference material` heading. If nothing matched, the context says so plainly, which is what stops the model from inventing an answer.

### The event stream

The response is a Server Sent Event stream. Events arrive in this order.

| Event | When | Contains |
| --- | --- | --- |
| `meta` | First, always | The thread id for the conversation |
| `plan` | After the planner decides | The action, the rewritten question, the sources and whether search ran |
| `usage` | After each model finishes | Stage, model name and token counts |
| `delta` | Many times | The next piece of the answer |
| `done` | Last | The thread id and the action taken |
| `error` | Instead of `done` | A short message, details stay in the log |

The `plan` event is what lets the chat panel show what the assistant is doing while the answer is still being written.

Token usage is written to a table for every model call, tagged with the thread, the stage and the action, so cost can be traced per conversation.

### Prompts live in the CMS

The system prompts for both models are read from the LLMSetting single type in Strapi, along with the connector, the model name and the daily cap. Changing how the assistant behaves is a content edit, not a deployment.

## Configuration

| Name | Purpose |
| --- | --- |
| `ENVIRONMENT` | `development` or `production`, controls debug mode and the API docs |
| `POSTGRES_CONNECTION_STRING` | Async PostgreSQL URL, for example `postgresql+asyncpg://user:pass@host:5432/db` |
| `STRAPI_API_URL` | Strapi content API |
| `STRAPI_AUTH_TOKEN` | Strapi API token |
| `CLIENT_SECRET` | Shared secret used to verify signatures |
| `MISTRAL_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `AZURE_OPENAI_API_KEY` | Provider keys, set the ones you use |
| `OPENAI_API_VERSION` | Azure OpenAI API version |
| `LANGSMITH_API_KEY`, `LANGSMITH_TRACING`, `LANGSMITH_PROJECT` | Optional tracing |

Which provider is actually used comes from the CMS, not from the environment. The environment only supplies the keys.

## Running

```bash
uv sync
uv run uvicorn app:app --reload --port 8000
```

Tables are created on startup, including the vector table and its HNSW index. The service reads its model configuration from Strapi at startup, so the CMS has to be running first.
