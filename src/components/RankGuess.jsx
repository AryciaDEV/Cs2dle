import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { apiClient, getBrowserId } from '../api';
import './RankGuess.css';

export default function RankGuess({ setScreen }) {
  const [dailyHint, setDailyHint] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [error, setError] = useState('');

  // STATS VE ZAMANLAYICI
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({
    totalWins: 7,
    averageGuesses: 2.1,
    currentWinstreak: 4,
    highestWinstreak: 8
  });

  const rankTiers = [
    { name: "5,000 - 9,999", className: "tier-lightblue" },
    { name: "10,000 - 14,999", className: "tier-blue" },
    { name: "15,000 - 19,999", className: "tier-purple" },
    { name: "20,000 - 24,999", className: "tier-pink" },
    { name: "25,000 - 29,999", className: "tier-red" },
    { name: "30,000 - +30,000", className: "tier-gold" }
  ];

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
    const fetchHint = async () => {
      try {
        const res = await apiClient.get('/Game/daily-rank-hint');
        setDailyHint(res.data);
      } catch (err) {
        console.error("Klip çekilemedi", err);
      }
    };
    fetchHint();
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

const handleGuess = async (rankName) => {
    if (isWin) return;
    try {
      setError('');
      const browserId = getBrowserId();
      const response = await apiClient.post(`/Game/guess-rank?browserId=${browserId}`, `"${rankName}"`);
      
      console.log("RANK TAHMİN CEVABI:", response.data);

      const isCorrect = response.data.isCorrect;
      
      // SİHİRLİ DOKUNUŞ: prev kullanarak her tahmini listeye zorla ekletiyoruz
      setAttempts(prev => [{ name: rankName, isCorrect: isCorrect }, ...prev]);
      
      if (isCorrect) setIsWin(true);
    } catch (err) {
      console.error(err);
      setError("Tahmin gönderilirken bir hata oluştu.");
    }
  };
  return (
    <div className="game-container">
      {isWin && <Confetti recycle={false} numberOfPieces={500} />}
      
      <h2>
        GUESS THE RANK
        <div className="tooltip-container">
          <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div className="how-to-play-box">
            <div className="htp-title">HOW TO PLAY:</div>
            <p>Watch the gameplay clip carefully.</p>
            <p>Guess the CS2 Premier Elo (Rank) of the clip.</p>
            <p>Select a rank tier from the grid below.</p>
          </div>
        </div>
      </h2>

      {/* VİDEO ALANI (Resimlerle aynı genişlikte) */}
      {!isWin && dailyHint && (
        <div className="map-image-container">
          <iframe 
            src={getEmbedUrl(dailyHint.videoUrl)} 
            title="CS2 Clip" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="map-image" /* Fotoğraflarla aynı CSS sınıfı sayesinde aynı genişlikte */
            style={{ height: '280px', border: 'none' }}
          ></iframe>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!isWin ? (
        <div className="rank-grid">
          {rankTiers.map((tier, index) => (
            <button 
              key={index} 
              className={`rank-btn ${tier.className}`}
              onClick={() => handleGuess(tier.name)}
            >
              {tier.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="win-box">
          <h2 className="gg-text">GG!</h2>
          <div className="win-details">
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
          <button className="next-mode-btn" onClick={() => setScreen('agent')}>GUESS THE AGENT ➡️</button>
        </div>
      )}

{/* TAHMİN GEÇMİŞİ */}
      <div className="attempts-list">
        
        {attempts.length > 0 && (
           <div className="agent-header-row">
             <div>GUESS HISTORY</div>
           </div>
        )}

        {attempts.map((attempt, index) => (
          <div key={index} className="attempt-row">
            <div className={`cell ${attempt.isCorrect ? 'correct' : 'wrong'}`}>
              {attempt.name}
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
}