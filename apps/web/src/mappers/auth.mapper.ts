import type {
  User,
  AuthResponse,
  ApiAuthResponse,
  ApiUserResponse,
} from '@/types/auth.types';

export const mapUser = (data: ApiUserResponse): User => ({
  id: data.id,
  email: data.email,
  username: data.username,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const mapAuthResponse = (data: ApiAuthResponse): AuthResponse => ({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  user: mapUser(data.user),
});

