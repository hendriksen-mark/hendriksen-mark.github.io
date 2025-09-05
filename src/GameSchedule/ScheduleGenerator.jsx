import translations from '../Translation/Translations.jsx'; // Import translations

export const MAX_CODE_RUNS = 2000;

export function createSchedule(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language) {
  const schedule = {};
  let codeRuns = 0;

  while (codeRuns < MAX_CODE_RUNS) {
    codeRuns++;
    
    const playerMatches = {};
    const consecutiveGames = {};
    Object.keys(availability).forEach((player) => {
      playerMatches[player] = 0;
      consecutiveGames[player] = 0;
    });

    const homeLocations = locations.filter((loc) => loc.startsWith("THUIS"));
    const awayLocations = locations.filter((loc) => loc.startsWith("UIT"));

    try {
      locations.forEach((loc) => {
        const availablePlayers = getAvailablePlayers(
          loc,
          availability,
          playerMatches,
          consecutiveGames,
          maxGames,
          maxConsecutiveGames,
          locations
        );
        
        if (availablePlayers.length < requiredPlayers) {
          throw new Error(translations[language].errorNotEnoughPlayers.replace("{location}", loc));
        }

        // Simple random selection without home/away balancing constraints
        const selectedPlayers = availablePlayers
          .sort(() => 0.5 - Math.random())
          .slice(0, requiredPlayers);

        schedule[loc] = selectedPlayers;
        selectedPlayers.forEach((player) => {
          playerMatches[player]++;
          consecutiveGames[player]++;
        });

        Object.keys(consecutiveGames).forEach((player) => {
          if (!selectedPlayers.includes(player)) {
            consecutiveGames[player] = 0;
          }
        });
      });

      // Success! Return the schedule
      return { schedule, codeRuns };
    } catch (error) {
      if (codeRuns >= MAX_CODE_RUNS) {
        throw new Error(translations[language].errorMaxRetriesReached);
      }
    }
  }

  throw new Error(translations[language].errorMaxRetriesReached);
}

