import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UserData } from '../DashboardLayout';
import { User, ShieldCheck, Activity, Info } from 'lucide-react';

interface PlanSupportPanelProps {
  userData: UserData;
}

export function PlanSupportPanel({ userData }: PlanSupportPanelProps) {
  // Mock profile data
  const profileData = {
    age: 28,
    gender: 'Female',
    height: '165 cm',
    weight: '66 kg',
    bmi: 24.2,
    goal: 'Balanced nutrition',
    allergies: ['Shellfish'],
    conditions: ['None'],
  };

  return (
    <aside className="hidden lg:block w-80 border-l border-border bg-card overflow-y-auto">
      <div className="p-6 space-y-4">
        {/* Profile Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Profile Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Age</span>
                <span className="text-foreground font-medium">{profileData.age}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gender</span>
                <span className="text-foreground font-medium">{profileData.gender}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Height</span>
                <span className="text-foreground font-medium">{profileData.height}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weight</span>
                <span className="text-foreground font-medium">{profileData.weight}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">BMI</span>
                <span className="text-foreground font-medium">{profileData.bmi}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Inputs */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm">Safety Inputs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Allergies</p>
              <div className="flex flex-wrap gap-1">
                {profileData.allergies.map((allergy) => (
                  <Badge key={allergy} variant="outline" className="text-xs border-accent/30">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Health Conditions</p>
              <div className="flex flex-wrap gap-1">
                {profileData.conditions.map((condition) => (
                  <Badge key={condition} variant="outline" className="text-xs border-accent/30">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* InBody Status */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">InBody Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              No InBody scan uploaded yet. Upload your InBody results for more accurate plan generation.
            </p>
          </CardContent>
        </Card>

        {/* Transparency Card */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-secondary" />
              <CardTitle className="text-sm">How Plans Are Created</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plans are generated using your stored health profile, BMI calculations, dietary preferences, 
              goal settings, and rule-based safety filters to ensure recommendations align with your wellbeing.
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
