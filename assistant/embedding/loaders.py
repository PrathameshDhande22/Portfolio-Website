import logging
import tempfile
from pathlib import Path
import httpx
from langchain_pdfmuse import PdfmuseLoader

from config import settings
from models import StrapiMedia

logger = logging.getLogger(__name__)


def is_pdf(media: StrapiMedia | None) -> bool:
    return media is not None and media.mime == "application/pdf"


def resolve_media_url(url: str) -> str:
    if url.startswith(("http://", "https://")):
        return url
    base = settings.strapi_api_url.removesuffix("/api").rstrip("/")
    return f"{base}/{url.lstrip('/')}"


async def load_pdf_text(media: StrapiMedia) -> str:
    url = resolve_media_url(media.url)

    with tempfile.TemporaryDirectory(prefix="assistant-media-") as tempdir:
        pdf_path = Path(tempdir) / f"{media.hash}{media.ext}"
        await _download(url, pdf_path)
        documents = await PdfmuseLoader(pdf_path, mode="page").aload()

    pages = [document.page_content.strip() for document in documents]
    text = "\n\n".join(page for page in pages if page)
    logger.info(
        "Extracted pages=%d characters=%d from media=%r",
        len(documents),
        len(text),
        media.name,
    )
    return text


async def _download(url: str, destination: Path) -> None:
    logger.info("Downloading media url=%s", url)
    async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        destination.write_bytes(response.content)
    logger.info("Downloaded bytes=%d to path=%s", destination.stat().st_size, destination)
