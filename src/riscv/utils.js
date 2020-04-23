// utils for the cpu

// Fill HTML register table for user 
function update_html_regtable(RISCV, tab) {
  for (var i = 0; i < RISCV.gen_reg.length; i++) {
    tab.rows[i + 1].cells[1].innerHTML = stringLongHex(RISCV.gen_reg[i]);
    tab.rows[i + 1].cells[2].innerHTML = longtoStringUnsigned(RISCV.gen_reg[i]).
        toString();
  }
}

function update_elf_proptable(elf, tab) {
  var elfprops = [
    'e_type', 'e_machine', 'e_version', 'e_entry', 'e_phoff',
    'e_shoff', 'e_flags', 'e_ehsize', 'e_phentsize', 'e_phnum',
    'e_shentsize', 'e_shnum', 'e_shstrndx'];

  var samplerow = '<tr><td>ELF Property</td><td>Value</td></tr>';
  var addinnerhtml = samplerow;
  for (var i = 0; i < elfprops.length; i++) {
    addinnerhtml += samplerow.replace('ELF Property', elfprops[i]).
        replace('Value', stringIntHex(elf[elfprops[i]]));
  }
  tab.innerHTML = addinnerhtml;
}

function update_debug_table(propsarr, tab) {
  var propnames = [
    'Last instruction executed addr.',
    'Last instruction executed',
    'Next instruction to execute addr.'];

  var samplerow = '<tr><td>Debug Stats</td><td>Value</td></tr>';
  var addinnerhtml = samplerow;

  for (var i = 0; i < propnames.length; i++) {
    addinnerhtml += samplerow.replace('Debug Stats', propnames[i]).
        replace('Value', propsarr[i]);
  }

  tab.innerHTML = addinnerhtml;
}

consoleFlashRegEx = new RegExp(String.fromCharCode(0x2589), 'g');
consoleFlashRegEx2 = new RegExp(String.fromCharCode(0x2581), 'g');

function flashConsoleCursor() {
  inner = document.getElementById('console').innerHTML;
  if (inner.slice(-1) != String.fromCharCode(0x2589) && inner.slice(-1) !=
      String.fromCharCode(0x2581)) {
    //inner = "$ " + String.fromCharCode(9609);
    inner = inner + String.fromCharCode(0x2589);
  } else if (inner.slice(-1) != String.fromCharCode(0x2589)) {
    //inner = "$ " + String.fromCharCode(9609);
    inner = inner.replace(consoleFlashRegEx2, '');
    inner = inner + String.fromCharCode(0x2589);
  } else if (inner.slice(-1) != String.fromCharCode(0x2581)) {
    //inner = "$ " + String.fromCharCode(9609);
    inner = inner.replace(consoleFlashRegEx, '');
    inner = inner + String.fromCharCode(0x2581);
  } else {
    inner = inner.replace(consoleFlashRegEx, '');
  }
  document.getElementById('console').innerHTML = inner;
  forceConsoleDivDown();
  setTimeout(flashConsoleCursor, 1000);
}

function forceConsoleDivDown() {
  var objDiv = document.getElementById('consoleBox');
  objDiv.scrollTop = objDiv.scrollHeight;
}

// Special Error class object that updates the HTML regtable before going up
// the stack
function RISCVError(message) {
  this.name = 'RISCVError';
  this.message = (message || '');
  this.e_type = 'RISCVError';
  console.log(stringIntHex(RISCV.pc));
  console.log(stringIntHex(RISCV.oldpc));
  //update_html_regtable(RISCV, tab);
}

// Make it a real Error
RISCVError.prototype = Error.prototype;

// Special Error class to represent Traps
// memaddr is for load/store misaligned/access faults
function RISCVTrap(message, memaddr) {
  this.name = 'RISCVTrap';
  this.message = (message || '');
  this.memaddr = memaddr;
  this.exceptionCode = TRAPS[this.message][0];
  this.interruptBit = TRAPS[this.message][1]; // by def
  this.e_type = 'RISCVTrap';
}

// Make it a real Error
RISCVTrap.prototype = Error.prototype;

