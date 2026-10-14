import { useState, useEffect, useCallback } from 'react';
import { Loader2, PenLine, Search } from 'lucide-react';
import { supabase, type Article, type Author } from '@/lib/supabase';
import { categoryLabels, categoryColors } from '@/lib/supabase';
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
import { makeExcerpt, type Post } from '@/lib/posts';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    // Chưa chạy SQL thì bỏ qua, không làm hỏng trang chủ
    if (!error) setPosts((data as Post[]) ?? []);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Đăng xuất khi đang ở trang cá nhân -> về trang chủ
  useEffect(() => {
    if (!user && view === 'profile') setView('home');
  }, [user, view]);

  // Đổi trang thì cuộn lên đầu
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, selectedPost, selectedArticle]);

  const openProfile = () => {
    setSelectedArticle(null);
    setSelectedPost(null);
    setView('profile');
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

  const handleCategoryChange = (cat: string | null) => {
    setActiveCategory(cat);
    setSelectedArticle(null);
    setSelectedPost(null);
    setView('home');
    if (cat) {
      setTimeout(() => {
        document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesCategory = !activeCategory || a.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || makeExcerpt(p.content, 2000).toLowerCase().includes(q);
  });

  // Các trang con: chi tiết bài viết, trang cá nhân, chi tiết tin
  if (selectedPost || selectedArticle || (view === 'profile' && user)) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          user={user}
          onLoginClick={() => setAuthOpen(true)}
          onProfileClick={openProfile}
        />
        {selectedPost ? (
          <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : selectedArticle ? (
          <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        ) : (
          user && (
            <ProfilePage
              user={user}
              onBack={() => setView('home')}
              onOpenPost={setSelectedPost}
              onPostsChanged={fetchPosts}
            />
          )
        )}
        <Footer onCategoryClick={(c) => handleCategoryChange(c)} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onProfileClick={openProfile}
      />
      <Hero />

      {/* Featured strip — category highlights */}
      {!activeCategory && !searchQuery && articles.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = articles.filter((a) => a.category === key).length;
              const cat = categoryColors[key];
              return (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key)}
                  className={`group relative overflow-hidden rounded-2xl p-5 text-left shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg ${cat.bg}`}
                >
                  <div className={`mb-2 h-2 w-12 rounded-full bg-gradient-to-r ${cat.gradient}`} />
                  <div className={`text-lg font-bold ${cat.text}`}>{label}</div>
                  <div className="text-xs text-gray-500">{count} bài viết</div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Search bar */}
      <section id="feed" className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {activeCategory ? categoryLabels[activeCategory] : 'Mẩu tin mới nhất'}
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
      {!activeCategory && filteredPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-teal-700">
            <PenLine className="h-4 w-4" />
            Bài viết từ cộng đồng
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
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
                <ArticleCard article={article} onClick={() => setSelectedArticle(article)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team section */}
      {!activeCategory && !searchQuery && authors.length > 0 && (
        <TeamSection authors={authors} />
      )}

      <Footer onCategoryClick={(c) => handleCategoryChange(c)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}