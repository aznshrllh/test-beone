import { NextRequest } from "next/server";
import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";

// Get user's profile info
export async function GET(request: NextRequest) {
  try {
    // The middleware already verified the token and added the user ID to headers
    const userId = request.headers.get("x-user-id") as string;
    const userEmail = request.headers.get("x-user-email");
    const userRole = request.headers.get("x-user-role");

    if (!userId) {
      throw { message: "Unauthorized", status: 401 };
    }

    // Return basic user information
    return Response.json(
      {
        success: true,
        user: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return errorHandler(error as AppError);
  }
}
