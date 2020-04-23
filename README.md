# riscv-angel-extended

This project is an extension of [riscv-angel](https://github.com/riscv/riscv-angel) containing additional UI features like showing the internal state of the OS and CPU in real time.

## Setup

First, make sure you have [NPM](https://www.npmjs.com/get-npm) installed.

Once NPM is installed, you can install the project dependencies with:

```bash
npm install
```

Once complete, navigate to the project root and run:

```bash
npm run dev
```

This should open your browser containing the project. Any changes you make in the code will automatically reload the browser.

## Code style

This project is using [ESLint](https://eslint.org/) to enforce good style.

To see style errors for a particular file, run:

```bash
npm run lint <file.js>
```

To see style errors for all files, run:

```bash
npm run lint:all
```

Additionally, you can have the linter attempt to correct style issues with the following two commands:

```bash
npm run lint:fix <file.js> # fixes individual js files
npm run lint:fix-all # fixes all js files
```

## Project layout

### JavaScript

Most of the files that were included with the original project have been moved to `src/riscv/`.

### CSS

Stylesheets are located in `styles/`.

## Issues

If you have problems running the development envirornment and get a message that says:

> http://0.0.0.0:8080 is already in use. Trying another port.

If you're on a Debian-based machine, you can run

```bash
npm run kill:8080
```

This will kill the process listening on port 8080.
