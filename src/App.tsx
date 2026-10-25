import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { Heart, Loader2, MessageCircle, PenLine, Search } from 'lucide-react';
import { supabase, type Author } from '@/lib/supabase';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TeamSection from '@/components/TeamSection';
import Footer from '@/components/Footer';
import type { User } from '@supabase/supabase-js';
import AuthModal from '@/components/AuthModal';
import ProfilePage from '@/components/ProfilePage';
import PostFrontPage from '@/components/PostFrontPage';
import PostDetail from '@/components/PostDetail';
import MembersSection, { type Member } from '@/components/MembersSection';
import { makeExcerpt, type Post } from '@/lib/posts';
import { dateLine } from '@/lib/postMeta';
import GroupPhoto from '@/components/GroupPhoto';

// ===== Ghi trang đang xem vào địa chỉ + lịch sử, để nút Back của trình duyệt chạy đúng =====
// 'article' vẫn nằm trong danh sách để dọn các link cũ còn tham số này
const NAV_KEYS = ['post', 'page', 'article'];

function buildUrl(params: Record<string, string>) {
  const url = new URL(window.location.href);
  NAV_KEYS.forEach((k) => url.searchParams.delete(k));
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url;
}
function pushUrl(params: Record<string, string>) {
  window.history.pushState({ app: true }, '', buildUrl(params));
}
function replaceUrl(params: Record<string, string>) {
  window.history.replaceState(window.history.state, '', buildUrl(params));
}

