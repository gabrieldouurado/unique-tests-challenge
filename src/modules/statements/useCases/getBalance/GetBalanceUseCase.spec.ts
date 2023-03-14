import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let getBalanceUseCase: GetBalanceUseCase
let createStatementUseCase: CreateStatementUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("Should be able to get a balance", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const user_id: string = user.id!

    const balance = await getBalanceUseCase.execute({
      user_id
    })

    expect(balance).toHaveProperty("balance")
  })

  it("Should not be able to get balance of an not existing user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "user_id_1234"
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })

  it("Should be able to get a balance after transfer", async () => {
    const mockTest = {
      inicialUserBalance: 100,
      transferValue: 36,
      finalUserbalance: 100 - 36,
      receivedBalance: 36
    }

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
      amount: mockTest.inicialUserBalance,
      description: "Deposit"
    })

    await createStatementUseCase.execute({
      user_id,
      user_received_id: userReceived.id,
      type: OperationType.TRANSFER,
      amount: mockTest.transferValue,
      description: "Transfer"
    })

    const balanceUser = await getBalanceUseCase.execute({
      user_id
    })

    const balanceReceived = await getBalanceUseCase.execute({
      user_id: userReceived.id!
    })

    expect(balanceUser.balance).toEqual(mockTest.finalUserbalance)
    expect(balanceReceived.balance).toEqual(mockTest.receivedBalance)
  })
})
