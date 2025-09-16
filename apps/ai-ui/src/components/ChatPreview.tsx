import { useEffect, useState } from "react";

export default function ChatPreview() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="chat-preview">
      <div className="chat-window">
        <div className="bubble user">Hi! Can you improve my resume for a product role?</div>
        <div className="bubble ai">
          Absolutely! Share your current resume or paste key experience, and tell me the target company.
        </div>
        <div className="bubble user">Targeting fintech. 5y PM, built onboarding flows.</div>
        <div className="bubble ai typing">
          <span className={`dot ${step === 0 ? 'on' : ''}`}></span>
          <span className={`dot ${step === 1 ? 'on' : ''}`}></span>
          <span className={`dot ${step === 2 ? 'on' : ''}`}></span>
        </div>
      </div>
    </div>
  );
}
