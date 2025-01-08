import { expect } from "chai"
import express from "express"
import request from "supertest" // Using supertest here
import { RateLimiter } from "../rateLimiter" // Adjust path if needed

describe("RateLimiter Middleware", () => {
	let rateLimiter: RateLimiter
	let app: express.Application

	beforeEach(() => {
		rateLimiter = new RateLimiter()
		app = express()

		// Set up rate-limited route
		app.get(
			"/api/test",
			rateLimiter.middleware({ windowMs: 1, maxCalls: 2 }),
			(req, res) => {
				res.send("This is a rate-limited API endpoint!")
			}
		)
	})

	it("should allow 2 requests within 1 minute", async () => {
		// First request should succeed
		const response1 = await request(app).get("/api/test")
		expect(response1.status).to.equal(200)
		expect(response1.text).to.equal("This is a rate-limited API endpoint!")

		// Second request should also succeed
		const response2 = await request(app).get("/api/test")
		expect(response2.status).to.equal(200)
		expect(response2.text).to.equal("This is a rate-limited API endpoint!")
	})

	it("should reject the 3rd request within 1 minute with 429 status", async () => {
		// First and second requests should succeed
		await request(app).get("/api/test")
		await request(app).get("/api/test")

		// Third request should be rejected due to rate limit
		const response = await request(app).get("/api/test")
		expect(response.status).to.equal(429) // Too many requests
		expect(response.body.message).to.equal(
			"Too many requests. Please try again after 1 minute."
		)
	})

	it("should allow a request after 1 minute window", (done) => {
		// Simulate 2 requests within 1 minute
		request(app)
			.get("/api/test")
			.end(() => {
				request(app)
					.get("/api/test")
					.end(() => {
						// Wait for 1 minute (simulate time passing)
						setTimeout(async () => {
							const response = await request(app).get("/api/test")
							expect(response.status).to.equal(200)
							expect(response.text).to.equal(
								"This is a rate-limited API endpoint!"
							)
							done() // Mark test as done after the final assertion
						}, 60000) // Wait for 1 minute
					})
			})
	})
})
