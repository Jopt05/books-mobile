import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/user';
import { UserBook, BookStatus } from '../types/domain';
import { getPublicProfile } from '../api/users';
import { getPublicUserBooks } from '../api/userBooks';
import { getFollowStats, FollowStats } from '../api/follows';

interface UsePublicProfileReturn {
  profile: UserProfile | null;
  followStats: FollowStats | null;
  shelves: Record<BookStatus, UserBook[]>;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const emptyShelves: Record<BookStatus, UserBook[]> = {
  WANT_TO_READ: [],
  READING: [],
  READ: [],
  DID_NOT_FINISH: [],
};

export function usePublicProfile(username: string): UsePublicProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats | null>(null);
  const [shelves, setShelves] = useState<Record<BookStatus, UserBook[]>>(emptyShelves);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, stats, books] = await Promise.all([
        getPublicProfile(username),
        getFollowStats(username),
        getPublicUserBooks(username),
      ]);
      setProfile(profileData);
      setFollowStats(stats);

      const grouped = { ...emptyShelves };
      books.forEach((book) => {
        if (grouped[book.status]) {
          grouped[book.status].push(book);
        }
      });
      setShelves(grouped);
    } catch {
      setError('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, followStats, shelves, loading, error, refresh };
}
