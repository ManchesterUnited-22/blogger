import type { User } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '@/lib/supabase';

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
};

export const MAX_COMMENT = 1000;

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw new Error('Không tải được bình luận: ' + error.message);
  return (data as Comment[]) ?? [];
}

export async function addComment(postId: string, user: User, content: string): Promise<Comment> {
  const text = content.trim();
  if (!text) throw new Error('Bình luận đang trống.');
  if (text.length > MAX_COMMENT) throw new Error(`Bình luận tối đa ${MAX_COMMENT} ký tự.`);
  const profile = getUserProfile(user);
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      author_name: profile.name,
      author_avatar: profile.avatarUrl,
      content: text,
    })
    .select('*')
    .single();
  if (error) throw new Error('Gửi bình luận thất bại: ' + error.message);
  return data as Comment;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw new Error('Xóa bình luận thất bại: ' + error.message);
}