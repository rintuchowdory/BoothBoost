import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const API = `${BASE}/api`;
const CACHE_KEY = "leads_cache_v1";
const QUEUE_KEY = "leads_queue_v1";

export type CustomField = { label: string; value: string };
export type Lead = {
  id: string; name: string; email: string; phone: string; company: string;
  jobTitle: string; interests: string[]; customFields: CustomField[];
  notes: string; followedUp: boolean; createdAt: string; _pending?: boolean;
};
export type Stats = {
  total: number; today: number; followedUp: number; pending: number;
  topInterests: { tag: string; count: number }[];
};

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" }, ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function getQueue(): Promise<Lead[]> {
  return (await storage.getItem<Lead[]>(QUEUE_KEY, [])) ?? [];
}
async function setQueue(items: Lead[]) { await storage.setItem(QUEUE_KEY, items); }

async function flushQueue() {
  const queue = await getQueue();
  if (queue.length === 0) return;
  const remaining: Lead[] = [];
  for (const item of queue) {
    try {
      const { id, createdAt, _pending, ...payload } = item;
      await req("/leads", { method: "POST", body: JSON.stringify(payload) });
    } catch { remaining.push(item); }
  }
  await setQueue(remaining);
}

export async function fetchLeads(): Promise<Lead[]> {
  try {
    await flushQueue();
    const leads = await req<Lead[]>("/leads");
    await storage.setItem(CACHE_KEY, leads);
    return leads;
  } catch {
    const cache = (await storage.getItem<Lead[]>(CACHE_KEY, [])) ?? [];
    const queue = await getQueue();
    return [...queue, ...cache];
  }
}

export async function fetchStats(): Promise<Stats> {
  try { return await req<Stats>("/stats"); }
  catch {
    const cache = (await storage.getItem<Lead[]>(CACHE_KEY, [])) ?? [];
    const queue = await getQueue();
    const all = [...queue, ...cache];
    const followedUp = all.filter((l) => l.followedUp).length;
    return { total: all.length, today: all.length, followedUp,
             pending: all.length - followedUp, topInterests: [] };
  }
}

export async function createLead(payload: Omit<Lead, "id" | "createdAt" | "_pending">): Promise<Lead> {
  try {
    return await req<Lead>("/leads", { method: "POST", body: JSON.stringify(payload) });
  } catch {
    const offline: Lead = { ...payload, id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(), _pending: true };
    const queue = await getQueue();
    await setQueue([offline, ...queue]);
    return offline;
  }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  return req<Lead>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
}
export async function deleteLead(id: string): Promise<void> {
  await req(`/leads/${id}`, { method: "DELETE" });
}
export async function fetchTagSuggestions(): Promise<string[]> {
  try { const data = await req<{ tags: string[] }>("/tags"); return data.tags; }
  catch { return []; }
}
