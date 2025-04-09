import UserModel from "@/db/models/userModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";
import CartModel from "@/db/models/cartModel";
import TransactionModel from "@/db/models/transactionModel";
import ProductModel from "@/db/models/productModel";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw { message: "User not found", status: 404 };
    }

    // Get the user's cart
    const cart = await CartModel.getUserCart(userId);

    if (!cart || cart.items.length === 0) {
      throw { message: "Cart is empty", status: 400 };
    }

    // Check if all items have sufficient stock
    for (const item of cart.items) {
      const product = await ProductModel.getProductById(
        item.productId.toString()
      );

      if (product.stock < item.quantity) {
        throw {
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
          status: 400,
        };
      }
    }

    // Calculate loyalty points earned (total price / 1000)
    const loyaltyPointEarned = Math.floor(cart.totalPrice / 1000);

    // Create transaction
    const transaction = await TransactionModel.createTransaction({
      userId: userId,
      cartId: cart._id?.toString() as string,
      loyaltyPointEarned,
    });

    // Update user's loyalty points
    await UserModel.updateLoyaltyPoints(userId, loyaltyPointEarned);

    // Update product stock for each item in the cart
    const stockUpdatePromises = cart.items.map((item) =>
      ProductModel.updateProductStock(item.productId.toString(), item.quantity)
    );

    await Promise.all(stockUpdatePromises);

    // Clear the user's cart
    await CartModel.clearCart(userId);

    return Response.json(
      {
        success: true,
        message: "Transaction processed successfully",
        transactionDetails: {
          ...transaction,
          loyaltyPointEarned,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const transactions = await TransactionModel.getTransactionsByUserId(userId);

    return Response.json(
      {
        success: true,
        transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
