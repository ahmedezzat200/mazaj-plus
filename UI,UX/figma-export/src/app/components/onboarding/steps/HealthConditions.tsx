interface HealthConditionsProps {
  data: {
    conditions: string[];
  };
  onChange: (field: string, value: string[]) => void;
}

export function HealthConditions({ data, onChange }: HealthConditionsProps) {
  const commonConditions = [
    'None',
    'Diabetes Type 1',
    'Diabetes Type 2',
    'Hypertension',
    'High Cholesterol',
    'Heart Disease',
    'Kidney Disease',
    'Liver Disease',
    'Thyroid Disorder',
    'PCOS',
    'Celiac Disease',
    'IBS'
  ];

  const toggleCondition = (condition: string) => {
    if (condition === 'None') {
      onChange('conditions', data.conditions.includes('None') ? [] : ['None']);
    } else {
      const newConditions = data.conditions.includes(condition)
        ? data.conditions.filter((c) => c !== condition)
        : [...data.conditions.filter((c) => c !== 'None'), condition];
      onChange('conditions', newConditions);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Health Conditions</h2>
        <p className="text-sm text-muted-foreground">
          Select any health conditions you have. This helps us avoid unsafe nutrition suggestions and provide guidance that aligns with your health needs.
        </p>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-foreground">
            This information is used for advisory guidance only. Mazaj+ does not diagnose or treat medical conditions.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Select all that apply
        </label>
        <div className="grid grid-cols-2 gap-3">
          {commonConditions.map((condition) => {
            const isSelected = data.conditions.includes(condition);
            const isNone = condition === 'None';

            return (
              <button
                key={condition}
                type="button"
                onClick={() => toggleCondition(condition)}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                  isSelected
                    ? isNone
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {condition}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {data.conditions.length > 0 && !data.conditions.includes('None') && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Selected:</strong> {data.conditions.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
