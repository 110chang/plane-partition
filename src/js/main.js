
'use strict';

// main.js

require("native-promise-only");

var ss = require("simple-statistics");

var graygrid = require("./graygrid");
var Cells = require("./cells");
var Morton = require("./morton");
var LQTree = require("./lqtree");
var LQNode = require("./lqnode");
var NullNode = require("./nullnode");

var bitSeperate32 = Morton.bitSeperate32;
var round = Math.round;
var pow = Math.pow;

document.addEventListener('DOMContentLoaded', (e) => {
  console.log('Entry point');
  var imageData = [];

  var loaded = new Promise((resolve, reject) => {
    var src = document.getElementById('src');
    src.addEventListener('load', (e) => {
      resolve(src);
    });
  });

  loaded.then((src) => {
    console.log('src loaded.');
    var image = new Image();
    image.src = src.getAttribute('src');

    var canvas = document.getElementById('place-holder');
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);

    //console.log(context.getImageData(0,0,image.width, image.height).data);
    var dataArr = context.getImageData(0,0,image.width, image.height).data;
    console.time('read data');
    console.log(dataArr.length / 4);
    if (dataArr.length % 4 !== 0) {
      throw new Error('data length incorrect.')
    }

    var cells = new Cells(dataArr, image.width, image.height);

    // test cells
    //cells.data.forEach((cell) => {
    //  let m = Morton.reverse(cell.morton);
    //  let u = pow(2, Morton.MAX_LVL);
    //  let w = image.width / u;
    //  let h = image.height / u;
    //  context.beginPath();
    //  context.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`;
    //  context.fillRect(m.x * w, m.y * h, w, h);
    //  context.closePath();
    //});

    var tree = new LQTree((node) => node.ro < 50);

    console.log(tree);

    var a = Morton.belongs(0, 2, 1);
    var b = Morton.belongs(1, 2, 1);
    var c = Morton.belongs(2, 2, 1);
    var d = Morton.belongs(3, 2, 1);
    var e = Morton.belongs(45, 45, 1);
    var f = Morton.belongs(46, 45, 1);
    var g = Morton.belongs(47, 45, 1);
    var h = Morton.belongs(48, 45, 1);

    console.log(a, b, c, d);
    console.log(e, f, g, h);


    while(!tree.isPointerMax()) {
      console.log(tree.level, tree.getMorton(), tree.getSpace());
      let temp = cells.find(tree.level, tree.getMorton());
      console.log(temp);
      // color average
      let r = round(ss.average(temp.map((cell) => cell.r)));
      let g = round(ss.average(temp.map((cell) => cell.g)));
      let b = round(ss.average(temp.map((cell) => cell.b)));

      // standard deviation of luminance
      let ro = ss.standardDeviation(temp.map((cell) => cell.luminance));

      tree.add(new LQNode(r, g, b, ro, tree.getMorton(), tree.level));
    }
    console.log(tree.data);

    //var cellcanvas = document.getElementById('cells');
    //cellcanvas.width = pow(2, Morton.MAX_LVL);
    //cellcanvas.height = pow(2, Morton.MAX_LVL);
    //var cellctx = cellcanvas.getContext('2d');
    //cellctx.fillStyle = '#000';
    //cellctx.fillRect(0, 0, cellcanvas.width, cellcanvas.height);

    /*tree.data.forEach((node) => {
      //console.log(node === null, node instanceof NullNode);
      if (node instanceof LQNode) {
        //console.log(node);
        let color = `rgb(${node.r},${node.g},${node.b})`;
        let negate = `rgb(${node.color.negate().rgbArray().join(',')})`;
        let w = image.width / pow(2, node.level);
        let h = image.height / pow(2, node.level);
        let m = Morton.reverse(node.morton);
        //console.log(w * m.x, h * m.y, w, h);
        context.beginPath();
        context.fillStyle = color;
        context.strokeStyle = negate;
        context.lineWidth = 0.2;
        context.fillRect(w * m.x, h * m.y, w, h);
        context.moveTo(w * m.x, h * m.y);
        context.lineTo(w * m.x + w, h * m.y + h);
        context.moveTo(w * m.x + w, h * m.y);
        context.lineTo(w * m.x, h * m.y + h);
        context.fillStyle = negate;
        context.textAlign = 'center';
        context.fillText(~~node.ro, w * m.x + w / 2, h * m.y + h / 2);
        context.closePath();
        context.stroke();
      }
    });*/
  });
}, false);


