import { Leaf, AlertTriangle, User, LayoutDashboard, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router';

export function NoSafePlanCard() {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="bg-accent/10 border border-accent/20 rounded-2xl rounded-tl-sm px-5 py-5 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Unable to Generate Safe Plan</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your current health profile and safety rules, I cannot generate a safe nutrition plan at this time. 
                    This ensures your wellbeing and safety are prioritized.
                  </p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2">Recommended actions:</p>
                <ul className="space-y-1.5 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Update your health profile with accurate information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Review your dietary preferences and restrictions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Consult with a healthcare professional for personalized guidance
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/profile">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ask a Different Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
