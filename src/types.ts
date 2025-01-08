export interface RateLimitOptions {
	windowMs: number // Time window in minutes
	maxCalls: number // Max number of API calls within the time window
}
