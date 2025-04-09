import { ObjectId } from "mongodb";
import { ZodError } from "zod";

//! Error Handling
export type CustomError = {
  message: string;
  status: number;
};

export type AppError = CustomError | Error | ZodError;

export type TProduct = {
  _id?: ObjectId | string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

export type TUser = {
  _id?: ObjectId | string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  loyaltyPoint?: number;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

export type TTransaction = {
  _id?: ObjectId | string;
  userId?: ObjectId | string;
  cartId?: ObjectId | string;
  loyaltyPointEarned: number;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

export type TCartItem = {
  productId: string | ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
};

export type TCart = {
  _id?: ObjectId | string;
  userId?: ObjectId | string;
  items: TCartItem[];
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

export type TUserLogin = {
  email: string;
  password: string;
};
