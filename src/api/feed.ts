import client from './client';
import { FeedResponse } from '../types/domain';

export async function getPersonalFeed(cursor?: string | null, limit: number = 20): Promise<FeedResponse> {
  const { data } = await client.get<FeedResponse>('/feed', {
    params: { cursor: cursor || undefined, limit },
  });
  return data;
}

export async function getGlobalFeed(cursor?: string | null, limit: number = 20): Promise<FeedResponse> {
  const { data } = await client.get<FeedResponse>('/feed/global', {
    params: { cursor: cursor || undefined, limit },
  });
  return data;
}
