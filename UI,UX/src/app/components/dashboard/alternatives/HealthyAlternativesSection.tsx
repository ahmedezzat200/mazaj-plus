import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { AlternativeResult } from './AlternativesPage';
import { AlternativeResultCard } from './AlternativeResultCard';
import { NoAlternativeCard } from './NoAlternativeCard';
import { AlternativeLimitCard } from './AlternativeLimitCard';

interface HealthyAlternativesSectionProps {
  onSearch: (food: string) => void;
  currentAlternative: AlternativeResult | null;
  noResultFound: boolean;
  isLimitReached: boolean;
  onClearResult: () => void;
}

const quickExamples = ['Fries', 'Sugary Snack', 'Soft Drink', 'Fast Food Meal'];

export function HealthyAlternativesSection({
  onSearch,
  currentAlternative,
  noResultFound,
  isLimitReached,
  onClearResult,
}: HealthyAlternativesSectionProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (searchInput.trim() && !isLimitReached) {
      onSearch(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleQuickExample = (example: string) => {
    if (!isLimitReached) {
      onSearch(example);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find a Healthier Alternative
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Enter a food you'd like to replace, and we'll suggest a healthier option based on your profile and preferences.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter a food (e.g., Fries, Pizza, Soda)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLimitReached}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={!searchInput.trim() || isLimitReached}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick examples */}
          {!currentAlternative && !noResultFound && !isLimitReached && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {quickExamples.map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickExample(example)}
                    className="rounded-full"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result states */}
      {isLimitReached && <AlternativeLimitCard />}
      {currentAlternative && !isLimitReached && (
        <AlternativeResultCard 
          result={currentAlternative} 
          onTryAnother={onClearResult}
        />
      )}
      {noResultFound && !isLimitReached && (
        <NoAlternativeCard onTryDifferent={onClearResult} />
      )}
    </div>
  );
}
