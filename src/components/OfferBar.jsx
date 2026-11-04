import { useEffect, useState } from "react";

export default function OfferBar({ c }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 1000); // green <-> white every 1 second
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`offer ${on ? "on" : ""}`}>
      <span>🎁</span><span>{c.offer_text_1}</span><span>🎁</span><span>{c.offer_text_2}</span><span>🏷️</span>
    </div>
  );
}