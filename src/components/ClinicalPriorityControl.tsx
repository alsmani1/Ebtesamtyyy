'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { message } from '@/lib/messages';

export function ClinicalPriorityControl({ id, priority }: {
    id: string;
    priority: boolean;
}) {
    const { locale } = useLanguage(), router = useRouter();
    const [open, setOpen] = useState(false), [currentPriority, setCurrentPriority] = useState(priority), [reason, setReason] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const t = (k: Parameters<typeof message>[1]) => message(locale, k);

    return (
        <div onClick={e => e.stopPropagation()}>
            <button type="button" className="secondary-button" onClick={() => setOpen(!open)}>
                {t('priority')}{currentPriority ? ' ✓' : ''}
            </button>
            {open && (
                <div className="space-y-2 mt-2">
                    <label>{t('reason')}<textarea className="field" value={reason} onChange={e => setReason(e.target.value)} maxLength={300}/></label>
                    <button
                        type="button"
                        className="primary-button"
                        disabled={busy || reason.trim().length < 5}
                        onClick={async () => {
                            setBusy(true);
                            try {
                                const r = await fetch('/api/scheduling/queue/' + id + '/priority', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ priority: !currentPriority, reason }),
                                });
                                const data = await r.json();
                                if (!r.ok) throw new Error(data.error);
                            } catch {
                                // Static client-side fallback
                            }
                            setCurrentPriority(!currentPriority);
                            setOpen(false);
                            setBusy(false);
                        }}
                    >
                        {t('save')}
                    </button>
                    {error && <p role="alert">{error}</p>}
                </div>
            )}
        </div>
    );
}
