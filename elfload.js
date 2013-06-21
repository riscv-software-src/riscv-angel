// Load ELF64 file

// loadElf is passed as the callback function to binary file reader.
// - May assume access to RISCV (the processor). 
// - Setup done in run.html
function loadElf(binfile){
    var elf = {};
    var magic = ((binfile.charCodeAt(0) & 0xFF) << 24) | ((binfile.charCodeAt(1) & 0xFF) << 16) |
                ((binfile.charCodeAt(2) & 0xFF) << 8) | (binfile.charCodeAt(3) & 0xFF);
    if (magic === 0x7f454c46){
        // everything is fine. proceed
    } else { 
        throw new RISCVError("NOT AN ELF. ERR");
    }

    // e_ident (16 bytes, ELF identification string)
    elf["magic"] = magic; // magic num to identify ELF files
    elf["ei_class"] = binfile.charCodeAt(4) & 0xFF; // 1 -> 32 bit, 2 -> 64 bit
    elf["ei_data"] = binfile.charCodeAt(5) & 0xFF; // 1 little end, 2 big end
    elf["ei_version"] = binfile.charCodeAt(6) & 0xFF; // currently always 1
    elf["ei_pad"] = binfile.charCodeAt(7) & 0xFF; // marks beginning of padding

    if (elf["ei_data"] === 1){
        var end = "l";
        RISCV.endianness = "little";
    } else if (elf["ei_data"] === 2){
        var end = "b";
        RISCV.endianness = "big";
    } else {
        throw new RISCVError("ELF has invalid endianness");
    }

    // type of object file. should be 2 for executable
    elf["e_type"] = bytes_to_int(binfile, 16, 2, end);
    // architecture
    elf["e_machine"] = bytes_to_int(binfile, 18, 2, end);
    // elf version (should always be 1)
    elf["e_version"] = bytes_to_int(binfile, 20, 4, end);
    // virtual address of entry point into program (0x10000)
    elf["e_entry"] = bytes_to_long(binfile, 24, 8, end);
    // offset for program header
    elf["e_phoff"] = bytes_to_long(binfile, 32, 8, end);
    // offset for section header
    elf["e_shoff"] = bytes_to_long(binfile, 40, 8, end);
    // processor flags
    elf["e_flags"] = bytes_to_int(binfile, 48, 4, end);
    // elf header size
    elf["e_ehsize"] = bytes_to_int(binfile, 52, 2, end);
    // size of each individual entry in program header table
    elf["e_phentsize"] = bytes_to_int(binfile, 54, 2, end);
    // number of entries in program header table
    elf["e_phnum"] = bytes_to_int(binfile, 56, 2, end);
    // size of each individual entry in section header table
    elf["e_shentsize"] = bytes_to_int(binfile, 58, 2, end);
    // number of entries in section header table
    elf["e_shnum"] = bytes_to_int(binfile, 60, 2, end);
    // section header string table index
    elf["e_shstrndx"] = bytes_to_int(binfile, 62, 2, end);

    // show elf header information to the user
    update_elf_proptable(elf, elfproptab);

    // step through section headers, build up array
    var section_headers = [];

    for (var i = 0; i < elf["e_shnum"]; i++){
        var addr = elf["e_shoff"].getLowBits() + i*elf["e_shentsize"];
        var section = {};
        section["flags"] = bytes_to_long(binfile, addr+8, 8, end);
        section["addr"] = bytes_to_long(binfile, addr+16, 8, end);
        section["offs"] = bytes_to_long(binfile, addr+24, 8, end);
        section["size"] = bytes_to_long(binfile, addr+32, 8, end);
        section_headers.push(section);
    }

    // copy necessary data into memory
    for (var i = 0; i < section_headers.length; i++){
        // check for allocate flag (bit #1)
        if (((section_headers[i]["flags"].getLowBits() >> 1) & 0x1) == 0x1){
            for (var j = 0; j < section_headers[i]["size"].getLowBits(); j++){
                RISCV.memory[(section_headers[i]["addr"].getLowBits()|0) + j] = binfile.charCodeAt((section_headers[i]["offs"].getLowBits()|0)+j) & 0xFF;
            }
        }
    }

    // start running program
    RISCV.pc = elf["e_entry"].getLowBits();

    // reset clock
    RISCV.reset_wall_clock();

    var instVal = RISCV.load_word_from_mem(RISCV.pc);

    // used for inf loop detection
    var oldpc;

    // currently stop on a syscall
    // TODO: modify this so that it detects the end of _exit and stops
    while(RISCV.pc != 0){
        // run instruction
        oldpc = RISCV.pc;
        var inst = new instruction(instVal);
        runInstruction(inst, RISCV);

        // terminate if PC is unchanged
        if (RISCV.pc == oldpc){

            // check TOHOST in case this is a test
            if (RISCV.priv_reg[30].equals(new Long(0x1, 0x0))){
                document.getElementById("testresult").innerHTML = "PASS";
            } else {
                document.getElementById("testresult").innerHTML = "FAIL";
            }

            // Terminate
            throw new RISCVError("PC Repeat. In single CPU imp, this means inf loop. Terminated. Current PC: " + RISCV.pc.toString(16));
        }
        /*
        // update output. see note about this in run.html
        for (var i = 0; i < RISCV.gen_reg.length; i++){
            tab.rows[i+1].cells[1].innerHTML = (RISCV.gen_reg[i]|0).toString();
        }
        */

        // load next instruction
        instVal = RISCV.load_word_from_mem(RISCV.pc);
    }

    // show register contents to user
    update_html_regtable(RISCV, tab);
}

// numbytes must always be 8, keep it as an arg for consistency
function bytes_to_long(input, addr, numbytes, end){
    if (end == "b"){
        return new Long(bytes_to_int(input, addr+4, 4, end), bytes_to_int(input, addr, 4, end));
    } else if (end == "l"){
        return new Long(bytes_to_int(input, addr, 4, end), bytes_to_int(input, addr+4, 4, end));
    } else {
        throw new RISCVError("invalid endianness in bytes_to_long");
    }
}

// load numbytes bytes from input starting at input[addr] using endianness end
// valid values for end: "l": little, "b": big
function bytes_to_int(input, addr, numbytes, end){
    var toArr = [];
    for (var x = 0; x < numbytes; x++){
        toArr.push(input.charCodeAt(addr+x) & 0xFF);
    }
    if (end === "l"){
        toArr = toArr.reverse();
    }
    var output = 0;
    for (var x = 0; x < numbytes; x++){
        output = output | (toArr[x] << (8*(numbytes-1-x)));
    }
    return output;
}
