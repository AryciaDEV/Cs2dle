import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { apiClient, getBrowserId } from '../api';
import './MapGuess.css';

export default function MapGuess({ setScreen }) {
  const [guess, setGuess] = useState('');
  const [mapList, setMapList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dailyHint, setDailyHint] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState([]);

  // STATS VE ZAMANLAYICI STATE'LERİ
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({
    totalWins: 5,
    averageGuesses: 3.2,
    currentWinstreak: 2,
    highestWinstreak: 4
  });

  // GECE YARISINA KALAN SÜRE ZAMANLAYICISI
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
    const fetchData = async () => {
      try {
        const hintRes = await apiClient.get('/Game/daily-map-hint');
        setDailyHint(hintRes.data);
        const mapsRes = await apiClient.get('/Game/maps');
        setMapList(mapsRes.data);
      } catch (err) {
        console.error("Veriler çekilemedi", err);
      }
    };
    fetchData();
  }, []);

const handleGuess = async (mapName) => {
    if (!mapName.trim() || isWin) return;
    try {
      setError('');
      setShowDropdown(false);
      setGuess('');
      
      const browserId = getBrowserId();
      const response = await apiClient.post(`/Game/guess-map?browserId=${browserId}`, `"${mapName}"`);
      
      // Büyük/küçük harf duyarlılığını garantiye alıyoruz
      const correctStatus = response.data.isCorrect === true || response.data.IsCorrect === true;
      
      // PREV kullanarak listeyi her defasında zorla güncelliyoruz
      setAttempts(prev => [{ name: mapName, isCorrect: correctStatus }, ...prev]);
      
      if (correctStatus) setIsWin(true);
    } catch (err) {
      setError("Bir hata oluştu.");
    }
  };

  // YANLIŞ BİLİNENLERİ DROPDOWN'DAN GİZLEME
  const filteredMaps = mapList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(guess.toLowerCase());
    const alreadyGuessed = attempts.some(a => a.name.toLowerCase() === m.name.toLowerCase());
    return matchesSearch && !alreadyGuessed;
  });

  const currentBlur = isWin ? 0 : Math.max(0, 25 - (attempts.length * 5));

  return (
    <div className="game-container">
      {isWin && <Confetti recycle={false} numberOfPieces={500} />}
      
      <h2>
        GUESS THE GUN MAP
        <div className="tooltip-container">
          <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div className="how-to-play-box">
            <div className="htp-title">HOW TO PLAY:</div>
            <p>Guess the daily map from the blurred image.</p>
            <p>The image becomes clearer with each incorrect guess.</p>
            <p>A region hint unlocks after 3 tries.</p>
          </div>
        </div>
      </h2>

      {!isWin && dailyHint && (
        <>
          <div className="map-image-container">
            <img 
              src={`/images/${dailyHint.imageUrl}`} 
              alt="Harita İpucu" 
              className="map-image" 
              style={{ filter: `blur(${currentBlur}px)` }} 
            />
          </div>
          {attempts.length >= 3 && (
            <div className="hint-box">💡 <strong>HINT:</strong> Region: {dailyHint.region}</div>
          )}
        </>
      )}

      {!isWin ? (
        <div className="autocomplete-container">
          <input 
            type="text" 
            placeholder="SEARCH FOR MAP..." 
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && guess.length > 0 && (
            <ul className="dropdown-list">
              {filteredMaps.map((map, index) => (
                <li key={index} onClick={() => handleGuess(map.name)}>
                  <img src={`/images/${map.imageUrl}`} alt={map.name} className="dropdown-icon" />
                  <span>{map.name}</span>
                </li>
              ))}
              {filteredMaps.length === 0 && <li className="no-result">Map not found.</li>}
            </ul>
          )}
        </div>
      ) : (
        <div className="win-box">
          <h2 className="gg-text">GG!</h2>
          <div className="win-details">
            <img src={`/images/${dailyHint?.imageUrl}`} alt={attempts[0]?.name} className="win-image" />
            <div className="win-stats-info">
              <div className="win-name">{attempts[0]?.name}</div>
              <div className="win-tries">TRIES: <span className="try-count">{attempts.length}</span></div>
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
          <button className="next-mode-btn" onClick={() => setScreen('rank')}>GUESS THE RANK ➡️</button>
        </div>
      )}
      
      {error && <p className="error-text">{error}</p>}

{/* TAHMİN GEÇMİŞİ */}
      <div className="attempts-list">
        {attempts.length > 0 && (
           <div className="agent-header-row">
             <div>GUESS HISTORY</div>
           </div>
        )}

        {attempts.map((attempt) => (
          <div key={attempt.name} className="attempt-row">
            {/* Genişliği tam kaplaması için style ekledik */}
            <div className={`cell ${attempt.isCorrect ? 'correct' : 'wrong'}`} style={{ width: '100%' }}>
              {attempt.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}