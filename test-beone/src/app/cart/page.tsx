"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartItem {
  productId: string; // Changed from _id to productId
  name: string;
  price: number;
  image: string;
  quantity: number;
  subtotal?: number; // Added as it comes from API
  stock?: number; // Made optional as it may not come from API
}

export default function CartPage() {
  const [cart, setCart] = useState<{
    _id?: string; // This should match the API response
    userId?: string;
    items: CartItem[];
    totalItems?: number; // Made optional as it may need to be calculated
    totalPrice: number;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [authError, setAuthError] = useState(false);
  const router = useRouter();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setAuthError(false);

    try {
      console.log("Fetching cart data...");
      const response = await fetch("/api/user/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
      });

      console.log("Cart response status:", response.status);

      if (response.status === 401) {
        console.log("Auth error detected");
        setAuthError(true);
        toast.error("Authentication required", {
          description: "Please login to view your cart",
          action: {
            label: "Login",
            onClick: () =>
              router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`),
          },
        });
        setCart(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cart data:", data);

      if (data.cart) {
        // Calculate totalItems if it's not provided from API
        const cartData = {
          ...data.cart,
          totalItems:
            data.cart.totalItems ||
            data.cart.items.reduce(
              (total: number, item: CartItem) => total + item.quantity,
              0
            ),
        };
        setCart(cartData);
      } else {
        console.log("No cart data found in response");
        setCart({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Error loading cart", {
        description: "Failed to load cart data",
      });
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    setProcessing((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch(`/api/user/cart/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });

      if (response.status === 401) {
        setAuthError(true);
        toast.error("Authentication required", {
          description: "Please login to update your cart",
          action: {
            label: "Login",
            onClick: () =>
              router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`),
          },
        });
        return;
      }

      const data = await response.json();

      if (response.ok && data.cart) {
        // Calculate totalItems if it's not provided from API
        const cartData = {
          ...data.cart,
          totalItems:
            data.cart.totalItems ||
            data.cart.items.reduce(
              (total: number, item: CartItem) => total + item.quantity,
              0
            ),
        };
        setCart(cartData);
        toast.success("Cart updated", {
          description: "Quantity has been updated",
        });
      } else {
        toast.error("Update failed", {
          description: data.message || "Failed to update quantity",
        });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Update failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setProcessing((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setProcessing((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch(`/api/user/cart/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        setAuthError(true);
        toast.error("Authentication required", {
          description: "Please login to remove items from your cart",
          action: {
            label: "Login",
            onClick: () =>
              router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`),
          },
        });
        return;
      }

      const data = await response.json();

      if (response.ok && data.cart) {
        // Calculate totalItems if it's not provided from API
        const cartData = {
          ...data.cart,
          totalItems:
            data.cart.totalItems ||
            data.cart.items.reduce(
              (total: number, item: CartItem) => total + item.quantity,
              0
            ),
        };
        setCart(cartData);
        toast.success("Item removed", {
          description: "The item has been removed from your cart",
        });
      } else {
        toast.error("Error", {
          description: data.message || "Failed to remove item",
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setProcessing((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    setProcessing((prev) => ({ ...prev, clearAll: true }));

    try {
      const response = await fetch("/api/user/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.status === 401) {
        setAuthError(true);
        toast.error("Authentication required", {
          description: "Please login to clear your cart",
          action: {
            label: "Login",
            onClick: () =>
              router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`),
          },
        });
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setCart({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
        toast.success("Cart cleared", {
          description: "All items have been removed from your cart",
        });
      } else {
        toast.error("Error", {
          description: data.message || "Failed to clear cart",
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setProcessing((prev) => ({ ...prev, clearAll: false }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  if (authError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-6">
                Please log in to view your cart
              </p>
              <Button
                onClick={() =>
                  router.push(`/login?returnUrl=${encodeURIComponent("/cart")}`)
                }
              >
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCartEmpty = !cart || cart.items.length === 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/products")}>
            Continue Shopping
          </Button>

          {!isCartEmpty && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondaryDestructive"
                  disabled={processing.clearAll}
                >
                  {processing.clearAll ? "Clearing..." : "Clear Cart"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will remove all items
                    from your cart.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCart}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              ))}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isCartEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added any items to your cart yet.
              </p>
              <Button onClick={() => router.push("/products")}>
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cart?.totalItems || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart?.items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-md">
                              <Image
                                src={item.image || "/placeholder-product.jpg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="line-clamp-1 font-medium">
                              {item.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center items-center">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                disabled={
                                  processing[item.productId] ||
                                  item.quantity <= 1
                                }
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={item.stock || 100}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (
                                    !isNaN(val) &&
                                    val >= 1 &&
                                    val <= (item.stock || 100)
                                  ) {
                                    handleQuantityChange(item.productId, val);
                                  }
                                }}
                                className="h-8 w-14 rounded-none text-center"
                                disabled={processing[item.productId]}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    Math.min(
                                      item.stock || 100,
                                      item.quantity + 1
                                    )
                                  )
                                }
                                disabled={
                                  processing[item.productId] ||
                                  item.quantity >= (item.stock || 100)
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(
                            item.subtotal || item.price * item.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={processing[item.productId]}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart?.totalPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(cart?.totalPrice || 0)}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" size="lg">
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
