/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STYTCH_PROJECT_ENV: string;
  readonly VITE_STYTCH_PUBLIC_TOKEN: string;
  readonly VITE_LARK_PUBLIC_API_KEY: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
