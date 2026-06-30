import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import type { Comment } from '@/types';
import { useQuiz } from '@/state/quizStore';
import { questionHash } from '@/lib/storage';
import { isCommentsEnabled } from '@/lib/supabase';
import { addComment, deleteComment, listComments } from '@/lib/comments';
import { getUsername, setUsername } from '@/lib/identity';

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

export function CommentsPanel() {
  const deck = useQuiz((s) => s.deck);
  const questions = useQuiz((s) => s.questions);
  const idx = useQuiz((s) => s.progress.currentIdx);

  const q = questions[idx];
  const deckId = deck?.id ?? '';
  const hash = useMemo(() => (q ? questionHash(q) : ''), [q]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const [username, setName] = useState(getUsername());
  const [nameDraft, setNameDraft] = useState(username);
  const [editingName, setEditingName] = useState(false);

  const reqIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!isCommentsEnabled || !deckId || !hash) return;
    const reqId = ++reqIdRef.current;
    setStatus('loading');
    setErrorMsg('');
    try {
      const rows = await listComments(deckId, hash);
      if (reqId === reqIdRef.current) {
        setComments(rows);
        setStatus('idle');
      }
    } catch (e) {
      if (reqId === reqIdRef.current) {
        setErrorMsg(e instanceof Error ? e.message : 'Failed to load comments.');
        setStatus('error');
      }
    }
  }, [deckId, hash]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveName = () => {
    const clean = nameDraft.trim();
    setUsername(clean);
    setName(clean);
    setEditingName(false);
  };

  const post = async () => {
    const text = body.trim();
    const author = username.trim();
    if (!text || !author || posting) return;
    setPosting(true);
    try {
      const created = await addComment({ deckId, questionHash: hash, author, body: text });
      setComments((prev) => [...prev, created]);
      setBody('');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to post comment.');
    } finally {
      setPosting(false);
    }
  };

  const remove = async (c: Comment) => {
    if (!window.confirm('Delete this comment?')) return;
    const prev = comments;
    setComments((cs) => cs.filter((x) => x.id !== c.id)); // optimistic
    try {
      await deleteComment(c.id);
    } catch (e) {
      setComments(prev); // rollback
      setErrorMsg(e instanceof Error ? e.message : 'Failed to delete comment.');
    }
  };

  if (!isCommentsEnabled) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
        Comments aren’t configured. Add{' '}
        <code className="font-mono text-[12px]">VITE_SUPABASE_URL</code> and{' '}
        <code className="font-mono text-[12px]">VITE_SUPABASE_ANON_KEY</code> to enable them.
      </p>
    );
  }

  const canPost = body.trim().length > 0 && username.trim().length > 0 && !posting;

  return (
    <div className="flex h-full flex-col">
      {/* Identity row */}
      <div
        className="mb-3 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.12em]"
        style={{ color: 'var(--text-faint)' }}
      >
        {editingName || !username ? (
          <div className="flex w-full items-center gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
              }}
              placeholder="your name"
              className="flex-1 rounded-[6px] border px-2 py-1 font-mono text-[12px] normal-case tracking-normal outline-none"
              style={{
                background: 'var(--bg-panel-hi)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={saveName}
              disabled={!nameDraft.trim()}
              className="rounded-[6px] border px-2 py-1 text-[10px] uppercase tracking-[0.12em] transition-colors disabled:opacity-40"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <span>
              Posting as <span style={{ color: 'var(--text-secondary)' }}>{username}</span>
            </span>
            <button
              onClick={() => {
                setNameDraft(username);
                setEditingName(true);
              }}
              className="underline-offset-2 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Change
            </button>
          </>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {status === 'loading' && comments.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
            Loading comments…
          </p>
        ) : status === 'error' ? (
          <p className="text-[13px]" style={{ color: 'var(--danger)' }}>
            {errorMsg}
          </p>
        ) : comments.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--text-faint)' }}>
            No comments yet. Spotted an error or a better explanation? Start the thread.
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-[8px] border p-2.5"
                style={{
                  background: 'var(--bg-panel-hi)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {c.author}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  {c.author === username && username ? (
                    <button
                      onClick={() => void remove(c)}
                      title="Delete comment"
                      className="shrink-0 transition-colors hover:opacity-100"
                      style={{ color: 'var(--text-faint)', opacity: 0.6 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : null}
                </div>
                <p
                  className="mt-1 whitespace-pre-line text-[13px] leading-[1.6]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Composer */}
      <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void post();
            }
          }}
          placeholder="Add a comment… (⌘/Ctrl + Enter to post)"
          className="min-h-[60px] w-full resize-y rounded-[6px] border px-3 py-2 text-[13px] leading-relaxed outline-none transition-colors focus:border-solid"
          style={{
            background: 'var(--bg-panel-hi)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
        <div className="mt-2 flex items-center justify-end">
          <button
            onClick={() => void post()}
            disabled={!canPost}
            className="flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors disabled:opacity-40"
            style={{
              background: canPost ? 'var(--accent-bg)' : 'transparent',
              borderColor: canPost ? 'var(--accent-border)' : 'var(--border-default)',
              color: canPost ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <Send size={11} />
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
