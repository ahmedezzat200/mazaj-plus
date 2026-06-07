import { Link } from 'react-router';

export function Pricing() {
  const plans = [
    {
      name: "Free",
      priceEGP: "0",
      period: "forever",
      description: "Perfect for getting started with nutrition guidance",
      features: [
        "Chat-based nutrition guidance",
        "Personalized nutrition plans",
        "Hydration tracking & reminders",
        "Daily nutrition tips",
        "Healthy alternatives"
      ],
      cta: "Get Started Free",
      highlighted: false
    },
    {
      name: "Pro",
      priceEGP: "300",
      period: "per month",
      description: "Enhanced features for deeper insights",
      features: [
        "All Free features",
        "Food image analysis",
        "InBody upload & tracking",
        "Advanced meal planning",
        "Priority chat support",
        "Custom recipe suggestions"
      ],
      cta: "Start Pro",
      highlighted: true
    },
    {
      name: "Ultra",
      priceEGP: "500",
      period: "per month",
      description: "Complete nutrition decision support",
      features: [
        "All Pro features",
        "Weekly progress reports",
        "Full chat history access",
        "Advanced analytics & insights",
        "Goal tracking & milestones",
        "Export data anytime"
      ],
      cta: "Start Ultra",
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your nutrition journey grows
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-card rounded-2xl p-8 border ${plan.highlighted ? "border-primary shadow-xl ring-2 ring-primary/20 scale-105" : "border-border shadow-sm"}`}>
              {plan.highlighted && (
                <div className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full mb-4">Most Popular</div>
              )}
              <h3 className="text-2xl font-semibold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-1">
                {plan.priceEGP === '0' ? (
                  <span className="text-4xl font-semibold text-foreground">Free</span>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold text-foreground">{plan.priceEGP}</span>
                      <span className="text-muted-foreground">EGP / {plan.period.replace('per ', '')}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6 mt-3">{plan.description}</p>

              <Link
                to="/register"
                className={`w-full py-3 rounded-lg font-medium transition-all mb-6 block text-center ${plan.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" : "bg-muted text-foreground hover:bg-muted/70"}`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/register" className="text-primary hover:underline font-medium">
            Create your free account →
          </Link>
        </div>
      </div>
    </section>
  );
}
