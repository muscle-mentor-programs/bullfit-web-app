'use client'

import { cn } from '@/lib/utils/cn'
import type { FoodCorrection } from '@/types'
import { Check, ChevronDown, ChevronUp, Loader2, Plus, ScanBarcode, ShieldCheck, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'

const BarcodeScanner = dynamic(
  () => import('@/components/ui/BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })),
  { ssr: false },
)

type StatusTab = 'pending' | 'approved' | 'rejected'

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'pending',  label: 'Pending'  },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

// ─── Add Food Form Types ────────────────────────────────────────────────────

interface AddFoodFields {
  food_id: string
  food_name: string
  brand_name: string
  serving_size: string
  serving_size_unit: string
  calories: string
  protein_g: string
  carbs_g: string
  fat_g: string
}

const EMPTY_FORM: AddFoodFields = {
  food_id: '',
  food_name: '',
  brand_name: '',
  serving_size: '100',
  serving_size_unit: 'g',
  calories: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
}

// ─── Add Food Panel ─────────────────────────────────────────────────────────

function AddFoodPanel() {
  const [open, setOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [form, setForm] = useState<AddFoodFields>(EMPTY_FORM)
  const [formVisible, setFormVisible] = useState(false)
  const [looking, setLooking] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function updateField(key: keyof AddFoodFields, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function lookupBarcode(code: string) {
    const trimmed = code.trim()
    if (!trimmed) return
    setLooking(true)
    setLookupError(null)
    setSaveError(null)
    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(trimmed)}`)
      if (res.ok) {
        const food = await res.json()
        setForm({
          food_id: trimmed,
          food_name: food.description ?? '',
          brand_name: food.brandName ?? '',
          serving_size: String(food.servingSize ?? 100),
          serving_size_unit: food.servingSizeUnit ?? 'g',
          calories: String(food.calories ?? ''),
          protein_g: String(food.protein_g ?? ''),
          carbs_g: String(food.carbs_g ?? ''),
          fat_g: String(food.fat_g ?? ''),
        })
      } else {
        // Not found — still show form so admin can fill manually
        setForm({ ...EMPTY_FORM, food_id: trimmed })
        setLookupError('Product not found in Open Food Facts — fill in details manually.')
      }
      setFormVisible(true)
    } catch {
      setLookupError('Lookup failed. Check connection and try again.')
    } finally {
      setLooking(false)
    }
  }

  function handleScan(barcode: string) {
    setScannerOpen(false)
    setBarcodeInput(barcode)
    lookupBarcode(barcode)
  }

  async function handleSave() {
    if (!form.food_id || !form.food_name || !form.calories) {
      setSaveError('Barcode, name, and calories are required.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/food-override', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_id: form.food_id,
          food_name: form.food_name,
          brand_name: form.brand_name || null,
          serving_size: parseFloat(form.serving_size) || null,
          serving_size_unit: form.serving_size_unit || null,
          calories: parseFloat(form.calories) || 0,
          protein_g: parseFloat(form.protein_g) || 0,
          carbs_g: parseFloat(form.carbs_g) || 0,
          fat_g: parseFloat(form.fat_g) || 0,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Save failed')
      }
      setSaved(true)
      setForm(EMPTY_FORM)
      setBarcodeInput('')
      setFormVisible(false)
      setLookupError(null)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setBarcodeInput('')
    setFormVisible(false)
    setLookupError(null)
    setSaveError(null)
  }

  return (
    <>
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}

      <div
        className="rounded-2xl border border-border overflow-hidden shadow-sm"
        style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
      >
        <div className="h-0.5 w-full" style={{ background: '#00BEFF' }} />

        {/* Toggle header */}
        <button
          type="button"
          onClick={() => { setOpen((v) => !v); if (!open) resetForm() }}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#00BEFF' }}
            >
              <Plus size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-text-primary">ADD VERIFIED FOOD</p>
              <p className="text-[10px] text-text-muted">Scan barcode or enter UPC to add directly to database</p>
            </div>
          </div>
          {open ? <ChevronUp size={16} className="text-text-muted flex-shrink-0" /> : <ChevronDown size={16} className="text-text-muted flex-shrink-0" />}
        </button>

        {open && (
          <div className="px-4 pb-4 flex flex-col gap-3">

            {/* Success banner */}
            {saved && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-success bg-success/10 border border-success/30">
                <ShieldCheck size={14} />
                Food saved as verified — available to all users!
              </div>
            )}

            {/* Barcode input row */}
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') lookupBarcode(barcodeInput) }}
                placeholder="Enter UPC / barcode number"
                className={cn(
                  'flex-1 h-10 px-3 rounded-xl border border-border bg-background',
                  'text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                )}
              />
              <button
                type="button"
                onClick={() => lookupBarcode(barcodeInput)}
                disabled={!barcodeInput.trim() || looking}
                className={cn(
                  'h-10 px-3 rounded-xl text-xs font-black text-white border border-transparent',
                  'transition-all active:scale-[0.97] disabled:opacity-40',
                )}
                style={{ background: '#00BEFF' }}
              >
                {looking ? <Loader2 size={14} className="animate-spin" /> : 'LOOK UP'}
              </button>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                title="Scan barcode"
                className={cn(
                  'h-10 w-10 rounded-xl border border-border flex items-center justify-center',
                  'text-text-muted hover:text-primary hover:border-primary/40 transition-colors',
                )}
                style={{ background: 'var(--color-surface-2)' }}
              >
                <ScanBarcode size={17} />
              </button>
            </div>

            {/* Lookup error */}
            {lookupError && (
              <p className="text-xs text-warning font-semibold px-1">{lookupError}</p>
            )}

            {/* Food form */}
            {formVisible && (
              <div className="flex flex-col gap-3 pt-1">
                <div className="h-px" style={{ background: 'var(--color-border)' }} />

                {/* Barcode ID (read-only) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">BARCODE / ID</label>
                  <input
                    type="text"
                    value={form.food_id}
                    onChange={(e) => updateField('food_id', e.target.value)}
                    className={cn(
                      'h-9 px-3 rounded-xl border border-border bg-surface-2',
                      'text-xs text-text-muted font-mono',
                      'focus:outline-none focus:border-primary',
                    )}
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">Food Name <span className="text-error">*</span></label>
                  <input
                    type="text"
                    value={form.food_name}
                    onChange={(e) => updateField('food_name', e.target.value)}
                    placeholder="e.g. Peanut Butter"
                    className={cn(
                      'h-10 px-3 rounded-xl border border-border bg-background',
                      'text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                  />
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">Brand</label>
                  <input
                    type="text"
                    value={form.brand_name}
                    onChange={(e) => updateField('brand_name', e.target.value)}
                    placeholder="e.g. Jif"
                    className={cn(
                      'h-10 px-3 rounded-xl border border-border bg-background',
                      'text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                  />
                </div>

                {/* Serving */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">Serving Size</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.serving_size}
                      onChange={(e) => updateField('serving_size', e.target.value)}
                      className={cn(
                        'h-10 px-3 rounded-xl border border-border bg-background',
                        'text-sm text-text-primary',
                        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">Unit</label>
                    <input
                      type="text"
                      value={form.serving_size_unit}
                      onChange={(e) => updateField('serving_size_unit', e.target.value)}
                      placeholder="g"
                      className={cn(
                        'h-10 px-3 rounded-xl border border-border bg-background',
                        'text-sm text-text-primary placeholder:text-text-muted',
                        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                      )}
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'calories', label: 'Calories', required: true },
                      { key: 'protein_g', label: 'Protein (g)', required: false },
                      { key: 'carbs_g', label: 'Carbs (g)', required: false },
                      { key: 'fat_g', label: 'Fat (g)', required: false },
                    ] as { key: keyof AddFoodFields; label: string; required: boolean }[]
                  ).map(({ key, label, required }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[10px] font-black tracking-widest text-text-muted uppercase">
                        {label}{required && <span className="text-error"> *</span>}
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={form[key]}
                        onChange={(e) => updateField(key, e.target.value)}
                        className={cn(
                          'h-10 px-3 rounded-xl border border-border bg-background',
                          'text-sm text-text-primary',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Save error */}
                {saveError && (
                  <p className="text-xs text-error font-semibold px-1">{saveError}</p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !form.food_name || !form.calories}
                    className={cn(
                      'flex-1 h-11 rounded-xl text-white text-xs font-black tracking-wide',
                      'flex items-center justify-center gap-1.5',
                      'transition-all active:scale-[0.97] disabled:opacity-40',
                    )}
                    style={{ background: '#00BEFF' }}
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    {saving ? 'Saving…' : 'SAVE AS VERIFIED'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={cn(
                      'h-11 px-4 rounded-xl border border-border text-xs font-black',
                      'text-text-secondary hover:text-text-primary transition-colors',
                    )}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Diff Row ───────────────────────────────────────────────────────────────

function DiffRow({ label, original, corrected }: { label: string; original: string | number | null; corrected: string | number | null }) {
  const changed = String(original ?? '') !== String(corrected ?? '')
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
      <span className="text-[10px] font-black tracking-widest text-text-muted uppercase w-20 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 flex flex-col gap-0.5">
        {changed ? (
          <>
            <span className="text-xs text-error line-through opacity-60">{original ?? '—'}</span>
            <span className="text-xs font-semibold text-success">{corrected ?? '—'}</span>
          </>
        ) : (
          <span className="text-xs text-text-muted">{original ?? '—'} <span className="text-[10px]">(unchanged)</span></span>
        )}
      </div>
    </div>
  )
}

// ─── Correction Card ─────────────────────────────────────────────────────────

function CorrectionCard({
  correction,
  onAction,
}: {
  correction: FoodCorrection
  onAction: (id: string, action: 'approve' | 'reject') => Promise<void>
}) {
  const [acting, setActing] = useState<'approve' | 'reject' | null>(null)

  async function handleAction(action: 'approve' | 'reject') {
    setActing(action)
    await onAction(correction.id, action)
    setActing(null)
  }

  return (
    <div
      className="rounded-2xl border border-border overflow-hidden shadow-sm"
      style={{ background: 'linear-gradient(to bottom right, var(--color-surface), var(--color-surface-3, var(--color-surface)))' }}
    >
      <div className="h-0.5 w-full" style={{ background: '#00BEFF' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="text-sm font-black text-text-primary line-clamp-1">{correction.original_name}</p>
          <p className="text-xs text-text-muted mt-0.5">
            Submitted by {correction.user?.name ?? correction.user?.email ?? 'Unknown'}
            {' · '}
            {new Date(correction.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="text-[10px] font-black tracking-widest text-text-muted border border-border rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
          ID: {correction.food_id.slice(0, 8)}
        </span>
      </div>

      {/* Diff table */}
      <div className="px-4 py-3">
        <DiffRow label="Name"    original={correction.original_name}         corrected={correction.corrected_name} />
        <DiffRow label="Brand"   original={null}                             corrected={correction.corrected_brand} />
        <DiffRow label="Serving" original={null}                             corrected={correction.corrected_serving_size ? `${correction.corrected_serving_size} ${correction.corrected_serving_unit ?? ''}` : null} />
        <DiffRow label="Calories" original={null}                            corrected={correction.corrected_calories} />
        <DiffRow label="Protein"  original={null}                            corrected={correction.corrected_protein_g} />
        <DiffRow label="Carbs"    original={null}                            corrected={correction.corrected_carbs_g} />
        <DiffRow label="Fat"      original={null}                            corrected={correction.corrected_fat_g} />
        {correction.notes && (
          <div className="pt-2">
            <p className="text-[10px] font-black tracking-widest text-text-muted uppercase mb-0.5">Notes</p>
            <p className="text-xs text-text-primary leading-relaxed">{correction.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {correction.status === 'pending' && (
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => handleAction('approve')}
            disabled={acting !== null}
            className={cn(
              'flex-1 h-10 rounded-xl text-white text-xs font-black tracking-wide',
              'flex items-center justify-center gap-1.5',
              'active:scale-[0.97] transition-all disabled:opacity-50',
            )}
            style={{ background: '#00BEFF' }}
          >
            {acting === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Approve & Verify
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={acting !== null}
            className={cn(
              'h-10 px-4 rounded-xl text-xs font-black border border-border',
              'text-text-secondary hover:text-error hover:border-error transition-colors',
              'flex items-center justify-center gap-1.5 disabled:opacity-50',
            )}
          >
            {acting === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            Reject
          </button>
        </div>
      )}

      {correction.status === 'approved' && (
        <div className="flex items-center gap-1.5 px-4 pb-4 text-xs font-black text-success">
          <Check size={13} /> Approved & verified
        </div>
      )}

      {correction.status === 'rejected' && (
        <div className="flex items-center gap-1.5 px-4 pb-4 text-xs font-black text-text-muted">
          <X size={13} /> Rejected
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FoodCorrectionsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>('pending')
  const [corrections, setCorrections] = useState<FoodCorrection[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (status: StatusTab) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/food-corrections?status=${status}`)
      if (res.ok) setCorrections(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(activeTab)
  }, [activeTab, load])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/food-corrections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    // Remove the acted-on item from current list
    setCorrections((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-5 pb-6">

      {/* ── Header ── */}
      <header
        className="rounded-2xl overflow-hidden border border-primary/20 shadow-lg relative"
        style={{ background: '#00BEFF' }}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)' }} />
        <div className="px-5 py-4 relative">
          <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>ADMIN</p>
          <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">FOOD QA</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Review corrections · Add verified foods via barcode
          </p>
        </div>
      </header>

      {/* ── Add Verified Food (barcode scan / manual entry) ── */}
      <AddFoodPanel />

      {/* ── Status tabs ── */}
      <div
        className="flex gap-1 rounded-xl p-1 border border-border"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value)}
            className={cn(
              'flex-1 h-9 rounded-lg text-xs font-black tracking-wide transition-all',
              activeTab === value ? 'text-white shadow-sm' : 'text-text-muted hover:text-text-primary',
            )}
            style={activeTab === value ? { background: '#00BEFF' } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </div>
      ) : corrections.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'var(--color-surface-2)' }}
          >
            <ShieldCheck size={24} className="text-text-muted" />
          </div>
          <p className="text-sm font-black text-text-primary">No {activeTab} corrections</p>
          <p className="text-xs text-text-muted mt-1">
            {activeTab === 'pending' ? 'All caught up!' : `No ${activeTab} corrections yet.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {corrections.map((c) => (
            <CorrectionCard key={c.id} correction={c} onAction={handleAction} />
          ))}
        </div>
      )}

    </div>
  )
}
