import client from './client';
import { UserProfile } from '../types/user';

export async function getProfile(): Promise<UserProfile> {
  const { data } = await client.get<UserProfile>('/users/profile');
  return data;
}

export async function updateProfile(formData: FormData): Promise<UserProfile> {
  const { data } = await client.patch<UserProfile>('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getPublicProfile(username: string): Promise<UserProfile> {
  const { data } = await client.get<UserProfile>(`/users/public/${username}`);
  return data;
}
