import './style.css';
import {CARTAS, CATEGORIAS, EQUIPES, type Carta, type Equipe} from './data';
import {
  avancar, cartaAtual, elogio, iniciar, montarBaralho, percentual,
  type Opiniao, type Partida
} from './engine';
import {avatarSVG, iconeCategoria} from './avatar';
import {montarArena} from './arena';
import {iniciarMetricas, registrar} from './metricas';
import * as sfx from './audio';

/* ================= estado ================= */
type Tela = 'inicio' | 'rodada' | 'fim' | 'biblioteca' | 'ajustes';

interface Sessao {
  tela: Tela;
  partida: Partida | null;
  reduce: boolean;
  som: boolean;
}

const CHAVE = 'vire-a-carta:v2';

const S: Sessao = {
  tela: 'inicio',
  partida: null,
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  som: true
};

function carregarPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAVE) ?? '{}');
    if (typeof raw.reduce === 'boolean') S.reduce = raw.reduce;
    if (typeof raw.som === 'boolean') S.som = raw.som;
  } catch { /* primeira visita */ }
  sfx.setSom(S.som);
}
function salvarPrefs() {
  try { localStorage.setItem(CHAVE, JSON.stringify({reduce: S.reduce, som: S.som})); } catch { /* sem storage */ }
}

/* ================= DOM base ================= */
const app = document.querySelector<HTMLDivElement>('#app')!;
const arenaHost = document.querySelector<HTMLDivElement>('#arena')!;
const live = document.querySelector<HTMLDivElement>('#live')!;

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => (
  {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'} as Record<string, string>
)[c]!);
const say = (t: string) => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };

/* ================= avatares ================= */
// Vídeos de corpo inteiro exibidos na revelação, no lugar da foto. Os dois têm o mesmo
// formato (1152x720, laterais estendidas com o fundo) para preencher o quadro da carta.
const VIDEOS: Partial<Record<Equipe, string>> = {aurora: 'personagem_aurora.mp4?v=4', orbita: 'personagem_orbita.mp4?v=2'};

function frameAvatar(equipe: Equipe, corpoInteiro = false): string {
  const foto = `${import.meta.env.BASE_URL}art/personagem_${equipe}.jpeg?v=2`;
  const video = corpoInteiro ? VIDEOS[equipe] : undefined;
  const midia = video
    ? `<video class="av-render av-video" src="${import.meta.env.BASE_URL}art/${video}" poster="${import.meta.env.BASE_URL}art/video_${equipe}.jpg?v=1" data-capitao="${equipe}" autoplay playsinline preload="auto" aria-hidden="true"></video>`
    : `<img class="av-render" src="${foto}" data-capitao="${equipe}" alt="" aria-hidden="true" decoding="async">`;
  return `<div class="frame ${corpoInteiro ? 'fullbody' : 'portrait'}">${avatarSVG[equipe]()}${midia}</div>`;
}

// Chamado dentro do toque do palpite, para o navegador liberar o áudio.
function tocarVideoRevelacao() {
  const v = app.querySelector<HTMLVideoElement>('video.av-video');
  if (!v) return;
  // Áudio do vídeo sempre ligado; só fica mudo se o navegador bloquear o som.
  v.muted = false;
  v.play().catch(() => { v.muted = true; v.play().catch(() => { /* fica o pôster */ }); });
}

