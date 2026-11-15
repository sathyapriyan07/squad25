import { create } from 'zustand';
import type { CustomSquad, ImpactPlayerConfig, SquadVisibility, TeamRatingBreakdown } from '../types/ipl';

interface SquadDraftState {
  draft: CustomSquad;
  isDirty: boolean;
  initNewDraft: (params: { ownerId: string; seasonId: string; teamId: string; teamShortCode: string }) => void;
  loadSquad: (squad: CustomSquad) => void;
  setName: (name: string) => void;
  setVisibility: (visibility: SquadVisibility) => void;
  setTeamAndSeason: (teamId: string, seasonId: string) => void;
  addPlayer: (playerId: string, ratings: TeamRatingBreakdown) => void;
  removePlayer: (playerId: string, ratings: TeamRatingBreakdown) => void;
  reorderPlayers: (playerIds: string[]) => void;
  setPlayingXiIds: (xiIds: string[]) => void;
  setSubstituteIds: (subIds: string[]) => void;
  setCaptainId: (captainId: string | null) => void;
  setViceCaptainId: (viceCaptainId: string | null) => void;
  setWicketkeeperId: (wkId: string | null) => void;
  setImpactPlayer: (impact: ImpactPlayerConfig) => void;
  setRatings: (ratings: TeamRatingBreakdown) => void;
  markClean: (saved?: CustomSquad) => void;
}

const EMPTY_RATINGS: TeamRatingBreakdown = {
  battingStrength: 0,
  bowlingStrength: 0,
  paceStrength: 0,
  spinStrength: 0,
  allRounderStrength: 0,
  wicketkeepingStrength: 0,
  squadDepth: 0,
  overallRating: 0,
};

function createEmptyDraft(
  ownerId = '',
  seasonId = '',
  teamId = '',
  teamShortCode = ''
): CustomSquad {
  const now = new Date().toISOString();
  const id = `sq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    ownerId,
    seasonId,
    teamId,
    name: teamShortCode ? `${teamShortCode} squad` : 'New squad',
    playerIds: [],
    playingXiIds: [],
    substituteIds: [],
    captainId: null,
    viceCaptainId: null,
    wicketkeeperId: null,
    impactPlayer: { nomineeId: null, replacesPlayerId: null },
    ratings: EMPTY_RATINGS,
    visibility: 'private',
    createdAt: now,
    updatedAt: now,
  };
}

export const useSquadStore = create<SquadDraftState>((set) => ({
  draft: createEmptyDraft(),
  isDirty: false,
  initNewDraft: ({ ownerId, seasonId, teamId, teamShortCode }) =>
    set({
      draft: createEmptyDraft(ownerId, seasonId, teamId, teamShortCode),
      isDirty: false,
    }),
  loadSquad: (squad) => set({ draft: { ...squad }, isDirty: false }),
  setName: (name) =>
    set((s) => ({ draft: { ...s.draft, name }, isDirty: true })),
  setVisibility: (visibility) =>
    set((s) => ({ draft: { ...s.draft, visibility }, isDirty: true })),
  setTeamAndSeason: (teamId, seasonId) =>
    set((s) => ({
      draft: { ...s.draft, teamId, seasonId },
      isDirty: true,
    })),
  addPlayer: (playerId, ratings) =>
    set((s) => ({
      draft: {
        ...s.draft,
        playerIds: s.draft.playerIds.includes(playerId)
          ? s.draft.playerIds
          : [...s.draft.playerIds, playerId],
        ratings,
      },
      isDirty: true,
    })),
  removePlayer: (playerId, ratings) =>
    set((s) => ({
      draft: {
        ...s.draft,
        playerIds: s.draft.playerIds.filter((id) => id !== playerId),
        playingXiIds: s.draft.playingXiIds.filter((id) => id !== playerId),
        substituteIds: s.draft.substituteIds.filter((id) => id !== playerId),
        captainId: s.draft.captainId === playerId ? null : s.draft.captainId,
        viceCaptainId: s.draft.viceCaptainId === playerId ? null : s.draft.viceCaptainId,
        wicketkeeperId: s.draft.wicketkeeperId === playerId ? null : s.draft.wicketkeeperId,
        impactPlayer: {
          nomineeId: s.draft.impactPlayer.nomineeId === playerId ? null : s.draft.impactPlayer.nomineeId,
          replacesPlayerId:
            s.draft.impactPlayer.replacesPlayerId === playerId ? null : s.draft.impactPlayer.replacesPlayerId,
        },
        ratings,
      },
      isDirty: true,
    })),
  reorderPlayers: (playerIds) =>
    set((s) => ({ draft: { ...s.draft, playerIds }, isDirty: true })),
  setPlayingXiIds: (playingXiIds) =>
    set((s) => ({
      draft: {
        ...s.draft,
        playingXiIds,
        substituteIds: s.draft.playerIds.filter((id) => !playingXiIds.includes(id)),
      },
      isDirty: true,
    })),
  setSubstituteIds: (substituteIds) =>
    set((s) => ({ draft: { ...s.draft, substituteIds }, isDirty: true })),
  setCaptainId: (captainId) =>
    set((s) => ({ draft: { ...s.draft, captainId }, isDirty: true })),
  setViceCaptainId: (viceCaptainId) =>
    set((s) => ({ draft: { ...s.draft, viceCaptainId }, isDirty: true })),
  setWicketkeeperId: (wicketkeeperId) =>
    set((s) => ({ draft: { ...s.draft, wicketkeeperId }, isDirty: true })),
  setImpactPlayer: (impactPlayer) =>
    set((s) => ({ draft: { ...s.draft, impactPlayer }, isDirty: true })),
  setRatings: (ratings) =>
    set((s) => ({ draft: { ...s.draft, ratings } })),
  markClean: (saved) =>
    set((s) => ({
      draft: saved ? { ...saved } : s.draft,
      isDirty: false,
    })),
}));
