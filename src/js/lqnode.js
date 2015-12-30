
'use strict';

var NullNode = require("./nullnode");

// Liner Quaternary Node

class LQNode extends NullNode {
  constructor(r, g, b, ro, morton, level) {
    super();

    this.ro = ro;
    this.r = r;
    this.g = g;
    this.b = b;
    this.morton = morton;
    this.level = level;
  }
}

module.exports = LQNode;