export default function App() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<'home' | 'profile'>(() =>
    new URLSearchParams(window.location.search).get('page') === 'profile' ? 'profile' : 'home',
  );
  const [authReady, setAuthReady] = useState(false); // đã biết đăng nhập hay chưa
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Record<string, { likes: number; comments: number }>>({});

  // ===== Link riêng cho từng bài: ?post=<id> =====
  const pendingPostId = useRef<string | null>(
    new URLSearchParams(window.location.search).get('post'),
  );

  const loadPostById = useCallback(async (id: string) => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
    return (data as Post | null) ?? null;
  }, []);

  // 1) Vào bằng link được chia sẻ thì mở thẳng bài đó
  useEffect(() => {
    const id = pendingPostId.current;
    if (!id) return;
    loadPostById(id).then((p) => {
      pendingPostId.current = null;
      if (p) {
        setSelectedPost(p);
      } else {
        // Bài đã bị xóa / link sai -> về trang chủ
        replaceUrl({});
      }
    });
  }, [loadPostById]);

  // Lúc mới vào: tắt khôi phục vị trí cuộn tự động; dọn link tin cũ (?article=...) nếu còn
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const params = new URLSearchParams(window.location.search);
    if (params.has('article')) {
      const post = params.get('post');
      replaceUrl(post ? { post } : {});
    }
  }, []);

  // Nút Back / Forward của trình duyệt và điện thoại: dựng lại màn hình từ địa chỉ
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      setView(params.get('page') === 'profile' ? 'profile' : 'home');
      if (!postId) {
        setSelectedPost(null);
        return;
      }
      loadPostById(postId).then((p) => setSelectedPost(p));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [loadPostById]);

  // Mở bài: ghi vào lịch sử
  const openPost = (post: Post) => {
    pushUrl({ post: post.id });
    setSelectedPost(post);
  };

  // Nút "Quay lại" trong app: lùi đúng 1 bước lịch sử như nút Back
  const goBack = () => {
    if (window.history.state?.app) {
      window.history.back();
      return;
    }
    // Vào thẳng bằng link nên không có trang trước trong app -> về trang chủ
    replaceUrl({});
    setSelectedPost(null);
    setView('home');
  };

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    // Chưa chạy SQL thì bỏ qua, không làm hỏng trang chủ
    if (!error) setPosts((data as Post[]) ?? []);
    setPostsLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const { data, error } = await supabase.from('post_stats').select('post_id, likes, comments');
    if (error || !data) return; // chưa chạy SQL thì bỏ qua, số hiện 0
    const map: Record<string, { likes: number; comments: number }> = {};
    for (const r of data) map[r.post_id as string] = { likes: Number(r.likes), comments: Number(r.comments) };
    setStats(map);
  }, []);

  // Tải lại số tim/bình luận mỗi khi quay về trang chủ
  useEffect(() => {
    if (!selectedPost) fetchStats();
  }, [selectedPost, fetchStats]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Danh sách thành viên (người đã đăng ký / đăng nhập blog)
  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .order('created_at', { ascending: true })
      .limit(60);
    if (!error) setMembers((data as Member[]) ?? []);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Danh sách đội ngũ (hiện ở cuối trang)
  const fetchAuthors = useCallback(async () => {
    const { data, error } = await supabase.from('authors').select('*').order('name');
    if (!error) setAuthors((data as Author[]) ?? []);
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // Chưa đăng nhập mà đang ở trang cá nhân -> về trang chủ (chờ biết chắc đã)
  useEffect(() => {
    if (authReady && !user && view === 'profile') {
      setView('home');
      if (!selectedPost) replaceUrl({});
    }
  }, [authReady, user, view, selectedPost]);

  // Sau khi xóa tài khoản: về trang chủ và tải lại danh sách thành viên + bài viết
  const handleAccountDeleted = () => {
    replaceUrl({});
    setView('home');
    setSelectedPost(null);
    fetchMembers();
    fetchPosts();
  };

  // Đổi trang thì cuộn lên đầu (chạy trước khi vẽ nên không bị giật)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedPost]);

  const openProfile = () => {
    if (view === 'profile' && !selectedPost) return; // đang ở đó rồi
    setSelectedPost(null);
    setView('profile');
    pushUrl({ page: 'profile' });
  };

  // Bấm logo: từ trang con tự về trang chủ rồi cuộn tới mục
  const goToSection = (id: string | null) => {
    if (selectedPost || view === 'profile') pushUrl({});
    setSelectedPost(null);
    setView('home');
    setTimeout(() => {
      if (!id) window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Nút "Viết bài" ở khu cộng đồng: chưa đăng nhập thì mở hộp đăng nhập
  const handleWrite = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    openProfile();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || makeExcerpt(p.content, 2000).toLowerCase().includes(q);
  });

  // Số liệu gọn trên đầu báo
  const totalLikes = filteredPosts.reduce((n, p) => n + (stats[p.id]?.likes ?? 0), 0);
  const totalComments = filteredPosts.reduce((n, p) => n + (stats[p.id]?.comments ?? 0), 0);

  // Số bài viết của từng thành viên (hiện ở khối "Cây bút đồng hành")
  const postCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.user_id] = (acc[p.user_id] ?? 0) + 1;
    return acc;
  }, {});

  // F5 đang ở trang cá nhân: chờ biết đã đăng nhập chưa rồi mới vẽ, tránh chớp trang chủ
  if (view === 'profile' && !authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Các trang con: chi tiết bài viết, trang cá nhân
  if (selectedPost || (view === 'profile' && user)) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          user={user}
          onLoginClick={() => setAuthOpen(true)}
          onProfileClick={openProfile}
          onAccountDeleted={handleAccountDeleted}
          onNavigate={goToSection}
        />
        {selectedPost ? (
          <PostDetail
            post={selectedPost}
            user={user}
            onLoginClick={() => setAuthOpen(true)}
            onBack={goBack}
          />
        ) : (
          user && (
            <ProfilePage
              user={user}
              onBack={goBack}
              onOpenPost={openPost}
              onPostsChanged={() => {
                fetchPosts();
                fetchMembers();
              }}
            />
          )
        )}
        <Footer />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onProfileClick={openProfile}
        onAccountDeleted={handleAccountDeleted}
        onNavigate={goToSection}
      />
      <Hero />
      <GroupPhoto />

      {/* ===== Góc cộng đồng: trang nhất của bài cộng đồng ===== */}
      <section id="feed" className="scroll-mt-20 bg-[#faf8f3]">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-10">
          {/* Đầu báo: vạch đậm + một dòng ngày và số liệu */}
          <div className="border-t-4 border-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-300 py-2.5">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700">{dateLine()}</span>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-bold uppercase tracking-widest text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-serif text-xl font-black leading-none tabular-nums text-gray-900">
                    {filteredPosts.length}
                  </span>
                  bài
                </span>
                <span aria-hidden className="h-4 w-px bg-gray-300" />
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  <span className="font-serif text-xl font-black leading-none tabular-nums text-gray-900">
                    {totalLikes}
                  </span>
                  lượt tim
                </span>
                <span aria-hidden className="h-4 w-px bg-gray-300" />
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-teal-600" />
                  <span className="font-serif text-xl font-black leading-none tabular-nums text-gray-900">
                    {totalComments}
                  </span>
                  bình luận
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 py-6">
              <div>
                <h2 className="flex items-center gap-3 font-serif text-4xl font-black tracking-tight text-gray-900">
                  <span aria-hidden className="inline-block h-3.5 w-3.5 rotate-45 rounded-sm bg-teal-500" />
                  Góc cộng đồng
                </h2>
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  Bài viết do các cây bút trong cộng đồng chia sẻ
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900"
                />
              </div>
            </div>
          </div>

          {postsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              {searchQuery ? (
                <p className="font-serif text-lg italic">Không tìm thấy bài viết phù hợp.</p>
              ) : (
                <>
                  <p className="font-serif text-lg italic">Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
                  <button
                    type="button"
                    onClick={handleWrite}
                    className="mt-5 inline-flex items-center gap-2 rounded-sm bg-gray-900 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-teal-600"
                  >
                    <PenLine className="h-4 w-4" />
                    Viết bài đầu tiên
                  </button>
                </>
              )}
            </div>
          ) : (
            <PostFrontPage posts={filteredPosts} stats={stats} onOpen={openPost} onWrite={handleWrite} />
          )}
        </div>
      </section>

      {/* Thành viên cộng đồng */}
      {!searchQuery && members.length > 0 && (
        <MembersSection members={members} postCounts={postCounts} currentUserId={user?.id} />
      )}

      {/* Team section */}
      {!searchQuery && authors.length > 0 && <TeamSection authors={authors} />}

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}