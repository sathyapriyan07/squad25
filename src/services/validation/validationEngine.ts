import type {
  CustomSquad,
  PlayerSeasonEligibility,
  PlayerWithDetails,
  SeasonRule,
  SquadValidationResult,
  ValidationIssue,
} from '../../types/ipl';

export function validatePlayerAddition(
  player: PlayerWithDetails,
  currentPlayerIds: string[],
  playersMap: Map<string, PlayerWithDetails>,
  eligibilityMap: Map<string, PlayerSeasonEligibility>,
  rule: SeasonRule
): { valid: boolean; issue?: ValidationIssue } {
  if (currentPlayerIds.includes(player.id)) {
    return {
      valid: false,
      issue: {
        ruleId: 'DUPLICATE_PLAYER',
        severity: 'error',
        message: `${player.name} is already in this squad.`,
        affectedPlayerId: player.id,
        affectedPlayerName: player.name,
        suggestedResolution: 'Select a different player not already in your custom squad.',
      },
    };
  }

  const eligibility = eligibilityMap.get(player.id);
  if (eligibility?.isAvailable === false) {
    return {
      valid: false,
      issue: {
        ruleId: 'SEASON_ELIGIBILITY',
        severity: 'error',
        message: `${player.name} is not eligible for the selected IPL season.`,
        affectedPlayerId: player.id,
        affectedPlayerName: player.name,
        suggestedResolution: 'Check season eligibility or pick a player registered for this season.',
      },
    };
  }

  if (currentPlayerIds.length >= rule.maxSquadSize) {
    return {
      valid: false,
      issue: {
        ruleId: 'MAX_SQUAD_SIZE',
        severity: 'error',
        message: `Maximum squad size of ${rule.maxSquadSize} players reached.`,
        affectedPlayerId: player.id,
        affectedPlayerName: player.name,
        suggestedResolution: `Remove at least one player before adding ${player.shortName}.`,
      },
    };
  }

  const isOverseas = eligibility?.isOverseasSnapshot ?? player.isOverseas;
  if (isOverseas) {
    const currentOverseas = currentPlayerIds.reduce((count, id) => {
      const p = playersMap.get(id);
      const pElig = eligibilityMap.get(id);
      const pOverseas = pElig?.isOverseasSnapshot ?? p?.isOverseas;
      return count + (pOverseas ? 1 : 0);
    }, 0);

    if (currentOverseas >= rule.maxOverseas) {
      return {
        valid: false,
        issue: {
          ruleId: 'MAX_OVERSEAS_SQUAD',
          severity: 'error',
          message: `Overseas limit reached (${currentOverseas}/${rule.maxOverseas} overseas players).`,
          affectedPlayerId: player.id,
          affectedPlayerName: player.name,
          suggestedResolution: 'Select an Indian player or remove an existing overseas player.',
        },
      };
    }
  }

  return { valid: true };
}

