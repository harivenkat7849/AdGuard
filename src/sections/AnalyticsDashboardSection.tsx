import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Layers,
  RefreshCw,
  Search,
  Send,
  Server,
  SlidersHorizontal,
  Upload,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { DemoBadge } from '../components/DemoBadge';
import { SectionHeader } from '../components/SectionHeader';
import { DEMO_CAMPAIGNS } from '../data/demoSessions';
import { StatusFilter, useDashboardData } from '../hooks/useDashboardData';
import { useSectionReveal } from '../hooks/useGsapAnimations';
import {
  checkBackendHealth,
  generateSyntheticBatch,
  getApiBaseUrl,
  MAX_BATCH_SESSIONS,
  parseBatchCsv,
  predictBatch,
  predictSession,
} from '../services/api';
import { BatchPredictResponse, PredictRequest, PredictResponse } from '../types/anomaly';

interface AnalyticsDashboardSectionProps {
  standalone?: boolean;
}

export const AnalyticsDashboardSection: React.FC<AnalyticsDashboardSectionProps> = ({
  standalone = false,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionReveal(sectionRef);

  const {
    requestedMode,
    setRequestedMode,
    activeSource,
    fallbackNotice,
    isLoading,
    reload,
    appendDemoSimulatedBatch,
    threshold,
    setThreshold,
    statusFilter,
    setStatusFilter,
    campaignFilter,
    setCampaignFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    filteredSessions,
    paginatedSessions,
    metrics,
    campaignSpendData,
    errorDistributionData,
    anomalyDistribution,
  } = useDashboardData();

  // FastAPI Single-Session & Batch Inference Tester state
  const [testerTab, setTesterTab] = useState<'single' | 'batch'>('single');
  const [formSessionId, setFormSessionId] = useState('SESSION_TEST_01');
  const [formCampaignId, setFormCampaignId] = useState('CAMPAIGN_01');
  const [formClicks, setFormClicks] = useState(36);
  const [formDuration, setFormDuration] = useState(16);
  const [formSpend, setFormSpend] = useState(112.5);
  const [predicting, setPredicting] = useState(false);
  const [predictResult, setPredictResult] = useState<PredictResponse | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  const [queuedBatch, setQueuedBatch] = useState<PredictRequest[]>([]);
  const [batchName, setBatchName] = useState<string>('');
  const [batchResult, setBatchResult] = useState<BatchPredictResponse | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setPredictError(null);

    try {
      const response = await predictSession(
        {
          session_id: formSessionId.trim() || 'SESSION_TEST_01',
          clicks: Number(formClicks),
          session_duration: Number(formDuration),
          campaign_id: formCampaignId,
          ad_spend: Number(formSpend),
        },
        requestedMode,
        threshold
      );
      setPredictResult(response);
      if (requestedMode === 'live') {
        void reload();
      } else {
        appendDemoSimulatedBatch(
          [
            {
              session_id: formSessionId.trim() || 'SESSION_TEST_01',
              clicks: Number(formClicks),
              session_duration: Number(formDuration),
              campaign_id: formCampaignId,
              ad_spend: Number(formSpend),
            },
          ],
          [response]
        );
      }
    } catch (err) {
      setPredictResult(null);
      setPredictError(
        err instanceof Error ? err.message : 'Prediction request failed.'
      );
    } finally {
      setPredicting(false);
    }
  };

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseBatchCsv(text);
    setQueuedBatch(parsed);
    setBatchName(file.name);
    setBatchError(
      parsed.length === 0
        ? 'No valid rows found. Expected columns: session_id,campaign_id,clicks,session_duration,ad_spend'
        : null
    );
    setBatchResult(null);
  };

  const handleLoadSynthetic250 = () => {
    const generated = generateSyntheticBatch(250);
    setQueuedBatch(generated);
    setBatchName('synthetic_250_sessions.demo');
    setBatchError(null);
    setBatchResult(null);
  };

  const handleBatchSubmit = async () => {
    if (queuedBatch.length === 0) return;
    setBatchSubmitting(true);
    setBatchError(null);

    try {
      const res = await predictBatch(queuedBatch, requestedMode, threshold);
      setBatchResult(res);
      if (requestedMode === 'live') {
        await reload();
      } else {
        appendDemoSimulatedBatch(queuedBatch, res.results);
      }
    } catch (err) {
      setBatchResult(null);
      setBatchError(
        err instanceof Error ? err.message : 'Batch prediction failed.'
      );
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleHealthCheck = async () => {
    setHealthStatus('Checking...');
    try {
      const res = await checkBackendHealth();
      setHealthStatus(`Connected (${res.status})`);
    } catch (err) {
      setHealthStatus(
        err instanceof Error ? err.message : 'Backend unavailable'
      );
    }
  };

  return (
    <section
      id="analytics"
      ref={sectionRef}
      className="border-b border-white/[0.06] py-20 sm:py-24 scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Interactive Analytics"
          title="Ad Spend & Session Anomaly Console"
          description="Explore synthetic session telemetry, adjust the reconstruction error threshold dynamically, inspect campaign spend impact, or switch to LIVE MODE to query a FastAPI backend."
          rightSlot={
            <div className="flex flex-wrap items-center gap-2.5">
              <DemoBadge
                label={activeSource === 'live' ? 'LIVE FASTAPI DATA' : 'DEMO DATA'}
                variant={activeSource === 'live' ? 'live' : 'demo'}
              />
              {!standalone && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-emerald-500/40 hover:text-white"
                >
                  Open Console View
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          }
        />

        {/* Mode Switcher & Threshold Control Bar */}
        <div
          data-reveal
          className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Mode Toggle */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                  Data Source Mode
                </span>
                <div
                  className="inline-flex rounded-lg border border-white/10 bg-[#080A0E] p-1"
                  role="group"
                  aria-label="Data Source Mode"
                >
                  <button
                    type="button"
                    onClick={() => setRequestedMode('demo')}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-all cursor-pointer ${
                      requestedMode === 'demo'
                        ? 'bg-lime-400/15 text-lime-300 border border-lime-400/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    DEMO MODE
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestedMode('live')}
                    className={`rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-all cursor-pointer ${
                      requestedMode === 'live'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    LIVE MODE
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void reload()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <p className="font-mono text-[11px] text-zinc-500">
                Configured endpoint: <span className="text-zinc-300">{getApiBaseUrl()}</span>
              </p>
            </div>

            {/* Threshold Adjustment Slider */}
            <div className="w-full max-w-md rounded-xl border border-white/[0.07] bg-[#080A0E] p-4">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="threshold-slider"
                  className="flex items-center gap-2 text-xs font-medium text-zinc-200"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                  Anomaly Threshold (τ)
                </label>
                <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-300 border border-emerald-500/25">
                  {threshold.toFixed(2)}
                </span>
              </div>

              <input
                id="threshold-slider"
                type="range"
                min={0.1}
                max={0.95}
                step={0.01}
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="adguard-slider mt-3 w-full"
              />

              <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span>0.10 (Sensitive)</span>
                <span>0.55 (Balanced)</span>
                <span>0.95 (Strict)</span>
              </div>
            </div>
          </div>

          {/* Explicit Fallback Notice when LIVE MODE cannot reach FastAPI */}
          {fallbackNotice && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div>
                <p className="font-semibold">FastAPI Backend Unavailable — Fallback Active</p>
                <p className="mt-0.5 text-amber-200/80">{fallbackNotice}</p>
              </div>
            </div>
          )}
        </div>

        {/* KPI Metrics Strip */}
        <div
          data-reveal
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                Total Sessions Analyzed
              </span>
              <DemoBadge label="DEMO" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-white">
              <AnimatedCounter value={metrics.total} />
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">
              Total spend: ${metrics.totalSpend.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5">
            <span className="text-xs font-medium text-zinc-400">Normal Sessions</span>
            <p className="mt-3 font-display text-3xl font-semibold text-emerald-300">
              <AnimatedCounter value={metrics.normal} />
            </p>
            <p className="mt-1 font-mono text-[11px] text-emerald-400/80">
              Below τ = {threshold.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5">
            <span className="text-xs font-medium text-rose-200/80">
              Anomalous Sessions
            </span>
            <p className="mt-3 font-display text-3xl font-semibold text-rose-300">
              <AnimatedCounter value={metrics.anomalous} />
            </p>
            <p className="mt-1 font-mono text-[11px] text-rose-300/80">
              At-risk spend: ${metrics.anomalousSpend.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5">
            <span className="text-xs font-medium text-zinc-400">
              Anomaly Percentage
            </span>
            <p className="mt-3 font-display text-3xl font-semibold text-lime-300">
              <AnimatedCounter value={metrics.anomalyPercentage} decimals={1} suffix="%" />
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">
              Updates live with threshold
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5">
            <span className="text-xs font-medium text-zinc-400">
              Avg Reconstruction Error
            </span>
            <p className="mt-3 font-display text-3xl font-semibold text-white">
              <AnimatedCounter value={metrics.avgError} decimals={3} />
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">
              Mean MSE across sessions
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div
          data-reveal
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          {/* Campaign Spending Overview */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 lg:col-span-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Campaign Spending Overview
                </h3>
                <p className="text-xs text-zinc-400">
                  Normal vs. flagged spend by campaign (USD)
                </p>
              </div>
              <DemoBadge label="DEMO DATA" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignSpendData}
                  margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="campaign_id"
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111318',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F3F4F6',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="normalSpend"
                    name="Normal Spend"
                    stackId="spend"
                    fill="#10B981"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="anomalousSpend"
                    name="Anomalous Spend"
                    stackId="spend"
                    fill="#F43F5E"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly Distribution */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Anomaly Distribution
                </h3>
                <p className="text-xs text-zinc-400">Session split at τ = {threshold.toFixed(2)}</p>
              </div>
              <DemoBadge label="DEMO" />
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anomalyDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={4}
                  >
                    {anomalyDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111318',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F3F4F6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1.5 text-xs">
              {anomalyDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reconstruction Error Distribution */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5 lg:col-span-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Reconstruction Error Distribution
                </h3>
                <p className="text-xs text-zinc-400">
                  Session count across error buckets
                </p>
              </div>
              <DemoBadge label="DEMO DATA" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={errorDistributionData}
                  margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111318',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F3F4F6',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey="normalCount"
                    name="Normal"
                    stackId="err"
                    fill="#34D399"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="anomalousCount"
                    name="Anomalous"
                    stackId="err"
                    fill="#F43F5E"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Session-Level Detection Table */}
        <div
          data-reveal
          className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5"
        >
          <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Session-Level Detection Log
                </h3>
                <p className="text-xs text-zinc-400">
                  Showing {filteredSessions.length} sessions classified dynamically at τ ={' '}
                  {threshold.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter Pills */}
              <div
                className="inline-flex rounded-lg border border-white/10 bg-[#080A0E] p-1"
                role="group"
                aria-label="Filter sessions by status"
              >
                {(['all', 'normal', 'anomalous'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {status === 'all' ? 'All Sessions' : status}
                  </button>
                ))}
              </div>

              {/* Campaign Filter */}
              <div className="relative">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <select
                  aria-label="Filter by campaign"
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#080A0E] py-1.5 pl-8 pr-3 text-xs text-zinc-200 focus:border-emerald-400 focus:outline-none"
                >
                  <option value="ALL">All Campaigns</option>
                  {DEMO_CAMPAIGNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Session ID */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Session ID..."
                  aria-label="Search Session ID"
                  className="w-48 rounded-lg border border-white/10 bg-[#080A0E] py-1.5 pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 pr-4 font-medium">Session ID</th>
                  <th className="pb-3 pr-4 font-medium">Campaign</th>
                  <th className="pb-3 pr-4 font-medium">Clicks</th>
                  <th className="pb-3 pr-4 font-medium">Spend</th>
                  <th className="pb-3 pr-4 font-medium">Reconstruction Error</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-zinc-500">
                      No sessions match the active filters. Try clearing your search query or switching status filter.
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session, idx) => {
                    const isAnomalous = session.status === 'anomalous';
                    return (
                      <tr
                        key={`${session.session_id}-${idx}`}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="py-3.5 pr-4 font-mono text-xs font-semibold text-white">
                          {session.session_id}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="font-mono text-xs text-zinc-300">
                            {session.campaign_id}
                          </span>
                          <span className="ml-2 hidden text-xs text-zinc-500 xl:inline">
                            {session.campaign_name}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-xs text-zinc-300">
                          {session.clicks}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-xs text-zinc-300">
                          ${session.ad_spend.toFixed(2)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                isAnomalous ? 'text-rose-300' : 'text-emerald-300'
                              }`}
                            >
                              {session.reconstruction_error.toFixed(2)}
                            </span>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isAnomalous ? 'bg-rose-400' : 'bg-emerald-400'
                                }`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(session.reconstruction_error * 100)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium capitalize ${
                              isAnomalous
                                ? 'border-rose-500/30 bg-rose-500/12 text-rose-300'
                                : 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isAnomalous ? 'bg-rose-400' : 'bg-emerald-400'
                              }`}
                            />
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer for Hundreds of Sessions */}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-white/[0.07] pt-4 text-xs text-zinc-400 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span>Rows per page:</span>
              <select
                aria-label="Rows per page"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-md border border-white/10 bg-[#080A0E] px-2 py-1 font-mono text-xs text-zinc-200 focus:border-emerald-400 focus:outline-none"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="font-mono text-zinc-500">
                ({filteredSessions.length} total matching)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#080A0E] px-2.5 py-1 text-xs text-zinc-300 hover:border-white/25 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="font-mono text-xs text-zinc-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#080A0E] px-2.5 py-1 text-xs text-zinc-300 hover:border-white/25 disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* FastAPI Single-Session & Batch Inference Simulator / Live Tester */}
        <div
          data-reveal
          className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0D1016] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
            <div className="flex items-center gap-2.5">
              <Server className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  Session Anomaly Inference Tester (`POST /predict` &amp; `/predict/batch`)
                </h3>
                <p className="text-xs text-zinc-400">
                  {requestedMode === 'live'
                    ? `Sends live requests to ${getApiBaseUrl()} and persists scored rows to the backend database.`
                    : 'Runs an illustrative DEMO SIMULATION locally. Switch to LIVE MODE to call FastAPI.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex rounded-lg border border-white/10 bg-[#080A0E] p-1"
                role="tablist"
                aria-label="Inference mode tabs"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={testerTab === 'single'}
                  onClick={() => setTesterTab('single')}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors cursor-pointer ${
                    testerTab === 'single'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Single (/predict)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={testerTab === 'batch'}
                  onClick={() => setTesterTab('batch')}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors cursor-pointer ${
                    testerTab === 'batch'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Batch (Up to {MAX_BATCH_SESSIONS})
                </button>
              </div>
              <button
                type="button"
                onClick={handleHealthCheck}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-zinc-300 hover:border-white/20 hover:text-white cursor-pointer"
              >
                Ping /health
              </button>
              {healthStatus && (
                <span className="font-mono text-[11px] text-zinc-400">
                  {healthStatus}
                </span>
              )}
            </div>
          </div>

          {testerTab === 'batch' ? (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <div className="rounded-xl border border-dashed border-white/15 bg-[#080A0E] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Upload CSV Batch (max {MAX_BATCH_SESSIONS} sessions/request)
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        Columns: session_id,campaign_id,clicks,session_duration,ad_spend
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-200 hover:border-emerald-400/40 cursor-pointer">
                        <Upload className="h-3.5 w-3.5 text-emerald-400" />
                        Choose CSV
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(e) => void handleCsvFileChange(e)}
                          className="sr-only"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSynthetic250}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-xs font-medium text-lime-300 hover:bg-lime-400/15 cursor-pointer"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        Generate 250 Demo Rows
                      </button>
                    </div>
                  </div>
                  {queuedBatch.length > 0 && (
                    <p className="mt-3 font-mono text-xs text-emerald-300">
                      Ready: {queuedBatch.length} sessions queued from {batchName}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={queuedBatch.length === 0 || batchSubmitting}
                  onClick={() => void handleBatchSubmit()}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-300 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {batchSubmitting
                    ? 'Processing Vectorized Batch...'
                    : requestedMode === 'live'
                      ? `Send ${queuedBatch.length} Sessions to /predict/batch`
                      : `Run Batch Demo Simulation (${queuedBatch.length} rows)`}
                </button>
              </div>

              <div className="flex flex-col justify-center rounded-xl border border-white/[0.07] bg-[#080A0E] p-4 lg:col-span-5">
                {batchError && (
                  <div className="flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Batch Error</p>
                      <p className="mt-1 text-rose-200/80">{batchError}</p>
                    </div>
                  </div>
                )}

                {!batchError && !batchResult && (
                  <div className="text-xs text-zinc-400">
                    <p className="font-medium text-zinc-200">
                      Vectorized Batch Scoring &amp; Storage
                    </p>
                    <p className="mt-1.5 text-zinc-500">
                      Scores up to {MAX_BATCH_SESSIONS} sessions in one NumPy/PyTorch tensor pass and bulk-inserts them into the database without blocking the server.
                    </p>
                  </div>
                )}

                {!batchError && batchResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-white">
                        Processed {batchResult.processed} Sessions
                      </span>
                      <DemoBadge
                        label={
                          batchResult.source === 'live'
                            ? 'LIVE BATCH SAVED'
                            : 'DEMO SIMULATION'
                        }
                        variant={batchResult.source === 'live' ? 'live' : 'illustrative'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="font-mono text-[10px] text-zinc-500">NORMAL</p>
                        <p className="mt-1 font-mono text-lg font-semibold text-emerald-300">
                          {batchResult.normal_count}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                        <p className="font-mono text-[10px] text-zinc-500">ANOMALOUS</p>
                        <p className="mt-1 font-mono text-lg font-semibold text-rose-300">
                          {batchResult.anomalous_count}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-400">
                      Engine: {batchResult.model_mode} · Table &amp; charts updated above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <form
              onSubmit={handlePredictSubmit}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7"
            >
              <div>
                <label className="block font-mono text-[11px] text-zinc-400">
                  session_id
                </label>
                <input
                  type="text"
                  value={formSessionId}
                  onChange={(e) => setFormSessionId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#080A0E] px-3 py-2 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-zinc-400">
                  campaign_id
                </label>
                <select
                  value={formCampaignId}
                  onChange={(e) => setFormCampaignId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#080A0E] px-3 py-2 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                >
                  {DEMO_CAMPAIGNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-zinc-400">
                  clicks
                </label>
                <input
                  type="number"
                  min={0}
                  value={formClicks}
                  onChange={(e) => setFormClicks(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#080A0E] px-3 py-2 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-zinc-400">
                  session_duration (sec)
                </label>
                <input
                  type="number"
                  min={1}
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#080A0E] px-3 py-2 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-[11px] text-zinc-400">
                  ad_spend (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={formSpend}
                  onChange={(e) => setFormSpend(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#080A0E] px-3 py-2 font-mono text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={predicting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-300 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {predicting
                    ? 'Scoring Session...'
                    : requestedMode === 'live'
                      ? 'Send to FastAPI /predict'
                      : 'Run Demo Simulation'}
                </button>
              </div>
            </form>

            {/* Result Card */}
            <div className="flex flex-col justify-center rounded-xl border border-white/[0.07] bg-[#080A0E] p-4 lg:col-span-5">
              {predictError && (
                <div className="flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">FastAPI Request Failed</p>
                    <p className="mt-1 text-rose-200/80">{predictError}</p>
                  </div>
                </div>
              )}

              {!predictError && !predictResult && (
                <div className="text-xs text-zinc-400">
                  <p className="font-medium text-zinc-200">
                    Submit a session payload to inspect the assessment.
                  </p>
                  <p className="mt-1.5 text-zinc-500">
                    In DEMO MODE, values are computed by an illustrative local heuristic and explicitly tagged as DEMO SIMULATION.
                  </p>
                </div>
              )}

              {!predictError && predictResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white">
                      {predictResult.session_id}
                    </span>
                    <DemoBadge
                      label={
                        predictResult.source === 'live'
                          ? 'LIVE MODEL RESPONSE'
                          : 'DEMO SIMULATION'
                      }
                      variant={predictResult.source === 'live' ? 'live' : 'illustrative'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                      <p className="font-mono text-[10px] text-zinc-500">
                        RECONSTRUCTION ERROR
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-white">
                        {predictResult.reconstruction_error.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                      <p className="font-mono text-[10px] text-zinc-500">STATUS</p>
                      <p
                        className={`mt-1 flex items-center gap-1.5 font-mono text-sm font-semibold uppercase ${
                          predictResult.status === 'anomalous'
                            ? 'text-rose-300'
                            : 'text-emerald-300'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {predictResult.status}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300">{predictResult.message}</p>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
};
