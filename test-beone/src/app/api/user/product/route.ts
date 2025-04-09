import ProductModel from "@/db/models/productModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET() {
  try {
    const products = await ProductModel.getAllProducts();

    if (!products) {
      throw new Error("Products not found");
    }

    return Response.json(
      {
        message: "Products retrieved successfully",
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
