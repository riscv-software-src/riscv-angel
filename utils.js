// utils for the cpu
//
function update_html_regtable(RISCV, tab){
    // update output
    for (var i = 0; i < RISCV.gen_reg.length; i++){
        tab.rows[i+1].cells[1].innerHTML = (RISCV.gen_reg[i]|0).toString();
    }
}

function RISCVError(message){
    this.name = "RISCVError";
    this.message = (message || "");

    update_html_regtable(RISCV, tab);
}

RISCVError.prototype = Error.prototype;
