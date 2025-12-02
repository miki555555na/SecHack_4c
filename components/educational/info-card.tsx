import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <Card className="border-3 border-yellow-500 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <CardTitle className="text-yellow-600">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription className="text-yellow-700">{description}</CardDescription>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
