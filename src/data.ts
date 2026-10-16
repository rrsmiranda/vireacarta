/* Baralho por temas (v2): 30 cartas, 6 por tema (4 do Lula, 2 do Flávio).
   Cada texto é fiel ao programa de governo registrado no TSE; `paginas` aponta onde
   conferir. Fonte de trabalho: "Propostas eleicoes/baralho-por-temas.md".
   Os links de imprensa vieram de buscas (16/10/2026) e PRECISAM ser conferidos
   manualmente antes da publicação. IDs internos aurora/orbita preservam os assets. */
export type Equipe = 'aurora' | 'orbita';
export type Tema = 'trabalho' | 'bolso' | 'saude' | 'seguranca' | 'protecao';

export interface Link { veiculo: string; titulo: string; url: string }

export interface Carta {
  id: number;
  texto: string;
  tema: Tema;
  equipe: Equipe;
  /** Páginas do programa oficial; a primeira é a do link. */
  paginas: number[];
  /** Resumo curto mostrado na revelação. */
  resumo: string;
  /** Dado de resultado (só cartas do Lula), em destaque na revelação. */
  revelacao?: string;
  /** Reportagens sobre a proposta (conferir antes de publicar). */
  imprensa: Link[];
}

export const EQUIPES: Record<Equipe, {nome: string; curto: string}> = {
  aurora: {nome: 'Lula', curto: 'LULA'},
  orbita: {nome: 'Flávio Bolsonaro', curto: 'FLÁVIO BOLSONARO'}
};

/* Programas oficiais no TSE; `#page=N` abre na página da proposta. */
export const PROGRAMAS: Record<Equipe, string> = {
  aurora: 'https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-pt/@@display-file/file/proposta-pt.pdf',
  orbita: 'https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-pl/@@display-file/file/proposta-pl.pdf'
};

export const linkPrograma = (c: Carta): string => `${PROGRAMAS[c.equipe]}#page=${c.paginas[0]}`;
export const rotuloPaginas = (c: Carta): string => `p. ${c.paginas.join(' e ')}`;

export interface InfoTema {
  id: Tema;
  nome: string;
  /** Chave do ícone em avatar.ts. */
  icone: string;
  /** Comparação às cegas no fim do tema: um caminho de cada candidato. */
  comparacao: Record<Equipe, string>;
}

/* Ordem da jornada completa: temas fortes no começo e no fim. */
export const TEMAS: InfoTema[] = [
  {
    id: 'trabalho', nome: 'Trabalho e salário', icone: 'direitos trabalhistas',
    comparacao: {
      aurora: 'Fim da escala 6x1: jornada de 40 horas semanais, com o mesmo salário.',
      orbita: 'Trabalhador e empresa negociam a jornada e as condições direto, com jornada flexível.'
    }
  },
  {
    id: 'bolso', nome: 'Seu bolso', icone: 'economia',
    comparacao: {
      aurora: 'Isentar do Imposto de Renda quem ganha até R$ 5 mil, com a conta paga por quem ganha mais de R$ 600 mil por ano.',
      orbita: 'Cortar ministérios, cargos e despesas da máquina pública para reduzir os impostos de quem produz.'
    }
  },
  {
    id: 'seguranca', nome: 'Segurança', icone: 'seguranca',
    comparacao: {
      aurora: 'Asfixiar o dinheiro das facções, controlar armas e munições e integrar as polícias num sistema único.',
      orbita: 'Reduzir a maioridade penal para 16 anos, abater quem estiver armado com fuzil e construir presídios no modelo de El Salvador.'
    }
  },
  {
    id: 'saude', nome: 'Saúde e educação', icone: 'saude',
    comparacao: {
      aurora: 'Expandir a escola pública: mais institutos federais no interior e Pé-de-Meia para o jovem não largar os estudos.',
      orbita: 'Onde faltar vaga pública, dar voucher para matricular em escola ou creche particular credenciada.'
    }
  },
  {
    id: 'protecao', nome: 'Proteção e democracia', icone: 'democracia',
    comparacao: {
      aurora: 'Regular as redes e plataformas para impedir que espalhem desinformação, ódio e violência contra mulheres.',
      orbita: 'Acabar com as estruturas do governo criadas para tratar desinformação, vistas como risco de censura.'
    }
  }
];

