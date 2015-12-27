
'use strict';

// Liner Quaternary Tree

var LQTree = require("./lqtree");

const MAX_LVL = 3;

class PlaneTree extends LQTree {
  constructor(cells) {
    super();
    this.cells = cells;
  }
  add(cell) {
    
    super.add(cell);
  }
}

module.exports = PlaneTree;
