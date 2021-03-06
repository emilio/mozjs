function assertEqX2(v, arr) {
    try {
        assertEq(v.x, arr[0]);
        assertEq(v.y, arr[1]);
    } catch (e) {
        print("stack trace:", e.stack);
        throw e;
    }
}

function assertEqX4(v, arr) {
    try {
        assertEq(v.x, arr[0]);
        assertEq(v.y, arr[1]);
        assertEq(v.z, arr[2]);
        assertEq(v.w, arr[3]);
    } catch (e) {
        print("stack trace:", e.stack);
        throw e;
    }
}

function simdLength(v) {
    var pt = Object.getPrototypeOf(v);
    if (pt === SIMD.int32x4.prototype || pt === SIMD.float32x4.prototype) {
        return 4;
    } else if (pt === SIMD.float64x2.prototype) {
        return 2;
    } else {
        throw new TypeError("Unknown SIMD kind.");
    }
}

function assertEqVec(v, arr) {
    var lanes = simdLength(v);
    if (lanes == 4)
        assertEqX4(v, arr);
    else if (lanes == 2)
        assertEqX2(v, arr);
    else
        throw new TypeError("Unknown SIMD kind.");
}

function simdToArray(v) {
    var lanes = simdLength(v);
    if (lanes == 4)
        return [v.x, v.y, v.z, v.w];
    else if (lanes == 2)
        return [v.x, v.y];
    else
        throw new TypeError("Unknown SIMD kind.");
}

const INT32_MAX = Math.pow(2, 31) - 1;
const INT32_MIN = -Math.pow(2, 31);
assertEq(INT32_MAX + 1 | 0, INT32_MIN);

function testUnaryFunc(v, simdFunc, func) {
    var varr = simdToArray(v);

    var observed = simdToArray(simdFunc(v));
    var expected = varr.map(function(v, i) { return func(varr[i]); });

    for (var i = 0; i < observed.length; i++)
        assertEq(observed[i], expected[i]);
}

function testBinaryFunc(v, w, simdFunc, func) {
    var varr = simdToArray(v);
    var warr = simdToArray(w);

    var observed = simdToArray(simdFunc(v, w));
    var expected = varr.map(function(v, i) { return func(varr[i], warr[i]); });

    for (var i = 0; i < observed.length; i++)
        assertEq(observed[i], expected[i]);
}

function testBinaryCompare(v, w, simdFunc, func) {
    var varr = simdToArray(v);
    var warr = simdToArray(w);

    var inLanes = simdLength(v);
    var observed = simdToArray(simdFunc(v, w));
    assertEq(observed.length, 4);
    for (var i = 0; i < 4; i++) {
        var j = ((i * inLanes) / 4) | 0;
        assertEq(observed[i], func(varr[j], warr[j]));
    }
}

function testBinaryScalarFunc(v, scalar, simdFunc, func) {
    var varr = simdToArray(v);

    var observed = simdToArray(simdFunc(v, scalar));
    var expected = varr.map(function(v, i) { return func(varr[i], scalar); });

    for (var i = 0; i < observed.length; i++)
        assertEq(observed[i], expected[i]);
}
