import { useState, type FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase, signInWithProvider, type OAuthProvider} from '@/lib/supabase';

type Props = { open: boolean; onClose: () => void };
type Mode = 'login' | 'register';

export default function AuthModal({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!open) return null;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        onClose(); // tắt Confirm email -> đăng nhập luôn
      } else {
        setInfo('Đăng ký thành công! Hãy xác nhận email rồi đăng nhập.');
        setMode('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('Email hoặc mật khẩu không đúng.');
      else onClose();
    }
    setLoading(false);
  };
    const handleOAuth = async (provider: OAuthProvider) => {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await signInWithProvider(provider);
    // Thành công thì trình duyệt được chuyển sang Google/Facebook, không chạy tiếp
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-extrabold text-gray-900">
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </h2>
         <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Tiếp tục với Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('facebook')}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] py-2.5 text-sm font-semibold text-white hover:bg-[#166fe0] disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
            </svg>
            Tiếp tục với Facebook
          </button>
        </div>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" /> hoặc <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
       
          {mode === 'register' && (
            <input
              className={inputCls}
              placeholder="Tên hiển thị"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className={inputCls}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className={inputCls}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          {info && <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="font-semibold text-teal-600 hover:underline"
          >
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}