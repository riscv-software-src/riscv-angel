var COMPILED = !0,
    goog = goog || {};
goog.global = this;
goog.exportPath_ = function(a, b, c) {
    a = a.split(".");
    c = c || goog.global;
    a[0] in c || !c.execScript || c.execScript("var " + a[0]);
    for (var d; a.length && (d = a.shift());) a.length || void 0 === b ? c = c[d] ? c[d] : c[d] = {} : c[d] = b
};
goog.define = function(a, b) {
    var c = b;
    COMPILED || goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, a) && (c = goog.global.CLOSURE_DEFINES[a]);
    goog.exportPath_(a, c)
};
goog.DEBUG = !0;
goog.LOCALE = "en";
goog.TRUSTED_SITE = !0;
goog.provide = function(a) {
    if (!COMPILED) {
        if (goog.isProvided_(a)) throw Error('Namespace "' + a + '" already declared.');
        delete goog.implicitNamespaces_[a];
        for (var b = a;
            (b = b.substring(0, b.lastIndexOf("."))) && !goog.getObjectByName(b);) goog.implicitNamespaces_[b] = !0
    }
    goog.exportPath_(a)
};
goog.setTestOnly = function(a) {
    if (COMPILED && !goog.DEBUG) throw a = a || "", Error("Importing test-only code into non-debug environment" + a ? ": " + a : ".");
};
COMPILED || (goog.isProvided_ = function(a) {
    return !goog.implicitNamespaces_[a] && !! goog.getObjectByName(a)
}, goog.implicitNamespaces_ = {});
goog.getObjectByName = function(a, b) {
    for (var c = a.split("."), d = b || goog.global, e; e = c.shift();)
        if (goog.isDefAndNotNull(d[e])) d = d[e];
        else return null;
    return d
};
goog.globalize = function(a, b) {
    var c = b || goog.global,
        d;
    for (d in a) c[d] = a[d]
};
goog.addDependency = function(a, b, c) {
    if (goog.DEPENDENCIES_ENABLED) {
        var d;
        a = a.replace(/\\/g, "/");
        for (var e = goog.dependencies_, f = 0; d = b[f]; f++) e.nameToPath[d] = a, a in e.pathToNames || (e.pathToNames[a] = {}), e.pathToNames[a][d] = !0;
        for (d = 0; b = c[d]; d++) a in e.requires || (e.requires[a] = {}), e.requires[a][b] = !0
    }
};
goog.ENABLE_DEBUG_LOADER = !0;
goog.require = function(a) {
    if (!COMPILED && !goog.isProvided_(a)) {
        if (goog.ENABLE_DEBUG_LOADER) {
            var b = goog.getPathFromDeps_(a);
            if (b) {
                goog.included_[b] = !0;
                goog.writeScripts_();
                return
            }
        }
        a = "goog.require could not find: " + a;
        goog.global.console && goog.global.console.error(a);
        throw Error(a);
    }
};
goog.basePath = "";
goog.nullFunction = function() {};
goog.identityFunction = function(a, b) {
    return a
};
goog.abstractMethod = function() {
    throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(a) {
    a.getInstance = function() {
        if (a.instance_) return a.instance_;
        goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = a);
        return a.instance_ = new a
    }
};
goog.instantiatedSingletons_ = [];
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
goog.DEPENDENCIES_ENABLED && (goog.included_ = {}, goog.dependencies_ = {
    pathToNames: {},
    nameToPath: {},
    requires: {},
    visited: {},
    written: {}
}, goog.inHtmlDocument_ = function() {
    var a = goog.global.document;
    return "undefined" != typeof a && "write" in a
}, goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) goog.basePath = goog.global.CLOSURE_BASE_PATH;
    else if (goog.inHtmlDocument_())
        for (var a = goog.global.document.getElementsByTagName("script"), b = a.length - 1; 0 <= b; --b) {
            var c = a[b].src,
                d = c.lastIndexOf("?"),
                d = -1 == d ? c.length :
                    d;
            if ("base.js" == c.substr(d - 7, 7)) {
                goog.basePath = c.substr(0, d - 7);
                break
            }
        }
}, goog.importScript_ = function(a) {
    var b = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    !goog.dependencies_.written[a] && b(a) && (goog.dependencies_.written[a] = !0)
}, goog.writeScriptTag_ = function(a) {
    if (goog.inHtmlDocument_()) {
        var b = goog.global.document;
        if ("complete" == b.readyState) {
            if (/\bdeps.js$/.test(a)) return !1;
            throw Error('Cannot write "' + a + '" after document load');
        }
        b.write('<script type="text/javascript" src="' + a + '">\x3c/script>');
        return !0
    }
    return !1
}, goog.writeScripts_ = function() {
    function a(e) {
        if (!(e in d.written)) {
            if (!(e in d.visited) && (d.visited[e] = !0, e in d.requires))
                for (var g in d.requires[e])
                    if (!goog.isProvided_(g))
                        if (g in d.nameToPath) a(d.nameToPath[g]);
                        else throw Error("Undefined nameToPath for " + g);
            e in c || (c[e] = !0, b.push(e))
        }
    }
    var b = [],
        c = {}, d = goog.dependencies_,
        e;
    for (e in goog.included_) d.written[e] || a(e);
    for (e = 0; e < b.length; e++)
        if (b[e]) goog.importScript_(goog.basePath + b[e]);
        else throw Error("Undefined script input");
}, goog.getPathFromDeps_ = function(a) {
    return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null
}, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
goog.typeOf = function(a) {
    var b = typeof a;
    if ("object" == b)
        if (a) {
            if (a instanceof Array) return "array";
            if (a instanceof Object) return b;
            var c = Object.prototype.toString.call(a);
            if ("[object Window]" == c) return "object";
            if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
            if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
        } else return "null";
        else if ("function" == b && "undefined" == typeof a.call) return "object";
    return b
};
goog.isDef = function(a) {
    return void 0 !== a
};
goog.isNull = function(a) {
    return null === a
};
goog.isDefAndNotNull = function(a) {
    return null != a
};
goog.isArray = function(a) {
    return "array" == goog.typeOf(a)
};
goog.isArrayLike = function(a) {
    var b = goog.typeOf(a);
    return "array" == b || "object" == b && "number" == typeof a.length
};
goog.isDateLike = function(a) {
    return goog.isObject(a) && "function" == typeof a.getFullYear
};
goog.isString = function(a) {
    return "string" == typeof a
};
goog.isBoolean = function(a) {
    return "boolean" == typeof a
};
goog.isNumber = function(a) {
    return "number" == typeof a
};
goog.isFunction = function(a) {
    return "function" == goog.typeOf(a)
};
goog.isObject = function(a) {
    var b = typeof a;
    return "object" == b && null != a || "function" == b
};
goog.getUid = function(a) {
    return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(a) {
    "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
    try {
        delete a[goog.UID_PROPERTY_]
    } catch (b) {}
};
goog.UID_PROPERTY_ = "closure_uid_" + (1E9 * Math.random() >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(a) {
    var b = goog.typeOf(a);
    if ("object" == b || "array" == b) {
        if (a.clone) return a.clone();
        var b = "array" == b ? [] : {}, c;
        for (c in a) b[c] = goog.cloneObject(a[c]);
        return b
    }
    return a
};
goog.bindNative_ = function(a, b, c) {
    return a.call.apply(a.bind, arguments)
};
goog.bindJs_ = function(a, b, c) {
    if (!a) throw Error();
    if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function() {
            var c = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(c, d);
            return a.apply(b, c)
        }
    }
    return function() {
        return a.apply(b, arguments)
    }
};
goog.bind = function(a, b, c) {
    Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bind = goog.bindNative_ : goog.bind = goog.bindJs_;
    return goog.bind.apply(null, arguments)
};
goog.partial = function(a, b) {
    var c = Array.prototype.slice.call(arguments, 1);
    return function() {
        var b = Array.prototype.slice.call(arguments);
        b.unshift.apply(b, c);
        return a.apply(this, b)
    }
};
goog.mixin = function(a, b) {
    for (var c in b) a[c] = b[c]
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
    return +new Date
};
goog.globalEval = function(a) {
    if (goog.global.execScript) goog.global.execScript(a, "JavaScript");
    else if (goog.global.eval)
        if (null == goog.evalWorksForGlobals_ && (goog.global.eval("var _et_ = 1;"), "undefined" != typeof goog.global._et_ ? (delete goog.global._et_, goog.evalWorksForGlobals_ = !0) : goog.evalWorksForGlobals_ = !1), goog.evalWorksForGlobals_) goog.global.eval(a);
        else {
            var b = goog.global.document,
                c = b.createElement("script");
            c.type = "text/javascript";
            c.defer = !1;
            c.appendChild(b.createTextNode(a));
            b.body.appendChild(c);
            b.body.removeChild(c)
        } else throw Error("goog.globalEval not available");
};
goog.evalWorksForGlobals_ = null;
goog.getCssName = function(a, b) {
    var c = function(a) {
        return goog.cssNameMapping_[a] || a
    }, d = function(a) {
            a = a.split("-");
            for (var b = [], d = 0; d < a.length; d++) b.push(c(a[d]));
            return b.join("-")
        }, d = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? c : d : function(a) {
            return a
        };
    return b ? a + "-" + d(b) : d(a)
};
goog.setCssNameMapping = function(a, b) {
    goog.cssNameMapping_ = a;
    goog.cssNameMappingStyle_ = b
};
!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && (goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING);
goog.getMsg = function(a, b) {
    var c = b || {}, d;
    for (d in c) {
        var e = ("" + c[d]).replace(/\$/g, "$$$$");
        a = a.replace(RegExp("\\{\\$" + d + "\\}", "gi"), e)
    }
    return a
};
goog.getMsgWithFallback = function(a, b) {
    return a
};
goog.exportSymbol = function(a, b, c) {
    goog.exportPath_(a, b, c)
};
goog.exportProperty = function(a, b, c) {
    a[b] = c
};
goog.inherits = function(a, b) {
    function c() {}
    c.prototype = b.prototype;
    a.superClass_ = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a
};
goog.base = function(a, b, c) {
    var d = arguments.callee.caller;
    if (goog.DEBUG && !d) throw Error("arguments.caller not defined.  goog.base() expects not to be running in strict mode. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    if (d.superClass_) return d.superClass_.constructor.apply(a, Array.prototype.slice.call(arguments, 1));
    for (var e = Array.prototype.slice.call(arguments, 2), f = !1, g = a.constructor; g; g = g.superClass_ && g.superClass_.constructor)
        if (g.prototype[b] === d) f = !0;
        else if (f) return g.prototype[b].apply(a,
        e);
    if (a[b] === d) return a.constructor.prototype[b].apply(a, e);
    throw Error("goog.base called from a method of one name to a method of a different name");
};
goog.scope = function(a) {
    a.call(goog.global)
};
goog.math = {};
goog.math.Long = function(a, b) {
    this.low_ = a | 0;
    this.high_ = b | 0
};
goog.math.Long.IntCache_ = {};
goog.math.Long.fromInt = function(a) {
    if (-128 <= a && 128 > a) {
        var b = goog.math.Long.IntCache_[a];
        if (b) return b
    }
    b = new goog.math.Long(a | 0, 0 > a ? -1 : 0); - 128 <= a && 128 > a && (goog.math.Long.IntCache_[a] = b);
    return b
};
goog.math.Long.fromNumber = function(a) {
    return isNaN(a) || !isFinite(a) ? goog.math.Long.ZERO : a <= -goog.math.Long.TWO_PWR_63_DBL_ ? goog.math.Long.MIN_VALUE : a + 1 >= goog.math.Long.TWO_PWR_63_DBL_ ? goog.math.Long.MAX_VALUE : 0 > a ? goog.math.Long.fromNumber(-a).negate() : new goog.math.Long(a % goog.math.Long.TWO_PWR_32_DBL_ | 0, a / goog.math.Long.TWO_PWR_32_DBL_ | 0)
};

goog.math.Long.fromNumber2 = function(a) {
    return new goog.math.Long(a|0, a >> 31);
};

goog.math.Long.fromBits = function(a, b) {
    return new goog.math.Long(a, b)
};
goog.math.Long.fromString = function(a, b) {
    if (0 == a.length) throw Error("number format error: empty string");
    var c = b || 10;
    if (2 > c || 36 < c) throw Error("radix out of range: " + c);
    if ("-" == a.charAt(0)) return goog.math.Long.fromString(a.substring(1), c).negate();
    if (0 <= a.indexOf("-")) throw Error('number format error: interior "-" character: ' + a);
    for (var d = goog.math.Long.fromNumber(Math.pow(c, 8)), e = goog.math.Long.ZERO, f = 0; f < a.length; f += 8) {
        var g = Math.min(8, a.length - f),
            k = parseInt(a.substring(f, f + g), c);
        8 > g ? (g = goog.math.Long.fromNumber(Math.pow(c,
            g)), e = e.multiply(g).add(goog.math.Long.fromNumber(k))) : (e = e.multiply(d), e = e.add(goog.math.Long.fromNumber(k)))
    }
    return e
};
goog.math.Long.TWO_PWR_16_DBL_ = 65536;
goog.math.Long.TWO_PWR_24_DBL_ = 16777216;
goog.math.Long.TWO_PWR_32_DBL_ = goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
goog.math.Long.TWO_PWR_31_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ / 2;
goog.math.Long.TWO_PWR_48_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
goog.math.Long.TWO_PWR_64_DBL_ = goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
goog.math.Long.TWO_PWR_63_DBL_ = goog.math.Long.TWO_PWR_64_DBL_ / 2;
goog.math.Long.ZERO = goog.math.Long.fromInt(0);
goog.math.Long.ONE = goog.math.Long.fromInt(1);
goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
goog.math.Long.MAX_VALUE = goog.math.Long.fromBits(-1, 2147483647);
goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, -2147483648);
goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(16777216);
goog.math.Long.prototype.toInt = function() {
    return this.low_
};
goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ + this.getLowBitsUnsigned()
};
goog.math.Long.prototype.toString = function(a) {
    a = a || 10;
    if (2 > a || 36 < a) throw Error("radix out of range: " + a);
    if (this.isZero()) return "0";
    if (this.isNegative()) {
        if (this.equals(goog.math.Long.MIN_VALUE)) {
            var b = goog.math.Long.fromNumber(a),
                c = this.div(b),
                b = c.multiply(b).subtract(this);
            return c.toString(a) + b.toInt().toString(a)
        }
        return "-" + this.negate().toString(a)
    }
    for (var c = goog.math.Long.fromNumber(Math.pow(a, 6)), b = this, d = "";;) {
        var e = b.div(c),
            f = b.subtract(e.multiply(c)).toInt().toString(a),
            b = e;
        if (b.isZero()) return f +
            d;
        for (; 6 > f.length;) f = "0" + f;
        d = "" + f + d
    }
};
goog.math.Long.prototype.getHighBits = function() {
    return this.high_
};
goog.math.Long.prototype.getLowBits = function() {
    return this.low_
};
goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return 0 <= this.low_ ? this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_
};
goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) return this.equals(goog.math.Long.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
    for (var a = 0 != this.high_ ? this.high_ : this.low_, b = 31; 0 < b && 0 == (a & 1 << b); b--);
    return 0 != this.high_ ? b + 33 : b + 1
};
goog.math.Long.prototype.isZero = function() {
    return 0 == this.high_ && 0 == this.low_
};
goog.math.Long.prototype.isNegative = function() {
    return 0 > this.high_
};
goog.math.Long.prototype.isOdd = function() {
    return 1 == (this.low_ & 1)
};
goog.math.Long.prototype.equals = function(a) {
    return this.high_ == a.high_ && this.low_ == a.low_
};
goog.math.Long.prototype.notEquals = function(a) {
    return this.high_ != a.high_ || this.low_ != a.low_
};
goog.math.Long.prototype.lessThan = function(a) {
    return 0 > this.compare(a)
};
goog.math.Long.prototype.lessThanOrEqual = function(a) {
    return 0 >= this.compare(a)
};
goog.math.Long.prototype.greaterThan = function(a) {
    return 0 < this.compare(a)
};
goog.math.Long.prototype.greaterThanOrEqual = function(a) {
    return 0 <= this.compare(a)
};
goog.math.Long.prototype.compare = function(a) {
    if (this.equals(a)) return 0;
    var b = this.isNegative(),
        c = a.isNegative();
    return b && !c ? -1 : !b && c ? 1 : this.subtract(a).isNegative() ? -1 : 1
};
goog.math.Long.prototype.negate = function() {
    return this.equals(goog.math.Long.MIN_VALUE) ? goog.math.Long.MIN_VALUE : this.not().add(goog.math.Long.ONE)
};
goog.math.Long.prototype.add = function(a) {
    var b = this.high_ >>> 16,
        c = this.high_ & 65535,
        d = this.low_ >>> 16,
        e = a.high_ >>> 16,
        f = a.high_ & 65535,
        g = a.low_ >>> 16,
        k;
    k = 0 + ((this.low_ & 65535) + (a.low_ & 65535));
    a = 0 + (k >>> 16);
    a += d + g;
    d = 0 + (a >>> 16);
    d += c + f;
    c = 0 + (d >>> 16);
    c = c + (b + e) & 65535;
    return new goog.math.Long((a & 65535) << 16 | k & 65535, c << 16 | d & 65535);
};
goog.math.Long.prototype.subtract = function(a) {
    return this.add(a.negate())
};
goog.math.Long.prototype.multiply = function(a) {
    if (this.isZero() || a.isZero()) return goog.math.Long.ZERO;
    if (this.equals(goog.math.Long.MIN_VALUE)) return a.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    if (a.equals(goog.math.Long.MIN_VALUE)) return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    if (this.isNegative()) return a.isNegative() ? this.negate().multiply(a.negate()) : this.negate().multiply(a).negate();
    if (a.isNegative()) return this.multiply(a.negate()).negate();
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        a.lessThan(goog.math.Long.TWO_PWR_24_)) return goog.math.Long.fromNumber(this.toNumber() * a.toNumber());
    var b = this.high_ >>> 16,
        c = this.high_ & 65535,
        d = this.low_ >>> 16,
        e = this.low_ & 65535,
        f = a.high_ >>> 16,
        g = a.high_ & 65535,
        k = a.low_ >>> 16;
    a = a.low_ & 65535;
    var m, h, l, n;
    n = 0 + e * a;
    l = 0 + (n >>> 16);
    l += d * a;
    h = 0 + (l >>> 16);
    l = (l & 65535) + e * k;
    h += l >>> 16;
    l &= 65535;
    h += c * a;
    m = 0 + (h >>> 16);
    h = (h & 65535) + d * k;
    m += h >>> 16;
    h &= 65535;
    h += e * g;
    m += h >>> 16;
    h &= 65535;
    m = m + (b * a + c * k + d * g + e * f) & 65535;
    return goog.math.Long.fromBits(l << 16 | n & 65535, m << 16 | h)
};
goog.math.Long.prototype.div = function(a) {
    if (a.isZero()) throw Error("division by zero");
    if (this.isZero()) return goog.math.Long.ZERO;
    if (this.equals(goog.math.Long.MIN_VALUE)) {
        if (a.equals(goog.math.Long.ONE) || a.equals(goog.math.Long.NEG_ONE)) return goog.math.Long.MIN_VALUE;
        if (a.equals(goog.math.Long.MIN_VALUE)) return goog.math.Long.ONE;
        var b = this.shiftRight(1).div(a).shiftLeft(1);
        if (b.equals(goog.math.Long.ZERO)) return a.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        var c = this.subtract(a.multiply(b));
        return b.add(c.div(a))
    }
    if (a.equals(goog.math.Long.MIN_VALUE)) return goog.math.Long.ZERO;
    if (this.isNegative()) return a.isNegative() ? this.negate().div(a.negate()) : this.negate().div(a).negate();
    if (a.isNegative()) return this.div(a.negate()).negate();
    for (var d = goog.math.Long.ZERO, c = this; c.greaterThanOrEqual(a);) {
        for (var b = Math.max(1, Math.floor(c.toNumber() / a.toNumber())), e = Math.ceil(Math.log(b) / Math.LN2), e = 48 >= e ? 1 : Math.pow(2, e - 48), f = goog.math.Long.fromNumber(b), g = f.multiply(a); g.isNegative() || g.greaterThan(c);) b -=
            e, f = goog.math.Long.fromNumber(b), g = f.multiply(a);
        f.isZero() && (f = goog.math.Long.ONE);
        d = d.add(f);
        c = c.subtract(g)
    }
    return d
};
goog.math.Long.prototype.modulo = function(a) {
    return this.subtract(this.div(a).multiply(a));
};
goog.math.Long.prototype.not = function() {
    return new goog.math.Long(~this.low_, ~this.high_);
};
goog.math.Long.prototype.and = function(a) {
    return new goog.math.Long(this.low_ & a.low_, this.high_ & a.high_);
};
goog.math.Long.prototype.or = function(a) {
    return new goog.math.Long(this.low_ | a.low_, this.high_ | a.high_);
};
goog.math.Long.prototype.xor = function(a) {
    return new goog.math.Long(this.low_ ^ a.low_, this.high_ ^ a.high_);
};
goog.math.Long.prototype.shiftLeft = function(a) {
    a &= 63;
    if (0 == a) return this;
    var b = this.low_;
    return 32 > a ? goog.math.Long.fromBits(b << a, this.high_ << a | b >>> 32 - a) : goog.math.Long.fromBits(0, b << a - 32)
};
goog.math.Long.prototype.shiftRight = function(a) {
    a &= 63;
    if (0 == a) return this;
    var b = this.high_;
    return 32 > a ? goog.math.Long.fromBits(this.low_ >>> a | b << 32 - a, b >> a) : goog.math.Long.fromBits(b >> a - 32, 0 <= b ? 0 : -1)
};
goog.math.Long.prototype.shiftRightUnsigned = function(a) {
    a &= 63;
    if (0 == a) return this;
    var b = this.high_;
    return 32 > a ? goog.math.Long.fromBits(this.low_ >>> a | b << 32 - a, b >>> a) : 32 == a ? goog.math.Long.fromBits(b, 0) : goog.math.Long.fromBits(b >>> a - 32, 0)
};
var myproject = {
    start: {}
};
goog.exportSymbol("myproject.start", myproject.start);
