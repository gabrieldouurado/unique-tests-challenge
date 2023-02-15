import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"
import request from "supertest"

describe("Create User Controller", () => {
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

    it("Should be able to create a new user", async () => {
        const userResponse = await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        expect(userResponse.status).toBe(201)
    })

    it("Shuld not be able to create a user if the email already exists", async () => {
        await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        const userResponse = await request(app).post("/api/v1/users").send({
            name: "John Due 2",
            email: "johndue@email.com",
            password: "john@123"
        })

        expect(userResponse.status).toBe(400)
    })
})