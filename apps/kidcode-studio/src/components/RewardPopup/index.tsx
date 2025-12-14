import { useEffect } from "react";
import { useStore } from "../../core/state/useStore";
import { STICKERS } from "../../types/progress";
import "./RewardPopup.css";

export default function RewardPopup() {
  const showReward = useStore((state) => state.showReward);
  const hideReward = useStore((state) => state.hideReward);

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(hideReward, 4000);
      return () => clearTimeout(timer);
    }
  }, [showReward, hideReward]);

  if (!showReward) return null;

  const sticker = STICKERS[showReward.sticker];

  return (
    <div className="reward-overlay" onClick={hideReward}>
      <div className="reward-popup animate-pop">
        <div className="reward-sparkles">✨</div>
        <div className="reward-sticker">{sticker?.icon || "⭐"}</div>
        <h2 className="reward-title">You earned a sticker!</h2>
        <p className="reward-name">{sticker?.name || showReward.sticker}</p>
        <p className="reward-message">{showReward.message}</p>
        <button className="btn-primary" onClick={hideReward}>
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
}
