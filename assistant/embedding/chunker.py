import hashlib
import logging
from typing import List, NamedTuple, Optional

from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)

from models import KnowledgeChunk

logger = logging.getLogger(__name__)


class MarkdownHeader(NamedTuple):
    separator: str
    key: str


class Section(NamedTuple):
    text: str
    headings: List[str]


HEADERS_TO_SPLIT_ON = [
    MarkdownHeader("#", "h1"),
    MarkdownHeader("##", "h2"),
    MarkdownHeader("###", "h3"),
]

_text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2800,
    chunk_overlap=280,
    separators=["\n\n", "\n", ". ", " ", ""],
    keep_separator=True,
)

_header_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=HEADERS_TO_SPLIT_ON,
    strip_headers=True,
)


def chunk_text(
    text: str,
    title: str,
    subtitle: Optional[str] = None,
    markdown: bool = True,
) -> List[KnowledgeChunk]:
    cleaned = text.strip()
    if not cleaned:
        logger.warning("No content to chunk for title=%r", title)
        return []

    if markdown:
        sections = [
            Section(
                text=section.page_content,
                headings=[
                    section.metadata[header.key]
                    for header in HEADERS_TO_SPLIT_ON
                    if section.metadata.get(header.key)
                ],
            )
            for section in _header_splitter.split_text(cleaned)
        ]
        logger.info("Markdown title=%r split into sections=%d", title, len(sections))
    else:
        sections = [Section(text=cleaned, headings=[])]

    chunks: List[KnowledgeChunk] = []
    for section in sections:
        for piece in _text_splitter.split_text(section.text):
            piece = piece.strip()
            if not piece:
                continue

            header = f"# {title}"
            if subtitle:
                header = f"{header}\n{subtitle}"
            if section.headings:
                header = f"{header}\n{' > '.join(section.headings)}"
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
