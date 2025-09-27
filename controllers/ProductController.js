const Product = require("../models/Product");
const Order = require("../models/Order");
const { User } = require("../models/User");

class ProductController {
  static async getProducts(req, res) {
    try {
      const products = await Product.find({ active: true })
        .select("-__v")
        .sort({ category: 1, priceMinor: 1 });
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProductByCode(req, res) {
    try {
      const { code } = req.params;
      const product = await Product.findOne({ code, active: true });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  
  static async createOrder(req, res) {
    try {
      const userId = req.user?._id;
      const { items } = req.body; // [{ productCode, quantity }]

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items must be non-empty array" });
      }

      
      const productCodes = items.map(item => item.productCode);
      const products = await Product.find({
        code: { $in: productCodes },
        active: true
      }).lean();

      if (products.length !== productCodes.length) {
        return res.status(400).json({ error: "Some products not found or inactive" });
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
          return res.status(400).json({ error: "Quantity must be at least 1" });
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
          totalLineMinor,
          entitlements: product.entitlements
        });
      }

      
      const order = await Order.create({
        user: userId,
        items: orderItems,
        totalMinor,
        status: "paid", 
        paymentMethod: "app",
      });

      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            purchasedLessons: addLessons,
            purchasedExams: addExams
          }
        },
        { new: true }
      ).select("purchasedLessons purchasedExams");

      res.json({
        message: "Order created successfully",
        orderId: order._id,
        totalPLN: totalMinor / 100,
        addedLessons: addLessons,
        addedExams: addExams,
        purchasedLessons: updatedUser.purchasedLessons,
        purchasedExams: updatedUser.purchasedExams
      });

    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  
  static async getUserOrders(req, res) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({ user: userId })
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Order.countDocuments({ user: userId });

      res.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
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

      const order = await Order.findOne({
        _id: orderId,
        user: userId
      }).lean();

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserBalance(req, res) {
    try {
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId)
        .select("purchasedLessons purchasedExams");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        purchasedLessons: user.purchasedLessons,
        purchasedExams: user.purchasedExams
      });

    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

module.exports = ProductController;