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

    // 32-bit integer compute instructions here, not necessary right now
    // since this is not a 64 bit implementation
    

    // TODO: add:
    // FP instructions
    // Miscellaneous Memory Instructions
    // System Instructions

};
