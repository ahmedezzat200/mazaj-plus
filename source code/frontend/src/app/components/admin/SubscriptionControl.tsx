import { useState } from 'react';
import { Search, Filter, Eye, Edit, Power, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { SubscriptionDetailDrawer } from './SubscriptionDetailDrawer';
import { TierUpdateModal } from './TierUpdateModal';

interface Subscription {
  id: string;
  userName: string;
  email: string;
  tier: 'Pro' | 'Ultra';
  status: 'Active' | 'Inactive' | 'Cancelled';
  activationDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    tier: 'Ultra',
    status: 'Active',
    activationDate: '2026-03-15',
    paymentStatus: 'Paid',
  },
  {
    id: '2',
    userName: 'Michael Chen',
    email: 'michael.chen@example.com',
    tier: 'Pro',
    status: 'Active',
    activationDate: '2026-04-02',
    paymentStatus: 'Paid',
  },
  {
    id: '3',
    userName: 'David Kim',
    email: 'david.kim@example.com',
    tier: 'Pro',
    status: 'Active',
    activationDate: '2026-03-28',
    paymentStatus: 'Paid',
  },
  {
    id: '4',
    userName: 'Jessica Martinez',
    email: 'jessica.m@example.com',
    tier: 'Ultra',
    status: 'Active',
    activationDate: '2026-04-10',
    paymentStatus: 'Pending',
  },
];

export function SubscriptionControl() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [tierUpdateSubscription, setTierUpdateSubscription] = useState<Subscription | null>(null);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || sub.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Card className="p-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Ultra">Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscriptions Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activation Date</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h4 className="mb-2">No Subscriptions Found</h4>
                    <p className="text-sm text-muted-foreground">
                      No subscriptions match your search criteria
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.userName}</TableCell>
                    <TableCell className="text-muted-foreground">{subscription.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={subscription.tier === 'Ultra' ? 'default' : 'secondary'}
                        className={subscription.tier === 'Ultra' ? 'bg-primary' : ''}
                      >
                        {subscription.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={subscription.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(subscription.activationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSubscription(subscription)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setTierUpdateSubscription(subscription)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Subscription Detail Drawer */}
      <SubscriptionDetailDrawer
        subscription={selectedSubscription}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Tier Update Modal */}
      <TierUpdateModal
        subscription={tierUpdateSubscription}
        isOpen={!!tierUpdateSubscription}
        onClose={() => setTierUpdateSubscription(null)}
      />
    </>
  );
}
