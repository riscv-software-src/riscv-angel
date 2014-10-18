// simulated memory management unit,
// needs to intercept all memory loading calls

// CONSTANTS HERE
var PTE_V = 0x1;
var PTE_T = 0x2;
var PTE_G = new Long(0x4, 0x0);
var PTE_UR = 0x8;
var PTE_UW = 0x10;
var PTE_UX = 0x20;
var PTE_SR = 0x40;
var PTE_SW = 0x80;
var PTE_SX = 0x100;

// [todo] - simple TLB (try just a dictionary)

var TLB = [];
//var TLBON = true;

//var TLBcount = 0;
//var NONcount = 0;
//var Totcount = 0;

// performs address translation
// addr MUST BE A LONG
function translate(addr, access_type) {
    //Totcount += 1;
    if ((addr.getLowBitsUnsigned() & 0xFF000000) == 0x55000000) {
        addr = new Long(addr.getLowBitsUnsigned(), 0x155);
    }

    var origaddr = addr.getLowBitsUnsigned();
    var origaddrVPN = origaddr >>> 13;

    var pte;
    var paddr;
    var pgoff;
    var pgbase;

    if (TLB[origaddrVPN]) {
        // return value from TLB
        //TLBcount += 1;
        pte = TLB[origaddrVPN];
    } else {
        //NONcount += 1;
        pte = walk(addr).getLowBitsUnsigned();
        TLB[origaddrVPN] = pte;
    }

   paddr = (pte & 0xFFFFE000) | (origaddr & 0x1FFF);
   var mode = RISCV.priv_reg[0x50A];

    // permissions check
    if (mode & 0x1) {
        // we are in supervisor mode
        if (access_type == CONSTS.EXEC && (pte & PTE_SX)) {
            // "short" the fastest path (valid instruction)
            return paddr;
        }
        if (access_type == CONSTS.EXEC && !(pte & PTE_SX)) {
            RISCV.excpTrigg = new RISCVTrap("Instruction Access Fault", addr);
        } else if (access_type == CONSTS.READ && !(pte & PTE_SR)) {
            RISCV.excpTrigg =  new RISCVTrap("Load Access Fault", addr);
        } else if (access_type == CONSTS.WRITE && !(pte & PTE_SW)) {
            RISCV.excpTrigg = new RISCVTrap("Store Access Fault", addr);
        } 
    } else { 
        if (access_type == CONSTS.EXEC && (pte & PTE_UX)) {
            // "short" the fastest path (valid instruction)
            return paddr;
        }
        if (access_type == CONSTS.EXEC && !(pte & PTE_UX)) {
            RISCV.excpTrigg =  new RISCVTrap("Instruction Access Fault", addr);
        } else if (access_type == CONSTS.READ && !(pte & PTE_UR)) {
            RISCV.excpTrigg =  new RISCVTrap("Load Access Fault", addr);
        } else if (access_type == CONSTS.WRITE && !(pte & PTE_UW)) {
            RISCV.excpTrigg = new RISCVTrap("Store Access Fault", addr);
        }
    }

    return paddr;    
}

var LONG3FF = new Long(0x3FF, 0x0);
// does the page table walk only - no permission checks here
// vaddr is Long
function walk(vaddr) {
    // [todo] - add additional checking from the top of mmu.cc's walk here later

//    var pte = new Long(0x0, 0x0);
    var ptbr = RISCV.priv_reg[PCR["CSR_PTBR"]["num"]]; // this is a Long

    // main walk for loop
    var idx = (vaddr.shiftRightUnsigned((33))).and(LONG3FF);
    var pte_addr = ptbr.add(idx.shiftLeft(3));
    var pt_data = RISCV.load_double_from_mem(pte_addr, false);
    var pt_data_low = pt_data.getLowBitsUnsigned();
    if (pt_data_low & PTE_V == 0) {
        // INVALID MAPPING
        return Long.ZERO;
    } else if ((pt_data_low & PTE_T) != 0) {
        // Next level of page table
        ptbr = (pt_data.shiftRightUnsigned(0xD)).shiftLeft(0xD);
    } else {
        // The actual pte
        var vpn = vaddr.shiftRightUnsigned(0xD);
        pt_data = pt_data.or((vpn.and(((Long.ONE).shiftLeft(20)).subtract(Long.ONE))).shiftLeft(0xD));

        //supposed to be a mem bounds fault check here but ignore for now:
        return pt_data;
    }
    var idx = (vaddr.shiftRightUnsigned((23))).and(LONG3FF);
    var pte_addr = ptbr.add(idx.shiftLeft(3));
    var pt_data = RISCV.load_double_from_mem(pte_addr, false);
    var pt_data_low = pt_data.getLowBitsUnsigned();
    if (pt_data_low & PTE_V == 0) {
        // INVALID MAPPING
        return Long.ZERO;
    } else if ((pt_data_low & PTE_T) != 0) {
        // Next level of page table
        ptbr = (pt_data.shiftRightUnsigned(0xD)).shiftLeft(0xD);
    } else {
        // The actual pte
        var vpn = vaddr.shiftRightUnsigned(0xD);
        pt_data = pt_data.or((vpn.and(((Long.ONE).shiftLeft(10)).subtract(Long.ONE))).shiftLeft(0xD));

        //supposed to be a mem bounds fault check here but ignore for now:
        return pt_data;
    }
    var idx = (vaddr.shiftRightUnsigned(13)).and(LONG3FF);
    var pte_addr = ptbr.add(idx.shiftLeft(3));
    var pt_data = RISCV.load_double_from_mem(pte_addr, false);
    var pt_data_low = pt_data.getLowBitsUnsigned();
    if (pt_data_low & PTE_V == 0) {
        // INVALID MAPPING
        return Long.ZERO;
    } else if ((pt_data_low & PTE_T) != 0) {
        // Next level of page table
        ptbr = (pt_data.shiftRightUnsigned(0xD)).shiftLeft(0xD);
    } else {
        // The actual pte
        //supposed to be a mem bounds fault check here but ignore for now:
        return pt_data;
    }
}
