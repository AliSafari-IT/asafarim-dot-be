import React from 'react';
import styles from './styles.module.css';

const EnhancedReferralCard = () => {
  return (
    <div className={styles["enhanced-referral-container"]}>
      <div className={styles["enhanced-referral-card"]}>
        <div className={styles["enhanced-referral-glow"]}></div>
        <div className={styles["enhanced-referral-header"]}>
          <div className={styles["enhanced-referral-emoji"]}>🚀</div>
          <h3>Ready for Your Own Windsurf Adventure?</h3>
        </div>
        
        <div className={styles["enhanced-referral-content"]}>
          <div className={styles["enhanced-referral-sections"]}>
            <div className={styles["enhanced-referral-section"]}>
              <h4>What You'll Get</h4>
              <ul className={styles["enhanced-referral-features"]}>
                <li><span>✨</span> AI-assisted code completion</li>
                <li><span>🔍</span> Context-aware suggestions</li>
                <li><span>⚡</span> Workflow acceleration</li>
              </ul>
            </div>
            <div className={styles["enhanced-referral-section"]}>
              <h4>My Experience</h4>
              <p>
                <span>"</span>A mixed journey with valuable lessons and specific use cases where Windsurf truly shines<span>"</span>
              </p>
              <div className={styles["enhanced-referral-author"]}>
                <span>— Ali Safari</span>
              </div>
            </div>
          </div>
          
          <div className={styles["enhanced-referral-cta"]}>
            <a 
              href="https://windsurf.com/refer?referral_code=5a0afb7230" 
              className={styles["enhanced-referral-button"]}
              target="_blank" 
              rel="noopener noreferrer"
            >
              Try Windsurf With My Referral
              <div className={styles["enhanced-referral-button-shine"]}></div>
            </a>
            
            <div className={styles["enhanced-referral-links"]}>
              <a 
                href="/blog/2025/04/08/critique-issues-windsurf" 
                className={styles["enhanced-referral-link"]}
              >
                <span>🕵️‍♂️</span> Read my critique first
              </a>
              <span className={styles["enhanced-referral-divider"]}></span>
              <a 
                href="#where-targeted-use-shows-promise" 
                className={styles["enhanced-referral-link"]}
              >
                <span> 💎 </span> See where it shines
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReferralCard;
