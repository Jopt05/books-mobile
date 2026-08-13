import { useState, useCallback } from 'react';
import { searchUsers, SearchUserResult } from '../api/users';
import { useLanguage } from '../context/LanguageContext';

interface UseSearchUsersReturn {
  users: SearchUserResult[];
  loading: boolean;
  error: string;
  searched: boolean;
  search: (query: string) => void;
}

export function useSearchUsers(): UseSearchUsersReturn {
  const [users, setUsers] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const { t } = useLanguage();

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const data = await searchUsers(query.trim());
      setUsers(data);
    } catch {
      setError(t('errors.searchUsers'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  return { users, loading, error, searched, search };
}
