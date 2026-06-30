"""
ImageKit upload helper.
Downloads an image from a URL and uploads it to ImageKit,
returning the filePath that should be stored in Supabase.
"""

import base64
import logging
import httpx
from config import Config

logger = logging.getLogger(__name__)


async def upload_image(
    source_url: str,
    file_name: str,
    folder: str = "/gallery",
) -> str | None:
    """
    Download image from source_url and upload to ImageKit.
    Returns the ImageKit filePath (e.g. /gallery/photo.jpg) or None on failure.
    """
    if not Config.IMAGEKIT_PRIVATE_KEY:
        logger.warning("IMAGEKIT_PRIVATE_KEY not set — skipping upload for %s", file_name)
        return None

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            img_resp = await client.get(source_url)
            img_resp.raise_for_status()
            image_bytes = img_resp.content
            content_type = img_resp.headers.get("content-type", "image/jpeg")

        # Build base64 data URI
        b64 = base64.b64encode(image_bytes).decode()
        data_uri = f"data:{content_type};base64,{b64}"

        # ImageKit upload uses HTTP Basic auth with private key as username
        auth = base64.b64encode(f"{Config.IMAGEKIT_PRIVATE_KEY}:".encode()).decode()

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://upload.imagekit.io/api/v1/files/upload",
                headers={"Authorization": f"Basic {auth}"},
                data={
                    "file": data_uri,
                    "fileName": file_name,
                    "folder": folder,
                    "useUniqueFileName": "false",
                    "overwriteFile": "true",
                },
            )
            resp.raise_for_status()
            result = resp.json()
            file_path = result.get("filePath", "")
            logger.info("Uploaded to ImageKit: %s", file_path)
            return file_path

    except Exception as exc:
        logger.error("ImageKit upload failed for %s: %s", file_name, exc)
        return None
