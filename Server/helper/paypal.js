const paypal = require("paypal-rest-sdk");

paypal.configure({
    mode: process.env.PAYPAL_MODE || "sandbox", // "sandbox" or "live" via env
    client_id: process.env.PAYPAL_CLIENT_ID,
    // Support both names to avoid misconfig issues
    client_secret: process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET_ID,
});

module.exports = paypal;
