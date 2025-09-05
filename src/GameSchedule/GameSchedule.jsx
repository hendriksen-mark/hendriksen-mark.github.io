import { useState } from 'react';
import './GameSchedule.scss';
import translations from '../Translation/Translations.jsx';
import { createScheduleWithValidation, createScheduleWithValidationAsync, printSchedule } from './ScheduleGenerator.jsx';

function GameSchedule() {
  const [language, setLanguage] = useState('nl');
  const [gameType, setGameType] = useState('duo');
  const [maxConsecutiveGames, setMaxConsecutiveGames] = useState(3);
  const [maxGames, setMaxGames] = useState(5);
  const [requiredPlayers, setRequiredPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      location: i % 2 === 0 ? `UIT${Math.floor(i / 2) + 1}` : `THUIS${Math.floor(i / 2) + 1}`,
      players: Array(playerNames.length).fill(true),
    }))
  );
  const [generatedSchedule, setGeneratedSchedule] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCalculations, setCurrentCalculations] = useState(0);

  const handleAddLocation = () => {
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
    updatedRows[index].location = value.toUpperCase(); // Capitalize the value
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
      setRequiredPlayers(2);
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
      setRequiredPlayers(3);
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
      setRequiredPlayers(4);
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
      setRequiredPlayers(4);
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

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setCurrentCalculations(0);
    setGeneratedSchedule("");
    
    const availability = playerNames.reduce((acc, player, index) => {
      acc[player] = rows.map((row) => row.players[index]);
      return acc;
    }, {});

    const onProgress = (calculations) => {
      setCurrentCalculations(calculations);
    };

    try {
      const result = await createScheduleWithValidationAsync(
        rows.map((row) => row.location),
        availability,
        requiredPlayers,
        maxConsecutiveGames,
        maxGames,
        language,
        gameType,
        onProgress
      );
      
      const { schedule, codeRuns, error } = result;

      if (error) {
        setGeneratedSchedule(error);
        setIsGenerating(false);
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

      const formattedSchedule = printSchedule(schedule, players, homeAwayCount, language, availability);
      const codeRunsText = `${translations[language].recalculations}: ${codeRuns}`;
      
      if (formattedSchedule.startsWith('<div class="ttapp-schedule">')) {
        setGeneratedSchedule(`${formattedSchedule}<!--SEPARATOR-->${codeRunsText}`);
      } else {
        setGeneratedSchedule(`${formattedSchedule}\n${codeRunsText}`);
      }
    } catch (error) {
      setGeneratedSchedule(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetAvailability = () => {
    setRows(prevRows => 
      prevRows.map(row => ({
        ...row,
        players: Array(playerNames.length).fill(true)
      }))
    );
  };

  return (
    <div className="game-schedule">
      <div className="game-schedule__container">
        <div className="game-schedule__header">
          <h1>{translations[language].gameScheduleGenerator}</h1>
          <p>{translations[language].gameScheduleDescription}</p>
        </div>

        <div className="game-schedule__section">
          <h2 className="game-schedule__section-title">{translations[language].configuration}</h2>
          <div className="options">
            <div className="options__group">
              <label>
                {translations[language].selectLanguage}
              </label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="options__group">
              <label>
                {translations[language].selectGameType}
              </label>
              <select value={gameType} onChange={(e) => handleGameTypeChange(e.target.value)}>
                <option value="duo">{translations[language].gameTypeDuo}</option>
                <option value="trio">{translations[language].gameTypeTrio}</option>
                <option value="squad">{translations[language].gameTypeSquad}</option>
                <option value="beker">{translations[language].gameTypeBeker}</option>
              </select>
            </div>
            <div className="options__group">
              <label>
                {translations[language].maxConsecutiveGames}
              </label>
              <select value={maxConsecutiveGames} onChange={(e) => setMaxConsecutiveGames(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="options__group">
              <label>
                {translations[language].maxGames}
              </label>
              <select value={maxGames} onChange={(e) => setMaxGames(Number(e.target.value))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="game-schedule__section">
          <h2 className="game-schedule__section-title">{translations[language].playersAndLocations}</h2>
          <div className="grid-header">
            <div className="grid-header__labels">
              <span></span>
              <span></span>
              <span>{translations[language].players}</span>
            </div>
            <div className="grid-header__players">
              <div></div>
              <div className="location-label-wrapper">
                <span className="location-label">{translations[language].location}</span>
              </div>
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
                <div key={rowIndex} className="grid__row">
                  <button
                    onClick={() => handleRemoveRow(rowIndex)}
                    className="remove-btn"
                  >
                    {translations[language].remove}
                  </button>
                  <input
                    id={`location-${rowIndex}`}
                    type="text"
                    className="location-input"
                    placeholder={translations[language].location.slice(0, -2)}
                    value={row.location}
                    onChange={(e) => handleLocationChange(rowIndex, e.target.value)}
                  />
                  {row.players.map((available, playerIndex) => (
                    <button
                      key={playerIndex}
                      className={`availability-btn ${available ? 'available' : 'unavailable'}`}
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
          </div>

          <div className="grid-actions">
            <button onClick={handleAddLocation}>{translations[language].addLocation}</button>
            <button onClick={handleAddPlayer}>{translations[language].addPlayer}</button>
            <button onClick={handleResetAvailability} className="reset">
              {translations[language].resetAvailability}
            </button>
            <button onClick={handleGenerateSchedule} className="primary" disabled={isGenerating}>
              {isGenerating ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  {translations[language].generating}
                </span>
              ) : (
                translations[language].generateSchedule
              )}
            </button>
          </div>
          
          {isGenerating && (
            <div className="loading-progress">
              <div className="progress-info">
                <span className="spinner"></span>
                <span>{translations[language].calculatingSchedule}</span>
                <span className="calculation-count">
                  {translations[language].calculations}: {currentCalculations}
                </span>
              </div>
            </div>
          )}
        </div>

        {generatedSchedule && (
          <div className="game-schedule__section">
            <div className="generated-schedule">
              <h3 className={
                generatedSchedule.startsWith('<div class="ttapp-schedule">') || generatedSchedule.includes('<div class="ttapp-schedule">')
                  ? 'success' 
                  : 'error'
              }>
                {generatedSchedule.startsWith('<div class="ttapp-schedule">') || generatedSchedule.includes('<div class="ttapp-schedule">') ? (
                  translations[language].scheduleGenerated
                ) : (
                  translations[language].scheduleError
                )}
              </h3>
              {generatedSchedule.includes('<!--SEPARATOR-->') ? (
                <div>
                  <div dangerouslySetInnerHTML={{ __html: generatedSchedule.split('<!--SEPARATOR-->')[0] }} />
                  <div className="code-runs-info">
                    {generatedSchedule.split('<!--SEPARATOR-->')[1]}
                  </div>
                </div>
              ) : generatedSchedule.startsWith('<div class="ttapp-schedule">') ? (
                <div dangerouslySetInnerHTML={{ __html: generatedSchedule }} />
              ) : (
                <pre>{generatedSchedule}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameSchedule;
