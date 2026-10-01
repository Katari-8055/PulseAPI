import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/api';
import { QUERY_KEYS, REFETCH_INTERVAL } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const getMockDemoData = (params) => ({
    success: true,
    data: {
        stats: {
            totalHits: 142850,
            successHits: 139720,
            errorHits: 3130,
            errorRate: 2.19,
            avgLatency: 48.72,
            uniqueServices: 6,
            uniqueEndpoints: 18,
            uniqueUsers: 1420,
            timeRange: {
                start: params?.startTime || new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
                end: params?.endTime || new Date().toISOString()
            }
        },
        topEndpoints: [
            { endpoint: '/api/v1/auth/token', method: 'POST', serviceName: 'auth-gateway', totalHits: 48200, avgLatency: '24.5', errorRate: '0.4' },
            { endpoint: '/api/v1/users/profile', method: 'GET', serviceName: 'user-service', totalHits: 36400, avgLatency: '32.1', errorRate: '0.1' },
            { endpoint: '/api/v1/payments/charge', method: 'POST', serviceName: 'billing-service', totalHits: 21900, avgLatency: '89.4', errorRate: '1.2' },
            { endpoint: '/api/v1/webhooks/stripe', method: 'POST', serviceName: 'webhook-worker', totalHits: 18100, avgLatency: '41.0', errorRate: '0.0' },
            { endpoint: '/api/v1/search/analytics', method: 'GET', serviceName: 'analytics-core', totalHits: 12450, avgLatency: '68.2', errorRate: '3.8' },
            { endpoint: '/api/v1/telemetry/ingest', method: 'PUT', serviceName: 'stream-ingest', totalHits: 5800, avgLatency: '18.7', errorRate: '0.0' }
        ]
    }
});

/**
 * Fetches dashboard data for a given time range (or serves rich mock telemetry in demo mode).
 */
export function useDashboardQuery(params = {}, options = {}) {
    const { user } = useAuth();
    const isDemo = user?.isDemo || (typeof window !== 'undefined' && localStorage.getItem('isDemoMode') === 'true');

    return useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD, params, isDemo ? 'demo' : 'live'],
        queryFn: () => isDemo ? Promise.resolve(getMockDemoData(params)) : analyticsApi.getDashboard(params),
        refetchInterval: isDemo ? false : REFETCH_INTERVAL,
        placeholderData: (previousData) => previousData,
        ...options,
    });
}
