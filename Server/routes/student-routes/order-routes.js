const express = require("express");
const {
  createOrder,
  capturePaymentAndFinalizeOrder,
} = require("../../controllers/student-controller/order-controller");

const router = express.Router();

// Create a new order and initiate payment (e.g. PayPal)
router.post("/create", createOrder);

// Capture payment after provider redirect and finalize enrollment
router.post("/capture", capturePaymentAndFinalizeOrder);

module.exports = router;
