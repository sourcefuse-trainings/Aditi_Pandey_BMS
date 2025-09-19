import React from 'react';

interface PageAnimatorProps {
  children: React.ReactNode;
}

const PageAnimator: React.FC<PageAnimatorProps> = ({ children }) => {
  return <div className="animate-slideInUp">{children}</div>;
};

export default PageAnimator;