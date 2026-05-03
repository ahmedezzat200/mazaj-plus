export function TierPreview() {
  const tiers = [
    {
      name: "Free",
      tag: "You start here",
      features: ["Chat guidance", "Plans", "Hydration", "Daily tips"],
      highlighted: true
    },
    {
      name: "Pro",
      tag: "Upgrade anytime",
      features: ["All Free", "Image analysis", "InBody upload"],
      highlighted: false
    },
    {
      name: "Ultra",
      tag: "Full access",
      features: ["All Pro", "Tracking", "Reports", "Full history"],
      highlighted: false
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="text-sm font-medium text-foreground mb-4">Your plan options</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map((tier, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 border ${
              tier.highlighted
                ? "bg-primary/5 border-primary/30"
                : "bg-muted/30 border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-foreground">{tier.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                tier.highlighted
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tier.tag}
              </span>
            </div>
            <ul className="space-y-1.5">
              {tier.features.map((feature, fIndex) => (
                <li key={fIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                  <svg className="w-3 h-3 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
