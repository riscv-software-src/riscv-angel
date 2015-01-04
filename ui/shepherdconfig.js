(function() {
  var completeShepherd, init, setupShepherd;

  init = function() {
    return setupShepherd();
  };

  setupShepherd = function() {
    var shepherd;
    shepherd = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-element shepherd-open shepherd-theme-arrows'
      }
    });
    shepherd.addStep('welcome', {
      title: '<strong>Welcome to ANGEL!</strong>',
      text: ['ANGEL is a JavaScript simulator for the <a href="http://riscv.org">RISC-V architecture</a> <br>that boots <a href="http://github.com/ucb-bar/riscv-linux">Linux</a> inside your browser.', 'Click Next for a tour or hit Close to use ANGEL immediately'],
      attachTo: '#ANGELtitle bottom',
      classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
      buttons: [
        {
          text: 'Close',
          classes: 'shepherd-button-secondary',
          action: function() {
            completeShepherd();

            term.open(document.getElementById("consoleBox"));
            term.handler = (function a (indata2) {
                myWorker.postMessage({"type": "u", "inp": indata2});
            });


            return shepherd.hide();
          }
        }, {
          text: 'Next',
          action: shepherd.next,
          classes: 'shepherd-button-example-primary'
        }
      ]
    });
    shepherd.addStep('including', {
      title: '<strong>The Boot Process</strong>',
      text: ['Once you hit "Boot Linux" to the left, ANGEL will download <br> a 3MB linux kernel for the system to boot. This image <br> is then loaded into the memory of our simulated RISC-V processor.', 'Processor Specs:', '<ul><li>Implements RV64IMA - A 64 bit RISC-V processor <br> with the base integer ISA (I), the Multiplication and <br> Division Extension (M), and the standard Atomic Extension (A)</li><li>Runs ~13.5 Million Instructions Per Second <br>(Benchmarked in Chrome)</li><li>10 MiB Memory</li></ul>'],
      attachTo: '#kernelDown bottom',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Next',
          action: shepherd.next
        }
      ]
    });
    shepherd.addStep('example', {
      title: '<strong>What\'re you waiting for?</strong>',
      text: ['Hit the "Boot Linux" button to the left to get started!', 'The boot process should take about 3 seconds on <br> a modern system once the kernel image download finishes.', 'You\'ll know that boot is complete when you see a <br> <code>/ #_ </code> &nbsp; prompt preceeding the flashing cursor.', 'This is an <a href="http://en.wikipedia.org/wiki/Almquist_shell">ash-shell</a> prompt where you can type in most<br> standard linux commands included with <a href="http://www.busybox.net">BusyBox</a>.'],
      attachTo: '#bootButton right',
      buttons: [
        {
          text: 'Back',
          classes: 'shepherd-button-secondary',
          action: shepherd.back
        }, {
          text: 'Close',
          action: function() {
            completeShepherd();

            term.open(document.getElementById("consoleBox"));
            term.handler = (function a (indata2) {
                myWorker.postMessage({"type": "u", "inp": indata2});
            });




            return shepherd.next();
          }

        }
      ]
    });
    return shepherd.start();
  };

  completeShepherd = function() {
    return $('body').addClass('shepherd-completed');
  };

  $(init);

}).call(this);
