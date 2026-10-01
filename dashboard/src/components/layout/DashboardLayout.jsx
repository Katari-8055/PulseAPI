import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, LogOut, RefreshCw, Bell } from 'lucide-react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../constants';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardLayout({ children, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const queryClient = useQueryClient();
    const isFetching = useIsFetching() > 0;
    const { user } = useAuth();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {user?.isDemo && (
                    <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border-b border-indigo-500/30 px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md flex-shrink-0 z-20">
                        <div className="flex items-center gap-2 text-indigo-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="font-semibold text-white">Live Recruiter Demo</span>
                            <span className="hidden sm:inline text-slate-300">— Showing high-throughput simulated API metrics without credentials.</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-3 py-1 rounded-md bg-indigo-600/40 hover:bg-indigo-600/70 text-white border border-indigo-400/30 font-medium transition-all text-xs cursor-pointer shadow-sm"
                        >
                            Exit Demo
                        </button>
                    </div>
                )}

                {/* Top Header */}
                <header className="flex items-center justify-between px-4 lg:px-6 h-14 border-b border-border/45 bg-background/80 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle menu"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Breadcrumb area - can be injected per page */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground/80">
                            <span className="text-foreground font-medium">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Refresh */}
                        <button
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
                            onClick={handleRefresh}
                            disabled={isFetching}
                            aria-label="Refresh data"
                        >
                            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
                        </button>

                        {/* Notification bell */}
                        <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>

                        {/* Divider */}
                        <div className="h-5 w-px bg-border/40 mx-1" />

                        {/* User avatar + logout */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                                    {(user?.username || user?.name || 'U')[0].toUpperCase()}
                                </div>
                                <span className="hidden sm:block text-muted-foreground font-medium max-w-[120px] truncate">
                                    {user?.username || user?.name || 'User'}
                                </span>
                            </div>

                            <button
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                onClick={onLogout}
                                aria-label="Log out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
