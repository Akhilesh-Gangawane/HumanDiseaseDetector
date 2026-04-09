'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Trash2, Edit3, Save, X,
  Calendar, Tag, Search, ChevronDown,
} from 'lucide-react'

interface DiaryEntry {
  id: number
  date: string
  title: string
  content: string
  tags: string[]
  mood: 'good' | 'neutral' | 'bad'
}

const MOOD_EMOJI = { good: '😊', neutral: '😐', bad: '😔' }
const MOOD_COLOR = {
  good: 'bg-green-100 text-green-700 border-green-200',
  neutral: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  bad: 'bg-red-100 text-red-700 border-red-200',
}

const INITIAL_ENTRIES: DiaryEntry[] = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    title: 'First consultation notes',
    content: 'Patient reported mild headache and fatigue. Prescribed rest and hydration. Follow-up in 1 week.',
    tags: ['consultation', 'follow-up'],
    mood: 'neutral',
  },
]

interface DiaryPageProps {
  role: 'doctor' | 'patient'
}

export default function DiaryPage({ role }: DiaryPageProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>(INITIAL_ENTRIES)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<DiaryEntry | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const blank: DiaryEntry = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    tags: [],
    mood: 'neutral',
  }

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  const startNew = () => {
    setEditing({ ...blank, id: Date.now() })
    setIsNew(true)
    setTagInput('')
  }

  const startEdit = (entry: DiaryEntry) => {
    setEditing({ ...entry })
    setIsNew(false)
    setTagInput('')
  }

  const save = () => {
    if (!editing || !editing.title.trim()) return
    if (isNew) {
      setEntries([editing, ...entries])
    } else {
      setEntries(entries.map((e) => (e.id === editing.id ? editing : e)))
    }
    setEditing(null)
  }

  const remove = (id: number) => setEntries(entries.filter((e) => e.id !== id))

  const addTag = () => {
    if (!editing || !tagInput.trim()) return
    if (!editing.tags.includes(tagInput.trim())) {
      setEditing({ ...editing, tags: [...editing.tags, tagInput.trim()] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {role === 'doctor' ? 'Clinical Diary' : 'Health Diary'}
            </h1>
          </div>
          <p className="text-gray-500 ml-13 pl-1">
            {role === 'doctor'
              ? 'Personal notes, observations and case summaries'
              : 'Track your symptoms, moods and health journey'}
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> New Entry
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isNew ? 'New Entry' : 'Edit Entry'}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Close editor"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Date + Mood */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={editing.date}
                      onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                      aria-label="Entry date"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mood</label>
                    <div className="flex gap-2">
                      {(['good', 'neutral', 'bad'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setEditing({ ...editing, mood: m })}
                          className={`flex-1 py-2 rounded-xl border-2 text-lg transition-all ${
                            editing.mood === m
                              ? MOOD_COLOR[m] + ' border-current scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {MOOD_EMOJI[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Entry title..."
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={6}
                    placeholder={
                      role === 'doctor'
                        ? 'Clinical observations, treatment notes...'
                        : 'How are you feeling today? Any symptoms?'
                    }
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {editing.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      aria-label="Add tag"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors text-sm font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={!editing.title.trim()}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> Save Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries list */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No entries yet. Start writing!</p>
          </div>
        )}
        <AnimatePresence>
          {filtered.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xl">{MOOD_EMOJI[entry.mood]}</span>
                      <h3 className="font-bold text-gray-900 truncate">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {entry.date}
                      </span>
                      {entry.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {entry.tags.slice(0, 2).join(', ')}
                          {entry.tags.length > 2 && ` +${entry.tags.length - 2}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEdit(entry) }}
                      aria-label={`Edit entry: ${entry.title}`}
                      className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); remove(entry.id) }}
                      aria-label={`Delete entry: ${entry.title}`}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === entry.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {entry.content || <span className="text-gray-400 italic">No notes written.</span>}
                      </p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
