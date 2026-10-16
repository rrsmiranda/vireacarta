/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ID do site no Umami. Sem ele, as métricas ficam desligadas. */
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  /** Endereço do script do Umami (opcional; padrão: Umami Cloud). */
  readonly VITE_UMAMI_SCRIPT_URL?: string;
}
