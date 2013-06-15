CC=riscv-gcc
PROGNAME=fib

all:	
	rm -rf $(PROGNAME)objdump
	rm -rf $(PROGNAME)
	rm -rf $(PROGNAME)elf
	$(CC) -fpic -o $(PROGNAME) $(PROGNAME).c
	riscv-objdump -d $(PROGNAME) > $(PROGNAME)objdump
	riscv-readelf -a $(PROGNAME) > $(PROGNAME)elf
run:
	riscv-isa-run pk $(PROGNAME)
clean:
	rm -rf $(PROGNAME)objdump
	rm -rf $(PROGNAME)
	rm -rf $(PROGNAME)elf
	
