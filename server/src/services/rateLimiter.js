const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW) || 900000; // 15 mins
const max = parseInt(process.env.RATE_LIMIT_MAX) || 50;

const limiter = rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;
