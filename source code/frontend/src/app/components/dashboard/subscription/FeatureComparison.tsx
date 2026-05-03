import { Check, X } from 'lucide-react';
import { Card } from '../../ui/card';

interface Feature {
  category: string;
  items: {
    name: string;
    free: boolean;
    pro: boolean;
    ultra: boolean;
  }[];
}

const features: Feature[] = [
  {
    category: 'Core Features',
    items: [
      { name: 'Chat-based guidance', free: true, pro: true, ultra: true },
      { name: 'Personalized nutrition plans', free: true, pro: true, ultra: true },
      { name: 'Healthy alternatives', free: true, pro: true, ultra: true },
      { name: 'Hydration tracking', free: true, pro: true, ultra: true },
      { name: 'Daily wellness tips', free: true, pro: true, ultra: true },
    ],
  },
  {
    category: 'Upload & Analysis',
    items: [
      { name: 'Food image upload', free: false, pro: true, ultra: true },
      { name: 'InBody data integration', free: false, pro: true, ultra: true },
      { name: 'Nutrition breakdown', free: false, pro: true, ultra: true },
    ],
  },
  {
    category: 'Tracking & Reports',
    items: [
      { name: 'Daily intake logging', free: false, pro: false, ultra: true },
      { name: 'Weekly nutrition reports', free: false, pro: false, ultra: true },
      { name: 'Progress tracking', free: false, pro: false, ultra: true },
      { name: 'Advanced analytics', free: false, pro: false, ultra: true },
      { name: 'Unlimited history', free: false, pro: false, ultra: true },
    ],
  },
];

export function FeatureComparison() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2>Feature Comparison</h2>
        <p className="text-muted-foreground mt-2">
          Compare features across all plans to find the right fit
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Feature</th>
              <th className="text-center py-3 px-4 font-medium">Free</th>
              <th className="text-center py-3 px-4 font-medium">Pro</th>
              <th className="text-center py-3 px-4 font-medium">Ultra</th>
            </tr>
          </thead>
          <tbody>
            {features.map((category, categoryIndex) => (
              <>
                <tr key={`category-${categoryIndex}`} className="bg-muted/30">
                  <td
                    colSpan={4}
                    className="py-2 px-4 font-medium text-sm"
                  >
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item, itemIndex) => (
                  <tr
                    key={`item-${categoryIndex}-${itemIndex}`}
                    className="border-b border-border/50"
                  >
                    <td className="py-3 px-4 text-sm">{item.name}</td>
                    <td className="py-3 px-4 text-center">
                      {item.free ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.pro ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.ultra ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
