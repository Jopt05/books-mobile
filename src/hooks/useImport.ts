import { useState, useCallback } from 'react';
import { ImportResult } from '../types/domain';
import { importGoodreads, importHardcover, ImportSource } from '../api/importBooks';

interface UseImportReturn {
  source: ImportSource;
  setSource: (s: ImportSource) => void;
  result: ImportResult | null;
  loading: boolean;
  error: string;
  importFile: (file: FormData) => Promise<void>;
  reset: () => void;
}

export function useImport(): UseImportReturn {
  const [source, setSource] = useState<ImportSource>('goodreads');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const importFile = useCallback(async (file: FormData) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const importFn = source === 'hardcover' ? importHardcover : importGoodreads;
      const data = await importFn(file);
      setResult(data);
    } catch {
      setError('No se pudo completar la importación');
    } finally {
      setLoading(false);
    }
  }, [source]);

  const reset = useCallback(() => {
    setResult(null);
    setError('');
  }, []);

  return { source, setSource, result, loading, error, importFile, reset };
}
