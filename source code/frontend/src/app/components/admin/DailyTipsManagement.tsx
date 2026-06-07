import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Edit, Trash2, Lightbulb, Plus } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { EditTipModal } from './EditTipModal';
import { adminApi, AdminTip } from '../../../lib/api';
import { toast } from 'sonner';

interface DailyTipsManagementProps {
  onAddTip: () => void;
  refreshKey?: number;
}

export function DailyTipsManagement({ onAddTip, refreshKey }: DailyTipsManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tips, setTips] = useState<AdminTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTip, setEditTip] = useState<AdminTip | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tipToDelete, setTipToDelete] = useState<AdminTip | null>(null);

  const fetchTips = useCallback(async () => {
    setLoading(true);
    const result = await adminApi.getTips();
    if (result.ok && result.data) {
      setTips(result.data.tips ?? []);
    } else {
      toast.error(result.error?.message || 'Failed to load tips');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTips(); }, [fetchTips, refreshKey]);

  const handleConfirmDelete = async () => {
    if (!tipToDelete) return;
    const result = await adminApi.deleteTip(Number(tipToDelete.id));
    if (result.ok) {
      toast.success('Daily tip deleted successfully');
      fetchTips();
    } else {
      toast.error(result.error?.message || 'Failed to delete tip');
    }
    setDeleteDialogOpen(false);
    setTipToDelete(null);
  };

  const filteredTips = tips.filter((tip) => {
    const matchesSearch = tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    const status = tip.is_active ? 'Active' : 'Inactive';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Tip Content</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading tips...
                  </TableCell>
                </TableRow>
              ) : filteredTips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Lightbulb className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h4 className="mb-2">No Tips Found</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery ? 'No tips match your search criteria' : 'Get started by adding your first daily tip'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={onAddTip}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Tip
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTips.map((tip) => (
                  <TableRow key={tip.id}>
                    <TableCell className="font-medium max-w-md">
                      <p className="truncate">{tip.content}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tip.display_order ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tip.is_active ? 'default' : 'secondary'}>
                        {tip.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditTip(tip)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setTipToDelete(tip); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <EditTipModal tip={editTip as any} isOpen={!!editTip} onClose={() => setEditTip(null)} onUpdated={fetchTips} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Daily Tip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Tip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
