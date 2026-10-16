import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  afinidade, avancar, baralhoDoTema, cartaAtual, embaralhar, iniciar, montarBaralho, ordemComparacao, rng, percentual
} from '../src/engine.ts';
import {CARTAS, TEMAS, fontesDa, linkPrograma} from '../src/data.ts';
import {FONTES} from '../src/fontes.ts';

test('baralho v2: 36 cartas em 6 temas, 6 por tema (4 do Lula e 2 do Flávio), ids únicos', () => {
  assert.equal(TEMAS.length, 6);
  assert.equal(CARTAS.length, 36);
  assert.equal(new Set(CARTAS.map(c => c.id)).size, 36);
  for (const t of TEMAS) {
    const doTema = CARTAS.filter(c => c.tema === t.id);
    assert.equal(doTema.length, 6, t.id);
    assert.equal(doTema.filter(c => c.equipe === 'aurora').length, 4, t.id);
    assert.ok(t.comparacao.aurora.length > 20 && t.comparacao.orbita.length > 20);
  }
  assert.ok(CARTAS.every(c => c.texto.length > 10 && c.resumo.length > 40));
});

test('cada carta aponta para a página do programa oficial no TSE', () => {
  const maxPag = {aurora: 84, orbita: 76};
  for (const c of CARTAS) {
    assert.ok(c.paginas.length > 0 && c.paginas.every(n => n >= 1 && n <= maxPag[c.equipe]), `carta ${c.id}`);
    assert.match(linkPrograma(c), /^https:\/\/www\.tse\.jus\.br\/.+\.pdf#page=\d+$/);
  }
  assert.ok(linkPrograma(CARTAS.find(c => c.id === 1)!).includes('proposta-pt.pdf#page=75'));
  assert.ok(linkPrograma(CARTAS.find(c => c.id === 5)!).includes('proposta-pl.pdf#page=44'));
  assert.ok(Object.keys(FONTES).every(id => CARTAS.some(c => c.id === Number(id))), 'fonte sem carta');
  assert.ok(CARTAS.flatMap(fontesDa).every(l => l.url.startsWith('https://') && l.veiculo && ['plano', 'resultado', 'critica'].includes(l.tipo)));
  assert.equal(CARTAS.filter(c => c.id <= 30).filter(c => fontesDa(c).length === 0).length, 0, 'cartas 1 a 30 com imprensa');
  assert.ok(CARTAS.every(c => c.equipe === 'aurora' || !c.revelacao), 'dado de revelação só nas cartas do Lula');
});

test('partida de um tema traz só as 6 cartas daquele tema, embaralhadas', () => {
  const b = baralhoDoTema(CARTAS, 'seguranca', 99);
  assert.equal(b.length, 6);
  assert.ok(b.every(c => c.tema === 'seguranca'));
  assert.notDeepEqual(b.map(c => c.id), baralhoDoTema(CARTAS, 'seguranca', 100).map(c => c.id));
});

test('modo todos os temas: 3 cartas do Lula e 1 do Flávio por tema', () => {
  const b = baralhoDoTema(CARTAS, 'trabalho', 5, {aurora: 3, orbita: 1});
  assert.equal(b.length, 4);
  assert.equal(b.filter(c => c.equipe === 'aurora').length, 3);
  assert.ok(b.every(c => c.tema === 'trabalho'));
});

test('comparação às cegas: ordem A/B sorteada', () => {
  const ordens = new Set(Array.from({length: 40}, (_, i) => ordemComparacao(i).join()));
  assert.equal(ordens.size, 2);
});

test('afinidade: proporção de "Boa" de cada lado mais 1 ponto da comparação', () => {
  /* 4/4 Boa no Lula, 1/2 no Flávio, escolheu Lula: 2 x 0,5 = 80% Lula */
  assert.deepEqual(afinidade({aurora: {boas: 4, total: 4}, orbita: {boas: 1, total: 2}}, 'aurora'), {vencedor: 'aurora', pct: 80});
  /* mais cartas do Lula não dão vantagem: proporção igual + escolha do Flávio = Flávio */
  assert.deepEqual(afinidade({aurora: {boas: 2, total: 4}, orbita: {boas: 1, total: 2}}, 'orbita'), {vencedor: 'orbita', pct: 75});
  /* empate vira "dividido" */
  assert.deepEqual(afinidade({aurora: {boas: 0, total: 4}, orbita: {boas: 2, total: 2}}, 'aurora'), {vencedor: null, pct: 50});
  /* sem opiniões, decide a comparação */
  assert.deepEqual(afinidade({aurora: {boas: 0, total: 0}, orbita: {boas: 0, total: 0}}, 'aurora'), {vencedor: 'aurora', pct: 100});
});

test('embaralhar preserva elementos e é determinístico com a mesma semente', () => {
  const lista = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = embaralhar(lista, rng(42));
  const b = embaralhar(lista, rng(42));
  assert.deepEqual(a, b);
  assert.deepEqual([...a].sort((x, y) => x - y), lista);
});

test('partida rápida: 10 cartas equilibradas, 5 por time, sem repetição', () => {
  const baralho = montarBaralho(CARTAS, 1234, 10);
  assert.equal(baralho.length, 10);
  assert.equal(new Set(baralho.map(c => c.id)).size, 10);
  assert.equal(baralho.filter(c => c.equipe === 'aurora').length, 5);
  assert.equal(baralho.filter(c => c.equipe === 'orbita').length, 5);
});

test('acerto vale 10 pontos e acontece uma única vez por carta', () => {
  const baralho = montarBaralho(CARTAS, 7, 2);
  let p = iniciar(baralho);
  const c = cartaAtual(p)!;
  p = avancar(p, {tipo: 'pularOpiniao'});            // leitura → palpite
  assert.equal(p.etapa, 'palpite');
  p = avancar(p, {tipo: 'palpite', valor: c.equipe}); // escolhe o time certo
  p = avancar(p, {tipo: 'virar'});
  assert.equal(p.etapa, 'virada');
  assert.equal(p.pontos, 10);
  assert.equal(p.acertos, 1);
  /* travas: virar de novo ou pular depois de virado não mudam nada */
  const travado = avancar(p, {tipo: 'virar'});
  assert.deepEqual(travado, p);
  const travado2 = avancar(p, {tipo: 'pularCarta'});
  assert.deepEqual(travado2, p);
});

test('palpite errado não pontua; pular não pontua', () => {
  const baralho = montarBaralho(CARTAS, 9, 2);
  const c = cartaAtual(iniciar(baralho))!;
  const errado = c.equipe === 'aurora' ? 'orbita' : 'aurora';
  let p = avancar(iniciar(baralho), {tipo: 'pularOpiniao'});
  p = avancar(p, {tipo: 'palpite', valor: errado});
  p = avancar(p, {tipo: 'virar'});
  assert.equal(p.pontos, 0);
  assert.equal(p.acertos, 0);

  let q = avancar(iniciar(baralho), {tipo: 'pularOpiniao'});
  q = avancar(q, {tipo: 'pularCarta'});
  assert.equal(q.etapa, 'virada');
  assert.equal(q.travou, true);
  assert.equal(q.pontos, 0);
});

test('opinião é opcional e não altera pontos', () => {
  const baralho = montarBaralho(CARTAS, 11, 1);
  const c = cartaAtual(iniciar(baralho))!;
  let com = iniciar(baralho);
  com = avancar(com, {tipo: 'pularOpiniao'});
  com = avancar(com, {tipo: 'palpite', valor: c.equipe});
  com = avancar(com, {tipo: 'virar'});

  let sem = iniciar(baralho);
  sem = avancar(sem, {tipo: 'pularOpiniao'});
  sem = avancar(sem, {tipo: 'palpite', valor: c.equipe});
  sem = avancar(sem, {tipo: 'virar'});

  assert.equal(com.pontos, sem.pontos);
});

test('fluxo completo: 2 cartas até o fim, percentual e fim limpo', () => {
  const baralho = montarBaralho(CARTAS, 21, 2);
  let p = iniciar(baralho);
  for (let i = 0; i < 2; i++) {
    const c = cartaAtual(p)!;
    p = avancar(p, {tipo: 'pularOpiniao'});
    p = avancar(p, {tipo: 'palpite', valor: c.equipe});
    p = avancar(p, {tipo: 'virar'});
    assert.equal(p.etapa, 'virada');
    p = avancar(p, {tipo: 'proxima'});
  }
  assert.equal(p.fim, true);
  assert.equal(p.acertos, 2);
  assert.equal(percentual(p), 100);
  /* depois do fim, ações não quebram */
  assert.deepEqual(avancar(p, {tipo: 'virar'}), p);
});

test('próxima carta zera opinião, palpite e trava', () => {
  const baralho = montarBaralho(CARTAS, 33, 2);
  let p = avancar(iniciar(baralho), {tipo: 'pularOpiniao'});
  p = avancar(p, {tipo: 'opiniao', valor: 'boa'});
  assert.equal(p.etapa, 'palpite');
  p = avancar(p, {tipo: 'palpite', valor: 'aurora'});
  p = avancar(p, {tipo: 'virar'});
  p = avancar(p, {tipo: 'proxima'});
  assert.equal(p.opiniao, null);
  assert.equal(p.palpite, null);
  assert.equal(p.travou, false);
  assert.equal(p.etapa, 'leitura');
});

test('partida completa embaralha as 36 cartas sem perder temas ou repetir cartas', () => {
  const baralho = montarBaralho(CARTAS, 2026, CARTAS.length);
  assert.equal(baralho.length, 36);
  assert.equal(new Set(baralho.map(c => c.id)).size, 36);
  assert.deepEqual(new Set(baralho.map(c => c.tema)), new Set(CARTAS.map(c => c.tema)));
  assert.notDeepEqual(baralho.map(c => c.id), CARTAS.map(c => c.id));
  assert.notDeepEqual(baralho, montarBaralho(CARTAS, 2027, CARTAS.length));
});

test('fluxo direto de opinião e personagem conclui 36 cartas com pontuação única', () => {
  let p = iniciar(montarBaralho(CARTAS, 2026, 36));
  for (let i = 0; i < 36; i++) {
    assert.equal(p.etapa, 'leitura');
    p = avancar(p, {tipo: 'iniciarOpiniao'});
    p = avancar(p, {tipo: 'opiniao', valor: i % 2 ? 'boa' : 'ruim'});
    assert.equal(p.etapa, 'palpite');
    const correta = cartaAtual(p)!.equipe;
    const escolha = i % 2 ? correta : correta === 'aurora' ? 'orbita' : 'aurora';
    p = avancar(avancar(p, {tipo: 'palpite', valor: escolha}), {tipo: 'virar'});
    assert.equal(p.etapa, 'virada');
    assert.deepEqual(avancar(p, {tipo: 'virar'}), p);
    p = avancar(p, {tipo: 'proxima'});
  }
  assert.equal(p.fim, true);
  assert.equal(p.acertos, 18);
  assert.equal(p.pontos, 180);
});
