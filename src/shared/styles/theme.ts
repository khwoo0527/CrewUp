export const colors = {
  primary: { DEFAULT: '#2e7d32', dark: '#1b5e20', light: '#e8f5e9' },
  error: '#e53935',
  warning: '#f57c00',
  info: '#1565c0',
  surface: '#ffffff',
  background: '#f0f2f5',
  text: { primary: '#333333', secondary: '#777777', hint: '#aaaaaa' },
  border: '#e0e0e0',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    500: '#9e9e9e',
    700: '#616161',
    900: '#212121',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
} as const;
