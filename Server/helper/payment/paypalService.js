const paypal = require("../paypal");

const createPayment = (items, amount, description, redirectUrls) => {
    return new Promise((resolve, reject) => {
        const create_payment_json = {
            intent: "sale",
            payer: { payment_method: "paypal" },
            redirect_urls: redirectUrls,
            transactions: [{ item_list: { items }, amount, description }],
        };

        paypal.payment.create(create_payment_json, (error, paymentInfo) => {
            if (error) reject(error);
            else resolve(paymentInfo);
        });
    });
};

const getApprovalUrl = (paymentInfo) =>
    paymentInfo.links.find((link) => link.rel === "approval_url").href;

const capturePayment = (paymentId, payerId) => {
    return new Promise((resolve, reject) => {
        const execute_payment_json = {
            payer_id: payerId,
        };

        paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
            if (error) return reject(error);
            resolve(payment);
        });
    });
};

module.exports = { createPayment, getApprovalUrl, capturePayment };