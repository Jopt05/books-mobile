import { useState, useEffect, useCallback } from 'react';
import { getFollowers, getFollowing, FollowUser } from '../api/follows';

interface UseNetworkReturn {
  followers: FollowUser[];
  following: FollowUser[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export function useNetwork(username: string): UseNetworkReturn {
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [followersData, followingData] = await Promise.all([
        getFollowers(username),
        getFollowing(username),
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch {
      setError('No se pudo cargar la red');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { followers, following, loading, error, refresh };
}
