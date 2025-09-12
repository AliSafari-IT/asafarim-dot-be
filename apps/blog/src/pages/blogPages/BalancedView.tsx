import React from 'react';
import styles from './styles.module.css';

const BalancedView = () => {
  return (
    <div className={styles["balanced-view-card"]}>
      <div className={styles["balanced-view-inner"]}>
        <div className={styles["balanced-view-front"]}>
          <div className={styles["balanced-view-content"]}>
            <h3>👀 Looking for a balanced perspective?</h3>
            <p>Flip this card to discover where Windsurf actually shines...</p>
          </div>
        </div>
        <div className={styles["balanced-view-back"]}>
          <div className={styles["balanced-view-content"]}>
            <h3>✨ The Silver Lining</h3>
            <p>Despite the challenges, I've identified specific scenarios where Windsurf can be valuable when used correctly.</p>
            <a href="/blog/2025/04/10/windsurf" className={styles["balanced-view-button"]}>
              See Where It Works Best
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalancedView;