const express = require("express");
const ProductController = require("../controllers/ProductController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ROLES } = require("../config/constants");
const {
  createOrderSchema,
  createProductSchema,
  updateProductSchema,
} = require("../validators/schemas");

const router = express.Router();

// Public
router.get("/", ProductController.getProducts);

// Student
router.get("/balance", authMiddleware(ROLES.STUDENT), ProductController.getUserBalance);
router.post("/orders", authMiddleware(ROLES.STUDENT), validate(createOrderSchema), ProductController.createOrder);
router.get("/orders/my", authMiddleware(ROLES.STUDENT), ProductController.getUserOrders);
router.get("/orders/:orderId", authMiddleware(ROLES.STUDENT), ProductController.getOrderById);

// Admin
router.get("/all", authMiddleware(ROLES.ADMIN), ProductController.getAllProducts);

router.get("/:code", ProductController.getProductByCode);
router.post("/", authMiddleware(ROLES.ADMIN), validate(createProductSchema), ProductController.createProduct);
router.put("/:productId", authMiddleware(ROLES.ADMIN), validate(updateProductSchema), ProductController.updateProduct);
router.delete("/:productId", authMiddleware(ROLES.ADMIN), ProductController.deleteProduct);
router.patch("/:productId/activate", authMiddleware(ROLES.ADMIN), ProductController.activateProduct);

module.exports = router;