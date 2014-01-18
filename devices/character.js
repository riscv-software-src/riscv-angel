// character device (terminal) for ANGEL

function init_term() {
    cons = document.getElementById("console");
}

// input char_int is int rep of character
function write_to_term(char_int) {
    var charToWrite = String.fromCharCode(char_int);
    if (charToWrite === " ") {
        charToWrite = "&nbsp;";
    } else if (char_int == 0xD) {
        // turn CR into a line break
        charToWrite = "<br>";
    } else if (char_int == 0xA) {
        // ignore LF since it will be preceded by CR
        charToWrite = "";
    }
    cons.innerHTML += charToWrite;
    forceConsoleDivDown();
}
