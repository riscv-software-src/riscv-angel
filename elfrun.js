// run one instruction at a time, isolate from elfload

indicatedBoot = false;

// ASSUME GLOBAL ACCESS TO RISCV
function elfRunNextInst() {
    var instVal;

    if (RISCV.oldpc == RISCV.pc) {
        document.getElementById("console").innerHTML += "<br>User program finished. Execution terminated.";
        pauseExec = true;
        throw new RISCVError("Execution completed");
    }

    // set last PC value for comparison
    RISCV.oldpc = RISCV.pc;

    try {
        //var t = num_to_hexstr(RISCV.pc);
        //console.log(": core   0: 0xffffffff8" + t.slice(1, t.length));
        instVal = RISCV.load_inst_from_mem(RISCV.pc);
        var inst = new instruction(instVal);
        runInstruction(inst, RISCV);

        // HERE, ALSO CHECK FOR INTERRUPT BITS
        // can we just generate a fake trap and call handle trap? check kernel

    } catch(e) {
        // trap handling
        if (e.e_type === "RISCVTrap") {
            console.log("HANDLING TRAP: " + e.message);
            handle_trap(e);
        } else {
            throw e;
        }
    }

    // handle interrupts here. DO NOT put this in inst.js (exceptions will break interrupts)
    if ((RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_EI"]) != 0x0) {
        // interrupts are enabled
        if (((RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] >>> 16) & 0x80) != 0x0) {
            // timer interrupt is enabled
            if (RISCV.priv_reg[PCR["CSR_COUNT"]["num"]].equals(RISCV.priv_reg[PCR["CSR_COMPARE"]["num"]])) {
                // set IP bit for timer interrupt
                console.log("Handling timer interrupt");
                RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] | 0x80000000;
                var InterruptException = new RISCVTrap("Timer interrupt");
                handle_trap(InterruptException);
            }
        }

    }

    var toHostVal = RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]];
    // check toHost, output to JS console, clear it
    if (toHostVal.notEquals(new Long(0x0, 0x0))){
        //console.log("Output on toHost:");
        //console.log(stringLongHex(RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]]));

        // now on every run, we need to check to see if a syscall is happening
        // check device / cmd
        var device = (toHostVal.getHighBits() >> 24) & 0xFF;
        var cmd = (toHostVal.getHighBits() >> 16) & 0xFF;
        var payload = new Long(toHostVal.getLowBits(), toHostVal.getHighBits() & 0xFFFF);
        if (device == 0x0 && cmd == 0x0) {
            // this is a syscall
            //if (payload.getLowBits() & 0x1 == 1) {
                // this is for testing (Pass/Fail) report for test programs
                // all other programs cannot have this bit set (since it's an
                // address)
            //    if (RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]].equals(new Long(0x1, 0x0))) {
            //        // set to true in case this is a test
            //        RISCV.testSuccess = true;
            //    }
            //} else {
                // this is for normal syscalls (not testing)
            handle_syscall(payload);
            //}
        } else if (device == 0x1) {
            // terminal
            if (cmd == 0x1) {
               write_to_term(payload.getLowBits() & 0xFF);
            } else {
               throw new RISCVError("Other term features not yet implemented"); 
            } 
        } else {
            // unknown device, crash
            console.log("device " + stringIntHex(device));
            console.log("cmd " + stringIntHex(cmd));
            console.log("payload " + stringIntHex(payload));
            console.log("current PC " + stringIntHex(RISCV.pc));
            console.log("last PC " + stringIntHex(RISCV.oldpc));
            throw new RISCVError("unknown device/command combo");
        }

        RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]] = new Long(0x0, 0x0);
    } 
    
    if (document.getElementById("debugcheckbox").checked && document.getElementById("regtablecheckbox").checked) {
        update_debug_table([stringIntHex(RISCV.oldpc), stringIntHex(instVal), stringIntHex(RISCV.pc)], debugtab);
        update_html_regtable(RISCV, tab);
    }

}
