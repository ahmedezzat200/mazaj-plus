export function BrandPanel() {
  const trustPoints = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Profile-based continuity",
      description: "Your preferences stay with you"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Safer nutrition guidance",
      description: "Checks for allergies and conditions"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Tier-based access",
      description: "Unlock advanced features as you grow"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl p-8 lg:p-12 h-full flex flex-col justify-center">
      <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-6 leading-tight">
        Create your Mazaj+ account
      </h1>
      <p className="text-muted-foreground mb-10 leading-relaxed">
        Join our platform for personalized, rule-based nutrition guidance that understands your unique profile and needs.
      </p>

      <div className="space-y-6">
        {trustPoints.map((point, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {point.icon}
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">{point.title}</h3>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
