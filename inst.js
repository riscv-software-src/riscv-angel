//here, define instructions
//
//

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


// takes instruction and CPU as args
// perform computation on given CPU
function runInstruction(inst, CPU){
    //var opcode = inst & 0x007F;








}
