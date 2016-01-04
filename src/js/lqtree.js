
'use strict';

// Liner Quaternary Tree

var LQNode = require("./lqnode");
var NullNode = require("./nullnode");
var Morton = require("./morton");

var floor = Math.floor;
var pow = Math.pow;

var offsets = [];

class LQTree {
  constructor(filter) {
    if (typeof filter !== 'function') {
      filter = function(node) {
        return node;
      }
    }
    this.filter = filter;

    this.morton = 0;
    this.pointer = 0;
    this.level = 0;
    this.maxPointer = this.getOffset(Morton.MAX_LVL + 1);
    this.data = [];
  }
  isRegisteredBranch() {
    let parentData = this.getParentData();
    return parentData === null || parentData instanceof LQNode;
  }
  add(node) {
    this.data[this.pointer] = node;

    //最大レベルなら登録
    if (this.level === Morton.MAX_LVL) {
      this.data[this.pointer] = node;
    }

    this.pointer++;
    this.morton = this.pointer - this.getOffset(this.level);
    // ポインタが次のレベルのオフセットに達したらレベルを上げる
    if (this.getOffset(this.level + 1) === this.pointer) {
      this.level++;
    }
  }
  getParentMorton(morton, level) {
    morton = typeof morton === 'number' ? morton : this.morton;
    level = typeof level === 'number' ? level : this.level;
    return morton >> 2;
  }
  getParentData(morton, level) {
    morton = typeof morton === 'number' ? morton : this.morton;
    level = typeof level === 'number' ? level : this.level;

    if (level === 0) {
      return new NullNode();
    }
    //console.log(this.pointer, this.getMorton(), this.getOffset(level - 1) + (morton >> 2));
    return this.data[this.getOffset(level - 1) + (morton >> 2)];
  }
  getOffset(lvl) {
    if (!offsets[lvl]) {
      offsets[lvl] = floor((pow(4, lvl) - 1) / (4 - 1));
    }
    return offsets[lvl];
  }
  isPointerMax() {
    return !(this.maxPointer > this.pointer);
  }
}

module.exports = LQTree;
