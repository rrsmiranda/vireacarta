/* Motor do jogo — lógica pura, sem DOM, testável com node:test.
   Fluxo da rodada: leitura → opinião (opcional) → palpite → virada → próxima.
   Pontos só na virada e só uma vez por carta (trava `travou`). */

import type {Carta, Equipe, Tema} from './data';

export type Etapa = 'leitura' | 'opiniao' | 'palpite' | 'virada';
export type Opiniao = 'boa' | 'ruim' | 'entender';

export interface Partida {
  baralho: Carta[];
  indice: number;
  etapa: Etapa;
  opiniao: Opiniao | null;
  palpite: Equipe | 'pular' | null;
  pontos: number;
  acertos: number;
  travou: boolean;
  fim: boolean;
}

/* Embaralhamento Fisher–Yates com semente reproduzível (mulberry32). */
export function rng(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(lista: T[], r: () => number): T[] {
  const out = [...lista];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* Baralho de demonstração: 10 cartas equilibradas (5 de cada equipe);
   se o acervo for menor, usa o que existir, sempre sem repetição. */
export function montarBaralho(baralho: Carta[], semente: number, tamanho = 10): Carta[] {
  const r = rng(semente);
  if (tamanho >= baralho.length) return embaralhar(baralho, r);
  const A = embaralhar(baralho.filter(c => c.equipe === 'aurora'), r);
  const O = embaralhar(baralho.filter(c => c.equipe === 'orbita'), r);
  if (A.length >= 5 && O.length >= 5 && tamanho >= 10) {
    const metade = Math.floor(tamanho / 2);
    return embaralhar([...A.slice(0, metade), ...O.slice(0, metade)], r);
  }
  return embaralhar(baralho, r).slice(0, Math.min(tamanho, baralho.length));
}

/* Partida de um tema: só as cartas daquele tema, embaralhadas. No modo "todos
   os temas" a partida fica curta: `porEquipe` limita quantas cartas vêm de cada lado. */
export function baralhoDoTema(cartas: Carta[], tema: Tema, semente: number, porEquipe?: Record<Equipe, number>): Carta[] {
  const r = rng(semente);
  const doTema = cartas.filter(c => c.tema === tema);
  if (!porEquipe) return embaralhar(doTema, r);
  const lado = (e: Equipe) => embaralhar(doTema.filter(c => c.equipe === e), r).slice(0, porEquipe[e]);
  return embaralhar([...lado('aurora'), ...lado('orbita')], r);
}

export interface Aprovacao { boas: number; total: number }

/* Afinidade do jogador num tema. Cada candidato soma a proporção de cartas suas
   marcadas como "Boa" (proporção, para o lado com mais cartas não levar vantagem)
   e mais 1 ponto se ganhou a comparação às cegas. Empate = sem vencedor. */
export function afinidade(aprov: Record<Equipe, Aprovacao>, escolha: Equipe): {vencedor: Equipe | null; pct: number} {
  const pontos = (e: Equipe) => (aprov[e].total ? aprov[e].boas / aprov[e].total : 0) + (escolha === e ? 1 : 0);
  const a = pontos('aurora'), o = pontos('orbita');
  const pctAurora = Math.round((a / (a + o)) * 100);
  if (pctAurora === 50) return {vencedor: null, pct: 50};
  return pctAurora > 50 ? {vencedor: 'aurora', pct: pctAurora} : {vencedor: 'orbita', pct: 100 - pctAurora};
}

/* Comparação às cegas: sorteia qual candidato aparece como opção A. */
export function ordemComparacao(semente: number): [Equipe, Equipe] {
  return rng(semente)() < 0.5 ? ['aurora', 'orbita'] : ['orbita', 'aurora'];
}

export function iniciar(baralho: Carta[]): Partida {
  return {baralho, indice: 0, etapa: 'leitura', opiniao: null, palpite: null, pontos: 0, acertos: 0, travou: false, fim: false};
}

export const cartaAtual = (p: Partida): Carta | null => p.baralho[p.indice] ?? null;

export type Acao =
  | {tipo: 'iniciarOpiniao'}
  | {tipo: 'opiniao'; valor: Opiniao}
  | {tipo: 'pularOpiniao'}
  | {tipo: 'palpite'; valor: Equipe}
  | {tipo: 'pularCarta'}
  | {tipo: 'virar'}
  | {tipo: 'proxima'};

export function avancar(p: Partida, acao: Acao): Partida {
  const c = cartaAtual(p);
  if (!c || p.fim) return p;

  switch (acao.tipo) {
    case 'iniciarOpiniao':
      if (p.etapa !== 'leitura') return p;
      return {...p, etapa: 'opiniao'};

    case 'opiniao':
      if (p.etapa !== 'opiniao') return p;
      return {...p, opiniao: acao.valor, etapa: 'palpite'};

    case 'pularOpiniao':
      if (p.etapa !== 'leitura' && p.etapa !== 'opiniao') return p;
      return {...p, etapa: 'palpite'};

    case 'palpite':
      if (p.etapa !== 'palpite') return p;
      return {...p, palpite: acao.valor};

    case 'pularCarta':
      if (p.etapa !== 'palpite' || p.travou) return p;
      return {...p, palpite: 'pular', etapa: 'virada', travou: true};

    /* A pontuação acontece exatamente aqui — e só aqui. */
    case 'virar': {
      if (p.etapa !== 'palpite' || p.travou || !p.palpite) return p;
      const acertou = p.palpite === c.equipe;
      const pontos = acertou ? 10 : 0;
      return {
        ...p,
        etapa: 'virada',
        travou: true,
        pontos: p.pontos + pontos,
        acertos: p.acertos + (acertou ? 1 : 0)
      };
    }

    case 'proxima': {
      if (p.etapa !== 'virada') return p;
      const ultimo = p.indice + 1 >= p.baralho.length;
      if (ultimo) return {...p, fim: true};
      return {...p, indice: p.indice + 1, etapa: 'leitura', opiniao: null, palpite: null, travou: false};
    }
  }
}

export const percentual = (p: Partida): number =>
  p.baralho.length ? Math.round((p.acertos / p.baralho.length) * 100) : 0;

export function elogio(p: Partida): string {
  const pct = percentual(p);
  if (pct === 100) return 'Placar cheio! Você conhece o baralho.';
  if (pct >= 70) return 'Mandou bem. Quase perfeito.';
  if (pct >= 40) return 'Boa rodada — dá para melhorar.';
  return 'Baralho novo, nova chance.';
}
