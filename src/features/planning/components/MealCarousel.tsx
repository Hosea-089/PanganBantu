/*
=============================
MealCarousel
--> Pemilihan sarapan, makan siang, atau malam melalui tombol dan gestur.
=============================
*/

import { MealCard } from '@/features/planning/components/MealCard';
import { slots } from '@/features/planning/model';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Calculation, Plan } from '../types';

export function MealCarousel({ d, plan, calc }: { d: number; plan: Plan; calc: Calculation }) {
  const [active, setActive] = useState(0);
  const panelId = useId();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const move = (direction: number) =>
    setActive((current) => (current + direction + slots.length) % slots.length);
  const handleArrow = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  };
  return (
    <section
      className="meal-carousel"
      aria-roledescription="carousel"
      aria-label="Menu makan harian"
    >
      <div
        className="meal-carousel-viewport"
        id={panelId}
        role="group"
        aria-roledescription="slide"
        aria-label={`${active + 1} dari ${slots.length}: ${slots[active]}`}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current =
            event.touches.length === 1 &&
            !(event.target instanceof Element && event.target.closest('button,a'))
              ? { x: touch.clientX, y: touch.clientY }
              : null;
        }}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || !event.changedTouches[0]) return;
          const dx = event.changedTouches[0].clientX - start.x;
          const dy = event.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
        }}
      >
        <MealCard key={`${plan.start}:${slots[active]}`} d={d} s={active} plan={plan} calc={calc} />
      </div>
      <div className="meal-carousel-controls">
        <div className="meal-carousel-selectors" role="group" aria-label="Pilih waktu makan">
          {slots.map((slot, index) => (
            <button
              key={slot}
              type="button"
              aria-pressed={active === index}
              aria-controls={panelId}
              onClick={() => setActive(index)}
              onKeyDown={handleArrow}
            >
              <span aria-hidden="true">0{index + 1}</span>
              {slot}
            </button>
          ))}
        </div>
        <div className="meal-carousel-paging">
          <span
            className="meal-carousel-count"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Menu ${active + 1} dari ${slots.length}: ${slots[active]}`}
          >
            0{active + 1} / 0{slots.length}
          </span>
          <button type="button" aria-label="Menu sebelumnya" onClick={() => move(-1)}>
            <ArrowLeft size={20} />
          </button>
          <button type="button" aria-label="Menu berikutnya" onClick={() => move(1)}>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
