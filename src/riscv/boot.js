term = new Terminal({
  cols: 129,
  rows: 35,
  cursorBlink: true,
  useStyle: true,
});

function runWorker() {
  myWorker = new Worker('webworker.js');
  myWorker.onmessage = function(oEvent) {
    if (oEvent.data.type == 't') {
      // handle term event
      //            write_to_term(oEvent.data.d);
      term.write(String.fromCharCode(oEvent.data.d));
    }
  };
}

function prepTerm() {
  term.open(document.getElementById('consoleBox'));
  term.handler = function a(indata2) {
    myWorker.postMessage({type: 'u', inp: indata2});
  };
}

prepTerm();
runWorker();
