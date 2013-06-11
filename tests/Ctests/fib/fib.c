#include<stdio.h>

unsigned int fastfib_v2(unsigned int n);

int main(){
    unsigned int a = 12; 
    return fastfib_v2(a);
}





// basic fib grabbed from 
// http://en.literateprograms.org/Fibonacci_numbers_(C)
unsigned int fastfib_v2 (unsigned int n){
    unsigned int n0 = 0;
    unsigned int n1 = 1;
    unsigned int naux;
    unsigned int i;
    if (n == 0){
        return 0;
    }
    for (i=0; i < n-1; i++) {
        naux = n1;
        n1 = n0 + n1;
        n0 = naux;
    }
    return n1;
}
