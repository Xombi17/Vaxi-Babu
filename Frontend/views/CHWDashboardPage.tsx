'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback } from 'react';
import {
  Users, AlertTriangle, CheckCircle2, Clock, Download,
  Mic, MicOff, ChevronDown, ChevronUp, RefreshCw, Activity,
  MapPin, Shield, FileText, Square, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchCHWHouseholds() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/v1/chw/households`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function downloadComplianceReport(format: 'json' | 'csv') {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/v1/chw/compliance-report?format=${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Report failed');

  if (format === 'csv') {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chw_compliance_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chw_compliance_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

async function submitFieldReport(voiceNote: string, householdId?: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/v1/chw/field-report`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voice_note: voiceNote, household_id: householdId }),
  });
  if (!res.ok) throw new Error('Field report failed');
  return res.json();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ color }: { color: 'red' | 'amber' | 'green' }) {
  const map = {
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };
  const label = { red: 'At Risk', amber: 'Needs Attention', green: 'On Track' };
  const Icon = { red: AlertTriangle, amber: Clock, green: CheckCircle2 }[color];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${map[color]}`}>
      <Icon size={11} />
      {label[color]}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="text-xs font-black text-white relative z-10">{score}%</span>
    </div>
  );
}

function HouseholdCard({ household, index }: { household: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reportResult, setReportResult] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  let mediaRecorder: MediaRecorder | null = null;

  const handleSubmitReport = async () => {
    if (!reportNote.trim()) return;
    setReportLoading(true);
    try {
      const result = await submitFieldReport(reportNote, household.household_id);
      setReportResult(result.report);
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border overflow-hidden ${
        household.is_at_risk
          ? 'border-red-500/25 bg-red-500/5'
          : household.status_color === 'amber'
          ? 'border-amber-500/20 bg-amber-500/5'
          : 'border-white/[0.06] bg-white/[0.03]'
      }`}
    >
      {/* Card Header */}
      <button
        id={`chw-household-${household.household_id}`}
        onClick={() => setExpanded((e) => !e)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <ScoreRing score={household.health_score} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-heading font-700 text-white text-sm">{household.household_name}</p>
            <StatusBadge color={household.status_color} />
          </div>
          <div className="flex items-center gap-3 text-xs text-white/40">
            {household.village_town && (
              <span className="flex items-center gap-1"><MapPin size={10} />{household.village_town}</span>
            )}
            <span><Users size={10} className="inline mr-1" />{household.total_members} members</span>
            {household.overdue_count > 0 && (
              <span className="text-red-400 font-bold">{household.overdue_count} overdue</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-white/30">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/25">Events</p>
            <p className="text-sm font-bold text-white/60">
              {household.completed_events}/{household.total_events}
            </p>
          </div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded: dependents + field report */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/[0.06] pt-4">
              {/* Dependent rows */}
              {household.dependents?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Members</p>
                  {household.dependents.map((dep: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm text-white font-medium">{dep.name}</p>
                        <p className="text-xs text-white/30">{dep.type} · {dep.age_months}mo</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/50">{dep.completed}/{dep.total} done</p>
                        {dep.overdue > 0 && (
                          <p className="text-xs text-red-400 font-bold">{dep.overdue} overdue</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* D3 — Field Report */}
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">
                  <FileText size={10} className="inline mr-1" />Field Report
                </p>
                <textarea
                  id={`field-report-${household.household_id}`}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Type or speak your visit notes... (e.g. 'Visited Ravi family. Child received OPV. Mother asked about fever.')"
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-teal-500/40 transition-colors"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    id={`submit-report-${household.household_id}`}
                    onClick={handleSubmitReport}
                    disabled={reportLoading || !reportNote.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-500/15 border border-teal-500/20 rounded-xl text-teal-400 text-xs font-bold hover:bg-teal-500/25 transition-colors disabled:opacity-40"
                  >
                    {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    {reportLoading ? 'Structuring...' : 'Generate Report'}
                  </button>
                </div>

                {/* Report result */}
                <AnimatePresence>
                  {reportResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 bg-teal-500/5 border border-teal-500/15 rounded-xl p-3 space-y-2"
                    >
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-widest">Structured Report</p>
                      {Object.entries(reportResult).map(([key, val]) => (
                        val && key !== 'visit_date' && key !== 'worker_name' ? (
                          <div key={key}>
                            <p className="text-xs text-white/30 capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-white/70">
                              {Array.isArray(val) ? (val as any[]).join(', ') || '—' : String(val)}
                            </p>
                          </div>
                        ) : null
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CHWDashboardPage() {
  const { language } = useAuthStore();
  const [exportLoading, setExportLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'at_risk' | 'on_track'>('all');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['chw-households'],
    queryFn: fetchCHWHouseholds,
    staleTime: 2 * 60 * 1000,
  });

  const handleExport = async (format: 'json' | 'csv') => {
    setExportLoading(true);
    try {
      await downloadComplianceReport(format);
    } catch (e) {
      console.error(e);
    } finally {
      setExportLoading(false);
    }
  };

  const households: any[] = data?.households ?? [];
  const stats = data?.stats ?? {};
  const worker = data?.worker ?? {};

  const filtered = households.filter((h) => {
    if (filter === 'at_risk') return h.is_at_risk;
    if (filter === 'on_track') return !h.is_at_risk;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <Shield size={14} className="text-orange-400" />
              </div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                CHW / ASHA Mode
              </span>
            </div>
            <h1 className="font-heading font-800 text-2xl text-white">Field Dashboard</h1>
            {worker.name && (
              <p className="text-sm text-white/35 mt-0.5">
                {worker.name} · {worker.district || worker.state || 'All areas'}
              </p>
            )}
          </div>
          <button
            id="chw-refresh"
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-teal-400 transition-colors"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </motion.div>

      {/* Stats strip */}
      {!isLoading && data && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Households', value: stats.total_households ?? 0, color: 'text-white', icon: Users },
            { label: 'At Risk', value: stats.at_risk ?? 0, color: 'text-red-400', icon: AlertTriangle },
            { label: 'On Track', value: stats.on_track ?? 0, color: 'text-emerald-400', icon: CheckCircle2 },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-white/30 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter tabs */}
      {!isLoading && households.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2"
        >
          {(['all', 'at_risk', 'on_track'] as const).map((f) => (
            <button
              key={f}
              id={`chw-filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filter === f
                  ? 'bg-teal-500/15 text-teal-400 border-teal-500/20'
                  : 'bg-white/[0.04] text-white/30 border-white/[0.06] hover:text-white/60'
              }`}
            >
              {f === 'all' ? 'All' : f === 'at_risk' ? '⚠ At Risk' : '✓ On Track'}
            </button>
          ))}

          {/* D4 — Export */}
          <div className="ml-auto flex gap-2">
            <button
              id="chw-export-csv"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-bold text-white/40 hover:text-teal-400 hover:border-teal-500/20 transition-colors disabled:opacity-40"
            >
              {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              CSV
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Activity size={24} className="text-orange-400 animate-pulse" />
          </div>
          <p className="text-sm text-white/30">Loading household data...</p>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <p className="text-sm font-bold text-white/60">CHW Mode Unavailable</p>
          <p className="text-xs text-white/30 max-w-xs">
            {(error as any)?.message?.includes('403')
              ? 'Your account must be set to ASHA, Anganwadi, or Health Worker type to use this mode.'
              : 'Could not load household data. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-white/[0.06] rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && households.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center">
            <Users size={22} className="text-white/20" />
          </div>
          <p className="text-sm font-bold text-white/40">No households in your area yet</p>
          <p className="text-xs text-white/25 max-w-xs">
            Households with the same district or state will appear here automatically.
          </p>
        </div>
      )}

      {/* Household list */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest">
            {filtered.length} household{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map((hh, i) => (
            <HouseholdCard key={hh.household_id} household={hh} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
