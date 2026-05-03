import { Leaf, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PlanningStatusCardProps {
  processingSteps: string[];
  isProcessing: boolean;
}

export function PlanningStatusCard({ processingSteps, isProcessing }: PlanningStatusCardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isProcessing && currentStep < processingSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, processingSteps.length - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isProcessing, processingSteps.length]);

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl w-full">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Leaf className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl rounded-tl-sm px-5 py-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <p className="text-sm font-medium text-primary">Creating Your Nutrition Plan</p>
              </div>
              
              <div className="space-y-3">
                {processingSteps.map((step, index) => {
                  const isComplete = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;

                  return (
                    <div 
                      key={step} 
                      className={`flex items-center gap-3 transition-all ${
                        isPending ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isComplete 
                          ? 'bg-primary text-primary-foreground' 
                          : isCurrent 
                          ? 'bg-primary/20 border-2 border-primary' 
                          : 'bg-muted'
                      }`}>
                        {isComplete ? (
                          <Check className="h-3 w-3" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        ) : null}
                      </div>
                      <p className={`text-sm ${
                        isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
