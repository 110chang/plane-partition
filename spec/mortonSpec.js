
'use strict';

//mortonSpec.js

var Morton = require('../src/js/morton');

describe('Morton', function() {
  beforeEach(() => {

  });

  it('should pack bits', function() {
    expect(Morton.bitPack32(45 & 0x55555555)).toBe(3);
    expect(Morton.bitPack32(28 & 0x55555555)).toBe(6);
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
});

