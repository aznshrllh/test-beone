"use server";

import { TUser, TUserLogin } from "@/types";
import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function HandleLogin(form: TUserLogin) {
  try {
    const { email, password } = form;
    const response = await fetch(`${baseUrl}/api/bridge/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Authentication failed",
      };
    }

    const cookieStore = await cookies();

    cookieStore.set("authorization", `Bearer ${data.access_token}`);

    return {
      success: true,
      access_token: data.access_token,
    };
  } catch (error) {
    console.error("Login error", error);
    return {
      success: false,
      message: "Authentication failed",
    };
  }
}

export async function HandleRegister(form: TUser) {
  try {
    const response = await fetch(`${baseUrl}/api/bridge/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed",
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error("Register error", error);
    return {
      success: false,
      message: "Registration failed",
    };
  }
}

export async function HandleLogout() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("authorization");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error", error);
    return {
      success: false,
    };
  }
}
