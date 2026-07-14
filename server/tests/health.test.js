const request = require("supertest");
const app = require("../src/app");

describe("Health API Endpoint", () => {
  it("should return 200 and success status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("CureLink API is running");
  });
});
