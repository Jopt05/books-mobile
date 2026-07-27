import client from './client';

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface FollowUser {
  id: string;
  username: string;
  avatar: string | null;
}

export async function followUser(username: string): Promise<void> {
  await client.post(`/follows/${username}`);
}

export async function unfollowUser(username: string): Promise<void> {
  await client.delete(`/follows/${username}`);
}

export async function getFollowStats(username: string): Promise<FollowStats> {
  const { data } = await client.get<FollowStats>(`/follows/${username}/stats`);
  return data;
}

export async function getFollowers(username: string): Promise<FollowUser[]> {
  const { data } = await client.get<FollowUser[]>(`/follows/${username}/followers`);
  return data;
}

export async function getFollowing(username: string): Promise<FollowUser[]> {
  const { data } = await client.get<FollowUser[]>(`/follows/${username}/following`);
  return data;
}
