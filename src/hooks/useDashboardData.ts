import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEMO_CAMPAIGNS, DEMO_SESSIONS } from '../data/demoSessions';
import { fetchSessions } from '../services/api';
import {
  CampaignSpendMetric,
  ClassifiedSession,
  DataMode,
  ErrorBucket,
  PredictRequest,
  PredictResponse,
  SessionRecord,
  SessionStatus,
} from '../types/anomaly';

export type StatusFilter = 'all' | SessionStatus;

export function useDashboardData() {
  const [requestedMode, setRequestedMode] = useState<DataMode>('demo');
  const [activeSource, setActiveSource] = useState<DataMode>('demo');
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [rawSessions, setRawSessions] = useState<SessionRecord[]>(DEMO_SESSIONS);
  const [threshold, setThreshold] = useState<number>(0.55);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state so hundreds of rows render smoothly without DOM lag
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const loadSessions = useCallback(async (mode: DataMode) => {
    setIsLoading(true);
    setFallbackNotice(null);

    const result = await fetchSessions(mode, 500, 0);
    setRawSessions(result.sessions);
    setActiveSource(result.source);
    if (result.fallbackReason) {
      setFallbackNotice(result.fallbackReason);
    }
    setCurrentPage(1);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadSessions(requestedMode);
  }, [requestedMode, loadSessions]);

  const appendDemoSimulatedBatch = useCallback(
    (inputs: PredictRequest[], responses: PredictResponse[]) => {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const mapped: SessionRecord[] = inputs.map((req, idx) => {
        const res = responses[idx];
        const campaignMeta = DEMO_CAMPAIGNS.find((c) => c.id === req.campaign_id);
        return {
          session_id: req.session_id,
          campaign_id: req.campaign_id,
          campaign_name: campaignMeta?.name ?? req.campaign_id,
          clicks: req.clicks,
          session_duration: req.session_duration,
          ad_spend: req.ad_spend,
          ctr: Number(
            Math.min(99, (req.clicks / Math.max(req.session_duration, 1)) * 20).toFixed(1)
          ),
          reconstruction_error: res?.reconstruction_error ?? 0.15,
          anomaly_score: res?.anomaly_score ?? 0.15,
          timestamp: now,
          signal_note: res?.message,
        };
      });

      setRawSessions((prev) => [...mapped, ...prev].slice(0, 1000));
      setCurrentPage(1);
    },
    []
  );

  const classifiedSessions: ClassifiedSession[] = useMemo(() => {
    return rawSessions.map((session) => ({
      ...session,
      status: session.reconstruction_error >= threshold ? 'anomalous' : 'normal',
    }));
  }, [rawSessions, threshold]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classifiedSessions.filter((session) => {
      if (statusFilter !== 'all' && session.status !== statusFilter) return false;
      if (campaignFilter !== 'ALL' && session.campaign_id !== campaignFilter) return false;
      if (
        q &&
        !session.session_id.toLowerCase().includes(q) &&
        !session.campaign_id.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [classifiedSessions, statusFilter, campaignFilter, searchQuery]);

  // Reset to page 1 when filters/search/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, campaignFilter, searchQuery, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedSessions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, safePage, pageSize]);

  const metrics = useMemo(() => {
    const total = classifiedSessions.length;
    const anomalous = classifiedSessions.filter((s) => s.status === 'anomalous').length;
    const normal = total - anomalous;
    const anomalyPercentage = total > 0 ? Number(((anomalous / total) * 100).toFixed(1)) : 0;
    const avgError =
      total > 0
        ? Number(
            (
              classifiedSessions.reduce((acc, s) => acc + s.reconstruction_error, 0) / total
            ).toFixed(3)
          )
        : 0;
    const totalSpend = Number(
      classifiedSessions.reduce((acc, s) => acc + s.ad_spend, 0).toFixed(2)
    );
    const anomalousSpend = Number(
      classifiedSessions
        .filter((s) => s.status === 'anomalous')
        .reduce((acc, s) => acc + s.ad_spend, 0)
        .toFixed(2)
    );

    return {
      total,
      normal,
      anomalous,
      anomalyPercentage,
      avgError,
      totalSpend,
      anomalousSpend,
    };
  }, [classifiedSessions]);

  const campaignSpendData: CampaignSpendMetric[] = useMemo(() => {
    return DEMO_CAMPAIGNS.map((camp) => {
      const items = classifiedSessions.filter((s) => s.campaign_id === camp.id);
      const normalSpend = Number(
        items
          .filter((s) => s.status === 'normal')
          .reduce((sum, s) => sum + s.ad_spend, 0)
          .toFixed(2)
      );
      const anomalousSpend = Number(
        items
          .filter((s) => s.status === 'anomalous')
          .reduce((sum, s) => sum + s.ad_spend, 0)
          .toFixed(2)
      );

      return {
        campaign_id: camp.id,
        campaign_name: camp.name,
        normalSpend,
        anomalousSpend,
        sessions: items.length,
      };
    });
  }, [classifiedSessions]);

  const errorDistributionData: ErrorBucket[] = useMemo(() => {
    const ranges = [
      { range: '0.00–0.20', minError: 0, maxError: 0.2 },
      { range: '0.20–0.40', minError: 0.2, maxError: 0.4 },
      { range: '0.40–0.60', minError: 0.4, maxError: 0.6 },
      { range: '0.60–0.80', minError: 0.6, maxError: 0.8 },
      { range: '0.80–1.00', minError: 0.8, maxError: 1.01 },
    ];

    return ranges.map((bucket) => {
      const inBucket = classifiedSessions.filter(
        (s) =>
          s.reconstruction_error >= bucket.minError &&
          s.reconstruction_error < bucket.maxError
      );
      return {
        ...bucket,
        normalCount: inBucket.filter((s) => s.status === 'normal').length,
        anomalousCount: inBucket.filter((s) => s.status === 'anomalous').length,
      };
    });
  }, [classifiedSessions]);

  const anomalyDistribution = useMemo(
    () => [
      { name: 'Normal Sessions', value: metrics.normal, color: '#10B981' },
      { name: 'Anomalous Sessions', value: metrics.anomalous, color: '#F43F5E' },
    ],
    [metrics.normal, metrics.anomalous]
  );

  return {
    requestedMode,
    setRequestedMode,
    activeSource,
    fallbackNotice,
    isLoading,
    reload: () => loadSessions(requestedMode),
    appendDemoSimulatedBatch,
    threshold,
    setThreshold,
    statusFilter,
    setStatusFilter,
    campaignFilter,
    setCampaignFilter,
    searchQuery,
    setSearchQuery,
    currentPage: safePage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    classifiedSessions,
    filteredSessions,
    paginatedSessions,
    metrics,
    campaignSpendData,
    errorDistributionData,
    anomalyDistribution,
  };
}
