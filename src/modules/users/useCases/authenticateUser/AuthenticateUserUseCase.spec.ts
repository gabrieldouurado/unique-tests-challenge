import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })

  it("Should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "user_name_1",
      email: "user@email.com",
      password: "user@123"
    })

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: "user@email.com",
      password: "user@123"
    })

    expect(userAuthenticated).toHaveProperty("token")
  })

  it("should not be able to authenticate user if user not exists", () => {
    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "user@email.com",
        password: "user@123"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate when user password ins incorrect", async () => {
    await createUserUseCase.execute({
      name: "user_name_1",
      email: "user@email.com",
      password: "user@123"
    })

    expect(async() => {
      await authenticateUserUseCase.execute({
        email: "user@email.com",
        password: "incorrect@password"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})