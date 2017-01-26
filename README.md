riscv-angel
=====

ANGEL is a Javascript RISC-V ISA (RV64) Simulator that runs riscv-linux with BusyBox.

Check out the demo running at: https://riscv.org/software-tools/riscv-angel/

## *NOTE:* 

ANGEL is not under active development - it implements old draft versions of the RISC-V specs (~late 2014)

## Building/Running locally

Run `make`, make sure you have GNU sed.

Start a webserver in the angel directory, e.g.

    python -m SimpleHTTPServer 8000
    
Visit localhost:8000/run.html in your browser.
