// simple assembler
//

// objs for different instruction types
function Jtype(){
    this.jumptarget = 0;
    this.opcode = 0;

    function set_from_tokens(instArr){
        // set fields from input and labels obj

    }

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.set_from_tokens = set_from_tokens;
    this.to_bin = to_bin;
}

function LUItype(){
    this.rd = 0;
    this.LUIimm = 0;
    this.opcode = 0;

    function set_from_tokens(instArr){
        // set fields from input and labels obj

    }

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.set_from_tokens = set_from_tokens;
    this.to_bin = to_bin;
}

function Itype(){
    this.rd = 0;
    this.rs1 = 0;
    this.imm = 0;
    this.funct3 = 0;
    this.opcode = 0;

    function set_from_tokens(instArr){
        // set fields from input and labels obj

    }

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.set_from_tokens = set_from_tokens;
    this.to_bin = to_bin;
}

function Btype(){
    this.rs1 = 0;
    this.rs2 = 0;
    this.imm = 0;
    this.funct3 = 0;
    this.opcode = 0;

    function set_from_tokens(instArr){
        // set fields from input and labels obj

    }

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.set_from_tokens = set_from_tokens;
    this.to_bin = to_bin;
}

function Rtype(){
    this.rd = 0;
    this.rs1 = 0;
    this.rs2 = 0;
    this.funct10 = 0;
    this.opcode = 0;

    function set_from_tokens(instArr){
        // set fields from input and labels obj

    }

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.set_from_tokens = set_from_tokens;
    this.to_bin = to_bin;
}

function R4type(){
    this.rd = 0;
    this.rs1 = 0;
    this.rs2 = 0;
    this.rs3 = 0;
    this.funct5 = 0;
    this.opcode = 0;

    function set_from_tokens(instArr){
        // set fields from input and labels obj

    }

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.set_from_tokens = set_from_tokens;
    this.to_bin = to_bin;
}


// assume that program will be loaded at 0x2000
function assemble(userProg){
    userProg = userProg.split("\n");
    labels = {} //make this non-global after testing

    // First pass, process lines and calc labels
    // CURRENTLY DOES NOT HANDLE LABELS THAT ARE NOT ON SAME LINE AS INSTRUCTION
    for (var i = 0; i < userProg.length; i++){

        if (userProg[i].indexOf(":") != -1){
            // this line is a label
            l = userProg[i].replace(/: /g, ":");
            l = l.split(":");
            userProg[i] = l[1]; // put the actual instruction back
            l = l[0];
            l = l.replace(" ", ""); // cleanup any remaining spaces
            labels[l] = i; 
        }

        // handle ", " and ",", convert to " "
        userProg[i] = userProg[i].replace(/, /g, " ");
        userProg[i] = userProg[i].replace(/,/g, " ");

        userProg[i] = userProg[i].split(" ");
    }

    // second pass, assemble and fill in labels assuming start at 0x2000
    for (var i = 0; i < userProg.length; i++){
        // this line is an instruction
        makeObj = inst_to_type[userProg[i][0]];
        instObj = new makeObj();
        instObj.set_from_tokens(userProg[i]);
        userProg[i] = instObj.to_bin();
    }
    return userProg;
}
