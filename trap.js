// trap handling

function handle_trap(trap){
    //first, need to check EI bit. if it is not one, processor enters ERROR
    //mode (throw new RISCVError("ERROR");)
    if ((RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] & SR["SR_EI"]) == 0x0) {
        // this means exceptions are disabled
        // enter ERROR mode:
        throw new RISCVError("Exceptions are Disabled but Trap Occurred, Terminating");
    } 
    //console.log("Trap occurred at " + stringIntHex(RISCV.pc));

    // store exception code to cause register
    var trapec = trap.exceptionCode;
    var causeLong = new Long(trap.exceptionCode, trap.interruptBit << 31);
    RISCV.priv_reg[PCR["CSR_CAUSE"]["num"]] = causeLong;

    var oldsr = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]];
    // set SR[PS] = SR[S]
    if ((oldsr & SR["SR_S"]) != 0) {
        // S is set
        oldsr = oldsr | SR["SR_PS"];
    } else {
        oldsr = oldsr & (~SR["SR_PS"]);
    }

    if ((oldsr & SR["SR_EI"]) != 0) {
        oldsr = oldsr | SR["SR_PEI"];
    } else {
        oldsr = oldsr & (~SR["SR_PEI"]);
    }

    // set S to 1 - enable supervisor
    oldsr = oldsr | SR["SR_S"];

    // set EI to 0
    oldsr = oldsr & (~SR["SR_EI"]);

    // store modified SR
    RISCV.priv_reg[PCR["CSR_STATUS"]["num"]] = oldsr;

    // if trap is load/store misaligned address or access fault, 
    // set badvaddr to faulting address
    if (trapec == 0x8 || trapec == 0x9 || trapec == 0xA || trapec == 0xB) {

        if ((trap.memaddr.getLowBitsUnsigned() & 0xFF000000) == 0x55000000) {
            RISCV.priv_reg[PCR["CSR_BADVADDR"]["num"]] = new Long(trap.memaddr.getLowBitsUnsigned(), 0x155);
        } else {
            RISCV.priv_reg[PCR["CSR_BADVADDR"]["num"]] = trap.memaddr;
        }
    }

    // store original PC (addr of inst causing exception) to epc reg
    if ((RISCV.pc & 0xFF000000) == 0x55000000) {
        RISCV.priv_reg[PCR["CSR_EPC"]["num"]] = new Long(RISCV.pc, 0x155);
    } else {
        RISCV.priv_reg[PCR["CSR_EPC"]["num"]] = signExtLT32_64(RISCV.pc, 31);
    }




    // set PC = to value in evec register
    RISCV.pc = RISCV.priv_reg[PCR["CSR_EVEC"]["num"]].getLowBits();

}
