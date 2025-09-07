import { useState } from 'react';
import './GameSchedule.scss';
import translations from '../Translation/Translations';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import StyledSelect from '../components/StyledSelect/StyledSelect';
import AnimatedButton from '../components/AnimatedButton/AnimatedButton';
import { createScheduleWithValidation, createScheduleWithValidationAsync, printSchedule } from './ScheduleGenerator';
import { FaGamepad, FaListOl, FaHome } from 'react-icons/fa';

function GameSchedule({ onBackToHome }) {
  const { language } = useLanguage();
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
          <div className="game-schedule__header-content">
            <div className="game-schedule__back-button">
              <AnimatedButton 
                color="gray"
                onClick={onBackToHome}
              >
                <FaHome />
                {" " + translations[language].backToHome}
              </AnimatedButton>
            </div>
            <div className="game-schedule__title-section">
              <h1>{translations[language].gameScheduleGenerator}</h1>
              <p>{translations[language].gameScheduleDescription}</p>
            </div>
            
            <div className="game-schedule__language-selector">
              <LanguageSelector variant="GameSchedule" />
            </div>
          </div>
        </div>

        <div className="game-schedule__section">
          <h2 className="game-schedule__section-title">{translations[language].configuration}</h2>
          <div className="options">
            <div className="options__group">
              <StyledSelect
                label={translations[language].selectGameType}
                value={{ value: gameType, label: translations[language][`gameType${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`] }}
                onChange={(selectedOption) => handleGameTypeChange(selectedOption.value)}
                icon={FaGamepad}
                variant="GameSchedule"
                options={[
                  { value: 'duo', label: translations[language].gameTypeDuo },
                  { value: 'trio', label: translations[language].gameTypeTrio },
                  { value: 'squad', label: translations[language].gameTypeSquad },
                  { value: 'beker', label: translations[language].gameTypeBeker }
                ]}
              />
            </div>
            <div className="options__group">
              <StyledSelect
                label={translations[language].maxConsecutiveGames}
                value={{ value: maxConsecutiveGames, label: maxConsecutiveGames.toString() }}
                onChange={(selectedOption) => setMaxConsecutiveGames(Number(selectedOption.value))}
                icon={FaListOl}
                variant="GameSchedule"
                options={Array.from({ length: 10 }, (_, i) => ({ 
                  value: i + 1, 
                  label: (i + 1).toString() 
                }))}
              />
            </div>
            <div className="options__group">
              <StyledSelect
                label={translations[language].maxGames}
                value={{ value: maxGames, label: maxGames.toString() }}
                onChange={(selectedOption) => setMaxGames(Number(selectedOption.value))}
                icon={FaListOl}
                variant="GameSchedule"
                options={Array.from({ length: 10 }, (_, i) => ({ 
                  value: i + 1, 
                  label: (i + 1).toString() 
                }))}
              />
            </div>
          </div>
        </div>

        <div className="game-schedule__section grid-header">
          <h2 className="game-schedule__section-title">{translations[language].playersAndLocations}</h2>

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

          <div className="grid-actions">
            <AnimatedButton onClick={handleAddLocation} color="blue">
              {translations[language].addLocation}
            </AnimatedButton>
            <AnimatedButton onClick={handleAddPlayer} color="blue">
              {translations[language].addPlayer}
            </AnimatedButton>
            <AnimatedButton onClick={handleResetAvailability} color="orange">
              {translations[language].resetAvailability}
            </AnimatedButton>
            <AnimatedButton onClick={handleGenerateSchedule} color="green" disabled={isGenerating}>
              {isGenerating ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  {translations[language].generating}
                </span>
              ) : (
                translations[language].generateSchedule
              )}
            </AnimatedButton>
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
          <div className="game-schedule__section generated-schedule">
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
        )}
      </div>
    </div>
  );
}

export default GameSchedule;
