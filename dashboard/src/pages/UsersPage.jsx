import { useQuery } from '@tanstack/react-query';
import { clientApi } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, Loader2, ShieldCheck, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

const ROLE_CONFIG = {
    client_admin: { label: 'Admin', color: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20' },
    client_viewer: { label: 'Viewer', color: 'bg-slate-500/10 text-slate-400 ring-slate-500/20' },
    super_admin: { label: 'Super Admin', color: 'bg-purple-500/10 text-purple-400 ring-purple-500/20' },
};

function UserRow({ user }) {
    const roleConf = ROLE_CONFIG[user.role] || { label: user.role, color: 'bg-slate-500/10 text-slate-400 ring-slate-500/20' };
    const initials = (user.username || user.email || 'U').slice(0, 2).toUpperCase();

    return (
        <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-300">
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-200">{user.username || '—'}</p>
                        <p className="text-xs text-slate-500">{user.email || '—'}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1',
                    roleConf.color
                )}>
                    {roleConf.label}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1',
                    user.isActive
                        ? 'bg-green-500/10 text-green-400 ring-green-500/20'
                        : 'bg-slate-500/10 text-slate-400 ring-slate-500/20'
                )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', user.isActive ? 'bg-green-400' : 'bg-slate-500')} />
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-4 py-3 text-xs text-slate-500">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </td>
        </tr>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4 ring-1 ring-indigo-500/20">
                <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-slate-300 mb-1">No users yet</h3>
            <p className="text-xs text-slate-600 max-w-xs">Invite team members to collaborate on your API management.</p>
        </div>
    );
}

export function UsersPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'client_admin' || user?.role === 'super_admin';

    const { data, isPending, error } = useQuery({
        queryKey: ['users', user?.clientId],
        queryFn: () => clientApi.getMyUsers(),
        enabled: !!user?.clientId,
    });

    const users = data?.data || [];
    const admins = users.filter(u => u.role === 'client_admin');
    const viewers = users.filter(u => u.role === 'client_viewer');

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-100">Team Members</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage users in your organization</p>
                </div>
                {isAdmin && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <UserPlus className="w-4 h-4" />
                        Invite User
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Members', value: users.length, icon: Users },
                    { label: 'Admins', value: admins.length, icon: ShieldCheck },
                    { label: 'Viewers', value: viewers.length, icon: Eye },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{s.label}</p>
                                <p className="text-xl font-semibold text-slate-100">{s.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Users className="w-4 h-4 text-indigo-400" />
                        Users
                    </div>
                    <span className="text-xs text-slate-600">{users.length} total</span>
                </div>

                {isPending ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16 text-sm text-red-400">
                        Failed to load users
                    </div>
                ) : users.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800/60 text-left">
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => <UserRow key={u._id} user={u} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
