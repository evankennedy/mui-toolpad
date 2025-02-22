import sharedConfig from '../config';

type BasicAuthConfig =
  | {
      basicAuthUser: string;
      basicAuthPassword: string;
    }
  | {
      basicAuthUser?: undefined;
      basicAuthPassword?: undefined;
    };

export type ServerConfig = {
  databaseUrl?: string;
  googleSheetsClientId?: string;
  googleSheetsClientSecret?: string;
  encryptionKeys: string[];
  basicAuthUser?: string;
  basicAuthPassword?: string;
  recaptchaV2SecretKey?: string;
  recaptchaV3SecretKey?: string;
  ecsNodeUrl?: string;
  ecsApiKey?: string;
} & BasicAuthConfig;

function readConfig(): ServerConfig & typeof sharedConfig {
  if (typeof window !== 'undefined') {
    throw new Error(`Serverside config can't be loaded on the client side`);
  }

  // Whitespace separated, do not use spaces in your keys
  const encryptionKeys: string[] =
    process.env.TOOLPAD_ENCRYPTION_KEYS?.split(/\s+/).filter(Boolean) ?? [];

  let basicAuthConfig: BasicAuthConfig = {};
  if (process.env.TOOLPAD_BASIC_AUTH_USER && process.env.TOOLPAD_BASIC_AUTH_PASSWORD) {
    basicAuthConfig = {
      basicAuthUser: process.env.TOOLPAD_BASIC_AUTH_USER,
      basicAuthPassword: process.env.TOOLPAD_BASIC_AUTH_PASSWORD,
    };
  } else if (process.env.TOOLPAD_BASIC_AUTH_USER) {
    throw new Error(
      `Basic Auth user configured without password. Please provide the TOOLPAD_BASIC_AUTH_PASSWORD environment variable.`,
    );
  }

  return {
    ...sharedConfig,
    ...basicAuthConfig,
    databaseUrl: process.env.TOOLPAD_DATABASE_URL,
    googleSheetsClientId: process.env.TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_ID,
    googleSheetsClientSecret: process.env.TOOLPAD_DATASOURCE_GOOGLESHEETS_CLIENT_SECRET,
    recaptchaV2SecretKey: process.env.TOOLPAD_RECAPTCHA_V2_SECRET_KEY,
    recaptchaV3SecretKey: process.env.TOOLPAD_RECAPTCHA_V3_SECRET_KEY,
    ecsNodeUrl: process.env.TOOLPAD_ECS_NODE_URL,
    ecsApiKey: process.env.TOOLPAD_ECS_API_KEY,
    encryptionKeys,
  };
}

export default readConfig();
