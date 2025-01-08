"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest")); // Using supertest here
const rateLimiter_1 = require("../rateLimiter"); // Adjust path if needed
describe("RateLimiter Middleware", () => {
    let rateLimiter;
    let app;
    beforeEach(() => {
        rateLimiter = new rateLimiter_1.RateLimiter();
        app = (0, express_1.default)();
        // Set up rate-limited route
        app.get("/api/test", rateLimiter.middleware({ windowMs: 1, maxCalls: 2 }), (req, res) => {
            res.send("This is a rate-limited API endpoint!");
        });
    });
    it("should allow 2 requests within 1 minute", () => __awaiter(void 0, void 0, void 0, function* () {
        // First request should succeed
        const response1 = yield (0, supertest_1.default)(app).get("/api/test");
        (0, chai_1.expect)(response1.status).to.equal(200);
        (0, chai_1.expect)(response1.text).to.equal("This is a rate-limited API endpoint!");
        // Second request should also succeed
        const response2 = yield (0, supertest_1.default)(app).get("/api/test");
        (0, chai_1.expect)(response2.status).to.equal(200);
        (0, chai_1.expect)(response2.text).to.equal("This is a rate-limited API endpoint!");
    }));
    it("should reject the 3rd request within 1 minute with 429 status", () => __awaiter(void 0, void 0, void 0, function* () {
        // First and second requests should succeed
        yield (0, supertest_1.default)(app).get("/api/test");
        yield (0, supertest_1.default)(app).get("/api/test");
        // Third request should be rejected due to rate limit
        const response = yield (0, supertest_1.default)(app).get("/api/test");
        (0, chai_1.expect)(response.status).to.equal(429); // Too many requests
        (0, chai_1.expect)(response.body.message).to.equal("Too many requests. Please try again after 1 minute.");
    }));
    it("should allow a request after 1 minute window", (done) => {
        // Simulate 2 requests within 1 minute
        (0, supertest_1.default)(app)
            .get("/api/test")
            .end(() => {
            (0, supertest_1.default)(app)
                .get("/api/test")
                .end(() => {
                // Wait for 1 minute (simulate time passing)
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    const response = yield (0, supertest_1.default)(app).get("/api/test");
                    (0, chai_1.expect)(response.status).to.equal(200);
                    (0, chai_1.expect)(response.text).to.equal("This is a rate-limited API endpoint!");
                    done(); // Mark test as done after the final assertion
                }), 60000); // Wait for 1 minute
            });
        });
    });
});
