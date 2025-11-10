import request from "supertest";
import app from "../api/index.js";

let adminToken;
let createdNumberId;
let createdSellingNumberId;

describe("Auth -> Numbers -> Selling Numbers flow", () => {
    it("signs up an admin user", async () => {
        const res = await request(app).post("/auth/signup").send({
            email: "admin@example.com",
            password: "password123",
        });
        expect(res.status).toBe(200);
    });

    it("logs in admin", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "admin@example.com",
            password: "password123",
        });
        expect(res.status).toBe(200);
        adminToken = res.body.data.access_token;
    });

    it("admin creates a number", async () => {
        const res = await request(app)
            .post("/number")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                phoneNumber: "0100000.34.60",
                rating: 4,
                status: "available",
            });
        expect(res.status).toBe(200);
        createdNumberId = res.body.data._id;
    });

    it("get all numbers (public)", async () => {
        const res = await request(app).get("/number");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data.numbers)).toBe(true);
    });

    it("get one number by id (public)", async () => {
        const res = await request(app).get(`/number/${createdNumberId}`);
        expect(res.status).toBe(200);
        expect(res.body.data.phoneNumber).toBe("0100000.34.60");
    });

    it("admin updates a number", async () => {
        const res = await request(app)
            .put(`/number/${createdNumberId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                rating: 5,
                status: "sold",
            });
        expect(res.status).toBe(200);
        expect(res.body.data.rating).toBe(5);
        expect(res.body.data.status).toBe("sold");
    });

    it("anyone can create a selling number (no auth required)", async () => {
        const res = await request(app)
            .post("/selling-number")
            .send({
                name: "Test User",
                contactNumber: "01000000000",
                address: "Cairo, Egypt",
                numberToSell: "0100000.29.70",
                price: "5000",
                notes: "Test notes",
            });
        expect(res.status).toBe(200);
        createdSellingNumberId = res.body.data._id;
    });

    it("admin can get all selling numbers", async () => {
        const res = await request(app)
            .get("/selling-number")
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data.sellingNumbers)).toBe(true);
    });

    it("admin deletes a number", async () => {
        const res = await request(app)
            .delete(`/number/${createdNumberId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.deleted).toBe(true);
    });
});
