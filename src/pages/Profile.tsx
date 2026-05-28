import { LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/lib/use-auth';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil va sozlamalar"
        description="Hisob ma'lumotlari va ilova sozlamalarini ko'ring."
        actions={
          <Button variant="outline" className="border-slate-300 bg-white" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Chiqish
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <UserCircle className="h-12 w-12" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">{user?.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{user?.email || 'Email kiritilmagan'}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Hisob ma'lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ism</Label>
              <Input value={user?.name || ''} readOnly className="h-11 border-slate-300 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} readOnly className="h-11 border-slate-300 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Valyuta</Label>
              <Input value="UZS - so'm" readOnly className="h-11 border-slate-300 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label>Til</Label>
              <Input value="O'zbek tili" readOnly className="h-11 border-slate-300 bg-slate-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
