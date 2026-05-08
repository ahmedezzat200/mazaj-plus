interface FoodAllergiesProps {
  data: {
    allergies: string[];
  };
  options?: string[];
  onChange: (field: string, value: string[]) => void;
}

export function FoodAllergies({ data, options, onChange }: FoodAllergiesProps) {
  const commonAllergies = ['None', ...(options || [])];

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      onChange('allergies', data.allergies.includes('None') ? [] : ['None']);
    } else {
      const newAllergies = data.allergies.includes(allergy)
        ? data.allergies.filter((a) => a !== allergy)
        : [...data.allergies.filter((a) => a !== 'None'), allergy];
      onChange('allergies', newAllergies);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Food Allergies</h2>
        <p className="text-sm text-muted-foreground">
          Select any food allergies or intolerances you have. This helps us filter out unsafe food options from our recommendations.
        </p>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-foreground">
            All food recommendations will be checked against your allergen list to ensure safety.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Select all that apply
        </label>
        <div className="grid grid-cols-2 gap-3">
          {commonAllergies.map((allergy) => {
            const isSelected = data.allergies.includes(allergy);
            const isNone = allergy === 'None';

            return (
              <button
                key={allergy}
                type="button"
                onClick={() => toggleAllergy(allergy)}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                  isSelected
                    ? isNone
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-destructive bg-destructive/5 text-destructive'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? isNone
                        ? 'border-primary bg-primary'
                        : 'border-destructive bg-destructive'
                      : 'border-border'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {allergy}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {data.allergies.length > 0 && !data.allergies.includes('None') && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Allergen list:</strong> {data.allergies.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
