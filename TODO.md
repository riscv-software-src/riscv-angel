TODO before release:
================

3) Cross-browser testing / note for users

4) Performance Testing / Optimization 

Chrome profiler: https://developers.google.com/chrome-developer-tools/docs/commandline-api?hl=fr-FR#profilename

5) More robust assembler
    - Support labels that are on their own line
    - Support hex immediates
    - Clean out empty lines instead of crashing
    - Support .data directives for users to load data to me

Not being implemented:
================

1) floating point (stick to soft-float)

Maybe Later:
============

1) Integrate many of the new Long functions from utils.js into a custom copy
of closure-library

Milestones / Done:
==================
0) Implement Traps / supervisor / syscall / htif

1) Implement VM/MMU

2) Boot Linux

1) RV64ui-p All Tests Pass
