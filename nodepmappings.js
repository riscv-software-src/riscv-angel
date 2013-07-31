// fixed mappings that have no dependencies (can be loaded first, global)

// for memory accesses
function CONSTS() {
    this.READ = 0;
    this.WRITE = 1;
    this.EXEC = 2;
}

// instantiate a copy
CONSTS = new CONSTS();
