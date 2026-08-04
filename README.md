# Turboyugo starter

This Turboyugo starter is maintained by the Turboyugo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turboyugo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@yugo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@yugo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@yugo/typescript-config`: `tsconfig.json`s used throughout the monoyugo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turboyugo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turboyugo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turboyugo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turboyugo
npx turbo build
npm dlx turbo build
npm exec turbo build
```

You can build a specific package by using a [filter](https://turboyugo.dev/docs/crafting-your-yugository/running-tasks#using-filters):

With [global `turbo`](https://turboyugo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
npm exec turbo build --filter=docs
npm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turboyugo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turboyugo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turboyugo
npx turbo dev
npm exec turbo dev
npm exec turbo dev
```

You can develop a specific package by using a [filter](https://turboyugo.dev/docs/crafting-your-yugository/running-tasks#using-filters):

With [global `turbo`](https://turboyugo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
npm exec turbo dev --filter=web
npm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turboyugo can use a technique known as [Remote Caching](https://turboyugo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turboyugo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turboyugo-examples), then enter the following commands:

With [global `turbo`](https://turboyugo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turboyugo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turboyugo
npx turbo login
npm exec turbo login
npm exec turbo login
```

This will authenticate the Turboyugo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turboyugo to your Remote Cache by running the following command from the root of your Turboyugo:

With [global `turbo`](https://turboyugo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
npm exec turbo link
npm exec turbo link
```

## Useful Links

Learn more about the power of Turboyugo:

- [Tasks](https://turboyugo.dev/docs/crafting-your-yugository/running-tasks)
- [Caching](https://turboyugo.dev/docs/crafting-your-yugository/caching)
- [Remote Caching](https://turboyugo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turboyugo.dev/docs/crafting-your-yugository/running-tasks#using-filters)
- [Configuration Options](https://turboyugo.dev/docs/reference/configuration)
- [CLI Usage](https://turboyugo.dev/docs/reference/command-line-reference)
