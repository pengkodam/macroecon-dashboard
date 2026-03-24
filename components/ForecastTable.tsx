'use client';

import type { InstitutionalForecast, ConsensusForecast } from '@/lib/data';
import { calculateConsensus } from '@/lib/data';

interface ForecastTableProps {
  indicatorName: string;
  unit: string;
  forecasts: InstitutionalForecast[];
}

export default function ForecastTable({ indicatorName, unit, forecasts }: ForecastTableProps) {
  const consensus = calculateConsensus(forecasts);
  if (consensus.length === 0) return null;

  // Get unique sources
  const allSources = Array.from(new Set(forecasts.map((f) => f.source)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate/60">
            <th className="text-left py-2 pr-4 font-mono text-[10px] text-mist uppercase tracking-wider">
              Source
            </th>
            {consensus.map((c) => (
              <th
                key={c.year}
                className="text-right py-2 px-3 font-mono text-[10px] text-mist uppercase tracking-wider"
              >
                {c.year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allSources.map((src) => (
            <tr key={src} className="border-b border-slate/20 hover:bg-sky/5 transition-colors">
              <td className="py-2.5 pr-4">
                <span className="text-xs font-body text-pearl">{src}</span>
              </td>
              {consensus.map((c) => {
                const match = c.sources.find((s) => s.source === src);
                return (
                  <td key={c.year} className="text-right py-2.5 px-3">
                    {match ? (
                      <span className="font-mono text-sm text-pearl">
                        {match.value.toFixed(1)}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-slate">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Consensus row */}
          <tr className="bg-sky/8 border-t-2 border-sky/30">
            <td className="py-3 pr-4">
              <span className="text-xs font-body font-semibold text-sky">
                Consensus
              </span>
            </td>
            {consensus.map((c) => (
              <td key={c.year} className="text-right py-3 px-3">
                <div className="font-mono text-sm font-bold text-sky">
                  {c.mean.toFixed(1)}
                </div>
                <div className="font-mono text-[9px] text-mist/50 mt-0.5">
                  {c.low.toFixed(1)}–{c.high.toFixed(1)}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="mt-2 text-[9px] font-mono text-mist/40">
        {unit} · {forecasts.length} forecasts from {allSources.length} institutions ·
        e = estimate (year not finalised) · f = forecast (forward projection)
      </div>
    </div>
  );
}
