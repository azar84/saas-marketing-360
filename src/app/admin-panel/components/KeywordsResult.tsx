'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type KeywordsPayload = {
  industry: string;
  keywords?: {
    core_synonyms: string[];
    service_modifiers: string[];
    product_terms: string[];
    problem_terms: string[];
    buyer_roles: string[];
    negative_keywords: string[];
  };
  error?: string;
};

export default function KeywordsResult({ onBack }: { onBack: () => void }) {
  const [payload, setPayload] = useState<KeywordsPayload | null>(null);

  // Load payload from sessionStorage and URL hash
  useEffect(() => {
    let p: KeywordsPayload | null = null;
    try {
      const stored = sessionStorage.getItem('keywords:last');
      if (stored) p = JSON.parse(stored);
    } catch {}

    // Merge with URL hash params for robustness
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.startsWith('#keywords-result')) {
        const qIndex = hash.indexOf('?');
        const qs = qIndex >= 0 ? new URLSearchParams(hash.slice(qIndex + 1)) : new URLSearchParams();
        const industry = qs.get('industry') || p?.industry || '';
        const ok = qs.get('ok') === 'true';
        const error = qs.get('error') || undefined;
        if (!p) p = { industry, error } as any;
        p = { industry, keywords: ok ? p?.keywords : undefined, error: error || p?.error };
      }
    }
    setPayload(p);
  }, []);

  const entries = useMemo(() => {
    const k = payload?.keywords || {};
    const list = Object.entries(k).filter(([, v]) => Array.isArray(v)) as [string, string[]][];
    const priority = [
      'core_terms',
      'service_queries',
      'product_queries',
      'problem_queries',
      'transactional_modifiers',
      'informational_modifiers',
      'comparison_modifiers',
      'local_intent_templates',
      'audience_modifiers',
      'brand_agnostic',
      'negative_keywords',
      'long_tail_examples',
    ];
    const weight = (k: string) => {
      const idx = priority.indexOf(k);
      return idx === -1 ? 999 : idx;
    };
    return list.sort((a, b) => weight(a[0]) - weight(b[0]) || a[0].localeCompare(b[0]));
  }, [payload]);

  const allKeywords = useMemo(() => entries.flatMap(([, v]) => v), [entries]);

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload?.keywords || {}, null, 2));
    } catch {}
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(allKeywords.join(', '));
    } catch {}
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(payload?.keywords || {}, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload?.industry || 'keywords'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!payload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Keyword Results</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Search-optimized keyword sets</p>
          </div>
          <Button onClick={onBack}>Back</Button>
        </div>

        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
          <div style={{ color: 'var(--color-text-secondary)' }}>No result data available.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Keyword Results</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{payload.industry}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={copyJSON}>Copy JSON</Button>
          <Button variant="secondary" onClick={copyAll}>Copy All</Button>
          <Button onClick={downloadJSON}>Download JSON</Button>
          <Button variant="ghost" onClick={onBack}>Back</Button>
        </div>
      </div>

      {payload.error ? (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-error-light)', borderColor: 'var(--color-gray-light)' }}>
          <div className="text-sm" style={{ color: 'var(--color-error-dark)' }}>{payload.error}</div>
        </Card>
      ) : (
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {entries.map(([key, list]) => {
              const label = key.replace(/_/g, ' ');
              return (
                <div key={key}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {list.length ? (
                      list.map((k) => (
                        <span key={k} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--color-text-muted, #9CA3AF)' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}


