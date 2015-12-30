
'use strict';

// main.js

require("native-promise-only");

var ss = require("simple-statistics");
var Color = require('color');

var Cells = require("./cells");
var Morton = require("./morton");
var LQTree = require("./lqtree");
var LQNode = require("./lqnode");
var NullNode = require("./nullnode");

var round = Math.round;
var pow = Math.pow;
var average = ss.average;

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

    var dataArr = context.getImageData(0,0,image.width, image.height).data;

    if (dataArr.length % 4 !== 0) {
      throw new Error('data length incorrect.')
    }

    var cells = new Cells(dataArr, image.width, image.height);

    var tree = new LQTree((node) => node.ro < 18);

    console.time('register data');
    while(!tree.isPointerMax()) {
      //console.time('find cells');
      let temp = cells.find(tree.level, tree.getMorton());
      //console.timeEnd('find cells');
      // color average
      //console.time('avarage colors');
      //let r = average(temp.map((cell) => cell.r));
      //let g = average(temp.map((cell) => cell.g));
      //let b = average(temp.map((cell) => cell.b));
      let l = temp.length;
      let rTotal = 0;
      let gTotal = 0;
      let bTotal = 0;

      for (let i = 0; i < l; i++) {
        rTotal += temp[i].r;
        gTotal += temp[i].g;
        bTotal += temp[i].b;
      };
      //console.timeEnd('avarage colors');

      // standard deviation of luminance
      let ro = ss.standardDeviation(temp.map((cell) => cell.luminance));

      tree.add(new LQNode(rTotal / l, gTotal / l, bTotal / l, ro, tree.getMorton(), tree.level));
    }
    console.timeEnd('register data');

    console.time('draw data 1');
    tree.data.forEach((node) => {
      if (node instanceof LQNode) {
        let color = Color().rgb([node.r, node.g, node.b])
        let positive = `rgb(${color.saturate(0.5).rgbArray().join(',')})`;
        //let negative = `rgb(${color.clone().negate().rgbArray().join(',')})`;
        //let glow = `rgba(${color.clone().lighten(0.5).rgbArray().join(',')},0.2)`;
        //let vivid = `rgb(${color.clone().saturate(0.5).rgbArray().join(',')},0.2)`;
        let w = image.width / pow(2, node.level);
        let h = image.height / pow(2, node.level);
        let m = Morton.reverse(node.morton);
        let magnify = 1;
        let left = w * m.x * magnify;
        let right = w * m.x * magnify + w * magnify;
        let top = h * m.y * magnify;
        let bottom = h * m.y * magnify + h * magnify;

        context.beginPath();
        context.fillStyle = positive;
        context.fillRect(left, top, w * magnify, h * magnify);

        context.beginPath();
        context.strokeStyle = '#FFF';
        context.lineWidth = 0.2;
        context.moveTo(left, top);
        context.lineTo(right, bottom);
        context.moveTo(right, top);
        context.lineTo(left, bottom);
        context.closePath();
        context.stroke();
      }
    });
    console.timeEnd('draw data 1');

    console.time('draw data 2');
    var finish = document.getElementById('finish');
    finish.width = image.width * 2;
    finish.height = image.height * 2;

    var ctx_fin = finish.getContext('2d');
    tree.data.forEach((node) => {
      if (node instanceof LQNode) {
        let color = Color().rgb([node.r, node.g, node.b])
        let positive = `rgb(${color.saturate(0.5).rgbArray().join(',')})`;
        //let negative = `rgb(${color.clone().negate().rgbArray().join(',')})`;
        //let glow = `rgba(${color.clone().lighten(0.5).rgbArray().join(',')},0.2)`;
        //let vivid = `rgb(${color.clone().saturate(0.5).rgbArray().join(',')},0.2)`;
        let w = image.width / pow(2, node.level);
        let h = image.height / pow(2, node.level);
        let m = Morton.reverse(node.morton);
        let magnify = 2;
        let left = w * m.x * magnify;
        let right = w * m.x * magnify + w * magnify;
        let top = h * m.y * magnify;
        let bottom = h * m.y * magnify + h * magnify;

        ctx_fin.beginPath();
        ctx_fin.fillStyle = positive;
        ctx_fin.fillRect(left, top, w * magnify, h * magnify);

        ctx_fin.beginPath();
        ctx_fin.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx_fin.lineWidth = 0.3;
        ctx_fin.moveTo(left, top);
        ctx_fin.lineTo(right, bottom);
        ctx_fin.moveTo(right, top);
        ctx_fin.lineTo(left, bottom);
        ctx_fin.closePath();
        ctx_fin.stroke();
      }
    });
    console.timeEnd('draw data 2');
  });
}, false);


