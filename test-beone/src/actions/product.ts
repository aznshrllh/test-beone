"use server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

// Get all products
export async function getAllProducts() {
  try {
    const response = await fetch(`${baseUrl}/api/public/products`, {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to get products",
        products: [],
      };
    }

    return {
      success: true,
      products: data.products || [],
    };
  } catch (error) {
    console.error("Get products error:", error);
    return {
      success: false,
      message: "Failed to get products",
      products: [],
    };
  }
}

// Get product by ID
export async function getProductById(id: string) {
  try {
    const response = await fetch(`${baseUrl}/api/public/product/${id}`, {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to get product",
      };
    }

    return {
      success: true,
      product: data.product,
    };
  } catch (error) {
    console.error("Get product error:", error);
    return {
      success: false,
      message: "Failed to get product",
    };
  }
}
