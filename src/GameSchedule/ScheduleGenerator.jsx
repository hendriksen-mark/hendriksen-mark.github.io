import translations from '../Translation/Translations'; // Import translations

export const MAX_CODE_RUNS = 2000;

export function createSchedule(
  locations,
  availability,
  requiredPlayers,
  maxConsecutiveGames,
  maxGames,
  language,
) {
  const t = translations[language] || translations.en;
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

    try {
      locations.forEach((loc) => {
        const availablePlayers = getAvailablePlayers(
          loc,
          availability,
          playerMatches,
          consecutiveGames,
          maxGames,
          maxConsecutiveGames,
          locations,
        );

        if (availablePlayers.length < requiredPlayers) {
          throw new Error(t.errorNotEnoughPlayers.replace('{location}', loc));
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
    } catch {
      if (codeRuns >= MAX_CODE_RUNS) {
        throw new Error(t.errorMaxRetriesReached);
      }
    }
  }

  throw new Error(t.errorMaxRetriesReached);
}

export async function createScheduleAsync(
  locations,
  availability,
  requiredPlayers,
  maxConsecutiveGames,
  maxGames,
  language,
  onProgress,
) {
  const t = translations[language] || translations.en;
  const schedule = {};
  let codeRuns = 0;

  while (codeRuns < MAX_CODE_RUNS) {
    codeRuns++;

    // Update progress every 10 iterations to avoid too many updates
    if (codeRuns % 10 === 0 && onProgress) {
      onProgress(codeRuns);
      // Yield control to allow UI updates
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const playerMatches = {};
    const consecutiveGames = {};
    Object.keys(availability).forEach((player) => {
      playerMatches[player] = 0;
      consecutiveGames[player] = 0;
    });

    try {
      locations.forEach((loc) => {
        const availablePlayers = getAvailablePlayers(
          loc,
          availability,
          playerMatches,
          consecutiveGames,
          maxGames,
          maxConsecutiveGames,
          locations,
        );

        if (availablePlayers.length < requiredPlayers) {
          throw new Error(t.errorNotEnoughPlayers.replace('{location}', loc));
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
    } catch {
      if (codeRuns >= MAX_CODE_RUNS) {
        throw new Error(t.errorMaxRetriesReached);
      }
    }
  }

  throw new Error(t.errorMaxRetriesReached);
}

function getAvailablePlayers(
  loc,
  availability,
  playerMatches,
  consecutiveGames,
  maxGames,
  maxConsecutiveGames,
  locations,
) {
  return Object.keys(availability).filter(
    (player) =>
      availability[player][locations.indexOf(loc)] &&
      playerMatches[player] < maxGames &&
      consecutiveGames[player] < maxConsecutiveGames,
  );
}

export function validateLocations(locations, language, gameType) {
  const t = translations[language] || translations.en;
  const uniqueLocations = new Set(locations);
  if (uniqueLocations.size !== locations.length) {
    return t.errorLocationsUnique;
  }

  if (gameType !== 'beker') {
    // Skip validation for "beker"
    const homeCount = locations.filter((loc) => loc.includes('THUIS')).length;
    if (homeCount < locations.length / 2) {
      return t.errorLocationsThuis;
    }
  }

  return null;
}

export function validateAvailability(locations, availability, language) {
  const t = translations[language] || translations.en;
  for (const [player, avail] of Object.entries(availability)) {
    if (avail.length !== locations.length) {
      return t.errorAvailabilityLength.replace('{player}', player);
    }
  }
  return null;
}

function checkAvailablePlayersForLocation(
  locations,
  availability,
  requiredPlayers,
  language,
) {
  const t = translations[language] || translations.en;
  for (const loc of locations) {
    const availablePlayers = Object.keys(availability).filter(
      (player) => availability[player][locations.indexOf(loc)],
    );
    if (availablePlayers.length < requiredPlayers) {
      return t.errorNotEnoughPlayers.replace('{location}', loc);
    }
  }
  return null;
}

export function createScheduleWithValidation(
  locations,
  availability,
  requiredPlayers,
  maxConsecutiveGames,
  maxGames,
  language,
  gameType,
) {
  const t = translations[language] || translations.en;
  const validationError =
    validateLocations(locations, language, gameType) ||
    validateAvailability(locations, availability, language) ||
    checkAvailablePlayersForLocation(
      locations,
      availability,
      requiredPlayers,
      language,
    );

  if (validationError) {
    return { error: validationError };
  }

  try {
    const { schedule, codeRuns } = createSchedule(
      locations,
      availability,
      requiredPlayers,
      maxConsecutiveGames,
      maxGames,
      language,
    );
    return { schedule, codeRuns };
  } catch (error) {
    return {
      error: t.errorUnableToGenerateSchedule.replace('{reason}', error.message),
    };
  }
}

export async function createScheduleWithValidationAsync(
  locations,
  availability,
  requiredPlayers,
  maxConsecutiveGames,
  maxGames,
  language,
  gameType,
  onProgress,
) {
  const t = translations[language] || translations.en;
  const validationError =
    validateLocations(locations, language, gameType) ||
    validateAvailability(locations, availability, language) ||
    checkAvailablePlayersForLocation(
      locations,
      availability,
      requiredPlayers,
      language,
    );

  if (validationError) {
    return { error: validationError };
  }

  try {
    const { schedule, codeRuns } = await createScheduleAsync(
      locations,
      availability,
      requiredPlayers,
      maxConsecutiveGames,
      maxGames,
      language,
      onProgress,
    );
    return { schedule, codeRuns };
  } catch (error) {
    return {
      error: t.errorUnableToGenerateSchedule.replace('{reason}', error.message),
    };
  }
}

export function printSchedule(
  schedule,
  players,
  homeAwayCount,
  language,
  availability = null,
) {
  const t = translations[language] || translations.en;
  const homeHeader = t.home;
  const awayHeader = t.away;
  const totalHeader = t.total;

  // Create HTML table
  let html = '<div class="ttapp-schedule">';

  // Header row with player names
  html += '<div class="pl-header">';
  html += '<div class="pl-descs"></div>';
  html += '<div class="pl-cells">';
  players.forEach((player, index) => {
    const isFirst = index === 0;
    const isLast = index === players.length - 1;
    const cellClass =
      `pl-cell pl-playername ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
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
        if (
          availability &&
          availability[player] &&
          typeof availability[player][locationIndex] === 'boolean'
        ) {
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
    const cellClass =
      `pl-cell pl-count ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
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
    const cellClass =
      `pl-cell pl-count ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
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
    const cellClass =
      `pl-cell pl-count ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`.trim();
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
    gameType, // Pass gameType to createScheduleWithValidation
  );

  if (error) {
    return { error };
  }

  const players = Object.keys(availability);
  const homeAwayCount = players.reduce((acc, player) => {
    acc[player] = { home: 0, away: 0 };
    return acc;
  }, {});

  const homeLocations = locations.filter((loc) => loc.includes('THUIS'));
  locations.forEach((loc) => {
    schedule[loc].forEach((player) => {
      homeAwayCount[player][homeLocations.includes(loc) ? 'home' : 'away']++;
    });
  });

  return { schedule, codeRuns };
}

function setRequiredPlayers(gameType) {
  if (gameType === 'duo') return 2;
  if (gameType === 'trio') return 3;
  if (gameType === 'squad' || gameType === 'beker') return 4;
  throw new Error('Invalid game type.');
}

function setMaxConsecutiveGames(gameType) {
  if (gameType === 'duo') return 3;
  if (gameType === 'trio') return 4;
  if (gameType === 'squad') return 7;
  if (gameType === 'beker') return 2;
  throw new Error('Invalid game type.');
}

function setMaxGames(gameType) {
  if (gameType === 'duo') return 5;
  if (gameType === 'trio') return 7;
  if (gameType === 'squad') return 9;
  if (gameType === 'beker') return 5;
  throw new Error('Invalid game type.');
}
