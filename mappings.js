// Contains various mappings/hardcoded values used by the cpu

// for memory accesses
function CONSTS() {
    this.READ = 0;
    this.WRITE = 1;
    this.EXEC = 2;
}

// instantiate a copy
CONSTS = new CONSTS();

// register mappings from disasm.cc
var reg_maps = [
    "zero", "ra", "s0", "s1", "s2", "s3", "s4", "s5",
    "s6", "s7", "s8", "s9", "sA", "sB", "sp", "tp",
    "v0", "v1", "a0", "a1", "a2", "a3", "a4", "a5",
    "a6", "a7", "t0", "t1", "t2", "t3", "t4", "gp"
]

var PCR = {
    "CSR_FFLAGS":    {"num": 0x001, "width": 64,}, // width not confirmed
    "CSR_FRM":       {"num": 0x002, "width": 64,}, // width not confirmed
    "CSR_FCSR":      {"num": 0x003, "width": 64,}, // width not confirmed

    "CSR_SUP0":      {"num": 0x500, "width": 64,},
    "CSR_SUP1":      {"num": 0x501, "width": 64,},
    "CSR_EPC":       {"num": 0x502, "width": 64,},
    "CSR_BADVADDR":  {"num": 0x503, "width": 64,},
    "CSR_PTBR":      {"num": 0x504, "width": 64,},
    "CSR_ASID":      {"num": 0x505, "width": 64,}, // implementation defined
    "CSR_COUNT":     {"num": 0x506, "width": 32,},
    "CSR_COMPARE":   {"num": 0x507, "width": 32,},
    "CSR_EVEC":      {"num": 0x508, "width": 64,},
    "CSR_CAUSE":     {"num": 0x509, "width": 64,},
    "CSR_STATUS":    {"num": 0x50A, "width": 32,},
    "CSR_HARTID":    {"num": 0x50B, "width": 64,},
    "CSR_IMPL":      {"num": 0x50C, "width": 64,},
    "CSR_FATC":      {"num": 0x50D, "width": 64,}, // implementation defined (by ASIDLEN)
    "CSR_SEND_IPI":  {"num": 0x50E, "width": 64,},
    "CSR_CLEAR_IPI": {"num": 0x50F, "width": 64,},

    "CSR_STATS":     {"num": 0x51C, "width": 64,}, // width not confirmed
    "CSR_RESET":     {"num": 0x51D, "width": 64,}, // width not confirmed

    "CSR_TOHOST":    {"num": 0x51E, "width": 64,},
    "CSR_FROMHOST":  {"num": 0x51F, "width": 64,},

    "CSR_CYCLE":     {"num": 0xC00, "width": 32,}, // width not confirmed
    "CSR_TIME":      {"num": 0xC01, "width": 64,}, // width not confirmed
    "CSR_INSTRET":   {"num": 0xC02, "width": 64,}, // width not confirmed
};

// status register bit mappings
var SR = {
    "SR_S"  :  0x00000001,
    "SR_PS"  :  0x00000002,
    "SR_EI"  :  0x00000004,
    "SR_PEI"  :  0x00000008,
    "SR_EF"  :  0x00000010,
    "SR_U64"   :  0x00000020,
    "SR_S64" :  0x00000040,
    "SR_VM" :  0x00000080,
    "SR_EA"  :  0x00000100,
    "SR_IM"  :  0x00FF0000,
    "SR_IP"  :  0xFF000000,
};


// TRAPS: [exception code, interruptBit]
var TRAPS = {
    "Instruction Address Misaligned": [0x0, 0x0],
    "Instruction Access Fault": [0x1, 0x0],
    "Illegal Instruction": [0x2, 0x0],
    "Privileged Instruction": [0x3, 0x0], 
    "Floating-Point Disabled": [0x4, 0x0],
    "System Call": [0x6, 0x0], 
    "Breakpoint": [0x7, 0x0], 
    "Load Address Misaligned": [0x8, 0x0], 
    "Store Address Misaligned": [0x9, 0x0],
    "Load Access Fault": [0xA, 0x0],
    "Store Access Fault": [0xB, 0x0],
    "Accelerator Disabled": [0xC, 0x0],
    "Timer interrupt": [0x7, 0x1],
    "Host interrupt": [0x6, 0x1],
};

/*
var SYSCALLS = {
    93: "sys_exit",
    63: "sys_read",
    64: "sys_write",
    1024: "sys_open",
    57: "sys_close",
    80: "sys_fstat",
    62: "sys_lseek",
    1038: "sys_stat",
    1039: "sys_lstat",
    1025: "sys_link",
    1026: "sys_unlink",
    67: "sys_pread",
    68: "sys_pwrite",
    2011: "sys_getmainvars",
};

var SYSCALL_HANDLERS = {
    "sys_exit": sys_exit,
    "sys_read": sys_read,
    "sys_write": sys_write,
    "sys_open": sys_open,
    "sys_close": sys_close,
    "sys_fstat": sys_fstat,
    "sys_lseek": sys_lseek,
    "sys_stat": sys_stat,
    "sys_lstat": sys_lstat,
    "sys_link": sys_link,
    "sys_unlink": sys_unlink,
    "sys_pread": sys_pread,
    "sys_pwrite": sys_pwrite,
    "sys_getmainvars": sys_getmainvars,
};
*/
