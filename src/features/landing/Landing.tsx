/*
=============================
Landing
--> Menyusun blok Navbar, Hero, manfaat, cara kerja, ajakan, dan footer.
=============================
*/

import { Benefits } from './components/Benefits';
import { CallToAction } from './components/CallToAction';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import { PublicFooter } from './components/PublicFooter';

export function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <div className="container">
          <Hero />
          <Benefits />
        </div>
        <HowItWorks />
        <div className="container">
          <CallToAction />
          <PublicFooter />
        </div>
      </main>
    </>
  );
}
