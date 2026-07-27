import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/user';
import { UserBook, BookStatus } from '../types/domain';
import { getProfile, updateProfile, getPublicProfile } from '../api/users';
import { getUserBooks, getPublicUserBooks } from '../api/userBooks';
import { useAuth } from '../context/AuthContext';

const STATUSES: BookStatus[] = ['READING', 'WANT_TO_READ', 'READ', 'DID_NOT_FINISH'];

const emptyShelves: Record<BookStatus, UserBook[]> = {
  WANT_TO_READ: [],
  READING: [],
  READ: [],
  DID_NOT_FINISH: [],
};

interface UseProfilePageReturn {
  profile: UserProfile | null;
  shelves: Record<BookStatus, UserBook[]>;
  isOwner: boolean;
  loading: boolean;
  error: string;
  updating: boolean;
  refresh: () => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
}

export function useProfilePage(username: string): UseProfilePageReturn {
  const { user, updateUser } = useAuth();
  const isOwner = user?.username === username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shelves, setShelves] = useState<Record<BookStatus, UserBook[]>>(emptyShelves);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let profileData: UserProfile;
      let books: UserBook[];

      if (isOwner) {
        profileData = await getProfile();
        const results = await Promise.all(
          STATUSES.map(status => getUserBooks(status))
        );
        books = results.flat();
        updateUser({ avatar: profileData.avatar, username: profileData.username });
      } else {
        profileData = await getPublicProfile(username);
        books = await getPublicUserBooks(username);
      }

      setProfile(profileData);

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
  }, [username, isOwner, updateUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      updateUser({ avatar: updated.avatar });
    } finally {
      setUpdating(false);
    }
  }, [updateUser]);

  return {
    profile,
    shelves,
    isOwner,
    loading,
    error,
    updating,
    refresh,
    updateBio,
    updateAvatar,
  };
}
