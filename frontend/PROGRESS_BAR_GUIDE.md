# Progress Bar Implementation

## ✅ Đã cài đặt:

### 1. **Automatic Progress Bar cho tất cả API calls**

- Tự động hiển thị khi gọi API
- Không cần code thêm gì
- Hoạt động với tất cả functions trong `api-client.ts`

### 2. **Components được tạo:**

- `components/ui/progress.tsx` - Progress bar component
- `lib/loading-context.tsx` - Loading state management
- `components/global-progress-bar.tsx` - Kết nối axios với UI

### 3. **Cách hoạt động:**

```
API Request → Axios Interceptor → setIsLoading(true) → Progress Bar hiển thị
API Response → Axios Interceptor → setIsLoading(false) → Progress Bar ẩn
```

## 📖 Sử dụng:

### Tự động (đã hoạt động):

```typescript
// Không cần làm gì thêm, tất cả API calls đã có progress bar
await getProducts();
await createProduct(formData);
await searchProductByImage(formData);
```

### Manual control (nếu cần):

```typescript
import { useLoading } from "@/lib/loading-context";

function MyComponent() {
  const { setIsLoading, setProgress } = useLoading();

  const handleUpload = async () => {
    setIsLoading(true);
    setProgress(0);

    // Upload logic với progress updates
    setProgress(50);

    setProgress(100);
    setIsLoading(false);
  };
}
```

## 🎨 Tùy chỉnh:

### Thay đổi màu sắc:

Sửa trong `components/ui/progress.tsx`:

```tsx
className = "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500";
// Đổi thành màu khác:
className = "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500";
```

### Thay đổi tốc độ:

```tsx
const increment = (90 - prev) * 0.15; // Tăng 0.15 = nhanh hơn, giảm = chậm hơn
```
