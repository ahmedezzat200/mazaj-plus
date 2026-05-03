interface NutritionGoalProps {
  data: {
    goal: string;
  };
  errors: {
    goal?: string;
  };
  onChange: (field: string, value: string) => void;
  touched: {
    goal: boolean;
  };
}

export function NutritionGoal({ data, errors, onChange, touched }: NutritionGoalProps) {
  const goals = [
    {
      value: 'weight-loss',
      title: 'Weight Loss',
      description: 'Create a caloric deficit with balanced nutrition',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    },
    {
      value: 'weight-maintenance',
      title: 'Weight Maintenance',
      description: 'Maintain current weight with balanced nutrition',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      value: 'weight-gain',
      title: 'Weight Gain',
      description: 'Build muscle and increase weight healthily',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Nutrition Goal</h2>
        <p className="text-sm text-muted-foreground">
          Choose your primary nutrition goal. This helps us tailor calorie recommendations and meal plans to your objectives.
        </p>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => onChange('goal', goal.value)}
            className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
              data.goal === goal.value
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                data.goal === goal.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {goal.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-medium mb-1 ${
                  data.goal === goal.value ? 'text-primary' : 'text-foreground'
                }`}>
                  {goal.title}
                </h3>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                data.goal === goal.value
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}>
                {data.goal === goal.value && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {touched.goal && errors.goal && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errors.goal}
        </p>
      )}
    </div>
  );
}