export async function createScheduleAsync(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language, onProgress) {
  const schedule = {};
  let codeRuns = 0;

  while (codeRuns < MAX_CODE_RUNS) {
    codeRuns++;
    
    // Update progress every 10 iterations to avoid too many updates
    if (codeRuns % 10 === 0 && onProgress) {
      onProgress(codeRuns);
      // Yield control to allow UI updates
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const playerMatches = {};
    const consecutiveGames = {};
    Object.keys(availability).forEach((player) => {
      playerMatches[player] = 0;
      consecutiveGames[player] = 0;
    });

    const homeLocations = locations.filter((loc) => loc.startsWith("THUIS"));
    const awayLocations = locations.filter((loc) => loc.startsWith("UIT"));

    try {
      locations.forEach((loc) => {
        const availablePlayers = getAvailablePlayers(
          loc,
          availability,
          playerMatches,
          consecutiveGames,
          maxGames,
          maxConsecutiveGames,
          locations
        );
        
        if (availablePlayers.length < requiredPlayers) {
          throw new Error(translations[language].errorNotEnoughPlayers.replace("{location}", loc));
        }

        // Simple random selection without home/away balancing constraints
        const selectedPlayers = availablePlayers
          .sort(() => 0.5 - Math.random())
          .slice(0, requiredPlayers);

        schedule[loc] = selectedPlayers;
        selectedPlayers.forEach((player) => {
          playerMatches[player]++;
          consecutiveGames[player]++;
        });

        Object.keys(consecutiveGames).forEach((player) => {
          if (!selectedPlayers.includes(player)) {
            consecutiveGames[player] = 0;
          }
        });
      });

      // Final progress update
      if (onProgress) {
        onProgress(codeRuns);
      }
      
      // Success! Return the schedule
      return { schedule, codeRuns };
    } catch (error) {
      if (codeRuns >= MAX_CODE_RUNS) {
        throw new Error(translations[language].errorMaxRetriesReached);
      }
    }
  }

  throw new Error(translations[language].errorMaxRetriesReached);
}

function getAvailablePlayers(loc, availability, playerMatches, consecutiveGames, maxGames, maxConsecutiveGames, locations) {
  return Object.keys(availability).filter(
    (player) =>
      availability[player][locations.indexOf(loc)] &&
      playerMatches[player] < maxGames &&
      consecutiveGames[player] < maxConsecutiveGames
  );
}

function selectPlayers(loc, availablePlayers, homeAwayCount, homeLocations, requiredPlayers, maxConsecutiveGames) {
  const isHome = homeLocations.includes(loc);
  const filteredPlayers = availablePlayers.filter(
    (player) => homeAwayCount[player][isHome ? "home" : "away"] < maxConsecutiveGames
  );

  if (filteredPlayers.length >= requiredPlayers) {
    return filteredPlayers.sort(() => 0.5 - Math.random()).slice(0, requiredPlayers);
  }

  // If not enough players meet the maxConsecutiveGames condition, fallback to selecting from all available players
  return availablePlayers.sort(() => 0.5 - Math.random()).slice(0, requiredPlayers);
}

function resetConsecutiveGames(availability, selectedPlayers, consecutiveGames) {
  Object.keys(availability).forEach((player) => {
    if (!selectedPlayers.includes(player)) {
      consecutiveGames[player] = 0;
    }
  });
}

export function validateLocations(locations, language, gameType) {
  const uniqueLocations = new Set(locations);
  if (uniqueLocations.size !== locations.length) {
    return translations[language].errorLocationsUnique;
  }

  if (gameType !== "beker") { // Skip validation for "beker"
    const homeCount = locations.filter((loc) => loc.startsWith("THUIS")).length;
    if (homeCount < locations.length / 2) {
      return translations[language].errorLocationsThuis;
    }
  }

  return null;
}

export function validateAvailability(locations, availability, language) {
  for (const [player, avail] of Object.entries(availability)) {
    if (avail.length !== locations.length) {
      return translations[language].errorAvailabilityLength.replace("{player}", player);
    }
  }
  return null;
}

function checkAvailablePlayersForLocation(locations, availability, requiredPlayers, language) {
  for (const loc of locations) {
    const availablePlayers = Object.keys(availability).filter(
      (player) => availability[player][locations.indexOf(loc)]
    );
    if (availablePlayers.length < requiredPlayers) {
      return translations[language].errorNotEnoughPlayers.replace("{location}", loc);
    }
  }
  return null;
}

export function createScheduleWithValidation(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language, gameType) {
  const validationError =
    validateLocations(locations, language, gameType) ||
    validateAvailability(locations, availability, language) ||
    checkAvailablePlayersForLocation(locations, availability, requiredPlayers, language);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const { schedule, codeRuns } = createSchedule(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language);
    return { schedule, codeRuns };
  } catch (error) {
    return { error: translations[language].errorUnableToGenerateSchedule.replace("{reason}", error.message) };
  }
}

export async function createScheduleWithValidationAsync(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language, gameType, onProgress) {
  const validationError =
    validateLocations(locations, language, gameType) ||
    validateAvailability(locations, availability, language) ||
    checkAvailablePlayersForLocation(locations, availability, requiredPlayers, language);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const { schedule, codeRuns } = await createScheduleAsync(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language, onProgress);
    return { schedule, codeRuns };
  } catch (error) {
    return { error: translations[language].errorUnableToGenerateSchedule.replace("{reason}", error.message) };
  }
}

