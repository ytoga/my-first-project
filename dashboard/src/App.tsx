import { useState, useMemo } from 'react';
import { subDays } from 'date-fns';
import {
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  RefreshCw,
  Table2,
} from 'lucide-react';
import {
  generateAllData,
  filterAndAggregate,
  type Platform,
  type Plan,
  type Filters,
} from './data/generator';
import { KpiCard } from './components/KpiCard';
import { FilterBar } from './components/FilterBar';
import {
  ActiveSubsChart,
  NewSubsAndChurnChart,
  MrrChart,
  TrialConversionChart,
} from './components/Charts';
import { RawDataViewer } from './components/RawDataViewer';

const DATA_START = new Date('2025-01-01T00:00:00');
const DATA_DAYS = 420; // ~14 months of data
const allData = generateAllData(DATA_START, DATA_DAYS);

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatYen(n: number): string {
  if (n >= 100_000_000) return `¥${(n / 100_000_000).toFixed(2)}億`;
  if (n >= 10_000_000) return `¥${(n / 10_000).toFixed(0)}万`;
  if (n >= 10_000) return `¥${(n / 10_000).toFixed(1)}万`;
  return `¥${n.toLocaleString()}`;
}

function App() {
  const [startDate, setStartDate] = useState(() => subDays(new Date('2026-02-16T00:00:00'), 30));
  const [endDate, setEndDate] = useState(() => new Date('2026-02-16T00:00:00'));
  const [platforms, setPlatforms] = useState<Platform[]>(['ios', 'android']);
  const [plans, setPlans] = useState<Plan[]>(['monthly', 'annual']);
  const [showRawData, setShowRawData] = useState(false);

  const filters: Filters = useMemo(
    () => ({ startDate, endDate, platforms, plans }),
    [startDate, endDate, platforms, plans]
  );

  const { daily, kpi } = useMemo(
    () => filterAndAggregate(allData, filters),
    [filters]
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Subscription Analytics
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                モバイルアプリ サブスクリプション分析ダッシュボード
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRawData(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Table2 className="w-4 h-4" />
                生データ
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          platforms={platforms}
          plans={plans}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onPlatformsChange={setPlatforms}
          onPlansChange={setPlans}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="有効サブスク数"
            value={formatCompact(kpi.totalActiveSubs)}
            change={kpi.activeSubsChange}
            icon={<Users className="w-5 h-5" />}
            accentColor="#3b82f6"
          />
          <KpiCard
            title="新規登録（期間合計）"
            value={formatCompact(kpi.totalNewSubs)}
            change={kpi.newSubsChange}
            icon={<UserPlus className="w-5 h-5" />}
            accentColor="#10b981"
          />
          <KpiCard
            title="解約（期間合計）"
            value={formatCompact(kpi.totalCancellations)}
            change={kpi.cancellationsChange}
            invertChange
            icon={<UserMinus className="w-5 h-5" />}
            accentColor="#f43f5e"
          />
          <KpiCard
            title="MRR"
            value={formatYen(kpi.currentMrr)}
            change={kpi.mrrChange}
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
          <KpiCard
            title="トライアル転換率"
            value={`${kpi.trialConversionRate.toFixed(1)}%`}
            change={kpi.trialConversionRateChange}
            changeLabel={`${kpi.trialConversionRateChange >= 0 ? '+' : ''}${kpi.trialConversionRateChange.toFixed(1)}pt`}
            icon={<RefreshCw className="w-5 h-5" />}
            accentColor="#8b5cf6"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActiveSubsChart data={daily} />
          <NewSubsAndChurnChart data={daily} />
          <MrrChart data={daily} />
          <TrialConversionChart data={daily} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 mt-8">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <p className="text-xs text-slate-400 text-center">
            Subscription Analytics Dashboard — Demo Data
          </p>
        </div>
      </footer>

      {/* Raw Data Modal */}
      {showRawData && (
        <RawDataViewer data={daily} onClose={() => setShowRawData(false)} />
      )}
    </div>
  );
}

export default App;
