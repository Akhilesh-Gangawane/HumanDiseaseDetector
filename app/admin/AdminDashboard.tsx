'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ShieldCheck, Shield, Clock, RefreshCw, LogOut,
  ChevronDown, Search, CheckCircle, XCircle, AlertTriangle,
  Stethoscope, User, Calendar, Building2, Hash, Filter
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Swal from 'sweetalert2'

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'unverified'

interface DoctorRow {
  id: string
  user_id: string
  specialization: string | null
  license_number: string | null
  medical_council: string | null
  registration_number: string | null
  registration_year: number | null
  verification_status: VerificationStatus
  rejection_reason: string | null
  verified_at: string | null
  created_at: string
  users: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

const STATUS_TABS: { label: string; value: VerificationStatus; color: string }[] = [
  { label: 'Pending Review', value: 'pending',    color: 'amber'  },
  { label: 'Verified',       value: 'verified',   color: 'green'  },
  { label: 'Rejected',       value: 'rejected',   color: 'red'    },
  { label: 'Unverified',     value: 'unverified', color: 'gray'   },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab]   = useState<VerificationStatus>('pending')
  const [doctors, setDoctors]       = useState<DoctorRow[]>([])
  const [filtered, setFiltered]     = useState<DoctorRow[]>([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchDoctors = useCallback(async (status: VerificationStatus) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/doctors?status=${status}`)
      const data = await res.json()
      setDoctors(data.doctors ?? [])
      setFiltered(data.doctors ?? [])
    } catch {
      Swal.fire({ icon: 'error', title: 'Failed to load', text: 'Could not fetch doctor list.', confirmButtonColor: '#3b82f6' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDoctors(activeTab) }, [activeTab, fetchDoctors])

  // Client-side search filter
  useEffect(() => {
    const q = search.toLowerCase()
    if (!q) { setFiltered(doctors); return }
    setFiltered(doctors.filter(d =>
      d.users.full_name?.toLowerCase().includes(q) ||
      d.users.email.toLowerCase().includes(q) ||
      d.registration_number?.toLowerCase().includes(q) ||
      d.medical_council?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    ))
  }, [search, doctors])

  const handleApprove = async (doctor: DoctorRow) => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Approve this doctor?',
      html: `<b>${doctor.users.full_name ?? doctor.users.email}</b><br/>
             Registration: <code>${doctor.registration_number ?? '—'}</code><br/>
             Council: ${doctor.medical_council ?? '—'}`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
    })
    if (!result.isConfirmed) return

    setActionLoading(doctor.id)
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctor.id, action: 'approve' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: `${doctor.users.full_name ?? doctor.users.email} is now verified. They've been notified.`,
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true,
      })
      fetchDoctors(activeTab)
    } catch (err: unknown) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err instanceof Error ? err.message : 'Something went wrong.', confirmButtonColor: '#3b82f6' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (doctor: DoctorRow) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Reject this doctor?',
      html: `<b>${doctor.users.full_name ?? doctor.users.email}</b>`,
      input: 'textarea',
      inputLabel: 'Reason for rejection (required — shown to the doctor)',
      inputPlaceholder: 'e.g. Registration number not found in Maharashtra Medical Council records.',
      inputAttributes: { rows: '3' },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      preConfirm: (reason) => {
        if (!reason?.trim()) {
          Swal.showValidationMessage('Please provide a reason.')
          return false
        }
        return reason.trim()
      },
    })
    if (!result.isConfirmed) return

    setActionLoading(doctor.id)
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctor.id, action: 'reject', reason: result.value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      Swal.fire({
        icon: 'info',
        title: 'Rejected',
        text: 'The doctor has been notified with your reason.',
        confirmButtonColor: '#3b82f6',
        timer: 3000,
        timerProgressBar: true,
      })
      fetchDoctors(activeTab)
    } catch (err: unknown) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err instanceof Error ? err.message : 'Something went wrong.', confirmButtonColor: '#3b82f6' })
    } finally {
      setActionLoading(null)
    }
  }

  const tabCounts: Record<VerificationStatus, number | null> = {
    pending:    activeTab === 'pending'    ? filtered.length : null,
    verified:   activeTab === 'verified'   ? filtered.length : null,
    rejected:   activeTab === 'rejected'   ? filtered.length : null,
    unverified: activeTab === 'unverified' ? filtered.length : null,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Dhanvantari AI — Doctor Verification</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setSearch('') }}
              className={`rounded-2xl p-4 text-left transition-all border-2 ${
                activeTab === tab.value
                  ? `border-${tab.color}-400 bg-${tab.color}-50`
                  : 'border-transparent bg-white hover:border-gray-200'
              } shadow-sm`}
            >
              <div className="flex items-center gap-2 mb-1">
                {tab.value === 'pending'    && <Clock       className="w-4 h-4 text-amber-500" />}
                {tab.value === 'verified'   && <ShieldCheck className="w-4 h-4 text-green-500" />}
                {tab.value === 'rejected'   && <Shield     className="w-4 h-4 text-red-500"   />}
                {tab.value === 'unverified' && <AlertTriangle className="w-4 h-4 text-gray-400" />}
                <span className={`text-xs font-semibold uppercase tracking-wide text-${tab.color}-600`}>
                  {tab.label}
                </span>
              </div>
              {activeTab === tab.value && tabCounts[tab.value] !== null && (
                <p className="text-2xl font-bold text-gray-900">{tabCounts[tab.value]}</p>
              )}
              {activeTab !== tab.value && (
                <p className="text-sm text-gray-400">Click to view</p>
              )}
            </button>
          ))}
        </div>

        {/* Search + refresh */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, registration number, council..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            onClick={() => fetchDoctors(activeTab)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'No results match your search.' : `No doctors with status "${activeTab}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                activeTab={activeTab}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Doctor Card ────────────────────────────────────────────────────────────

function DoctorCard({
  doctor,
  activeTab,
  actionLoading,
  onApprove,
  onReject,
}: {
  doctor: DoctorRow
  activeTab: VerificationStatus
  actionLoading: string | null
  onApprove: (d: DoctorRow) => void
  onReject:  (d: DoctorRow) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isActing = actionLoading === doctor.id
  const name = doctor.users.full_name ?? doctor.users.email

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-4 p-5">
        {/* Avatar */}
        <img
          src={
            doctor.users.avatar_url ??
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
          }
          alt={name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shrink-0"
        />

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 truncate">{name}</p>
            <StatusPill status={doctor.verification_status} />
          </div>
          <p className="text-sm text-gray-500 truncate">{doctor.users.email}</p>
          {doctor.specialization && (
            <p className="text-xs text-blue-600 font-medium mt-0.5">{doctor.specialization}</p>
          )}
        </div>

        {/* Key info chips */}
        <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 shrink-0">
          {doctor.registration_number && (
            <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full font-mono">
              <Hash className="w-3 h-3" />
              {doctor.registration_number}
            </span>
          )}
          {doctor.medical_council && (
            <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full max-w-[180px] truncate">
              <Building2 className="w-3 h-3 shrink-0" />
              {doctor.medical_council.replace(' Medical Council', '')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'pending' && (
            <>
              <button
                onClick={() => onApprove(doctor)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(doctor)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
          {activeTab === 'rejected' && (
            <button
              onClick={() => onApprove(doctor)}
              disabled={isActing}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Anyway
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Detail icon={User}        label="Full Name"            value={name} />
          <Detail icon={Stethoscope} label="Specialization"       value={doctor.specialization} />
          <Detail icon={Hash}        label="Registration Number"  value={doctor.registration_number} />
          <Detail icon={Building2}   label="Medical Council"      value={doctor.medical_council} />
          <Detail icon={Calendar}    label="Registration Year"    value={doctor.registration_year?.toString()} />
          <Detail icon={Calendar}    label="Account Created"      value={new Date(doctor.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          {doctor.verified_at && (
            <Detail icon={ShieldCheck} label="Verified At" value={new Date(doctor.verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          )}
          {doctor.rejection_reason && (
            <div className="col-span-2 md:col-span-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600">{doctor.rejection_reason}</p>
            </div>
          )}

          {/* NMC lookup hint */}
          {doctor.registration_number && (
            <div className="col-span-2 md:col-span-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-1">Manual Verification Tip</p>
                <p className="text-xs text-blue-600">
                  Cross-check <strong>{doctor.registration_number}</strong> on the{' '}
                  <a
                    href="https://www.nmc.org.in/information-desk/for-doctors/indian-medical-register/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    NMC Indian Medical Register
                  </a>{' '}
                  or the{' '}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent((doctor.medical_council ?? '') + ' doctor registration verification')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    {doctor.medical_council ?? 'state council'} website
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType<{ className?: string }>; label: string; value?: string | null }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="font-semibold text-gray-800 text-sm">{value || '—'}</p>
    </div>
  )
}

function StatusPill({ status }: { status: VerificationStatus }) {
  const map = {
    pending:    { label: 'Pending',    cls: 'bg-amber-100 text-amber-700' },
    verified:   { label: 'Verified',   cls: 'bg-green-100 text-green-700' },
    rejected:   { label: 'Rejected',   cls: 'bg-red-100 text-red-700'     },
    unverified: { label: 'Unverified', cls: 'bg-gray-100 text-gray-600'   },
  }
  const { label, cls } = map[status]
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}
