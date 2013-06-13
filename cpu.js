// possible optimizations: choose/attach load/store methods at time of object 
// creation instead of if/elses comparing strings at every call

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

    // general-purpose registers, gen_reg[0] is x0, etc.
    this.gen_reg = new Uint32Array(32);

    // initialize stack pointer to highest mem addr
    this.gen_reg[reg_maps.indexOf("sp")] = memamt;

    //fp status register
    this.fsr = 0x0000;

    // floating-point registers, fp_reg[0] is f0, etc.
    this.fp_reg = new Uint32Array(32);

    // endianness: "big" and "little" allowed
    this.endianness = "big";

    // cycle counter : this should only be incremented by inst.runInstruction
    // it is the number of cycles already executed (completed)
    // therefore, if first instruction is rdcycle, the dest will be set to zero
    this.cycle_count = 0x0;

    // record cpu boot time (in ms since jan 1, 1970) for rdtime instruction
    // for better measurement, this should be reset right before first instruction
    // is exec'd
    var start = new Date();
    this.boot_time = start.getTime();

    function reset_wall_clock(){
        // this should be called once, right before exec of first instruction
        var start = new Date();
        this.boot_time = start.getTime();
    }

    // big-endian
    function store_word_to_mem(addr, val){
        if (this.endianness === "big"){
            this.memory[addr] = (val >>> 24) & 0xFF;
            this.memory[addr+1] = (val >>> 16) & 0xFF;
            this.memory[addr+2] = (val >>> 8) & 0xFF;
            this.memory[addr+3] = (val) & 0xFF;
        } else if (this.endianness === "little"){
            this.memory[addr] = (val) & 0xFF;
            this.memory[addr+1] = (val >>> 8) & 0xFF;
            this.memory[addr+2] = (val >>> 16) & 0xFF;
            this.memory[addr+3] = (val >>> 24) & 0xFF;
        } else {
            throw new Error("Invalid Endianness");
        }
    }

    function store_half_to_mem(addr, val){
        if (this.endianness === "big"){
            this.memory[addr] = (val >>> 8) & 0xFF;
            this.memory[addr+1] = val & 0xFF;
        } else if (this.endianness === "little"){
            this.memory[addr] = val & 0xFF;
            this.memory[addr+1] = (val >>> 8) & 0xFF;
        } else {
            throw new Error("Invalid Endianness");
        }
    }

    function store_byte_to_mem(addr, val){
        this.memory[addr] = val & 0xFF;
    }

    function load_word_from_mem(addr){
        var retval = 0;
        if (this.endianness === "big"){
            retval = retval | this.memory[addr] << 24;
            retval = retval | this.memory[addr+1] << 16;
            retval = retval | this.memory[addr+2] << 8;
            retval = retval | this.memory[addr+3];
        } else if (this.endianness === "little"){
            retval = retval | this.memory[addr+3] << 24;
            retval = retval | this.memory[addr+2] << 16;
            retval = retval | this.memory[addr+1] << 8;
            retval = retval | this.memory[addr];
        } else {
            throw new Error("Invalid Endianness");
        }

        return retval;
    }

    function load_half_from_mem(addr){
        var retval = 0;
        if (this.endianness === "big"){
            retval = retval | this.memory[addr] << 8;
            retval = retval | this.memory[addr+1];
        } else if (this.endianness === "little"){
            retval = retval | this.memory[addr+1] << 8;
            retval = retval | this.memory[addr];
        } else {
            throw new Error("Invalid Endianness");
        }

        return retval;
    }

    function load_byte_from_mem(addr){
        var retval = 0;
        retval = retval | this.memory[addr];
        return retval;
    }

    // vals[0] is loaded into 0x0000, vals[1] is program, loaded into 0x2000
    function load_to_mem(vals){
        prog = vals[1];
        for (var i = 0; i < prog.length*4; i+=4){
            this.store_word_to_mem(i+0x2000, prog[i/4]);
        } 
    }

    this.reset_wall_clock = reset_wall_clock;
    this.store_word_to_mem = store_word_to_mem;
    this.store_half_to_mem = store_half_to_mem;
    this.store_byte_to_mem = store_byte_to_mem;
    this.load_word_from_mem = load_word_from_mem;
    this.load_half_from_mem = load_half_from_mem;
    this.load_byte_from_mem = load_byte_from_mem;
    this.load_to_mem = load_to_mem;
}
