
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { CreateUserError } from "./CreateUserError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    expect(user).toHaveProperty("id")
    expect(user).toEqual(expect.objectContaining({ name: "user_name", email: "user@email.com" }))
  })

  it("Shold no be able to create user with a email already exists", async () => {

      await createUserUseCase.execute({
        name: "user_name_1",
        email: "user@email.com",
        password: "user@123"
      })

      expect(async () => {
        await createUserUseCase.execute({
          name: "user_name_2",
          email: "user@email.com",
          password: "user@123"
        })
      }).rejects.toBeInstanceOf(CreateUserError)
  })
})