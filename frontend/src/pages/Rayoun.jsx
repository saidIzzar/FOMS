import { useState, useEffect } from 'react';
import { moldsAPI, rayounsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Layers, ChevronRight, ChevronDown, Box as BoxIcon, Package, Plus, Minus, Inbox, Save, RefreshCw, Archive, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Rayoun() {
  const { t, language } = useLanguage();
  const [rayouns, setRayouns] = useState([]);
  const [molds, setMolds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBoxes, setExpandedBoxes] = useState({});
  const [expandedRayouns, setExpandedRayouns] = useState({});
  const [assignMode, setAssignMode] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeRes, moldsRes] = await Promise.all([
        rayounsAPI.getTree(),
        moldsAPI.getAll()
      ]);
      setRayouns(treeRes?.data || []);
      setMolds(moldsRes?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setSaving(true);
    setError(null);
    try {
      await rayounsAPI.seedAll();
      await fetchData();
    } catch (err) {
      console.error('Error seeding:', err);
      setError(err.message || 'Failed to seed data');
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const toggleRayoun = (rayounId) => {
    setExpandedRayouns(prev => ({ ...prev, [rayounId]: !prev[rayounId] }));
  };

  const toggleBox = (boxId) => {
    setExpandedBoxes(prev => ({ ...prev, [boxId]: !prev[boxId] }));
  };

  const getMoldCount = (box) => {
    if (!box || !Array.isArray(box.molds)) return 0;
    return box.molds.length;
  };
  const isRTL = language === 'ar';

  const unassignedMolds = Array.isArray(molds)
    ? molds.filter(m => m && !m.box_id && m.is_active)
    : [];

  const handleAssignMold = async (moldId, boxId) => {
    try {
      await moldsAPI.update(moldId, { box_id: boxId });
      await fetchData();
      setAssignMode(null);
    } catch (err) {
      console.error('Error assigning mold:', err);
    }
  };

  const handleRemoveMold = async (moldId) => {
    try {
      await moldsAPI.update(moldId, { box_id: null });
      await fetchData();
    } catch (err) {
      console.error('Error removing mold:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3">
            <Layers className="text-cyan-400" size={28} />
            {t('rayoun')}
          </h1>
          <p className="text-on-surface-variant mt-1">
            {isRTL ? 'نظام تخزين القوالب الهرمي' : 'Hierarchical Mold Storage System'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={seedData}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            {isRTL ? 'تهيئة' : 'Seed'}
          </button>
        </div>
      </div>

      {(!rayouns || !Array.isArray(rayouns) || rayouns.length === 0) ? (
        <div className="glass-card p-12 text-center">
          <Inbox size={48} className="mx-auto text-on-surface-variant mb-4" />
          <p className="text-on-surface-variant">{t('common.noData') || 'No data found'}</p>
          <p className="text-sm text-on-surface-variant mt-2">
            {isRTL ? 'انقر زر التهيئة لإنشاء البيانات' : 'Click Seed button to create initial data'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rayouns.map((rayoun, rIdx) => (
            <motion.div
              key={rayoun.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rIdx * 0.1 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => toggleRayoun(rayoun.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-cyan-400">{rayoun.name}</span>
                  </div>
                  <div className="text-start">
                    <h3 className="text-lg font-semibold text-on-surface">
                      {isRTL ? 'رايون' : 'Rayoun'} {rayoun.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {rayoun.boxes?.length || 0} {isRTL ? 'صندوق' : 'boxes'} • {(rayoun.boxes || []).reduce((a, b) => a + (b.molds?.length || 0), 0) || 0} {isRTL ? 'قالب' : 'molds'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expandedRayouns[rayoun.id] ? (
                    <ChevronDown size={20} className="text-on-surface-variant" />
                  ) : (
                    <ChevronRight size={20} className="text-on-surface-variant flip-rtl" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedRayouns[rayoun.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {(rayoun.boxes || []).map((box, bIdx) => (
                        <motion.div
                          key={box.id}
                          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: bIdx * 0.05 }}
                          className="ms-4 md:ms-8 ps-4 border-s-2 border-cyan-500/30"
                        >
                          <button
                            onClick={() => toggleBox(box.id)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                getMoldCount(box) >= box.capacity
                                  ? 'bg-amber-500/20'
                                  : 'bg-violet-500/20'
                              }`}>
                                <Archive size={20} className={
                                  getMoldCount(box) >= box.capacity
                                    ? 'text-amber-400'
                                    : 'text-violet-400'
                                } />
                              </div>
                              <div className="text-start">
                                <h4 className="font-medium text-on-surface">{box.box_number}</h4>
                                <p className="text-xs text-on-surface-variant">
                                  {getMoldCount(box)}/{box.capacity} {isRTL ? 'قالب' : 'molds'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-surface rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    getMoldCount(box) >= box.capacity
                                      ? 'bg-amber-500'
                                      : 'bg-violet-500'
                                  }`}
                                  style={{ width: `${(getMoldCount(box) / box.capacity) * 100}%` }}
                                />
                              </div>
                              {expandedBoxes[box.id] ? (
                                <Minus size={16} className="text-on-surface-variant" />
                              ) : (
                                <Plus size={16} className="text-on-surface-variant" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedBoxes[box.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ms-4 md:ms-8 mt-2 space-y-2"
                              >
                                {(box.molds || []).length > 0 ? (
                                  (box.molds || []).map((mold) => (
                                    <div
                                      key={mold.id}
                                      className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-border"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Box size={16} className="text-cyan-400" />
                                        <div>
                                          <p className="font-medium text-on-surface">{mold.mold_code}</p>
                                          <p className="text-xs text-on-surface-variant">
                                            {mold.cavities} {isRTL ? 'تجويف' : 'cav'} • {mold.steel_type}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveMold(mold.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                        title={isRTL ? 'إزالة' : 'Remove'}
                                      >
                                        <Minus size={14} />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-on-surface-variant p-3">
                                    {isRTL ? 'فارغ' : 'Empty'}
                                  </p>
                                )}

                                {getMoldCount(box) < box.capacity && unassignedMolds.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <p className="text-xs text-on-surface-variant mb-2">
                                      {isRTL ? 'إضافة قالب' : 'Add mold'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {unassignedMolds.slice(0, 10).map((mold) => (
                                        <button
                                          key={mold.id}
                                          onClick={() => handleAssignMold(mold.id, box.id)}
                                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
                                        >
                                          {mold.mold_code}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {unassignedMolds.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="font-semibold text-on-surface mb-3">
                {isRTL ? 'قوالب غير معينة' : 'Unassigned Molds'} ({unassignedMolds.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {unassignedMolds.slice(0, 20).map((mold) => (
                  <span
                    key={mold.id}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border text-on-surface-variant text-sm"
                  >
                    {mold.mold_code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}