import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, PenLine, Search } from 'lucide-react';
import { supabase, type Article, type Author } from '@/lib/supabase';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ArticleCard from '@/components/ArticleCard';
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
export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<'home' | 'profile'>('home');
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
        const url = new URL(window.location.href);
        url.searchParams.delete('post');
        window.history.replaceState(null, '', url);
      }
    });
  }, [loadPostById]);

  // 2) Mở / đóng bài thì địa chỉ trang đổi theo
  useEffect(() => {
    if (pendingPostId.current) return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get('post');
    if (selectedPost && current !== selectedPost.id) {
      url.searchParams.set('post', selectedPost.id);
      window.history.pushState(null, '', url);
    } else if (!selectedPost && current) {
      url.searchParams.delete('post');
      window.history.replaceState(null, '', url);
    }
  }, [selectedPost]);

  // 3) Nút Back / Forward của trình duyệt và điện thoại
  useEffect(() => {
    const onPop = () => {
      const id = new URLSearchParams(window.location.search).get('post');
      if (!id) {
        setSelectedPost(null);
        return;
      }
      loadPostById(id).then((p) => p && setSelectedPost(p));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [loadPostById]);
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

  // Đăng xuất khi đang ở trang cá nhân -> về trang chủ
  useEffect(() => {
    if (!user && view === 'profile') setView('home');
  }, [user, view]);

  // Sau khi xóa tài khoản: về trang chủ và tải lại danh sách thành viên + bài viết
  const handleAccountDeleted = () => {
    setView('home');
    setSelectedPost(null);
    setSelectedArticle(null);
    fetchMembers();
    fetchPosts();
  };
  // Đổi trang thì cuộn lên đầu
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedPost, selectedArticle]);

  const openProfile = () => {
    setSelectedArticle(null);
    setSelectedPost(null);
    setView('profile');
  };
  // Bấm menu: từ trang con (bài viết, trang cá nhân) tự về trang chủ rồi cuộn tới mục
  const goToSection = (id: string | null) => {
    setSelectedPost(null);
    setSelectedArticle(null);
    setView('home');
    setTimeout(() => {
      if (!id) window.scrollTo({ top: 0, behavior: 'smooth' });
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Nút "Viết bài": chưa đăng nhập thì mở hộp đăng nhập, rồi cuộn thẳng tới khung viết
  const handleWriteClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    openProfile();
    setTimeout(() => {
      document.getElementById('write')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
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
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || makeExcerpt(p.content, 2000).toLowerCase().includes(q);
  });

  // Số bài viết của từng thành viên (hiện ở khối "Cây bút đồng hành")
  const postCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.user_id] = (acc[p.user_id] ?? 0) + 1;
    return acc;
  }, {});

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
          onWriteClick={handleWriteClick}
        />
        {selectedPost ? (
         <PostDetail
  post={selectedPost}
  user={user}
  onLoginClick={() => setAuthOpen(true)}
  onBack={() => setSelectedPost(null)}
/>
        ) : selectedArticle ? (
          <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        ) : (
          user && (
            <ProfilePage
              user={user}
              onBack={() => setView('home')}
              onOpenPost={setSelectedPost}
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
        onWriteClick={handleWriteClick}
      />
      <Hero />
      <GroupPhoto />

      {/* Search bar */}
      <section id="feed" className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-gray-900">
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

      {/* Bài viết từ cộng đồng (blog của người dùng) */}
      {filteredPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-700">
            <PenLine className="h-4 w-4" />
            Bài viết từ cộng đồng
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <ScrollReveal key={post.id} className="h-full" delay={(filteredPosts.indexOf(post) % 4) * 70}>
                <PostCard
                  post={post}
                  onClick={() => setSelectedPost(post)}
                  likes={stats[post.id]?.likes ?? 0}
                  comments={stats[post.id]?.comments ?? 0}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Aligned article feed */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50 p-6 text-center text-rose-600">{error}</div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">Không tìm thấy bài viết phù hợp.</p>
          </div>
        ) : (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <div key={article.id} className="h-full">
                <ScrollReveal delay={(filteredArticles.indexOf(article) % 6) * 60} className="h-full">
                  <ArticleCard article={article} onClick={() => setSelectedArticle(article)} />
                </ScrollReveal>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Thành viên cộng đồng */}
      {!searchQuery && members.length > 0 && (
        <MembersSection members={members} postCounts={postCounts} currentUserId={user?.id} />
      )}

      {/* Team section */}
      {!searchQuery && authors.length > 0 && (
        <TeamSection authors={authors} />
      )}

      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}