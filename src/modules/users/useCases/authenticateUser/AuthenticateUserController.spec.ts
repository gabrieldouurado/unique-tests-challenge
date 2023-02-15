import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"
import request from "supertest"

describe("Authenticate User Controller", () => {
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

    it("Should be able to authenticate a user", async () => {
        await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        const authenticateResponse = await request(app).post("/api/v1/sessions").send({
            email: "johndue@email.com",
            password: "john@123"
        })

        expect(authenticateResponse.status).toBe(200)
        expect(authenticateResponse.body).toHaveProperty("token")
    })

    it("Should not be able to authenticate user if user not found", async () => {
        const authenticateResponse = await request(app).post("/api/v1/sessions").send({
            email: "johndue@email.com",
            password: "john@123"
        })

        expect(authenticateResponse.status).toBe(401)
    })

    it("Should not be able to authenticate user if passaword is incorrect", async () => {
        await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        const authenticateResponse = await request(app).post("/api/v1/sessions").send({
            email: "johndue@email.com",
            password: "incorrect@password"
        })

        expect(authenticateResponse.status).toBe(401)
    })
})