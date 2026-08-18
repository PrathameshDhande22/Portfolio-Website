import hashlib
import logging
from typing import List

from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

from models import KnowledgeChunk

logger = logging.getLogger(__name__)


CHARS_PER_TOKEN = 4
CHUNK_SIZE = 700 * CHARS_PER_TOKEN
CHUNK_OVERLAP = CHUNK_SIZE // 10

HEADERS_TO_SPLIT_ON = [("#", "h1"), ("##", "h2"), ("###", "h3")]

_text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", ". ", " ", ""],
    keep_separator=True,
)

_header_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=HEADERS_TO_SPLIT_ON,
    strip_headers=True,
)


def compute_hash(content: str) -> str:
    """SHA-256 of a chunk, compared against the stored hash before spending an embedding call."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def chunk_markdown(text: str, title: str) -> List[KnowledgeChunk]:
    """Split markdown on its headings first, then on size, keeping the heading path on each piece."""
    cleaned = text.strip()
    if not cleaned:
        logger.warning("No markdown content to chunk for title=%r", title)
        return []

    sections = _header_splitter.split_text(cleaned)
    logger.info("Markdown title=%r split into sections=%d", title, len(sections))

    contents: List[str] = []
    for section in sections:
        headings = [
            section.metadata[key]
            for _, key in HEADERS_TO_SPLIT_ON
            if section.metadata.get(key)
        ]
        for piece in _split_to_pieces(section.page_content):
            contents.append(_with_context(piece, title, headings))

    return _build_chunks(contents, title)


def chunk_plain_text(text: str, title: str) -> List[KnowledgeChunk]:
    """Split unstructured text - PDF output has no reliable heading markup to split on."""
    cleaned = text.strip()
    if not cleaned:
        logger.warning("No plain text content to chunk for title=%r", title)
        return []

    contents = [
        _with_context(piece, title, []) for piece in _split_to_pieces(cleaned)
    ]
    return _build_chunks(contents, title)


def _split_to_pieces(text: str) -> List[str]:
    """Size based split, dropping the empty pieces the splitter can emit on blank sections."""
    return [piece.strip() for piece in _text_splitter.split_text(text) if piece.strip()]


def _with_context(piece: str, title: str, headings: List[str]) -> str:
    """Prepend the document title and heading path so the chunk carries its own context."""
    header = f"# {title}"
    if headings:
        header = f"{header}\n{' > '.join(headings)}"
    return f"{header}\n\n{piece.strip()}"


def _build_chunks(contents: List[str], title: str) -> List[KnowledgeChunk]:
    chunks = [
        KnowledgeChunk(
            chunk_index=index,
            content=content,
            content_hash=compute_hash(content),
        )
        for index, content in enumerate(contents)
    ]
    logger.info("Built chunks=%d for title=%r", len(chunks), title)
    return chunks
