"""
PhotoStore Client Utilities - Simplified with SDK
Using PhotoStore SDK for clean API interactions without worrying about HMAC
"""

from typing import List, Optional
import sys
import os
from pathlib import Path
from fastapi import HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from numpy import number

from photostore_sdk import PhotoStoreClient, PhotoStoreException

# Load environment variables from .env file
load_dotenv()

# Initialize PhotoStore client once - that's it!
photostore = PhotoStoreClient(
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET"),
    base_url=os.getenv("API_BASE_URL"),
)


def get_image(file_url: str):
    """Get image from PhotoStore (auto handles authentication)"""
    try:
        image_data = photostore.get_asset_url(file_url)
        
        content_type = "image/jpeg"
        if file_url.endswith(".png"):
            content_type = "image/png"
        elif file_url.endswith(".webp"):
            content_type = "image/webp"
        
        return StreamingResponse(iter([image_data]), media_type=content_type)
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))

def get_thumbnail(
    asset_id: int,
    width: int = 300,
    height: int = 300,
    format: str = "webp",
    quality: int = 80
):
    """Get thumbnail using SDK - simple function call!"""
    try:
        thumb_data = photostore.get_thumbnail(
            asset_id=asset_id,
            width=width,
            height=height,
            format=format,
            quality=quality
        )
        
        content_type = "image/webp"
        if format in ["jpg", "jpeg"]:
            content_type = "image/jpeg"
        elif format == "png":
            content_type = "image/png"
        
        return StreamingResponse(iter([thumb_data]), media_type=content_type)
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))

async def upload_file(
    file: UploadFile = File(...),
    folder_slug: str = "home",
    is_private: bool = False
):
    """Upload single file using SDK - simple and clean!"""
    try:
        # Read file content directly - no need to save to disk!
        content = await file.read()
        
        # Detect content type
        content_type = file.content_type or "application/octet-stream"
        
        # Upload directly with file bytes
        result = photostore.upload_files(
            file_objects=[(file.filename, content, content_type)],
            folder_slug=folder_slug,
            is_private=is_private
        )
        
        return result
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))

async def search_image(file: UploadFile = File(...), k: int = 10):
    """Search similar images - SDK handles everything!"""
    try:
        content = await file.read()
        # Pass file bytes directly to SDK
        results = photostore.search_image(
            file=content,
            filename=file.filename,
            k=k
        )
        
        return results.get("data")
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))


def search_by_text(query: str, k: int = 10):
    """Search by text - one simple function call!"""
    try:
        results = photostore.search_text(query_text=query, k=k)
        return results.get("data", {}).get("searchResults", [])
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))


def list_assets(folder_id: Optional[int] = None):
    """List assets - SDK handles authentication automatically"""
    try:
        # list_assets returns a list directly, not wrapped in "data"
        results = photostore.list_assets(folder_id=folder_id)
        return results if isinstance(results, list) else []
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))

def delete_image(asset_id: number, permanently: bool = False):
    """Delete image by asset ID using SDK"""
    try:
        photostore.delete_asset(asset_id, permanently=permanently)
    except PhotoStoreException as e:
        raise HTTPException(status_code=400, detail=str(e))