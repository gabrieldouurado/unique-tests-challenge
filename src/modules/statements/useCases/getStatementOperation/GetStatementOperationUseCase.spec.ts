import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operatiron", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("Should be able to get statement operation", async () => {
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

    const statement_id: string = statement.id!

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    })

    expect(statementOperation).toHaveProperty("id")
    expect(statementOperation.user_id).toEqual(user_id)
    expect(statementOperation).toEqual(expect.objectContaining({ type: 'deposit' }))
  })

  it("Should not be able to get statement operation of an not existing user", async () => {
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

    const statement_id: string = statement.id!

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "user_id_1234",
        statement_id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })
  
  it("Should not be able to get statement operation when statemant id not found", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const user_id: string = user.id!

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: "statement_id_1234"
      })
    })
  })
})