export const nomeTema = (t: Tema): string => TEMAS.find(x => x.id === t)!.nome;

const SBT_SEG_LULA: Link = {veiculo: 'SBT News', titulo: 'Segurança pública: veja as propostas de Lula na íntegra', url: 'https://sbtnews.sbt.com.br/noticia/eleicoes/seguranca-publica-veja-as-propostas-de-lula-na-integra'};
const SBT_SEG_FLAVIO: Link = {veiculo: 'SBT News', titulo: 'Plano de Flávio prevê endurecimento penal e ofensiva contra facções', url: 'https://sbtnews.sbt.com.br/noticia/politica/plano-de-flavio-bolsonaro-preve-endurecimento-penal-e-ofensiva-contra-faccoes'};
const PODER_6X1: Link = {veiculo: 'Poder360', titulo: 'Flávio deixa fim da escala 6x1 fora do plano de governo', url: 'https://www.poder360.com.br/poder-eleicoes-2026/flavio-deixa-fim-da-escala-6-x-1-fora-do-plano-de-governo/'};
const PODER_ECON: Link = {veiculo: 'Poder360', titulo: 'O que se sabe sobre o plano econômico de Flávio Bolsonaro', url: 'https://www.poder360.com.br/poder-eleicoes/o-que-se-sabe-sobre-o-plano-economico-de-flavio-bolsonaro/'};
const SBT_EDU_FLAVIO: Link = {veiculo: 'SBT News', titulo: 'Educação: o que Flávio propõe em plano de governo', url: 'https://sbtnews.sbt.com.br/noticia/eleicoes/educacao-o-que-flavio-propoe-em-plano-de-governo'};

