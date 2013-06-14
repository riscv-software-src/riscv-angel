// utils for the cpu
//
function update_html_regtable(RISCV, tab){
    // update output
    for (var i = 0; i < RISCV.gen_reg.length; i++){
        tab.rows[i+1].cells[1].innerHTML = stringLongHex(RISCV.gen_reg[i]);
    }
}

function RISCVError(message){
    this.name = "RISCVError";
    this.message = (message || "");

    update_html_regtable(RISCV, tab);
}

RISCVError.prototype = Error.prototype;

// build proper hex rep of 64 bit quantity
// javascript does this incorrectly: it adds a 
// negative sign and messes up the rep instead of 
// just showing the bare rep
function stringLongHex(longin){
    return "0x" + num_to_hexstr(longin.getHighBits()) + num_to_hexstr(longin.getLowBits());    
}

// build proper hex rep of 32 bit quantity
// see note above about how toString(16) handles this by default
function stringNumberHex(numberin){
    return "0x" + num_to_hexstr(numberin);
}

// helper for stringLongHex and stringNumberHex, does the 
// heavy lifting
function num_to_hexstr(numberin){
    var numberupper = numberin & 0xF0000000;
    numberupper = numberupper >>> 28;
    var upperstr = numberupper.toString(16);
    var numberlower = numberin & 0x0FFFFFFF;
    var lowerstr = numberlower.toString(16);

    // lowerstr must be 7 hex digits. fix it in case we lost zeroes
    var addamt = 7 - lowerstr.length;
    for (var i = 0; i < addamt; i++){
        lowerstr = "0" + lowerstr;
    }
    return (upperstr + lowerstr).toUpperCase();
}