// Converts both Numbers and Longs to hex (checks if typeof == "number" else
// assumes Long)
function stringIntHex(valin) {
  if ((typeof valin) === 'number') {
    return stringNumberHex(valin);
  } else {
    return stringLongHex(valin);
  }
}

// build proper hex rep of 64 bit quantity
// javascript does this incorrectly: it adds a 
// negative sign and messes up the rep instead of 
// just showing the bare rep
function stringLongHex(longin) {
  return '0x' + num_to_hexstr(longin.getHighBits()) +
      num_to_hexstr(longin.getLowBits());
}

// build proper hex rep of 32 bit quantity
// see note above about how toString(16) handles this by default
function stringNumberHex(numberin) {
  return '0x' + num_to_hexstr(numberin);
}

// helper for stringLongHex and stringNumberHex, does the 
// heavy lifting
function num_to_hexstr(numberin) {
  var numberupper = numberin & 0xF0000000;
  numberupper = numberupper >>> 28;
  var upperstr = numberupper.toString(16);
  var numberlower = numberin & 0x0FFFFFFF;
  var lowerstr = numberlower.toString(16);

  // lowerstr must be 7 hex digits. fix it in case we lost zeroes
  var addamt = 7 - lowerstr.length;
  for (var i = 0; i < addamt; i++) {
    lowerstr = '0' + lowerstr;
  }
  return (upperstr + lowerstr).toUpperCase();
}

// unsigned comparison of longs
// return true if long1 < long2
function long_less_than_unsigned(long1, long2) {
  var long1up = signed_to_unsigned(long1.getHighBits());
  var long2up = signed_to_unsigned(long2.getHighBits());

  if (long1up < long2up) {
    return true;
  } else if (long1up > long2up) {
    return false;
  } else {
    var long1down = signed_to_unsigned(long1.getLowBits());
    var long2down = signed_to_unsigned(long2.getLowBits());
    return (long1down < long2down);
  }
}

/* this 'converts' a signed number in javascript to an 
 * unsigned number. 
 * by default, javascript will take the 'value' stored in a number
 * and compare it (the definition of value is rather fluid). instead, 
 * we want to convert signed numbers by 
 * stripping out the MSB and adding 2^31 if the MSB is set (ie if the 
 * value is negative). Such a number can be represented by JS built in 
 * Numbers (64 bit float), and then comparing these values without performing
 * any bitwise ops on them will effectively do an unsigned comparison 
 */
function signed_to_unsigned(inputNum) {
  if ((inputNum & 0x80000000) == 0) {
    return inputNum;
  } else {
    return (inputNum & 0x7FFFFFFF) + Math.pow(2, 31);
  }
}

// Produce a string version of the Long interpreted as an unsigned 64 bit quantity
function longtoStringUnsigned(long1) {
  var MSB = long1.getHighBits() >>> 31;
  if (MSB === 0) {
    return long1.toString();
  }
  var mask = new Long(0xFFFFFFFF, 0x7FFFFFFF);
  var masked = long1.and(mask);
  var digitarr = masked.toString().split('');

  var twosixtythree = '9223372036854775808'.split('');

  twosixtythree = mapper(twosixtythree, parseInt);
  digitarr = mapper(digitarr, parseInt);

  var outputlen = Math.max(twosixtythree.length, digitarr.length);

  var fillzero;

  var zeroarr = function(inp) { return 0; };

  if (outputlen == twosixtythree.length) {
    fillzero = mapper(new Array(outputlen - digitarr.length), zeroarr);
    digitarr = fillzero.concat(digitarr);
  } else {
    fillzero = mapper(new Array(outputlen - twosixtythree.length), zeroarr);
    twosixtythree = fillzero.concat(twosixtythree);
  }

  var output = mapper(new Array(outputlen), zeroarr);
  for (var b = 0; b < outputlen - 1; b++) {
    var a = outputlen - 1 - b;
    var res = twosixtythree[a] + digitarr[a] + output[a];
    output[a] = res % 10;
    output[a - 1] = Math.floor(res / 10);
  }
  output[0] += twosixtythree[0] + digitarr[0];

  return output.join().replace(/,/g, '');
}

function mapper(arr, fn) {
  for (var a = 0; a < arr.length; a++) {
    arr[a] = fn(arr[a]);
  }
  return arr;
}
