import { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Lightbulb, Plus } from 'lucide-react';
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
import { toast } from 'sonner';

interface DailyTip {
  id: string;
  content: string;
  displayDate: string;
  status: 'Active' | 'Scheduled' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

const mockTips: DailyTip[] = [
  {
    id: '1',
    content: 'Start your day with a glass of water to boost hydration and metabolism.',
    displayDate: '2026-04-21',
    status: 'Scheduled',
    createdAt: '2026-04-15',
    updatedAt: '2026-04-15',
  },
  {
    id: '2',
    content: 'Include colorful vegetables in every meal for a wide range of nutrients.',
    displayDate: '2026-04-20',
    status: 'Active',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-18',
  },
  {
    id: '3',
    content: 'Choose whole grains over refined grains for sustained energy.',
    displayDate: '2026-04-19',
    status: 'Active',
    createdAt: '2026-04-08',
    updatedAt: '2026-04-08',
  },
  {
    id: '4',
    content: 'Practice mindful eating—slow down and enjoy your meals.',
    displayDate: '2026-04-18',
    status: 'Active',
    createdAt: '2026-04-05',
    updatedAt: '2026-04-12',
  },
];

interface DailyTipsManagementProps {
  onAddTip: () => void;
}

export function DailyTipsManagement({ onAddTip }: DailyTipsManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tips] = useState<DailyTip[]>(mockTips);
  const [editTip, setEditTip] = useState<DailyTip | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tipToDelete, setTipToDelete] = useState<DailyTip | null>(null);

  const filteredTips = tips.filter((tip) => {
    const matchesSearch = tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (tip: DailyTip) => {
    setTipToDelete(tip);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    toast.success('Daily tip deleted successfully');
    setDeleteDialogOpen(false);
    setTipToDelete(null);
  };

  return (
    <>
      <Card className="p-6">
        {/* Search and Filters */}
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
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tips Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Tip Content</TableHead>
                <TableHead>Display Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
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
                      {new Date(tip.displayDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tip.status === 'Active'
                            ? 'default'
                            : tip.status === 'Scheduled'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {tip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(tip.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditTip(tip)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(tip)}
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

      {/* Edit Tip Modal */}
      <EditTipModal tip={editTip} isOpen={!!editTip} onClose={() => setEditTip(null)} />

      {/* Delete Confirmation Dialog */}
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
