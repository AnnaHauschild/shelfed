import { createContext, useCallback, useContext, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Movie } from '@/api/types';
import { getFilmMatches } from '@/api/matches';
import { hasSupabase } from '@/api/supabase';
import { useAuth } from '@/context/AuthProvider';
import { MatchInfo, MatchModal } from '@/components/MatchModal';

interface MatchCelebrationValue {
  /** If this title is also a followee's favourite, show "It's a Match!". */
  celebrate: (movie: Movie) => void;
}

const MatchCelebrationContext = createContext<MatchCelebrationValue>({
  celebrate: () => {},
});

/** Fires the match celebration from anywhere a favourite is added. */
export function useMatchCelebration(): MatchCelebrationValue {
  return useContext(MatchCelebrationContext);
}

export function MatchCelebrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();
  const [info, setInfo] = useState<MatchInfo | null>(null);

  const celebrate = useCallback(
    (movie: Movie) => {
      if (!hasSupabase || !userId) return;
      getFilmMatches(userId, movie.mediaType, movie.id)
        .then((friends) => {
          if (friends.length > 0) {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
            setInfo({ movie, friends });
          }
        })
        .catch(() => {});
    },
    [userId],
  );

  return (
    <MatchCelebrationContext.Provider value={{ celebrate }}>
      {children}
      <MatchModal info={info} onClose={() => setInfo(null)} />
    </MatchCelebrationContext.Provider>
  );
}
