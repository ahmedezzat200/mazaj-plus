import { Card } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Free', value: 892, color: 'var(--color-muted-foreground)' },
  { name: 'Pro', value: 243, color: 'var(--color-secondary)' },
  { name: 'Ultra', value: 112, color: 'var(--color-primary)' },
];

export function UserDistribution() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3>User Distribution</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Breakdown by subscription tier
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{item.value}</p>
              <p className="text-xs text-muted-foreground">
                {((item.value / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
