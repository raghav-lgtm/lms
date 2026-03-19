const { getPaymentService } = require("../../helper/payment");
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

        const normalizedPaymentMethod = String(paymentMethod || "paypal").toLowerCase();
        const normalizedCoursePricing = Number(coursePricing);
        const normalizedOrderDate = orderDate ? new Date(orderDate) : new Date();

        if (!Number.isFinite(normalizedCoursePricing) || normalizedCoursePricing <= 0) {
            return res.status(400).json({
                success: false,
                message: "coursePricing must be a positive number",
            });
        }
        
        const paymentService = getPaymentService(normalizedPaymentMethod);

        const items = [{
            name: courseTitle,
            sku: courseId,
            price: normalizedCoursePricing.toFixed(2),
            currency: "USD",
            quantity: 1,
        }];

        const amount = { currency: "USD", total: normalizedCoursePricing.toFixed(2) };

        const redirectUrls = {
            return_url: `${process.env.CLIENT_URL}/payment-return`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
        };

        const paymentInfo = await paymentService.createPayment(
            items, amount, courseTitle, redirectUrls
        );

        const newlyCreatedCourseOrder = new Order({
            userId, userName, userEmail,
            orderStatus: orderStatus || "pending",
            paymentMethod: normalizedPaymentMethod,
            paymentStatus: paymentStatus || "pending",
            orderDate: normalizedOrderDate,
            paymentId, payerId, instructorId, instructorName,
            courseImage, courseTitle, courseId, coursePricing: normalizedCoursePricing,
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

        const paymentService = getPaymentService(String(order.paymentMethod || "paypal").toLowerCase());

        const paymentResult = await paymentService.capturePayment(paymentId, payerId);

        const paymentState =
            paymentResult?.state || paymentResult?.transactions?.[0]?.related_resources?.[0]?.sale?.state;

        if (paymentState !== "approved" && paymentState !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Payment not approved",
            });
        }

        // Match the reference controller status strings
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
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
                dateOfPurchase: order.orderDate,
                courseImage: order.courseImage,
            });
            await studentCourses.save();
        }

        // Match the reference controller: update Course.students via $addToSet
        await Course.findByIdAndUpdate(order.courseId, {
            $addToSet: {
                students: {
                    studentId: order.userId,
                    studentName: order.userName,
                    studentEmail: order.userEmail,
                    paidAmount: Number(order.coursePricing),
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Order confirmed",
            data: order,
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