export function validateSquadAndXI(
  squad: Pick<
    CustomSquad,
    | 'playerIds'
    | 'playingXiIds'
    | 'substituteIds'
    | 'captainId'
    | 'viceCaptainId'
    | 'wicketkeeperId'
    | 'impactPlayer'
  >,
  playersMap: Map<string, PlayerWithDetails>,
  eligibilityMap: Map<string, PlayerSeasonEligibility>,
  rule: SeasonRule
): SquadValidationResult {
  const hardErrors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const uniquePlayerIds = Array.from(new Set(squad.playerIds));
  if (uniquePlayerIds.length !== squad.playerIds.length) {
    hardErrors.push({
      ruleId: 'DUPLICATE_PLAYER',
      severity: 'error',
      message: 'Duplicate players detected inside the squad.',
      suggestedResolution: 'Remove duplicate player entries.',
    });
  }

  let indian = 0;
  let overseas = 0;
  let wk = 0;
  let bat = 0;
  let ar = 0;
  let bowl = 0;

  for (const id of uniquePlayerIds) {
    const player = playersMap.get(id);
    const elig = eligibilityMap.get(id);

    if (!player || elig?.isAvailable === false) {
      hardErrors.push({
        ruleId: 'PLAYER_NOT_ELIGIBLE',
        severity: 'error',
        message: `${player?.name ?? id} is not eligible for this season.`,
        affectedPlayerId: id,
        affectedPlayerName: player?.name,
        suggestedResolution: 'Remove ineligible players from the squad.',
      });
    }

    if (player) {
      const isOv = elig?.isOverseasSnapshot ?? player.isOverseas;
      if (isOv) overseas += 1;
      else indian += 1;

      if (player.primaryRole === 'WK' || player.isWicketkeeper) wk += 1;
      if (player.primaryRole === 'BAT') bat += 1;
      else if (player.primaryRole === 'AR') ar += 1;
      else if (player.primaryRole === 'BOWL') bowl += 1;
    }
  }

  const total = uniquePlayerIds.length;

  if (total > rule.maxSquadSize) {
    hardErrors.push({
      ruleId: 'MAX_SQUAD_SIZE',
      severity: 'error',
      message: `Squad has ${total} players, exceeding maximum of ${rule.maxSquadSize}.`,
      suggestedResolution: `Remove ${total - rule.maxSquadSize} player(s).`,
    });
  }

  if (overseas > rule.maxOverseas) {
    hardErrors.push({
      ruleId: 'MAX_OVERSEAS',
      severity: 'error',
      message: `Squad has ${overseas} overseas players, exceeding the maximum of ${rule.maxOverseas}.`,
      suggestedResolution: `Remove ${overseas - rule.maxOverseas} overseas player(s).`,
    });
  }

  if (total < rule.minSquadSize) {
    warnings.push({
      ruleId: 'MIN_SQUAD_SIZE',
      severity: 'warning',
      message: `Squad has ${total}/${rule.minSquadSize} minimum required players.`,
      suggestedResolution: `Add ${rule.minSquadSize - total} more eligible player(s).`,
    });
  }

  if (indian < rule.minIndianPlayers && total >= rule.minSquadSize) {
    warnings.push({
      ruleId: 'MIN_INDIAN_PLAYERS',
      severity: 'warning',
      message: `Squad has ${indian} Indian players (recommended minimum: ${rule.minIndianPlayers}).`,
      suggestedResolution: 'Include more Indian domestic/capped players.',
    });
  }

  if (total > 0 && wk === 0) {
    warnings.push({
      ruleId: 'NO_WICKETKEEPER_SQUAD',
      severity: 'warning',
      message: 'No wicketkeeper selected in the squad.',
      suggestedResolution: 'Add at least one specialist or part-time wicketkeeper.',
    });
  }

  if (total >= 8 && bowl + ar < 5) {
    warnings.push({
      ruleId: 'INSUFFICIENT_BOWLING',
      severity: 'warning',
      message: `Only ${bowl + ar} bowling options in squad (minimum 5 recommended).`,
      suggestedResolution: 'Add more bowlers or bowling all-rounders.',
    });
  }

  if (total >= 8 && bat + wk < 4) {
    warnings.push({
      ruleId: 'POOR_BATTING_BALANCE',
      severity: 'warning',
      message: 'Batting depth is thin. Consider adding specialist batters.',
      suggestedResolution: 'Balance top/middle order with specialist batters.',
    });
  }

  // Playing XI validation
  const xiUnique = Array.from(new Set(squad.playingXiIds));
  const xiTotal = xiUnique.length;
  let xiOverseas = 0;
  let xiWk = 0;
  let xiBowlers = 0;

  for (const id of xiUnique) {
    if (!uniquePlayerIds.includes(id)) {
      hardErrors.push({
        ruleId: 'XI_PLAYER_NOT_IN_SQUAD',
        severity: 'error',
        message: 'Playing XI contains a player who is not part of the squad.',
        affectedPlayerId: id,
        suggestedResolution: 'Only select Playing XI members from the squad.',
      });
    }
    const player = playersMap.get(id);
    const elig = eligibilityMap.get(id);
    if (player) {
      const isOv = elig?.isOverseasSnapshot ?? player.isOverseas;
      if (isOv) xiOverseas += 1;
      if (player.primaryRole === 'WK' || player.isWicketkeeper) xiWk += 1;
      if (player.primaryRole === 'BOWL' || player.primaryRole === 'AR') xiBowlers += 1;
    }
  }

  if (xiTotal > rule.playingXiSize) {
    hardErrors.push({
      ruleId: 'XI_EXCEEDS_SIZE',
      severity: 'error',
      message: `Playing XI has ${xiTotal} players (limit: ${rule.playingXiSize}).`,
      suggestedResolution: `Keep exactly ${rule.playingXiSize} players in the starting XI.`,
    });
  }

  if (xiOverseas > rule.maxOverseasInXi) {
    hardErrors.push({
      ruleId: 'XI_OVERSEAS_EXCEEDED',
      severity: 'error',
      message: `Playing XI has ${xiOverseas} overseas players (maximum ${rule.maxOverseasInXi} allowed).`,
      suggestedResolution: `Replace ${xiOverseas - rule.maxOverseasInXi} overseas player(s) with Indian players.`,
    });
  }

  if (squad.captainId && xiTotal > 0 && !xiUnique.includes(squad.captainId)) {
    hardErrors.push({
      ruleId: 'CAPTAIN_NOT_IN_XI',
      severity: 'error',
      message: 'Selected Captain must be part of the Playing XI.',
      affectedPlayerId: squad.captainId,
      suggestedResolution: 'Include the Captain in the Playing XI or reassign captaincy.',
    });
  }

  if (squad.viceCaptainId && xiTotal > 0 && !xiUnique.includes(squad.viceCaptainId)) {
    hardErrors.push({
      ruleId: 'VICE_CAPTAIN_NOT_IN_XI',
      severity: 'error',
      message: 'Selected Vice-Captain must be part of the Playing XI.',
      affectedPlayerId: squad.viceCaptainId,
      suggestedResolution: 'Include the Vice-Captain in the Playing XI or reassign.',
    });
  }

  if (squad.captainId && squad.viceCaptainId && squad.captainId === squad.viceCaptainId) {
    hardErrors.push({
      ruleId: 'CAPTAIN_VC_SAME',
      severity: 'error',
      message: 'Captain and Vice-Captain cannot be the same player.',
      suggestedResolution: 'Choose two distinct players for Captain and Vice-Captain.',
    });
  }

  // Impact player validation
  if (squad.impactPlayer.nomineeId) {
    if (!rule.impactPlayerEnabled) {
      hardErrors.push({
        ruleId: 'IMPACT_PLAYER_DISABLED',
        severity: 'error',
        message: 'Impact Player rule is not enabled for this IPL season.',
        suggestedResolution: 'Clear the Impact Player nomination for historical/non-impact seasons.',
      });
    } else {
      if (xiUnique.includes(squad.impactPlayer.nomineeId)) {
        hardErrors.push({
          ruleId: 'IMPACT_IN_XI',
          severity: 'error',
          message: 'Impact Player nominee must be a substitute outside the starting XI.',
          affectedPlayerId: squad.impactPlayer.nomineeId,
          suggestedResolution: 'Pick an Impact Player from the substitutes bench.',
        });
      }
      const nominee = playersMap.get(squad.impactPlayer.nomineeId);
      const nomineeElig = eligibilityMap.get(squad.impactPlayer.nomineeId);
      const nomineeOverseas = nomineeElig ? nomineeElig.isOverseasSnapshot : nominee?.isOverseas;
      if (nomineeOverseas && xiOverseas >= rule.maxOverseasInXi) {
        const replaced = squad.impactPlayer.replacesPlayerId
          ? playersMap.get(squad.impactPlayer.replacesPlayerId)
          : null;
        const replacedElig = squad.impactPlayer.replacesPlayerId
          ? eligibilityMap.get(squad.impactPlayer.replacesPlayerId)
          : null;
        const replacedOverseas = replacedElig ? replacedElig.isOverseasSnapshot : replaced?.isOverseas;
        if (!replacedOverseas) {
          hardErrors.push({
            ruleId: 'IMPACT_OVERSEAS_RULE',
            severity: 'error',
            message: `With ${xiOverseas} overseas players already in the XI, an overseas Impact Player can only replace another overseas player (or use an XI with ≤${rule.maxOverseasInXi - 1} overseas players).`,
            affectedPlayerId: squad.impactPlayer.nomineeId,
            suggestedResolution: 'Nominate an Indian Impact Player or target an overseas player to replace.',
          });
        }
      }
    }
  }

  if (xiTotal > 0 && xiTotal < rule.playingXiSize) {
    warnings.push({
      ruleId: 'INCOMPLETE_XI',
      severity: 'warning',
      message: `Playing XI has ${xiTotal}/${rule.playingXiSize} players selected.`,
      suggestedResolution: `Add ${rule.playingXiSize - xiTotal} more player(s) to complete the XI.`,
    });
  }

  if (xiTotal === rule.playingXiSize) {
    if (xiWk === 0 && !squad.wicketkeeperId) {
      warnings.push({
        ruleId: 'NO_XI_WICKETKEEPER',
        severity: 'warning',
        message: 'No designated wicketkeeper in the Playing XI.',
        suggestedResolution: 'Assign a wicketkeeper inside the Playing XI.',
      });
    }
    if (xiBowlers < 5) {
      warnings.push({
        ruleId: 'LOW_XI_BOWLING',
        severity: 'warning',
        message: `Playing XI has only ${xiBowlers} primary bowling/all-rounder options.`,
        suggestedResolution: 'Ensure at least 5 bowling options in your Playing XI.',
      });
    }
  }

  const isValidSquad = hardErrors.filter((e) => !e.ruleId.startsWith('XI_') && !e.ruleId.startsWith('IMPACT_') && !e.ruleId.includes('CAPTAIN')).length === 0 && total >= rule.minSquadSize;
  const isValidXi = hardErrors.length === 0 && xiTotal === rule.playingXiSize;

  let status: SquadValidationResult['status'] = 'Incomplete';
  if (hardErrors.length > 0) {
    status = 'Invalid';
  } else if (total >= rule.minSquadSize && xiTotal === rule.playingXiSize) {
    status = 'Valid';
  } else if (total >= rule.minSquadSize) {
    status = 'Ready for Playing XI';
  }

  return {
    status,
    isValidSquad,
    isValidXi,
    hardErrors,
    warnings,
    counts: {
      total,
      indian,
      overseas,
      wk,
      bat,
      ar,
      bowl,
      xiTotal,
      xiOverseas,
    },
  };
}