export function printSchedule(schedule, players, homeAwayCount, language, availability = null) {
  const locationHeader = translations[language]?.location || "Location";
  const homeHeader = translations[language]?.home || "Home";
  const awayHeader = translations[language]?.away || "Away";
  const totalHeader = translations[language]?.total || "Total";

  // Create HTML table
  let html = '<div class="ttapp-schedule">';
  
  // Header row with player names
  html += '<div class="pl-header">';
  html += '<div class="pl-descs"></div>';
  html += '<div class="pl-cells">';
  players.forEach((player, index) => {
    const isFirst = index === 0;
    const isLast = index === players.length - 1;
    const cellClass = `pl-cell pl-playername ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
    html += `<div class="${cellClass}">${player}</div>`;
  });
  html += '</div>';
  html += '</div>';

  // Schedule rows
  Object.entries(schedule).forEach(([location, locPlayers], locationIndex) => {
    html += '<div class="pl-row">';
    html += '<div class="pl-descs">';
    html += `<div class="pl-location">${location}</div>`;
    html += '</div>';
    html += '<div class="pl-cells">';
    
    players.forEach((player, playerIndex) => {
      const isFirst = playerIndex === 0;
      const isLast = playerIndex === players.length - 1;
      const isSelected = locPlayers.includes(player);
      
      // Build class step by step for clarity
      let classes = ['pl-cell', 'av'];
      
      if (isSelected) {
        // Player is scheduled - bright green with checkmark
        classes.push('av1', 'scheduled');
      } else {
        // Player is not scheduled - check their availability
        if (availability && availability[player] && typeof availability[player][locationIndex] === 'boolean') {
          if (availability[player][locationIndex]) {
            // Available but not scheduled - light green without checkmark
            classes.push('av1', 'not-scheduled');
          } else {
            // Not available - red background
            classes.push('av3');
          }
        } else {
          // Fallback - no availability data
          classes.push('av0');
        }
      }
      
      // Add position classes
      if (isFirst) classes.push('first');
      if (isLast) classes.push('last');
      
      const cellClass = classes.join(' ');
      
      html += `<div class="${cellClass}">`;
      if (isSelected) {
        html += '<i class="fa fa-check"></i>';
      }
      html += '</div>';
    });
    
    html += '</div>';
    html += '</div>';
  });

  // Summary rows (with separator)
  html += '<div class="pl-row stats-separator">';
  html += '<div class="pl-descs">';
  html += `<div class="pl-tot">${homeHeader}:</div>`;
  html += '</div>';
  html += '<div class="pl-cells">';
  players.forEach((player, index) => {
    const isFirst = index === 0;
    const isLast = index === players.length - 1;
    const cellClass = `pl-cell pl-count ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
    html += `<div class="${cellClass}">${homeAwayCount[player].home}</div>`;
  });
  html += '</div>';
  html += '</div>';

  html += '<div class="pl-row">';
  html += '<div class="pl-descs">';
  html += `<div class="pl-tot">${awayHeader}:</div>`;
  html += '</div>';
  html += '<div class="pl-cells">';
  players.forEach((player, index) => {
    const isFirst = index === 0;
    const isLast = index === players.length - 1;
    const cellClass = `pl-cell pl-count ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
    html += `<div class="${cellClass}">${homeAwayCount[player].away}</div>`;
  });
  html += '</div>';
  html += '</div>';

  html += '<div class="pl-row">';
  html += '<div class="pl-descs">';
  html += `<div class="pl-tot">${totalHeader}:</div>`;
  html += '</div>';
  html += '<div class="pl-cells">';
  players.forEach((player, index) => {
    const isFirst = index === 0;
    const isLast = index === players.length - 1;
    const cellClass = `pl-cell pl-count ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
    html += `<div class="${cellClass}">${homeAwayCount[player].home + homeAwayCount[player].away}</div>`;
  });
  html += '</div>';
  html += '</div>';

  html += '</div>';
  
  return html;
}

