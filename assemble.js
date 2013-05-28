// simple assembler
//

// objs for different instruction types
function Jtype(){
    this.jumptarget = 0;
    this.opcode = 0;

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.to_bin = to_bin;
}

function LUItype(){
    this.rd = 0;
    this.LUIimm = 0;
    this.opcode = 0;

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.to_bin = to_bin;
}

function Itype(){
    this.rd = 0;
    this.rs1 = 0;
    this.imm = 0;
    this.funct3 = 0;
    this.opcode = 0;

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.to_bin = to_bin;
}

function Btype(){
    this.rs1 = 0;
    this.rs2 = 0;
    this.imm = 0;
    this.funct3 = 0;
    this.opcode = 0;

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.to_bin = to_bin;
}

function Rtype(){
    this.rd = 0;
    this.rs1 = 0;
    this.rs2 = 0;
    this.funct10 = 0;
    this.opcode = 0;

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.to_bin = to_bin;
}

function R4type(){
    this.rd = 0;
    this.rs1 = 0;
    this.rs2 = 0;
    this.rs3 = 0;
    this.funct5 = 0;
    this.opcode = 0;

    function to_bin(){
        // convert to binary
        binned = 0;

        return binned;
    }

    this.to_bin = to_bin;
}

// assume that program will be loaded at 0x2000
function assemble(userProg){
    userProg = userProg.split("\n");
    var labels = {}

    // CURRENTLY DOES NOT HANDLE LABELS
    for (var i = 0; i < userProg.length; i++){
        // handle ", " and ",", convert to " "
        userProg[i] = userProg[i].replace(/, /g, " ");
        userProg[i] = userProg[i].replace(/,/g, " ");

        userProg[i] = userProg[i].split(" ");
    }


    //first pass, simple stuff
    for (var i = 0; i < userProg.length; i++){






    }
