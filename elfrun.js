// run one instruction at a time, isolate from elfload

indicatedBoot = false;

passedPCpoint = false;

printCount = 0;
encounteredOnce = false;

// ASSUME GLOBAL ACCESS TO RISCV
function elfRunNextInst() {
    var instVal;

    if (RISCV.oldpc == RISCV.pc) {
        //document.getElementById("console").innerHTML += "<br>User program finished. Execution terminated.";
        pauseExec = true;
        throw new RISCVError("Execution completed");
    }

//    if ((RISCV.pc & 0x80000000) == 0x0) {
//        console.log(stringIntHex(RISCV.pc));
//    }


    if (signed_to_unsigned(RISCV.pc) == 0x132f4) {
        console.log("stack pointer initial");
        console.log(stringIntHex(RISCV.gen_reg[14]));
        RISCV.gen_reg[14] = new Long(0xffae5e78, 0x3ff);
        console.log("stack pointer forced");
        console.log(stringIntHex(RISCV.gen_reg[14]));
    }

    /*
    if (signed_to_unsigned(RISCV.pc) == 0x132f4) {
        RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] & ~(SR["SR_VM"]);
    }*/

    //if (signed_to_unsigned(RISCV.pc) == 0x801593d4) {
    //    console.log(stringIntHex(RISCV.pc));
    //    console.log(stringIntHex(RISCV.oldpc));
    //}

/*    if (passedPCpoint && printCount < 100000) {
        console.log(stringIntHex(RISCV.pc));
        printCount++;
//    } else if (signed_to_unsigned(RISCV.pc) == 0x801592b8) {
    } else if (signed_to_unsigned(RISCV.pc) == 0x000132f4) {
        console.log(stringIntHex(RISCV.pc));
        passedPCpoint = true;
//        printCount++;
    //} else if (signed_to_unsigned(RISCV.pc) == 0x00010000 && !encounteredOnce) {
    //    encounteredOnce = true;
    } else if (signed_to_unsigned(RISCV.pc) == 0x801593d4) {
        passedPCpoint = false;
    }
*/
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
                //console.log("Handling timer interrupt");
                RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] | 0x80000000;
                var InterruptException = new RISCVTrap("Timer interrupt");
                handle_trap(InterruptException);
            }
        }

    }


    // [todo] - register syscall handler

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
        if (device == 0x0) {
            // this is a syscall
            // this is for normal syscalls (not testing)
            if (cmd == 0x0) {
                handle_syscall(payload);
            } else if (cmd == 0xFF) {

                var addr = payload.shiftRightUnsigned(8); // hardcoded from log2(MAX_COMMANDS [256])
                var what = payload.getLowBits() & 0xFF;



                if (what == 0xFF) {
                    var toWrite = "syscall_proxy";
                }
                if (what == 0x0) {
                    var toWrite = "syscall";
                } 
                for (var i = 0; i < toWrite.length; i++) {
                    RISCV.memory[addr.getLowBits() + i] = toWrite.charCodeAt(i) & 0xFF;
                }
                RISCV.memory[addr.getLowBits() + toWrite.length] = 0x00;


                RISCV.priv_reg[PCR["CSR_FROMHOST"]["num"]] = new Long(0x1, 0x0);
            }
        } else if (device == 0x1) {
            // terminal, but ignore the enumeration
            if (cmd == 0x0) {
               // this is read
            } else if (cmd == 0x1) {
               // this is a write
               //write_to_term(payload.getLowBits() & 0xFF);
               postMessage(payload.getLowBits() & 0xFF);
            } else if (cmd == 0xFF) {
               // write "bcd" (block character device) to pbuf here
                console.log("device " + stringIntHex(device));
                console.log("cmd " + stringIntHex(cmd));
                console.log("payload " + stringIntHex(payload));
                console.log("current PC " + stringIntHex(RISCV.pc));
                console.log("last PC " + stringIntHex(RISCV.oldpc));




                var addr = payload.shiftRightUnsigned(8); // hardcoded from log2(MAX_COMMANDS [256])
                var what = payload.getLowBits() & 0xFF;



                if (what == 0xFF) {
                    var toWrite = "bcd";
                }
                if (what == 0x0) {
                    var toWrite = "read";
                } 
                if (what == 0x1) {
                    var toWrite = "write";
                }

                for (var i = 0; i < toWrite.length; i++) {
                    RISCV.memory[addr.getLowBits() + i] = toWrite.charCodeAt(i) & 0xFF;
                }
                RISCV.memory[addr.getLowBits() + toWrite.length] = 0x00;


                RISCV.priv_reg[PCR["CSR_FROMHOST"]["num"]] = new Long(0x1, 0x0);


                //throw new RISCVError("request for terminal device");
               
            } else {
               throw new RISCVError("Other term features not yet implemented " + stringIntHex(cmd)); 
            } 
        } else if (cmd == 0xFF) {
            // try to override enumeration
            //if (device == 0x0) {
            //    // need to write "bcd" to pbuf here

                var addr = payload.shiftRightUnsigned(8); // hardcoded from log2(MAX_COMMANDS [256])
                var what = payload.getLowBits() & 0xFF;

                if (what == 0xFF) {
                    var toWrite = "";
                }
                for (var i = 0; i < toWrite.length; i++) {
                    RISCV.memory[addr.getLowBits() + i] = toWrite.charCodeAt(i) & 0xFF;
                }
                RISCV.memory[addr.getLowBits() + toWrite.length] = 0x00;

                RISCV.priv_reg[PCR["CSR_FROMHOST"]["num"]] = new Long(0x1, 0x0);

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
    
    /*if (document.getElementById("debugcheckbox").checked && document.getElementById("regtablecheckbox").checked) {
        update_debug_table([stringIntHex(RISCV.oldpc), stringIntHex(instVal), stringIntHex(RISCV.pc)], debugtab);
        update_html_regtable(RISCV, tab);
    }*/

}
