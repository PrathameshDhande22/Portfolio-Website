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


def chunk_text(text: str, title: str, markdown: bool = True) -> List[KnowledgeChunk]:
    cleaned = text.strip()
    if not cleaned:
        logger.warning("No content to chunk for title=%r", title)
        return []

    if markdown:
        sections = [
            (
                section.page_content,
                [
                    section.metadata[key]
                    for _, key in HEADERS_TO_SPLIT_ON
                    if section.metadata.get(key)
                ],
            )
            for section in _header_splitter.split_text(cleaned)
        ]
        logger.info("Markdown title=%r split into sections=%d", title, len(sections))
    else:
        sections = [(cleaned, [])]

    chunks: List[KnowledgeChunk] = []
    for section_text, headings in sections:
        for piece in _text_splitter.split_text(section_text):
            piece = piece.strip()
            if not piece:
                continue

            header = f"# {title}"
            if headings:
                header = f"{header}\n{' > '.join(headings)}"
            content = f"{header}\n\n{piece}"

            chunks.append(
                KnowledgeChunk(
                    chunk_index=len(chunks),
                    content=content,
                    content_hash=hashlib.sha256(content.encode("utf-8")).hexdigest(),
                )
            )

    logger.info("Built chunks=%d for title=%r", len(chunks), title)
    return chunks
