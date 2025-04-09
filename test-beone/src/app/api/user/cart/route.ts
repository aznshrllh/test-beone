import { NextRequest } from "next/server";
import CartModel from "@/db/models/cartModel";
import ProductModel from "@/db/models/productModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "User ID is required", status: 401 };
    }

    const cart = await CartModel.getUserCart(userId);

    return Response.json({ cart }, { status: 200 });
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "User ID is required", status: 401 };
    }

    const body = await request.json();
    const { productId } = body as { productId: string };

    if (!productId) {
      throw { message: "Product ID is required", status: 400 };
    }

    // Get product details
    const product = await ProductModel.getProductById(productId);

    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    // Check if product has any stock
    if (product.stock < 1) {
      throw { message: "Product is out of stock", status: 400 };
    }

    const cart = await CartModel.getUserCart(userId);

    if (!cart) {
      throw { message: "Cart not found", status: 404 };
    }

    // Check stock product compared to cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // Check if adding one more would exceed stock
      if (existingItem.quantity + 1 > product.stock) {
        throw {
          message: `Cannot add more of this item. Maximum available: ${product.stock}`,
          status: 400,
        };
      }

      // Update quantity if product already exists in cart
      await CartModel.setCartItemQuantity(
        userId,
        productId,
        existingItem.quantity + 1
      );
    } else {
      // Add new item to cart (with quantity 1)
      await CartModel.addItemToCart(userId, product);
    }

    // Get updated cart after changes
    const updatedCart = await CartModel.getUserCart(userId);

    return Response.json(
      {
        message: "Item added to cart successfully",
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "User ID is required", status: 401 };
    }

    await CartModel.clearCart(userId);

    return Response.json(
      {
        message: "Cart cleared successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
