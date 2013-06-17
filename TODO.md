TODO before release:
================

1) More robust assembler
    - Support labels that are on their own line
    - Support hex immediates
    - Clean out empty lines instead of crashing
    - Support .data directives for users to load data to me

2) Finish RV64 mul/div instructions

3) UI improvements
    - More data to user about ELF file

4) Integrate many of the new Long functions from utils.js into a custom copy
of closure-library

5) Minify ("compile") closure-library (only really need long.js and its deps)

6) supervisor / syscall / htif

7) run RV64-p tests

8) boot linux

9) Cross-browser testing / note for users


Not being implemented:
================

1) floating point (stick to soft-float)
