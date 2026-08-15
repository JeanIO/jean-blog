import type { User, CreateUserInput } from "../types/models.js"

let users: User[] = []
let nextId = 1

const UserModel = {
  getAll(): User[] {
    return users
  },

  getById(id: string | number): User | undefined {
    const userId = typeof id === "string" ? parseInt(id) : id
    return users.find(user => user.id === userId)
  },

  create(userData: CreateUserInput): User {
    if (!userData.name || !userData.email) {
      throw new Error("Name and email are required")
    }

    const newUser: User = {
      id: nextId++,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users.push(newUser)
    return newUser
  },

  update(id: string | number, userData: Partial<User>): User | null {
    const userId = typeof id === "string" ? parseInt(id) : id
    const index = users.findIndex(user => user.id === userId)

    if (index === -1) {
      return null
    }

    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date(),
    }

    return users[index]
  },

  delete(id: string | number): boolean {
    const userId = typeof id === "string" ? parseInt(id) : id
    const index = users.findIndex(user => user.id === userId)

    if (index === -1) {
      return false
    }

    users.splice(index, 1)
    return true
  },
}

export default UserModel