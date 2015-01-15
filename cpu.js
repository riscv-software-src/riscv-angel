// Possible optimizations: choose/attach load/store methods at time of object 
// creation instead of if/elses comparing strings at every call - however
// need to remember to update methods if changing endianness after instantiation
// is allowed.


// CPU class. Contains regfile, memory, and special registers
// memamt is memory size in Mebibytes, default to 32
function CPU(memamt) {
    memamt = typeof memamt !== 'undefined' ? memamt : 10;

    this.memamount = memamt; // for use by the kernel
    
    memamt *= 1048576 // convert to Bytes
    this.memory = new Uint32Array(memamt >> 2);

    this.excpTrigg = undefined

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


    // registers 32 and 33 are implementation scratch space, not part of the ISA
    this.gen_reg_lo = new Uint32Array(34); // new regfile lo bits
    this.gen_reg_hi = new Uint32Array(34); // new regfile hi bits


    // privileged control registers
    this.priv_reg = new Array(3075);
    
    for (var key in PCR) {
        if (PCR.hasOwnProperty(key)) {
            if (PCR[key]["width"] == 32) {
                this.priv_reg[PCR[key]["num"]] = 0x0;
            } else {
                // 64 bit
                this.priv_reg[PCR[key]["num"]] = new Long(0x0, 0x0);
            }
        }
    }

    // init status register
    this.priv_reg[PCR["CSR_STATUS"]["num"]] = status_reg_init();

    this.instcount = 0x1; // special counter for MIPS measurement, start at one
                          // to avoid incorrect first result

    // endianness: "big" and "little" allowed
    this.endianness = "little";

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
    function store_double_to_mem(addr, val) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate(addr, 1);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = addr.getLowBitsUnsigned();
        }

        if (addr & 0x7) {
            RISCV.excpTrigg = new RISCVTrap("Store Address Misaligned", addr);
            return;
        }
        addr = addr >> 2;
        var lowbits = val.getLowBits()|0;
        var highbits = val.getHighBits()|0;
        this.memory[addr] = lowbits;
        this.memory[addr+1] = highbits;;
    }


    function store_double_to_mem_new(addr_reg, val_lo, val_hi) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 1);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }

        if (addr & 0x7) {
            RISCV.excpTrigg = new RISCVTrap("Store Address Misaligned", addr);
            return;
        }
        addr = addr >> 2;
        this.memory[addr] = val_lo;
        this.memory[addr+1] = val_hi;
    }


    function store_word_to_mem_new(addr_reg, val) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 1);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }
        if (addr & 0x3) {
            RISCV.excpTrigg =  new RISCVTrap("Store Address Misaligned", addr);
            return;
        }
        this.memory[addr >> 2] = val;
    }


    function store_word_to_mem(addr, val) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate(addr, 1);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = addr.getLowBitsUnsigned();
        }
        if (addr & 0x3) {
            RISCV.excpTrigg =  new RISCVTrap("Store Address Misaligned", addr);
            return;
        }
        this.memory[addr >> 2] = val;
    }

    function store_half_to_mem(addr_reg, val) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 1);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }

        if (addr & 0x1) {
            RISCV.excpTrigg =  new RISCVTrap("Store Address Misaligned", addr);
            return;
        }
        this.memory[(addr >> 2)] &= ~(0xFFFF << ((addr & 0x2) << 3));
        this.memory[(addr >> 2)] |= (val & 0xFFFF) << ((addr & 0x2) << 3);
    }

    function store_byte_to_mem(addr_reg, val) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 1);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }
        this.memory[(addr >> 2)] &= ~(0xFF << ((addr & 0x3) << 3));
        this.memory[(addr >> 2)] |= ((val & 0xFF) << ((addr & 0x3) << 3));
    }

    function load_double_from_mem(addr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate(addr, 0);
            if (RISCV.excpTrigg){
                return;
            }
        } else {
            addr = addr.getLowBitsUnsigned();
        }
        if (addr & 0x7) {
            RISCV.excpTrigg =  new RISCVTrap("Load Address Misaligned", addr);
            return;
        }
        addr = addr >> 2;
        return new Long(this.memory[addr], this.memory[addr+1]);
    }

    function load_double_from_mem_new(addr_reg, reg_dest) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 0);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }
        if (addr & 0x7) {
            RISCV.excpTrigg =  new RISCVTrap("Load Address Misaligned", addr);
            return;
        }
        addr = addr >> 2;
        RISCV.gen_reg_lo[reg_dest] = this.memory[addr];
        RISCV.gen_reg_hi[reg_dest] = this.memory[addr+1];
    }

    function load_double_from_mem_raw(addr) {
        addr = addr.getLowBitsUnsigned();
        if (addr & 0x7) {
            RISCV.excpTrigg =  new RISCVTrap("Load Address Misaligned", addr);
            return;
        }
        addr = addr >> 2;
        return new Long(this.memory[addr], this.memory[addr+1]);
    }

    function load_word_from_mem(addr) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate(addr, 0);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = addr.getLowBitsUnsigned();
        }


        if (addr & 0x3) {
            RISCV.excpTrigg = new RISCVTrap("Load Address Misaligned", addr);
            return;
        }
        return this.memory[addr >> 2];
    }

    function load_word_from_mem_new(addr_reg) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 0);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }
        if (addr & 0x3) {
            RISCV.excpTrigg = new RISCVTrap("Load Address Misaligned", addr);
            return;
        }
        return this.memory[addr >> 2];
    }


    function load_half_from_mem(addr_reg) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 0);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }
        if (addr & 0x1) {
            RISCV.excpTrigg =  new RISCVTrap("Load Address Misaligned", addr);
        }
        return (this.memory[addr >> 2] >> ((addr & 0x2) << 3)) & 0xFFFF;
    }

    function load_byte_from_mem(addr_reg) {
        var vmOn = ((this.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_VM"]) != 0x0);
        if (vmOn) { 
            addr = translate_new(addr_reg, 0);
            if (RISCV.excpTrigg) {
                return;
            }
        } else {
            addr = RISCV.gen_reg_lo[addr_reg];
        }
        return (this.memory[addr >> 2] >> ((addr & 0x3) << 3)) & 0xFF;
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
                if (this.priv_reg[num].isZero()) {
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
    function load_inst_from_mem(addr) {
        var vmOn = ((this.priv_reg[0x50A] & 0x80));
        if (vmOn) { 
            addr = insttranslate(addr, 2);
            if (RISCV.excpTrigg) {
                return;
            }
        }
        /* UNSAFE when removed
        if (addr & 0x3) {
            RISCV.excpTrigg =  new RISCVTrap("Instruction Address Misaligned", addr);
            return;
        }
        */
        return this.memory[addr >> 2];
    }


    this.reset_wall_clock = reset_wall_clock;
    this.store_double_to_mem = store_double_to_mem;
    this.store_double_to_mem_new = store_double_to_mem_new;
    this.store_word_to_mem = store_word_to_mem;
    this.store_word_to_mem_new = store_word_to_mem_new;
    this.store_half_to_mem = store_half_to_mem;
    this.store_byte_to_mem = store_byte_to_mem;
    this.load_double_from_mem = load_double_from_mem;
    this.load_double_from_mem_new = load_double_from_mem_new;
    this.load_double_from_mem_raw = load_double_from_mem_raw;
    this.load_word_from_mem = load_word_from_mem;
    this.load_word_from_mem_new = load_word_from_mem_new;
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
    return input;
}
