import { useState, useCallback } from 'react';
import { ImportResult } from '../types/domain';
import { importGoodreads } from '../api/importBooks';

interface UseImportReturn {
  result: ImportResult | null;
  loading: boolean;
  error: string;
  importFile: (file: FormData) => Promise<void>;
  reset: () => void;
}

export function useImport(): UseImportReturn {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const importFile = useCallback(async (file: FormData) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await importGoodreads(file);
      setResult(data);
    } catch {
      setError('No se pudo completar la importación');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return { result, loading, error, importFile, reset };
}
