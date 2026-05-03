interface ConfirmationProps {
  data: {
    age: string;
    gender: string;
    height: string;
    weight: string;
    conditions: string[];
    allergies: string[];
    goal: string;
  };
  onEdit: (step: number) => void;
}

export function Confirmation({ data, onEdit }: ConfirmationProps) {
  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer-not-to-say': 'Prefer not to say'
    };
    return labels[gender] || gender;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      'weight-loss': 'Weight Loss',
      'weight-maintenance': 'Weight Maintenance',
      'weight-gain': 'Weight Gain'
    };
    return labels[goal] || goal;
  };

  const sections = [
    {
      title: 'Personal Information',
      step: 1,
      items: [
        { label: 'Age', value: `${data.age} years` },
        { label: 'Gender', value: getGenderLabel(data.gender) }
      ]
    },
    {
      title: 'Body Measurements',
      step: 2,
      items: [
        { label: 'Height', value: `${data.height} cm` },
        { label: 'Weight', value: `${data.weight} kg` }
      ]
    },
    {
      title: 'Health Conditions',
      step: 3,
      items: [
        {
          label: 'Conditions',
          value: data.conditions.length === 0 || data.conditions.includes('None')
            ? 'None'
            : data.conditions.join(', ')
        }
      ]
    },
    {
      title: 'Food Allergies',
      step: 4,
      items: [
        {
          label: 'Allergies',
          value: data.allergies.length === 0 || data.allergies.includes('None')
            ? 'None'
            : data.allergies.join(', ')
        }
      ]
    },
    {
      title: 'Nutrition Goal',
      step: 5,
      items: [
        { label: 'Goal', value: getGoalLabel(data.goal) }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Confirm Your Profile</h2>
        <p className="text-sm text-muted-foreground">
          Review your information before completing the setup. You can edit any section if needed.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-medium text-foreground">{section.title}</h3>
              <button
                type="button"
                onClick={() => onEdit(section.step)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="text-foreground font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Your data is secure</p>
            <p className="text-xs text-muted-foreground">
              This information is used for advisory nutrition guidance only. Mazaj+ does not diagnose medical conditions or replace healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
