import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { apiClient, getBrowserId } from '../api';
import './MapGuess.css'; 

export default function SkinGuess({ setScreen }) {
  const [guess, setGuess] = useState('');
  const [skinList, setSkinList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dailyHint, setDailyHint] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState([]);

  // STATS VE ZAMANLAYICI
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({
    totalWins: 9,
    averageGuesses: 4.8,
    currentWinstreak: 3,
    highestWinstreak: 7
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
    const fetchData = async () => {
      try {
        const hintRes = await apiClient.get('/Game/daily-skin-hint');
        setDailyHint(hintRes.data); 
        
        const skinsRes = await apiClient.get('/Game/skins');
        setSkinList(skinsRes.data);
      } catch (err) {
        console.error("Veriler çekilemedi", err);
      }
    };
    fetchData();
  }, []);

  const handleGuess = async (skinName) => {
    if (!skinName.trim() || isWin) return;
    try {
      setError('');
      setShowDropdown(false);
      setGuess('');
      
      const browserId = getBrowserId();
      const response = await apiClient.post(`/Game/guess-skin?browserId=${browserId}`, `"${skinName}"`);
      
      console.log("GELEN VERİ:", response.data);
      
      // Backend true/false veya büyük/küçük harf ne gönderirse göndersin yakalamak için:
      const correctStatus = response.data.isCorrect === true || response.data.IsCorrect === true;
      
      const newAttempt = { name: skinName, isCorrect: correctStatus };
      
      setAttempts(prev => [newAttempt, ...prev]);
      
      if (correctStatus) setIsWin(true);
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu.");
    }
  };

const filteredSkins = skinList.filter(s => {
    // Sadece s değil, s.name kullanıyoruz çünkü artık obje geliyor
    const matchesSearch = s.name.toLowerCase().includes(guess.toLowerCase());
    const alreadyGuessed = attempts.some(a => a.name.toLowerCase() === s.name.toLowerCase());
    return matchesSearch && !alreadyGuessed;
  });

  const currentBlur = isWin ? 0 : Math.max(0, 25 - (attempts.length * 5));

  return (
    <div className="game-container">
      {isWin && <Confetti recycle={false} numberOfPieces={500} />}
      
      <h2>
        GUESS THE GUN
        <div className="tooltip-container">
          <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div className="how-to-play-box">
            <div className="htp-title">HOW TO PLAY:</div>
            <p>Guess the daily CS2 Weapon Skin.</p>
            <p>The blurred image gets clearer after every incorrect guess.</p>
            <p>A text hint will be revealed after 3 tries.</p>
          </div>
        </div>
      </h2>

      {!isWin && dailyHint && (
        <>
          <div className="map-image-container">
            <img 
              src={`/images/${dailyHint.imageUrl}`} 
              alt="Skin İpucu" 
              className="map-image" 
              style={{ filter: `blur(${currentBlur}px)` }} 
            />
          </div>
          {attempts.length >= 3 && dailyHint.hintText && (
            <div className="hint-box">💡 <strong>HINT:</strong> {dailyHint.hintText}</div>
          )}
        </>
      )}

      {!isWin ? (
        <div className="autocomplete-container">
          <input 
            type="text" 
            placeholder="SEARCH FOR GUN..." 
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
{showDropdown && guess.length > 0 && (
            <ul className="dropdown-list">
              {filteredSkins.map((skin, index) => (
                // Tıklanınca yine objenin sadece ismini (skin.name) gönderiyoruz
                <li key={index} onClick={() => handleGuess(skin.name)}>
                  {/* SİHİRLİ DOKUNUŞ: İkonu buraya ekledik */}
                  <img src={`/images/${skin.imageUrl}`} alt={skin.name} className="dropdown-icon" />
                  <span>{skin.name}</span>
                </li>
              ))}
              {filteredSkins.length === 0 && <li className="no-result">Gun not found.</li>}
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
          <button className="next-mode-btn" onClick={() => setScreen('map')}>GUESS THE MAP ➡️</button>
        </div>
      )}
      
      {error && <p className="error-text">{error}</p>}

      {/* İŞTE DÜZELTTİĞİMİZ KISIM: Direkt ekrana basması için çok daha basit bir yapı */}
      <div className="attempts-list">
        {attempts.length > 0 && (
           <div className="agent-header-row">
             <div>GUESS HISTORY</div>
           </div>
        )}

        {attempts.map((attempt) => (
          <div key={attempt.name} className="attempt-row">
            {/* Burada "cell" sınıfını bıraktık, böylece rengi (correct/wrong) tam yansıyacak */}
            <div className={`cell ${attempt.isCorrect ? 'correct' : 'wrong'}`} style={{ width: '100%' }}>
              {attempt.name}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}