// A mesma imagem original é enquadrada por CSS: retrato ou corpo inteiro.
app.addEventListener('load', event => {
  const img = event.target;
  if (img instanceof HTMLImageElement && img.matches('.av-render')) {
    img.parentElement?.classList.add('com-render');
  }
}, true);
app.addEventListener('loadeddata', event => {
  const v = event.target;
  if (v instanceof HTMLVideoElement) v.parentElement?.classList.add('com-render');
}, true);
app.addEventListener('error', event => {
  const img = event.target;
  // Vídeo indisponível: volta para a foto.
  if (img instanceof HTMLVideoElement) {
    const foto = document.createElement('img');
    foto.className = 'av-render';
    foto.src = img.poster;
    foto.dataset.capitao = img.dataset.capitao ?? '';
    foto.alt = '';
    foto.setAttribute('aria-hidden', 'true');
    img.replaceWith(foto);
    return;
  }
  if (!(img instanceof HTMLImageElement) || !img.matches('.av-render')) return;
  const tentativa = Number(img.dataset.tentativa ?? 0);
  img.parentElement?.classList.add('fallback-art');
  if (tentativa < 2) {
    img.dataset.tentativa = String(tentativa + 1);
    img.src = `${import.meta.env.BASE_URL}art/busto_${img.dataset.capitao}.${tentativa === 0 ? 'webp' : 'png'}`;
  } else {
    img.parentElement?.classList.remove('com-render');
    img.remove();
  }
}, true);

// Canal da comunidade divulgado na tela de ajustes.
const COMUNIDADE_URL = 'https://www.whatsapp.com/channel/0029VbCbRfD7tkj88k3soZ0Y';

/* ================= telas ================= */
function telaInicio(): string {
  return `
  <button class="settings-button" data-go="ajustes" aria-label="Ajustes" title="Ajustes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 3-.5 3-2 1-2.5-1-2 4 2.5 2v2L2 16l2 4 3-1 2 1 .5 2h5l.5-2 2-1 3 1 2-4-2.5-2v-2l2.5-2-2-4-2.5 1-2-1-.5-3Z"/><circle cx="12" cy="12" r="3"/></svg></button>
  <header class="logo" aria-label="Vire a Carta — Presidente 2026">
    <svg class="crown" viewBox="0 0 48 32" fill="currentColor" aria-hidden="true">
      <path d="M4 26 L2 8 L14 16 L24 4 L34 16 L46 8 L44 26 Z"/>
      <rect x="4" y="27" width="40" height="4" rx="2"/>
    </svg>
    <span class="l1">VIRE A</span><span class="l2">CARTA</span>
    <span class="seal">PRESIDENTE 2026</span>
  </header>

  <section class="hero" aria-label="Os dois candidatos do baralho">
    <div class="duel">
      <div class="fighter fighter-aurora">${frameAvatar('aurora')}<span class="name">${EQUIPES.aurora.curto}</span></div>
      <div class="vs" aria-hidden="true">VS</div>
      <div class="fighter fighter-orbita">${frameAvatar('orbita')}<span class="name">${EQUIPES.orbita.curto}</span></div>
    </div>
    <p class="tagline">Descubra <b>quem defende</b><br>cada proposta</p>
  </section>

  <button class="btn-main" data-act="iniciar" data-focus>ENTRAR NA ARENA <span aria-hidden="true">›</span></button>
  <p class="demo-note">Propostas dos candidatos à Presidência</p>`;
}

function hudSimples(): string {
  return `<div class="hud">
    <button class="back" data-go="inicio" aria-label="Voltar ao início">‹</button>
    <div class="prog"><small>Vire a Carta</small><div class="bar"><i style="width:0"></i></div></div>
  </div>`;
}

function hudRodada(p: Partida): string {
  const total = p.baralho.length;
  const i = p.indice + 1;
  return `<div class="hud">
    <button class="back" data-act="sair" aria-label="Sair da partida">✕</button>
    <div class="prog">
      <small>Carta ${i} de ${total}</small>
      <div class="bar"><i style="width:${((p.indice) / total) * 100}%"></i></div>
    </div>
    <div class="score" aria-label="Acertos">${p.acertos}<small>ACERTOS</small></div>
  </div>`;
}

function pickBotoes(p: Partida): string {
  const escolhido = p.palpite && p.palpite !== 'pular' ? p.palpite : null;
  return `
  <div class="pick${escolhido ? ' has-choice' : ''}" role="group" aria-label="Escolha o candidato">
    ${(['aurora', 'orbita'] as const).map(e => `
      <button class="pick-btn pick-btn-${e}" data-palpite="${e}" aria-pressed="${escolhido === e}">
        ${frameAvatar(e)}<span class="pname">${EQUIPES[e].curto}</span>
      </button>`).join('')}
  </div>`;
}

