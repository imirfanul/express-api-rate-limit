import { Request, Response, NextFunction } from "express"
import { RateLimitOptions } from "./types"

/**
 * RateLimiter Class to handle rate-limiting logic
 */
export class RateLimiter {
	private requestCounts: Map<string, number[]> = new Map()

	/**
	 * Middleware function to limit API requests
	 * @param {RateLimitOptions} options - Rate limit parameters for this particular request
	 */
	public middleware = (options: RateLimitOptions) => {
		return (req: Request, res: Response, next: NextFunction) => {
			const currentTime = Date.now()
			// Ensure the client IP is always a string
			const clientIp = req.ip || "unknown" // Default to 'unknown' if req.ip is undefined

			if (!this.requestCounts.has(clientIp)) {
				this.requestCounts.set(clientIp, [])
			}

			// Get the list of timestamps for the client's requests
			const timestamps = this.requestCounts.get(clientIp)!

			// Remove timestamps older than the time window
			const validTimestamps = timestamps.filter(
				(timestamp) =>
					currentTime - timestamp < options.windowMs * 60 * 1000
			)

			if (validTimestamps.length >= options.maxCalls) {
				// If the number of requests exceeds the limit, respond with an error
				return res.status(429).json({
					message: `Too many requests. Please try again after ${options.windowMs} minute(s).`
				})
			}

			// Add the current timestamp
			validTimestamps.push(currentTime)
			this.requestCounts.set(clientIp, validTimestamps)

			// Proceed to the next middleware/handler
			next()
		}
	}
}
