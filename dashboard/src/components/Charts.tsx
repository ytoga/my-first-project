import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { AggregatedDaily } from '../data/generator';

interface ChartProps {
  data: AggregatedDaily[];
}

const chartColors = {
  primary: '#3b82f6',
  primaryLight: '#93c5fd',
  green: '#10b981',
  greenLight: '#6ee7b7',
  rose: '#f43f5e',
  roseLight: '#fda4af',
  amber: '#f59e0b',
  amberLight: '#fcd34d',
  violet: '#8b5cf6',
  violetLight: '#c4b5fd',
};

function formatDate(dateStr: string) {
  return format(parseISO(dateStr), 'M/d', { locale: ja });
}

function formatYen(value: number) {
  if (value >= 100_000_000) return `¥${(value / 100_000_000).toFixed(1)}億`;
  if (value >= 10_000) return `¥${(value / 10_000).toFixed(0)}万`;
  return `¥${value.toLocaleString()}`;
}

function formatNumber(value: number) {
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="h-[280px]">{children}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 text-sm">
      <p className="font-medium text-slate-700 mb-1.5">
        {label ? format(parseISO(label), 'yyyy年M月d日', { locale: ja }) : ''}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-medium text-slate-800">
            {entry.name === 'MRR' ? formatYen(entry.value) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ActiveSubsChart({ data }: ChartProps) {
  return (
    <ChartCard title="有効サブスクリプション数 推移">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.15} />
              <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatNumber}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="activeSubs"
            name="有効サブスク"
            stroke={chartColors.primary}
            strokeWidth={2}
            fill="url(#gradActive)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function NewSubsAndChurnChart({ data }: ChartProps) {
  return (
    <ChartCard title="新規登録 / 解約 推移">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
          <Bar
            dataKey="newSubs"
            name="新規"
            fill={chartColors.green}
            radius={[3, 3, 0, 0]}
            maxBarSize={12}
          />
          <Bar
            dataKey="cancellations"
            name="解約"
            fill={chartColors.rose}
            radius={[3, 3, 0, 0]}
            maxBarSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MrrChart({ data }: ChartProps) {
  return (
    <ChartCard title="MRR（月次経常収益）推移">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradMrr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.amber} stopOpacity={0.15} />
              <stop offset="95%" stopColor={chartColors.amber} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYen}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="mrr"
            name="MRR"
            stroke={chartColors.amber}
            strokeWidth={2}
            fill="url(#gradMrr)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TrialConversionChart({ data }: ChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    conversionRate:
      d.trialStarts > 0
        ? Math.round((d.trialConversions / d.trialStarts) * 1000) / 10
        : 0,
  }));

  return (
    <ChartCard title="トライアル転換率 推移">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 80]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 text-sm">
                  <p className="font-medium text-slate-700 mb-1.5">
                    {label ? format(parseISO(label), 'yyyy年M月d日', { locale: ja }) : ''}
                  </p>
                  <div className="flex items-center gap-2 py-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: chartColors.violet }}
                    />
                    <span className="text-slate-500">転換率:</span>
                    <span className="font-medium text-slate-800">{d.conversionRate}%</span>
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-500">トライアル開始:</span>
                    <span className="font-medium text-slate-800">{d.trialStarts}</span>
                  </div>
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-slate-500">転換数:</span>
                    <span className="font-medium text-slate-800">{d.trialConversions}</span>
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="conversionRate"
            name="転換率"
            stroke={chartColors.violet}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
