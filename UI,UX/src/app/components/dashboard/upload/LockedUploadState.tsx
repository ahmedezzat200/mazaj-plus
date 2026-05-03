import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Lock, ArrowRight, LayoutDashboard, Upload } from 'lucide-react';
import { Link } from 'react-router';

export function LockedUploadState() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="relative overflow-hidden">
        <CardContent className="p-8">
          {/* Blurred background effect */}
          <div className="absolute inset-0 bg-muted/40 backdrop-blur-sm z-10"></div>

          {/* Content */}
          <div className="relative z-20 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <Lock className="h-10 w-10 text-accent" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Food Image Analysis
              </h2>
              <p className="text-lg text-muted-foreground">
                Available on Pro and Ultra
              </p>
            </div>

            <div className="bg-card/80 rounded-xl p-6 border border-border max-w-lg mx-auto">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                Upload food images to get instant nutrition estimates including calories, protein, and fat. 
                Upgrade to Pro or Ultra to unlock this feature and more.
              </p>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Pro and Ultra features include:</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground text-left">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span>Food image recognition and nutrition analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span>InBody scan upload and analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span>Unlimited healthy alternative searches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <span>Advanced tracking and reporting</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/dashboard/subscription">
                  See Upgrade Options
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative blurred upload icon in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Upload className="h-64 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
