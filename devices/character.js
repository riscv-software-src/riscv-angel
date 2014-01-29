// character device (terminal) for ANGEL

function init_term() {
    cons = document.getElementById("console");
}

ignoreThree = 0;

// input char_int is int rep of character
function write_to_term(char_int) {
    if (ignoreThree > 0) {
        ignoreThree--;
        return;
    }
    var charToWrite = String.fromCharCode(char_int);
    if (charToWrite === " ") {
        charToWrite = "&nbsp;";
    } else if (char_int == 0xD) {
        // turn CR into a line break
        if (cons.innerHTML.slice(-4) === "<br>") {
            charToWrite = "";
        } else {
            charToWrite = "<br>";
        }
    } else if (char_int == 0xA) {
        // ignore LF since it will be preceded by CR
        charToWrite = "";
    } else if (char_int == 0x8) {
        // backspace
        ignoreThree = 3;
        if (cons.innerHTML.slice(-6) == "&nbsp;") {
            cons.innerHTML = cons.innerHTML.slice(0, -6);
        } else {
            cons.innerHTML = cons.innerHTML.slice(0, -1);
        }
        forceConsoleDivDown();
        return;
    }
    cons.innerHTML += charToWrite;
    forceConsoleDivDown();
}
