import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FriendProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  xp: number;
  streak: number;
  status: 'pending_incoming' | 'pending_outgoing' | 'accepted';
}

interface FriendshipRow {
  id: string;
  user_id: string;
  friend_id: string;
  requester_id: string;
  status: 'pending' | 'accepted';
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [myUsername, setMyUsername] = useState<string>('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: me } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle();
    if (me?.username) setMyUsername(me.username);

    const { data: rows } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, requester_id, status')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    const list = (rows ?? []) as FriendshipRow[];
    const otherIds = list.map((r) => (r.user_id === user.id ? r.friend_id : r.user_id));
    if (otherIds.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const { data: profs } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar')
      .in('id', otherIds);

    const { data: scores } = await supabase
      .from('leaderboard_scores')
      .select('user_id, xp, streak')
      .in('user_id', otherIds);

    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    const scoreMap = new Map((scores ?? []).map((s: any) => [s.user_id, s]));

    const result: FriendProfile[] = list.map((r) => {
      const otherId = r.user_id === user.id ? r.friend_id : r.user_id;
      const p = profMap.get(otherId) || ({} as any);
      const s = scoreMap.get(otherId) || ({ xp: 0, streak: 0 } as any);
      let status: FriendProfile['status'];
      if (r.status === 'accepted') status = 'accepted';
      else status = r.requester_id === user.id ? 'pending_outgoing' : 'pending_incoming';
      return {
        user_id: otherId,
        username: p.username || 'unknown',
        display_name: p.display_name || 'Player',
        avatar: p.avatar || '⭐',
        xp: s.xp || 0,
        streak: s.streak || 0,
        status,
      };
    });

    setFriends(result);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel('friendships-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, load]);

  const sendRequest = useCallback(async (username: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Sign in to add friends.' };
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return { ok: false, error: 'Enter a username.' };
    if (clean === myUsername.toLowerCase()) return { ok: false, error: "You can't add yourself." };

    const { data: target } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', clean)
      .maybeSingle();
    if (!target) return { ok: false, error: 'No player with that username.' };

    const [a, b] = [user.id, target.id].sort();
    const { error } = await supabase.from('friendships').insert({
      user_id: a,
      friend_id: b,
      requester_id: user.id,
      status: 'pending',
    });
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Already connected or pending.' };
      return { ok: false, error: error.message };
    }
    await load();
    return { ok: true };
  }, [user, myUsername, load]);

  const accept = useCallback(async (otherId: string) => {
    if (!user) return;
    const [a, b] = [user.id, otherId].sort();
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id', a)
      .eq('friend_id', b);
    await load();
  }, [user, load]);

  const remove = useCallback(async (otherId: string) => {
    if (!user) return;
    const [a, b] = [user.id, otherId].sort();
    await supabase.from('friendships').delete().eq('user_id', a).eq('friend_id', b);
    await load();
  }, [user, load]);

  return { friends, loading, myUsername, sendRequest, accept, remove, refresh: load };
}
