// Instruction object and implementation of each instruction

function instruction(instVal) {
    this.inst = instVal;
}

/* Methods for instruction objects */

instruction.prototype.get_opcode = function() {
    return (this.inst & 0x0000007F);
};

instruction.prototype.get_rd = function() {
    return ((this.inst >>> 7) & 0x0000001F);
};

instruction.prototype.get_rs1 = function() {
    return ((this.inst >>> 15) & 0x0000001F);
};

instruction.prototype.get_rs2 = function() {
    return ((this.inst >>> 20) & 0x0000001F);
};

instruction.prototype.get_funct3 = function() {
    return ((this.inst >>> 12) & 0x00000007);
};

instruction.prototype.get_funct7 = function() {
    return ((this.inst >>> 25) & 0x0000007F);
};

/* returns 12 bit immediate zero-extended to 32 bits */
instruction.prototype.get_CSR_imm = function() { // NEW
    return this.inst >>> 20;
};

/* returns 12 bit immediate sign-extended to 32 bits */
instruction.prototype.get_I_imm = function() { // NEW
    return this.inst >> 20;
};

/* returns 12 bit immediate sign-extended to 32 bits */
instruction.prototype.get_S_imm = function() { // NEW
    return ((this.inst >> 20) & 0xFFFFFFE0) | ((this.inst >>> 7) & 0x0000001F);
};

/* returns 12 bit immediate left shifted by one and sign-extended to 32 bits */
instruction.prototype.get_B_imm = function() { // NEW
    var temp = ((this.inst >> 20) & 0xFFFFFFE0) | ((this.inst >>> 7) & 0x0000001F);
    return (temp & 0xFFFFF7FE) | ((temp & 0x00000001) << 11);
};

/* return instruction with lower 12 bits cleared (upper 20 bits contain imm) */
instruction.prototype.get_U_imm = function() { // NEW
    return this.inst & 0xFFFFF000;
};

/* return jump immediate */
instruction.prototype.get_J_imm = function() { // NEW
    var temp = (this.inst >> 20) & 0xFFF007FE;
    return temp | ((this.inst >>> 9) & 0x00000800) | (this.inst & 0x000FF000);
};

/* End Methods for instruction objects */


// "sign extend" the quantity based on bit
// quantity will be a 32 bit quantity that was zero extended by default 
function signExt(quantity, bit) {
    // bits numbered 31, 30, .... 2, 1, 0
    bitval = ((quantity|0) >> bit) & 0x00000001;
    if (bitval === 0) {
        return quantity;
    } else if (bitval === 1) {
        mask = 0x80000000;
        mask = mask >> (31-bit) 
        return (quantity | mask);
    } else {
        throw new RISCVError("ERR in signext");
    }
}

// "sign extend" the quantity based on bit
// input is a 32 bit quantity (as a standard javascript Number)
// output is a 64 bit Long, correctly sign extended
function signExtLT32_64(quantity, bit) {
    // bits numbered 31, 30, .... 2, 1, 0
    bitval = ((quantity|0) >> bit) & 0x00000001;
    if (bitval === 0) {
        return new Long(quantity|0, 0x00000000);
    } else if (bitval === 1) {
        mask = 0x80000000;
        mask = mask >> (31-bit) 
        return new Long((quantity | mask), 0xFFFFFFFF);
    } else {
        throw new RISCVError("ERR in signext");
    }
}

