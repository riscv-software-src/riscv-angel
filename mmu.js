// simulated memory management unit,
// needs to intercept all memory loading calls

// CONSTANTS HERE
var LEVELS = 3;
var PTIDXBITS = 0xA;
var PGSHIFT = 0xD;
var PGSIZE = (new Long(0x1, 0x0)).shiftLeft(PGSHIFT);
var OFFBITS = (new Long(0x1FFF, 0x0));
var VPN_BITS = new Long(30, 0x0);
var PPN_BITS = new Long(51, 0x0);
var VA_BITS = new Long(43, 0x0);

var PTE_V = new Long(0x1, 0x0);
var PTE_T = new Long(0x2, 0x0);
var PTE_G = new Long(0x4, 0x0);
var PTE_UR = 0x8;
var PTE_UW = 0x10;
var PTE_UX = 0x20;
var PTE_SR = 0x40;
var PTE_SW = 0x80;
var PTE_SX = 0x100;

// [todo] - simple TLB (try just a dictionary)

var TLB = {};
var TLBON = true;

// performs address translation
// addr MUST BE A LONG
function translate(addr, access_type) {
    
    var origaddr = addr.getLowBitsUnsigned();

    if (TLBON && TLB.hasOwnProperty(origaddr)) {
        // return value from TLB
        var pte = TLB[origaddr][0];
        var paddr = TLB[origaddr][1];
    } else {
        var pte = walk(addr);
        var pgoff = origaddr & 0x1FFF; //.and(OFFBITS);
        var pgbase = pte.getLowBitsUnsigned() & 0xFFFFE000;
        var paddr = pgbase | pgoff;
        pte = pte.getLowBits();
        TLB[origaddr] = [pte, paddr];
    }

    var mode = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]];

    // permissions check
    if (mode & SR["SR_S"] != 0) {
        // we are in supervisor mode
        if (access_type == CONSTS.READ && !(pte & PTE_SR)) {
            throw new RISCVTrap("Load Access Fault", addr);
        } else if (access_type == CONSTS.WRITE && !(pte & PTE_SW)) {
            throw new RISCVTrap("Store Access Fault", addr);
        } else if (access_type == CONSTS.EXEC && !(pte & PTE_SX)) {
            throw new RISCVTrap("Instruction Access Fault", addr);
        } 
    } else { 
        // we are in user mode
        if (access_type == CONSTS.READ && !(pte & PTE_UR)) {
            throw new RISCVTrap("Load Access Fault", addr);
        } else if (access_type == CONSTS.WRITE && !(pte & PTE_UW)) {
            throw new RISCVTrap("Store Access Fault", addr);
        } else if (access_type == CONSTS.EXEC && !(pte & PTE_UX)) {
            throw new RISCVTrap("Instruction Access Fault", addr);
        } 
    }

    return paddr;    
}


// does the page table walk only - no permission checks here
// vaddr is Long
function walk(vaddr) {
    // [todo] - add additional checking from the top of mmu.cc's walk here later

    var pte = new Long(0x0, 0x0);

    var ptbr = RISCV.priv_reg[PCR["CSR_PTBR"]["num"]]; // this is a Long
    var ptshift = 20;

    // main walk for loop
    for (var i = 0; i < LEVELS; ptshift = ptshift - PTIDXBITS) {
        var idx = (vaddr.shiftRightUnsigned((PGSHIFT + ptshift))).and(new Long(0x3FF, 0x0));
        var pte_addr = ptbr.add(idx.shiftLeft(3));
        var pt_data = RISCV.load_double_from_mem(pte_addr, false);
        if ((pt_data.and(PTE_V)).equals(new Long(0x0, 0x0))) {
            // INVALID MAPPING
            break;
        } else if ((pt_data.and(PTE_T)).notEquals(new Long(0x0, 0x0))) {
            // Next level of page table
            ptbr = (pt_data.shiftRightUnsigned(PGSHIFT)).shiftLeft(PGSHIFT);
        } else {
            // The actual pte
            var vpn = vaddr.shiftRightUnsigned(PGSHIFT);
            pt_data = pt_data.or((vpn.and(((new Long(0x1, 0x0)).shiftLeft(ptshift)).subtract(new Long(0x1, 0x0)))).shiftLeft(PGSHIFT));

            //supposed to be a mem bounds fault check here but ignore for now:
            pte = pt_data;
            break;
        }
        i += 1;
    }
    return pte;
}
