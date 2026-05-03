import { useState } from 'react';
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

interface User {
  id: string;
  name: string;
  email: string;
  tier: 'Free' | 'Pro' | 'Ultra';
  registrationDate: string;
  accountStatus: 'Active' | 'Inactive';
  onboardingStatus: 'Completed' | 'Pending';
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    tier: 'Ultra',
    registrationDate: '2026-03-15',
    accountStatus: 'Active',
    onboardingStatus: 'Completed',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    tier: 'Pro',
    registrationDate: '2026-04-02',
    accountStatus: 'Active',
    onboardingStatus: 'Completed',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    tier: 'Free',
    registrationDate: '2026-04-18',
    accountStatus: 'Active',
    onboardingStatus: 'Pending',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    tier: 'Pro',
    registrationDate: '2026-03-28',
    accountStatus: 'Active',
    onboardingStatus: 'Completed',
  },
];

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [users] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editTierUser, setEditTierUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleEditTier = (user: User) => {
    setEditTierUser(user);
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
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Pro">Pro</SelectItem>
              <SelectItem value="Ultra">Ultra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Table */}
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.tier === 'Ultra' ? 'default' : 'secondary'}
                        className={user.tier === 'Ultra' ? 'bg-primary' : ''}
                      >
                        {user.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.accountStatus === 'Active' ? 'default' : 'secondary'}>
                        {user.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.onboardingStatus === 'Completed' ? 'default' : 'secondary'}
                      >
                        {user.onboardingStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTier(user)}
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

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Edit Tier Modal */}
      <EditUserTierModal
        user={editTierUser}
        isOpen={!!editTierUser}
        onClose={() => setEditTierUser(null)}
      />
    </>
  );
}