function evidencia(c: Carta): string {
  return `<a class="evidence-link" data-carta="${c.id}" href="${esc(c.fonteUrl)}" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>
    <span>Consultar fonte</span><span class="ext" aria-hidden="true">↗</span><span class="sr">(abre em outra aba)</span></a>`;
}

function telaRodada(p: Partida): string {
  const c = cartaAtual(p)!;
  const cabecalho = `${hudRodada(p)}<p class="demo-note">Propostas dos candidatos à Presidência</p>`;
  if (p.etapa === 'palpite') {
    return `${cabecalho}<section class="guess-stage">
      <h2 class="q" tabindex="-1" data-focus>De quem é essa proposta?</h2>
      <p class="proposal-reminder">${esc(c.texto)}</p>
      ${pickBotoes(p)}
      <p class="hint">Toque em um personagem para revelar.</p>
    </section>`;
  }
  if (p.etapa === 'virada') {
    const acertou = p.palpite === c.equipe;
    return `${cabecalho}
      <div class="stage"><div class="card3d flipped" id="card">
        ${frenteCarta(c)}
        <div class="face face-back result-fullbody">
          ${frameAvatar(c.equipe, true)}
          <div class="back-team ${c.equipe}">${EQUIPES[c.equipe].curto}</div>
          <div class="verdict ${acertou ? 'ok' : 'no'}">${acertou ? 'Você acertou!' : 'Desta vez, não foi.'}</div>
          ${acertou ? '<span class="plus" aria-hidden="true">+10</span>' : ''}
        </div>
      </div></div>
      ${evidencia(c)}
      <button class="btn-main" data-act="proxima" data-focus>${p.indice + 1 < p.baralho.length ? 'PRÓXIMA CARTA' : 'VER RESULTADO'} <span aria-hidden="true">›</span></button>
`;
  }
  return `${cabecalho}
    <div class="stage"><div class="card3d" id="card">${frenteCarta(c)}</div></div>
    <p class="opinion-q" id="opinion-q">Essa proposta é…</p>
    <div class="opinion-actions" role="group" aria-labelledby="opinion-q">
      <button class="opt" data-opiniao="boa" data-focus>Boa</button>
      <button class="opt" data-opiniao="ruim">Ruim</button>
    </div>`;
}

function frenteCarta(c: Carta): string {
  const longa = c.texto.length > 92;
  const categoria = CATEGORIAS[c.categoria] ?? c.categoria;
  return `
    <div class="face face-front">
      <span class="suit tl" aria-hidden="true">♠</span><span class="suit br" aria-hidden="true">♠</span>
      <span class="tag-cat">#${esc(categoria.replace(/\s+/g, ''))}</span>
      <p class="prop${longa ? ' long' : ''}">${esc(c.texto)}</p>
      <span class="prop-ico">${iconeCategoria(c.categoria)}</span>
    </div>`;
}

