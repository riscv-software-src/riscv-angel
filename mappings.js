// Contains various mappings/hardcoded values used by the disassembler and cpu

// register mappings from disasm.cc
var reg_maps = [
    "zero", "ra", "s0", "s1",  "s2",  "s3",  "s4",  "s5",
    "s6", "s7", "s8", "s9", "s10", "s11",  "sp",  "tp",
    "v0", "v1", "a0", "a1",  "a2",  "a3",  "a4",  "a5",
    "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13",
]


var inst_to_type = {
    // control transfer instructions
    "j": Jtype,
    "jal": Jtype,
    "beq": Btype,
    "bne": Btype,
    "blt": Btype,
    "bge": Btype,
    "bltu": Btype,
    "bgeu": Btype,
    "jalr.c": Itype,
    "jalr.r": Itype,
    "jalr.j": Itype,
    "rdnpc": Itype,

    // memory instructions
    "lb": Itype,
    "lh": Itype,
    "lw": Itype,
    "ld": Itype,
    "lbu": Itype,
    "lhu": Itype,
    "lwu": Itype,
    "sb": Btype,
    "sh": Btype,
    "sw": Btype,
    "sd": Btype,

    // atomic memory instructions
    "amoadd.w": Rtype,
    "amoswap.w": Rtype,
    "amoand.w": Rtype,
    "amoor.w": Rtype,
    "amomin.w": Rtype,
    "amomax.w": Rtype,
    "amominu.w": Rtype,
    "amomaxu.w": Rtype,
    "amoadd.d": Rtype,
    "amoswap.d": Rtype,
    "amoand.d": Rtype,
    "amoor.d": Rtype,
    "amomin.d": Rtype,
    "amomax.d": Rtype,
    "amominu.d": Rtype,
    "amomaxu.d": Rtype,

    // integer compute instructions
    "addi": Itype,
    "slli": Itype,
    "slti": Itype,
    "sltiu": Itype,
    "xori": Itype,
    "srli": Itype,
    "srai": Itype,
    "ori": Itype,
    "andi": Itype,
    "add": Rtype,
    "sub": Rtype,
    "sll": Rtype,
    "slt": Rtype,
    "sltu": Rtype,
    "xor": Rtype,
    "srl": Rtype,
    "sra": Rtype,
    "or": Rtype,
    "and": Rtype,
    "mul": Rtype,
    "mulh": Rtype,
    "mulhsu": Rtype,
    "mulhu": Rtype,
    "div": Rtype,
    "divu": Rtype,
    "rem": Rtype,
    "remu": Rtype,
    "lui": LUItype,
    "auipc": LUItype,

    // 32 bit integer compute
    "addiw": Itype,
    "slliw": Itype,
    "srliw": Itype,
    "sraiw": Itype,
    "addw": Rtype,
    "subw": Rtype,
    "sllw": Rtype,
    "srlw": Rtype,
    "sraw": Rtype,
    "mulw": Rtype,
    "divw": Rtype,
    "divuw": Rtype,
    "remw": Rtype,
    "remuw": Rtype,

    // Miscellaneous Memory Instructions
    "fence.i": Itype,
    "fence": Itype,

    // System Instructions
    "syscall": Rtype,
    "break": Rtype,
    "rdcycle": Rtype,
    "rdtime": Rtype,
    "rdinstret": Rtype,

    // privileged instructions
    "setpcr": Itype,
    "clearpcr": Itype,
    "mfpcr": Itype,
    "mtpcr": Rtype,

};

function cJtype(opcode){
    this.opcode = opcode;
}

var Jfields = {
    "j": new cJtype(0x67),
    "jal": new cJtype(0x6F), 
};

function cLtype(opcode){
    this.opcode = opcode;
}

var Lfields = {
    "lui": new cLtype(0x37),
    "auipc": new cLtype(0x17),
};

function cItype(opcode, funct3, specialimm, specialrs1){
    this.opcode = opcode;
    this.funct3 = funct3;
    this.specialimm = specialimm;
    this.specialrs1 = specialrs1;
} 

