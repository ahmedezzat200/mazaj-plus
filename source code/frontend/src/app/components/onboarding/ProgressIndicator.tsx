interface Step {
  number: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
}

export function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="bg-card rounded-2xl p-8 border border-border shadow-sm h-full">
      <h3 className="text-lg font-semibold text-foreground mb-6">Profile Setup</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.number} className="relative">
            {index < steps.length - 1 && (
              <div className={`absolute left-5 top-12 w-0.5 h-8 ${
                step.completed ? 'bg-primary' : 'bg-border'
              }`} />
            )}
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                step.completed
                  ? 'bg-primary text-primary-foreground'
                  : step.active
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <h4 className={`text-sm font-medium ${
                  step.active ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          This information helps Mazaj+ provide safer, more personalized nutrition guidance. All data is securely stored.
        </p>
      </div>
    </div>
  );
}
