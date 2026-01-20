export type CreateUserBody = {
  username: string
  email: string
  password: string
  repeat_password: string
}

export type UserDTO = {
  id: string
  username: string
  email: string
}

export type LoginBody = {
  identifier: string
  password: string
}

export type ImageDTO = {
  id: string
  user_id: string
  url: string
}
