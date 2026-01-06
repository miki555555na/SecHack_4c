import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface DemoButtonProps {
  variant: 'vulnerable' | 'secure';
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function DemoButton({ variant, active, onClick, children }: DemoButtonProps) {
  const baseClasses = active
    ? 'border-2'
    : 'opacity-60 hover:opacity-100';

  const variantClasses = variant === 'vulnerable'
    ? 'border-red-500 bg-red-100 hover:bg-red-200 text-red-700'
    : 'border-green-500 bg-green-100 hover:bg-green-200 text-green-700';

  return (
    <Button
      variant="outline"
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
