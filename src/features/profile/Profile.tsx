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
import { api } from '@/shared/api';
import { isUser } from '@/shared/storage/validators';
import { useFeedback } from '@/shared/ui/feedback';
import { Note } from '@/shared/ui/Note';
import { ArrowRight, Check, Leaf } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function Profile() {
  const { user, setUser } = useMember();
  const { plan, stock } = useKitchen();
  const { notify } = useFeedback();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const nextName = name.trim();
    if (!nextName || nextName.length > 30) {
      setError('Nama pengguna harus berisi 1–30 karakter.');
      return;
    }
    setSaving(true);
    try {
      let updated = { ...user, name: nextName };
      if (!user.demo) {
        const result: unknown = await api('/api/auth/me', {
          method: 'PATCH',
          body: { name: nextName },
        });
        if (!isUser(result)) throw new Error('Balasan profil server tidak valid.');
        updated = result;
      }
      setUser(updated);
      setName(updated.name);
      setError('');
      notify('Profil berhasil diperbarui.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Profil belum dapat disimpan.');
    } finally {
      setSaving(false);
    }
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
          <p className="panel-sub">Akun disimpan di backend; demo tersimpan lokal.</p>
          <label className="field">
            <span>Nama pengguna</span>
            <input maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Alamat email</span>
            <input type="email" value={user.email} disabled />
            <small>Email digunakan sebagai identitas akun.</small>
          </label>
          {error && (
            <div className="field-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn primary" disabled={saving}>
            <Check size={16} />
            {saving ? 'Menyimpan…' : 'Simpan Profil'}
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
                <strong>{user.demo ? 'Demo' : 'Terhubung'}</strong>
              </div>
            </div>
            <a href="#/preferensi" className="text-link">
              Atur preferensi makanan
              <ArrowRight size={14} />
            </a>
          </div>
          <Note>
            Akun dan data dapur akun disimpan di backend. Data mode demo tetap lokal.
          </Note>
        </aside>
      </div>
    </>
  );
}
