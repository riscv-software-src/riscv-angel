// Instruction object and implementation of each instruction

function instruction(instVal){
    this.inst = instVal;

    function get_opcode(){
        return (this.inst & 0x0000007F);
    }

    function get_rd(){
        return (this.inst >>> 27);
    }

    function get_rs1(){
        return ((this.inst >>> 22) & 0x0000001F);
    }

    function get_rs2(){
        return ((this.inst >>> 17) & 0x0000001F);
    }

    function get_rs3(){
        return ((this.inst >>> 12) & 0x0000001F);
    }

    function get_funct3(){
        return ((this.inst >>> 7) & 0x00000007);
    }

    function get_funct5(){
        return ((this.inst >>> 7) & 0x0000001F);
    }

    function get_funct10(){
        return ((this.inst >>> 7) & 0x000003FF);
    }

    // inst type should be I or B
    function get_imm11_7(inst_type){
        if (inst_type === 'I') {
            return ((this.inst >>> 17) & 0x0000001F);
        } else if (inst_type === 'B') {
            return (this.inst >>> 27);
        }
    }

    function get_imm6_0(){
        return ((this.inst >>> 10) & 0x0000007F);
    }

    // inst type should be I or B
    function get_imm(inst_type){
        if (inst_type === undefined){
            console.log("ERR NO TYPE PROVIDED FOR IMMEDIATE FETCH");
        }
        return ((this.get_imm11_7(inst_type) << 7) | this.get_imm6_0());
    }

    function get_lui_imm(){
        return ((this.inst >>> 7) & 0x000FFFFF);
    }

    function get_jump_offset(){
        return ((this.inst >>> 7) & 0x01FFFFFF);
    }

    // tack on the methods
    this.get_opcode = get_opcode;
    this.get_rd = get_rd;
    this.get_rs1 = get_rs1;
    this.get_rs2 = get_rs2;
    this.get_rs3 = get_rs3;
    this.get_funct3 = get_funct3;
    this.get_funct5 = get_funct5;
    this.get_funct10 = get_funct10;
    this.get_imm11_7 = get_imm11_7;
    this.get_imm6_0 = get_imm6_0;
    this.get_imm = get_imm;
    this.get_lui_imm = get_lui_imm;
    this.get_jump_offset = get_jump_offset;
}

// "sign extend" the quantity based on bit
// quantity will be a 32 bit quantity that was zero extended by default 
function signExt(quantity, bit){
    // bits numbered 31, 30, .... 2, 1, 0
    bitval = ((quantity|0) >> bit) & 0x00000001;
    if (bitval === 0){
        return quantity;
    } else if (bitval === 1){
        mask = 0x80000000;
        mask = mask >> (31-bit) 
        return (quantity | mask);
    } else {
        console.log("ERR in signext");
    }
}

// "sign extend" the quantity based on bit
// input is a 32 bit quantity (as a standard javascript Number)
// output is a 64 bit Long, correctly sign extended
function signExtLT32_64(quantity, bit){
    // bits numbered 31, 30, .... 2, 1, 0
    bitval = ((quantity|0) >> bit) & 0x00000001;
    if (bitval === 0){
        return new Long(quantity|0, 0x00000000);
    } else if (bitval === 1){
        mask = 0x80000000;
        mask = mask >> (31-bit) 
        return new Long((quantity | mask), 0xFFFFFFFF);
    } else {
        console.log("ERR in signext");
    }
}

