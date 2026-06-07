import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { subscriptionApi, uploadsApi } from '../../../lib/api';
import type { FoodImageUploadSuccess } from '../../../lib/api';
import { UpgradePanel } from './UpgradePanel';
import type { UserTier } from './DashboardLayout';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

type UploadState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'success'; result: FoodImageUploadSuccess }
  | { kind: 'error'; code: string; message: string };

function tierFromBackend(tier: string): UserTier {
  if (tier === 'PRO') return 'Pro';
  if (tier === 'ULTRA') return 'Ultra';
  return 'Free';
}

export function FoodImageAnalysisPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tier, setTier] = useState<UserTier>('Free');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<UploadState>({ kind: 'idle' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sub = await subscriptionApi.getMe();
      if (cancelled) return;
      if (sub.ok && sub.data) {
        setAllowed(Boolean(sub.data.features?.food_image_upload));
        setTier(tierFromBackend(sub.data.tier));
      } else {
        setAllowed(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(next: File | null) {
    setState({ kind: 'idle' });
    if (!next) { setFile(null); return; }
    if (!ACCEPTED_TYPES.includes(next.type)) {
      toast.error('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (next.size > MAX_BYTES) {
      toast.error('Image is larger than 10MB.');
      return;
    }
    setFile(next);
  }

  async function handleUpload() {
    if (!file) return;
    setState({ kind: 'pending' });
    const result = await uploadsApi.uploadFoodImage(file);
    if (result.ok && result.data) {
      setState({ kind: 'success', result: result.data });
      toast.success(`Identified: ${result.data.recognized_food}`);
      return;
    }
    const code = result.error?.code ?? 'UNKNOWN';
    const message = result.error?.message ?? 'Could not analyze the image.';
    setState({ kind: 'error', code, message });
    toast.error(message);
  }

  function reset() {
    setFile(null);
    setState({ kind: 'idle' });
  }

  if (allowed === null) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Food Image Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Snap a photo of your meal — Mazaj+ will identify the food and surface its nutrition values from the curated database.
          </p>
        </div>
        <UpgradePanel currentTier={tier} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Food Image Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Upload a clear photo of a single food item. Nutrition data is retrieved from the Mazaj+ database — values are advisory.
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Upload an image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewUrl && (
            <label
              htmlFor="food-image-input"
              className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-accent/5 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Click to choose an image</p>
                <p className="text-sm text-muted-foreground">JPG, PNG, or WebP — up to 10MB</p>
              </div>
              <input
                id="food-image-input"
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}

          {previewUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-xl overflow-hidden border border-border"
            >
              <img src={previewUrl} alt="preview" className="w-full max-h-80 object-contain bg-black/5" />
              <button
                aria-label="Remove image"
                onClick={reset}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={reset} disabled={!file || state.kind === 'pending'}>
              Reset
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || state.kind === 'pending'}
              className="min-w-[140px]"
            >
              {state.kind === 'pending' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</>
              ) : (
                <>Analyze image</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {state.kind === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  We identified: {state.result.recognized_food}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{state.result.matched_food.name}</h3>
                  <p className="text-sm text-muted-foreground">Source: {state.result.source}</p>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mt-2">Nutrition reference per 100 g:</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Calories', value: state.result.matched_food.calories, unit: 'kcal' },
                    { label: 'Protein', value: state.result.matched_food.protein, unit: 'g' },
                    { label: 'Carbs', value: state.result.matched_food.carbs, unit: 'g' },
                    { label: 'Fat', value: state.result.matched_food.fat, unit: 'g' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-border bg-card/60 p-3 text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.label}</p>
                      <p className="text-xl font-semibold">{m.value}<span className="text-sm font-normal text-muted-foreground ml-1">{m.unit}</span></p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">{state.result.message}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {state.kind === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  {humanizeErrorCode(state.code)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">{state.message}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function humanizeErrorCode(code: string) {
  switch (code) {
    case 'SUBSCRIPTION_REQUIRED': return 'Pro plan required';
    case 'FOOD_RECOGNITION_UNAVAILABLE': return 'Recognition is offline';
    case 'NO_FOOD_DETECTED': return 'No food detected';
    case 'NO_DATABASE_MATCH': return 'No database match';
    case 'VALIDATION_ERROR': return 'Invalid file';
    default: return 'Upload failed';
  }
}
