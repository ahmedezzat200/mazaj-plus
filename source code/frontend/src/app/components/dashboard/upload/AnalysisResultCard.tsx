import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Sparkles, RefreshCw, Flame, Beef, Droplet, Wheat } from 'lucide-react';
import { NutritionAnalysis } from './FoodImageAnalysisPage';

interface AnalysisResultCardProps {
  result: NutritionAnalysis;
  onAnalyzeAnother: () => void;
}

export function AnalysisResultCard({ result, onAnalyzeAnother }: AnalysisResultCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
      <CardHeader className="border-b border-primary/10 bg-card/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Analysis Result</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-secondary/20 text-secondary">
            Database Values
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Recognized food */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Recognized Food</p>
          <h3 className="text-2xl font-semibold text-foreground mb-2">{result.foodName}</h3>
          <p className="text-xs text-muted-foreground italic">{result.servingNote}</p>
        </div>

        {/* Nutrition blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Calories</p>
            <p className="text-2xl font-semibold text-foreground">{result.calories}</p>
            <p className="text-xs text-muted-foreground">kcal</p>
          </div>

          {/* Protein */}
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Beef className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Protein</p>
            <p className="text-2xl font-semibold text-foreground">{result.protein}</p>
            <p className="text-xs text-muted-foreground">g</p>
          </div>

          {/* Fat */}
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-secondary/10 flex items-center justify-center">
              <Droplet className="h-5 w-5 text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Fat</p>
            <p className="text-2xl font-semibold text-foreground">{result.fat}</p>
            <p className="text-xs text-muted-foreground">g</p>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
              <Wheat className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Carbs</p>
            <p className="text-2xl font-semibold text-foreground">{result.carbs}</p>
            <p className="text-xs text-muted-foreground">g</p>
          </div>
        </div>

        {/* Source explanation */}
        <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-medium text-foreground">Data Source:</span> Mazaj+ Internal Database
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mazaj+ identified the food from your image and matched it to stored nutrition data. 
            Values are retrieved from the backend database and remain advisory only.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Actions</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onAnalyzeAnother} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Analyze Another Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
