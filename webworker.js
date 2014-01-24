// this code will run in a separate worker and interface with the run.html 
// page's DOM through message passing

importScripts("lib/closure-compiled/long.js");
goog.require("goog.math.Long");

importScripts("lib/javascript-biginteger/biginteger.js");
Long = goog.math.Long;

importScripts("devices/character.js", "lib/binfile/binfile.js", "syscall.js", 
        "mappings.js", "utils.js", "mmu.js", "trap.js", "elfload.js", "inst.js",
        "cpu.js", "elfrun.js");



function runCodeC(userIn) {
    //compilestat = document.getElementById("compilestatus");
    //compilestat.innerHTML = "Compile Status: Compiling, waiting for server response.";
    filesList = ["lib/riscv_compiled/vmlinux" ];

    handle_file_continue(filesList);

    RISCV = new CPU();
}

function handle_file_continue(filesList) {
    //document.getElementById("testresult").innerHTML = "ELF not loaded";
    //tab = document.getElementById("regtable");
    //elfproptab = document.getElementById("elfprops");
    //debugtab = document.getElementById("debugprops");

    // execution pause
    pauseExec = false;

    GetBinaryFile(filesList[0], chainedFileLoader, filesList.slice(1, filesList.length));
}

runCodeC();
