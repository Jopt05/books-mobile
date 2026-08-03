import client from './client';

export interface DiscussionUser {
  id: string;
  username: string;
  avatar: string | null;
}

export interface Discussion {
  id: string;
  userId: string;
  user: DiscussionUser;
  bookId: string | null;
  bookTitle: string | null;
  bookCover: string | null;
  title: string;
  content: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  _count: { replies: number; likes: number };
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  user: DiscussionUser;
  content: string;
  bookId: string | null;
  bookTitle: string | null;
  bookCover: string | null;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  _count: { likes: number };
}

export interface DiscussionsResponse {
  data: Discussion[];
  nextCursor: string | null;
}

export interface RepliesResponse {
  data: DiscussionReply[];
  nextCursor: string | null;
}

// --- Discussions ---

export async function getDiscussions(params: {
  cursor?: string;
  limit?: number;
  search?: string;
  tag?: string;
  bookId?: string;
  sort?: 'recent' | 'popular';
}): Promise<DiscussionsResponse> {
  const { data } = await client.get<DiscussionsResponse>('/discussions', { params });
  return data;
}

export async function getDiscussionById(id: string): Promise<Discussion> {
  const { data } = await client.get<Discussion>(`/discussions/${id}`);
  return data;
}

export async function createDiscussion(body: {
  title: string;
  content?: string;
  bookId?: string;
  bookTitle?: string;
  bookCover?: string;
  tags?: string[];
}): Promise<Discussion> {
  const { data } = await client.post<Discussion>('/discussions', body);
  return data;
}

export async function deleteDiscussion(id: string): Promise<void> {
  await client.delete(`/discussions/${id}`);
}

export async function toggleDiscussionLike(id: string): Promise<{ liked: boolean }> {
  const { data } = await client.post<{ liked: boolean }>(`/discussions/${id}/like`);
  return data;
}

// --- Replies ---

export async function getReplies(discussionId: string, params: {
  cursor?: string;
  limit?: number;
  sort?: 'recent' | 'popular';
}): Promise<RepliesResponse> {
  const { data } = await client.get<RepliesResponse>(`/discussions/${discussionId}/replies`, { params });
  return data;
}

export async function createReply(discussionId: string, body: {
  content: string;
  bookId?: string;
  bookTitle?: string;
  bookCover?: string;
}): Promise<DiscussionReply> {
  const { data } = await client.post<DiscussionReply>(`/discussions/${discussionId}/replies`, body);
  return data;
}

export async function deleteReply(replyId: string): Promise<void> {
  await client.delete(`/discussions/replies/${replyId}`);
}

export async function toggleReplyLike(replyId: string): Promise<{ liked: boolean }> {
  const { data } = await client.post<{ liked: boolean }>(`/discussions/replies/${replyId}/like`);
  return data;
}
