import { useState, useRef } from 'react';
import './GameSchedule.scss';
import translations from '../Translation/Translations';
import { useLanguage } from '../contexts/LanguageContext';
import StyledSelect from '../components/StyledSelect/StyledSelect';
import StyledInput from '../components/StyledInput/StyledInput';
import AnimatedButton from '../components/AnimatedButton/AnimatedButton';
import PageHeader from '../components/PageHeader/PageHeader';
import PageContainer from '../components/PageContainer/PageContainer';
import PageSection from '../components/PageSection/PageSection';
import { createScheduleWithValidation, createScheduleWithValidationAsync, printSchedule } from './ScheduleGenerator';
import { FaCalendarAlt, FaGamepad, FaListOl, FaDownload, FaUpload } from 'react-icons/fa';
import { toast } from "react-hot-toast";
import html2canvas from 'html2canvas';

function GameSchedule({ onBackToHome }) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
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
  const fileInputRef = useRef(null);
  const scheduleRef = useRef(null);

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
      const codeRunsText = `${t.recalculations}: ${codeRuns}`;

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

  const handleDownloadImage = () => {
    if (scheduleRef.current) {
      html2canvas(scheduleRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = 'game-schedule.jpg';
        link.href = canvas.toDataURL("image/jpeg");
        link.click();
      });
    }
  };

  const exportConfiguration = () => {
    const config = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      gameType,
      maxConsecutiveGames,
      maxGames,
      requiredPlayers,
      playerNames,
      rows
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `game-schedule-config-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfiguration = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);

        // Validate required fields
        if (!config.gameType || !config.playerNames || !config.rows) {
          toast.error(t.invalidConfigurationFile);
          return;
        }

        // Apply the configuration
        setGameType(config.gameType);
        setMaxConsecutiveGames(config.maxConsecutiveGames || 3);
        setMaxGames(config.maxGames || 5);
        setRequiredPlayers(config.requiredPlayers || 2);
        setPlayerNames(config.playerNames);
        setRows(config.rows);

        // Reset the file input
        event.target.value = '';

        setTimeout(() => {
          toast.success(t.configurationImported);
        }, 100);

      } catch (error) {
        toast.error(t.invalidConfigurationFile);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <PageContainer className="game-schedule">
        <PageHeader
          onBackToHome={onBackToHome}
          title={<><FaCalendarAlt /> {t.gameScheduleGenerator}</>}
          description={t.gameScheduleDescription}
          languageSelectorVariant="game-schedule"
        />

        <PageSection title={t.configuration} variant="game-schedule">
          <div className="game-schedule__inputs">
              <StyledSelect
                label={t.selectGameType}
                value={{ value: gameType, label: t[`gameType${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`] }}
                onChange={(selectedOption) => handleGameTypeChange(selectedOption.value)}
                icon={FaGamepad}
                variant="game-schedule"
                options={[
                  { value: 'duo', label: t.gameTypeDuo },
                  { value: 'trio', label: t.gameTypeTrio },
                  { value: 'squad', label: t.gameTypeSquad },
                  { value: 'beker', label: t.gameTypeBeker }
                ]}
              />
              <StyledSelect
                label={t.maxConsecutiveGames}
                value={{ value: maxConsecutiveGames, label: maxConsecutiveGames.toString() }}
                onChange={(selectedOption) => setMaxConsecutiveGames(Number(selectedOption.value))}
                icon={FaListOl}
                variant="game-schedule"
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: i + 1,
                  label: (i + 1).toString()
                }))}
              />
              <StyledSelect
                label={t.maxGames}
                value={{ value: maxGames, label: maxGames.toString() }}
                onChange={(selectedOption) => setMaxGames(Number(selectedOption.value))}
                icon={FaListOl}
                variant="game-schedule"
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: i + 1,
                  label: (i + 1).toString()
                }))}
              />
          </div>

          <div className="import-export-actions">
            <AnimatedButton
              onClick={exportConfiguration}
              color="blue"
              title={t.exportTooltip}
            >
              <FaDownload />
              {" " + t.exportConfiguration}
            </AnimatedButton>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importConfiguration}
              style={{ display: 'none' }}
            />
            <AnimatedButton
              onClick={triggerFileInput}
              color="green"
              title={t.importTooltip}
            >
              <FaUpload />
              {" " + t.importConfiguration}
            </AnimatedButton>
          </div>
        </PageSection>

        <PageSection title={t.playersAndLocations} variant="game-schedule" className="grid-header">
          <div className="grid-header__labels">
            <span></span>
            <span></span>
            <span>{t.players}</span>
          </div>
          <div className="grid-header__players">
            <div></div>
            <div className="location-label-wrapper">
              <span className="location-label">{t.location}</span>
            </div>
            {playerNames.map((name, index) => (
              <div key={index} className="player-column">
                <StyledInput
                  bare
                  variant="game-schedule"
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  style={{ textAlign: 'center' }}
                />
                <button onClick={() => handleRemovePlayer(index)}>
                  {t.remove}
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
                  {t.remove}
                </button>
                <StyledInput
                  bare
                  variant="game-schedule"
                  id={`location-${rowIndex}`}
                  className="location-input"
                  type="text"
                  placeholder={t.location.slice(0, -2)}
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
                      ? t.available
                      : t.unavailable}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="grid-actions">
            <AnimatedButton onClick={handleAddLocation} color="blue">
              {t.addLocation}
            </AnimatedButton>
            <AnimatedButton onClick={handleAddPlayer} color="blue">
              {t.addPlayer}
            </AnimatedButton>
            <AnimatedButton onClick={handleResetAvailability} color="orange">
              {t.resetAvailability}
            </AnimatedButton>
            <AnimatedButton onClick={handleGenerateSchedule} color="green" disabled={isGenerating}>
              {isGenerating ? (
                <span className="loading-content">
                  <span className="spinner"></span>
                  {t.generating}
                </span>
              ) : (
                t.generateSchedule
              )}
            </AnimatedButton>
          </div>

          {isGenerating && (
            <div className="loading-progress">
              <div className="progress-info">
                <span className="spinner"></span>
                <span>{t.calculatingSchedule}</span>
                <span className="calculation-count">
                  {t.calculations}: {currentCalculations}
                </span>
              </div>
            </div>
          )}
        </PageSection>

        {generatedSchedule && (
          <PageSection className="generated-schedule">
            <h3 className={
              generatedSchedule.startsWith('<div class="ttapp-schedule">') || generatedSchedule.includes('<div class="ttapp-schedule">')
                ? 'success'
                : 'error'
            }>
              {generatedSchedule.startsWith('<div class="ttapp-schedule">') || generatedSchedule.includes('<div class="ttapp-schedule">') ? (
                t.scheduleGenerated
              ) : (
                t.scheduleError
              )}
            </h3>
            {generatedSchedule.includes('<!--SEPARATOR-->') ? (
              <div>
                <div dangerouslySetInnerHTML={{ __html: generatedSchedule.split('<!--SEPARATOR-->')[0] }} ref={scheduleRef} />
                <div className="code-runs-info">
                  {generatedSchedule.split('<!--SEPARATOR-->')[1]}
                </div>
              </div>
            ) : generatedSchedule.startsWith('<div class="ttapp-schedule">') ? (
              <div dangerouslySetInnerHTML={{ __html: generatedSchedule }} ref={scheduleRef} />
            ) : (
              <pre>{generatedSchedule}</pre>
            )}
            <div className="generated-actions">
              <AnimatedButton onClick={handleDownloadImage} color="blue">
                <FaDownload /> {t.downloadAsImage}
              </AnimatedButton>
            </div>
          </PageSection>
        )}
    </PageContainer>
  );
}

export default GameSchedule;
