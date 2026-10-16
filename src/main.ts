import './style.css';
import {
  CARTAS, EQUIPES, TEMAS, fontesDa, linkPrograma, nomeTema, rotuloPaginas,
  type Carta, type Equipe, type InfoTema, type Link, type Tema
} from './data';
import {
  afinidade, avancar, baralhoDoTema, cartaAtual, iniciar, ordemComparacao,
  type Aprovacao, type Opiniao, type Partida
} from './engine';
import {avatarSVG, iconeCategoria} from './avatar';
import {montarArena} from './arena';
import {iniciarMetricas, registrar} from './metricas';
import * as sfx from './audio';

/* ================= estado ================= */
type Tela = 'inicio' | 'temas' | 'rodada' | 'comparacao' | 'fim' | 'biblioteca' | 'ajustes';

/* Sequência de temas jogada de uma vez (um tema ou todos). */
interface Jornada {
  temas: Tema[];
  atual: number;
  /** Boa/Ruim do tema em andamento, por candidato. */
  aprovacao: Record<Equipe, Aprovacao>;
  ordem: [Equipe, Equipe];
}

/* Resultado de um tema concluído: escolha às cegas e afinidade. Fica só na memória
   da sessão; no aparelho só se guarda QUE o tema foi checado, nunca o lado. */
interface ResultadoTema { escolha: Equipe; vencedor: Equipe | null; pct: number }

interface Sessao {
  tela: Tela;
  partida: Partida | null;
  jornada: Jornada | null;
  resultados: Partial<Record<Tema, ResultadoTema>>;
  checados: Tema[];
  /** Popup do teste rápido aberto sobre a tela de temas. */
  popup: boolean;
  /** O popup já apareceu nesta visita (aparece só na primeira entrada). */
  popupVisto: boolean;
  acertos: number;
  cartas: number;
  reduce: boolean;
  som: boolean;
  musica: boolean;
}

const CHAVE = 'vire-a-carta:v2';

const S: Sessao = {
  tela: 'inicio',
  partida: null,
  jornada: null,
  resultados: {},
  checados: [],
  popup: false,
  popupVisto: false,
  acertos: 0,
  cartas: 0,
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  som: true,
  musica: true
};

function carregarPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHAVE) ?? '{}');
    if (typeof raw.reduce === 'boolean') S.reduce = raw.reduce;
    if (typeof raw.som === 'boolean') S.som = raw.som;
    if (typeof raw.musica === 'boolean') S.musica = raw.musica;
    if (Array.isArray(raw.checados)) S.checados = raw.checados.filter((t: unknown) => TEMAS.some(x => x.id === t));
  } catch { /* primeira visita */ }
  sfx.setSom(S.som);
}
function salvarPrefs() {
  try { localStorage.setItem(CHAVE, JSON.stringify({reduce: S.reduce, som: S.som, musica: S.musica, checados: S.checados})); } catch { /* sem storage */ }
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
const VIDEOS: Partial<Record<Equipe, string>> = {aurora: 'personagem_aurora.mp4?v=5', orbita: 'personagem_orbita.mp4?v=3'};

function frameAvatar(equipe: Equipe, corpoInteiro = false): string {
  const foto = `${import.meta.env.BASE_URL}art/personagem_${equipe}.jpeg?v=2`;
  const video = corpoInteiro ? VIDEOS[equipe] : undefined;
  const midia = video
    ? `<video class="av-render av-video" src="${import.meta.env.BASE_URL}art/${video}" poster="${import.meta.env.BASE_URL}art/video_${equipe}.jpg?v=2" data-capitao="${equipe}" autoplay playsinline preload="auto" aria-hidden="true"></video>`
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

/* Crédito da música de fundo, mostrado em Ajustes. */
const CREDITO_MUSICA = 'trilha original "Vire a Carta — Arena", criada com Suno para este jogo';

// Canal da comunidade divulgado na tela de ajustes.
const COMUNIDADE_URL = 'https://www.whatsapp.com/channel/0029VbCbRfD7tkj88k3soZ0Y';
// Endereço público do jogo, usado no botão de compartilhar.
const JOGO_URL = 'https://vireacarta.vercel.app/';

/* Teste rápido: os temas de bolso e dia a dia, onde a comparação mais
   aproxima o indeciso das propostas do Lula. 4 cartas em cada (3 + 1). */
const TEMAS_RAPIDO: Tema[] = ['bolso', 'trabalho', 'saude'];

/* ================= telas ================= */
function telaInicio(): string {
  return `
  <button class="music-button" data-act="toggleMusica" aria-pressed="${S.musica}" aria-label="${S.musica ? 'Desligar música' : 'Ligar música'}" title="${S.musica ? 'Desligar música' : 'Ligar música'}">${iconeMusica(S.musica)}</button>
  <button class="share-button" data-act="compartilhar" aria-label="Compartilhar o jogo" title="Compartilhar o jogo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg></button>
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

const temaAtual = (): Tema | null => S.jornada ? S.jornada.temas[S.jornada.atual] : null;

const de = (e: Equipe) => (e === 'aurora' ? 'do' : 'de');

/* Selo do tema: lado com maior afinidade e a porcentagem. */
function selo(r: ResultadoTema): string {
  return r.vencedor
    ? `<span class="selo selo-${r.vencedor}">${EQUIPES[r.vencedor].curto} ${r.pct}%</span>`
    : '<span class="selo selo-empate">DIVIDIDO 50%</span>';
}

const temasQueFaltam = (): Tema[] => TEMAS.map(t => t.id).filter(t => !S.checados.includes(t));
const rapidoFeito = (): boolean => TEMAS_RAPIDO.every(t => S.checados.includes(t));

/* Popup ao entrar na arena: puxa a pessoa para o teste rápido (bolso, trabalho e
   saúde). Para quem já fez o teste rápido, sugere os temas que faltam. */
function popupRapido(): string {
  const faltam = temasQueFaltam();
  const continuar = rapidoFeito();
  const titulo = continuar ? 'Continue o debate' : 'Comece pelo teste rápido';
  const texto = continuar
    ? `Faltam ${faltam.length} ${faltam.length > 1 ? 'temas' : 'tema'}: ${faltam.map(nomeTema).join(', ')}. Veja onde você concorda com cada candidato.`
    : 'Seu bolso, trabalho e saúde em 2 minutos. No fim, veja com qual candidato você mais concorda.';
  return `<div class="popup-fundo" data-fundo>
    <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-titulo">
      <button class="popup-x" data-act="fecharPopup" aria-label="Fechar">✕</button>
      <span class="popup-ico" aria-hidden="true">⚡</span>
      <h2 id="popup-titulo" tabindex="-1" data-focus>${titulo}</h2>
      <p>${esc(texto)}</p>
      <button class="btn-main" data-act="${continuar ? 'faltam' : 'rapido'}">${continuar ? 'JOGAR O QUE FALTA' : 'COMEÇAR AGORA'} <span aria-hidden="true">›</span></button>
      <button class="popup-outro" data-act="fecharPopup">Escolher outro tema</button>
    </div>
  </div>`;
}

function telaTemas(): string {
  const feitos = TEMAS.filter(t => S.resultados[t.id]).length;
  return `${S.popup ? popupRapido() : ''}
  <div class="hud">
    <button class="back" data-go="inicio" aria-label="Voltar ao início">‹</button>
    <div class="prog"><small>Escolha o tema</small></div>
  </div>
  <h2 class="q" tabindex="-1" data-focus>Escolha um tema</h2>
  <div class="temas" role="list">
    ${TEMAS.map(t => `
      <button class="tema-btn${S.checados.includes(t.id) ? ' checado' : ''}" role="listitem" data-tema="${t.id}">
        ${S.checados.includes(t.id) ? '<span class="tema-check" aria-label="Checado">✓</span>' : ''}
        <span class="tema-ico">${iconeCategoria(t.icone)}</span>
        <span class="tema-nome">${esc(t.nome)}</span>
        ${t.subtitulo ? `<span class="tema-sub">${esc(t.subtitulo)}</span>` : ''}
        ${S.resultados[t.id] ? selo(S.resultados[t.id]!) : `<span class="tema-qtd">${CARTAS.filter(c => c.tema === t.id).length} cartas</span>`}
      </button>`).join('')}
  </div>
  <div class="row">
    <button class="btn-ghost btn-rapido-mini" data-act="rapido">⚡ Teste rápido</button>
    <button class="btn-ghost" data-act="todos">Todos os 6 temas</button>
  </div>
  ${feitos ? `<button class="btn-ghost" data-go="fim">Ver meu resultado (${feitos} ${feitos > 1 ? 'temas' : 'tema'})</button>` : ''}
  <p class="demo-note">Em cada tema: avalie as propostas, adivinhe de quem são e, no fim, escolha o melhor caminho.</p>
  <button class="share-inline" data-act="compartilhar">Compartilhar o jogo ↗</button>
  <p class="hint" id="sharemsg" role="status"></p>`;
}

function hudRodada(p: Partida): string {
  const total = p.baralho.length;
  const i = p.indice + 1;
  const tema = temaAtual();
  return `<div class="hud">
    <button class="back" data-act="sair" aria-label="Sair da partida">✕</button>
    <div class="prog">
      <small>${tema ? esc(nomeTema(tema)) + ' · ' : 'Carta '}${i}/${total}</small>
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

const ROTULO_FONTE: Record<Link['tipo'], string> = {plano: 'Confirma', resultado: 'Resultado', critica: 'Crítica'};

/* Evidência da revelação: dado em destaque, resumo, programa oficial e imprensa. */
function evidencia(c: Carta): string {
  const novaAba = '<span class="sr">(abre em outra aba)</span>';
  return `<section class="evid" aria-label="Evidências">
    ${c.revelacao ? `<p class="evid-dado">${esc(c.revelacao)}</p>` : ''}
    <p class="evid-resumo">${esc(c.resumo)}</p>
    <a class="evidence-link" data-carta="${c.id}" data-tipo="programa" href="${esc(linkPrograma(c))}" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>
      <span>Programa oficial · ${rotuloPaginas(c)}</span><span class="ext" aria-hidden="true">↗</span>${novaAba}</a>
    ${fontesDa(c).length ? `<div class="evid-imprensa">
      <small>Na imprensa</small>
      ${fontesDa(c).map(l => `<a class="press-link" data-carta="${c.id}" data-tipo="imprensa" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"><span class="ptipo ptipo-${l.tipo}">${ROTULO_FONTE[l.tipo]}</span><b>${esc(l.veiculo)}</b><span aria-hidden="true">↗</span>${novaAba}</a>`).join('')}
    </div>` : ''}
  </section>`;
}

function telaComparacao(): string {
  const j = S.jornada!;
  const tema = temaAtual()!;
  const info = TEMAS.find(t => t.id === tema)!;
  const r = S.resultados[tema];
  const escolha = r?.escolha;
  const opcoes = j.ordem.map((e, i) => {
    const letra = i === 0 ? 'A' : 'B';
    const nome = escolha ? `<span class="cmp-nome cmp-${e}">${EQUIPES[e].curto}</span>` : '';
    return `<button class="cmp-opt${escolha === e ? ' escolhida' : ''}" data-comparar="${e}" aria-pressed="${escolha === e}" ${escolha ? 'disabled' : ''}>
      <span class="cmp-letra" aria-hidden="true">${letra}</span>
      <span class="cmp-txt">${esc(info.comparacao[e])}</span>${nome}
    </button>`;
  }).join('');
  const ultimo = j.atual + 1 >= j.temas.length;
  const avancar = !ultimo
    ? '<button class="btn-main" data-act="proximoTema" data-focus>PRÓXIMO TEMA <span aria-hidden="true">›</span></button>'
    : j.temas.length > 1
      ? '<button class="btn-main" data-act="proximoTema" data-focus>VER RESULTADO <span aria-hidden="true">›</span></button>'
      : `<button class="btn-main" data-go="temas" data-focus>ESCOLHER OUTRO TEMA <span aria-hidden="true">›</span></button>
         <button class="btn-ghost" data-go="fim">Ver meu resultado</button>`;
  return `
  <div class="hud">
    <button class="back" data-act="sair" aria-label="Sair da partida">✕</button>
    <div class="prog"><small>Comparação às cegas</small></div>
  </div>
  <h2 class="q" tabindex="-1" data-focus>Qual caminho você prefere para <span class="q-tema">${esc(info.nome.toLowerCase())}</span>?</h2>
  <p class="hint">${escolha ? 'Agora você sabe de quem é cada proposta.' : 'Os nomes só aparecem depois da sua escolha.'}</p>
  <div class="cmp" role="group" aria-label="Opções">${opcoes}</div>
  ${r ? `${carimbo(r, info.nome)}
  ${blocoEmJogo([info])}
  ${avancar}` : ''}`;
}

/* "O que está em jogo para você": o que cada plano garante no tema. */
function blocoEmJogo(temas: InfoTema[], titulo = 'O que está em jogo para você'): string {
  const linhas = temas.flatMap(t => t.emJogo).map(l => `
    <li>
      <b class="ej-item">${esc(l.item)}</b>
      <span class="ej-lado ej-lula"><span class="ej-ico" aria-hidden="true">✔</span><span><b>Lula:</b> ${esc(l.lula)}</span></span>
      <span class="ej-lado ej-flavio"><span class="ej-ico" aria-hidden="true">✘</span><span><b>Flávio:</b> ${esc(l.flavio)}</span></span>
    </li>`).join('');
  return `<section class="em-jogo" aria-label="${esc(titulo)}"><h3>${esc(titulo)}</h3><ul>${linhas}</ul>
    <p class="ej-nota">Conforme os programas de governo registrados no TSE.</p></section>`;
}

/* Carimbo de tema concluído: "Checado!" e o lado com maior afinidade. */
function carimbo(r: ResultadoTema, nome: string): string {
  const texto = r.vencedor
    ? `Em ${esc(nome.toLowerCase())}, você está mais para <b>${EQUIPES[r.vencedor].nome}</b>`
    : `Em ${esc(nome.toLowerCase())}, você está dividido`;
  return `<div class="carimbo${r.vencedor ? ' carimbo-' + r.vencedor : ''}" role="status">
    <span class="carimbo-check">✓ CHECADO!</span>
    <span class="carimbo-txt">${texto}</span>
    <span class="carimbo-pct">${r.pct}%</span>
    <span class="carimbo-esc">Na comparação, você escolheu a proposta ${de(r.escolha)} ${EQUIPES[r.escolha].nome}.</span>
  </div>`;
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
      <button class="btn-main" data-act="proxima" data-focus>${p.indice + 1 < p.baralho.length ? 'PRÓXIMA CARTA' : 'COMPARAR CAMINHOS'} <span aria-hidden="true">›</span></button>
      ${evidencia(c)}
`;
  }
  return `${cabecalho}
    <div class="stage"><div class="card3d" id="card">${frenteCarta(c)}</div></div>
    <p class="opinion-q" id="opinion-q" tabindex="-1" data-focus>Essa proposta é…</p>
    <div class="opinion-actions" role="group" aria-labelledby="opinion-q">
      <button class="opt" data-opiniao="boa">Boa</button>
      <button class="opt" data-opiniao="ruim">Ruim</button>
    </div>`;
}

function frenteCarta(c: Carta): string {
  const longa = c.texto.length > 92;
  const info = TEMAS.find(t => t.id === c.tema)!;
  return `
    <div class="face face-front">
      <span class="suit tl" aria-hidden="true">♠</span><span class="suit br" aria-hidden="true">♠</span>
      <span class="tag-cat">#${esc(info.nome.replace(/\s+/g, ''))}</span>
      <p class="prop${longa ? ' long' : ''}">${esc(c.texto)}</p>
      <span class="prop-ico">${iconeCategoria(info.icone)}</span>
    </div>`;
}

/* Placar da sessão: em quantos temas cada candidato teve a maior afinidade. */
function placarSessao() {
  const feitos = TEMAS.filter(t => S.resultados[t.id]).map(t => ({tema: t, r: S.resultados[t.id]!}));
  const lula = feitos.filter(f => f.r.vencedor === 'aurora').length;
  return {feitos, lula, total: feitos.length};
}

function telaFim(): string {
  const {feitos, lula, total} = placarSessao();
  if (!total) return telaTemas();
  const comLula = feitos.filter(f => f.r.vencedor === 'aurora').map(f => f.tema);
  const maisLula = lula > total - lula;
  const linhas = feitos.map(({tema, r}) => `<li><span>${esc(tema.nome)}</span>${selo(r)}</li>`).join('');
  const lista = (ts: InfoTema[]) => ts.map(t => `<b>${esc(t.nome.toLowerCase())}</b>`).join(', ').replace(/, ([^,]*)$/, ' e $1');
  const titulo = maisLula
    ? (total === 1
      ? `Em <b>${esc(feitos[0].tema.nome)}</b>, você está mais para o <b class="res-aurora">Lula</b> (${feitos[0].r.pct}%).`
      : `Você está mais para o <b class="res-aurora">Lula</b> em <b class="res-num">${lula} de ${total}</b> temas.`)
    : comLula.length
      ? `Você concorda com o <b class="res-aurora">Lula</b> em ${lista(comLula)}.`
      : 'Nos temas que você jogou, ficou mais perto do Flávio.';
  const apoio = maisLula
    ? 'Suas escolhas às cegas batem com as propostas do Lula.'
    : comLula.length
      ? `${comLula.length > 1 ? 'Nesses temas' : 'Nesse tema'}, o caminho que você escolheu às cegas é o do plano do Lula. Veja abaixo o que está em jogo.`
      : 'Antes de decidir, veja o que cada plano garante para você.';
  const restantes = TEMAS.length - total;
  return `
  ${hudSimples()}
  <div class="panel res-panel" style="text-align:center;align-items:center">
    <h2>Resultado</h2>
    <p class="res-txt">${titulo}</p>
    <p>${apoio}</p>
    ${total > 1 ? `<ul class="res-lista">${linhas}</ul>` : ''}
    <p>Você acertou de quem era a proposta em ${S.acertos} de ${S.cartas} cartas.</p>
  </div>
  ${blocoEmJogo(feitos.map(f => f.tema))}
  ${maisLula ? '' : '<p class="mudar">Mudar de ideia depois de comparar é coisa de quem pensa por conta própria. O voto é seu.</p>'}
  <button class="btn-main btn-share" data-act="compartilhar" data-focus>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
    ${maisLula ? 'COMPARTILHAR O JOGO' : 'ENVIE A QUEM NÃO DECIDIU'}</button>
  <p class="hint" id="sharemsg" role="status"></p>
  <div class="row">
    <button class="btn-ghost" data-go="temas">${restantes ? `Jogar mais ${restantes} ${restantes > 1 ? 'temas' : 'tema'}` : 'Voltar aos temas'}</button>
    <button class="btn-ghost" data-go="biblioteca">Ver todas as propostas</button>
  </div>
  ${maisLula ? `<div class="panel">
    <p class="comunidade-txt">Quer acompanhar e saber mais das propostas? Acesse a comunidade.</p>
    ${linkComunidade()}
  </div>` : ''}`;
}

function telaBiblioteca(): string {
  return `
  ${hudSimples()}
  <div class="panel">
    <h2>Todas as cartas</h2>
    <p>Propostas dos programas de governo registrados no TSE, por tema. Busque por texto ou tema.</p>
    <label for="q" class="sr">Buscar cartas</label>
    <input type="text" id="q" placeholder="Buscar por texto ou tema…">
  </div>
  <div class="lib" id="lib">
    ${TEMAS.map(t => CARTAS.filter(c => c.tema === t.id).map(c => `
      <div class="lib-item" data-busca="${esc((c.texto + ' ' + t.nome).toLowerCase())}">
        <span class="t">${esc(c.texto)}</span>
        <span class="m">
          <span class="pill pill-${c.equipe}">${EQUIPES[c.equipe].curto}</span>
          <span>${esc(t.nome)}</span>
          <a class="lib-fonte" data-carta="${c.id}" data-tipo="programa" href="${esc(linkPrograma(c))}" target="_blank" rel="noopener noreferrer">Programa, ${rotuloPaginas(c)} ↗<span class="sr">(abre em outra aba)</span></a>
        </span>
      </div>`).join('')).join('')}
  </div>`;
}

function linkComunidade(): string {
  return `<a class="whatsapp-link" href="${COMUNIDADE_URL}" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>
      <span>EXÉRCITO DO LULA no WhatsApp</span><span aria-hidden="true">↗</span><span class="sr">(abre em outra aba)</span>
    </a>`;
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
    <div class="set-row">
      <span>Música</span>
      <button class="switch" data-act="toggleMusica" aria-pressed="${S.musica}" aria-label="Ativar ou desativar a música"></button>
    </div>
  </div>
  <div class="panel">
    <h3>Sobre este baralho</h3>
    <p class="comunidade-txt">Quer acompanhar e saber mais das propostas? Acesse a comunidade.</p>
    ${linkComunidade()}
  </div>
  <div class="panel">
    <h3>Avisos</h3>
    <p>As imagens e os vídeos dos candidatos foram feitos com inteligência artificial.</p>
    ${CREDITO_MUSICA ? `<p>Música: ${esc(CREDITO_MUSICA)}.</p>` : ''}
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
    temas: telaTemas,
    rodada: () => telaRodada(S.partida!),
    comparacao: telaComparacao,
    fim: telaFim,
    biblioteca: telaBiblioteca,
    ajustes: telaAjustes
  };
  app.dataset.tela = S.tela;
  app.innerHTML = telas[S.tela]();
  ligar();
  // Foco automático para leitor de tela, sem o contorno visual: em telas de escolha
  // ele vai para a pergunta, nunca para uma opção (não pode parecer pré-marcada).
  if (foco) app.querySelector<HTMLElement>('[data-focus]')?.focus({preventScroll: true, focusVisible: false} as FocusOptions);
  atualizarMusica();
}

/* ================= eventos ================= */
function irPara(tela: Tela) {
  S.tela = tela;
  render();
  // O body é quem rola (overflow-x no body), então zera os dois ao trocar de tela.
  window.scrollTo({top: 0});
  document.body.scrollTop = 0;
}

/* O popup entra no histórico: o botão Voltar do celular o fecha sem sair da tela. */
function abrirPopup() {
  S.popup = true;
  S.popupVisto = true;
  registrar('popup_rapido');
  try { history.pushState({popup: true}, ''); } catch { /* sem histórico */ }
}
function fecharPopup(redesenhar = true) {
  if (!S.popup) return;
  S.popup = false;
  if (history.state?.popup) history.back();
  if (redesenhar) render();
}
addEventListener('popstate', () => { if (S.popup) { S.popup = false; render(); } });
addEventListener('keydown', e => { if (e.key === 'Escape' && S.popup) fecharPopup(); });

const novaSemente = () => (Date.now() ^ (Math.random() * 1e9)) >>> 0;

const aprovacaoVazia = (): Record<Equipe, Aprovacao> => ({aurora: {boas: 0, total: 0}, orbita: {boas: 0, total: 0}});

/* Com mais de um tema (teste rápido ou todos), cada tema tem 4 cartas (3 do Lula e 1 do Flávio). */
const CURTO: Record<Equipe, number> = {aurora: 3, orbita: 1};

/* Começa uma jornada: um tema só ou todos, na ordem de TEMAS. */
function iniciarJornada(temas: Tema[]) {
  S.jornada = {temas, atual: 0, aprovacao: aprovacaoVazia(), ordem: ['aurora', 'orbita']};
  registrar('jogo_iniciado', {temas: temas.length === 1 ? temas[0] : temas.length === TEMAS.length ? 'todos' : 'rapido'});
  comecarTema();
}

function comecarTema() {
  const j = S.jornada!;
  const tema = temaAtual()!;
  delete S.resultados[tema]; // jogar de novo refaz o resultado do tema
  j.aprovacao = aprovacaoVazia();
  S.partida = iniciar(baralhoDoTema(CARTAS, tema, novaSemente(), j.temas.length > 1 ? CURTO : undefined));
  registrar('tema_iniciado', {tema});
  irPara('rodada');
}

/* Fim das cartas do tema: soma os acertos e abre a comparação às cegas. */
function concluirCartasDoTema(p: Partida) {
  S.acertos += p.acertos;
  S.cartas += p.baralho.length;
  S.jornada!.ordem = ordemComparacao(novaSemente());
  irPara('comparacao');
}

function ligar() {
  /* navegação por tela */
  app.querySelectorAll<HTMLElement>('[data-go]').forEach(b => {
    b.onclick = () => { sfx.somClique(); irPara(b.dataset.go as Tela); };
  });

  /* toque fora do popup fecha */
  const fundo = app.querySelector<HTMLElement>('[data-fundo]');
  if (fundo) fundo.onclick = e => { if (e.target === fundo) fecharPopup(); };

  /* escolha de tema */
  app.querySelectorAll<HTMLElement>('[data-tema]').forEach(b => {
    b.onclick = () => { sfx.somClique(); iniciarJornada([b.dataset.tema as Tema]); };
  });

  /* comparação às cegas */
  app.querySelectorAll<HTMLElement>('[data-comparar]').forEach(b => {
    b.onclick = () => {
      const j = S.jornada;
      const tema = temaAtual();
      if (!j || !tema || S.resultados[tema]) return;
      const escolha = b.dataset.comparar as Equipe;
      const r = {escolha, ...afinidade(j.aprovacao, escolha)};
      S.resultados[tema] = r;
      if (!S.checados.includes(tema)) { S.checados.push(tema); salvarPrefs(); }
      registrar('comparacao', {tema, escolha: EQUIPES[escolha].nome, afinidade: r.vencedor ? EQUIPES[r.vencedor].nome : 'dividido'});
      sfx.somAcerto();
      render();
      app.querySelector('.carimbo')?.scrollIntoView({block: 'center', behavior: S.reduce ? 'auto' : 'smooth'});
      say(r.vencedor ? `Checado! Você está mais para ${EQUIPES[r.vencedor].nome}, ${r.pct}%.` : 'Checado! Você está dividido neste tema.');
    };
  });

  /* opinião */
  app.querySelectorAll<HTMLElement>('[data-opiniao]').forEach(b => {
    b.onclick = () => {
      sfx.somClique();
      if (!S.partida || !['leitura', 'opiniao'].includes(S.partida.etapa)) return;
      S.partida = avancar(avancar(S.partida, {tipo: 'iniciarOpiniao'}), {tipo: 'opiniao', valor: b.dataset.opiniao as Opiniao});
      const lado = S.jornada?.aprovacao[cartaAtual(S.partida)!.equipe];
      if (lado) { lado.total++; if (b.dataset.opiniao === 'boa') lado.boas++; }
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
      if (a === 'toggleMusica') { S.musica = !S.musica; salvarPrefs(); render(false); return; }
      if (a === 'toggleSom') { S.som = !S.som; sfx.setSom(S.som); salvarPrefs(); render(false); if (S.som) sfx.somEscolha(); return; }
      if (a === 'sair') { registrarAbandono(); S.partida = null; S.jornada = null; sfx.somClique(); irPara('temas'); return; }
      if (a === 'iniciar') {
        sfx.somClique();
        // Popup só na primeira entrada da visita e enquanto houver tema por jogar.
        if (!S.popupVisto && temasQueFaltam().length) abrirPopup();
        irPara('temas');
        return;
      }
      if (a === 'fecharPopup') { fecharPopup(); return; }
      if (a === 'faltam') { sfx.somClique(); fecharPopup(false); iniciarJornada(temasQueFaltam()); return; }
      if (a === 'todos') { sfx.somClique(); iniciarJornada(TEMAS.map(t => t.id)); return; }
      if (a === 'rapido') { sfx.somClique(); fecharPopup(false); iniciarJornada([...TEMAS_RAPIDO]); return; }
      if (a === 'proximoTema') {
        const j = S.jornada;
        if (!j) return;
        sfx.somClique();
        if (j.atual + 1 < j.temas.length) { j.atual++; comecarTema(); return; }
        const {lula, total} = placarSessao();
        registrar('partida_concluida', {temas: total, lula, acertos: S.acertos, cartas: S.cartas});
        sfx.somFim(); irPara('fim');
        return;
      }
      if (a === 'compartilhar') { compartilharJogo(S.tela); return; }
      if (a === 'proxima' && p) {
        sfx.somClique();
        S.partida = avancar(p, {tipo: 'proxima'});
        if (S.partida.fim) concluirCartasDoTema(S.partida);
        else render();
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

/* ================= compartilhar ================= */
// Texto neutro, que desperta curiosidade: chega bem até em quem ainda não decidiu.
const TEXTO_CONVITE = 'Fiz um teste às cegas comparando as propostas do Lula e do Flávio para presidente. Faz e me conta o que deu:';

// No celular abre o menu de compartilhar do aparelho (WhatsApp etc.); senão, copia o convite.
function compartilharJogo(onde: string) {
  registrar('compartilhar', {onde});
  const alvo = document.getElementById('sharemsg');
  const avisar = (t: string) => { if (alvo) alvo.textContent = t; };
  const copiar = () => navigator.clipboard?.writeText(`${TEXTO_CONVITE} ${JOGO_URL}`).then(
    () => avisar('Convite copiado! É só colar no WhatsApp.'),
    () => avisar(`${TEXTO_CONVITE} ${JOGO_URL}`)
  ) ?? avisar(`${TEXTO_CONVITE} ${JOGO_URL}`);
  if (navigator.share) {
    navigator.share({title: 'Vire a Carta', text: TEXTO_CONVITE, url: JOGO_URL})
      .catch(e => { if ((e as DOMException).name !== 'AbortError') copiar(); });
  } else {
    copiar();
  }
}

/* ================= música ================= */
// Toca em todo o jogo: mais alta na tela inicial, baixinha durante a partida e quase
// muda enquanto o vídeo de um candidato está tocando. O volume passa por um GainNode
// (Web Audio) porque o Safari do iPhone ignora a propriedade volume do <audio>.
const musica = new Audio(`${import.meta.env.BASE_URL}audio/musica-inicio.m4a?v=2`);
musica.loop = true;
musica.preload = 'auto';
// Trilha "Vire a Carta — Arena" (Suno): tela inicial mais baixa que a trilha anterior.
const VOLUME = {inicio: 0.28, jogo: 0.18, video: 0.04};

let ctxAudio: AudioContext | null = null;
let ganho: GainNode | null = null;
function prepararAudio() {
  if (ctxAudio) return;
  try {
    ctxAudio = new AudioContext();
    ganho = ctxAudio.createGain();
    ganho.gain.value = 0;
    ctxAudio.createMediaElementSource(musica).connect(ganho).connect(ctxAudio.destination);
  } catch { ctxAudio = null; ganho = null; }
}

function videoTocando(): boolean {
  const v = app.querySelector<HTMLVideoElement>('video.av-video');
  return !!v && !v.paused && !v.ended;
}

// Ajusta volume (com transição suave) e play/pause conforme a tela e o vídeo.
function atualizarMusica() {
  const tocar = S.musica && document.visibilityState === 'visible';
  if (!tocar) { if (!musica.paused) musica.pause(); return; }
  prepararAudio();
  if (ctxAudio?.state === 'suspended') ctxAudio.resume().catch(() => {});
  const alvo = videoTocando() ? VOLUME.video : S.tela === 'inicio' ? VOLUME.inicio : VOLUME.jogo;
  if (ganho && ctxAudio) ganho.gain.setTargetAtTime(alvo, ctxAudio.currentTime, 0.25);
  else musica.volume = alvo;
  if (musica.paused) musica.play().catch(() => { /* aguarda o primeiro toque */ });
}
// O navegador só libera som após um toque: cada toque tenta iniciar, se for o caso.
addEventListener('pointerdown', atualizarMusica, true);
addEventListener('keydown', atualizarMusica, true);
document.addEventListener('visibilitychange', atualizarMusica);
// Vídeo do candidato começou ou terminou: abaixa ou devolve o volume.
for (const ev of ['play', 'playing', 'pause', 'ended']) {
  app.addEventListener(ev, e => { if ((e.target as Element).matches?.('video.av-video')) atualizarMusica(); }, true);
}

function iconeMusica(ligada: boolean): string {
  const ondas = ligada
    ? '<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'
    : '<path d="m16 9 6 6"/><path d="m22 9-6 6"/>';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4Z" fill="currentColor"/>${ondas}</svg>`;
}

/* ================= métricas ================= */
// Partida interrompida antes do fim: em qual carta a pessoa parou.
function registrarAbandono() {
  const p = S.partida;
  if (S.tela === 'rodada' && p && !p.fim) registrar('abandono', {tema: temaAtual() ?? '', carta_numero: p.indice + 1});
}
// Fechar a aba ou sair do app no meio da partida também conta como abandono.
addEventListener('pagehide', registrarAbandono);
// Cliques nos links externos (programa oficial, imprensa e comunidade).
app.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-tipo], a.whatsapp-link');
  if (!link) return;
  if (link.dataset.tipo) registrar('clique_fonte', {carta: Number(link.dataset.carta), tipo: link.dataset.tipo});
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
