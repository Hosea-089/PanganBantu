/*
=============================
ShoppingTable
--> Tabel kebutuhan bahan, penggunaan stok, pembelian, dan estimasi harga.
=============================
*/

import { ingredients, qty, range } from '@/features/planning/model';
import type { CostLine, ShoppingChecks } from '@/features/planning/types';
import { Badge } from '@/shared/ui/Badge';
import { CheckCircle2 } from 'lucide-react';

export function ShoppingTable({
  lines,
  checked,
  toggle,
  category,
}: {
  lines: CostLine[];
  checked: ShoppingChecks;
  toggle: (id: string) => void;
  category: string;
}) {
  return (
    <div
      className="table-wrap"
      tabIndex={0}
      role="region"
      aria-label={`Rincian belanja ${category}`}
    >
      <table>
        <thead>
          <tr>
            <th scope="col">Bahan</th>
            <th scope="col">Dibutuhkan</th>
            <th scope="col">Dari stok</th>
            <th scope="col">Perlu dibeli</th>
            <th scope="col">Estimasi harga</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id} className={checked[l.id] && l.buy > 0 ? 'purchased' : ''}>
              <td>
                <label>
                  {l.buy > 0 ? (
                    <input
                      type="checkbox"
                      checked={!!checked[l.id]}
                      onChange={() => toggle(l.id)}
                      aria-label={'Tandai ' + ingredients[l.id].name + ' sudah dibeli'}
                    />
                  ) : (
                    <CheckCircle2
                      size={16}
                      style={{
                        color: '#6b8a58',
                        marginRight: 12,
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                  {ingredients[l.id].name}
                </label>
              </td>
              <td>{qty(l.need, l.id)}</td>
              <td>{qty(l.used, l.id)}</td>
              <td>
                {l.buy > 0 ? (
                  <strong>{qty(l.buy, l.id)}</strong>
                ) : (
                  <Badge color="green">Sudah tersedia</Badge>
                )}
              </td>
              <td>{l.buy > 0 ? range(l.min, l.max) : 'Rp0–Rp0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
