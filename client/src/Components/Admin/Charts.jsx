import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { formatNumber } from "./adminApi";

/**
 * A small dependency-free chart kit for the admin panel.
 *
 * Every chart is plain SVG measured in real pixels (no viewBox stretching), so
 * strokes stay 2px and marks keep their geometry at any container width.
 */

// Categorical slots — assigned in this fixed order, never cycled or reordered.
export const SERIES_COLORS = [
  "#2a78d6", // 1 blue
  "#eb6834", // 2 orange
  "#1baf7a", // 3 aqua
  "#eda100", // 4 yellow
  "#e87ba4", // 5 magenta
  "#008300", // 6 green
  "#4a3aa7", // 7 violet
  "#e34948", // 8 red
];

// Reserved for state, never for a series.
export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
  neutral: "#898781",
};

export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  surface: "#ffffff",
};

// Money in / money out keep the same two hues everywhere in the panel.
export const FLOW_COLORS = { in: SERIES_COLORS[2], out: SERIES_COLORS[1] };

const niceCeil = (value) => {
  if (!value || value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
};

// Measure the container so charts can be drawn at true pixel scale.
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    setWidth(node.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

// ─── Shells ─────────────────────────────────────────────────────────────────
export function ChartCard({ title, subtitle, actions, table, children, className = "" }) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className={`bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-serif text-stone-900">{title}</h3>
          {subtitle && <p className="text-stone-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {table && (
            <button
              type="button"
              onClick={() => setShowTable((v) => !v)}
              title={showTable ? "Show chart" : "Show data table"}
              aria-label={showTable ? "Show chart" : "Show data table"}
              className="cursor-pointer p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all"
            >
              {showTable ? <BarChart3 size={16} /> : <Table2 size={16} />}
            </button>
          )}
        </div>
      </div>

      {showTable && table ? <ChartTable {...table} /> : children}
    </div>
  );
}

export function ChartTable({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-stone-400 text-[10px] uppercase tracking-[0.2em]">
          <tr>
            {columns.map((column) => (
              <th key={column} className="py-3 pr-4 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2.5 pr-4 ${j === 0 ? "text-stone-700" : "text-stone-900 tabular-nums"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Legend({ items, className = "" }) {
  if (!items?.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 text-xs text-stone-500">
          <span
            className="w-3 h-3 rounded-[3px] inline-block shrink-0"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
          {item.value !== undefined && (
            <span className="text-stone-900 font-semibold tabular-nums">{item.value}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function ChartEmpty({ message = "Nothing to chart yet.", height = 220 }) {
  return (
    <div
      className="flex items-center justify-center text-stone-300 italic text-sm border border-dashed border-stone-200 rounded-2xl"
      style={{ height }}
    >
      {message}
    </div>
  );
}

function Tooltip({ x, y, containerWidth, children }) {
  const clampedX = Math.min(Math.max(x, 70), Math.max(containerWidth - 70, 70));
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl bg-stone-900/95 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
      style={{ left: clampedX, top: Math.max(y - 10, 8) }}
    >
      {children}
    </div>
  );
}

function TooltipRows({ title, rows }) {
  return (
    <>
      <p className="font-semibold mb-1">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: row.color }} />
          <span className="text-stone-300">{row.label}</span>
          <span className="ml-auto font-semibold tabular-nums">{row.value}</span>
        </p>
      ))}
    </>
  );
}

function YAxis({ ticks, scale, padLeft, width, format }) {
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={padLeft}
            x2={width}
            y1={scale(tick)}
            y2={scale(tick)}
            stroke={INK.grid}
            strokeWidth={1}
          />
          <text
            x={padLeft - 10}
            y={scale(tick) + 4}
            textAnchor="end"
            fontSize={10}
            fill={INK.muted}
            className="tabular-nums"
          >
            {format(tick)}
          </text>
        </g>
      ))}
    </g>
  );
}

// ─── Line / area chart ──────────────────────────────────────────────────────
export function LineChart({
  series = [],
  labels = [],
  height = 280,
  formatValue = formatNumber,
  formatTick,
  area = true,
  emptyMessage,
}) {
  const [ref, width] = useWidth();
  const [hoverIndex, setHoverIndex] = useState(null);

  const hasData = series.some((s) => s.data?.some((v) => Number(v) !== 0));
  const pad = { top: 18, right: 20, bottom: 32, left: 58 };
  const innerW = Math.max(width - pad.left - pad.right, 10);
  const innerH = height - pad.top - pad.bottom;

  const max = niceCeil(Math.max(1, ...series.flatMap((s) => s.data || [])));
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];
  const xAt = (i) =>
    pad.left + (labels.length <= 1 ? innerW / 2 : (i * innerW) / (labels.length - 1));
  const yAt = (v) => pad.top + innerH - ((Number(v) || 0) / max) * innerH;

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = event.clientX - rect.left - pad.left;
    const step = labels.length <= 1 ? innerW : innerW / (labels.length - 1);
    const index = Math.round(relative / step);
    setHoverIndex(Math.min(Math.max(index, 0), labels.length - 1));
  };

  return (
    <div ref={ref} className="relative w-full">
      {!hasData ? (
        <ChartEmpty message={emptyMessage || "No activity recorded for this period."} height={height} />
      ) : width > 0 ? (
        <>
          <svg
            width={width}
            height={height}
            role="img"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <YAxis
              ticks={ticks}
              scale={yAt}
              padLeft={pad.left}
              width={width - pad.right}
              format={formatTick || formatValue}
            />

            {area &&
              series.map((s, si) => {
                const color = s.color || SERIES_COLORS[si % SERIES_COLORS.length];
                const points = (s.data || []).map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
                return (
                  <path
                    key={`${s.key || s.label}-area`}
                    d={`M ${xAt(0)},${yAt(0)} L ${points} L ${xAt(labels.length - 1)},${yAt(0)} Z`}
                    fill={color}
                    opacity={0.08}
                  />
                );
              })}

            {series.map((s, si) => {
              const color = s.color || SERIES_COLORS[si % SERIES_COLORS.length];
              const d = (s.data || []).map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i)},${yAt(v)}`).join(" ");
              return (
                <path
                  key={s.key || s.label}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {hoverIndex !== null && (
              <g>
                <line
                  x1={xAt(hoverIndex)}
                  x2={xAt(hoverIndex)}
                  y1={pad.top}
                  y2={pad.top + innerH}
                  stroke={INK.axis}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {series.map((s, si) => (
                  <circle
                    key={`${s.key || s.label}-dot`}
                    cx={xAt(hoverIndex)}
                    cy={yAt(s.data?.[hoverIndex])}
                    r={4.5}
                    fill={s.color || SERIES_COLORS[si % SERIES_COLORS.length]}
                    stroke={INK.surface}
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}

            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={pad.top + innerH}
              y2={pad.top + innerH}
              stroke={INK.axis}
              strokeWidth={1}
            />

            {labels.map((label, i) => (
              <text
                key={`${label}-${i}`}
                x={xAt(i)}
                y={height - 10}
                textAnchor="middle"
                fontSize={10}
                fill={INK.muted}
              >
                {label}
              </text>
            ))}
          </svg>

          {hoverIndex !== null && (
            <Tooltip
              x={xAt(hoverIndex)}
              y={Math.min(...series.map((s) => yAt(s.data?.[hoverIndex])))}
              containerWidth={width}
            >
              <TooltipRows
                title={labels[hoverIndex]}
                rows={series.map((s, si) => ({
                  label: s.label,
                  color: s.color || SERIES_COLORS[si % SERIES_COLORS.length],
                  value: formatValue(s.data?.[hoverIndex] || 0),
                }))}
              />
            </Tooltip>
          )}
        </>
      ) : (
        <div style={{ height }} />
      )}

      {series.length > 1 && (
        <Legend
          className="mt-5 pt-5 border-t border-stone-100"
          items={series.map((s, si) => ({
            label: s.label,
            color: s.color || SERIES_COLORS[si % SERIES_COLORS.length],
          }))}
        />
      )}
    </div>
  );
}

// ─── Grouped / stacked bar chart ────────────────────────────────────────────
export function BarChart({
  series = [],
  labels = [],
  height = 280,
  formatValue = formatNumber,
  formatTick,
  stacked = false,
  emptyMessage,
}) {
  const [ref, width] = useWidth();
  const [hoverIndex, setHoverIndex] = useState(null);

  const hasData = series.some((s) => s.data?.some((v) => Number(v) !== 0));
  const pad = { top: 18, right: 16, bottom: 32, left: 58 };
  const innerW = Math.max(width - pad.left - pad.right, 10);
  const innerH = height - pad.top - pad.bottom;

  const peak = stacked
    ? Math.max(1, ...labels.map((_, i) => series.reduce((sum, s) => sum + (Number(s.data?.[i]) || 0), 0)))
    : Math.max(1, ...series.flatMap((s) => s.data || []));
  const max = niceCeil(peak);
  const ticks = [0, max / 4, max / 2, (max * 3) / 4, max];

  const slot = innerW / Math.max(labels.length, 1);
  const groupWidth = slot * 0.66;
  const barWidth = stacked ? groupWidth : Math.max((groupWidth - 2 * (series.length - 1)) / series.length, 2);
  const yAt = (v) => pad.top + innerH - ((Number(v) || 0) / max) * innerH;
  const groupX = (i) => pad.left + slot * i + (slot - groupWidth) / 2;

  return (
    <div ref={ref} className="relative w-full">
      {!hasData ? (
        <ChartEmpty message={emptyMessage || "No activity recorded for this period."} height={height} />
      ) : width > 0 ? (
        <>
          <svg width={width} height={height} role="img" onMouseLeave={() => setHoverIndex(null)}>
            <YAxis
              ticks={ticks}
              scale={yAt}
              padLeft={pad.left}
              width={width - pad.right}
              format={formatTick || formatValue}
            />

            {labels.map((label, i) => {
              let stackTop = pad.top + innerH;
              return (
                <g key={`${label}-${i}`} onMouseEnter={() => setHoverIndex(i)}>
                  {/* Full-height hit target so thin bars stay easy to hover. */}
                  <rect
                    x={pad.left + slot * i}
                    y={pad.top}
                    width={slot}
                    height={innerH}
                    fill="transparent"
                  />
                  {series.map((s, si) => {
                    const color = s.color || SERIES_COLORS[si % SERIES_COLORS.length];
                    const value = Number(s.data?.[i]) || 0;
                    const barHeight = Math.max((value / max) * innerH, value > 0 ? 2 : 0);
                    if (barHeight === 0) return null;

                    if (stacked) {
                      // 2px surface gap between stacked segments.
                      const y = stackTop - barHeight;
                      stackTop = y - 2;
                      return (
                        <rect
                          key={s.key || s.label}
                          x={groupX(i)}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          fill={color}
                          opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
                        />
                      );
                    }

                    return (
                      <rect
                        key={s.key || s.label}
                        x={groupX(i) + si * (barWidth + 2)}
                        y={yAt(value)}
                        width={barWidth}
                        height={barHeight}
                        rx={4}
                        fill={color}
                        opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
                      />
                    );
                  })}
                </g>
              );
            })}

            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={pad.top + innerH}
              y2={pad.top + innerH}
              stroke={INK.axis}
              strokeWidth={1}
            />

            {labels.map((label, i) => (
              <text
                key={`label-${label}-${i}`}
                x={pad.left + slot * i + slot / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize={10}
                fill={INK.muted}
              >
                {label}
              </text>
            ))}
          </svg>

          {hoverIndex !== null && (
            <Tooltip
              x={pad.left + slot * hoverIndex + slot / 2}
              y={stacked
                ? yAt(series.reduce((sum, s) => sum + (Number(s.data?.[hoverIndex]) || 0), 0))
                : Math.min(...series.map((s) => yAt(s.data?.[hoverIndex])))}
              containerWidth={width}
            >
              <TooltipRows
                title={labels[hoverIndex]}
                rows={series.map((s, si) => ({
                  label: s.label,
                  color: s.color || SERIES_COLORS[si % SERIES_COLORS.length],
                  value: formatValue(s.data?.[hoverIndex] || 0),
                }))}
              />
            </Tooltip>
          )}
        </>
      ) : (
        <div style={{ height }} />
      )}

      {series.length > 1 && (
        <Legend
          className="mt-5 pt-5 border-t border-stone-100"
          items={series.map((s, si) => ({
            label: s.label,
            color: s.color || SERIES_COLORS[si % SERIES_COLORS.length],
          }))}
        />
      )}
    </div>
  );
}

// ─── Ranked horizontal bars (always directly labelled) ──────────────────────
export function HorizontalBarChart({
  rows = [],
  formatValue = formatNumber,
  color = SERIES_COLORS[0],
  emptyMessage,
  maxRows = 8,
}) {
  const data = rows.slice(0, maxRows);
  const max = Math.max(1, ...data.map((r) => Number(r.value) || 0));

  if (!data.length || max <= 0) {
    return <ChartEmpty message={emptyMessage || "No data recorded yet."} height={180} />;
  }

  return (
    <div className="space-y-4">
      {data.map((row) => (
        <div key={row.label} className="group">
          <div className="flex justify-between items-baseline gap-4 text-sm mb-1.5">
            <span className="text-stone-600 truncate">{row.label}</span>
            <span className="text-stone-900 font-semibold tabular-nums shrink-0">
              {formatValue(row.value)}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max((Number(row.value) / max) * 100, 1.5)}%`,
                backgroundColor: row.color || color,
              }}
            />
          </div>
          {row.sub && <p className="text-stone-400 text-xs mt-1">{row.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Donut ──────────────────────────────────────────────────────────────────
export function DonutChart({
  data = [],
  size = 190,
  thickness = 22,
  centerLabel,
  formatValue = formatNumber,
  emptyMessage,
}) {
  const [hover, setHover] = useState(null);
  const slices = data.filter((d) => (Number(d.value) || 0) > 0);
  const total = slices.reduce((sum, d) => sum + Number(d.value), 0);

  if (!slices.length || total <= 0) {
    return <ChartEmpty message={emptyMessage || "No data recorded yet."} height={size} />;
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = slices.length > 1 ? 3 : 0;

  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {slices.map((slice, i) => {
              const fraction = Number(slice.value) / total;
              const length = Math.max(fraction * circumference - gap, 1);
              const dash = `${length} ${circumference - length}`;
              const strokeOffset = -offset;
              offset += fraction * circumference;
              return (
                <circle
                  key={slice.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color || SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={hover === i ? thickness + 4 : thickness}
                  strokeDasharray={dash}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="butt"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className="transition-all duration-200 cursor-default"
                />
              );
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-stone-900 tabular-nums">
            {hover !== null ? formatValue(slices[hover].value) : formatValue(total)}
          </p>
          <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em] mt-1 px-4 text-center">
            {hover !== null ? slices[hover].label : centerLabel || "Total"}
          </p>
        </div>
      </div>

      {/* Direct labels — identity never rests on colour alone. */}
      <div className="flex-1 w-full space-y-2.5">
        {slices.map((slice, i) => (
          <div
            key={slice.label}
            className="flex items-center gap-3 text-sm"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className="w-3 h-3 rounded-[3px] shrink-0"
              style={{ backgroundColor: slice.color || SERIES_COLORS[i % SERIES_COLORS.length] }}
            />
            <span className="text-stone-600 truncate">{slice.label}</span>
            <span className="ml-auto text-stone-900 font-semibold tabular-nums shrink-0">
              {formatValue(slice.value)}
            </span>
            <span className="text-stone-400 text-xs tabular-nums w-12 text-right shrink-0">
              {((Number(slice.value) / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────
export function Sparkline({ data = [], color = SERIES_COLORS[0], width = 96, height = 30 }) {
  const values = data.map((v) => Number(v) || 0);
  const max = Math.max(1, ...values);
  if (!values.length) return null;

  const step = values.length > 1 ? width / (values.length - 1) : width;
  const points = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step},${height - (v / max) * (height - 3) - 1.5}`)
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat tile ──────────────────────────────────────────────────────────────
export function StatTile({ label, value, sub, icon, delta, deltaLabel, accent, spark, sparkColor }) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(Number(delta));
  const positive = Number(delta) >= 0;

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-stone-400 text-[10px] uppercase tracking-[0.2em]">{label}</p>
        {icon && <span className="text-stone-300 shrink-0">{icon}</span>}
      </div>
      <p className="text-2xl md:text-3xl font-bold" style={{ color: accent || INK.primary }}>
        {value}
      </p>
      <div className="flex items-end justify-between gap-3 mt-2">
        <div>
          {hasDelta && (
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: positive ? "#006300" : STATUS_COLORS.critical }}
            >
              {positive ? "▲" : "▼"} {Math.abs(Number(delta)).toFixed(1)}%
              {deltaLabel && <span className="text-stone-400 font-normal ml-1">{deltaLabel}</span>}
            </span>
          )}
          {sub && <p className="text-stone-400 text-xs mt-1">{sub}</p>}
        </div>
        {spark?.length > 1 && <Sparkline data={spark} color={sparkColor || SERIES_COLORS[0]} />}
      </div>
    </div>
  );
}

// ─── Status pill (colour + label, never colour alone) ───────────────────────
export function StatusPill({ status, tone = "neutral", children }) {
  const palette = {
    good: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    serious: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
    neutral: "bg-stone-100 text-stone-600 border-stone-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${palette[tone] || palette.neutral}`}>
      {children || status}
    </span>
  );
}

export function useAnimatedNumber(value, duration = 700) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}
