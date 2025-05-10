import type { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <div className="space-y-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
