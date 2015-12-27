
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

    this.pointer = 0;
    this.level = 0;
    this.maxPointer = this.getOffset(Morton.MAX_LVL + 1);
    this.data = [];
    this.registered = [];
  }
  add(node) {
    //console.log(this.filter(node), this.getParentData() !== null);
    //if (node !== undefined) {
      //console.log(node instanceof NullNode);
      //console.log(node instanceof LQNode);
      //console.log(this.getMorton().toString(2), this.getParentData());

    var parentData = this.getParentData();
    //console.log(this.level);

    if (parentData === null || parentData instanceof LQNode) {
      // 親データが null または木ノード -> null
      this.data[this.pointer] = null;
    } else {
      // 親データが 空ノード
      if (this.filter(node)) {
        // 標準偏差が閾値以下 -> 登録する
        this.data[this.pointer] = node;
      } else if (this.level === 1) {
        // 最大レベル -> 登録する
        this.data[this.pointer] = node;
      } else {
        // 標準偏差が閾値以下 -> 空ノードで埋める
        this.data[this.pointer] = new NullNode();
      }
    }
    //console.log(parentData, this.data[this.pointer]);
    //}
    //console.log(this.data[this.pointer]);

    this.pointer++;

    if (this.getOffset(this.level + 1) === this.pointer) {
      this.level++;
    }
    //if (this.level > Morton.MAX_LVL) {
    //  throw new Error('Maximum tree level exceeded.');
    //}
  }
  getMorton() {
    return this.pointer - this.getOffset(this.level);
  }
  getSpace() {
    return Morton.getOwnSpace(this.getMorton());
  }
  getParentMorton(morton, level) {
    morton = typeof morton === 'number' ? morton : this.getMorton();
    level = typeof level === 'number' ? level : this.level;
    return morton >> 2;
  }
  getParentData(morton, level) {
    morton = typeof morton === 'number' ? morton : this.getMorton();
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
  getThreshold() {
    
  }
  isPointerMax() {
    return !(this.maxPointer > this.pointer);
  }
}

module.exports = LQTree;
