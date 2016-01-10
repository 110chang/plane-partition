
'use strict';

//lqtreeSpec.js

var LQTree = require('../src/js/lqtree');
var Morton = require("../src/js/morton");

function registerSample(tree, sample) {
  sample = sample.split('').map((n) => ~~n);
  //tree = new LQTree((node) => node && node.value > 0);
  while(!tree.isPointerExceeded()) {
    //console.log(tree.getParent());
    let node = sample[tree.pointer] !== undefined ? {
      value: sample[tree.pointer]
    } : undefined;

    tree.add(node);
  }
  return tree.data.map((o) => o && o.value ? o.value : 0);
}

describe('LQTree', function() {
  var tree, tree2;
  beforeEach(() => {
    tree = new LQTree();
    tree2 = new LQTree();
  });

  it('should create instance', function() {
    expect(tree instanceof LQTree).toBeTruthy();
  });

  it('should know max pointer', function() {
    expect(tree.maxPointer).toBe(tree.getOffset(Morton.MAX_LVL + 1));
  });

  it('should stop when maximum pointer is exceeded', function() {
    while(!tree.isPointerExceeded()) {
      tree.add();
    }
    expect(tree.pointer).toBe(tree.getOffset(Morton.MAX_LVL + 1));
  });

  it('should add level when threshold is exceeded', function() {
    tree.add();
    expect(tree.level).toBe(1);
    "_".repeat(4).split('').forEach(() => tree.add());
    expect(tree.level).toBe(2);
    "_".repeat(16).split('').forEach(() => tree.add());
    expect(tree.level).toBe(3);
  });
});


