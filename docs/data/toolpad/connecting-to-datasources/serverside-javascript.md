# Serverside JavaScript

<p class="description">Serverside JavaScript functions are the most powerful way to load external data into a Toolpad application. Write async serverside JavaScript functions that return your data </p>

## Working with serverside JavaScript

1. Choose **Add query** in the **Inspector** on the right.

1. Select **serverside JavaScript function**:

   <img src="/static/toolpad/docs/queries/query-2.png?v=0" alt="Select query type" width="464px" />

1. The query editor opens in which you can configure the function.

## Configuring the function

The most powerful way of bringing data into Toolpad is through serverside JavaScript functions. The setup is as follows:

1. Start by changing `toolpad/queries.ts` and set its content to:

   ```tsx
   export async function example() {
     return {
       message: 'hello world',
     };
   }
   ```

1. In the query editor, select the "example" function from the dropdown

   <img src="/static/toolpad/docs/serverside-js/js-1.png?v=0" alt="Select function" width="890px" />

1. Click the preview button

   <img src="/static/toolpad/docs/serverside-js/js-2.png?v=0" alt="Preview function result" width="890px" />

   You'll see the result of the `example` function appear in the preview pane. This rdata will be available as state on the page. It's important to understand that the function runs fully serverside in Node.js. You can see this in action when you change it to

   ```tsx
   export async function example() {
     return {
       message: process.versions,
     };
   }
   ```

   After pressing **Preview**

   <img src="/static/toolpad/docs/serverside-js/js-3.png?v=0" alt="Runs in Node.js" width="890px" />

   You can import and use any Node.js module in `toolpad/queries.ts`. That means that you can access any API or database that distributes a client library as a Node.js module.

## Parameters

To be really useful, these backend functions need to be parametrizable with actual state on the page. You can do so by wrapping them in our `createQuery` function.

```tsx
import { createQuery } from '@mui/toolpad-core';

export const example = createQuery(
  async ({ parameters }) => {
    return {
      message: `3 x ${parameters.value} = ${parameters.value * 3}`,
    };
  },
  {
    parameters: {
      value: {
        typeDef: { type: 'number' },
      },
    },
  },
);
```

This will make the `value` property available in the query editor to be bound to page state.

<img src="/static/toolpad/docs/serverside-js/js-4.png?v=0" alt="Bind parameters" width="890px" />

## Secrets

As these functions are running fully serverside they have access to the available environment variables through `process.env.DB_PASS`. Toolpad reads the `.env` file at the root of the project and will load its values in the environment.

An example `.env` file:

```sh
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

## Finishing

1. You can modify all the basic configuration settings as described in [queries](/toolpad/connecting-to-datasources/queries/) section.

1. Once finished with configuration click **Save** to commit your changes and return to the canvas.
