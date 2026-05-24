import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fallbackMonthlyData = [
  { month: "Jan", income: 98000, expenses: 62000, savings: 36000 },
  { month: "Feb", income: 104000, expenses: 68000, savings: 36000 },
  { month: "Mar", income: 99000, expenses: 59000, savings: 40000 },
  { month: "Apr", income: 116000, expenses: 72000, savings: 44000 },
  { month: "May", income: 121000, expenses: 65000, savings: 56000 },
];

export function MonthlyOverviewChart({ data = fallbackMonthlyData }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
        <Bar dataKey="income" fill="#06B6D4" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expenses" fill="#4F46E5" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsTrendChart({ data = fallbackMonthlyData }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: -20, right: 8 }}>
        <defs>
          <linearGradient id="savingsTrend" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <Tooltip />
        <Area type="monotone" dataKey="savings" stroke="#10B981" fill="url(#savingsTrend)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
