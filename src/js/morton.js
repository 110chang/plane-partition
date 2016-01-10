
'use strict';

// Morton Order

// ref. http://d.hatena.ne.jp/ranmaru50/20111106/1320559955
// ref. http://marupeke296.com/COL_2D_No8_QuadTree.html

class Morton {
  static create(x, y) {
    return Morton.bitSeperate32(x) | (Morton.bitSeperate32(y) << 1);
  }
  static reverse(n) {
    return {
      x: Morton.bitPack32(n & 0x55555555),
      y: Morton.bitPack32((n & 0xAAAAAAAA) >> 1)
    }
  }
  static bitSeperate32(n) {
    n = (n | (n << 8)) & 0x00ff00ff;
    n = (n | (n << 4)) & 0x0f0f0f0f;
    n = (n | (n << 2)) & 0x33333333;
    return (n | (n << 1)) & 0x55555555;
  }
  static bitPack32(n) {
    n = (n & 0x33333333) | ((n & 0x44444444) >> 1);
    n = (n & 0x0f0f0f0f) | ((n & 0x30303030) >> 2);
    n = (n & 0x00ff00ff) | ((n & 0x0f000f00) >> 4);
    return (n & 0x0000ffff) | ((n & 0x00ff0000) >> 8);
  }
  static belongs(a, b, lvl, max = Morton.MAX_LVL) {
    return a >> (max - lvl) * 2 === b;
  }
}

Morton.MAX_LVL = 8;

module.exports = Morton;

