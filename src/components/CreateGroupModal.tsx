
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users } from 'lucide-react';
import { Group } from '@/pages/Index';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (group: Omit<Group, 'id' | 'totalExpenses' | 'createdAt'>) => void;
}

export const CreateGroupModal = ({ isOpen, onClose, onCreate }: CreateGroupModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || members.length === 0) {
      return;
    }

    onCreate({
      name: name.trim(),
      description: description.trim(),
      members: members
    });

    // Reset form
    setName('');
    setDescription('');
    setMembers([]);
    setNewMember('');
  };

  const addMember = () => {
    const memberName = newMember.trim();
    if (memberName && !members.includes(memberName)) {
      setMembers([...members, memberName]);
      setNewMember('');
    }
  };

  const removeMember = (memberToRemove: string) => {
    setMembers(members.filter(member => member !== memberToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMember();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Yangi Guruh Yaratish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Guruh nomi *</Label>
            <Input
              id="name"
              placeholder="Masalan: Toshkent Safari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Tavsif</Label>
            <Textarea
              id="description"
              placeholder="Bu guruh haqida qisqacha ma'lumot..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Members */}
          <div className="space-y-3">
            <Label>A'zolar *</Label>
            
            {/* Add Member Input */}
            <div className="flex gap-2">
              <Input
                placeholder="A'zo ismini kiriting"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="button"
                onClick={addMember}
                disabled={!newMember.trim()}
                size="sm"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Members List */}
            {members.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  A'zolar ({members.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {members.map((member, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => removeMember(member)}
                        className="ml-2 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {members.length === 0 && (
              <div className="text-sm text-muted-foreground italic">
                Kamida bitta a'zo qo'shing
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || members.length === 0}
              className="flex-1 expense-gradient border-0"
            >
              Guruh yaratish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
