import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Loader2, LockKeyhole, LogIn, Mail, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/use-auth';

const inputClass =
  'h-11 border-slate-300 bg-white text-left text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500';

const Login = () => {
  const { isAuthenticated, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handlePasswordAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    try {
      if (activeTab === 'register') {
        await register(trimmedName, trimmedEmail, password);
      } else {
        await login(trimmedEmail, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentifikatsiyada xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-violet-50 px-4 py-8 text-left">
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
                Email va parol orqali kiring, guruh xarajatlari ma'lumotlarini shaxsiy hisobingizga bog'lang.
              </p>
            </div>
          </div>

          <Card className="border-slate-200 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-950">Hisobga kirish</CardTitle>
              <CardDescription className="text-slate-600">Davom etish uchun SimpleJWT autentifikatsiyasi ishlatiladi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid h-11 w-full grid-cols-2 bg-slate-100">
                  <TabsTrigger value="login">Kirish</TabsTrigger>
                  <TabsTrigger value="register">Ro'yxatdan o'tish</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handlePasswordAuth} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="login-email"
                          type="email"
                          className={`${inputClass} pl-9`}
                          placeholder="email@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Parol</Label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="login-password"
                          type="password"
                          className={`${inputClass} pl-9`}
                          placeholder="Parolingiz"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="current-password"
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
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="register-name"
                          className={`${inputClass} pl-9`}
                          placeholder="Ismingiz"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="register-email"
                          type="email"
                          className={`${inputClass} pl-9`}
                          placeholder="email@example.com"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Parol</Label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="register-password"
                          type="password"
                          minLength={4}
                          className={`${inputClass} pl-9`}
                          placeholder="Kamida 4 ta belgi"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Ro'yxatdan o'tish
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <p className="text-center text-xs text-slate-500">Access token 15 daqiqa, refresh token 7 kun amal qiladi.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
