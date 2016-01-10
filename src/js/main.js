
'use strict';

// main.js

require("native-promise-only");

let ss = require("simple-statistics");
let Color = require('color');

let Cells = require("./cells");
let Morton = require("./morton");
let LQTree = require("./lqtree");
let LQNode = require("./lqnode");
let NullNode = require("./nullnode");

const pow = Math.pow;

document.addEventListener('DOMContentLoaded', (e) => {
  //console.log('Entry point');
  let loaded = new Promise((resolve, reject) => {
    let src = document.getElementById('src');
    src.addEventListener('load', (e) => {
      resolve(src);
    });
  });

  loaded.then((src) => {
    console.log('image src loaded.');
    let image = new Image();
    image.src = src.getAttribute('src');

    let canvas = document.getElementById('place-holder');
    canvas.width = image.width;
    canvas.height = image.height;

    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);

    let dataArr = context.getImageData(0,0,image.width, image.height).data;

    let cells = new Cells(dataArr, image.width, image.height);
    let tree = new LQTree();

    console.time('register data');
    while(!tree.isPointerExceeded()) {

      if (tree.isRegisteredBranch()) {
        tree.add(null);
      } else {
        let temp = cells.find(tree.level, tree.morton);
        
        // standard deviation of luminance
        let ro = ss.standardDeviation(temp.map((cell) => cell.luminance));

        if (ro < 18 || tree.isMaxLevel()) {
          let l = temp.length;

          // color average
          let rTotal = 0;
          let gTotal = 0;
          let bTotal = 0;

          for (let i = 0; i < l; i++) {
            rTotal += temp[i].r;
            gTotal += temp[i].g;
            bTotal += temp[i].b;
          };

          tree.add(new LQNode(rTotal / l, gTotal / l, bTotal / l, ro, tree.morton, tree.level));
        } else {
          tree.add(new NullNode());
        }
      }
    }
    console.timeEnd('register data');

    let magnify = 2;

    canvas.width = image.width * magnify;
    canvas.height = image.height * magnify;

    console.time('draw data');
    tree.data.forEach((node) => {
      if (node instanceof LQNode) {
        let color = Color().rgb([node.r, node.g, node.b])
        let positive = `rgb(${color.saturate(0.5).rgbArray().join(',')})`;
        //let negative = `rgb(${color.clone().negate().rgbArray().join(',')})`;
        let w = image.width / pow(2, node.level);
        let h = image.height / pow(2, node.level);
        let m = Morton.reverse(node.morton);
        let left = w * m.x * magnify;
        let right = w * m.x * magnify + w * magnify;
        let top = h * m.y * magnify;
        let bottom = h * m.y * magnify + h * magnify;

        context.beginPath();
        context.fillStyle = positive;
        context.fillRect(left, top, w * magnify, h * magnify);

        context.beginPath();
        context.strokeStyle = '#FFF';
        context.lineWidth = 0.1 * magnify;
        context.moveTo(left, top);
        context.lineTo(right, bottom);
        context.moveTo(right, top);
        context.lineTo(left, bottom);
        context.closePath();
        context.stroke();
      }
    });
    console.timeEnd('draw data');
  });
}, false);


