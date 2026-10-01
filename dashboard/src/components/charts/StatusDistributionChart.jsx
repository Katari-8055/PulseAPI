import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { PieChart, ShieldCheck } from 'lucide-react';
import { useChartTheme } from '../../hooks/useChartTheme';

export function StatusDistributionChart({ data }) {
    const chart = useChartTheme();

    const series = useMemo(() => data?.values ?? [], [data?.values]);
    const isEmpty = !series.length || series.every((v) => v === 0);

    const total = useMemo(() => {
        return series.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    }, [series]);

    const successPct = useMemo(() => {
        if (!total) return 100;
        const successCount = Number(series[0]) || 0;
        return ((successCount / total) * 100).toFixed(1);
    }, [series, total]);

    const options = useMemo(() => ({
        chart: {
            type: 'donut',
            background: 'transparent',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
            }
        },
        theme: { mode: chart.mode },
        labels: data?.labels ?? ['Success (2xx)', 'Errors (4xx/5xx)'],
        colors: ['#10b981', '#f43f5e', '#f59e0b'],
        stroke: {
            show: true,
            width: 2,
            colors: ['#0f172a'],
        },
        dataLabels: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '74%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '11px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            color: '#94a3b8',
                            offsetY: -5,
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 800,
                            color: '#ffffff',
                            offsetY: 6,
                            formatter: (val) => Number(val).toLocaleString(),
                        },
                        total: {
                            show: true,
                            label: 'TOTAL CALLS',
                            fontSize: '10px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 700,
                            color: '#64748b',
                            formatter: (w) => {
                                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                return sum.toLocaleString();
                            },
                        },
                    },
                },
            },
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '12px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
            labels: { colors: chart.labelColor || '#cbd5e1' },
            markers: {
                width: 9,
                height: 9,
                radius: 4,
                offsetX: -3,
            },
            itemMargin: {
                horizontal: 14,
                vertical: 6,
            },
        },
        tooltip: {
            theme: 'dark',
            style: { fontSize: '12px', fontFamily: "'Outfit', sans-serif" },
            y: {
                formatter: (v) => {
                    const count = Number(v) || 0;
                    const pct = total ? ((count / total) * 100).toFixed(1) : 0;
                    return `${count.toLocaleString()} requests (${pct}%)`;
                },
            },
        },
    }), [data?.labels, chart.mode, chart.labelColor, total]);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-5 shadow-xl transition-all duration-300 hover:border-white/15">
            {/* Top gradient hairline */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-inner">
                        <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            Status Code Breakdown
                        </h3>
                        <p className="text-xs text-slate-400">
                            HTTP status distribution between 2xx success and error responses
                        </p>
                    </div>
                </div>

                {!isEmpty && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {successPct}% Success Ratio
                    </span>
                )}
            </div>

            {/* Content */}
            <div>
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-[340px] text-center p-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-200">No request status distribution</p>
                        <span className="text-xs text-slate-400 mt-1 max-w-xs">
                            HTTP status code breakdowns will appear here once endpoints receive traffic.
                        </span>
                    </div>
                ) : (
                    <div className="pt-2">
                        <Chart options={options} series={series} type="donut" height={320} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default StatusDistributionChart;
