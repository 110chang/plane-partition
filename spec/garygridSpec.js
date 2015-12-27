'use strict';

//graygridSpec.js

var graygrid = require('../src/js/graygrid');

var gc2bit = [0,1,3,2].map((e) => e.toString(2));
var gc3bit = [0,1,3,2,6,7,5,4].map((e) => e.toString(2));
var gc4bit = [0,1,3,2,6,7,5,4,12,13,15,14,10,11,9,8].map((e) => e.toString(2));

describe('graygrid', function() {
  it('should create Gray code correctly.', function() {
    expect(graygrid(2)).toEqual(gc2bit);
    expect(graygrid(3)).toEqual(gc3bit);
    expect(graygrid(4)).toEqual(gc4bit);
  });
});