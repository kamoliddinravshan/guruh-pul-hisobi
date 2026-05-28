import { FormEvent, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Loader2, LockKeyhole, LogIn, Mail, Send, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/use-auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const telegramBotUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;

const Login = () => {
  const { isAuthenticated, login, register, loginWithGoogle, loginWithTelegram } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const telegramButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError('');
          setIsSubmitting(true);
          try {
            await loginWithGoogle(credential);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google orqali kirishda xatolik yuz berdi');
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '320',
        text: 'continue_with',
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [loginWithGoogle]);

  useEffect(() => {
    if (!telegramBotUsername || !telegramButtonRef.current) return;

    window.onTelegramAuth = async (user) => {
      setError('');
      setIsSubmitting(true);
      try {
        await loginWithTelegram(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Telegram orqali kirishda xatolik yuz berdi');
      } finally {
        setIsSubmitting(false);
      }
    };

    telegramButtonRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', telegramBotUsername.replace('@', ''));
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    telegramButtonRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [loginWithTelegram]);

  const handlePasswordAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (activeTab === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentifikatsiyada xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-sm text-muted-foreground shadow-sm">
              Guruh Xarajatlari
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold tracking-normal text-slate-950 md:text-5xl">
                Xarajatlaringizni xavfsiz hisob bilan boshqaring
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Email, Google yoki Telegram orqali kiring va guruh xarajatlari ma'lumotlarini shaxsiy hisobingizga bog'lang.
              </p>
            </div>
          </div>

          <Card className="border bg-white/90 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle>Hisobga kirish</CardTitle>
              <CardDescription>Davom etish uchun qulay autentifikatsiya usulini tanlang.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Kirish</TabsTrigger>
                  <TabsTrigger value="register">Ro'yxatdan o'tish</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handlePasswordAuth} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          className="pl-9"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Parol</Label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          className="pl-9"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Kirish
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handlePasswordAuth} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Ism</Label>
                      <Input id="register-name" value={name} onChange={(event) => setName(event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Parol</Label>
                      <Input
                        id="register-password"
                        type="password"
                        minLength={6}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Ro'yxatdan o'tish
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">yoki</span>
                </div>
              </div>

              <div className="space-y-3">
                {googleClientId ? (
                  <div className="flex min-h-11 justify-center" ref={googleButtonRef} />
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <LogIn className="h-4 w-4" />
                    Google sozlanmagan
                  </Button>
                )}

                {telegramBotUsername ? (
                  <div className="flex min-h-11 justify-center" ref={telegramButtonRef} />
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Send className="h-4 w-4" />
                    Telegram sozlanmagan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
