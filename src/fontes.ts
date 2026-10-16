/* Reportagens por carta, conferidas pelo responsável pelo conteúdo
   (planilha vire_a_carta_fontes.xlsx, verificação de 16/10/2026).
   tipo: plano = confirma que está no programa; resultado = dado ou avaliação
   favorável; critica = crítica ou ponto de atenção. Gerado a partir da planilha. */
import type {Link} from './data';

export const FONTES: Record<number, Link[]> = {
  1: [
    {veiculo: "O Liberal", tipo: 'plano', url: "https://www.oliberal.com/politica/lula-fim-da-escala-6x1-sem-reducao-de-salario-e-demanda-do-povo-1.1065323"},
    {veiculo: "Poder360", tipo: 'plano', url: "https://www.poder360.com.br/poder-eleicoes-2026/flavio-deixa-fim-da-escala-6-x-1-fora-do-plano-de-governo/"},
    {veiculo: "Forbes", tipo: 'critica', url: "https://forbes.com.br/forbes-money/2026/10/fim-da-escala-6x1-pode-elevar-precos-e-pressionar-empregos-alertam-economistas/"},
  ],
  2: [
    {veiculo: "Congresso em Foco", tipo: 'plano', url: "https://www.congressoemfoco.com.br/noticia/121276/fim-da-6x1-soberania-e-seguranca-o-plano-de-lula-para-novo-mandato"},
    {veiculo: "Ipea", tipo: 'resultado', url: "https://www.ipea.gov.br/portal/categorias/45-todas-as-noticias/noticias/4416-valorizacao-do-minimo-reduziu-desigualdade"},
  ],
  3: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/pobreza-e-desigualdade-veja-propostas-de-lula-na-integra"},
  ],
  4: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/economia-e-trabalho-veja-as-propostas-de-lula-na-integra"},
  ],
  5: [
    {veiculo: "Poder360", tipo: 'plano', url: "https://www.poder360.com.br/poder-eleicoes-2026/flavio-deixa-fim-da-escala-6-x-1-fora-do-plano-de-governo/"},
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/flavio-x-lula-o-que-defendem-para-economia-e-trabalho"},
    {veiculo: "Intercept Brasil", tipo: 'critica', url: "https://www.intercept.com.br/2026/10/07/flavio-bolsonaro-enterrar-fim-escala-6x1-regra-abre-brecha-reduzir-salarios/"},
  ],
  6: [
    {veiculo: "SpaceMoney", tipo: 'plano', url: "https://www.spacemoney.com.br/politica/plano-governo-flavio-bolsonaro-economia/"},
    {veiculo: "Intercept Brasil", tipo: 'critica', url: "https://www.intercept.com.br/2026/10/07/flavio-bolsonaro-enterrar-fim-escala-6x1-regra-abre-brecha-reduzir-salarios/"},
  ],
  7: [
    {veiculo: "Diário de Pernambuco", tipo: 'plano', url: "https://www.diariodepernambuco.com.br/economia/2025/11/11701468-lula-sanciona-lei-que-isenta-do-imposto-de-renda-quem-ganha-ate-rs-5-mil.html"},
    {veiculo: "Bem Paraná / Agência Brasil", tipo: 'plano', url: "https://www.bemparana.com.br/noticias/parana/lula-sanciona-isencao-do-ir-para-quem-ganha-ate-r-5-mil-beneficio-atinge-846-mil-no-parana/amp/"},
    {veiculo: "Câmara dos Deputados", tipo: 'resultado', url: "https://www.camara.leg.br/noticias/1146368-estudo-da-camara-mostra-reducao-da-desigualdade-com-isencao-do-ir-para-quem-ganha-ate-r-5-mil-por-mes/"},
    {veiculo: "Jornal da USP", tipo: 'resultado', url: "https://jornal.usp.br/radio-usp/isencao-do-imposto-de-renda-pode-impactar-positivamente-a-economia-a-partir-de-2026/"},
    {veiculo: "InfoMoney", tipo: 'critica', url: "https://www.infomoney.com.br/economia/isencao-de-ir-pode-levar-a-choque-de-consumo-e-puxar-inflacao-e-juro-diz-consultoria/"},
  ],
  8: [
    {veiculo: "eixos", tipo: 'plano', url: "https://eixos.com.br/combustiveis-e-bioenergia/gas-do-povo-como-vai-funcionar-e-quem-tem-direito-ao-novo-vale-gas/"},
    {veiculo: "Diário do Comércio", tipo: 'plano', url: "https://diariodocomercio.com.br/economia/tire-duvidas-gas-povo-programa-garante-botijao-gratuito/"},
    {veiculo: "Agência Brasil", tipo: 'resultado', url: "https://agenciabrasil.ebc.com.br/economia/noticia/2026-01/gas-do-povo-chega-todas-capitais-partir-desta-segunda"},
  ],
  9: [
    {veiculo: "Imirante (com O Globo)", tipo: 'plano', url: "https://m.imirante.com/noticias/brasil/2026/08/08/ipolitica-pt-divulga-plano-de-governo-de-lula-com-defesa-da-soberania"},
  ],
  10: [
    {veiculo: "InfoMoney", tipo: 'plano', url: "https://www.infomoney.com.br/politica/o-que-lula-ja-prometeu-para-a-economia-se-conquistar-a-reeleicao/"},
    {veiculo: "Metrópoles", tipo: 'resultado', url: "https://www.metropoles.com/brasil/familias-novo-desenrola-renegocia-um-terco-do-volume-da-1a-edicao"},
  ],
  11: [
    {veiculo: "Forbes", tipo: 'plano', url: "https://forbes.com.br/forbes-money/2026/10/tesouraco-flavio-bolsonaro-plano-economico/"},
    {veiculo: "Poder360", tipo: 'plano', url: "https://www.poder360.com.br/poder-eleicoes/o-que-se-sabe-sobre-o-plano-economico-de-flavio-bolsonaro/"},
    {veiculo: "SpaceMoney", tipo: 'critica', url: "https://www.spacemoney.com.br/economia/macroeconomia/tesouraco-corte-gastos-orcamento"},
    {veiculo: "Monitor do Mercado", tipo: 'critica', url: "https://monitordomercado.com.br/noticias/431087-tesouraco-de-r-200-bilhoes-zeraria-orcamento-e-atingiria-programas-sociais-dizem-economistas"},
  ],
  12: [
    {veiculo: "Poder360", tipo: 'plano', url: "https://www.poder360.com.br/poder-eleicoes/o-que-se-sabe-sobre-o-plano-economico-de-flavio-bolsonaro/"},
    {veiculo: "InfoMoney", tipo: 'critica', url: "https://www.infomoney.com.br/minhas-financas/revisao-do-split-payment-o-que-tributaristas-pensam-da-proposta-de-flavio-bolsonaro/"},
    {veiculo: "Portal da Reforma Tributária", tipo: 'critica', url: "https://www.reformatributaria.com/reforma-tributaria-nas-eleicoes/proposta-de-flavio-bolsonaro-para-iva-de-20-pode-encarecer-produtos-essenciais-dizem-especialistas/"},
  ],
  13: [
    {veiculo: "Conselho Federal de Farmácia", tipo: 'plano', url: "https://site.cff.org.br/noticia/Noticias-gerais/18/02/2025/agora-com-100-de-gratuidade-farmacia-popular-beneficiou-mais-de-24-milhoes-de-brasileiros-em-2024"},
    {veiculo: "Futuro da Saúde", tipo: 'plano', url: "https://futurodasaude.com.br/farmacia-popular-gratuidade/"},
    {veiculo: "Sincofarma SP", tipo: 'resultado', url: "https://sincofarmasp.com.br/2026/09/11/farmacia-popular-amplia-lista-de-remedios-gratuitos-em-2026/"},
  ],
  14: [
    {veiculo: "Poder360", tipo: 'plano', url: "https://www.poder360.com.br/poder-eleicoes-2026/eleicoes-2026-compare-os-planos-de-governo-de-lula-e-flavio/"},
    {veiculo: "Fato Paulista", tipo: 'resultado', url: "https://fatopaulista.com.br/sus-realiza-mais-de-7-5-milhoes-de-cirurgias-eletivas/"},
    {veiculo: "Futuro da Saúde", tipo: 'critica', url: "https://futurodasaude.com.br/ritmo-de-cirurgias-agora-tem-especialistas-tcu/"},
  ],
  15: [
    {veiculo: "Folha de Pernambuco", tipo: 'plano', url: "https://www.folhape.com.br/noticias/abandono-escolar-cai-no-ensino-medio-dois-anos-apos-pe-de-meia/496557/"},
    {veiculo: "Poder360", tipo: 'resultado', url: "https://www.poder360.com.br/poder-educacao/pe-de-meia-evita-evasao-escolar-de-1-a-cada-4-alunos-diz-estudo/"},
  ],
  16: [
    {veiculo: "Tribuna do Planalto", tipo: 'plano', url: "https://tribunadoplanalto.com.br/promessas-para-a-educacao-esbarram-na-falta-de-metas-e-dinheiro-nos-planos-de-lula-e-flavio/"},
    {veiculo: "Congresso em Foco", tipo: 'resultado', url: "https://www.congressoemfoco.com.br/noticia/122559/sancionada-lei-que-transforma-cefets-de-minas-e-rio-em-universidades"},
    {veiculo: "Agência Senado", tipo: 'resultado', url: "https://www12.senado.leg.br/noticias/materias/2026/09/25/centros-de-educacao-tecnologica-de-mg-e-do-rj-viram-universidades"},
    {veiculo: "CNN Brasil", tipo: 'resultado', url: "https://www.cnnbrasil.com.br/politica/lula-sanciona-lei-que-cria-universidade-federal-indigena/"},
    {veiculo: "Poder360", tipo: 'resultado', url: "https://www.poder360.com.br/poder-governo/lula-sanciona-lei-que-cria-universidade-federal-do-esporte/"},
    {veiculo: "Metrópoles", tipo: 'resultado', url: "https://www.metropoles.com/brasil/lula-sanciona-lei-que-cria-universidade-federal-do-esporte-em-brasilia"},
  ],
  17: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/educacao-o-que-flavio-propoe-em-plano-de-governo"},
    {veiculo: "Jornal de Brasília", tipo: 'critica', url: "https://jornaldebrasilia.com.br/noticias/politica-e-poder/plano-de-flavio-bolsonaro-para-educacao-replica-o-pai-em-alfabetizacao-e-quer-pagar-aluno-para-dar-reforco/"},
  ],
  18: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/educacao-o-que-flavio-propoe-em-plano-de-governo"},
    {veiculo: "SBT News (PNE)", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/politica/lula-sanciona-plano-nacional-de-educacao-e-diz-que-brasil-nao-precisa-de-escolas-civico-militares"},
    {veiculo: "Tribuna do Planalto", tipo: 'critica', url: "https://tribunadoplanalto.com.br/promessas-para-a-educacao-esbarram-na-falta-de-metas-e-dinheiro-nos-planos-de-lula-e-flavio/"},
    {veiculo: "Brasil em Folhas", tipo: 'critica', url: "https://www.brasilemfolhas.com.br/2026/09/sbpc-critica-planos-de-governo-com-escolas-civico-militares/"},
  ],
  19: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/seguranca-publica-veja-as-propostas-de-lula-na-integra"},
    {veiculo: "Congresso em Foco", tipo: 'plano', url: "https://www.congressoemfoco.com.br/noticia/118782/lula-lanca-pacote-de-r-11-bi-contra-crime-organizado-nesta-terca"},
    {veiculo: "Exame", tipo: 'resultado', url: "https://exame.com/brasil/r-52-bilhoes-e-mil-postos-de-combustiveis-saiba-tudo-sobre-a-megaoperacao-da-pf-contra-o-pcc/"},
    {veiculo: "InfoMoney", tipo: 'resultado', url: "https://www.infomoney.com.br/brasil/operacao-carbono-oculto-entenda-o-esquema-bilionario-do-pcc-no-setor-de-combustiveis/"},
  ],
  20: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/seguranca-publica-veja-as-propostas-de-lula-na-integra"},
    {veiculo: "Poder360", tipo: 'resultado', url: "https://www.poder360.com.br/poder-seguranca-publica/concessoes-para-cacs-caem-79-desde-fim-do-governo-bolsonaro/"},
  ],
  21: [
    {veiculo: "DGABC", tipo: 'plano', url: "https://www.dgabc.com.br/Noticia/4351825/flavio-e-lula-apresentam-propostas-distintas-para-seguranca-publica"},
    {veiculo: "Jornal de Brasília", tipo: 'resultado', url: "https://jornaldebrasilia.com.br/noticias/politica-e-poder/pec-da-seguranca-ignora-forca-nacional-e-tera-oposicao-no-congresso-avaliam-especialistas/"},
  ],
  22: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/seguranca-publica-veja-as-propostas-de-lula-na-integra"},
    {veiculo: "Poder360", tipo: 'resultado', url: "https://www.poder360.com.br/brasil/letalidade-policial-em-sp-cai-627-com-cameras-nos-uniformes/"},
    {veiculo: "NEV-USP", tipo: 'resultado', url: "https://nev.prp.usp.br/projetos/projetos-em-andamento/pesquisa-uso-cameras-corporais-pela-policia-militar-de-sp/"},
  ],
  23: [
    {veiculo: "Band", tipo: 'plano', url: "https://www.band.com.br/politica/eleicoes/2026/flavio-propoe-limitar-stf-reduzir-maioridade-e-acabar-com-reeleicao-202608131847"},
    {veiculo: "Agência Brasil", tipo: 'critica', url: "https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2026-06/entidades-criticam-projeto-que-reduz-maioridade-penal-aprovado-na-ccj"},
    {veiculo: "Gazeta do Povo", tipo: 'critica', url: "https://www.gazetadopovo.com.br/vida-e-cidadania/cnbb-critica-reducao-da-maioridade-penal-em-meio-a-debate-no-senado/"},
    {veiculo: "Gazeta Mercantil", tipo: 'critica', url: "https://gazetamercantil.com/flavio-maioridade-penal-pec-seguranca-pt-pl"},
  ],
  24: [
    {veiculo: "A Terra é Redonda", tipo: 'critica', url: "https://aterraeredonda.com.br/o-sistema-unico-de-seguranca-publica/"},
  ],
  25: [
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/eleicoes/pobreza-e-desigualdade-veja-propostas-de-lula-na-integra"},
    {veiculo: "Muita Informação", tipo: 'resultado', url: "https://muitainformacao.com.br/cidades/casa-da-mulher-brasileira-completa-dois-anos-em-salvador-e-ultrapassa-26-mil-atendimentos/"},
  ],
  26: [
    {veiculo: "CNN Brasil", tipo: 'plano', url: "https://www.cnnbrasil.com.br/eleicoes/flavio-foca-em-porta-de-saida-do-bolsa-familia/"},
    {veiculo: "A Gazeta", tipo: 'plano', url: "https://www.agazeta.com.br/mundo/o-que-flavio-bolsonaro-e-lula-propoem-sobre-o-bolsa-familia-1026"},
    {veiculo: "Sul21", tipo: 'resultado', url: "https://sul21.com.br/noticias/economia/2026/05/ibge-renda-das-familias-bate-recorde-e-beneficiarios-de-auxilios-caem-em-2025/"},
  ],
  27: [
    {veiculo: "Diário de Pernambuco", tipo: 'plano', url: "https://www.diariodepernambuco.com.br/politica/2026/08/11720678-plano-de-governo-de-lula-preve-defesa-da-soberania-e-revisao-de-emendas.html"},
    {veiculo: "SBT News", tipo: 'plano', url: "https://sbtnews.sbt.com.br/noticia/politica/lula-diz-que-falta-de-regulacao-das-redes-favorece-a-violencia-contra-mulheres"},
    {veiculo: "Gazeta do Povo", tipo: 'resultado', url: "https://www.gazetadopovo.com.br/vida-e-cidadania/regulacao-digital-72-dos-brasileiros-apoiam-restricao-das-redes-sociais-para-menores-de-idade/"},
  ],
  28: [
    {veiculo: "Portal Viva", tipo: 'plano', url: "https://viva.com.br/politica/programa-de-governo-de-lula-propoe-ampliar-atendimento-e-protecao-ao-idoso.html"},
    {veiculo: "Diário de Pernambuco / Agência Brasil", tipo: 'resultado', url: "https://www.diariodepernambuco.com.br/amp/brasil/2026/06/11716930-programa-de-atencao-domiciliar-amplia-cuidado-aos-idosos-no-pais.html"},
  ],
  29: [
    {veiculo: "Poder360", tipo: 'plano', url: "https://www.poder360.com.br/poder-eleicoes-2026/plano-de-governo-de-flavio-mira-reforma-no-stf-e-tesouraco-na-economia/"},
    {veiculo: "Agência Lupa", tipo: 'critica', url: "https://www.agencialupa.org/jornalismo/2026/09/30/flavio-bolsonaro-promete-direito-de-criticar-mas-aciona-tse-contra-opositores/"},
  ],
  30: [
    {veiculo: "Band", tipo: 'plano', url: "https://www.band.com.br/politica/eleicoes/2026/flavio-propoe-limitar-stf-reduzir-maioridade-e-acabar-com-reeleicao-202608131847"},
    {veiculo: "Agência Pública", tipo: 'critica', url: "https://apublica.org/2026/10/stf-pode-ser-enfraquecido-por-interesses-politicos-se-flavio-for-eleito-avaliam-juristas/"},
  ]
};
