import React, { useState } from 'react';
import './GameSchedule.scss';
import translations from './translations';
import { createScheduleWithValidation, printSchedule } from './scheduleGenerator';

function GameSchedule() {
  const [language, setLanguage] = useState('nl');
  const [gameType, setGameType] = useState('duo');
  const [maxConsecutiveGames, setMaxConsecutiveGames] = useState(3);
  const [maxGames, setMaxGames] = useState(5);
  const [requiredPlayers, setrequiredPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      location: i % 2 === 0 ? `UIT${Math.floor(i / 2) + 1}` : `THUIS${Math.floor(i / 2) + 1}`,
      players: Array(playerNames.length).fill(true),
    }))
  );
  const [generatedSchedule, setGeneratedSchedule] = useState("");

  const handleaddLocation = () => {
    setRows([...rows, { location: '', players: Array(playerNames.length).fill(true) }]);
  };

  const handleAddPlayer = () => {
    setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    setRows(rows.map(row => ({ ...row, players: [...row.players, true] })));
  };

  const handleRemovePlayer = (index) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
    setRows(rows.map(row => ({
      ...row,
      players: row.players.filter((_, i) => i !== index),
    })));
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleLocationChange = (index, value) => {
    const updatedRows = [...rows];
    updatedRows[index].location = value;
    setRows(updatedRows);
  };

  const handlePlayerAvailability = (rowIndex, playerIndex) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex].players[playerIndex] = !updatedRows[rowIndex].players[playerIndex];
    setRows(updatedRows);
  };

  const handlePlayerNameChange = (index, value) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = value;
    setPlayerNames(updatedNames);
  };

  const handleGameTypeChange = (value) => {
    setGameType(value);
    if (value === "duo") {
      setMaxConsecutiveGames(3);
      setMaxGames(5);
      setrequiredPlayers(2);
      if (rows.length < 10) {
        setRows([
          ...rows,
          ...Array.from({ length: 10 - rows.length }, (_, i) => ({
            location: `UIT${Math.floor((rows.length + i) / 2) + 1}`,
            players: Array(playerNames.length).fill(true),
          })),
        ]);
      }
    } else if (value === "trio") {
      setMaxConsecutiveGames(4);
      setMaxGames(7);
      setrequiredPlayers(3);
      if (rows.length < 10) {
        setRows([
          ...rows,
          ...Array.from({ length: 10 - rows.length }, (_, i) => ({
            location: `UIT${Math.floor((rows.length + i) / 2) + 1}`,
            players: Array(playerNames.length).fill(true),
          })),
        ]);
      }
    } else if (value === "squad") {
      setMaxConsecutiveGames(7);
      setMaxGames(9);
      setrequiredPlayers(4);
      if (rows.length < 10) {
        setRows([
          ...rows,
          ...Array.from({ length: 10 - rows.length }, (_, i) => ({
            location: `UIT${Math.floor((rows.length + i) / 2) + 1}`,
            players: Array(playerNames.length).fill(true),
          })),
        ]);
      }
    } else if (value === "beker") {
      setMaxConsecutiveGames(2);
      setMaxGames(5);
      setrequiredPlayers(4);
      setRows(rows.slice(0, 3));
    }
    if (value !== "beker") {
      setRows((prevRows) =>
        prevRows.map((row, i) => ({
          ...row,
          location: i % 2 === 0 ? `UIT${Math.floor(i / 2) + 1}` : `THUIS${Math.floor(i / 2) + 1}`,
        }))
      );
    }
  };

  const handleGenerateSchedule = () => {
    const availability = playerNames.reduce((acc, player, index) => {
      acc[player] = rows.map((row) => row.players[index]);
      return acc;
    }, {});

    const { schedule, codeRuns, error } = createScheduleWithValidation(
      rows.map((row) => row.location),
      availability,
      requiredPlayers,
      maxConsecutiveGames,
      maxGames,
      language,
      gameType // Pass gameType to createScheduleWithValidation
    );

    if (error) {
      setGeneratedSchedule(error);
      return;
    }

    const players = Object.keys(availability);
    const homeAwayCount = players.reduce((acc, player) => {
      acc[player] = { home: 0, away: 0 };
      return acc;
    }, {});

    rows.map((row) => row.location).forEach((loc) => {
      schedule[loc].forEach((player) => {
        homeAwayCount[player][loc.startsWith("THUIS") ? "home" : "away"]++;
      });
    });

    const formattedSchedule = printSchedule(schedule, players, homeAwayCount, language);
    setGeneratedSchedule(`${formattedSchedule}\n${translations[language].recalculations}: ${codeRuns}`);
  };

  return (
    <>
      <div className="options">
        <div>
          <label>
            {translations[language].selectLanguage}
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="nl">nl</option>
              <option value="en">en</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            {translations[language].selectGameType}
            <select value={gameType} onChange={(e) => handleGameTypeChange(e.target.value)}>
              <option value="duo">duo</option>
              <option value="trio">trio</option>
              <option value="squad">squad</option>
              <option value="beker">beker</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            {translations[language].maxConsecutiveGames}
            <select value={maxConsecutiveGames} onChange={(e) => setMaxConsecutiveGames(Number(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            {translations[language].maxGames}
            <select value={maxGames} onChange={(e) => setMaxGames(Number(e.target.value))}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="grid-header">
        <span>{translations[language].location}</span>
        <span></span>
        <span>{translations[language].players}</span>
        {playerNames.map((name, index) => (
          <div key={index} className="player-column">
            <input
              type="text"
              value={name}
              onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              placeholder={`Player ${index + 1}`}
            />
            <button onClick={() => handleRemovePlayer(index)}>
              {translations[language].remove}
            </button>
          </div>
        ))}
      </div>
      <div className="grid">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            <button onClick={() => handleRemoveRow(rowIndex)}>
              {translations[language].remove}
            </button>
            <input
              type="text"
              placeholder={translations[language].location.slice(0, -2)}
              value={row.location}
              onChange={(e) => handleLocationChange(rowIndex, e.target.value)}
            />
            {row.players.map((available, playerIndex) => (
              <button
                key={playerIndex}
                className={available ? 'available' : 'unavailable'}
                onClick={() => handlePlayerAvailability(rowIndex, playerIndex)}
              >
                {available
                  ? translations[language].available
                  : translations[language].unavailable}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="grid-actions">
        <button onClick={handleaddLocation}>{translations[language].addLocation}</button>
        <button onClick={handleAddPlayer}>{translations[language].addPlayer}</button>
        <button onClick={handleGenerateSchedule}>{translations[language].generateSchedule}</button>
      </div>
      {generatedSchedule && (
        <div className="generated-schedule">
          {!generatedSchedule.includes(translations[language].errorLocationsUnique) &&
          !generatedSchedule.includes(translations[language].errorLocationsThuis) &&
          !generatedSchedule.includes(translations[language].errorAvailabilityLength.split("{player}")[0]) &&
          !generatedSchedule.includes(translations[language].errorUnableToGenerateSchedule.split("{reason}")[0]) &&
          !generatedSchedule.includes(translations[language].errorNotEnoughPlayers.split("{location}")[0]) ? (
            <h3>{translations[language].scheduleGenerated}</h3>
          ) : (
            <h3>{translations[language].scheduleError}</h3>
          )}
          <pre>{generatedSchedule}</pre>
        </div>
      )}
    </>
  );
}

export default GameSchedule;
