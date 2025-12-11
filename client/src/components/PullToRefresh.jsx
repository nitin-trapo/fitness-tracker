import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ pullDistance, isRefreshing, threshold }) {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 10 || isRefreshing;
  
  if (!shouldShow) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{ 
        transform: `translateY(${Math.min(pullDistance, threshold) - 50}px)`,
        opacity: progress
      }}
    >
      <div className={`
        w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
        ${isRefreshing ? 'animate-spin' : ''}
      `}>
        <RefreshCw 
          className={`w-5 h-5 text-blue-600 transition-transform`}
          style={{ 
            transform: isRefreshing ? 'none' : `rotate(${progress * 360}deg)` 
          }}
        />
      </div>
    </div>
  );
}
