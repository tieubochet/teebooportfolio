
import React from 'react';

const ShareIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 16.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.25 8.625-4.5 2.25m4.5 3.375-4.5 2.25" />
  </svg>
);

export default ShareIcon;
