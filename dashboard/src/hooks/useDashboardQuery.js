import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/api';
import { QUERY_KEYS, REFETCH_INTERVAL } from '../constants';

export function useDashboardQuery(params = {}, options = {}) {
    return useQuery({
        queryKey: [...QUERY_KEYS.DASHBOARD, params],
        queryFn: () => analyticsApi.getDashboard(params),
        refetchInterval: REFETCH_INTERVAL,
        ...options,
    });
}