var Ifields = {
    "jalr.c": new cItype(0x6B, 0x0),
    "jalr.r": new cItype(0x6B, 0x1),
    "jalr.j": new cItype(0x6B, 0x2),
    "rdnpc": new cItype(0x6B, 0x4, 0, 0),

    "lb": new cItype(0x03, 0x0),
    "lh": new cItype(0x03, 0x1),
    "lw": new cItype(0x03, 0x2),
    "ld": new cItype(0x03, 0x3),
    "lbu": new cItype(0x03, 0x4),
    "lhu": new cItype(0x03, 0x5),
    "lwu": new cItype(0x03, 0x6),

    "addi": new cItype(0x13, 0x0),
    "slli": new cItype(0x13, 0x1, 0), // needs to be or'd with shamt
    "slti": new cItype(0x13, 0x2),
    "sltiu": new cItype(0x13, 0x3),
    "xori": new cItype(0x13, 0x4),
    "srli": new cItype(0x13, 0x5, 0), // needs to be or'd with shamt
    "srai": new cItype(0x13, 0x5, 0x40), // needs to be or'd with shamt
    "ori": new cItype(0x13, 0x6),
    "andi": new cItype(0x13, 0x7),

    "addiw": new cItype(0x1B, 0x0),
    "slliw": new cItype(0x1B, 0x1, 0), // needs to be or'd with shamt
    "srliw": new cItype(0x1B, 0x5, 0), // needs to be or'd with shamt
    "sraiw": new cItype(0x1B, 0x5, 0x40), // needs to be or'd with shamt

    "fence.i": new cItype(0x2F, 0x1),
    "fence": new cItype(0x2F, 0x2),

    "setpcr": new cItype(0x7B, 0x1),
    "clearpcr": new cItype(0x7B, 0x0),
    "mfpcr": new cItype(0x7B, 0x2),
}; 

function cBtype(opcode, funct3){
    this.opcode = opcode;
    this.funct3 = funct3;
}

var Bfields = {
    "beq": new cBtype(0x63, 0x0),
    "bne": new cBtype(0x63, 0x1),
    "blt": new cBtype(0x63, 0x4),
    "bge": new cBtype(0x63, 0x5),
    "bltu": new cBtype(0x63, 0x6),
    "bgeu": new cBtype(0x63, 0x7),

    "sb": new cBtype(0x23, 0x0),
    "sh": new cBtype(0x23, 0x1),
    "sw": new cBtype(0x23, 0x2),
    "sd": new cBtype(0x23, 0x3),
};

function cRtype(opcode, funct10, specialrs1, specialrs2, specialrd){
    this.opcode = opcode;
    this.funct10 = funct10;
    this.specialrs1 = specialrs1;
    this.specialrs2 = specialrs2;
    this.specialrd = specialrd;
}

var Rfields = {
    "amoadd.w": new cRtype(0x2B, 0x2),
    "amoswap.w": new cRtype(0x2B, 0xA),
    "amoand.w": new cRtype(0x2B, 0x12),
    "amoor.w": new cRtype(0x2B, 0x1A),
    "amomin.w": new cRtype(0x2B, 0x22),
    "amomax.w": new cRtype(0x2B, 0x2A),
    "amominu.w": new cRtype(0x2B, 0x32),
    "amomaxu.w": new cRtype(0x2B, 0x3A),
    "amoadd.d": new cRtype(0x2B, 0x3),
    "amoswap.d": new cRtype(0x2B, 0xB),
    "amoand.d": new cRtype(0x2B, 0x13),
    "amoor.d": new cRtype(0x2B, 0x1B),
    "amomin.d": new cRtype(0x2B, 0x23),
    "amomax.d": new cRtype(0x2B, 0x2B),
    "amominu.d": new cRtype(0x2B, 0x33),
    "amomaxu.d": new cRtype(0x2B, 0x3B),

    "add": new cRtype(0x33, 0x0),
    "sub": new cRtype(0x33, 0x200),
    "sll": new cRtype(0x33, 0x1),
    "slt": new cRtype(0x33, 0x2),
    "sltu": new cRtype(0x33, 0x3),
    "xor": new cRtype(0x33, 0x4),
    "srl": new cRtype(0x33, 0x5),
    "sra": new cRtype(0x33, 0x205),
    "or": new cRtype(0x33, 0x6),
    "and": new cRtype(0x33, 0x7),
    "mul": new cRtype(0x33, 0x8),
    "mulh": new cRtype(0x33, 0x9),
    "mulhsu": new cRtype(0x33, 0xA),
    "mulhu": new cRtype(0x33, 0xB), 
    "div": new cRtype(0x33, 0xC),
    "divu": new cRtype(0x33, 0xD),
    "rem": new cRtype(0x33, 0xE),
    "remu": new cRtype(0x33, 0xF),

    "addw": new cRtype(0x3B, 0x0),
    "subw": new cRtype(0x3B, 0x200),
    "sllw": new cRtype(0x3B, 0x1),
    "srlw": new cRtype(0x3B, 0x5),
    "sraw": new cRtype(0x3B, 0x205),
    "mulw": new cRtype(0x3B, 0x8),
    "divw": new cRtype(0x3B, 0xC),
    "divuw": new cRtype(0x3B, 0xD),
    "remw": new cRtype(0x3B, 0xE),
    "remuw": new cRtype(0x3B, 0xF),

    "syscall": new cRtype(0x77, 0x0, 0x0, 0x0, 0x0),
    "break": new cRtype(0x77, 0x1, 0x0, 0x0, 0x0),
    "rdcycle": new cRtype(0x77, 0x4, 0x0, 0x0),
    "rdtime": new cRtype(0x77, 0xC, 0x0, 0x0),
    "rdinstret": new cRtype(0x77, 0x14, 0x0, 0x0),
    
    "mtpcr": new cRtype(0x7B, 0x3),
}; 

