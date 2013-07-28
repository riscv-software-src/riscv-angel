// simulated memory management unit,
// needs to intercept all memory loading calls

// object with attached helper methods for a page table entry or virtual address
// get_pgoff is for virtual address, all others in the 12-0 range are for pt entry
function page_table_entry_addr(entryin) {
    this.entry = entryin; // entryin MUST be a long

    function get_T() {
        return this.entry.getLowBits() & 0x1;
    }

    function get_E() {
        return (this.entry.getLowBits() >> 1) & 0x1;
    }

    function get_R() {
        return (this.entry.getLowBits() >> 2) & 0x1;
    }

    function get_D() {
        return (this.entry.getLowBits() >> 3) & 0x1;
    }

    function get_UX() {
        return (this.entry.getLowBits() >> 4) & 0x1;
    }

    function get_UW() {
        return (this.entry.getLowBits() >> 5) & 0x1;
    }

    function get_UR() {
        return (this.entry.getLowBits() >> 6) & 0x1;
    }

    function get_SX() {
        return (this.entry.getLowBits() >> 7) & 0x1;
    }

    function get_SW() {
        return (this.entry.getLowBits() >> 8) & 0x1;
    }

    function get_SR() {
        return (this.entry.getLowBits() >> 9) & 0x1;
    }

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

    this.get_T = get_T;
    this.get_E = get_E;
    this.get_R = get_R;
    this.get_D = get_D;
    this.get_UX = get_UX;
    this.get_UW = get_UW;
    this.get_UR = get_UR;
    this.get_SX = get_SX;
    this.get_SW = get_SW;
    this.get_SR = get_SR;
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
}


// performs address translation
function translate(addr, access_type) {
    // addr is address
    // access_type: indicates 0 for read, 1 for write, 2 for exec
    addr = new page_table_entry_addr(addr);
    var ptbr = RISCV.priv_reg[7]; // hardcoded update later    

    var pte2 = RISCV.load_double_from_mem((ptbr.add(new Long(addr.get_vpn2()*8, 0x0))).getLowBits(), false);
    pte2 = new page_table_entry_addr(pte2);
    
    if (pte2.e != 0x1) {
        throw new RISCVError("Address Error"); // need to update later
    }

    // TODO: check permission bits
    permission_check(pte2, access_type);
 
    var baseaddr1 = pte2.get_ppn().shiftLeft(13); 
    var pte1 = RISCV.load_double_from_mem((baseaddr1.add(new Long(addr.get_vpn1()*8, 0x0))).getLowBits(), false);

    if (pte1.e != 0x1) {
        throw new RISCVError("Address Error"); // need to update later
    }

    permission_check(pte1, access_type);

    var baseaddr0 = pte1.get_ppn().shiftLeft(13);
    var pte0 = RISCV.load_double_from_mem((baseaddr0.add(new Long(addr.get_vpn0()*8, 0x0))).getLowBits(), false); 

    if (pte0.e != 0x1) {
        throw new RISCVError("Address Error"); // need to update later
    }

    permission_check(pte0, access_type);
    
    addr.set_ppn0(pte0.get_ppn0());
    addr.set_ppn1(pte0.get_ppn1());
    addr.set_ppn2(pte0.get_ppn2()); 

    return addr;
}


function permission_check(pte, access_type) {
    // check if access is valid
    // follows same convention for access_type as translate()
    var isSupervisor = (RISCV.priv_reg[0] >> 5) & 0x1; // hardcoded 0 update later
    if (isSupervisor == 0x1) {  
        // if running in supervisor mode
        if (access_type == 0 && pte.get_SR() == 0x1) {
            return;
        } else if (access_type == 1 && pte.get_SW() == 0x1) {
            return;
        } else if (access_type == 2 && pte.get_SX() == 0x1) {
            return;
        } else {
            throw RISCVError("Address Error"); // need to update later
        }
    } else if (isSupervisor == 0x0) {
        // if running in user mode
        if (access_type == 0 && pte.get_UR() == 0x1) {
            return;
        } else if (access_type == 1 && pte.get_UW() == 0x1) {
            return;
        } else if (access_type == 2 && pte.get_UX() == 0x1) {
            return;
        } else {
            throw RISCVError("Address Error"); // need to update later
        }
    } else {
        throw new RISCVError("invalid CPU mode in permission check");
    }
}
