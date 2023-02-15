import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"
import request from "supertest"

describe("Get Statement Operation Controller", () => {
    let connection: Connection
    let userToken: string
    let statement_id: string

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

        const statement = await request(app)
            .post("/api/v1/statements/deposit")
            .set("Authorization", userToken)
            .send({
                amount: 99,
                description: "Deposit statement description"
            })

        statement_id = statement.body.id

    })

    afterEach(async () => {
        await connection.dropDatabase();
    });

    afterAll(async () => {
        await connection.close();
    });

    it("Should be able to get statement operation", async () => {
        const operationReponse = await request(app)
            .get(`/api/v1/statements/${statement_id}`)
            .set("Authorization", userToken)

        expect(operationReponse.body.id).toBe(statement_id)
    })

    it("Should not be able to get statement operation with invalid statement id", async () => {
        const operationReponse = await request(app)
            .get(`/api/v1/statements/da783b38-3234-44b4-b810-819ea934900f`)
            .set("Authorization", userToken)

        expect(operationReponse.status).toBe(404)
    })

    it("Should not be able to get statement operation with not authenticated user", async () => {
        const operationReponse = await request(app)
            .get(`/api/v1/statements/${statement_id}`)

        expect(operationReponse.status).toBe(401)
    })
})