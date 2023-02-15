import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"
import request from "supertest"
import { Response } from "express"

describe("Show User Profile Controller", () => {
    let connection: Connection

    beforeAll(async () => {
        connection = await createConnection()
    })

    beforeEach(async () => {
        await connection.runMigrations()
    })

    afterEach(async () => {
        await connection.dropDatabase();
    });

    afterAll(async () => {
        await connection.close();
    });

    it("Should be able to show user profile", async () => {
        const user = await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        const authenticateResponse = await request(app).post("/api/v1/sessions").send({
            email: "johndue@email.com",
            password: "john@123"
        })

        const profileResponse = await request(app).get("/api/v1/profile").set("Authorization", `Bearer ${authenticateResponse.body.token}`)

        expect(profileResponse.status).toBe(200)
        expect(profileResponse.body.id).toEqual(user.body.id)
    })

    it("Should not be able to view a user profile when not authenticated", async () => {
        await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        const profileResponse = await request(app).get("/api/v1/profile")

        expect(profileResponse.status).toBe(401)
    })
})