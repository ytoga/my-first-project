import { format } from 'date-fns';
import { Calendar, Smartphone, CreditCard } from 'lucide-react';
import type { Platform, Plan } from '../data/generator';

interface FilterBarProps {
  startDate: Date;
  endDate: Date;
  platforms: Platform[];
  plans: Plan[];
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onPlatformsChange: (platforms: Platform[]) => void;
  onPlansChange: (plans: Plan[]) => void;
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
        active
          ? 'bg-primary-600 text-white shadow-sm'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  startDate,
  endDate,
  platforms,
  plans,
  onStartDateChange,
  onEndDateChange,
  onPlatformsChange,
  onPlansChange,
}: FilterBarProps) {
  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        onPlatformsChange(platforms.filter((x) => x !== p));
      }
    } else {
      onPlatformsChange([...platforms, p]);
    }
  };

  const togglePlan = (p: Plan) => {
    if (plans.includes(p)) {
      if (plans.length > 1) {
        onPlansChange(plans.filter((x) => x !== p));
      }
    } else {
      onPlansChange([...plans, p]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-6">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">期間</span>
          </div>
          <input
            type="date"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => onStartDateChange(new Date(e.target.value + 'T00:00:00'))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
          <span className="text-slate-400">〜</span>
          <input
            type="date"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => onEndDateChange(new Date(e.target.value + 'T00:00:00'))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div className="w-px h-8 bg-slate-200" />

        {/* Platform */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">OS</span>
          </div>
          <div className="flex gap-1.5">
            <ToggleButton
              active={platforms.includes('ios')}
              onClick={() => togglePlatform('ios')}
            >
              iOS
            </ToggleButton>
            <ToggleButton
              active={platforms.includes('android')}
              onClick={() => togglePlatform('android')}
            >
              Android
            </ToggleButton>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200" />

        {/* Plan */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">プラン</span>
          </div>
          <div className="flex gap-1.5">
            <ToggleButton
              active={plans.includes('monthly')}
              onClick={() => togglePlan('monthly')}
            >
              月額
            </ToggleButton>
            <ToggleButton
              active={plans.includes('annual')}
              onClick={() => togglePlan('annual')}
            >
              年額
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
