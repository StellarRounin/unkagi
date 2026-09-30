const KAGI_BANGS_URL =
  "https://raw.githubusercontent.com/kagisearch/bangs/main/data/bangs.json";

const CACHE_KEY = "unkagi:bangs";
const UPDATED_KEY = "unkagi:bangs:last-updated";

const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;

export interface KagiBang {
  s: string;
  d: string;
  t: string;
  ts?: string[];
  u: string;
  ad?: string;
  x?: string;
  c?: string;
  sc?: string;
  fmt?: string[];
}

async function fetchBangs(): Promise<KagiBang[]> {
  const response = await fetch(KAGI_BANGS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch Kagi bangs: ${response.status}`);
  }

  const bangs = await response.json();

  if (!Array.isArray(bangs)) {
    throw new Error("Invalid Kagi bangs response");
  }

  localStorage.setItem(CACHE_KEY, JSON.stringify(bangs));
  localStorage.setItem(UPDATED_KEY, Date.now().toString());

  return bangs;
}

async function updateBangsIfNeeded(): Promise<void> {
  const lastUpdated = Number(
    localStorage.getItem(UPDATED_KEY) ?? 0,
  );

  const shouldUpdate =
    Date.now() - lastUpdated >= UPDATE_INTERVAL;

  if (!shouldUpdate) {
    return;
  }

  try {
    await fetchBangs();
  } catch (error) {
    console.warn("Failed to update Kagi bangs:", error);
  }
}

export async function getBangs(): Promise<KagiBang[]> {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    try {
      const bangs: KagiBang[] = JSON.parse(cached);

      if (Array.isArray(bangs)) {
        // No bloqueamos la carga esperando a GitHub
        void updateBangsIfNeeded();

        return bangs;
      }
    } catch {
      console.warn("Invalid bangs cache, fetching again.");
    }
  }

  // Primera ejecución o cache inválido
  return fetchBangs();
}
