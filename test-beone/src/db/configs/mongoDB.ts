import errorHandler from "@/helpers/errorHandler";
import { AppError } from "@/types";
import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGO_URI as string;

const dbName = "test-beone";

let db: Db;
let client: MongoClient;
let isConnected: boolean;

isConnected = false;

export function connect() {
  try {
    if (!client) {
      client = new MongoClient(uri);
      client.connect();
      db = client.db(dbName);
      isConnected = true;
      console.log("Connected to MongoDB");
    }
    return { db, client };
  } catch (error) {
    console.log(error, "<<<< error connection");
    return errorHandler(error as AppError);
  }
}

export function database() {
  if (!isConnected || !db) {
    throw new Error("Database not connected. Call connect() first");
  }
  return { db, client };
}
