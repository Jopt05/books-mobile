import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { updateUserBook, deleteUserBook } from '../api/userBooks';
import { BookStatus, UserBook } from '../types/domain';

interface SheetTarget {
  id: string;
  title: string;
  status: BookStatus;
}

export function useStatusSheet() {
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const [updating, setUpdating] = useState(false);

  const open = useCallback((book: SheetTarget) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTarget(book);
  }, []);

  const close = useCallback(() => {
    setTarget(null);
  }, []);

  const changeStatus = useCallback(async (status: BookStatus) => {
    if (!target || target.status === status) {
      close();
      return;
    }
    setUpdating(true);
    try {
      await updateUserBook(target.id, { status });
      close();
      return true;
    } catch {
      close();
      return false;
    } finally {
      setUpdating(false);
    }
  }, [target, close]);

  const remove = useCallback(async () => {
    if (!target) return;
    setUpdating(true);
    try {
      await deleteUserBook(target.id);
      close();
      return true;
    } catch {
      close();
      return false;
    } finally {
      setUpdating(false);
    }
  }, [target, close]);

  return {
    sheetVisible: target !== null,
    sheetTarget: target,
    updating,
    open,
    close,
    changeStatus,
    remove,
  };
}
