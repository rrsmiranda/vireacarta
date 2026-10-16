/* Métricas anônimas de uso com Umami (sem cookies, sem dados pessoais).
   Liga só no build de produção (npm run build / Vercel), com o ID do site
   "Vire a Carta" no Umami Cloud. VITE_UMAMI_WEBSITE_ID, se definido, substitui
   esse ID. Em desenvolvimento (npm run dev) nada é carregado nem enviado. */

type Dados = Record<string, string | number | boolean>;

declare global {
  interface Window { umami?: { track: (evento: string, dados?: Dados) => void } }
}

const ID_PADRAO = '03a68a9a-720f-4a4d-875a-f2ea75d1bf98';
const ID = import.meta.env.VITE_UMAMI_WEBSITE_ID || (import.meta.env.PROD ? ID_PADRAO : undefined);
const SCRIPT = import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';

export function iniciarMetricas(): void {
  if (!ID) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = SCRIPT;
  s.dataset.websiteId = ID;
  document.head.appendChild(s);
}

/* Registra um evento. Falhas de rede ou bloqueadores nunca afetam o jogo. */
export function registrar(evento: string, dados?: Dados): void {
  try { window.umami?.track(evento, dados); } catch { /* ignora */ }
}
