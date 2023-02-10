import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let getBalanceUseCase: GetBalanceUseCase

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
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
})
