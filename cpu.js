// Possible optimizations: choose/attach load/store methods at time of object 
// creation instead of if/elses comparing strings at every call - however
// need to remember to update methods if changing endianness after instantiation
// is allowed.


// CPU class. Contains regfile, memory, and special registers
// memamt is memory size in Mebibytes, default to 32
function CPU(memamt) {
    memamt = typeof memamt !== 'undefined' ? memamt : 1;

    this.memamount = memamt; // for use by the kernel
    
    memamt *= 1048576 // convert to Bytes
    this.memory = new Uint8Array(memamt);

    // PC, defaults to 0x2000 according to the ISA, documented in 
    // processor.cc
    // Even in RV64, this must remain as a Number (not a Long) because
    // of Array indexing requirements.
    // Possibly improve on this later by nesting arrays, but trying to address/
    // store more than ~4GiB is probably not a good idea anyways 
    this.pc = 0x2000;

    // catch loops
    this.oldpc = 0x0;

    // special testing flag
    this.testSuccess = false;

    // file management fields
    // program name => fd lookup
    this.pname_fd = new Object();
    // fd => program name lookup
    this.fd_pname = new Object();
    // actually store binaries. index on file descriptor
    this.binaries = [];
    // next unused file-descriptor. start at 0x3
    this.next_fd = 3;

    // general-purpose registers, gen_reg[0] is x0, etc.
    this.gen_reg = [];
    
    for (var i = 0; i < 32; i++) {
        this.gen_reg[i] = new Long(0x0, 0x0);
    }

    // privileged control registers
    this.priv_reg = new Array(4096);
    
    for (var key in PCR) {
        if (PCR.hasOwnProperty(key)) {
            if (key["width"] == 32) {
                this.priv_reg[PCR[key]["num"]] = 0x0;
            } else {
                // 64 bit
                this.priv_reg[PCR[key]["num"]] = new Long(0x0, 0x0);
            }
        }
    }

    // init status register
    this.priv_reg[PCR["CSR_STATUS"]["num"]] = status_reg_init();

    // initialize stack pointer to highest mem addr
    // needs to be modified if > 4GiB mem
    this.gen_reg[reg_maps.indexOf("sp")] = new Long(memamt, 0x0);

    // endianness: "big" and "little" allowed
    this.endianness = "big";

    // record cpu boot time (in ms since jan 1, 1970) for rdtime instruction
    // for better measurement, this should be reset right before first instruction
    // is exec'd
    var start = new Date();
    this.priv_reg[PCR["CSR_TIME"]["num"]] = Long.fromNumber(start.getTime());

    function reset_wall_clock() {
        // this should be called once, right before exec of first instruction
        var start = new Date();
        this.priv_reg[PCR["CSR_TIME"]["num"]] = Long.fromNumber(start.getTime());
    }

    // for the following calls - by default, will use VM bit to determine if
    // address translation should be used. however sometimes, it must be forced
    // off, so can be passed in as an arg

    // unlike word, half, byte, the val arg here is a Long
    function store_double_to_mem(addr, val, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 1);
        }

        if ((addr % 8) != 0) {
            throw new RISCVTrap("Store Address Misaligned", addr);
        }

        var lowbits = val.getLowBits()|0;
        var highbits = val.getHighBits()|0;
        if (this.endianness === "big") {
            this.memory[addr] = (highbits >>> 24) & 0xFF;
            this.memory[addr+1] = (highbits >>> 16) & 0xFF;
            this.memory[addr+2] = (highbits >>> 8) & 0xFF;
            this.memory[addr+3] = (highbits) & 0xFF;

            this.memory[addr+4] = (lowbits >>> 24) & 0xFF;
            this.memory[addr+5] = (lowbits >>> 16) & 0xFF;
            this.memory[addr+6] = (lowbits >>> 8) & 0xFF;
            this.memory[addr+7] = (lowbits) & 0xFF;
        } else if (this.endianness === "little") {
            this.memory[addr] = (lowbits) & 0xFF;
            this.memory[addr+1] = (lowbits >>> 8) & 0xFF;
            this.memory[addr+2] = (lowbits >>> 16) & 0xFF;
            this.memory[addr+3] = (lowbits >>> 24) & 0xFF;

            this.memory[addr+4] = (highbits) & 0xFF;
            this.memory[addr+5] = (highbits >>> 8) & 0xFF;
            this.memory[addr+6] = (highbits >>> 16) & 0xFF;
            this.memory[addr+7] = (highbits >>> 24) & 0xFF;
        } else {
            throw new RISCVError("Invalid Endianness");
        }
    }

    function store_word_to_mem(addr, val, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 1);
        }

        if ((addr % 4) != 0) {
            throw new RISCVTrap("Store Address Misaligned", addr);
        }
        if (this.endianness === "big") {
            this.memory[addr] = (val >>> 24) & 0xFF;
            this.memory[addr+1] = (val >>> 16) & 0xFF;
            this.memory[addr+2] = (val >>> 8) & 0xFF;
            this.memory[addr+3] = (val) & 0xFF;
        } else if (this.endianness === "little") {
            this.memory[addr] = (val) & 0xFF;
            this.memory[addr+1] = (val >>> 8) & 0xFF;
            this.memory[addr+2] = (val >>> 16) & 0xFF;
            this.memory[addr+3] = (val >>> 24) & 0xFF;
        } else {
            throw new RISCVError("Invalid Endianness");
        }
    }

    function store_half_to_mem(addr, val, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 1);
        }

        if ((addr % 2) != 0) {
            throw new RISCVTrap("Store Address Misaligned", addr);
        }
        if (this.endianness === "big") {
            this.memory[addr] = (val >>> 8) & 0xFF;
            this.memory[addr+1] = val & 0xFF;
        } else if (this.endianness === "little") {
            this.memory[addr] = val & 0xFF;
            this.memory[addr+1] = (val >>> 8) & 0xFF;
        } else {
            throw new RISCVError("Invalid Endianness");
        }
    }

    function store_byte_to_mem(addr, val, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 1);
        }

        this.memory[addr] = val & 0xFF;
    }

    function load_double_from_mem(addr, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 0);
        }

        if ((addr % 8) != 0) {
            throw new RISCVTrap("Load Address Misaligned", addr);
        }
        var retvalhigh = 0;
        var retvallow = 0;
        if (this.endianness === "big") {
            retvalhigh = retvalhigh | this.memory[addr] << 24;
            retvalhigh = retvalhigh | this.memory[addr+1] << 16;
            retvalhigh = retvalhigh | this.memory[addr+2] << 8;
            retvalhigh = retvalhigh | this.memory[addr+3];
            retvallow = retvallow | this.memory[addr+4] << 24;
            retvallow = retvallow | this.memory[addr+5] << 16;
            retvallow = retvallow | this.memory[addr+6] << 8;
            retvallow = retvallow | this.memory[addr+7];
            return new Long(retvallow, retvalhigh);
        } else if (this.endianness === "little") {
            retvallow = retvallow | this.memory[addr+3] << 24;
            retvallow = retvallow | this.memory[addr+2] << 16;
            retvallow = retvallow | this.memory[addr+1] << 8;
            retvallow = retvallow | this.memory[addr];
            retvalhigh = retvalhigh | this.memory[addr+7] << 24;
            retvalhigh = retvalhigh | this.memory[addr+6] << 16;
            retvalhigh = retvalhigh | this.memory[addr+5] << 8;
            retvalhigh = retvalhigh | this.memory[addr+4];
            return new Long(retvallow, retvalhigh);
        } else {
            throw new RISCVError("Invalid Endianness");
        }
    }

    function load_word_from_mem(addr, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 0);
        }

        if ((addr % 4) != 0) {
            throw new RISCVTrap("Load Address Misaligned", addr);
        }
        var retval = 0;
        if (this.endianness === "big") {
            retval = retval | this.memory[addr] << 24;
            retval = retval | this.memory[addr+1] << 16;
            retval = retval | this.memory[addr+2] << 8;
            retval = retval | this.memory[addr+3];
        } else if (this.endianness === "little") {
            retval = retval | this.memory[addr+3] << 24;
            retval = retval | this.memory[addr+2] << 16;
            retval = retval | this.memory[addr+1] << 8;
            retval = retval | this.memory[addr];
        } else {
            throw new RISCVError("Invalid Endianness");
        }
        return retval;
    }

    function load_half_from_mem(addr, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 0);
        }

        if ((addr % 2) != 0) {
            throw new RISCVTrap("Load Address Misaligned", addr);
        }
        var retval = 0;
        if (this.endianness === "big") {
            retval = retval | this.memory[addr] << 8;
            retval = retval | this.memory[addr+1];
        } else if (this.endianness === "little") {
            retval = retval | this.memory[addr+1] << 8;
            retval = retval | this.memory[addr];
        } else {
            throw new RISCVError("Invalid Endianness");
        }
        return retval;
    }

    function load_byte_from_mem(addr, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 0);
        }

        var retval = 0;
        retval = retval | this.memory[addr];
        return retval;
    }

    // vals[0] is loaded into 0x0000, vals[1] is program, loaded into 0x2000
    function load_to_mem(vals) {
        prog = vals[1];
        for (var i = 0; i < prog.length*4; i+=4) {
            this.store_word_to_mem(i+0x2000, prog[i/4]);
        } 
    }

    // set indicated PCR - need to make sure to prevent changes to hardwired vals
    function set_pcr(num, val) {
        switch(num) {
            case PCR["CSR_STATUS"]["num"]:
                // assuming 32 bit status reg
                this.priv_reg[num] = status_reg_force(val);
                break;

            // need to fill in all cases here (i.e. when implementing interrupts)
            case PCR["CSR_TOHOST"]["num"]:
                if (this.priv_reg[num].equals(new Long(0x0, 0x0))) {
                    this.priv_reg[num] = val;
                }
                break;

            default:
                this.priv_reg[num] = val;
                break; 

        }
    }

    /* wrapper for instruction fetch, converts Load Addr Misaligned to Instruction
     * Address Misaligned  
     */
    function load_inst_from_mem(addr, tr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        tr = typeof tr !== 'undefined' ? tr : vmOn; 
        if (tr) { 
            addr = translate(addr, 2);
        }

        if ((addr % 4) != 0) {
            throw new RISCVTrap("Instruction Address Misaligned", addr);
        }
        var retval = 0;
        if (this.endianness === "big") {
            retval = retval | this.memory[addr] << 24;
            retval = retval | this.memory[addr+1] << 16;
            retval = retval | this.memory[addr+2] << 8;
            retval = retval | this.memory[addr+3];
        } else if (this.endianness === "little") {
            retval = retval | this.memory[addr+3] << 24;
            retval = retval | this.memory[addr+2] << 16;
            retval = retval | this.memory[addr+1] << 8;
            retval = retval | this.memory[addr];
        } else {
            throw new RISCVError("Invalid Endianness");
        }
        return retval;
    }


    this.reset_wall_clock = reset_wall_clock;
    this.store_double_to_mem = store_double_to_mem;
    this.store_word_to_mem = store_word_to_mem;
    this.store_half_to_mem = store_half_to_mem;
    this.store_byte_to_mem = store_byte_to_mem;
    this.load_double_from_mem = load_double_from_mem;
    this.load_word_from_mem = load_word_from_mem;
    this.load_half_from_mem = load_half_from_mem;
    this.load_byte_from_mem = load_byte_from_mem;
    this.load_to_mem = load_to_mem;
    this.set_pcr = set_pcr;
    this.load_inst_from_mem = load_inst_from_mem;
}

function status_reg_init() {

    // at RESET, processor starts with ET=0, S=1, VM=0
    var srinit = 0x0;
    // set EI to zero
    srinit = srinit & (~SR["SR_EI"]);
    // set S = 1 here
    srinit = srinit | SR["SR_S"];
    // set PS = 0 here
    srinit = srinit & (~SR["SR_PS"]);
    // VM is off at boot, turned on by kernel
    srinit = srinit & (~SR["SR_VM"]);

    // now force implementation defined presets
    srinit = status_reg_force(srinit);
    return srinit;
}



// "hardwired" values that need to be forced every time status reg is modified
function status_reg_force(input) {
    // force EF to zero here (no FP insts)
    // force U64 to 1 here
    // force S64 to 1 here
    input = input & (~SR["SR_EF"]);
    input = input | SR["SR_U64"] | SR["SR_S64"];

//    input = input & (~SR["SR_VM"]); // TEMPORARY FORCE VM OFF

    return input;
}
