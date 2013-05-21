// setup a cpu, run instructions on it
//

// default 32-bit CPU with 32 MiB memory
RISCV = new CPU();


// need to load program into memory
// (first instruction goes in 0x2000)


//while(true){
    var inst = RISCV.memory[RISCV.pc];
    //runInstruction(inst, CPU);
    // grab inst from current PC


//}
