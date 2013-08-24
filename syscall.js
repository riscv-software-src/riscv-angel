// handle syscalls
//



function handle_syscall(payload) {
    // read 8 words starting at payload
    var eMem = [];
    for (var i = 0; i < 8; i++){
        eMem.push(RISCV.load_double_from_mem(payload.getLowBits() + i*8));
    }

    console.log(SYSCALLS[eMem[0]]);
    result = SYSCALL_HANDLERS[SYSCALLS[eMem[0]]](eMem[1], eMem[2], eMem[3], eMem[4]);
    RISCV.store_double_to_mem(payload.getLowBits(), new Long(result[0], 0x0));
    RISCV.store_double_to_mem(payload.add(new Long(0x8, 0x0)).getLowBits(), new Long(result[1], 0x0));


    //not sure if this is supposed to happen, but set fromhost to one
    //TODO: figure out if this is supposed to be here
    RISCV.priv_reg[PCR["PCR_FROMHOST"]["num"]] = new Long(0x1, 0x0);

}

function sys_exit(code, a1, a2, a3) {
    console.log("EXITCODE: " + stringIntHex(code.shiftLeft(1).or(new Long(0x1, 0x0))));
    return [0, 0];
}

function sys_read() {
    throw new RISCVError("NOT YET IMPLEMENTED"); 
}

function sys_write(fd, pbuf, len, a3) {

    // TODO: implement writing to files. currently only stdout/stderr
    if (fd.getLowBits() < 0x3) {
        // stdin, stdout, stderr TODO: stdin shouldn't really be here
        var buildStr = "";
        for (var i = 0; i < len.getLowBits(); i++) {
            buildStr += String.fromCharCode(RISCV.load_byte_from_mem(pbuf.getLowBits() + i));
        }    
        buildStr = "<br>" + buildStr;
        console.log(buildStr);
        document.getElementById("console").innerHTML += buildStr;
        forceConsoleDivDown();
    }
    return [0, 0];
}

function sys_open(pname, len, flags, mode) {
    nameArr = new Array();
    nameStr = "";

    // these are bytes so ignore endianness
    for (var i = 0; i < len.getLowBits(); i++) {
        nameArr.push(RISCV.load_byte_from_mem(pname.getLowBits() + i));
    }

    for (var i = 0; i < nameArr.length-1; i++) {
        nameStr = nameStr + String.fromCharCode(nameArr[i]);
    }

    //TODO: incorporate flags and mode?

    // return the file descriptor (stdout, stderr, stdin account for others)
    return [RISCV.pname_fd[nameStr], 0];
}

function sys_close() {

    // do nothing for our current implementation
    // TODO: handle running user code that works with files
    return [0, 0];


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

function sys_pread(fd, pbuf, len, off) {
    console.log("fd " + stringIntHex(fd));
    console.log("pbuf " + stringIntHex(pbuf));
    console.log("len " + stringIntHex(len));
    console.log("off " + stringIntHex(off));


    var binary = RISCV.binaries[fd.getLowBits()];
    console.log("loaded file to run");
    //handle loading program to exec    
    //assume same endianness
    // load from offset to min(binary.length, len.getLowBits())
    var loadlen = Math.min(binary.length, len.getLowBits());
    console.log("loadlen " + stringIntHex(loadlen));
    for (var i = off.getLowBits(); i < loadlen; i++) {
        RISCV.store_byte_to_mem(pbuf.getLowBits()+i, binary.charCodeAt(i) & 0xFF); 
    }

    return [loadlen, 0];
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

    return [0, 0];
}
