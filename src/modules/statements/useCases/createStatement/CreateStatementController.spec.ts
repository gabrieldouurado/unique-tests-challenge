import { Connection, createConnection } from "typeorm"
import { app } from "../../../../app"
import request from "supertest"

describe("Create Statement Controller", () => {
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

    it("Should be able to create a new deposit statement", async () => {
        const depositResponse = await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", userToken)
        .send({
            amount: 99,
            description: "Deposit statement description"
        })

        expect(depositResponse.status).toBe(201)
    })

    it("Should not be able to create a deposit statement with user is not authenticatedd", async () => {
        const depositResponse = await request(app)
        .post("/api/v1/statements/deposit")
        .send({
            amount: 99,
            description: "Deposit statement description"
        })

        expect(depositResponse.status).toBe(401)
    })

    it("Should be able to create a new withdraw statement", async () => {
        await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", userToken)
        .send({
            amount: 99,
            description: "Deposit statement description"
        })

        const withdrawResponse = await request(app)
        .post("/api/v1/statements/withdraw")
        .set("Authorization", userToken)
        .send({
            amount: 25,
            description: "Deposit statement description"
        })
        expect(withdrawResponse.status).toBe(201)
    })

    it("Should not be able to create a withdraw statement with value greather than amount available in account", async () => {
        await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", userToken)
        .send({
            amount: 30,
            description: "Deposit statement description"
        })

        const withdrawResponse = await request(app)
        .post("/api/v1/statements/withdraw")
        .set("Authorization", userToken)
        .send({
            amount: 99,
            description: "Deposit statement description"
        })
        
        expect(withdrawResponse.status).toBe(400)
    })

    it("Should not be able to create a withdraw statement with user is not authenticatedd", async () => {
        const withdrawResponse = await request(app)
        .post("/api/v1/statements/withdraw")
        .send({
            amount: 99,
            description: "withdraw statement description"
        })

        expect(withdrawResponse.status).toBe(401)
    })

    it("Should be able to create a new transfer statement", async () => {
        //Cria um novo usuário para receber a transferencia
        const userReceivedTransfer = await request(app).post("/api/v1/users").send({
            name: "Marie",
            email: "Marie@email.com",
            password: "Marie@123"
        })

        //Realiza um depósito na conta do usuário que irá FAZER a transferencia
        await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", userToken)
        .send({
            amount: 100,
            description: "Deposit statement description"
        })

        const transferResponse = await request(app)
        .post(`/api/v1/statements/transfer/${userReceivedTransfer.body.id}`)
        .set("Authorization", userToken)
        .send({
            amount: 36,
            description: "Transfer to Marie"
        })

        expect(transferResponse.status).toBe(201)
    })

    it("Should not be able to create transfer when balence sender balence insufficient", async () => {
        //Cria um novo usuário para receber a transferencia
        const userReceivedTransfer = await request(app).post("/api/v1/users").send({
            name: "Marie",
            email: "Marie@email.com",
            password: "Marie@123"
        })

        const transferResponse = await request(app)
        .post(`/api/v1/statements/transfer/${userReceivedTransfer.body.id}`)
        .set("Authorization", userToken)
        .send({
            amount: 99,
            description: "Transfer to Marie"
        })

        expect(transferResponse.status).toBe(400)
        expect(transferResponse.body.message).toEqual('Insufficient funds')
    })

    it("Should not be able to create a new transfer when received not found", async () => {
        //Realiza um depósito na conta do usuário que irá FAZER a transferencia
        await request(app)
        .post("/api/v1/statements/deposit")
        .set("Authorization", userToken)
        .send({
            amount: 100,
            description: "Deposit statement description"
        })

        const transferResponse = await request(app)
        .post("/api/v1/statements/transfer/22d9c1aa-593a-463a-a15b-e62761e994ca")
        .set("Authorization", userToken)
        .send({
            amount: 36,
            description: "Transfer to Marie"
        })        

        expect(transferResponse.status).toBe(404)
        expect(transferResponse.body.message).toBe('Receiver not found')
    })
})