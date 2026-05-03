interface PersonalInformationProps {
  data: {
    age: string;
    gender: string;
  };
  errors: {
    age?: string;
    gender?: string;
  };
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
  touched: {
    age: boolean;
    gender: boolean;
  };
}

export function PersonalInformation({ data, errors, onChange, onBlur, touched }: PersonalInformationProps) {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          This information helps us provide profile-based nutrition guidance tailored to your needs.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
            Age
          </label>
          <input
            id="age"
            type="number"
            min="1"
            max="120"
            value={data.age}
            onChange={(e) => onChange('age', e.target.value)}
            onBlur={() => onBlur('age')}
            className={`w-full px-4 py-3 bg-input-background border rounded-lg transition-all outline-none ${
              touched.age && errors.age
                ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
            placeholder="Enter your age"
          />
          {touched.age && errors.age && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.age}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('gender', option.value)}
                className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  data.gender === option.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {touched.gender && errors.gender && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.gender}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
