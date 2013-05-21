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
    
    // PC
    this.pc = 0x0000;

    // zero-register
    this.x0 = 0x0000; //TODO: make this const?

    // general-purpose registers
    this.x1 = 0x0000;
    this.x2 = 0x0000;
    this.x3 = 0x0000;
    this.x4 = 0x0000;
    this.x5 = 0x0000;
    this.x6 = 0x0000;
    this.x7 = 0x0000;
    this.x8 = 0x0000;
    this.x9 = 0x0000;
    this.x10 = 0x0000;
    this.x11 = 0x0000;
    this.x12 = 0x0000;
    this.x13 = 0x0000;
    this.x14 = 0x0000;
    this.x15 = 0x0000;
    this.x16 = 0x0000;
    this.x17 = 0x0000;
    this.x18 = 0x0000;
    this.x19 = 0x0000;
    this.x20 = 0x0000;
    this.x21 = 0x0000;
    this.x22 = 0x0000;
    this.x23 = 0x0000;
    this.x24 = 0x0000;
    this.x25 = 0x0000;
    this.x26 = 0x0000;
    this.x27 = 0x0000;
    this.x28 = 0x0000;
    this.x29 = 0x0000;
    this.x30 = 0x0000;
    this.x31 = 0x0000;

    //fp status register
    this.fsr = 0x0000;

    // floating-point registers
    this.f0 = 0x0000; 
    this.f1 = 0x0000;
    this.f2 = 0x0000;
    this.f3 = 0x0000;
    this.f4 = 0x0000;
    this.f5 = 0x0000;
    this.f6 = 0x0000;
    this.f7 = 0x0000;
    this.f8 = 0x0000;
    this.f9 = 0x0000;
    this.f10 = 0x0000;
    this.f11 = 0x0000;
    this.f12 = 0x0000;
    this.f13 = 0x0000;
    this.f14 = 0x0000;
    this.f15 = 0x0000;
    this.f16 = 0x0000;
    this.f17 = 0x0000;
    this.f18 = 0x0000;
    this.f19 = 0x0000;
    this.f20 = 0x0000;
    this.f21 = 0x0000;
    this.f22 = 0x0000;
    this.f23 = 0x0000;
    this.f24 = 0x0000;
    this.f25 = 0x0000;
    this.f26 = 0x0000;
    this.f27 = 0x0000;
    this.f28 = 0x0000;
    this.f29 = 0x0000;
    this.f30 = 0x0000;
    this.f31 = 0x0000;

}
