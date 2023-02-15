import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"
import request from "supertest"

describe("Get Balance Controller", () => {
    let connection: Connection
    let userToken: string

    beforeAll(async () => {
        connection = await createConnection()
    })

    beforeEach(async () => {
        await connection.runMigrations()

        await request(app).post("/api/v1/users").send({
            name: "John Due",
            email: "johndue@email.com",
            password: "john@123"
        })

        const authenticateResponse = await request(app).post("/api/v1/sessions").send({
            email: "johndue@email.com",
            password: "john@123"
        })

        userToken = `Bearer ${authenticateResponse.body.token}`

    })

    afterEach(async () => {
        await connection.dropDatabase();
    });

    afterAll(async () => {
        await connection.close();
    });

    it("Should be able to get balence", async () => {
        const balanceResponse = await request(app)
        .get("/api/v1/statements/balance")
        .set("Authorization", userToken)

        expect(balanceResponse.status).toBe(200)
        expect(balanceResponse.body).toHaveProperty("statement")
        expect(balanceResponse.body).toHaveProperty("balance")
    })

    it("Should not be able to get balance of not authenticatedd user", async () => {
        const balanceResponse = await request(app)
        .get("/api/v1/statements/balance")

        expect(balanceResponse.status).toBe(401)
    })
})