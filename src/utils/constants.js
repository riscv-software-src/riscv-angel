const Pointers = {
  start: 0,
  end: 5,
};
const Temporary = [
  {
    start: 5,
    end: 8,
  },
  {
    start: 28,
    end: 32,
  },
];

const CalleeSaved = [
  {
    start: 8,
    end: 10,
  },
  {
    start: 18,
    end: 28,
  },
];

const Arguments = {
  start: 10,
  end: 18,
};

// data scraped from https://en.wikichip.org/wiki/risc-v/registers
const registers = [
  {
    register: 'x0',
    abiName: 'zero',
    description: 'hardwired zero',
    saver: null,
  },
  {
    register: 'x1',
    abiName: 'ra',
    description: 'return address',
    saver: 'Caller',
  },
  {
    register: 'x2',
    abiName: 'sp',
    description: 'stack pointer',
    saver: 'Callee',
  },
  {
    register: 'x3',
    abiName: 'gp',
    description: 'global pointer',
    saver: null,
  },
  {
    register: 'x4',
    abiName: 'tp',
    description: 'thread pointer',
    saver: null,
  },
  {
    register: 'x5',
    abiName: 't0',
    description: 'temporary register',
    saver: 'Caller',
  },
  {
    register: 'x6',
    abiName: 't1',
    description: 'temporary register',
    saver: 'Caller',
  },
  {
    register: 'x7',
    abiName: 't2',
    description: 'temporary register',
    saver: 'Caller',
  },
  {
    register: 'x8',
    abiName: 's0 / fp',
    description: 'saved register / frame pointer',
    saver: 'Callee',
  },
  {
    register: 'x9',
    abiName: 's1',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x10',
    abiName: 'a0',
    description: 'function argument / return value',
    saver: 'Caller',
  },
  {
    register: 'x11',
    abiName: 'a1',
    description: 'function argument / return value',
    saver: 'Caller',
  },
  {
    register: 'x12',
    abiName: 'a2',
    description: 'function argument',
    saver: 'Caller',
  },
  {
    register: 'x13',
    abiName: 'a3',
    description: 'function argument',
    saver: 'Caller',
  },
  {
    register: 'x14',
    abiName: 'a4',
    description: 'function argument',
    saver: 'Caller',
  },
  {
    register: 'x15',
    abiName: 'a5',
    description: 'function argument',
    saver: 'Caller',
  },
  {
    register: 'x16',
    abiName: 'a6',
    description: 'function argument',
    saver: 'Caller',
  },
  {
    register: 'x17',
    abiName: 'a7',
    description: 'function argument',
    saver: 'Caller',
  },
  {
    register: 'x18',
    abiName: 's2',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x19',
    abiName: 's3',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x20',
    abiName: 's4',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x21',
    abiName: 's5',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x22',
    abiName: 's6',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x23',
    abiName: 's7',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x24',
    abiName: 's8',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x25',
    abiName: 's9',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x26',
    abiName: 's10',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x27',
    abiName: 's11',
    description: 'saved register',
    saver: 'Callee',
  },
  {
    register: 'x28',
    abiName: 't3',
    description: 'temporary register',
    saver: 'Caller',
  },
  {
    register: 'x29',
    abiName: 't4',
    description: 'temporary register',
    saver: 'Caller',
  },
  {
    register: 'x30',
    abiName: 't5',
    description: 'temporary register',
    saver: 'Caller',
  },
  {
    register: 'x31',
    abiName: 't6',
    description: 'temporary register',
    saver: 'Caller',
  },
];

export {
  Pointers,
  Temporary,
  CalleeSaved,
  Arguments,
  registers,
};
