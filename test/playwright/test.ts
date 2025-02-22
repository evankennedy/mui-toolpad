import '../utils/fetchPolyfill';
import { ConsoleMessage, test as base } from '@playwright/test';
import { createRpcClient, RpcClient } from '../../packages/toolpad-app/src/rpcClient';
import type { ServerDefinition } from '../../packages/toolpad-app/pages/api/rpc';

export * from '@playwright/test';

interface ConsoleEntry {
  type: string;
  text: string;
  location: {
    url: string;
    lineNumber: number;
    columnNumber: number;
  };
  args: any[];
}

const IGNORED_ERRORS = [
  /JavaScript Error: "downloadable font: download failed \(font-family: "Roboto" style:normal/,
  /JavaScript Error: "Image corrupt or truncated./,
  /net::ERR_INTERNET_DISCONNECTED/,
  // TODO: Comes up in firefox on CI sometimes
  /InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable/,
];

export type Options = { ignoreConsoleErrors: RegExp[] };

export const test = base.extend<Options & { api: RpcClient<ServerDefinition> }>({
  ignoreConsoleErrors: [],

  page: async ({ page, ignoreConsoleErrors }, use) => {
    const entryPromises: Promise<ConsoleEntry>[] = [];

    const consoleHandler = (msg: ConsoleMessage) => {
      entryPromises.push(
        Promise.all(
          msg.args().map(async (argHandle) => argHandle.jsonValue().catch(() => '<circular>')),
        ).then((args) => {
          return {
            type: msg.type(),
            text: msg.text(),
            location: msg.location(),
            args,
          };
        }),
      );
    };

    page.on('console', consoleHandler);

    await use(page);

    page.off('console', consoleHandler);

    const entries = await Promise.all(entryPromises);
    const ignoredEntries = [...IGNORED_ERRORS, ...ignoreConsoleErrors];
    for (const entry of entries) {
      if (
        entry.type === 'error' &&
        !ignoredEntries.some(
          (regex) => regex.test(entry.text) || entry.args.some((arg) => regex.test(arg)),
        )
      ) {
        // Currently a catch-all for console error messages. Expecting us to add a way of blacklisting
        // expected error messages at some point here
        throw new Error(`Console error message detected\n${JSON.stringify(entry, null, 2)}`);
      }
    }
  },

  api: async ({ baseURL }, use) => {
    const endpoint = new URL('/api/rpc', baseURL).href;
    const api = createRpcClient<ServerDefinition>(endpoint);
    await use(api);
  },
});
