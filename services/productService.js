const Product = require("../models/Product");
const Order = require("../models/Order");
const { User } = require("../models/User");

class ProductService {
  static async getActiveProducts() {
    return await Product.find({ active: true })
      .select("-__v")
      .sort({ category: 1, priceMinor: 1 });
  }

  static async getAllProducts() {
    return await Product.find()
      .select("-__v")
      .sort({ category: 1, priceMinor: 1 });
  }

  static async getProductByCode(code) {
    const product = await Product.findOne({ code, active: true });
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  static async createOrder(userId, items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Items must be non-empty array");
    }

    const productCodes = items.map(item => item.productCode);
    const products = await Product.find({
      code: { $in: productCodes },
      active: true
    }).lean();

    if (products.length !== productCodes.length) {
      throw new Error("Some products not found or inactive");
    }

    const productsByCode = Object.fromEntries(
      products.map(p => [p.code, p])
    );

    let totalMinor = 0;
    let addLessons = 0;
    let addExams = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productsByCode[item.productCode];
      const quantity = Number(item.quantity) || 1;

      if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      const totalLineMinor = product.priceMinor * quantity;
      totalMinor += totalLineMinor;

      for (const ent of product.entitlements) {
        const totalCount = ent.count * quantity;
        if (ent.unit === "lesson") addLessons += totalCount;
        if (ent.unit === "exam") addExams += totalCount;
      }

      orderItems.push({
        productCode: product.code,
        title: product.title,
        category: product.category,
        quantity,
        priceMinor: product.priceMinor,
        totalLineMinor: totalLineMinor,
        entitlements: product.entitlements,
      });
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalMinor,
      status: "paid",
    });
    await order.save();

    // Update user balance immediately
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.purchasedLessons = (user.purchasedLessons || 0) + addLessons;
    user.purchasedExams = (user.purchasedExams || 0) + addExams;
    await user.save();

    return { order, addLessons, addExams, user };
  }

  static async getUserOrders(userId) {
    return await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getOrderById(orderId, userId) {
    const order = await Order.findOne({
      _id: orderId,
      user: userId
    }).lean();

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  static async getUserBalance(userId) {
    const user = await User.findById(userId)
      .select("purchasedLessons purchasedExams");
    
    if (!user) {
      throw new Error("User not found");
    }

    return {
      purchasedLessons: user.purchasedLessons,
      purchasedExams: user.purchasedExams
    };
  }

  static async createProduct(productData) {
    const existingProduct = await Product.findOne({ code: productData.code });
    if (existingProduct) {
      throw new Error("Product code already exists");
    }

    const product = new Product(productData);
    await product.save();
    return product;
  }

  static async updateProduct(productId, updates) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    Object.assign(product, updates);
    await product.save();
    return product;
  }

  static async deleteProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    product.active = false;
    await product.save();
    return product;
  }

  static async restoreProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    product.active = true;
    await product.save();
    return product;
  }
}

module.exports = ProductService;
