import { X, User, Mail, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

interface User {
  id: string;
  name: string;
  email: string;
  tier: 'Free' | 'Pro' | 'Ultra';
  registrationDate: string;
  accountStatus: 'Active' | 'Inactive';
  onboardingStatus: 'Completed' | 'Pending';
}

interface UserDetailDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailDrawer({ user, isOpen, onClose }: UserDetailDrawerProps) {
  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Subscription Tier</p>
                <Badge
                  variant={user.tier === 'Ultra' ? 'default' : 'secondary'}
                  className={user.tier === 'Ultra' ? 'bg-primary' : ''}
                >
                  {user.tier}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registration Date</p>
                <p className="font-medium">
                  {new Date(user.registrationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Account Status</p>
                <div className="flex gap-2">
                  <Badge variant={user.accountStatus === 'Active' ? 'default' : 'secondary'}>
                    {user.accountStatus}
                  </Badge>
                  <Badge
                    variant={user.onboardingStatus === 'Completed' ? 'default' : 'secondary'}
                  >
                    {user.onboardingStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-accent-foreground">
              <strong>Privacy Notice:</strong> Health conditions, allergies, body measurements,
              chat history, and nutrition plans are not accessible from this interface.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full">Edit Subscription Tier</Button>
            <Button variant="outline" className="w-full">
              Manage Account Status
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
