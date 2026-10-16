/* Baralho por temas (v2): 36 cartas, 6 por tema (4 do Lula, 2 do Flávio).
   Cada texto é fiel ao programa de governo registrado no TSE; `paginas` aponta onde
   conferir. Fonte de trabalho: "Propostas eleicoes/baralho-por-temas.md".
   Reportagens de cada carta ficam em fontes.ts. IDs internos aurora/orbita
   preservam os assets. */
import {FONTES} from './fontes';

export type Equipe = 'aurora' | 'orbita';
export type Tema = 'trabalho' | 'bolso' | 'seguranca' | 'saude' | 'educacao' | 'protecao';

export interface Link { veiculo: string; tipo: 'plano' | 'resultado' | 'critica'; url: string }

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
}

/* Reportagens sobre a proposta, na ordem: confirma no plano, resultado, crítica. */
export const fontesDa = (c: Carta): Link[] => FONTES[c.id] ?? [];

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
  /** Linha de apoio no botão do tema. */
  subtitulo?: string;
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
    id: 'bolso', nome: 'Seu bolso', subtitulo: 'Economia e custo de vida', icone: 'economia',
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
    id: 'saude', nome: 'Saúde', icone: 'saude',
    comparacao: {
      aurora: 'Fortalecer o SUS público: remédios e exames de graça na Farmácia Popular e uma rede pública de tratamento do câncer.',
      orbita: 'Contratar a rede privada para fazer exames e serviços do SUS nos horários ociosos.'
    }
  },
  {
    id: 'educacao', nome: 'Educação', icone: 'educacao',
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


export const CARTAS: Carta[] = [
  /* ===== Trabalho e salário ===== */
  {
    id: 1, tema: 'trabalho', equipe: 'aurora', paginas: [75],
    texto: 'Acabar com a escala 6x1 e reduzir a jornada para 40 horas, sem redução de salário.',
    resumo: 'O programa promete manter a ação no Senado pelo fim da escala 6x1 e pela jornada de 40 horas sem redução salarial, nos termos aprovados na Câmara.',
    revelacao: 'Proposta já aprovada na Câmara; falta o Senado.'
  },
  {
    id: 2, tema: 'trabalho', equipe: 'aurora', paginas: [74],
    texto: 'Continuar a política de valorização do salário mínimo.',
    resumo: 'O programa promete continuar a valorização do salário mínimo como forma de distribuir renda e combater a pobreza.',
    revelacao: 'Aumento real do mínimo assegurado no mandato atual.'
  },
  {
    id: 3, tema: 'trabalho', equipe: 'aurora', paginas: [75],
    texto: 'Tornar obrigatórios planos para acabar com a diferença de salário entre mulheres e homens nas empresas.',
    resumo: 'Os planos de ação contra a diferença salarial passam a ser obrigatórios nas empresas com desigualdade identificada, com metas progressivas.',
    revelacao: 'Lei da Igualdade Salarial, aprovada em 2023.'
  },
  {
    id: 4, tema: 'trabalho', equipe: 'aurora', paginas: [75],
    texto: 'Mudar regras que precarizam o trabalho e combater fraudes nas terceirizações.',
    resumo: 'O programa promete mudar regras que levam à precarização e às fraudes em terceirizações, e retomar a assistência sindical nas rescisões.'
  },
  {
    id: 5, tema: 'trabalho', equipe: 'orbita', paginas: [44],
    texto: 'Permitir que trabalhador e empresa combinem as condições de trabalho direto, em vez de seguir uma regra única para todos.',
    resumo: 'O programa defende o "negociado sobre o legislado", dentro da lei, com jornada flexível. O fim da escala 6x1 não aparece no plano.'
  },
  {
    id: 6, tema: 'trabalho', equipe: 'orbita', paginas: [44],
    texto: 'Criar contrato de primeiro emprego para jovens de 18 a 24 anos com menor custo na folha para a empresa.',
    resumo: 'O programa prevê contrato com menor custo na folha para jovens de 18 a 24 anos e outro para desempregados com mais de 50 anos, e diz que vai reduzir o custo do trabalho "sem retirar direitos".'
  },

  /* ===== Seu bolso ===== */
  {
    id: 7, tema: 'bolso', equipe: 'aurora', paginas: [19, 11],
    texto: 'Isentar do Imposto de Renda quem ganha até R$ 5 mil e cobrar mais de quem está no topo.',
    resumo: 'A lei sancionada em 2025 isenta quem ganha até R$ 5 mil. A compensação vem de quem tem renda acima de R$ 600 mil por ano. Foi aprovada por unanimidade no Congresso.',
    revelacao: 'Cerca de 15 milhões de pessoas com alívio no IR; 140 mil do topo passam a pagar mais.'
  },
  {
    id: 8, tema: 'bolso', equipe: 'aurora', paginas: [66],
    texto: 'Dar recarga gratuita do botijão de gás para famílias de baixa renda.',
    resumo: 'O Gás do Povo substituiu o Auxílio Gás e dá recarga gratuita do botijão de 13 kg para famílias de baixa renda do CadÚnico.',
    revelacao: 'Mais de 15 milhões de famílias atendidas, cerca de 50 milhões de pessoas.'
  },
  {
    id: 9, tema: 'bolso', equipe: 'aurora', paginas: [49],
    texto: 'Baixar os juros de forma duradoura, com inflação controlada.',
    resumo: 'O programa promete criar condições para a queda sustentada dos juros, com inflação controlada e o arcabouço fiscal mantido.'
  },
  {
    id: 10, tema: 'bolso', equipe: 'aurora', paginas: [12],
    texto: 'Ajudar as famílias a sair das dívidas, com descontos, juros menores e prazos maiores.',
    resumo: 'O Desenrola Brasil teve duas edições; em 2026, o Novo Desenrola ofereceu descontos, juros menores e prazos maiores para famílias de baixa renda.',
    revelacao: 'Duas edições do Desenrola Brasil.'
  },
  {
    id: 11, tema: 'bolso', equipe: 'orbita', paginas: [68, 69],
    texto: 'Fazer um "Tesouraço": cortar no mínimo 10 ministérios, cargos comissionados e despesas da máquina pública.',
    resumo: 'O programa propõe um "corte profundo e por todos os lados" na estrutura administrativa: ministérios, cargos comissionados, despesas administrativas e supersalários.'
  },
  {
    id: 12, tema: 'bolso', equipe: 'orbita', paginas: [71],
    texto: 'Rever e redimensionar a reforma tributária aprovada pelo atual governo.',
    resumo: 'O programa propõe revisar a reforma tributária do consumo para reduzir a carga. A imprensa aponta que ele não diz qual seria a nova alíquota nem como compensar a perda de arrecadação.'
  },

  /* ===== Segurança ===== */
  {
    id: 19, tema: 'seguranca', equipe: 'aurora', paginas: [27],
    texto: 'Combater o crime organizado atacando o dinheiro das facções.',
    resumo: 'A estratégia de asfixia financeira do crime organizado será mantida. Em 2026, o governo lançou o pacote "Brasil Contra o Crime Organizado", de R$ 11 bilhões.',
    revelacao: 'R$ 35,8 bilhões de prejuízo às facções desde 2023.'
  },
  {
    id: 20, tema: 'seguranca', equipe: 'aurora', paginas: [28],
    texto: 'Manter o controle de armas e munições para reduzir a violência.',
    resumo: 'O programa mantém a política de controle de armas e munições, com mais rastreabilidade e fiscalização pela Polícia Federal e pelo Exército.',
    revelacao: 'Revogação dos decretos que facilitavam o acesso a armas.'
  },
  {
    id: 21, tema: 'seguranca', equipe: 'aurora', paginas: [30],
    texto: 'Criar o Ministério da Segurança Pública e o Sistema Único de Segurança, unindo União, estados e municípios.',
    resumo: 'Com a aprovação da PEC da Segurança, será criado o Ministério da Segurança Pública para coordenar o Sistema Único de Segurança Pública (SUSP) com estados e municípios.',
    revelacao: 'Depende da aprovação da PEC da Segurança.'
  },
  {
    id: 22, tema: 'seguranca', equipe: 'aurora', paginas: [30],
    texto: 'Ampliar o uso de câmeras corporais pelas polícias.',
    resumo: 'O programa amplia o incentivo ao uso de câmeras corporais, com padrões nacionais para uso e guarda das imagens.'
  },
  {
    id: 23, tema: 'seguranca', equipe: 'orbita', paginas: [13],
    texto: 'Reduzir a maioridade penal para 16 anos e punir a partir dos 14 em crimes graves.',
    resumo: 'O programa promete apoiar e sancionar a redução da maioridade penal de 18 para 16 anos. Especialistas ouvidos pela imprensa chamaram as medidas de "populismo penal".'
  },
  {
    id: 24, tema: 'seguranca', equipe: 'orbita', paginas: [13],
    texto: '"Bandido armado com fuzil na mão vai ser abatido pelas forças de segurança."',
    resumo: 'A frase é literal do programa, na seção que declara as facções "organizações narcoterroristas" e prevê 5 presídios no modelo de El Salvador.'
  },

  /* ===== Saúde ===== */
  {
    id: 13, tema: 'saude', equipe: 'aurora', paginas: [36],
    texto: 'Manter a Farmácia Popular 100% gratuita.',
    resumo: 'Desde 2025, todos os 41 itens são gratuitos, incluindo fraldas geriátricas e remédio para diabetes. O plano promete manter o programa 100% gratuito.',
    revelacao: '27,3 milhões de pessoas atendidas em 2025.'
  },
  {
    id: 14, tema: 'saude', equipe: 'aurora', paginas: [37],
    texto: 'Acelerar consultas, exames e cirurgias para acabar com as filas do SUS.',
    resumo: 'O Agora Tem Especialistas será ampliado. Em 2025 foram 31,4 milhões de consultas e 45 milhões de exames especializados; filas zeradas em 52 municípios.',
    revelacao: '15 milhões de cirurgias em 2025, recorde do SUS.'
  },
  {
    id: 31, tema: 'saude', equipe: 'aurora', paginas: [38],
    texto: 'Consolidar a maior rede pública de tratamento do câncer do mundo, com remédios modernos.',
    resumo: 'O programa promete levar a todo o país a rede pública de prevenção, diagnóstico e tratamento do câncer, com equipamentos modernos e novos quimioterápicos e imunoterápicos.'
  },
  {
    id: 32, tema: 'saude', equipe: 'aurora', paginas: [35],
    texto: 'Manter o Mais Médicos, fixando profissionais nas cidades e áreas mais vulneráveis.',
    resumo: 'O Mais Médicos seguirá fixando profissionais e formando especialistas em medicina de família, para garantir atendimento contínuo nos municípios mais vulneráveis.',
    revelacao: 'O Mais Médicos dobrou de tamanho no mandato atual.'
  },
  {
    id: 33, tema: 'saude', equipe: 'orbita', paginas: [37],
    texto: 'Contratar exames e serviços da rede privada nos horários ociosos para atender pacientes do SUS.',
    resumo: 'O programa propõe usar aparelhos parados da rede privada para fazer exames e serviços do SUS e "atender mais sem construir do zero".'
  },
  {
    id: 34, tema: 'saude', equipe: 'orbita', paginas: [37],
    texto: 'Corrigir a tabela do SUS para pagar o custo real a hospitais, santas casas e clínicas.',
    resumo: 'O programa promete garantir as condições para corrigir os valores que o SUS paga a hospitais, santas casas e clínicas, sobretudo no interior.'
  },

  /* ===== Educação ===== */
  {
    id: 15, tema: 'educacao', equipe: 'aurora', paginas: [32],
    texto: 'Manter e fortalecer o Pé-de-Meia para nenhum jovem largar a escola por falta de renda.',
    resumo: 'O Pé-de-Meia dá uma poupança para o aluno de baixa renda continuar no ensino médio. Segundo o MEC, o abandono caiu de 3,8% (2023) para 2,2% (2025).',
    revelacao: '7,3 milhões de jovens beneficiados.'
  },
  {
    id: 16, tema: 'educacao', equipe: 'aurora', paginas: [33],
    texto: 'Levar mais institutos federais para o interior e as periferias.',
    resumo: 'O programa promete continuar a expansão dos institutos federais, priorizando o interior, as periferias e as cidades com pouca oferta de curso técnico.',
    revelacao: 'Em 2026, leis criaram as universidades federais Indígena e do Esporte e transformaram os Cefets de MG e RJ em universidades.'
  },
  {
    id: 17, tema: 'educacao', equipe: 'orbita', paginas: [36],
    texto: 'Dar um voucher para a família matricular o filho em outra escola onde faltar vaga na rede pública.',
    resumo: 'Onde faltar vaga pública, a família recebe um voucher educacional. O programa também prevê voucher-creche para a rede privada credenciada (p. 21).'
  },
  {
    id: 18, tema: 'educacao', equipe: 'orbita', paginas: [35],
    texto: 'Ampliar as escolas cívico-militares.',
    resumo: 'O programa promete ampliar as escolas cívico-militares, cujo programa federal foi encerrado em 2023.'
  },

  {
    id: 35, tema: 'educacao', equipe: 'aurora', paginas: [31],
    texto: 'Chegar a 80% das crianças alfabetizadas na idade certa.',
    resumo: 'O Compromisso Nacional Criança Alfabetizada, feito com estados e municípios, seguirá até a meta de 80% das crianças alfabetizadas na idade certa.',
    revelacao: '66% das crianças alfabetizadas na idade certa em 2025, acima da meta de 64%.'
  },
  {
    id: 36, tema: 'educacao', equipe: 'aurora', paginas: [33],
    texto: 'Manter o piso salarial nacional dos professores.',
    resumo: 'O Piso Nacional do Magistério será mantido, junto com apoio à formação de professores e incentivo às licenciaturas pelo Pé-de-Meia Licenciatura.'
  },

  /* ===== Proteção e democracia ===== */
  {
    id: 25, tema: 'protecao', equipe: 'aurora', paginas: [21],
    texto: 'Concluir 30 Casas da Mulher Brasileira para acolher vítimas de violência.',
    resumo: 'Dentro do Pacto contra o Feminicídio, o programa promete concluir 30 Casas da Mulher Brasileira e 15 Centros de Referência e distribuir kits de monitoramento de agressores.',
    revelacao: 'Pacto de Enfrentamento ao Feminicídio em vigor.'
  },
  {
    id: 26, tema: 'protecao', equipe: 'aurora', paginas: [12],
    texto: 'Manter o Bolsa Família com benefício extra para crianças e adolescentes.',
    resumo: 'O Bolsa Família foi recriado com benefício extra para crianças e adolescentes. O Flávio também promete manter o programa, mas como "porta de saída" para o emprego.',
    revelacao: 'Menor desigualdade da história (Gini 0,504) e extrema pobreza de 4,6%.'
  },
  {
    id: 27, tema: 'protecao', equipe: 'aurora', paginas: [16],
    texto: 'Regular as redes sociais e plataformas digitais para combater fake news e discurso de ódio.',
    resumo: 'O programa promete "avançar ainda mais" na regulação das redes e plataformas para impedir a difusão de desinformação e de campanhas de ódio.'
  },
  {
    id: 28, tema: 'protecao', equipe: 'aurora', paginas: [22],
    texto: 'Levar atendimento de porta em porta aos idosos com dificuldade de locomoção.',
    resumo: 'O programa prevê atendimento domiciliar a idosos com dificuldade de locomoção e a ampliação do PADI Brasil.',
    revelacao: 'PADI Brasil já implantado em 2.655 municípios.'
  },
  {
    id: 29, tema: 'protecao', equipe: 'orbita', paginas: [66],
    texto: 'Acabar com as estruturas do governo que combatem a desinformação ("Tesouraço da Censura").',
    resumo: 'O programa propõe acabar com as estruturas do Estado criadas para tratar desinformação, que ele chama de "Ministério da Verdade", por considerá-las risco de censura.'
  },
  {
    id: 30, tema: 'protecao', equipe: 'orbita', paginas: [65],
    texto: 'Limitar as decisões individuais dos ministros do STF.',
    resumo: 'O programa propõe limitar as decisões monocráticas do STF e transformá-lo em corte constitucional. Também propõe o fim da reeleição.'
  }
];
