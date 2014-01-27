// simulated memory management unit,
// needs to intercept all memory loading calls

// CONSTANTS HERE
var LEVELS = 3;
var PTIDXBITS = new Long(0xA, 0x0);
var PGSHIFT = new Long(0xD, 0x0);
var PGSIZE = (new Long(0x1, 0x0)).shiftLeft(PGSHIFT.getLowBits());
var VPN_BITS = new Long(30, 0x0);
var PPN_BITS = new Long(51, 0x0);
var VA_BITS = new Long(43, 0x0);

var PTE_V = new Long(0x1, 0x0);
var PTE_T = new Long(0x2, 0x0);
var PTE_G = new Long(0x4, 0x0);
var PTE_UR = new Long(0x8, 0x0);
var PTE_UW = new Long(0x10, 0x0);
var PTE_UX = new Long(0x20, 0x0);
var PTE_SR = new Long(0x40, 0x0);
var PTE_SW = new Long(0x80, 0x0);
var PTE_SX = new Long(0x100, 0x0);

// [todo] - simple TLB (try just a dictionary)

var TLB = {};
var TLBON = false;

// performs address translation
// addr MUST BE A LONG
function translate(addr, access_type) {
    // decide which trap to throw in case
    var throwTrap;
    if (access_type == CONSTS.READ) {
        throwTrap = "Load Access Fault";
    } else if (access_type == CONSTS.WRITE) {
        throwTrap = "Store Access Fault";
    } else if (access_type == CONSTS.EXEC) {
        throwTrap = "Instruction Access Fault";
    } else {
        throw new RISCVError("Invalid access_type in translate");
    } 
    
    var origaddr = addr;

    if (TLBON && TLB.hasOwnProperty(addr)) {
        // return value from TLB
        return TLB[addr];
    }

    //addr = signExtLT32_64(addr, 31);

    var pte = walk(addr);

    var mode = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]];

    // permissions check
    if (mode & SR["SR_S"] != 0) {
        // we are in supervisor mode
        if (access_type == CONSTS.READ && (pte.and(PTE_SR)).equals(new Long(0x0, 0x0))) {
            throw new RISCVTrap(throwTrap, addr.getLowBits());
        } else if (access_type == CONSTS.WRITE && (pte.and(PTE_SW)).equals(new Long(0x0, 0x0))) {
            throw new RISCVTrap(throwTrap, addr.getLowBits());
        } else if (access_type == CONSTS.EXEC && (pte.and(PTE_SX)).equals(new Long(0x0, 0x0))) {
            throw new RISCVTrap(throwTrap, addr.getLowBits());
        } else {
            // do nothing 
        }
    } else { 
        // we are in user mode
        if (access_type == CONSTS.READ && (pte.and(PTE_UR)).equals(new Long(0x0, 0x0))) {
            throw new RISCVTrap(throwTrap, addr.getLowBits());
        } else if (access_type == CONSTS.WRITE && (pte.and(PTE_UW)).equals(new Long(0x0, 0x0))) {
            throw new RISCVTrap(throwTrap, addr.getLowBits());
        } else if (access_type == CONSTS.EXEC && (pte.and(PTE_UX)).equals(new Long(0x0, 0x0))) {
            throw new RISCVTrap(throwTrap, addr.getLowBits());
        } else {
            // do nothing 
        }
    }

    var pgoff = addr.and(PGSIZE.subtract(new Long(0x1, 0x0)));
    var pgbase = (pte.shiftRightUnsigned(PGSHIFT.getLowBits())).shiftLeft(PGSHIFT.getLowBits());
    var paddr = pgbase.add(pgoff);
   
    // [todo] - populate TLB
    if (TLBON) {
        TLB[origaddr] = paddr.getLowBits();
    }

    return paddr.getLowBits();    
}


// does the page table walk only - no permission checks here
// vaddr is Long
function walk(vaddr) {
    // [todo] - add additional checking from the top of mmu.cc's walk here later

    var pte = new Long(0x0, 0x0);

    var ptbr = RISCV.priv_reg[PCR["CSR_PTBR"]["num"]]; // this is a Long
    var ptshift = new Long((LEVELS-1), 0x0).multiply(PTIDXBITS);

    // main walk for loop
    for (var i = 0; i < LEVELS; ptshift = ptshift.subtract(PTIDXBITS)) {
        var idx = (vaddr.shiftRightUnsigned((PGSHIFT.add(ptshift)).getLowBits())).and(((new Long(0x1, 0x0)).shiftLeft(PTIDXBITS.getLowBits())).subtract(new Long(0x1, 0x0)));
        var pte_addr = ptbr.add(idx.multiply(new Long(0x8, 0x0)));
        var pt_data = RISCV.load_double_from_mem(pte_addr, false);
        if ((pt_data.and(PTE_V)).equals(new Long(0x0, 0x0))) {
            // INVALID MAPPING
            break;
        } else if ((pt_data.and(PTE_T)).notEquals(new Long(0x0, 0x0))) {
            // Next level of page table
            ptbr = (pt_data.shiftRightUnsigned(PGSHIFT.getLowBits())).shiftLeft(PGSHIFT.getLowBits());
        } else {
            // The actual pte
            var vpn = vaddr.shiftRightUnsigned(PGSHIFT.getLowBits());
            pt_data = pt_data.or((vpn.and(((new Long(0x1, 0x0)).shiftLeft(ptshift.getLowBits())).subtract(new Long(0x1, 0x0)))).shiftLeft(PGSHIFT.getLowBits()));

            //supposed to be a mem bounds fault check here but ignore for now:
            pte = pt_data;
            break;
        }
        i += 1;
    }
    return pte;
}
