// assume 32 bit implementation, with 32 bit instructions

// here, we define:
// memory
// PC
// standard registers
// FP registers

// memamt is memory size in Mebibytes, default to 32
function CPU(memamt){
    memamt = typeof memamt !== 'undefined' ? memamt : 32;
    
    memamt *= 1048576 // convert to Bytes
    this.memory = new Uint8Array(memamt);
    
    // PC, defaults to 0x2000 according to the ISA, documented in 
    // processor.cc
    this.pc = 0x2000;

    // TODO: make zero-register const-zero
    // general-purpose registers, gen_reg[0] is x0, etc.
    this.gen_reg = new Uint32Array(32);

    //fp status register
    this.fsr = 0x0000;

    // floating-point registers, fp_reg[0] is f0, etc.
    this.fp_reg = new Uint32Array(32);
}
