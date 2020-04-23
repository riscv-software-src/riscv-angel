// run one instruction at a time, isolate from elfload

var readTest = [];

var lastCharWritten = 0;

// ASSUME GLOBAL ACCESS TO RISCV
function elfRunNextInst() {
    var instVal;
    var stopCount = 10000;
    var tryCount = 0;

    // fix MIPS count at boot and return from idle
    var lastTimeSlot = (new Date()).getTime();

    for (var i = 1; ; i++)  {
        if (!(i & 0x1FFFFF)) {
            var ctime = (new Date()).getTime();
            postMessage({"type": "m", "d": 2097.152 / (ctime - lastTimeSlot)});
            lastTimeSlot = ctime;
        }

        // handle special cases @ cpu_idle
        if (RISCV.pc == (0x80152b58|0)) {
            if (readTest.length) {
                if (readTest[0]  == 'THIS_IS_ESC') {
                    readTest[0] = String.fromCharCode(0x1b);
                    lastCharWritten = 1;
                }
                RISCV.priv_reg[PCR["CSR_FROMHOST"]["num"]] = new Long(0x100 | (readTest.shift().charCodeAt(0) & 0xFF), 0x01000000);
                RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] | 0x40000000;
                var InterruptException = new RISCVTrap("Host interrupt");
                handle_trap(InterruptException);
            } else {
                // wait for user input
                tryCount += 1;
                if (tryCount == stopCount) {
                    tryCount = 0;
                    if (lastCharWritten == 0x1) {
                        lastCharWritten = 0x0;
                        RISCV.priv_reg[PCR["CSR_COMPARE"]["num"]] = RISCV.priv_reg[PCR["CSR_COUNT"]["num"]] + 100000;
                        stopCount = 200000;
                    } else {
                        stopCount = 10000;
                        return false;
                    }
                }
            }
        }


        // set last PC value for comparison
        //RISCV.oldpc = RISCV.pc;
        
        instVal = RISCV.load_inst_from_mem(RISCV.pc);
        if (!RISCV.excpTrigg) {
            runInstruction(instVal); // , RISCV);
        }
        // trap handling
        if (RISCV.excpTrigg) {
            if (RISCV.excpTrigg.message === "Floating-Point Disabled") {
                // do nothing
                //console.log("ignoring FP instruction at: " + stringIntHex(RISCV.pc));
                RISCV.pc += 4;
                RISCV.excpTrigg = undefined;
            } else {
                //console.log("HANDLING TRAP: " + e.message);
                var e = RISCV.excpTrigg;
                RISCV.excpTrigg = undefined;
                handle_trap(e);
            }
        } 


        // handle interrupts here. DO NOT put this in inst.js (exceptions will break interrupts)
        if (RISCV.priv_reg[0x506] == RISCV.priv_reg[0x507]) {
            if ((RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_EI"]) != 0x0) {
                // interrupts are enabled
                if (((RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] >>> 16) & 0x80) != 0x0) {
                    // timer interrupt is enabled
                        // set IP bit for timer interrupt
                        RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] | 0x80000000;
                        var InterruptException = new RISCVTrap("Timer interrupt");
                        handle_trap(InterruptException);
                }
            }
        }
    }
}
