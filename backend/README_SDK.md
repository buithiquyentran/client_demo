# PhotoStore SDK - Quick Start

## ✅ SDK đã sẵn sàng sử dụng!

### 🎯 Kiểm tra nhanh

```bash
cd client_demo/backend
python test_sdk.py
```

Kết quả:

```
✅ Client initialized successfully
✅ Signature generated successfully
✅ Headers generated successfully
✅ List assets successful!
```

### 🚀 Sử dụng trong code

File `utils_sdk.py` đã setup sẵn:

```python
from photostore_sdk import PhotoStoreClient

# Client đã được khởi tạo sẵn!
photostore = PhotoStoreClient(
    api_key="pk_qfYvKNeFcYPVkxrcxl3av6JXx7Nrnak3g5sl8tSEHhc",
    api_secret="sk_4wjxHPtf4Swac_WSmfdp7DPkHQB-I1NPw_yArBZHRffFCuArurYHKOhpn8tJPYJF",
    base_url="http://localhost:8000"
)

# Sử dụng các functions có sẵn:
# - upload_files(files, folder_slug, is_private)
# - search_by_image(file, limit)
# - search_by_text(query, limit)
# - get_image(file_url)
# - list_assets(folder_path, limit)
```

### 📝 Ví dụ trong main.py

```python
from utils_sdk import upload_files, search_by_image

@app.post("/upload")
async def upload(files: List[UploadFile] = File(...)):
    return await upload_files(files, folder_slug="products")

@app.post("/search")
async def search(file: UploadFile = File(...)):
    return await search_by_image(file, limit=10)
```

### 🎉 Hoàn thành!

Client demo của bạn giờ đã sử dụng SDK, code ngắn gọn và dễ maintain hơn nhiều!

**So sánh:**

- ❌ Trước: ~50 dòng code với HMAC mỗi function
- ✅ Sau: ~5 dòng code, SDK lo tất cả!

### 📚 Đọc thêm

- `SDK_SETUP_GUIDE.md` - Hướng dẫn chi tiết
- `photostore/sdk/python/README.md` - API reference
- `photostore/sdk/python/example.py` - Ví dụ đầy đủ
