export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthSession {
  accessToken: string
  user: User
}
