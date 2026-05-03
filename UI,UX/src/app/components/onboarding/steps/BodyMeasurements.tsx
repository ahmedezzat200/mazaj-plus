interface BodyMeasurementsProps {
  data: {
    height: string;
    weight: string;
  };
  errors: {
    height?: string;
    weight?: string;
  };
  onChange: (field: string, value: string) => void;
  onBlur: (field: string) => void;
  touched: {
    height: boolean;
    weight: boolean;
  };
}

export function BodyMeasurements({ data, errors, onChange, onBlur, touched }: BodyMeasurementsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Body Measurements</h2>
        <p className="text-sm text-muted-foreground">
          Your measurements help us calculate personalized nutrition recommendations and daily intake goals.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-foreground mb-2">
            Height (cm)
          </label>
          <div className="relative">
            <input
              id="height"
              type="number"
              min="50"
              max="300"
              step="0.1"
              value={data.height}
              onChange={(e) => onChange('height', e.target.value)}
              onBlur={() => onBlur('height')}
              className={`w-full px-4 py-3 bg-input-background border rounded-lg transition-all outline-none ${
                touched.height && errors.height
                  ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
              placeholder="170"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              cm
            </span>
          </div>
          {touched.height && errors.height && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.height}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-2">
            Weight (kg)
          </label>
          <div className="relative">
            <input
              id="weight"
              type="number"
              min="20"
              max="500"
              step="0.1"
              value={data.weight}
              onChange={(e) => onChange('weight', e.target.value)}
              onBlur={() => onBlur('weight')}
              className={`w-full px-4 py-3 bg-input-background border rounded-lg transition-all outline-none ${
                touched.weight && errors.weight
                  ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
              placeholder="70"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              kg
            </span>
          </div>
          {touched.weight && errors.weight && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.weight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
