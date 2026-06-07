import { useState, useEffect, useCallback } from 'react';
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
import { adminApi, AdminSubscription } from '../../../lib/api';
import { toast } from 'sonner';

export function SubscriptionControl() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [tierUpdateSubscription, setTierUpdateSubscription] = useState<AdminSubscription | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const result = await adminApi.getSubscriptions();
    if (result.ok && result.data) {
      setSubscriptions(result.data.subscriptions ?? []);
    } else {
      toast.error(result.error?.message || 'Failed to load subscriptions');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const handleToggleStatus = async (sub: AdminSubscription) => {
    const result = await adminApi.toggleSubscriptionStatus(Number(sub.id));
    if (result.ok) {
      toast.success(`Subscription ${sub.status === 'Active' ? 'deactivated' : 'activated'}`);
      fetchSubscriptions();
    } else {
      toast.error(result.error?.message || 'Failed to update subscription');
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    const tier = sub.tier?.toUpperCase() ?? '';
    const matchesTier = tierFilter === 'all' || tier === tierFilter.toUpperCase();
    return matchesSearch && matchesTier;
  });

  const toDisplayTier = (tier?: string) => {
    const t = tier?.toUpperCase();
    if (t === 'PRO') return 'Pro';
    if (t === 'ULTRA') return 'Ultra';
    return 'Free';
  };

  return (
    <>
      <Card className="p-6">
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

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activation Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
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
                    <TableCell className="font-medium">{subscription.user_name}</TableCell>
                    <TableCell className="text-muted-foreground">{subscription.user_email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={toDisplayTier(subscription.tier) === 'Ultra' ? 'default' : 'secondary'}
                        className={toDisplayTier(subscription.tier) === 'Ultra' ? 'bg-primary' : ''}
                      >
                        {toDisplayTier(subscription.tier)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscription.status === 'Active' ? 'default' : 'secondary'}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscription.activation_date ? new Date(subscription.activation_date).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedSubscription(subscription); setIsDetailOpen(true); }}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          title={subscription.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(subscription)}
                        >
                          <Power className={`h-4 w-4 ${subscription.status === 'Active' ? 'text-destructive' : 'text-primary'}`} />
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

      <SubscriptionDetailDrawer
        subscription={selectedSubscription as any}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <TierUpdateModal
        subscription={tierUpdateSubscription as any}
        isOpen={!!tierUpdateSubscription}
        onClose={() => setTierUpdateSubscription(null)}
        onUpdated={fetchSubscriptions}
      />
    </>
  );
}
