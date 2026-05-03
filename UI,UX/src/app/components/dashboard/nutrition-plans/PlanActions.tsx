import { Button } from '../../ui/button';
import { Download, MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router';

export function PlanActions() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-3">Plan Actions</p>
      
      <div className="flex flex-wrap gap-3">
        {/* Primary action: Save as PDF/Print */}
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Save as PDF / Print Plan
        </Button>

        {/* Secondary action: Ask for Adjustments */}
        <Button asChild variant="outline" className="gap-2">
          <Link to="/dashboard/nutrition-plans">
            <MessageSquare className="h-4 w-4" />
            Ask for Adjustments
          </Link>
        </Button>

        {/* Text action: Generate New Plan */}
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/dashboard/nutrition-plans">
            <Plus className="h-4 w-4" />
            Generate New Plan
          </Link>
        </Button>
      </div>
    </div>
  );
}
