/* Avatares dos capitães das equipes — desenhados em SVG, sem nenhuma
   semelhança com pessoa real. Mesma construção, proporções, iluminação
   e enquadramento para os dois (simetria obrigatória).
   Se existir arte em `public/art/` (renders do Blender), ela substitui
   o SVG automaticamente — ver public/art/README.md. */

import type {Equipe} from './data';

let uid = 0;

/* Rosto base comum aos dois: mesma cabeça, mesmos olhos, mesma luz.
   Só o cabelo, a barba e o laço (cor do time) mudam. */
function rostoBase(equipe: Equipe, extras: {barba: boolean; cabelo: string}): string {
  const id = `av${uid++}`;
  const time = equipe === 'aurora' ? '#735CFF' : '#34D5F3';
  const laivo = equipe === 'aurora' ? '#9d8bff' : '#7ce4fa';

  return `
  <svg viewBox="0 0 200 200" class="av-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${id}pele" cx="42%" cy="34%" r="75%">
        <stop offset="0%" stop-color="#f6d3ae"/>
        <stop offset="62%" stop-color="#e7b98d"/>
        <stop offset="100%" stop-color="#c8926a"/>
      </radialGradient>
      <linearGradient id="${id}terno" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2b3358"/>
        <stop offset="100%" stop-color="#1a2040"/>
      </linearGradient>
      <linearGradient id="${id}glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${time}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${time}" stop-opacity="0"/>
      </linearGradient>
      <filter id="${id}soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
    </defs>

    <!-- aura do time atrás do ombro -->
    <ellipse cx="100" cy="128" rx="74" ry="62" fill="url(#${id}glow)" opacity=".38" filter="url(#${id}soft)"/>

    <!-- ombros / terno -->
    <path d="M28 200 C30 158 56 140 100 140 C144 140 170 158 172 200 Z" fill="url(#${id}terno)"/>
    <!-- camisa -->
    <path d="M84 143 L100 168 L116 143 C110 140 90 140 84 143 Z" fill="#F4F6FF"/>
    <!-- golas -->
    <path d="M84 141 L100 166 L88 176 L74 150 Z" fill="#e8ecfb"/>
    <path d="M116 141 L100 166 L112 176 L126 150 Z" fill="#e8ecfb"/>
    <!-- laço do time -->
    <path d="M100 164 L92 172 L96 196 L100 200 L104 196 L108 172 Z" fill="${time}"/>
    <path d="M100 164 L92 172 L100 178 L108 172 Z" fill="${laivo}"/>

    <!-- pescoço -->
    <path d="M86 122 L86 146 C92 152 108 152 114 146 L114 122 Z" fill="#c8926a"/>

    <!-- orelhas -->
    <ellipse cx="56" cy="96" rx="9" ry="13" fill="#e7b98d"/>
    <ellipse cx="144" cy="96" rx="9" ry="13" fill="#e7b98d"/>

    <!-- cabeça -->
    <path d="M62 78 C62 44 78 30 100 30 C122 30 138 44 138 78 C138 108 124 128 100 128 C76 128 62 108 62 78 Z" fill="url(#${id}pele)"/>

    ${extras.barba ? `
    <!-- barba aparada -->
    <path d="M66 88 C64 116 78 130 100 130 C122 130 136 116 134 88 C134 104 122 112 100 112 C78 112 66 104 66 88 Z" fill="#F2F3F8"/>
    <path d="M84 100 C88 96 112 96 116 100 C114 110 108 114 100 114 C92 114 86 110 84 100 Z" fill="#F2F3F8"/>
    ` : ''}

    <!-- sobrancelhas -->
    <path d="M72 72 C78 67 90 67 94 70" stroke="#4a3b30" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M106 70 C110 67 122 67 128 72" stroke="#4a3b30" stroke-width="4.5" stroke-linecap="round" fill="none"/>

    <!-- olhos -->
    <ellipse cx="83" cy="84" rx="8" ry="9" fill="#fff"/>
    <ellipse cx="117" cy="84" rx="8" ry="9" fill="#fff"/>
    <circle cx="84" cy="85" r="4.4" fill="#3a2c22"/>
    <circle cx="116" cy="85" r="4.4" fill="#3a2c22"/>
    <circle cx="85.6" cy="83" r="1.5" fill="#fff"/>
    <circle cx="117.6" cy="83" r="1.5" fill="#fff"/>
    <path d="M75 79 C79 76 87 76 91 79" stroke="#c8926a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M109 79 C113 76 121 76 125 79" stroke="#c8926a" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- nariz -->
    <path d="M100 86 C99 94 97 98 94 101 C97 104 103 104 106 101 C103 98 101 94 100 86 Z" fill="#d9a276"/>

    <!-- boca sorridente -->
    <path d="M88 110 C94 116 106 116 112 110" stroke="#9c5f48" stroke-width="3.4" stroke-linecap="round" fill="none"/>

    ${extras.cabelo}

    <!-- luz de contorno do time (rim light) — mesmo lado nos dois -->
    <path d="M138 60 C142 78 140 100 128 118" stroke="${time}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".55"/>
    <path d="M162 152 C168 168 170 184 170 200" stroke="${time}" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".4"/>
  </svg>`;
}

