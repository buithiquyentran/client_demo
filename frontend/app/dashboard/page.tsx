"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { ProductCard } from "@/components/product-card";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Upload } from "lucide-react";
import type { Product } from "@/lib/types";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductByImage,
} from "@/lib/api-client";

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  // ===============================
  // 🧩 Fetch products when mounted
  // ===============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ===============================
  // 🔍 Filter products
  // ===============================
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, statusFilter, products]);

  const handleCreateProduct = async (formData: FormData) => {
    const created = await createProduct(formData);
    setProducts([...products, created]);
    setIsDialogOpen(false);
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!editingProduct) return;
    const updated = await updateProduct(editingProduct.id, formData);
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? updated : p))
    );
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  };

  // ===============================
  // 🗑 Delete product
  // ===============================
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá sản phẩm này không?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      console.log("🗑 Product deleted:", id);
    } catch (err) {
      console.error("❌ Failed to delete product:", err);
      alert("Lỗi khi xoá sản phẩm!");
    }
  };

  // ===============================
  // ✨ UI helpers
  // ===============================
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  };
  const handleSearchByImage = async (e) => {
    try {
      const formData = new FormData();

      // Nếu gọi từ input file thì có e.target.files
      const file = e?.target?.files?.[0];
      if (file) {
        formData.append("file", file);
      }

      // Nếu có text search thì thêm query_text

      // Gọi API
      const res = await searchProductByImage(formData);
      console.log("Search result:", res);
      setFilteredProducts(res); // ✅ Tùy backend trả về dạng nào
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ===============================
  // 🧱 Render UI
  // ===============================
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Products</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your product catalog
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {/* Upload ảnh for search*/}
                <label className=" absolute right-1 cursor-pointer text-gray-400 hover:text-primary p-2">
                  <Upload size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSearchByImage}
                  />
                </label>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredProducts?.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
              {filteredProducts?.length === 0 && (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">
                    No products found
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details below."
                : "Fill in the details to create a new product."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSubmit={
              editingProduct ? handleUpdateProduct : handleCreateProduct
            }
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
