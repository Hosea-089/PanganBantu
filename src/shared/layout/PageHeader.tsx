/*
=============================
PageHeader
--> Judul, deskripsi, breadcrumb, foto latar, dan tindakan halaman.
=============================
*/

import { HeaderSlideshow } from '@/shared/layout/HeaderSlideshow';
import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  sub,
  children,
  backgroundImages = [],
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  sub: string;
  children?: ReactNode;
  backgroundImages?: string[];
  breadcrumb?: ReactNode;
}) {
  return (
    <div
      className={
        'page-header' +
        (backgroundImages.length ? ' page-header-slideshow' : '') +
        (breadcrumb ? ' page-header-with-breadcrumb' : '')
      }
    >
      {backgroundImages.length > 0 && (
        <HeaderSlideshow key={backgroundImages.join('|')} images={backgroundImages} />
      )}
      {breadcrumb}
      <div className="page-header-copy">
        {eyebrow && (
          <div className="eyebrow">
            <span className="dot" />
            {eyebrow}
          </div>
        )}
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {children}
    </div>
  );
}
