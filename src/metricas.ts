/* Métricas anônimas de uso com Umami (sem cookies, sem dados pessoais).
   Só liga quando VITE_UMAMI_WEBSITE_ID está definido — configurado na Vercel.
   Em desenvolvimento, sem a variável, nada é carregado nem enviado. */

type Dados = Record<string, string | number | boolean>;

declare global {
  interface Window { umami?: { track: (evento: string, dados?: Dados) => void } }
}

const ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;
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