export function generateSchedule(gameType, locations, availability, language) {
  const requiredPlayers = setRequiredPlayers(gameType);
  const maxConsecutiveGames = setMaxConsecutiveGames(gameType);
  const maxGames = setMaxGames(gameType);

  const { error, schedule, codeRuns } = createScheduleWithValidation(
    locations,
    availability,
    requiredPlayers,
    maxConsecutiveGames,
    maxGames,
    language,
    gameType // Pass gameType to createScheduleWithValidation
  );

  if (error) {
    return { error };
  }

  const players = Object.keys(availability);
  const homeAwayCount = players.reduce((acc, player) => {
    acc[player] = { home: 0, away: 0 };
    return acc;
  }, {});

  const homeLocations = locations.filter((loc) => loc.startsWith("THUIS"));
  locations.forEach((loc) => {
    schedule[loc].forEach((player) => {
      homeAwayCount[player][homeLocations.includes(loc) ? "home" : "away"]++;
    });
  });

  return { schedule, codeRuns };
}

function setRequiredPlayers(gameType) {
  if (gameType === "duo") return 2;
  if (gameType === "trio") return 3;
  if (gameType === "squad" || gameType === "beker") return 4;
  throw new Error("Invalid game type.");
}

function setMaxConsecutiveGames(gameType) {
  if (gameType === "duo") return 3;
  if (gameType === "trio") return 4;
  if (gameType === "squad") return 7;
  if (gameType === "beker") return 2;
  throw new Error("Invalid game type.");
}

function setMaxGames(gameType) {
  if (gameType === "duo") return 5;
  if (gameType === "trio") return 7;
  if (gameType === "squad") return 9;
  if (gameType === "beker") return 5;
  throw new Error("Invalid game type.");
}

// --- Nieuwe helper functies om pair-coverage af te dwingen ---

function allPairsFromPlayers(players) {
  const res = new Set();
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      res.add(JSON.stringify([players[i], players[j]].sort()));
    }
  }
  return res;
}

function computeCoveredPairsFromSchedule(schedule) {
  const covered = new Set();
  Object.values(schedule).forEach((team) => {
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        covered.add(JSON.stringify([team[i], team[j]].sort()));
      }
    }
  });
  return covered;
}

function computePlayerStatsFromSchedule(schedule, locations) {
  // returns { matches: {player:count}, consecutive: {player: max consecutive seen in schedule order} }
  const players = {};
  Object.values(schedule).forEach((team) => team.forEach((p) => (players[p] = true)));
  const matches = {};
  const consecutive = {};
  Object.keys(players).forEach((p) => {
    matches[p] = 0;
    consecutive[p] = 0;
  });

  // matches
  Object.values(schedule).forEach((team) => team.forEach((p) => matches[p++]));

  // compute max consecutive occurrences across ordered locations
  const order = Object.keys(schedule); // relies on insertion order being locations array order
  const currentConsec = Object.keys(players).reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
  order.forEach((loc) => {
    const team = schedule[loc];
    Object.keys(currentConsec).forEach((p) => {
      if (team.includes(p)) {
        currentConsec[p]++;
        consecutive[p] = Math.max(consecutive[p], currentConsec[p]);
      } else {
        currentConsec[p] = 0;
      }
    });
  });

  return { matches, consecutive };
}

