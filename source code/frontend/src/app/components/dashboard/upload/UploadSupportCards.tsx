import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Info, Crown, History } from 'lucide-react';
import { UserData } from '../DashboardLayout';
import { UploadState } from './FoodImageAnalysisPage';

interface UploadSupportCardsProps {
  userData: UserData;
  uploadState: UploadState;
}

export function UploadSupportCards({ userData, uploadState }: UploadSupportCardsProps) {
  return (
    <div className="space-y-4">
      {/* How This Works */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-secondary" />
            <CardTitle className="text-sm">How This Works</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            <span className="font-medium text-foreground">1. Upload:</span> Choose a clear image of your food
          </p>
          <p>
            <span className="font-medium text-foreground">2. Identify:</span> Our AI recognizes the food in the photo
          </p>
          <p>
            <span className="font-medium text-foreground">3. Analyze:</span> Nutrition values are retrieved from our database
          </p>
          <p>
            <span className="font-medium text-foreground">4. Review:</span> Get estimated calories, protein, and fat
          </p>
        </CardContent>
      </Card>

      {/* Tier Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Tier Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge 
            variant="secondary" 
            className={
              userData.tier === 'Ultra' 
                ? 'bg-primary text-primary-foreground'
                : userData.tier === 'Pro'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground'
            }
          >
            {userData.tier}
          </Badge>
          
          <div className="space-y-1.5 text-xs">
            {userData.tier === 'Free' && (
              <p className="text-muted-foreground">
                Upgrade to Pro or Ultra to access food image analysis and upload features.
              </p>
            )}
            
            {userData.tier === 'Pro' && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Unlimited food image uploads</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>InBody scan upload</span>
                </div>
              </>
            )}
            
            {userData.tier === 'Ultra' && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Unlimited food image uploads</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>InBody scan upload</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>Log results to daily intake</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads (placeholder) */}
      {uploadState === 'result' && (userData.tier === 'Pro' || userData.tier === 'Ultra') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Recent Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Your recent food analysis results will appear here. This feature is coming soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
