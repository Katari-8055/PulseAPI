import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { BarChart3, Activity, ArrowUpRight } from 'lucide-react';
import { useChartTheme } from '../../hooks/useChartTheme';
import { cn } from '../../lib/utils';

export function ApiHitsChart({ stats }) {
    const chart = useChartTheme();

    const isEmpty = !stats || (stats.totalHits === 0 && stats.successHits === 0 && stats.errorHits === 0);

    const options = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            background: 'transparent',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
            }
        },
        theme: { mode: chart.mode },
        plotOptions: {
            bar: {
                borderRadius: 8,
                borderRadiusApplication: 'end',
                columnWidth: '40%',
                distributed: true,
                dataLabels: {
                    position: 'top',
                }
            },
        },
        dataLabels: {
            enabled: true,
            offsetY: -20,
            style: {
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                colors: [chart.labelColor || '#94a3b8'],
            },
            formatter: (val) => Number(val).toLocaleString(),
        },
        stroke: {
            show: true,
            width: 1,
            colors: ['rgba(255,255,255,0.15)'],
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#8b5cf6', '#34d399', '#fb7185'],
                inverseColors: false,
                opacityFrom: 0.95,
                opacityTo: 0.7,
                stops: [0, 100]
            }
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.06)',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
        },
        xaxis: {
            categories: ['Total Hits', 'Success (2xx)', 'Errors (4xx/5xx)'],
            labels: {
                style: {
                    colors: chart.labelColor,
                    fontSize: '12px',
                    fontWeight: 500,
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: {
                    colors: chart.labelColor,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                },
                formatter: (val) => Math.round(val).toLocaleString(),
            },
        },
        colors: ['#6366f1', '#10b981', '#f43f5e'],
        legend: { show: false },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: "'Outfit', sans-serif" },
            y: {
                formatter: (val) => `${Number(val).toLocaleString()} requests`,
            },
        },
    }), [chart.mode, chart.labelColor]);

    const series = useMemo(() => [{
        name: 'Requests',
        data: [
            stats?.totalHits ?? 0,
            stats?.successHits ?? 0,
            stats?.errorHits ?? 0,
        ],
    }], [stats?.totalHits, stats?.successHits, stats?.errorHits]);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl transition-all duration-300 hover:border-white/15">
            {/* Top gradient hairline */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-inner">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            API Traffic Analytics
                        </h3>
                        <p className="text-xs text-slate-400">
                            Volume breakdown: total calls, success responses, and failures
                        </p>
                    </div>
                </div>

                {stats && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {stats.totalHits?.toLocaleString() || 0} Total Hits
                    </span>
                )}
            </div>

            {/* Content */}
            <div>
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-[340px] text-center p-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 animate-pulse">
                            <Activity className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-200">No traffic telemetry recorded yet</p>
                        <span className="text-xs text-slate-400 mt-1 max-w-xs">
                            Send API requests to your registered endpoints to visualize real-time request volume.
                        </span>
                    </div>
                ) : (
                    <div className="pt-2">
                        <Chart options={options} series={series} type="bar" height={320} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApiHitsChart;
