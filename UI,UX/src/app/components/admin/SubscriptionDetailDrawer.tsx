import { User, Mail, CreditCard, Calendar, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

interface Subscription {
  id: string;
  userName: string;
  email: string;
  tier: 'Pro' | 'Ultra';
  status: 'Active' | 'Inactive' | 'Cancelled';
  activationDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

interface SubscriptionDetailDrawerProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionDetailDrawer({ subscription, isOpen, onClose }: SubscriptionDetailDrawerProps) {
  if (!subscription) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Subscription Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Subscription Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">User Name</p>
                <p className="font-medium">{subscription.userName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="font-medium">{subscription.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
                <Badge
                  variant={subscription.tier === 'Ultra' ? 'default' : 'secondary'}
                  className={subscription.tier === 'Ultra' ? 'bg-primary' : ''}
                >
                  {subscription.tier}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Subscription Status</p>
                <Badge variant={subscription.status === 'Active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Activation Date</p>
                <p className="font-medium">
                  {new Date(subscription.activationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge
                  variant={
                    subscription.paymentStatus === 'Paid'
                      ? 'default'
                      : subscription.paymentStatus === 'Pending'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {subscription.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-accent-foreground">
              <strong>Privacy Notice:</strong> Detailed payment information, health data,
              and personal nutrition content are not accessible from this interface.
              Only operational subscription metadata is displayed.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full">Change Tier</Button>
            <Button variant="outline" className="w-full">
              Manage Subscription Status
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
