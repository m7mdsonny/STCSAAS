import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, UserPlus, CheckCircle } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('البريد الالكتروني او كلمة المرور غير صحيحة');
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const createDemoAccount = async (type: 'admin' | 'org') => {
    setCreatingDemo(true);
    setError('');
    setDemoMessage('');

    const demoEmail = type === 'admin' ? 'admin@stc-demo.com' : 'owner@company-demo.com';
    const demoPassword = type === 'admin' ? 'Admin@123' : 'Owner@123';
    const demoName = type === 'admin' ? 'Super Admin' : 'Organization Owner';

    try {
      // Try to sign in first to check if account exists
      const { error: signInError } = await signIn(demoEmail, demoPassword);

      if (!signInError) {
        // Account exists, sign out and show message
        setEmail(demoEmail);
        setPassword(demoPassword);
        setDemoMessage('الحساب موجود! اضغط تسجيل الدخول.');
        setCreatingDemo(false);
        return;
      }

      // Account doesn't exist, create it
      const { error: signUpError } = await signUp(demoEmail, demoPassword, demoName);

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('البريد مسجل مسبقا. جرب تسجيل الدخول.');
          setEmail(demoEmail);
          setPassword(demoPassword);
        } else {
          setError(`خطأ: ${signUpError.message}`);
        }
      } else {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setDemoMessage('تم انشاء الحساب! اضغط تسجيل الدخول.');
      }
    } catch (err) {
      setError(`خطأ غير متوقع: ${err}`);
    }

    setCreatingDemo(false);
  };

  return (
    <div className="min-h-screen bg-stc-bg-dark flex flex-col lg:flex-row-reverse">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src="/stc_solutions_logo.png" alt="STC Solutions" className="h-16 mx-auto mb-4" />
          </div>

          <div className="card p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h2>
              <p className="text-white/60">ادخل بياناتك للوصول الى لوحة التحكم</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {demoMessage && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-400 text-sm">{demoMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">البريد الالكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pr-12"
                    placeholder="example@company.com"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="label">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12 pl-12"
                    placeholder="********"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5" />
                  <span className="text-white/70">تذكرني</span>
                </label>
                <Link to="/forgot-password" className="text-stc-gold hover:underline">نسيت كلمة المرور؟</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري التسجيل...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/60 text-sm text-center mb-4">انشاء حساب تجريبي</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => createDemoAccount('admin')}
                  disabled={creatingDemo}
                  className="btn-secondary flex items-center justify-center gap-2 text-sm py-3"
                >
                  {creatingDemo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Super Admin</span>
                </button>
                <button
                  onClick={() => createDemoAccount('org')}
                  disabled={creatingDemo}
                  className="btn-secondary flex items-center justify-center gap-2 text-sm py-3"
                >
                  {creatingDemo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>Org Owner</span>
                </button>
              </div>
              <p className="text-white/40 text-xs text-center mt-3">اضغط لانشاء حساب تجريبي جاهز للاستخدام</p>
            </div>
          </div>

          <p className="text-center mt-6 text-white/50 text-sm">
            ليس لديك حساب؟{' '}
            <Link to="/#contact" className="text-stc-gold hover:underline">تواصل معنا</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-stc-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-stc-gold/10 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center w-full">
          <img src="/stc_solutions_logo.png" alt="STC Solutions" className="h-20 mb-8" />
          <h1 className="text-4xl font-bold text-white mb-4">
            مرحبا بك في
            <br />
            <span className="text-stc-gold">STC AI-VAP</span>
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            منصة تحليل الفيديو بالذكاء الاصطناعي
            <br />
            حول كاميراتك الى عيون ذكية
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-stc-gold">9+</p>
              <p className="text-white/60 text-sm">موديولات ذكية</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-stc-gold">128</p>
              <p className="text-white/60 text-sm">كاميرا كحد اقصى</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-stc-gold">24/7</p>
              <p className="text-white/60 text-sm">مراقبة مستمرة</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stc-bg-dark to-transparent" />
      </div>
    </div>
  );
}
