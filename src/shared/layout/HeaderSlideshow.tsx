/*
=============================
HeaderSlideshow
--> Foto latar berganti otomatis dengan jeda dan dukungan reduced motion.
=============================
*/

import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HeaderSlideshow({ images: sources }: { images: string[] }) {
  const images = [...new Set(sources)];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setPaused(true);
    };
    preference.addEventListener('change', onChange);
    return () => preference.removeEventListener('change', onChange);
  }, []);
  useEffect(() => {
    if (paused || images.length < 2) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % images.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, images.length]);
  return (
    <>
      <div className="page-header-photos" aria-hidden="true">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            className={active === index ? 'is-active' : ''}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div
          className="header-slideshow-controls"
          role="group"
          aria-label="Foto latar rencana makan"
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Tampilkan foto latar ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <span />
            </button>
          ))}
          <button
            type="button"
            className="header-slideshow-pause"
            aria-label={paused ? 'Putar pergantian foto otomatis' : 'Jeda pergantian foto otomatis'}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      )}
    </>
  );
}
