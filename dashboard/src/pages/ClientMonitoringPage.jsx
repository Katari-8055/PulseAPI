import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clientApi } from '../api/api';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import StatsGrid from '../components/StatsGrid';
import TopEndpoints from '../components/TopEndpoints';
import { ApiHitsChart, StatusDistributionChart } from '../components/charts';
import { PageStatus } from '../components/ui';
import { ArrowLeft, Building2, Globe } from 'lucide-react';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function ClientMonitoringPage() {
    const { clientId } = useParams();

    // Fetch client details
    const { data: clientData, isPending: clientPending, error: clientError } = useQuery({
        queryKey: ['admin', 'client', clientId],
        queryFn: () => clientApi.getClientById(clientId),
    });

    // Fetch client analytics
    const { data: analyticsData, isPending: analyticsPending, error: analyticsError, refetch } = useDashboardQuery({ clientId });

    const client = clientData?.data;
    const stats = analyticsData?.data?.stats ?? null;
    const topEndpoints = analyticsData?.data?.topEndpoints ?? [];

    const statusData = useMemo(() => {
        if (!stats) return null;
        return {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            values: [stats.successHits, stats.errorHits],
        };
    }, [stats]);

    const isPending = clientPending || analyticsPending;
    const error = clientError || analyticsError;

    if (isPending || error || !client || !analyticsData) {
        return (
            <PageStatus
                isLoading={isPending}
                error={error}
                onRetry={refetch}
                loadingText="Loading client monitoring dashboard..."
                errorText="Failed to load client data"
            />
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Header / Breadcrumb */}
            <div className="mb-6">
                <Link
                    to="/admin/clients"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Clients
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/80 p-5 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{client.name}</h2>
                            <p className="text-xs text-muted-foreground mt-1">{client.description || 'No description provided.'}</p>
                        </div>
                    </div>
                    {client.website && (
                        <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 hover:border-primary/20 transition-all font-medium self-start md:self-center cursor-pointer"
                        >
                            <Globe className="w-3.5 h-3.5" />
                            Visit Website
                        </a>
                    )}
                </div>
            </div>

            {/* Metrics */}
            <StatsGrid stats={stats} />

            {/* Charts */}
            <div className={styles.gridTwoCols}>
                <ApiHitsChart stats={stats} />
                <StatusDistributionChart data={statusData} />
            </div>

            {/* Top Endpoints (specific to this client) */}
            <TopEndpoints endpoints={topEndpoints} />
        </div>
    );
}
