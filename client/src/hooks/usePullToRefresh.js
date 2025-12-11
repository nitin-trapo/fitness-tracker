import { useState, useEffect, useCallback } from 'react';

export default function usePullToRefresh(onRefresh, options = {}) {
  const { threshold = 80, resistance = 2.5 } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e) => {
    // Only enable pull-to-refresh when at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only pull down, not up
    if (diff > 0 && window.scrollY === 0) {
      // Apply resistance to make it feel natural
      const distance = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(distance);
      
      // Prevent default scroll behavior when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, isRefreshing, startY, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      
      setIsRefreshing(false);
    }
    
    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const options = { passive: false };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    threshold
  };
}
