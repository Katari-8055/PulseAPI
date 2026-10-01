import { 
    TrendingUp, 
    Clock, 
    AlertTriangle, 
    CheckCircle2, 
    Layers, 
    Zap, 
    Users, 
    ShieldCheck,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

function getTimeframeSubtitle(stats) {
    if (!stats?.timeRange?.start || !stats?.timeRange?.end) {
        return 'Selected window';
    }
    const start = new Date(stats.timeRange.start);
    const end = new Date(stats.timeRange.end);
    const diffHours = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)));

    if (diffHours <= 1) return 'Last 1 hour';
    if (diffHours <= 4) return 'Last 4 hours';
    if (diffHours <= 24) return 'Last 24 hours';
    const days = Math.round(diffHours / 24);
    return `Last ${days} days`;
}

export function StatsGrid({ stats }) {
    if (!stats) return null;

    const successRate = Math.max(0, Math.min(100, 100 - (stats.errorRate || 0)));
    const healthIndex = stats.totalHits === 0 ? 100 : Math.max(0, 100 - (stats.errorRate || 0));

    const statCards = [
        {
            title: 'Total Requests',
            value: (stats.totalHits || 0).toLocaleString(),
            subtitle: getTimeframeSubtitle(stats),
            tag: `${(stats.successHits || 0).toLocaleString()} ok`,
            icon: TrendingUp,
            accent: 'blue',
            glowColor: 'rgba(59, 130, 246, 0.15)',
            borderHighlight: 'via-blue-500/50',
            iconBg: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
            tagBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
            progressGradient: 'from-blue-500 to-cyan-400',
            progressVal: 100,
        },
        {
            title: 'Average Latency',
            value: `${(stats.avgLatency || 0).toFixed(2)} ms`,
            subtitle: 'Telemetry response time',
            tag: stats.avgLatency < 100 ? 'Ultra Fast' : stats.avgLatency < 300 ? 'Optimal' : 'High Latency',
            icon: Clock,
            accent: 'purple',
            glowColor: 'rgba(168, 85, 247, 0.15)',
            borderHighlight: 'via-purple-500/50',
            iconBg: 'bg-purple-500/10 border-purple-500/25 text-purple-400',
            tagBg: stats.avgLatency < 150 ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-purple-500/10 text-purple-300 border-purple-500/20',
            progressGradient: 'from-purple-500 to-pink-500',
            progressVal: Math.min(100, Math.max(10, Math.round((stats.avgLatency / 500) * 100))),
        },
        {
            title: 'Success Rate',
            value: `${successRate.toFixed(1)}%`,
            subtitle: `${(stats.successHits || 0).toLocaleString()} successful hits`,
            tag: successRate >= 99 ? 'Excellent' : successRate >= 90 ? 'Normal' : 'Degraded',
            icon: CheckCircle2,
            accent: 'emerald',
            glowColor: 'rgba(16, 185, 129, 0.15)',
            borderHighlight: 'via-emerald-500/50',
            iconBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
            tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
            progressGradient: 'from-emerald-500 to-teal-400',
            progressVal: successRate,
        },
        {
            title: 'Error Rate',
            value: `${(stats.errorRate || 0).toFixed(1)}%`,
            subtitle: `${(stats.errorHits || 0).toLocaleString()} error incidents`,
            tag: stats.errorRate === 0 ? 'Zero Errors' : `${stats.errorHits} errors`,
            icon: AlertTriangle,
            accent: 'rose',
            glowColor: 'rgba(244, 63, 94, 0.15)',
            borderHighlight: 'via-rose-500/50',
            iconBg: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
            tagBg: stats.errorRate > 0 ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-slate-800 text-slate-300 border-white/10',
            progressGradient: 'from-rose-500 to-amber-500',
            progressVal: Math.min(100, Math.max(4, stats.errorRate)),
        },
        {
            title: 'Unique Services',
            value: stats.uniqueServices || 0,
            subtitle: 'Active backend microservices',
            tag: 'Monitored',
            icon: Layers,
            accent: 'indigo',
            glowColor: 'rgba(99, 102, 241, 0.15)',
            borderHighlight: 'via-indigo-500/50',
            iconBg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
            tagBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
            progressGradient: 'from-indigo-500 to-blue-500',
            progressVal: 80,
        },
        {
            title: 'Unique Endpoints',
            value: stats.uniqueEndpoints || 0,
            subtitle: 'Monitored API routes',
            tag: 'Active Routes',
            icon: Zap,
            accent: 'amber',
            glowColor: 'rgba(245, 158, 11, 0.15)',
            borderHighlight: 'via-amber-500/50',
            iconBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
            tagBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
            progressGradient: 'from-amber-500 to-orange-500',
            progressVal: 85,
        },
        {
            title: 'Unique Users',
            value: stats.uniqueUsers ?? 0,
            subtitle: 'Distinct client identities',
            tag: 'Audience',
            icon: Users,
            accent: 'cyan',
            glowColor: 'rgba(6, 182, 212, 0.15)',
            borderHighlight: 'via-cyan-500/50',
            iconBg: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
            tagBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
            progressGradient: 'from-cyan-500 to-sky-400',
            progressVal: 90,
        },
        {
            title: 'System Health SLA',
            value: `${healthIndex.toFixed(1)}%`,
            subtitle: 'Availability index score',
            tag: healthIndex >= 99 ? 'Optimal' : healthIndex >= 90 ? 'Operational' : 'Degraded',
            icon: ShieldCheck,
            accent: 'teal',
            glowColor: 'rgba(20, 184, 166, 0.15)',
            borderHighlight: 'via-teal-500/50',
            iconBg: 'bg-teal-500/10 border-teal-500/25 text-teal-400',
            tagBg: healthIndex >= 95 ? 'bg-teal-500/10 text-teal-300 border-teal-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20',
            progressGradient: 'from-teal-500 to-emerald-400',
            progressVal: healthIndex,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.title}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl p-5",
                            "bg-slate-900/60 backdrop-blur-xl border border-white/[0.08]",
                            "hover:border-white/20 transition-all duration-300 ease-out",
                            "hover:shadow-2xl hover:-translate-y-1"
                        )}
                        style={{
                            boxShadow: `0 10px 30px -10px ${stat.glowColor}`,
                        }}
                    >
                        {/* Top glowing accent hairline */}
                        <div className={cn(
                            "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity",
                            stat.borderHighlight
                        )} />

                        {/* Ambient corner radial light */}
                        <div
                            className="absolute -top-12 -right-12 w-28 h-28 rounded-full pointer-events-none opacity-40 group-hover:opacity-75 blur-2xl transition-opacity duration-500"
                            style={{ backgroundColor: stat.glowColor }}
                        />

                        {/* Header: Title + Icon Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                            <div>
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                                    {stat.title}
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                                        {stat.value}
                                    </h3>
                                </div>
                            </div>

                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform duration-300 group-hover:scale-110 flex-shrink-0",
                                stat.iconBg
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Footer details: Subtitle + Tag badge */}
                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06] relative z-10">
                            <span className="text-xs text-slate-400 truncate">
                                {stat.subtitle}
                            </span>
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border flex-shrink-0",
                                stat.tagBg
                            )}>
                                {stat.tag}
                            </span>
                        </div>

                        {/* Visual micro progress indicator at bottom */}
                        <div className="mt-3 w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                                    stat.progressGradient
                                )}
                                style={{ width: `${Math.min(100, Math.max(5, stat.progressVal))}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatsGrid;
