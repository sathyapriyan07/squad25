import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FlightIcon from '@mui/icons-material/Flight';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useSaveSquadMutation, useSquadById } from '../../hooks/useSquads';
import { validateSquadAndXI } from '../../services/validation/validationEngine';
import { useAppStore } from '../../store/appStore';
import { EmptyState, LoadingState, PageHeader } from '../../components/common/CommonUi';
import { PlayerAvatar, RoleBadge } from '../../components/common/PlayerAvatar';
import { PlayerGrid } from '../../components/players/player-grid';
import { TeamLogo } from '../../components/common/TeamLogo';
import type { CustomSquad, PlayerWithDetails } from '../../types/ipl';

function SortableXIRow({
  player,
  position,
  isCaptain,
  isViceCaptain,
  isWk,
  accentColor,
  onRemove,
}: {
  player: PlayerWithDetails;
  position: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isWk: boolean;
  accentColor: string;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        p: 1.25,
        borderRadius: '12px',
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', color: 'text.secondary', display: 'flex', alignItems: 'center' }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Typography
        variant="subtitle2"
        className="tabular-nums"
        sx={{
          width: 24,
          textAlign: 'center',
          fontWeight: 800,
          color: accentColor,
        }}
      >
        {position}
      </Typography>
      <PlayerAvatar player={player} accentColor={accentColor} size={38} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {player.name}
          </Typography>
          {player.isOverseas && <FlightIcon sx={{ fontSize: 13, color: 'warning.main' }} />}
          {isCaptain && <Chip size="small" label="C" color="warning" sx={{ height: 19, fontSize: '0.65rem' }} />}
          {isViceCaptain && <Chip size="small" label="VC" color="info" sx={{ height: 19, fontSize: '0.65rem' }} />}
          {isWk && <Chip size="small" label="WK" color="secondary" sx={{ height: 19, fontSize: '0.65rem' }} />}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <RoleBadge role={player.primaryRole} />
          <Typography variant="caption" color="text.secondary" className="tabular-nums">
            OVR {player.ratings.overall} • BAT {player.ratings.batting} • BOWL{' '}
            {Math.max(player.ratings.paceBowling, player.ratings.spinBowling)}
          </Typography>
        </Stack>
      </Box>
      <IconButton size="small" color="error" onClick={() => onRemove(player.id)} aria-label="Remove from XI">
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function PlayingXIBuilderPage() {
  const { squadId } = useParams();
  const navigate = useNavigate();
  const showSnackbar = useAppStore((s) => s.showSnackbar);

  const { data: squadData, isLoading: squadLoading } = useSquadById(squadId);
  const { catalog, activeRule, seasonPlayers, isLoading: catalogLoading } = useCatalog(squadData?.seasonId);
  const saveMutation = useSaveSquadMutation();

  const [localSquad, setLocalSquad] = useState<CustomSquad | null>(null);
  const [xiViewTab, setXiViewTab] = useState(0);

  useEffect(() => {
    if (squadData) setLocalSquad(squadData);
  }, [squadData]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const playersMap = useMemo(() => new Map(seasonPlayers.map((p) => [p.id, p])), [seasonPlayers]);
  const eligibilityMap = useMemo(() => {
    const map = new Map();
    for (const p of seasonPlayers) {
      if (p.eligibility) map.set(p.id, p.eligibility);
    }
    return map;
  }, [seasonPlayers]);

  const team = useMemo(
    () => catalog?.teams.find((t) => t.id === localSquad?.teamId),
    [catalog, localSquad?.teamId]
  );
  const accentColor = team?.primaryColor || '#3B82F6';

  const squadPlayers = useMemo(
    () =>
      (localSquad?.playerIds || [])
        .map((id) => playersMap.get(id))
        .filter((p): p is PlayerWithDetails => Boolean(p)),
    [localSquad, playersMap]
  );

  const xiPlayers = useMemo(
    () =>
      (localSquad?.playingXiIds || [])
        .map((id) => playersMap.get(id))
        .filter((p): p is PlayerWithDetails => Boolean(p)),
    [localSquad, playersMap]
  );

  const benchPlayers = useMemo(
    () => squadPlayers.filter((p) => !localSquad?.playingXiIds.includes(p.id)),
    [squadPlayers, localSquad?.playingXiIds]
  );

  const validation = useMemo(() => {
    if (!localSquad || !activeRule) return null;
    return validateSquadAndXI(localSquad, playersMap, eligibilityMap, activeRule);
  }, [localSquad, playersMap, eligibilityMap, activeRule]);

  if (squadLoading || catalogLoading) return <LoadingState count={4} />;
  if (!localSquad) {
    return (
      <EmptyState
        title="Squad not found"
        description="Select a saved squad first to configure its Playing XI and Impact Player."
        action={<Button variant="contained" onClick={() => navigate('/saved-squads')}>Go to Saved Squads</Button>}
      />
    );
  }

  if (!activeRule) {
    return (
      <EmptyState
        title="Season rules are not configured"
        description="An administrator must configure squad rules for this season before the Playing XI can be set."
        action={<Button variant="outlined" onClick={() => navigate('/saved-squads')}>Back to Saved Squads</Button>}
      />
    );
  }

  const handleAddToXI = (player: PlayerWithDetails) => {
    if (localSquad.playingXiIds.length >= activeRule.playingXiSize) {
      showSnackbar(`Playing XI is full (${activeRule.playingXiSize} players). Remove one first.`, 'warning');
      return;
    }
    const currentOs = xiPlayers.filter((p) => p.isOverseas).length;
    if (player.isOverseas && currentOs >= activeRule.maxOverseasInXi) {
      showSnackbar(`Max ${activeRule.maxOverseasInXi} overseas players allowed in Playing XI.`, 'error');
      return;
    }
    const nextXi = [...localSquad.playingXiIds, player.id];
    setLocalSquad({
      ...localSquad,
      playingXiIds: nextXi,
      substituteIds: localSquad.playerIds.filter((id) => !nextXi.includes(id)),
      wicketkeeperId:
        !localSquad.wicketkeeperId && (player.isWicketkeeper || player.primaryRole === 'WK')
          ? player.id
          : localSquad.wicketkeeperId,
    });
    showSnackbar(`${player.shortName} added to Playing XI`, 'success');
  };

  const handleRemoveFromXI = (playerId: string) => {
    const nextXi = localSquad.playingXiIds.filter((id) => id !== playerId);
    setLocalSquad({
      ...localSquad,
      playingXiIds: nextXi,
      substituteIds: localSquad.playerIds.filter((id) => !nextXi.includes(id)),
      captainId: localSquad.captainId === playerId ? null : localSquad.captainId,
      viceCaptainId: localSquad.viceCaptainId === playerId ? null : localSquad.viceCaptainId,
      wicketkeeperId: localSquad.wicketkeeperId === playerId ? null : localSquad.wicketkeeperId,
    });
    const player = playersMap.get(playerId);
    if (player) showSnackbar(`${player.shortName} removed from Playing XI`, 'info');
  };

  const handleAutoPickXI = () => {
    const sorted = [...squadPlayers].sort((a, b) => b.ratings.overall - a.ratings.overall);
    const chosen: PlayerWithDetails[] = [];
    let osCount = 0;

    // Ensure 1 WK first
    const bestWk = sorted.find((p) => p.isWicketkeeper || p.primaryRole === 'WK');
    if (bestWk) {
      chosen.push(bestWk);
      if (bestWk.isOverseas) osCount += 1;
    }

    for (const p of sorted) {
      if (chosen.length >= activeRule.playingXiSize) break;
      if (chosen.some((c) => c.id === p.id)) continue;
      if (p.isOverseas && osCount >= activeRule.maxOverseasInXi) continue;
      chosen.push(p);
      if (p.isOverseas) osCount += 1;
    }

    // Order roughly: WK/BAT openers & middle -> AR -> BOWL
    const ordered = [
      ...chosen.filter((p) => p.primaryRole === 'BAT' || p.primaryRole === 'WK'),
      ...chosen.filter((p) => p.primaryRole === 'AR'),
      ...chosen.filter((p) => p.primaryRole === 'BOWL'),
    ];
    const nextXi = ordered.map((p) => p.id);
    setLocalSquad({
      ...localSquad,
      playingXiIds: nextXi,
      substituteIds: localSquad.playerIds.filter((id) => !nextXi.includes(id)),
      captainId: localSquad.captainId && nextXi.includes(localSquad.captainId) ? localSquad.captainId : ordered[0]?.id ?? null,
      viceCaptainId: localSquad.viceCaptainId && nextXi.includes(localSquad.viceCaptainId) ? localSquad.viceCaptainId : ordered[1]?.id ?? null,
      wicketkeeperId: bestWk?.id ?? null,
    });
    showSnackbar('Best balanced Playing XI auto-selected!', 'info');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localSquad.playingXiIds.indexOf(String(active.id));
    const newIndex = localSquad.playingXiIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    setLocalSquad({
      ...localSquad,
      playingXiIds: arrayMove(localSquad.playingXiIds, oldIndex, newIndex),
    });
  };

  const handleSaveXI = async () => {
    const saved = await saveMutation.mutateAsync(localSquad);
    setLocalSquad(saved);
    showSnackbar('Playing XI & tactical lineup saved!', 'success');
  };

  const openers = xiPlayers.slice(0, 2);
  const middleOrder = xiPlayers.slice(2, 5);
  const finishers = xiPlayers.slice(5, 7);
  const paceAttack = xiPlayers.filter((p) => p.ratings.paceBowling >= 55);
  const spinAttack = xiPlayers.filter((p) => p.ratings.spinBowling >= 55);

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={`Playing XI — ${localSquad.name}`}
        subtitle={`${team?.name || ''} • Drag players to set batting order 1–11, assign leadership, and configure Impact Player.`}
        badge={<TeamLogo team={team} size={36} />}
        actions={
          <>
            <Button variant="outlined" startIcon={<AutoFixHighIcon />} onClick={handleAutoPickXI} disabled={squadPlayers.length < 11}>
              Auto-Pick Best XI
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saveMutation.isPending}
              onClick={handleSaveXI}
              sx={{ bgcolor: accentColor }}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Playing XI'}
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5} sx={{ alignItems: 'flex-start' }}>
        {/* LEFT: Available Squad Players */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                Squad Pool ({squadPlayers.length})
              </Typography>
              <PlayerGrid
                players={squadPlayers}
                selectedPlayerIds={localSquad.playingXiIds}
                onSelect={handleAddToXI}
                onRemove={(player) => handleRemoveFromXI(player.id)}
                onViewDetails={(player) => navigate(`/players/${player.id}`)}
                accentColor={accentColor}
                actionLabel="Add to XI"
                selectedActionLabel="In Playing XI"
                compact
                columns={{ xs: 2, sm: 3, md: 3, lg: 1, xl: 1 }}
                emptyTitle="Squad is empty"
                emptyDescription="Add players in the Squad Builder before setting a Playing XI."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* CENTRE: Selected Playing XI & Views */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Starting XI ({xiPlayers.length}/{activeRule.playingXiSize})
                </Typography>
                <Chip
                  size="small"
                  label={`Overseas: ${xiPlayers.filter((p) => p.isOverseas).length}/${activeRule.maxOverseasInXi}`}
                  color={xiPlayers.filter((p) => p.isOverseas).length > activeRule.maxOverseasInXi ? 'error' : 'default'}
                />
              </Stack>

              <Tabs value={xiViewTab} onChange={(_, v) => setXiViewTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Batting Order" />
                <Tab label="Tactical Formation" />
                <Tab label="Bowling Attack" />
              </Tabs>

              {xiViewTab === 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={localSquad.playingXiIds} strategy={verticalListSortingStrategy}>
                    <Stack spacing={1}>
                      {xiPlayers.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                          Add 11 players from the left panel or click Auto-Pick Best XI.
                        </Typography>
                      ) : (
                        xiPlayers.map((p, idx) => (
                          <SortableXIRow
                            key={p.id}
                            player={p}
                            position={idx + 1}
                            isCaptain={localSquad.captainId === p.id}
                            isViceCaptain={localSquad.viceCaptainId === p.id}
                            isWk={localSquad.wicketkeeperId === p.id}
                            accentColor={accentColor}
                            onRemove={handleRemoveFromXI}
                          />
                        ))
                      )}
                    </Stack>
                  </SortableContext>
                </DndContext>
              )}

              {xiViewTab === 1 && (
                <Stack spacing={2}>
                  {[
                    { title: 'Opening Batters (#1–2)', list: openers },
                    { title: 'Middle Order (#3–5)', list: middleOrder },
                    { title: 'Finishers & Lower Middle (#6–7)', list: finishers },
                    { title: 'All-Rounders in XI', list: xiPlayers.filter((p) => p.primaryRole === 'AR') },
                  ].map((group) => (
                    <Box key={group.title}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                        {group.title}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                        {group.list.length > 0 ? (
                          group.list.map((p) => <Chip key={p.id} label={`${p.shortName} (${p.primaryRole})`} />)
                        ) : (
                          <Typography variant="caption" color="text.disabled">None assigned</Typography>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}

              {xiViewTab === 2 && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Pace Attack ({paceAttack.length})</Typography>
                    <Stack spacing={1}>
                      {paceAttack.map((p) => (
                        <Stack key={p.id} direction="row" sx={{ p: 1, justifyContent: 'space-between', borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }}>
                          <Typography variant="body2">{p.name} ({p.bowlingStyle})</Typography>
                          <Chip size="small" label={`Pace ${p.ratings.paceBowling}`} />
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Spin Attack ({spinAttack.length})</Typography>
                    <Stack spacing={1}>
                      {spinAttack.map((p) => (
                        <Stack key={p.id} direction="row" sx={{ p: 1, justifyContent: 'space-between', borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)' }}>
                          <Typography variant="body2">{p.name} ({p.bowlingStyle})</Typography>
                          <Chip size="small" label={`Spin ${p.ratings.spinBowling}`} />
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Leadership, Impact Player & Validation */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Stack spacing={2}>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                  Leadership & Roles
                </Typography>
                <Stack spacing={2}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Captain (C)</InputLabel>
                    <Select
                      label="Captain (C)"
                      value={localSquad.captainId || ''}
                      onChange={(e) => setLocalSquad({ ...localSquad, captainId: e.target.value || null })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {xiPlayers.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Vice-Captain (VC)</InputLabel>
                    <Select
                      label="Vice-Captain (VC)"
                      value={localSquad.viceCaptainId || ''}
                      onChange={(e) => setLocalSquad({ ...localSquad, viceCaptainId: e.target.value || null })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {xiPlayers.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Designated Wicketkeeper (WK)</InputLabel>
                    <Select
                      label="Designated Wicketkeeper (WK)"
                      value={localSquad.wicketkeeperId || ''}
                      onChange={(e) => setLocalSquad({ ...localSquad, wicketkeeperId: e.target.value || null })}
                    >
                      <MenuItem value="">None</MenuItem>
                      {xiPlayers.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name} {p.isWicketkeeper ? '(Specialist)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Impact Player Regulation
                </Typography>
                {!activeRule.impactPlayerEnabled ? (
                  <Alert severity="info" variant="outlined">
                    Impact Player is disabled under this season&apos;s regulations.
                  </Alert>
                ) : (
                  <Stack spacing={1.5}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Impact Substitute Nominee</InputLabel>
                      <Select
                        label="Impact Substitute Nominee"
                        value={localSquad.impactPlayer.nomineeId || ''}
                        onChange={(e) =>
                          setLocalSquad({
                            ...localSquad,
                            impactPlayer: {
                              ...localSquad.impactPlayer,
                              nomineeId: e.target.value || null,
                            },
                          })
                        }
                      >
                        <MenuItem value="">None</MenuItem>
                        {benchPlayers.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} ({p.isOverseas ? 'OS' : 'IND'} • {p.primaryRole})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Intended Player to Replace</InputLabel>
                      <Select
                        label="Intended Player to Replace"
                        value={localSquad.impactPlayer.replacesPlayerId || ''}
                        onChange={(e) =>
                          setLocalSquad({
                            ...localSquad,
                            impactPlayer: {
                              ...localSquad.impactPlayer,
                              replacesPlayerId: e.target.value || null,
                            },
                          })
                        }
                      >
                        <MenuItem value="">Select XI Member</MenuItem>
                        {xiPlayers.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name} ({p.isOverseas ? 'OS' : 'IND'})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* XI Validation Alerts */}
            {validation?.hardErrors.map((err) => (
              <Alert key={err.ruleId} severity="error" variant="outlined">
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{err.message}</Typography>
                <Typography variant="caption" color="text.secondary">{err.suggestedResolution}</Typography>
              </Alert>
            ))}
            {validation?.warnings.map((w) => (
              <Alert key={w.ruleId} severity="warning" variant="outlined">
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{w.message}</Typography>
              </Alert>
            ))}
            {validation?.isValidXi && (
              <Alert severity="success" variant="outlined">
                Playing XI is compliant with all official season regulations!
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
