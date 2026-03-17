const { getPaymentService } = require("../../helpers/payment");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const createOrder = async (req, res) => {
    try {
        const {
            userId, userName, userEmail, orderStatus,
            paymentMethod, paymentStatus, orderDate,
            paymentId, payerId, instructorId, instructorName,
            courseImage, courseTitle, courseId, coursePricing,
        } = req.body;

        // Dynamically pick service based on request — no hardcoding
        const paymentService = getPaymentService(paymentMethod);

        const items = [{
            name: courseTitle,
            sku: courseId,
            price: coursePricing,
            currency: "USD",
            quantity: 1,
        }];

        const amount = { currency: "USD", total: coursePricing.toFixed(2) };

        const redirectUrls = {
            return_url: `${process.env.CLIENT_URL}/payment-return`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        };

        const paymentInfo = await paymentService.createPayment(
            items, amount, courseTitle, redirectUrls
        );

        const newlyCreatedCourseOrder = new Order({
            userId, userName, userEmail, orderStatus,
            paymentMethod, paymentStatus, orderDate,
            paymentId, payerId, instructorId, instructorName,
            courseImage, courseTitle, courseId, coursePricing,
        });

        await newlyCreatedCourseOrder.save();

        const approveUrl = paymentService.getApprovalUrl(paymentInfo);

        res.status(201).json({
            success: true,
            data: { approveUrl, orderId: newlyCreatedCourseOrder._id },
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Some error occurred!" });
    }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
    try {
        const { orderId, paymentId, payerId } = req.body;

        if (!orderId || !paymentId || !payerId) {
            return res.status(400).json({
                success: false,
                message: "orderId, paymentId and payerId are required",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const paymentService = getPaymentService(order.paymentMethod || "paypal");

        const paymentResult = await paymentService.capturePayment(paymentId, payerId);

        const paymentState =
            paymentResult?.state || paymentResult?.transactions?.[0]?.related_resources?.[0]?.sale?.state;

        if (paymentState !== "approved" && paymentState !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Payment not approved",
            });
        }

        order.paymentStatus = "completed";
        order.orderStatus = "completed";
        order.paymentId = paymentId;
        order.payerId = payerId;
        await order.save();

        let studentCourses = await StudentCourses.findOne({ userId: order.userId });

        if (!studentCourses) {
            studentCourses = new StudentCourses({
                userId: order.userId,
                courses: [],
            });
        }

        const alreadyOwned = studentCourses.courses.some(
            (c) => c.courseId === order.courseId
        );

        if (!alreadyOwned) {
            studentCourses.courses.push({
                courseId: order.courseId,
                title: order.courseTitle,
                instructorId: order.instructorId,
                instructorName: order.instructorName,
                dateOfPurchase: new Date(),
                courseImage: order.courseImage,
            });
            await studentCourses.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment captured and order finalized successfully",
            data: {
                orderId: order._id,
                courseId: order.courseId,
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to capture payment",
        });
    }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder };