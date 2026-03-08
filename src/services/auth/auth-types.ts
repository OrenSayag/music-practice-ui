export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
  isGuest: boolean;
}

export interface GuestLoginResponse {
  user: {
    id: string;
    isGuest: boolean;
  };
}

export interface MeResponse {
  user: User;
}

export interface LoginResponse {
  message: string;
}
