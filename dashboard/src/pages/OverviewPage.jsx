import { useState, useMemo, useCallback } from 'react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import { useAuth } from '../contexts/AuthContext';
import StatsGrid from '../components/StatsGrid';
import TopEndpoints from '../components/TopEndpoints';
import TimeRangeSelector from '../components/TimeRangeSelector';
import { ApiHitsChart, StatusDistributionChart } from '../components/charts';
import { PageStatus } from '../components/ui';
import { Activity, RefreshCw, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

// Default: last 24 hours
function getDefaultRange() {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    return { startTime: startTime.toISOString(), endTime: endTime.toISOString() };
}

export function OverviewPage() {
    const { user } = useAuth();

    // Active preset tracking ('1h', '4h', '24h', '7d', '30d', 'custom')
    const [selectedPreset, setSelectedPreset] = useState('24h');
    const [timeRange, setTimeRange] = useState(getDefaultRange);

    const handleRangeChange = useCallback(({ startTime, endTime, preset }) => {
        setTimeRange({ startTime, endTime });
        if (preset) setSelectedPreset(preset);
    }, []);

    const { data, isPending, isFetching, error, refetch } = useDashboardQuery(timeRange);

    const stats = data?.data?.stats ?? null;
    const topEndpoints = data?.data?.topEndpoints ?? [];

    const statusData = useMemo(() => {
        if (!stats) return null;
        return {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            values: [stats.successHits, stats.errorHits],
        };
    }, [stats]);

    if ((isPending && !data) || error) {
        return (
            <PageStatus
                isLoading={isPending && !data}
                error={error}
                onRetry={refetch}
                loadingText="Synchronizing API telemetry..."
                errorText="Failed to retrieve monitoring telemetry"
            />
        );
    }

    return (
        <div className="relative min-h-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
            {/* Ambient Background Glow Effect */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Header with Title, Status Beacon & Time Range */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Live Radar Pulse Indicator */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Live Telemetry Active
                        </div>

                        {isFetching && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Refreshing...
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                        Overview
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400">
                        Live API monitoring, performance metrics, and endpoint telemetry
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <TimeRangeSelector
                        value={selectedPreset}
                        onChange={handleRangeChange}
                    />
                </div>
            </div>

            {/* Stats Metric Cards (4x2 Matrix) */}
            <StatsGrid stats={stats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApiHitsChart stats={stats} />
                <StatusDistributionChart data={statusData} />
            </div>

            {/* Top Endpoints Performance Table */}
            <TopEndpoints endpoints={topEndpoints} />
        </div>
    );
}

export default OverviewPage;
