
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, Loader2, Lock, AlertCircle, RefreshCw, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { AlternativeResult } from './AlternativesPage';
import { AlternativeResultCard } from './AlternativeResultCard';

interface HealthyAlternativesSectionProps {
  onSearch: (food: string) => void;
  currentAlternative: AlternativeResult | null;
  noResultFound: boolean;
  isLimitReached: boolean;
  isSearching?: boolean;
  onClearResult: () => void;
}

const quickExamples = ['Soda', 'Cola', 'Chocolate', 'Fries', 'Burger'];

export function HealthyAlternativesSection({
  onSearch,
  currentAlternative,
  noResultFound,
  isLimitReached,
  isSearching,
  onClearResult,
}: HealthyAlternativesSectionProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    if (searchInput.trim() && !isLimitReached) {
      onSearch(searchInput.trim());
      setSearchInput('');
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
            Enter a food you'd like to replace and we'll suggest a healthier option based on your profile.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a food (e.g., Soda, Pizza, Fries)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLimitReached || isSearching}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchInput.trim() || isLimitReached || isSearching}>
              {isSearching ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Searching...</>
              ) : (
                <><Search className="h-4 w-4 mr-2" />Search</>
              )}
            </Button>
          </div>
          {!currentAlternative && !noResultFound && !isLimitReached && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {quickExamples.map((example) => (
                  <Button key={example} variant="outline" size="sm" onClick={() => onSearch(example)} className="rounded-full" disabled={isSearching}>
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLimitReached && (
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Daily Alternative Limit Reached</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You've reached your daily limit on the Free tier. Upgrade for unlimited searches.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link to="/dashboard/subscription">See Upgrade Options <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentAlternative && !isLimitReached && (
        <AlternativeResultCard result={currentAlternative} onTryAnother={onClearResult} />
      )}

      {noResultFound && !isLimitReached && (
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">No Suitable Alternative Found</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We couldn't find a safe alternative for this food. Try a different food or ask in chat.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onClearResult}>
                <RefreshCw className="h-4 w-4 mr-2" />Try a Different Food
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard/chat"><MessageSquare className="h-4 w-4 mr-2" />Ask in Chat</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
