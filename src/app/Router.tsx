import { LoadError } from '@/shared/ui/LoadError';
import { lazy } from 'react';
/*
=============================
Router
--> Memilih halaman dari URL hash dan memuat fitur melalui lazy loading.
=============================
*/

import { useSession } from '@/features/auth/session';
import { Shell } from '@/shared/layout/Shell';
import { Btn } from '@/shared/ui/Btn';
import { Empty } from '@/shared/ui/Empty';
import { Suspense, useEffect, useState } from 'react';
import { go } from './navigation';

const Landing = lazy(() =>
  import('@/features/landing/Landing')
    .then((m) => ({ default: m.Landing }))
    .catch(() => ({ default: LoadError })),
);
const Auth = lazy(() =>
  import('@/features/auth/Auth')
    .then((m) => ({ default: m.Auth }))
    .catch(() => ({ default: LoadError })),
);
const Dashboard = lazy(() =>
  import('@/features/dashboard/Dashboard')
    .then((m) => ({ default: m.Dashboard }))
    .catch(() => ({ default: LoadError })),
);
const Wizard = lazy(() =>
  import('@/features/planning/Wizard')
    .then((m) => ({ default: m.Wizard }))
    .catch(() => ({ default: LoadError })),
);
const Results = lazy(() =>
  import('@/features/planning/Results')
    .then((m) => ({ default: m.Results }))
    .catch(() => ({ default: LoadError })),
);
const Infeasible = lazy(() =>
  import('@/features/planning/Infeasible')
    .then((m) => ({ default: m.Infeasible }))
    .catch(() => ({ default: LoadError })),
);
const Pantry = lazy(() =>
  import('@/features/pantry/Pantry')
    .then((m) => ({ default: m.Pantry }))
    .catch(() => ({ default: LoadError })),
);
const Grocery = lazy(() =>
  import('@/features/grocery/Grocery')
    .then((m) => ({ default: m.Grocery }))
    .catch(() => ({ default: LoadError })),
);
const Preferences = lazy(() =>
  import('@/features/preferences/Preferences')
    .then((m) => ({ default: m.Preferences }))
    .catch(() => ({ default: LoadError })),
);
const Profile = lazy(() =>
  import('@/features/profile/Profile')
    .then((m) => ({ default: m.Profile }))
    .catch(() => ({ default: LoadError })),
);

export function Router() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/');
  const { user } = useSession();
  const publicRoute = ['/', '/masuk', '/daftar'].includes(route);
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(1) || '/');
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (!publicRoute && !user) go('/masuk');
  }, [publicRoute, user]);
  const pages = {
    '/dashboard': <Dashboard />,
    '/buat-rencana': <Wizard />,
    '/rencana': <Results />,
    '/hasil': <Infeasible />,
    '/stok': <Pantry />,
    '/belanja': <Grocery />,
    '/preferensi': <Preferences />,
    '/profil': <Profile />,
  };
  const page = pages[route as keyof typeof pages] ?? (
    <Empty title="Halaman tidak ditemukan" sub="Kembali ke dasbor untuk melanjutkan.">
      <Btn to="/dashboard">Kembali ke dasbor</Btn>
    </Empty>
  );
  return (
    <div
      className={
        route === '/'
          ? 'public-surface'
          : 'workspace-surface' + (route === '/masuk' ? '' : ' allianz-surface')
      }
    >
      <Suspense
        fallback={
          <p className="loading" role="status">
            Memuat halaman…
          </p>
        }
      >
        {route === '/' ? (
          <Landing />
        ) : route === '/masuk' || route === '/daftar' ? (
          <Auth register={route === '/daftar'} key={route} />
        ) : user ? (
          <Shell route={route}>{page}</Shell>
        ) : null}
      </Suspense>
    </div>
  );
}
