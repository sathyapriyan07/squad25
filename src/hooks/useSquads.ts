import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteSquad,
  fetchAllSquadsAdmin,
  fetchPublicSquads,
  fetchSharedSquad,
  fetchSquadById,
  fetchUserComparisons,
  fetchUserSquads,
  publishSquadShare,
  saveComparison,
  saveSquad,
} from '../services/dataService';
import { useAuthStore } from '../store/authStore';
import type { CustomSquad, SquadComparison, SquadShareSnapshot } from '../types/ipl';

export function useUserSquads() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['squads', 'user', user?.uid],
    queryFn: () => (user ? fetchUserSquads(user.uid) : Promise.resolve([])),
    enabled: Boolean(user),
  });
}

export function usePublicSquads() {
  return useQuery({
    queryKey: ['squads', 'public'],
    queryFn: fetchPublicSquads,
  });
}

export function useAllSquadsAdmin() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['squads', 'admin'],
    queryFn: fetchAllSquadsAdmin,
    enabled: user?.role === 'admin',
  });
}

export function useSquadById(squadId?: string) {
  return useQuery({
    queryKey: ['squad', squadId],
    queryFn: () => (squadId ? fetchSquadById(squadId) : Promise.resolve(null)),
    enabled: Boolean(squadId),
  });
}

export function useSharedSquad(shareSlug?: string) {
  return useQuery({
    queryKey: ['squad_share', shareSlug],
    queryFn: () => (shareSlug ? fetchSharedSquad(shareSlug) : Promise.resolve(null)),
    enabled: Boolean(shareSlug),
  });
}

export function useSaveSquadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (squad: CustomSquad) => saveSquad(squad),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      qc.invalidateQueries({ queryKey: ['squad', saved.id] });
    },
  });
}

export function useDeleteSquadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ squadId, shareSlug }: { squadId: string; shareSlug?: string }) =>
      deleteSquad(squadId, shareSlug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function usePublishShareMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      squad,
      snapshot,
    }: {
      squad: CustomSquad;
      snapshot: SquadShareSnapshot;
    }) => {
      const updatedSquad = await saveSquad({
        ...squad,
        visibility: 'public',
        shareSlug: snapshot.shareSlug,
      });
      await publishSquadShare(snapshot);
      return updatedSquad;
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      qc.invalidateQueries({ queryKey: ['squad', saved.id] });
      if (saved.shareSlug) {
        qc.invalidateQueries({ queryKey: ['squad_share', saved.shareSlug] });
      }
    },
  });
}

export function useUserComparisons() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['comparisons', user?.uid],
    queryFn: () => (user ? fetchUserComparisons(user.uid) : Promise.resolve([])),
    enabled: Boolean(user),
  });
}

export function useSaveComparisonMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comp: SquadComparison) => saveComparison(comp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comparisons'] });
    },
  });
}
