import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface SecureCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SecureCard({ title, description, children }: SecureCardProps) {
  return (
    <Card className="border-3 border-green-500 bg-green-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <CardTitle className="text-green-600">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription className="text-green-700">{description}</CardDescription>
        )}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
