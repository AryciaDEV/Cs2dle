import './Home.css';

export default function Home({ setScreen }) {
  // Menü öğelerimizi bir dizi (array) içinde tanımlıyoruz ki kod kalabalığı olmasın
  const menuItems = [
    {
      id: 'skin',
      title: 'GUN',
      desc: 'GUESS THE GUNS FROM AN IMAGE',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path d="M22 10.24l-4.24-4.24L16 7.76l2.83 2.83-1.41 1.41-2.83-2.83-1.77 1.77 2.83 2.83-1.41 1.41-2.83-2.83-1.77 1.77 2.83 2.83-1.41 1.41-2.83-2.83-1.77 1.77L13.76 22l4.24-4.24L16.24 16l1.77-1.77 1.77 1.77L22 10.24z"/>
        </svg>
      )
    },
    {
      id: 'map',
      title: 'MAP',
      desc: 'GUESS THE MAPS FROM AN IMAGE',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      )
    },
    {
      id: 'rank',
      title: 'RANK',
      desc: 'GUESS THE RANK FROM A CLIP',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/>
        </svg>
      )
    },
    {
      id: 'agent',
      title: 'AGENT',
      desc: 'GUESS THE AGENT',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },

    {
      id: 'team',
      title: 'TEAM',
      desc: 'GUESS THE E-SPORT TEAM FROM A LOGO',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      )
    },
    {
      id: 'player',
      title: 'PLAYER',
      desc: 'GUESS THE E-SPORT PLAYER',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="menu-icon">
          <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 6 18.5 6s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="home-wrapper">
      <div className="home-content">
        <h2 className="sub-title">TEST YOUR CS2 KNOWLEDGE!</h2>

        <div className="menu-list">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              className="menu-button" 
              onClick={() => setScreen(item.id)}
            >
              <div className="icon-wrapper">
                {item.icon}
              </div>
              <div className="text-wrapper">
                <span className="btn-title">{item.title}</span>
                <span className="btn-desc">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}