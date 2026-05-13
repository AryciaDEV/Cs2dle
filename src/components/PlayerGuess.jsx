import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { apiClient, getBrowserId } from '../api';

export default function PlayerGuess({ setScreen }) {
  const [guess, setGuess] = useState('');
  const [playerList, setPlayerList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [error, setError] = useState('');

  // STATS VE ZAMANLAYICI
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({
    totalWins: 4,
    averageGuesses: 5.1,
    currentWinstreak: 2,
    highestWinstreak: 5
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow - now;
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `-${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await apiClient.get('/Game/players');
        setPlayerList(res.data);
      } catch (err) {
        console.error("Oyuncular çekilemedi", err);
      }
    };
    fetchPlayers();
  }, []);

  const handleGuess = async (playerName) => {
    if (!playerName.trim() || isWin) return;
    try {
      setError('');
      setShowDropdown(false);
      setGuess('');
      const browserId = getBrowserId();
      const response = await apiClient.post(`/Game/guess-player?browserId=${browserId}`, `"${playerName}"`);
      
      // HATA AYIKLAMA: Backend isimlerini F12 Konsolundan kontrol et!
      console.log("OYUNCU VERİSİ GELDİ:", response.data);

      setAttempts([response.data, ...attempts]);
      if (response.data.isGuessCorrect) setIsWin(true);
    } catch (err) {
      setError("Bir hata oluştu.");
    }
  };

  const filteredPlayers = playerList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(guess.toLowerCase());
    const alreadyGuessed = attempts.some(a => a.guessedPlayerName?.toLowerCase() === p.name.toLowerCase());
    return matchesSearch && !alreadyGuessed;
  });

  return (
    <div className="game-container">
      {isWin && <Confetti recycle={false} numberOfPieces={500} />}
      
      <h2>
        GUESS THE PLAYER
        <div className="tooltip-container">
          <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div className="how-to-play-box">
            <div className="htp-title">HOW TO PLAY:</div>
            <p>Guess the daily Pro Player.</p>
            <p>Clues include Team, Country, Age, and Role.</p>
            <p>Use the arrows (⬆️⬇️) to find the exact age.</p>
          </div>
        </div>
      </h2>

      {!isWin ? (
        <div className="autocomplete-container">
          <input 
            type="text" 
            placeholder="SEARCH PLAYERS..." 
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && guess.length > 0 && (
            <ul className="dropdown-list">
              {filteredPlayers.map((player, index) => (
                <li key={index} onClick={() => handleGuess(player.name)}>
                  <img src={`/images/${player.imageUrl || player.photoUrl}`} alt={player.name} className="dropdown-icon" />
                  <span>{player.name}</span>
                </li>
              ))}
              {filteredPlayers.length === 0 && <li className="no-result">Player not found.</li>}
            </ul>
          )}
        </div>
      ) : (
        <div className="win-box">
          <h2 className="gg-text">GG!</h2>
          <div className="win-details">
            <img src={`/images/${attempts[0]?.imageUrl || attempts[0]?.photoUrl}`} alt={attempts[0]?.guessedPlayerName} className="win-image" />
            <div className="win-stats-info">
              <div className="win-name">{attempts[0]?.guessedPlayerName}</div>
              <div className="win-tries">DENEME: <span className="try-count">{attempts.length}</span></div>
            </div>
          </div>
          <button className="stats-toggle-btn" onClick={() => setShowStats(!showStats)}>
            <svg className="stats-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
            </svg>
            STATS
          </button>
          {showStats && (
            <div className="stats-panel">
              <div className="stat-item"><span className="stat-label">TOTAL<br/>WINS</span><span className="stat-value">{stats.totalWins}</span></div>
              <div className="stat-item"><span className="stat-label">AVERAGE<br/>GUESSES</span><span className="stat-value">{stats.averageGuesses}</span></div>
              <div className="stat-item"><span className="stat-label">CURRENT<br/>WINSTREAK</span><span className="stat-value">{stats.currentWinstreak}</span></div>
              <div className="stat-item"><span className="stat-label">HIGHEST<br/>WINSTREAK</span><span className="stat-value">{stats.highestWinstreak}</span></div>
            </div>
          )}
          <div className="refreshes-in">
            <span className="refreshes-label">REFRESHES IN</span>
            <span className="refreshes-timer">{timeLeft}</span>
          </div>
          <button className="next-mode-btn" onClick={() => setScreen('home')}>ANA SAYFAYA DÖN 🏠</button>
        </div>
      )}
      
      {error && <p className="error-text">{error}</p>}

      <div className="attempts-list">
        {attempts.length > 0 && (
           <div className="player-header-row">
             <div>PLAYER</div>
             <div>TEAM</div>
             <div>REGION</div>
             <div>AGE</div>
           </div>
        )}

        {attempts.map((attempt) => (
          <div key={attempt.guessedPlayerName} className="attempt-row">
            <div className={`cell ${attempt.isGuessCorrect ? 'correct' : 'wrong'}`}>
               {attempt.guessedPlayerName}
            </div>
            
            {/* NOT: F12 Konsoluna bakarak buradaki teamMatch, countryMatch, ageMatch isimlerini güncelle */}
            <div className={`cell ${attempt.teamMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.teamMatch?.value}
            </div>
            <div className={`cell ${attempt.countryMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.countryMatch?.value}
            </div>
            <div className={`cell ${attempt.ageMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.ageMatch?.value}
              {attempt.ageMatch?.status === 2 && ' ⬆️'}
              {attempt.ageMatch?.status === 3 && ' ⬇️'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}