
'use strict';

// Linear Quaternary Tree

let LQNode = require("./lqnode");
let NullNode = require("./nullnode");
let Morton = require("./morton");

const floor = Math.floor;
const pow = Math.pow;

let offsets = [];

class LQTree {
  constructor() {
    this.morton = 0;
    this.pointer = 0;
    this.level = 0;
    this.maxPointer = this.getOffset(Morton.MAX_LVL + 1);
    this.data = [];
  }
  add(node) {
    this.data[this.pointer] = node;

    this.pointer++;
    // ポインタが次のレベルのオフセットに達したらレベルを上げる
    if (this.getOffset(this.level + 1) === this.pointer) {
      this.level++;
    }
    this.morton = this.pointer - this.getOffset(this.level);
  }
  isMaxLevel() {
    return this.level === Morton.MAX_LVL;
  }
  isPointerExceeded() {
    return !(this.maxPointer > this.pointer);
  }
  isRegisteredBranch() {
    let parentData = this.getParentData();
    return parentData === null || parentData instanceof LQNode;
  }
  getParentData(morton, level) {
    morton = typeof morton === 'number' ? morton : this.morton;
    level = typeof level === 'number' ? level : this.level;

    if (level === 0) {
      return new NullNode();
    }
    return this.data[this.getOffset(level - 1) + (morton >> 2)];
  }
  getOffset(lvl) {
    if (!offsets[lvl]) {
      offsets[lvl] = floor((pow(4, lvl) - 1) / (4 - 1));
    }
    return offsets[lvl];
  }
}

module.exports = LQTree;
