import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** true = thành viên, false = người ngoài / chưa đăng nhập, null = đang kiểm tra */
export function useIsMember(user: User | null): boolean | null {
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const uid = user?.id;

  useEffect(() => {
    if (!uid) {
      setIsMember(false);
      return;
    }
    let cancelled = false;
    setIsMember(null);
    supabase
      .from('profiles')
      .select('is_member')
      .eq('id', uid)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsMember(data?.is_member === true);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return isMember;
}