import { TTransaction } from "@/types";
import { connect, database } from "../configs/mongoDB";
import { z } from "zod";
import { ObjectId } from "mongodb";

const transactionSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().transform((id) => new ObjectId(id)),
  cartId: z.string().transform((id) => new ObjectId(id)),
  loyaltyPointEarned: z.number().min(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isDeleted: z.boolean().optional(),
});
export default class TransactionModel {
  static async collection() {
    connect();
    const { db } = database();

    const collection = db.collection<TTransaction>("transactions");
    return collection;
  }

  static async createTransaction(transactionData: TTransaction) {
    try {
      const collection = await this.collection();
      const verifiedTransaction = transactionSchema.parse(transactionData);
      const newTransaction = {
        ...verifiedTransaction,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const result = await collection.insertOne(newTransaction);
      return result;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }

  static async getTransactionsByUserId(userId: string) {
    try {
      const collection = await this.collection();
      const userObjectId = new ObjectId(userId);

      const transactions = await collection
        .find({
          userId: userObjectId,
          isDeleted: { $ne: true },
        })
        .sort({ createdAt: -1 })
        .toArray();

      return transactions;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      throw new Error("Failed to fetch user transactions");
    }
  }

  static async getTransactionById(transactionId: string) {
    try {
      const collection = await this.collection();
      const transactionObjectId = new ObjectId(transactionId);

      const transaction = await collection.findOne({
        _id: transactionObjectId,
        isDeleted: { $ne: true },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw new Error("Failed to fetch transaction");
    }
  }
}