// Takes instruction obj and CPU obj as args, performs computation on given CPU
function runInstruction(inst, RISCV) {
    // force x0 (zero) to zero
    RISCV.gen_reg[0] = new Long(0x0, 0x0);
    var op = inst.get_opcode();

    switch(op) {
    
        // I-TYPE, opcode: 0b0010011
        case 0x13:
            var funct3 = inst.get_funct3();
            switch(funct3) {
                
                // ADDI
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()].add(signExtLT32_64(inst.get_I_imm(), 31));
                    RISCV.pc += 4;
                    break;

                // SLLI                   
                case 0x1:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftLeft(inst.get_I_imm() & 0x003F);
                    RISCV.pc += 4;
                    break;

                // SLTI 
                case 0x2:
                    if ((RISCV.gen_reg[inst.get_rs1()]).lessThan(signExtLT32_64(inst.get_I_imm(), 31))) {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;

                // SLTIU, need to check signExt here
                case 0x3:
                    if (long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], signExtLT32_64(inst.get_I_imm(), 31))) {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;
                
                // XORI
                case 0x4:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).xor(signExtLT32_64(inst.get_I_imm(), 31));
                    RISCV.pc += 4;
                    break;

                // SRLI and SRAI
                case 0x5:
                    var aldiff = (inst.get_I_imm() >>> 6);
                    if (aldiff === 0) {
                        // SRLI
                        RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftRightUnsigned(inst.get_I_imm() & 0x003F);
                    } else {
                        // SRAI
                        RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftRight(inst.get_I_imm() & 0x003F);
                    } 
                    RISCV.pc += 4;
                    break;

                // ORI 
                case 0x6:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).or(signExtLT32_64(inst.get_I_imm(), 31));
                    RISCV.pc += 4;
                    break;

                // ANDI
                case 0x7:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).and(signExtLT32_64(inst.get_I_imm(), 31));
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;

            }
            break;

        // R-TYPE, opcode: 0b0110011
        case 0x33:
            var funct10 = (inst.get_funct7() << 3) | inst.get_funct3();

            switch(funct10) {

                // ADD
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).add(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // SUB
                case 0x100:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).subtract(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // SLL
                case 0x1:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftLeft((RISCV.gen_reg[inst.get_rs2()]).getLowBits() & 0x3F);
                    RISCV.pc += 4;
                    break;

                // SLT
                case 0x2:
                    if ((RISCV.gen_reg[inst.get_rs1()]).lessThan(RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;

                // SLTU
                case 0x3:
                    if (long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;

                // XOR
                case 0x4:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).xor(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // SRL
                case 0x5:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftRightUnsigned((RISCV.gen_reg[inst.get_rs2()]).getLowBits() & 0x3F);
                    RISCV.pc += 4;
                    break;

                // SRA
                case 0x105:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftRight((RISCV.gen_reg[inst.get_rs2()]).getLowBits() & 0x3F);
                    RISCV.pc += 4;
                    break;

                // OR
                case 0x6:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).or(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // AND
                case 0x7:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).and(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // MUL
                case 0x8:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).multiply(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // MULH
                case 0x9:
                    // plan: long -> string -> bignum -> do the mult
                    // then divide by 2^64 (equiv to right shift by 64 bits)
                    // then bignum -> string -> Long.fromString()
                    var big1 = BigInteger(RISCV.gen_reg[inst.get_rs1()].toString(10));
                    var big2 = BigInteger(RISCV.gen_reg[inst.get_rs2()].toString(10));
                    var bigres = big1.multiply(big2);
                    var bigdiv = BigInteger("18446744073709551616"); // 2^64
                    var bigresf = bigres.divide(bigdiv);

                    // need to fix one-off error for negative nums when doing this shift
                    if (bigres.isNegative()) {
                        bigresf = bigresf.subtract(BigInteger("1"));
                    }

                    bigresf = bigresf.toString(10);
                    var result = Long.fromString(bigresf, 10);
                    RISCV.gen_reg[inst.get_rd()] = result;
                    RISCV.pc += 4;
                    break;

                // MULHSU
                case 0xA:
                    var l1 = RISCV.gen_reg[inst.get_rs1()];
                    var l2 = RISCV.gen_reg[inst.get_rs2()];
                    var l2neg = (l2.getHighBits() & 0x80000000) != 0;
                    var big1 = BigInteger(l1);

                    if (l2neg) {
                        l2 = new Long(l2.getLowBits(), l2.getHighBits() & 0x7FFFFFFF);
                        var big2 = BigInteger(l2);
                        big2 = big2.add(BigInteger("9223372036854775808")); // 2^63
                    } else {
                        var big2 = BigInteger(l2);
                    }

                    var bigres = big1.multiply(big2);
                    var bigdiv = BigInteger("18446744073709551616"); // 2^64
                    var bigresf = bigres.divide(bigdiv);

                    // need to fix one-off error for negative nums when doing this shift
                    if (bigres.isNegative()) {
                        bigresf = bigresf.subtract(BigInteger("1"));
                    }


                    // now we have the upper 64 bits of result, signed
                    bigresf = bigresf.toString(10);
                    RISCV.gen_reg[inst.get_rd()] = Long.fromString(bigresf, 10);
                    RISCV.pc += 4;
                    break;

                // MULHU
                case 0xB:
                    // plan: long -determine/fix signs -> string -> bignum -> do the mult
                    // then divide by 2^64 (equiv to right shift by 64 bits)
                    // then bignum -> string -> Long.fromString()
                    var l1 = RISCV.gen_reg[inst.get_rs1()];
                    var l2 = RISCV.gen_reg[inst.get_rs2()];
                    var l1neg = (l1.getHighBits() & 0x80000000) != 0;
                    var l2neg = (l2.getHighBits() & 0x80000000) != 0;
                    if (l1neg) {
                        l1 = new Long(l1.getLowBits(), l1.getHighBits() & 0x7FFFFFFF);
                        var big1 = BigInteger(l1);
                        big1 = big1.add(BigInteger("9223372036854775808"));
                    } else {
                        var big1 = BigInteger(l1);
                    }
                    if (l2neg) {
                        l2 = new Long(l2.getLowBits(), l2.getHighBits() & 0x7FFFFFFF);
                        var big2 = BigInteger(l2);
                        big2 = big2.add(BigInteger("9223372036854775808")); // 2^63
                    } else {
                        var big2 = BigInteger(l2);
                    }

                    var bigres = big1.multiply(big2);
                    var bigdiv = BigInteger("18446744073709551616"); // 2^64
                    var bigresf = bigres.divide(bigdiv);
                    var bigsub = BigInteger("9223372036854775808"); // 2^63
                    if (bigresf.compare(bigsub) >= 0) {
                        // need to subtract bigsub, manually set MSB
                        bigresf = bigresf.subtract(bigsub);
                        bigresf = bigresf.toString(10)
                        var res = Long.fromString(bigresf, 10);
                        res = new Long(res.getLowBits(), res.getHighBits()|0x80000000);
                    } else {
                        bigresf = bigresf.toString(10);
                        var res = Long.fromString(bigresf, 10);
                    }
                    RISCV.gen_reg[inst.get_rd()] = res;
                    RISCV.pc += 4;
                    break;

                // DIV 
                case 0xC:
                    if (RISCV.gen_reg[inst.get_rs2()].equals(new Long(0x0, 0x0))) {
                        // divide by zero, result is all ones
                        RISCV.gen_reg[inst.get_rd()] = new Long(0xFFFFFFFF, 0xFFFFFFFF);
                    } else if (RISCV.gen_reg[inst.get_rs1()].equals(new Long(0x0, 0x80000000)) && RISCV.gen_reg[inst.get_rs1()].equals(new Long(0xFFFFFFFF, 0xFFFFFFFF))) {
                        // divide most negative num by -1 -> signed overflow
                        // set result to dividend
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()];
                    } else {
                        // actual division
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()].div(RISCV.gen_reg[inst.get_rs2()]);
                    }
                    RISCV.pc += 4;
                    break;

                // DIVU
                case 0xD:
                    var l1 = RISCV.gen_reg[inst.get_rs1()];
                    var l2 = RISCV.gen_reg[inst.get_rs2()];
                    if (l2.equals(new Long(0x0, 0x0))) {
                        //div by zero
                        RISCV.gen_reg[inst.get_rd()] = new Long(0xFFFFFFFF, 0xFFFFFFFF);
                        RISCV.pc += 4;
                        break;
                    }

                    var l1neg = (l1.getHighBits() & 0x80000000) != 0;
                    var l2neg = (l2.getHighBits() & 0x80000000) != 0;
                    if (l1neg) {
                        l1 = new Long(l1.getLowBits(), l1.getHighBits() & 0x7FFFFFFF);
                        var big1 = BigInteger(l1);
                        big1 = big1.add(BigInteger("9223372036854775808"));
                    } else {
                        var big1 = BigInteger(l1);
                    }
                    if (l2neg) {
                        l2 = new Long(l2.getLowBits(), l2.getHighBits() & 0x7FFFFFFF);
                        var big2 = BigInteger(l2);
                        big2 = big2.add(BigInteger("9223372036854775808")); // 2^63
                    } else {
                        var big2 = BigInteger(l2);
                    }

                    var bigresf = big1.divide(big2);
                    var bigsub = BigInteger("9223372036854775808"); // 2^63
                    if (bigresf.compare(bigsub) >= 0) {
                        // need to subtract bigsub, manually set MSB
                        bigresf = bigresf.subtract(bigsub);
                        bigresf = bigresf.toString(10)
                        var res = Long.fromString(bigresf, 10);
                        res = new Long(res.getLowBits(), res.getHighBits()|0x80000000);
                    } else {
                        bigresf = bigresf.toString(10);
                        var res = Long.fromString(bigresf, 10);
                    }
                    RISCV.gen_reg[inst.get_rd()] = res;
                    RISCV.pc += 4;
                    break;

                // REM
                case 0xE:
                    if (RISCV.gen_reg[inst.get_rs2()].equals(new Long(0x0, 0x0))) {
                        // rem (divide) by zero, result is dividend
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()];
                    } else if (RISCV.gen_reg[inst.get_rs1()].equals(new Long(0x0, 0x80000000)) && RISCV.gen_reg[inst.get_rs1()].equals(new Long(0xFFFFFFFF, 0xFFFFFFFF))) {
                        // rem (divide) most negative num by -1 -> signed overflow
                        // set result to dividend
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    } else {
                        // actual rem
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()].modulo(RISCV.gen_reg[inst.get_rs2()]);
                    }
                    RISCV.pc += 4;
                    break;

                // REMU
                case 0xF:
                    var l1 = RISCV.gen_reg[inst.get_rs1()];
                    var l2 = RISCV.gen_reg[inst.get_rs2()];
                    if (l2.equals(new Long(0x0, 0x0))) {
                        //div by zero
                        RISCV.gen_reg[inst.get_rd()] = l1;
                        RISCV.pc += 4;
                        break;
                    }

                    var l1neg = (l1.getHighBits() & 0x80000000) != 0;
                    var l2neg = (l2.getHighBits() & 0x80000000) != 0;
                    if (l1neg) {
                        l1 = new Long(l1.getLowBits(), l1.getHighBits() & 0x7FFFFFFF);
                        var big1 = BigInteger(l1);
                        big1 = big1.add(BigInteger("9223372036854775808"));
                    } else {
                        var big1 = BigInteger(l1);
                    }
                    if (l2neg) {
                        l2 = new Long(l2.getLowBits(), l2.getHighBits() & 0x7FFFFFFF);
                        var big2 = BigInteger(l2);
                        big2 = big2.add(BigInteger("9223372036854775808")); // 2^63
                    } else {
                        var big2 = BigInteger(l2);
                    }

                    var bigresf = big1.remainder(big2);
                    var bigsub = BigInteger("9223372036854775808"); // 2^63
                    if (bigresf.compare(bigsub) >= 0) {
                        // need to subtract bigsub, manually set MSB
                        bigresf = bigresf.subtract(bigsub);
                        bigresf = bigresf.toString(10)
                        var res = Long.fromString(bigresf, 10);
                        res = new Long(res.getLowBits(), res.getHighBits()|0x80000000);
                    } else {
                        bigresf = bigresf.toString(10);
                        var res = Long.fromString(bigresf, 10);
                    }
                    RISCV.gen_reg[inst.get_rd()] = res;
                    RISCV.pc += 4;
                    break;


                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;

            }
            break;

        // L-TYPE (LUI) - opcode: 0b0110111
        case 0x37:
            RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(inst.get_U_imm(), 31);
            RISCV.pc += 4;
            break;

        // L-TYPE (AUIPC) - opcode: 0b0010111
        case 0x17:
            RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(inst.get_U_imm() + (RISCV.pc & 0xFFFFF000), 31);
            RISCV.pc += 4;
            break;

        // J-TYPE (JAL) - opcode: 0b1101111
        case 0x6F:
            RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.pc + 4, 31);
            RISCV.pc = (RISCV.pc|0) + inst.get_J_imm();
            break;

        // B-TYPE (Branches) - opcode: 0b1100011
        case 0x63:
            var funct3 = inst.get_funct3();
            switch(funct3) {

                // BEQ
                case 0x0:
                    if ((RISCV.gen_reg[inst.get_rs1()]).equals(RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.pc = (RISCV.pc|0) + inst.get_B_imm();
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BNE
                case 0x1:
                    if ((RISCV.gen_reg[inst.get_rs1()]).notEquals(RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.pc = (RISCV.pc|0) + inst.get_B_imm();
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BLT
                case 0x4:
                    if ((RISCV.gen_reg[inst.get_rs1()]).lessThan(RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.pc = (RISCV.pc|0) + inst.get_B_imm();
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BGE
                case 0x5:
                    if ((RISCV.gen_reg[inst.get_rs1()]).greaterThanOrEqual(RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.pc = (RISCV.pc|0) + inst.get_B_imm();
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BLTU
                case 0x6:
                    if (long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.pc = (RISCV.pc|0) + inst.get_B_imm();
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BGEU
                case 0x7:
                    if (!long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], RISCV.gen_reg[inst.get_rs2()])) {
                        RISCV.pc = (RISCV.pc|0) + inst.get_B_imm();
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;

            }
            break;



        // I-TYPES (JALR)
        case 0x67:
            var funct3 = inst.get_funct3();
            if (funct3 == 0x0) {
                RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.pc + 4, 31);
                RISCV.pc = inst.get_I_imm() + (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0);
            } else {
                throw new RISCVTrap("Illegal Instruction");
            }
            break;


        // Loads
        case 0x3:
            var funct3 = inst.get_funct3();
            switch(funct3) {

                // LB
                case 0x0:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_byte_from_mem(addr), 7);
                    RISCV.pc += 4;
                    break;

                // LH
                case 0x1:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_half_from_mem(addr), 15);
                    RISCV.pc += 4;
                    break;

                // LW
                case 0x2:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_word_from_mem(addr), 31);
                    RISCV.pc += 4;
                    break;

                // LD 
                case 0x3:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    // unlike load_half/byte/word_from_mem, double returns Long
                    RISCV.gen_reg[inst.get_rd()] = RISCV.load_double_from_mem(addr);
                    RISCV.pc += 4;
                    break;

                // LBU
                case 0x4:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.load_byte_from_mem(addr) & 0x000000FF, 0x0);
                    RISCV.pc += 4;
                    break;

                // LHU
                case 0x5:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.load_half_from_mem(addr) & 0x0000FFFF, 0x0);
                    RISCV.pc += 4;
                    break;

                // LWU
                case 0x6:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_I_imm()|0;
                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.load_word_from_mem(addr), 0x0);
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;


            }
            break;

        // Stores
        case 0x23:
            var funct3 = inst.get_funct3(); 
            switch(funct3) {
                
                // SB
                case 0x0:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_S_imm()|0;
                    RISCV.store_byte_to_mem(addr, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.pc += 4;
                    break;

                // SH
                case 0x1:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_S_imm()|0;
                    RISCV.store_half_to_mem(addr, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.pc += 4;
                    break;

                // SW
                case 0x2:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_S_imm()|0;
                    RISCV.store_word_to_mem(addr, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.pc += 4;
                    break;

                // SD
                case 0x3:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + inst.get_S_imm()|0;
                    RISCV.store_double_to_mem(addr, RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;

            }
            break;

        // FENCE instructions - NOPS for this imp
        case 0x0F:
            var funct3 = inst.get_funct3();
            if (funct3 == 0x1) {
                // FENCE.I is no-op in this implementation
                RISCV.pc += 4;
            } else if (funct3 == 0x0) {
                // FENCE is no-op in this implementation
                RISCV.pc += 4;
            } else {
                throw new RISCVTrap("Illegal Instruction");
            }
            break;

        // R-TYPES (continued): System instructions
        case 0x73:
            var superfunct = inst.get_funct3() | inst.get_rs2() << 3 | inst.get_funct7() << 8;
            switch(superfunct) {

                // SCALL
                case 0x0:
                    throw new RISCVTrap("System Call");
                    RISCV.pc += 4;
                    break;

                // SBREAK
                case 0x8:
                    throw new RISCVTrap("Breakpoint");
                    RISCV.pc += 4;
                    break;

                // SRET
                case 0x4000:
                    // [todo] - need to check for supervisor?
                    // first, confirm that we're in supervisor mode
//                    if ((RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_S"]) == 0) {
//                        throw new RISCVTrap("Privileged Instruction");
//                    }
                    // do eret stuff here
                    var oldsr = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]];
                    // set SR[S] = SR[PS], don't touch SR[PS]
                    if ((oldsr & SR["SR_PS"]) != 0) {
                        // PS is set
                        oldsr = oldsr | SR["SR_S"];
                    } else {
                        oldsr = oldsr & (~SR["SR_S"]);
                    }
                    // set EI
                    if ((oldsr & SR["SR_PEI"]) != 0) {
                        oldsr = oldsr | SR["SR_EI"];
                    } else {
                        oldsr = oldsr & (~SR["SR_EI"]);
                    }
        
                    // store updated SR back:
                    RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = oldsr;



                    // set pc to value stored in EPC
                    RISCV.pc = RISCV.priv_reg[PCR["CSR_EPC"]["num"]].getLowBits();
//                    RISCV.pc += 4;
                    break;

                // RDCYCLE
                case 0x6002:
                    RISCV.gen_reg[inst.get_rd()] = RISCV.priv_reg[PCR["CSR_CYCLE"]["num"]];
                    RISCV.pc += 4;
                    break;

                // RDTIME
                case 0x600A:
                    // places #ms since cpu boot in rd. against spec 
                    // but the best we can reasonably do with js
                    var nowtime = new Date();
                    nowtime = nowtime.getTime();
                    // need to be careful here: the subtraction needs to be
                    // done as a float to cut down to reasonable number of
                    // bits, then or with zero to get close by int value
                    var result = nowtime - RISCV.priv_reg[PCR["CSR_TIME"]["num"]].toNumber();
                    RISCV.gen_reg[inst.get_rd()] = Long.fromNumber(result);
                    RISCV.pc += 4;
                    break;

                // RDINSTRET
                case 0x6012:
                    // for our purposes, this is the same as RDCYCLE:
                    RISCV.gen_reg[inst.get_rd()] = RISCV.priv_reg[PCR["CSR_INSTRET"]["num"]];
                    RISCV.pc += 4;
                    break;

                default:
                    // if none of the above are triggered, try handling as CSR inst
                    var funct3 = inst.get_funct3();
                    //var rd = RISCV.gen_reg[inst.get_rd()];
                    var rs1 = RISCV.gen_reg[inst.get_rs1()];
                    switch(funct3) {

                        // [todo] - currently does not perform permission check

                        // CSRRW
                        case 0x1:
                            var temp = RISCV.priv_reg[inst.get_CSR_imm()];
                            if (typeof temp === "number") {
                                RISCV.gen_reg[inst.get_rd()] = new Long(temp, 0x0);
                                temp = rs1.getLowBitsUnsigned();
                            } else {
                                //temp is a long
                                RISCV.gen_reg[inst.get_rd()] = temp;
                                temp = rs1;
                            }
                            RISCV.set_pcr(inst.get_CSR_imm(), temp);
                            RISCV.pc += 4;
                            break;

                        // CSRRS
                        case 0x2:
                            var temp = RISCV.priv_reg[inst.get_CSR_imm()];
                            if (typeof temp === "number") {
                                RISCV.gen_reg[inst.get_rd()] = new Long(temp, 0x0);
                                temp = temp | rs1.getLowBitsUnsigned();
                            } else {
                                //temp is a long
                                RISCV.gen_reg[inst.get_rd()] = temp;
                                temp = temp.or(rs1);
                            }
                            RISCV.set_pcr(inst.get_CSR_imm(), temp);
                            RISCV.pc += 4;
                            break;

                        // CSRRC
                        case 0x3:
                            var temp = RISCV.priv_reg[inst.get_CSR_imm()];
                            if (typeof temp === "number") {
                                RISCV.gen_reg[inst.get_rd()] = new Long(temp, 0x0);
                                temp = temp & ~(rs1.getLowBitsUnsigned());
                            } else {
                                //temp is a long
                                RISCV.gen_reg[inst.get_rd()] = temp;
                                temp = temp.and(rs1.not());
                            }
                            RISCV.set_pcr(inst.get_CSR_imm(), temp);
                            RISCV.pc += 4;
                            break;

                        // CSRRWI
                        case 0x5:
                            var temp = RISCV.priv_reg[inst.get_CSR_imm()];
                            if (typeof temp === "number") {
                                RISCV.gen_reg[inst.get_rd()] = new Long(temp, 0x0);
                                temp = inst.get_rs1() & 0x0000001F;
                            } else {
                                //temp is a long
                                RISCV.gen_reg[inst.get_rd()] = temp;
                                temp = new Long(inst.get_rs1() & 0x0000001F, 0x0);
                            }
                            RISCV.set_pcr(inst.get_CSR_imm(), temp);
                            RISCV.pc += 4;
                            break;

                        // CSRRSI
                        case 0x6:
                            var temp = RISCV.priv_reg[inst.get_CSR_imm()];
                            if (typeof temp === "number") {
                                RISCV.gen_reg[inst.get_rd()] = new Long(temp, 0x0);
                                temp = temp | (inst.get_rs1() & 0x0000001F);
                            } else {
                                //temp is a long
                                RISCV.gen_reg[inst.get_rd()] = temp;
                                temp = temp.or(new Long(inst.get_rs1() & 0x0000001F, 0x0));
                            }
                            RISCV.set_pcr(inst.get_CSR_imm(), temp);
                            RISCV.pc += 4;
                            break;

                        // CSRRCI
                        case 0x7:
                            var temp = RISCV.priv_reg[inst.get_CSR_imm()];
                            if (typeof temp === "number") {
                                RISCV.gen_reg[inst.get_rd()] = new Long(temp, 0x0);
                                temp = temp & ~(inst.get_rs1() & 0x0000001F);
                            } else {
                                //temp is a long
                                RISCV.gen_reg[inst.get_rd()] = temp;
                                temp = temp.and(new Long(inst.get_rs1() & 0x0000001F, 0x0).not());
                            }
                            RISCV.set_pcr(inst.get_CSR_imm(), temp);
                            RISCV.pc += 4;
                            break;


                        default:
                            throw new RISCVTrap("Illegal Instruction");
                            break;

                    }
                    break;

            }
            break;


        // 32 bit integer compute instructions
        case 0x1B:
            var funct3 = inst.get_funct3(); 

            switch(funct3) {

                // ADDIW
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (inst.get_I_imm()|0), 31);
                    RISCV.pc += 4;
                    break;


                // SLLIW
                case 0x1:
                    if ((inst.get_I_imm() >>> 6) != 0) {
                        //this is a bad inst, but not a trap, according to ISA doc
                        throw new RISCVError("ERR IN SLLI");
                        break;
                    }
                    if (((inst.get_I_imm() >>> 5) & 0x1) != 0) {
                        throw new RISCVTrap("Illegal Instruction");
                        break;
                    }
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits() << (inst.get_I_imm() & 0x003F), 31);
                    RISCV.pc += 4;
                    break;


                // SRLIW and SRAIW
                case 0x5:
                    if (((inst.get_I_imm() >>> 5) & 0x1) != 0) {
                        throw new RISCVTrap("Illegal Instruction");
                        break;
                    }
                    var aldiff = (inst.get_I_imm() >>> 6);
                    if (aldiff === 0) {
                        // SRLIW
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits() >>> (inst.get_I_imm() & 0x003F), 31);
                    } else {
                        // SRAIW
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits() >> (inst.get_I_imm() & 0x003F), 31);
                    } 
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;
            }
            break;


        // more 32 bit int compute
        case 0x3B:
            var funct10 = (inst.get_funct7() << 3) | inst.get_funct3();
            switch(funct10) {

                // ADDW
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // SUBW
                case 0x100:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) - (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // SLLW
                case 0x1:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) << (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // SRLW
                case 0x5:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) >>> (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // SRAW
                case 0x105:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) >> (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // MULW
                case 0x8:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits()*RISCV.gen_reg[inst.get_rs2()].getLowBits(), 31);
                    RISCV.pc += 4;
                    break;

                // DIVW
                case 0xC:
                    if (RISCV.gen_reg[inst.get_rs2()].equals(new Long(0x0, 0x0))) {
                        //div by zero, set result to all ones
                        RISCV.gen_reg[inst.get_rd()] = new Long(0xFFFFFFFF, 0xFFFFFFFF);
                    } else if (RISCV.gen_reg[inst.get_rs1()].getLowBits() == 0xFFFFFFFF && RISCV.gen_reg[inst.get_rs2()].getLowBits() == 0x80000000) {
                        // div most negative 32 bit num by -1: result = dividend
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()];
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0)/(RISCV.gen_reg[inst.get_rs2()].getLowBits()|0))|0, 31);
                    }
                    RISCV.pc += 4;
                    break;

                // DIVUW
                case 0xD:
                    if (RISCV.gen_reg[inst.get_rs2()].equals(new Long(0x0, 0x0))) {
                        //div by zero, set result to all ones
                        RISCV.gen_reg[inst.get_rd()] = new Long(0xFFFFFFFF, 0xFFFFFFFF);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((signed_to_unsigned(RISCV.gen_reg[inst.get_rs1()].getLowBits())/signed_to_unsigned(RISCV.gen_reg[inst.get_rs2()].getLowBits()))|0, 31);
                    }
                    RISCV.pc += 4;
                    break;

                // REMW
                case 0xE:
                    if (RISCV.gen_reg[inst.get_rs2()].equals(new Long(0x0, 0x0))) {
                        // rem (div) by zero, set result to dividend
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()];
                    } else if (RISCV.gen_reg[inst.get_rs1()].getLowBits() == 0xFFFFFFFF && RISCV.gen_reg[inst.get_rs2()].getLowBits() == 0x80000000) {
                        // rem (div) most negative 32 bit num by -1: result = 0
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0)%(RISCV.gen_reg[inst.get_rs2()].getLowBits()|0))|0, 31);
                    }
                    RISCV.pc += 4;
                    break;

                // REMUW
                case 0xF:
                    if (RISCV.gen_reg[inst.get_rs2()].equals(new Long(0x0, 0x0))) {
                        // rem (div) by zero, set result to dividend
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()];
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((signed_to_unsigned(RISCV.gen_reg[inst.get_rs1()].getLowBits())%signed_to_unsigned(RISCV.gen_reg[inst.get_rs2()].getLowBits()))|0, 31);
                    }
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;
         
            }
            break;

        // atomic memory instructions 
        case 0x2F:
            var funct8 = ((inst.get_funct7() >> 2) << 3) | inst.get_funct3();
            switch(funct8) {

                // AMOADD.W
                case 0x2:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    var temp = rd_temp.add(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());

                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOSWAP.W
                case 0xA:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    var temp = RISCV.gen_reg[inst.get_rs2()];
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOXOR.W
                case 0x22:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    var temp = rd_temp.xor(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOAND.W
                case 0x62:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    var temp = rd_temp.and(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOOR.W
                case 0x42:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    var temp = rd_temp.or(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOMIN.W
                case 0x82:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    if (rd_temp.greaterThan(RISCV.gen_reg[inst.get_rs2()])) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;

                    RISCV.pc += 4;
                    break;

                // AMOMAX.W
                case 0xA2:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    if (rd_temp.lessThan(RISCV.gen_reg[inst.get_rs2()])) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;


                // AMOMINU.W
                case 0xC2:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    if (signed_to_unsigned(rd_temp.getLowBitsUnsigned()) > signed_to_unsigned(RISCV.gen_reg[inst.get_rs2()].getLowBitsUnsigned())) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOMAXU.W
                case 0xE2:
                    var rd_temp = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned()), 31);
                    if (signed_to_unsigned(rd_temp.getLowBitsUnsigned()) < signed_to_unsigned(RISCV.gen_reg[inst.get_rs2()].getLowBitsUnsigned())) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp.getLowBitsUnsigned());
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;


                // AMOADD.D
                case 0x3:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    var temp = rd_temp.add(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOSWAP.D
                case 0xB:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    var temp = RISCV.gen_reg[inst.get_rs2()];
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOXOR.D
                case 0x23:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    var temp = rd_temp.xor(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOAND.D
                case 0x63:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    var temp = rd_temp.and(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOOR.D
                case 0x43:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    var temp = rd_temp.or(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOMIN.D
                case 0x83:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    if (rd_temp.greaterThan(RISCV.gen_reg[inst.get_rs2()])) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOMAX.D
                case 0xA3:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    if (rd_temp.lessThan(RISCV.gen_reg[inst.get_rs2()])) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOMINU.D
                case 0xC3:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    if (!long_less_than_unsigned(rd_temp, RISCV.gen_reg[inst.get_rs2()])) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // AMOMAXU.D
                case 0xE3:
                    var rd_temp = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned());
                    if (long_less_than_unsigned(rd_temp, RISCV.gen_reg[inst.get_rs2()])) {
                        var temp = RISCV.gen_reg[inst.get_rs2()];
                    } else {
                        var temp = rd_temp;
                    }
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBitsUnsigned(), temp);
                    RISCV.gen_reg[inst.get_rd()] = rd_temp;
                    RISCV.pc += 4;
                    break;

                // LR.W
                case 0x12:
                    // This acts just like a lw in this implementation (no need for sync)
                    // (except there's no immediate)
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_word_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // LR.D
                case 0x13:
                    // This acts just like a ld in this implementation (no need for sync)
                    // (except there's no immediate)
                    RISCV.gen_reg[inst.get_rd()] = RISCV.load_double_from_mem(RISCV.gen_reg[inst.get_rs1()].getLowBits()|0);
                    RISCV.pc += 4;
                    break;

                // SC.W
                case 0x1A:
                    // this acts just like a sd in this implementation, but it will
                    // always set the check register to 0 (indicating load success)
                    RISCV.store_word_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBits()|0, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0); // indicate success
                    RISCV.pc += 4;
                    break;

                // SC.D
                case 0x1B:
                    // this acts just like a sd in this implementation, but it will
                    // always set the check register to 0 (indicating load success)
                    RISCV.store_double_to_mem(RISCV.gen_reg[inst.get_rs1()].getLowBits()|0, RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0); // indicate success
                    RISCV.pc += 4;
                    break;


                default:
                    throw new RISCVTrap("Illegal Instruction");
                    break;

            }
            break;


        /* NOTE ABOUT FP: ALL FP INSTRUCTIONS IN THIS IMPLEMENTATION WILL ALWAYS
         * THROW THE "Floating-Point Disabled" TRAP.
         */

        // Floating-Point Memory Insts, FLW, FLD
        case 0x7:
            var funct3 = inst.get_funct3();
            if (funct3 == 0x2 || funct3 == 0x3) {
                throw new RISCVTrap("Floating-Point Disabled"); 
            } else {
                throw new RISCVTrap("Illegal Instruction");
            }
            RISCV.pc += 4;
            break; 

        // Floating-Point Memory Insts, FSW, FSD
        case 0x27:
            var funct3 = inst.get_funct3();
            if (funct3 == 0x2 || funct3 == 0x3) {
                throw new RISCVTrap("Floating-Point Disabled"); 
            } else {
                throw new RISCVTrap("Illegal Instruction");
            }
            RISCV.pc += 4;
            break; 

        // FMADD.S, FMADD.D
        case 0x43:
            var funct5low = inst.get_funct7() & 0x3;
            if (funct5low == 0x0 || funct5low == 0x1) {
                throw new RISCVTrap("Floating-Point Disabled");
            }
            // If none of these trigger, this is an illegal instruction:
            throw new RISCVTrap("Illegal Instruction");
            break;

        // FMSUB.S, FMSUB.D
        case 0x47:
            var funct5low = inst.get_funct7() & 0x3;
            if (funct5low == 0x0 || funct5low == 0x1) {
                throw new RISCVTrap("Floating-Point Disabled");
            }
            // If none of these trigger, this is an illegal instruction:
            throw new RISCVTrap("Illegal Instruction");
            break;

        // FNMSUB.S, FNMSUB.D
        case 0x4B:
            var funct5low = inst.get_funct7() & 0x3;
            if (funct5low == 0x0 || funct5low == 0x1) {
                throw new RISCVTrap("Floating-Point Disabled");
            }
            // If none of these trigger, this is an illegal instruction:
            throw new RISCVTrap("Illegal Instruction");
            break;

        // FNMADD.S, FNMADD.D
        case 0x4F:
            var funct5low = inst.get_funct7() & 0x3;
            if (funct5low == 0x0 || funct5low == 0x1) {
                throw new RISCVTrap("Floating-Point Disabled");
            }
            // If none of these trigger, this is an illegal instruction:
            throw new RISCVTrap("Illegal Instruction");
            break;

        // REMAINING FP INSTRUCTIONS (ALL OPCODE 0b1010011)
        case 0x53:
            // for now do it the lazy way
            // [todo] - update to make this work "correctly"
            // but this should work for now as long as there are no
            // malformed floating point instructions
            throw new RISCVTrap("Floating-Point Disabled");
            // end


            var funct5 = inst.get_funct5();
            var funct5low = funct5 & 0x3; 
            var funct5high = (funct5 >> 2) & 0x7;
            var rs3 = inst.get_rs3();
            var rs2 = inst.get_rs2();
            var rs1 = inst.get_rs1();

            // FADD.S
            if (funct5low == 0x0 && rs3 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSUB.S
            if (funct5low == 0x0 && rs3 == 0x1) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMUL.S
            if (funct5low == 0x0 && rs3 == 0x2) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FDIV.S
            if (funct5low == 0x0 && rs3 == 0x3) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSQRT.S
            if (rs2 = 0x0 && funct5low == 0x0 && rs3 == 0x4) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMIN.S
            if (funct5 == 0x0 && rs3 == 0x18) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMAX.S
            if (funct5 == 0x0 && rs3 == 0x19) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FADD.D
            if (funct5low == 0x1 && rs3 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSUB.D
            if (funct5low == 0x1 && rs3 == 0x1) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMUL.D
            if (funct5low == 0x1 && rs3 == 0x2) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FDIV.D
            if (funct5low == 0x1 && rs3 == 0x3) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSQRT.D
            if (rs2 == 0x0 && funct5low == 0x1 && rs3 == 0x4) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMIN.D
            if (funct5 == 0x1 && rs3 == 0x18) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMAX.D
            if (funct5 == 0x1 && rs3 == 0x19) {
                throw new RISCVTrap("Floating-Point Disabled");
            }





            // FSGNJ.S
            if (funct5 == 0x0 && rs3 == 0x5) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSGNJN.S
            if (funct5 == 0x0 && rs3 == 0x6) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSGNJX.S
            if (funct5 == 0x0 && rs3 == 0x7) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSGNJ.D
            if (funct5 == 0x1 && rs3 == 0x5) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSGNJN.D
            if (funct5 == 0x1 && rs3 == 0x6) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FSGNJX.D
            if (funct5 == 0x1 && rs3 == 0x7) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.S.D
            if (funct5low == 0x0 && rs3 == 0x11 && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.D.S
            if (funct5low == 0x1 && rs3 == 0x10 && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }


            // FCVT.S.L
            if (funct5low == 0x0 && rs3 == 0xC && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.S.LU
            if (funct5low == 0x0 && rs3 == 0xD && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.S.W
            if (funct5low == 0x0 && rs3 == 0xE && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.S.WU
            if (funct5low == 0x0 && rs3 == 0xF && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.D.L
            if (funct5low == 0x1 && rs3 == 0xC && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.D.LU
            if (funct5low == 0x1 && rs3 == 0xD && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.D.W
            if (funct5low == 0x1 && rs3 == 0xE && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.D.WU
            if (funct5low == 0x1 && rs3 == 0xF && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }


            // FMV.S.X
            if (funct5 == 0x0 && rs3 == 0x1E && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMV.D.X
            if (funct5 == 0x1 && rs3 == 0x1E && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // MTFSR NOTE: MAY NEED TO ACTUALLY IMPLEMENT THIS
            if (funct5 == 0x0 && rs3 == 0x1F && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }



            // FCVT.L.S
            if (funct5low == 0x0 && rs3 == 0x8 && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.LU.S
            if (funct5low == 0x0 && rs3 == 0x9 && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.W.S
            if (funct5low == 0x0 && rs3 == 0xA && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.WU.S
            if (funct5low == 0x0 && rs3 == 0xB && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.L.D
            if (funct5low == 0x1 && rs3 == 0x8 && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.LU.D
            if (funct5low == 0x1 && rs3 == 0x9 && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.W.D
            if (funct5low == 0x1 && rs3 == 0xA && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FCVT.WU.D
            if (funct5low == 0x1 && rs3 == 0xB && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMV.X.S
            if (funct5 == 0x0 && rs3 == 0x1C && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FMV.X.D
            if (funct5 == 0x1 && rs3 == 0x1C && rs2 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // MFFSR NOTE: MIGHT NEED TO ACTUALLY IMPLEMENT
            if (funct5 == 0x0 && rs3 == 0x1D && rs2 == 0x0 && rs1 == 0x0) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FOLLOWING INSTS ARE NEW FROM V1.999

            // FEQ.S
            if (funct5 == 0x0 && rs3 == 0x15) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FLT.S
            if (funct5 == 0x0 && rs3 == 0x16) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FLE.S
            if (funct5 == 0x0 && rs3 == 0x17) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FEQ.D
            if (funct5 == 0x1 && rs3 == 0x15) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FLT.D
            if (funct5 == 0x1 && rs3 == 0x16) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // FLE.D
            if (funct5 == 0x1 && rs3 == 0x17) {
                throw new RISCVTrap("Floating-Point Disabled");
            }

            // If none of these trigger, this is an illegal instruction:
            throw new RISCVTrap("Illegal Instruction OCCURRED HERE 1");
            break;

        default:
            //throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
            //don't throw error for completely unknown inst (i.e. unknown opcode)
            throw new RISCVTrap("Illegal Instruction OCCURRED HERE 2");
            break;
    }


    // force x0 (zero) to zero
    RISCV.gen_reg[0] = new Long(0x0, 0x0);



    // finally, increment cycle counter, instret counter, count register:
    RISCV.priv_reg[PCR["CSR_INSTRET"]["num"]] = RISCV.priv_reg[PCR["CSR_INSTRET"]["num"]].add(new Long(0x1, 0x0));
    RISCV.priv_reg[PCR["CSR_CYCLE"]["num"]] = RISCV.priv_reg[PCR["CSR_CYCLE"]["num"]].add(new Long(0x1, 0x0));
    RISCV.priv_reg[PCR["CSR_COUNT"]["num"]] = RISCV.priv_reg[PCR["CSR_COUNT"]["num"]]&0x1 + 0x1;
}
