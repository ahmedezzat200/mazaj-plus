import { Leaf, AlertTriangle, User, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/button';
import { Link } from 'react-router';

export function NoSafeRecommendationCard() {
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
                  <h4 className="font-semibold text-foreground mb-1">Unable to Provide Safe Recommendation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your current health profile and the information provided, 
                    I cannot generate a safe food recommendation at this time. 
                    This is to ensure your wellbeing and safety.
                  </p>
                </div>
              </div>
              
              <div className="bg-card rounded-lg p-4 mb-4 border border-border">
                <p className="text-xs text-muted-foreground mb-2">You can try:</p>
                <ul className="space-y-1.5 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Updating your health profile with current information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Asking a different nutrition question
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Consulting with a healthcare professional
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
