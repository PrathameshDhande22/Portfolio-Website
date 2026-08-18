import logging
from typing import List

from models import AIKnowledge, SourceDocument
from strapi import strapi_client

from .chunker import chunk_text
from .loaders import is_pdf, load_pdf_text

logger = logging.getLogger(__name__)


async def process(knowledge: AIKnowledge) -> List[SourceDocument]:
    logger.info(
        "Processing AIKnowledge title=%r source_type=%s document_id=%s",
        knowledge.Title,
        knowledge.SourceType,
        knowledge.documentId,
    )

    documents: List[SourceDocument] = []

    if knowledge.SourceType == "Blog":
        response = await strapi_client.get_blog_contents()
        logger.info(
            "Fetched blog contents=%d for AIKnowledge title=%r",
            len(response.data),
            knowledge.Title,
        )

        for blog_content in response.data:
            blog = blog_content.Blog
            if blog is None:
                logger.warning(
                    "BlogContent document_id=%s has no linked blog, skipping it",
                    blog_content.documentId,
                )
                continue

            markdown = "\n\n".join(
                part
                for part in (blog.Description, blog_content.Content)
                if part and part.strip()
            )

            chunks = chunk_text(markdown, blog.Title)
            if not chunks:
                logger.warning("Blog title=%r has no content, skipping it", blog.Title)
                continue

            documents.append(
                SourceDocument(
                    source_type="Blog",
                    source_id=blog.documentId,
                    title=blog.Title,
                    chunks=chunks,
                )
            )

        logger.info("Prepared blog documents=%d", len(documents))
        return documents

    chunks = []
    if is_pdf(knowledge.Media):
        text = await load_pdf_text(knowledge.Media)
        if text.strip():
            chunks = chunk_text(text, knowledge.Title, markdown=False)
        else:
            logger.warning(
                "PDF media=%r of title=%r has no extractable text, falling back to Content",
                knowledge.Media.name,
                knowledge.Title,
            )
    elif knowledge.Media is not None:
        logger.warning(
            "Media of title=%r has unsupported mime=%s, falling back to Content",
            knowledge.Title,
            knowledge.Media.mime,
        )

    if not chunks:
        chunks = chunk_text(knowledge.Content or "", knowledge.Title)

    if not chunks:
        logger.warning(
            "AIKnowledge title=%r produced no chunks, nothing to index", knowledge.Title
        )
        return documents

    documents.append(
        SourceDocument(
            source_type=knowledge.SourceType,
            source_id=knowledge.documentId,
            title=knowledge.Title,
            chunks=chunks,
        )
    )
    return documents
