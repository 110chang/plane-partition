
'use strict';

//morton.js
//morton order <=> x, y

//http://d.hatena.ne.jp/ranmaru50/20111106/1320559955
//http://marupeke296.com/COL_2D_No8_QuadTree.html

//(45).toString(2) // "101101"
// 10 => 2 : parent parent space
// 11 => 3 : parent space
// 01 => 1 : self space

// yx
// 10

/*
y\x 0  1
  -------
0 |00|01|
  -------
1 |10|11|
  -------
*/

// "101101" AND "01010101010101010101010101010101"
// "000101"
// "010110" AND "01010101010101010101010101010101"
// "010100"

var spaceFilters = [];

function getDiscreteBits(n, f) {
  let b = n.toString(2);
  b = b.length < 2 ? '0' + b : b;
  return b.split('').reverse().filter(f).reverse().join('');
}
function getEvenBits(n) {
  return getDiscreteBits(n, (e, i) => i % 2 === 0);
}
function getOddBits(n) {
  return getDiscreteBits(n, (e, i) => i % 2 !== 0);
}

class Morton {
  constructor(x, y) {
    if (x == null) {
      throw new Error('invalid arguments.')
    }
    if (y == null) {
      let m = Morton.reverse(x);
      y = m.y;
      x = m.x;
    }
    this.x = x;
    this.y = y;
    this.number = (Morton.bitSeperate32(x) | (Morton.bitSeperate32(y) << 1));
  }
  static bitSeperate32(n) {
    n = (n | (n << 8)) & 0x00ff00ff;
    n = (n | (n << 4)) & 0x0f0f0f0f;
    n = (n | (n << 2)) & 0x33333333;
    return (n | (n << 1)) & 0x55555555;//"01010101010101010101010101010101"
  }
  static reverse(n) {
    return {
      x: parseInt(getEvenBits(n), 2),
      y: parseInt(getOddBits(n), 2)
    }
  }
  static getSpace(morton, lvl, max = Morton.MAX_LVL) {
    var filter = spaceFilters[lvl];
    if (!filter) {
      let b = Math.pow(2, max * 2 - (lvl * 2 - 1));
      filter = b | (b >> 1);
    }
    return (morton & filter) >> (max - lvl) * 2;
  }
  static belongs(a, b, lvl, max = Morton.MAX_LVL) {
    // aは最大レベルのMorton、 bは最小レベルから探索
    a = Morton.getSpace(a, lvl);
    //let shiftA = (max - lvl) * 2;
    //let shiftB = 0;//~~Math.floor(b.toString(2).length - 2);
    return a === b;
  }

  static getOwnSpace(morton) {
    return parseInt(morton.toString(2).slice(-2), 2);
  }
  getSpaces() {
    var result = [];
    var str = this.number.toString(2);
    str = str.length % 2 !== 0 ? str = "0" + str : str;
    str.split('').forEach((e, i) => {
      i % 2 === 0 ? result[i] = '' + e : result[i - 1] += e;
    });
    return result.filter((e) => e !== undefined).map((e) => parseInt(e, 2));
  }
}

Morton.MAX_LVL = 3;

module.exports = Morton;

