import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex justify-center items-center gap-2">
      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default LoadingAnimation;
