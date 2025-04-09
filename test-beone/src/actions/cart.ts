"use server";

import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

// Server actions calling authenticated API endpoints
export async function getUserCart() {
  try {
    // Get the auth cookie to pass along to the API
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authorization")?.value;

    console.log("Auth token exists:", !!authToken);

    if (!authToken) {
      return {
        success: false,
        message: "Authentication required",
        authError: true,
      };
    }

    // Pass the token directly, middleware knows how to handle it
    const response = await fetch(`${baseUrl}/api/user/cart`, {
      headers: {
        Authorization: authToken,
      },
      cache: "no-store",
    });

    // Log response status for debugging
    console.log("Cart API response status:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error("Cart API error:", data.message);
      return {
        success: false,
        message: data.message || "Failed to get cart",
      };
    }

    return {
      success: true,
      cart: data.cart,
    };
  } catch (error) {
    console.error("Get cart error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get cart",
    };
  }
}

// Add item to cart
export async function addItemToCart(productId: string) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authorization")?.value;

    if (!authToken) {
      return {
        success: false,
        message: "Authentication required",
        authError: true,
      };
    }

    const response = await fetch(`${baseUrl}/api/user/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to add item to cart",
      };
    }

    return {
      success: true,
      message: data.message,
      cart: data.cart,
    };
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to add item to cart",
    };
  }
}

// Update cart item quantity
export async function updateCartItem(productId: string, quantity: number) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authorization")?.value;

    if (!authToken) {
      return {
        success: false,
        message: "Authentication required",
        authError: true,
      };
    }

    const response = await fetch(`${baseUrl}/api/user/cart/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ quantity }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to update cart item",
      };
    }

    return {
      success: true,
      message: data.message,
      cart: data.cart,
    };
  } catch (error) {
    console.error("Update cart item error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update cart item",
    };
  }
}

// Remove item from cart
export async function removeCartItem(productId: string) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authorization")?.value;

    if (!authToken) {
      return {
        success: false,
        message: "Authentication required",
        authError: true,
      };
    }

    const response = await fetch(`${baseUrl}/api/user/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to remove item from cart",
      };
    }

    return {
      success: true,
      message: data.message,
      cart: data.cart,
    };
  } catch (error) {
    console.error("Remove cart item error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to remove item from cart",
    };
  }
}

// Clear cart
export async function clearCart() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authorization")?.value;

    if (!authToken) {
      return {
        success: false,
        message: "Authentication required",
        authError: true,
      };
    }

    const response = await fetch(`${baseUrl}/api/user/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to clear cart",
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Clear cart error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}
