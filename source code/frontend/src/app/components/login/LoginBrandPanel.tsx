export function LoginBrandPanel() {
  const trustPoints = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Profile-aware guidance",
      description: "Your preferences and history stay with you"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Secure account-based access",
      description: "Your data is protected and private"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Tier-based features in one place",
      description: "Access everything your plan includes"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-2xl p-8 lg:p-12 h-full flex flex-col justify-center">
      <h1 className="text-3xl lg:text-4xl font-semibold text-foreground mb-6 leading-tight">
        Welcome back to your nutrition space
      </h1>
      <p className="text-muted-foreground mb-10 leading-relaxed">
        Access your personalized nutrition guidance, meal plans, and progress tracking all in one secure place.
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