// privileged control register mappings
var PCR = {
    "PCR_SR"       :{"num": 0, "width": 32,},
    "PCR_EPC"      :{"num": 1, "width": 64,},
    "PCR_BADVADDR" :{"num": 2, "width": 64,},
    "PCR_EVEC"     :{"num": 3, "width": 64,},
    "PCR_COUNT"    :{"num": 4, "width": 32,},
    "PCR_COMPARE"  :{"num": 5, "width": 32,},
    "PCR_CAUSE"    :{"num": 6, "width": 64,},
    "PCR_PTBR"     :{"num": 7, "width": 64,},
    "PCR_SEND_IPI" :{"num": 8, "width": 64,}, // not sure here
    "PCR_CLR_IPI"  :{"num": 9, "width": 64,}, // not sure here
    "PCR_COREID"   :{"num": 10, "width": 64,},
    "PCR_IMPL"     :{"num": 11, "width": 64,}, // not sure here
    "PCR_K0"       :{"num": 12, "width": 64,},
    "PCR_K1"       :{"num": 13, "width": 64,},
    "PCR_VECBANK"  :{"num": 18, "width": 64,},
    "PCR_VECCFG"   :{"num": 19, "width": 64,}, //not sure here
    "PCR_RESET"    :{"num": 29, "width": 32,}, // not sure here
    "PCR_TOHOST"   :{"num": 30, "width": 64,},
    "PCR_FROMHOST" :{"num": 31, "width": 64,},
};

// status register bit mappings
var SR = {
    "SR_ET"  :  0x00000001,
    "SR_EF"  :  0x00000002,
    "SR_EV"  :  0x00000004,
    "SR_EC"  :  0x00000008,
    "SR_PS"  :  0x00000010,
    "SR_S"   :  0x00000020,
    "SR_U64" :  0x00000040,
    "SR_S64" :  0x00000080,
    "SR_VM"  :  0x00000100,
    "SR_IM"  :  0x00FF0000,
    "SR_IP"  :  0xFF000000,
};


//var numToPCR = [
//    "PCR_SR",
//    "PCR_EPC",
//    "PCR_BADVADDR",
//    "PCR_EVEC",
//    "PCR_COUNT",
//    "PCR_COMPARE",
//    "PCR_CAUSE",
//    "PCR_PTBR",
//    "PCR_SEND_IPI",
//    "PCR_CLR_IPI",
//    "PCR_COREID",
//    "PCR_IMPL",
//    "PCR_K0",
//    "PCR_K1",
//    undefined,
//    undefined,
//    undefined,
//    undefined,
//    "PCR_VECBANK",
//    "PCR_VECCFG",
//    "PCR_RESET",
//    "PCR_TOHOST",
//    "PCR_FROMHOST"
//];

var TRAPS = {
    "Instruction Address Misaligned": 0x0, // now thrown
    "Instruction Access Fault": 0x1, // requires VM?
    "Illegal Instruction": 0x2, // now thrown, should be completely specified
    "Privileged Instruction": 0x3,
    "Floating-Point Disabled": 0x4, // now thrown
    "System Call": 0x6, // now thrown 
    "Breakpoint": 0x7, // now thrown 
    "Load Address Misaligned": 0x8, // now thrown
    "Store Address Misaligned": 0x9, // now thrown
    "Load Access Fault": 0xA, // requires VM?
    "Store Access Fault": 0xB, // requires VM?
};
