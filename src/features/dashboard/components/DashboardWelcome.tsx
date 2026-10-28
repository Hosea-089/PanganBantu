/*
=============================
DashboardWelcome
--> Sapaan pengguna serta ringkasan dan tombol rencana aktif.
=============================
*/

import { useMember } from '@/features/auth/session';
import { dateRange, range } from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import type { Calculation, Plan } from '@/features/planning/types';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { ArrowRight, ArrowUpRight, CalendarDays, Users } from 'lucide-react';

export function DashboardWelcome({ plan, calc }: { plan: Plan | null; calc: Calculation | null }) {
  const { user, demo } = useMember();
  const { startPlan } = usePlanning();
  return (
    <section className="dashboard-welcome">
      <div className="dashboard-intro">
        <span className="welcome-kicker">DAPUR SAYA</span>
        <h1>
          Halo, {user.name.split(' ')[0]}
          <span>.</span>
          <br />
          <span className="hero-light">Siap masak hari ini?</span>
        </h1>
        <p>
          {plan
            ? 'Rencana sudah siap. Lihat menu dan cek bahan sebelum mulai memasak.'
            : 'Mulai dengan bahan yang ada, lalu susun menu untuk beberapa hari ke depan.'}
        </p>
        <div className="dashboard-cover">
          <img src="/assets/nasi-goreng.webp" alt="Nasi goreng rumahan dengan telur dan sayuran" />
        </div>
      </div>
      <div className="dashboard-showcase">
        <div className="dashboard-plan">
          <Badge color="green">
            <CalendarDays size={12} />
            {plan ? 'Rencana aktif' : 'Mulai dari sini'}
          </Badge>
          <h2>
            {plan
              ? `Menu ${plan.days} hari,\nuntuk ${plan.people} orang.`
              : 'Rencanakan\nmenu Anda.'}
          </h2>
          <p>
            {plan
              ? dateRange(plan)
              : 'Mulai dari jumlah orang, anggaran, dan bahan yang ada di dapur.'}
          </p>
          {plan && calc ? (
            <>
              <div className="dashboard-plan-cost">
                <small>Total estimasi belanja</small>
                <strong>{range(calc.min, calc.max)}</strong>
              </div>
              <div className="dashboard-plan-bottom">
                <span>
                  <Users size={14} />
                  {plan.people} orang <i />
                  {plan.days} hari
                </span>
                <Btn to="/rencana">
                  Lihat Rencana
                  <ArrowUpRight size={16} />
                </Btn>
              </div>
            </>
          ) : (
            <div className="actions">
              <Btn onClick={startPlan}>
                Buat Rencana Makan
                <ArrowUpRight size={16} />
              </Btn>
              <button className="text-link" onClick={demo}>
                Lihat contoh
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
