TODO before release:
================

1) More robust assembler
    - Support labels that are on their own line
    - Support hex immediates
    - Clean out empty lines instead of crashing
    - Support .data directives for users to load data to me

2) UI improvements
    - More data to user about ELF file

3) Integrate many of the new Long functions from utils.js into a custom copy
of closure-library

4) Minify ("compile") closure-library (only really need long.js and its deps)

5) Also minify everything else: https://github.com/mishoo/UglifyJS

6) supervisor / syscall / htif

7) run RV64-p tests - ALL PASSED

8) boot linux

9) Cross-browser testing / note for users


Not being implemented:
================

1) floating point (stick to soft-float)
