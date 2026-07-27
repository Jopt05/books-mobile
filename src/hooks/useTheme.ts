import { useThemeContext, ThemeColors } from '../context/ThemeContext';

interface UseThemeReturn {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
}

export function useTheme(): UseThemeReturn {
  const { isDark, colors, toggle } = useThemeContext();
  return { isDark, colors, toggle };
}
