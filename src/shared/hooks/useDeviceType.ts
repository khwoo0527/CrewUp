import { useWindowDimensions } from 'react-native';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '@/shared/constants';

export function useDeviceType() {
  const { width } = useWindowDimensions();
  return {
    isMobile: width < BREAKPOINT_TABLET,
    isTablet: width >= BREAKPOINT_TABLET && width < BREAKPOINT_DESKTOP,
    isDesktop: width >= BREAKPOINT_DESKTOP,
  } as const;
}
