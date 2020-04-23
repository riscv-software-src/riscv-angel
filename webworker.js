// this code will run in a separate worker and interface with the run.html 
// page's DOM through message passing

importScripts("lib/closure-compiled/long.js");
goog.require("goog.math.Long");

importScripts("lib/javascript-biginteger/biginteger.js");
Long = goog.math.Long;

const riscvFolder = "src/riscv";
importScripts(
    "devices/character.js",
    "lib/binfile/binfile.js",
    `${riscvFolder}/mappings.js`,
    `${riscvFolder}/utils.js`,
    `${riscvFolder}/mmu.js`,
    `${riscvFolder}/trap.js`,
    `${riscvFolder}/elfload.js`,
    `${riscvFolder}/inst.js`,
    `${riscvFolder}/cpu.js`,
    `${riscvFolder}/elfrun.js`
);

self.addEventListener("message", function (oEvent) {
    if (oEvent.data.type === "r") {
        //continue running
        readTest.push("\n");
        elfRunNextInst();
    } else if (oEvent.data.type === "u") {
        // copy user input
        DAT = oEvent.data.inp;
        if (DAT === 'THIS_IS_ESC') {
            readTest.push(DAT);
        } else {
            for (var x = 0; x < DAT.length; x++) {
                readTest.push(DAT.charAt(x));
            }
        }
        elfRunNextInst();
    }
}, false);

function runCodeC(userIn) {
    filesList = ["lib/riscv_compiled/vmlinux" ];
    handle_file_continue(filesList);
    RISCV = new CPU();
}

function handle_file_continue(filesList) {
    // execution pause
    pauseExec = false;
    GetBinaryFile(filesList[0], chainedFileLoader, filesList.slice(1, filesList.length));
}

runCodeC();
