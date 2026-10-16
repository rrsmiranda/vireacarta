/* Transcrição do PDF Baralho 2026 fornecido pelo usuário.
   Atribuições reproduzem os versos do documento, sem verificação independente.
   IDs internos aurora/orbita preservam os assets e a paleta existentes. */
export type Equipe = 'aurora' | 'orbita';
export interface Carta {
  id: number;
  texto: string;
  categoria: string;
  equipe: Equipe;
  ficcao: boolean;
  verificacao: 'nao_verificada';
  pagina: number;
  paginaResposta: number;
  fonte: string;
  /** Link do QR code impresso no verso da carta no PDF. */
  fonteUrl: string;
  explicacao?: string;
}
export const EQUIPES: Record<Equipe, {nome: string; curto: string}> = {
  aurora: {nome: 'Lula', curto: 'LULA'},
  orbita: {nome: 'Flávio Bolsonaro', curto: 'FLÁVIO BOLSONARO'}
};
export const CARTAS: Carta[] = [
  {
    "id": 1,
    "texto": "Não deixar o preço do gás e da gasolina subir sem controle só porque o dólar subiu.",
    "categoria": "economia",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/uc7fmpbyOtxI"
  },
  {
    "id": 2,
    "texto": "Defender nossas riquezas é defender nossa soberania.",
    "categoria": "economia",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/Uii3CdShBwxl"
  },
  {
    "id": 3,
    "texto": "Adotar jornada de trabalho com duas folgas por semana, sem redução de salário.",
    "categoria": "direitos trabalhistas",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/RuBjxDsa20u6"
  },
  {
    "id": 4,
    "texto": "Criar políticas para reduzir as dívidas das famílias.",
    "categoria": "economia",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/W31YryAARkQp"
  },
  {
    "id": 5,
    "texto": "Combater o crime organizado, atacando as suas fontes financeiras.",
    "categoria": "seguranca",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/lmLDolxxmbe8"
  },
  {
    "id": 6,
    "texto": "Aumentar vagas nas Universidades.",
    "categoria": "educacao",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/6Y0k0NSEqYAf"
  },
  {
    "id": 7,
    "texto": "Manter cotas para Indígenas, Quilombolas e Negros nas universidades e concursos públicos.",
    "categoria": "educacao",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/Cp5ld7d74eJz"
  },
  {
    "id": 8,
    "texto": "Cobrar impostos dos super-ricos para melhorar saúde, educação e segurança.",
    "categoria": "reforma tributaria",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 1,
    "paginaResposta": 2,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/QHoDIaW0s76S"
  },
  {
    "id": 9,
    "texto": "Regular as redes sociais para preservar a Democracia, combater fake news e crimes digitais.",
    "categoria": "soberania",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/uAb6X5qlvgko"
  },
  {
    "id": 10,
    "texto": "Manter Bolsa Família, Pé de Meia, Vale Gás e outros benefícios sociais",
    "categoria": "programas sociais",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/10EPtzvJ411n"
  },
  {
    "id": 11,
    "texto": "Garantir o aumento anual do salário mínimo acima da inflação.",
    "categoria": "direitos trabalhistas",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/JmgHvVIK4FBU"
  },
  {
    "id": 12,
    "texto": "Aumentar o número de creches.",
    "categoria": "programas sociais",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/2Sc5Lu0f8PPN"
  },
  {
    "id": 13,
    "texto": "Fortalecer o SUS para garantir saúde para todos.",
    "categoria": "saude",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/SQUb1SmH42wq"
  },
  {
    "id": 14,
    "texto": "Fortalecer a Casa da Mulher Brasileira para acolher vítimas de violência doméstica",
    "categoria": "defesa da mulher",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/DMZ1zvaCDaw3"
  },
  {
    "id": 15,
    "texto": "Criar o Sistema Único de Segurança semelhante ao SUS para unir governo federal, estados e municípios no combate ao crime.",
    "categoria": "seguranca",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/YyTiU7HM7WL7"
  },
  {
    "id": 16,
    "texto": "Ampliar Carretas da Saúde e hospitais para acabar com as filas para exames e cirurgias.",
    "categoria": "saude",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 3,
    "paginaResposta": 4,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/S0B0B1E97d8N"
  },
  {
    "id": 17,
    "texto": "Para o povo trabalhador, proteção. Para o bandido, prisão.",
    "categoria": "seguranca",
    "equipe": "aurora",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/z9SqHFzKAYOy"
  },
  {
    "id": 18,
    "texto": "Oferecer o Brasil para exploração dos Estados Unidos",
    "categoria": "economia",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/IRpAL11u7tZb"
  },
  {
    "id": 19,
    "texto": "Não reconhecer as mudanças climáticas e não ter plano de governo para proteger a população e as cidades ameaçadas por enchentes, secas etc.",
    "categoria": "meio ambiente",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/FXJPpBwpARsu"
  },
  {
    "id": 20,
    "texto": "Acabar com o auxílio BPC para famílias com pessoas doentes.",
    "categoria": "saude",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/TPDmrBwLrUx0"
  },
  {
    "id": 21,
    "texto": "Defender o armamento da população.",
    "categoria": "seguranca",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/G865aP0aFgA0"
  },
  {
    "id": 22,
    "texto": "Facilitar contratações sem carteira assinada e deixar trabalhadores sem férias, 13º salário, seguro desemprego e outras garantias.",
    "categoria": "direitos trabalhistas",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/jFJrjQh7of08"
  },
  {
    "id": 23,
    "texto": "Tentar impedir a votação da nova escala de trabalho com duas folgas por semana.",
    "categoria": "direitos trabalhistas",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/3Mb4g533nL6Q"
  },
  {
    "id": 24,
    "texto": "Adotar o tesouraço (cortes) nos gastos públicos, reduzindo serviços públicos gratuitos para população.",
    "categoria": "estado minimo",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 5,
    "paginaResposta": 6,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/uu6vzXHD7U5j"
  },
  {
    "id": 25,
    "texto": "Aumentar a idade e reduzir o valor da aposentadoria.",
    "categoria": "direitos trabalhistas",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/bxnB8G9qJK9Z"
  },
  {
    "id": 26,
    "texto": "Privatizar praias.",
    "categoria": "democracia",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/1TJxDZFQA3Qm"
  },
  {
    "id": 27,
    "texto": "Defender o fim do Pix.",
    "categoria": "direitos trabalhistas",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/wHzaZTKoESmQ"
  },
  {
    "id": 28,
    "texto": "Privatizar 95% das estatais, como Petrobras, Banco do Brasil e Caixa, assim como luz e água.",
    "categoria": "estado minimo",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/YmuFaQgZoutq"
  },
  {
    "id": 29,
    "texto": "Acabar com 18 ministérios importantes e trocar trabalhadores por Inteligência Artificial (IA).",
    "categoria": "direitos trabalhistas",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/ibJchnzo2IAP"
  },
  {
    "id": 30,
    "texto": "Privatizar o SUS e adotar saúde somente para quem puder pagar.",
    "categoria": "estado minimo",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/ySUaZPPBLM49"
  },
  {
    "id": 31,
    "texto": "Acabar com as leis trabalhistas deixando cada empregado negociar direto com o patrão.",
    "categoria": "economia",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/aW1h8Pyq2v1n"
  },
  {
    "id": 32,
    "texto": "Mudar a Constituição Cidadã para acabar com direitos sociais, como moradia, saúde e educação.",
    "categoria": "estado minimo",
    "equipe": "orbita",
    "ficcao": false,
    "verificacao": "nao_verificada",
    "pagina": 7,
    "paginaResposta": 8,
    "fonte": "Baralho 2026 — PDF fornecido",
    "fonteUrl": "https://tr.ee/BWFmSVDBamCa"
  }
];

export const CATEGORIAS: Record<string, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  economia: 'Economia',
  'direitos trabalhistas': 'Direitos trabalhistas',
  'meio ambiente': 'Meio ambiente',
  'programas sociais': 'Programas sociais',
  'reforma tributaria': 'Reforma tributária',
  seguranca: 'Segurança',
  'defesa da mulher': 'Defesa da mulher',
  democracia: 'Democracia',
  soberania: 'Soberania',
  transporte: 'Transporte',
  cultura: 'Cultura',
  'estado minimo': 'Estado mínimo'
};
