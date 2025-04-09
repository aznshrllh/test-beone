"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Use the public API route for products
        const response = await fetch("/api/public/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products", {
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);

    try {
      // Use the protected cart API directly
      const response = await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Added to cart", {
          description: "Item successfully added to your cart",
        });
      } else {
        // Check if it's an authentication error
        if (response.status === 401) {
          toast.error("Authentication required", {
            description: "Please login to add items to your cart",
            action: {
              label: "Login",
              onClick: () =>
                router.push(
                  `/login?returnUrl=${encodeURIComponent(
                    window.location.pathname
                  )}`
                ),
            },
          });
        } else {
          toast.error("Failed to add item", {
            description: data.message || "Please try again",
          });
        }
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add item to cart. Please try again.",
      });
      console.error("Error adding item to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => router.push("/cart")}>View Cart</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="h-[400px]">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[180px] w-full mb-4" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product._id || product.id || `product-${Math.random()}`}
              className="flex flex-col h-full"
            >
              <CardHeader>
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={product.stock > 0 ? "default" : "destructive"}
                  >
                    {product.stock > 0
                      ? `Stock: ${product.stock}`
                      : "Out of Stock"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="relative h-[180px] w-full mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <p className="text-lg font-bold text-primary mb-2">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() =>
                    handleAddToCart(product._id || product.id || "")
                  }
                  disabled={
                    product.stock <= 0 ||
                    addingToCart === (product._id || product.id)
                  }
                >
                  {addingToCart === (product._id || product.id)
                    ? "Adding..."
                    : "Add to Cart"}
                </Button>
              </CardFooter>
            </Card>
          ))}

          {products.length === 0 && !loading && (
            <div className="col-span-full text-center py-8">
              <p className="text-xl">No products available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
