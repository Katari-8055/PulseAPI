import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const PRESETS = [
    { label: '1H', value: '1h', hours: 1 },
    { label: '4H', value: '4h', hours: 4 },
    { label: '24H', value: '24h', hours: 24 },
    { label: '7D', value: '7d', hours: 168 },
    { label: '30D', value: '30d', hours: 720 },
];

/** 
 * TimeRangeSelector - Premium Segmented Pill Bar
 */
export default function TimeRangeSelector({ onChange, value = '24h', defaultPreset = '24h' }) {
    const [selected, setSelected] = useState(value || defaultPreset);
    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [customError, setCustomError] = useState('');

    useEffect(() => {
        if (value && value !== selected) {
            setSelected(value);
        }
    }, [value]);

    const applyPreset = (preset) => {
        setSelected(preset.value);
        setShowCustom(false);
        setCustomError('');

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - preset.hours * 60 * 60 * 1000);
        onChange({ startTime: startTime.toISOString(), endTime: endTime.toISOString(), preset: preset.value });
    };

    const applyCustom = () => {
        if (!customStart || !customEnd) {
            setCustomError('Please specify both start and end times.');
            return;
        }
        const start = new Date(customStart);
        const end = new Date(customEnd);
        if (start >= end) {
            setCustomError('Start time must precede end time.');
            return;
        }
        setCustomError('');
        setSelected('custom');
        setShowCustom(false);
        onChange({ startTime: start.toISOString(), endTime: end.toISOString(), preset: 'custom' });
    };

    const clearCustom = (e) => {
        e.stopPropagation();
        setSelected('24h');
        setCustomStart('');
        setCustomEnd('');
        setShowCustom(false);
        setCustomError('');
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        onChange({ startTime: startTime.toISOString(), endTime: endTime.toISOString(), preset: '24h' });
    };

    const formatCustomLabel = () => {
        if (!customStart || !customEnd) return 'Custom';
        const fmt = (d) => new Date(d).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return `${fmt(customStart)} – ${fmt(customEnd)}`;
    };

    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    return (
        <div className="relative inline-block z-30">
            {/* Pill Container */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl shadow-black/25">
                <div className="flex items-center pl-2 pr-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-blue-400/80" />
                </div>

                {PRESETS.map((p) => {
                    const isActive = selected === p.value;
                    return (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => applyPreset(p)}
                            className={cn(
                                "relative px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer select-none",
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 border border-blue-400/40"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                            )}
                        >
                            {p.label}
                        </button>
                    );
                })}

                {/* Custom Range Pill */}
                <div className="relative flex items-center">
                    <button
                        type="button"
                        onClick={() => setShowCustom((prev) => !prev)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer select-none",
                            selected === 'custom'
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/40"
                                : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                        )}
                    >
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{selected === 'custom' ? formatCustomLabel() : 'Custom'}</span>
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", showCustom && "rotate-180")} />
                    </button>

                    {selected === 'custom' && (
                        <button
                            type="button"
                            onClick={clearCustom}
                            title="Reset to 24H"
                            className="ml-1 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Range Popover Panel */}
            {showCustom && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" 
                        onClick={() => setShowCustom(false)} 
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Custom Time Window</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCustom(false)}
                                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-mono text-slate-400 mb-1">START DATE & TIME</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all [color-scheme:dark]"
                                    value={customStart}
                                    max={customEnd || nowLocal}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono text-slate-400 mb-1">END DATE & TIME</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all [color-scheme:dark]"
                                    value={customEnd}
                                    min={customStart}
                                    max={nowLocal}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                />
                            </div>

                            {customError && (
                                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg">
                                    {customError}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowCustom(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCustom}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all"
                                >
                                    Apply Range
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
