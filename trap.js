// trap handling

function handle_trap(){


    //first, need to check ET bit. if it is not one, processor enters ERROR
    //mode (throw new RISCVError("ERROR");)

    if (RISCV.priv_reg[0] & 0x1 == 0x0) {
        // this means exceptions are disabled
        // enter ERROR mode:
        throw new RISCVError("Exceptions are Disabled but Trap Occurred, Terminating");
    } 


    // put CPU into supervisor mode
    console.log("Trap occurred at 0x" + RISCV.pc.toString(16));
    console.log(stringIntHex(RISCV.load_word_from_mem(RISCV.pc)));








}
