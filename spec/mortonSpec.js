
'use strict';

//mortonSpec.js

var Morton = require('../src/js/morton');

describe('Morton', function() {
  var m, n, o;
  beforeEach(() => {
    m = new Morton(3, 6);
    n = new Morton(6, 2);
    o = new Morton(45);
  });

  it('should convert coords to Morton Order', function() {
    expect(m.number).toBe(45);
    expect(n.number).toBe(28);
  });

  it('should construct from Morton Order', function() {
    expect(o.x).toEqual(3);
    expect(o.y).toEqual(6);
  });

  it('should provide space number each level', function() {
    expect(Morton.getSpace(2, 1, 1)).toEqual(2);
    expect(Morton.getSpace(2, 1, 3)).toEqual(0);
    expect(Morton.getSpace(2, 2, 3)).toEqual(0);
    expect(Morton.getSpace(2, 3, 3)).toEqual(2);
    expect(Morton.getSpace(45, 1, 3)).toEqual(2);
    expect(Morton.getSpace(45, 2, 3)).toEqual(3);
    expect(Morton.getSpace(45, 3, 3)).toEqual(1);
    expect(Morton.getSpace(28, 1, 3)).toEqual(1);
    expect(Morton.getSpace(28, 2, 3)).toEqual(3);
    expect(Morton.getSpace(28, 3, 3)).toEqual(0);
  });

  it('should compare Morton number belongs othre Morton number', function() {
    expect(Morton.belongs(parseInt("010011", 2), parseInt("010101", 2), 1)).toBeTruthy;
    expect(Morton.belongs(parseInt("010011", 2), parseInt("010101", 2), 2)).toBeFalsy;
    expect(Morton.belongs(parseInt("010011", 2), parseInt("010011", 2), 3)).toBeTruthy;
    expect(Morton.belongs(parseInt("010011", 2), parseInt("110011", 2), 1)).toBeFalsy;
  });

  it('should revert Morton Order to coords', function() {
    expect(Morton.reverse(45)).toEqual({ x: 3, y: 6 });
    expect(Morton.reverse(28)).toEqual({ x: 6, y: 2 });
    expect(Morton.reverse(0)).toEqual({ x: 0, y: 0 });
    expect(Morton.reverse(1)).toEqual({ x: 1, y: 0 });
  });

  it('should know own space number', function() {
    expect(Morton.getOwnSpace(m.number)).toBe(1);
    expect(Morton.getOwnSpace(n.number)).toBe(0);
  });

  it('should know own spaces belong', function() {
    expect(m.getSpaces()).toEqual([2, 3, 1]);
    expect(n.getSpaces()).toEqual([1, 3, 0]);
  });
});

