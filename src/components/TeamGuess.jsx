import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { apiClient, getBrowserId } from '../api';

export default function TeamGuess({ setScreen }) {
  const [guess, setGuess] = useState('');
  const [teamList, setTeamList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [error, setError] = useState('');

  // STATS VE ZAMANLAYICI
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [stats, setStats] = useState({
    totalWins: 3,
    averageGuesses: 8.5,
    currentWinstreak: 1,
    highestWinstreak: 3
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
    const fetchTeams = async () => {
      try {
        const res = await apiClient.get('/Game/teams');
        setTeamList(res.data);
      } catch (err) {
        console.error("Takımlar çekilemedi", err);
      }
    };
    fetchTeams();
  }, []);

  const handleGuess = async (teamName) => {
    if (!teamName.trim() || isWin) return;
    try {
      setError('');
      setShowDropdown(false);
      setGuess('');
const browserId = getBrowserId();
      const response = await apiClient.post(`/Game/guess-team?browserId=${browserId}`, `"${teamName}"`);
      
      // BUNU EKLİYORUZ: Gelen verinin gerçek isimlerini görmek için
      console.log("TAKIM VERİSİ GELDİ:", response.data);
      
      setAttempts([response.data, ...attempts]);
      if (response.data.isGuessCorrect) setIsWin(true);
    } catch (err) {
      setError("Bir hata oluştu.");
    }
  };

  // YANLIŞ BİLİNENLERİ GİZLEME
  const filteredTeams = teamList.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(guess.toLowerCase());
    const alreadyGuessed = attempts.some(a => a.guessedTeamName?.toLowerCase() === t.name.toLowerCase());
    return matchesSearch && !alreadyGuessed;
  });

return (
    <div className="game-container">
      {isWin && <Confetti recycle={false} numberOfPieces={500} />}
      
      <h2>
        GUESS THE TEAM
        <div className="tooltip-container">
          <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <div className="how-to-play-box">
            <div className="htp-title">HOW TO PLAY:</div>
            <p>Guess the daily Esports Team.</p>
            <p>Use clues like region and foundation year.</p>
            <p>Green means correct, red means incorrect.</p>
          </div>
        </div>
      </h2>

      {!isWin ? (
        <div className="autocomplete-container">
          <input 
            type="text" 
            placeholder="SEARCH TEAMS..." 
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && guess.length > 0 && (
            <ul className="dropdown-list">
              {filteredTeams.map((team, index) => (
                <li key={index} onClick={() => handleGuess(team.name)}>
                  {/* BURASI DÜZELDİ: imageUrl yerine logoUrl */}
                  <img src={`/images/${team.logoUrl}`} alt={team.name} className="dropdown-icon" />
                  <span>{team.name}</span>
                </li>
              ))}
              {filteredTeams.length === 0 && <li className="no-result">Takım bulunamadı</li>}
            </ul>
          )}
        </div>
      ) : (
        <div className="win-box">
          <h2 className="gg-text">GG!</h2>
          <div className="win-details">
            {/* BURASI DÜZELDİ: imageUrl yerine logoUrl */}
            <img src={`/images/${attempts[0]?.logoUrl}`} alt={attempts[0]?.guessedTeamName} className="win-image" />
            <div className="win-stats-info">
              <div className="win-name">{attempts[0]?.guessedTeamName}</div>
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
          <button className="next-mode-btn" onClick={() => setScreen('player')}>GUESS THE PLAYER ➡️</button>
        </div>
      )}
      
      {error && <p className="error-text">{error}</p>}

      <div className="attempts-list">
        {attempts.length > 0 && (
           <div className="team-header-row">
             <div>TEAM</div>
             <div>REGION</div>
             <div>YEAR</div>
           </div>
        )}

        {attempts.map((attempt) => (
          <div key={attempt.guessedTeamName} className="attempt-row">
            <div className={`cell ${attempt.isGuessCorrect ? 'correct' : 'wrong'}`}>
               {attempt.guessedTeamName}
            </div>
            
            <div className={`cell ${attempt.regionMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.regionMatch?.value}
            </div>

            {/* BURASI DÜZELDİ: yearMatch yerine foundationYearMatch */}
            <div className={`cell ${attempt.foundationYearMatch?.status === 0 ? 'correct' : 'wrong'}`}>
              {attempt.foundationYearMatch?.value}
              {attempt.foundationYearMatch?.status === 2 && ' ⬆️'}
              {attempt.foundationYearMatch?.status === 3 && ' ⬇️'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}