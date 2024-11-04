# Node Interview Task

## Description
This project is an Express server that processes tasks with rate limiting using Redis.

## Requirements
- Node.js
- Redis

## Setup
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Set up your Redis server and update `config.js` with the correct URL.
4. Run the application with `node index.js`.

## Testing
Use Postman to send a POST request to `http://localhost:3001/task` with the following body:
```json
{
    "user_id": "Harshad khatale task"
}
