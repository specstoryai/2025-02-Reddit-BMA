import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const Logo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#4F46E5" />
    <path
      d="M16 8L24 12V20L16 24L8 20V12L16 8Z"
      fill="white"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface HeaderProps {
  onNext: () => void;
  buttonText: string;
  showRestart: boolean;
}

export const Header = ({ onNext, buttonText, showRestart }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-xl font-semibold text-gray-900">LLM Learnings</h1>
        </div>
        <Button onClick={onNext} className="flex items-center gap-2">
          {showRestart && <RotateCcw size={16} />}
          {buttonText}
        </Button>
      </div>
    </header>
  );
}; 