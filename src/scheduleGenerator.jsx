import translations from './translations'; // Import translations

export const MAX_CODE_RUNS = 2000;

export function createSchedule(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames) {
  let codeRuns = 0;
  const homeLocations = locations.filter((loc) => loc.startsWith("THUIS"));

  while (codeRuns < MAX_CODE_RUNS) {
    const schedule = {};
    const playerMatches = {};
    const homeAwayCount = {};
    const consecutiveGames = {};

    locations.forEach((loc) => (schedule[loc] = []));
    Object.keys(availability).forEach((player) => {
      playerMatches[player] = 0;
      homeAwayCount[player] = { home: 0, away: 0 };
      consecutiveGames[player] = 0;
    });

    try {
      for (const loc of locations) {
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
          throw new Error(`Not enough players available for location: ${loc}`);
        }

        const selectedPlayers = selectPlayers(
          loc,
          availablePlayers,
          homeAwayCount,
          homeLocations,
          requiredPlayers,
          maxConsecutiveGames
        );

        if (selectedPlayers.length < requiredPlayers) {
          throw new Error(`Unable to select enough players for location: ${loc}`);
        }

        selectedPlayers.forEach((player) => {
          homeAwayCount[player][loc.startsWith("THUIS") ? "home" : "away"]++;
          playerMatches[player]++;
          consecutiveGames[player]++;
        });

        schedule[loc] = selectedPlayers;
        resetConsecutiveGames(availability, selectedPlayers, consecutiveGames);
      }

      return { schedule, codeRuns };
    } catch (error) {
      codeRuns++;
      continue;
    }
  }

  throw new Error("Unable to generate schedule after maximum retries.");
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
    validateLocations(locations, language, gameType) || // Pass gameType to validateLocations
    validateAvailability(locations, availability, language) ||
    checkAvailablePlayersForLocation(locations, availability, requiredPlayers, language);

  if (validationError) {
    return { error: validationError };
  }

  try {
    const { schedule, codeRuns } = createSchedule(locations, availability, requiredPlayers, maxConsecutiveGames, maxGames);
    return { schedule, codeRuns };
  } catch (error) {
    return { error: translations[language].errorUnableToGenerateSchedule.replace("{reason}", error.message) };
  }
}

export function printSchedule(schedule, players, homeAwayCount, language) {
  const locationHeader = translations[language]?.location || "Location";
  const homeHeader = translations[language]?.home || "Home";
  const awayHeader = translations[language]?.away || "Away";
  const totalHeader = translations[language]?.total || "Total";

  const header = locationHeader.padEnd(15) + players.map((p) => p.padEnd(10)).join("");
  const separator = "-".repeat(header.length);

  let output = `${separator}\n${header}\n${separator}\n`;

  Object.entries(schedule).forEach(([location, locPlayers]) => {
    const row = location.padEnd(15) + players.map((p) => (locPlayers.includes(p) ? "X".padEnd(10) : "".padEnd(10))).join("");
    output += `${row}\n`;
  });

  output += `${separator}\n`;
  output += homeHeader.padEnd(15) + players.map((p) => homeAwayCount[p].home.toString().padEnd(10)).join("") + `\n`;
  output += awayHeader.padEnd(15) + players.map((p) => homeAwayCount[p].away.toString().padEnd(10)).join("") + `\n`;
  output += totalHeader.padEnd(15) + players.map((p) => (homeAwayCount[p].home + homeAwayCount[p].away).toString().padEnd(10)).join("") + `\n`;
  output += `${separator}\n`;

  return output;
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

  return { schedule: printSchedule(schedule, players, homeAwayCount, language), codeRuns };
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
