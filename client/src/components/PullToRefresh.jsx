import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ pullDistance, isRefreshing }) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = pullDistance * 3;

  return (
    <div 
      className="fixed top-14 left-0 right-0 flex justify-center z-40 pointer-events-none"
      style={{ 
        transform: `translateY(${Math.min(pullDistance, 60)}px)`,
        opacity: progress
      }}
    >
      <div className={`w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}>
        <RefreshCw 
          className="w-5 h-5 text-blue-600" 
          style={{ transform: isRefreshing ? 'none' : `rotate(${rotation}deg)` }}
        />
      </div>
    </div>
  );
}
