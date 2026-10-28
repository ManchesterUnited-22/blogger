import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** true = quản trị viên, false = không phải / chưa đăng nhập, null = đang kiểm tra */
export function useIsAdmin(user: User | null): boolean | null {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const uid = user?.id;

  useEffect(() => {
    if (!uid) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    setIsAdmin(null);
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', uid)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(data?.is_admin === true);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return isAdmin;
}

export type AdminProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  is_member: boolean | null;
  is_admin: boolean | null;
  created_at: string;
};

export type AdminPost = {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  content: string;
  created_at: string;
};

export type AdminComment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

export async function adminLoadAll() {
  const [posts, comments, profiles, likes] = await Promise.all([
    supabase
      .from('posts')
      .select('id, user_id, author_name, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('comments')
      .select('id, post_id, user_id, author_name, content, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, email, is_member, is_admin, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('post_likes').select('*', { count: 'exact', head: true }),
  ]);

  const firstError = posts.error || comments.error || profiles.error;
  if (firstError) throw new Error(firstError.message);

  return {
    posts: (posts.data ?? []) as AdminPost[],
    comments: (comments.data ?? []) as AdminComment[],
    profiles: (profiles.data ?? []) as AdminProfile[],
    likeCount: likes.count ?? 0,
  };
}

export async function adminSetMember(userId: string, value: boolean) {
  // Gọi hàm trong DB (chỉ admin mới chạy được) thay vì update thẳng bảng profiles
  const { error } = await supabase.rpc('admin_set_member', { target: userId, value });
  if (error) throw new Error('Duyệt thất bại: ' + error.message);
}

export async function adminDeleteUser(userId: string) {
  const { error } = await supabase.rpc('admin_delete_user', { target: userId });
  if (error) throw new Error(error.message);
}