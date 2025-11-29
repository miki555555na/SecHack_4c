import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface VulnerableCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function VulnerableCard({ title, description, children }: VulnerableCardProps) {
  return (
    <Card className="border-3 border-red-500 bg-red-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <CardTitle className="text-red-600">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription className="text-red-700">{description}</CardDescription>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
