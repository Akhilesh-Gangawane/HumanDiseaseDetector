'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, Plus, Trash2, Eye, EyeOff, Loader2, Link2, Clock, Calendar, FileVideo, Upload, X, CheckCircle2 } from 'lucide-react';
import { useDoctorState } from './DoctorStateContext';

interface Recording {
  id: string;
  appointment_id: string;
  patient_id: string | null;
  title: string;
  recording_url: string;
  duration_mins: number | null;
  notes: string;
  shared: boolean;
  created_at: string;
  appointments?: { patient_name: string; date: string; time: string };
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export default function RecordingsManager() {
  const { appointments } = useDoctorState();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    appointmentId: '',
    title: '',
    recordingUrl: '',
    durationMins: '',
    notes: '',
  });

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetch('/api/doctor/recordings')
      .then(r => r.json())
      .then(d => setRecordings(d.recordings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const confirmedOnlineAppts = appointments.filter(a => a.mode === 'Online' && a.status === 'Confirmed');

  const uploadFile = useCallback(async (file: File) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowed.includes(file.type)) {
      setUploadError('Invalid file type. Please upload an MP4, WebM, MOV, or AVI file.');
      setUploadState('error');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 500 MB.');
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setUploadError('');
    setUploadedFileName(file.name);

    // Simulate progress while uploading (XHR for real progress tracking)
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use XHR to get upload progress
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/doctor/recordings/upload');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } else {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error ?? 'Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      setForm(prev => ({ ...prev, recordingUrl: url }));
      setUploadProgress(100);
      setUploadState('done');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploadState('error');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const clearUpload = () => {
    setUploadState('idle');
    setUploadProgress(0);
    setUploadedFileName('');
    setUploadError('');
    setForm(prev => ({ ...prev, recordingUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.appointmentId || !form.title || !form.recordingUrl) return;
    setSaving(true);

    // Find patient_id from the selected appointment
    const appt = appointments.find(a => a.id === form.appointmentId);

    const res = await fetch('/api/doctor/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: form.appointmentId,
        patientId: appt?.patientId ?? null,
        title: form.title,
        recordingUrl: form.recordingUrl,
        durationMins: form.durationMins ? parseInt(form.durationMins) : null,
        notes: form.notes,
      }),
    });

    if (res.ok) {
      const { recording } = await res.json();
      setRecordings(prev => [recording, ...prev]);
      setForm({ appointmentId: '', title: '', recordingUrl: '', durationMins: '', notes: '' });
      clearUpload();
      setShowForm(false);
    }
    setSaving(false);
  };

  const toggleShare = async (id: string, currentShared: boolean) => {
    // Optimistic update
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, shared: !currentShared } : r));

    const res = await fetch('/api/doctor/recordings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, shared: !currentShared }),
    });

    if (!res.ok) {
      // Revert on failure
      setRecordings(prev => prev.map(r => r.id === id ? { ...r, shared: currentShared } : r));
    }
  };

  const deleteRecording = async (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    await fetch('/api/doctor/recordings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultation Recordings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add recording links after calls. Share with patients when ready — they cannot access without your approval.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); if (showForm) clearUpload(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Recording'}
        </button>
      </div>

      {/* Add Recording Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Add New Recording</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rec-appt" className="block text-sm font-semibold text-gray-700 mb-1">Appointment</label>
                <select
                  id="rec-appt"
                  required
                  value={form.appointmentId}
                  onChange={e => setForm({ ...form, appointmentId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select appointment...</option>
                  {confirmedOnlineAppts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} — {a.date} {a.time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="rec-title" className="block text-sm font-semibold text-gray-700 mb-1">Recording Title</label>
                <input
                  id="rec-title" type="text" required
                  placeholder="e.g. Follow-up Consultation - 15 Apr"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Google Meet Recording Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Meet Recording
              </label>

              {/* Drag-and-drop upload area */}
              {uploadState === 'idle' && (
                <>
                  <input
                    ref={fileInputRef}
                    id="meet-recording-upload"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="meet-recording-upload"
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all select-none ${
                      isDragOver
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        Upload Google Meet Recording
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Drag &amp; drop or click to browse — MP4, WebM, MOV, AVI · Max 500 MB
                      </p>
                    </div>
                  </label>
                </>
              )}

              {/* Uploading progress */}
              {uploadState === 'uploading' && (
                <div className="w-full px-5 py-4 border border-indigo-200 bg-indigo-50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-indigo-700 truncate max-w-[70%]">{uploadedFileName}</span>
                    <span className="text-indigo-500 font-semibold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      // eslint-disable-next-line react/forbid-dom-props
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-indigo-400 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading recording…
                  </p>
                </div>
              )}

              {/* Upload success */}
              {uploadState === 'done' && (
                <div className="w-full px-5 py-4 border border-green-200 bg-green-50 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-green-700 truncate">{uploadedFileName}</p>
                      <p className="text-xs text-green-500">Uploaded successfully</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearUpload}
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors shrink-0"
                    aria-label="Remove uploaded file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload error */}
              {uploadState === 'error' && (
                <div className="w-full px-5 py-4 border border-red-200 bg-red-50 rounded-2xl flex items-center justify-between gap-3">
                  <p className="text-sm text-red-600">{uploadError}</p>
                  <button
                    type="button"
                    onClick={clearUpload}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors shrink-0"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or paste a link</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Manual URL input */}
              <input
                id="rec-url"
                type="url"
                required={uploadState !== 'done'}
                placeholder="https://drive.google.com/... or https://meet.google.com/..."
                value={form.recordingUrl}
                onChange={e => setForm({ ...form, recordingUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste a Google Drive, Google Meet, Dropbox, or any accessible video link.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rec-duration" className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  id="rec-duration" type="number" min="1"
                  placeholder="e.g. 30"
                  value={form.durationMins}
                  onChange={e => setForm({ ...form, durationMins: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="rec-notes" className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
                <input
                  id="rec-notes" type="text"
                  placeholder="Any notes about this recording..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit" disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Recording'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recordings List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileVideo className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">No recordings yet</p>
          <p className="text-gray-500 mt-1">After a video consultation, add the recording link above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recordings.map(rec => (
            <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{rec.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                      {rec.appointments && (
                        <>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {rec.appointments.date}
                          </span>
                          <span className="font-medium text-gray-700">{rec.appointments.patient_name}</span>
                        </>
                      )}
                      {rec.duration_mins && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {rec.duration_mins} min
                        </span>
                      )}
                    </div>
                    {rec.notes && <p className="text-sm text-gray-500 mt-1 italic">{rec.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Share toggle */}
                  <button
                    type="button"
                    onClick={() => toggleShare(rec.id, rec.shared)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      rec.shared
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={rec.shared ? 'Click to unshare from patient' : 'Click to share with patient'}
                  >
                    {rec.shared ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {rec.shared ? 'Shared' : 'Not Shared'}
                  </button>

                  {/* Open link */}
                  <a
                    href={rec.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                    title="Open recording"
                  >
                    <Link2 className="w-4 h-4" />
                  </a>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteRecording(rec.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    title="Delete recording"
                    aria-label="Delete recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Share status banner */}
              {rec.shared && (
                <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Patient can view this recording in their Health Records.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
