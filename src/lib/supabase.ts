import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type OAuthProvider = 'google' | 'facebook';

export function signInWithProvider(provider: OAuthProvider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
      // Facebook: xin quyền đọc email + ảnh đại diện
      ...(provider === 'facebook' ? { scopes: 'email,public_profile' } : {}),
    },
  });
}

export type UserProfile = {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  provider: string;
};

/** Gom thông tin hiển thị của user, hỗ trợ cả email/password, Google và Facebook. */
export function getUserProfile(user: User): UserProfile {
  const m = (user.user_metadata ?? {}) as Record<string, unknown>;

  // Facebook đôi khi trả picture dạng { data: { url } }
  const pic = m.picture as unknown;
  const pictureUrl =
    typeof pic === 'string' ? pic : ((pic as { data?: { url?: string } } | undefined)?.data?.url ?? null);

  let avatarUrl = (m.avatar_url as string) || pictureUrl || null;
  // Google trả ảnh nhỏ (=s96-c) -> đổi sang kích thước lớn hơn cho nét
  if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
    avatarUrl = avatarUrl.replace(/=s\d+-c$/, '=s256-c');
  }

  const name =
    (m.full_name as string) ||
    (m.name as string) ||
    user.email?.split('@')[0] ||
    'Bạn';

  return {
    name,
    email: user.email ?? (m.email as string) ?? null,
    avatarUrl,
    provider: user.app_metadata?.provider ?? 'email',
  };
}
export type Author = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  author_id: string | null;
  published_at: string;
  created_at: string;
  author?: Author | null;
};

export const categoryLabels: Record<string, string> = {
  'du-lich': 'Du Lịch',
  'am-thuc': 'Ẩm Thực',
  'le-hoi': 'Lễ Hội',
  'van-hoa': 'Văn Hóa',
  'tin-tuc': 'Tin Tức',
};

export const categoryColors: Record<string, { bg: string; text: string; solid: string; gradient: string }> = {
  'du-lich': { bg: 'bg-sky-50', text: 'text-sky-700', solid: 'bg-sky-500', gradient: 'from-sky-400 to-blue-500' },
  'am-thuc': { bg: 'bg-orange-50', text: 'text-orange-700', solid: 'bg-orange-500', gradient: 'from-orange-400 to-amber-500' },
  'le-hoi': { bg: 'bg-rose-50', text: 'text-rose-700', solid: 'bg-rose-500', gradient: 'from-rose-400 to-red-500' },
  'van-hoa': { bg: 'bg-teal-50', text: 'text-teal-700', solid: 'bg-teal-500', gradient: 'from-teal-400 to-cyan-500' },
  'tin-tuc': { bg: 'bg-violet-50', text: 'text-violet-700', solid: 'bg-violet-500', gradient: 'from-violet-400 to-purple-500' },
};

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}
