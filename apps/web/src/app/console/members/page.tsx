'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, Edit2, Plus, AlertCircle } from 'lucide-react'

interface Member {
  id: string
  name: string
  phone?: string
  location?: string
  business?: string
  gender?: string
  marital_status?: string
  ei_band: string
  overall_score?: number
  created_at: string
}

interface MembersResponse {
  members: Member[]
  total: number
  page: number
  pageSize: number
}

export default function MembersDirectoryPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [nameFilter, setNameFilter] = useState('')
  const [businessFilter, setBusinessFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [bandFilter, setBandFilter] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  // Sorting
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Add member form
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    phone: '',
    location: '',
    business: '',
    gender: '',
    marital_status: '',
  })

  // Load members
  useEffect(() => {
    loadMembers()
  }, [nameFilter, businessFilter, locationFilter, bandFilter, page, sortBy, sortOrder])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
        ...(nameFilter && { name: nameFilter }),
        ...(businessFilter && { business: businessFilter }),
        ...(locationFilter && { location: locationFilter }),
      })

      const response = await fetch(`/api/members-operations?${params}`)
      const data: MembersResponse = await response.json()

      // Filter by band client-side (for simplicity)
      let filtered = data.members
      if (bandFilter) {
        filtered = data.members.filter((m) => m.ei_band === bandFilter)
      }

      setMembers(filtered)
      setTotal(data.total)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)))
    }
  }

  const handleAddMember = async () => {
    try {
      if (!newMemberForm.name.trim()) {
        alert('Name is required')
        return
      }

      const response = await fetch('/api/members-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemberForm),
      })

      if (response.ok) {
        setShowAddForm(false)
        setNewMemberForm({ name: '', phone: '', location: '', business: '', gender: '', marital_status: '' })
        loadMembers()
      } else {
        alert('Failed to add member')
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const getMissingContactFlags = (member: Member) => {
    const missing = []
    if (!member.phone) missing.push('phone')
    if (!member.location) missing.push('location')
    return missing
  }

  const bands = ['High', 'Moderate', 'Needs Support', 'No Score']
  const businesses = [...new Set(members.map((m) => m.business).filter(Boolean))]
  const locations = [...new Set(members.map((m) => m.location).filter(Boolean))]

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2 font-fraunces">Members</h1>
            <p className="text-text-muted">
              {total} member{total !== 1 ? 's' : ''} • {selectedIds.size} selected
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus size={20} />
            Add Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-lg shadow-lg p-6 border border-border mb-8">
          <h3 className="font-semibold text-text mb-4">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value)
                setPage(0)
              }}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={businessFilter}
              onChange={(e) => {
                setBusinessFilter(e.target.value)
                setPage(0)
              }}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Businesses</option>
              {businesses.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value)
                setPage(0)
              }}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            <select
              value={bandFilter}
              onChange={(e) => {
                setBandFilter(e.target.value)
                setPage(0)
              }}
              className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All EI Bands</option>
              {bands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-8">
            <p className="text-error">{error}</p>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden sm:block bg-surface rounded-lg shadow-lg border border-border overflow-hidden mb-8">
          {loading ? (
            <div className="p-8 text-center text-text-muted">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No members found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary/5 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === members.length && members.length > 0}
                        onChange={toggleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Location</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Business</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">EI Band</th>
                    <th className="px-4 py-3 text-center font-semibold text-primary">Score</th>
                    <th className="px-4 py-3 text-left font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, idx) => {
                    const missingFlags = getMissingContactFlags(member)
                    const hasMissing = missingFlags.length > 0

                    return (
                      <tr
                        key={member.id}
                        className={`border-b border-border ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } ${hasMissing ? 'bg-yellow-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(member.id)}
                            onChange={() => toggleSelect(member.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/console/members/${member.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {member.name}
                          </Link>
                          {hasMissing && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-700">
                              <AlertCircle size={14} />
                              Missing: {missingFlags.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-muted">{member.phone || '—'}</td>
                        <td className="px-4 py-3 text-text-muted">{member.location || '—'}</td>
                        <td className="px-4 py-3 text-text-muted">{member.business || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              member.ei_band === 'High'
                                ? 'bg-success/20 text-success'
                                : member.ei_band === 'Moderate'
                                ? 'bg-amber-100 text-amber-700'
                                : member.ei_band === 'Needs Support'
                                ? 'bg-error/20 text-error'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {member.ei_band}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {member.overall_score?.toFixed(2) || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/console/members/${member.id}`}
                            className="text-primary hover:text-primary-hover font-medium text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4 mb-8">
          {loading ? (
            <div className="text-center text-text-muted py-8">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center text-text-muted py-8">No members found</div>
          ) : (
            members.map((member) => {
              const missingFlags = getMissingContactFlags(member)
              return (
                <Link
                  key={member.id}
                  href={`/console/members/${member.id}`}
                  className={`block bg-surface rounded-lg border border-border p-4 ${
                    missingFlags.length > 0 ? 'border-yellow-400 bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-primary">{member.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        member.ei_band === 'High'
                          ? 'bg-success/20 text-success'
                          : member.ei_band === 'Moderate'
                          ? 'bg-amber-100 text-amber-700'
                          : member.ei_band === 'Needs Support'
                          ? 'bg-error/20 text-error'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {member.ei_band}
                    </span>
                  </div>
                  {missingFlags.length > 0 && (
                    <div className="flex items-center gap-1 mb-2 text-xs text-amber-700">
                      <AlertCircle size={14} />
                      Missing: {missingFlags.join(', ')}
                    </div>
                  )}
                  <div className="space-y-1 text-sm text-text-muted">
                    {member.phone && <p>📞 {member.phone}</p>}
                    {member.location && <p>📍 {member.location}</p>}
                    {member.business && <p>💼 {member.business}</p>}
                    {member.overall_score && <p>Score: {member.overall_score.toFixed(2)}</p>}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg shadow-lg p-8 border border-border max-w-md w-full">
              <h2 className="text-2xl font-bold text-primary mb-6 font-fraunces">Add New Member</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Name *</label>
                  <input
                    type="text"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Phone</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Location</label>
                  <input
                    type="text"
                    value={newMemberForm.location}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, location: e.target.value })}
                    placeholder="City / Region"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Business</label>
                  <input
                    type="text"
                    value={newMemberForm.business}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, business: e.target.value })}
                    placeholder="Business / Occupation"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Gender</label>
                  <input
                    type="text"
                    value={newMemberForm.gender}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, gender: e.target.value })}
                    placeholder="Gender"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Marital Status</label>
                  <input
                    type="text"
                    value={newMemberForm.marital_status}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, marital_status: e.target.value })}
                    placeholder="Marital status"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="flex-1 px-4 py-2 bg-primary text-primary-fg rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
