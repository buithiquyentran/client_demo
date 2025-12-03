"use client";

import type { Product } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getImage, getThumbnail } from "@/lib/api-client";
interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const statusColors = {
    active: "bg-success/20 text-success border-success/30",
    draft: "bg-warning/20 text-warning border-warning/30",
    archived: "bg-muted text-muted-foreground border-border",
  };
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string;

    if (product?.image_id) {
      // getImage({ file_url: product.image_origin_url }).then((url) => {
      //   objectUrl = url;
      //   setImageSrc(url);
      // });
      getThumbnail(product.image_id, {
        w: 300,
        h: 300,
      }).then((url) => {
        objectUrl = url;
        setImageSrc(url);
      });
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [product]);

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {imageSrc ? (
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <Badge
            className={`absolute right-2 top-2 ${statusColors[product.status]}`}
          >
            {product.status}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-card-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-lg font-bold text-primary">
                ${product.price}
              </p>
              <p className="text-xs text-muted-foreground">
                Stock: {product.stock > 0 ? product.stock : "Out of stock"}
              </p>
            </div>
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 border-t border-border bg-secondary/50 p-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent"
          onClick={() => onEdit(product)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
