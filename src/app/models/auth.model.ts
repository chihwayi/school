export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface LoginResponse {
  token: string;
  roles: string[];
  username: string;
  school?: {
    name: string;
    logoPath: string;
    backgroundPath: string;
  };
}

export interface ApiResponse {
  message: string;
  setupRequired?: boolean;
  [key: string]: any;
}
