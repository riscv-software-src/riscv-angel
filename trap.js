// trap handling

function handle_trap(){

    // put CPU into supervisor mode
    console.log("Trap occurred at 0x" + RISCV.pc.toString(16));
    console.log(stringIntHex(RISCV.load_word_from_mem(RISCV.pc)));








}
