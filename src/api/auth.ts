import client from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await client.post('/auth/refresh', { refreshToken: token });
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await client.post('/auth/forgot-password', { email });
  return data;
}
