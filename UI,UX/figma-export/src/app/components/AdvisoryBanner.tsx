export function AdvisoryBanner() {
  return (
    <div className="bg-accent/15 border-y border-accent/40 py-4">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-foreground">
            <strong>Advisory Notice:</strong> Mazaj+ provides nutrition guidance for informational purposes only. It does not diagnose medical conditions, prescribe treatment, or replace the advice of qualified healthcare professionals. Always consult your doctor before making significant dietary changes.
          </p>
        </div>
      </div>
    </div>
  );
}
