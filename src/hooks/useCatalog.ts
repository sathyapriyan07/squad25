import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { buildPlayersForSeason, fetchCatalogBundle } from '../services/dataService';
import { useAppStore } from '../store/appStore';

export function useCatalog(overrideSeasonId?: string) {
  const storeSeasonId = useAppStore((s) => s.selectedSeasonId);
  const seasonId = overrideSeasonId || storeSeasonId;

  const query = useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalogBundle,
    staleTime: 1000 * 60 * 5,
  });

  const catalog = query.data;

  const activeSeason = useMemo(() => {
    if (!catalog) return undefined;
    return (
      catalog.seasons.find((s) => s.id === seasonId) ||
      catalog.seasons.find((s) => s.isActive) ||
      catalog.seasons[0]
    );
  }, [catalog, seasonId]);

  const activeRule = useMemo(() => {
    if (!catalog || !activeSeason) return undefined;
    return (
      catalog.seasonRules.find((r) => r.seasonId === activeSeason.id) ?? {
        seasonId: activeSeason.id,
        minSquadSize: 18,
        maxSquadSize: 25,
        maxOverseas: 8,
        playingXiSize: 11,
        maxOverseasInXi: 4,
        minIndianPlayers: 10,
        impactPlayerEnabled: activeSeason.impactPlayerEnabled,
        maxSubstitutes: 5,
      }
    );
  }, [catalog, activeSeason]);

  const participatingTeams = useMemo(() => {
    if (!catalog || !activeSeason) return [];
    const allowedIds = new Set(
      catalog.seasonTeams
        .filter((st) => st.seasonId === activeSeason.id)
        .map((st) => st.teamId)
    );
    return catalog.teams.filter((t) => allowedIds.has(t.id));
  }, [catalog, activeSeason]);

  const seasonPlayers = useMemo(() => {
    if (!catalog || !activeSeason) return [];
    return buildPlayersForSeason(catalog, activeSeason.id);
  }, [catalog, activeSeason]);

  const eligiblePlayers = useMemo(
    () => seasonPlayers.filter((p) => p.eligibility?.isAvailable),
    [seasonPlayers]
  );

  return {
    ...query,
    catalog,
    activeSeason,
    activeRule,
    participatingTeams,
    seasonPlayers,
    eligiblePlayers,
  };
}
