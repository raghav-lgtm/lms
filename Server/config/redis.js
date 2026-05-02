const { Redis } = require("@upstash/redis");

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://robust-mite-112929.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAAbkhAAIgcDJmNjFjNWQzMjE4NWM0YzA3YThlZGI2MWIzZGJjYmRjMQ",
});

// Upstash Redis (REST) doesn't use a persistent connection, 
// so we don't need .connect() or event listeners.

module.exports = redisClient;

