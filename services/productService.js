const Product = require("../models/Product");
const Order = require("../models/Order");
const { User } = require("../models/User");
const AppError = require("../utils/AppError");
const { LESSON_TYPE } = require("../config/constants");

class ProductService {
  static async getActiveProducts() {
    return Product.find({ active: true })
      .select("-__v")
      .sort({ category: 1, priceMinor: 1 });
  }

  static async getAllProducts() {
    return Product.find()
      .select("-__v")
      .sort({ category: 1, priceMinor: 1 });
  }

  static async getProductByCode(code) {
    const product = await Product.findOne({ code, active: true });
    if (!product) throw AppError.notFound("Product not found");
    return product;
  }

  static async createOrder(userId, items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest("Items must be non-empty array");
    }

    const productCodes = items.map((i) => i.productCode);
    const products = await Product.find({ code: { $in: productCodes }, active: true }).lean();

    if (products.length !== productCodes.length) {
      throw AppError.badRequest("Some products not found or inactive");
    }

    const productsByCode = new Map(products.map((p) => [p.code, p]));

    let totalMinor = 0;
    let addLessons = 0;
    let addExams = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productsByCode.get(item.productCode);
      const quantity = Number(item.quantity) || 1;
      if (quantity < 1) throw AppError.badRequest("Quantity must be at least 1");

      const totalLineMinor = product.priceMinor * quantity;
      totalMinor += totalLineMinor;

      for (const ent of product.entitlements) {
        const totalCount = ent.count * quantity;
        if (ent.unit === LESSON_TYPE.LESSON) addLessons += totalCount;
        if (ent.unit === LESSON_TYPE.EXAM) addExams += totalCount;
      }

      orderItems.push({
        productCode: product.code,
        title: product.title,
        category: product.category,
        quantity,
        priceMinor: product.priceMinor,
        totalLineMinor,
        entitlements: product.entitlements,
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalMinor,
      status: "paid",
    });

    const user = await User.findById(userId);
    if (!user) throw AppError.notFound("User not found");

    user.purchasedLessons = (user.purchasedLessons || 0) + addLessons;
    user.purchasedExams = (user.purchasedExams || 0) + addExams;
    await user.save();

    return { order, addLessons, addExams, user };
  }

  static async getUserOrders(userId) {
    return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  static async getOrderById(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) throw AppError.notFound("Order not found");
    return order;
  }

  static async getUserBalance(userId) {
    const user = await User.findById(userId).select("purchasedLessons purchasedExams");
    if (!user) throw AppError.notFound("User not found");
    return {
      purchasedLessons: user.purchasedLessons,
      purchasedExams: user.purchasedExams,
    };
  }

  static async createProduct(productData) {
    const exists = await Product.findOne({ code: productData.code });
    if (exists) throw AppError.conflict("Product code already exists");

    return Product.create(productData);
  }

  static async updateProduct(productId, updates) {
    const product = await Product.findById(productId);
    if (!product) throw AppError.notFound("Product not found");

    Object.assign(product, updates);
    await product.save();
    return product;
  }

  static async deleteProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) throw AppError.notFound("Product not found");

    product.active = false;
    await product.save();
    return product;
  }

  static async restoreProduct(productId) {
    const product = await Product.findById(productId);
    if (!product) throw AppError.notFound("Product not found");

    product.active = true;
    await product.save();
    return product;
  }
}

module.exports = ProductService;
