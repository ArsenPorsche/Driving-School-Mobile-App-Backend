const ProductService = require("../services/productService");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, message } = require("../utils/responseHelper");

class ProductController {
  static getProducts = asyncHandler(async (_req, res) => {
    const products = await ProductService.getActiveProducts();
    success(res, products);
  });

  static getAllProducts = asyncHandler(async (_req, res) => {
    const products = await ProductService.getAllProducts();
    success(res, products);
  });

  static getProductByCode = asyncHandler(async (req, res) => {
    const product = await ProductService.getProductByCode(req.params.code);
    success(res, product);
  });

  static createOrder = asyncHandler(async (req, res) => {
    const { order, addLessons, addExams, user } = await ProductService.createOrder(
      req.user._id,
      req.body.items
    );

    success(res, {
      message: "Order created successfully",
      orderId: order._id,
      totalPLN: order.totalMinor / 100,
      addedLessons: addLessons,
      addedExams: addExams,
      purchasedLessons: user.purchasedLessons,
      purchasedExams: user.purchasedExams,
    });
  });

  static getUserOrders = asyncHandler(async (req, res) => {
    const orders = await ProductService.getUserOrders(req.user._id);
    success(res, { orders });
  });

  static getOrderById = asyncHandler(async (req, res) => {
    const order = await ProductService.getOrderById(req.params.orderId, req.user._id);
    success(res, order);
  });

  static getUserBalance = asyncHandler(async (req, res) => {
    const balance = await ProductService.getUserBalance(req.user._id);
    success(res, balance);
  });

  static createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, entitlements } = req.body;

    const productData = {
      code: `${category}_${Date.now()}`,
      title: name,
      description,
      priceMinor: Math.round(price * 100),
      category,
      entitlements: entitlements.filter((e) => e.count > 0),
      active: true,
    };

    const product = await ProductService.createProduct(productData);
    created(res, product);
  });

  static updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, entitlements } = req.body;

    const updates = {
      title: name,
      description,
      priceMinor: Math.round(price * 100),
      category,
      entitlements: entitlements.filter((e) => e.count > 0),
    };

    const product = await ProductService.updateProduct(req.params.productId, updates);
    success(res, product);
  });

  static deleteProduct = asyncHandler(async (req, res) => {
    await ProductService.deleteProduct(req.params.productId);
    message(res, "Product deactivated successfully");
  });

  static activateProduct = asyncHandler(async (req, res) => {
    await ProductService.restoreProduct(req.params.productId);
    message(res, "Product activated successfully");
  });
}

module.exports = ProductController;