export const CARTAS: Carta[] = [
  /* ===== Trabalho e salário ===== */
  {
    id: 1, tema: 'trabalho', equipe: 'aurora', paginas: [75],
    texto: 'Acabar com a escala 6x1 e reduzir a jornada para 40 horas, sem redução de salário.',
    resumo: 'O programa promete manter a ação no Senado pelo fim da escala 6x1 e pela jornada de 40 horas sem redução salarial, nos termos aprovados na Câmara.',
    revelacao: 'Proposta já aprovada na Câmara; falta o Senado.',
    imprensa: [
      {veiculo: 'O Liberal', titulo: 'Lula: fim da escala 6x1 sem redução de salário é demanda do povo', url: 'https://www.oliberal.com/politica/lula-fim-da-escala-6x1-sem-reducao-de-salario-e-demanda-do-povo-1.1065323'},
      PODER_6X1
    ]
  },
  {
    id: 2, tema: 'trabalho', equipe: 'aurora', paginas: [74],
    texto: 'Continuar a política de valorização do salário mínimo.',
    resumo: 'O programa promete continuar a valorização do salário mínimo como forma de distribuir renda e combater a pobreza.',
    revelacao: 'Aumento real do mínimo assegurado no mandato atual.',
    imprensa: []
  },
  {
    id: 3, tema: 'trabalho', equipe: 'aurora', paginas: [75],
    texto: 'Tornar obrigatórios planos para acabar com a diferença de salário entre mulheres e homens nas empresas.',
    resumo: 'Os planos de ação contra a diferença salarial passam a ser obrigatórios nas empresas com desigualdade identificada, com metas progressivas.',
    revelacao: 'Lei da Igualdade Salarial, aprovada em 2023.',
    imprensa: []
  },
  {
    id: 4, tema: 'trabalho', equipe: 'aurora', paginas: [75],
    texto: 'Mudar regras que precarizam o trabalho e combater fraudes nas terceirizações.',
    resumo: 'O programa promete mudar regras que levam à precarização e às fraudes em terceirizações, e retomar a assistência sindical nas rescisões.',
    imprensa: []
  },
  {
    id: 5, tema: 'trabalho', equipe: 'orbita', paginas: [44],
    texto: 'Permitir que trabalhador e empresa combinem as condições de trabalho direto, em vez de seguir uma regra única para todos.',
    resumo: 'O programa defende o "negociado sobre o legislado", dentro da lei, com jornada flexível. O fim da escala 6x1 não aparece no plano.',
    imprensa: [
      PODER_6X1,
      {veiculo: 'SBT News', titulo: 'Flávio x Lula: o que defendem para economia e trabalho', url: 'https://sbtnews.sbt.com.br/noticia/eleicoes/flavio-x-lula-o-que-defendem-para-economia-e-trabalho'}
    ]
  },
  {
    id: 6, tema: 'trabalho', equipe: 'orbita', paginas: [44],
    texto: 'Criar contrato de primeiro emprego para jovens de 18 a 24 anos com menor custo na folha para a empresa.',
    resumo: 'O programa prevê contrato com menor custo na folha para jovens de 18 a 24 anos e outro para desempregados com mais de 50 anos, e diz que vai reduzir o custo do trabalho "sem retirar direitos".',
    imprensa: [
      {veiculo: 'SpaceMoney', titulo: 'Plano de governo de Flávio Bolsonaro e as metas econômicas', url: 'https://www.spacemoney.com.br/politica/plano-governo-flavio-bolsonaro-economia/'}
    ]
  },

  /* ===== Seu bolso ===== */
  {
    id: 7, tema: 'bolso', equipe: 'aurora', paginas: [19, 11],
    texto: 'Isentar do Imposto de Renda quem ganha até R$ 5 mil e cobrar mais de quem está no topo.',
    resumo: 'A lei sancionada em 2025 isenta quem ganha até R$ 5 mil. A compensação vem de quem tem renda acima de R$ 600 mil por ano. Foi aprovada por unanimidade no Congresso.',
    revelacao: 'Cerca de 15 milhões de pessoas com alívio no IR; 140 mil do topo passam a pagar mais.',
    imprensa: [
      {veiculo: 'Diário de Pernambuco', titulo: 'Lula sanciona lei que isenta do IR quem ganha até R$ 5 mil', url: 'https://www.diariodepernambuco.com.br/economia/2025/11/11701468-lula-sanciona-lei-que-isenta-do-imposto-de-renda-quem-ganha-ate-rs-5-mil.html'},
      {veiculo: 'Bem Paraná / Agência Brasil', titulo: 'Lula sanciona isenção do IR para quem ganha até R$ 5 mil', url: 'https://www.bemparana.com.br/noticias/parana/lula-sanciona-isencao-do-ir-para-quem-ganha-ate-r-5-mil-beneficio-atinge-846-mil-no-parana/amp/'}
    ]
  },
  {
    id: 8, tema: 'bolso', equipe: 'aurora', paginas: [66],
    texto: 'Dar recarga gratuita do botijão de gás para famílias de baixa renda.',
    resumo: 'O Gás do Povo substituiu o Auxílio Gás e dá recarga gratuita do botijão de 13 kg para famílias de baixa renda do CadÚnico.',
    revelacao: 'Mais de 15 milhões de famílias atendidas, cerca de 50 milhões de pessoas.',
    imprensa: [
      {veiculo: 'eixos', titulo: 'Gás do Povo: como vai funcionar e quem tem direito', url: 'https://eixos.com.br/combustiveis-e-bioenergia/gas-do-povo-como-vai-funcionar-e-quem-tem-direito-ao-novo-vale-gas/'},
      {veiculo: 'Diário do Comércio', titulo: 'Tire dúvidas sobre o Gás do Povo', url: 'https://diariodocomercio.com.br/economia/tire-duvidas-gas-povo-programa-garante-botijao-gratuito/'}
    ]
  },
  {
    id: 9, tema: 'bolso', equipe: 'aurora', paginas: [49],
    texto: 'Baixar os juros de forma duradoura, com inflação controlada.',
    resumo: 'O programa promete criar condições para a queda sustentada dos juros, com inflação controlada e o arcabouço fiscal mantido.',
    imprensa: []
  },
  {
    id: 10, tema: 'bolso', equipe: 'aurora', paginas: [12],
    texto: 'Ajudar as famílias a sair das dívidas, com descontos, juros menores e prazos maiores.',
    resumo: 'O Desenrola Brasil teve duas edições; em 2026, o Novo Desenrola ofereceu descontos, juros menores e prazos maiores para famílias de baixa renda.',
    revelacao: 'Duas edições do Desenrola Brasil.',
    imprensa: []
  },
  {
    id: 11, tema: 'bolso', equipe: 'orbita', paginas: [68, 69],
    texto: 'Fazer um "Tesouraço": cortar no mínimo 10 ministérios, cargos comissionados e despesas da máquina pública.',
    resumo: 'O programa propõe um "corte profundo e por todos os lados" na estrutura administrativa: ministérios, cargos comissionados, despesas administrativas e supersalários.',
    imprensa: [
      {veiculo: 'Forbes', titulo: 'O Tesouraço no plano econômico de Flávio Bolsonaro', url: 'https://forbes.com.br/forbes-money/2026/10/tesouraco-flavio-bolsonaro-plano-economico/'},
      PODER_ECON
    ]
  },
  {
    id: 12, tema: 'bolso', equipe: 'orbita', paginas: [71],
    texto: 'Rever e redimensionar a reforma tributária aprovada pelo atual governo.',
    resumo: 'O programa propõe revisar a reforma tributária do consumo para reduzir a carga. A imprensa aponta que ele não diz qual seria a nova alíquota nem como compensar a perda de arrecadação.',
    imprensa: [PODER_ECON]
  },

  /* ===== Segurança ===== */
  {
    id: 19, tema: 'seguranca', equipe: 'aurora', paginas: [27],
    texto: 'Combater o crime organizado atacando o dinheiro das facções.',
    resumo: 'A estratégia de asfixia financeira do crime organizado será mantida. Em 2026, o governo lançou o pacote "Brasil Contra o Crime Organizado", de R$ 11 bilhões.',
    revelacao: 'R$ 35,8 bilhões de prejuízo às facções desde 2023.',
    imprensa: [
      SBT_SEG_LULA,
      {veiculo: 'Congresso em Foco', titulo: 'Lula lança pacote de R$ 11 bi contra crime organizado', url: 'https://www.congressoemfoco.com.br/noticia/118782/lula-lanca-pacote-de-r-11-bi-contra-crime-organizado-nesta-terca'}
    ]
  },
  {
    id: 20, tema: 'seguranca', equipe: 'aurora', paginas: [28],
    texto: 'Manter o controle de armas e munições para reduzir a violência.',
    resumo: 'O programa mantém a política de controle de armas e munições, com mais rastreabilidade e fiscalização pela Polícia Federal e pelo Exército.',
    revelacao: 'Revogação dos decretos que facilitavam o acesso a armas.',
    imprensa: [SBT_SEG_LULA]
  },
  {
    id: 21, tema: 'seguranca', equipe: 'aurora', paginas: [30],
    texto: 'Criar o Ministério da Segurança Pública e o Sistema Único de Segurança, unindo União, estados e municípios.',
    resumo: 'Com a aprovação da PEC da Segurança, será criado o Ministério da Segurança Pública para coordenar o Sistema Único de Segurança Pública (SUSP) com estados e municípios.',
    revelacao: 'Depende da aprovação da PEC da Segurança.',
    imprensa: [
      {veiculo: 'DGABC', titulo: 'Flávio e Lula apresentam propostas distintas para segurança pública', url: 'https://www.dgabc.com.br/Noticia/4351825/flavio-e-lula-apresentam-propostas-distintas-para-seguranca-publica'}
    ]
  },
  {
    id: 22, tema: 'seguranca', equipe: 'aurora', paginas: [30],
    texto: 'Ampliar o uso de câmeras corporais pelas polícias.',
    resumo: 'O programa amplia o incentivo ao uso de câmeras corporais, com padrões nacionais para uso e guarda das imagens.',
    imprensa: [SBT_SEG_LULA]
  },
  {
    id: 23, tema: 'seguranca', equipe: 'orbita', paginas: [13],
    texto: 'Reduzir a maioridade penal para 16 anos e punir a partir dos 14 em crimes graves.',
    resumo: 'O programa promete apoiar e sancionar a redução da maioridade penal de 18 para 16 anos. Especialistas ouvidos pela imprensa chamaram as medidas de "populismo penal".',
    imprensa: [
      SBT_SEG_FLAVIO,
      {veiculo: 'Bem Paraná', titulo: 'Plano de Flávio desconhece sistema de segurança pública, dizem especialistas', url: 'https://www.bemparana.com.br/noticias/politica/plano-de-flavio-bolsonaro-desconhece-sistema-de-seguranca-publica-dizem-especialistas/'}
    ]
  },
  {
    id: 24, tema: 'seguranca', equipe: 'orbita', paginas: [13],
    texto: '"Bandido armado com fuzil na mão vai ser abatido pelas forças de segurança."',
    resumo: 'A frase é literal do programa, na seção que declara as facções "organizações narcoterroristas" e prevê 5 presídios no modelo de El Salvador.',
    imprensa: [SBT_SEG_FLAVIO]
  },

  /* ===== Saúde e educação ===== */
  {
    id: 13, tema: 'saude', equipe: 'aurora', paginas: [36],
    texto: 'Manter a Farmácia Popular 100% gratuita.',
    resumo: 'Desde 2025, todos os 41 itens são gratuitos, incluindo fraldas geriátricas e remédio para diabetes. O plano promete manter o programa 100% gratuito.',
    revelacao: '27,3 milhões de pessoas atendidas em 2025.',
    imprensa: [
      {veiculo: 'Conselho Federal de Farmácia', titulo: 'Com 100% de gratuidade, Farmácia Popular beneficiou mais de 24 milhões em 2024', url: 'https://site.cff.org.br/noticia/Noticias-gerais/18/02/2025/agora-com-100-de-gratuidade-farmacia-popular-beneficiou-mais-de-24-milhoes-de-brasileiros-em-2024'},
      {veiculo: 'Futuro da Saúde', titulo: 'Farmácia Popular: todos os medicamentos passam a ter 100% de gratuidade', url: 'https://futurodasaude.com.br/farmacia-popular-gratuidade/'}
    ]
  },
  {
    id: 14, tema: 'saude', equipe: 'aurora', paginas: [37],
    texto: 'Acelerar consultas, exames e cirurgias para acabar com as filas do SUS.',
    resumo: 'O Agora Tem Especialistas será ampliado. Em 2025 foram 31,4 milhões de consultas e 45 milhões de exames especializados; filas zeradas em 52 municípios.',
    revelacao: '15 milhões de cirurgias em 2025, recorde do SUS.',
    imprensa: []
  },
  {
    id: 15, tema: 'saude', equipe: 'aurora', paginas: [32],
    texto: 'Manter e fortalecer o Pé-de-Meia para nenhum jovem largar a escola por falta de renda.',
    resumo: 'O Pé-de-Meia dá uma poupança para o aluno de baixa renda continuar no ensino médio. Segundo o MEC, o abandono caiu de 3,8% (2023) para 2,2% (2025).',
    revelacao: '7,3 milhões de jovens beneficiados.',
    imprensa: [
      {veiculo: 'Folha de Pernambuco', titulo: 'Abandono escolar cai no ensino médio dois anos após Pé-de-Meia', url: 'https://www.folhape.com.br/noticias/abandono-escolar-cai-no-ensino-medio-dois-anos-apos-pe-de-meia/496557/'}
    ]
  },
  {
    id: 16, tema: 'saude', equipe: 'aurora', paginas: [33],
    texto: 'Levar mais institutos federais para o interior e as periferias.',
    resumo: 'O programa promete continuar a expansão dos institutos federais, priorizando o interior, as periferias e as cidades com pouca oferta de curso técnico.',
    imprensa: [
      {veiculo: 'Tribuna do Planalto', titulo: 'Promessas para a educação esbarram na falta de metas e dinheiro nos planos de Lula e Flávio', url: 'https://tribunadoplanalto.com.br/promessas-para-a-educacao-esbarram-na-falta-de-metas-e-dinheiro-nos-planos-de-lula-e-flavio/'}
    ]
  },
  {
    id: 17, tema: 'saude', equipe: 'orbita', paginas: [36],
    texto: 'Dar um voucher para a família matricular o filho em outra escola onde faltar vaga na rede pública.',
    resumo: 'Onde faltar vaga pública, a família recebe um voucher educacional. O programa também prevê voucher-creche para a rede privada credenciada (p. 21).',
    imprensa: [SBT_EDU_FLAVIO]
  },
  {
    id: 18, tema: 'saude', equipe: 'orbita', paginas: [35],
    texto: 'Ampliar as escolas cívico-militares.',
    resumo: 'O programa promete ampliar as escolas cívico-militares, cujo programa federal foi encerrado em 2023.',
    imprensa: [
      SBT_EDU_FLAVIO,
      {veiculo: 'SBT News', titulo: 'Lula sanciona PNE e diz que Brasil não precisa de escolas cívico-militares', url: 'https://sbtnews.sbt.com.br/noticia/politica/lula-sanciona-plano-nacional-de-educacao-e-diz-que-brasil-nao-precisa-de-escolas-civico-militares'}
    ]
  },

  /* ===== Proteção e democracia ===== */
  {
    id: 25, tema: 'protecao', equipe: 'aurora', paginas: [21],
    texto: 'Concluir 30 Casas da Mulher Brasileira para acolher vítimas de violência.',
    resumo: 'Dentro do Pacto contra o Feminicídio, o programa promete concluir 30 Casas da Mulher Brasileira e 15 Centros de Referência e distribuir kits de monitoramento de agressores.',
    revelacao: 'Pacto de Enfrentamento ao Feminicídio em vigor.',
    imprensa: []
  },
  {
    id: 26, tema: 'protecao', equipe: 'aurora', paginas: [12],
    texto: 'Manter o Bolsa Família com benefício extra para crianças e adolescentes.',
    resumo: 'O Bolsa Família foi recriado com benefício extra para crianças e adolescentes. O Flávio também promete manter o programa, mas como "porta de saída" para o emprego.',
    revelacao: 'Menor desigualdade da história (Gini 0,504) e extrema pobreza de 4,6%.',
    imprensa: [
      {veiculo: 'CNN Brasil', titulo: 'Flávio foca em porta de saída do Bolsa Família', url: 'https://www.cnnbrasil.com.br/eleicoes/flavio-foca-em-porta-de-saida-do-bolsa-familia/'},
      {veiculo: 'A Gazeta', titulo: 'O que Flávio Bolsonaro e Lula propõem sobre o Bolsa Família', url: 'https://www.agazeta.com.br/mundo/o-que-flavio-bolsonaro-e-lula-propoem-sobre-o-bolsa-familia-1026'}
    ]
  },
  {
    id: 27, tema: 'protecao', equipe: 'aurora', paginas: [16],
    texto: 'Regular as redes sociais e plataformas digitais para combater fake news e discurso de ódio.',
    resumo: 'O programa promete "avançar ainda mais" na regulação das redes e plataformas para impedir a difusão de desinformação e de campanhas de ódio.',
    imprensa: [
      {veiculo: 'Diário de Pernambuco', titulo: 'Plano de governo de Lula prevê defesa da soberania e revisão de emendas', url: 'https://www.diariodepernambuco.com.br/politica/2026/08/11720678-plano-de-governo-de-lula-preve-defesa-da-soberania-e-revisao-de-emendas.html'},
      {veiculo: 'SBT News', titulo: 'Lula diz que falta de regulação das redes favorece a violência contra mulheres', url: 'https://sbtnews.sbt.com.br/noticia/politica/lula-diz-que-falta-de-regulacao-das-redes-favorece-a-violencia-contra-mulheres'}
    ]
  },
  {
    id: 28, tema: 'protecao', equipe: 'aurora', paginas: [22],
    texto: 'Levar atendimento de porta em porta aos idosos com dificuldade de locomoção.',
    resumo: 'O programa prevê atendimento domiciliar a idosos com dificuldade de locomoção e a ampliação do PADI Brasil.',
    revelacao: 'PADI Brasil já implantado em 2.655 municípios.',
    imprensa: []
  },
  {
    id: 29, tema: 'protecao', equipe: 'orbita', paginas: [66],
    texto: 'Acabar com as estruturas do governo que combatem a desinformação ("Tesouraço da Censura").',
    resumo: 'O programa propõe acabar com as estruturas do Estado criadas para tratar desinformação, que ele chama de "Ministério da Verdade", por considerá-las risco de censura.',
    imprensa: []
  },
  {
    id: 30, tema: 'protecao', equipe: 'orbita', paginas: [65],
    texto: 'Limitar as decisões individuais dos ministros do STF.',
    resumo: 'O programa propõe limitar as decisões monocráticas do STF e transformá-lo em corte constitucional. Também propõe o fim da reeleição.',
    imprensa: [
      {veiculo: 'Band', titulo: 'Flávio propõe limitar STF, reduzir maioridade e acabar com reeleição', url: 'https://www.band.com.br/politica/eleicoes/2026/flavio-propoe-limitar-stf-reduzir-maioridade-e-acabar-com-reeleicao-202608131847'}
    ]
  }
];
