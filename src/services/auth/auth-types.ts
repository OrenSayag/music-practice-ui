export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
}

export interface MeResponse {
  user: User;
}

export interface LoginResponse {
  message: string;
}