function enforcePairCoverage(schedule, locations, availability, requiredPlayers, maxConsecutiveGames, maxGames, language) {
  const players = Object.keys(availability);
  const target = allPairsFromPlayers(players);
  let covered = computeCoveredPairsFromSchedule(schedule);

  if ([...target].every((p) => covered.has(p))) {
    return { success: true, schedule };
  }

  const MAX_SWAP_ITER = 5000;
  let iter = 0;

  while (iter < MAX_SWAP_ITER) {
    iter++;
    covered = computeCoveredPairsFromSchedule(schedule);
    const missingPairs = [...target].filter((p) => !covered.has(p)).map((p) => JSON.parse(p));

    if (missingPairs.length === 0) return { success: true, schedule };

    // pick a missing pair to try to force together
    const [a, b] = missingPairs[Math.floor(Math.random() * missingPairs.length)];

    // find locations where a plays and b plays
    const locsA = locations.filter((loc) => schedule[loc].includes(a));
    const locsB = locations.filter((loc) => schedule[loc].includes(b));

    let didSwap = false;
    // Try to move b into one of locA (or a into one of locB) by swapping with a compatible teammate
    for (const locA of locsA) {
      if (!availability[b][locations.indexOf(locA)]) continue; // b must be available at locA
      const teamA = schedule[locA];

      // candidate x in teamA to swap out (x must be available at some locB where b currently plays)
      for (const x of teamA) {
        if (x === a) continue; // don't swap out a
        for (const locB of locsB) {
          if (locB === locA) continue;
          // ensure x is available at locB and b is in teamB
          if (!availability[x][locations.indexOf(locB)]) continue;
          const teamB = schedule[locB];
          if (!teamB.includes(b)) continue;

          // perform tentative swap: x <-> b (x moves to locB, b moves to locA)
          // validate consecutive and maxGames constraints after swap
          // make swap
          const idxA = schedule[locA].indexOf(x);
          const idxB = schedule[locB].indexOf(b);
          const originalTeamA = [...schedule[locA]];
          const originalTeamB = [...schedule[locB]];
          schedule[locA][idxA] = b;
          schedule[locB][idxB] = x;

          // compute stats to validate swap
          const { matches, consecutive } = computePlayerStatsFromSchedule(schedule, locations);

          // check maxGames and maxConsecutiveGames constraints
          const violates =
            matches[x] > maxGames ||
            matches[b] > maxGames ||
            consecutive[x] > maxConsecutiveGames ||
            consecutive[b] > maxConsecutiveGames;

          if (violates) {
            // revert
            schedule[locA] = originalTeamA;
            schedule[locB] = originalTeamB;
            continue;
          }

          // also ensure availability still holds (should, by checks above)
          if (!availability[b][locations.indexOf(locA)] || !availability[x][locations.indexOf(locB)]) {
            schedule[locA] = originalTeamA;
            schedule[locB] = originalTeamB;
            continue;
          }

          // successful swap
          didSwap = true;
          break;
        }
        if (didSwap) break;
      }
      if (didSwap) break;
    }

    if (!didSwap) {
      // try symmetric: move a into locB by swapping with someone there
      for (const locB of locsB) {
        if (!availability[a][locations.indexOf(locB)]) continue;
        const teamB = schedule[locB];
        for (const x of teamB) {
          if (x === b) continue;
          for (const locA of locsA) {
            if (locA === locB) continue;
            if (!availability[x][locations.indexOf(locA)]) continue;
            // perform swap x <-> a (x to locA, a to locB)
            const idxB = schedule[locB].indexOf(x);
            const idxA = schedule[locA].indexOf(a);
            const originalTeamA = [...schedule[locA]];
            const originalTeamB = [...schedule[locB]];
            schedule[locB][idxB] = a;
            schedule[locA][idxA] = x;

            const { matches, consecutive } = computePlayerStatsFromSchedule(schedule, locations);
            const violates =
              matches[x] > maxGames ||
              matches[a] > maxGames ||
              consecutive[x] > maxConsecutiveGames ||
              consecutive[a] > maxConsecutiveGames;

            if (violates || !availability[a][locations.indexOf(locB)] || !availability[x][locations.indexOf(locA)]) {
              schedule[locA] = originalTeamA;
              schedule[locB] = originalTeamB;
              continue;
            }

            didSwap = true;
            break;
          }
          if (didSwap) break;
        }
        if (didSwap) break;
      }
    }

    // if no swap found this iteration, continue; random missingPair selection may find another opportunity
  }

  // After attempts, check remaining missing pairs
  const finalCovered = computeCoveredPairsFromSchedule(schedule);
  const finalMissing = [...target].filter((p) => !finalCovered.has(p));
  if (finalMissing.length === 0) return { success: true, schedule };
  return { success: false, schedule };
}
