# riscv-angel-extended

This project is an extension of [riscv-angel](https://github.com/riscv/riscv-angel) containing additional UI features like showing the internal state of the OS and CPU in real time.

## Setup

First, make sure you have [NPM](https://www.npmjs.com/get-npm) installed.

Once NPM is installed, you can install the project dependencies with:

```
npm install
```

Once complete, navigate to the project root and run:

```
npm run dev
```

This should open your browser containing the project. Any changes you make in the code will automatically reload the browser.

## Issues

If you have problems running the development envirornment and get a message that says:

> http://0.0.0.0:8080 is already in use. Trying another port.

If you're on a Debian-based machine, you can run

```
npm run kill:8080
```

This will kill the process listening on port 8080.
