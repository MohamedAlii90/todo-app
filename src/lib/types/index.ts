export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: number
  item: string
  isCompleted: boolean
  userId: number
  createdAt: Date
  updatedAt: Date
}

/** What the register and login endpoints return. */
export interface AuthResponse {
  access_token: string
  userID: number
  firstName: string
}
