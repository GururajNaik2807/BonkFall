export function ArchivesView() {
  return (
    <div className="view-archives view-fade-in">
      <h2>Archives & Records</h2>
      <div className="archives-placeholder">
        <div className="stats-box">
          <h3>Lifetime Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span>Total Runs</span>
              <b>12</b>
            </div>
            <div className="stat-item">
              <span>Total Kills</span>
              <b>842</b>
            </div>
            <div className="stat-item">
              <span>Highest Wave</span>
              <b>8</b>
            </div>
          </div>
        </div>

        <h3>Achievements</h3>
        <div className="achievements-list">
          <div className="achieve-card unlocked">
            <span className="achieve-icon">🏆</span>
            <div>
              <b>First Blood</b>
              <p>Defeat 100 enemies in a single run. (Completed)</p>
            </div>
          </div>
          <div className="achieve-card locked">
            <span className="achieve-icon">🔒</span>
            <div>
              <b>The Expanse</b>
              <p>Reach Wave 10. (Locked)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
