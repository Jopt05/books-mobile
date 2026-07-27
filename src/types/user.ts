export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
