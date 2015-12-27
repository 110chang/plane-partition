'use strict';

//graygrid.js
// Create grid with Gray code

function graygrid(bit) {
  var l = Math.pow(2, bit);
  var res = [];
  for (var i = 0; i < l; i++) {
    res.push((i ^ (i >> 1)).toString(2));
    //console.log(i ^ (i >> 1));
  }
  //console.log(res)
  return res;
}

module.exports = graygrid;

