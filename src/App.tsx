import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { Loader2, Search } from 'lucide-react';
import { supabase, type Article, type Author } from '@/lib/supabase';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ArticleCard from '@/components/ArticleCard';
import ArticleBento from '@/components/ArticleBento';
import ArticleDetail from '@/components/ArticleDetail';
import TeamSection from '@/components/TeamSection';
import Footer from '@/components/Footer';
import type { User } from '@supabase/supabase-js';
import AuthModal from '@/components/AuthModal';
import ProfilePage from '@/components/ProfilePage';
import PostCard from '@/components/PostCard';
import PostDetail from '@/components/PostDetail';
import MembersSection, { type Member } from '@/components/MembersSection';
import { makeExcerpt, type Post } from '@/lib/posts';
import ScrollReveal from '@/components/ScrollReveal';
import GroupPhoto from '@/components/GroupPhoto';

// ===== Ghi trang đang xem vào địa chỉ + lịch sử, để nút Back của trình duyệt chạy đúng =====
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<'home' | 'profile'>(() =>
    new URLSearchParams(window.location.search).get('page') === 'profile' ? 'profile' : 'home',
  );
  const [authReady, setAuthReady] = useState(false); // đã biết đăng nhập hay chưa
  const [posts, setPosts] = useState<Post[]>([]);
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

  // Danh sách tin để Back/Forward tìm lại được tin đang mở
  const articlesRef = useRef<Article[]>([]);
  articlesRef.current = articles;

  // Lúc mới vào: tắt khôi phục vị trí cuộn tự động của trình duyệt
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, []);

  // F5 khi đang xem một tin: đợi danh sách tin tải xong rồi mở lại đúng tin đó
  const pendingArticleId = useRef<string | null>(
    new URLSearchParams(window.location.search).get('article'),
  );
  useEffect(() => {
    const id = pendingArticleId.current;
    if (!id || loading) return;
    pendingArticleId.current = null;
    const found = articles.find((a) => String(a.id) === id);
    if (found) setSelectedArticle(found);
    else replaceUrl({}); // tin đã bị xóa / link sai -> về trang chủ
  }, [articles, loading]);

  // Nút Back / Forward của trình duyệt và điện thoại: dựng lại màn hình từ địa chỉ
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      const articleId = params.get('article');
      setView(params.get('page') === 'profile' ? 'profile' : 'home');
      setSelectedArticle(
        articleId ? articlesRef.current.find((a) => String(a.id) === articleId) ?? null : null,
      );
      if (!postId) {
        setSelectedPost(null);
        return;
      }
      loadPostById(postId).then((p) => setSelectedPost(p));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [loadPostById]);

  // Mở bài / mở tin: ghi vào lịch sử
  const openPost = (post: Post) => {
    pushUrl({ post: post.id });
    setSelectedPost(post);
  };
  const openArticle = (article: Article) => {
    pushUrl({ article: String(article.id) });
    setSelectedArticle(article);
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
    setSelectedArticle(null);
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
    setSelectedArticle(null);
    fetchMembers();
    fetchPosts();
  };

  // Đổi trang thì cuộn lên đầu (chạy trước khi vẽ nên không bị giật)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedPost, selectedArticle]);

  const openProfile = () => {
    if (view === 'profile' && !selectedPost && !selectedArticle) return; // đang ở đó rồi
    setSelectedArticle(null);
    setSelectedPost(null);
    setView('profile');
    pushUrl({ page: 'profile' });
  };

  // Bấm logo: từ trang con tự về trang chủ rồi cuộn tới mục
  const goToSection = (id: string | null) => {
    if (selectedPost || selectedArticle || view === 'profile') pushUrl({});
    setSelectedPost(null);
    setSelectedArticle(null);
    setView('home');
    setTimeout(() => {
      if (!id) window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [articlesRes, authorsRes] = await Promise.all([
      supabase
        .from('articles')
        .select('*, author:authors(*)')
        .order('published_at', { ascending: false }),
      supabase.from('authors').select('*').order('name'),
    ]);

    if (articlesRes.error) {
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      setLoading(false);
      return;
    }
    if (authorsRes.error) {
      setError('Không thể tải danh sách tác giả.');
      setLoading(false);
      return;
    }

    setArticles(articlesRes.data as Article[]);
    setAuthors(authorsRes.data as Author[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const filteredArticles = articles.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
  });

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || makeExcerpt(p.content, 2000).toLowerCase().includes(q);
  });

  // Đủ 4 tin thì làm lưới tạp chí; ít hơn thì chỉ 1 tin lớn. Phần còn lại xuống danh sách đánh số.
  const bentoCount = filteredArticles.length >= 4 ? 4 : Math.min(filteredArticles.length, 1);
  const bentoArticles = filteredArticles.slice(0, bentoCount);
  const listArticles = filteredArticles.slice(bentoCount);

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

  // Các trang con: chi tiết bài viết, trang cá nhân, chi tiết tin
  if (selectedPost || selectedArticle || (view === 'profile' && user)) {
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
        ) : selectedArticle ? (
          <ArticleDetail article={selectedArticle} onBack={goBack} />
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

      {/* ===== Tiêu đề chuyên mục + tìm kiếm ===== */}
      <section id="feed" className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-10">
        <div className="flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <h2 className="flex items-center gap-3 font-serif text-3xl font-black tracking-tight text-gray-900">
            <span aria-hidden className="inline-block h-3 w-3 rotate-45 rounded-sm bg-orange-500" />
            Mẩu tin mới nhất
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>
      </section>

      {/* ===== Lưới tạp chí + danh sách đánh số ===== */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50 p-6 text-center text-rose-600">{error}</div>
        ) : bentoArticles.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">Không tìm thấy bài viết phù hợp.</p>
          </div>
        ) : (
          <>
            <ScrollReveal>
              <ArticleBento articles={bentoArticles} onOpen={openArticle} />
            </ScrollReveal>

            {listArticles.length > 0 && (
              <div className="mt-14">
                <h3 className="mb-1 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                  Các tin khác
                  <span className="h-px flex-1 bg-gray-200" />
                </h3>
                <div>
                  {listArticles.map((a, i) => (
                    <ScrollReveal key={a.id} delay={(i % 4) * 60}>
                      <ArticleCard variant="row" index={i + 1} article={a} onClick={() => openArticle(a)} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===== Góc cộng đồng (bài của thành viên) ===== */}
      {filteredPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-4">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-black tracking-tight text-gray-900">
              <span aria-hidden className="inline-block h-3 w-3 rotate-45 rounded-sm bg-teal-500" />
              Góc cộng đồng
            </h2>
            <p className="mt-1 text-sm text-gray-500">Bài viết do các cây bút trong cộng đồng chia sẻ</p>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, i) => (
              <ScrollReveal key={post.id} className="h-full" delay={(i % 3) * 70}>
                <PostCard
                  post={post}
                  onClick={() => openPost(post)}
                  likes={stats[post.id]?.likes ?? 0}
                  comments={stats[post.id]?.comments ?? 0}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

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