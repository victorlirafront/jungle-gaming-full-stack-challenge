import type { User } from '@repo/types';

export interface ApiUserResponse {
  id: string;
  email: string;
  username: string;
}

export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUserResponse;
}


export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type { User };

