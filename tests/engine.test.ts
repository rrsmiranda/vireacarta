import {test} from 'node:test';
import assert from 'node:assert/strict';
import {avancar, cartaAtual, embaralhar, iniciar, montarBaralho, rng, percentual} from '../src/engine.ts';
import {CARTAS} from '../src/data.ts';

test('PDF Baralho 2026: 32 cartas, atribuições 17/15, ids únicos', () => {
  assert.equal(CARTAS.length, 32);
  assert.equal(new Set(CARTAS.map(c => c.id)).size, 32);
  assert.equal(CARTAS.filter(c => c.equipe === 'aurora').length, 17);
  assert.equal(CARTAS.filter(c => c.equipe === 'orbita').length, 15);
  assert.ok(CARTAS.every(c => c.ficcao === false && c.verificacao === 'nao_verificada'));
  assert.ok(CARTAS.every(c => c.texto.length > 10 && c.categoria && c.fonte && c.paginaResposta));
});

test('cada carta aponta para o link do seu QR code, sem repetição', () => {
  assert.ok(CARTAS.every(c => /^https:\/\/tr\.ee\/\w+$/.test(c.fonteUrl)));
  assert.equal(new Set(CARTAS.map(c => c.fonteUrl)).size, 32);
  assert.equal(CARTAS.find(c => c.id === 1)?.fonteUrl, 'https://tr.ee/uc7fmpbyOtxI');
  assert.equal(CARTAS.find(c => c.id === 32)?.fonteUrl, 'https://tr.ee/BWFmSVDBamCa');
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

test('partida completa embaralha as 32 cartas sem perder temas ou repetir cartas', () => {
  const baralho = montarBaralho(CARTAS, 2026, CARTAS.length);
  assert.equal(baralho.length, 32);
  assert.equal(new Set(baralho.map(c => c.id)).size, 32);
  assert.deepEqual(new Set(baralho.map(c => c.categoria)), new Set(CARTAS.map(c => c.categoria)));
  assert.notDeepEqual(baralho.map(c => c.id), CARTAS.map(c => c.id));
  assert.notDeepEqual(baralho, montarBaralho(CARTAS, 2027, CARTAS.length));
});

test('fluxo direto de opinião e personagem conclui 32 cartas com pontuação única', () => {
  let p = iniciar(montarBaralho(CARTAS, 2026, 32));
  for (let i = 0; i < 32; i++) {
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
  assert.equal(p.acertos, 16);
  assert.equal(p.pontos, 160);
});
