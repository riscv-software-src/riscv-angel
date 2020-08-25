sed 's/inst.get_opcode()/(raw \& 0x7F)/g' < inst_src.js > inst.js
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
sed 's/inst.get_rd()/((raw >>> 7) \& 0x1F)/g' -i inst.js
sed 's/inst.get_rs1()/((raw >>> 15) \& 0x1F)/g' -i inst.js
sed 's/inst.get_rs2()/((raw >>> 20) \& 0x1F)/g' -i inst.js
sed 's/inst.get_funct3()/((raw >>> 12) \& 0x7)/g' -i inst.js
sed 's/inst.get_funct7()/((raw >>> 25) \& 0x7F)/g' -i inst.js
sed 's/inst.get_CSR_imm()/((raw >>> 20))/g' -i inst.js
sed 's/inst.get_I_imm()/((raw >> 20))/g' -i inst.js
sed 's/inst.get_S_imm()/(((raw >> 20) \& 0xFFFFFFE0) | ((raw >>> 7) \& 0x0000001F))/g' -i inst.js
sed 's/inst.get_B_imm()/(((((raw >> 20) \& 0xFFFFFFE0) | ((raw >>> 7) \& 0x0000001F)) \& 0xFFFFF7FE) | ((   (((raw >> 20) \& 0xFFFFFFE0) | ((raw >>> 7) \& 0x0000001F))           \& 0x00000001) << 11))/g' -i inst.js
sed 's/inst.get_U_imm()/((raw \& 0xFFFFF000))/g' -i inst.js
sed 's/inst.get_J_imm()/(((raw >> 20) \& 0xFFF007FE) | ((raw >>> 9) \& 0x00000800) | (raw \& 0x000FF000))/g' -i inst.js

else 

sed -i'' -e 's/inst.get_rd()/((raw >>> 7) \& 0x1F)/g'  inst.js
sed -i'' -e 's/inst.get_rs1()/((raw >>> 15) \& 0x1F)/g'   inst.js 
sed -i'' -e 's/inst.get_rs2()/((raw >>> 20) \& 0x1F)/g'   inst.js
sed -i'' -e 's/inst.get_funct3()/((raw >>> 12) \& 0x7)/g'  inst.js
sed -i'' -e 's/inst.get_funct7()/((raw >>> 25) \& 0x7F)/g'  inst.js
sed -i'' -e 's/inst.get_CSR_imm()/((raw >>> 20))/g'   inst.js
sed -i'' -e 's/inst.get_I_imm()/((raw >> 20))/g'  ./inst.js
sed -i'' -e 's/inst.get_S_imm()/(((raw >> 20) \& 0xFFFFFFE0) | ((raw >>> 7) \& 0x0000001F))/g'  ./inst.js
sed -i'' -e 's/inst.get_B_imm()/(((((raw >> 20) \& 0xFFFFFFE0) | ((raw >>> 7) \& 0x0000001F)) \& 0xFFFFF7FE) | ((   (((raw >> 20) \& 0xFFFFFFE0) | ((raw >>> 7) \& 0x0000001F))           \& 0x00000001) << 11))/g'  ./inst.js
sed -i'' -e 's/inst.get_U_imm()/((raw \& 0xFFFFF000))/g'  ./inst.js
sed -i'' -e 's/inst.get_J_imm()/(((raw >> 20) \& 0xFFF007FE) | ((raw >>> 9) \& 0x00000800) | (raw \& 0x000FF000))/g'  ./inst.js
rm inst.js-e
fi 

echo '0a
//################################################################################
//# DO NOT MODIFY THIS FILE, CHANGES WILL BE OVERWRITTEN                         #
//# DO NOT MODIFY THIS FILE, CHANGES WILL BE OVERWRITTEN                         #
//# DO NOT MODIFY THIS FILE, CHANGES WILL BE OVERWRITTEN                         #
//# DO NOT MODIFY THIS FILE, CHANGES WILL BE OVERWRITTEN                         #
//################################################################################
.
w' | ed inst.js
