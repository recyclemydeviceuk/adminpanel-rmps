import { useEffect, useRef, useState } from 'react';
import type { RepairType, PricingRule } from '../../../types/pricing';

export interface PricingRow {
  repairTypeId:   string;
  repairTypeName: string;
  category:       string;
  price:          string;
  isActive:       boolean;
}

interface ModelPricingSectionProps {
  repairTypes:     RepairType[];
  existingPricing: PricingRule[];
  onChange:        (rows: PricingRow[]) => void;
}

/**
 * Editable table of repair-type → price rows for a single device model.
 *
 * Only ONE price field per row. (The legacy "Was Price" / strikethrough
 * value has been removed — the client wanted a single price that matches
 * what's shown on the public repair-booking page, no discount comparison.)
 */
export default function ModelPricingSection({ repairTypes, existingPricing, onChange }: ModelPricingSectionProps) {
  const [rows, setRows] = useState<PricingRow[]>([]);

  // Seed rows from the server data exactly once per (model, repairTypes) combo.
  // If we re-seeded every time `existingPricing` reference changed, we'd clobber
  // the admin's in-progress edits whenever the parent refetched pricing.
  const seededKeyRef = useRef<string>('');

  useEffect(() => {
    if (repairTypes.length === 0) return;
    const key = `${repairTypes.map(r => r.id).join(',')}|${existingPricing.map(p => p.id).join(',')}`;
    if (seededKeyRef.current === key) return;
    seededKeyRef.current = key;

    const built = repairTypes.map(rt => {
      const existing = existingPricing.find(p => p.repairTypeId === rt.id);
      return {
        repairTypeId:   rt.id,
        repairTypeName: rt.name,
        category:       rt.category,
        price:          existing ? String(existing.price) : '',
        isActive:       existing?.isActive ?? true,
      };
    });
    setRows(built);
    onChange(built);
  }, [repairTypes, existingPricing, onChange]);

  const updateRow = (index: number, patch: Partial<PricingRow>) => {
    const updated = rows.map((r, i) => i === index ? { ...r, ...patch } : r);
    setRows(updated);
    onChange(updated);
  };

  if (rows.length === 0) {
    return <p className="text-[13px] text-[#9aa0a6] py-4">No repair types available. Add repair types first.</p>;
  }

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-[#202124] mb-3">Repair Pricing</h3>
      <p className="text-[11px] text-[#9aa0a6] mb-4">Set the price for each repair type. Leave empty to skip.</p>

      <div className="rounded-xl border border-[#e8eaed] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#f8fafc] text-[10px] uppercase tracking-[0.06em] font-semibold text-[#5f6368]">
          <div className="col-span-6">Repair Type</div>
          <div className="col-span-4">Price (£)</div>
          <div className="col-span-2 text-center">Active</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div key={row.repairTypeId} className="grid grid-cols-12 gap-3 px-4 py-3 border-t border-[#f3f4f6] items-center">
            <div className="col-span-6">
              <p className="text-[13px] font-medium text-[#202124]">{row.repairTypeName}</p>
              <p className="text-[10px] text-[#9aa0a6] capitalize">{row.category.replace('_', ' ')}</p>
            </div>
            <div className="col-span-4">
              <input
                type="number"
                step="0.01"
                min="0"
                value={row.price}
                onChange={e => updateRow(i, { price: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-lg border border-[#e8eaed] bg-white px-3 py-2 text-[13px] text-[#202124] placeholder:text-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>
            <div className="col-span-2 flex justify-center">
              <div
                onClick={() => updateRow(i, { isActive: !row.isActive })}
                className={`relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer ${row.isActive ? 'bg-red-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${row.isActive ? 'translate-x-4' : ''}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
