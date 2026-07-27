import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/user';
import { getProfile, updateProfile } from '../api/users';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string;
  updating: boolean;
  refresh: () => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setProfile(data);
    } catch {
      setError('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBio = useCallback(async (bio: string) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      const updated = await updateProfile(formData);
      setProfile(updated);
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateAvatar = useCallback(async (uri: string) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);
      const updated = await updateProfile(formData);
      setProfile(updated);
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, error, updating, refresh, updateBio, updateAvatar };
}
