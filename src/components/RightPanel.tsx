import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useQuiz } from '@/state/quizStore';
import { linkifySegments, parseExplanation } from '@/lib/quiz';

export type RightPaneId = 'notes' | 'explanation' | 'refs';

type Props = {
  active: RightPaneId;
  onChange: (p: RightPaneId) => void;
};

export function RightPanel({ active, onChange }: Props) {
  const questions = useQuiz((s) => s.questions);
  const idx = useQuiz((s) => s.progress.currentIdx);
  const submitted = useQuiz((s) => s.progress.submitted);
  const notes = useQuiz((s) => s.progress.notes);
  const setNote = useQuiz((s) => s.setNote);

  const q = questions[idx];
  const isAnswered = !!submitted[idx];
  const parsed = useMemo(() => parseExplanation(q?.explanation ?? ''), [q]);

  const totalNotes = useMemo(
    () => Object.values(notes).filter((n) => n && n.trim()).length,
    [notes],
  );

  // local state to debounce blur-save behavior — but keep responsive UX with key-up commit
  const [local, setLocal] = useState(notes[idx] ?? '');
  const lastIdxRef = useRef(idx);
  useEffect(() => {
    if (lastIdxRef.current !== idx) {
      setLocal(notes[idx] ?? '');
      lastIdxRef.current = idx;
    }
  }, [idx, notes]);

  return (
    <div
      className="flex flex-1 flex-col rounded-[12px] border p-4"
      style={{
        background: 'var(--bg-panel)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div
        className="-mx-2 mb-3 flex gap-1 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <Tab id="notes" active={active === 'notes'} onClick={() => onChange('notes')}>
          Notes
        </Tab>
        <Tab
          id="explanation"
          active={active === 'explanation'}
          onClick={() => onChange('explanation')}
        >
          Explanation
        </Tab>
        <Tab id="refs" active={active === 'refs'} onClick={() => onChange('refs')}>
          Refs
        </Tab>
      </div>

      <div className="flex-1 overflow-y-auto">
        {active === 'notes' ? (
          <div>
            <textarea
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onBlur={() => setNote(local)}
              placeholder="Capture your reasoning, gotchas, links…"
              className="min-h-[80px] w-full resize-y rounded-[6px] border border-dashed px-3 py-2 font-mono text-[12px] leading-relaxed outline-none transition-colors focus:border-solid"
              style={{
                background: 'var(--bg-panel-hi)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <div
              className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-faint)' }}
            >
              <span>{notes[idx]?.trim() ? 'autosaved' : '—'}</span>
              <span>
                {totalNotes} {totalNotes === 1 ? 'note' : 'notes'} total
              </span>
            </div>
          </div>
        ) : null}

        {active === 'explanation' ? (
          isAnswered && parsed.body ? (
            <div
              className="whitespace-pre-line text-[13px] leading-[1.65]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {parsed.body}
            </div>
          ) : (
            <LockedHint label="Reveals after you submit" />
          )
        ) : null}

        {active === 'refs' ? (
          isAnswered && parsed.references.length > 0 ? (
            <ul className="space-y-2 text-[13px]">
              {parsed.references.map((r, i) => (
                <li
                  key={i}
                  className="leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {linkifySegments(r).map((seg, j) =>
                    seg.kind === 'link' ? (
                      <a
                        key={j}
                        href={seg.value}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent)' }}
                        className="underline-offset-2 hover:underline"
                      >
                        {seg.value}
                      </a>
                    ) : (
                      <span key={j}>{seg.value}</span>
                    ),
                  )}
                </li>
              ))}
            </ul>
          ) : isAnswered ? (
            <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
              No external references for this question.
            </p>
          ) : (
            <LockedHint label="Reveals after you submit" />
          )
        ) : null}
      </div>
    </div>
  );
}

function Tab({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  void id;
  return (
    <button
      onClick={onClick}
      className="-mb-px border-b-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors"
      style={{
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        borderColor: active ? 'var(--accent)' : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function LockedHint({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-2.5 text-[13px]"
      style={{ color: 'var(--text-faint)' }}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
        style={{
          background: 'var(--bg-panel-hi)',
          borderColor: 'var(--border-default)',
          color: 'var(--text-muted)',
        }}
      >
        <Lock size={11} />
      </span>
      {label}
    </div>
  );
}
