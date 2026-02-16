import { addDays, format, differenceInDays } from 'date-fns';

export type Platform = 'ios' | 'android';
export type Plan = 'monthly' | 'annual';

export interface DailyRecord {
  date: string;
  platform: Platform;
  plan: Plan;
  activeSubs: number;
  newSubs: number;
  cancellations: number;
  mrr: number;
  trialStarts: number;
  trialConversions: number;
}

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateForSegment(
  platform: Platform,
  plan: Plan,
  startDate: Date,
  days: number,
  seed: number
): DailyRecord[] {
  const rng = createRng(seed);
  const records: DailyRecord[] = [];

  const platformMultiplier = platform === 'ios' ? 1.4 : 1.0;
  const planBaseActive = plan === 'monthly' ? 8000 : 3200;
  const planPriceMonthly = plan === 'monthly' ? 980 : 650;

  let activeSubs = Math.round(planBaseActive * platformMultiplier);

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dayOfWeek = date.getDay();
    const monthOfYear = date.getMonth();

    const seasonalFactor =
      monthOfYear <= 2 ? 1.15 :
      monthOfYear <= 5 ? 0.95 :
      monthOfYear <= 8 ? 0.90 :
      1.10;

    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1.0;
    const growthTrend = 1 + (i / days) * 0.15;

    const spikeChance = rng();
    const spikeFactor = spikeChance > 0.97 ? 2.5 + rng() * 1.5 :
                        spikeChance > 0.93 ? 1.6 + rng() * 0.6 :
                        1.0;

    const dipChance = rng();
    const dipFactor = dipChance > 0.98 ? 0.4 : dipChance > 0.95 ? 0.7 : 1.0;

    const baseNewSubs = Math.round(
      (plan === 'monthly' ? 45 : 18) *
      platformMultiplier *
      seasonalFactor *
      weekendBoost *
      growthTrend *
      spikeFactor *
      (0.85 + rng() * 0.3)
    );

    const churnRate = plan === 'monthly' ? 0.0035 : 0.0012;
    const baseCancellations = Math.round(
      activeSubs * churnRate *
      dipFactor *
      (0.7 + rng() * 0.6)
    );

    const trialStarts = Math.round(
      baseNewSubs * 0.6 * (0.8 + rng() * 0.4)
    );
    const trialConversionRate = plan === 'monthly' ? 0.42 : 0.35;
    const trialConversions = Math.round(
      trialStarts * trialConversionRate * (0.75 + rng() * 0.5)
    );

    const newSubs = baseNewSubs;
    const cancellations = baseCancellations;
    activeSubs = activeSubs + newSubs - cancellations;

    const mrr = activeSubs * planPriceMonthly;

    records.push({
      date: format(date, 'yyyy-MM-dd'),
      platform,
      plan,
      activeSubs,
      newSubs,
      cancellations,
      mrr,
      trialStarts,
      trialConversions,
    });
  }

  return records;
}

let cachedData: DailyRecord[] | null = null;
let cachedStartDate: string | null = null;
let cachedDays: number | null = null;

export function generateAllData(startDate: Date, days: number): DailyRecord[] {
  const startStr = format(startDate, 'yyyy-MM-dd');
  if (cachedData && cachedStartDate === startStr && cachedDays === days) {
    return cachedData;
  }

  const segments: DailyRecord[] = [
    ...generateForSegment('ios', 'monthly', startDate, days, 42),
    ...generateForSegment('ios', 'annual', startDate, days, 137),
    ...generateForSegment('android', 'monthly', startDate, days, 256),
    ...generateForSegment('android', 'annual', startDate, days, 389),
  ];

  cachedData = segments;
  cachedStartDate = startStr;
  cachedDays = days;

  return segments;
}

export interface Filters {
  startDate: Date;
  endDate: Date;
  platforms: Platform[];
  plans: Plan[];
}

export interface AggregatedDaily {
  date: string;
  activeSubs: number;
  newSubs: number;
  cancellations: number;
  mrr: number;
  trialStarts: number;
  trialConversions: number;
}

export interface KpiSummary {
  totalActiveSubs: number;
  activeSubsChange: number;
  totalNewSubs: number;
  newSubsChange: number;
  totalCancellations: number;
  cancellationsChange: number;
  currentMrr: number;
  mrrChange: number;
  trialConversionRate: number;
  trialConversionRateChange: number;
}

