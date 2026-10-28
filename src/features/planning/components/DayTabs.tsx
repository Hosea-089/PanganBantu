/*
=============================
DayTabs
--> Pemilihan hari dengan tombol panah, Home, End, dan pengelolaan fokus.
=============================
*/

import { useRef, type KeyboardEvent } from 'react';
import { dateLabel } from '../format';
import type { Plan } from '../types';

export function DayTabs({
  plan,
  day,
  setDay,
}: {
  plan: Plan;
  day: number;
  setDay: (day: number) => void;
}) {
  const buttons = useRef<Map<string, HTMLButtonElement>>(new Map());
  const days = Array.from({ length: plan.days }, (_, offset) => ({
    offset,
    date: dateLabel(plan.start, offset),
  }));
  const move = (event: KeyboardEvent<HTMLButtonElement>, offset: number) => {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (offset + 1) % plan.days;
        break;
      case 'ArrowLeft':
        next = (offset - 1 + plan.days) % plan.days;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = plan.days - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setDay(next);
    buttons.current.get(days[next].date)?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label="Hari perencanaan">
      {days.map(({ offset, date }) => (
        <button
          key={date}
          type="button"
          role="tab"
          id={`day-tab-${offset}`}
          aria-selected={day === offset}
          aria-controls="day-panel"
          tabIndex={day === offset ? 0 : -1}
          ref={(element) => {
            if (element) buttons.current.set(date, element);
            else buttons.current.delete(date);
          }}
          onClick={() => setDay(offset)}
          onKeyDown={(event) => move(event, offset)}
          className={`day-tab ${day === offset ? 'selected' : ''}`}
        >
          Hari {offset + 1}
          <small>{dateLabel(plan.start, offset, true)}</small>
        </button>
      ))}
    </div>
  );
}
