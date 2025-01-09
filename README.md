# express-api-limiter

`express-api-limiter` is a simple, lightweight, and flexible rate-limiting middleware for Express.js applications. It allows you to define custom rate limits for individual API routes, ensuring that clients can only make a specified number of requests within a given time window. This helps to prevent API abuse and overloads while maintaining a smooth user experience.

## Features
- Custom rate-limiting for each route with flexible configurations.
- Set a time window (e.g., 1 minute, 1 hour) and maximum requests (e.g., 100 requests).
- Easy integration with Express.js.
- Memory-based rate-limiting solution with client IP address tracking.
- Provides customizable error responses when rate limits are exceeded.

## Installation

To install the package, run the following command in your project:

```bash
npm install express-api-limiter
```

## Usage

### 1. **Import the RateLimiter**

```typescript
import { RateLimiter } from 'express-api-limiter';
```

### 2. **Create an Instance of RateLimiter**

```typescript
const rateLimiter = new RateLimiter();
```

### 3. **Apply the Rate Limiter Middleware to a Route**

You can apply the rate limiter directly to a specific route using `rateLimiter.middleware` with custom rate limit parameters:

```typescript
import express from 'express';
import { RateLimiter } from 'express-api-limiter';

const app = express();
const rateLimiter = new RateLimiter();

// Example: Apply rate-limiting middleware directly to a specific route
app.get('/api/endpoint', rateLimiter.middleware({ windowMs: 1, maxCalls: 100 }), (req, res) => {
  res.send('This is a rate-limited API endpoint!');
});

// Example: Another route with different rate limit
app.get('/api/another-endpoint', rateLimiter.middleware({ windowMs: 5, maxCalls: 50 }), (req, res) => {
  res.send('This is another rate-limited API endpoint with a different limit.');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Parameters
- **`windowMs`**: The time window in minutes for the rate limit (e.g., `1` for 1 minute).
- **`maxCalls`**: The maximum number of requests allowed within the `windowMs` period.

### 4. **Handling Exceeding Rate Limit**
If a client exceeds the allowed rate limit, they will receive a response with status code `429` and a message like:

```json
{
  "message": "Too many requests. Please try again after 1 minute."
}
```

## License

This package is open-source and available under the [MIT License](LICENSE).

---