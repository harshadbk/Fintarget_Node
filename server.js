const express = require('express');
const { createClient } = require('redis');
const fs = require('fs');
const config = require('./config');

const app = express();
app.use(express.json());

const client = createClient({ url: config.REDIS_URL });

client.on('error', (err) => console.error('Redis Client Error:', err));

async function connectRedis() {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
}

app.post('/task', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).send('user_id is required');

    try {
        const userCountKey = `user:${user_id}:count`;
        const userQueueKey = `user:${user_id}:queue`;

        const userCount = await client.incr(userCountKey);
        if (userCount === 1) {
            await client.expire(userCountKey, 60);
        }

        if (userCount > config.RATE_LIMIT_MIN) {
            return res.status(429).send('Rate limit exceeded');
        }

        const taskQueueLength = await client.lPush(userQueueKey, Date.now().toString());
        if (taskQueueLength > config.RATE_LIMIT_SEC) {
            await client.brpoplpush(userQueueKey, userQueueKey, config.RATE_LIMIT_SEC);
        }

        processTask(user_id);
        res.status(200).send('Task queued');
    } catch (error) {
        console.error('Error processing task:', error);
        res.status(500).send('Internal server error');
    }
});

function processTask(user_id) {
    setTimeout(() => {
        const timestamp = new Date().toISOString();
        fs.appendFileSync('logfile.txt', `${user_id}-task completed at-${timestamp}\n`);
        console.log(`${user_id}-task completed at-${timestamp}`);
    }, 1000);
}

process.on('SIGINT', async () => {
    await client.quit();
    console.log('Redis client closed, server exiting...');
    process.exit(0);
});

connectRedis();

module.exports = app;
