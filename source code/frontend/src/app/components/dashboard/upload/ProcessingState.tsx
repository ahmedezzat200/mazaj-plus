import { Card, CardContent } from '../../ui/card';
import { Loader2, Upload, Search, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

const processingSteps = [
  { icon: Upload, label: 'Uploading image', delay: 0 },
  { icon: Search, label: 'Identifying food', delay: 1000 },
  { icon: Database, label: 'Looking up nutrition values', delay: 2000 },
];

export function ProcessingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < processingSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, processingSteps[currentStep + 1].delay - processingSteps[currentStep].delay);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
      <CardContent className="p-8">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Analyzing Your Image
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your food image...
            </p>
          </div>

          {/* Processing steps */}
          <div className="space-y-3 max-w-md mx-auto">
            {processingSteps.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 transition-all ${
                    isPending ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted'
                    }`}
                  >
                    {isComplete ? (
                      <step.icon className="h-4 w-4" />
                    ) : isCurrent ? (
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                    ) : (
                      <step.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
