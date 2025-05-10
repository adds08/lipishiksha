import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListChecks, UploadCloud } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Welcome to the admin area. Manage application settings and content here.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/font-management" passHref>
          <Button variant="outline" className="w-full justify-start p-6 text-left h-auto">
            <UploadCloud className="mr-3 h-6 w-6 text-primary" />
            <div>
              <span className="font-semibold text-lg">Font Management</span>
              <p className="text-sm text-muted-foreground">Upload and manage font files for practice sheets.</p>
            </div>
          </Button>
        </Link>
        {/* Add more admin links here as needed */}
        <Button variant="outline" className="w-full justify-start p-6 text-left h-auto" disabled>
            <ListChecks className="mr-3 h-6 w-6 text-muted-foreground" />
            <div>
              <span className="font-semibold text-lg text-muted-foreground">User Labeled Data (Coming Soon)</span>
              <p className="text-sm text-muted-foreground">Review and manage user-submitted labeled data.</p>
            </div>
          </Button>
      </div>
    </div>
  );
}
