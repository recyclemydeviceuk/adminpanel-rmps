import { useState, useEffect, useCallback } from 'react';
import type { Brand, Series, DeviceModel } from '../types/catalog';
import type { PricingRule } from '../types/pricing';
import * as catalogLib from '../lib/catalog';
import * as pricingLib from '../lib/pricing';

/* ── Brands ────────────────────────────────────────────────── */

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogLib.getBrands();
      setBrands(data);
    } catch {
      setError('Failed to load brands.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<Brand, 'id' | 'createdAt' | 'modelCount'>) => {
    const brand = await catalogLib.createBrand(data);
    setBrands(prev => [...prev, brand]);
    return brand;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Brand>) => {
    const brand = await catalogLib.updateBrand(id, patch);
    setBrands(prev => prev.map(b => b.id === id ? brand : b));
    return brand;
  }, []);

  const remove = useCallback(async (id: string) => {
    await catalogLib.deleteBrand(id);
    setBrands(prev => prev.filter(b => b.id !== id));
  }, []);

  return { brands, loading, error, reload: load, create, update, remove };
}

/* ── All Series ────────────────────────────────────────────── */

export function useAllSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogLib.getAllSeries();
      setSeries(data);
    } catch {
      setError('Failed to load series.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<Series, 'id' | 'createdAt' | 'modelCount'>) => {
    const s = await catalogLib.createSeries(data);
    setSeries(prev => [...prev, s]);
    return s;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Series>) => {
    const s = await catalogLib.updateSeries(id, patch);
    setSeries(prev => prev.map(x => x.id === id ? s : x));
    return s;
  }, []);

  const remove = useCallback(async (id: string) => {
    await catalogLib.deleteSeries(id);
    setSeries(prev => prev.filter(s => s.id !== id));
  }, []);

  return { series, loading, error, reload: load, create, update, remove };
}

/* ── All Models ────────────────────────────────────────────── */

export function useAllModels() {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catalogLib.getAllModels();
      setModels(data);
    } catch {
      setError('Failed to load models.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: Omit<DeviceModel, 'id' | 'createdAt'>) => {
    const m = await catalogLib.createModel(data);
    setModels(prev => [...prev, m]);
    return m;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<DeviceModel>) => {
    const m = await catalogLib.updateModel(id, patch);
    setModels(prev => prev.map(x => x.id === id ? m : x));
    return m;
  }, []);

  const remove = useCallback(async (id: string) => {
    await catalogLib.deleteModel(id);
    setModels(prev => prev.filter(m => m.id !== id));
  }, []);

  return { models, loading, error, reload: load, create, update, remove };
}

/* ── Model Pricing ─────────────────────────────────────────── */

export function useModelPricing(modelId: string) {
  const [pricing, setPricing] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!modelId) { setPricing([]); setLoading(false); return; }
    setLoading(true);
    pricingLib.getPricingByModel(modelId)
      .then(setPricing)
      .finally(() => setLoading(false));
  }, [modelId]);

  return { pricing, loading };
}

/* ── Legacy re-exports (backward compat) ───────────────────── */

export function useSeriesByBrand(brandId: string) {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    catalogLib.getSeriesByBrand(brandId)
      .then(setSeries)
      .finally(() => setLoading(false));
  }, [brandId]);

  return { series, loading };
}

export function useModelsByBrand(brandId: string) {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    setLoading(true);
    catalogLib.getModelsByBrand(brandId)
      .then(setModels)
      .finally(() => setLoading(false));
  }, [brandId]);

  return { models, loading };
}
