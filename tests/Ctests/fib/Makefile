CC=riscv-gcc

all:	
	rm -rf fibobjdump
	rm -rf fib
	rm -rf fibelf
	$(CC) -fpic -m32 -o fib fib.c
	riscv-objdump -d fib > fibobjdump
	riscv-readelf -a fib > fibelf
run:
	riscv-isa-run pk fib
clean:
	rm -rf fib
