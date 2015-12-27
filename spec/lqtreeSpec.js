
'use strict';

//lqtreeSpec.js

var LQTree = require('../src/js/lqtree');
var Morton = require("../src/js/morton");

// filter omit zero data
var filter = (node) => node && node.value > 0;

function registerSample(tree, sample) {
  sample = sample.split('').map((n) => ~~n);
  //tree = new LQTree((node) => node && node.value > 0);
  while(!tree.isPointerMax()) {
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
    tree = new LQTree(filter);
    tree2 = new LQTree(filter);
  });

  it('should create instance', function() {
    expect(tree instanceof LQTree).toBeTruthy();
  });

  it('should know max pointer', function() {
    expect(tree.maxPointer).toBe(tree.getOffset(Morton.MAX_LVL + 1));
  });

  it('should stop when maximum pointer is exceeded', function() {
    while(!tree.isPointerMax()) {
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

  it('should filter node', function() {

    //var result = registerSample(tree, '101210112130101111011');
    //var result2 = registerSample(tree2, '121001123001221111011');
    //console.log(tree.data);
    //expect(result.join('')).toBe('101210000130101111011');
    //expect(result2.join('')).toBe('121001123001200000000');
  });

});


