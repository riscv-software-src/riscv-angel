// here, we define instructions

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

// takes instruction obj and CPU obj as args
// perform computation on given CPU
//
// To get javascript to perform Number ops as 32 bit signed, do (num|0)
// To perform Number ops as 32 bit unsigned, just do the 64 bit FP ops
function runInstruction(inst, RISCV){
    var op = inst.get_opcode();

    switch(op){
    
        // I-TYPE, opcode: 0b0010011
        case 0x13:
            var funct3 = inst.get_funct3();
            switch(funct3){
                
                // ADDI
                case 0x0:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]|0) + (signExt(inst.get_imm("I"), 11)|0);
                    console.log(inst.get_imm("I") | 0);
                    console.log(signExt(inst.get_imm("I"), 11)|0);
                    RISCV.pc += 4;
                    break;

                // SLLI                   
                case 0x1:
                    if ((inst.get_imm("I") >>> 6) != 0) {
                        //this is a bad inst, but not a trap, according to ISA doc
                        console.log("ERR IN SLLI");
                        break;
                    }
                    if ((inst.get_imm("I") >>> 5) != 0){
                        //this is a bad inst, causes illegal instruction trap
                        //according to page 11 in ISA doc
                        console.log("ILLEGAL INSTRUCTION TRAP, MALFORMED SLLI");
                        break;
                    }
                    RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()] << (inst.get_imm("I") & 0x003F);
                    RISCV.pc += 4;
                    break;

                // SLTI 
                case 0x2:
                    if ((RISCV.gen_reg[inst.get_rs1()]|0) < (signExt(inst.get_imm("I"), 11)|0)){
                        RISCV.gen_reg[inst.get_rd()] = 0x00000001;
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = 0x00000000;
                    }
                    RISCV.pc += 4;
                    break;

                // SLTIU, need to check signExt here
                case 0x3:
                    if (RISCV.gen_reg[inst.get_rs1()] < signExt(inst.get_imm("I"), 11)){
                        RISCV.gen_reg[inst.get_rd()] = 0x00000001;
                    } else {
                        RISCV.gen_reg[inst.get_rd()] = 0x00000000;
                    }
                    RISCV.pc += 4;
                    break;
                
                // XORI
                case 0x4:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]|0) ^ (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.pc += 4;
                    break;

                // SRLI and SRAI
                case 0x5:
                    if ((inst.get_imm("I") >>> 5) != 0){
                        //this is a bad inst, causes illegal instruction trap
                        //according to page 11 in ISA doc
                        console.log("ILLEGAL INSTRUCTION TRAP, MALFORMED SRLI/SRAI");
                        break;
                    }
                    var aldiff = (inst.get_imm("I") >>> 6);
                    if (aldiff === 0) {
                        // SRLI
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()] >>> (inst.get_imm("I") & 0x003F);
                    } else if (aldiff === 1) {
                        // SRAI
                        RISCV.gen_reg[inst.get_rd()] = RISCV.gen_reg[inst.get_rs1()] >> (inst.get_imm("I") & 0x003F);
                    } else {
                        // bad
                        console.log("Bad inst");
                        break;
                    }
                    RISCV.pc += 4;
                    break;

                // ORI 
                case 0x6:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]|0) | (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.pc += 4;
                    break;

                // ANDI
                case 0x7:
                    RISCV.gen_reg[inst.get_rd()] = (RISCV.gen_reg[inst.get_rs1()]|0) & (signExt(inst.get_imm("I"), 11)|0);
                    RISCV.pc += 4;
                    break;

            }





            break;
    }
}
