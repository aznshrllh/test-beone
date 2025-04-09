import { NextRequest } from "next/server";
import CartModel from "@/db/models/cartModel";
import ProductModel from "@/db/models/productModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    // Mendapatkan cart user
    const cart = await CartModel.getUserCart(userId);

    // Mencari item dalam cart berdasarkan product ID
    const cartItem = cart.items.find((item) => item.productId === productId);

    if (!cartItem) {
      throw { message: "Item not found in cart", status: 404 };
    }

    return Response.json(
      {
        success: true,
        item: cartItem,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      throw { message: "Quantity is required", status: 400 };
    }

    // Cek produk dan validasi stock
    console.log("productId", productId);
    const product = await ProductModel.getProductById(productId);
    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    // Cek apakah quantity yang diminta melebihi stock
    if (Number(quantity) > product.stock) {
      throw {
        message: `Cannot update quantity. Maximum available: ${product.stock}`,
        status: 400,
      };
    }

    // Update jumlah item
    const updatedCart = await CartModel.updateCartItemQuantity(
      userId,
      productId,
      Number(quantity)
    );

    return Response.json(
      {
        success: true,
        message: "Cart item updated successfully",
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    // Hapus item dari cart
    const updatedCart = await CartModel.removeItemFromCart(userId, productId);

    return Response.json(
      {
        success: true,
        message: "Item removed from cart successfully",
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const body = await request.json();
    const { quantity = 1 } = body;

    if (isNaN(Number(quantity)) || Number(quantity) < 1) {
      throw { message: "Quantity must be a positive number", status: 400 };
    }

    // Cek produk
    const product = await ProductModel.getProductById(productId);
    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    // Cek stok
    if (product.stock < quantity) {
      throw {
        message: "Requested quantity exceeds available stock",
        status: 400,
      };
    }

    // Dapatkan cart user
    const cart = await CartModel.getUserCart(userId);

    // Cek apakah produk sudah ada di cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    let updatedCart;

    if (existingItem) {
      // Update item yang sudah ada
      updatedCart = await CartModel.updateCartItemQuantity(
        userId,
        productId,
        Number(quantity)
      );
    } else {
      // Tambahkan item baru dengan quantity tertentu
      // Karena addItemToCart hanya menambah 1, kita perlu menambahkan dahulu lalu mengupdate
      await CartModel.addItemToCart(userId, product);
      updatedCart = await CartModel.updateCartItemQuantity(
        userId,
        productId,
        Number(quantity)
      );
    }

    return Response.json(
      {
        success: true,
        message: existingItem
          ? "Cart item updated successfully"
          : "Item added to cart successfully",
        cart: updatedCart,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
