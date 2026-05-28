
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Receipt, Users } from 'lucide-react';
import type { Group, Expense } from '@/types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id' | 'date'>) => void;
  groups: Group[];
  selectedGroup?: Group | null;
}

const categories = [
  { value: 'ovqat', label: 'Ovqat-ichimlik' },
  { value: 'transport', label: 'Transport' },
  { value: 'turar-joy', label: 'Turar joy' },
  { value: 'ko\'ngilochar', label: 'Ko\'ngilochar' },
  { value: 'shopping', label: 'Xarid' },
  { value: 'sog\'liq', label: 'Sog\'liq' },
  { value: 'boshqa', label: 'Boshqa' }
];

export const ExpenseModal = ({ isOpen, onClose, onAdd, groups, selectedGroup }: ExpenseModalProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState(selectedGroup?.id || '');
  const [payer, setPayer] = useState('');
  const [category, setCategory] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  const currentGroup = groups.find(g => g.id === groupId);
  const inputClass =
    'h-11 border-slate-300 bg-white text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500';

  useEffect(() => {
    if (isOpen && selectedGroup?.id) {
      setGroupId(selectedGroup.id);
      setPayer('');
      setParticipants(selectedGroup.members);
    }
  }, [isOpen, selectedGroup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !amount || !groupId || !payer || !category || participants.length === 0) {
      return;
    }

    onAdd({
      title: title.trim(),
      amount: parseFloat(amount),
      description: description.trim(),
      groupId,
      payer,
      category,
      participants
    });

    // Reset form
    setTitle('');
    setAmount('');
    setDescription('');
    setGroupId('');
    setPayer('');
    setCategory('');
    setParticipants([]);
  };

  const handleGroupChange = (newGroupId: string) => {
    setGroupId(newGroupId);
    setPayer('');
    setParticipants([]);
  };

  const handleParticipantToggle = (member: string, checked: boolean) => {
    if (checked) {
      setParticipants([...participants, member]);
    } else {
      setParticipants(participants.filter(p => p !== member));
    }
  };

  const selectAllParticipants = () => {
    if (currentGroup) {
      setParticipants(currentGroup.members);
    }
  };

  const clearAllParticipants = () => {
    setParticipants([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl tracking-normal">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </span>
            Yangi xarajat qo'shish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Selection */}
          <div className="space-y-2">
            <Label>Guruh *</Label>
            <Select value={groupId} onValueChange={handleGroupChange} required>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Guruhni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {group.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Xarajat nomi *</Label>
            <Input
              id="title"
              placeholder="Masalan: Tushlik, Taksi, Mehmonxona"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Miqdor (so'm) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="1000"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategoriya *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Kategoriyani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payer */}
          {currentGroup && (
            <div className="space-y-2">
              <Label>Kim to'ladi? *</Label>
              <Select value={payer} onValueChange={setPayer} required>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="To'lovchini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {currentGroup.members.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Participants */}
          {currentGroup && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Kimlar ishtirok etdi? *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllParticipants}
                    className="border-slate-300 bg-white"
                  >
                    Barchasi
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllParticipants}
                    className="border-slate-300 bg-white"
                  >
                    Tozalash
                  </Button>
                </div>
              </div>
              
              <div className="grid max-h-36 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                {currentGroup.members.map((member) => (
                  <div key={member} className="flex items-center space-x-2 rounded-md bg-white px-3 py-2">
                    <Checkbox
                      id={member}
                      checked={participants.includes(member)}
                      onCheckedChange={(checked) => 
                        handleParticipantToggle(member, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={member}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {member}
                    </Label>
                  </div>
                ))}
              </div>
              
              {participants.length > 0 && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Har bir kishi: {amount ? (parseFloat(amount) / participants.length).toLocaleString() : '0'} so'm
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea
              id="description"
              placeholder="Qo'shimcha ma'lumot..."
              className="border-slate-300 bg-white text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-300 bg-white"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !amount || !groupId || !payer || !category || participants.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Xarajat qo'shish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
