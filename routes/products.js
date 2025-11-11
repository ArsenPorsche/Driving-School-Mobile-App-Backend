const express = require("express");
const ProductController = require("../controllers/ProductController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", ProductController.getProducts);
router.get("/all", authMiddleware("admin"), ProductController.getAllProducts);
router.get("/balance", authMiddleware("student"), ProductController.getUserBalance);
router.get("/:code", ProductController.getProductByCode);

router.post("/", authMiddleware("admin"), ProductController.createProduct);
router.put("/:productId", authMiddleware("admin"), ProductController.updateProduct);
router.delete("/:productId", authMiddleware("admin"), ProductController.deleteProduct);
router.patch("/:productId/activate", authMiddleware("admin"), ProductController.activateProduct);

router.post("/orders", authMiddleware("student"), ProductController.createOrder);
router.get("/orders/my", authMiddleware("student"), ProductController.getUserOrders);
router.get("/orders/:orderId", authMiddleware("student"), ProductController.getOrderById);

module.exports = router;