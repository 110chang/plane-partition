
'use strict';


//cell.js

class Cell {
  constructor(m, r, g, b) {
    this.morton = m;
    this.r = r;
    this.g = g;
    this.b = b;
    this.luminance = ( 0.298912 * r + 0.586611 * g + 0.114478 * b );
  }
}

module.exports = Cell;
