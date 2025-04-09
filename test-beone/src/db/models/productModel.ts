import { TProduct } from "@/types";
import { connect, database } from "../configs/mongoDB";
import { ObjectId } from "mongodb";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  description: z.string().optional(),
  image: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isDeleted: z.boolean().optional(),
});

export default class ProductModel {
  static async collection() {
    connect();
    const { db } = database();

    const collection = db.collection<TProduct>("products");
    return collection;
  }

  static async createProduct(productData: TProduct) {
    try {
      const collection = await this.collection();

      const verifiedProduct = productSchema.parse(productData);

      const newProduct = {
        ...verifiedProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const result = await collection.insertOne(newProduct);
      return result;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  }

  static async getProductById(productId: string) {
    try {
      const collection = await this.collection();
      const productObjectId = new ObjectId(productId);
      const product = await collection.findOne({ _id: productObjectId });

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      console.error("Error retrieving product:", error);
      throw new Error("Failed to retrieve product");
    }
  }

  static async getAllProducts() {
    try {
      const collection = await this.collection();
      const products = await collection.find({}).toArray();

      if (!products) {
        throw new Error("No products found");
      }

      return products;
    } catch (error) {
      console.error("Error retrieving products:", error);
      throw new Error("Failed to retrieve products");
    }
  }

  static async updateProduct(
    productId: string,
    updatedData: Partial<TProduct>
  ) {
    const collection = await this.collection();
    const productObjectId = new ObjectId(productId);

    const result = await collection.updateOne(
      { _id: productObjectId },
      {
        $set: {
          ...updatedData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update product");
    }

    return result;
  }

  static async deleteProduct(productId: string) {
    try {
      const collection = await this.collection();

      const productObjectId = new ObjectId(productId);
      const result = await collection.updateOne(
        { _id: productObjectId },
        {
          $set: {
            isDeleted: true,
            updatedAt: new Date(),
          },
        }
      );
      if (result.modifiedCount === 0) {
        throw new Error("Failed to delete product");
      }
      return result;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }
  }

  static async restockProduct(productId: string, stock: number) {
    try {
      const collection = await this.collection();
      const productObjectId = new ObjectId(productId);

      const result = await collection.updateOne(
        { _id: productObjectId },
        {
          $set: {
            stock,
            updatedAt: new Date(),
          },
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Failed to restock product");
      }

      return result;
    } catch (error) {
      console.error("Error restocking product:", error);
      throw new Error("Failed to restock product");
    }
  }

  static async findProductByName(name: string) {
    try {
      const collection = await this.collection();

      const product = await collection.findOne({
        name,
      });

      return product;
    } catch (error) {
      console.error("Error finding product by name:", error);
      throw new Error("Failed to find product by name");
    }
  }
}
