import { useState } from 'react';
import { createReport } from '../api/reports';
import type { ReportType } from '../api/reports';
import { useLanguage } from '../context/LanguageContext';

export function useReport() {
  const [type, setType] = useState<ReportType>('BUG');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ description?: string }>({});
  const { t } = useLanguage();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!description.trim()) {
      newErrors.description = t('report.errorDescriptionRequired');
    } else if (description.trim().length > 2000) {
      newErrors.description = t('report.errorDescriptionMax');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createReport({ type, description: description.trim() });
      setSuccess(true);
    } catch {
      setErrors({ description: t('report.errorFailed') });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setType('BUG');
    setDescription('');
    setSuccess(false);
    setErrors({});
  };

  return { type, setType, description, setDescription, loading, success, errors, submit, reset };
}
