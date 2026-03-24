'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Line,
} from 'recharts';
import type { IndicatorData } from '@/lib/data';
import { calculateConsensus } from '@/lib/data';

interface TimeSeriesChartProps {
  indicator: IndicatorData;
  height?: number;
}

export default function TimeSeriesChart({ indicator, height = 300 }: TimeSeriesChartProps) {
  const { historical, imfForecast, forecasts, config } = indicator;
  const consensus = calculateConsensus(forecasts);
  const currentYear = new Date().getFullYear();

  // Merge all data by year into a single array
  const merged = new Map<string, any>();

  // Historical data → "actual" key
  historical.forEach((d) => {
    const entry = merged.get(d.date) || { date: d.date };
    entry.actual = d.value;
    merged.set(d.date, entry);
  });

  // IMF forecast → "imf" key
  // Also bridge: if current year is in both historical & forecast, set both keys
  imfForecast.forEach((d) => {
    const entry = merged.get(d.date) || { date: d.date };
    entry.imf = d.value;
    // For the bridge year (current year), also copy actual if present
    if (Number(d.date) === currentYear && entry.actual == null) {
      entry.actual = d.value;
    }
    merged.set(d.date, entry);
  });

  // Bridge: make sure the last actual year also has an imf value
  // so the two lines visually connect
  if (historical.length > 0 && imfForecast.length > 0) {
    const lastHistorical = historical[historical.length - 1];
    const entry = merged.get(lastHistorical.date);
    if (entry && entry.imf == null) {
      entry.imf = lastHistorical.value;
      merged.set(lastHistorical.date, entry);
    }
  }

  // Consensus dots
  consensus.forEach((c) => {
    const yr = c.year.replace(/[ef]$/, '');
    const entry = merged.get(yr) || { date: yr };
    entry.consensus = c.mean;
    entry.consensus_high = c.high;
    entry.consensus_low = c.low;
    merged.set(yr, entry);
  });

  const allData = Array.from(merged.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  // Show last ~20 years of data for readability
  const chartData = allData.slice(-20);

  // Handle empty data
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-mist/40 font-mono text-xs" style={{ height }}>
        No data available — IMF API may be loading
      </div>
    );
  }

  const hasNegative = chartData.some(
    (d) => (d.actual ?? 0) < 0 || (d.imf ?? 0) < 0 || (d.consensus ?? 0) < 0
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id={`g-hist-${config.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`g-imf-${config.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            background: '#141b2d',
            border: '1px solid #1e293b',
            borderRadius: 8,
            fontFamily: 'IBM Plex Mono',
            fontSize: 11,
          }}
          labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
          formatter={(val: number, name: string) => {
            const labels: Record<string, string> = {
              actual: 'Actual',
              imf: 'IMF WEO Forecast',
              consensus: 'Consensus',
            };
            return [`${val.toFixed(1)} ${config.unit}`, labels[name] || name];
          }}
        />
        {hasNegative && <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />}

        {/* Vertical reference line at current year */}
        <ReferenceLine
          x={String(currentYear)}
          stroke="#475569"
          strokeDasharray="4 4"
          label={{ value: 'Now', position: 'top', fill: '#94a3b8', fontSize: 9, fontFamily: 'IBM Plex Mono' }}
        />

        {/* Historical (solid blue) */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#38bdf8"
          strokeWidth={2.5}
          fill={`url(#g-hist-${config.id})`}
          dot={false}
          connectNulls
        />

        {/* IMF Forecast (dashed gold) — bridges from last actual year */}
        <Area
          type="monotone"
          dataKey="imf"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="6 3"
          fill={`url(#g-imf-${config.id})`}
          dot={{ fill: '#f59e0b', r: 3 }}
          connectNulls
        />

        {/* Consensus dots (purple) */}
        <Line
          type="monotone"
          dataKey="consensus"
          stroke="#a78bfa"
          strokeWidth={0}
          dot={{ fill: '#a78bfa', r: 5, strokeWidth: 2, stroke: '#141b2d' }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
