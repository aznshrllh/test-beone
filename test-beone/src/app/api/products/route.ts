import ProductModel from "@/db/models/productModel";
import UserModel from "@/db/models/userModel";
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

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Missing user ID", status: 400 };
    }

    const user = await UserModel.getUserById(userId);

    if (user.role !== "admin") {
      throw { message: "Unauthorized", status: 403 };
    }

    const body = await request.json();
    const { name, price, description, stock } = body;

    if (!name || !price || !description || !stock) {
      throw { message: "Missing required fields", status: 400 };
    }

    const existingProduct = await ProductModel.findProductByName(name);
    if (existingProduct) {
      throw { message: "Product already exists", status: 409 };
    }

    const newName = name
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const image = `https://image.pollinations.ai/prompt/${newName}?width=768&height=768&nologo=true`;

    const newProduct = {
      name,
      price,
      description,
      stock,
      image,
    };
    const result = await ProductModel.createProduct(newProduct);

    if (!result) {
      throw { message: "Failed to create product", status: 500 };
    }

    return Response.json(
      {
        message: "Product created successfully",
        product: result,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
