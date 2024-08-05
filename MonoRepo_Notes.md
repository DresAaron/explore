# MonoRepo Notes

This is a learning notes of using `pnpm` to build MonoRepo projects. In this notes, we will learn:

- What is MonoRepo
- Current solutions
  - Which tool we can use?
  - Comparison
- Use pnpm to build MonoRepo
  - Create 3 projects based on TypeScript
  - Frontend uses `React` and `Vite`
- What is missing with current solotion

## Use `pnpm` to build MonoRepo

### Prerequisites

As prerequisites, we need to install `node` and `pnpm`

```bash
npm install -g pnpm
```

Create a project folder

```bash
mkdir monorepo-project
```

Create project folders and files like following structure:

```
.
├─apps  # App
│  ├─admin  # Administration platform
│  └─portal # Portal website
└─packages # Public packages
    ├─api # API administration
    ├─tsconfig
    ├─ui # Public components
    └─utils
```

Create `pnpm-workspace.yaml` under root path:

```yaml
# pnpm-workspace.yaml
# TODO: explain why we need this yaml file here

packages:
  - 'pacakges/*'
  - 'apps/*'
```

What we're doing here is telling `pnpm` that we'll have two projects that it nees to keep track of. Before we create those however, we need to setup our base `tsconfig.json` file. The firstone is `tsconfig.base.json`. Add the following configuration options to it.

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "moduleResolution": "node"
  }
}
```

Of course, feel free to tweak your TypeScript settings as you see fit. Now we can create our actual tsconfig.json. To have it inherit fromour base, we need to add the following line to it.

```json
// tsconfig.json
{
  "extends": "./tsconfig.base.json"
}
```

Initiate project:

```bash
pnpm init
```

### Demo code of `Utils`

Initiate `Utils` project under `package/utils`.

```bash
pnpm init
```

Edit `package.json` of `Utils`

```json
{
  "name": "utils",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "module": "index.ts",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Now we can write create a `index.ts` file to test.

```ts
export const hello = (msg = 'world') => {
  return `hello ${msg}!`;
};
```

### Demo code of `Portal`

Iinitiate `Portal` project under `apps/portal`. We will use `React` and `Vite`.

```bash
pnpm create vite
```

In order to use current folder, you need to set project name as `.` during initiatting.

Now cut `devDependencies` from `portal/package.json` to the root `package.json` file. Install the dependencies. Dependencies installed under `root` folder are available for whole project.

```sh
pnpm install
```

If you need to install dependencies to `root`, you can use `-w`, like:

```sh
pnpm add axios -w
```

If you want to install dependencies to specific `project`, you can use `--filter`, like:

```sh
pnpm --filter api add axios
```

`--filter` can also be used to execute command of specific project, like:

```sh
pnpm --filter portal dev
```

Now you can add `utils` as `portal`'s depenency. You can edit `package.json` manually or run the command like:

```sh
cd apps/portal
pnpm add utils
```

```json
{
  "name": "portal",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "utils": "workspace:*"
  }
}
```

`workspace` means workspace, you can check it at [pnpm](https://pnpm.io/zh/). `*` means the latest version. After adding it to `package.json`, you still have to run `pnpm install`.

Now we can write our test:

```js
// apps/portal/src/App.tsx

import { hello } from 'utils';
<h1>Vite + React + {hello()}</h1>;
```

And you should be able to check the result.

### Demo code of admin

Like `portal` project, we can create a `admin` project. Then import `utils` and write test:

```js
// apps/admin/src/App.tsx
import { hello } from 'utils';
<h1>Vite + React + {hello('monorepo')}</h1>;
```

### Build app

You can use vite command to build apps like run it:

```sh
# build app
pnpm --filter portal build
# preview
pnpm --filter portal preview
```
