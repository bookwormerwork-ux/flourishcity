import { useState } from 'react';
import { GlassPanel } from '@/components/GlassPanel';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { Users, UserPlus, Check, X, Copy, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function FriendsPanel() {
  const { user } = useAuth();
  const { friends, myUsername, sendRequest, accept, remove } = useFriends();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <GlassPanel variant="strong">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-title text-foreground">Friends</h3>
            <p className="text-caption">Sign in to add friends and compete privately.</p>
          </div>
        </div>
      </GlassPanel>
    );
  }

  const incoming = friends.filter((f) => f.status === 'pending_incoming');
  const outgoing = friends.filter((f) => f.status === 'pending_outgoing');
  const accepted = friends.filter((f) => f.status === 'accepted');

  const handleAdd = async () => {
    setBusy(true);
    const r = await sendRequest(input);
    setBusy(false);
    if (r.ok) {
      toast({ title: 'Friend request sent' });
      setInput('');
    } else {
      toast({ title: 'Could not send', description: r.error });
    }
  };

  const copyUsername = () => {
    navigator.clipboard?.writeText(myUsername);
    toast({ title: 'Username copied', description: `@${myUsername}` });
  };

  return (
    <GlassPanel variant="strong">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-title text-foreground">Friends</h3>
          <button onClick={copyUsername} className="text-caption flex items-center gap-1 hover:text-primary truncate">
            @{myUsername} <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add by username"
          className="flex-1 p-2.5 rounded-xl bg-accent/30 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={busy || !input.trim()}
          className={cn(
            'px-3 rounded-xl flex items-center gap-1 text-sm font-semibold ios-press',
            input.trim() ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground',
          )}
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {incoming.length > 0 && (
        <div className="mb-3">
          <p className="text-micro mb-1.5 text-muted-foreground">Requests</p>
          <div className="space-y-1.5">
            {incoming.map((f) => (
              <div key={f.user_id} className="glass rounded-xl p-2 flex items-center gap-2">
                <span className="text-xl">{f.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.display_name}</p>
                  <p className="text-micro truncate">@{f.username}</p>
                </div>
                <button onClick={() => accept(f.user_id)} className="p-2 rounded-lg bg-success/20 text-success">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => remove(f.user_id)} className="p-2 rounded-lg bg-destructive/20 text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 ? (
        <div className="space-y-1.5">
          {accepted.map((f) => (
            <div key={f.user_id} className="glass rounded-xl p-2 flex items-center gap-2">
              <span className="text-xl">{f.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.display_name}</p>
                <p className="text-micro truncate">@{f.username}</p>
              </div>
              <div className="flex items-center gap-1 text-micro text-muted-foreground">
                <Flame className="w-3 h-3" /> {f.streak}
              </div>
              <button onClick={() => remove(f.user_id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        accepted.length === 0 && incoming.length === 0 && (
          <p className="text-caption text-center py-2">No friends yet — share your username.</p>
        )
      )}

      {outgoing.length > 0 && (
        <p className="text-micro mt-2 text-muted-foreground">
          {outgoing.length} pending invite{outgoing.length > 1 ? 's' : ''}
        </p>
      )}
    </GlassPanel>
  );
}
