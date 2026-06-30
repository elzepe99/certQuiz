import type { Comment } from '@/types';
import { supabase } from '@/lib/supabase';

const TABLE = 'comments';

// Shape of a row as stored in Supabase (snake_case columns).
type CommentRow = {
  id: string;
  deck_id: string;
  question_hash: string;
  author: string;
  body: string;
  created_at: string;
};

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    deckId: row.deck_id,
    questionHash: row.question_hash,
    author: row.author,
    body: row.body,
    createdAt: row.created_at,
  };
}

/** List comments for one question, oldest first. */
export async function listComments(
  deckId: string,
  questionHash: string,
): Promise<Comment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, deck_id, question_hash, author, body, created_at')
    .eq('deck_id', deckId)
    .eq('question_hash', questionHash)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as CommentRow[] | null)?.map(toComment) ?? [];
}

/** Insert a comment and return the stored row. */
export async function addComment(input: {
  deckId: string;
  questionHash: string;
  author: string;
  body: string;
}): Promise<Comment> {
  if (!supabase) throw new Error('Comments are not configured.');
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      deck_id: input.deckId,
      question_hash: input.questionHash,
      author: input.author,
      body: input.body,
    })
    .select('id, deck_id, question_hash, author, body, created_at')
    .single();
  if (error) throw new Error(error.message);
  return toComment(data as CommentRow);
}

/**
 * Delete a comment by id. Authorship is enforced client-side (the UI only shows
 * a delete control on your own comments); there is no server-side ownership
 * check because the app has no auth.
 */
export async function deleteComment(id: string): Promise<void> {
  if (!supabase) throw new Error('Comments are not configured.');
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
