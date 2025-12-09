const ProductService = require("../services/productService");

class ProductController {
  static async getProducts(req, res) {
    try {
      const products = await ProductService.getActiveProducts();
      res.json({ data: products });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.json({ data: products });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProductByCode(req, res) {
    try {
      const { code } = req.params;
      const product = await ProductService.getProductByCode(code);
      res.json(product);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async createOrder(req, res) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { items } = req.body;
      const { order, addLessons, addExams, user } = await ProductService.createOrder(userId, items);

      res.json({
        message: "Order created successfully",
        orderId: order._id,
        totalPLN: order.totalMinor / 100,
        addedLessons: addLessons,
        addedExams: addExams,
        purchasedLessons: user.purchasedLessons,
        purchasedExams: user.purchasedExams
      });
    } catch (error) {
      const statusCode = error.message.includes("must be") || 
                         error.message.includes("not found") ||
                         error.message.includes("Quantity") ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async getUserOrders(req, res) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const orders = await ProductService.getUserOrders(userId);

      res.json({
        orders
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


  static async getOrderById(req, res) {
    try {
      const userId = req.user?._id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const order = await ProductService.getOrderById(orderId, userId);
      res.json(order);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async getUserBalance(req, res) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const balance = await ProductService.getUserBalance(userId);
      res.json(balance);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const { name, description, price, category, entitlements } = req.body;

      if (!Array.isArray(entitlements) || entitlements.length === 0) {
        return res.status(400).json({ message: "Entitlements must be non-empty array" });
      }

      for (const ent of entitlements) {
        if (!['lesson','exam'].includes(ent.unit) || typeof ent.count !== 'number' || ent.count < 0) {
          return res.status(400).json({ message: "Invalid entitlement entry" });
        }
      }

      const productData = {
        code: `${category}_${Date.now()}`,
        title: name,
        description,
        priceMinor: Math.round(price * 100),
        category,
        entitlements: entitlements.filter(e => e.count > 0),
        active: true
      };

      const product = await ProductService.createProduct(productData);
      res.status(201).json({ data: product });
    } catch (error) {
      const statusCode = error.message.includes("already exists") ? 400 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const { name, description, price, category, entitlements } = req.body;

      if (!Array.isArray(entitlements) || entitlements.length === 0) {
        return res.status(400).json({ message: "Entitlements must be non-empty array" });
      }
      for (const ent of entitlements) {
        if (!['lesson','exam'].includes(ent.unit) || typeof ent.count !== 'number' || ent.count < 0) {
          return res.status(400).json({ message: "Invalid entitlement entry" });
        }
      }

      const updates = {
        title: name,
        description,
        priceMinor: Math.round(price * 100),
        category,
        entitlements: entitlements.filter(e => e.count > 0)
      };

      const product = await ProductService.updateProduct(productId, updates);
      res.json({ data: product });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      await ProductService.deleteProduct(productId);
      res.json({ message: "Product deactivated successfully" });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  static async activateProduct(req, res) {
    try {
      const { productId } = req.params;
      await ProductService.restoreProduct(productId);
      res.json({ message: "Product activated successfully" });
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }
}

module.exports = ProductController;