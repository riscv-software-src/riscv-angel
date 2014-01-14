// simulated memory management unit,
// needs to intercept all memory loading calls



    // CONSTANTS HERE
    var LEVELS = new Long(0x3, 0x0);
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


/*




// object with attached helper methods for a page table entry or virtual address
// get_pgoff is for virtual address, all others in the 12-0 range are for pt entry
function page_table_entry_addr(entryin) {
    this.entry = entryin; // entryin MUST be a long



    // [todo] - fix this with 
    // https://github.com/ucb-bar/riscv-pk/blob/186ae3cc353fa3115d4ee0c9fcb18d8b2370c68c/pk/pcr.h



    function get_V() {
        return this.entry.getLowBits() & 0x1;
    }

    function get_T() {
        return (this.entry.getLowBits() >> 1) & 0x1;
    }

    function get_G() {
        return (this.entry.getLowBits() >> 2) & 0x1;
    }

    function get_UR() {
        return (this.entry.getLowBits() >> 3) & 0x1;
    }

    function get_UW() {
        return (this.entry.getLowBits() >> 4) & 0x1;
    }

    function get_UX() {
        return (this.entry.getLowBits() >> 5) & 0x1;
    }

    function get_SR() {
        return (this.entry.getLowBits() >> 6) & 0x1;
    }

    function get_SW() {
        return (this.entry.getLowBits() >> 7) & 0x1;
    }

    function get_SX() {
        return (this.entry.getLowBits() >> 8) & 0x1;
    }

    // FIXED ABOVE

    function get_ppn0() {
        return (this.entry.getLowBits() >> 13) & 0x3FF;
    }

    function set_ppn0(val) {
        var update32 = this.entry.getLowBits();
        update32 = update32 & (~(0x3FF << 13));
        update32 = update32 | (val << 13);
        this.entry = new Long(update32, this.entry.getHighBits());
    }

    function get_ppn1() {
        return ((this.entry.getLowBits() >> 23) & 0x1FF) | ((this.entry.getHighBits() & 0x1) << 9);
    }

    function set_ppn1(val) {
        var updatehigh32 = this.entry.getHighBits();
        var updatelow32 = this.entry.getLowBits();
        updatehigh32 = updatehigh32 & (~(0x1));
        updatehigh32 = updatehigh32 | ((val >> 9) & 0x1);
        updatelow32 = updatelow32 & (~(0x1FF << 23));
        updatelow32 = updatelow32 | ((val & 0x1FF) << 23);
        this.entry = new Long(updatelow32, updatehigh32);
    }

    function get_ppn2() {
        return ((this.entry.getHighBits() >> 1) & 0x7FFFFFFF);
    }

    function set_ppn2(val) {
        var update32 = this.entry.getHighBits();
        update32 = update32 & (~0x1);
        update32 = update32 | (val << 1);
        this.entry = new Long(this.entry.getLowBits(), update32);
    }

    function get_pgoff() {
        return ((this.entry.getLowBits) & 0x1FFF)
    }

    function get_vpn0() {
        // gets same bits as ppn0, just for clarity in code
        return this.get_ppn0();
    }

    function get_vpn1() {
        // gets same bits as ppn1, just for clarity in code
        return this.get_ppn1();
    }

    function get_vpn2() {
        // gets same bits as ppn2, just for clarity in code
        return this.get_ppn2();
    }

    function get_ppn() {
        return this.entry.shiftRightUnsigned(13);
    }

    this.get_V = get_V;
    this.get_T = get_T;
    this.get_G = get_G;
    this.get_UR = get_UR;
    this.get_UW = get_UW;
    this.get_UX = get_UX;
    this.get_SR = get_SR;
    this.get_SW = get_SW;
    this.get_SX = get_SX;
    this.get_ppn0 = get_ppn0;
    this.set_ppn0 = set_ppn0;
    this.get_ppn1 = get_ppn1;
    this.set_ppn1 = set_ppn1;
    this.get_ppn2 = get_ppn2;
    this.set_ppn2 = set_ppn2;
    this.get_pgoff = get_pgoff;
    this.get_vpn0 = get_vpn0;
    this.get_vpn1 = get_vpn1;
    this.get_vpn2 = get_vpn2;
    this.get_ppn = get_ppn;
}
*/

// performs address translation
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

    addr = new Long(addr, 0x0);

    var pte = walk(addr);

    var mode = RISCV.priv_reg[PCR["CSR_STATUS"]["num"]];

    console.log("page table entry " + stringIntHex(pte));

/*    // validity check does not belong here
    if ((pte.and(PTE_V)).equals(new Long(0x0, 0x0))) {
        console.log("fault in validity check");
        throw new RISCVTrap(throwTrap, addr.getLowBits());
    }
*/


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
    
    return paddr.getLowBits();    
}


// does the page table walk only - no permission checks here
// vaddr is Long
function walk(vaddr) {
    // [todo] - add additional checking from the top of mmu.cc's walk here later

    var pte = new Long(0x0, 0x0);

    var ptbr = RISCV.priv_reg[PCR["CSR_PTBR"]["num"]]; // this is a Long
   
    var ptshift = (LEVELS.subtract(new Long(0x1, 0x0))).multiply(PTIDXBITS);

    console.log("translating vaddr: " + stringIntHex(vaddr));

    // main walk for loop
    for (var i = 0; i < LEVELS.getLowBits(); ptshift = ptshift.subtract(PTIDXBITS)) {
        console.log("running translation loop" + i);
        var idx = (vaddr.shiftRightUnsigned((PGSHIFT.add(ptshift)).getLowBits())).and(((new Long(0x1, 0x0)).shiftLeft(PTIDXBITS.getLowBits())).subtract(new Long(0x1, 0x0)));
        console.log("pt index " + stringIntHex(idx));
        var pte_addr = ptbr.add(idx.multiply(new Long(0x8, 0x0)));
        
        console.log("loading pte from " + stringIntHex(pte_addr));

        var pt_data = RISCV.load_double_from_mem(pte_addr.getLowBits(), false);

        console.log("pt_data " + stringIntHex(pt_data));

        if ((pt_data.and(PTE_V)).equals(new Long(0x0, 0x0))) {
            // INVALID MAPPING
            console.log("INVALID MAPPING");
            break;
        } else if ((pt_data.and(PTE_T)).notEquals(new Long(0x0, 0x0))) {
            // Next level of page table
            console.log("MOVING TO NEXT T");
            console.log(stringIntHex(pt_data));
            console.log(stringIntHex(PTE_T));
            console.log(stringIntHex(pt_data.and(PTE_T)));
            ptbr = (pt_data.shiftRightUnsigned(PGSHIFT.getLowBits())).shiftLeft(PGSHIFT.getLowBits());
        } else {
            // The actual pte
            var vpn = vaddr.shiftRightUnsigned(PGSHIFT.getLowBits());
            console.log("right before or " + stringIntHex(pt_data));
            pt_data = pt_data.or((vpn.and(((new Long(0x1, 0x0)).shiftLeft(ptshift.getLowBits())).subtract(new Long(0x1, 0x0)))).shiftLeft(PGSHIFT.getLowBits()));

            //supposed to be a mem bounds fault check here but ignore for now:
            pte = pt_data;
            break;
        }
        i += 1;
    }
    return pte;
}
