from typing import List
from fastapi import FastAPI, HTTPException, UploadFile, File,Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import uuid
from datetime import datetime
import os
from fastapi import Query



app = FastAPI()

# Cho phép React call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DATA_FILE = "products.json"
# from utils_sdk import upload_files, get_image, delete_image, search_by_image
from utils_sdk import get_thumbnail, upload_file, get_image, search_by_image, delete_image

# ============================
# 🔹 Helper functions
# ============================

def load_products():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products(products):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)


# ============================
# 🔹 Models
# ============================

class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    stock: int
    status: str
    category: str
    image_origin_url: Optional[str] = None
    image_id: int
    createdAt: str
    updatedAt: str


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    status: str
    category: str
    image: Optional[str] = None


# ============================
# 🔹 Routes CRUD
# ============================

@app.get("/proxy-image-origin")
def get_proxy_image( file_url: str | None = Query(None, description="File url"),
):
    """Lấy danh sách sản phẩm"""
    return get_image(file_url)

@app.get("/proxy-image-thumbnail/{asset_id}")
def get_proxy_image_thumbnail(asset_id: int,
    w: int = Query(..., ge=50, le=2000, description="Width in pixels"),
    h: int = Query(..., ge=50, le=2000, description="Height in pixels"),
    format: str = Query("webp", regex="^(webp|jpg|jpeg|png)$", description="Output format"),
    q: int = Query(80, ge=10, le=100, description="Quality (10-100)"),
):
    return get_thumbnail(
        asset_id=asset_id,
        width=w,
        height=h,
        format=format,
        quality=q
    )

@app.get("/products", response_model=List[Product])
def get_products():
    """Lấy danh sách sản phẩm"""
    return load_products()


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    """Lấy chi tiết sản phẩm theo ID"""
    products = load_products()
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/products")
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    status: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...)
):
    """
    Tạo sản phẩm mới + upload ảnh qua API thật
    """
    products = load_products()

    # 🖼 Upload ảnh nếu có
    image_origin_url = None
    if image:
        try:
            upload_res = await upload_file(image)
            image_origin_url = upload_res.get("data", {}) \
                      .get("uploadFile", {}) \
                      .get("file", {}) \
                      .get("file_url")
            image_id = upload_res.get("data", {}) \
                    .get("uploadFile", {}) \
                    .get("file", {}) \
                    .get("id")
            print("image_origin_url", upload_res)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Upload failed: {e}")

    new_product = {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "price": price,
        "stock": stock,
        "status": status,
        "category": category,
        "image": image_origin_url,
        "image_id": image_id,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }

    products.append(new_product)
    save_products(products)

    return new_product

# ---------- PATCH route ----------
@app.patch("/products/{product_id}")
async def update_product(
    product_id: str,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    stock: Optional[int] = Form(None),
    status: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    image: UploadFile = File(None)
):
    """Cập nhật sản phẩm — nếu có file mới thì upload, xoá ảnh cũ"""

    products = load_products()
    product = next((p for p in products if p["id"] == product_id), None)
    if not product:
        raise HTTPException(404, "Product not found")
    if image:
        try:
            upload_res = await upload_file(image)
            image_origin_url = upload_res.get("data", {}) \
                    .get("uploadFile", {}) \
                    .get("file", {}) \
                    .get("file_url")
            image_id = upload_res.get("data", {}) \
                    .get("uploadFile", {}) \
                    .get("file", {}) \
                    .get("id")
            print("image_origin_url", upload_res)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Upload failed: {e}")

        if not image_origin_url:
            raise HTTPException(400, "Upload failed or file_url missing")

        # # xoá ảnh cũ nếu có
        if product.get("image") is not None:
            delete_image(product["image_id"], permanently=False)

        product["image"] = image_origin_url
        product["image_id"] = image_id
    # Cập nhật các trường khác
    updates = {
        "name": name,
        "description": description,
        "price": price,
        "stock": stock,
        "status": status,
        "category": category,
    }
    for key, value in updates.items():
        if value is not None:
            product[key] = value

    product["updatedAt"] = datetime.utcnow().isoformat()
    save_products(products)

    return {"message": "Product updated successfully", "data": product}

@app.delete("/products/{product_id}")
def delete_product(product_id: str):
    """Xóa sản phẩm"""
    products = load_products()
    new_products = [p for p in products if p["id"] != product_id]
    if len(new_products) == len(products):
        raise HTTPException(status_code=404, detail="Product not found")
    # Xóa ảnh
    product = next((p for p in products if p["id"] == product_id), None)
    print("Deleting image for product ID:", product_id)
    if product.get("image") is not None:
        print("Deleting image with asset ID:", product["image_id"])
        delete_image(product["image_id"])
    
    save_products(new_products)
    return {"message": "Product deleted successfully"}


@app.post("/search-by-image")
async def search_image_route(file: UploadFile = File(...)):
    """
    Upload 1 ảnh để tìm các sản phẩm có hình tương tự.
    """
    try:
        # 🧠 Gọi hàm search_by_image trong utils để nhận danh sách URL tương tự
        search_results = await search_by_image(file)
        if not search_results:
            return {"status": "success", "message": "Không tìm thấy hình tương tự", "data": []}

        # 🧩 Lấy danh sách file_url từ kết quả embedding search
        # ví dụ: ['http://localhost:8000/uploads/abc.jpg', '...']
        similar_urls = [item["file_url"] for item in search_results if "file_url" in item]

        # 📂 Đọc toàn bộ products.json
        products = load_products()

        # 🔍 Lọc các product có image nằm trong danh sách tương tự
        matched_products = [
            p for p in products if p.get("image") in similar_urls
        ]

        return {
            "status": "success",
            "message": f"Tìm thấy {len(matched_products)} sản phẩm tương tự",
            "data": matched_products
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        print("❌ Lỗi search image:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    """
    Nhận 1 file ảnh, gọi hàm search_by_image trong utils,
    và trả về kết quả.
    """
    try:
        # Gọi hàm search_by_image từ utils
        results = await search_by_image(file)

        return {
            "status": "success",
            "message": "Search completed successfully",
            "data": results
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        print("❌ Lỗi search image:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")