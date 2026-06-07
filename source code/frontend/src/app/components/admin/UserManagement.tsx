import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Edit, Power } from 'lucide-react';
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
import { UserDetailDrawer } from './UserDetailDrawer';
import { EditUserTierModal } from './EditUserTierModal';
import { adminApi, AdminUser } from '../../../lib/api';
import { toast } from 'sonner';

type UIUser = AdminUser & { id: string };

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editTierUser, setEditTierUser] = useState<UIUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const result = await adminApi.getUsers();
    if (result.ok && result.data) {
      setUsers((result.data.users ?? []).map((u: AdminUser) => ({ ...u, id: String(u.id) })));
    } else {
      toast.error(result.error?.message || 'Failed to load users');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (user: UIUser) => {
    const result = await adminApi.toggleUserStatus(Number(user.id));
    if (result.ok) {
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } else {
      toast.error(result.error?.message || 'Failed to update status');
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const tier = user.tier ?? 'FREE';
    const matchesTier = tierFilter === 'all' || tier.toUpperCase() === tierFilter.toUpperCase();
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
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Ultra">Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{`${user.first_name} ${user.last_name}`.trim() || user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={toDisplayTier(user.tier) === 'Ultra' ? 'default' : 'secondary'}
                        className={toDisplayTier(user.tier) === 'Ultra' ? 'bg-primary' : ''}
                      >
                        {toDisplayTier(user.tier)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.onboarding_status === 'Completed' ? 'default' : 'secondary'}>
                        {user.onboarding_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedUser(user); setIsDetailOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTierUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.is_active ? 'Deactivate user' : 'Activate user'}
                          onClick={() => handleToggleStatus(user)}
                        >
                          <Power className={`h-4 w-4 ${user.is_active ? 'text-destructive' : 'text-primary'}`} />
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

      <UserDetailDrawer
        user={selectedUser as any}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <EditUserTierModal
        user={editTierUser as any}
        isOpen={!!editTierUser}
        onClose={() => setEditTierUser(null)}
        onUpdated={fetchUsers}
      />
    </>
  );
}
