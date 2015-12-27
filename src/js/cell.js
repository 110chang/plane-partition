
'use strict';


//cell.js

class Cell {
  constructor(x, y, m, r, g, b) {
    this.x = x;
    this.y = y;
    this.morton = m;
    this.r = r;
    this.g = g;
    this.b = b;
    this.luminance = ( 0.298912 * r + 0.586611 * g + 0.114478 * b );
  }
}

//color.luminosity();  // 0.412 

module.exports = Cell;
