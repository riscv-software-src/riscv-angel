// run one instruction at a time, isolate from elfload

// ASSUME GLOBAL ACCESS TO RISCV
function elfRunNextInst() {

    // force load in for NON-VM IMPLEMENTATION
    if (RISCV.pc == 0x10000) {
        loadElf(fileNamePairs[1][1], fileNamePairs[1][0], []);
    }






    var instVal;

    // run instruction
    console.log(RISCV.pc.toString(16));

    // set last PC value for comparison
    RISCV.oldpc = RISCV.pc;


    try {
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

    var toHostVal = RISCV.priv_reg[PCR["PCR_TOHOST"]["num"]];
    // check toHost, output to JS console, clear it
    if (toHostVal.notEquals(new Long(0x0, 0x0))){
        console.log("Output on toHost:");
        console.log(stringLongHex(RISCV.priv_reg[PCR["PCR_TOHOST"]["num"]]));


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
                if (RISCV.priv_reg[30].equals(new Long(0x1, 0x0))) {
                    // set to true in case this is a test
                    RISCV.testSuccess = true;
                }
            } else {
                // this is for normal syscalls (not testing)
                handle_syscall(payload);
            }

        }

        // if we get the open syscall, we copy in the file at the address specified


        RISCV.priv_reg[PCR["PCR_TOHOST"]["num"]] = new Long(0x0, 0x0);
    } 


    // terminate if PC is unchanged
    if (RISCV.pc == RISCV.oldpc) {

    /* EVENTUALLY MOVE THIS TO SYSCALL HANDLER
        // check TOHOST in case this is a test
        if (RISCV.testSuccess) {
            document.getElementById("testresult").innerHTML = filename + " PASSED";
            console.log(filename + " PASSED");
            passCount++;
            testCount++;
            //console.log(passCount.toString() + " tests passed out of " + testCount.toString());
        } else {
            document.getElementById("testresult").innerHTML = filename + " FAILED";
            console.log(filename + " FAILED");
            testCount++;
            //console.log(passCount.toString() + " tests passed out of " + testCount.toString());
        }

        // Terminate
        //throw new RISCVError("PC Repeat. In single CPU imp, this means inf loop. Terminated. Current PC: " + RISCV.pc.toString(16));
        //
        if (filesList.length > 0) {
            handle_file_continue(filesList);
        } else {
            console.log(passCount.toString() + " tests passed out of " + testCount.toString());
        }
    */
        return;
    }

    update_debug_table([stringIntHex(RISCV.oldpc), stringIntHex(instVal), stringIntHex(RISCV.pc)], debugtab);
    update_html_regtable(RISCV, tab);

}
