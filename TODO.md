TODO before release:
================

1) More robust assembler
    - Support labels that are on their own line
    - Support hex immediates
    - Clean out empty lines instead of crashing
    - Support .data directives for users to load data to me

2) UI improvements
    - More data to user about ELF file

3) Also minify everything else: https://github.com/mishoo/UglifyJS (measure perf improvement?)

4) supervisor / syscall / htif

5) run RV64-p tests - ALL PASSED

6) boot linux

7) Cross-browser testing / note for users


Not being implemented:
================

1) floating point (stick to soft-float)
