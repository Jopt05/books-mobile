import { useState, useCallback } from 'react';
import { followUser, unfollowUser, getFollowStats, FollowStats } from '../api/follows';

interface UseFollowReturn {
  stats: FollowStats | null;
  loading: boolean;
  toggling: boolean;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useFollow(username: string, initialStats: FollowStats | null = null): UseFollowReturn {
  const [stats, setStats] = useState<FollowStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFollowStats(username);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const follow = useCallback(async () => {
    setToggling(true);
    try {
      await followUser(username);
      setStats((prev) => prev ? { ...prev, isFollowing: true, followersCount: prev.followersCount + 1 } : prev);
    } finally {
      setToggling(false);
    }
  }, [username]);

  const unfollow = useCallback(async () => {
    setToggling(true);
    try {
      await unfollowUser(username);
      setStats((prev) => prev ? { ...prev, isFollowing: false, followersCount: prev.followersCount - 1 } : prev);
    } finally {
      setToggling(false);
    }
  }, [username]);

  return { stats, loading, toggling, follow, unfollow, refreshStats };
}
