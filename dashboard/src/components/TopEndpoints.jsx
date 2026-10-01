import { useMemo } from 'react';
import { 
    TrendingUp, 
    Clock, 
    AlertCircle, 
    Activity, 
    Compass, 
    Layers,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

export function TopEndpoints({ endpoints }) {
    const maxHits = useMemo(() => {
        if (!endpoints || !endpoints.length) return 1;
        return Math.max(...endpoints.map(e => parseInt(e.totalHits, 10) || 0), 1);
    }, [endpoints]);

    const getMethodBadge = (method) => {
        const m = (method || '').toUpperCase();
        switch (m) {
            case 'GET':
                return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            case 'POST':
                return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
            case 'PUT':
                return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            case 'DELETE':
                return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
            case 'PATCH':
                return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
            default:
                return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
        }
    };

    const getRankBadge = (idx) => {
        if (idx === 0) {
            return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
        }
        if (idx === 1) {
            return 'bg-slate-300/20 text-slate-200 border-slate-400/40 shadow-[0_0_10px_rgba(203,213,225,0.2)]';
        }
        if (idx === 2) {
            return 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
        }
        return 'bg-slate-800/80 text-slate-400 border-white/10';
    };

    if (!endpoints || endpoints.length === 0) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <Compass className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight">Top Performing Endpoints</h3>
                        <p className="text-xs text-slate-400">Most active API routes by traffic volume</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
                        <Activity className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">No endpoint metrics available yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Endpoint throughput and latency telemetry will populate dynamically once client requests are received.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] p-6 shadow-xl transition-all duration-300 hover:border-white/15">
            {/* Top gradient hairline */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-inner">
                        <Compass className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                            Top Performing Endpoints
                        </h3>
                        <p className="text-xs text-slate-400">
                            Ranked by request volume, response latency, and reliability
                        </p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Top {endpoints.length} Routes
                </span>
            </div>

            {/* Endpoints list */}
            <div className="space-y-3">
                {endpoints.map((endpoint, index) => {
                    const hits = parseInt(endpoint.totalHits, 10) || 0;
                    const latency = parseFloat(endpoint.avgLatency) || 0;
                    const errorRate = parseFloat(endpoint.errorRate) || 0;
                    const hitPercent = Math.min(100, Math.round((hits / maxHits) * 100));

                    return (
                        <div
                            key={`${endpoint.endpoint}-${endpoint.method}-${index}`}
                            className="group relative rounded-xl p-4 bg-slate-950/40 hover:bg-slate-900/80 border border-white/[0.06] hover:border-blue-500/30 transition-all duration-200 shadow-sm hover:shadow-lg"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Left section: Rank + Route + Method + Service */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {/* Rank Medal */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono border flex-shrink-0 transition-transform group-hover:scale-105",
                                        getRankBadge(index)
                                    )}>
                                        #{index + 1}
                                    </div>

                                    {/* Route details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wide border",
                                                getMethodBadge(endpoint.method)
                                            )}>
                                                {endpoint.method}
                                            </span>

                                            <code className="text-sm font-mono font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                                                {endpoint.endpoint}
                                            </code>

                                            {endpoint.serviceName && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-white/10">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    {endpoint.serviceName}
                                                </span>
                                            )}
                                        </div>

                                        {/* Hit Volume Share Progress Bar */}
                                        <div className="w-full max-w-xs h-1 bg-white/[0.05] rounded-full overflow-hidden mt-1.5">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-500"
                                                style={{ width: `${Math.max(8, hitPercent)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right section: Telemetry Metrics Cluster */}
                                <div className="flex items-center gap-4 sm:gap-6 flex-wrap pl-11 md:pl-0 border-t md:border-t-0 border-white/[0.06] pt-3 md:pt-0">
                                    {/* Hits */}
                                    <div className="min-w-[70px]">
                                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            Requests
                                        </div>
                                        <div className="text-sm font-mono font-bold text-white flex items-center gap-1">
                                            {hits.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Latency */}
                                    <div className="min-w-[85px]">
                                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            Avg Latency
                                        </div>
                                        <div className={cn(
                                            "text-sm font-mono font-bold flex items-center gap-1",
                                            latency < 100 ? "text-emerald-400" : latency < 300 ? "text-amber-400" : "text-rose-400"
                                        )}>
                                            <Clock className="w-3.5 h-3.5 opacity-70" />
                                            {latency.toFixed(1)} ms
                                        </div>
                                    </div>

                                    {/* Error Rate */}
                                    <div className="min-w-[80px]">
                                        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                            Error Rate
                                        </div>
                                        <div className={cn(
                                            "text-sm font-mono font-bold flex items-center gap-1",
                                            errorRate === 0 ? "text-emerald-400" : "text-rose-400"
                                        )}>
                                            {errorRate === 0 ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
                                            ) : (
                                                <AlertCircle className="w-3.5 h-3.5 opacity-70" />
                                            )}
                                            {errorRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TopEndpoints;
