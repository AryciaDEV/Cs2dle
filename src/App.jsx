import { useState } from 'react';
import Home from './components/Home';
import AgentGuess from './components/AgentGuess';
import MapGuess from './components/MapGuess';
import TeamGuess from './components/TeamGuess';
import PlayerGuess from './components/PlayerGuess';
import RankGuess from './components/RankGuess';
import SkinGuess from './components/SkinGuess';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

return (
    <div className="app-container">
      {/* TÜM SAYFALARDA ORTAK GÖRÜNECEK LOGO */}
      <div className="global-header">
        <h1 
          className="global-logo" 
          onClick={() => setCurrentScreen('home')}
        >
          CS2DLE
        </h1>
      </div>

      {currentScreen === 'home' && <Home setScreen={setCurrentScreen} />}
      {currentScreen === 'agent' && <AgentGuess setScreen={setCurrentScreen} />}
      {currentScreen === 'map' && <MapGuess setScreen={setCurrentScreen} />}
      {currentScreen === 'team' && <TeamGuess setScreen={setCurrentScreen} />}
      {currentScreen === 'player' && <PlayerGuess setScreen={setCurrentScreen} />}
      {currentScreen === 'rank' && <RankGuess setScreen={setCurrentScreen} />}
      {currentScreen === 'skin' && <SkinGuess setScreen={setCurrentScreen} />}

      {/* BURASI YENİ EKLENEN GLOBAL FOOTER VE DİĞER OYUNLAR KUTUSU */}
      <footer className="global-footer">
        
        {/* DİĞER OYUNLARIMIZ (MORE GAMES) KUTUSU */}
        <div className="more-games-container">
          <div className="more-games-title">MORE GAMES</div>
          <div className="more-games-subtitle">Play our other games:</div>
          
          <div className="more-games-list">
            {/* PUBGDLE */}
            <a href="https://pubgdle.com" target="_blank" rel="noopener noreferrer" className="game-link">
              <img src="/images/pubgdlelogo.png" alt="PUBGDLE" className="game-icon" />
              <span className="game-name">PUBGDLE</span>
            </a>
          </div>
        </div>

        {/* KLASİK ALT BİLGİ YAZILARI */}
        <div className="footer-text">
          CS2dle was created under Valve's "Legal Jibber Jabber" policy using assets owned by Valve.<br />
          Valve does not endorse or sponsor this project.
        </div>
        
        {/* MODALLARI AÇAN LİNKLER */}
        <div className="footer-links">
          <a href="https://discord.gg/SENIN-DISCORD-LINKIN" target="_blank" rel="noopener noreferrer">Discord</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setIsAboutOpen(true); }}>About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}>Privacy Policy</a>
        </div>
      </footer>

      {/* ==========================================
          ABOUT AÇILIR PENCERESİ (MODAL)
          ========================================== */}
      {isAboutOpen && (
        <div className="modal-overlay" onClick={() => setIsAboutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAboutOpen(false)}>&times;</button>
            <h2>About</h2>
            <p>A website created to test your CS2 knowledge.</p>
            <p>Heavily inspired by Loldle.</p>
            
            <h3>Contributors</h3>
            <ul>
              <li>Arycia - Fullstack Development</li>
              <li>TommyColt - Managment</li>
            </ul>
            
            <p>If you have any questions or concerns, please contact us at <strong>Discord</strong></p>
          </div>
        </div>
      )}

      {/* ==========================================
          PRIVACY POLICY AÇILIR PENCERESİ (MODAL)
          ========================================== */}
      {isPrivacyOpen && (
        <div className="modal-overlay" onClick={() => setIsPrivacyOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsPrivacyOpen(false)}>&times;</button>
            <h2>Privacy Policy</h2>
            <p><em>Last Updated: 13.05.2026</em></p>
            <p>Welcome to CS2dle. This privacy policy outlines our practices regarding the collection, use, and disclosure of information we receive through our website. We value your privacy and are committed to protecting your personal information.</p>
            
            <h3>1. Information Collection</h3>
            <p>While we do not directly collect personal information from our visitors, we work with third-party services that may collect data to provide analytics, advertisements, and improve user experience. These services include Google Analytics.</p>
            
            <h3>2. Third-Party Services</h3>
            <p><strong>2.1 Google Analytics</strong><br />Google Analytics tracks and reports website traffic. This service may collect information such as your IP address, browser type, browser version, pages visited, time and date of visits, time spent on pages, and other diagnostic data.</p>
            
            <h3>3. Use of Cookies</h3>
            <p>Our website and our third-party partners use cookies and similar tracking technologies to collect and track information. Cookies are files with a small amount of data, which may include an anonymous unique identifier. They help improve user experience, deliver relevant ads, and analyze website usage.</p>
            
            <h3>4. Data Usage</h3>
            <p>The data collected through our website and third-party services is used for: Analyzing website usage and performance, Improving user experience, Delivering targeted advertisements, Understanding user preferences, Maintaining website security.</p>
            
            <h3>5. Your Privacy Rights</h3>
            <ul>
              <li>Right to opt out of data collection by adjusting your browser's cookie settings</li>
              <li>Right to opt out of personalized advertising</li>
              <li>Right to request information about the data collected about you</li>
              <li>Right to request deletion of your data where applicable</li>
            </ul>

            <h3>6. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at <strong>Discord</strong>.</p>
            
            <p style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '15px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(false); }}>Homepage</a> | {' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(false); setIsAboutOpen(true); }}>About</a>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;