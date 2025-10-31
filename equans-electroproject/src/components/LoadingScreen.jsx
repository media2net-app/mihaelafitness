import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-icon">
          <img src="/beeldmerk/beeldmerk.svg" alt="Loading" className="loading-favicon" />
        </div>
        <h2 className="loading-title">Dashboard laden ...</h2>
        <p className="loading-subtitle">data ophalen</p>
      </div>
    </div>
  );
}

