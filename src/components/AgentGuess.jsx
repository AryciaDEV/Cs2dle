import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { apiClient, getBrowserId } from '../api';

export default function AgentGuess({ setScreen }) {
  const [guess, setGuess] = useState('');
  const [agentList, setAgentList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [error, setError] = useState('');

  // YENİ: STATS VE ZAMANLAYICI STATE'LERİ
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({
    totalWins: 2,
    averageGuesses: 14.5,
    currentWinstreak: 1,
    highestWinstreak: 1
  });

  // YENİ: GECE YARISINA KALAN SÜREYİ HESAPLAYAN ZAMANLAYICI
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
    const fetchAgents = async () => {
      try {
        const res = await apiClient.get('/Game/agents');
        setAgentList(res.data);
      } catch (err) {
        console.error("Ajanlar çekilemedi", err);
      }
    };
    fetchAgents();
  }, []);

  const handleGuess = async (agentName) => {
    if (!agentName.trim() || isWin) return;

    try {
      setError('');
      setShowDropdown(false);
      setGuess('');
      
      const browserId = getBrowserId();
      const response = await apiClient.post(`/Game/guess-agent?browserId=${browserId}`, `"${agentName}"`);
      
      setAttempts([response.data, ...attempts]);
      
      if (response.data.isGuessCorrect) {
        setIsWin(true);
      }
    } catch (err) {
      setError("Bir hata oluştu.");
    }
  };

const filteredAgents = agentList.filter(a => {
    // 1. Arama kutusuna yazılan kelimeyi içeriyor mu?
    const matchesSearch = a.name.toLowerCase().includes(guess.toLowerCase());
    
    // 2. Bu ajan daha önce tahmin edilmiş mi? (attempts içinde var mı?)
    const alreadyGuessed = attempts.some(attempt => 
      attempt.guessedAgentName.toLowerCase() === a.name.toLowerCase()
    );

    // Sadece aramayla eşleşen ve DAHA ÖNCE TAHMİN EDİLMEMİŞ olanları göster
    return matchesSearch && !alreadyGuessed;
  });

  return (
    <div className="game-container">
      {isWin && <Confetti recycle={false} numberOfPieces={500} />}
      
<h2>
        GUESS THE AGENT
        <div className="tooltip-container">
          <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          
          {/* YENİ DETAYLI HOW TO PLAY KUTUSU */}
          <div className="how-to-play-box">
            <div className="htp-title">HOW TO PLAY:</div>
            <p>Guess the daily agent by using clues after each attempt.</p>
            <p>Compare your guesses by gender, country, and release year.</p>
          </div>
        </div>
      </h2>

      {!isWin ? (
        <div className="autocomplete-container">
          <input 
            type="text" 
            placeholder="SEARCH FOR AN AGENT..." 
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          
          {showDropdown && guess.length > 0 && (
            <ul className="dropdown-list">
              {filteredAgents.map((agent, index) => (
                <li key={index} onClick={() => handleGuess(agent.name)}>
                  <img src={`/images/${agent.imageUrl}`} alt={agent.name} className="dropdown-icon" />
                  <span>{agent.name}</span>
                </li>
              ))}
              {filteredAgents.length === 0 && <li className="no-result">No agent was found.</li>}
            </ul>
          )}
        </div>
      ) : (
        <div className="win-box">
          <h2 className="gg-text">GG!</h2>
          
          <div className="win-details">
            <img 
              src={`/images/${attempts[0]?.imageUrl}`} 
              alt={attempts[0]?.guessedAgentName} 
              className="win-image" 
            />
            <div className="win-stats-info">
              <div className="win-name">{attempts[0]?.guessedAgentName}</div>
              <div className="win-tries">DENEME: <span className="try-count">{attempts.length}</span></div>
            </div>
          </div>

          {/* YENİ: STATS BUTONU VE PANELİ */}
          <button className="stats-toggle-btn" onClick={() => setShowStats(!showStats)}>
            <svg className="stats-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
            </svg>
            STATS
          </button>

          {showStats && (
            <div className="stats-panel">
              <div className="stat-item">
                <span className="stat-label">TOTAL<br/>WINS</span>
                <span className="stat-value">{stats.totalWins}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">AVERAGE<br/>GUESSES</span>
                <span className="stat-value">{stats.averageGuesses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">CURRENT<br/>WINSTREAK</span>
                <span className="stat-value">{stats.currentWinstreak}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">HIGHEST<br/>WINSTREAK</span>
                <span className="stat-value">{stats.highestWinstreak}</span>
              </div>
            </div>
          )}

          {/* YENİ: REFRESHES IN (ZAMANLAYICI) */}
          <div className="refreshes-in">
            <span className="refreshes-label">REFRESHES IN</span>
            <span className="refreshes-timer">{timeLeft}</span>
          </div>

          <button className="next-mode-btn" onClick={() => setScreen('team')}>GUESS THE TEAM ➡️</button>
        </div>
      )}
      
      {error && <p className="error-text">{error}</p>}

      <div className="attempts-list">
        {attempts.length > 0 && (
           <div className="agent-header-row">
             <div>AGENT</div>
             <div>GENDER</div>
             <div>COUNTRY</div>
             <div>YEAR</div>
           </div>
        )}

        {attempts.map((attempt) => (
          <div key={attempt.guessedAgentName} className="attempt-row">
            <div className={`cell ${attempt.isGuessCorrect ? 'correct' : 'wrong'}`}>
               {attempt.guessedAgentName}
            </div>
            <div className={`cell ${attempt.genderMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.genderMatch?.value}
            </div>
            <div className={`cell ${attempt.countryMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.countryMatch?.value}
            </div>
            <div className={`cell ${attempt.releaseYearMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.releaseYearMatch?.value}
              {attempt.releaseYearMatch?.status === 2 && ' ⬆️'}
              {attempt.releaseYearMatch?.status === 3 && ' ⬇️'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}