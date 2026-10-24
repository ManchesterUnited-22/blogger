import { supabase } from '@/lib/supabase';

/** Danh sách id người đã thích bài. */
export async function fetchLikes(postId: string): Promise<string[]> {
  const { data, error } = await supabase.from('post_likes').select('user_id').eq('post_id', postId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.user_id as string);
}

export async function likePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  // 23505 = đã thích rồi (bấm 2 lần / 2 tab) -> coi như thành công
  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

/** Lượt thích thay đổi thì cập nhật ngay, không cần tải lại trang. */
export function subscribeLikes(
  postId: string,
  handlers: { onAdd: (userId: string) => void; onRemove: (userId: string) => void },
): () => void {
  const channel = supabase
    .channel(`likes:${postId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'post_likes', filter: `post_id=eq.${postId}` },
      (payload) => handlers.onAdd((payload.new as { user_id: string }).user_id),
    )
    // DELETE không lọc được theo cột nên tự lọc theo post_id
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'post_likes' }, (payload) => {
      const old = payload.old as { post_id?: string; user_id?: string };
      if (old.post_id === postId && old.user_id) handlers.onRemove(old.user_id);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}