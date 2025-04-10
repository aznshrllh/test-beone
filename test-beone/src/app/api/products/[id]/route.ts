import ProductModel from "@/db/models/productModel";
import UserModel from "@/db/models/userModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw { message: "User not found", status: 404 };
    }

    if (user.role !== "admin") {
      throw { message: "Unauthorized", status: 403 };
    }

    const { id } = await params;
    const product = await ProductModel.getProductById(id);

    if (!product) {
      throw { message: "Product not found", status: 404 };
    }

    return Response.json(
      {
        message: "Product retrieved successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw { message: "User not found", status: 404 };
    }

    if (user.role !== "admin") {
      throw { message: "Unauthorized", status: 403 };
    }

    const { id } = await params;
    const body = await req.json();

    const { name, price, description, stock } = body;
    if (!name || !price || !description || !stock) {
      throw { message: "Missing required fields", status: 400 };
    }

    const newName = name
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const image = `https://image.pollinations.ai/prompt/${newName}?width=768&height=768&nologo=true`;

    const updateProduct = {
      name,
      price,
      description,
      stock,
      image,
    };

    const updatedProduct = await ProductModel.updateProduct(id, updateProduct);

    if (!updatedProduct) {
      throw { message: "Product not found", status: 404 };
    }

    return Response.json(
      {
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw { message: "User not found", status: 404 };
    }

    if (user.role !== "admin") {
      throw { message: "Unauthorized", status: 403 };
    }

    const { id } = await params;

    const deletedProduct = await ProductModel.deleteProduct(id);

    if (!deletedProduct) {
      throw { message: "Product not found", status: 404 };
    }

    return Response.json(
      {
        message: "Product deleted successfully",
        product: deletedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id") as string;

    if (!userId) {
      throw { message: "Unauthorized: User ID not found", status: 401 };
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      throw { message: "User not found", status: 404 };
    }

    if (user.role !== "admin") {
      throw { message: "Unauthorized", status: 403 };
    }

    const { id } = await params;
    const body = await req.json();

    const { stock } = body;

    if (stock === undefined) {
      throw { message: "Stock is required", status: 400 };
    }

    if (isNaN(Number(stock))) {
      throw { message: "Stock must be a number", status: 400 };
    }

    if (Number(stock) < 0) {
      throw { message: "Stock cannot be negative", status: 400 };
    }

    if (Number(stock) % 1 !== 0) {
      throw { message: "Stock must be an integer", status: 400 };
    }

    const existingProduct = await ProductModel.getProductById(id);
    if (!existingProduct) {
      throw { message: "Product not found", status: 404 };
    }

    const existingStock = existingProduct.stock;

    const newStock = existingStock + Number(stock);

    if (newStock < 0) {
      throw { message: "Stock cannot be negative", status: 400 };
    }

    const updatedProduct = await ProductModel.restockProduct(
      id,
      Number(newStock)
    );

    if (!updatedProduct) {
      throw { message: "Product not found", status: 404 };
    }

    return Response.json(
      {
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
