export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
