# Hướng dẫn Setup PhotoStore SDK cho Client

## 📋 Yêu cầu

- Python 3.8+
- `requests` library
- PhotoStore API đang chạy tại `http://localhost:8000`

## 🚀 Cài đặt

### Bước 1: Cài đặt dependencies

```bash
pip install requests
```

### Bước 2: Sao chép SDK

SDK đã có sẵn tại: `photostore/sdk/python/`

Bạn có 2 cách sử dụng:

#### Cách 1: Import trực tiếp (đang dùng)

```python
import sys
from pathlib import Path

# Add SDK vào Python path
SDK_PATH = Path(__file__).parent.parent.parent / "photostore" / "sdk" / "python"
sys.path.insert(0, str(SDK_PATH))

from photostore_sdk import PhotoStoreClient
```

#### Cách 2: Copy SDK vào project (khuyến nghị cho production)

```bash
# Copy toàn bộ folder SDK vào project của bạn
cp -r photostore/sdk/python/ your_project/photostore_sdk/
```

Sau đó import đơn giản:

```python
from photostore_sdk import PhotoStoreClient
```

## 📝 Sử dụng cơ bản

### 1. Khởi tạo Client

```python
from photostore_sdk import PhotoStoreClient

client = PhotoStoreClient(
    api_key="your_api_key",        # Lấy từ PhotoStore
    api_secret="your_api_secret",   # Lấy từ PhotoStore
    base_url="http://localhost:8000"
)
```

### 2. Upload files (như đã làm)

```python
from utils_sdk import upload_files

# Trong FastAPI endpoint
@app.post("/upload")
async def upload(files: List[UploadFile] = File(...)):
    result = await upload_files(
        files=files,
        folder_slug="products",
        is_private=False,
        tags=["product", "catalog"]
    )
    return result
```

### 3. Search images

```python
from utils_sdk import search_by_image

@app.post("/search/image")
async def search(file: UploadFile = File(...)):
    results = await search_by_image(file, limit=10)
    return {"results": results}
```

### 4. Get private images

```python
from utils_sdk import get_image

@app.get("/image")
async def image(url: str):
    return get_image(url)
```

## ✅ Verify Setup

Chạy file test để kiểm tra:

```bash
cd client_demo/backend
python test_sdk.py
```

Kết quả mong đợi:

```
==================================================
Testing PhotoStore SDK
==================================================
✅ Client initialized successfully
✅ Signature generated successfully
✅ Headers generated successfully
✅ List assets successful!
==================================================
```

## 🔧 Troubleshooting

### Lỗi: `ModuleNotFoundError: No module named 'photostore_sdk'`

**Nguyên nhân**: Python không tìm thấy SDK

**Giải pháp**:

1. Kiểm tra path trong `utils_sdk.py`:

   ```python
   SDK_PATH = Path(__file__).parent.parent.parent / "photostore" / "sdk" / "python"
   print(f"SDK Path: {SDK_PATH}")
   print(f"Exists: {SDK_PATH.exists()}")
   ```

2. Hoặc copy SDK vào project:

   ```bash
   cp -r D:/KHMT/LUANVAN/photostore/sdk/python client_demo/backend/photostore_sdk
   ```

   Sau đó thay đổi import:

   ```python
   from photostore_sdk import PhotoStoreClient
   ```

### Lỗi: `401 Unauthorized`

**Nguyên nhân**: API key/secret không đúng hoặc PhotoStore API chưa chạy

**Giải pháp**:

1. Kiểm tra PhotoStore API đang chạy:

   ```bash
   curl http://localhost:8000/health
   ```

2. Kiểm tra API key/secret trong `utils_sdk.py`

3. Tạo API key mới từ PhotoStore admin panel

### Lỗi: `Connection refused`

**Nguyên nhân**: PhotoStore API chưa chạy

**Giải pháp**:

```bash
cd photostore/backend
uvicorn main:app --reload
```

## 📦 Structure hiện tại

```
client_demo/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── utils_sdk.py         # SDK wrapper (sử dụng SDK)
│   ├── test_sdk.py          # Test file
│   └── products.json
└── frontend/

photostore/
└── sdk/
    └── python/
        ├── __init__.py
        ├── photostore_sdk.py    # SDK chính
        ├── README.md
        └── example.py
```

## 🎯 So sánh Code

### ❌ Trước (không dùng SDK):

```python
def get_signature():
    timestamp = int(time.time())
    message = f"{timestamp}:{API_KEY}"
    signature = hmac.new(
        API_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return {"signature": signature, "timestamp": timestamp}

async def upload_files(files):
    sig = get_signature()
    # 20 dòng code phức tạp với HMAC...
```

### ✅ Sau (dùng SDK):

```python
from photostore_sdk import PhotoStoreClient

client = PhotoStoreClient(api_key="...", api_secret="...")

async def upload_files(files):
    # 1 dòng code đơn giản!
    return client.upload_files(files=temp_files)
```

## 🚀 Production Setup

Cho môi trường production, nên:

1. **Copy SDK vào project**:

   ```bash
   mkdir -p your_project/lib
   cp -r photostore/sdk/python your_project/lib/photostore_sdk
   ```

2. **Dùng environment variables**:

   ```python
   import os

   client = PhotoStoreClient(
       api_key=os.getenv("PHOTOSTORE_API_KEY"),
       api_secret=os.getenv("PHOTOSTORE_API_SECRET"),
       base_url=os.getenv("PHOTOSTORE_URL", "https://api.photostore.com")
   )
   ```

3. **Thêm error handling**:
   ```python
   try:
       result = client.upload_files(files)
   except PhotoStoreException as e:
       logger.error(f"Upload failed: {e}")
       # Handle error
   ```

## 📚 Tài liệu đầy đủ

Xem thêm:

- `photostore/sdk/python/README.md` - API reference đầy đủ
- `photostore/sdk/python/example.py` - Ví dụ sử dụng
- `client_demo/backend/utils_sdk.py` - Integration example

## 💡 Tips

1. **Cache client instance**: Khởi tạo client 1 lần và dùng lại
2. **Async/await**: SDK hiện tại là sync, wrap trong async function
3. **Connection pooling**: SDK tự động dùng requests session
4. **Timeout**: Có thể set timeout khi init client

```python
client = PhotoStoreClient(
    api_key="...",
    api_secret="...",
    timeout=60  # 60 seconds
)
```
