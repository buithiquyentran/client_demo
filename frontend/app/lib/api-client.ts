import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// 🧱 Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // nếu sau này có cookie auth thì bật true
  headers: {
    "Content-Type": "application/json",
  },
});

// 🎯 Loading state callbacks (sẽ được set từ component)
let loadingCallbacks: {
  onStart?: () => void;
  onEnd?: () => void;
} = {};

export function setLoadingCallbacks(callbacks: typeof loadingCallbacks) {
  loadingCallbacks = callbacks;
}

// 📊 Request interceptor - Bắt đầu loading
api.interceptors.request.use(
  (config) => {
    loadingCallbacks.onStart?.();
    return config;
  },
  (error) => {
    loadingCallbacks.onEnd?.();
    return Promise.reject(error);
  }
);

// 📊 Response interceptor - Kết thúc loading
api.interceptors.response.use(
  (response) => {
    loadingCallbacks.onEnd?.();
    return response;
  },
  (error) => {
    loadingCallbacks.onEnd?.();
    return Promise.reject(error);
  }
);

// 🧩 Xử lý lỗi chung
function handleError(error: any) {
  if (axios.isAxiosError(error)) {
    console.error("Axios Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        `Request failed: ${error.message}`
    );
  }
  throw error;
}

// 🧱 Get all products
export async function getProducts() {
  try {
    const res = await api.get("/products", {
      headers: { "Cache-Control": "no-store" },
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

// 🧱 Get single product
export async function getProduct(id: string) {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
}
export async function getThumbnail(
  asset_id: number,
  params: Record<string, any> = {}
) {
  const res = await api.get(`/proxy-image-thumbnail/${asset_id}`, {
    params,
    responseType: "blob", // 👈 lấy dạng binary
  });
  // Tạo object URL để <img> dùng được
  return URL.createObjectURL(res.data);
}
export async function getImage(params: Record<string, any> = {}) {
  try {
    const res = await api.get("/proxy-image-origin", {
      params,
      responseType: "blob", // 👈 lấy dạng binary
    });

    // Tạo object URL để <img> dùng được
    return URL.createObjectURL(res.data);
  } catch (error) {
    handleError(error);
    return null;
  }
}

// 🧱 Create new product (with image upload)
export async function createProduct(formData: FormData) {
  try {
    const res = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

// 🧱 Update existing product
export async function updateProduct(id: string, data) {
  try {
    const res = await api.patch(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    handleError(error);
  }
}

// 🧱 Delete product
export async function deleteProduct(id: string) {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    handleError(error);
  }
}

export async function searchProductByImage(formData: FormData) {
  try {
    const res = await api.post("/search-by-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } catch (error) {
    handleError(error);
  }
}
