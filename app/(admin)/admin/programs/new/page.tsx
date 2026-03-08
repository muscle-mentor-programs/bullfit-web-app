'use client'

import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import type { Exercise } from '@/types'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Clipboard,
  ClipboardPaste,
  Copy,
  GripVertical,
  Loader2,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

const EXERCISE_TYPES = ['Strength', 'Power', 'Accessory', 'Cardio', 'Warmup'] as const
type ExerciseType = typeof EXERCISE_TYPES[number]

interface SetPrescription {
  id: string; set_number: number; weight_lbs: string; reps: string
}
interface ExercisePrescription {
  exercise_id: string; exercise_name: string; youtube_url?: string | null
  order: number; exercise_type: ExerciseType; sets: SetPrescription[]; instructions: string
}
interface SessionDraft {
  id: string; day_of_week: number; title: string; coach_instructions: string; exercises: ExercisePrescription[]
}
interface WeekDraft { week_number: number; sessions: SessionDraft[] }
interface ConfirmPasteState { weekIdx: number; day: number; existingTitle: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_SHORT: Record<number, string> = { 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa', 7: 'Su' }
const DAY_FULL: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' }
const DAY_COL: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' }
const DURATION_OPTIONS = [4, 5, 6, 7, 8, 10, 12]
const TYPE_PILL: Record<ExerciseType, string> = {
  Strength: 'bg-primary/15 text-primary border border-primary/25',
  Power: 'bg-accent/15 text-accent border border-accent/25',
  Accessory: 'bg-surface-2 text-text-secondary border border-border',
  Cardio: 'bg-success/15 text-success border border-success/25',
  Warmup: 'bg-warning/10 text-warning border border-warning/20',
}
const HEADER_G = 'linear-gradient(135deg, #00BEFF 0%, #CF00FF 50%, #FF0087 100%)'
const PICKER_MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }
function makeSet(n: number): SetPrescription { return { id: uid(), set_number: n, weight_lbs: '', reps: '' } }
function makeSession(_weekIdx: number, day: number): SessionDraft {
  return { id: uid(), day_of_week: day, title: `${DAY_FULL[day]} Session`, coach_instructions: '', exercises: [] }
}
function deepCopySession(s: SessionDraft, newDay?: number): SessionDraft {
  return { id: uid(), day_of_week: newDay ?? s.day_of_week, title: s.title, coach_instructions: s.coach_instructions, exercises: s.exercises.map((ex) => ({ ...ex, sets: ex.sets.map((set) => ({ ...set, id: uid() })) })) }
}
function deepCopyWeek(w: WeekDraft): WeekDraft {
  return { week_number: w.week_number, sessions: w.sessions.map((s) => deepCopySession(s)) }
}

// ─── Exercise Picker Modal ────────────────────────────────────────────────────

function ExercisePickerModal({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (exercises: Exercise[]) => void }) {
  const [query, setQuery] = useState('')
  const [activeMuscle, setActiveMuscle] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetch('/api/admin/exercises').then((r) => r.json()).then((d) => setExercises(d.exercises ?? [])).finally(() => setLoading(false))
  }, [isOpen])
  useEffect(() => { if (!isOpen) { setQuery(''); setActiveMuscle(''); setSelectedIds([]) } }, [isOpen])

  const filtered = exercises.filter((ex) => {
    if (ex.is_archived) return false
    if (query && !ex.name.toLowerCase().includes(query.toLowerCase())) return false
    if (activeMuscle && !ex.muscle_groups.includes(activeMuscle)) return false
    return true
  })
  function toggleSelect(id: string) { setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]) }
  function confirmAdd() { const toAdd = exercises.filter((ex) => selectedIds.includes(ex.id)); onSelect(toAdd); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise" className="max-w-lg">
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input type="text" autoFocus placeholder="Search exercises..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded border border-border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-1.5 pb-1">
          {PICKER_MUSCLE_GROUPS.map((m) => (
            <button key={m} type="button" onClick={() => setActiveMuscle((prev) => prev === m ? '' : m)}
              className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all', activeMuscle === m ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary bg-background')}>
              {m}
            </button>
          ))}
        </div>
        <div className="max-h-64 overflow-y-auto border-t border-border pt-2">
          {loading ? <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-text-muted" /></div>
            : filtered.length === 0 ? <p className="text-center text-sm text-text-muted py-8">No exercises found</p>
            : <>
              <p className="text-[10px] text-text-muted px-1 pb-1.5">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''}{activeMuscle ? ` · ${activeMuscle}` : ''}{selectedIds.length > 0 && ` · ${selectedIds.length} selected`}</p>
              {filtered.map((ex) => {
                const isSelected = selectedIds.includes(ex.id)
                return (
                  <button key={ex.id} onClick={() => toggleSelect(ex.id)} className={cn('w-full text-left px-3 py-2.5 rounded flex items-center gap-3 transition-colors', isSelected ? 'bg-primary/10' : 'hover:bg-surface')}>
                    <div className={cn('w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-all', isSelected ? 'border-primary text-white' : 'border-border')} style={isSelected ? { background: HEADER_G } : {}}>
                      {isSelected && <Check size={11} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold truncate', isSelected ? 'text-primary' : 'text-text-primary')}>{ex.name}</p>
                      {ex.muscle_groups.length > 0 && <p className="text-xs text-text-muted mt-0.5 truncate">{ex.muscle_groups.join(' · ')}</p>}
                    </div>
                  </button>
                )
              })}
            </>}
        </div>
        {selectedIds.length > 0 && (
          <div className="pt-1 border-t border-border">
            <button onClick={confirmAdd} className="w-full h-11 rounded-xl text-sm font-black text-white shadow-primary transition-all active:scale-[0.98]" style={{ background: HEADER_G }}>
              ADD {selectedIds.length} EXERCISE{selectedIds.length !== 1 ? 'S' : ''}
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ─── Mobile Components ────────────────────────────────────────────────────────

function CompactDayCell({ label, session, isSelected, isPasteMode, onClick }: { label: string; session: SessionDraft | undefined; isSelected: boolean; isPasteMode: boolean; onClick: () => void }) {
  const hasSession = !!session; const exCount = session?.exercises.length ?? 0
  return (
    <button onClick={onClick} className={cn('flex flex-col items-center justify-center gap-0.5 h-12 rounded-xl transition-all select-none', isSelected ? 'text-white shadow-md' : hasSession ? 'bg-primary/10 text-primary border border-primary/25' : isPasteMode ? 'border border-dashed border-accent/50 text-accent/70 hover:bg-accent/5' : 'border border-dashed border-border/40 text-text-muted hover:border-border hover:text-text-secondary hover:bg-surface-2')} style={isSelected ? { background: HEADER_G } : {}}>
      <span className="text-[11px] font-black leading-none tracking-tight">{label}</span>
      {hasSession ? <span className={cn('text-[9px] font-black leading-none', isSelected ? 'text-white/70' : 'text-primary/50')}>{exCount > 0 ? exCount : '·'}</span>
        : isPasteMode ? <ClipboardPaste size={9} className="opacity-50" />
        : <span className="text-[9px] opacity-20 leading-none">+</span>}
    </button>
  )
}

function AllWeeksCalendar({ weeks, selectedSessionId, clipboard, weekClipboard, onDayClick, onPasteToDay, onCopyWeek, onPasteWeek }: {
  weeks: WeekDraft[]; selectedSessionId: string | null; clipboard: SessionDraft | null; weekClipboard: WeekDraft | null
  onDayClick: (weekIdx: number, day: number, existing: SessionDraft | undefined) => void; onPasteToDay: (weekIdx: number, day: number) => void; onCopyWeek: (weekIdx: number) => void; onPasteWeek: (weekIdx: number) => void
}) {
  return (
    <div>
      {weeks.map((week, weekIdx) => (
        <div key={week.week_number} className="border-b border-border/40 last:border-0" style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <p className="text-[10px] font-black tracking-widest text-primary/70">WEEK {week.week_number}{week.sessions.length > 0 && <span className="text-text-muted font-semibold ml-1.5">· {week.sessions.length} session{week.sessions.length !== 1 ? 's' : ''}</span>}</p>
            <div className="flex items-center gap-1">
              {weekClipboard && <button onClick={() => onPasteWeek(weekIdx)} className="flex items-center gap-0.5 h-[20px] px-2 rounded text-[9px] font-black text-accent border border-accent/30 hover:bg-accent/10 transition-colors"><ClipboardPaste size={8} />PASTE</button>}
              <button onClick={() => onCopyWeek(weekIdx)} className="flex items-center gap-0.5 h-[20px] px-2 rounded text-[9px] font-black text-text-muted border border-border hover:text-text-primary hover:border-border/80 transition-colors"><Copy size={8} />COPY</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 px-3 pb-2.5">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const session = week.sessions.find((s) => s.day_of_week === day)
              const isSelected = !!session && session.id === selectedSessionId
              return <CompactDayCell key={day} label={DAY_SHORT[day]} session={session} isSelected={isSelected} isPasteMode={!!clipboard} onClick={() => clipboard ? onPasteToDay(weekIdx, day) : onDayClick(weekIdx, day, session)} />
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function MobileExerciseRow({ letter, ex, onUpdate, onRemove }: { letter: string; ex: ExercisePrescription; onUpdate: (u: ExercisePrescription) => void; onRemove: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false); const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => { function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) } if (menuOpen) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [menuOpen])
  function updateSet(idx: number, field: 'weight_lbs' | 'reps', val: string) { onUpdate({ ...ex, sets: ex.sets.map((s, i) => i === idx ? { ...s, [field]: val } : s) }) }
  function addSet() { onUpdate({ ...ex, sets: [...ex.sets, makeSet(ex.sets.length + 1)] }) }
  function removeSet() { if (ex.sets.length <= 1) return; onUpdate({ ...ex, sets: ex.sets.slice(0, -1) }) }
  return (
    <div className="border border-border rounded-2xl bg-background overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border" style={{ background: 'linear-gradient(to right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <GripVertical size={15} className="text-text-muted cursor-grab flex-shrink-0" />
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-sm" style={{ background: HEADER_G }}>{letter}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-text-primary truncate">{ex.exercise_name}</p>
          <select value={ex.exercise_type} onChange={(e) => onUpdate({ ...ex, exercise_type: e.target.value as ExerciseType })} className={cn('h-6 px-2 rounded-full text-[10px] font-bold border-0 outline-none cursor-pointer mt-0.5 focus:ring-1 focus:ring-primary', TYPE_PILL[ex.exercise_type])} style={{ background: 'transparent' }}>
            {EXERCISE_TYPES.map((t) => <option key={t} value={t} className="bg-surface text-text-primary normal-case">{t}</option>)}
          </select>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"><MoreHorizontal size={16} /></button>
          {menuOpen && <div className="absolute right-0 top-10 z-30 w-36 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"><button onClick={() => { onRemove(); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-3 py-3 text-sm text-error hover:bg-surface-2 transition-colors"><Trash2 size={13} />Remove</button></div>}
        </div>
      </div>
      <div className="px-4 pt-3">
        <table className="w-full table-fixed"><colgroup><col className="w-9" /><col /><col /></colgroup>
          <thead><tr className="text-[10px] font-black text-text-muted tracking-widest"><th className="text-left pb-2">#</th><th className="text-left pb-2 pr-2">WEIGHT</th><th className="text-left pb-2">REPS</th></tr></thead>
          <tbody>{ex.sets.map((s, i) => (<tr key={s.id}><td className="py-1 pr-2"><div className="w-8 h-9 rounded-lg border border-border flex items-center justify-center text-sm font-bold text-text-secondary" style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-surface))' }}>{s.set_number}</div></td><td className="py-1 pr-2"><input type="text" inputMode="decimal" value={s.weight_lbs} onChange={(e) => updateSet(i, 'weight_lbs', e.target.value)} placeholder="lbs" className="w-full h-9 px-3 rounded-lg border border-border bg-surface-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary" /></td><td className="py-1"><input type="text" inputMode="numeric" value={s.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)} placeholder="reps" className="w-full h-9 px-3 rounded-lg border border-border bg-surface-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary" /></td></tr>))}</tbody>
        </table>
        <div className="flex items-center gap-3 py-2 mt-1 border-t border-border">
          <button onClick={removeSet} disabled={ex.sets.length <= 1} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error active:bg-surface-2 disabled:opacity-30 transition-colors"><Minus size={13} /></button>
          <span className="text-xs text-text-muted flex-1 text-center font-semibold">{ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}</span>
          <button onClick={addSet} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary active:bg-surface-2 transition-colors"><Plus size={13} /></button>
        </div>
      </div>
      <div className="px-4 pb-3"><input type="text" value={ex.instructions} onChange={(e) => onUpdate({ ...ex, instructions: e.target.value })} placeholder="Notes (e.g. pause at bottom, RPE 8)" className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" /></div>
    </div>
  )
}

function MobileSessionEditor({ session, onUpdate, onAddExercise, onCopy, onDelete }: { session: SessionDraft | null; onUpdate: (s: SessionDraft) => void; onAddExercise: () => void; onCopy: () => void; onDelete: () => void }) {
  const dragFrom = useRef<number | null>(null)
  if (!session) return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border border-border shadow-sm" style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-surface))' }}><Zap size={22} className="text-primary opacity-50" /></div>
      <p className="text-sm font-bold text-text-secondary">Select a day above</p>
      <p className="text-xs text-text-muted mt-1 max-w-[210px]">Tap any day to add a session or open an existing one.</p>
    </div>
  )
  function updateEx(idx: number, updated: ExercisePrescription) { onUpdate({ ...session!, exercises: session!.exercises.map((e, i) => i === idx ? updated : e) }) }
  function removeEx(idx: number) { onUpdate({ ...session!, exercises: session!.exercises.filter((_, i) => i !== idx).map((e, i) => ({ ...e, order: i })) }) }
  function handleDrop(toIdx: number) {
    if (dragFrom.current === null || dragFrom.current === toIdx) return
    const exercises = [...session!.exercises]; const [moved] = exercises.splice(dragFrom.current, 1); exercises.splice(toIdx, 0, moved)
    onUpdate({ ...session!, exercises: exercises.map((e, i) => ({ ...e, order: i })) }); dragFrom.current = null
  }
  return (
    <div>
      <div className="px-4 pt-3 pb-3 border-b border-border flex items-start gap-2" style={{ background: 'linear-gradient(to right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-text-muted tracking-widest mb-1.5">EDITING — {DAY_FULL[session.day_of_week].toUpperCase()}</p>
          <input type="text" value={session.title} onChange={(e) => onUpdate({ ...session, title: e.target.value })} className="w-full h-10 px-0 rounded border-0 border-transparent text-xl font-black text-text-primary bg-transparent focus:outline-none focus:border-b-2 focus:border-primary pb-0.5 placeholder:text-text-muted" placeholder="Session title..." />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 mt-5">
          <button onClick={onCopy} title="Copy session" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"><Copy size={14} /></button>
          <button onClick={onDelete} title="Delete session" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error/40 hover:bg-error/5 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="p-4 space-y-5">
        <div>
          <label className="block text-[10px] font-black text-text-muted tracking-widest mb-2">COACH INSTRUCTIONS</label>
          <div className="relative">
            <textarea value={session.coach_instructions} onChange={(e) => onUpdate({ ...session, coach_instructions: e.target.value })} placeholder="Session notes, warmup cues, or athlete context..." rows={3} maxLength={10000} className="w-full px-4 py-3 rounded-2xl border border-border bg-surface resize-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" />
            <span className="absolute bottom-3 right-4 text-[10px] text-text-muted pointer-events-none">{session.coach_instructions.length}/10000</span>
          </div>
        </div>
        {session.exercises.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-text-muted tracking-widest">EXERCISES</p>
            {session.exercises.map((ex, idx) => (
              <div key={`${ex.exercise_id}-${idx}`} draggable onDragStart={() => { dragFrom.current = idx }} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(idx)}>
                <MobileExerciseRow letter={String.fromCharCode(65 + idx)} ex={ex} onUpdate={(u) => updateEx(idx, u)} onRemove={() => removeEx(idx)} />
              </div>
            ))}
          </div>
        )}
        <button onClick={onAddExercise} className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-sm font-black text-text-muted tracking-widest hover:border-primary hover:text-primary transition-colors"><Plus size={16} />ADD EXERCISE</button>
      </div>
    </div>
  )
}

// ─── Desktop Components ───────────────────────────────────────────────────────

function DesktopSessionCard({ session, isSelected, weekClipboard, onSelect, onCopySession, onDeleteSession, onCopyWeek, onPasteWeek, showWeekActions }: {
  session: SessionDraft; isSelected: boolean; weekClipboard: WeekDraft | null
  onSelect: () => void; onCopySession: () => void; onDeleteSession: () => void; onCopyWeek: () => void; onPasteWeek: () => void; showWeekActions: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false); const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => { function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) } if (menuOpen) document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [menuOpen])
  return (
    <div className={cn('rounded-xl border overflow-hidden transition-all cursor-pointer group', isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/40 hover:shadow-sm')} style={{ background: isSelected ? 'linear-gradient(135deg, rgba(74,126,212,0.06), rgba(15,58,122,0.08))' : 'var(--color-surface)' }} onClick={onSelect}>
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-border/60" style={{ background: isSelected ? HEADER_G : 'linear-gradient(to right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm" style={{ background: isSelected ? 'rgba(255,255,255,0.25)' : HEADER_G }}>MM</div>
        <span className={cn('text-[11px] font-black truncate flex-1', isSelected ? 'text-white' : 'text-text-primary')}>{session.title}</span>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }} className={cn('w-6 h-6 rounded flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100', isSelected ? 'text-white/70 hover:bg-white/20' : 'text-text-muted hover:bg-surface-2')}><MoreHorizontal size={13} /></button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-40 w-40 bg-surface border border-border rounded-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onCopySession(); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-text-primary hover:bg-surface-2 transition-colors"><Copy size={12} />Copy session</button>
              {showWeekActions && <button onClick={() => { onCopyWeek(); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-text-primary hover:bg-surface-2 transition-colors"><Copy size={12} />Copy week</button>}
              {weekClipboard && showWeekActions && <button onClick={() => { onPasteWeek(); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-accent hover:bg-surface-2 transition-colors"><ClipboardPaste size={12} />Paste week</button>}
              <button onClick={() => { onDeleteSession(); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-error hover:bg-surface-2 transition-colors border-t border-border"><Trash2 size={12} />Delete session</button>
            </div>
          )}
        </div>
      </div>
      <div className="px-2.5 py-2 space-y-0.5">
        {session.exercises.slice(0, 6).map((ex, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            <span className="text-[9px] font-black text-text-muted w-3 flex-shrink-0">{String.fromCharCode(65 + i)}</span>
            <span className="text-[11px] text-text-secondary truncate flex-1">{ex.exercise_name}</span>
            <span className="text-[9px] text-text-muted flex-shrink-0">{ex.sets.length}×</span>
          </div>
        ))}
        {session.exercises.length > 6 && <p className="text-[9px] text-text-muted pt-0.5">+{session.exercises.length - 6} more</p>}
        {session.exercises.length === 0 && <p className="text-[10px] text-text-muted italic">No exercises yet</p>}
      </div>
      <div className={cn('px-2.5 pb-2 pt-1', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity')}>
        <div className="text-[10px] font-black text-primary text-center border border-primary/30 rounded-lg py-1 bg-primary/5">{isSelected ? 'EDITING' : 'CLICK TO EDIT'}</div>
      </div>
    </div>
  )
}

function DesktopCalendarGrid({ weeks, selectedSessionId, clipboard, weekClipboard, onDayClick, onPasteToDay, onCopyWeek, onPasteWeek, onCopySession, onDeleteSession }: {
  weeks: WeekDraft[]; selectedSessionId: string | null; clipboard: SessionDraft | null; weekClipboard: WeekDraft | null
  onDayClick: (weekIdx: number, day: number, existing: SessionDraft | undefined) => void; onPasteToDay: (weekIdx: number, day: number) => void
  onCopyWeek: (weekIdx: number) => void; onPasteWeek: (weekIdx: number) => void; onCopySession: (s: SessionDraft) => void; onDeleteSession: (s: SessionDraft) => void
}) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px">
          <div className="px-3 py-2.5" />
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="px-2 py-2.5 text-center"><span className="text-[11px] font-black text-text-muted tracking-widest uppercase">{DAY_COL[day]}</span></div>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {weeks.map((week, weekIdx) => (
          <div key={week.week_number} className="grid grid-cols-[80px_repeat(7,1fr)] gap-px min-h-[140px]">
            <div className="flex flex-col items-center justify-start gap-1.5 px-2 py-3 border-r border-border/40" style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
              <span className="text-[10px] font-black text-primary/70 tracking-widest">WK{week.week_number}</span>
              <span className="text-[9px] text-text-muted">{week.sessions.length}d</span>
              <div className="flex flex-col gap-1 w-full mt-1">
                {weekClipboard && <button onClick={() => onPasteWeek(weekIdx)} className="flex items-center justify-center gap-0.5 h-[18px] w-full rounded text-[8px] font-black text-accent border border-accent/30 hover:bg-accent/10 transition-colors"><ClipboardPaste size={7} />PASTE</button>}
                <button onClick={() => onCopyWeek(weekIdx)} className="flex items-center justify-center gap-0.5 h-[18px] w-full rounded text-[8px] font-black text-text-muted border border-border hover:text-text-primary transition-colors"><Copy size={7} />COPY</button>
              </div>
            </div>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const session = week.sessions.find((s) => s.day_of_week === day)
              const isSelected = !!session && session.id === selectedSessionId
              return (
                <div key={day} className="p-1.5" style={{ background: 'var(--color-background)' }}>
                  {session ? (
                    <DesktopSessionCard session={session} isSelected={isSelected} weekClipboard={weekClipboard} onSelect={() => onDayClick(weekIdx, day, session)} onCopySession={() => onCopySession(session)} onDeleteSession={() => onDeleteSession(session)} onCopyWeek={() => onCopyWeek(weekIdx)} onPasteWeek={() => onPasteWeek(weekIdx)} showWeekActions />
                  ) : (
                    <button onClick={() => clipboard ? onPasteToDay(weekIdx, day) : onDayClick(weekIdx, day, undefined)} className={cn('w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1 min-h-[100px]', clipboard ? 'border-accent/40 text-accent/60 hover:bg-accent/5' : 'border-border/30 text-text-muted/30 hover:border-primary/30 hover:text-primary/40 hover:bg-primary/5')}>
                      {clipboard ? <ClipboardPaste size={16} /> : <Plus size={16} />}
                      <span className="text-[9px] font-black tracking-widest">{clipboard ? 'PASTE' : 'ADD'}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function DesktopExerciseRow({ letter, ex, onUpdate, onRemove }: { letter: string; ex: ExercisePrescription; onUpdate: (u: ExercisePrescription) => void; onRemove: () => void }) {
  function updateSet(idx: number, field: 'weight_lbs' | 'reps', val: string) { onUpdate({ ...ex, sets: ex.sets.map((s, i) => i === idx ? { ...s, [field]: val } : s) }) }
  function addSet() { onUpdate({ ...ex, sets: [...ex.sets, makeSet(ex.sets.length + 1)] }) }
  function removeSet() { if (ex.sets.length <= 1) return; onUpdate({ ...ex, sets: ex.sets.slice(0, -1) }) }
  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'linear-gradient(to right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
        <GripVertical size={14} className="text-text-muted cursor-grab flex-shrink-0" />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm" style={{ background: HEADER_G }}>{letter}</div>
        <select value={ex.exercise_type} onChange={(e) => onUpdate({ ...ex, exercise_type: e.target.value as ExerciseType })} className={cn('h-6 px-2 rounded-full text-[10px] font-bold border-0 outline-none cursor-pointer flex-shrink-0 focus:ring-1 focus:ring-primary', TYPE_PILL[ex.exercise_type])} style={{ background: 'transparent' }}>
          {EXERCISE_TYPES.map((t) => <option key={t} value={t} className="bg-surface text-text-primary normal-case">{t}</option>)}
        </select>
        <p className="text-sm font-black text-text-primary flex-1 min-w-0 truncate">{ex.exercise_name}</p>
        <button onClick={onRemove} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-colors flex-shrink-0"><Trash2 size={13} /></button>
      </div>
      <div className="flex divide-x divide-border">
        <div className="flex-1 p-4 space-y-3 min-w-0">
          <div>
            <label className="block text-[9px] font-black text-text-muted tracking-widest mb-1.5">EXERCISE INSTRUCTIONS</label>
            <textarea value={ex.instructions} onChange={(e) => onUpdate({ ...ex, instructions: e.target.value })} placeholder="Notes, cues, RPE targets, tempo..." rows={3} maxLength={10000}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface resize-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" />
            <p className="text-[9px] text-text-muted mt-1 text-right">{ex.instructions.length}/10000</p>
          </div>
          {ex.youtube_url && <a href={ex.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline">▶ Watch exercise video</a>}
        </div>
        <div className="w-72 flex-shrink-0 p-4">
          <div className="flex items-center justify-between mb-3"><span className="text-[10px] font-black text-text-muted tracking-widest">{ex.sets.length} SET{ex.sets.length !== 1 ? 'S' : ''}</span></div>
          <table className="w-full table-fixed"><colgroup><col className="w-8" /><col /><col /></colgroup>
            <thead><tr className="text-[9px] font-black text-text-muted tracking-widest"><th className="text-left pb-2">#</th><th className="text-left pb-2 pr-2">WEIGHT (LB)</th><th className="text-left pb-2">REPS</th></tr></thead>
            <tbody>{ex.sets.map((s, i) => (<tr key={s.id}><td className="py-1 pr-1.5"><div className="w-7 h-8 rounded border border-border flex items-center justify-center text-xs font-bold text-text-muted" style={{ background: 'linear-gradient(135deg, var(--color-surface-2), var(--color-surface))' }}>{s.set_number}</div></td><td className="py-1 pr-1.5"><input type="text" inputMode="decimal" value={s.weight_lbs} onChange={(e) => updateSet(i, 'weight_lbs', e.target.value)} placeholder="—" className="w-full h-8 px-2 rounded border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary" /></td><td className="py-1"><input type="text" inputMode="numeric" value={s.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)} placeholder="—" className="w-full h-8 px-2 rounded border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary" /></td></tr>))}</tbody>
          </table>
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
            <button onClick={removeSet} disabled={ex.sets.length <= 1} className="w-7 h-7 rounded border border-border flex items-center justify-center text-text-muted hover:text-error hover:border-error disabled:opacity-30 transition-colors"><Minus size={11} /></button>
            <span className="text-[10px] text-text-muted flex-1 text-center">Sets</span>
            <button onClick={addSet} className="w-7 h-7 rounded border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors"><Plus size={11} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopSessionEditor({ session, onUpdate, onAddExercise, onCopy, onDelete, onBack }: { session: SessionDraft; onUpdate: (s: SessionDraft) => void; onAddExercise: () => void; onCopy: () => void; onDelete: () => void; onBack: () => void }) {
  const dragFrom = useRef<number | null>(null)
  function updateEx(idx: number, updated: ExercisePrescription) { onUpdate({ ...session, exercises: session.exercises.map((e, i) => i === idx ? updated : e) }) }
  function removeEx(idx: number) { onUpdate({ ...session, exercises: session.exercises.filter((_, i) => i !== idx).map((e, i) => ({ ...e, order: i })) }) }
  function handleDrop(toIdx: number) {
    if (dragFrom.current === null || dragFrom.current === toIdx) return
    const exercises = [...session.exercises]; const [moved] = exercises.splice(dragFrom.current, 1); exercises.splice(toIdx, 0, moved)
    onUpdate({ ...session, exercises: exercises.map((e, i) => ({ ...e, order: i })) }); dragFrom.current = null
  }
  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"><ArrowLeft size={15} /><span className="font-medium">Back to Calendar</span></button>
          <span className="text-border/60">|</span>
          <div className="flex-1 min-w-0">
            <input type="text" value={session.title} onChange={(e) => onUpdate({ ...session, title: e.target.value })} className="text-xl font-black text-text-primary bg-transparent border-0 border-b-2 border-transparent focus:border-primary focus:outline-none w-full px-0 placeholder:text-text-muted" placeholder="Session title..." />
            <p className="text-xs text-text-muted mt-0.5">{DAY_FULL[session.day_of_week]}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onCopy} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:bg-surface-2 transition-colors"><Copy size={12} />Copy</button>
            <button onClick={onDelete} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-error/30 text-xs font-semibold text-error hover:bg-error/10 transition-colors"><Trash2 size={12} />Delete</button>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <div>
          <label className="block text-[10px] font-black text-text-muted tracking-widest mb-2">COACH INSTRUCTIONS</label>
          <div className="relative">
            <textarea value={session.coach_instructions} onChange={(e) => onUpdate({ ...session, coach_instructions: e.target.value })} placeholder="Session notes, warmup cues, or athlete context..." rows={4} maxLength={10000} className="w-full px-4 py-3 rounded-xl border border-border bg-surface resize-none text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" />
            <span className="absolute bottom-3 right-4 text-[10px] text-text-muted pointer-events-none">{session.coach_instructions.length}/10000</span>
          </div>
        </div>
        <div className="space-y-4">
          {session.exercises.length > 0 && <p className="text-[10px] font-black text-text-muted tracking-widest">EXERCISES</p>}
          {session.exercises.map((ex, idx) => (
            <div key={`${ex.exercise_id}-${idx}`} draggable onDragStart={() => { dragFrom.current = idx }} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(idx)}>
              <DesktopExerciseRow letter={String.fromCharCode(65 + idx)} ex={ex} onUpdate={(u) => updateEx(idx, u)} onRemove={() => removeEx(idx)} />
            </div>
          ))}
          <button onClick={onAddExercise} className="w-full h-14 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-black text-text-muted tracking-widest hover:border-primary hover:text-primary transition-colors"><Plus size={16} />ADD EXERCISE</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main New Program Page ────────────────────────────────────────────────────

export default function NewProgramPage() {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(6)
  const [weeks, setWeeks] = useState<WeekDraft[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({ week_number: i + 1, sessions: [] }))
  )
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [clipboard, setClipboard] = useState<SessionDraft | null>(null)
  const [confirmPaste, setConfirmPaste] = useState<ConfirmPasteState | null>(null)
  const [weekClipboard, setWeekClipboard] = useState<WeekDraft | null>(null)
  const [confirmPasteWeekIdx, setConfirmPasteWeekIdx] = useState<number | null>(null)
  const [desktopView, setDesktopView] = useState<'calendar' | 'editor'>('calendar')

  useEffect(() => {
    setWeeks((prev) => {
      if (prev.length === durationWeeks) return prev
      if (prev.length < durationWeeks) return [...prev, ...Array.from({ length: durationWeeks - prev.length }, (_, i) => ({ week_number: prev.length + i + 1, sessions: [] }))]
      return prev.slice(0, durationWeeks)
    })
  }, [durationWeeks])

  const selectedSession: SessionDraft | null = selectedSessionId ? getSessionById(selectedSessionId) : null

  function getSessionById(id: string): SessionDraft | null {
    for (const w of weeks) { const s = w.sessions.find((s) => s.id === id); if (s) return s }
    return null
  }
  function findWeekIdxForSession(id: string): number { return weeks.findIndex((w) => w.sessions.some((s) => s.id === id)) }
  function updateSession(updated: SessionDraft) { setWeeks((prev) => prev.map((w) => ({ ...w, sessions: w.sessions.map((s) => (s.id === updated.id ? updated : s)) }))) }

  function handleDayClick(weekIdx: number, day: number, existing: SessionDraft | undefined) {
    if (existing) {
      const alreadySelected = existing.id === selectedSessionId
      setSelectedSessionId(alreadySelected ? null : existing.id)
      setDesktopView(alreadySelected ? 'calendar' : 'editor')
    } else {
      const newSession = makeSession(weekIdx, day)
      setWeeks((prev) => prev.map((w, idx) => idx !== weekIdx ? w : { ...w, sessions: [...w.sessions, newSession].sort((a, b) => a.day_of_week - b.day_of_week) }))
      setSelectedSessionId(newSession.id)
      setDesktopView('editor')
    }
  }
  function handleDeleteSelectedSession() {
    if (!selectedSession) return
    const weekIdx = findWeekIdxForSession(selectedSession.id)
    setWeeks((prev) => prev.map((w, idx) => idx !== weekIdx ? w : { ...w, sessions: w.sessions.filter((s) => s.id !== selectedSession.id) }))
    setSelectedSessionId(null); setDesktopView('calendar')
    if (clipboard?.id === selectedSession.id) setClipboard(null)
  }
  function handlePasteToDay(weekIdx: number, day: number) {
    if (!clipboard) return
    const existing = weeks[weekIdx]?.sessions.find((s) => s.day_of_week === day)
    if (existing) { setConfirmPaste({ weekIdx, day, existingTitle: existing.title }) } else { commitPaste(weekIdx, day) }
  }
  function commitPaste(weekIdx: number, day: number) {
    if (!clipboard) return
    const pasted = deepCopySession(clipboard, day)
    setWeeks((prev) => prev.map((w, idx) => { if (idx !== weekIdx) return w; const filtered = w.sessions.filter((s) => s.day_of_week !== day); return { ...w, sessions: [...filtered, pasted].sort((a, b) => a.day_of_week - b.day_of_week) } }))
    setSelectedSessionId(pasted.id); setDesktopView('editor'); setConfirmPaste(null)
  }
  function copyWeek(weekIdx: number) { const week = weeks[weekIdx]; if (!week) return; setWeekClipboard(deepCopyWeek(week)) }
  function commitPasteWeek(targetWeekIdx: number) {
    if (!weekClipboard) return
    setWeeks((prev) => prev.map((w, idx) => idx !== targetWeekIdx ? w : { ...w, sessions: weekClipboard.sessions.map((s) => deepCopySession(s)) }))
    setConfirmPasteWeekIdx(null)
  }
  function handlePasteWeek(weekIdx: number) {
    if (!weekClipboard) return
    if ((weeks[weekIdx]?.sessions.length ?? 0) > 0) { setConfirmPasteWeekIdx(weekIdx) } else { commitPasteWeek(weekIdx) }
  }
  function addExercises(exList: Exercise[]) {
    if (!selectedSession) return
    const base = selectedSession.exercises.length
    const newExercises: ExercisePrescription[] = exList.map((ex, i) => ({ exercise_id: ex.id, exercise_name: ex.name, youtube_url: ex.youtube_url ?? null, order: base + i, exercise_type: 'Strength' as ExerciseType, sets: [makeSet(1), makeSet(2), makeSet(3)], instructions: '' }))
    updateSession({ ...selectedSession, exercises: [...selectedSession.exercises, ...newExercises] })
  }
  function parseReps(reps: string) { const parts = reps.split('-').map((x) => parseInt(x.trim(), 10)).filter((n) => !isNaN(n)); if (!parts.length) return { min: 0, max: 0 }; return { min: Math.min(...parts), max: Math.max(...parts) } }

  async function save(publish: boolean) {
    if (!title.trim()) { setError('Enter a program title'); return }
    setSaving(true); setError('')
    try {
      const body = {
        title, description: '', price_cents: 0, duration_weeks: durationWeeks, cover_image_url: null, is_published: publish,
        weeks: weeks.map((w) => ({
          week_number: w.week_number, title: `Week ${w.week_number}`,
          sessions: w.sessions.map((s) => ({
            day_of_week: s.day_of_week, title: s.title, description: s.coach_instructions || '',
            exercises: s.exercises.map((e, i) => {
              const repsArr = e.sets.map((st) => parseReps(st.reps))
              const minR = Math.min(...repsArr.map((r) => r.min)); const maxR = Math.max(...repsArr.map((r) => r.max))
              return { exercise_id: e.exercise_id, order: i, prescribed_sets: e.sets.length, rep_range_min: isFinite(minR) ? minR : 1, rep_range_max: isFinite(maxR) ? maxR : 10, notes: e.instructions || null, rest_seconds: 90 }
            }),
          })),
        })),
      }
      const res = await fetch('/api/admin/programs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error ?? 'Failed to save') }
      router.push('/admin/programs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const TopBar = (
    <div className="border-b border-border flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(to bottom, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}>
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <button onClick={() => router.push('/admin/programs')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors flex-shrink-0"><ChevronLeft size={16} /></button>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Program title..." className={cn('flex-1 min-w-0 h-9 px-2 rounded-lg border border-transparent bg-transparent text-sm font-black text-text-primary placeholder:text-text-muted hover:border-border focus:border-primary focus:outline-none focus:bg-background')} />
        <select value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} className="h-9 px-2 rounded-lg border border-border bg-background flex-shrink-0 text-xs text-text-primary focus:outline-none focus:border-primary">
          {DURATION_OPTIONS.map((w) => <option key={w} value={w}>{w}wk</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 px-3 pb-2.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {clipboard && <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 min-w-0"><Clipboard size={10} className="text-primary flex-shrink-0" /><span className="text-[10px] font-bold text-primary truncate max-w-[90px]">{clipboard.title}</span><span className="text-[10px] text-primary/50 flex-shrink-0">· tap day</span><button onClick={() => setClipboard(null)} className="text-primary/50 hover:text-primary ml-0.5 flex-shrink-0 text-sm leading-none">×</button></div>}
          {weekClipboard && <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 min-w-0"><Clipboard size={10} className="text-accent flex-shrink-0" /><span className="text-[10px] font-bold text-accent truncate max-w-[90px]">Wk {weekClipboard.week_number} copied</span><button onClick={() => setWeekClipboard(null)} className="text-accent/50 hover:text-accent ml-0.5 flex-shrink-0 text-sm leading-none">×</button></div>}
        </div>
        {error && <span className="text-xs text-error truncate flex-1 min-w-0">{error}</span>}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          <button onClick={() => save(false)} disabled={saving} className="h-8 px-3 rounded-lg text-xs font-bold tracking-wider border border-border text-text-secondary bg-surface hover:bg-surface-2 disabled:opacity-40 transition-colors">SAVE DRAFT</button>
          <button onClick={() => save(true)} disabled={saving} className="h-8 px-3 rounded-lg text-xs font-bold tracking-wider text-white disabled:opacity-40 transition-all flex items-center gap-1 hover:shadow-md active:scale-95" style={{ background: HEADER_G }}>
            {saving && <Loader2 size={11} className="animate-spin" />}PUBLISH
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile */}
      <div className="flex flex-col h-dvh bg-background lg:hidden">
        {TopBar}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-shrink-0 overflow-y-auto border-b border-border" style={{ maxHeight: '45vh', background: 'var(--color-surface)' }}>
            <AllWeeksCalendar weeks={weeks} selectedSessionId={selectedSessionId} clipboard={clipboard} weekClipboard={weekClipboard} onDayClick={handleDayClick} onPasteToDay={handlePasteToDay} onCopyWeek={copyWeek} onPasteWeek={handlePasteWeek} />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <MobileSessionEditor session={selectedSession} onUpdate={updateSession} onAddExercise={() => setPickerOpen(true)} onCopy={() => { if (selectedSession) setClipboard(deepCopySession(selectedSession)) }} onDelete={handleDeleteSelectedSession} />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex flex-col h-dvh bg-background">
        {TopBar}
        <div className="flex-1 flex min-h-0">
          {desktopView === 'calendar' || !selectedSession ? (
            <DesktopCalendarGrid weeks={weeks} selectedSessionId={selectedSessionId} clipboard={clipboard} weekClipboard={weekClipboard} onDayClick={handleDayClick} onPasteToDay={handlePasteToDay} onCopyWeek={copyWeek} onPasteWeek={handlePasteWeek} onCopySession={(s) => setClipboard(deepCopySession(s))} onDeleteSession={(s) => { setSelectedSessionId(s.id); setTimeout(handleDeleteSelectedSession, 0) }} />
          ) : (
            <DesktopSessionEditor session={selectedSession} onUpdate={updateSession} onAddExercise={() => setPickerOpen(true)} onCopy={() => { if (selectedSession) setClipboard(deepCopySession(selectedSession)) }} onDelete={handleDeleteSelectedSession} onBack={() => { setDesktopView('calendar'); setSelectedSessionId(null) }} />
          )}
        </div>
      </div>

      <ExercisePickerModal isOpen={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addExercises} />

      <Modal isOpen={!!confirmPaste} onClose={() => setConfirmPaste(null)} title="Replace Session?">
        <p className="text-sm text-text-secondary mb-4"><strong>{confirmPaste?.existingTitle}</strong> already exists on this day. Replace it with the copied session?</p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmPaste(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors">Cancel</button>
          <button onClick={() => confirmPaste && commitPaste(confirmPaste.weekIdx, confirmPaste.day)} className="flex-1 h-10 rounded-xl text-sm font-black text-white transition-all" style={{ background: HEADER_G }}>Replace</button>
        </div>
      </Modal>

      <Modal isOpen={confirmPasteWeekIdx !== null} onClose={() => setConfirmPasteWeekIdx(null)} title="Replace Week?">
        <p className="text-sm text-text-secondary mb-4">Week {(confirmPasteWeekIdx ?? 0) + 1} already has sessions. Replace all of them?</p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmPasteWeekIdx(null)} className="flex-1 h-10 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-2 transition-colors">Cancel</button>
          <button onClick={() => confirmPasteWeekIdx !== null && commitPasteWeek(confirmPasteWeekIdx)} className="flex-1 h-10 rounded-xl text-sm font-black text-white transition-all" style={{ background: HEADER_G }}>Replace</button>
        </div>
      </Modal>
    </>
  )
}
