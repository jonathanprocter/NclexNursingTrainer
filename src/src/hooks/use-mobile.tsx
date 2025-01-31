import React from "react"

export const MOBILE_BREAKPOINT = 640; // Updated to match Tailwind's sm breakpoint
export const TABLET_BREAKPOINT = 768; // Added tablet breakpoint (md)

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };

    // Initial check
    checkTablet();

    // Add event listener for resize
    window.addEventListener('resize', checkTablet);

    // Cleanup
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  return isTablet;
}

export function useBreakpoint() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}