function telaFim(p: Partida): string {
  const pct = percentual(p);
  const temas = [...new Set(p.baralho.map(c => CATEGORIAS[c.categoria] ?? c.categoria))];
  return `
  ${hudSimples()}
  <div class="panel" style="text-align:center;align-items:center">
    <h2>Fim da partida</h2>
    <div class="big">${p.acertos}<span style="font-size:34px">/${p.baralho.length}</span></div>
    <p>${elogio(p)} · ${pct}% de acertos · +${p.pontos} pontos</p>
  </div>
  <button class="btn-main" data-act="recomecar" data-focus>JOGAR NOVAMENTE <span aria-hidden="true">›</span></button>
  <div class="row">
    <button class="btn-ghost" data-go="biblioteca">Explorar cartas</button>
    <button class="btn-ghost" data-act="compartilhar" id="btn-share">Copiar resultado</button>
  </div>
  <p class="hint" id="sharemsg" role="status"></p>
  <div class="chips">${temas.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;
}

function telaBiblioteca(): string {
  return `
  ${hudSimples()}
  <div class="panel">
    <h2>As 32 cartas</h2>
    <p>Textos e atribuições do PDF Baralho 2026. Busque por texto ou tema.</p>
    <label for="q" class="sr">Buscar cartas</label>
    <input type="text" id="q" placeholder="Buscar por texto ou tema…">
  </div>
  <div class="lib" id="lib">
    ${CARTAS.map(c => `
      <div class="lib-item" data-busca="${esc((c.texto + ' ' + c.categoria).toLowerCase())}">
        <span class="t">${esc(c.texto)}</span>
        <span class="m">
          <span class="pill pill-${c.equipe}">${EQUIPES[c.equipe].curto}</span>
          <span class="pill pill-fic">Baralho 2026</span>
          <span>${esc(CATEGORIAS[c.categoria] ?? c.categoria)}</span>
        </span>
      </div>`).join('')}
  </div>`;
}

function telaAjustes(): string {
  return `
  ${hudSimples()}
  <div class="panel">
    <h2>Ajustes</h2>
    <div class="set-row">
      <span>Animações</span>
      <button class="switch" data-act="toggleReduce" aria-pressed="${!S.reduce}" aria-label="Ativar ou desativar animações"></button>
    </div>
    <div class="set-row">
      <span>Sons</span>
      <button class="switch" data-act="toggleSom" aria-pressed="${S.som}" aria-label="Ativar ou desativar sons"></button>
    </div>
  </div>
  <div class="panel">
    <h3>Sobre este baralho</h3>
    <p class="comunidade-txt">Quer acompanhar e saber mais das propostas? Acesse a comunidade.</p>
    <a class="whatsapp-link" href="${COMUNIDADE_URL}" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>
      <span>EXÉRCITO DO LULA no WhatsApp</span><span aria-hidden="true">↗</span><span class="sr">(abre em outra aba)</span>
    </a>
  </div>
  <div class="panel">
    <h3>Privacidade</h3>
    <p>Coletamos apenas estatísticas anônimas de uso (cartas jogadas, respostas e cliques) para entender e melhorar o jogo. Não usamos cookies e não coletamos nome, contato ou qualquer dado que identifique você. Suas preferências ficam salvas só neste aparelho.</p>
  </div>
  `;
}

/* ================= render ================= */
function render(foco = true) {
  document.documentElement.classList.toggle('reduce', S.reduce);
  const telas: Record<Tela, () => string> = {
    inicio: telaInicio,
    rodada: () => telaRodada(S.partida!),
    fim: () => telaFim(S.partida!),
    biblioteca: telaBiblioteca,
    ajustes: telaAjustes
  };
  app.dataset.tela = S.tela;
  app.innerHTML = telas[S.tela]();
  ligar();
  if (foco) app.querySelector<HTMLElement>('[data-focus]')?.focus({preventScroll: true});
}

/* ================= eventos ================= */
function irPara(tela: Tela) {
  S.tela = tela;
  render();
  window.scrollTo({top: 0});
}

function iniciarPartida() {
  const semente = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  S.partida = iniciar(montarBaralho(CARTAS, semente, CARTAS.length));
  registrar('jogo_iniciado');
  irPara('rodada');
}

function ligar() {
  /* navegação por tela */
  app.querySelectorAll<HTMLElement>('[data-go]').forEach(b => {
    b.onclick = () => { sfx.somClique(); irPara(b.dataset.go as Tela); };
  });

  /* opinião */
  app.querySelectorAll<HTMLElement>('[data-opiniao]').forEach(b => {
    b.onclick = () => {
      sfx.somClique();
      if (!S.partida || !['leitura', 'opiniao'].includes(S.partida.etapa)) return;
      S.partida = avancar(avancar(S.partida, {tipo: 'iniciarOpiniao'}), {tipo: 'opiniao', valor: b.dataset.opiniao as Opiniao});
      registrar('opiniao', {carta: cartaAtual(S.partida)!.id, opiniao: b.dataset.opiniao!});
      render();
    };
  });

  /* palpite */
  app.querySelectorAll<HTMLElement>('[data-palpite]').forEach(b => {
    b.onclick = () => {
      if (!S.partida || S.partida.etapa !== 'palpite' || S.partida.travou) return;
      S.partida = avancar(avancar(S.partida, {tipo: 'palpite', valor: b.dataset.palpite as Equipe}), {tipo: 'virar'});
      const c = cartaAtual(S.partida)!;
      const acertou = S.partida.palpite === c.equipe;
      registrar('palpite', {carta: c.id, resultado: acertou ? 'acertou' : 'errou'});
      sfx.somVirada();
      setTimeout(() => { acertou ? sfx.somAcerto() : sfx.somErro(); }, 260);
      render();
      tocarVideoRevelacao();
      say(`${acertou ? 'Você acertou!' : 'Desta vez não foi.'} ${EQUIPES[c.equipe].nome}.`);
    };
  });

  /* ações */
  app.querySelectorAll<HTMLElement>('[data-act]').forEach(b => {
    b.onclick = () => {
      const a = b.dataset.act;
      const p = S.partida;
      if (a === 'toggleReduce') { S.reduce = !S.reduce; salvarPrefs(); render(false); return; }
      if (a === 'toggleSom') { S.som = !S.som; sfx.setSom(S.som); salvarPrefs(); render(false); if (S.som) sfx.somEscolha(); return; }
      if (a === 'sair') { registrarAbandono(); S.partida = null; sfx.somClique(); irPara('inicio'); return; }
      if (a === 'iniciar' || a === 'recomecar') { sfx.somClique(); iniciarPartida(); return; }
      if (!p) return;

      if (a === 'proxima') {
        sfx.somClique();
        S.partida = avancar(p, {tipo: 'proxima'});
        if (S.partida!.fim) {
          registrar('partida_concluida', {acertos: S.partida!.acertos, total: S.partida!.baralho.length});
          sfx.somFim(); irPara('fim');
        } else { render(); }
        return;
      }
      if (a === 'compartilhar') {
        const msg = `Joguei Vire a Carta: ${p.acertos}/${p.baralho.length} acertos no Baralho 2026. Você conhece as atribuições do baralho?`;
        const alvo = document.getElementById('sharemsg');
        navigator.clipboard?.writeText(msg).then(
          () => { if (alvo) alvo.textContent = 'Resultado copiado!'; },
          () => { if (alvo) alvo.textContent = msg; }
        ) ?? (alvo && (alvo.textContent = msg));
        return;
      }
    };
  });

  /* busca da biblioteca */
  const q = app.querySelector<HTMLInputElement>('#q');
  if (q) q.oninput = () => {
    const t = q.value.trim().toLowerCase();
    app.querySelectorAll<HTMLElement>('.lib-item').forEach(el => {
      el.hidden = t.length > 0 && !el.dataset.busca!.includes(t);
    });
  };
}

/* ================= métricas ================= */
// Partida interrompida antes do fim: em qual carta a pessoa parou.
function registrarAbandono() {
  const p = S.partida;
  if (S.tela === 'rodada' && p && !p.fim) registrar('abandono', {carta_numero: p.indice + 1});
}
// Fechar a aba ou sair do app no meio da partida também conta como abandono.
addEventListener('pagehide', registrarAbandono);
// Cliques nos links externos (fonte de cada carta e comunidade).
app.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a.evidence-link, a.whatsapp-link');
  if (!link) return;
  if (link.classList.contains('evidence-link')) registrar('clique_fonte', {carta: Number(link.dataset.carta)});
  else registrar('clique_whatsapp');
});

/* ================= boot ================= */
async function boot() {
  carregarPrefs();
  iniciarMetricas();
  render();

  await montarArena(arenaHost);
}

void boot();
