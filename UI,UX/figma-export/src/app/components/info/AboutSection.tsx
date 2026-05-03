import { MessageSquare, Brain, User, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';

const features = [
  {
    icon: MessageSquare,
    title: 'Chat-Driven',
    description: 'Natural conversation interface for easy food and nutrition guidance',
  },
  {
    icon: Brain,
    title: 'Rule-Based',
    description: 'Structured decision support powered by nutrition science principles',
  },
  {
    icon: User,
    title: 'Profile-Aware',
    description: 'Personalized recommendations based on your goals and preferences',
  },
  {
    icon: Sparkles,
    title: 'Web-Based',
    description: 'Access anywhere, anytime—no installation required',
  },
];

export function AboutSection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-3">About Mazaj+</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Mazaj+ is a web-based nutrition decision-support platform designed to help you make
          informed food choices through personalized, chat-driven guidance.
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-6 border border-border">
        <h3 className="mb-3">Our Approach</h3>
        <div className="space-y-3 text-muted-foreground">
          <p>
            Mazaj+ combines the accessibility of conversational interfaces with structured,
            rule-based nutrition guidance. Our platform adapts to your unique profile—including
            your goals, dietary preferences, and health considerations—to provide relevant,
            actionable support for everyday wellness decisions.
          </p>
          <p>
            Whether you are seeking meal recommendations, exploring healthier alternatives, or
            tracking your nutrition journey, Mazaj+ offers tiered features designed to meet you
            where you are.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="mb-3">Our Mission</h3>
        <p className="text-muted-foreground">
          We believe that everyone deserves access to clear, personalized nutrition guidance.
          Mazaj+ is built to support your wellness journey with trustworthy information,
          practical tools, and a calm, user-friendly experience—always emphasizing that our
          platform complements, but does not replace, professional healthcare advice.
        </p>
      </div>
    </div>
  );
}
