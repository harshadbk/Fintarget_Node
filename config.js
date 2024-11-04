module.exports = {
    PORT: process.env.PORT || 3001,
    REDIS_URL: 'redis://localhost:6379',
    RATE_LIMIT_MIN: 5,
    RATE_LIMIT_SEC: 10
};
