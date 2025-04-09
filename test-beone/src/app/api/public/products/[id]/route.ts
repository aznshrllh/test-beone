import ProductModel from "@/db/models/productModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const productId = await params;

    const { id } = productId;

    // Get product details
    const product = await ProductModel.getProductById(id);

    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    return Response.json({ product }, { status: 200 });
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
