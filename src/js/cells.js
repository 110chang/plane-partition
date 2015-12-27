
'use strict';

//cells.js

var Cell = require('./cell');
var Morton = require('./morton');

var floor = Math.floor;
var round = Math.round;
var pow = Math.pow;

var bitSeperate32 = Morton.bitSeperate32;

class Cells {
  constructor(data, width, height) {
    if (data.length % 4 !== 0) {
      throw new Error('data length incorrect.')
    }
    this.data = [];
    this.register(data, width, height);
  }
  register(data, width, height) {
    var i = 0;
    var x = 0;
    var y = 0;
    var u = pow(2, Morton.MAX_LVL);
    console.time('read data');
    for (i = 0; i < data.length; i += 4) {
      //事前処理
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      let _x = floor(x / width * u);
      let _y = floor(y / height * u);
      let morton = (bitSeperate32(_x) | (bitSeperate32(_y) << 1));
      this.data.push(new Cell(_x, _y, morton, r, g, b));
      //console.log(r, g, b);
      if (++x === width) {
        x = 0;
        y++;
      }
    }
    console.timeEnd('read data');
    console.log(this.data);
  }
  find(lvl, morton) {
    return this.data.filter((cell) => {
      return Morton.belongs(cell.morton, morton, lvl);
    })
  }
}

module.exports = Cells;
