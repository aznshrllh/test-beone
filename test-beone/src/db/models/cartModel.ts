import { TCart } from "@/types";
import { database, connect } from "@/db/configs/mongoDB";
import { z } from "zod";
import { ObjectId } from "mongodb";

const cartSchema = z.object({
  _id: z.string().optional(),
  userId: z.string().transform((id) => new ObjectId(id)),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string().min(1),
      price: z.number().min(0),
      quantity: z.number().min(1),
      image: z.string().optional(),
      subtotal: z.number().min(0),
    })
  ),
  totalPrice: z.number().min(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isDeleted: z.boolean().optional(),
});

export default class CartModel {
  static async collection() {
    connect();
    const { db } = database();

    const collection = db.collection<TCart>("carts");
    return collection;
  }

  static async createUserCart(userId: string) {
    try {
      const collection = await this.collection();
      const userObjectId = new ObjectId(userId);

      // Check if user already has a cart
      const existingCart = await collection.findOne({
        userId: userObjectId,
        isDeleted: { $ne: true },
      });

      if (existingCart) {
        return existingCart;
      }

      // Create new cart for user
      const newCart = {
        userId: userObjectId.toString(),
        items: [],
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      const validatedCart = cartSchema.parse(newCart);
      const result = await collection.insertOne(validatedCart);

      if (!result.acknowledged) {
        throw new Error("Failed to create cart");
      }

      return { _id: result.insertedId, ...newCart };
    } catch (error) {
      console.error("Error creating user cart:", error);
      throw new Error("Failed to create user cart");
    }
  }

  static async getUserCart(userId: string) {
    try {
      const collection = await this.collection();
      const userObjectId = new ObjectId(userId);

      let cart = await collection.findOne({
        userId: userObjectId,
        isDeleted: { $ne: true },
      });

      // If user doesn't have a cart, create one
      if (!cart) {
        cart = await this.createUserCart(userId);
      }

      return cart;
    } catch (error) {
      console.error("Error retrieving user's cart:", error);
      throw new Error("Failed to retrieve user's cart");
    }
  }

  static async addItemToCart(
    userId: string,
    product: {
      _id: { toString(): string };
      name: string;
      price: number;
      image?: string;
    }
  ) {
    try {
      // Get the user's cart or create one if it doesn't exist
      const cart = await this.getUserCart(userId);

      const collection = await this.collection();
      const cartObjectId = new ObjectId(cart._id);

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === product._id.toString()
      );

      if (existingItemIndex > -1) {
        // Update quantity and subtotal of existing item
        const quantity = cart.items[existingItemIndex].quantity + 1;
        const subtotal = product.price * quantity;

        const result = await collection.updateOne(
          {
            _id: cartObjectId,
            "items.productId": product._id.toString(),
          },
          {
            $set: {
              "items.$.quantity": quantity,
              "items.$.subtotal": subtotal,
              updatedAt: new Date(),
            },
            $inc: { totalPrice: product.price },
          }
        );

        if (result.modifiedCount === 0) {
          throw new Error("Failed to update item in cart");
        }
      } else {
        // Add new item to cart
        const newItem = {
          productId: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          subtotal: product.price,
        };

        const result = await collection.updateOne(
          { _id: cartObjectId },
          {
            $push: { items: newItem },
            $inc: { totalPrice: product.price },
            $set: { updatedAt: new Date() },
          }
        );

        if (result.modifiedCount === 0) {
          throw new Error("Failed to add item to cart");
        }
      }

      // Return the updated cart
      return await this.getUserCart(userId);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw new Error("Failed to add item to cart");
    }
  }

  static async updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ) {
    try {
      if (quantity < 1) {
        throw new Error("Quantity cannot be less than 1");
      }

      const cart = await this.getUserCart(userId);
      const collection = await this.collection();
      const cartObjectId = new ObjectId(cart._id);

      const item = cart.items.find((item) => item.productId === productId);

      if (!item) {
        throw new Error("Item not found in cart");
      }

      // Calculate price difference for the total
      const priceDifference = quantity * item.price - item.subtotal;

      const result = await collection.updateOne(
        {
          _id: cartObjectId,
          "items.productId": productId,
        },
        {
          $set: {
            "items.$.quantity": quantity,
            "items.$.subtotal": item.price * quantity,
            updatedAt: new Date(),
          },
          $inc: { totalPrice: priceDifference },
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Failed to update item quantity");
      }

      return await this.getUserCart(userId);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      throw new Error("Failed to update item quantity");
    }
  }

  static async removeItemFromCart(userId: string, productId: string) {
    try {
      const cart = await this.getUserCart(userId);
      const collection = await this.collection();
      const cartObjectId = new ObjectId(cart._id);

      const item = cart.items.find((item) => item.productId === productId);

      if (!item) {
        throw new Error("Item not found in cart");
      }

      const result = await collection.updateOne(
        { _id: cartObjectId },
        {
          $pull: { items: { productId: productId } },
          $inc: { totalPrice: -item.subtotal },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Failed to remove item from cart");
      }

      return await this.getUserCart(userId);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw new Error("Failed to remove item from cart");
    }
  }

  static async clearCart(userId: string) {
    try {
      const cart = await this.getUserCart(userId);
      const collection = await this.collection();
      const cartObjectId = new ObjectId(cart._id);

      const result = await collection.updateOne(
        { _id: cartObjectId },
        {
          $set: {
            items: [],
            totalPrice: 0,
            updatedAt: new Date(),
          },
        }
      );

      if (result.modifiedCount === 0) {
        throw new Error("Failed to clear cart");
      }

      return await this.getUserCart(userId);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new Error("Failed to clear cart");
    }
  }

  static async setCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ) {
    try {
      if (quantity < 1) {
        throw new Error("Quantity cannot be less than 1");
      }

      // Get user cart
      const cart = await this.getUserCart(userId);

      // Check if product exists in cart
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );

      // If product not in cart, get product details and add to cart
      if (!existingItem) {
        // Get product details
        const { db } = database();
        const productsCollection = db.collection("products");
        const product = await productsCollection.findOne({
          _id: new ObjectId(productId),
        });

        if (!product) {
          throw new Error("Product not found");
        }

        const formattedProduct = {
          _id: product._id,
          name: product.name as string,
          price: product.price as number,
          image: product.image as string,
        };

        await this.addItemToCart(userId, formattedProduct);

        // Now update the quantity if needed
        if (quantity > 1) {
          return this.updateCartItemQuantity(userId, productId, quantity);
        }

        return this.getUserCart(userId);
      } else {
        // Update existing item quantity
        return this.updateCartItemQuantity(userId, productId, quantity);
      }
    } catch (error) {
      console.error("Error setting cart item quantity:", error);
      throw new Error("Failed to set item quantity in cart");
    }
  }
}
