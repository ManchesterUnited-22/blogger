import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export type OAuthProvider = 'google';

export function signInWithProvider(provider: OAuthProvider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
      // Facebook: xin quyền đọc email + ảnh đại diện
      
    },
  });
}
/** Xóa vĩnh viễn tài khoản đang đăng nhập, rồi đăng xuất khỏi máy này. */
export async function deleteMyAccount() {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) return { error };
  // Tài khoản đã bị xóa trên server -> chỉ cần xóa phiên cục bộ
  await supabase.auth.signOut({ scope: 'local' });
  return { error: null };
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
  // Ưu tiên ảnh/tên do người dùng tự đặt, nếu không có thì dùng của Google
  let avatarUrl =
    (m.custom_avatar as string) || (m.avatar_url as string) || (m.picture as string) || null;
  // Google trả ảnh nhỏ (=s96-c) -> đổi sang kích thước lớn hơn cho nét
  if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
    avatarUrl = avatarUrl.replace(/=s\d+-c$/, '=s256-c');
  }

  const name =
    (m.custom_name as string) ||
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
  image_url: string;
  author_id: string | null;
  published_at: string;
  created_at: string;
  author?: Author | null;
};

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}