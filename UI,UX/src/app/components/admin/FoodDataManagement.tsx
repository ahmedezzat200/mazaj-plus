import { useState } from 'react';
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

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  category: string;
  moodTag: string;
  dataSource: string;
  status: 'Active' | 'Inactive';
}

const mockFoodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
    category: 'Protein',
    moodTag: 'Energizing',
    dataSource: 'USDA',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Steamed Broccoli',
    calories: 55,
    protein: 3.7,
    fat: 0.6,
    carbs: 11,
    category: 'Vegetables',
    moodTag: 'Refreshing',
    dataSource: 'USDA',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Greek Yogurt',
    calories: 100,
    protein: 17,
    fat: 0.7,
    carbs: 6,
    category: 'Dairy',
    moodTag: 'Comforting',
    dataSource: 'Manual',
    status: 'Active',
  },
  {
    id: '4',
    name: 'Quinoa',
    calories: 222,
    protein: 8,
    fat: 3.6,
    carbs: 39,
    category: 'Grains',
    moodTag: 'Satisfying',
    dataSource: 'USDA',
    status: 'Active',
  },
];

export function FoodDataManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [foodItems] = useState<FoodItem[]>(mockFoodItems);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);

  const filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Card className="p-6">
        {/* Search and Filters */}
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

        {/* Food Items Table */}
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
                <TableHead>Mood Tag</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No food items found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.calories}</TableCell>
                    <TableCell>{item.protein}</TableCell>
                    <TableCell>{item.fat}</TableCell>
                    <TableCell>{item.carbs}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.moodTag}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.dataSource}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditItem(item)}
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

      {/* Edit Food Item Modal */}
      <EditFoodItemModal
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </>
  );
}