/* Equipe Aurora — capitão idoso, cabelo e barba brancos aparados. */
export function avatarAurora(): string {
  return rostoBase('aurora', {
    barba: true,
    cabelo: `<path d="M62 80 C60 48 76 28 100 28 C124 28 140 48 138 80 C136 62 128 54 100 54 C72 54 64 62 62 80 Z" fill="#F2F3F8"/>
             <path d="M64 74 C68 60 80 52 100 52 C120 52 132 60 136 74 C130 64 118 58 100 58 C82 58 70 64 64 74 Z" fill="#dfe2ee"/>`
  });
}

/* Equipe Órbita — capitão de meia-idade, cabelo escuro penteado. */
export function avatarOrbita(): string {
  return rostoBase('orbita', {
    barba: false,
    cabelo: `<path d="M62 80 C60 46 76 26 100 26 C124 26 140 46 138 80 C136 58 128 48 104 48 C86 48 74 54 68 66 C66 72 64 76 62 80 Z" fill="#2c2119"/>
             <path d="M68 66 C76 52 92 46 108 48 C124 50 134 60 136 74 C130 60 120 54 104 54 C88 54 76 58 68 66 Z" fill="#3d2e22"/>`
  });
}

export const avatarSVG: Record<Equipe, () => string> = {
  aurora: avatarAurora,
  orbita: avatarOrbita
};

/* Ícones por categoria — glifos monocromáticos simples. */
const ICONES: Record<string, string> = {
  educacao: '<path d="M12 4 L2 9 L12 14 L22 9 Z M6 11.5 V16 C6 17.5 9 19 12 19 C15 19 18 17.5 18 16 V11.5" />',
  saude: '<path d="M12 4 C12 4 4 9 4 14 A5 5 0 0 0 12 18 A5 5 0 0 0 20 14 C20 9 12 4 12 4 Z M12 9 V15 M9 12 H15" />',
  economia: '<circle cx="12" cy="12" r="8"/><path d="M12 7 V17 M9.5 9.5 C9.5 8 10.8 7.5 12 7.5 C13.2 7.5 14.5 8.2 14.5 9.5 C14.5 13 9.5 11.5 9.5 14.5 C9.5 16 10.8 16.5 12 16.5 C13.2 16.5 14.5 16 14.5 14.5"/>',
  'direitos trabalhistas': '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8 V6 A2 2 0 0 1 11 4 H13 A2 2 0 0 1 15 6 V8 M3 13 H21"/>',
  'meio ambiente': '<path d="M12 21 V10 M12 10 C12 5 16 3 20 3 C20 8 17 11 12 11 M12 14 C12 10 8 8 4 9 C5 13 8 15 12 14"/>',
  'programas sociais': '<path d="M12 20 C7 16 4 13 4 9.5 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 20 9.5 C20 13 17 16 12 20 Z"/>',
  'reforma tributaria': '<path d="M6 3 H18 L21 9 L12 21 L3 9 Z M6 3 L12 21 L18 3 M3 9 H21 M9 3 L7.5 9 L12 21 M15 3 L16.5 9 L12 21"/>',
  seguranca: '<path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z M9 12 L11 14 L15 10"/>',
  'defesa da mulher': '<circle cx="12" cy="9" r="5"/><path d="M12 14 V21 M9 18 H15"/>',
  democracia: '<path d="M4 21 H20 M6 21 V10 M18 21 V10 M4 10 H20 L12 4 Z M9 21 V13 M15 21 V13"/>',
  soberania: '<circle cx="12" cy="12" r="8"/><path d="M4 12 H20 M12 4 C15 7 15 17 12 20 C9 17 9 7 12 4"/>',
  transporte: '<rect x="5" y="4" width="14" height="13" rx="3"/><path d="M5 11 H19 M8 21 L9 17 M16 21 L15 17"/><circle cx="8.5" cy="14" r="1"/><circle cx="15.5" cy="14" r="1"/>',
  cultura: '<path d="M9 18 V6 L19 4 V16"/><circle cx="7" cy="18" r="2.4"/><circle cx="17" cy="16" r="2.4"/>',
  'estado minimo': '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9 H16 M8 13 H13 M8 17 H11"/>'
};

export function iconeCategoria(categoria: string): string {
  const d = ICONES[categoria] ?? '<circle cx="12" cy="12" r="7"/>';
  return `<svg viewBox="0 0 24 24" class="ico-cat" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}
