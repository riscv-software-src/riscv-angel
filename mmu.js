// simulated memory management unit,
// needs to intercept all memory loading calls

// object with attached helper methods for a page table entry
function page_table_entry(entryin) {
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

    function get_ppn1() {
        return ((this.entry.getLowBits() >> 23) & 0x1FF) | ((this.entry.getHighBits() & 0x1) << 9);
    }

    function get_ppn2() {
        return ((this.entry.getHighBits() >> 1) & 0x7FFFFFFF);
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
    this.get_ppn1 = get_ppn1;
    this.get_ppn2 = get_ppn2;

}

