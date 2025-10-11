'use client';
import React from 'react';

export default function Countdown({ iso }: { iso: string }) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const targetDate = new Date(iso);
    const tick = () => {
      const now = Date.now();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft('✅ Claim is LIVE!');
        return;
      }
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);

  return <span className="font-mono">{timeLeft}</span>;
}