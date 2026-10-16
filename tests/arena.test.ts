import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {CAMADAS, urlsArte} from '../src/arena.ts';

test('slots da arena encontram os renders reais sem duplicar a extensão', () => {
  for (const camada of CAMADAS) {
    const urls = urlsArte(camada.slot, './');
    assert.ok(urls.some(url => existsSync(new URL(`../public/${url}`, import.meta.url))));
    assert.ok(urls.every(url => !url.includes('.webp.')));
  }
});

test('fallback PNG e caminho de publicação em subpasta', () => {
  assert.deepEqual(urlsArte('art/cenario_fundo.webp', '/jogo/'), [
    '/jogo/art/cenario_fundo.webp', '/jogo/art/cenario_fundo.png'
  ]);
  assert.deepEqual(urlsArte('art/cenario_fundo.png', './'), [
    './art/cenario_fundo.webp', './art/cenario_fundo.png'
  ]);
});
