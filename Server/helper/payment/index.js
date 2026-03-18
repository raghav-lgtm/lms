const paypalService = require("./paypalService");
// const stripeService = require("./stripeService"); // plug in later

const services = {
    paypal: paypalService,
    // stripe: stripeService,
};

const getPaymentService = (method) => {
    const service = services[method];
    if (!service) throw new Error(`Unsupported payment method: ${method}`);
    return service;
};

module.exports = { getPaymentService };