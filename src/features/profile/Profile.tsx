/*
=============================
Profile
--> Form nama pengguna dan ringkasan akun serta data dapur.
=============================
*/

import { useMember } from '@/features/auth/session';
import { useKitchen } from '@/features/pantry/kitchen';
import { planHeaderImages } from '@/shared/layout/headerImages';
import { PageHeader } from '@/shared/layout/PageHeader';
import { WorkspaceBreadcrumb } from '@/shared/layout/WorkspaceBreadcrumb';
import { read, write } from '@/shared/storage/storage';
import { isAccounts } from '@/shared/storage/validators';
import { useFeedback } from '@/shared/ui/feedback';
import { Note } from '@/shared/ui/Note';
import { ArrowRight, Check, Leaf } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function Profile() {
  const { user, setUser } = useMember();
  const { plan, stock } = useKitchen();
  const { notify } = useFeedback();
  const [name, setName] = useState(user.name),
    [error, setError] = useState('');
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama pengguna tidak boleh kosong.');
      return;
    }
    if (!user.demo) {
      const accounts = read('accounts', [], isAccounts);
      if (
        accounts.some(
          (a) => a.email !== user.email && a.name.toLowerCase() === name.trim().toLowerCase(),
        )
      ) {
        setError('Nama pengguna sudah dipakai. Pilih nama lain.');
        return;
      }
      if (
        !write(
          'accounts',
          accounts.map((a) => (a.email === user.email ? { ...a, name: name.trim() } : a)),
        )
      ) {
        setError('Profil belum dapat disimpan. Periksa penyimpanan peramban.');
        return;
      }
    }
    setUser({ ...user, name: name.trim() });
    setError('');
    notify('Profil berhasil diperbarui.');
  }
  return (
    <>
      <PageHeader
        eyebrow="RUANG PRIBADI ANDA"
        title="Profil Saya"
        breadcrumb={<WorkspaceBreadcrumb currentLabel="Profil" />}
        sub="Kelola informasi akun dan lihat ringkasan dapur Anda."
        backgroundImages={planHeaderImages(plan)}
      />
      <div className="profile-grid">
        <form className="panel" onSubmit={save}>
          <div className="avatar" style={{ width: 62, height: 62, fontSize: 22, marginBottom: 22 }}>
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <h2>Informasi akun</h2>
          <p className="panel-sub">Akun simulasi tersimpan di peramban ini.</p>
          <label className="field">
            <span>Nama pengguna</span>
            <input maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Alamat email</span>
            <input type="email" value={user.email} disabled />
            <small>Email digunakan sebagai identitas akun simulasi.</small>
          </label>
          {error && (
            <div className="field-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn primary">
            <Check size={16} />
            Simpan Profil
          </button>
        </form>
        <aside>
          <div className="panel">
            <Leaf size={27} color="#687e55" />
            <h3 style={{ marginTop: 18 }}>Dapur Anda, sekilas</h3>
            <div className="summary-list">
              <div>
                <span>Mode rencana</span>
                <strong>{plan ? plan.mode : 'Belum diatur'}</strong>
              </div>
              <div>
                <span>Jumlah peserta</span>
                <strong>{plan ? `${plan.people} orang` : '—'}</strong>
              </div>
              <div>
                <span>Stok tercatat</span>
                <strong>{Object.keys(stock).length} bahan</strong>
              </div>
              <div>
                <span>Status akun</span>
                <strong>{user.demo ? 'Demo' : 'Simulasi'}</strong>
              </div>
            </div>
            <a href="#/preferensi" className="text-link">
              Atur preferensi makanan
              <ArrowRight size={14} />
            </a>
          </div>
          <Note>
            Data prototipe disimpan lokal di peramban, tidak dikirim ke layanan autentikasi atau
            basis data.
          </Note>
        </aside>
      </div>
    </>
  );
}
