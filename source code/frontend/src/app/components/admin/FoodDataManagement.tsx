import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Edit, Power, Eye } from 'lucide-react';
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
import { EditFoodItemModal } from './EditFoodItemModal';
import { adminApi, AdminFoodItem } from '../../../lib/api';
import { toast } from 'sonner';

export function FoodDataManagement({ refreshKey }: { refreshKey?: number }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [foodItems, setFoodItems] = useState<AdminFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<AdminFoodItem | null>(null);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    const result = await adminApi.getFoods();
    if (result.ok && result.data) {
      setFoodItems(result.data.foods ?? []);
    } else {
      toast.error(result.error?.message || 'Failed to load food items');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFoods(); }, [fetchFoods, refreshKey]);

  const handleToggleStatus = async (item: AdminFoodItem) => {
    const result = await adminApi.editFood(Number(item.id), { is_active: !item.is_active });
    if (result.ok) {
      toast.success(`${item.name} ${item.is_active ? 'deactivated' : 'activated'}`);
      fetchFoods();
    } else {
      toast.error(result.error?.message || 'Failed to update status');
    }
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Protein">Protein</SelectItem>
              <SelectItem value="Vegetables">Vegetables</SelectItem>
              <SelectItem value="Dairy">Dairy</SelectItem>
              <SelectItem value="Grains">Grains</SelectItem>
              <SelectItem value="Fruits">Fruits</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Food Name</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Protein (g)</TableHead>
                <TableHead>Fat (g)</TableHead>
                <TableHead>Carbs (g)</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Loading food items...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No food items found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.calories}</TableCell>
                    <TableCell>{item.protein_g}</TableCell>
                    <TableCell>{item.fat_g}</TableCell>
                    <TableCell>{item.carbs_g}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.data_source}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={item.is_active ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleStatus(item)}
                        >
                          <Power className={`h-4 w-4 ${item.is_active ? 'text-destructive' : 'text-primary'}`} />
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

      <EditFoodItemModal
        item={editItem as any}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onUpdated={fetchFoods}
      />
    </>
  );
}
