import React from 'react';
import styles from './styles.module.css';

const ReferralCard = () => {
  return (
    <div className={styles["referral-container"]}>
      <div className={styles["referral-card"]}>
        <div className={styles["referral-content"]}>
          <div className={styles["referral-badge"]}>
            <span>🤝 Support</span>
          </div>
          <h3>Try Windsurf Yourself</h3>
          <p>
            Want to form your own opinion? Use my referral link to try Windsurf and we both benefit:
          </p>
          <div className={styles["referral-actions"]}>
            <a 
              href="https://windsurf.com/refer?referral_code=5a0afb7230" 
              className={styles["referral-button"]}
              target="_blank" 
              rel="noopener noreferrer"
            >
              Get Started with Windsurf
            </a>
            <a 
              href="/blog/2025/04/08/critique-issues-windsurf" 
              className={styles["read-critique-link"]}
            >
              Read my critique first →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
