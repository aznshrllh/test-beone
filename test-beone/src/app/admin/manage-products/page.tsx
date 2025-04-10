"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  MoreHorizontal,
  PencilIcon,
  PlusIcon,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Image from "next/image";

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        headers: {
          "x-user-id": localStorage.getItem("userId") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-id": localStorage.getItem("userId") || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      const data = await response.json();
      toast.success(data.message);

      // Update products list
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleRestock = async (id: string, amount: number) => {
    try {
      setIsProcessing(true);

      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("userId") || "",
        },
        body: JSON.stringify({ stock: amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to restock product");
      }

      const data = await response.json();
      toast.success(data.message);

      // Update products list with new stock
      setProducts(
        products.map((product) =>
          product._id === id
            ? {
                ...product,
                stock: product.stock + amount,
                updatedAt: new Date().toISOString(),
              }
            : product
        )
      );
    } catch (error) {
      console.error("Error restocking product:", error);
      toast.error("Failed to restock product");
    } finally {
      setIsProcessing(false);
      setIsRestockDialogOpen(false);
      setRestockAmount(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Manage Products</CardTitle>
            <CardDescription>
              View and manage your product inventory
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/admin/manage-products/add")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No products found</p>
              <Button onClick={() => router.push("/admin/manage-products/add")}>
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[240px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.stock < 10
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(product.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/admin/manage-products/edit/${product._id}`
                                )
                              }
                            >
                              <PencilIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsRestockDialogOpen(true);
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Restock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{selectedProduct?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedProduct && handleDelete(selectedProduct._id)
              }
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Product</DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to current stock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product</Label>
              <div id="product-name" className="font-medium">
                {selectedProduct?.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-stock">Current Stock</Label>
              <div id="current-stock">{selectedProduct?.stock} units</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restock-amount">Restock Amount</Label>
              <Input
                id="restock-amount"
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestockDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedProduct &&
                handleRestock(selectedProduct._id, restockAmount)
              }
              disabled={isProcessing || restockAmount <= 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Restock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
