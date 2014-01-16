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

    // write out to console to indicate booting
    if (RISCV.pc == 0x2000) {
        // indicate booting
        document.getElementById("console").innerHTML += "Booting proxy_kernel...";
    } else if (RISCV.pc == 0x10000 && !indicatedBoot) {
        // indicate finished booting
        document.getElementById("console").innerHTML += "<br>Boot finished, running user program...";
        indicatedBoot = true;
    }

    // set last PC value for comparison
    RISCV.oldpc = RISCV.pc;

    try {
        //console.log(num_to_hexstr(RISCV.pc));
        instVal = RISCV.load_inst_from_mem(RISCV.pc);
        var inst = new instruction(instVal);
        runInstruction(inst, RISCV);
    } catch(e) {
        // trap handling
        if (e.e_type === "RISCVTrap") {
            console.log("HANDLING TRAP: " + e.message);
            handle_trap(e);
        } else {
            throw e;
        }
    }

    var toHostVal = RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]];
    // check toHost, output to JS console, clear it
    if (toHostVal.notEquals(new Long(0x0, 0x0))){
        console.log("Output on toHost:");
        console.log(stringLongHex(RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]]));

        // now on every run, we need to check to see if a syscall is happening
        // check device / cmd
        var device = (toHostVal.getHighBits >> 24) & 0xFF;
        var cmd = (toHostVal.getHighBits >> 16) & 0xFF;
        var payload = new Long(toHostVal.getLowBits(), toHostVal.getHighBits() & 0xFFFF);

        if (device == 0x0 && cmd == 0x0) {
            // this is a syscall
            if (payload.getLowBits() & 0x1 == 1) {
                // this is for testing (Pass/Fail) report for test programs
                // all other programs cannot have this bit set (since it's an
                // address)
                if (RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]].equals(new Long(0x1, 0x0))) {
                    // set to true in case this is a test
                    RISCV.testSuccess = true;
                }
            } else {
                // this is for normal syscalls (not testing)
                handle_syscall(payload);
            }
        }

        RISCV.priv_reg[PCR["CSR_TOHOST"]["num"]] = new Long(0x0, 0x0);
    } 
    
    if (document.getElementById("debugcheckbox").checked && document.getElementById("regtablecheckbox").checked) {
        update_debug_table([stringIntHex(RISCV.oldpc), stringIntHex(instVal), stringIntHex(RISCV.pc)], debugtab);
        update_html_regtable(RISCV, tab);
    }

}
