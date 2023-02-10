import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it("Should be able to show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "user_name",
      email: "user@email.com",
      password: "user@123"
    })

    const user_id: string = user.id!

    const profile = await showUserProfileUseCase.execute(user_id)

    expect(profile).toHaveProperty("id")
    expect(profile.id).toEqual(user_id)
  })

  it("Should not be able show user profile when user not found", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("user-id-1234")
    }
    ).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})