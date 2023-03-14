import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("Should be able to create a new statement", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const user_id: string = user.id!

    const statement = await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Supermarket"
    })

    expect(statement).toHaveProperty("id")
    expect(statement.user_id).toEqual(user_id)
  })

  it("Should not be able to create a statement when user not exists",() => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "user_id_1234",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Supermarket"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
  
  it("Should not be able to create statement with balance lessthan amount", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const user_id: string = user.id!

    expect(async () => {
      await createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        amount: 1000,
        description: "Supermarket"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("Should be able to create a new transfer statement", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const userReceived = await createUserUseCase.execute({
      name: "user_received",
      email: "received@email.com",
      password: "received@123"
    })

    const user_id: string = user.id!

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit"
    })

    const statement = await createStatementUseCase.execute({
      user_id,
      user_received_id: userReceived.id,
      type: OperationType.TRANSFER,
      amount: 36,
      description: "Transfer"
    })

    expect(statement).toHaveProperty("id")
    expect(statement.user_id).toEqual(user_id)
  })

  it("Should not be able to create a transfer when received not found", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const user_id: string = user.id!

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit"
    })

    expect(async () => {
      await createStatementUseCase.execute({
        user_id,
        user_received_id: "random@uuid",
        type: OperationType.TRANSFER,
        amount: 36,
        description: "Transfer"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.ReceiverNotFound)
  })

  it("Should not be able to create transfer with balance lessthan amount", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const userReceived = await createUserUseCase.execute({
      name: "user_received",
      email: "received@email.com",
      password: "received@123"
    })

    const user_id: string = user.id!

    expect(async () => {
      await createStatementUseCase.execute({
        user_id,
        user_received_id: userReceived.id,
        type: OperationType.TRANSFER,
        amount: 1000,
        description: "Supermarket"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})