// Takes instruction obj and CPU obj as args, performs computation on given CPU
function runInstruction(inst, RISCV){
    // force x0 (zero) to zero
    RISCV.gen_reg[0] = new Long(0x0, 0x0);
    var op = inst.get_opcode();

    switch(op){
    
        // I-TYPE, opcode: 0b0010011
        case 0x13:
            var funct3 = inst.get_funct3();
            switch(funct3){
                
                // ADDI
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()].add(signExtLT32_64(inst.get_imm("I"), 11));
                    RISCV.pc += 4;
                    break;

                // SLLI                   
                case 0x1:
                    if ((inst.get_imm("I") >>> 6) != 0) {
                        //this is a bad inst, but not a trap, according to ISA doc
                        throw new RISCVError("ERR IN SLLI");
                        break;
                    }
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftLeft(inst.get_imm("I") & 0x003F);
                    RISCV.pc += 4;
                    break;

                // SLTI 
                case 0x2:
                    if ((RISCV.gen_reg[inst.get_rs1()]).lessThan(signExtLT32_64(inst.get_imm("I"), 11))){
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;

                // SLTIU, need to check signExt here
                case 0x3:
                    if (long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], signExtLT32_64(inst.get_imm("I"), 11))){
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;
                
                // XORI
                case 0x4:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).xor(signExtLT32_64(inst.get_imm("I"), 11));
                    RISCV.pc += 4;
                    break;

                // SRLI and SRAI
                case 0x5:
                    var aldiff = (inst.get_imm("I") >>> 6);
                    if (aldiff === 0) {
                        // SRLI
                        RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftRightUnsigned(inst.get_imm("I") & 0x003F);
                    } else if (aldiff === 1) {
                        // SRAI
                        RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).shiftRight(inst.get_imm("I") & 0x003F);
                    } else {
                        throw new RISCVError("Bad inst");
                        break;
                    }
                    RISCV.pc += 4;
                    break;

                // ORI 
                case 0x6:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).or(signExtLT32_64(inst.get_imm("I"), 11));
                    RISCV.pc += 4;
                    break;

                // ANDI
                case 0x7:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).and(signExtLT32_64(inst.get_imm("I"), 11));
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;

            }
            break;

        // R-TYPE, opcode: 0b0110011
        case 0x33:
            var funct10 = inst.get_funct10();

            switch(funct10){

                // ADD
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]).add(RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                // SUB
                case 0x200:
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
                    if ((RISCV.gen_reg[inst.get_rs1()]).lessThan(RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x1, 0x0);
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = new Long(0x0, 0x0);
                    }
                    RISCV.pc += 4;
                    break;

                // SLTU
                case 0x3:
                    if (long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], RISCV.gen_reg[inst.get_rs2()])){
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
                case 0x205:
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
                    throw new RISCVError("MULH not yet implemented");
                    var rs1 = RISCV.gen_reg[inst.get_rs1()];
                    var rs2 = RISCV.gen_reg[inst.get_rs2()];
                    var rs1_64;
                    var rs2_64; 

                   if ((rs1|0) < 0){
                        rs1_64 = new goog.math.Long(rs1, 0xFFFFFFFF);
                    } else {
                        rs1_64 = new goog.math.Long(rs1, 0x0);
                    }
                    if ((rs2|0) < 0){
                        rs2_64 = new goog.math.Long(rs2, 0xFFFFFFFF);
                    } else {
                        rs2_64 = new goog.math.Long(rs2, 0x0);
                    }
                    var result = rs1_64.multiply(rs2_64);
                    result = result.getHighBits();
                    RISCV.gen_reg[inst.get_rd()] = result | 0;
                    RISCV.pc += 4;
                    break;

//TODO:         // MULHSU
                case 0xA:
                    throw new RISCVError("MULHSU not yet implemented");
                    RISCV.pc += 4;
                    break;

//TODO:         // MULHU
                case 0xB:
                    throw new RISCVError("MULHU not yet implemented");
                    RISCV.pc += 4;
                    break;

                // DIV 
                case 0xC:
                    throw new RISCVError("DIV not yet implemented");
                    if (((RISCV.gen_reg[inst.get_rs1()]|0) == 0x80000000) && ((RISCV.gen_reg[inst.get_rs2()]|0) == 0xFFFFFFFF)){
                        // signed division overflow
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()]|0;
                    } else if ((RISCV.gen_reg[inst.get_rs2()]|0) == 0){
                        // handle div by zero
                        RISCV.gen_reg[inst.get_rd()] = 0xFFFFFFFF;
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = ((RISCV.gen_reg[inst.get_rs1()]|0)/(RISCV.gen_reg[inst.get_rs2()]|0))|0;
                    }
                    RISCV.pc += 4;
                    break;

                // DIVU
                case 0xD:
                    throw new RISCVError("DIVU not yet implemented");
                    if ((RISCV.gen_reg[inst.get_rs2()]|0) == 0){
                        // handle div by zero
                        RISCV.gen_reg[inst.get_rd()] = 0xFFFFFFFF;
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]/RISCV.gen_reg[inst.get_rs2()])|0;
                    }
                    RISCV.pc += 4;
                    break;

                // REM
                case 0xE:
                    throw new RISCVError("REM not yet implemented");
                    if (((RISCV.gen_reg[inst.get_rs1()]|0) == 0x80000000) && ((RISCV.gen_reg[inst.get_rs2()]|0) == 0xFFFFFFFF)){
                        // signed division overflow
                        RISCV.gen_reg[inst.get_rd()] = 0x0;
                    } else if ((RISCV.gen_reg[inst.get_rs2()]|0) == 0){
                        // handle div by zero
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()]|0;
                    } else { 
                        RISCV.gen_reg[inst.get_rd()] = ((RISCV.gen_reg[inst.get_rs1()]|0)%(RISCV.gen_reg[inst.get_rs2()]|0))|0;
                    }
                    RISCV.pc += 4;
                    break;

                // REMU
                case 0xF:
                    throw new RISCVError("REMU not yet implemented");
                    if ((RISCV.gen_reg[inst.get_rs2()]|0) == 0){
                        // handle div by zero
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()]|0;
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]%RISCV.gen_reg[inst.get_rs2()])|0;
                    }
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;

            }
            break;

        // L-TYPE (LUI only) - opcode: 0b0110111
        case 0x37:
            RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(inst.get_lui_imm() << 12, 31);
            RISCV.pc += 4;
            break;

        // L-TYPE (AUIPC (not in spec, from isa-sim)) - opcode: 0b0010111
        // not certain about this
        case 0x17:
            RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((inst.get_lui_imm() << 12) + (RISCV.pc|0), 31);
            RISCV.pc += 4;
            break;

        // J-TYPE (J) - opcode: 0b1100111
        case 0x67:
            RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_jump_offset(), 24) << 1);
            break;

        // J-TYPE (JAL) - opcode: 0b1101111
        case 0x6F:
            RISCV.gen_reg[1] = signExtLT32_64(RISCV.pc + 4, 31);
            RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_jump_offset(), 24) << 1);
            break;

        // B-TYPE (Branches) - opcode: 0b1100011
        case 0x63:
            var funct3 = inst.get_funct3();
            switch(funct3){

                // BEQ
                case 0x0:
                    if ((RISCV.gen_reg[inst.get_rs1()]).equals(RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_imm("B"), 11) << 1);
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BNE
                case 0x1:
                    if ((RISCV.gen_reg[inst.get_rs1()]).notEquals(RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_imm("B"), 11) << 1);
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BLT
                case 0x4:
                    if ((RISCV.gen_reg[inst.get_rs1()]).lessThan(RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_imm("B"), 11) << 1);
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BGE
                case 0x5:
                    if ((RISCV.gen_reg[inst.get_rs1()]).greaterThanOrEqual(RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_imm("B"), 11) << 1);
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BLTU
                case 0x6:
                    if (long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_imm("B"), 11) << 1);
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                // BGEU
                case 0x7:
                    if (!long_less_than_unsigned(RISCV.gen_reg[inst.get_rs1()], RISCV.gen_reg[inst.get_rs2()])){
                        RISCV.pc = (RISCV.pc|0) + (signExt(inst.get_imm("B"), 11) << 1);
                    } else {
                        RISCV.pc += 4;
                    }
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;





            }
            break;



        // I-TYPES (continued): JALRs and RDNPC 
        case 0x6B:
            var funct3 = inst.get_funct3();
            if (funct3 == 0x0 || funct3 == 0x1 || funct3 == 0x2){
                // JALR.C, .R, .J, all are functionally identical
                RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.pc + 4, 31);
                RISCV.pc = (signExt(inst.get_imm("I"), 11)|0) + (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0);
            } else if (funct3 === 0x4) {
                // RDNPC
                RISCV.pc += 4;              
                RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.pc, 31);
            } else {
                throw new RISCVError("Bad Inst.");
            }
            break;


        // I-TYPES (continued): Loads
        case 0x3:
            var funct3 = inst.get_funct3();
            switch(funct3){

                // LB
                case 0x0:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_byte_from_mem(addr), 7);
                    RISCV.pc += 4;
                    break;

                // LH
                case 0x1:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_half_from_mem(addr), 15);
                    RISCV.pc += 4;
                    break;

                // LW
                case 0x2:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.load_word_from_mem(addr), 31);
                    RISCV.pc += 4;
                    break;

                // LD 
                case 0x3:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);
                    // unlike load_half/byte/word_from_mem, double returns Long
                    RISCV.gen_reg[inst.get_rd()] = RISCV.load_double_from_mem(addr);
                    RISCV.pc += 4;
                    break;

                // LBU
                case 0x4:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);

                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.load_byte_from_mem(addr) & 0x000000FF, 0x0);
                    RISCV.pc += 4;
                    break;

                // LHU
                case 0x5:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);

                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.load_half_from_mem(addr) & 0x0000FFFF, 0x0);
                    RISCV.pc += 4;
                    break;

                // LWU
                case 0x6:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.load_word_from_mem(addr), 0x0);
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;


            }
            break;

        // B-TYPES (continued): Stores
        case 0x23:
            var funct3 = inst.get_funct3(); 
            switch(funct3){
                
                // SB
                case 0x0:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("B"), 11)|0);

                    RISCV.store_byte_to_mem(addr, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.pc += 4;
                    break;

                // SH
                case 0x1:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("B"), 11)|0);

                    RISCV.store_half_to_mem(addr, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.pc += 4;
                    break;

                // SW
                case 0x2:
                    var addr = ((RISCV.gen_reg[inst.get_rs1()]).getLowBits()) + (signExt(inst.get_imm("B"), 11)|0);
                    RISCV.store_word_to_mem(addr, RISCV.gen_reg[inst.get_rs2()].getLowBits());
                    RISCV.pc += 4;
                    break;

                // SD
                case 0x3:
                    var addr = (RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("B"), 11)|0);

                    RISCV.store_double_to_mem(addr, RISCV.gen_reg[inst.get_rs2()]);
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;

            }
            break;

        // I-TYPES (continued): Misc Mem instructions
        case 0x2F:
            var funct3 = inst.get_funct3();
            if (funct3 == 0x1){
                // FENCE.I
                console.log("fence.i is no-op in this implementation");
                RISCV.pc += 4;
            } else if (funct3 = 0x2){
                // FENCE
                console.log("fence is no-op in this implementation");
                RISCV.pc += 4;
            } else {
                throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
            }
            break;

        // R-TYPES (continued): System instructions
        case 0x77:
            var funct10 = inst.get_funct10();
            switch(funct10){

                // SYSCALL
                case 0x0:
                    // currently need to halt at syscall for elfs to work properly
                    throw new RISCVError("SYSCALL NOT IMPLEMENTED");
                    RISCV.pc += 4;
                    break;

                // BREAK
                case 0x1:
                    console.log("break currently does nothing");
                    RISCV.pc += 4;
                    break;

                // RDCYCLE
                case 0x4:
                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.cycle_count|0, 0x0);
                    RISCV.pc += 4;
                    break;

                // RDTIME
                case 0xC:
                    // places #ms since cpu boot in rd. against spec 
                    // but the best we can reasonably do with js
                    var nowtime = new Date();
                    nowtime = nowtime.getTime();
                    // need to be careful here: the subtraction needs to be
                    // done as a float to cut down to reasonable number of
                    // bits, then or with zero to get close by int value
                    var result = (nowtime - RISCV.boot_time) | 0;
                    RISCV.gen_reg[inst.get_rd()] = new Long(result, 0x0);
                    RISCV.pc += 4;
                    break;

                // RDINSTRET
                case 0x14:
                    // for our purposes, this is the same as RDCYCLE:
                    RISCV.gen_reg[inst.get_rd()] = new Long(RISCV.cycle_count|0, 0x0);
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;

            }
            break;


        // 32 bit integer compute instructions

        case 0x1B:
            var funct3 = inst.get_funct3(); 

            switch(funct3){

                // ADDIW
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (signExt(inst.get_imm("I"), 11)|0), 31);
                    RISCV.pc += 4;
                    break;


                // SLLIW
                case 0x1:
                    if ((inst.get_imm("I") >>> 6) != 0) {
                        //this is a bad inst, but not a trap, according to ISA doc
                        throw new RISCVError("ERR IN SLLI");
                        break;
                    }
                    if (((inst.get_imm("I") >>> 5) & 0x1) != 0){
                        //this is a bad inst, causes illegal instruction trap
                        //according to page 11 in ISA doc
                        throw new RISCVError("ILLEGAL INSTRUCTION TRAP, MALFORMED SLLI");
                        break;
                    }
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits() << (inst.get_imm("I") & 0x003F), 31);
                    RISCV.pc += 4;
                    break;


                // SRLIW and SRAIW
                case 0x5:
                    if (((inst.get_imm("I") >>> 5) & 0x1) != 0){
                        //this is a bad inst, causes illegal instruction trap
                        //according to page 11 in ISA doc
                        throw new RISCVError("ILLEGAL INSTRUCTION TRAP, MALFORMED SRLI/SRAI");
                        break;
                    }
                    var aldiff = (inst.get_imm("I") >>> 6);
                    if (aldiff === 0) {
                        // SRLIW
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits() >>> (inst.get_imm("I") & 0x003F), 31);
                    } else if (aldiff === 1) {
                        // SRAIW
                        RISCV.gen_reg[inst.get_rd()] = signExtLT32_64(RISCV.gen_reg[inst.get_rs1()].getLowBits() >> (inst.get_imm("I") & 0x003F), 31);
                    } else {
                        throw new RISCVError("Bad inst");
                        break;
                    }
                    RISCV.pc += 4;
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;
            }
            break;


        // more 32 bit int compute
        case 0x3B:
            var funct10 = inst.get_funct10();
            switch(funct10){

                // ADDW
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) + (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // SUBW
                case 0x200:
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
                case 0x205:
                    RISCV.gen_reg[inst.get_rd()] = signExtLT32_64((RISCV.gen_reg[inst.get_rs1()].getLowBits()|0) >> (RISCV.gen_reg[inst.get_rs2()].getLowBits()|0), 31);
                    RISCV.pc += 4;
                    break;

                // MULW
                case 0x8:
                    throw new RISCVError("MULW not yet implemented");
                    break;

                // DIVW
                case 0xC:
                    throw new RISCVError("DIVW not yet implemented");
                    break;

                // DIVUW
                case 0xD:
                    throw new RISCVError("DIVUW not yet implemented");
                    break;

                // REMW
                case 0xE:
                    throw new RISCVError("REMW not yet implemented");
                    break;

                // REMUW
                case 0xF:
                    throw new RISCVError("REMUW not yet implemented");
                    break;

                default:
                    throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
                    break;
         
            }
            break;

        default:
            //throw new RISCVError("Unknown instruction at: 0x" + RISCV.pc.toString(16));
            console.log("unknown inst at: 0x" + RISCV.pc.toString(16));
            RISCV.pc += 4;
            break;
    }


    // force x0 (zero) to zero
    RISCV.gen_reg[0] = new Long(0x0, 0x0);

    // finally, increment cycle counter:
    RISCV.cycle_count = (RISCV.cycle_count|0) + 1;

}
