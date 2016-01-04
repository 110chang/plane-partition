
'use strict';

//cells.js

var Cell = require('./cell');
var Morton = require('./morton');

var floor = Math.floor;
var round = Math.round;
var pow = Math.pow;

class Cells {
  constructor(data, width, height) {
    if (data.length % 4 !== 0) {
      throw new Error('data length incorrect.')
    }
    this.data = [];
    this.mem = {};
    this.register(data, width, height);
  }
  register(data, width, height) {
    var x = 0;
    var y = 0;
    var u = pow(2, Morton.MAX_LVL);
    console.time('read data');
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let _x = floor(x / width * u);
      let _y = floor(y / height * u);
      let morton = Morton.create(_x, _y);
      this.data.push(new Cell(morton, r, g, b));

      if (++x === width) {
        x = 0;
        y++;
      }
    }
    console.timeEnd('read data');
  }
  find(lvl, morton) {
    let field = this.data;
    let result;
    if (this.mem[lvl - 1] && this.mem[lvl - 1][morton >> 2]) {
      field = this.mem[lvl - 1][morton >> 2];
    }
    result = field.filter((cell) => {
      return Morton.belongs(cell.morton, morton, lvl);
    });
    if (!this.mem[lvl]) {
      this.mem[lvl] = {};
    }
    if (!this.mem[lvl][morton]) {
      this.mem[lvl][morton] = result;
    }
    return result;
  }
}

module.exports = Cells;
