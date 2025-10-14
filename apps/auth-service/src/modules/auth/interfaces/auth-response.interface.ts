export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  error?: string;
}

