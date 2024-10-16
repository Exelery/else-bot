declare module "bun" {
  interface Env {
    API_ID: number;
    API_HASH: string;
    SESSION_ACTION?: string;
    REFERAL_ID?: string;
  }
}
