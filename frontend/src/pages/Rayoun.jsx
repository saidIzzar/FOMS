/**
 * Rayoun.jsx — FOMS Mold Storage System
 * ============================================================
 * DETERMINISTIC WORKFLOW (no AI, no auto-assign, no tonnage logic):
 *   1. User selects an unassigned mold
 *   2. User selects a Rayoun (A / B / C)
 *   3. System shows boxes inside selected Rayoun
 *   4. User selects a Box
 *   5. User clicks "Assign" → PATCH /molds/{id}  { box_id }
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { moldsAPI, rayounsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Layers, Archive, Package, RefreshCw, Inbox,
  ArrowRight, Loader, X, CheckCircle, AlertCircle
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────
const TOKEN = {
  cyan:       '#06b6d4',
  violet:     '#8b5cf6',
  amber:      '#f59e0b',
  success:    '#22c55e',
  danger:     '#ef4444',
  surfaceBase:'rgba(15, 23, 42, 0.85)',
  surfaceCard:'rgba(30, 41, 59, 0.60)',
  border:     'rgba(255,255,255,0.08)',
  text:       '#f1f5f9',
  textMuted:  '#94a3b8',
};

// ─── Inline style helpers ─────────────────────────────────────
const card = {
  background: TOKEN.surfaceCard,
  border: `1px solid ${TOKEN.border}`,
  borderRadius: 16,
  backdropFilter: 'blur(12px)',
  padding: 16,
};

// ─── Main Page Component ──────────────────────────────────────
export default function Rayoun() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  // State — exactly as specified
  const [selectedMold,   setSelectedMold]   = useState(null);
  const [selectedRayoun, setSelectedRayoun] = useState(null);
  const [selectedBox,    setSelectedBox]    = useState(null);
  const [rayouns,        setRayouns]        = useState([]);
  const [molds,          setMolds]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [toast,          setToast]          = useState(null); // { type: 'success'|'error', msg }

  // ── Data fetching ───────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeRes, moldsRes] = await Promise.all([
        rayounsAPI.getTree(),
        moldsAPI.getAll(),
      ]);

      const treeData  = Array.isArray(treeRes?.data)  ? treeRes.data  : [];
      const moldsData = Array.isArray(moldsRes?.data) ? moldsRes.data : [];

      setRayouns(treeData);
      setMolds(moldsData);

      // If tree is empty, seed silently then retry once
      if (treeData.length === 0) {
        try {
          await rayounsAPI.seedAll();
          const retryTree  = await rayounsAPI.getTree();
          const retryMolds = await moldsAPI.getAll();
          setRayouns(Array.isArray(retryTree?.data)  ? retryTree.data  : []);
          setMolds(Array.isArray(retryMolds?.data)   ? retryMolds.data : []);
        } catch (_) { /* silent fail — will show empty state with seed button */ }
      }
    } catch (err) {
      console.error('[Rayoun] fetchData error:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Toast helper ────────────────────────────────────────────
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Manual seed ─────────────────────────────────────────────
  const handleSeed = async () => {
    setSaving(true);
    setError(null);
    try {
      await rayounsAPI.seedAll();
      await fetchData();
      showToast('success', isRTL ? 'تم تهيئة البيانات' : 'System initialized successfully');
    } catch (err) {
      console.error('[Rayoun] seed error:', err);
      await fetchData(); // still try to refresh
      showToast('error', isRTL ? 'فشل التهيئة' : 'Seed failed — retrying data');
    } finally {
      setSaving(false);
    }
  };

  // ── Assign mold to box ──────────────────────────────────────
  const handleAssign = async () => {
    // Guard — button should be disabled, but double-check
    if (!selectedMold || !selectedBox) return;

    setSaving(true);
    try {
      // ONLY send { box_id } — spec requirement to prevent 422
      await rayounsAPI.assignMoldToBox(selectedMold.id, selectedBox.id);

      showToast('success', isRTL
        ? `تم تعيين ${selectedMold.mold_code} إلى ${selectedBox.box_number}`
        : `${selectedMold.mold_code} assigned to ${selectedBox.box_number}`
      );

      // Reset selection
      setSelectedMold(null);
      setSelectedBox(null);

      // Refresh data — no full page reload
      await fetchData();
    } catch (err) {
      console.error('[Rayoun] assign error:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Assignment failed';
      showToast('error', detail);
    } finally {
      setSaving(false);
    }
  };

  // ── Remove mold from box ────────────────────────────────────
  const handleRemove = async (moldId) => {
    try {
      // Send { box_id: null } to unassign
      await rayounsAPI.removeMoldFromBox(moldId);
      await fetchData();
      showToast('success', isRTL ? 'تم إزالة القالب' : 'Mold removed from box');
    } catch (err) {
      console.error('[Rayoun] remove error:', err);
      showToast('error', err?.response?.data?.detail || 'Failed to remove mold');
    }
  };

  // ── Derived state ───────────────────────────────────────────
  const safeRayouns      = Array.isArray(rayouns) ? rayouns : [];
  const safeMolds        = Array.isArray(molds)   ? molds   : [];
  const unassignedMolds  = safeMolds.filter(m => m && !m.box_id && m.is_active);
  const boxesForRayoun   = selectedRayoun
    ? (Array.isArray(selectedRayoun.boxes) ? selectedRayoun.boxes : [])
    : [];
  const canAssign        = !!selectedMold && !!selectedBox && !saving;
  const isEmpty          = safeRayouns.length === 0;

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: 320, gap: 16
      }}>
        <Loader
          size={40}
          style={{ color: TOKEN.cyan, animation: 'spin 1s linear infinite' }}
        />
        <p style={{ color: TOKEN.textMuted, margin: 0 }}>
          {isRTL ? 'جاري التحميل...' : 'Loading storage system...'}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 0 40px 0', position: 'relative' }}>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success'
            ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? TOKEN.success : TOKEN.danger}`,
          borderRadius: 12, padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          color: toast.type === 'success' ? TOKEN.success : TOKEN.danger,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          maxWidth: 360, fontSize: 14, fontWeight: 500,
          animation: 'slideIn 0.25s ease',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />
          }
          <span>{toast.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rayoun-card { transition: border-color 0.2s, background 0.2s; }
        .rayoun-card:hover { border-color: rgba(255,255,255,0.18) !important; }
        .item-btn { transition: background 0.15s, border-color 0.15s; cursor: pointer; }
        .item-btn:hover:not(.selected) { background: rgba(255,255,255,0.04) !important; }
        .assign-btn { transition: background 0.2s, opacity 0.2s; }
        .assign-btn:hover:not(:disabled) { background: #0891b2 !important; }
        .assign-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .remove-btn { transition: color 0.15s; }
        .remove-btn:hover { color: #fca5a5 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24
      }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 700, color: TOKEN.text,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <Layers size={26} style={{ color: TOKEN.cyan }} />
            {isRTL ? 'نظام تخزين القوالب' : 'Mold Storage System'}
          </h1>
          <p style={{ margin: '4px 0 0', color: TOKEN.textMuted, fontSize: 13 }}>
            {isRTL
              ? 'حدد قالباً، ثم رايون، ثم صندوق — ثم انقر تعيين'
              : 'Select a mold → select a rayoun → select a box → assign'
            }
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(6,182,212,0.12)',
            border: `1px solid rgba(6,182,212,0.3)`,
            color: TOKEN.cyan, cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
          className="assign-btn"
        >
          <RefreshCw
            size={15}
            style={saving ? { animation: 'spin 1s linear infinite' } : {}}
          />
          {isRTL ? 'تهيئة' : 'Initialize / Seed'}
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.10)',
          border: `1px solid rgba(239,68,68,0.3)`,
          borderRadius: 10, padding: '10px 16px',
          color: TOKEN.danger, fontSize: 13, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <AlertCircle size={16} />
          {error}
          <button
            onClick={fetchData}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: TOKEN.cyan, cursor: 'pointer', fontSize: 12
            }}
          >
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────── */}
      {isEmpty ? (
        <div style={{
          ...card, textAlign: 'center', padding: 56,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
        }}>
          <Inbox size={48} style={{ color: TOKEN.textMuted }} />
          <p style={{ margin: 0, color: TOKEN.textMuted, fontSize: 15 }}>
            {isRTL ? 'لا توجد بيانات — انقر لإنشاء البيانات' : 'No storage data found'}
          </p>
          <button
            onClick={handleSeed}
            disabled={saving}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: `rgba(6,182,212,0.20)`,
              border: `1px solid rgba(6,182,212,0.4)`,
              color: TOKEN.cyan, cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
            className="assign-btn"
          >
            {saving
              ? (isRTL ? 'جاري...' : 'Initializing...')
              : (isRTL ? 'إنشاء البيانات' : 'Create Storage Data')
            }
          </button>
        </div>

      ) : (
        /* ── Three-Column Workflow Layout ───────────────────── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16
        }}>

          {/* ── Column 1: Unassigned Molds ──────────────────── */}
          <div style={card} className="rayoun-card">
            <h3 style={{
              margin: '0 0 14px', fontSize: 14, fontWeight: 600,
              color: TOKEN.text, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Package size={16} style={{ color: TOKEN.cyan }} />
              {isRTL ? 'القوالب المتاحة' : 'Available Molds'}
              <span style={{
                marginLeft: 'auto', fontSize: 11, color: TOKEN.textMuted,
                background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: 20
              }}>
                {unassignedMolds.length}
              </span>
            </h3>

            <div style={{ maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {unassignedMolds.length > 0 ? (
                unassignedMolds.map((mold) => {
                  const isSelected = selectedMold?.id === mold.id;
                  return (
                    <button
                      key={mold.id}
                      onClick={() => {
                        setSelectedMold(mold);
                        setSelectedBox(null);
                      }}
                      className={`item-btn${isSelected ? ' selected' : ''}`}
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 12px',
                        borderRadius: 10, border: `1px solid ${isSelected
                          ? 'rgba(6,182,212,0.6)' : TOKEN.border}`,
                        background: isSelected
                          ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        boxShadow: isSelected ? `0 0 0 1px rgba(6,182,212,0.3)` : 'none',
                      }}
                    >
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                        <div>
                          <p style={{
                            margin: 0, fontWeight: 600, fontSize: 13, color: TOKEN.text
                          }}>
                            {mold.mold_code}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: TOKEN.textMuted }}>
                            {mold.cavities || 1}cav
                            {mold.steel_type ? ` • ${mold.steel_type}` : ''}
                            {mold.required_tonnage ? ` • ${mold.required_tonnage}T` : ''}
                          </p>
                        </div>
                        {isSelected && (
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: TOKEN.cyan, flexShrink: 0
                          }} />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div style={{
                  padding: '32px 16px', textAlign: 'center',
                  color: TOKEN.textMuted, fontSize: 13
                }}>
                  {isRTL ? 'لا توجد قوالب متاحة' : 'No unassigned molds'}
                </div>
              )}
            </div>
          </div>

          {/* ── Column 2: Rayouns ───────────────────────────── */}
          <div style={card} className="rayoun-card">
            <h3 style={{
              margin: '0 0 14px', fontSize: 14, fontWeight: 600,
              color: TOKEN.text, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Layers size={16} style={{ color: TOKEN.violet }} />
              {isRTL ? 'الرايونات' : 'Rayouns'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {safeRayouns.map((rayoun) => {
                const isSelected   = selectedRayoun?.id === rayoun.id;
                const safeBoxes    = Array.isArray(rayoun.boxes) ? rayoun.boxes : [];
                const totalMolds   = safeBoxes.reduce((s, b) =>
                  s + (Array.isArray(b.molds) ? b.molds.length : 0), 0);
                const totalCap     = safeBoxes.reduce((s, b) => s + (b.capacity || 6), 0);
                const fillPct      = totalCap > 0 ? Math.min((totalMolds / totalCap) * 100, 100) : 0;

                return (
                  <button
                    key={rayoun.id}
                    onClick={() => {
                      setSelectedRayoun(rayoun);
                      setSelectedBox(null);
                    }}
                    className={`item-btn${isSelected ? ' selected' : ''}`}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 14px',
                      borderRadius: 12, border: `1px solid ${isSelected
                        ? 'rgba(139,92,246,0.6)' : TOKEN.border}`,
                      background: isSelected
                        ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? `0 0 0 1px rgba(139,92,246,0.3), 0 0 20px rgba(139,92,246,0.08)` : 'none',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div>
                        <p style={{
                          margin: 0, fontWeight: 700, fontSize: 15, color: TOKEN.text
                        }}>
                          {isRTL ? 'رايون' : 'Rayoun'} {rayoun.name}
                        </p>
                        <p style={{
                          margin: '2px 0 0', fontSize: 11, color: TOKEN.textMuted
                        }}>
                          {safeBoxes.length} {isRTL ? 'صندوق' : 'boxes'} •{' '}
                          {totalMolds}/{totalCap} {isRTL ? 'قالب' : 'molds'}
                        </p>
                      </div>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800, color: TOKEN.violet, flexShrink: 0,
                      }}>
                        {rayoun.name}
                      </div>
                    </div>

                    {/* Fill bar */}
                    <div style={{
                      marginTop: 10, height: 3, background: 'rgba(255,255,255,0.06)',
                      borderRadius: 4, overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', width: `${fillPct}%`,
                        background: fillPct >= 80 ? TOKEN.amber : TOKEN.violet,
                        borderRadius: 4, transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Column 3: Boxes ─────────────────────────────── */}
          <div style={card} className="rayoun-card">
            <h3 style={{
              margin: '0 0 14px', fontSize: 14, fontWeight: 600,
              color: TOKEN.text, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Archive size={16} style={{ color: TOKEN.amber }} />
              {isRTL ? 'الصناديق' : 'Boxes'}
              {selectedRayoun && (
                <span style={{
                  fontSize: 11, color: TOKEN.textMuted,
                  background: 'rgba(255,255,255,0.07)',
                  padding: '2px 8px', borderRadius: 20
                }}>
                  {selectedRayoun.name}
                </span>
              )}
            </h3>

            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!selectedRayoun ? (
                <div style={{
                  padding: '32px 16px', textAlign: 'center',
                  color: TOKEN.textMuted, fontSize: 13
                }}>
                  {isRTL ? 'اختر رايون أولاً' : 'Select a rayoun first'}
                </div>
              ) : boxesForRayoun.length === 0 ? (
                <div style={{
                  padding: '32px 16px', textAlign: 'center',
                  color: TOKEN.textMuted, fontSize: 13
                }}>
                  {isRTL ? 'لا توجد صناديق' : 'No boxes in this rayoun'}
                </div>
              ) : (
                boxesForRayoun.map((box) => {
                  const isSelected = selectedBox?.id === box.id;
                  const safeMolds  = Array.isArray(box.molds) ? box.molds : [];
                  const moldCount  = safeMolds.length;
                  const capacity   = box.capacity || 6;
                  const isFull     = moldCount >= capacity;
                  const fillPct    = Math.min((moldCount / capacity) * 100, 100);

                  return (
                    <div
                      key={box.id}
                      style={{
                        borderRadius: 12, border: `1px solid ${isSelected
                          ? 'rgba(139,92,246,0.6)' : TOKEN.border}`,
                        background: isSelected
                          ? 'rgba(139,92,246,0.10)' : 'rgba(255,255,255,0.02)',
                        padding: '10px 12px',
                        boxShadow: isSelected
                          ? '0 0 0 1px rgba(139,92,246,0.25)' : 'none',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      {/* Box header — clickable */}
                      <button
                        onClick={() => !isFull && setSelectedBox(box)}
                        disabled={isFull}
                        className="item-btn"
                        style={{
                          width: '100%', background: 'none', border: 'none',
                          textAlign: 'left', padding: 0, cursor: isFull ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', marginBottom: 6
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Archive
                              size={14}
                              style={{ color: isFull ? TOKEN.amber : TOKEN.violet }}
                            />
                            <span style={{
                              fontWeight: 600, fontSize: 13, color: TOKEN.text
                            }}>
                              {box.box_number}
                            </span>
                            {isFull && (
                              <span style={{
                                fontSize: 10, color: TOKEN.amber,
                                background: 'rgba(245,158,11,0.12)',
                                padding: '1px 6px', borderRadius: 20,
                              }}>
                                {isRTL ? 'ممتلئ' : 'FULL'}
                              </span>
                            )}
                          </div>
                          <span style={{
                            fontSize: 11, color: TOKEN.textMuted
                          }}>
                            {moldCount}/{capacity}
                          </span>
                        </div>

                        {/* Capacity bar */}
                        <div style={{
                          height: 3, background: 'rgba(255,255,255,0.06)',
                          borderRadius: 4, overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', width: `${fillPct}%`,
                            background: isFull ? TOKEN.amber : TOKEN.violet,
                            borderRadius: 4, transition: 'width 0.4s ease',
                          }} />
                        </div>
                      </button>

                      {/* Molds inside box — shown when selected */}
                      {isSelected && safeMolds.length > 0 && (
                        <div style={{
                          marginTop: 10, paddingTop: 10,
                          borderTop: `1px solid ${TOKEN.border}`,
                        }}>
                          <p style={{
                            margin: '0 0 6px', fontSize: 11,
                            color: TOKEN.textMuted, textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {isRTL ? 'القوالب' : 'Stored molds'}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {safeMolds.map((mold) => (
                              <div
                                key={mold.id}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  background: 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${TOKEN.border}`,
                                  borderRadius: 8, padding: '4px 8px',
                                  fontSize: 11, color: TOKEN.text,
                                }}
                              >
                                <span>{mold.mold_code}</span>
                                <button
                                  onClick={() => handleRemove(mold.id)}
                                  className="remove-btn"
                                  style={{
                                    background: 'none', border: 'none',
                                    color: TOKEN.danger, cursor: 'pointer',
                                    padding: 0, lineHeight: 1, display: 'flex',
                                  }}
                                  title={isRTL ? 'إزالة' : 'Remove from box'}
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Assign Panel ─────────────────────────────── */}
            {selectedMold && selectedBox && (
              <div style={{
                marginTop: 16, paddingTop: 16,
                borderTop: `1px solid ${TOKEN.border}`,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 10
                }}>
                  {/* Preview */}
                  <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      color: TOKEN.cyan, fontWeight: 600, fontSize: 12,
                      background: 'rgba(6,182,212,0.10)',
                      border: `1px solid rgba(6,182,212,0.25)`,
                      borderRadius: 6, padding: '2px 8px',
                    }}>
                      {selectedMold.mold_code}
                    </span>
                    <ArrowRight size={14} style={{ color: TOKEN.textMuted }} />
                    <span style={{
                      color: TOKEN.violet, fontWeight: 600, fontSize: 12,
                      background: 'rgba(139,92,246,0.10)',
                      border: `1px solid rgba(139,92,246,0.25)`,
                      borderRadius: 6, padding: '2px 8px',
                    }}>
                      {selectedBox.box_number}
                    </span>
                  </div>

                  {/* Assign Button — only enabled when selectedMold && selectedBox */}
                  <button
                    onClick={handleAssign}
                    disabled={!canAssign}
                    className="assign-btn"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 18px', borderRadius: 10,
                      background: TOKEN.cyan, color: '#0f172a',
                      border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: 13,
                      opacity: canAssign ? 1 : 0.4,
                    }}
                  >
                    {saving
                      ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <ArrowRight size={14} />
                    }
                    {isRTL ? 'تعيين' : 'Assign'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Summary Stats ──────────────────────────────────────── */}
      {!isEmpty && (
        <div style={{
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12
        }}>
          {safeRayouns.map((r) => {
            const safeBoxes  = Array.isArray(r.boxes) ? r.boxes : [];
            const total      = safeBoxes.reduce((s, b) =>
              s + (Array.isArray(b.molds) ? b.molds.length : 0), 0);
            const cap        = safeBoxes.reduce((s, b) => s + (b.capacity || 6), 0);
            return (
              <div key={r.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${TOKEN.border}`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16, color: TOKEN.violet,
                }}>
                  {r.name}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TOKEN.text }}>
                    {total}
                    <span style={{ fontSize: 12, color: TOKEN.textMuted, fontWeight: 400 }}>
                      /{cap}
                    </span>
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: TOKEN.textMuted }}>
                    {isRTL ? 'قوالب مخزنة' : 'molds stored'}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Unassigned count */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${TOKEN.border}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(6,182,212,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Package size={18} style={{ color: TOKEN.cyan }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TOKEN.text }}>
                {unassignedMolds.length}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: TOKEN.textMuted }}>
                {isRTL ? 'قوالب غير مخصصة' : 'unassigned molds'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}