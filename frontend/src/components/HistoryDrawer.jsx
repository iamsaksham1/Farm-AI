import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { getScanHistory, deleteScanHistory } from '../services/api';

export default function HistoryDrawer({ lang, t, onStartScan }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScanHistory();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(t.errorBackendDown);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteScanHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const isHindi = lang === 'hi';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <span className="label-meta block mb-1">Archive</span>
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
            {t.historyTitle}
          </h2>
        </div>

        <button
          onClick={fetchHistory}
          className="p-1.5 rounded-md border border-black/[0.08] dark:border-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          title="Refresh History"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-neutral-400">
          Loading archive...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-xs text-red-500 border border-red-500/20 rounded-xl">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-xs text-neutral-500">{t.historyEmpty}</p>
          <button
            onClick={onStartScan}
            className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium"
          >
            {t.heroCtaScan}
          </button>
        </div>
      ) : (
        <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-xl overflow-hidden bg-white dark:bg-[#1c1b1a] divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {history.map((item) => {
            const crop = isHindi ? item.crop_hi || item.crop : item.crop;
            const disease = isHindi ? item.disease_name_hi || item.disease_name : item.disease_name;

            return (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 border border-black/[0.06] dark:border-white/[0.06]">
                    {item.image_data && (
                      <img src={item.image_data} alt={crop} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {crop}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {item.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {disease}
                    </p>
                    <span className="font-mono text-[10px] text-neutral-400 block mt-0.5">
                      {item.created_at}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  title={t.deleteRecord}
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
