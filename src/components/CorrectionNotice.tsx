import type { QuestionCorrection } from '@/types';

/** "2026-08-04" -> "Aug 4, 2026", without dragging in a date library. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
}

const SOURCE_LABEL: Record<QuestionCorrection['via'], string> = {
  comments: 'Corrected from comments',
  validation: 'Corrected by deck validation',
};

/**
 * Shows that a question was changed after import, and why. Rendered wherever a
 * question's answer is revealed, so the provenance of a correction travels with
 * the question instead of living only in git history.
 */
export function CorrectionNotice({ correction }: { correction: QuestionCorrection }) {
  const movedAnswer = correction.from && correction.to;

  return (
    <div
      className="mt-4 rounded-[10px] border px-3.5 py-3"
      style={{
        background: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
      }}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
          style={{ color: 'var(--warning)' }}
        >
          ⟲ {SOURCE_LABEL[correction.via]}
        </span>
        {movedAnswer ? (
          <span
            className="font-mono text-[10px] tracking-[0.08em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            {correction.from} → {correction.to}
          </span>
        ) : null}
        <span className="font-mono text-[10px]" style={{ color: 'var(--text-faint)' }}>
          {formatDate(correction.date)}
        </span>
      </div>

      <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>
        {correction.note}
      </p>
    </div>
  );
}
