import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Edit, Power, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../ui/table';
import { adminApi } from '../../../lib/api';
import type { AdminFoodItem, AdminHealthyAlternative } from '../../../lib/api';

interface FormState {
  original_food_name: string;
  alternative_food: number | '';
  reason: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  original_food_name: '',
  alternative_food: '',
  reason: '',
  is_active: true,
};

export function AlternativesManagement() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AdminHealthyAlternative[]>([]);
  const [foods, setFoods] = useState<AdminFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminHealthyAlternative | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [altRes, foodRes] = await Promise.all([
      adminApi.getAlternatives(),
      adminApi.getFoods(),
    ]);
    if (altRes.ok && altRes.data) setItems(altRes.data.alternatives ?? []);
    else toast.error(altRes.error?.message ?? 'Could not load alternatives.');
    if (foodRes.ok && foodRes.data) setFoods((foodRes.data.foods ?? []).filter((f) => f.is_active));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(alt: AdminHealthyAlternative) {
    setEditing(alt);
    setForm({
      original_food_name: alt.original_food_name,
      alternative_food: alt.alternative_food?.id ?? '',
      reason: alt.reason ?? '',
      is_active: alt.is_active,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.original_food_name.trim() || !form.alternative_food || !form.reason.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    const payload = {
      original_food_name: form.original_food_name.trim(),
      alternative_food: Number(form.alternative_food),
      reason: form.reason.trim(),
      is_active: form.is_active,
    };
    const res = editing
      ? await adminApi.editAlternative(editing.id, payload)
      : await adminApi.addAlternative(payload);
    setSubmitting(false);
    if (res.ok) {
      toast.success(editing ? 'Alternative updated.' : 'Alternative added.');
      setModalOpen(false);
      refresh();
    } else {
      toast.error(res.error?.message ?? 'Save failed.');
    }
  }

  async function toggleActive(alt: AdminHealthyAlternative) {
    const res = await adminApi.toggleAlternativeStatus(alt.id);
    if (res.ok) {
      toast.success(`${alt.original_food_name} ${alt.is_active ? 'deactivated' : 'activated'}`);
      refresh();
    } else {
      toast.error(res.error?.message ?? 'Could not update status.');
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.original_food_name.toLowerCase().includes(q) ||
        (a.alternative_food?.name ?? '').toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by original food, alternative, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add alternative
          </Button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Original food</TableHead>
                <TableHead>Healthier alternative</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No alternatives found.</TableCell></TableRow>
              ) : (
                filtered.map((alt) => (
                  <TableRow key={alt.id}>
                    <TableCell className="font-medium">{alt.original_food_name}</TableCell>
                    <TableCell>{alt.alternative_food?.name ?? '—'}</TableCell>
                    <TableCell className="max-w-md truncate">{alt.reason}</TableCell>
                    <TableCell>
                      <Badge variant={alt.is_active ? 'default' : 'secondary'}>
                        {alt.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(alt)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(alt)}
                          title={alt.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className={`h-4 w-4 ${alt.is_active ? 'text-destructive' : 'text-primary'}`} />
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit alternative' : 'Add alternative'}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Map a food users commonly search for to a healthier in-database option.
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="original">Original food *</Label>
              <Input
                id="original"
                placeholder="e.g., white bread"
                value={form.original_food_name}
                onChange={(e) => setForm((p) => ({ ...p, original_food_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Alternative *</Label>
              <Select
                value={form.alternative_food === '' ? '' : String(form.alternative_food)}
                onValueChange={(v) => setForm((p) => ({ ...p, alternative_food: Number(v) }))}
              >
                <SelectTrigger id="alt">
                  <SelectValue placeholder="Choose a food from the database" />
                </SelectTrigger>
                <SelectContent>
                  {foods.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Higher fiber, lower glycemic load"
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editing ? 'Save changes' : 'Add alternative'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
