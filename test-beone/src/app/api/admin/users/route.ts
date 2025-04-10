import UserModel from "@/db/models/userModel";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

export async function GET(request: Request) {
  try {
    // Fetch all users from the database
    const userId = request.headers.get("x-user-id") as string;
    const user = await UserModel.getUserById(userId);
    if (!user) {
      throw { message: "User not found", status: 404 };
    }
    if (user.role !== "admin") {
      throw { message: "Unauthorized", status: 403 };
    }

    const users = await UserModel.getAllUsers();

    return Response.json(
      {
        message: "Users retrieved successfully",
        users,
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
