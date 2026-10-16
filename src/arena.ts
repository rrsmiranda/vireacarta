/* Praça cívica: cenário fixo, sem partículas ou efeitos da arena neon. */
export const CAMADAS = [
  {nome: 'brasilia', slot: 'art/cenario_brasilia.webp'}
];

/* Procura o slot em vários formatos (webp primeiro, png como fallback). */
export function urlsArte(slot: string, baseUrl: string): string[] {
  const base = baseUrl + slot.replace(/\.(webp|png)$/i, '');
  return ['.webp', '.png'].map(ext => base + ext);
}

async function acharArte(base: string): Promise<string | null> {
  for (const url of urlsArte(base, import.meta.env.BASE_URL)) {
    const ok = await new Promise<boolean>(res => {
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = url;
    });
    if (ok) return url;
  }
  return null;
}

/* Mantém o gradiente CSS caso a arte não possa ser carregada. */
export async function montarArena(host: HTMLElement): Promise<void> {
  const arts = await Promise.all(CAMADAS.map(c => acharArte(c.slot)));
  const camadas = CAMADAS.map((c, i) => {
    const el = document.createElement('div');
    el.className = `alayer alayer-${c.nome}`;
    if (arts[i]) {
      el.style.backgroundImage = `url(${arts[i]})`;
      el.classList.add('com-arte');
    }
    return el;
  });
  host.replaceChildren(...camadas);
}
