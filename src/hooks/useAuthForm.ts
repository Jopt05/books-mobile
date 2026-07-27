import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface FieldErrors {
  email?: string;
  username?: string;
  password?: string;
}

interface UseAuthFormReturn {
  isLogin: boolean;
  email: string;
  setEmail: (v: string) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  togglePassword: () => void;
  errors: FieldErrors;
  generalError: string;
  successMessage: string;
  loading: boolean;
  handleSubmit: () => Promise<void>;
  toggleMode: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useAuthForm(): UseAuthFormReturn {
  const { login, registerUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
  }, []);

  const validate = useCallback((): FieldErrors => {
    const newErrors: FieldErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'El formato del correo no es válido';
    }

    if (!isLogin) {
      if (!username.trim()) {
        newErrors.username = 'El nombre de usuario es obligatorio';
      } else if (username.trim().length < 3) {
        newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      }
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return newErrors;
  }, [email, username, password, isLogin]);

  const handleSubmit = useCallback(async () => {
    setGeneralError('');
    setSuccessMessage('');

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        await registerUser({ email: email.trim(), username: username.trim(), password });
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.';
      setGeneralError(typeof message === 'string' ? message : message[0] || 'Error');
    } finally {
      setLoading(false);
    }
  }, [validate, isLogin, email, username, password, login, registerUser]);

  return {
    isLogin,
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    togglePassword,
    errors,
    generalError,
    successMessage,
    loading,
    handleSubmit,
    toggleMode,
  };
}
