// handle syscalls
//



function handle_syscall(payload) {


    // read 8 words starting at payload
    var eMem = [];
    for (var i = 0; i < 8; i++){
        eMem.push(RISCV.load_double_from_mem(payload.getLowBits() + i*8));
    }
/*    console.log("syscall magic mem:");
    for (var i = 0; i < 8; i++){
        console.log(stringIntHex(eMem[i]));
    }
*/
    console.log(SYSCALLS[eMem[0]]);
    result = SYSCALL_HANDLERS[SYSCALLS[eMem[0]]](eMem[1], eMem[2], eMem[3], eMem[4]);
    RISCV.store_double_to_mem(payload.getLowBits(), new Long(result[0], 0x0));
    RISCV.store_double_to_mem(payload.add(new Long(0x8, 0x0)).getLowBits(), new Long(result[1], 0x0));
}

function sys_exit() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_read() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_write() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_open() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_close() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_fstat() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_lseek() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_stat() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_lstat() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_link() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_unlink() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_pread() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_pwrite() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_getmainvars(mm1, mm2, mm3, mm4) {
    console.log(stringLongHex(mm1));
    console.log(stringLongHex(mm2));
    console.log(stringLongHex(mm3));
    console.log(stringLongHex(mm4));
    console.log(globfilename);
    // cleanup input
    var argsstring = document.getElementById("cmdargs").value;
    argsstring = argsstring.trim(); // trim leading / trailing whitespace
    argsstring = argsstring.replace(/ +(?= )/g, ""); // strip extra spaces
    var args = argsstring.split(" ");
    args.unshift(globfilename); // tack on filename
    if (args[args.length-1] === "") {
        args.pop(); // strip off "" in case of no args
    }
    console.log(args);
    var copyToMem = new Array(args.length + 3); // stores arg pointers plus
                                                // argc, argv[argc]=NULL and envp[0] == NULL
    copyToMem[0] = new Long(args.length, 0x0);
    copyToMem[args.length + 1] = new Long(0x0, 0x0);
    copyToMem[args.length + 2] = new Long(0x0, 0x0);

    var sz = new Long((args.length + 3) * 8); // 8 for #words in uint64
    for (var i = 0; i < args.length; i++) {
        copyToMem[i+1] = sz.add(mm1);
        sz = sz.add(new Long(args[i].length+1,0x0));
    }

    var bytes = new Uint8Array(sz.getLowBits());

    if (sz.greaterThan(mm2)) {
        // mm2 is limit
        // TODO: what is ENOMEM? for now junk def:
        var ENOMEM = -1;
        return [-1, ENOMEM]
    } 

    // for endianness purposes, copy directly into mem
    // copy in argc, pointers, argv[argc]=NULL, envp[0]=NULL
    for (var i = 0; i < copyToMem.length; i++) {
        RISCV.store_double_to_mem(mm1.getLowBits()+i*8, copyToMem[i]);
    } 


    var tracker = copyToMem.length*8;
    for (var i = 0; i < args.length; i++) {
        for (var j = 0; j < args[i].length; j++) {
            console.log(args[i].charCodeAt(j));
            bytes[tracker+j] = args[i].charCodeAt(j); // grab ASCII char codes from str
        }
        bytes[tracker+args[i].length] = 0; // add null terminator
        tracker = tracker + args[i].length + 1;
    } 

    // write last piece of bytes into target memory
    console.log(copyToMem.length*8);
    console.log(bytes.length);
    for (var i = copyToMem.length*8; i < bytes.length; i++) {   
        console.log(bytes[i]);
        RISCV.memory[mm1.getLowBits() + i] = bytes[i];
    }

    throw new RISCVError("LOL");
    return [0, 0];
}