export function filterAndAggregate(
  allData: DailyRecord[],
  filters: Filters
): { daily: AggregatedDaily[]; kpi: KpiSummary } {
  const startStr = format(filters.startDate, 'yyyy-MM-dd');
  const endStr = format(filters.endDate, 'yyyy-MM-dd');

  const filtered = allData.filter(
    (r) =>
      r.date >= startStr &&
      r.date <= endStr &&
      filters.platforms.includes(r.platform) &&
      filters.plans.includes(r.plan)
  );

  const byDate = new Map<string, AggregatedDaily>();
  for (const r of filtered) {
    const existing = byDate.get(r.date);
    if (existing) {
      existing.activeSubs += r.activeSubs;
      existing.newSubs += r.newSubs;
      existing.cancellations += r.cancellations;
      existing.mrr += r.mrr;
      existing.trialStarts += r.trialStarts;
      existing.trialConversions += r.trialConversions;
    } else {
      byDate.set(r.date, {
        date: r.date,
        activeSubs: r.activeSubs,
        newSubs: r.newSubs,
        cancellations: r.cancellations,
        mrr: r.mrr,
        trialStarts: r.trialStarts,
        trialConversions: r.trialConversions,
      });
    }
  }

  const daily = Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Previous period for comparison
  const periodDays = differenceInDays(filters.endDate, filters.startDate) + 1;
  const prevStartDate = addDays(filters.startDate, -periodDays);
  const prevEndStr = format(addDays(filters.startDate, -1), 'yyyy-MM-dd');
  const prevStartStr = format(prevStartDate, 'yyyy-MM-dd');

  const prevFiltered = allData.filter(
    (r) =>
      r.date >= prevStartStr &&
      r.date <= prevEndStr &&
      filters.platforms.includes(r.platform) &&
      filters.plans.includes(r.plan)
  );

  const prevByDate = new Map<string, AggregatedDaily>();
  for (const r of prevFiltered) {
    const existing = prevByDate.get(r.date);
    if (existing) {
      existing.activeSubs += r.activeSubs;
      existing.newSubs += r.newSubs;
      existing.cancellations += r.cancellations;
      existing.mrr += r.mrr;
      existing.trialStarts += r.trialStarts;
      existing.trialConversions += r.trialConversions;
    } else {
      prevByDate.set(r.date, {
        date: r.date,
        activeSubs: r.activeSubs,
        newSubs: r.newSubs,
        cancellations: r.cancellations,
        mrr: r.mrr,
        trialStarts: r.trialStarts,
        trialConversions: r.trialConversions,
      });
    }
  }

  const prevDaily = Array.from(prevByDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const lastDay = daily[daily.length - 1];
  const totalActiveSubs = lastDay?.activeSubs ?? 0;
  const totalNewSubs = daily.reduce((s, d) => s + d.newSubs, 0);
  const totalCancellations = daily.reduce((s, d) => s + d.cancellations, 0);
  const currentMrr = lastDay?.mrr ?? 0;
  const totalTrialStarts = daily.reduce((s, d) => s + d.trialStarts, 0);
  const totalTrialConversions = daily.reduce((s, d) => s + d.trialConversions, 0);
  const trialConversionRate = totalTrialStarts > 0 ? (totalTrialConversions / totalTrialStarts) * 100 : 0;

  const prevLastDay = prevDaily[prevDaily.length - 1];
  const prevActiveSubs = prevLastDay?.activeSubs ?? 0;
  const prevNewSubs = prevDaily.reduce((s, d) => s + d.newSubs, 0);
  const prevCancellations = prevDaily.reduce((s, d) => s + d.cancellations, 0);
  const prevMrr = prevLastDay?.mrr ?? 0;
  const prevTrialStarts = prevDaily.reduce((s, d) => s + d.trialStarts, 0);
  const prevTrialConversions = prevDaily.reduce((s, d) => s + d.trialConversions, 0);
  const prevTrialConversionRate = prevTrialStarts > 0 ? (prevTrialConversions / prevTrialStarts) * 100 : 0;

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? 0 : ((curr - prev) / prev) * 100;

  return {
    daily,
    kpi: {
      totalActiveSubs,
      activeSubsChange: pctChange(totalActiveSubs, prevActiveSubs),
      totalNewSubs,
      newSubsChange: pctChange(totalNewSubs, prevNewSubs),
      totalCancellations,
      cancellationsChange: pctChange(totalCancellations, prevCancellations),
      currentMrr,
      mrrChange: pctChange(currentMrr, prevMrr),
      trialConversionRate,
      trialConversionRateChange: trialConversionRate - prevTrialConversionRate,
    },
  };
}
