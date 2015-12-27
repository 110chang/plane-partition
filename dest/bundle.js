(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* MIT license */
var convert = require("color-convert"),
    string = require("color-string");

var Color = function(obj) {
  if (obj instanceof Color) return obj;
  if (! (this instanceof Color)) return new Color(obj);

   this.values = {
      rgb: [0, 0, 0],
      hsl: [0, 0, 0],
      hsv: [0, 0, 0],
      hwb: [0, 0, 0],
      cmyk: [0, 0, 0, 0],
      alpha: 1
   }

   // parse Color() argument
   if (typeof obj == "string") {
      var vals = string.getRgba(obj);
      if (vals) {
         this.setValues("rgb", vals);
      }
      else if(vals = string.getHsla(obj)) {
         this.setValues("hsl", vals);
      }
      else if(vals = string.getHwb(obj)) {
         this.setValues("hwb", vals);
      }
      else {
        throw new Error("Unable to parse color from string \"" + obj + "\"");
      }
   }
   else if (typeof obj == "object") {
      var vals = obj;
      if(vals["r"] !== undefined || vals["red"] !== undefined) {
         this.setValues("rgb", vals)
      }
      else if(vals["l"] !== undefined || vals["lightness"] !== undefined) {
         this.setValues("hsl", vals)
      }
      else if(vals["v"] !== undefined || vals["value"] !== undefined) {
         this.setValues("hsv", vals)
      }
      else if(vals["w"] !== undefined || vals["whiteness"] !== undefined) {
         this.setValues("hwb", vals)
      }
      else if(vals["c"] !== undefined || vals["cyan"] !== undefined) {
         this.setValues("cmyk", vals)
      }
      else {
        throw new Error("Unable to parse color from object " + JSON.stringify(obj));
      }
   }
}

Color.prototype = {
   rgb: function (vals) {
      return this.setSpace("rgb", arguments);
   },
   hsl: function(vals) {
      return this.setSpace("hsl", arguments);
   },
   hsv: function(vals) {
      return this.setSpace("hsv", arguments);
   },
   hwb: function(vals) {
      return this.setSpace("hwb", arguments);
   },
   cmyk: function(vals) {
      return this.setSpace("cmyk", arguments);
   },

   rgbArray: function() {
      return this.values.rgb;
   },
   hslArray: function() {
      return this.values.hsl;
   },
   hsvArray: function() {
      return this.values.hsv;
   },
   hwbArray: function() {
      if (this.values.alpha !== 1) {
        return this.values.hwb.concat([this.values.alpha])
      }
      return this.values.hwb;
   },
   cmykArray: function() {
      return this.values.cmyk;
   },
   rgbaArray: function() {
      var rgb = this.values.rgb;
      return rgb.concat([this.values.alpha]);
   },
   hslaArray: function() {
      var hsl = this.values.hsl;
      return hsl.concat([this.values.alpha]);
   },
   alpha: function(val) {
      if (val === undefined) {
         return this.values.alpha;
      }
      this.setValues("alpha", val);
      return this;
   },

   red: function(val) {
      return this.setChannel("rgb", 0, val);
   },
   green: function(val) {
      return this.setChannel("rgb", 1, val);
   },
   blue: function(val) {
      return this.setChannel("rgb", 2, val);
   },
   hue: function(val) {
      return this.setChannel("hsl", 0, val);
   },
   saturation: function(val) {
      return this.setChannel("hsl", 1, val);
   },
   lightness: function(val) {
      return this.setChannel("hsl", 2, val);
   },
   saturationv: function(val) {
      return this.setChannel("hsv", 1, val);
   },
   whiteness: function(val) {
      return this.setChannel("hwb", 1, val);
   },
   blackness: function(val) {
      return this.setChannel("hwb", 2, val);
   },
   value: function(val) {
      return this.setChannel("hsv", 2, val);
   },
   cyan: function(val) {
      return this.setChannel("cmyk", 0, val);
   },
   magenta: function(val) {
      return this.setChannel("cmyk", 1, val);
   },
   yellow: function(val) {
      return this.setChannel("cmyk", 2, val);
   },
   black: function(val) {
      return this.setChannel("cmyk", 3, val);
   },

   hexString: function() {
      return string.hexString(this.values.rgb);
   },
   rgbString: function() {
      return string.rgbString(this.values.rgb, this.values.alpha);
   },
   rgbaString: function() {
      return string.rgbaString(this.values.rgb, this.values.alpha);
   },
   percentString: function() {
      return string.percentString(this.values.rgb, this.values.alpha);
   },
   hslString: function() {
      return string.hslString(this.values.hsl, this.values.alpha);
   },
   hslaString: function() {
      return string.hslaString(this.values.hsl, this.values.alpha);
   },
   hwbString: function() {
      return string.hwbString(this.values.hwb, this.values.alpha);
   },
   keyword: function() {
      return string.keyword(this.values.rgb, this.values.alpha);
   },

   rgbNumber: function() {
      return (this.values.rgb[0] << 16) | (this.values.rgb[1] << 8) | this.values.rgb[2];
   },

   luminosity: function() {
      // http://www.w3.org/TR/WCAG20/#relativeluminancedef
      var rgb = this.values.rgb;
      var lum = [];
      for (var i = 0; i < rgb.length; i++) {
         var chan = rgb[i] / 255;
         lum[i] = (chan <= 0.03928) ? chan / 12.92
                  : Math.pow(((chan + 0.055) / 1.055), 2.4)
      }
      return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
   },

   contrast: function(color2) {
      // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
      var lum1 = this.luminosity();
      var lum2 = color2.luminosity();
      if (lum1 > lum2) {
         return (lum1 + 0.05) / (lum2 + 0.05)
      };
      return (lum2 + 0.05) / (lum1 + 0.05);
   },

   level: function(color2) {
     var contrastRatio = this.contrast(color2);
     return (contrastRatio >= 7.1)
       ? 'AAA'
       : (contrastRatio >= 4.5)
        ? 'AA'
        : '';
   },

   dark: function() {
      // YIQ equation from http://24ways.org/2010/calculating-color-contrast
      var rgb = this.values.rgb,
          yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      return yiq < 128;
   },

   light: function() {
      return !this.dark();
   },

   negate: function() {
      var rgb = []
      for (var i = 0; i < 3; i++) {
         rgb[i] = 255 - this.values.rgb[i];
      }
      this.setValues("rgb", rgb);
      return this;
   },

   lighten: function(ratio) {
      this.values.hsl[2] += this.values.hsl[2] * ratio;
      this.setValues("hsl", this.values.hsl);
      return this;
   },

   darken: function(ratio) {
      this.values.hsl[2] -= this.values.hsl[2] * ratio;
      this.setValues("hsl", this.values.hsl);
      return this;
   },

   saturate: function(ratio) {
      this.values.hsl[1] += this.values.hsl[1] * ratio;
      this.setValues("hsl", this.values.hsl);
      return this;
   },

   desaturate: function(ratio) {
      this.values.hsl[1] -= this.values.hsl[1] * ratio;
      this.setValues("hsl", this.values.hsl);
      return this;
   },

   whiten: function(ratio) {
      this.values.hwb[1] += this.values.hwb[1] * ratio;
      this.setValues("hwb", this.values.hwb);
      return this;
   },

   blacken: function(ratio) {
      this.values.hwb[2] += this.values.hwb[2] * ratio;
      this.setValues("hwb", this.values.hwb);
      return this;
   },

   greyscale: function() {
      var rgb = this.values.rgb;
      // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
      var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
      this.setValues("rgb", [val, val, val]);
      return this;
   },

   clearer: function(ratio) {
      this.setValues("alpha", this.values.alpha - (this.values.alpha * ratio));
      return this;
   },

   opaquer: function(ratio) {
      this.setValues("alpha", this.values.alpha + (this.values.alpha * ratio));
      return this;
   },

   rotate: function(degrees) {
      var hue = this.values.hsl[0];
      hue = (hue + degrees) % 360;
      hue = hue < 0 ? 360 + hue : hue;
      this.values.hsl[0] = hue;
      this.setValues("hsl", this.values.hsl);
      return this;
   },

   /**
    * Ported from sass implementation in C
    * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
    */
   mix: function(mixinColor, weight) {
      var color1 = this;
      var color2 = mixinColor;
      var p = weight !== undefined ? weight : 0.5;

      var w = 2 * p - 1;
      var a = color1.alpha() - color2.alpha();

      var w1 = (((w * a == -1) ? w : (w + a)/(1 + w*a)) + 1) / 2.0;
      var w2 = 1 - w1;

      return this
        .rgb(
          w1 * color1.red() + w2 * color2.red(),
          w1 * color1.green() + w2 * color2.green(),
          w1 * color1.blue() + w2 * color2.blue()
        )
        .alpha(color1.alpha() * p + color2.alpha() * (1 - p));
   },

   toJSON: function() {
     return this.rgb();
   },

   clone: function() {
     return new Color(this.rgb());
   }
}


Color.prototype.getValues = function(space) {
   var vals = {};
   for (var i = 0; i < space.length; i++) {
      vals[space.charAt(i)] = this.values[space][i];
   }
   if (this.values.alpha != 1) {
      vals["a"] = this.values.alpha;
   }
   // {r: 255, g: 255, b: 255, a: 0.4}
   return vals;
}

Color.prototype.setValues = function(space, vals) {
   var spaces = {
      "rgb": ["red", "green", "blue"],
      "hsl": ["hue", "saturation", "lightness"],
      "hsv": ["hue", "saturation", "value"],
      "hwb": ["hue", "whiteness", "blackness"],
      "cmyk": ["cyan", "magenta", "yellow", "black"]
   };

   var maxes = {
      "rgb": [255, 255, 255],
      "hsl": [360, 100, 100],
      "hsv": [360, 100, 100],
      "hwb": [360, 100, 100],
      "cmyk": [100, 100, 100, 100]
   };

   var alpha = 1;
   if (space == "alpha") {
      alpha = vals;
   }
   else if (vals.length) {
      // [10, 10, 10]
      this.values[space] = vals.slice(0, space.length);
      alpha = vals[space.length];
   }
   else if (vals[space.charAt(0)] !== undefined) {
      // {r: 10, g: 10, b: 10}
      for (var i = 0; i < space.length; i++) {
        this.values[space][i] = vals[space.charAt(i)];
      }
      alpha = vals.a;
   }
   else if (vals[spaces[space][0]] !== undefined) {
      // {red: 10, green: 10, blue: 10}
      var chans = spaces[space];
      for (var i = 0; i < space.length; i++) {
        this.values[space][i] = vals[chans[i]];
      }
      alpha = vals.alpha;
   }
   this.values.alpha = Math.max(0, Math.min(1, (alpha !== undefined ? alpha : this.values.alpha) ));
   if (space == "alpha") {
      return;
   }

   // cap values of the space prior converting all values
   for (var i = 0; i < space.length; i++) {
      var capped = Math.max(0, Math.min(maxes[space][i], this.values[space][i]));
      this.values[space][i] = Math.round(capped);
   }

   // convert to all the other color spaces
   for (var sname in spaces) {
      if (sname != space) {
         this.values[sname] = convert[space][sname](this.values[space])
      }

      // cap values
      for (var i = 0; i < sname.length; i++) {
         var capped = Math.max(0, Math.min(maxes[sname][i], this.values[sname][i]));
         this.values[sname][i] = Math.round(capped);
      }
   }
   return true;
}

Color.prototype.setSpace = function(space, args) {
   var vals = args[0];
   if (vals === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof vals == "number") {
      vals = Array.prototype.slice.call(args);
   }
   this.setValues(space, vals);
   return this;
}

Color.prototype.setChannel = function(space, index, val) {
   if (val === undefined) {
      // color.red()
      return this.values[space][index];
   }
   // color.red(100)
   this.values[space][index] = val;
   this.setValues(space, this.values[space]);
   return this;
}

module.exports = Color;

},{"color-convert":3,"color-string":4}],2:[function(require,module,exports){
/* MIT license */

module.exports = {
  rgb2hsl: rgb2hsl,
  rgb2hsv: rgb2hsv,
  rgb2hwb: rgb2hwb,
  rgb2cmyk: rgb2cmyk,
  rgb2keyword: rgb2keyword,
  rgb2xyz: rgb2xyz,
  rgb2lab: rgb2lab,
  rgb2lch: rgb2lch,

  hsl2rgb: hsl2rgb,
  hsl2hsv: hsl2hsv,
  hsl2hwb: hsl2hwb,
  hsl2cmyk: hsl2cmyk,
  hsl2keyword: hsl2keyword,

  hsv2rgb: hsv2rgb,
  hsv2hsl: hsv2hsl,
  hsv2hwb: hsv2hwb,
  hsv2cmyk: hsv2cmyk,
  hsv2keyword: hsv2keyword,

  hwb2rgb: hwb2rgb,
  hwb2hsl: hwb2hsl,
  hwb2hsv: hwb2hsv,
  hwb2cmyk: hwb2cmyk,
  hwb2keyword: hwb2keyword,

  cmyk2rgb: cmyk2rgb,
  cmyk2hsl: cmyk2hsl,
  cmyk2hsv: cmyk2hsv,
  cmyk2hwb: cmyk2hwb,
  cmyk2keyword: cmyk2keyword,

  keyword2rgb: keyword2rgb,
  keyword2hsl: keyword2hsl,
  keyword2hsv: keyword2hsv,
  keyword2hwb: keyword2hwb,
  keyword2cmyk: keyword2cmyk,
  keyword2lab: keyword2lab,
  keyword2xyz: keyword2xyz,

  xyz2rgb: xyz2rgb,
  xyz2lab: xyz2lab,
  xyz2lch: xyz2lch,

  lab2xyz: lab2xyz,
  lab2rgb: lab2rgb,
  lab2lch: lab2lch,

  lch2lab: lch2lab,
  lch2xyz: lch2xyz,
  lch2rgb: lch2rgb
}


function rgb2hsl(rgb) {
  var r = rgb[0]/255,
      g = rgb[1]/255,
      b = rgb[2]/255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, l;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g)/ delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  l = (min + max) / 2;

  if (max == min)
    s = 0;
  else if (l <= 0.5)
    s = delta / (max + min);
  else
    s = delta / (2 - max - min);

  return [h, s * 100, l * 100];
}

function rgb2hsv(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, v;

  if (max == 0)
    s = 0;
  else
    s = (delta/max * 1000)/10;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  v = ((max / 255) * 1000) / 10;

  return [h, s, v];
}

function rgb2hwb(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      h = rgb2hsl(rgb)[0],
      w = 1/255 * Math.min(r, Math.min(g, b)),
      b = 1 - 1/255 * Math.max(r, Math.max(g, b));

  return [h, w * 100, b * 100];
}

function rgb2cmyk(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c, m, y, k;

  k = Math.min(1 - r, 1 - g, 1 - b);
  c = (1 - r - k) / (1 - k) || 0;
  m = (1 - g - k) / (1 - k) || 0;
  y = (1 - b - k) / (1 - k) || 0;
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgb2keyword(rgb) {
  return reverseKeywords[JSON.stringify(rgb)];
}

function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function rgb2lch(args) {
  return lab2lch(rgb2lab(args));
}

function hsl2rgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1, t2, t3, rgb, val;

  if (s == 0) {
    val = l * 255;
    return [val, val, val];
  }

  if (l < 0.5)
    t2 = l * (1 + s);
  else
    t2 = l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 && t3++;
    t3 > 1 && t3--;

    if (6 * t3 < 1)
      val = t1 + (t2 - t1) * 6 * t3;
    else if (2 * t3 < 1)
      val = t2;
    else if (3 * t3 < 2)
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    else
      val = t1;

    rgb[i] = val * 255;
  }

  return rgb;
}

function hsl2hsv(hsl) {
  var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv, v;

  if(l === 0) {
      // no need to do calc on black
      // also avoids divide by 0 error
      return [0, 0, 0];
  }

  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  v = (l + s) / 2;
  sv = (2 * s) / (l + s);
  return [h, sv * 100, v * 100];
}

function hsl2hwb(args) {
  return rgb2hwb(hsl2rgb(args));
}

function hsl2cmyk(args) {
  return rgb2cmyk(hsl2rgb(args));
}

function hsl2keyword(args) {
  return rgb2keyword(hsl2rgb(args));
}


function hsv2rgb(hsv) {
  var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;

  var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - (s * f)),
      t = 255 * v * (1 - (s * (1 - f))),
      v = 255 * v;

  switch(hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
  }
}

function hsv2hsl(hsv) {
  var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl, l;

  l = (2 - s) * v;
  sl = s * v;
  sl /= (l <= 1) ? l : 2 - l;
  sl = sl || 0;
  l /= 2;
  return [h, sl * 100, l * 100];
}

function hsv2hwb(args) {
  return rgb2hwb(hsv2rgb(args))
}

function hsv2cmyk(args) {
  return rgb2cmyk(hsv2rgb(args));
}

function hsv2keyword(args) {
  return rgb2keyword(hsv2rgb(args));
}

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
function hwb2rgb(hwb) {
  var h = hwb[0] / 360,
      wh = hwb[1] / 100,
      bl = hwb[2] / 100,
      ratio = wh + bl,
      i, v, f, n;

  // wh + bl cant be > 1
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }

  i = Math.floor(6 * h);
  v = 1 - bl;
  f = 6 * h - i;
  if ((i & 0x01) != 0) {
    f = 1 - f;
  }
  n = wh + f * (v - wh);  // linear interpolation

  switch (i) {
    default:
    case 6:
    case 0: r = v; g = n; b = wh; break;
    case 1: r = n; g = v; b = wh; break;
    case 2: r = wh; g = v; b = n; break;
    case 3: r = wh; g = n; b = v; break;
    case 4: r = n; g = wh; b = v; break;
    case 5: r = v; g = wh; b = n; break;
  }

  return [r * 255, g * 255, b * 255];
}

function hwb2hsl(args) {
  return rgb2hsl(hwb2rgb(args));
}

function hwb2hsv(args) {
  return rgb2hsv(hwb2rgb(args));
}

function hwb2cmyk(args) {
  return rgb2cmyk(hwb2rgb(args));
}

function hwb2keyword(args) {
  return rgb2keyword(hwb2rgb(args));
}

function cmyk2rgb(cmyk) {
  var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r, g, b;

  r = 1 - Math.min(1, c * (1 - k) + k);
  g = 1 - Math.min(1, m * (1 - k) + k);
  b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
}

function cmyk2hsl(args) {
  return rgb2hsl(cmyk2rgb(args));
}

function cmyk2hsv(args) {
  return rgb2hsv(cmyk2rgb(args));
}

function cmyk2hwb(args) {
  return rgb2hwb(cmyk2rgb(args));
}

function cmyk2keyword(args) {
  return rgb2keyword(cmyk2rgb(args));
}


function xyz2rgb(xyz) {
  var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r, g, b;

  r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  // assume sRGB
  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);

  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return [r * 255, g * 255, b * 255];
}

function xyz2lab(xyz) {
  var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function xyz2lch(args) {
  return lab2lch(xyz2lab(args));
}

function lab2xyz(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      x, y, z, y2;

  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1/3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

  return [x, y, z];
}

function lab2lch(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      hr, h, c;

  hr = Math.atan2(b, a);
  h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  c = Math.sqrt(a * a + b * b);
  return [l, c, h];
}

function lab2rgb(args) {
  return xyz2rgb(lab2xyz(args));
}

function lch2lab(lch) {
  var l = lch[0],
      c = lch[1],
      h = lch[2],
      a, b, hr;

  hr = h / 360 * 2 * Math.PI;
  a = c * Math.cos(hr);
  b = c * Math.sin(hr);
  return [l, a, b];
}

function lch2xyz(args) {
  return lab2xyz(lch2lab(args));
}

function lch2rgb(args) {
  return lab2rgb(lch2lab(args));
}

function keyword2rgb(keyword) {
  return cssKeywords[keyword];
}

function keyword2hsl(args) {
  return rgb2hsl(keyword2rgb(args));
}

function keyword2hsv(args) {
  return rgb2hsv(keyword2rgb(args));
}

function keyword2hwb(args) {
  return rgb2hwb(keyword2rgb(args));
}

function keyword2cmyk(args) {
  return rgb2cmyk(keyword2rgb(args));
}

function keyword2lab(args) {
  return rgb2lab(keyword2rgb(args));
}

function keyword2xyz(args) {
  return rgb2xyz(keyword2rgb(args));
}

var cssKeywords = {
  aliceblue:  [240,248,255],
  antiquewhite: [250,235,215],
  aqua: [0,255,255],
  aquamarine: [127,255,212],
  azure:  [240,255,255],
  beige:  [245,245,220],
  bisque: [255,228,196],
  black:  [0,0,0],
  blanchedalmond: [255,235,205],
  blue: [0,0,255],
  blueviolet: [138,43,226],
  brown:  [165,42,42],
  burlywood:  [222,184,135],
  cadetblue:  [95,158,160],
  chartreuse: [127,255,0],
  chocolate:  [210,105,30],
  coral:  [255,127,80],
  cornflowerblue: [100,149,237],
  cornsilk: [255,248,220],
  crimson:  [220,20,60],
  cyan: [0,255,255],
  darkblue: [0,0,139],
  darkcyan: [0,139,139],
  darkgoldenrod:  [184,134,11],
  darkgray: [169,169,169],
  darkgreen:  [0,100,0],
  darkgrey: [169,169,169],
  darkkhaki:  [189,183,107],
  darkmagenta:  [139,0,139],
  darkolivegreen: [85,107,47],
  darkorange: [255,140,0],
  darkorchid: [153,50,204],
  darkred:  [139,0,0],
  darksalmon: [233,150,122],
  darkseagreen: [143,188,143],
  darkslateblue:  [72,61,139],
  darkslategray:  [47,79,79],
  darkslategrey:  [47,79,79],
  darkturquoise:  [0,206,209],
  darkviolet: [148,0,211],
  deeppink: [255,20,147],
  deepskyblue:  [0,191,255],
  dimgray:  [105,105,105],
  dimgrey:  [105,105,105],
  dodgerblue: [30,144,255],
  firebrick:  [178,34,34],
  floralwhite:  [255,250,240],
  forestgreen:  [34,139,34],
  fuchsia:  [255,0,255],
  gainsboro:  [220,220,220],
  ghostwhite: [248,248,255],
  gold: [255,215,0],
  goldenrod:  [218,165,32],
  gray: [128,128,128],
  green:  [0,128,0],
  greenyellow:  [173,255,47],
  grey: [128,128,128],
  honeydew: [240,255,240],
  hotpink:  [255,105,180],
  indianred:  [205,92,92],
  indigo: [75,0,130],
  ivory:  [255,255,240],
  khaki:  [240,230,140],
  lavender: [230,230,250],
  lavenderblush:  [255,240,245],
  lawngreen:  [124,252,0],
  lemonchiffon: [255,250,205],
  lightblue:  [173,216,230],
  lightcoral: [240,128,128],
  lightcyan:  [224,255,255],
  lightgoldenrodyellow: [250,250,210],
  lightgray:  [211,211,211],
  lightgreen: [144,238,144],
  lightgrey:  [211,211,211],
  lightpink:  [255,182,193],
  lightsalmon:  [255,160,122],
  lightseagreen:  [32,178,170],
  lightskyblue: [135,206,250],
  lightslategray: [119,136,153],
  lightslategrey: [119,136,153],
  lightsteelblue: [176,196,222],
  lightyellow:  [255,255,224],
  lime: [0,255,0],
  limegreen:  [50,205,50],
  linen:  [250,240,230],
  magenta:  [255,0,255],
  maroon: [128,0,0],
  mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205],
  mediumorchid: [186,85,211],
  mediumpurple: [147,112,219],
  mediumseagreen: [60,179,113],
  mediumslateblue:  [123,104,238],
  mediumspringgreen:  [0,250,154],
  mediumturquoise:  [72,209,204],
  mediumvioletred:  [199,21,133],
  midnightblue: [25,25,112],
  mintcream:  [245,255,250],
  mistyrose:  [255,228,225],
  moccasin: [255,228,181],
  navajowhite:  [255,222,173],
  navy: [0,0,128],
  oldlace:  [253,245,230],
  olive:  [128,128,0],
  olivedrab:  [107,142,35],
  orange: [255,165,0],
  orangered:  [255,69,0],
  orchid: [218,112,214],
  palegoldenrod:  [238,232,170],
  palegreen:  [152,251,152],
  paleturquoise:  [175,238,238],
  palevioletred:  [219,112,147],
  papayawhip: [255,239,213],
  peachpuff:  [255,218,185],
  peru: [205,133,63],
  pink: [255,192,203],
  plum: [221,160,221],
  powderblue: [176,224,230],
  purple: [128,0,128],
  rebeccapurple: [102, 51, 153],
  red:  [255,0,0],
  rosybrown:  [188,143,143],
  royalblue:  [65,105,225],
  saddlebrown:  [139,69,19],
  salmon: [250,128,114],
  sandybrown: [244,164,96],
  seagreen: [46,139,87],
  seashell: [255,245,238],
  sienna: [160,82,45],
  silver: [192,192,192],
  skyblue:  [135,206,235],
  slateblue:  [106,90,205],
  slategray:  [112,128,144],
  slategrey:  [112,128,144],
  snow: [255,250,250],
  springgreen:  [0,255,127],
  steelblue:  [70,130,180],
  tan:  [210,180,140],
  teal: [0,128,128],
  thistle:  [216,191,216],
  tomato: [255,99,71],
  turquoise:  [64,224,208],
  violet: [238,130,238],
  wheat:  [245,222,179],
  white:  [255,255,255],
  whitesmoke: [245,245,245],
  yellow: [255,255,0],
  yellowgreen:  [154,205,50]
};

var reverseKeywords = {};
for (var key in cssKeywords) {
  reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
}

},{}],3:[function(require,module,exports){
var conversions = require("./conversions");

var convert = function() {
   return new Converter();
}

for (var func in conversions) {
  // export Raw versions
  convert[func + "Raw"] =  (function(func) {
    // accept array or plain args
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      return conversions[func](arg);
    }
  })(func);

  var pair = /(\w+)2(\w+)/.exec(func),
      from = pair[1],
      to = pair[2];

  // export rgb2hsl and ["rgb"]["hsl"]
  convert[from] = convert[from] || {};

  convert[from][to] = convert[func] = (function(func) { 
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      
      var val = conversions[func](arg);
      if (typeof val == "string" || val === undefined)
        return val; // keyword

      for (var i = 0; i < val.length; i++)
        val[i] = Math.round(val[i]);
      return val;
    }
  })(func);
}


/* Converter does lazy conversion and caching */
var Converter = function() {
   this.convs = {};
};

/* Either get the values for a space or
  set the values for a space, depending on args */
Converter.prototype.routeSpace = function(space, args) {
   var values = args[0];
   if (values === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof values == "number") {
      values = Array.prototype.slice.call(args);        
   }

   return this.setValues(space, values);
};
  
/* Set the values for a space, invalidating cache */
Converter.prototype.setValues = function(space, values) {
   this.space = space;
   this.convs = {};
   this.convs[space] = values;
   return this;
};

/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
Converter.prototype.getValues = function(space) {
   var vals = this.convs[space];
   if (!vals) {
      var fspace = this.space,
          from = this.convs[fspace];
      vals = convert[fspace][space](from);

      this.convs[space] = vals;
   }
  return vals;
};

["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(space) {
   Converter.prototype[space] = function(vals) {
      return this.routeSpace(space, arguments);
   }
});

module.exports = convert;
},{"./conversions":2}],4:[function(require,module,exports){
/* MIT license */
var colorNames = require('color-name');

module.exports = {
   getRgba: getRgba,
   getHsla: getHsla,
   getRgb: getRgb,
   getHsl: getHsl,
   getHwb: getHwb,
   getAlpha: getAlpha,

   hexString: hexString,
   rgbString: rgbString,
   rgbaString: rgbaString,
   percentString: percentString,
   percentaString: percentaString,
   hslString: hslString,
   hslaString: hslaString,
   hwbString: hwbString,
   keyword: keyword
}

function getRgba(string) {
   if (!string) {
      return;
   }
   var abbr =  /^#([a-fA-F0-9]{3})$/,
       hex =  /^#([a-fA-F0-9]{6})$/,
       rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
       per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
       keyword = /(\D+)/;

   var rgb = [0, 0, 0],
       a = 1,
       match = string.match(abbr);
   if (match) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i] + match[i], 16);
      }
   }
   else if (match = string.match(hex)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
   }
   else if (match = string.match(rgba)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i + 1]);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(per)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(keyword)) {
      if (match[1] == "transparent") {
         return [0, 0, 0, 0];
      }
      rgb = colorNames[match[1]];
      if (!rgb) {
         return;
      }
   }

   for (var i = 0; i < rgb.length; i++) {
      rgb[i] = scale(rgb[i], 0, 255);
   }
   if (!a && a != 0) {
      a = 1;
   }
   else {
      a = scale(a, 0, 1);
   }
   rgb[3] = a;
   return rgb;
}

function getHsla(string) {
   if (!string) {
      return;
   }
   var hsl = /^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hsl);
   if (match) {
      var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          s = scale(parseFloat(match[2]), 0, 100),
          l = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, s, l, a];
   }
}

function getHwb(string) {
   if (!string) {
      return;
   }
   var hwb = /^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hwb);
   if (match) {
    var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          w = scale(parseFloat(match[2]), 0, 100),
          b = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, w, b, a];
   }
}

function getRgb(string) {
   var rgba = getRgba(string);
   return rgba && rgba.slice(0, 3);
}

function getHsl(string) {
  var hsla = getHsla(string);
  return hsla && hsla.slice(0, 3);
}

function getAlpha(string) {
   var vals = getRgba(string);
   if (vals) {
      return vals[3];
   }
   else if (vals = getHsla(string)) {
      return vals[3];
   }
   else if (vals = getHwb(string)) {
      return vals[3];
   }
}

// generators
function hexString(rgb) {
   return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1])
              + hexDouble(rgb[2]);
}

function rgbString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return rgbaString(rgba, alpha);
   }
   return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
}

function rgbaString(rgba, alpha) {
   if (alpha === undefined) {
      alpha = (rgba[3] !== undefined ? rgba[3] : 1);
   }
   return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2]
           + ", " + alpha + ")";
}

function percentString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return percentaString(rgba, alpha);
   }
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);

   return "rgb(" + r + "%, " + g + "%, " + b + "%)";
}

function percentaString(rgba, alpha) {
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);
   return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
}

function hslString(hsla, alpha) {
   if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
      return hslaString(hsla, alpha);
   }
   return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
}

function hslaString(hsla, alpha) {
   if (alpha === undefined) {
      alpha = (hsla[3] !== undefined ? hsla[3] : 1);
   }
   return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, "
           + alpha + ")";
}

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb, alpha) {
   if (alpha === undefined) {
      alpha = (hwb[3] !== undefined ? hwb[3] : 1);
   }
   return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%"
           + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
}

function keyword(rgb) {
  return reverseNames[rgb.slice(0, 3)];
}

// helpers
function scale(num, min, max) {
   return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
  var str = num.toString(16).toUpperCase();
  return (str.length < 2) ? "0" + str : str;
}


//create a list of reverse color names
var reverseNames = {};
for (var name in colorNames) {
   reverseNames[colorNames[name]] = name;
}

},{"color-name":5}],5:[function(require,module,exports){
module.exports={
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
}
},{}],6:[function(require,module,exports){
(function (global){
/*! Native Promise Only
    v0.8.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	// special form of UMD for polyfilling across evironments
	context[name] = context[name] || definition();
	if (typeof module != "undefined" && module.exports) { module.exports = context[name]; }
	else if (typeof define == "function" && define.amd) { define(function $AMD$(){ return context[name]; }); }
})("Promise",typeof global != "undefined" ? global : this,function DEF(){
	/*jshint validthis:true */
	"use strict";

	var builtInProp, cycle, scheduling_queue,
		ToString = Object.prototype.toString,
		timer = (typeof setImmediate != "undefined") ?
			function timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// dammit, IE8.
	try {
		Object.defineProperty({},"x",{});
		builtInProp = function builtInProp(obj,name,val,config) {
			return Object.defineProperty(obj,name,{
				value: val,
				writable: true,
				configurable: config !== false
			});
		};
	}
	catch (err) {
		builtInProp = function builtInProp(obj,name,val) {
			obj[name] = val;
			return obj;
		};
	}

	// Note: using a queue instead of array for efficiency
	scheduling_queue = (function Queue() {
		var first, last, item;

		function Item(fn,self) {
			this.fn = fn;
			this.self = self;
			this.next = void 0;
		}

		return {
			add: function add(fn,self) {
				item = new Item(fn,self);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function drain() {
				var f = first;
				first = last = cycle = void 0;

				while (f) {
					f.fn.call(f.self);
					f = f.next;
				}
			}
		};
	})();

	function schedule(fn,self) {
		scheduling_queue.add(fn,self);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	// promise duck typing
	function isThenable(o) {
		var _then, o_type = typeof o;

		if (o != null &&
			(
				o_type == "object" || o_type == "function"
			)
		) {
			_then = o.then;
		}
		return typeof _then == "function" ? _then : false;
	}

	function notify() {
		for (var i=0; i<this.chain.length; i++) {
			notifyIsolated(
				this,
				(this.state === 1) ? this.chain[i].success : this.chain[i].failure,
				this.chain[i]
			);
		}
		this.chain.length = 0;
	}

	// NOTE: This is a separate function to isolate
	// the `try..catch` so that other code can be
	// optimized better
	function notifyIsolated(self,cb,chain) {
		var ret, _then;
		try {
			if (cb === false) {
				chain.reject(self.msg);
			}
			else {
				if (cb === true) {
					ret = self.msg;
				}
				else {
					ret = cb.call(void 0,self.msg);
				}

				if (ret === chain.promise) {
					chain.reject(TypeError("Promise-chain cycle"));
				}
				else if (_then = isThenable(ret)) {
					_then.call(ret,chain.resolve,chain.reject);
				}
				else {
					chain.resolve(ret);
				}
			}
		}
		catch (err) {
			chain.reject(err);
		}
	}

	function resolve(msg) {
		var _then, self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		try {
			if (_then = isThenable(msg)) {
				schedule(function(){
					var def_wrapper = new MakeDefWrapper(self);
					try {
						_then.call(msg,
							function $resolve$(){ resolve.apply(def_wrapper,arguments); },
							function $reject$(){ reject.apply(def_wrapper,arguments); }
						);
					}
					catch (err) {
						reject.call(def_wrapper,err);
					}
				})
			}
			else {
				self.msg = msg;
				self.state = 1;
				if (self.chain.length > 0) {
					schedule(notify,self);
				}
			}
		}
		catch (err) {
			reject.call(new MakeDefWrapper(self),err);
		}
	}

	function reject(msg) {
		var self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		self.msg = msg;
		self.state = 2;
		if (self.chain.length > 0) {
			schedule(notify,self);
		}
	}

	function iteratePromises(Constructor,arr,resolver,rejecter) {
		for (var idx=0; idx<arr.length; idx++) {
			(function IIFE(idx){
				Constructor.resolve(arr[idx])
				.then(
					function $resolver$(msg){
						resolver(idx,msg);
					},
					rejecter
				);
			})(idx);
		}
	}

	function MakeDefWrapper(self) {
		this.def = self;
		this.triggered = false;
	}

	function MakeDef(self) {
		this.promise = self;
		this.state = 0;
		this.triggered = false;
		this.chain = [];
		this.msg = void 0;
	}

	function Promise(executor) {
		if (typeof executor != "function") {
			throw TypeError("Not a function");
		}

		if (this.__NPO__ !== 0) {
			throw TypeError("Not a promise");
		}

		// instance shadowing the inherited "brand"
		// to signal an already "initialized" promise
		this.__NPO__ = 1;

		var def = new MakeDef(this);

		this["then"] = function then(success,failure) {
			var o = {
				success: typeof success == "function" ? success : true,
				failure: typeof failure == "function" ? failure : false
			};
			// Note: `then(..)` itself can be borrowed to be used against
			// a different promise constructor for making the chained promise,
			// by substituting a different `this` binding.
			o.promise = new this.constructor(function extractChain(resolve,reject) {
				if (typeof resolve != "function" || typeof reject != "function") {
					throw TypeError("Not a function");
				}

				o.resolve = resolve;
				o.reject = reject;
			});
			def.chain.push(o);

			if (def.state !== 0) {
				schedule(notify,def);
			}

			return o.promise;
		};
		this["catch"] = function $catch$(failure) {
			return this.then(void 0,failure);
		};

		try {
			executor.call(
				void 0,
				function publicResolve(msg){
					resolve.call(def,msg);
				},
				function publicReject(msg) {
					reject.call(def,msg);
				}
			);
		}
		catch (err) {
			reject.call(def,err);
		}
	}

	var PromisePrototype = builtInProp({},"constructor",Promise,
		/*configurable=*/false
	);

	// Note: Android 4 cannot use `Object.defineProperty(..)` here
	Promise.prototype = PromisePrototype;

	// built-in "brand" to signal an "uninitialized" promise
	builtInProp(PromisePrototype,"__NPO__",0,
		/*configurable=*/false
	);

	builtInProp(Promise,"resolve",function Promise$resolve(msg) {
		var Constructor = this;

		// spec mandated checks
		// note: best "isPromise" check that's practical for now
		if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
			return msg;
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			resolve(msg);
		});
	});

	builtInProp(Promise,"reject",function Promise$reject(msg) {
		return new this(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			reject(msg);
		});
	});

	builtInProp(Promise,"all",function Promise$all(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}
		if (arr.length === 0) {
			return Constructor.resolve([]);
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			var len = arr.length, msgs = Array(len), count = 0;

			iteratePromises(Constructor,arr,function resolver(idx,msg) {
				msgs[idx] = msg;
				if (++count === len) {
					resolve(msgs);
				}
			},reject);
		});
	});

	builtInProp(Promise,"race",function Promise$race(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			iteratePromises(Constructor,arr,function resolver(idx,msg){
				resolve(msg);
			},reject);
		});
	});

	return Promise;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
'use strict';

// # simple-statistics
//
// A simple, literate statistics system.

var ss = module.exports = {};

// Linear Regression
ss.linearRegression = require('./src/linear_regression');
ss.linearRegressionLine = require('./src/linear_regression_line');
ss.standardDeviation = require('./src/standard_deviation');
ss.rSquared = require('./src/r_squared');
ss.mode = require('./src/mode');
ss.min = require('./src/min');
ss.max = require('./src/max');
ss.sum = require('./src/sum');
ss.quantile = require('./src/quantile');
ss.quantileSorted = require('./src/quantile_sorted');
ss.iqr = ss.interquartileRange = require('./src/interquartile_range');
ss.medianAbsoluteDeviation = ss.mad = require('./src/mad');
ss.chunk = require('./src/chunk');
ss.shuffle = require('./src/shuffle');
ss.shuffleInPlace = require('./src/shuffle_in_place');
ss.sample = require('./src/sample');
ss.ckmeans = require('./src/ckmeans');
ss.sortedUniqueCount = require('./src/sorted_unique_count');
ss.sumNthPowerDeviations = require('./src/sum_nth_power_deviations');

// sample statistics
ss.sampleCovariance = require('./src/sample_covariance');
ss.sampleCorrelation = require('./src/sample_correlation');
ss.sampleVariance = require('./src/sample_variance');
ss.sampleStandardDeviation = require('./src/sample_standard_deviation');
ss.sampleSkewness = require('./src/sample_skewness');

// measures of centrality
ss.geometricMean = require('./src/geometric_mean');
ss.harmonicMean = require('./src/harmonic_mean');
ss.mean = ss.average = require('./src/mean');
ss.median = require('./src/median');

ss.rootMeanSquare = ss.rms = require('./src/root_mean_square');
ss.variance = require('./src/variance');
ss.tTest = require('./src/t_test');
ss.tTestTwoSample = require('./src/t_test_two_sample');
// ss.jenks = require('./src/jenks');

// Classifiers
ss.bayesian = require('./src/bayesian_classifier');
ss.perceptron = require('./src/perceptron');

// Distribution-related methods
ss.epsilon = require('./src/epsilon'); // We make ε available to the test suite.
ss.factorial = require('./src/factorial');
ss.bernoulliDistribution = require('./src/bernoulli_distribution');
ss.binomialDistribution = require('./src/binomial_distribution');
ss.poissonDistribution = require('./src/poisson_distribution');
ss.chiSquaredGoodnessOfFit = require('./src/chi_squared_goodness_of_fit');

// Normal distribution
ss.zScore = require('./src/z_score');
ss.cumulativeStdNormalProbability = require('./src/cumulative_std_normal_probability');
ss.standardNormalTable = require('./src/standard_normal_table');
ss.errorFunction = ss.erf = require('./src/error_function');
ss.inverseErrorFunction = require('./src/inverse_error_function');
ss.probit = require('./src/probit');
ss.mixin = require('./src/mixin');

},{"./src/bayesian_classifier":8,"./src/bernoulli_distribution":9,"./src/binomial_distribution":10,"./src/chi_squared_goodness_of_fit":12,"./src/chunk":13,"./src/ckmeans":14,"./src/cumulative_std_normal_probability":15,"./src/epsilon":16,"./src/error_function":17,"./src/factorial":18,"./src/geometric_mean":19,"./src/harmonic_mean":20,"./src/interquartile_range":21,"./src/inverse_error_function":22,"./src/linear_regression":23,"./src/linear_regression_line":24,"./src/mad":25,"./src/max":26,"./src/mean":27,"./src/median":28,"./src/min":29,"./src/mixin":30,"./src/mode":31,"./src/perceptron":33,"./src/poisson_distribution":34,"./src/probit":35,"./src/quantile":36,"./src/quantile_sorted":37,"./src/r_squared":38,"./src/root_mean_square":39,"./src/sample":40,"./src/sample_correlation":41,"./src/sample_covariance":42,"./src/sample_skewness":43,"./src/sample_standard_deviation":44,"./src/sample_variance":45,"./src/shuffle":46,"./src/shuffle_in_place":47,"./src/sorted_unique_count":48,"./src/standard_deviation":49,"./src/standard_normal_table":50,"./src/sum":51,"./src/sum_nth_power_deviations":52,"./src/t_test":53,"./src/t_test_two_sample":54,"./src/variance":55,"./src/z_score":56}],8:[function(require,module,exports){
'use strict';

/**
 * [Bayesian Classifier](http://en.wikipedia.org/wiki/Naive_Bayes_classifier)
 *
 * This is a naïve bayesian classifier that takes
 * singly-nested objects.
 *
 * @class
 * @example
 * var bayes = new BayesianClassifier();
 * bayes.train({
 *   species: 'Cat'
 * }, 'animal');
 * var result = bayes.score({
 *   species: 'Cat'
 * })
 * // result
 * // {
 * //   animal: 1
 * // }
 */
function BayesianClassifier() {
    // The number of items that are currently
    // classified in the model
    this.totalCount = 0;
    // Every item classified in the model
    this.data = {};
}

/**
 * Train the classifier with a new item, which has a single
 * dimension of Javascript literal keys and values.
 *
 * @param {Object} item an object with singly-deep properties
 * @param {string} category the category this item belongs to
 * @return {undefined} adds the item to the classifier
 */
BayesianClassifier.prototype.train = function(item, category) {
    // If the data object doesn't have any values
    // for this category, create a new object for it.
    if (!this.data[category]) {
        this.data[category] = {};
    }

    // Iterate through each key in the item.
    for (var k in item) {
        var v = item[k];
        // Initialize the nested object `data[category][k][item[k]]`
        // with an object of keys that equal 0.
        if (this.data[category][k] === undefined) {
            this.data[category][k] = {};
        }
        if (this.data[category][k][v] === undefined) {
            this.data[category][k][v] = 0;
        }

        // And increment the key for this key/value combination.
        this.data[category][k][item[k]]++;
    }

    // Increment the number of items classified
    this.totalCount++;
};

/**
 * Generate a score of how well this item matches all
 * possible categories based on its attributes
 *
 * @param {Object} item an item in the same format as with train
 * @returns {Object} of probabilities that this item belongs to a
 * given category.
 */
BayesianClassifier.prototype.score = function(item) {
    // Initialize an empty array of odds per category.
    var odds = {}, category;
    // Iterate through each key in the item,
    // then iterate through each category that has been used
    // in previous calls to `.train()`
    for (var k in item) {
        var v = item[k];
        for (category in this.data) {
            // Create an empty object for storing key - value combinations
            // for this category.
            if (odds[category] === undefined) { odds[category] = {}; }

            // If this item doesn't even have a property, it counts for nothing,
            // but if it does have the property that we're looking for from
            // the item to categorize, it counts based on how popular it is
            // versus the whole population.
            if (this.data[category][k]) {
                odds[category][k + '_' + v] = (this.data[category][k][v] || 0) / this.totalCount;
            } else {
                odds[category][k + '_' + v] = 0;
            }
        }
    }

    // Set up a new object that will contain sums of these odds by category
    var oddsSums = {};

    for (category in odds) {
        // Tally all of the odds for each category-combination pair -
        // the non-existence of a category does not add anything to the
        // score.
        for (var combination in odds[category]) {
            if (oddsSums[category] === undefined) {
                oddsSums[category] = 0;
            }
            oddsSums[category] += odds[category][combination];
        }
    }

    return oddsSums;
};

module.exports = BayesianClassifier;

},{}],9:[function(require,module,exports){
'use strict';

var binomialDistribution = require('./binomial_distribution');

/**
 * The [Bernoulli distribution](http://en.wikipedia.org/wiki/Bernoulli_distribution)
 * is the probability discrete
 * distribution of a random variable which takes value 1 with success
 * probability `p` and value 0 with failure
 * probability `q` = 1 - `p`. It can be used, for example, to represent the
 * toss of a coin, where "1" is defined to mean "heads" and "0" is defined
 * to mean "tails" (or vice versa). It is
 * a special case of a Binomial Distribution
 * where `n` = 1.
 *
 * @param {number} p input value, between 0 and 1 inclusive
 * @returns {number} value of bernoulli distribution at this point
 */
function bernoulliDistribution(p) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1)
    if (p < 0 || p > 1 ) { return null; }

    return binomialDistribution(1, p);
}

module.exports = bernoulliDistribution;

},{"./binomial_distribution":10}],10:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var factorial = require('./factorial');

/**
 * The [Binomial Distribution](http://en.wikipedia.org/wiki/Binomial_distribution) is the discrete probability
 * distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields
 * success with probability `probability`. Such a success/failure experiment is also called a Bernoulli experiment or
 * Bernoulli trial; when trials = 1, the Binomial Distribution is a Bernoulli Distribution.
 *
 * @param {number} trials number of trials to simulate
 * @param {number} probability
 * @returns {number} output
 */
function binomialDistribution(trials, probability) {
    // Check that `p` is a valid probability (0 ≤ p ≤ 1),
    // that `n` is an integer, strictly positive.
    if (probability < 0 || probability > 1 ||
        trials <= 0 || trials % 1 !== 0) {
        return null;
    }

    // We initialize `x`, the random variable, and `accumulator`, an accumulator
    // for the cumulative distribution function to 0. `distribution_functions`
    // is the object we'll return with the `probability_of_x` and the
    // `cumulativeProbability_of_x`, as well as the calculated mean &
    // variance. We iterate until the `cumulativeProbability_of_x` is
    // within `epsilon` of 1.0.
    var x = 0,
        cumulativeProbability = 0,
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = factorial(trials) /
            (factorial(x) * factorial(trials - x)) *
            (Math.pow(probability, x) * Math.pow(1 - probability, trials - x));
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = binomialDistribution;

},{"./epsilon":16,"./factorial":18}],11:[function(require,module,exports){
'use strict';

/**
 * **Percentage Points of the χ2 (Chi-Squared) Distribution**
 *
 * The [χ2 (Chi-Squared) Distribution](http://en.wikipedia.org/wiki/Chi-squared_distribution) is used in the common
 * chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two
 * criteria of classification of qualitative data, and in confidence interval estimation for a population standard
 * deviation of a normal distribution from a sample standard deviation.
 *
 * Values from Appendix 1, Table III of William W. Hines & Douglas C. Montgomery, "Probability and Statistics in
 * Engineering and Management Science", Wiley (1980).
 */
var chiSquaredDistributionTable = {
    1: { 0.995:  0.00, 0.99:  0.00, 0.975:  0.00, 0.95:  0.00, 0.9:  0.02, 0.5:  0.45, 0.1:  2.71, 0.05:  3.84, 0.025:  5.02, 0.01:  6.63, 0.005:  7.88 },
    2: { 0.995:  0.01, 0.99:  0.02, 0.975:  0.05, 0.95:  0.10, 0.9:  0.21, 0.5:  1.39, 0.1:  4.61, 0.05:  5.99, 0.025:  7.38, 0.01:  9.21, 0.005: 10.60 },
    3: { 0.995:  0.07, 0.99:  0.11, 0.975:  0.22, 0.95:  0.35, 0.9:  0.58, 0.5:  2.37, 0.1:  6.25, 0.05:  7.81, 0.025:  9.35, 0.01: 11.34, 0.005: 12.84 },
    4: { 0.995:  0.21, 0.99:  0.30, 0.975:  0.48, 0.95:  0.71, 0.9:  1.06, 0.5:  3.36, 0.1:  7.78, 0.05:  9.49, 0.025: 11.14, 0.01: 13.28, 0.005: 14.86 },
    5: { 0.995:  0.41, 0.99:  0.55, 0.975:  0.83, 0.95:  1.15, 0.9:  1.61, 0.5:  4.35, 0.1:  9.24, 0.05: 11.07, 0.025: 12.83, 0.01: 15.09, 0.005: 16.75 },
    6: { 0.995:  0.68, 0.99:  0.87, 0.975:  1.24, 0.95:  1.64, 0.9:  2.20, 0.5:  5.35, 0.1: 10.65, 0.05: 12.59, 0.025: 14.45, 0.01: 16.81, 0.005: 18.55 },
    7: { 0.995:  0.99, 0.99:  1.25, 0.975:  1.69, 0.95:  2.17, 0.9:  2.83, 0.5:  6.35, 0.1: 12.02, 0.05: 14.07, 0.025: 16.01, 0.01: 18.48, 0.005: 20.28 },
    8: { 0.995:  1.34, 0.99:  1.65, 0.975:  2.18, 0.95:  2.73, 0.9:  3.49, 0.5:  7.34, 0.1: 13.36, 0.05: 15.51, 0.025: 17.53, 0.01: 20.09, 0.005: 21.96 },
    9: { 0.995:  1.73, 0.99:  2.09, 0.975:  2.70, 0.95:  3.33, 0.9:  4.17, 0.5:  8.34, 0.1: 14.68, 0.05: 16.92, 0.025: 19.02, 0.01: 21.67, 0.005: 23.59 },
    10: { 0.995:  2.16, 0.99:  2.56, 0.975:  3.25, 0.95:  3.94, 0.9:  4.87, 0.5:  9.34, 0.1: 15.99, 0.05: 18.31, 0.025: 20.48, 0.01: 23.21, 0.005: 25.19 },
    11: { 0.995:  2.60, 0.99:  3.05, 0.975:  3.82, 0.95:  4.57, 0.9:  5.58, 0.5: 10.34, 0.1: 17.28, 0.05: 19.68, 0.025: 21.92, 0.01: 24.72, 0.005: 26.76 },
    12: { 0.995:  3.07, 0.99:  3.57, 0.975:  4.40, 0.95:  5.23, 0.9:  6.30, 0.5: 11.34, 0.1: 18.55, 0.05: 21.03, 0.025: 23.34, 0.01: 26.22, 0.005: 28.30 },
    13: { 0.995:  3.57, 0.99:  4.11, 0.975:  5.01, 0.95:  5.89, 0.9:  7.04, 0.5: 12.34, 0.1: 19.81, 0.05: 22.36, 0.025: 24.74, 0.01: 27.69, 0.005: 29.82 },
    14: { 0.995:  4.07, 0.99:  4.66, 0.975:  5.63, 0.95:  6.57, 0.9:  7.79, 0.5: 13.34, 0.1: 21.06, 0.05: 23.68, 0.025: 26.12, 0.01: 29.14, 0.005: 31.32 },
    15: { 0.995:  4.60, 0.99:  5.23, 0.975:  6.27, 0.95:  7.26, 0.9:  8.55, 0.5: 14.34, 0.1: 22.31, 0.05: 25.00, 0.025: 27.49, 0.01: 30.58, 0.005: 32.80 },
    16: { 0.995:  5.14, 0.99:  5.81, 0.975:  6.91, 0.95:  7.96, 0.9:  9.31, 0.5: 15.34, 0.1: 23.54, 0.05: 26.30, 0.025: 28.85, 0.01: 32.00, 0.005: 34.27 },
    17: { 0.995:  5.70, 0.99:  6.41, 0.975:  7.56, 0.95:  8.67, 0.9: 10.09, 0.5: 16.34, 0.1: 24.77, 0.05: 27.59, 0.025: 30.19, 0.01: 33.41, 0.005: 35.72 },
    18: { 0.995:  6.26, 0.99:  7.01, 0.975:  8.23, 0.95:  9.39, 0.9: 10.87, 0.5: 17.34, 0.1: 25.99, 0.05: 28.87, 0.025: 31.53, 0.01: 34.81, 0.005: 37.16 },
    19: { 0.995:  6.84, 0.99:  7.63, 0.975:  8.91, 0.95: 10.12, 0.9: 11.65, 0.5: 18.34, 0.1: 27.20, 0.05: 30.14, 0.025: 32.85, 0.01: 36.19, 0.005: 38.58 },
    20: { 0.995:  7.43, 0.99:  8.26, 0.975:  9.59, 0.95: 10.85, 0.9: 12.44, 0.5: 19.34, 0.1: 28.41, 0.05: 31.41, 0.025: 34.17, 0.01: 37.57, 0.005: 40.00 },
    21: { 0.995:  8.03, 0.99:  8.90, 0.975: 10.28, 0.95: 11.59, 0.9: 13.24, 0.5: 20.34, 0.1: 29.62, 0.05: 32.67, 0.025: 35.48, 0.01: 38.93, 0.005: 41.40 },
    22: { 0.995:  8.64, 0.99:  9.54, 0.975: 10.98, 0.95: 12.34, 0.9: 14.04, 0.5: 21.34, 0.1: 30.81, 0.05: 33.92, 0.025: 36.78, 0.01: 40.29, 0.005: 42.80 },
    23: { 0.995:  9.26, 0.99: 10.20, 0.975: 11.69, 0.95: 13.09, 0.9: 14.85, 0.5: 22.34, 0.1: 32.01, 0.05: 35.17, 0.025: 38.08, 0.01: 41.64, 0.005: 44.18 },
    24: { 0.995:  9.89, 0.99: 10.86, 0.975: 12.40, 0.95: 13.85, 0.9: 15.66, 0.5: 23.34, 0.1: 33.20, 0.05: 36.42, 0.025: 39.36, 0.01: 42.98, 0.005: 45.56 },
    25: { 0.995: 10.52, 0.99: 11.52, 0.975: 13.12, 0.95: 14.61, 0.9: 16.47, 0.5: 24.34, 0.1: 34.28, 0.05: 37.65, 0.025: 40.65, 0.01: 44.31, 0.005: 46.93 },
    26: { 0.995: 11.16, 0.99: 12.20, 0.975: 13.84, 0.95: 15.38, 0.9: 17.29, 0.5: 25.34, 0.1: 35.56, 0.05: 38.89, 0.025: 41.92, 0.01: 45.64, 0.005: 48.29 },
    27: { 0.995: 11.81, 0.99: 12.88, 0.975: 14.57, 0.95: 16.15, 0.9: 18.11, 0.5: 26.34, 0.1: 36.74, 0.05: 40.11, 0.025: 43.19, 0.01: 46.96, 0.005: 49.65 },
    28: { 0.995: 12.46, 0.99: 13.57, 0.975: 15.31, 0.95: 16.93, 0.9: 18.94, 0.5: 27.34, 0.1: 37.92, 0.05: 41.34, 0.025: 44.46, 0.01: 48.28, 0.005: 50.99 },
    29: { 0.995: 13.12, 0.99: 14.26, 0.975: 16.05, 0.95: 17.71, 0.9: 19.77, 0.5: 28.34, 0.1: 39.09, 0.05: 42.56, 0.025: 45.72, 0.01: 49.59, 0.005: 52.34 },
    30: { 0.995: 13.79, 0.99: 14.95, 0.975: 16.79, 0.95: 18.49, 0.9: 20.60, 0.5: 29.34, 0.1: 40.26, 0.05: 43.77, 0.025: 46.98, 0.01: 50.89, 0.005: 53.67 },
    40: { 0.995: 20.71, 0.99: 22.16, 0.975: 24.43, 0.95: 26.51, 0.9: 29.05, 0.5: 39.34, 0.1: 51.81, 0.05: 55.76, 0.025: 59.34, 0.01: 63.69, 0.005: 66.77 },
    50: { 0.995: 27.99, 0.99: 29.71, 0.975: 32.36, 0.95: 34.76, 0.9: 37.69, 0.5: 49.33, 0.1: 63.17, 0.05: 67.50, 0.025: 71.42, 0.01: 76.15, 0.005: 79.49 },
    60: { 0.995: 35.53, 0.99: 37.48, 0.975: 40.48, 0.95: 43.19, 0.9: 46.46, 0.5: 59.33, 0.1: 74.40, 0.05: 79.08, 0.025: 83.30, 0.01: 88.38, 0.005: 91.95 },
    70: { 0.995: 43.28, 0.99: 45.44, 0.975: 48.76, 0.95: 51.74, 0.9: 55.33, 0.5: 69.33, 0.1: 85.53, 0.05: 90.53, 0.025: 95.02, 0.01: 100.42, 0.005: 104.22 },
    80: { 0.995: 51.17, 0.99: 53.54, 0.975: 57.15, 0.95: 60.39, 0.9: 64.28, 0.5: 79.33, 0.1: 96.58, 0.05: 101.88, 0.025: 106.63, 0.01: 112.33, 0.005: 116.32 },
    90: { 0.995: 59.20, 0.99: 61.75, 0.975: 65.65, 0.95: 69.13, 0.9: 73.29, 0.5: 89.33, 0.1: 107.57, 0.05: 113.14, 0.025: 118.14, 0.01: 124.12, 0.005: 128.30 },
    100: { 0.995: 67.33, 0.99: 70.06, 0.975: 74.22, 0.95: 77.93, 0.9: 82.36, 0.5: 99.33, 0.1: 118.50, 0.05: 124.34, 0.025: 129.56, 0.01: 135.81, 0.005: 140.17 }
};

module.exports = chiSquaredDistributionTable;

},{}],12:[function(require,module,exports){
'use strict';

var mean = require('./mean');
var chiSquaredDistributionTable = require('./chi_squared_distribution_table');

/**
 * The [χ2 (Chi-Squared) Goodness-of-Fit Test](http://en.wikipedia.org/wiki/Goodness_of_fit#Pearson.27s_chi-squared_test)
 * uses a measure of goodness of fit which is the sum of differences between observed and expected outcome frequencies
 * (that is, counts of observations), each squared and divided by the number of observations expected given the
 * hypothesized distribution. The resulting χ2 statistic, `chiSquared`, can be compared to the chi-squared distribution
 * to determine the goodness of fit. In order to determine the degrees of freedom of the chi-squared distribution, one
 * takes the total number of observed frequencies and subtracts the number of estimated parameters. The test statistic
 * follows, approximately, a chi-square distribution with (k − c) degrees of freedom where `k` is the number of non-empty
 * cells and `c` is the number of estimated parameters for the distribution.
 *
 * @param {Array<number>} data
 * @param {Function} distributionType a function that returns a point in a distribution:
 * for instance, binomial, bernoulli, or poisson
 * @param {number} significance
 * @returns {number} chi squared goodness of fit
 * @example
 * // Data from Poisson goodness-of-fit example 10-19 in William W. Hines & Douglas C. Montgomery,
 * // "Probability and Statistics in Engineering and Management Science", Wiley (1980).
 * var data1019 = [
 *     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 *     0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 *     1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
 *     2, 2, 2, 2, 2, 2, 2, 2, 2,
 *     3, 3, 3, 3
 * ];
 * ss.chiSquaredGoodnessOfFit(data1019, ss.poissonDistribution, 0.05)); //= false
 */
function chiSquaredGoodnessOfFit(data, distributionType, significance) {
    // Estimate from the sample data, a weighted mean.
    var inputMean = mean(data),
        // Calculated value of the χ2 statistic.
        chiSquared = 0,
        // Degrees of freedom, calculated as (number of class intervals -
        // number of hypothesized distribution parameters estimated - 1)
        degreesOfFreedom,
        // Number of hypothesized distribution parameters estimated, expected to be supplied in the distribution test.
        // Lose one degree of freedom for estimating `lambda` from the sample data.
        c = 1,
        // The hypothesized distribution.
        // Generate the hypothesized distribution.
        hypothesizedDistribution = distributionType(inputMean),
        observedFrequencies = [],
        expectedFrequencies = [],
        k;

    // Create an array holding a histogram from the sample data, of
    // the form `{ value: numberOfOcurrences }`
    for (var i = 0; i < data.length; i++) {
        if (observedFrequencies[data[i]] === undefined) {
            observedFrequencies[data[i]] = 0;
        }
        observedFrequencies[data[i]]++;
    }

    // The histogram we created might be sparse - there might be gaps
    // between values. So we iterate through the histogram, making
    // sure that instead of undefined, gaps have 0 values.
    for (i = 0; i < observedFrequencies.length; i++) {
        if (observedFrequencies[i] === undefined) {
            observedFrequencies[i] = 0;
        }
    }

    // Create an array holding a histogram of expected data given the
    // sample size and hypothesized distribution.
    for (k in hypothesizedDistribution) {
        if (k in observedFrequencies) {
            expectedFrequencies[k] = hypothesizedDistribution[k] * data.length;
        }
    }

    // Working backward through the expected frequencies, collapse classes
    // if less than three observations are expected for a class.
    // This transformation is applied to the observed frequencies as well.
    for (k = expectedFrequencies.length - 1; k >= 0; k--) {
        if (expectedFrequencies[k] < 3) {
            expectedFrequencies[k - 1] += expectedFrequencies[k];
            expectedFrequencies.pop();

            observedFrequencies[k - 1] += observedFrequencies[k];
            observedFrequencies.pop();
        }
    }

    // Iterate through the squared differences between observed & expected
    // frequencies, accumulating the `chiSquared` statistic.
    for (k = 0; k < observedFrequencies.length; k++) {
        chiSquared += Math.pow(
            observedFrequencies[k] - expectedFrequencies[k], 2) /
            expectedFrequencies[k];
    }

    // Calculate degrees of freedom for this test and look it up in the
    // `chiSquaredDistributionTable` in order to
    // accept or reject the goodness-of-fit of the hypothesized distribution.
    degreesOfFreedom = observedFrequencies.length - c - 1;
    return chiSquaredDistributionTable[degreesOfFreedom][significance] < chiSquared;
}

module.exports = chiSquaredGoodnessOfFit;

},{"./chi_squared_distribution_table":11,"./mean":27}],13:[function(require,module,exports){
'use strict';

/**
 * Split an array into chunks of a specified size. This function
 * has the same behavior as [PHP's array_chunk](http://php.net/manual/en/function.array-chunk.php)
 * function, and thus will insert smaller-sized chunks at the end if
 * the input size is not divisible by the chunk size.
 *
 * `sample` is expected to be an array, and `chunkSize` a number.
 * The `sample` array can contain any kind of data.
 *
 * @param {Array} sample any array of values
 * @param {number} chunkSize size of each output array
 * @returns {Array<Array>} a chunked array
 * @example
 * console.log(chunk([1, 2, 3, 4], 2)); // [[1, 2], [3, 4]]
 */
function chunk(sample, chunkSize) {

    // a list of result chunks, as arrays in an array
    var output = [];

    // `chunkSize` must be zero or higher - otherwise the loop below,
    // in which we call `start += chunkSize`, will loop infinitely.
    // So, we'll detect and return null in that case to indicate
    // invalid input.
    if (chunkSize <= 0) {
        return null;
    }

    // `start` is the index at which `.slice` will start selecting
    // new array elements
    for (var start = 0; start < sample.length; start += chunkSize) {

        // for each chunk, slice that part of the array and add it
        // to the output. The `.slice` function does not change
        // the original array.
        output.push(sample.slice(start, start + chunkSize));
    }
    return output;
}

module.exports = chunk;

},{}],14:[function(require,module,exports){
'use strict';

var sortedUniqueCount = require('./sorted_unique_count'),
    numericSort = require('./numeric_sort');

/**
 * Create a new column x row matrix.
 *
 * @private
 * @param {number} columns
 * @param {number} rows
 * @return {Array<Array<number>>} matrix
 * @example
 * makeMatrix(10, 10);
 */
function makeMatrix(columns, rows) {
    var matrix = [];
    for (var i = 0; i < columns; i++) {
        var column = [];
        for (var j = 0; j < rows; j++) {
            column.push(0);
        }
        matrix.push(column);
    }
    return matrix;
}

/**
 * Ckmeans clustering is an improvement on heuristic-based clustering
 * approaches like Jenks. The algorithm was developed in
 * [Haizhou Wang and Mingzhou Song](http://journal.r-project.org/archive/2011-2/RJournal_2011-2_Wang+Song.pdf)
 * as a [dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming) approach
 * to the problem of clustering numeric data into groups with the least
 * within-group sum-of-squared-deviations.
 *
 * Minimizing the difference within groups - what Wang & Song refer to as
 * `withinss`, or within sum-of-squares, means that groups are optimally
 * homogenous within and the data is split into representative groups.
 * This is very useful for visualization, where you may want to represent
 * a continuous variable in discrete color or style groups. This function
 * can provide groups that emphasize differences between data.
 *
 * Being a dynamic approach, this algorithm is based on two matrices that
 * store incrementally-computed values for squared deviations and backtracking
 * indexes.
 *
 * Unlike the [original implementation](https://cran.r-project.org/web/packages/Ckmeans.1d.dp/index.html),
 * this implementation does not include any code to automatically determine
 * the optimal number of clusters: this information needs to be explicitly
 * provided.
 *
 * ### References
 * _Ckmeans.1d.dp: Optimal k-means Clustering in One Dimension by Dynamic
 * Programming_ Haizhou Wang and Mingzhou Song ISSN 2073-4859
 *
 * from The R Journal Vol. 3/2, December 2011
 * @param {Array<number>} data input data, as an array of number values
 * @param {number} nClusters number of desired classes. This cannot be
 * greater than the number of values in the data array.
 * @returns {Array<Array<number>>} clustered input
 * @example
 * ckmeans([-1, 2, -1, 2, 4, 5, 6, -1, 2, -1], 3);
 * // The input, clustered into groups of similar numbers.
 * //= [[-1, -1, -1, -1], [2, 2, 2], [4, 5, 6]]);
 */
function ckmeans(data, nClusters) {

    if (nClusters > data.length) {
        throw new Error('Cannot generate more classes than there are data values');
    }

    var sorted = numericSort(data),
        // we'll use this as the maximum number of clusters
        uniqueCount = sortedUniqueCount(sorted);

    // if all of the input values are identical, there's one cluster
    // with all of the input in it.
    if (uniqueCount === 1) {
        return [sorted];
    }

    // named 'D' originally
    var matrix = makeMatrix(nClusters, sorted.length),
        // named 'B' originally
        backtrackMatrix = makeMatrix(nClusters, sorted.length);

    // This is a dynamic programming way to solve the problem of minimizing
    // within-cluster sum of squares. It's similar to linear regression
    // in this way, and this calculation incrementally computes the
    // sum of squares that are later read.

    // The outer loop iterates through clusters, from 0 to nClusters.
    for (var cluster = 0; cluster < nClusters; cluster++) {

        // At the start of each loop, the mean starts as the first element
        var firstClusterMean = sorted[0];

        for (var sortedIdx = Math.max(cluster, 1);
             sortedIdx < sorted.length;
             sortedIdx++) {

            if (cluster === 0) {

                // Increase the running sum of squares calculation by this
                // new value
                var squaredDifference = Math.pow(
                    sorted[sortedIdx] - firstClusterMean, 2);
                matrix[cluster][sortedIdx] = matrix[cluster][sortedIdx - 1] +
                    (sortedIdx / (sortedIdx + 1)) * squaredDifference;

                // We're computing a running mean by taking the previous
                // mean value, multiplying it by the number of elements
                // seen so far, and then dividing it by the number of
                // elements total.
                var newSum = sortedIdx * firstClusterMean + sorted[sortedIdx];
                firstClusterMean = newSum / (sortedIdx + 1);

            } else {

                var sumSquaredDistances = 0,
                    meanXJ = 0;

                for (var j = sortedIdx; j >= cluster; j--) {

                    sumSquaredDistances += (sortedIdx - j) /
                        (sortedIdx - j + 1) *
                        Math.pow(sorted[j] - meanXJ, 2);

                    meanXJ = (sorted[j] + (sortedIdx - j) * meanXJ) /
                        (sortedIdx - j + 1);

                    if (j === sortedIdx) {
                        matrix[cluster][sortedIdx] = sumSquaredDistances;
                        backtrackMatrix[cluster][sortedIdx] = j;
                        if (j > 0) {
                            matrix[cluster][sortedIdx] += matrix[cluster - 1][j - 1];
                        }
                    } else {
                        if (j === 0) {
                            if (sumSquaredDistances <= matrix[cluster][sortedIdx]) {
                                matrix[cluster][sortedIdx] = sumSquaredDistances;
                                backtrackMatrix[cluster][sortedIdx] = j;
                            }
                        } else if (sumSquaredDistances + matrix[cluster - 1][j - 1] < matrix[cluster][sortedIdx]) {
                            matrix[cluster][sortedIdx] = sumSquaredDistances + matrix[cluster - 1][j - 1];
                            backtrackMatrix[cluster][sortedIdx] = j;
                        }
                    }
                }
            }
        }
    }

    // The real work of Ckmeans clustering happens in the matrix generation:
    // the generated matrices encode all possible clustering combinations, and
    // once they're generated we can solve for the best clustering groups
    // very quickly.
    var clusters = [],
        clusterRight = backtrackMatrix[0].length - 1;

    // Backtrack the clusters from the dynamic programming matrix. This
    // starts at the bottom-right corner of the matrix (if the top-left is 0, 0),
    // and moves the cluster target with the loop.
    for (cluster = backtrackMatrix.length - 1; cluster >= 0; cluster--) {

        var clusterLeft = backtrackMatrix[cluster][clusterRight];

        // fill the cluster from the sorted input by taking a slice of the
        // array. the backtrack matrix makes this easy - it stores the
        // indexes where the cluster should start and end.
        clusters[cluster] = sorted.slice(clusterLeft, clusterRight + 1);

        if (cluster > 0) {
            clusterRight = clusterLeft - 1;
        }
    }

    return clusters;
}

module.exports = ckmeans;

},{"./numeric_sort":32,"./sorted_unique_count":48}],15:[function(require,module,exports){
'use strict';

var standardNormalTable = require('./standard_normal_table');

/**
 * **[Cumulative Standard Normal Probability](http://en.wikipedia.org/wiki/Standard_normal_table)**
 *
 * Since probability tables cannot be
 * printed for every normal distribution, as there are an infinite variety
 * of normal distributions, it is common practice to convert a normal to a
 * standard normal and then use the standard normal table to find probabilities.
 *
 * You can use `.5 + .5 * errorFunction(x / Math.sqrt(2))` to calculate the probability
 * instead of looking it up in a table.
 *
 * @param {number} z
 * @returns {number} cumulative standard normal probability
 */
function cumulativeStdNormalProbability(z) {

    // Calculate the position of this value.
    var absZ = Math.abs(z),
        // Each row begins with a different
        // significant digit: 0.5, 0.6, 0.7, and so on. Each value in the table
        // corresponds to a range of 0.01 in the input values, so the value is
        // multiplied by 100.
        index = Math.min(Math.round(absZ * 100), standardNormalTable.length - 1);

    // The index we calculate must be in the table as a positive value,
    // but we still pay attention to whether the input is positive
    // or negative, and flip the output value as a last step.
    if (z >= 0) {
        return standardNormalTable[index];
    } else {
        // due to floating-point arithmetic, values in the table with
        // 4 significant figures can nevertheless end up as repeating
        // fractions when they're computed here.
        return +(1 - standardNormalTable[index]).toFixed(4);
    }
}

module.exports = cumulativeStdNormalProbability;

},{"./standard_normal_table":50}],16:[function(require,module,exports){
'use strict';

/**
 * We use `ε`, epsilon, as a stopping criterion when we want to iterate
 * until we're "close enough". Epsilon is a very small number: for
 * simple statistics, that number is **0.0001**
 *
 * This is used in calculations like the binomialDistribution, in which
 * the process of finding a value is [iterative](https://en.wikipedia.org/wiki/Iterative_method):
 * it progresses until it is close enough.
 *
 * Below is an example of using epsilon in [gradient descent](https://en.wikipedia.org/wiki/Gradient_descent),
 * where we're trying to find a local minimum of a function's derivative,
 * given by the `fDerivative` method.
 *
 * @example
 * // From calculation, we expect that the local minimum occurs at x=9/4
 * var x_old = 0;
 * // The algorithm starts at x=6
 * var x_new = 6;
 * var stepSize = 0.01;
 *
 * function fDerivative(x) {
 *   return 4 * Math.pow(x, 3) - 9 * Math.pow(x, 2);
 * }
 *
 * // The loop runs until the difference between the previous
 * // value and the current value is smaller than epsilon - a rough
 * // meaure of 'close enough'
 * while (Math.abs(x_new - x_old) > ss.epsilon) {
 *   x_old = x_new;
 *   x_new = x_old - stepSize * fDerivative(x_old);
 * }
 *
 * console.log('Local minimum occurs at', x_new);
 */
var epsilon = 0.0001;

module.exports = epsilon;

},{}],17:[function(require,module,exports){
'use strict';

/**
 * **[Gaussian error function](http://en.wikipedia.org/wiki/Error_function)**
 *
 * The `errorFunction(x/(sd * Math.sqrt(2)))` is the probability that a value in a
 * normal distribution with standard deviation sd is within x of the mean.
 *
 * This function returns a numerical approximation to the exact value.
 *
 * @param {number} x input
 * @return {number} error estimation
 * @example
 * errorFunction(1); //= 0.8427
 */
function errorFunction(x) {
    var t = 1 / (1 + 0.5 * Math.abs(x));
    var tau = t * Math.exp(-Math.pow(x, 2) -
        1.26551223 +
        1.00002368 * t +
        0.37409196 * Math.pow(t, 2) +
        0.09678418 * Math.pow(t, 3) -
        0.18628806 * Math.pow(t, 4) +
        0.27886807 * Math.pow(t, 5) -
        1.13520398 * Math.pow(t, 6) +
        1.48851587 * Math.pow(t, 7) -
        0.82215223 * Math.pow(t, 8) +
        0.17087277 * Math.pow(t, 9));
    if (x >= 0) {
        return 1 - tau;
    } else {
        return tau - 1;
    }
}

module.exports = errorFunction;

},{}],18:[function(require,module,exports){
'use strict';

/**
 * A [Factorial](https://en.wikipedia.org/wiki/Factorial), usually written n!, is the product of all positive
 * integers less than or equal to n. Often factorial is implemented
 * recursively, but this iterative approach is significantly faster
 * and simpler.
 *
 * @param {number} n input
 * @returns {number} factorial: n!
 * @example
 * console.log(factorial(5)); // 120
 */
function factorial(n) {

    // factorial is mathematically undefined for negative numbers
    if (n < 0 ) { return null; }

    // typically you'll expand the factorial function going down, like
    // 5! = 5 * 4 * 3 * 2 * 1. This is going in the opposite direction,
    // counting from 2 up to the number in question, and since anything
    // multiplied by 1 is itself, the loop only needs to start at 2.
    var accumulator = 1;
    for (var i = 2; i <= n; i++) {
        // for each number up to and including the number `n`, multiply
        // the accumulator my that number.
        accumulator *= i;
    }
    return accumulator;
}

module.exports = factorial;

},{}],19:[function(require,module,exports){
'use strict';

/**
 * The [Geometric Mean](https://en.wikipedia.org/wiki/Geometric_mean) is
 * a mean function that is more useful for numbers in different
 * ranges.
 *
 * This is the nth root of the input numbers multiplied by each other.
 *
 * The geometric mean is often useful for
 * **[proportional growth](https://en.wikipedia.org/wiki/Geometric_mean#Proportional_growth)**: given
 * growth rates for multiple years, like _80%, 16.66% and 42.85%_, a simple
 * mean will incorrectly estimate an average growth rate, whereas a geometric
 * mean will correctly estimate a growth rate that, over those years,
 * will yield the same end value.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input array
 * @returns {number} geometric mean
 * @example
 * var growthRates = [1.80, 1.166666, 1.428571];
 * var averageGrowth = geometricMean(growthRates);
 * var averageGrowthRates = [averageGrowth, averageGrowth, averageGrowth];
 * var startingValue = 10;
 * var startingValueMean = 10;
 * growthRates.forEach(function(rate) {
 *   startingValue *= rate;
 * });
 * averageGrowthRates.forEach(function(rate) {
 *   startingValueMean *= rate;
 * });
 * startingValueMean === startingValue;
 */
function geometricMean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    // the starting value.
    var value = 1;

    for (var i = 0; i < x.length; i++) {
        // the geometric mean is only valid for positive numbers
        if (x[i] <= 0) { return null; }

        // repeatedly multiply the value by each number
        value *= x[i];
    }

    return Math.pow(value, 1 / x.length);
}

module.exports = geometricMean;

},{}],20:[function(require,module,exports){
'use strict';

/**
 * The [Harmonic Mean](https://en.wikipedia.org/wiki/Harmonic_mean) is
 * a mean function typically used to find the average of rates.
 * This mean is calculated by taking the reciprocal of the arithmetic mean
 * of the reciprocals of the input numbers.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array.
 *
 * @param {Array<number>} x input
 * @returns {number} harmonic mean
 * @example
 * ss.harmonicMean([2, 3]) //= 2.4
 */
function harmonicMean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    var reciprocalSum = 0;

    for (var i = 0; i < x.length; i++) {
        // the harmonic mean is only valid for positive numbers
        if (x[i] <= 0) { return null; }

        reciprocalSum += 1 / x[i];
    }

    // divide n by the the reciprocal sum
    return x.length / reciprocalSum;
}

module.exports = harmonicMean;

},{}],21:[function(require,module,exports){
'use strict';

var quantile = require('./quantile');

/**
 * The [Interquartile range](http://en.wikipedia.org/wiki/Interquartile_range) is
 * a measure of statistical dispersion, or how scattered, spread, or
 * concentrated a distribution is. It's computed as the difference between
 * the third quartile and first quartile.
 *
 * @param {Array<number>} sample
 * @returns {number} interquartile range: the span between lower and upper quartile,
 * 0.25 and 0.75
 * @example
 * interquartileRange([0, 1, 2, 3]); //= 2
 */
function interquartileRange(sample) {
    // We can't derive quantiles from an empty list
    if (sample.length === 0) { return null; }

    // Interquartile range is the span between the upper quartile,
    // at `0.75`, and lower quartile, `0.25`
    return quantile(sample, 0.75) - quantile(sample, 0.25);
}

module.exports = interquartileRange;

},{"./quantile":36}],22:[function(require,module,exports){
'use strict';

/**
 * The Inverse [Gaussian error function](http://en.wikipedia.org/wiki/Error_function)
 * returns a numerical approximation to the value that would have caused
 * `errorFunction()` to return x.
 *
 * @param {number} x value of error function
 * @returns {number} estimated inverted value
 */
function inverseErrorFunction(x) {
    var a = (8 * (Math.PI - 3)) / (3 * Math.PI * (4 - Math.PI));

    var inv = Math.sqrt(Math.sqrt(
        Math.pow(2 / (Math.PI * a) + Math.log(1 - x * x) / 2, 2) -
        Math.log(1 - x * x) / a) -
        (2 / (Math.PI * a) + Math.log(1 - x * x) / 2));

    if (x >= 0) {
        return inv;
    } else {
        return -inv;
    }
}

module.exports = inverseErrorFunction;

},{}],23:[function(require,module,exports){
'use strict';

/**
 * [Simple linear regression](http://en.wikipedia.org/wiki/Simple_linear_regression)
 * is a simple way to find a fitted line
 * between a set of coordinates. This algorithm finds the slope and y-intercept of a regression line
 * using the least sum of squares.
 *
 * @param {Array<Array<number>>} data an array of two-element of arrays,
 * like `[[0, 1], [2, 3]]`
 * @returns {Object} object containing slope and intersect of regression line
 * @example
 * linearRegression([[0, 0], [1, 1]]); // { m: 1, b: 0 }
 */
function linearRegression(data) {

    var m, b;

    // Store data length in a local variable to reduce
    // repeated object property lookups
    var dataLength = data.length;

    //if there's only one point, arbitrarily choose a slope of 0
    //and a y-intercept of whatever the y of the initial point is
    if (dataLength === 1) {
        m = 0;
        b = data[0][1];
    } else {
        // Initialize our sums and scope the `m` and `b`
        // variables that define the line.
        var sumX = 0, sumY = 0,
            sumXX = 0, sumXY = 0;

        // Use local variables to grab point values
        // with minimal object property lookups
        var point, x, y;

        // Gather the sum of all x values, the sum of all
        // y values, and the sum of x^2 and (x*y) for each
        // value.
        //
        // In math notation, these would be SS_x, SS_y, SS_xx, and SS_xy
        for (var i = 0; i < dataLength; i++) {
            point = data[i];
            x = point[0];
            y = point[1];

            sumX += x;
            sumY += y;

            sumXX += x * x;
            sumXY += x * y;
        }

        // `m` is the slope of the regression line
        m = ((dataLength * sumXY) - (sumX * sumY)) /
            ((dataLength * sumXX) - (sumX * sumX));

        // `b` is the y-intercept of the line.
        b = (sumY / dataLength) - ((m * sumX) / dataLength);
    }

    // Return both values as an object.
    return {
        m: m,
        b: b
    };
}


module.exports = linearRegression;

},{}],24:[function(require,module,exports){
'use strict';

/**
 * Given the output of `linearRegression`: an object
 * with `m` and `b` values indicating slope and intercept,
 * respectively, generate a line function that translates
 * x values into y values.
 *
 * @param {Object} mb object with `m` and `b` members, representing
 * slope and intersect of desired line
 * @returns {Function} method that computes y-value at any given
 * x-value on the line.
 * @example
 * var l = linearRegressionLine(linearRegression([[0, 0], [1, 1]]));
 * l(0) //= 0
 * l(2) //= 2
 */
function linearRegressionLine(mb) {
    // Return a function that computes a `y` value for each
    // x value it is given, based on the values of `b` and `a`
    // that we just computed.
    return function(x) {
        return mb.b + (mb.m * x);
    };
}

module.exports = linearRegressionLine;

},{}],25:[function(require,module,exports){
'use strict';

var median = require('./median');

/**
 * The [Median Absolute Deviation](http://en.wikipedia.org/wiki/Median_absolute_deviation) is
 * a robust measure of statistical
 * dispersion. It is more resilient to outliers than the standard deviation.
 *
 * @param {Array<number>} x input array
 * @returns {number} median absolute deviation
 * @example
 * mad([1, 1, 2, 2, 4, 6, 9]); //= 1
 */
function mad(x) {
    // The mad of nothing is null
    if (!x || x.length === 0) { return null; }

    var medianValue = median(x),
        medianAbsoluteDeviations = [];

    // Make a list of absolute deviations from the median
    for (var i = 0; i < x.length; i++) {
        medianAbsoluteDeviations.push(Math.abs(x[i] - medianValue));
    }

    // Find the median value of that list
    return median(medianAbsoluteDeviations);
}

module.exports = mad;

},{"./median":28}],26:[function(require,module,exports){
'use strict';

/**
 * This computes the maximum number in an array.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} maximum value
 * @example
 * console.log(max([1, 2, 3, 4])); // 4
 */
function max(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, max is
        // undefined and is thus made the maximum element in the array
        if (x[i] > value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

module.exports = max;

},{}],27:[function(require,module,exports){
'use strict';

var sum = require('./sum');

/**
 * The mean, _also known as average_,
 * is the sum of all values over the number of values.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input values
 * @returns {number} mean
 * @example
 * console.log(mean([0, 10])); // 5
 */
function mean(x) {
    // The mean of no numbers is null
    if (x.length === 0) { return null; }

    return sum(x) / x.length;
}

module.exports = mean;

},{"./sum":51}],28:[function(require,module,exports){
'use strict';

var numericSort = require('./numeric_sort');

/**
 * The [median](http://en.wikipedia.org/wiki/Median) is
 * the middle number of a list. This is often a good indicator of 'the middle'
 * when there are outliers that skew the `mean()` value.
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * The median isn't necessarily one of the elements in the list: the value
 * can be the average of two elements if the list has an even length
 * and the two central values are different.
 *
 * @param {Array<number>} x input
 * @returns {number} median value
 * @example
 * var incomes = [10, 2, 5, 100, 2, 1];
 * median(incomes); //= 3.5
 */
function median(x) {
    // The median of an empty list is null
    if (x.length === 0) { return null; }

    // Sorting the array makes it easy to find the center, but
    // use `.slice()` to ensure the original array `x` is not modified
    var sorted = numericSort(x);

    // If the length of the list is odd, it's the central number
    if (sorted.length % 2 === 1) {
        return sorted[(sorted.length - 1) / 2];
    // Otherwise, the median is the average of the two numbers
    // at the center of the list
    } else {
        var a = sorted[sorted.length / 2 - 1];
        var b = sorted[sorted.length / 2];
        return (a + b) / 2;
    }
}

module.exports = median;

},{"./numeric_sort":32}],29:[function(require,module,exports){
'use strict';

/**
 * The min is the lowest number in the array. This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} minimum value
 * @example
 * min([1, 5, -10, 100, 2]); // -100
 */
function min(x) {
    var value;
    for (var i = 0; i < x.length; i++) {
        // On the first iteration of this loop, min is
        // undefined and is thus made the minimum element in the array
        if (x[i] < value || value === undefined) {
            value = x[i];
        }
    }
    return value;
}

module.exports = min;

},{}],30:[function(require,module,exports){
'use strict';

/**
 * **Mixin** simple_statistics to a single Array instance if provided
 * or the Array native object if not. This is an optional
 * feature that lets you treat simple_statistics as a native feature
 * of Javascript.
 *
 * @param {Object} ss simple statistics
 * @param {Array} [array=] a single array instance which will be augmented
 * with the extra methods. If omitted, mixin will apply to all arrays
 * by changing the global `Array.prototype`.
 * @returns {*} the extended Array, or Array.prototype if no object
 * is given.
 *
 * @example
 * var myNumbers = [1, 2, 3];
 * mixin(ss, myNumbers);
 * console.log(myNumbers.sum()); // 6
 */
function mixin(ss, array) {
    var support = !!(Object.defineProperty && Object.defineProperties);
    // Coverage testing will never test this error.
    /* istanbul ignore next */
    if (!support) {
        throw new Error('without defineProperty, simple-statistics cannot be mixed in');
    }

    // only methods which work on basic arrays in a single step
    // are supported
    var arrayMethods = ['median', 'standardDeviation', 'sum',
        'sampleSkewness',
        'mean', 'min', 'max', 'quantile', 'geometricMean',
        'harmonicMean', 'root_mean_square'];

    // create a closure with a method name so that a reference
    // like `arrayMethods[i]` doesn't follow the loop increment
    function wrap(method) {
        return function() {
            // cast any arguments into an array, since they're
            // natively objects
            var args = Array.prototype.slice.apply(arguments);
            // make the first argument the array itself
            args.unshift(this);
            // return the result of the ss method
            return ss[method].apply(ss, args);
        };
    }

    // select object to extend
    var extending;
    if (array) {
        // create a shallow copy of the array so that our internal
        // operations do not change it by reference
        extending = array.slice();
    } else {
        extending = Array.prototype;
    }

    // for each array function, define a function that gets
    // the array as the first argument.
    // We use [defineProperty](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty)
    // because it allows these properties to be non-enumerable:
    // `for (var in x)` loops will not run into problems with this
    // implementation.
    for (var i = 0; i < arrayMethods.length; i++) {
        Object.defineProperty(extending, arrayMethods[i], {
            value: wrap(arrayMethods[i]),
            configurable: true,
            enumerable: false,
            writable: true
        });
    }

    return extending;
}

module.exports = mixin;

},{}],31:[function(require,module,exports){
'use strict';

var numericSort = require('./numeric_sort');

/**
 * The [mode](http://bit.ly/W5K4Yt) is the number that appears in a list the highest number of times.
 * There can be multiple modes in a list: in the event of a tie, this
 * algorithm will return the most recently seen mode.
 *
 * This is a [measure of central tendency](https://en.wikipedia.org/wiki/Central_tendency):
 * a method of finding a typical or central value of a set of numbers.
 *
 * This runs on `O(n)`, linear time in respect to the array.
 *
 * @param {Array<number>} x input
 * @returns {number} mode
 * @example
 * mode([0, 0, 1]); //= 0
 */
function mode(x) {

    // Handle edge cases:
    // The median of an empty list is null
    if (x.length === 0) { return null; }
    else if (x.length === 1) { return x[0]; }

    // Sorting the array lets us iterate through it below and be sure
    // that every time we see a new number it's new and we'll never
    // see the same number twice
    var sorted = numericSort(x);

    // This assumes it is dealing with an array of size > 1, since size
    // 0 and 1 are handled immediately. Hence it starts at index 1 in the
    // array.
    var last = sorted[0],
        // store the mode as we find new modes
        value,
        // store how many times we've seen the mode
        maxSeen = 0,
        // how many times the current candidate for the mode
        // has been seen
        seenThis = 1;

    // end at sorted.length + 1 to fix the case in which the mode is
    // the highest number that occurs in the sequence. the last iteration
    // compares sorted[i], which is undefined, to the highest number
    // in the series
    for (var i = 1; i < sorted.length + 1; i++) {
        // we're seeing a new number pass by
        if (sorted[i] !== last) {
            // the last number is the new mode since we saw it more
            // often than the old one
            if (seenThis > maxSeen) {
                maxSeen = seenThis;
                value = last;
            }
            seenThis = 1;
            last = sorted[i];
        // if this isn't a new number, it's one more occurrence of
        // the potential mode
        } else { seenThis++; }
    }
    return value;
}

module.exports = mode;

},{"./numeric_sort":32}],32:[function(require,module,exports){
'use strict';

/**
 * Sort an array of numbers by their numeric value, ensuring that the
 * array is not changed in place.
 *
 * This is necessary because the default behavior of .sort
 * in JavaScript is to sort arrays as string values
 *
 *     [1, 10, 12, 102, 20].sort()
 *     // output
 *     [1, 10, 102, 12, 20]
 *
 * @param {Array<number>} array input array
 * @return {Array<number>} sorted array
 * @private
 * @example
 * numericSort([3, 2, 1]) // [1, 2, 3]
 */
function numericSort(array) {
    return array
        // ensure the array is changed in-place
        .slice()
        // comparator function that treats input as numeric
        .sort(function(a, b) {
            return a - b;
        });
}

module.exports = numericSort;

},{}],33:[function(require,module,exports){
'use strict';

/**
 * This is a single-layer [Perceptron Classifier](http://en.wikipedia.org/wiki/Perceptron) that takes
 * arrays of numbers and predicts whether they should be classified
 * as either 0 or 1 (negative or positive examples).
 * @class
 * @example
 * // Create the model
 * var p = new PerceptronModel();
 * // Train the model with input with a diagonal boundary.
 * for (var i = 0; i < 5; i++) {
 *     p.train([1, 1], 1);
 *     p.train([0, 1], 0);
 *     p.train([1, 0], 0);
 *     p.train([0, 0], 0);
 * }
 * p.predict([0, 0]); // 0
 * p.predict([0, 1]); // 0
 * p.predict([1, 0]); // 0
 * p.predict([1, 1]); // 1
 */
function PerceptronModel() {
    // The weights, or coefficients of the model;
    // weights are only populated when training with data.
    this.weights = [];
    // The bias term, or intercept; it is also a weight but
    // it's stored separately for convenience as it is always
    // multiplied by one.
    this.bias = 0;
}

/**
 * **Predict**: Use an array of features with the weight array and bias
 * to predict whether an example is labeled 0 or 1.
 *
 * @param {Array<number>} features an array of features as numbers
 * @returns {number} 1 if the score is over 0, otherwise 0
 */
PerceptronModel.prototype.predict = function(features) {

    // Only predict if previously trained
    // on the same size feature array(s).
    if (features.length !== this.weights.length) { return null; }

    // Calculate the sum of features times weights,
    // with the bias added (implicitly times one).
    var score = 0;
    for (var i = 0; i < this.weights.length; i++) {
        score += this.weights[i] * features[i];
    }
    score += this.bias;

    // Classify as 1 if the score is over 0, otherwise 0.
    if (score > 0) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * **Train** the classifier with a new example, which is
 * a numeric array of features and a 0 or 1 label.
 *
 * @param {Array<number>} features an array of features as numbers
 * @param {number} label either 0 or 1
 * @returns {PerceptronModel} this
 */
PerceptronModel.prototype.train = function(features, label) {
    // Require that only labels of 0 or 1 are considered.
    if (label !== 0 && label !== 1) { return null; }
    // The length of the feature array determines
    // the length of the weight array.
    // The perceptron will continue learning as long as
    // it keeps seeing feature arrays of the same length.
    // When it sees a new data shape, it initializes.
    if (features.length !== this.weights.length) {
        this.weights = features;
        this.bias = 1;
    }
    // Make a prediction based on current weights.
    var prediction = this.predict(features);
    // Update the weights if the prediction is wrong.
    if (prediction !== label) {
        var gradient = label - prediction;
        for (var i = 0; i < this.weights.length; i++) {
            this.weights[i] += gradient * features[i];
        }
        this.bias += gradient;
    }
    return this;
};

module.exports = PerceptronModel;

},{}],34:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var factorial = require('./factorial');

/**
 * The [Poisson Distribution](http://en.wikipedia.org/wiki/Poisson_distribution)
 * is a discrete probability distribution that expresses the probability
 * of a given number of events occurring in a fixed interval of time
 * and/or space if these events occur with a known average rate and
 * independently of the time since the last event.
 *
 * The Poisson Distribution is characterized by the strictly positive
 * mean arrival or occurrence rate, `λ`.
 *
 * @param {number} lambda location poisson distribution
 * @returns {number} value of poisson distribution at that point
 */
function poissonDistribution(lambda) {
    // Check that lambda is strictly positive
    if (lambda <= 0) { return null; }

    // our current place in the distribution
    var x = 0,
        // and we keep track of the current cumulative probability, in
        // order to know when to stop calculating chances.
        cumulativeProbability = 0,
        // the calculated cells to be returned
        cells = {};

    // This algorithm iterates through each potential outcome,
    // until the `cumulativeProbability` is very close to 1, at
    // which point we've defined the vast majority of outcomes
    do {
        // a [probability mass function](https://en.wikipedia.org/wiki/Probability_mass_function)
        cells[x] = (Math.pow(Math.E, -lambda) * Math.pow(lambda, x)) / factorial(x);
        cumulativeProbability += cells[x];
        x++;
    // when the cumulativeProbability is nearly 1, we've calculated
    // the useful range of this distribution
    } while (cumulativeProbability < 1 - epsilon);

    return cells;
}

module.exports = poissonDistribution;

},{"./epsilon":16,"./factorial":18}],35:[function(require,module,exports){
'use strict';

var epsilon = require('./epsilon');
var inverseErrorFunction = require('./inverse_error_function');

/**
 * The [Probit](http://en.wikipedia.org/wiki/Probit)
 * is the inverse of cumulativeStdNormalProbability(),
 * and is also known as the normal quantile function.
 *
 * It returns the number of standard deviations from the mean
 * where the p'th quantile of values can be found in a normal distribution.
 * So, for example, probit(0.5 + 0.6827/2) ≈ 1 because 68.27% of values are
 * normally found within 1 standard deviation above or below the mean.
 *
 * @param {number} p
 * @returns {number} probit
 */
function probit(p) {
    if (p === 0) {
        p = epsilon;
    } else if (p >= 1) {
        p = 1 - epsilon;
    }
    return Math.sqrt(2) * inverseErrorFunction(2 * p - 1);
}

module.exports = probit;

},{"./epsilon":16,"./inverse_error_function":22}],36:[function(require,module,exports){
'use strict';

var quantileSorted = require('./quantile_sorted');
var numericSort = require('./numeric_sort');

/**
 * The [quantile](https://en.wikipedia.org/wiki/Quantile):
 * this is a population quantile, since we assume to know the entire
 * dataset in this library. This is an implementation of the
 * [Quantiles of a Population](http://en.wikipedia.org/wiki/Quantile#Quantiles_of_a_population)
 * algorithm from wikipedia.
 *
 * Sample is a one-dimensional array of numbers,
 * and p is either a decimal number from 0 to 1 or an array of decimal
 * numbers from 0 to 1.
 * In terms of a k/q quantile, p = k/q - it's just dealing with fractions or dealing
 * with decimal values.
 * When p is an array, the result of the function is also an array containing the appropriate
 * quantiles in input order
 *
 * @param {Array<number>} sample a sample from the population
 * @param {number} p the desired quantile, as a number between 0 and 1
 * @returns {number} quantile
 * @example
 * var data = [3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20];
 * quantile(data, 1); //= max(data);
 * quantile(data, 0); //= min(data);
 * quantile(data, 0.5); //= 9
 */
function quantile(sample, p) {

    // We can't derive quantiles from an empty list
    if (sample.length === 0) { return null; }

    // Sort a copy of the array. We'll need a sorted array to index
    // the values in sorted order.
    var sorted = numericSort(sample);

    if (p.length) {
        // Initialize the result array
        var results = [];
        // For each requested quantile
        for (var i = 0; i < p.length; i++) {
            results[i] = quantileSorted(sorted, p[i]);
        }
        return results;
    } else {
        return quantileSorted(sorted, p);
    }
}

module.exports = quantile;

},{"./numeric_sort":32,"./quantile_sorted":37}],37:[function(require,module,exports){
'use strict';

/**
 * This is the internal implementation of quantiles: when you know
 * that the order is sorted, you don't need to re-sort it, and the computations
 * are faster.
 *
 * @param {Array<number>} sample input data
 * @param {number} p desired quantile: a number between 0 to 1, inclusive
 * @returns {number} quantile value
 * @example
 * var data = [3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20];
 * quantileSorted(data, 1); //= max(data);
 * quantileSorted(data, 0); //= min(data);
 * quantileSorted(data, 0.5); //= 9
 */
function quantileSorted(sample, p) {
    var idx = sample.length * p;
    if (p < 0 || p > 1) {
        return null;
    } else if (p === 1) {
        // If p is 1, directly return the last element
        return sample[sample.length - 1];
    } else if (p === 0) {
        // If p is 0, directly return the first element
        return sample[0];
    } else if (idx % 1 !== 0) {
        // If p is not integer, return the next element in array
        return sample[Math.ceil(idx) - 1];
    } else if (sample.length % 2 === 0) {
        // If the list has even-length, we'll take the average of this number
        // and the next value, if there is one
        return (sample[idx - 1] + sample[idx]) / 2;
    } else {
        // Finally, in the simple case of an integer value
        // with an odd-length list, return the sample value at the index.
        return sample[idx];
    }
}

module.exports = quantileSorted;

},{}],38:[function(require,module,exports){
'use strict';

/**
 * The [R Squared](http://en.wikipedia.org/wiki/Coefficient_of_determination)
 * value of data compared with a function `f`
 * is the sum of the squared differences between the prediction
 * and the actual value.
 *
 * @param {Array<Array<number>>} data input data: this should be doubly-nested
 * @param {Function} func function called on `[i][0]` values within the dataset
 * @returns {number} r-squared value
 * @example
 * var samples = [[0, 0], [1, 1]];
 * var regressionLine = linearRegressionLine(linearRegression(samples));
 * rSquared(samples, regressionLine); //= 1 this line is a perfect fit
 */
function rSquared(data, func) {
    if (data.length < 2) { return 1; }

    // Compute the average y value for the actual
    // data set in order to compute the
    // _total sum of squares_
    var sum = 0, average;
    for (var i = 0; i < data.length; i++) {
        sum += data[i][1];
    }
    average = sum / data.length;

    // Compute the total sum of squares - the
    // squared difference between each point
    // and the average of all points.
    var sumOfSquares = 0;
    for (var j = 0; j < data.length; j++) {
        sumOfSquares += Math.pow(average - data[j][1], 2);
    }

    // Finally estimate the error: the squared
    // difference between the estimate and the actual data
    // value at each point.
    var err = 0;
    for (var k = 0; k < data.length; k++) {
        err += Math.pow(data[k][1] - func(data[k][0]), 2);
    }

    // As the error grows larger, its ratio to the
    // sum of squares increases and the r squared
    // value grows lower.
    return 1 - err / sumOfSquares;
}

module.exports = rSquared;

},{}],39:[function(require,module,exports){
'use strict';

/**
 * The Root Mean Square (RMS) is
 * a mean function used as a measure of the magnitude of a set
 * of numbers, regardless of their sign.
 * This is the square root of the mean of the squares of the
 * input numbers.
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @returns {number} root mean square
 * @example
 * rootMeanSquare([-1, 1, -1, 1]); //= 1
 */
function rootMeanSquare(x) {
    if (x.length === 0) { return null; }

    var sumOfSquares = 0;
    for (var i = 0; i < x.length; i++) {
        sumOfSquares += Math.pow(x[i], 2);
    }

    return Math.sqrt(sumOfSquares / x.length);
}

module.exports = rootMeanSquare;

},{}],40:[function(require,module,exports){
'use strict';

var shuffle = require('./shuffle');

/**
 * Create a [simple random sample](http://en.wikipedia.org/wiki/Simple_random_sample)
 * from a given array of `n` elements.
 *
 * The sampled values will be in any order, not necessarily the order
 * they appear in the input.
 *
 * @param {Array} array input array. can contain any type
 * @param {number} n count of how many elements to take
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * instead of Math.random
 * @return {Array} subset of n elements in original array
 * @example
 * var values = [1, 2, 4, 5, 6, 7, 8, 9];
 * sample(values, 3); // returns 3 random values, like [2, 5, 8];
 */
function sample(array, n, randomSource) {
    // shuffle the original array using a fisher-yates shuffle
    var shuffled = shuffle(array, randomSource);

    // and then return a subset of it - the first `n` elements.
    return shuffled.slice(0, n);
}

module.exports = sample;

},{"./shuffle":46}],41:[function(require,module,exports){
'use strict';

var sampleCovariance = require('./sample_covariance');
var sampleStandardDeviation = require('./sample_standard_deviation');

/**
 * The [correlation](http://en.wikipedia.org/wiki/Correlation_and_dependence) is
 * a measure of how correlated two datasets are, between -1 and 1
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample correlation
 * @example
 * var a = [1, 2, 3, 4, 5, 6];
 * var b = [2, 2, 3, 4, 5, 60];
 * sampleCorrelation(a, b); //= 0.691
 */
function sampleCorrelation(x, y) {
    var cov = sampleCovariance(x, y),
        xstd = sampleStandardDeviation(x),
        ystd = sampleStandardDeviation(y);

    if (cov === null || xstd === null || ystd === null) {
        return null;
    }

    return cov / xstd / ystd;
}

module.exports = sampleCorrelation;

},{"./sample_covariance":42,"./sample_standard_deviation":44}],42:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * [Sample covariance](https://en.wikipedia.org/wiki/Sample_mean_and_sampleCovariance) of two datasets:
 * how much do the two datasets move together?
 * x and y are two datasets, represented as arrays of numbers.
 *
 * @param {Array<number>} x first input
 * @param {Array<number>} y second input
 * @returns {number} sample covariance
 * @example
 * var x = [1, 2, 3, 4, 5, 6];
 * var y = [6, 5, 4, 3, 2, 1];
 * sampleCovariance(x, y); //= -3.5
 */
function sampleCovariance(x, y) {

    // The two datasets must have the same length which must be more than 1
    if (x.length <= 1 || x.length !== y.length) {
        return null;
    }

    // determine the mean of each dataset so that we can judge each
    // value of the dataset fairly as the difference from the mean. this
    // way, if one dataset is [1, 2, 3] and [2, 3, 4], their covariance
    // does not suffer because of the difference in absolute values
    var xmean = mean(x),
        ymean = mean(y),
        sum = 0;

    // for each pair of values, the covariance increases when their
    // difference from the mean is associated - if both are well above
    // or if both are well below
    // the mean, the covariance increases significantly.
    for (var i = 0; i < x.length; i++) {
        sum += (x[i] - xmean) * (y[i] - ymean);
    }

    // this is Bessels' Correction: an adjustment made to sample statistics
    // that allows for the reduced degree of freedom entailed in calculating
    // values from samples rather than complete populations.
    var besselsCorrection = x.length - 1;

    // the covariance is weighted by the length of the datasets.
    return sum / besselsCorrection;
}

module.exports = sampleCovariance;

},{"./mean":27}],43:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');
var sampleStandardDeviation = require('./sample_standard_deviation');

/**
 * [Skewness](http://en.wikipedia.org/wiki/Skewness) is
 * a measure of the extent to which a probability distribution of a
 * real-valued random variable "leans" to one side of the mean.
 * The skewness value can be positive or negative, or even undefined.
 *
 * Implementation is based on the adjusted Fisher-Pearson standardized
 * moment coefficient, which is the version found in Excel and several
 * statistical packages including Minitab, SAS and SPSS.
 *
 * @param {Array<number>} x input
 * @returns {number} sample skewness
 * @example
 * var data = [2, 4, 6, 3, 1];
 * sampleSkewness(data); //= 0.5901286564
 */
function sampleSkewness(x) {
    // The skewness of less than three arguments is null
    if (x.length < 3) { return null; }

    var n = x.length,
        cubedS = Math.pow(sampleStandardDeviation(x), 3),
        sumCubedDeviations = sumNthPowerDeviations(x, 3);

    return n * sumCubedDeviations / ((n - 1) * (n - 2) * cubedS);
}

module.exports = sampleSkewness;

},{"./sample_standard_deviation":44,"./sum_nth_power_deviations":52}],44:[function(require,module,exports){
'use strict';

var sampleVariance = require('./sample_variance');

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance.
 *
 * @param {Array<number>} x input array
 * @returns {number} sample standard deviation
 * @example
 * ss.sampleStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
 * //= 2.138
 */
function sampleStandardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length <= 1) { return null; }

    return Math.sqrt(sampleVariance(x));
}

module.exports = sampleStandardDeviation;

},{"./sample_variance":45}],45:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');

/*
 * The [sample variance](https://en.wikipedia.org/wiki/Variance#Sample_variance)
 * is the sum of squared deviations from the mean. The sample variance
 * is distinguished from the variance by the usage of [Bessel's Correction](https://en.wikipedia.org/wiki/Bessel's_correction):
 * instead of dividing the sum of squared deviations by the length of the input,
 * it is divided by the length minus one. This corrects the bias in estimating
 * a value from a set that you don't know if full.
 *
 * References:
 * * [Wolfram MathWorld on Sample Variance](http://mathworld.wolfram.com/SampleVariance.html)
 *
 * @param {Array<number>} x input array
 * @return {number} sample variance
 * @example
 * sampleVariance([1, 2, 3, 4, 5]); //= 2.5
 */
function sampleVariance(x) {
    // The variance of no numbers is null
    if (x.length <= 1) { return null; }

    var sumSquaredDeviationsValue = sumNthPowerDeviations(x, 2);

    // this is Bessels' Correction: an adjustment made to sample statistics
    // that allows for the reduced degree of freedom entailed in calculating
    // values from samples rather than complete populations.
    var besselsCorrection = x.length - 1;

    // Find the mean value of that list
    return sumSquaredDeviationsValue / besselsCorrection;
}

module.exports = sampleVariance;

},{"./sum_nth_power_deviations":52}],46:[function(require,module,exports){
'use strict';

var shuffleInPlace = require('./shuffle_in_place');

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * is a fast way to create a random permutation of a finite set. This is
 * a function around `shuffle_in_place` that adds the guarantee that
 * it will not modify its input.
 *
 * @param {Array} sample an array of any kind of element
 * @param {Function} [randomSource=Math.random] an optional entropy source
 * @return {Array} shuffled version of input
 * @example
 * var shuffled = shuffle([1, 2, 3, 4]);
 * shuffled; // = [2, 3, 1, 4] or any other random permutation
 */
function shuffle(sample, randomSource) {
    // slice the original array so that it is not modified
    sample = sample.slice();

    // and then shuffle that shallow-copied array, in place
    return shuffleInPlace(sample.slice(), randomSource);
}

module.exports = shuffle;

},{"./shuffle_in_place":47}],47:[function(require,module,exports){
'use strict';

/*
 * A [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
 * in-place - which means that it **will change the order of the original
 * array by reference**.
 *
 * This is an algorithm that generates a random [permutation](https://en.wikipedia.org/wiki/Permutation)
 * of a set.
 *
 * @param {Array} sample input array
 * @param {Function} [randomSource=Math.random] an optional source of entropy
 * @returns {Array} sample
 * @example
 * var sample = [1, 2, 3, 4];
 * shuffleInPlace(sample);
 * // sample is shuffled to a value like [2, 1, 4, 3]
 */
function shuffleInPlace(sample, randomSource) {

    // a custom random number source can be provided if you want to use
    // a fixed seed or another random number generator, like
    // [random-js](https://www.npmjs.org/package/random-js)
    randomSource = randomSource || Math.random;

    // store the current length of the sample to determine
    // when no elements remain to shuffle.
    var length = sample.length;

    // temporary is used to hold an item when it is being
    // swapped between indices.
    var temporary;

    // The index to swap at each stage.
    var index;

    // While there are still items to shuffle
    while (length > 0) {
        // chose a random index within the subset of the array
        // that is not yet shuffled
        index = Math.floor(randomSource() * length--);

        // store the value that we'll move temporarily
        temporary = sample[length];

        // swap the value at `sample[length]` with `sample[index]`
        sample[length] = sample[index];
        sample[index] = temporary;
    }

    return sample;
}

module.exports = shuffleInPlace;

},{}],48:[function(require,module,exports){
'use strict';

/**
 * For a sorted input, counting the number of unique values
 * is possible in constant time and constant memory. This is
 * a simple implementation of the algorithm.
 *
 * Values are compared with `===`, so objects and non-primitive objects
 * are not handled in any special way.
 *
 * @param {Array} input an array of primitive values.
 * @returns {number} count of unique values
 * @example
 * sortedUniqueCount([1, 2, 3]); // 3
 * sortedUniqueCount([1, 1, 1]); // 1
 */
function sortedUniqueCount(input) {
    var uniqueValueCount = 0,
        lastSeenValue;
    for (var i = 0; i < input.length; i++) {
        if (i === 0 || input[i] !== lastSeenValue) {
            lastSeenValue = input[i];
            uniqueValueCount++;
        }
    }
    return uniqueValueCount;
}

module.exports = sortedUniqueCount;

},{}],49:[function(require,module,exports){
'use strict';

var variance = require('./variance');

/**
 * The [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation)
 * is the square root of the variance. It's useful for measuring the amount
 * of variation or dispersion in a set of values.
 *
 * Standard deviation is only appropriate for full-population knowledge: for
 * samples of a population, {@link sampleStandardDeviation} is
 * more appropriate.
 *
 * @param {Array<number>} x input
 * @returns {number} standard deviation
 * @example
 * var scores = [2, 4, 4, 4, 5, 5, 7, 9];
 * variance(scores); //= 4
 * standardDeviation(scores); //= 2
 */
function standardDeviation(x) {
    // The standard deviation of no numbers is null
    if (x.length === 0) { return null; }

    return Math.sqrt(variance(x));
}

module.exports = standardDeviation;

},{"./variance":55}],50:[function(require,module,exports){
'use strict';

var SQRT_2PI = Math.sqrt(2 * Math.PI);

function cumulativeDistribution(z) {
    var sum = z,
        tmp = z;

    // 15 iterations are enough for 4-digit precision
    for (var i = 1; i < 15; i++) {
        tmp *= z * z / (2 * i + 1);
        sum += tmp;
    }
    return Math.round((0.5 + (sum / SQRT_2PI) * Math.exp(-z * z / 2)) * 1e4) / 1e4;
}

/**
 * A standard normal table, also called the unit normal table or Z table,
 * is a mathematical table for the values of Φ (phi), which are the values of
 * the cumulative distribution function of the normal distribution.
 * It is used to find the probability that a statistic is observed below,
 * above, or between values on the standard normal distribution, and by
 * extension, any normal distribution.
 *
 * The probabilities are calculated using the
 * [Cumulative distribution function](https://en.wikipedia.org/wiki/Normal_distribution#Cumulative_distribution_function).
 * The table used is the cumulative, and not cumulative from 0 to mean
 * (even though the latter has 5 digits precision, instead of 4).
 */
var standardNormalTable = [];

for (var z = 0; z <= 3.09; z += 0.01) {
    standardNormalTable.push(cumulativeDistribution(z));
}

module.exports = standardNormalTable;

},{}],51:[function(require,module,exports){
'use strict';

/**
 * The [sum](https://en.wikipedia.org/wiki/Summation) of an array
 * is the result of adding all numbers together, starting from zero.
 *
 * This runs on `O(n)`, linear time in respect to the array
 *
 * @param {Array<number>} x input
 * @return {number} sum of all input numbers
 * @example
 * console.log(sum([1, 2, 3])); // 6
 */
function sum(x) {
    var value = 0;
    for (var i = 0; i < x.length; i++) {
        value += x[i];
    }
    return value;
}

module.exports = sum;

},{}],52:[function(require,module,exports){
'use strict';

var mean = require('./mean');

/**
 * The sum of deviations to the Nth power.
 * When n=2 it's the sum of squared deviations.
 * When n=3 it's the sum of cubed deviations.
 *
 * @param {Array<number>} x
 * @param {number} n power
 * @returns {number} sum of nth power deviations
 * @example
 * var input = [1, 2, 3];
 * // since the variance of a set is the mean squared
 * // deviations, we can calculate that with sumNthPowerDeviations:
 * var variance = sumNthPowerDeviations(input) / input.length;
 */
function sumNthPowerDeviations(x, n) {
    var meanValue = mean(x),
        sum = 0;

    for (var i = 0; i < x.length; i++) {
        sum += Math.pow(x[i] - meanValue, n);
    }

    return sum;
}

module.exports = sumNthPowerDeviations;

},{"./mean":27}],53:[function(require,module,exports){
'use strict';

var standardDeviation = require('./standard_deviation');
var mean = require('./mean');

/**
 * This is to compute [a one-sample t-test](https://en.wikipedia.org/wiki/Student%27s_t-test#One-sample_t-test), comparing the mean
 * of a sample to a known value, x.
 *
 * in this case, we're trying to determine whether the
 * population mean is equal to the value that we know, which is `x`
 * here. usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * @param {Array<number>} sample an array of numbers as input
 * @param {number} x expected vale of the population mean
 * @returns {number} value
 * @example
 * tTest([1, 2, 3, 4, 5, 6], 3.385); //= 0.16494154
 */
function tTest(sample, x) {
    // The mean of the sample
    var sampleMean = mean(sample);

    // The standard deviation of the sample
    var sd = standardDeviation(sample);

    // Square root the length of the sample
    var rootN = Math.sqrt(sample.length);

    // Compute the known value against the sample,
    // returning the t value
    return (sampleMean - x) / (sd / rootN);
}

module.exports = tTest;

},{"./mean":27,"./standard_deviation":49}],54:[function(require,module,exports){
'use strict';

var mean = require('./mean');
var sampleVariance = require('./sample_variance');

/**
 * This is to compute [two sample t-test](http://en.wikipedia.org/wiki/Student's_t-test).
 * Tests whether "mean(X)-mean(Y) = difference", (
 * in the most common case, we often have `difference == 0` to test if two samples
 * are likely to be taken from populations with the same mean value) with
 * no prior knowledge on standard deviations of both samples
 * other than the fact that they have the same standard deviation.
 *
 * Usually the results here are used to look up a
 * [p-value](http://en.wikipedia.org/wiki/P-value), which, for
 * a certain level of significance, will let you determine that the
 * null hypothesis can or cannot be rejected.
 *
 * `diff` can be omitted if it equals 0.
 *
 * [This is used to confirm or deny](http://www.monarchlab.org/Lab/Research/Stats/2SampleT.aspx)
 * a null hypothesis that the two populations that have been sampled into
 * `sampleX` and `sampleY` are equal to each other.
 *
 * @param {Array<number>} sampleX a sample as an array of numbers
 * @param {Array<number>} sampleY a sample as an array of numbers
 * @param {number} [difference=0]
 * @returns {number} test result
 * @example
 * ss.tTestTwoSample([1, 2, 3, 4], [3, 4, 5, 6], 0); //= -2.1908902300206643
 */
function tTestTwoSample(sampleX, sampleY, difference) {
    var n = sampleX.length,
        m = sampleY.length;

    // If either sample doesn't actually have any values, we can't
    // compute this at all, so we return `null`.
    if (!n || !m) { return null; }

    // default difference (mu) is zero
    if (!difference) {
        difference = 0;
    }

    var meanX = mean(sampleX),
        meanY = mean(sampleY);

    var weightedVariance = ((n - 1) * sampleVariance(sampleX) +
        (m - 1) * sampleVariance(sampleY)) / (n + m - 2);

    return (meanX - meanY - difference) /
        Math.sqrt(weightedVariance * (1 / n + 1 / m));
}

module.exports = tTestTwoSample;

},{"./mean":27,"./sample_variance":45}],55:[function(require,module,exports){
'use strict';

var sumNthPowerDeviations = require('./sum_nth_power_deviations');

/**
 * The [variance](http://en.wikipedia.org/wiki/Variance)
 * is the sum of squared deviations from the mean.
 *
 * This is an implementation of variance, not sample variance:
 * see the `sampleVariance` method if you want a sample measure.
 *
 * @param {Array<number>} x a population
 * @returns {number} variance: a value greater than or equal to zero.
 * zero indicates that all values are identical.
 * @example
 * ss.variance([1, 2, 3, 4, 5, 6]); //= 2.917
 */
function variance(x) {
    // The variance of no numbers is null
    if (x.length === 0) { return null; }

    // Find the mean of squared deviations between the
    // mean value and each value.
    return sumNthPowerDeviations(x, 2) / x.length;
}

module.exports = variance;

},{"./sum_nth_power_deviations":52}],56:[function(require,module,exports){
'use strict';

/**
 * The [Z-Score, or Standard Score](http://en.wikipedia.org/wiki/Standard_score).
 *
 * The standard score is the number of standard deviations an observation
 * or datum is above or below the mean. Thus, a positive standard score
 * represents a datum above the mean, while a negative standard score
 * represents a datum below the mean. It is a dimensionless quantity
 * obtained by subtracting the population mean from an individual raw
 * score and then dividing the difference by the population standard
 * deviation.
 *
 * The z-score is only defined if one knows the population parameters;
 * if one only has a sample set, then the analogous computation with
 * sample mean and sample standard deviation yields the
 * Student's t-statistic.
 *
 * @param {number} x
 * @param {number} mean
 * @param {number} standardDeviation
 * @return {number} z score
 * @example
 * ss.zScore(78, 80, 5); //= -0.4
 */
function zScore(x, mean, standardDeviation) {
    return (x - mean) / standardDeviation;
}

module.exports = zScore;

},{}],57:[function(require,module,exports){

'use strict';

//cell.js

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cell = function Cell(x, y, m, r, g, b) {
  _classCallCheck(this, Cell);

  this.x = x;
  this.y = y;
  this.morton = m;
  this.r = r;
  this.g = g;
  this.b = b;
  this.luminance = 0.298912 * r + 0.586611 * g + 0.114478 * b;
};

//color.luminosity();  // 0.412

module.exports = Cell;

},{}],58:[function(require,module,exports){

'use strict';

//cells.js

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cell = require('./cell');
var Morton = require('./morton');

var floor = Math.floor;
var round = Math.round;
var pow = Math.pow;

var bitSeperate32 = Morton.bitSeperate32;

var Cells = (function () {
  function Cells(data, width, height) {
    _classCallCheck(this, Cells);

    if (data.length % 4 !== 0) {
      throw new Error('data length incorrect.');
    }
    this.data = [];
    this.register(data, width, height);
  }

  _createClass(Cells, [{
    key: 'register',
    value: function register(data, width, height) {
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
        var _x = floor(x / width * u);
        var _y = floor(y / height * u);
        var morton = bitSeperate32(_x) | bitSeperate32(_y) << 1;
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
  }, {
    key: 'find',
    value: function find(lvl, morton) {
      return this.data.filter(function (cell) {
        return Morton.belongs(cell.morton, morton, lvl);
      });
    }
  }]);

  return Cells;
})();

module.exports = Cells;

},{"./cell":57,"./morton":63}],59:[function(require,module,exports){
'use strict';

//graygrid.js
// Create grid with Gray code

function graygrid(bit) {
  var l = Math.pow(2, bit);
  var res = [];
  for (var i = 0; i < l; i++) {
    res.push((i ^ i >> 1).toString(2));
    //console.log(i ^ (i >> 1));
  }
  //console.log(res)
  return res;
}

module.exports = graygrid;

},{}],60:[function(require,module,exports){

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Color = require('color');
var NullNode = require("./nullnode");

// Liner Quaternary Node

var LQNode = (function (_NullNode) {
  _inherits(LQNode, _NullNode);

  function LQNode(r, g, b, ro, morton, level) {
    _classCallCheck(this, LQNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LQNode).call(this));

    _this.ro = ro;
    _this.r = r;
    _this.g = g;
    _this.b = b;
    _this.color = Color({ r: r, g: g, b: b });
    _this.morton = morton;
    _this.level = level;
    return _this;
  }

  return LQNode;
})(NullNode);

module.exports = LQNode;

},{"./nullnode":64,"color":1}],61:[function(require,module,exports){

'use strict';

// Liner Quaternary Tree

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LQNode = require("./lqnode");
var NullNode = require("./nullnode");
var Morton = require("./morton");

var floor = Math.floor;
var pow = Math.pow;

var offsets = [];

var LQTree = (function () {
  function LQTree(filter) {
    _classCallCheck(this, LQTree);

    if (typeof filter !== 'function') {
      filter = function (node) {
        return node;
      };
    }
    this.filter = filter;

    this.pointer = 0;
    this.level = 0;
    this.maxPointer = this.getOffset(Morton.MAX_LVL + 1);
    this.data = [];
    this.registered = [];
  }

  _createClass(LQTree, [{
    key: "add",
    value: function add(node) {
      //console.log(this.filter(node), this.getParentData() !== null);
      //if (node !== undefined) {
      //console.log(node instanceof NullNode);
      //console.log(node instanceof LQNode);
      //console.log(this.getMorton().toString(2), this.getParentData());

      var parentData = this.getParentData();
      //console.log(this.level);

      if (parentData === null || parentData instanceof LQNode) {
        // 親データが null または木ノード -> null
        this.data[this.pointer] = null;
      } else {
        // 親データが 空ノード
        if (this.filter(node)) {
          // 標準偏差が閾値以下 -> 登録する
          this.data[this.pointer] = node;
        } else if (this.level === 1) {
          // 最大レベル -> 登録する
          this.data[this.pointer] = node;
        } else {
          // 標準偏差が閾値以下 -> 空ノードで埋める
          this.data[this.pointer] = new NullNode();
        }
      }
      //console.log(parentData, this.data[this.pointer]);
      //}
      //console.log(this.data[this.pointer]);

      this.pointer++;

      if (this.getOffset(this.level + 1) === this.pointer) {
        this.level++;
      }
      //if (this.level > Morton.MAX_LVL) {
      //  throw new Error('Maximum tree level exceeded.');
      //}
    }
  }, {
    key: "getMorton",
    value: function getMorton() {
      return this.pointer - this.getOffset(this.level);
    }
  }, {
    key: "getSpace",
    value: function getSpace() {
      return Morton.getOwnSpace(this.getMorton());
    }
  }, {
    key: "getParentMorton",
    value: function getParentMorton(morton, level) {
      morton = typeof morton === 'number' ? morton : this.getMorton();
      level = typeof level === 'number' ? level : this.level;
      return morton >> 2;
    }
  }, {
    key: "getParentData",
    value: function getParentData(morton, level) {
      morton = typeof morton === 'number' ? morton : this.getMorton();
      level = typeof level === 'number' ? level : this.level;

      if (level === 0) {
        return new NullNode();
      }
      return this.data[this.getOffset(level - 1) + (morton >> 2)];
    }
  }, {
    key: "getOffset",
    value: function getOffset(lvl) {
      if (!offsets[lvl]) {
        offsets[lvl] = floor((pow(4, lvl) - 1) / (4 - 1));
      }
      return offsets[lvl];
    }
  }, {
    key: "getThreshold",
    value: function getThreshold() {}
  }, {
    key: "isPointerMax",
    value: function isPointerMax() {
      return !(this.maxPointer > this.pointer);
    }
  }]);

  return LQTree;
})();

module.exports = LQTree;

},{"./lqnode":60,"./morton":63,"./nullnode":64}],62:[function(require,module,exports){

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

document.addEventListener('DOMContentLoaded', function (e) {
  console.log('Entry point');
  var imageData = [];

  var loaded = new Promise(function (resolve, reject) {
    var src = document.getElementById('src');
    src.addEventListener('load', function (e) {
      resolve(src);
    });
  });

  loaded.then(function (src) {
    console.log('src loaded.');
    var image = new Image();
    image.src = src.getAttribute('src');

    var canvas = document.getElementById('place-holder');
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);

    //console.log(context.getImageData(0,0,image.width, image.height).data);
    var dataArr = context.getImageData(0, 0, image.width, image.height).data;
    console.time('read data');
    console.log(dataArr.length / 4);
    if (dataArr.length % 4 !== 0) {
      throw new Error('data length incorrect.');
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

    var tree = new LQTree(function (node) {
      return node.ro < 50;
    });

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

    while (!tree.isPointerMax()) {
      console.log(tree.level, tree.getMorton(), tree.getSpace());
      var temp = cells.find(tree.level, tree.getMorton());
      console.log(temp);
      // color average
      var r = round(ss.average(temp.map(function (cell) {
        return cell.r;
      })));
      var _g = round(ss.average(temp.map(function (cell) {
        return cell.g;
      })));
      var _b = round(ss.average(temp.map(function (cell) {
        return cell.b;
      })));

      // standard deviation of luminance
      var ro = ss.standardDeviation(temp.map(function (cell) {
        return cell.luminance;
      }));

      tree.add(new LQNode(r, _g, _b, ro, tree.getMorton(), tree.level));
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

},{"./cells":58,"./graygrid":59,"./lqnode":60,"./lqtree":61,"./morton":63,"./nullnode":64,"native-promise-only":6,"simple-statistics":7}],63:[function(require,module,exports){

'use strict';

//morton.js
//morton order <=> x, y

//http://d.hatena.ne.jp/ranmaru50/20111106/1320559955
//http://marupeke296.com/COL_2D_No8_QuadTree.html

//(45).toString(2) // "101101"
// 10 => 2 : parent parent space
// 11 => 3 : parent space
// 01 => 1 : self space

// yx
// 10

/*
y\x 0  1
  -------
0 |00|01|
  -------
1 |10|11|
  -------
*/

// "101101" AND "01010101010101010101010101010101"
// "000101"
// "010110" AND "01010101010101010101010101010101"
// "010100"

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var spaceFilters = [];

function getDiscreteBits(n, f) {
  var b = n.toString(2);
  b = b.length < 2 ? '0' + b : b;
  return b.split('').reverse().filter(f).reverse().join('');
}
function getEvenBits(n) {
  return getDiscreteBits(n, function (e, i) {
    return i % 2 === 0;
  });
}
function getOddBits(n) {
  return getDiscreteBits(n, function (e, i) {
    return i % 2 !== 0;
  });
}

var Morton = (function () {
  function Morton(x, y) {
    _classCallCheck(this, Morton);

    if (x == null) {
      throw new Error('invalid arguments.');
    }
    if (y == null) {
      var m = Morton.reverse(x);
      y = m.y;
      x = m.x;
    }
    this.x = x;
    this.y = y;
    this.number = Morton.bitSeperate32(x) | Morton.bitSeperate32(y) << 1;
  }

  _createClass(Morton, [{
    key: 'getSpaces',
    value: function getSpaces() {
      var result = [];
      var str = this.number.toString(2);
      str = str.length % 2 !== 0 ? str = "0" + str : str;
      str.split('').forEach(function (e, i) {
        i % 2 === 0 ? result[i] = '' + e : result[i - 1] += e;
      });
      return result.filter(function (e) {
        return e !== undefined;
      }).map(function (e) {
        return parseInt(e, 2);
      });
    }
  }], [{
    key: 'bitSeperate32',
    value: function bitSeperate32(n) {
      n = (n | n << 8) & 0x00ff00ff;
      n = (n | n << 4) & 0x0f0f0f0f;
      n = (n | n << 2) & 0x33333333;
      return (n | n << 1) & 0x55555555; //"01010101010101010101010101010101"
    }
  }, {
    key: 'reverse',
    value: function reverse(n) {
      return {
        x: parseInt(getEvenBits(n), 2),
        y: parseInt(getOddBits(n), 2)
      };
    }
  }, {
    key: 'getSpace',
    value: function getSpace(morton, lvl) {
      var max = arguments.length <= 2 || arguments[2] === undefined ? Morton.MAX_LVL : arguments[2];

      var filter = spaceFilters[lvl];
      if (!filter) {
        var b = Math.pow(2, max * 2 - (lvl * 2 - 1));
        filter = b | b >> 1;
      }
      return (morton & filter) >> (max - lvl) * 2;
    }
  }, {
    key: 'belongs',
    value: function belongs(a, b, lvl) {
      var max = arguments.length <= 3 || arguments[3] === undefined ? Morton.MAX_LVL : arguments[3];

      // aは最大レベルのMorton、 bは最小レベルから探索
      a = Morton.getSpace(a, lvl);
      //let shiftA = (max - lvl) * 2;
      //let shiftB = 0;//~~Math.floor(b.toString(2).length - 2);
      return a === b;
    }
  }, {
    key: 'getOwnSpace',
    value: function getOwnSpace(morton) {
      return parseInt(morton.toString(2).slice(-2), 2);
    }
  }]);

  return Morton;
})();

Morton.MAX_LVL = 3;

module.exports = Morton;

},{}],64:[function(require,module,exports){

'use strict';

// Empty Node

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NullNode = function NullNode() {
  _classCallCheck(this, NullNode);
};

module.exports = NullNode;

},{}]},{},[62])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29sb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvY29udmVyc2lvbnMuanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9jb2xvci1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qc29uIiwibm9kZV9tb2R1bGVzL25hdGl2ZS1wcm9taXNlLW9ubHkvbGliL25wby5zcmMuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2JheWVzaWFuX2NsYXNzaWZpZXIuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Jlcm5vdWxsaV9kaXN0cmlidXRpb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Jpbm9taWFsX2Rpc3RyaWJ1dGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvY2hpX3NxdWFyZWRfZGlzdHJpYnV0aW9uX3RhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9jaGlfc3F1YXJlZF9nb29kbmVzc19vZl9maXQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2NodW5rLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9ja21lYW5zLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9jdW11bGF0aXZlX3N0ZF9ub3JtYWxfcHJvYmFiaWxpdHkuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Vwc2lsb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Vycm9yX2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9mYWN0b3JpYWwuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2dlb21ldHJpY19tZWFuLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9oYXJtb25pY19tZWFuLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9pbnRlcnF1YXJ0aWxlX3JhbmdlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9pbnZlcnNlX2Vycm9yX2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9saW5lYXJfcmVncmVzc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbGluZWFyX3JlZ3Jlc3Npb25fbGluZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbWFkLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9tYXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL21lYW4uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL21lZGlhbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbWluLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9taXhpbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbW9kZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbnVtZXJpY19zb3J0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9wZXJjZXB0cm9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9wb2lzc29uX2Rpc3RyaWJ1dGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvcHJvYml0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9xdWFudGlsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvcXVhbnRpbGVfc29ydGVkLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9yX3NxdWFyZWQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3Jvb3RfbWVhbl9zcXVhcmUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc2FtcGxlX2NvcnJlbGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfY292YXJpYW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc2FtcGxlX3NrZXduZXNzLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfc3RhbmRhcmRfZGV2aWF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfdmFyaWFuY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NodWZmbGUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NodWZmbGVfaW5fcGxhY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NvcnRlZF91bmlxdWVfY291bnQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3N0YW5kYXJkX2RldmlhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc3RhbmRhcmRfbm9ybWFsX3RhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zdW0uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvdF90ZXN0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy90X3Rlc3RfdHdvX3NhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvdmFyaWFuY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3pfc2NvcmUuanMiLCJzcmMvanMvY2VsbC5qcyIsInNyYy9qcy9jZWxscy5qcyIsInNyYy9qcy9ncmF5Z3JpZC5qcyIsInNyYy9qcy9scW5vZGUuanMiLCJzcmMvanMvbHF0cmVlLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvbW9ydG9uLmpzIiwic3JjL2pzL251bGxub2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdCQSxZQUFZOzs7O0FBQUM7O0lBS1AsSUFBSSxHQUNSLFNBREksSUFBSSxDQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO3dCQUQxQixJQUFJOztBQUVOLE1BQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsTUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxNQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixNQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLE1BQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsTUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxNQUFJLENBQUMsU0FBUyxHQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxBQUFFLENBQUM7Q0FDakU7Ozs7QUFLSCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7OztBQ25CdEIsWUFBWTs7OztBQUFDOzs7O0FBSWIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7O0FBRW5CLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7O0lBRW5DLEtBQUs7QUFDVCxXQURJLEtBQUssQ0FDRyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTswQkFEN0IsS0FBSzs7QUFFUCxRQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN6QixZQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7S0FDMUM7QUFDRCxRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNwQzs7ZUFQRyxLQUFLOzs2QkFRQSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUM1QixVQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixVQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixVQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixVQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixhQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFCLFdBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFOztBQUVuQyxZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFlBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFlBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFlBQUksTUFBTSxHQUFJLGFBQWEsQ0FBQyxFQUFFLENBQUMsR0FBSSxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxBQUFDLEFBQUMsQ0FBQztBQUM1RCxZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUFDLEFBRWxELFlBQUksRUFBRSxDQUFDLEtBQUssS0FBSyxFQUFFO0FBQ2pCLFdBQUMsR0FBRyxDQUFDLENBQUM7QUFDTixXQUFDLEVBQUUsQ0FBQztTQUNMO09BQ0Y7QUFDRCxhQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdCLGFBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hCOzs7eUJBQ0ksR0FBRyxFQUFFLE1BQU0sRUFBRTtBQUNoQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQ2hDLGVBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNqRCxDQUFDLENBQUE7S0FDSDs7O1NBcENHLEtBQUs7OztBQXVDWCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs7O0FDckR2QixZQUFZOzs7OztBQUFDLEFBS2IsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQ3JCLE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLE1BQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUIsT0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUFDLEdBRXRDOztBQUFBLEFBRUQsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQzs7OztBQ2YxQixZQUFZLENBQUM7Ozs7Ozs7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7Ozs7QUFBQyxJQUkvQixNQUFNO1lBQU4sTUFBTTs7QUFDVixXQURJLE1BQU0sQ0FDRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTswQkFEcEMsTUFBTTs7dUVBQU4sTUFBTTs7QUFJUixVQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixVQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxVQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxVQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxVQUFLLEtBQUssR0FBRyxLQUFLLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDbEMsVUFBSyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFVBQUssS0FBSyxHQUFHLEtBQUssQ0FBQzs7R0FDcEI7O1NBWEcsTUFBTTtHQUFTLFFBQVE7O0FBYzdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7O0FDckJ4QixZQUFZOzs7O0FBQUM7Ozs7QUFJYixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDOztBQUVuQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0lBRVgsTUFBTTtBQUNWLFdBREksTUFBTSxDQUNFLE1BQU0sRUFBRTswQkFEaEIsTUFBTTs7QUFFUixRQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUNoQyxZQUFNLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDdEIsZUFBTyxJQUFJLENBQUM7T0FDYixDQUFBO0tBQ0Y7QUFDRCxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFckIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRCxRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0dBQ3RCOztlQWRHLE1BQU07O3dCQWVOLElBQUksRUFBRTs7Ozs7OztBQU9SLFVBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUU7OztBQUFDLEFBR3RDLFVBQUksVUFBVSxLQUFLLElBQUksSUFBSSxVQUFVLFlBQVksTUFBTSxFQUFFOztBQUV2RCxZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDaEMsTUFBTTs7QUFFTCxZQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7O0FBRXJCLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNoQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7O0FBRTNCLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNoQyxNQUFNOztBQUVMLGNBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7U0FDMUM7T0FDRjs7Ozs7QUFBQSxBQUtELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFZixVQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ25ELFlBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkOzs7O0FBQUEsS0FJRjs7O2dDQUNXO0FBQ1YsYUFBTyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xEOzs7K0JBQ1U7QUFDVCxhQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7S0FDN0M7OztvQ0FDZSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzdCLFlBQU0sR0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoRSxXQUFLLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZELGFBQU8sTUFBTSxJQUFJLENBQUMsQ0FBQztLQUNwQjs7O2tDQUNhLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFDM0IsWUFBTSxHQUFHLE9BQU8sTUFBTSxLQUFLLFFBQVEsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hFLFdBQUssR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRXZELFVBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNmLGVBQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztPQUN2QjtBQUNELGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO0tBQzdEOzs7OEJBQ1MsR0FBRyxFQUFFO0FBQ2IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNqQixlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsSUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO09BQ25EO0FBQ0QsYUFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDckI7OzttQ0FDYyxFQUVkOzs7bUNBQ2M7QUFDYixhQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFBLEFBQUMsQ0FBQztLQUMxQzs7O1NBckZHLE1BQU07OztBQXdGWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7OztBQ3JHeEIsWUFBWTs7OztBQUFDLEFBSWIsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRS9CLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztBQUV0QyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDckMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFckMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUN6QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7O0FBRW5CLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLENBQUMsRUFBSztBQUNuRCxTQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzNCLE1BQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsTUFBSSxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQzVDLFFBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekMsT0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFDLENBQUMsRUFBSztBQUNsQyxhQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDZCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsUUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUNuQixXQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzNCLFFBQUksS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDeEIsU0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVwQyxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3JELFVBQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUMzQixVQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7O0FBRTdCLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsV0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUM7OztBQUFDLEFBRzFELFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDdkUsV0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxQixXQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEMsUUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDNUIsWUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0tBQzFDOztBQUVELFFBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBQUMsQUFjMUQsUUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBQyxJQUFJO2FBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFO0tBQUEsQ0FBQyxDQUFDOztBQUU5QyxXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQixRQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEMsUUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoQyxRQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEMsUUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxRQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsUUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVsQyxXQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLFdBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBR3hCLFdBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUU7QUFDMUIsYUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUMzRCxVQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDcEQsYUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7O0FBQUMsQUFFbEIsVUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUk7ZUFBSyxJQUFJLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEQsVUFBSSxFQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUk7ZUFBSyxJQUFJLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEQsVUFBSSxFQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUk7ZUFBSyxJQUFJLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDOzs7QUFBQyxBQUd0RCxVQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUk7ZUFBSyxJQUFJLENBQUMsU0FBUztPQUFBLENBQUMsQ0FBQyxDQUFDOztBQUVsRSxVQUFJLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDakU7QUFDRCxXQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUMsR0FtQ3hCLENBQUMsQ0FBQztDQUNKLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7QUNuSVYsWUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUM7Ozs7QUE4QmIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV0QixTQUFTLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzdCLE1BQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsR0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLFNBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQzNEO0FBQ0QsU0FBUyxXQUFXLENBQUMsQ0FBQyxFQUFFO0FBQ3RCLFNBQU8sZUFBZSxDQUFDLENBQUMsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDO1dBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0NBQ2xEO0FBQ0QsU0FBUyxVQUFVLENBQUMsQ0FBQyxFQUFFO0FBQ3JCLFNBQU8sZUFBZSxDQUFDLENBQUMsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDO1dBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0NBQ2xEOztJQUVLLE1BQU07QUFDVixXQURJLE1BQU0sQ0FDRSxDQUFDLEVBQUUsQ0FBQyxFQUFFOzBCQURkLE1BQU07O0FBRVIsUUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO0FBQ2IsWUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0tBQ3RDO0FBQ0QsUUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO0FBQ2IsVUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixPQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNSLE9BQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ1Q7QUFDRCxRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFFBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsUUFBSSxDQUFDLE1BQU0sR0FBSSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxBQUFDLEFBQUMsQ0FBQztHQUMxRTs7ZUFiRyxNQUFNOztnQ0E2Q0U7QUFDVixVQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDaEIsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsU0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDbkQsU0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQzlCLFNBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3ZELENBQUMsQ0FBQztBQUNILGFBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUM7ZUFBSyxDQUFDLEtBQUssU0FBUztPQUFBLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDO2VBQUssUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDekU7OztrQ0F2Q29CLENBQUMsRUFBRTtBQUN0QixPQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLFVBQVUsQ0FBQztBQUNoQyxPQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLFVBQVUsQ0FBQztBQUNoQyxPQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFJLFVBQVUsQ0FBQztBQUNoQyxhQUFPLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVO0FBQUMsS0FDcEM7Ozs0QkFDYyxDQUFDLEVBQUU7QUFDaEIsYUFBTztBQUNMLFNBQUMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QixTQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7T0FDOUIsQ0FBQTtLQUNGOzs7NkJBQ2UsTUFBTSxFQUFFLEdBQUcsRUFBd0I7VUFBdEIsR0FBRyx5REFBRyxNQUFNLENBQUMsT0FBTzs7QUFDL0MsVUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLFVBQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO0FBQzdDLGNBQU0sR0FBRyxDQUFDLEdBQUksQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUEsSUFBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUEsR0FBSSxDQUFDLENBQUM7S0FDN0M7Ozs0QkFDYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBd0I7VUFBdEIsR0FBRyx5REFBRyxNQUFNLENBQUMsT0FBTzs7O0FBRTVDLE9BQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7OztBQUFDLEFBRzVCLGFBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNoQjs7O2dDQUVrQixNQUFNLEVBQUU7QUFDekIsYUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNsRDs7O1NBNUNHLE1BQU07OztBQXdEWixNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs7QUFFbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Ozs7QUN0R3hCLFlBQVk7Ozs7QUFBQzs7SUFJUCxRQUFRLFlBQVIsUUFBUTt3QkFBUixRQUFROzs7QUFFZCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBNSVQgbGljZW5zZSAqL1xudmFyIGNvbnZlcnQgPSByZXF1aXJlKFwiY29sb3ItY29udmVydFwiKSxcbiAgICBzdHJpbmcgPSByZXF1aXJlKFwiY29sb3Itc3RyaW5nXCIpO1xuXG52YXIgQ29sb3IgPSBmdW5jdGlvbihvYmopIHtcbiAgaWYgKG9iaiBpbnN0YW5jZW9mIENvbG9yKSByZXR1cm4gb2JqO1xuICBpZiAoISAodGhpcyBpbnN0YW5jZW9mIENvbG9yKSkgcmV0dXJuIG5ldyBDb2xvcihvYmopO1xuXG4gICB0aGlzLnZhbHVlcyA9IHtcbiAgICAgIHJnYjogWzAsIDAsIDBdLFxuICAgICAgaHNsOiBbMCwgMCwgMF0sXG4gICAgICBoc3Y6IFswLCAwLCAwXSxcbiAgICAgIGh3YjogWzAsIDAsIDBdLFxuICAgICAgY215azogWzAsIDAsIDAsIDBdLFxuICAgICAgYWxwaGE6IDFcbiAgIH1cblxuICAgLy8gcGFyc2UgQ29sb3IoKSBhcmd1bWVudFxuICAgaWYgKHR5cGVvZiBvYmogPT0gXCJzdHJpbmdcIikge1xuICAgICAgdmFyIHZhbHMgPSBzdHJpbmcuZ2V0UmdiYShvYmopO1xuICAgICAgaWYgKHZhbHMpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwicmdiXCIsIHZhbHMpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzID0gc3RyaW5nLmdldEhzbGEob2JqKSkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdmFscyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHMgPSBzdHJpbmcuZ2V0SHdiKG9iaikpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHdiXCIsIHZhbHMpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIHN0cmluZyBcXFwiXCIgKyBvYmogKyBcIlxcXCJcIik7XG4gICAgICB9XG4gICB9XG4gICBlbHNlIGlmICh0eXBlb2Ygb2JqID09IFwib2JqZWN0XCIpIHtcbiAgICAgIHZhciB2YWxzID0gb2JqO1xuICAgICAgaWYodmFsc1tcInJcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1wicmVkXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwicmdiXCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHNbXCJsXCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcImxpZ2h0bmVzc1wiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB2YWxzKVxuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzW1widlwiXSAhPT0gdW5kZWZpbmVkIHx8IHZhbHNbXCJ2YWx1ZVwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcImhzdlwiLCB2YWxzKVxuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzW1wid1wiXSAhPT0gdW5kZWZpbmVkIHx8IHZhbHNbXCJ3aGl0ZW5lc3NcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJod2JcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFsc1tcImNcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1wiY3lhblwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcImNteWtcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcGFyc2UgY29sb3IgZnJvbSBvYmplY3QgXCIgKyBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICAgIH1cbiAgIH1cbn1cblxuQ29sb3IucHJvdG90eXBlID0ge1xuICAgcmdiOiBmdW5jdGlvbiAodmFscykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3BhY2UoXCJyZ2JcIiwgYXJndW1lbnRzKTtcbiAgIH0sXG4gICBoc2w6IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwiaHNsXCIsIGFyZ3VtZW50cyk7XG4gICB9LFxuICAgaHN2OiBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcImhzdlwiLCBhcmd1bWVudHMpO1xuICAgfSxcbiAgIGh3YjogZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3BhY2UoXCJod2JcIiwgYXJndW1lbnRzKTtcbiAgIH0sXG4gICBjbXlrOiBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcImNteWtcIiwgYXJndW1lbnRzKTtcbiAgIH0sXG5cbiAgIHJnYkFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5yZ2I7XG4gICB9LFxuICAgaHNsQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLmhzbDtcbiAgIH0sXG4gICBoc3ZBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMuaHN2O1xuICAgfSxcbiAgIGh3YkFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlcy5hbHBoYSAhPT0gMSkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXMuaHdiLmNvbmNhdChbdGhpcy52YWx1ZXMuYWxwaGFdKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLmh3YjtcbiAgIH0sXG4gICBjbXlrQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLmNteWs7XG4gICB9LFxuICAgcmdiYUFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG4gICAgICByZXR1cm4gcmdiLmNvbmNhdChbdGhpcy52YWx1ZXMuYWxwaGFdKTtcbiAgIH0sXG4gICBoc2xhQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhzbCA9IHRoaXMudmFsdWVzLmhzbDtcbiAgICAgIHJldHVybiBoc2wuY29uY2F0KFt0aGlzLnZhbHVlcy5hbHBoYV0pO1xuICAgfSxcbiAgIGFscGhhOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLmFscGhhO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJhbHBoYVwiLCB2YWwpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICByZWQ6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcInJnYlwiLCAwLCB2YWwpO1xuICAgfSxcbiAgIGdyZWVuOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJyZ2JcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICBibHVlOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJyZ2JcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICBodWU6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzbFwiLCAwLCB2YWwpO1xuICAgfSxcbiAgIHNhdHVyYXRpb246IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzbFwiLCAxLCB2YWwpO1xuICAgfSxcbiAgIGxpZ2h0bmVzczogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHNsXCIsIDIsIHZhbCk7XG4gICB9LFxuICAgc2F0dXJhdGlvbnY6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzdlwiLCAxLCB2YWwpO1xuICAgfSxcbiAgIHdoaXRlbmVzczogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHdiXCIsIDEsIHZhbCk7XG4gICB9LFxuICAgYmxhY2tuZXNzOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJod2JcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICB2YWx1ZTogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHN2XCIsIDIsIHZhbCk7XG4gICB9LFxuICAgY3lhbjogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiY215a1wiLCAwLCB2YWwpO1xuICAgfSxcbiAgIG1hZ2VudGE6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImNteWtcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICB5ZWxsb3c6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImNteWtcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICBibGFjazogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiY215a1wiLCAzLCB2YWwpO1xuICAgfSxcblxuICAgaGV4U3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcuaGV4U3RyaW5nKHRoaXMudmFsdWVzLnJnYik7XG4gICB9LFxuICAgcmdiU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcucmdiU3RyaW5nKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcbiAgIHJnYmFTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5yZ2JhU3RyaW5nKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcbiAgIHBlcmNlbnRTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5wZXJjZW50U3RyaW5nKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcbiAgIGhzbFN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLmhzbFN0cmluZyh0aGlzLnZhbHVlcy5oc2wsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG4gICBoc2xhU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcuaHNsYVN0cmluZyh0aGlzLnZhbHVlcy5oc2wsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG4gICBod2JTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5od2JTdHJpbmcodGhpcy52YWx1ZXMuaHdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuICAga2V5d29yZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLmtleXdvcmQodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuXG4gICByZ2JOdW1iZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICh0aGlzLnZhbHVlcy5yZ2JbMF0gPDwgMTYpIHwgKHRoaXMudmFsdWVzLnJnYlsxXSA8PCA4KSB8IHRoaXMudmFsdWVzLnJnYlsyXTtcbiAgIH0sXG5cbiAgIGx1bWlub3NpdHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNyZWxhdGl2ZWx1bWluYW5jZWRlZlxuICAgICAgdmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcbiAgICAgIHZhciBsdW0gPSBbXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICB2YXIgY2hhbiA9IHJnYltpXSAvIDI1NTtcbiAgICAgICAgIGx1bVtpXSA9IChjaGFuIDw9IDAuMDM5MjgpID8gY2hhbiAvIDEyLjkyXG4gICAgICAgICAgICAgICAgICA6IE1hdGgucG93KCgoY2hhbiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KVxuICAgICAgfVxuICAgICAgcmV0dXJuIDAuMjEyNiAqIGx1bVswXSArIDAuNzE1MiAqIGx1bVsxXSArIDAuMDcyMiAqIGx1bVsyXTtcbiAgIH0sXG5cbiAgIGNvbnRyYXN0OiBmdW5jdGlvbihjb2xvcjIpIHtcbiAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jY29udHJhc3QtcmF0aW9kZWZcbiAgICAgIHZhciBsdW0xID0gdGhpcy5sdW1pbm9zaXR5KCk7XG4gICAgICB2YXIgbHVtMiA9IGNvbG9yMi5sdW1pbm9zaXR5KCk7XG4gICAgICBpZiAobHVtMSA+IGx1bTIpIHtcbiAgICAgICAgIHJldHVybiAobHVtMSArIDAuMDUpIC8gKGx1bTIgKyAwLjA1KVxuICAgICAgfTtcbiAgICAgIHJldHVybiAobHVtMiArIDAuMDUpIC8gKGx1bTEgKyAwLjA1KTtcbiAgIH0sXG5cbiAgIGxldmVsOiBmdW5jdGlvbihjb2xvcjIpIHtcbiAgICAgdmFyIGNvbnRyYXN0UmF0aW8gPSB0aGlzLmNvbnRyYXN0KGNvbG9yMik7XG4gICAgIHJldHVybiAoY29udHJhc3RSYXRpbyA+PSA3LjEpXG4gICAgICAgPyAnQUFBJ1xuICAgICAgIDogKGNvbnRyYXN0UmF0aW8gPj0gNC41KVxuICAgICAgICA/ICdBQSdcbiAgICAgICAgOiAnJztcbiAgIH0sXG5cbiAgIGRhcms6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gWUlRIGVxdWF0aW9uIGZyb20gaHR0cDovLzI0d2F5cy5vcmcvMjAxMC9jYWxjdWxhdGluZy1jb2xvci1jb250cmFzdFxuICAgICAgdmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYixcbiAgICAgICAgICB5aXEgPSAocmdiWzBdICogMjk5ICsgcmdiWzFdICogNTg3ICsgcmdiWzJdICogMTE0KSAvIDEwMDA7XG4gICAgICByZXR1cm4geWlxIDwgMTI4O1xuICAgfSxcblxuICAgbGlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICF0aGlzLmRhcmsoKTtcbiAgIH0sXG5cbiAgIG5lZ2F0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmdiID0gW11cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSAyNTUgLSB0aGlzLnZhbHVlcy5yZ2JbaV07XG4gICAgICB9XG4gICAgICB0aGlzLnNldFZhbHVlcyhcInJnYlwiLCByZ2IpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBsaWdodGVuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy52YWx1ZXMuaHNsWzJdICs9IHRoaXMudmFsdWVzLmhzbFsyXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdGhpcy52YWx1ZXMuaHNsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgZGFya2VuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy52YWx1ZXMuaHNsWzJdIC09IHRoaXMudmFsdWVzLmhzbFsyXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdGhpcy52YWx1ZXMuaHNsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgc2F0dXJhdGU6IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnZhbHVlcy5oc2xbMV0gKz0gdGhpcy52YWx1ZXMuaHNsWzFdICogcmF0aW87XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB0aGlzLnZhbHVlcy5oc2wpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBkZXNhdHVyYXRlOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy52YWx1ZXMuaHNsWzFdIC09IHRoaXMudmFsdWVzLmhzbFsxXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdGhpcy52YWx1ZXMuaHNsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgd2hpdGVuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy52YWx1ZXMuaHdiWzFdICs9IHRoaXMudmFsdWVzLmh3YlsxXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJod2JcIiwgdGhpcy52YWx1ZXMuaHdiKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgYmxhY2tlbjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMudmFsdWVzLmh3YlsyXSArPSB0aGlzLnZhbHVlcy5od2JbMl0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHdiXCIsIHRoaXMudmFsdWVzLmh3Yik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIGdyZXlzY2FsZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuICAgICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmF5c2NhbGUjQ29udmVydGluZ19jb2xvcl90b19ncmF5c2NhbGVcbiAgICAgIHZhciB2YWwgPSByZ2JbMF0gKiAwLjMgKyByZ2JbMV0gKiAwLjU5ICsgcmdiWzJdICogMC4xMTtcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwicmdiXCIsIFt2YWwsIHZhbCwgdmFsXSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIGNsZWFyZXI6IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImFscGhhXCIsIHRoaXMudmFsdWVzLmFscGhhIC0gKHRoaXMudmFsdWVzLmFscGhhICogcmF0aW8pKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgb3BhcXVlcjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiYWxwaGFcIiwgdGhpcy52YWx1ZXMuYWxwaGEgKyAodGhpcy52YWx1ZXMuYWxwaGEgKiByYXRpbykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICByb3RhdGU6IGZ1bmN0aW9uKGRlZ3JlZXMpIHtcbiAgICAgIHZhciBodWUgPSB0aGlzLnZhbHVlcy5oc2xbMF07XG4gICAgICBodWUgPSAoaHVlICsgZGVncmVlcykgJSAzNjA7XG4gICAgICBodWUgPSBodWUgPCAwID8gMzYwICsgaHVlIDogaHVlO1xuICAgICAgdGhpcy52YWx1ZXMuaHNsWzBdID0gaHVlO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdGhpcy52YWx1ZXMuaHNsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgLyoqXG4gICAgKiBQb3J0ZWQgZnJvbSBzYXNzIGltcGxlbWVudGF0aW9uIGluIENcbiAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zYXNzL2xpYnNhc3MvYmxvYi8wZTZiNGEyODUwMDkyMzU2YWEzZWNlMDdjNmIyNDlmMDIyMWNhY2VkL2Z1bmN0aW9ucy5jcHAjTDIwOVxuICAgICovXG4gICBtaXg6IGZ1bmN0aW9uKG1peGluQ29sb3IsIHdlaWdodCkge1xuICAgICAgdmFyIGNvbG9yMSA9IHRoaXM7XG4gICAgICB2YXIgY29sb3IyID0gbWl4aW5Db2xvcjtcbiAgICAgIHZhciBwID0gd2VpZ2h0ICE9PSB1bmRlZmluZWQgPyB3ZWlnaHQgOiAwLjU7XG5cbiAgICAgIHZhciB3ID0gMiAqIHAgLSAxO1xuICAgICAgdmFyIGEgPSBjb2xvcjEuYWxwaGEoKSAtIGNvbG9yMi5hbHBoYSgpO1xuXG4gICAgICB2YXIgdzEgPSAoKCh3ICogYSA9PSAtMSkgPyB3IDogKHcgKyBhKS8oMSArIHcqYSkpICsgMSkgLyAyLjA7XG4gICAgICB2YXIgdzIgPSAxIC0gdzE7XG5cbiAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIC5yZ2IoXG4gICAgICAgICAgdzEgKiBjb2xvcjEucmVkKCkgKyB3MiAqIGNvbG9yMi5yZWQoKSxcbiAgICAgICAgICB3MSAqIGNvbG9yMS5ncmVlbigpICsgdzIgKiBjb2xvcjIuZ3JlZW4oKSxcbiAgICAgICAgICB3MSAqIGNvbG9yMS5ibHVlKCkgKyB3MiAqIGNvbG9yMi5ibHVlKClcbiAgICAgICAgKVxuICAgICAgICAuYWxwaGEoY29sb3IxLmFscGhhKCkgKiBwICsgY29sb3IyLmFscGhhKCkgKiAoMSAtIHApKTtcbiAgIH0sXG5cbiAgIHRvSlNPTjogZnVuY3Rpb24oKSB7XG4gICAgIHJldHVybiB0aGlzLnJnYigpO1xuICAgfSxcblxuICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICByZXR1cm4gbmV3IENvbG9yKHRoaXMucmdiKCkpO1xuICAgfVxufVxuXG5cbkNvbG9yLnByb3RvdHlwZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSkge1xuICAgdmFyIHZhbHMgPSB7fTtcbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHNbc3BhY2UuY2hhckF0KGkpXSA9IHRoaXMudmFsdWVzW3NwYWNlXVtpXTtcbiAgIH1cbiAgIGlmICh0aGlzLnZhbHVlcy5hbHBoYSAhPSAxKSB7XG4gICAgICB2YWxzW1wiYVwiXSA9IHRoaXMudmFsdWVzLmFscGhhO1xuICAgfVxuICAgLy8ge3I6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDAuNH1cbiAgIHJldHVybiB2YWxzO1xufVxuXG5Db2xvci5wcm90b3R5cGUuc2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UsIHZhbHMpIHtcbiAgIHZhciBzcGFjZXMgPSB7XG4gICAgICBcInJnYlwiOiBbXCJyZWRcIiwgXCJncmVlblwiLCBcImJsdWVcIl0sXG4gICAgICBcImhzbFwiOiBbXCJodWVcIiwgXCJzYXR1cmF0aW9uXCIsIFwibGlnaHRuZXNzXCJdLFxuICAgICAgXCJoc3ZcIjogW1wiaHVlXCIsIFwic2F0dXJhdGlvblwiLCBcInZhbHVlXCJdLFxuICAgICAgXCJod2JcIjogW1wiaHVlXCIsIFwid2hpdGVuZXNzXCIsIFwiYmxhY2tuZXNzXCJdLFxuICAgICAgXCJjbXlrXCI6IFtcImN5YW5cIiwgXCJtYWdlbnRhXCIsIFwieWVsbG93XCIsIFwiYmxhY2tcIl1cbiAgIH07XG5cbiAgIHZhciBtYXhlcyA9IHtcbiAgICAgIFwicmdiXCI6IFsyNTUsIDI1NSwgMjU1XSxcbiAgICAgIFwiaHNsXCI6IFszNjAsIDEwMCwgMTAwXSxcbiAgICAgIFwiaHN2XCI6IFszNjAsIDEwMCwgMTAwXSxcbiAgICAgIFwiaHdiXCI6IFszNjAsIDEwMCwgMTAwXSxcbiAgICAgIFwiY215a1wiOiBbMTAwLCAxMDAsIDEwMCwgMTAwXVxuICAgfTtcblxuICAgdmFyIGFscGhhID0gMTtcbiAgIGlmIChzcGFjZSA9PSBcImFscGhhXCIpIHtcbiAgICAgIGFscGhhID0gdmFscztcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHMubGVuZ3RoKSB7XG4gICAgICAvLyBbMTAsIDEwLCAxMF1cbiAgICAgIHRoaXMudmFsdWVzW3NwYWNlXSA9IHZhbHMuc2xpY2UoMCwgc3BhY2UubGVuZ3RoKTtcbiAgICAgIGFscGhhID0gdmFsc1tzcGFjZS5sZW5ndGhdO1xuICAgfVxuICAgZWxzZSBpZiAodmFsc1tzcGFjZS5jaGFyQXQoMCldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIHtyOiAxMCwgZzogMTAsIGI6IDEwfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnZhbHVlc1tzcGFjZV1baV0gPSB2YWxzW3NwYWNlLmNoYXJBdChpKV07XG4gICAgICB9XG4gICAgICBhbHBoYSA9IHZhbHMuYTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHNbc3BhY2VzW3NwYWNlXVswXV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8ge3JlZDogMTAsIGdyZWVuOiAxMCwgYmx1ZTogMTB9XG4gICAgICB2YXIgY2hhbnMgPSBzcGFjZXNbc3BhY2VdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnZhbHVlc1tzcGFjZV1baV0gPSB2YWxzW2NoYW5zW2ldXTtcbiAgICAgIH1cbiAgICAgIGFscGhhID0gdmFscy5hbHBoYTtcbiAgIH1cbiAgIHRoaXMudmFsdWVzLmFscGhhID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgKGFscGhhICE9PSB1bmRlZmluZWQgPyBhbHBoYSA6IHRoaXMudmFsdWVzLmFscGhhKSApKTtcbiAgIGlmIChzcGFjZSA9PSBcImFscGhhXCIpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cblxuICAgLy8gY2FwIHZhbHVlcyBvZiB0aGUgc3BhY2UgcHJpb3IgY29udmVydGluZyBhbGwgdmFsdWVzXG4gICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY2FwcGVkID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4ZXNbc3BhY2VdW2ldLCB0aGlzLnZhbHVlc1tzcGFjZV1baV0pKTtcbiAgICAgIHRoaXMudmFsdWVzW3NwYWNlXVtpXSA9IE1hdGgucm91bmQoY2FwcGVkKTtcbiAgIH1cblxuICAgLy8gY29udmVydCB0byBhbGwgdGhlIG90aGVyIGNvbG9yIHNwYWNlc1xuICAgZm9yICh2YXIgc25hbWUgaW4gc3BhY2VzKSB7XG4gICAgICBpZiAoc25hbWUgIT0gc3BhY2UpIHtcbiAgICAgICAgIHRoaXMudmFsdWVzW3NuYW1lXSA9IGNvbnZlcnRbc3BhY2VdW3NuYW1lXSh0aGlzLnZhbHVlc1tzcGFjZV0pXG4gICAgICB9XG5cbiAgICAgIC8vIGNhcCB2YWx1ZXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc25hbWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHZhciBjYXBwZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhlc1tzbmFtZV1baV0sIHRoaXMudmFsdWVzW3NuYW1lXVtpXSkpO1xuICAgICAgICAgdGhpcy52YWx1ZXNbc25hbWVdW2ldID0gTWF0aC5yb3VuZChjYXBwZWQpO1xuICAgICAgfVxuICAgfVxuICAgcmV0dXJuIHRydWU7XG59XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRTcGFjZSA9IGZ1bmN0aW9uKHNwYWNlLCBhcmdzKSB7XG4gICB2YXIgdmFscyA9IGFyZ3NbMF07XG4gICBpZiAodmFscyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBjb2xvci5yZ2IoKVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzKHNwYWNlKTtcbiAgIH1cbiAgIC8vIGNvbG9yLnJnYigxMCwgMTAsIDEwKVxuICAgaWYgKHR5cGVvZiB2YWxzID09IFwibnVtYmVyXCIpIHtcbiAgICAgIHZhbHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTtcbiAgIH1cbiAgIHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB2YWxzKTtcbiAgIHJldHVybiB0aGlzO1xufVxuXG5Db2xvci5wcm90b3R5cGUuc2V0Q2hhbm5lbCA9IGZ1bmN0aW9uKHNwYWNlLCBpbmRleCwgdmFsKSB7XG4gICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGNvbG9yLnJlZCgpXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXNbc3BhY2VdW2luZGV4XTtcbiAgIH1cbiAgIC8vIGNvbG9yLnJlZCgxMDApXG4gICB0aGlzLnZhbHVlc1tzcGFjZV1baW5kZXhdID0gdmFsO1xuICAgdGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHRoaXMudmFsdWVzW3NwYWNlXSk7XG4gICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb2xvcjtcbiIsIi8qIE1JVCBsaWNlbnNlICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZ2IyaHNsOiByZ2IyaHNsLFxuICByZ2IyaHN2OiByZ2IyaHN2LFxuICByZ2IyaHdiOiByZ2IyaHdiLFxuICByZ2IyY215azogcmdiMmNteWssXG4gIHJnYjJrZXl3b3JkOiByZ2Iya2V5d29yZCxcbiAgcmdiMnh5ejogcmdiMnh5eixcbiAgcmdiMmxhYjogcmdiMmxhYixcbiAgcmdiMmxjaDogcmdiMmxjaCxcblxuICBoc2wycmdiOiBoc2wycmdiLFxuICBoc2wyaHN2OiBoc2wyaHN2LFxuICBoc2wyaHdiOiBoc2wyaHdiLFxuICBoc2wyY215azogaHNsMmNteWssXG4gIGhzbDJrZXl3b3JkOiBoc2wya2V5d29yZCxcblxuICBoc3YycmdiOiBoc3YycmdiLFxuICBoc3YyaHNsOiBoc3YyaHNsLFxuICBoc3YyaHdiOiBoc3YyaHdiLFxuICBoc3YyY215azogaHN2MmNteWssXG4gIGhzdjJrZXl3b3JkOiBoc3Yya2V5d29yZCxcblxuICBod2IycmdiOiBod2IycmdiLFxuICBod2IyaHNsOiBod2IyaHNsLFxuICBod2IyaHN2OiBod2IyaHN2LFxuICBod2IyY215azogaHdiMmNteWssXG4gIGh3YjJrZXl3b3JkOiBod2Iya2V5d29yZCxcblxuICBjbXlrMnJnYjogY215azJyZ2IsXG4gIGNteWsyaHNsOiBjbXlrMmhzbCxcbiAgY215azJoc3Y6IGNteWsyaHN2LFxuICBjbXlrMmh3YjogY215azJod2IsXG4gIGNteWsya2V5d29yZDogY215azJrZXl3b3JkLFxuXG4gIGtleXdvcmQycmdiOiBrZXl3b3JkMnJnYixcbiAga2V5d29yZDJoc2w6IGtleXdvcmQyaHNsLFxuICBrZXl3b3JkMmhzdjoga2V5d29yZDJoc3YsXG4gIGtleXdvcmQyaHdiOiBrZXl3b3JkMmh3YixcbiAga2V5d29yZDJjbXlrOiBrZXl3b3JkMmNteWssXG4gIGtleXdvcmQybGFiOiBrZXl3b3JkMmxhYixcbiAga2V5d29yZDJ4eXo6IGtleXdvcmQyeHl6LFxuXG4gIHh5ejJyZ2I6IHh5ejJyZ2IsXG4gIHh5ejJsYWI6IHh5ejJsYWIsXG4gIHh5ejJsY2g6IHh5ejJsY2gsXG5cbiAgbGFiMnh5ejogbGFiMnh5eixcbiAgbGFiMnJnYjogbGFiMnJnYixcbiAgbGFiMmxjaDogbGFiMmxjaCxcblxuICBsY2gybGFiOiBsY2gybGFiLFxuICBsY2gyeHl6OiBsY2gyeHl6LFxuICBsY2gycmdiOiBsY2gycmdiXG59XG5cblxuZnVuY3Rpb24gcmdiMmhzbChyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0vMjU1LFxuICAgICAgZyA9IHJnYlsxXS8yNTUsXG4gICAgICBiID0gcmdiWzJdLzI1NSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBkZWx0YSA9IG1heCAtIG1pbixcbiAgICAgIGgsIHMsIGw7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgaCA9IDA7XG4gIGVsc2UgaWYgKHIgPT0gbWF4KVxuICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICBlbHNlIGlmIChiID09IG1heClcbiAgICBoID0gNCArIChyIC0gZykvIGRlbHRhO1xuXG4gIGggPSBNYXRoLm1pbihoICogNjAsIDM2MCk7XG5cbiAgaWYgKGggPCAwKVxuICAgIGggKz0gMzYwO1xuXG4gIGwgPSAobWluICsgbWF4KSAvIDI7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgcyA9IDA7XG4gIGVsc2UgaWYgKGwgPD0gMC41KVxuICAgIHMgPSBkZWx0YSAvIChtYXggKyBtaW4pO1xuICBlbHNlXG4gICAgcyA9IGRlbHRhIC8gKDIgLSBtYXggLSBtaW4pO1xuXG4gIHJldHVybiBbaCwgcyAqIDEwMCwgbCAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJoc3YocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLFxuICAgICAgZyA9IHJnYlsxXSxcbiAgICAgIGIgPSByZ2JbMl0sXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICBoLCBzLCB2O1xuXG4gIGlmIChtYXggPT0gMClcbiAgICBzID0gMDtcbiAgZWxzZVxuICAgIHMgPSAoZGVsdGEvbWF4ICogMTAwMCkvMTA7XG5cbiAgaWYgKG1heCA9PSBtaW4pXG4gICAgaCA9IDA7XG4gIGVsc2UgaWYgKHIgPT0gbWF4KVxuICAgIGggPSAoZyAtIGIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGcgPT0gbWF4KVxuICAgIGggPSAyICsgKGIgLSByKSAvIGRlbHRhO1xuICBlbHNlIGlmIChiID09IG1heClcbiAgICBoID0gNCArIChyIC0gZykgLyBkZWx0YTtcblxuICBoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG4gIGlmIChoIDwgMClcbiAgICBoICs9IDM2MDtcblxuICB2ID0gKChtYXggLyAyNTUpICogMTAwMCkgLyAxMDtcblxuICByZXR1cm4gW2gsIHMsIHZdO1xufVxuXG5mdW5jdGlvbiByZ2IyaHdiKHJnYikge1xuICB2YXIgciA9IHJnYlswXSxcbiAgICAgIGcgPSByZ2JbMV0sXG4gICAgICBiID0gcmdiWzJdLFxuICAgICAgaCA9IHJnYjJoc2wocmdiKVswXSxcbiAgICAgIHcgPSAxLzI1NSAqIE1hdGgubWluKHIsIE1hdGgubWluKGcsIGIpKSxcbiAgICAgIGIgPSAxIC0gMS8yNTUgKiBNYXRoLm1heChyLCBNYXRoLm1heChnLCBiKSk7XG5cbiAgcmV0dXJuIFtoLCB3ICogMTAwLCBiICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmNteWsocmdiKSB7XG4gIHZhciByID0gcmdiWzBdIC8gMjU1LFxuICAgICAgZyA9IHJnYlsxXSAvIDI1NSxcbiAgICAgIGIgPSByZ2JbMl0gLyAyNTUsXG4gICAgICBjLCBtLCB5LCBrO1xuXG4gIGsgPSBNYXRoLm1pbigxIC0gciwgMSAtIGcsIDEgLSBiKTtcbiAgYyA9ICgxIC0gciAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICBtID0gKDEgLSBnIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIHkgPSAoMSAtIGIgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgcmV0dXJuIFtjICogMTAwLCBtICogMTAwLCB5ICogMTAwLCBrICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmtleXdvcmQocmdiKSB7XG4gIHJldHVybiByZXZlcnNlS2V5d29yZHNbSlNPTi5zdHJpbmdpZnkocmdiKV07XG59XG5cbmZ1bmN0aW9uIHJnYjJ4eXoocmdiKSB7XG4gIHZhciByID0gcmdiWzBdIC8gMjU1LFxuICAgICAgZyA9IHJnYlsxXSAvIDI1NSxcbiAgICAgIGIgPSByZ2JbMl0gLyAyNTU7XG5cbiAgLy8gYXNzdW1lIHNSR0JcbiAgciA9IHIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChyICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKHIgLyAxMi45Mik7XG4gIGcgPSBnID4gMC4wNDA0NSA/IE1hdGgucG93KCgoZyArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChnIC8gMTIuOTIpO1xuICBiID0gYiA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoYiAvIDEyLjkyKTtcblxuICB2YXIgeCA9IChyICogMC40MTI0KSArIChnICogMC4zNTc2KSArIChiICogMC4xODA1KTtcbiAgdmFyIHkgPSAociAqIDAuMjEyNikgKyAoZyAqIDAuNzE1MikgKyAoYiAqIDAuMDcyMik7XG4gIHZhciB6ID0gKHIgKiAwLjAxOTMpICsgKGcgKiAwLjExOTIpICsgKGIgKiAwLjk1MDUpO1xuXG4gIHJldHVybiBbeCAqIDEwMCwgeSAqMTAwLCB6ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmxhYihyZ2IpIHtcbiAgdmFyIHh5eiA9IHJnYjJ4eXoocmdiKSxcbiAgICAgICAgeCA9IHh5elswXSxcbiAgICAgICAgeSA9IHh5elsxXSxcbiAgICAgICAgeiA9IHh5elsyXSxcbiAgICAgICAgbCwgYSwgYjtcblxuICB4IC89IDk1LjA0NztcbiAgeSAvPSAxMDA7XG4gIHogLz0gMTA4Ljg4MztcblxuICB4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcbiAgeSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG4gIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG4gIGwgPSAoMTE2ICogeSkgLSAxNjtcbiAgYSA9IDUwMCAqICh4IC0geSk7XG4gIGIgPSAyMDAgKiAoeSAtIHopO1xuXG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIHJnYjJsY2goYXJncykge1xuICByZXR1cm4gbGFiMmxjaChyZ2IybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMnJnYihoc2wpIHtcbiAgdmFyIGggPSBoc2xbMF0gLyAzNjAsXG4gICAgICBzID0gaHNsWzFdIC8gMTAwLFxuICAgICAgbCA9IGhzbFsyXSAvIDEwMCxcbiAgICAgIHQxLCB0MiwgdDMsIHJnYiwgdmFsO1xuXG4gIGlmIChzID09IDApIHtcbiAgICB2YWwgPSBsICogMjU1O1xuICAgIHJldHVybiBbdmFsLCB2YWwsIHZhbF07XG4gIH1cblxuICBpZiAobCA8IDAuNSlcbiAgICB0MiA9IGwgKiAoMSArIHMpO1xuICBlbHNlXG4gICAgdDIgPSBsICsgcyAtIGwgKiBzO1xuICB0MSA9IDIgKiBsIC0gdDI7XG5cbiAgcmdiID0gWzAsIDAsIDBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIHQzID0gaCArIDEgLyAzICogLSAoaSAtIDEpO1xuICAgIHQzIDwgMCAmJiB0MysrO1xuICAgIHQzID4gMSAmJiB0My0tO1xuXG4gICAgaWYgKDYgKiB0MyA8IDEpXG4gICAgICB2YWwgPSB0MSArICh0MiAtIHQxKSAqIDYgKiB0MztcbiAgICBlbHNlIGlmICgyICogdDMgPCAxKVxuICAgICAgdmFsID0gdDI7XG4gICAgZWxzZSBpZiAoMyAqIHQzIDwgMilcbiAgICAgIHZhbCA9IHQxICsgKHQyIC0gdDEpICogKDIgLyAzIC0gdDMpICogNjtcbiAgICBlbHNlXG4gICAgICB2YWwgPSB0MTtcblxuICAgIHJnYltpXSA9IHZhbCAqIDI1NTtcbiAgfVxuXG4gIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGhzbDJoc3YoaHNsKSB7XG4gIHZhciBoID0gaHNsWzBdLFxuICAgICAgcyA9IGhzbFsxXSAvIDEwMCxcbiAgICAgIGwgPSBoc2xbMl0gLyAxMDAsXG4gICAgICBzdiwgdjtcblxuICBpZihsID09PSAwKSB7XG4gICAgICAvLyBubyBuZWVkIHRvIGRvIGNhbGMgb24gYmxhY2tcbiAgICAgIC8vIGFsc28gYXZvaWRzIGRpdmlkZSBieSAwIGVycm9yXG4gICAgICByZXR1cm4gWzAsIDAsIDBdO1xuICB9XG5cbiAgbCAqPSAyO1xuICBzICo9IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuICB2ID0gKGwgKyBzKSAvIDI7XG4gIHN2ID0gKDIgKiBzKSAvIChsICsgcyk7XG4gIHJldHVybiBbaCwgc3YgKiAxMDAsIHYgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiBoc2wyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoaHNsMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGhzbDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChoc2wycmdiKGFyZ3MpKTtcbn1cblxuXG5mdW5jdGlvbiBoc3YycmdiKGhzdikge1xuICB2YXIgaCA9IGhzdlswXSAvIDYwLFxuICAgICAgcyA9IGhzdlsxXSAvIDEwMCxcbiAgICAgIHYgPSBoc3ZbMl0gLyAxMDAsXG4gICAgICBoaSA9IE1hdGguZmxvb3IoaCkgJSA2O1xuXG4gIHZhciBmID0gaCAtIE1hdGguZmxvb3IoaCksXG4gICAgICBwID0gMjU1ICogdiAqICgxIC0gcyksXG4gICAgICBxID0gMjU1ICogdiAqICgxIC0gKHMgKiBmKSksXG4gICAgICB0ID0gMjU1ICogdiAqICgxIC0gKHMgKiAoMSAtIGYpKSksXG4gICAgICB2ID0gMjU1ICogdjtcblxuICBzd2l0Y2goaGkpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gW3YsIHQsIHBdO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBbcSwgdiwgcF07XG4gICAgY2FzZSAyOlxuICAgICAgcmV0dXJuIFtwLCB2LCB0XTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gW3AsIHEsIHZdO1xuICAgIGNhc2UgNDpcbiAgICAgIHJldHVybiBbdCwgcCwgdl07XG4gICAgY2FzZSA1OlxuICAgICAgcmV0dXJuIFt2LCBwLCBxXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoc3YyaHNsKGhzdikge1xuICB2YXIgaCA9IGhzdlswXSxcbiAgICAgIHMgPSBoc3ZbMV0gLyAxMDAsXG4gICAgICB2ID0gaHN2WzJdIC8gMTAwLFxuICAgICAgc2wsIGw7XG5cbiAgbCA9ICgyIC0gcykgKiB2O1xuICBzbCA9IHMgKiB2O1xuICBzbCAvPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcbiAgc2wgPSBzbCB8fCAwO1xuICBsIC89IDI7XG4gIHJldHVybiBbaCwgc2wgKiAxMDAsIGwgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiBoc3YyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoaHN2MnJnYihhcmdzKSlcbn1cblxuZnVuY3Rpb24gaHN2MmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHN2MnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzdjJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGhzdjJyZ2IoYXJncykpO1xufVxuXG4vLyBodHRwOi8vZGV2LnczLm9yZy9jc3N3Zy9jc3MtY29sb3IvI2h3Yi10by1yZ2JcbmZ1bmN0aW9uIGh3YjJyZ2IoaHdiKSB7XG4gIHZhciBoID0gaHdiWzBdIC8gMzYwLFxuICAgICAgd2ggPSBod2JbMV0gLyAxMDAsXG4gICAgICBibCA9IGh3YlsyXSAvIDEwMCxcbiAgICAgIHJhdGlvID0gd2ggKyBibCxcbiAgICAgIGksIHYsIGYsIG47XG5cbiAgLy8gd2ggKyBibCBjYW50IGJlID4gMVxuICBpZiAocmF0aW8gPiAxKSB7XG4gICAgd2ggLz0gcmF0aW87XG4gICAgYmwgLz0gcmF0aW87XG4gIH1cblxuICBpID0gTWF0aC5mbG9vcig2ICogaCk7XG4gIHYgPSAxIC0gYmw7XG4gIGYgPSA2ICogaCAtIGk7XG4gIGlmICgoaSAmIDB4MDEpICE9IDApIHtcbiAgICBmID0gMSAtIGY7XG4gIH1cbiAgbiA9IHdoICsgZiAqICh2IC0gd2gpOyAgLy8gbGluZWFyIGludGVycG9sYXRpb25cblxuICBzd2l0Y2ggKGkpIHtcbiAgICBkZWZhdWx0OlxuICAgIGNhc2UgNjpcbiAgICBjYXNlIDA6IHIgPSB2OyBnID0gbjsgYiA9IHdoOyBicmVhaztcbiAgICBjYXNlIDE6IHIgPSBuOyBnID0gdjsgYiA9IHdoOyBicmVhaztcbiAgICBjYXNlIDI6IHIgPSB3aDsgZyA9IHY7IGIgPSBuOyBicmVhaztcbiAgICBjYXNlIDM6IHIgPSB3aDsgZyA9IG47IGIgPSB2OyBicmVhaztcbiAgICBjYXNlIDQ6IHIgPSBuOyBnID0gd2g7IGIgPSB2OyBicmVhaztcbiAgICBjYXNlIDU6IHIgPSB2OyBnID0gd2g7IGIgPSBuOyBicmVhaztcbiAgfVxuXG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIGh3YjJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2IyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsycmdiKGNteWspIHtcbiAgdmFyIGMgPSBjbXlrWzBdIC8gMTAwLFxuICAgICAgbSA9IGNteWtbMV0gLyAxMDAsXG4gICAgICB5ID0gY215a1syXSAvIDEwMCxcbiAgICAgIGsgPSBjbXlrWzNdIC8gMTAwLFxuICAgICAgciwgZywgYjtcblxuICByID0gMSAtIE1hdGgubWluKDEsIGMgKiAoMSAtIGspICsgayk7XG4gIGcgPSAxIC0gTWF0aC5taW4oMSwgbSAqICgxIC0gaykgKyBrKTtcbiAgYiA9IDEgLSBNYXRoLm1pbigxLCB5ICogKDEgLSBrKSArIGspO1xuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiBjbXlrMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2IoY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoY215azJyZ2IoYXJncykpO1xufVxuXG5cbmZ1bmN0aW9uIHh5ejJyZ2IoeHl6KSB7XG4gIHZhciB4ID0geHl6WzBdIC8gMTAwLFxuICAgICAgeSA9IHh5elsxXSAvIDEwMCxcbiAgICAgIHogPSB4eXpbMl0gLyAxMDAsXG4gICAgICByLCBnLCBiO1xuXG4gIHIgPSAoeCAqIDMuMjQwNikgKyAoeSAqIC0xLjUzNzIpICsgKHogKiAtMC40OTg2KTtcbiAgZyA9ICh4ICogLTAuOTY4OSkgKyAoeSAqIDEuODc1OCkgKyAoeiAqIDAuMDQxNSk7XG4gIGIgPSAoeCAqIDAuMDU1NykgKyAoeSAqIC0wLjIwNDApICsgKHogKiAxLjA1NzApO1xuXG4gIC8vIGFzc3VtZSBzUkdCXG4gIHIgPSByID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KHIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiByID0gKHIgKiAxMi45Mik7XG5cbiAgZyA9IGcgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3coZywgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IGcgPSAoZyAqIDEyLjkyKTtcblxuICBiID0gYiA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhiLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogYiA9IChiICogMTIuOTIpO1xuXG4gIHIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCByKSwgMSk7XG4gIGcgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBnKSwgMSk7XG4gIGIgPSBNYXRoLm1pbihNYXRoLm1heCgwLCBiKSwgMSk7XG5cbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24geHl6MmxhYih4eXopIHtcbiAgdmFyIHggPSB4eXpbMF0sXG4gICAgICB5ID0geHl6WzFdLFxuICAgICAgeiA9IHh5elsyXSxcbiAgICAgIGwsIGEsIGI7XG5cbiAgeCAvPSA5NS4wNDc7XG4gIHkgLz0gMTAwO1xuICB6IC89IDEwOC44ODM7XG5cbiAgeCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEvMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG4gIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxLzMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuICB6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMS8zKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuICBsID0gKDExNiAqIHkpIC0gMTY7XG4gIGEgPSA1MDAgKiAoeCAtIHkpO1xuICBiID0gMjAwICogKHkgLSB6KTtcblxuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiB4eXoybGNoKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJsY2goeHl6MmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxhYjJ4eXoobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICB4LCB5LCB6LCB5MjtcblxuICBpZiAobCA8PSA4KSB7XG4gICAgeSA9IChsICogMTAwKSAvIDkwMy4zO1xuICAgIHkyID0gKDcuNzg3ICogKHkgLyAxMDApKSArICgxNiAvIDExNik7XG4gIH0gZWxzZSB7XG4gICAgeSA9IDEwMCAqIE1hdGgucG93KChsICsgMTYpIC8gMTE2LCAzKTtcbiAgICB5MiA9IE1hdGgucG93KHkgLyAxMDAsIDEvMyk7XG4gIH1cblxuICB4ID0geCAvIDk1LjA0NyA8PSAwLjAwODg1NiA/IHggPSAoOTUuMDQ3ICogKChhIC8gNTAwKSArIHkyIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiA5NS4wNDcgKiBNYXRoLnBvdygoYSAvIDUwMCkgKyB5MiwgMyk7XG5cbiAgeiA9IHogLyAxMDguODgzIDw9IDAuMDA4ODU5ID8geiA9ICgxMDguODgzICogKHkyIC0gKGIgLyAyMDApIC0gKDE2IC8gMTE2KSkpIC8gNy43ODcgOiAxMDguODgzICogTWF0aC5wb3coeTIgLSAoYiAvIDIwMCksIDMpO1xuXG4gIHJldHVybiBbeCwgeSwgel07XG59XG5cbmZ1bmN0aW9uIGxhYjJsY2gobGFiKSB7XG4gIHZhciBsID0gbGFiWzBdLFxuICAgICAgYSA9IGxhYlsxXSxcbiAgICAgIGIgPSBsYWJbMl0sXG4gICAgICBociwgaCwgYztcblxuICBociA9IE1hdGguYXRhbjIoYiwgYSk7XG4gIGggPSBociAqIDM2MCAvIDIgLyBNYXRoLlBJO1xuICBpZiAoaCA8IDApIHtcbiAgICBoICs9IDM2MDtcbiAgfVxuICBjID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpO1xuICByZXR1cm4gW2wsIGMsIGhdO1xufVxuXG5mdW5jdGlvbiBsYWIycmdiKGFyZ3MpIHtcbiAgcmV0dXJuIHh5ejJyZ2IobGFiMnh5eihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxjaDJsYWIobGNoKSB7XG4gIHZhciBsID0gbGNoWzBdLFxuICAgICAgYyA9IGxjaFsxXSxcbiAgICAgIGggPSBsY2hbMl0sXG4gICAgICBhLCBiLCBocjtcblxuICBociA9IGggLyAzNjAgKiAyICogTWF0aC5QSTtcbiAgYSA9IGMgKiBNYXRoLmNvcyhocik7XG4gIGIgPSBjICogTWF0aC5zaW4oaHIpO1xuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiBsY2gyeHl6KGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJ4eXoobGNoMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGxjaDJyZ2IoYXJncykge1xuICByZXR1cm4gbGFiMnJnYihsY2gybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJyZ2Ioa2V5d29yZCkge1xuICByZXR1cm4gY3NzS2V5d29yZHNba2V5d29yZF07XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3YihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQybGFiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJsYWIoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMnh5eihhcmdzKSB7XG4gIHJldHVybiByZ2IyeHl6KGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxudmFyIGNzc0tleXdvcmRzID0ge1xuICBhbGljZWJsdWU6ICBbMjQwLDI0OCwyNTVdLFxuICBhbnRpcXVld2hpdGU6IFsyNTAsMjM1LDIxNV0sXG4gIGFxdWE6IFswLDI1NSwyNTVdLFxuICBhcXVhbWFyaW5lOiBbMTI3LDI1NSwyMTJdLFxuICBhenVyZTogIFsyNDAsMjU1LDI1NV0sXG4gIGJlaWdlOiAgWzI0NSwyNDUsMjIwXSxcbiAgYmlzcXVlOiBbMjU1LDIyOCwxOTZdLFxuICBibGFjazogIFswLDAsMF0sXG4gIGJsYW5jaGVkYWxtb25kOiBbMjU1LDIzNSwyMDVdLFxuICBibHVlOiBbMCwwLDI1NV0sXG4gIGJsdWV2aW9sZXQ6IFsxMzgsNDMsMjI2XSxcbiAgYnJvd246ICBbMTY1LDQyLDQyXSxcbiAgYnVybHl3b29kOiAgWzIyMiwxODQsMTM1XSxcbiAgY2FkZXRibHVlOiAgWzk1LDE1OCwxNjBdLFxuICBjaGFydHJldXNlOiBbMTI3LDI1NSwwXSxcbiAgY2hvY29sYXRlOiAgWzIxMCwxMDUsMzBdLFxuICBjb3JhbDogIFsyNTUsMTI3LDgwXSxcbiAgY29ybmZsb3dlcmJsdWU6IFsxMDAsMTQ5LDIzN10sXG4gIGNvcm5zaWxrOiBbMjU1LDI0OCwyMjBdLFxuICBjcmltc29uOiAgWzIyMCwyMCw2MF0sXG4gIGN5YW46IFswLDI1NSwyNTVdLFxuICBkYXJrYmx1ZTogWzAsMCwxMzldLFxuICBkYXJrY3lhbjogWzAsMTM5LDEzOV0sXG4gIGRhcmtnb2xkZW5yb2Q6ICBbMTg0LDEzNCwxMV0sXG4gIGRhcmtncmF5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJrZ3JlZW46ICBbMCwxMDAsMF0sXG4gIGRhcmtncmV5OiBbMTY5LDE2OSwxNjldLFxuICBkYXJra2hha2k6ICBbMTg5LDE4MywxMDddLFxuICBkYXJrbWFnZW50YTogIFsxMzksMCwxMzldLFxuICBkYXJrb2xpdmVncmVlbjogWzg1LDEwNyw0N10sXG4gIGRhcmtvcmFuZ2U6IFsyNTUsMTQwLDBdLFxuICBkYXJrb3JjaGlkOiBbMTUzLDUwLDIwNF0sXG4gIGRhcmtyZWQ6ICBbMTM5LDAsMF0sXG4gIGRhcmtzYWxtb246IFsyMzMsMTUwLDEyMl0sXG4gIGRhcmtzZWFncmVlbjogWzE0MywxODgsMTQzXSxcbiAgZGFya3NsYXRlYmx1ZTogIFs3Miw2MSwxMzldLFxuICBkYXJrc2xhdGVncmF5OiAgWzQ3LDc5LDc5XSxcbiAgZGFya3NsYXRlZ3JleTogIFs0Nyw3OSw3OV0sXG4gIGRhcmt0dXJxdW9pc2U6ICBbMCwyMDYsMjA5XSxcbiAgZGFya3Zpb2xldDogWzE0OCwwLDIxMV0sXG4gIGRlZXBwaW5rOiBbMjU1LDIwLDE0N10sXG4gIGRlZXBza3libHVlOiAgWzAsMTkxLDI1NV0sXG4gIGRpbWdyYXk6ICBbMTA1LDEwNSwxMDVdLFxuICBkaW1ncmV5OiAgWzEwNSwxMDUsMTA1XSxcbiAgZG9kZ2VyYmx1ZTogWzMwLDE0NCwyNTVdLFxuICBmaXJlYnJpY2s6ICBbMTc4LDM0LDM0XSxcbiAgZmxvcmFsd2hpdGU6ICBbMjU1LDI1MCwyNDBdLFxuICBmb3Jlc3RncmVlbjogIFszNCwxMzksMzRdLFxuICBmdWNoc2lhOiAgWzI1NSwwLDI1NV0sXG4gIGdhaW5zYm9ybzogIFsyMjAsMjIwLDIyMF0sXG4gIGdob3N0d2hpdGU6IFsyNDgsMjQ4LDI1NV0sXG4gIGdvbGQ6IFsyNTUsMjE1LDBdLFxuICBnb2xkZW5yb2Q6ICBbMjE4LDE2NSwzMl0sXG4gIGdyYXk6IFsxMjgsMTI4LDEyOF0sXG4gIGdyZWVuOiAgWzAsMTI4LDBdLFxuICBncmVlbnllbGxvdzogIFsxNzMsMjU1LDQ3XSxcbiAgZ3JleTogWzEyOCwxMjgsMTI4XSxcbiAgaG9uZXlkZXc6IFsyNDAsMjU1LDI0MF0sXG4gIGhvdHBpbms6ICBbMjU1LDEwNSwxODBdLFxuICBpbmRpYW5yZWQ6ICBbMjA1LDkyLDkyXSxcbiAgaW5kaWdvOiBbNzUsMCwxMzBdLFxuICBpdm9yeTogIFsyNTUsMjU1LDI0MF0sXG4gIGtoYWtpOiAgWzI0MCwyMzAsMTQwXSxcbiAgbGF2ZW5kZXI6IFsyMzAsMjMwLDI1MF0sXG4gIGxhdmVuZGVyYmx1c2g6ICBbMjU1LDI0MCwyNDVdLFxuICBsYXduZ3JlZW46ICBbMTI0LDI1MiwwXSxcbiAgbGVtb25jaGlmZm9uOiBbMjU1LDI1MCwyMDVdLFxuICBsaWdodGJsdWU6ICBbMTczLDIxNiwyMzBdLFxuICBsaWdodGNvcmFsOiBbMjQwLDEyOCwxMjhdLFxuICBsaWdodGN5YW46ICBbMjI0LDI1NSwyNTVdLFxuICBsaWdodGdvbGRlbnJvZHllbGxvdzogWzI1MCwyNTAsMjEwXSxcbiAgbGlnaHRncmF5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRncmVlbjogWzE0NCwyMzgsMTQ0XSxcbiAgbGlnaHRncmV5OiAgWzIxMSwyMTEsMjExXSxcbiAgbGlnaHRwaW5rOiAgWzI1NSwxODIsMTkzXSxcbiAgbGlnaHRzYWxtb246ICBbMjU1LDE2MCwxMjJdLFxuICBsaWdodHNlYWdyZWVuOiAgWzMyLDE3OCwxNzBdLFxuICBsaWdodHNreWJsdWU6IFsxMzUsMjA2LDI1MF0sXG4gIGxpZ2h0c2xhdGVncmF5OiBbMTE5LDEzNiwxNTNdLFxuICBsaWdodHNsYXRlZ3JleTogWzExOSwxMzYsMTUzXSxcbiAgbGlnaHRzdGVlbGJsdWU6IFsxNzYsMTk2LDIyMl0sXG4gIGxpZ2h0eWVsbG93OiAgWzI1NSwyNTUsMjI0XSxcbiAgbGltZTogWzAsMjU1LDBdLFxuICBsaW1lZ3JlZW46ICBbNTAsMjA1LDUwXSxcbiAgbGluZW46ICBbMjUwLDI0MCwyMzBdLFxuICBtYWdlbnRhOiAgWzI1NSwwLDI1NV0sXG4gIG1hcm9vbjogWzEyOCwwLDBdLFxuICBtZWRpdW1hcXVhbWFyaW5lOiBbMTAyLDIwNSwxNzBdLFxuICBtZWRpdW1ibHVlOiBbMCwwLDIwNV0sXG4gIG1lZGl1bW9yY2hpZDogWzE4Niw4NSwyMTFdLFxuICBtZWRpdW1wdXJwbGU6IFsxNDcsMTEyLDIxOV0sXG4gIG1lZGl1bXNlYWdyZWVuOiBbNjAsMTc5LDExM10sXG4gIG1lZGl1bXNsYXRlYmx1ZTogIFsxMjMsMTA0LDIzOF0sXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAgWzAsMjUwLDE1NF0sXG4gIG1lZGl1bXR1cnF1b2lzZTogIFs3MiwyMDksMjA0XSxcbiAgbWVkaXVtdmlvbGV0cmVkOiAgWzE5OSwyMSwxMzNdLFxuICBtaWRuaWdodGJsdWU6IFsyNSwyNSwxMTJdLFxuICBtaW50Y3JlYW06ICBbMjQ1LDI1NSwyNTBdLFxuICBtaXN0eXJvc2U6ICBbMjU1LDIyOCwyMjVdLFxuICBtb2NjYXNpbjogWzI1NSwyMjgsMTgxXSxcbiAgbmF2YWpvd2hpdGU6ICBbMjU1LDIyMiwxNzNdLFxuICBuYXZ5OiBbMCwwLDEyOF0sXG4gIG9sZGxhY2U6ICBbMjUzLDI0NSwyMzBdLFxuICBvbGl2ZTogIFsxMjgsMTI4LDBdLFxuICBvbGl2ZWRyYWI6ICBbMTA3LDE0MiwzNV0sXG4gIG9yYW5nZTogWzI1NSwxNjUsMF0sXG4gIG9yYW5nZXJlZDogIFsyNTUsNjksMF0sXG4gIG9yY2hpZDogWzIxOCwxMTIsMjE0XSxcbiAgcGFsZWdvbGRlbnJvZDogIFsyMzgsMjMyLDE3MF0sXG4gIHBhbGVncmVlbjogIFsxNTIsMjUxLDE1Ml0sXG4gIHBhbGV0dXJxdW9pc2U6ICBbMTc1LDIzOCwyMzhdLFxuICBwYWxldmlvbGV0cmVkOiAgWzIxOSwxMTIsMTQ3XSxcbiAgcGFwYXlhd2hpcDogWzI1NSwyMzksMjEzXSxcbiAgcGVhY2hwdWZmOiAgWzI1NSwyMTgsMTg1XSxcbiAgcGVydTogWzIwNSwxMzMsNjNdLFxuICBwaW5rOiBbMjU1LDE5MiwyMDNdLFxuICBwbHVtOiBbMjIxLDE2MCwyMjFdLFxuICBwb3dkZXJibHVlOiBbMTc2LDIyNCwyMzBdLFxuICBwdXJwbGU6IFsxMjgsMCwxMjhdLFxuICByZWJlY2NhcHVycGxlOiBbMTAyLCA1MSwgMTUzXSxcbiAgcmVkOiAgWzI1NSwwLDBdLFxuICByb3N5YnJvd246ICBbMTg4LDE0MywxNDNdLFxuICByb3lhbGJsdWU6ICBbNjUsMTA1LDIyNV0sXG4gIHNhZGRsZWJyb3duOiAgWzEzOSw2OSwxOV0sXG4gIHNhbG1vbjogWzI1MCwxMjgsMTE0XSxcbiAgc2FuZHlicm93bjogWzI0NCwxNjQsOTZdLFxuICBzZWFncmVlbjogWzQ2LDEzOSw4N10sXG4gIHNlYXNoZWxsOiBbMjU1LDI0NSwyMzhdLFxuICBzaWVubmE6IFsxNjAsODIsNDVdLFxuICBzaWx2ZXI6IFsxOTIsMTkyLDE5Ml0sXG4gIHNreWJsdWU6ICBbMTM1LDIwNiwyMzVdLFxuICBzbGF0ZWJsdWU6ICBbMTA2LDkwLDIwNV0sXG4gIHNsYXRlZ3JheTogIFsxMTIsMTI4LDE0NF0sXG4gIHNsYXRlZ3JleTogIFsxMTIsMTI4LDE0NF0sXG4gIHNub3c6IFsyNTUsMjUwLDI1MF0sXG4gIHNwcmluZ2dyZWVuOiAgWzAsMjU1LDEyN10sXG4gIHN0ZWVsYmx1ZTogIFs3MCwxMzAsMTgwXSxcbiAgdGFuOiAgWzIxMCwxODAsMTQwXSxcbiAgdGVhbDogWzAsMTI4LDEyOF0sXG4gIHRoaXN0bGU6ICBbMjE2LDE5MSwyMTZdLFxuICB0b21hdG86IFsyNTUsOTksNzFdLFxuICB0dXJxdW9pc2U6ICBbNjQsMjI0LDIwOF0sXG4gIHZpb2xldDogWzIzOCwxMzAsMjM4XSxcbiAgd2hlYXQ6ICBbMjQ1LDIyMiwxNzldLFxuICB3aGl0ZTogIFsyNTUsMjU1LDI1NV0sXG4gIHdoaXRlc21va2U6IFsyNDUsMjQ1LDI0NV0sXG4gIHllbGxvdzogWzI1NSwyNTUsMF0sXG4gIHllbGxvd2dyZWVuOiAgWzE1NCwyMDUsNTBdXG59O1xuXG52YXIgcmV2ZXJzZUtleXdvcmRzID0ge307XG5mb3IgKHZhciBrZXkgaW4gY3NzS2V5d29yZHMpIHtcbiAgcmV2ZXJzZUtleXdvcmRzW0pTT04uc3RyaW5naWZ5KGNzc0tleXdvcmRzW2tleV0pXSA9IGtleTtcbn1cbiIsInZhciBjb252ZXJzaW9ucyA9IHJlcXVpcmUoXCIuL2NvbnZlcnNpb25zXCIpO1xuXG52YXIgY29udmVydCA9IGZ1bmN0aW9uKCkge1xuICAgcmV0dXJuIG5ldyBDb252ZXJ0ZXIoKTtcbn1cblxuZm9yICh2YXIgZnVuYyBpbiBjb252ZXJzaW9ucykge1xuICAvLyBleHBvcnQgUmF3IHZlcnNpb25zXG4gIGNvbnZlcnRbZnVuYyArIFwiUmF3XCJdID0gIChmdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gYWNjZXB0IGFycmF5IG9yIHBsYWluIGFyZ3NcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcIm51bWJlclwiKVxuICAgICAgICBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNvbnZlcnNpb25zW2Z1bmNdKGFyZyk7XG4gICAgfVxuICB9KShmdW5jKTtcblxuICB2YXIgcGFpciA9IC8oXFx3KykyKFxcdyspLy5leGVjKGZ1bmMpLFxuICAgICAgZnJvbSA9IHBhaXJbMV0sXG4gICAgICB0byA9IHBhaXJbMl07XG5cbiAgLy8gZXhwb3J0IHJnYjJoc2wgYW5kIFtcInJnYlwiXVtcImhzbFwiXVxuICBjb252ZXJ0W2Zyb21dID0gY29udmVydFtmcm9tXSB8fCB7fTtcblxuICBjb252ZXJ0W2Zyb21dW3RvXSA9IGNvbnZlcnRbZnVuY10gPSAoZnVuY3Rpb24oZnVuYykgeyBcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZyA9PSBcIm51bWJlclwiKVxuICAgICAgICBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgXG4gICAgICB2YXIgdmFsID0gY29udmVyc2lvbnNbZnVuY10oYXJnKTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09IFwic3RyaW5nXCIgfHwgdmFsID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB2YWw7IC8vIGtleXdvcmRcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspXG4gICAgICAgIHZhbFtpXSA9IE1hdGgucm91bmQodmFsW2ldKTtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9KShmdW5jKTtcbn1cblxuXG4vKiBDb252ZXJ0ZXIgZG9lcyBsYXp5IGNvbnZlcnNpb24gYW5kIGNhY2hpbmcgKi9cbnZhciBDb252ZXJ0ZXIgPSBmdW5jdGlvbigpIHtcbiAgIHRoaXMuY29udnMgPSB7fTtcbn07XG5cbi8qIEVpdGhlciBnZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSBvclxuICBzZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSwgZGVwZW5kaW5nIG9uIGFyZ3MgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUucm91dGVTcGFjZSA9IGZ1bmN0aW9uKHNwYWNlLCBhcmdzKSB7XG4gICB2YXIgdmFsdWVzID0gYXJnc1swXTtcbiAgIGlmICh2YWx1ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gY29sb3IucmdiKClcbiAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlcyhzcGFjZSk7XG4gICB9XG4gICAvLyBjb2xvci5yZ2IoMTAsIDEwLCAxMClcbiAgIGlmICh0eXBlb2YgdmFsdWVzID09IFwibnVtYmVyXCIpIHtcbiAgICAgIHZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpOyAgICAgICAgXG4gICB9XG5cbiAgIHJldHVybiB0aGlzLnNldFZhbHVlcyhzcGFjZSwgdmFsdWVzKTtcbn07XG4gIFxuLyogU2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UsIGludmFsaWRhdGluZyBjYWNoZSAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSwgdmFsdWVzKSB7XG4gICB0aGlzLnNwYWNlID0gc3BhY2U7XG4gICB0aGlzLmNvbnZzID0ge307XG4gICB0aGlzLmNvbnZzW3NwYWNlXSA9IHZhbHVlcztcbiAgIHJldHVybiB0aGlzO1xufTtcblxuLyogR2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UuIElmIHRoZXJlJ3MgYWxyZWFkeVxuICBhIGNvbnZlcnNpb24gZm9yIHRoZSBzcGFjZSwgZmV0Y2ggaXQsIG90aGVyd2lzZVxuICBjb21wdXRlIGl0ICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlKSB7XG4gICB2YXIgdmFscyA9IHRoaXMuY29udnNbc3BhY2VdO1xuICAgaWYgKCF2YWxzKSB7XG4gICAgICB2YXIgZnNwYWNlID0gdGhpcy5zcGFjZSxcbiAgICAgICAgICBmcm9tID0gdGhpcy5jb252c1tmc3BhY2VdO1xuICAgICAgdmFscyA9IGNvbnZlcnRbZnNwYWNlXVtzcGFjZV0oZnJvbSk7XG5cbiAgICAgIHRoaXMuY29udnNbc3BhY2VdID0gdmFscztcbiAgIH1cbiAgcmV0dXJuIHZhbHM7XG59O1xuXG5bXCJyZ2JcIiwgXCJoc2xcIiwgXCJoc3ZcIiwgXCJjbXlrXCIsIFwia2V5d29yZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHNwYWNlKSB7XG4gICBDb252ZXJ0ZXIucHJvdG90eXBlW3NwYWNlXSA9IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnJvdXRlU3BhY2Uoc3BhY2UsIGFyZ3VtZW50cyk7XG4gICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0OyIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29sb3JOYW1lcyA9IHJlcXVpcmUoJ2NvbG9yLW5hbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICBnZXRSZ2JhOiBnZXRSZ2JhLFxuICAgZ2V0SHNsYTogZ2V0SHNsYSxcbiAgIGdldFJnYjogZ2V0UmdiLFxuICAgZ2V0SHNsOiBnZXRIc2wsXG4gICBnZXRId2I6IGdldEh3YixcbiAgIGdldEFscGhhOiBnZXRBbHBoYSxcblxuICAgaGV4U3RyaW5nOiBoZXhTdHJpbmcsXG4gICByZ2JTdHJpbmc6IHJnYlN0cmluZyxcbiAgIHJnYmFTdHJpbmc6IHJnYmFTdHJpbmcsXG4gICBwZXJjZW50U3RyaW5nOiBwZXJjZW50U3RyaW5nLFxuICAgcGVyY2VudGFTdHJpbmc6IHBlcmNlbnRhU3RyaW5nLFxuICAgaHNsU3RyaW5nOiBoc2xTdHJpbmcsXG4gICBoc2xhU3RyaW5nOiBoc2xhU3RyaW5nLFxuICAgaHdiU3RyaW5nOiBod2JTdHJpbmcsXG4gICBrZXl3b3JkOiBrZXl3b3JkXG59XG5cbmZ1bmN0aW9uIGdldFJnYmEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGFiYnIgPSAgL14jKFthLWZBLUYwLTldezN9KSQvLFxuICAgICAgIGhleCA9ICAvXiMoW2EtZkEtRjAtOV17Nn0pJC8sXG4gICAgICAgcmdiYSA9IC9ecmdiYT9cXChcXHMqKFsrLV0/XFxkKylcXHMqLFxccyooWystXT9cXGQrKVxccyosXFxzKihbKy1dP1xcZCspXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKSQvLFxuICAgICAgIHBlciA9IC9ecmdiYT9cXChcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKSQvLFxuICAgICAgIGtleXdvcmQgPSAvKFxcRCspLztcblxuICAgdmFyIHJnYiA9IFswLCAwLCAwXSxcbiAgICAgICBhID0gMSxcbiAgICAgICBtYXRjaCA9IHN0cmluZy5tYXRjaChhYmJyKTtcbiAgIGlmIChtYXRjaCkge1xuICAgICAgbWF0Y2ggPSBtYXRjaFsxXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpXSArIG1hdGNoW2ldLCAxNik7XG4gICAgICB9XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChoZXgpKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoLnNsaWNlKGkgKiAyLCBpICogMiArIDIpLCAxNik7XG4gICAgICB9XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChyZ2JhKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2kgKyAxXSk7XG4gICAgICB9XG4gICAgICBhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChwZXIpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KG1hdGNoW2kgKyAxXSkgKiAyLjU1KTtcbiAgICAgIH1cbiAgICAgIGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGtleXdvcmQpKSB7XG4gICAgICBpZiAobWF0Y2hbMV0gPT0gXCJ0cmFuc3BhcmVudFwiKSB7XG4gICAgICAgICByZXR1cm4gWzAsIDAsIDAsIDBdO1xuICAgICAgfVxuICAgICAgcmdiID0gY29sb3JOYW1lc1ttYXRjaFsxXV07XG4gICAgICBpZiAoIXJnYikge1xuICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgfVxuXG4gICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgcmdiW2ldID0gc2NhbGUocmdiW2ldLCAwLCAyNTUpO1xuICAgfVxuICAgaWYgKCFhICYmIGEgIT0gMCkge1xuICAgICAgYSA9IDE7XG4gICB9XG4gICBlbHNlIHtcbiAgICAgIGEgPSBzY2FsZShhLCAwLCAxKTtcbiAgIH1cbiAgIHJnYlszXSA9IGE7XG4gICByZXR1cm4gcmdiO1xufVxuXG5mdW5jdGlvbiBnZXRIc2xhKHN0cmluZykge1xuICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cbiAgIHZhciBoc2wgPSAvXmhzbGE/XFwoXFxzKihbKy1dP1xcZCspKD86ZGVnKT9cXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKS87XG4gICB2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHNsKTtcbiAgIGlmIChtYXRjaCkge1xuICAgICAgdmFyIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICAgICB2YXIgaCA9IHNjYWxlKHBhcnNlSW50KG1hdGNoWzFdKSwgMCwgMzYwKSxcbiAgICAgICAgICBzID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCksXG4gICAgICAgICAgbCA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbM10pLCAwLCAxMDApLFxuICAgICAgICAgIGEgPSBzY2FsZShpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuICAgICAgcmV0dXJuIFtoLCBzLCBsLCBhXTtcbiAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0SHdiKHN0cmluZykge1xuICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cbiAgIHZhciBod2IgPSAvXmh3YlxcKFxccyooWystXT9cXGQrKSg/OmRlZyk/XFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkvO1xuICAgdmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGh3Yik7XG4gICBpZiAobWF0Y2gpIHtcbiAgICB2YXIgYWxwaGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgICAgIHZhciBoID0gc2NhbGUocGFyc2VJbnQobWF0Y2hbMV0pLCAwLCAzNjApLFxuICAgICAgICAgIHcgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKSxcbiAgICAgICAgICBiID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCksXG4gICAgICAgICAgYSA9IHNjYWxlKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG4gICAgICByZXR1cm4gW2gsIHcsIGIsIGFdO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZ2Ioc3RyaW5nKSB7XG4gICB2YXIgcmdiYSA9IGdldFJnYmEoc3RyaW5nKTtcbiAgIHJldHVybiByZ2JhICYmIHJnYmEuc2xpY2UoMCwgMyk7XG59XG5cbmZ1bmN0aW9uIGdldEhzbChzdHJpbmcpIHtcbiAgdmFyIGhzbGEgPSBnZXRIc2xhKHN0cmluZyk7XG4gIHJldHVybiBoc2xhICYmIGhzbGEuc2xpY2UoMCwgMyk7XG59XG5cbmZ1bmN0aW9uIGdldEFscGhhKHN0cmluZykge1xuICAgdmFyIHZhbHMgPSBnZXRSZ2JhKHN0cmluZyk7XG4gICBpZiAodmFscykge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG4gICBlbHNlIGlmICh2YWxzID0gZ2V0SHNsYShzdHJpbmcpKSB7XG4gICAgICByZXR1cm4gdmFsc1szXTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHMgPSBnZXRId2Ioc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG59XG5cbi8vIGdlbmVyYXRvcnNcbmZ1bmN0aW9uIGhleFN0cmluZyhyZ2IpIHtcbiAgIHJldHVybiBcIiNcIiArIGhleERvdWJsZShyZ2JbMF0pICsgaGV4RG91YmxlKHJnYlsxXSlcbiAgICAgICAgICAgICAgKyBoZXhEb3VibGUocmdiWzJdKTtcbn1cblxuZnVuY3Rpb24gcmdiU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPCAxIHx8IChyZ2JhWzNdICYmIHJnYmFbM10gPCAxKSkge1xuICAgICAgcmV0dXJuIHJnYmFTdHJpbmcocmdiYSwgYWxwaGEpO1xuICAgfVxuICAgcmV0dXJuIFwicmdiKFwiICsgcmdiYVswXSArIFwiLCBcIiArIHJnYmFbMV0gKyBcIiwgXCIgKyByZ2JhWzJdICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIHJnYmFTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbHBoYSA9IChyZ2JhWzNdICE9PSB1bmRlZmluZWQgPyByZ2JhWzNdIDogMSk7XG4gICB9XG4gICByZXR1cm4gXCJyZ2JhKFwiICsgcmdiYVswXSArIFwiLCBcIiArIHJnYmFbMV0gKyBcIiwgXCIgKyByZ2JhWzJdXG4gICAgICAgICAgICsgXCIsIFwiICsgYWxwaGEgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gcGVyY2VudFN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAocmdiYVszXSAmJiByZ2JhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiBwZXJjZW50YVN0cmluZyhyZ2JhLCBhbHBoYSk7XG4gICB9XG4gICB2YXIgciA9IE1hdGgucm91bmQocmdiYVswXS8yNTUgKiAxMDApLFxuICAgICAgIGcgPSBNYXRoLnJvdW5kKHJnYmFbMV0vMjU1ICogMTAwKSxcbiAgICAgICBiID0gTWF0aC5yb3VuZChyZ2JhWzJdLzI1NSAqIDEwMCk7XG5cbiAgIHJldHVybiBcInJnYihcIiArIHIgKyBcIiUsIFwiICsgZyArIFwiJSwgXCIgKyBiICsgXCIlKVwiO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50YVN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgdmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0vMjU1ICogMTAwKSxcbiAgICAgICBnID0gTWF0aC5yb3VuZChyZ2JhWzFdLzI1NSAqIDEwMCksXG4gICAgICAgYiA9IE1hdGgucm91bmQocmdiYVsyXS8yNTUgKiAxMDApO1xuICAgcmV0dXJuIFwicmdiYShcIiArIHIgKyBcIiUsIFwiICsgZyArIFwiJSwgXCIgKyBiICsgXCIlLCBcIiArIChhbHBoYSB8fCByZ2JhWzNdIHx8IDEpICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIGhzbFN0cmluZyhoc2xhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAoaHNsYVszXSAmJiBoc2xhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiBoc2xhU3RyaW5nKGhzbGEsIGFscGhhKTtcbiAgIH1cbiAgIHJldHVybiBcImhzbChcIiArIGhzbGFbMF0gKyBcIiwgXCIgKyBoc2xhWzFdICsgXCIlLCBcIiArIGhzbGFbMl0gKyBcIiUpXCI7XG59XG5cbmZ1bmN0aW9uIGhzbGFTdHJpbmcoaHNsYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbHBoYSA9IChoc2xhWzNdICE9PSB1bmRlZmluZWQgPyBoc2xhWzNdIDogMSk7XG4gICB9XG4gICByZXR1cm4gXCJoc2xhKFwiICsgaHNsYVswXSArIFwiLCBcIiArIGhzbGFbMV0gKyBcIiUsIFwiICsgaHNsYVsyXSArIFwiJSwgXCJcbiAgICAgICAgICAgKyBhbHBoYSArIFwiKVwiO1xufVxuXG4vLyBod2IgaXMgYSBiaXQgZGlmZmVyZW50IHRoYW4gcmdiKGEpICYgaHNsKGEpIHNpbmNlIHRoZXJlIGlzIG5vIGFscGhhIHNwZWNpZmljIHN5bnRheFxuLy8gKGh3YiBoYXZlIGFscGhhIG9wdGlvbmFsICYgMSBpcyBkZWZhdWx0IHZhbHVlKVxuZnVuY3Rpb24gaHdiU3RyaW5nKGh3YiwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhbHBoYSA9IChod2JbM10gIT09IHVuZGVmaW5lZCA/IGh3YlszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHdiKFwiICsgaHdiWzBdICsgXCIsIFwiICsgaHdiWzFdICsgXCIlLCBcIiArIGh3YlsyXSArIFwiJVwiXG4gICAgICAgICAgICsgKGFscGhhICE9PSB1bmRlZmluZWQgJiYgYWxwaGEgIT09IDEgPyBcIiwgXCIgKyBhbHBoYSA6IFwiXCIpICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQocmdiKSB7XG4gIHJldHVybiByZXZlcnNlTmFtZXNbcmdiLnNsaWNlKDAsIDMpXTtcbn1cblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gc2NhbGUobnVtLCBtaW4sIG1heCkge1xuICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KG1pbiwgbnVtKSwgbWF4KTtcbn1cblxuZnVuY3Rpb24gaGV4RG91YmxlKG51bSkge1xuICB2YXIgc3RyID0gbnVtLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gKHN0ci5sZW5ndGggPCAyKSA/IFwiMFwiICsgc3RyIDogc3RyO1xufVxuXG5cbi8vY3JlYXRlIGEgbGlzdCBvZiByZXZlcnNlIGNvbG9yIG5hbWVzXG52YXIgcmV2ZXJzZU5hbWVzID0ge307XG5mb3IgKHZhciBuYW1lIGluIGNvbG9yTmFtZXMpIHtcbiAgIHJldmVyc2VOYW1lc1tjb2xvck5hbWVzW25hbWVdXSA9IG5hbWU7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XHJcblx0XCJhbGljZWJsdWVcIjogWzI0MCwgMjQ4LCAyNTVdLFxyXG5cdFwiYW50aXF1ZXdoaXRlXCI6IFsyNTAsIDIzNSwgMjE1XSxcclxuXHRcImFxdWFcIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImFxdWFtYXJpbmVcIjogWzEyNywgMjU1LCAyMTJdLFxyXG5cdFwiYXp1cmVcIjogWzI0MCwgMjU1LCAyNTVdLFxyXG5cdFwiYmVpZ2VcIjogWzI0NSwgMjQ1LCAyMjBdLFxyXG5cdFwiYmlzcXVlXCI6IFsyNTUsIDIyOCwgMTk2XSxcclxuXHRcImJsYWNrXCI6IFswLCAwLCAwXSxcclxuXHRcImJsYW5jaGVkYWxtb25kXCI6IFsyNTUsIDIzNSwgMjA1XSxcclxuXHRcImJsdWVcIjogWzAsIDAsIDI1NV0sXHJcblx0XCJibHVldmlvbGV0XCI6IFsxMzgsIDQzLCAyMjZdLFxyXG5cdFwiYnJvd25cIjogWzE2NSwgNDIsIDQyXSxcclxuXHRcImJ1cmx5d29vZFwiOiBbMjIyLCAxODQsIDEzNV0sXHJcblx0XCJjYWRldGJsdWVcIjogWzk1LCAxNTgsIDE2MF0sXHJcblx0XCJjaGFydHJldXNlXCI6IFsxMjcsIDI1NSwgMF0sXHJcblx0XCJjaG9jb2xhdGVcIjogWzIxMCwgMTA1LCAzMF0sXHJcblx0XCJjb3JhbFwiOiBbMjU1LCAxMjcsIDgwXSxcclxuXHRcImNvcm5mbG93ZXJibHVlXCI6IFsxMDAsIDE0OSwgMjM3XSxcclxuXHRcImNvcm5zaWxrXCI6IFsyNTUsIDI0OCwgMjIwXSxcclxuXHRcImNyaW1zb25cIjogWzIyMCwgMjAsIDYwXSxcclxuXHRcImN5YW5cIjogWzAsIDI1NSwgMjU1XSxcclxuXHRcImRhcmtibHVlXCI6IFswLCAwLCAxMzldLFxyXG5cdFwiZGFya2N5YW5cIjogWzAsIDEzOSwgMTM5XSxcclxuXHRcImRhcmtnb2xkZW5yb2RcIjogWzE4NCwgMTM0LCAxMV0sXHJcblx0XCJkYXJrZ3JheVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJrZ3JlZW5cIjogWzAsIDEwMCwgMF0sXHJcblx0XCJkYXJrZ3JleVwiOiBbMTY5LCAxNjksIDE2OV0sXHJcblx0XCJkYXJra2hha2lcIjogWzE4OSwgMTgzLCAxMDddLFxyXG5cdFwiZGFya21hZ2VudGFcIjogWzEzOSwgMCwgMTM5XSxcclxuXHRcImRhcmtvbGl2ZWdyZWVuXCI6IFs4NSwgMTA3LCA0N10sXHJcblx0XCJkYXJrb3JhbmdlXCI6IFsyNTUsIDE0MCwgMF0sXHJcblx0XCJkYXJrb3JjaGlkXCI6IFsxNTMsIDUwLCAyMDRdLFxyXG5cdFwiZGFya3JlZFwiOiBbMTM5LCAwLCAwXSxcclxuXHRcImRhcmtzYWxtb25cIjogWzIzMywgMTUwLCAxMjJdLFxyXG5cdFwiZGFya3NlYWdyZWVuXCI6IFsxNDMsIDE4OCwgMTQzXSxcclxuXHRcImRhcmtzbGF0ZWJsdWVcIjogWzcyLCA2MSwgMTM5XSxcclxuXHRcImRhcmtzbGF0ZWdyYXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3NsYXRlZ3JleVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrdHVycXVvaXNlXCI6IFswLCAyMDYsIDIwOV0sXHJcblx0XCJkYXJrdmlvbGV0XCI6IFsxNDgsIDAsIDIxMV0sXHJcblx0XCJkZWVwcGlua1wiOiBbMjU1LCAyMCwgMTQ3XSxcclxuXHRcImRlZXBza3libHVlXCI6IFswLCAxOTEsIDI1NV0sXHJcblx0XCJkaW1ncmF5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRpbWdyZXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZG9kZ2VyYmx1ZVwiOiBbMzAsIDE0NCwgMjU1XSxcclxuXHRcImZpcmVicmlja1wiOiBbMTc4LCAzNCwgMzRdLFxyXG5cdFwiZmxvcmFsd2hpdGVcIjogWzI1NSwgMjUwLCAyNDBdLFxyXG5cdFwiZm9yZXN0Z3JlZW5cIjogWzM0LCAxMzksIDM0XSxcclxuXHRcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcImdhaW5zYm9yb1wiOiBbMjIwLCAyMjAsIDIyMF0sXHJcblx0XCJnaG9zdHdoaXRlXCI6IFsyNDgsIDI0OCwgMjU1XSxcclxuXHRcImdvbGRcIjogWzI1NSwgMjE1LCAwXSxcclxuXHRcImdvbGRlbnJvZFwiOiBbMjE4LCAxNjUsIDMyXSxcclxuXHRcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXHJcblx0XCJncmVlbnllbGxvd1wiOiBbMTczLCAyNTUsIDQ3XSxcclxuXHRcImdyZXlcIjogWzEyOCwgMTI4LCAxMjhdLFxyXG5cdFwiaG9uZXlkZXdcIjogWzI0MCwgMjU1LCAyNDBdLFxyXG5cdFwiaG90cGlua1wiOiBbMjU1LCAxMDUsIDE4MF0sXHJcblx0XCJpbmRpYW5yZWRcIjogWzIwNSwgOTIsIDkyXSxcclxuXHRcImluZGlnb1wiOiBbNzUsIDAsIDEzMF0sXHJcblx0XCJpdm9yeVwiOiBbMjU1LCAyNTUsIDI0MF0sXHJcblx0XCJraGFraVwiOiBbMjQwLCAyMzAsIDE0MF0sXHJcblx0XCJsYXZlbmRlclwiOiBbMjMwLCAyMzAsIDI1MF0sXHJcblx0XCJsYXZlbmRlcmJsdXNoXCI6IFsyNTUsIDI0MCwgMjQ1XSxcclxuXHRcImxhd25ncmVlblwiOiBbMTI0LCAyNTIsIDBdLFxyXG5cdFwibGVtb25jaGlmZm9uXCI6IFsyNTUsIDI1MCwgMjA1XSxcclxuXHRcImxpZ2h0Ymx1ZVwiOiBbMTczLCAyMTYsIDIzMF0sXHJcblx0XCJsaWdodGNvcmFsXCI6IFsyNDAsIDEyOCwgMTI4XSxcclxuXHRcImxpZ2h0Y3lhblwiOiBbMjI0LCAyNTUsIDI1NV0sXHJcblx0XCJsaWdodGdvbGRlbnJvZHllbGxvd1wiOiBbMjUwLCAyNTAsIDIxMF0sXHJcblx0XCJsaWdodGdyYXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRncmVlblwiOiBbMTQ0LCAyMzgsIDE0NF0sXHJcblx0XCJsaWdodGdyZXlcIjogWzIxMSwgMjExLCAyMTFdLFxyXG5cdFwibGlnaHRwaW5rXCI6IFsyNTUsIDE4MiwgMTkzXSxcclxuXHRcImxpZ2h0c2FsbW9uXCI6IFsyNTUsIDE2MCwgMTIyXSxcclxuXHRcImxpZ2h0c2VhZ3JlZW5cIjogWzMyLCAxNzgsIDE3MF0sXHJcblx0XCJsaWdodHNreWJsdWVcIjogWzEzNSwgMjA2LCAyNTBdLFxyXG5cdFwibGlnaHRzbGF0ZWdyYXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzbGF0ZWdyZXlcIjogWzExOSwgMTM2LCAxNTNdLFxyXG5cdFwibGlnaHRzdGVlbGJsdWVcIjogWzE3NiwgMTk2LCAyMjJdLFxyXG5cdFwibGlnaHR5ZWxsb3dcIjogWzI1NSwgMjU1LCAyMjRdLFxyXG5cdFwibGltZVwiOiBbMCwgMjU1LCAwXSxcclxuXHRcImxpbWVncmVlblwiOiBbNTAsIDIwNSwgNTBdLFxyXG5cdFwibGluZW5cIjogWzI1MCwgMjQwLCAyMzBdLFxyXG5cdFwibWFnZW50YVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxyXG5cdFwibWVkaXVtYXF1YW1hcmluZVwiOiBbMTAyLCAyMDUsIDE3MF0sXHJcblx0XCJtZWRpdW1ibHVlXCI6IFswLCAwLCAyMDVdLFxyXG5cdFwibWVkaXVtb3JjaGlkXCI6IFsxODYsIDg1LCAyMTFdLFxyXG5cdFwibWVkaXVtcHVycGxlXCI6IFsxNDcsIDExMiwgMjE5XSxcclxuXHRcIm1lZGl1bXNlYWdyZWVuXCI6IFs2MCwgMTc5LCAxMTNdLFxyXG5cdFwibWVkaXVtc2xhdGVibHVlXCI6IFsxMjMsIDEwNCwgMjM4XSxcclxuXHRcIm1lZGl1bXNwcmluZ2dyZWVuXCI6IFswLCAyNTAsIDE1NF0sXHJcblx0XCJtZWRpdW10dXJxdW9pc2VcIjogWzcyLCAyMDksIDIwNF0sXHJcblx0XCJtZWRpdW12aW9sZXRyZWRcIjogWzE5OSwgMjEsIDEzM10sXHJcblx0XCJtaWRuaWdodGJsdWVcIjogWzI1LCAyNSwgMTEyXSxcclxuXHRcIm1pbnRjcmVhbVwiOiBbMjQ1LCAyNTUsIDI1MF0sXHJcblx0XCJtaXN0eXJvc2VcIjogWzI1NSwgMjI4LCAyMjVdLFxyXG5cdFwibW9jY2FzaW5cIjogWzI1NSwgMjI4LCAxODFdLFxyXG5cdFwibmF2YWpvd2hpdGVcIjogWzI1NSwgMjIyLCAxNzNdLFxyXG5cdFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcclxuXHRcIm9sZGxhY2VcIjogWzI1MywgMjQ1LCAyMzBdLFxyXG5cdFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcclxuXHRcIm9saXZlZHJhYlwiOiBbMTA3LCAxNDIsIDM1XSxcclxuXHRcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxyXG5cdFwib3JhbmdlcmVkXCI6IFsyNTUsIDY5LCAwXSxcclxuXHRcIm9yY2hpZFwiOiBbMjE4LCAxMTIsIDIxNF0sXHJcblx0XCJwYWxlZ29sZGVucm9kXCI6IFsyMzgsIDIzMiwgMTcwXSxcclxuXHRcInBhbGVncmVlblwiOiBbMTUyLCAyNTEsIDE1Ml0sXHJcblx0XCJwYWxldHVycXVvaXNlXCI6IFsxNzUsIDIzOCwgMjM4XSxcclxuXHRcInBhbGV2aW9sZXRyZWRcIjogWzIxOSwgMTEyLCAxNDddLFxyXG5cdFwicGFwYXlhd2hpcFwiOiBbMjU1LCAyMzksIDIxM10sXHJcblx0XCJwZWFjaHB1ZmZcIjogWzI1NSwgMjE4LCAxODVdLFxyXG5cdFwicGVydVwiOiBbMjA1LCAxMzMsIDYzXSxcclxuXHRcInBpbmtcIjogWzI1NSwgMTkyLCAyMDNdLFxyXG5cdFwicGx1bVwiOiBbMjIxLCAxNjAsIDIyMV0sXHJcblx0XCJwb3dkZXJibHVlXCI6IFsxNzYsIDIyNCwgMjMwXSxcclxuXHRcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxyXG5cdFwicmViZWNjYXB1cnBsZVwiOiBbMTAyLCA1MSwgMTUzXSxcclxuXHRcInJlZFwiOiBbMjU1LCAwLCAwXSxcclxuXHRcInJvc3licm93blwiOiBbMTg4LCAxNDMsIDE0M10sXHJcblx0XCJyb3lhbGJsdWVcIjogWzY1LCAxMDUsIDIyNV0sXHJcblx0XCJzYWRkbGVicm93blwiOiBbMTM5LCA2OSwgMTldLFxyXG5cdFwic2FsbW9uXCI6IFsyNTAsIDEyOCwgMTE0XSxcclxuXHRcInNhbmR5YnJvd25cIjogWzI0NCwgMTY0LCA5Nl0sXHJcblx0XCJzZWFncmVlblwiOiBbNDYsIDEzOSwgODddLFxyXG5cdFwic2Vhc2hlbGxcIjogWzI1NSwgMjQ1LCAyMzhdLFxyXG5cdFwic2llbm5hXCI6IFsxNjAsIDgyLCA0NV0sXHJcblx0XCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxyXG5cdFwic2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDIzNV0sXHJcblx0XCJzbGF0ZWJsdWVcIjogWzEwNiwgOTAsIDIwNV0sXHJcblx0XCJzbGF0ZWdyYXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic2xhdGVncmV5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNub3dcIjogWzI1NSwgMjUwLCAyNTBdLFxyXG5cdFwic3ByaW5nZ3JlZW5cIjogWzAsIDI1NSwgMTI3XSxcclxuXHRcInN0ZWVsYmx1ZVwiOiBbNzAsIDEzMCwgMTgwXSxcclxuXHRcInRhblwiOiBbMjEwLCAxODAsIDE0MF0sXHJcblx0XCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXHJcblx0XCJ0aGlzdGxlXCI6IFsyMTYsIDE5MSwgMjE2XSxcclxuXHRcInRvbWF0b1wiOiBbMjU1LCA5OSwgNzFdLFxyXG5cdFwidHVycXVvaXNlXCI6IFs2NCwgMjI0LCAyMDhdLFxyXG5cdFwidmlvbGV0XCI6IFsyMzgsIDEzMCwgMjM4XSxcclxuXHRcIndoZWF0XCI6IFsyNDUsIDIyMiwgMTc5XSxcclxuXHRcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcclxuXHRcIndoaXRlc21va2VcIjogWzI0NSwgMjQ1LCAyNDVdLFxyXG5cdFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF0sXHJcblx0XCJ5ZWxsb3dncmVlblwiOiBbMTU0LCAyMDUsIDUwXVxyXG59IiwiLyohIE5hdGl2ZSBQcm9taXNlIE9ubHlcbiAgICB2MC44LjEgKGMpIEt5bGUgU2ltcHNvblxuICAgIE1JVCBMaWNlbnNlOiBodHRwOi8vZ2V0aWZ5Lm1pdC1saWNlbnNlLm9yZ1xuKi9cblxuKGZ1bmN0aW9uIFVNRChuYW1lLGNvbnRleHQsZGVmaW5pdGlvbil7XG5cdC8vIHNwZWNpYWwgZm9ybSBvZiBVTUQgZm9yIHBvbHlmaWxsaW5nIGFjcm9zcyBldmlyb25tZW50c1xuXHRjb250ZXh0W25hbWVdID0gY29udGV4dFtuYW1lXSB8fCBkZWZpbml0aW9uKCk7XG5cdGlmICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHsgbW9kdWxlLmV4cG9ydHMgPSBjb250ZXh0W25hbWVdOyB9XG5cdGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHsgZGVmaW5lKGZ1bmN0aW9uICRBTUQkKCl7IHJldHVybiBjb250ZXh0W25hbWVdOyB9KTsgfVxufSkoXCJQcm9taXNlXCIsdHlwZW9mIGdsb2JhbCAhPSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdGhpcyxmdW5jdGlvbiBERUYoKXtcblx0Lypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGJ1aWx0SW5Qcm9wLCBjeWNsZSwgc2NoZWR1bGluZ19xdWV1ZSxcblx0XHRUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG5cdFx0dGltZXIgPSAodHlwZW9mIHNldEltbWVkaWF0ZSAhPSBcInVuZGVmaW5lZFwiKSA/XG5cdFx0XHRmdW5jdGlvbiB0aW1lcihmbikgeyByZXR1cm4gc2V0SW1tZWRpYXRlKGZuKTsgfSA6XG5cdFx0XHRzZXRUaW1lb3V0XG5cdDtcblxuXHQvLyBkYW1taXQsIElFOC5cblx0dHJ5IHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sXCJ4XCIse30pO1xuXHRcdGJ1aWx0SW5Qcm9wID0gZnVuY3Rpb24gYnVpbHRJblByb3Aob2JqLG5hbWUsdmFsLGNvbmZpZykge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosbmFtZSx7XG5cdFx0XHRcdHZhbHVlOiB2YWwsXG5cdFx0XHRcdHdyaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRjb25maWd1cmFibGU6IGNvbmZpZyAhPT0gZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH07XG5cdH1cblx0Y2F0Y2ggKGVycikge1xuXHRcdGJ1aWx0SW5Qcm9wID0gZnVuY3Rpb24gYnVpbHRJblByb3Aob2JqLG5hbWUsdmFsKSB7XG5cdFx0XHRvYmpbbmFtZV0gPSB2YWw7XG5cdFx0XHRyZXR1cm4gb2JqO1xuXHRcdH07XG5cdH1cblxuXHQvLyBOb3RlOiB1c2luZyBhIHF1ZXVlIGluc3RlYWQgb2YgYXJyYXkgZm9yIGVmZmljaWVuY3lcblx0c2NoZWR1bGluZ19xdWV1ZSA9IChmdW5jdGlvbiBRdWV1ZSgpIHtcblx0XHR2YXIgZmlyc3QsIGxhc3QsIGl0ZW07XG5cblx0XHRmdW5jdGlvbiBJdGVtKGZuLHNlbGYpIHtcblx0XHRcdHRoaXMuZm4gPSBmbjtcblx0XHRcdHRoaXMuc2VsZiA9IHNlbGY7XG5cdFx0XHR0aGlzLm5leHQgPSB2b2lkIDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGFkZDogZnVuY3Rpb24gYWRkKGZuLHNlbGYpIHtcblx0XHRcdFx0aXRlbSA9IG5ldyBJdGVtKGZuLHNlbGYpO1xuXHRcdFx0XHRpZiAobGFzdCkge1xuXHRcdFx0XHRcdGxhc3QubmV4dCA9IGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Zmlyc3QgPSBpdGVtO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxhc3QgPSBpdGVtO1xuXHRcdFx0XHRpdGVtID0gdm9pZCAwO1xuXHRcdFx0fSxcblx0XHRcdGRyYWluOiBmdW5jdGlvbiBkcmFpbigpIHtcblx0XHRcdFx0dmFyIGYgPSBmaXJzdDtcblx0XHRcdFx0Zmlyc3QgPSBsYXN0ID0gY3ljbGUgPSB2b2lkIDA7XG5cblx0XHRcdFx0d2hpbGUgKGYpIHtcblx0XHRcdFx0XHRmLmZuLmNhbGwoZi5zZWxmKTtcblx0XHRcdFx0XHRmID0gZi5uZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0fSkoKTtcblxuXHRmdW5jdGlvbiBzY2hlZHVsZShmbixzZWxmKSB7XG5cdFx0c2NoZWR1bGluZ19xdWV1ZS5hZGQoZm4sc2VsZik7XG5cdFx0aWYgKCFjeWNsZSkge1xuXHRcdFx0Y3ljbGUgPSB0aW1lcihzY2hlZHVsaW5nX3F1ZXVlLmRyYWluKTtcblx0XHR9XG5cdH1cblxuXHQvLyBwcm9taXNlIGR1Y2sgdHlwaW5nXG5cdGZ1bmN0aW9uIGlzVGhlbmFibGUobykge1xuXHRcdHZhciBfdGhlbiwgb190eXBlID0gdHlwZW9mIG87XG5cblx0XHRpZiAobyAhPSBudWxsICYmXG5cdFx0XHQoXG5cdFx0XHRcdG9fdHlwZSA9PSBcIm9iamVjdFwiIHx8IG9fdHlwZSA9PSBcImZ1bmN0aW9uXCJcblx0XHRcdClcblx0XHQpIHtcblx0XHRcdF90aGVuID0gby50aGVuO1xuXHRcdH1cblx0XHRyZXR1cm4gdHlwZW9mIF90aGVuID09IFwiZnVuY3Rpb25cIiA/IF90aGVuIDogZmFsc2U7XG5cdH1cblxuXHRmdW5jdGlvbiBub3RpZnkoKSB7XG5cdFx0Zm9yICh2YXIgaT0wOyBpPHRoaXMuY2hhaW4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdG5vdGlmeUlzb2xhdGVkKFxuXHRcdFx0XHR0aGlzLFxuXHRcdFx0XHQodGhpcy5zdGF0ZSA9PT0gMSkgPyB0aGlzLmNoYWluW2ldLnN1Y2Nlc3MgOiB0aGlzLmNoYWluW2ldLmZhaWx1cmUsXG5cdFx0XHRcdHRoaXMuY2hhaW5baV1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdHRoaXMuY2hhaW4ubGVuZ3RoID0gMDtcblx0fVxuXG5cdC8vIE5PVEU6IFRoaXMgaXMgYSBzZXBhcmF0ZSBmdW5jdGlvbiB0byBpc29sYXRlXG5cdC8vIHRoZSBgdHJ5Li5jYXRjaGAgc28gdGhhdCBvdGhlciBjb2RlIGNhbiBiZVxuXHQvLyBvcHRpbWl6ZWQgYmV0dGVyXG5cdGZ1bmN0aW9uIG5vdGlmeUlzb2xhdGVkKHNlbGYsY2IsY2hhaW4pIHtcblx0XHR2YXIgcmV0LCBfdGhlbjtcblx0XHR0cnkge1xuXHRcdFx0aWYgKGNiID09PSBmYWxzZSkge1xuXHRcdFx0XHRjaGFpbi5yZWplY3Qoc2VsZi5tc2cpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGlmIChjYiA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdHJldCA9IHNlbGYubXNnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdHJldCA9IGNiLmNhbGwodm9pZCAwLHNlbGYubXNnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChyZXQgPT09IGNoYWluLnByb21pc2UpIHtcblx0XHRcdFx0XHRjaGFpbi5yZWplY3QoVHlwZUVycm9yKFwiUHJvbWlzZS1jaGFpbiBjeWNsZVwiKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoX3RoZW4gPSBpc1RoZW5hYmxlKHJldCkpIHtcblx0XHRcdFx0XHRfdGhlbi5jYWxsKHJldCxjaGFpbi5yZXNvbHZlLGNoYWluLnJlamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0Y2hhaW4ucmVzb2x2ZShyZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlcnIpIHtcblx0XHRcdGNoYWluLnJlamVjdChlcnIpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlc29sdmUobXNnKSB7XG5cdFx0dmFyIF90aGVuLCBzZWxmID0gdGhpcztcblxuXHRcdC8vIGFscmVhZHkgdHJpZ2dlcmVkP1xuXHRcdGlmIChzZWxmLnRyaWdnZXJlZCkgeyByZXR1cm47IH1cblxuXHRcdHNlbGYudHJpZ2dlcmVkID0gdHJ1ZTtcblxuXHRcdC8vIHVud3JhcFxuXHRcdGlmIChzZWxmLmRlZikge1xuXHRcdFx0c2VsZiA9IHNlbGYuZGVmO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAoX3RoZW4gPSBpc1RoZW5hYmxlKG1zZykpIHtcblx0XHRcdFx0c2NoZWR1bGUoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHR2YXIgZGVmX3dyYXBwZXIgPSBuZXcgTWFrZURlZldyYXBwZXIoc2VsZik7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdF90aGVuLmNhbGwobXNnLFxuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAkcmVzb2x2ZSQoKXsgcmVzb2x2ZS5hcHBseShkZWZfd3JhcHBlcixhcmd1bWVudHMpOyB9LFxuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAkcmVqZWN0JCgpeyByZWplY3QuYXBwbHkoZGVmX3dyYXBwZXIsYXJndW1lbnRzKTsgfVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0cmVqZWN0LmNhbGwoZGVmX3dyYXBwZXIsZXJyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c2VsZi5tc2cgPSBtc2c7XG5cdFx0XHRcdHNlbGYuc3RhdGUgPSAxO1xuXHRcdFx0XHRpZiAoc2VsZi5jaGFpbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0c2NoZWR1bGUobm90aWZ5LHNlbGYpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlcnIpIHtcblx0XHRcdHJlamVjdC5jYWxsKG5ldyBNYWtlRGVmV3JhcHBlcihzZWxmKSxlcnIpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHJlamVjdChtc2cpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHQvLyBhbHJlYWR5IHRyaWdnZXJlZD9cblx0XHRpZiAoc2VsZi50cmlnZ2VyZWQpIHsgcmV0dXJuOyB9XG5cblx0XHRzZWxmLnRyaWdnZXJlZCA9IHRydWU7XG5cblx0XHQvLyB1bndyYXBcblx0XHRpZiAoc2VsZi5kZWYpIHtcblx0XHRcdHNlbGYgPSBzZWxmLmRlZjtcblx0XHR9XG5cblx0XHRzZWxmLm1zZyA9IG1zZztcblx0XHRzZWxmLnN0YXRlID0gMjtcblx0XHRpZiAoc2VsZi5jaGFpbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRzY2hlZHVsZShub3RpZnksc2VsZik7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gaXRlcmF0ZVByb21pc2VzKENvbnN0cnVjdG9yLGFycixyZXNvbHZlcixyZWplY3Rlcikge1xuXHRcdGZvciAodmFyIGlkeD0wOyBpZHg8YXJyLmxlbmd0aDsgaWR4KyspIHtcblx0XHRcdChmdW5jdGlvbiBJSUZFKGlkeCl7XG5cdFx0XHRcdENvbnN0cnVjdG9yLnJlc29sdmUoYXJyW2lkeF0pXG5cdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdGZ1bmN0aW9uICRyZXNvbHZlciQobXNnKXtcblx0XHRcdFx0XHRcdHJlc29sdmVyKGlkeCxtc2cpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVqZWN0ZXJcblx0XHRcdFx0KTtcblx0XHRcdH0pKGlkeCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gTWFrZURlZldyYXBwZXIoc2VsZikge1xuXHRcdHRoaXMuZGVmID0gc2VsZjtcblx0XHR0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gTWFrZURlZihzZWxmKSB7XG5cdFx0dGhpcy5wcm9taXNlID0gc2VsZjtcblx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHR0aGlzLnRyaWdnZXJlZCA9IGZhbHNlO1xuXHRcdHRoaXMuY2hhaW4gPSBbXTtcblx0XHR0aGlzLm1zZyA9IHZvaWQgMDtcblx0fVxuXG5cdGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3IpIHtcblx0XHRpZiAodHlwZW9mIGV4ZWN1dG9yICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX19OUE9fXyAhPT0gMCkge1xuXHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgcHJvbWlzZVwiKTtcblx0XHR9XG5cblx0XHQvLyBpbnN0YW5jZSBzaGFkb3dpbmcgdGhlIGluaGVyaXRlZCBcImJyYW5kXCJcblx0XHQvLyB0byBzaWduYWwgYW4gYWxyZWFkeSBcImluaXRpYWxpemVkXCIgcHJvbWlzZVxuXHRcdHRoaXMuX19OUE9fXyA9IDE7XG5cblx0XHR2YXIgZGVmID0gbmV3IE1ha2VEZWYodGhpcyk7XG5cblx0XHR0aGlzW1widGhlblwiXSA9IGZ1bmN0aW9uIHRoZW4oc3VjY2VzcyxmYWlsdXJlKSB7XG5cdFx0XHR2YXIgbyA9IHtcblx0XHRcdFx0c3VjY2VzczogdHlwZW9mIHN1Y2Nlc3MgPT0gXCJmdW5jdGlvblwiID8gc3VjY2VzcyA6IHRydWUsXG5cdFx0XHRcdGZhaWx1cmU6IHR5cGVvZiBmYWlsdXJlID09IFwiZnVuY3Rpb25cIiA/IGZhaWx1cmUgOiBmYWxzZVxuXHRcdFx0fTtcblx0XHRcdC8vIE5vdGU6IGB0aGVuKC4uKWAgaXRzZWxmIGNhbiBiZSBib3Jyb3dlZCB0byBiZSB1c2VkIGFnYWluc3Rcblx0XHRcdC8vIGEgZGlmZmVyZW50IHByb21pc2UgY29uc3RydWN0b3IgZm9yIG1ha2luZyB0aGUgY2hhaW5lZCBwcm9taXNlLFxuXHRcdFx0Ly8gYnkgc3Vic3RpdHV0aW5nIGEgZGlmZmVyZW50IGB0aGlzYCBiaW5kaW5nLlxuXHRcdFx0by5wcm9taXNlID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZnVuY3Rpb24gZXh0cmFjdENoYWluKHJlc29sdmUscmVqZWN0KSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG8ucmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0XHRcdG8ucmVqZWN0ID0gcmVqZWN0O1xuXHRcdFx0fSk7XG5cdFx0XHRkZWYuY2hhaW4ucHVzaChvKTtcblxuXHRcdFx0aWYgKGRlZi5zdGF0ZSAhPT0gMCkge1xuXHRcdFx0XHRzY2hlZHVsZShub3RpZnksZGVmKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG8ucHJvbWlzZTtcblx0XHR9O1xuXHRcdHRoaXNbXCJjYXRjaFwiXSA9IGZ1bmN0aW9uICRjYXRjaCQoZmFpbHVyZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMudGhlbih2b2lkIDAsZmFpbHVyZSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRleGVjdXRvci5jYWxsKFxuXHRcdFx0XHR2b2lkIDAsXG5cdFx0XHRcdGZ1bmN0aW9uIHB1YmxpY1Jlc29sdmUobXNnKXtcblx0XHRcdFx0XHRyZXNvbHZlLmNhbGwoZGVmLG1zZyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uIHB1YmxpY1JlamVjdChtc2cpIHtcblx0XHRcdFx0XHRyZWplY3QuY2FsbChkZWYsbXNnKTtcblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGVycikge1xuXHRcdFx0cmVqZWN0LmNhbGwoZGVmLGVycik7XG5cdFx0fVxuXHR9XG5cblx0dmFyIFByb21pc2VQcm90b3R5cGUgPSBidWlsdEluUHJvcCh7fSxcImNvbnN0cnVjdG9yXCIsUHJvbWlzZSxcblx0XHQvKmNvbmZpZ3VyYWJsZT0qL2ZhbHNlXG5cdCk7XG5cblx0Ly8gTm90ZTogQW5kcm9pZCA0IGNhbm5vdCB1c2UgYE9iamVjdC5kZWZpbmVQcm9wZXJ0eSguLilgIGhlcmVcblx0UHJvbWlzZS5wcm90b3R5cGUgPSBQcm9taXNlUHJvdG90eXBlO1xuXG5cdC8vIGJ1aWx0LWluIFwiYnJhbmRcIiB0byBzaWduYWwgYW4gXCJ1bmluaXRpYWxpemVkXCIgcHJvbWlzZVxuXHRidWlsdEluUHJvcChQcm9taXNlUHJvdG90eXBlLFwiX19OUE9fX1wiLDAsXG5cdFx0Lypjb25maWd1cmFibGU9Ki9mYWxzZVxuXHQpO1xuXG5cdGJ1aWx0SW5Qcm9wKFByb21pc2UsXCJyZXNvbHZlXCIsZnVuY3Rpb24gUHJvbWlzZSRyZXNvbHZlKG1zZykge1xuXHRcdHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cblx0XHQvLyBzcGVjIG1hbmRhdGVkIGNoZWNrc1xuXHRcdC8vIG5vdGU6IGJlc3QgXCJpc1Byb21pc2VcIiBjaGVjayB0aGF0J3MgcHJhY3RpY2FsIGZvciBub3dcblx0XHRpZiAobXNnICYmIHR5cGVvZiBtc2cgPT0gXCJvYmplY3RcIiAmJiBtc2cuX19OUE9fXyA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIG1zZztcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUscmVqZWN0KXtcblx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdHJlc29sdmUobXNnKTtcblx0XHR9KTtcblx0fSk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcInJlamVjdFwiLGZ1bmN0aW9uIFByb21pc2UkcmVqZWN0KG1zZykge1xuXHRcdHJldHVybiBuZXcgdGhpcyhmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLHJlamVjdCl7XG5cdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZWplY3QobXNnKTtcblx0XHR9KTtcblx0fSk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcImFsbFwiLGZ1bmN0aW9uIFByb21pc2UkYWxsKGFycikge1xuXHRcdHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cblx0XHQvLyBzcGVjIG1hbmRhdGVkIGNoZWNrc1xuXHRcdGlmIChUb1N0cmluZy5jYWxsKGFycikgIT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG5cdFx0XHRyZXR1cm4gQ29uc3RydWN0b3IucmVqZWN0KFR5cGVFcnJvcihcIk5vdCBhbiBhcnJheVwiKSk7XG5cdFx0fVxuXHRcdGlmIChhcnIubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gQ29uc3RydWN0b3IucmVzb2x2ZShbXSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLHJlamVjdCl7XG5cdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbGVuID0gYXJyLmxlbmd0aCwgbXNncyA9IEFycmF5KGxlbiksIGNvdW50ID0gMDtcblxuXHRcdFx0aXRlcmF0ZVByb21pc2VzKENvbnN0cnVjdG9yLGFycixmdW5jdGlvbiByZXNvbHZlcihpZHgsbXNnKSB7XG5cdFx0XHRcdG1zZ3NbaWR4XSA9IG1zZztcblx0XHRcdFx0aWYgKCsrY291bnQgPT09IGxlbikge1xuXHRcdFx0XHRcdHJlc29sdmUobXNncyk7XG5cdFx0XHRcdH1cblx0XHRcdH0scmVqZWN0KTtcblx0XHR9KTtcblx0fSk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcInJhY2VcIixmdW5jdGlvbiBQcm9taXNlJHJhY2UoYXJyKSB7XG5cdFx0dmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuXHRcdC8vIHNwZWMgbWFuZGF0ZWQgY2hlY2tzXG5cdFx0aWYgKFRvU3RyaW5nLmNhbGwoYXJyKSAhPSBcIltvYmplY3QgQXJyYXldXCIpIHtcblx0XHRcdHJldHVybiBDb25zdHJ1Y3Rvci5yZWplY3QoVHlwZUVycm9yKFwiTm90IGFuIGFycmF5XCIpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUscmVqZWN0KXtcblx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdGl0ZXJhdGVQcm9taXNlcyhDb25zdHJ1Y3RvcixhcnIsZnVuY3Rpb24gcmVzb2x2ZXIoaWR4LG1zZyl7XG5cdFx0XHRcdHJlc29sdmUobXNnKTtcblx0XHRcdH0scmVqZWN0KTtcblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2U7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gIyBzaW1wbGUtc3RhdGlzdGljc1xuLy9cbi8vIEEgc2ltcGxlLCBsaXRlcmF0ZSBzdGF0aXN0aWNzIHN5c3RlbS5cblxudmFyIHNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gTGluZWFyIFJlZ3Jlc3Npb25cbnNzLmxpbmVhclJlZ3Jlc3Npb24gPSByZXF1aXJlKCcuL3NyYy9saW5lYXJfcmVncmVzc2lvbicpO1xuc3MubGluZWFyUmVncmVzc2lvbkxpbmUgPSByZXF1aXJlKCcuL3NyYy9saW5lYXJfcmVncmVzc2lvbl9saW5lJyk7XG5zcy5zdGFuZGFyZERldmlhdGlvbiA9IHJlcXVpcmUoJy4vc3JjL3N0YW5kYXJkX2RldmlhdGlvbicpO1xuc3MuclNxdWFyZWQgPSByZXF1aXJlKCcuL3NyYy9yX3NxdWFyZWQnKTtcbnNzLm1vZGUgPSByZXF1aXJlKCcuL3NyYy9tb2RlJyk7XG5zcy5taW4gPSByZXF1aXJlKCcuL3NyYy9taW4nKTtcbnNzLm1heCA9IHJlcXVpcmUoJy4vc3JjL21heCcpO1xuc3Muc3VtID0gcmVxdWlyZSgnLi9zcmMvc3VtJyk7XG5zcy5xdWFudGlsZSA9IHJlcXVpcmUoJy4vc3JjL3F1YW50aWxlJyk7XG5zcy5xdWFudGlsZVNvcnRlZCA9IHJlcXVpcmUoJy4vc3JjL3F1YW50aWxlX3NvcnRlZCcpO1xuc3MuaXFyID0gc3MuaW50ZXJxdWFydGlsZVJhbmdlID0gcmVxdWlyZSgnLi9zcmMvaW50ZXJxdWFydGlsZV9yYW5nZScpO1xuc3MubWVkaWFuQWJzb2x1dGVEZXZpYXRpb24gPSBzcy5tYWQgPSByZXF1aXJlKCcuL3NyYy9tYWQnKTtcbnNzLmNodW5rID0gcmVxdWlyZSgnLi9zcmMvY2h1bmsnKTtcbnNzLnNodWZmbGUgPSByZXF1aXJlKCcuL3NyYy9zaHVmZmxlJyk7XG5zcy5zaHVmZmxlSW5QbGFjZSA9IHJlcXVpcmUoJy4vc3JjL3NodWZmbGVfaW5fcGxhY2UnKTtcbnNzLnNhbXBsZSA9IHJlcXVpcmUoJy4vc3JjL3NhbXBsZScpO1xuc3MuY2ttZWFucyA9IHJlcXVpcmUoJy4vc3JjL2NrbWVhbnMnKTtcbnNzLnNvcnRlZFVuaXF1ZUNvdW50ID0gcmVxdWlyZSgnLi9zcmMvc29ydGVkX3VuaXF1ZV9jb3VudCcpO1xuc3Muc3VtTnRoUG93ZXJEZXZpYXRpb25zID0gcmVxdWlyZSgnLi9zcmMvc3VtX250aF9wb3dlcl9kZXZpYXRpb25zJyk7XG5cbi8vIHNhbXBsZSBzdGF0aXN0aWNzXG5zcy5zYW1wbGVDb3ZhcmlhbmNlID0gcmVxdWlyZSgnLi9zcmMvc2FtcGxlX2NvdmFyaWFuY2UnKTtcbnNzLnNhbXBsZUNvcnJlbGF0aW9uID0gcmVxdWlyZSgnLi9zcmMvc2FtcGxlX2NvcnJlbGF0aW9uJyk7XG5zcy5zYW1wbGVWYXJpYW5jZSA9IHJlcXVpcmUoJy4vc3JjL3NhbXBsZV92YXJpYW5jZScpO1xuc3Muc2FtcGxlU3RhbmRhcmREZXZpYXRpb24gPSByZXF1aXJlKCcuL3NyYy9zYW1wbGVfc3RhbmRhcmRfZGV2aWF0aW9uJyk7XG5zcy5zYW1wbGVTa2V3bmVzcyA9IHJlcXVpcmUoJy4vc3JjL3NhbXBsZV9za2V3bmVzcycpO1xuXG4vLyBtZWFzdXJlcyBvZiBjZW50cmFsaXR5XG5zcy5nZW9tZXRyaWNNZWFuID0gcmVxdWlyZSgnLi9zcmMvZ2VvbWV0cmljX21lYW4nKTtcbnNzLmhhcm1vbmljTWVhbiA9IHJlcXVpcmUoJy4vc3JjL2hhcm1vbmljX21lYW4nKTtcbnNzLm1lYW4gPSBzcy5hdmVyYWdlID0gcmVxdWlyZSgnLi9zcmMvbWVhbicpO1xuc3MubWVkaWFuID0gcmVxdWlyZSgnLi9zcmMvbWVkaWFuJyk7XG5cbnNzLnJvb3RNZWFuU3F1YXJlID0gc3Mucm1zID0gcmVxdWlyZSgnLi9zcmMvcm9vdF9tZWFuX3NxdWFyZScpO1xuc3MudmFyaWFuY2UgPSByZXF1aXJlKCcuL3NyYy92YXJpYW5jZScpO1xuc3MudFRlc3QgPSByZXF1aXJlKCcuL3NyYy90X3Rlc3QnKTtcbnNzLnRUZXN0VHdvU2FtcGxlID0gcmVxdWlyZSgnLi9zcmMvdF90ZXN0X3R3b19zYW1wbGUnKTtcbi8vIHNzLmplbmtzID0gcmVxdWlyZSgnLi9zcmMvamVua3MnKTtcblxuLy8gQ2xhc3NpZmllcnNcbnNzLmJheWVzaWFuID0gcmVxdWlyZSgnLi9zcmMvYmF5ZXNpYW5fY2xhc3NpZmllcicpO1xuc3MucGVyY2VwdHJvbiA9IHJlcXVpcmUoJy4vc3JjL3BlcmNlcHRyb24nKTtcblxuLy8gRGlzdHJpYnV0aW9uLXJlbGF0ZWQgbWV0aG9kc1xuc3MuZXBzaWxvbiA9IHJlcXVpcmUoJy4vc3JjL2Vwc2lsb24nKTsgLy8gV2UgbWFrZSDOtSBhdmFpbGFibGUgdG8gdGhlIHRlc3Qgc3VpdGUuXG5zcy5mYWN0b3JpYWwgPSByZXF1aXJlKCcuL3NyYy9mYWN0b3JpYWwnKTtcbnNzLmJlcm5vdWxsaURpc3RyaWJ1dGlvbiA9IHJlcXVpcmUoJy4vc3JjL2Jlcm5vdWxsaV9kaXN0cmlidXRpb24nKTtcbnNzLmJpbm9taWFsRGlzdHJpYnV0aW9uID0gcmVxdWlyZSgnLi9zcmMvYmlub21pYWxfZGlzdHJpYnV0aW9uJyk7XG5zcy5wb2lzc29uRGlzdHJpYnV0aW9uID0gcmVxdWlyZSgnLi9zcmMvcG9pc3Nvbl9kaXN0cmlidXRpb24nKTtcbnNzLmNoaVNxdWFyZWRHb29kbmVzc09mRml0ID0gcmVxdWlyZSgnLi9zcmMvY2hpX3NxdWFyZWRfZ29vZG5lc3Nfb2ZfZml0Jyk7XG5cbi8vIE5vcm1hbCBkaXN0cmlidXRpb25cbnNzLnpTY29yZSA9IHJlcXVpcmUoJy4vc3JjL3pfc2NvcmUnKTtcbnNzLmN1bXVsYXRpdmVTdGROb3JtYWxQcm9iYWJpbGl0eSA9IHJlcXVpcmUoJy4vc3JjL2N1bXVsYXRpdmVfc3RkX25vcm1hbF9wcm9iYWJpbGl0eScpO1xuc3Muc3RhbmRhcmROb3JtYWxUYWJsZSA9IHJlcXVpcmUoJy4vc3JjL3N0YW5kYXJkX25vcm1hbF90YWJsZScpO1xuc3MuZXJyb3JGdW5jdGlvbiA9IHNzLmVyZiA9IHJlcXVpcmUoJy4vc3JjL2Vycm9yX2Z1bmN0aW9uJyk7XG5zcy5pbnZlcnNlRXJyb3JGdW5jdGlvbiA9IHJlcXVpcmUoJy4vc3JjL2ludmVyc2VfZXJyb3JfZnVuY3Rpb24nKTtcbnNzLnByb2JpdCA9IHJlcXVpcmUoJy4vc3JjL3Byb2JpdCcpO1xuc3MubWl4aW4gPSByZXF1aXJlKCcuL3NyYy9taXhpbicpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFtCYXllc2lhbiBDbGFzc2lmaWVyXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05haXZlX0JheWVzX2NsYXNzaWZpZXIpXG4gKlxuICogVGhpcyBpcyBhIG5hw692ZSBiYXllc2lhbiBjbGFzc2lmaWVyIHRoYXQgdGFrZXNcbiAqIHNpbmdseS1uZXN0ZWQgb2JqZWN0cy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBleGFtcGxlXG4gKiB2YXIgYmF5ZXMgPSBuZXcgQmF5ZXNpYW5DbGFzc2lmaWVyKCk7XG4gKiBiYXllcy50cmFpbih7XG4gKiAgIHNwZWNpZXM6ICdDYXQnXG4gKiB9LCAnYW5pbWFsJyk7XG4gKiB2YXIgcmVzdWx0ID0gYmF5ZXMuc2NvcmUoe1xuICogICBzcGVjaWVzOiAnQ2F0J1xuICogfSlcbiAqIC8vIHJlc3VsdFxuICogLy8ge1xuICogLy8gICBhbmltYWw6IDFcbiAqIC8vIH1cbiAqL1xuZnVuY3Rpb24gQmF5ZXNpYW5DbGFzc2lmaWVyKCkge1xuICAgIC8vIFRoZSBudW1iZXIgb2YgaXRlbXMgdGhhdCBhcmUgY3VycmVudGx5XG4gICAgLy8gY2xhc3NpZmllZCBpbiB0aGUgbW9kZWxcbiAgICB0aGlzLnRvdGFsQ291bnQgPSAwO1xuICAgIC8vIEV2ZXJ5IGl0ZW0gY2xhc3NpZmllZCBpbiB0aGUgbW9kZWxcbiAgICB0aGlzLmRhdGEgPSB7fTtcbn1cblxuLyoqXG4gKiBUcmFpbiB0aGUgY2xhc3NpZmllciB3aXRoIGEgbmV3IGl0ZW0sIHdoaWNoIGhhcyBhIHNpbmdsZVxuICogZGltZW5zaW9uIG9mIEphdmFzY3JpcHQgbGl0ZXJhbCBrZXlzIGFuZCB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gYW4gb2JqZWN0IHdpdGggc2luZ2x5LWRlZXAgcHJvcGVydGllc1xuICogQHBhcmFtIHtzdHJpbmd9IGNhdGVnb3J5IHRoZSBjYXRlZ29yeSB0aGlzIGl0ZW0gYmVsb25ncyB0b1xuICogQHJldHVybiB7dW5kZWZpbmVkfSBhZGRzIHRoZSBpdGVtIHRvIHRoZSBjbGFzc2lmaWVyXG4gKi9cbkJheWVzaWFuQ2xhc3NpZmllci5wcm90b3R5cGUudHJhaW4gPSBmdW5jdGlvbihpdGVtLCBjYXRlZ29yeSkge1xuICAgIC8vIElmIHRoZSBkYXRhIG9iamVjdCBkb2Vzbid0IGhhdmUgYW55IHZhbHVlc1xuICAgIC8vIGZvciB0aGlzIGNhdGVnb3J5LCBjcmVhdGUgYSBuZXcgb2JqZWN0IGZvciBpdC5cbiAgICBpZiAoIXRoaXMuZGF0YVtjYXRlZ29yeV0pIHtcbiAgICAgICAgdGhpcy5kYXRhW2NhdGVnb3J5XSA9IHt9O1xuICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIGtleSBpbiB0aGUgaXRlbS5cbiAgICBmb3IgKHZhciBrIGluIGl0ZW0pIHtcbiAgICAgICAgdmFyIHYgPSBpdGVtW2tdO1xuICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBuZXN0ZWQgb2JqZWN0IGBkYXRhW2NhdGVnb3J5XVtrXVtpdGVtW2tdXWBcbiAgICAgICAgLy8gd2l0aCBhbiBvYmplY3Qgb2Yga2V5cyB0aGF0IGVxdWFsIDAuXG4gICAgICAgIGlmICh0aGlzLmRhdGFbY2F0ZWdvcnldW2tdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtjYXRlZ29yeV1ba10gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kYXRhW2NhdGVnb3J5XVtrXVt2XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbY2F0ZWdvcnldW2tdW3ZdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFuZCBpbmNyZW1lbnQgdGhlIGtleSBmb3IgdGhpcyBrZXkvdmFsdWUgY29tYmluYXRpb24uXG4gICAgICAgIHRoaXMuZGF0YVtjYXRlZ29yeV1ba11baXRlbVtrXV0rKztcbiAgICB9XG5cbiAgICAvLyBJbmNyZW1lbnQgdGhlIG51bWJlciBvZiBpdGVtcyBjbGFzc2lmaWVkXG4gICAgdGhpcy50b3RhbENvdW50Kys7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgc2NvcmUgb2YgaG93IHdlbGwgdGhpcyBpdGVtIG1hdGNoZXMgYWxsXG4gKiBwb3NzaWJsZSBjYXRlZ29yaWVzIGJhc2VkIG9uIGl0cyBhdHRyaWJ1dGVzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gYW4gaXRlbSBpbiB0aGUgc2FtZSBmb3JtYXQgYXMgd2l0aCB0cmFpblxuICogQHJldHVybnMge09iamVjdH0gb2YgcHJvYmFiaWxpdGllcyB0aGF0IHRoaXMgaXRlbSBiZWxvbmdzIHRvIGFcbiAqIGdpdmVuIGNhdGVnb3J5LlxuICovXG5CYXllc2lhbkNsYXNzaWZpZXIucHJvdG90eXBlLnNjb3JlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIC8vIEluaXRpYWxpemUgYW4gZW1wdHkgYXJyYXkgb2Ygb2RkcyBwZXIgY2F0ZWdvcnkuXG4gICAgdmFyIG9kZHMgPSB7fSwgY2F0ZWdvcnk7XG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2gga2V5IGluIHRoZSBpdGVtLFxuICAgIC8vIHRoZW4gaXRlcmF0ZSB0aHJvdWdoIGVhY2ggY2F0ZWdvcnkgdGhhdCBoYXMgYmVlbiB1c2VkXG4gICAgLy8gaW4gcHJldmlvdXMgY2FsbHMgdG8gYC50cmFpbigpYFxuICAgIGZvciAodmFyIGsgaW4gaXRlbSkge1xuICAgICAgICB2YXIgdiA9IGl0ZW1ba107XG4gICAgICAgIGZvciAoY2F0ZWdvcnkgaW4gdGhpcy5kYXRhKSB7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYW4gZW1wdHkgb2JqZWN0IGZvciBzdG9yaW5nIGtleSAtIHZhbHVlIGNvbWJpbmF0aW9uc1xuICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2F0ZWdvcnkuXG4gICAgICAgICAgICBpZiAob2Rkc1tjYXRlZ29yeV0gPT09IHVuZGVmaW5lZCkgeyBvZGRzW2NhdGVnb3J5XSA9IHt9OyB9XG5cbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXRlbSBkb2Vzbid0IGV2ZW4gaGF2ZSBhIHByb3BlcnR5LCBpdCBjb3VudHMgZm9yIG5vdGhpbmcsXG4gICAgICAgICAgICAvLyBidXQgaWYgaXQgZG9lcyBoYXZlIHRoZSBwcm9wZXJ0eSB0aGF0IHdlJ3JlIGxvb2tpbmcgZm9yIGZyb21cbiAgICAgICAgICAgIC8vIHRoZSBpdGVtIHRvIGNhdGVnb3JpemUsIGl0IGNvdW50cyBiYXNlZCBvbiBob3cgcG9wdWxhciBpdCBpc1xuICAgICAgICAgICAgLy8gdmVyc3VzIHRoZSB3aG9sZSBwb3B1bGF0aW9uLlxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YVtjYXRlZ29yeV1ba10pIHtcbiAgICAgICAgICAgICAgICBvZGRzW2NhdGVnb3J5XVtrICsgJ18nICsgdl0gPSAodGhpcy5kYXRhW2NhdGVnb3J5XVtrXVt2XSB8fCAwKSAvIHRoaXMudG90YWxDb3VudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2Rkc1tjYXRlZ29yeV1bayArICdfJyArIHZdID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB1cCBhIG5ldyBvYmplY3QgdGhhdCB3aWxsIGNvbnRhaW4gc3VtcyBvZiB0aGVzZSBvZGRzIGJ5IGNhdGVnb3J5XG4gICAgdmFyIG9kZHNTdW1zID0ge307XG5cbiAgICBmb3IgKGNhdGVnb3J5IGluIG9kZHMpIHtcbiAgICAgICAgLy8gVGFsbHkgYWxsIG9mIHRoZSBvZGRzIGZvciBlYWNoIGNhdGVnb3J5LWNvbWJpbmF0aW9uIHBhaXIgLVxuICAgICAgICAvLyB0aGUgbm9uLWV4aXN0ZW5jZSBvZiBhIGNhdGVnb3J5IGRvZXMgbm90IGFkZCBhbnl0aGluZyB0byB0aGVcbiAgICAgICAgLy8gc2NvcmUuXG4gICAgICAgIGZvciAodmFyIGNvbWJpbmF0aW9uIGluIG9kZHNbY2F0ZWdvcnldKSB7XG4gICAgICAgICAgICBpZiAob2Rkc1N1bXNbY2F0ZWdvcnldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBvZGRzU3Vtc1tjYXRlZ29yeV0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Rkc1N1bXNbY2F0ZWdvcnldICs9IG9kZHNbY2F0ZWdvcnldW2NvbWJpbmF0aW9uXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvZGRzU3Vtcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQmF5ZXNpYW5DbGFzc2lmaWVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmlub21pYWxEaXN0cmlidXRpb24gPSByZXF1aXJlKCcuL2Jpbm9taWFsX2Rpc3RyaWJ1dGlvbicpO1xuXG4vKipcbiAqIFRoZSBbQmVybm91bGxpIGRpc3RyaWJ1dGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CZXJub3VsbGlfZGlzdHJpYnV0aW9uKVxuICogaXMgdGhlIHByb2JhYmlsaXR5IGRpc2NyZXRlXG4gKiBkaXN0cmlidXRpb24gb2YgYSByYW5kb20gdmFyaWFibGUgd2hpY2ggdGFrZXMgdmFsdWUgMSB3aXRoIHN1Y2Nlc3NcbiAqIHByb2JhYmlsaXR5IGBwYCBhbmQgdmFsdWUgMCB3aXRoIGZhaWx1cmVcbiAqIHByb2JhYmlsaXR5IGBxYCA9IDEgLSBgcGAuIEl0IGNhbiBiZSB1c2VkLCBmb3IgZXhhbXBsZSwgdG8gcmVwcmVzZW50IHRoZVxuICogdG9zcyBvZiBhIGNvaW4sIHdoZXJlIFwiMVwiIGlzIGRlZmluZWQgdG8gbWVhbiBcImhlYWRzXCIgYW5kIFwiMFwiIGlzIGRlZmluZWRcbiAqIHRvIG1lYW4gXCJ0YWlsc1wiIChvciB2aWNlIHZlcnNhKS4gSXQgaXNcbiAqIGEgc3BlY2lhbCBjYXNlIG9mIGEgQmlub21pYWwgRGlzdHJpYnV0aW9uXG4gKiB3aGVyZSBgbmAgPSAxLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBwIGlucHV0IHZhbHVlLCBiZXR3ZWVuIDAgYW5kIDEgaW5jbHVzaXZlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB2YWx1ZSBvZiBiZXJub3VsbGkgZGlzdHJpYnV0aW9uIGF0IHRoaXMgcG9pbnRcbiAqL1xuZnVuY3Rpb24gYmVybm91bGxpRGlzdHJpYnV0aW9uKHApIHtcbiAgICAvLyBDaGVjayB0aGF0IGBwYCBpcyBhIHZhbGlkIHByb2JhYmlsaXR5ICgwIOKJpCBwIOKJpCAxKVxuICAgIGlmIChwIDwgMCB8fCBwID4gMSApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiBiaW5vbWlhbERpc3RyaWJ1dGlvbigxLCBwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiZXJub3VsbGlEaXN0cmlidXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcHNpbG9uID0gcmVxdWlyZSgnLi9lcHNpbG9uJyk7XG52YXIgZmFjdG9yaWFsID0gcmVxdWlyZSgnLi9mYWN0b3JpYWwnKTtcblxuLyoqXG4gKiBUaGUgW0Jpbm9taWFsIERpc3RyaWJ1dGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CaW5vbWlhbF9kaXN0cmlidXRpb24pIGlzIHRoZSBkaXNjcmV0ZSBwcm9iYWJpbGl0eVxuICogZGlzdHJpYnV0aW9uIG9mIHRoZSBudW1iZXIgb2Ygc3VjY2Vzc2VzIGluIGEgc2VxdWVuY2Ugb2YgbiBpbmRlcGVuZGVudCB5ZXMvbm8gZXhwZXJpbWVudHMsIGVhY2ggb2Ygd2hpY2ggeWllbGRzXG4gKiBzdWNjZXNzIHdpdGggcHJvYmFiaWxpdHkgYHByb2JhYmlsaXR5YC4gU3VjaCBhIHN1Y2Nlc3MvZmFpbHVyZSBleHBlcmltZW50IGlzIGFsc28gY2FsbGVkIGEgQmVybm91bGxpIGV4cGVyaW1lbnQgb3JcbiAqIEJlcm5vdWxsaSB0cmlhbDsgd2hlbiB0cmlhbHMgPSAxLCB0aGUgQmlub21pYWwgRGlzdHJpYnV0aW9uIGlzIGEgQmVybm91bGxpIERpc3RyaWJ1dGlvbi5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdHJpYWxzIG51bWJlciBvZiB0cmlhbHMgdG8gc2ltdWxhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9iYWJpbGl0eVxuICogQHJldHVybnMge251bWJlcn0gb3V0cHV0XG4gKi9cbmZ1bmN0aW9uIGJpbm9taWFsRGlzdHJpYnV0aW9uKHRyaWFscywgcHJvYmFiaWxpdHkpIHtcbiAgICAvLyBDaGVjayB0aGF0IGBwYCBpcyBhIHZhbGlkIHByb2JhYmlsaXR5ICgwIOKJpCBwIOKJpCAxKSxcbiAgICAvLyB0aGF0IGBuYCBpcyBhbiBpbnRlZ2VyLCBzdHJpY3RseSBwb3NpdGl2ZS5cbiAgICBpZiAocHJvYmFiaWxpdHkgPCAwIHx8IHByb2JhYmlsaXR5ID4gMSB8fFxuICAgICAgICB0cmlhbHMgPD0gMCB8fCB0cmlhbHMgJSAxICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdlIGluaXRpYWxpemUgYHhgLCB0aGUgcmFuZG9tIHZhcmlhYmxlLCBhbmQgYGFjY3VtdWxhdG9yYCwgYW4gYWNjdW11bGF0b3JcbiAgICAvLyBmb3IgdGhlIGN1bXVsYXRpdmUgZGlzdHJpYnV0aW9uIGZ1bmN0aW9uIHRvIDAuIGBkaXN0cmlidXRpb25fZnVuY3Rpb25zYFxuICAgIC8vIGlzIHRoZSBvYmplY3Qgd2UnbGwgcmV0dXJuIHdpdGggdGhlIGBwcm9iYWJpbGl0eV9vZl94YCBhbmQgdGhlXG4gICAgLy8gYGN1bXVsYXRpdmVQcm9iYWJpbGl0eV9vZl94YCwgYXMgd2VsbCBhcyB0aGUgY2FsY3VsYXRlZCBtZWFuICZcbiAgICAvLyB2YXJpYW5jZS4gV2UgaXRlcmF0ZSB1bnRpbCB0aGUgYGN1bXVsYXRpdmVQcm9iYWJpbGl0eV9vZl94YCBpc1xuICAgIC8vIHdpdGhpbiBgZXBzaWxvbmAgb2YgMS4wLlxuICAgIHZhciB4ID0gMCxcbiAgICAgICAgY3VtdWxhdGl2ZVByb2JhYmlsaXR5ID0gMCxcbiAgICAgICAgY2VsbHMgPSB7fTtcblxuICAgIC8vIFRoaXMgYWxnb3JpdGhtIGl0ZXJhdGVzIHRocm91Z2ggZWFjaCBwb3RlbnRpYWwgb3V0Y29tZSxcbiAgICAvLyB1bnRpbCB0aGUgYGN1bXVsYXRpdmVQcm9iYWJpbGl0eWAgaXMgdmVyeSBjbG9zZSB0byAxLCBhdFxuICAgIC8vIHdoaWNoIHBvaW50IHdlJ3ZlIGRlZmluZWQgdGhlIHZhc3QgbWFqb3JpdHkgb2Ygb3V0Y29tZXNcbiAgICBkbyB7XG4gICAgICAgIC8vIGEgW3Byb2JhYmlsaXR5IG1hc3MgZnVuY3Rpb25dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Byb2JhYmlsaXR5X21hc3NfZnVuY3Rpb24pXG4gICAgICAgIGNlbGxzW3hdID0gZmFjdG9yaWFsKHRyaWFscykgL1xuICAgICAgICAgICAgKGZhY3RvcmlhbCh4KSAqIGZhY3RvcmlhbCh0cmlhbHMgLSB4KSkgKlxuICAgICAgICAgICAgKE1hdGgucG93KHByb2JhYmlsaXR5LCB4KSAqIE1hdGgucG93KDEgLSBwcm9iYWJpbGl0eSwgdHJpYWxzIC0geCkpO1xuICAgICAgICBjdW11bGF0aXZlUHJvYmFiaWxpdHkgKz0gY2VsbHNbeF07XG4gICAgICAgIHgrKztcbiAgICAvLyB3aGVuIHRoZSBjdW11bGF0aXZlUHJvYmFiaWxpdHkgaXMgbmVhcmx5IDEsIHdlJ3ZlIGNhbGN1bGF0ZWRcbiAgICAvLyB0aGUgdXNlZnVsIHJhbmdlIG9mIHRoaXMgZGlzdHJpYnV0aW9uXG4gICAgfSB3aGlsZSAoY3VtdWxhdGl2ZVByb2JhYmlsaXR5IDwgMSAtIGVwc2lsb24pO1xuXG4gICAgcmV0dXJuIGNlbGxzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbm9taWFsRGlzdHJpYnV0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqICoqUGVyY2VudGFnZSBQb2ludHMgb2YgdGhlIM+HMiAoQ2hpLVNxdWFyZWQpIERpc3RyaWJ1dGlvbioqXG4gKlxuICogVGhlIFvPhzIgKENoaS1TcXVhcmVkKSBEaXN0cmlidXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2hpLXNxdWFyZWRfZGlzdHJpYnV0aW9uKSBpcyB1c2VkIGluIHRoZSBjb21tb25cbiAqIGNoaS1zcXVhcmVkIHRlc3RzIGZvciBnb29kbmVzcyBvZiBmaXQgb2YgYW4gb2JzZXJ2ZWQgZGlzdHJpYnV0aW9uIHRvIGEgdGhlb3JldGljYWwgb25lLCB0aGUgaW5kZXBlbmRlbmNlIG9mIHR3b1xuICogY3JpdGVyaWEgb2YgY2xhc3NpZmljYXRpb24gb2YgcXVhbGl0YXRpdmUgZGF0YSwgYW5kIGluIGNvbmZpZGVuY2UgaW50ZXJ2YWwgZXN0aW1hdGlvbiBmb3IgYSBwb3B1bGF0aW9uIHN0YW5kYXJkXG4gKiBkZXZpYXRpb24gb2YgYSBub3JtYWwgZGlzdHJpYnV0aW9uIGZyb20gYSBzYW1wbGUgc3RhbmRhcmQgZGV2aWF0aW9uLlxuICpcbiAqIFZhbHVlcyBmcm9tIEFwcGVuZGl4IDEsIFRhYmxlIElJSSBvZiBXaWxsaWFtIFcuIEhpbmVzICYgRG91Z2xhcyBDLiBNb250Z29tZXJ5LCBcIlByb2JhYmlsaXR5IGFuZCBTdGF0aXN0aWNzIGluXG4gKiBFbmdpbmVlcmluZyBhbmQgTWFuYWdlbWVudCBTY2llbmNlXCIsIFdpbGV5ICgxOTgwKS5cbiAqL1xudmFyIGNoaVNxdWFyZWREaXN0cmlidXRpb25UYWJsZSA9IHtcbiAgICAxOiB7IDAuOTk1OiAgMC4wMCwgMC45OTogIDAuMDAsIDAuOTc1OiAgMC4wMCwgMC45NTogIDAuMDAsIDAuOTogIDAuMDIsIDAuNTogIDAuNDUsIDAuMTogIDIuNzEsIDAuMDU6ICAzLjg0LCAwLjAyNTogIDUuMDIsIDAuMDE6ICA2LjYzLCAwLjAwNTogIDcuODggfSxcbiAgICAyOiB7IDAuOTk1OiAgMC4wMSwgMC45OTogIDAuMDIsIDAuOTc1OiAgMC4wNSwgMC45NTogIDAuMTAsIDAuOTogIDAuMjEsIDAuNTogIDEuMzksIDAuMTogIDQuNjEsIDAuMDU6ICA1Ljk5LCAwLjAyNTogIDcuMzgsIDAuMDE6ICA5LjIxLCAwLjAwNTogMTAuNjAgfSxcbiAgICAzOiB7IDAuOTk1OiAgMC4wNywgMC45OTogIDAuMTEsIDAuOTc1OiAgMC4yMiwgMC45NTogIDAuMzUsIDAuOTogIDAuNTgsIDAuNTogIDIuMzcsIDAuMTogIDYuMjUsIDAuMDU6ICA3LjgxLCAwLjAyNTogIDkuMzUsIDAuMDE6IDExLjM0LCAwLjAwNTogMTIuODQgfSxcbiAgICA0OiB7IDAuOTk1OiAgMC4yMSwgMC45OTogIDAuMzAsIDAuOTc1OiAgMC40OCwgMC45NTogIDAuNzEsIDAuOTogIDEuMDYsIDAuNTogIDMuMzYsIDAuMTogIDcuNzgsIDAuMDU6ICA5LjQ5LCAwLjAyNTogMTEuMTQsIDAuMDE6IDEzLjI4LCAwLjAwNTogMTQuODYgfSxcbiAgICA1OiB7IDAuOTk1OiAgMC40MSwgMC45OTogIDAuNTUsIDAuOTc1OiAgMC44MywgMC45NTogIDEuMTUsIDAuOTogIDEuNjEsIDAuNTogIDQuMzUsIDAuMTogIDkuMjQsIDAuMDU6IDExLjA3LCAwLjAyNTogMTIuODMsIDAuMDE6IDE1LjA5LCAwLjAwNTogMTYuNzUgfSxcbiAgICA2OiB7IDAuOTk1OiAgMC42OCwgMC45OTogIDAuODcsIDAuOTc1OiAgMS4yNCwgMC45NTogIDEuNjQsIDAuOTogIDIuMjAsIDAuNTogIDUuMzUsIDAuMTogMTAuNjUsIDAuMDU6IDEyLjU5LCAwLjAyNTogMTQuNDUsIDAuMDE6IDE2LjgxLCAwLjAwNTogMTguNTUgfSxcbiAgICA3OiB7IDAuOTk1OiAgMC45OSwgMC45OTogIDEuMjUsIDAuOTc1OiAgMS42OSwgMC45NTogIDIuMTcsIDAuOTogIDIuODMsIDAuNTogIDYuMzUsIDAuMTogMTIuMDIsIDAuMDU6IDE0LjA3LCAwLjAyNTogMTYuMDEsIDAuMDE6IDE4LjQ4LCAwLjAwNTogMjAuMjggfSxcbiAgICA4OiB7IDAuOTk1OiAgMS4zNCwgMC45OTogIDEuNjUsIDAuOTc1OiAgMi4xOCwgMC45NTogIDIuNzMsIDAuOTogIDMuNDksIDAuNTogIDcuMzQsIDAuMTogMTMuMzYsIDAuMDU6IDE1LjUxLCAwLjAyNTogMTcuNTMsIDAuMDE6IDIwLjA5LCAwLjAwNTogMjEuOTYgfSxcbiAgICA5OiB7IDAuOTk1OiAgMS43MywgMC45OTogIDIuMDksIDAuOTc1OiAgMi43MCwgMC45NTogIDMuMzMsIDAuOTogIDQuMTcsIDAuNTogIDguMzQsIDAuMTogMTQuNjgsIDAuMDU6IDE2LjkyLCAwLjAyNTogMTkuMDIsIDAuMDE6IDIxLjY3LCAwLjAwNTogMjMuNTkgfSxcbiAgICAxMDogeyAwLjk5NTogIDIuMTYsIDAuOTk6ICAyLjU2LCAwLjk3NTogIDMuMjUsIDAuOTU6ICAzLjk0LCAwLjk6ICA0Ljg3LCAwLjU6ICA5LjM0LCAwLjE6IDE1Ljk5LCAwLjA1OiAxOC4zMSwgMC4wMjU6IDIwLjQ4LCAwLjAxOiAyMy4yMSwgMC4wMDU6IDI1LjE5IH0sXG4gICAgMTE6IHsgMC45OTU6ICAyLjYwLCAwLjk5OiAgMy4wNSwgMC45NzU6ICAzLjgyLCAwLjk1OiAgNC41NywgMC45OiAgNS41OCwgMC41OiAxMC4zNCwgMC4xOiAxNy4yOCwgMC4wNTogMTkuNjgsIDAuMDI1OiAyMS45MiwgMC4wMTogMjQuNzIsIDAuMDA1OiAyNi43NiB9LFxuICAgIDEyOiB7IDAuOTk1OiAgMy4wNywgMC45OTogIDMuNTcsIDAuOTc1OiAgNC40MCwgMC45NTogIDUuMjMsIDAuOTogIDYuMzAsIDAuNTogMTEuMzQsIDAuMTogMTguNTUsIDAuMDU6IDIxLjAzLCAwLjAyNTogMjMuMzQsIDAuMDE6IDI2LjIyLCAwLjAwNTogMjguMzAgfSxcbiAgICAxMzogeyAwLjk5NTogIDMuNTcsIDAuOTk6ICA0LjExLCAwLjk3NTogIDUuMDEsIDAuOTU6ICA1Ljg5LCAwLjk6ICA3LjA0LCAwLjU6IDEyLjM0LCAwLjE6IDE5LjgxLCAwLjA1OiAyMi4zNiwgMC4wMjU6IDI0Ljc0LCAwLjAxOiAyNy42OSwgMC4wMDU6IDI5LjgyIH0sXG4gICAgMTQ6IHsgMC45OTU6ICA0LjA3LCAwLjk5OiAgNC42NiwgMC45NzU6ICA1LjYzLCAwLjk1OiAgNi41NywgMC45OiAgNy43OSwgMC41OiAxMy4zNCwgMC4xOiAyMS4wNiwgMC4wNTogMjMuNjgsIDAuMDI1OiAyNi4xMiwgMC4wMTogMjkuMTQsIDAuMDA1OiAzMS4zMiB9LFxuICAgIDE1OiB7IDAuOTk1OiAgNC42MCwgMC45OTogIDUuMjMsIDAuOTc1OiAgNi4yNywgMC45NTogIDcuMjYsIDAuOTogIDguNTUsIDAuNTogMTQuMzQsIDAuMTogMjIuMzEsIDAuMDU6IDI1LjAwLCAwLjAyNTogMjcuNDksIDAuMDE6IDMwLjU4LCAwLjAwNTogMzIuODAgfSxcbiAgICAxNjogeyAwLjk5NTogIDUuMTQsIDAuOTk6ICA1LjgxLCAwLjk3NTogIDYuOTEsIDAuOTU6ICA3Ljk2LCAwLjk6ICA5LjMxLCAwLjU6IDE1LjM0LCAwLjE6IDIzLjU0LCAwLjA1OiAyNi4zMCwgMC4wMjU6IDI4Ljg1LCAwLjAxOiAzMi4wMCwgMC4wMDU6IDM0LjI3IH0sXG4gICAgMTc6IHsgMC45OTU6ICA1LjcwLCAwLjk5OiAgNi40MSwgMC45NzU6ICA3LjU2LCAwLjk1OiAgOC42NywgMC45OiAxMC4wOSwgMC41OiAxNi4zNCwgMC4xOiAyNC43NywgMC4wNTogMjcuNTksIDAuMDI1OiAzMC4xOSwgMC4wMTogMzMuNDEsIDAuMDA1OiAzNS43MiB9LFxuICAgIDE4OiB7IDAuOTk1OiAgNi4yNiwgMC45OTogIDcuMDEsIDAuOTc1OiAgOC4yMywgMC45NTogIDkuMzksIDAuOTogMTAuODcsIDAuNTogMTcuMzQsIDAuMTogMjUuOTksIDAuMDU6IDI4Ljg3LCAwLjAyNTogMzEuNTMsIDAuMDE6IDM0LjgxLCAwLjAwNTogMzcuMTYgfSxcbiAgICAxOTogeyAwLjk5NTogIDYuODQsIDAuOTk6ICA3LjYzLCAwLjk3NTogIDguOTEsIDAuOTU6IDEwLjEyLCAwLjk6IDExLjY1LCAwLjU6IDE4LjM0LCAwLjE6IDI3LjIwLCAwLjA1OiAzMC4xNCwgMC4wMjU6IDMyLjg1LCAwLjAxOiAzNi4xOSwgMC4wMDU6IDM4LjU4IH0sXG4gICAgMjA6IHsgMC45OTU6ICA3LjQzLCAwLjk5OiAgOC4yNiwgMC45NzU6ICA5LjU5LCAwLjk1OiAxMC44NSwgMC45OiAxMi40NCwgMC41OiAxOS4zNCwgMC4xOiAyOC40MSwgMC4wNTogMzEuNDEsIDAuMDI1OiAzNC4xNywgMC4wMTogMzcuNTcsIDAuMDA1OiA0MC4wMCB9LFxuICAgIDIxOiB7IDAuOTk1OiAgOC4wMywgMC45OTogIDguOTAsIDAuOTc1OiAxMC4yOCwgMC45NTogMTEuNTksIDAuOTogMTMuMjQsIDAuNTogMjAuMzQsIDAuMTogMjkuNjIsIDAuMDU6IDMyLjY3LCAwLjAyNTogMzUuNDgsIDAuMDE6IDM4LjkzLCAwLjAwNTogNDEuNDAgfSxcbiAgICAyMjogeyAwLjk5NTogIDguNjQsIDAuOTk6ICA5LjU0LCAwLjk3NTogMTAuOTgsIDAuOTU6IDEyLjM0LCAwLjk6IDE0LjA0LCAwLjU6IDIxLjM0LCAwLjE6IDMwLjgxLCAwLjA1OiAzMy45MiwgMC4wMjU6IDM2Ljc4LCAwLjAxOiA0MC4yOSwgMC4wMDU6IDQyLjgwIH0sXG4gICAgMjM6IHsgMC45OTU6ICA5LjI2LCAwLjk5OiAxMC4yMCwgMC45NzU6IDExLjY5LCAwLjk1OiAxMy4wOSwgMC45OiAxNC44NSwgMC41OiAyMi4zNCwgMC4xOiAzMi4wMSwgMC4wNTogMzUuMTcsIDAuMDI1OiAzOC4wOCwgMC4wMTogNDEuNjQsIDAuMDA1OiA0NC4xOCB9LFxuICAgIDI0OiB7IDAuOTk1OiAgOS44OSwgMC45OTogMTAuODYsIDAuOTc1OiAxMi40MCwgMC45NTogMTMuODUsIDAuOTogMTUuNjYsIDAuNTogMjMuMzQsIDAuMTogMzMuMjAsIDAuMDU6IDM2LjQyLCAwLjAyNTogMzkuMzYsIDAuMDE6IDQyLjk4LCAwLjAwNTogNDUuNTYgfSxcbiAgICAyNTogeyAwLjk5NTogMTAuNTIsIDAuOTk6IDExLjUyLCAwLjk3NTogMTMuMTIsIDAuOTU6IDE0LjYxLCAwLjk6IDE2LjQ3LCAwLjU6IDI0LjM0LCAwLjE6IDM0LjI4LCAwLjA1OiAzNy42NSwgMC4wMjU6IDQwLjY1LCAwLjAxOiA0NC4zMSwgMC4wMDU6IDQ2LjkzIH0sXG4gICAgMjY6IHsgMC45OTU6IDExLjE2LCAwLjk5OiAxMi4yMCwgMC45NzU6IDEzLjg0LCAwLjk1OiAxNS4zOCwgMC45OiAxNy4yOSwgMC41OiAyNS4zNCwgMC4xOiAzNS41NiwgMC4wNTogMzguODksIDAuMDI1OiA0MS45MiwgMC4wMTogNDUuNjQsIDAuMDA1OiA0OC4yOSB9LFxuICAgIDI3OiB7IDAuOTk1OiAxMS44MSwgMC45OTogMTIuODgsIDAuOTc1OiAxNC41NywgMC45NTogMTYuMTUsIDAuOTogMTguMTEsIDAuNTogMjYuMzQsIDAuMTogMzYuNzQsIDAuMDU6IDQwLjExLCAwLjAyNTogNDMuMTksIDAuMDE6IDQ2Ljk2LCAwLjAwNTogNDkuNjUgfSxcbiAgICAyODogeyAwLjk5NTogMTIuNDYsIDAuOTk6IDEzLjU3LCAwLjk3NTogMTUuMzEsIDAuOTU6IDE2LjkzLCAwLjk6IDE4Ljk0LCAwLjU6IDI3LjM0LCAwLjE6IDM3LjkyLCAwLjA1OiA0MS4zNCwgMC4wMjU6IDQ0LjQ2LCAwLjAxOiA0OC4yOCwgMC4wMDU6IDUwLjk5IH0sXG4gICAgMjk6IHsgMC45OTU6IDEzLjEyLCAwLjk5OiAxNC4yNiwgMC45NzU6IDE2LjA1LCAwLjk1OiAxNy43MSwgMC45OiAxOS43NywgMC41OiAyOC4zNCwgMC4xOiAzOS4wOSwgMC4wNTogNDIuNTYsIDAuMDI1OiA0NS43MiwgMC4wMTogNDkuNTksIDAuMDA1OiA1Mi4zNCB9LFxuICAgIDMwOiB7IDAuOTk1OiAxMy43OSwgMC45OTogMTQuOTUsIDAuOTc1OiAxNi43OSwgMC45NTogMTguNDksIDAuOTogMjAuNjAsIDAuNTogMjkuMzQsIDAuMTogNDAuMjYsIDAuMDU6IDQzLjc3LCAwLjAyNTogNDYuOTgsIDAuMDE6IDUwLjg5LCAwLjAwNTogNTMuNjcgfSxcbiAgICA0MDogeyAwLjk5NTogMjAuNzEsIDAuOTk6IDIyLjE2LCAwLjk3NTogMjQuNDMsIDAuOTU6IDI2LjUxLCAwLjk6IDI5LjA1LCAwLjU6IDM5LjM0LCAwLjE6IDUxLjgxLCAwLjA1OiA1NS43NiwgMC4wMjU6IDU5LjM0LCAwLjAxOiA2My42OSwgMC4wMDU6IDY2Ljc3IH0sXG4gICAgNTA6IHsgMC45OTU6IDI3Ljk5LCAwLjk5OiAyOS43MSwgMC45NzU6IDMyLjM2LCAwLjk1OiAzNC43NiwgMC45OiAzNy42OSwgMC41OiA0OS4zMywgMC4xOiA2My4xNywgMC4wNTogNjcuNTAsIDAuMDI1OiA3MS40MiwgMC4wMTogNzYuMTUsIDAuMDA1OiA3OS40OSB9LFxuICAgIDYwOiB7IDAuOTk1OiAzNS41MywgMC45OTogMzcuNDgsIDAuOTc1OiA0MC40OCwgMC45NTogNDMuMTksIDAuOTogNDYuNDYsIDAuNTogNTkuMzMsIDAuMTogNzQuNDAsIDAuMDU6IDc5LjA4LCAwLjAyNTogODMuMzAsIDAuMDE6IDg4LjM4LCAwLjAwNTogOTEuOTUgfSxcbiAgICA3MDogeyAwLjk5NTogNDMuMjgsIDAuOTk6IDQ1LjQ0LCAwLjk3NTogNDguNzYsIDAuOTU6IDUxLjc0LCAwLjk6IDU1LjMzLCAwLjU6IDY5LjMzLCAwLjE6IDg1LjUzLCAwLjA1OiA5MC41MywgMC4wMjU6IDk1LjAyLCAwLjAxOiAxMDAuNDIsIDAuMDA1OiAxMDQuMjIgfSxcbiAgICA4MDogeyAwLjk5NTogNTEuMTcsIDAuOTk6IDUzLjU0LCAwLjk3NTogNTcuMTUsIDAuOTU6IDYwLjM5LCAwLjk6IDY0LjI4LCAwLjU6IDc5LjMzLCAwLjE6IDk2LjU4LCAwLjA1OiAxMDEuODgsIDAuMDI1OiAxMDYuNjMsIDAuMDE6IDExMi4zMywgMC4wMDU6IDExNi4zMiB9LFxuICAgIDkwOiB7IDAuOTk1OiA1OS4yMCwgMC45OTogNjEuNzUsIDAuOTc1OiA2NS42NSwgMC45NTogNjkuMTMsIDAuOTogNzMuMjksIDAuNTogODkuMzMsIDAuMTogMTA3LjU3LCAwLjA1OiAxMTMuMTQsIDAuMDI1OiAxMTguMTQsIDAuMDE6IDEyNC4xMiwgMC4wMDU6IDEyOC4zMCB9LFxuICAgIDEwMDogeyAwLjk5NTogNjcuMzMsIDAuOTk6IDcwLjA2LCAwLjk3NTogNzQuMjIsIDAuOTU6IDc3LjkzLCAwLjk6IDgyLjM2LCAwLjU6IDk5LjMzLCAwLjE6IDExOC41MCwgMC4wNTogMTI0LjM0LCAwLjAyNTogMTI5LjU2LCAwLjAxOiAxMzUuODEsIDAuMDA1OiAxNDAuMTcgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjaGlTcXVhcmVkRGlzdHJpYnV0aW9uVGFibGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWFuID0gcmVxdWlyZSgnLi9tZWFuJyk7XG52YXIgY2hpU3F1YXJlZERpc3RyaWJ1dGlvblRhYmxlID0gcmVxdWlyZSgnLi9jaGlfc3F1YXJlZF9kaXN0cmlidXRpb25fdGFibGUnKTtcblxuLyoqXG4gKiBUaGUgW8+HMiAoQ2hpLVNxdWFyZWQpIEdvb2RuZXNzLW9mLUZpdCBUZXN0XShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dvb2RuZXNzX29mX2ZpdCNQZWFyc29uLjI3c19jaGktc3F1YXJlZF90ZXN0KVxuICogdXNlcyBhIG1lYXN1cmUgb2YgZ29vZG5lc3Mgb2YgZml0IHdoaWNoIGlzIHRoZSBzdW0gb2YgZGlmZmVyZW5jZXMgYmV0d2VlbiBvYnNlcnZlZCBhbmQgZXhwZWN0ZWQgb3V0Y29tZSBmcmVxdWVuY2llc1xuICogKHRoYXQgaXMsIGNvdW50cyBvZiBvYnNlcnZhdGlvbnMpLCBlYWNoIHNxdWFyZWQgYW5kIGRpdmlkZWQgYnkgdGhlIG51bWJlciBvZiBvYnNlcnZhdGlvbnMgZXhwZWN0ZWQgZ2l2ZW4gdGhlXG4gKiBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uLiBUaGUgcmVzdWx0aW5nIM+HMiBzdGF0aXN0aWMsIGBjaGlTcXVhcmVkYCwgY2FuIGJlIGNvbXBhcmVkIHRvIHRoZSBjaGktc3F1YXJlZCBkaXN0cmlidXRpb25cbiAqIHRvIGRldGVybWluZSB0aGUgZ29vZG5lc3Mgb2YgZml0LiBJbiBvcmRlciB0byBkZXRlcm1pbmUgdGhlIGRlZ3JlZXMgb2YgZnJlZWRvbSBvZiB0aGUgY2hpLXNxdWFyZWQgZGlzdHJpYnV0aW9uLCBvbmVcbiAqIHRha2VzIHRoZSB0b3RhbCBudW1iZXIgb2Ygb2JzZXJ2ZWQgZnJlcXVlbmNpZXMgYW5kIHN1YnRyYWN0cyB0aGUgbnVtYmVyIG9mIGVzdGltYXRlZCBwYXJhbWV0ZXJzLiBUaGUgdGVzdCBzdGF0aXN0aWNcbiAqIGZvbGxvd3MsIGFwcHJveGltYXRlbHksIGEgY2hpLXNxdWFyZSBkaXN0cmlidXRpb24gd2l0aCAoayDiiJIgYykgZGVncmVlcyBvZiBmcmVlZG9tIHdoZXJlIGBrYCBpcyB0aGUgbnVtYmVyIG9mIG5vbi1lbXB0eVxuICogY2VsbHMgYW5kIGBjYCBpcyB0aGUgbnVtYmVyIG9mIGVzdGltYXRlZCBwYXJhbWV0ZXJzIGZvciB0aGUgZGlzdHJpYnV0aW9uLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGlzdHJpYnV0aW9uVHlwZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHBvaW50IGluIGEgZGlzdHJpYnV0aW9uOlxuICogZm9yIGluc3RhbmNlLCBiaW5vbWlhbCwgYmVybm91bGxpLCBvciBwb2lzc29uXG4gKiBAcGFyYW0ge251bWJlcn0gc2lnbmlmaWNhbmNlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBjaGkgc3F1YXJlZCBnb29kbmVzcyBvZiBmaXRcbiAqIEBleGFtcGxlXG4gKiAvLyBEYXRhIGZyb20gUG9pc3NvbiBnb29kbmVzcy1vZi1maXQgZXhhbXBsZSAxMC0xOSBpbiBXaWxsaWFtIFcuIEhpbmVzICYgRG91Z2xhcyBDLiBNb250Z29tZXJ5LFxuICogLy8gXCJQcm9iYWJpbGl0eSBhbmQgU3RhdGlzdGljcyBpbiBFbmdpbmVlcmluZyBhbmQgTWFuYWdlbWVudCBTY2llbmNlXCIsIFdpbGV5ICgxOTgwKS5cbiAqIHZhciBkYXRhMTAxOSA9IFtcbiAqICAgICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLFxuICogICAgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsXG4gKiAgICAgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSxcbiAqICAgICAyLCAyLCAyLCAyLCAyLCAyLCAyLCAyLCAyLFxuICogICAgIDMsIDMsIDMsIDNcbiAqIF07XG4gKiBzcy5jaGlTcXVhcmVkR29vZG5lc3NPZkZpdChkYXRhMTAxOSwgc3MucG9pc3NvbkRpc3RyaWJ1dGlvbiwgMC4wNSkpOyAvLz0gZmFsc2VcbiAqL1xuZnVuY3Rpb24gY2hpU3F1YXJlZEdvb2RuZXNzT2ZGaXQoZGF0YSwgZGlzdHJpYnV0aW9uVHlwZSwgc2lnbmlmaWNhbmNlKSB7XG4gICAgLy8gRXN0aW1hdGUgZnJvbSB0aGUgc2FtcGxlIGRhdGEsIGEgd2VpZ2h0ZWQgbWVhbi5cbiAgICB2YXIgaW5wdXRNZWFuID0gbWVhbihkYXRhKSxcbiAgICAgICAgLy8gQ2FsY3VsYXRlZCB2YWx1ZSBvZiB0aGUgz4cyIHN0YXRpc3RpYy5cbiAgICAgICAgY2hpU3F1YXJlZCA9IDAsXG4gICAgICAgIC8vIERlZ3JlZXMgb2YgZnJlZWRvbSwgY2FsY3VsYXRlZCBhcyAobnVtYmVyIG9mIGNsYXNzIGludGVydmFscyAtXG4gICAgICAgIC8vIG51bWJlciBvZiBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uIHBhcmFtZXRlcnMgZXN0aW1hdGVkIC0gMSlcbiAgICAgICAgZGVncmVlc09mRnJlZWRvbSxcbiAgICAgICAgLy8gTnVtYmVyIG9mIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24gcGFyYW1ldGVycyBlc3RpbWF0ZWQsIGV4cGVjdGVkIHRvIGJlIHN1cHBsaWVkIGluIHRoZSBkaXN0cmlidXRpb24gdGVzdC5cbiAgICAgICAgLy8gTG9zZSBvbmUgZGVncmVlIG9mIGZyZWVkb20gZm9yIGVzdGltYXRpbmcgYGxhbWJkYWAgZnJvbSB0aGUgc2FtcGxlIGRhdGEuXG4gICAgICAgIGMgPSAxLFxuICAgICAgICAvLyBUaGUgaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbi5cbiAgICAgICAgLy8gR2VuZXJhdGUgdGhlIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24uXG4gICAgICAgIGh5cG90aGVzaXplZERpc3RyaWJ1dGlvbiA9IGRpc3RyaWJ1dGlvblR5cGUoaW5wdXRNZWFuKSxcbiAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llcyA9IFtdLFxuICAgICAgICBleHBlY3RlZEZyZXF1ZW5jaWVzID0gW10sXG4gICAgICAgIGs7XG5cbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgaG9sZGluZyBhIGhpc3RvZ3JhbSBmcm9tIHRoZSBzYW1wbGUgZGF0YSwgb2ZcbiAgICAvLyB0aGUgZm9ybSBgeyB2YWx1ZTogbnVtYmVyT2ZPY3VycmVuY2VzIH1gXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvYnNlcnZlZEZyZXF1ZW5jaWVzW2RhdGFbaV1dID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXNbZGF0YVtpXV0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXNbZGF0YVtpXV0rKztcbiAgICB9XG5cbiAgICAvLyBUaGUgaGlzdG9ncmFtIHdlIGNyZWF0ZWQgbWlnaHQgYmUgc3BhcnNlIC0gdGhlcmUgbWlnaHQgYmUgZ2Fwc1xuICAgIC8vIGJldHdlZW4gdmFsdWVzLiBTbyB3ZSBpdGVyYXRlIHRocm91Z2ggdGhlIGhpc3RvZ3JhbSwgbWFraW5nXG4gICAgLy8gc3VyZSB0aGF0IGluc3RlYWQgb2YgdW5kZWZpbmVkLCBnYXBzIGhhdmUgMCB2YWx1ZXMuXG4gICAgZm9yIChpID0gMDsgaSA8IG9ic2VydmVkRnJlcXVlbmNpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9ic2VydmVkRnJlcXVlbmNpZXNbaV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llc1tpXSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYW4gYXJyYXkgaG9sZGluZyBhIGhpc3RvZ3JhbSBvZiBleHBlY3RlZCBkYXRhIGdpdmVuIHRoZVxuICAgIC8vIHNhbXBsZSBzaXplIGFuZCBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uLlxuICAgIGZvciAoayBpbiBoeXBvdGhlc2l6ZWREaXN0cmlidXRpb24pIHtcbiAgICAgICAgaWYgKGsgaW4gb2JzZXJ2ZWRGcmVxdWVuY2llcykge1xuICAgICAgICAgICAgZXhwZWN0ZWRGcmVxdWVuY2llc1trXSA9IGh5cG90aGVzaXplZERpc3RyaWJ1dGlvbltrXSAqIGRhdGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gV29ya2luZyBiYWNrd2FyZCB0aHJvdWdoIHRoZSBleHBlY3RlZCBmcmVxdWVuY2llcywgY29sbGFwc2UgY2xhc3Nlc1xuICAgIC8vIGlmIGxlc3MgdGhhbiB0aHJlZSBvYnNlcnZhdGlvbnMgYXJlIGV4cGVjdGVkIGZvciBhIGNsYXNzLlxuICAgIC8vIFRoaXMgdHJhbnNmb3JtYXRpb24gaXMgYXBwbGllZCB0byB0aGUgb2JzZXJ2ZWQgZnJlcXVlbmNpZXMgYXMgd2VsbC5cbiAgICBmb3IgKGsgPSBleHBlY3RlZEZyZXF1ZW5jaWVzLmxlbmd0aCAtIDE7IGsgPj0gMDsgay0tKSB7XG4gICAgICAgIGlmIChleHBlY3RlZEZyZXF1ZW5jaWVzW2tdIDwgMykge1xuICAgICAgICAgICAgZXhwZWN0ZWRGcmVxdWVuY2llc1trIC0gMV0gKz0gZXhwZWN0ZWRGcmVxdWVuY2llc1trXTtcbiAgICAgICAgICAgIGV4cGVjdGVkRnJlcXVlbmNpZXMucG9wKCk7XG5cbiAgICAgICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXNbayAtIDFdICs9IG9ic2VydmVkRnJlcXVlbmNpZXNba107XG4gICAgICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBzcXVhcmVkIGRpZmZlcmVuY2VzIGJldHdlZW4gb2JzZXJ2ZWQgJiBleHBlY3RlZFxuICAgIC8vIGZyZXF1ZW5jaWVzLCBhY2N1bXVsYXRpbmcgdGhlIGBjaGlTcXVhcmVkYCBzdGF0aXN0aWMuXG4gICAgZm9yIChrID0gMDsgayA8IG9ic2VydmVkRnJlcXVlbmNpZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgY2hpU3F1YXJlZCArPSBNYXRoLnBvdyhcbiAgICAgICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXNba10gLSBleHBlY3RlZEZyZXF1ZW5jaWVzW2tdLCAyKSAvXG4gICAgICAgICAgICBleHBlY3RlZEZyZXF1ZW5jaWVzW2tdO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSBkZWdyZWVzIG9mIGZyZWVkb20gZm9yIHRoaXMgdGVzdCBhbmQgbG9vayBpdCB1cCBpbiB0aGVcbiAgICAvLyBgY2hpU3F1YXJlZERpc3RyaWJ1dGlvblRhYmxlYCBpbiBvcmRlciB0b1xuICAgIC8vIGFjY2VwdCBvciByZWplY3QgdGhlIGdvb2RuZXNzLW9mLWZpdCBvZiB0aGUgaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbi5cbiAgICBkZWdyZWVzT2ZGcmVlZG9tID0gb2JzZXJ2ZWRGcmVxdWVuY2llcy5sZW5ndGggLSBjIC0gMTtcbiAgICByZXR1cm4gY2hpU3F1YXJlZERpc3RyaWJ1dGlvblRhYmxlW2RlZ3JlZXNPZkZyZWVkb21dW3NpZ25pZmljYW5jZV0gPCBjaGlTcXVhcmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNoaVNxdWFyZWRHb29kbmVzc09mRml0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFNwbGl0IGFuIGFycmF5IGludG8gY2h1bmtzIG9mIGEgc3BlY2lmaWVkIHNpemUuIFRoaXMgZnVuY3Rpb25cbiAqIGhhcyB0aGUgc2FtZSBiZWhhdmlvciBhcyBbUEhQJ3MgYXJyYXlfY2h1bmtdKGh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9mdW5jdGlvbi5hcnJheS1jaHVuay5waHApXG4gKiBmdW5jdGlvbiwgYW5kIHRodXMgd2lsbCBpbnNlcnQgc21hbGxlci1zaXplZCBjaHVua3MgYXQgdGhlIGVuZCBpZlxuICogdGhlIGlucHV0IHNpemUgaXMgbm90IGRpdmlzaWJsZSBieSB0aGUgY2h1bmsgc2l6ZS5cbiAqXG4gKiBgc2FtcGxlYCBpcyBleHBlY3RlZCB0byBiZSBhbiBhcnJheSwgYW5kIGBjaHVua1NpemVgIGEgbnVtYmVyLlxuICogVGhlIGBzYW1wbGVgIGFycmF5IGNhbiBjb250YWluIGFueSBraW5kIG9mIGRhdGEuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gc2FtcGxlIGFueSBhcnJheSBvZiB2YWx1ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBjaHVua1NpemUgc2l6ZSBvZiBlYWNoIG91dHB1dCBhcnJheVxuICogQHJldHVybnMge0FycmF5PEFycmF5Pn0gYSBjaHVua2VkIGFycmF5XG4gKiBAZXhhbXBsZVxuICogY29uc29sZS5sb2coY2h1bmsoWzEsIDIsIDMsIDRdLCAyKSk7IC8vIFtbMSwgMl0sIFszLCA0XV1cbiAqL1xuZnVuY3Rpb24gY2h1bmsoc2FtcGxlLCBjaHVua1NpemUpIHtcblxuICAgIC8vIGEgbGlzdCBvZiByZXN1bHQgY2h1bmtzLCBhcyBhcnJheXMgaW4gYW4gYXJyYXlcbiAgICB2YXIgb3V0cHV0ID0gW107XG5cbiAgICAvLyBgY2h1bmtTaXplYCBtdXN0IGJlIHplcm8gb3IgaGlnaGVyIC0gb3RoZXJ3aXNlIHRoZSBsb29wIGJlbG93LFxuICAgIC8vIGluIHdoaWNoIHdlIGNhbGwgYHN0YXJ0ICs9IGNodW5rU2l6ZWAsIHdpbGwgbG9vcCBpbmZpbml0ZWx5LlxuICAgIC8vIFNvLCB3ZSdsbCBkZXRlY3QgYW5kIHJldHVybiBudWxsIGluIHRoYXQgY2FzZSB0byBpbmRpY2F0ZVxuICAgIC8vIGludmFsaWQgaW5wdXQuXG4gICAgaWYgKGNodW5rU2l6ZSA8PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIGBzdGFydGAgaXMgdGhlIGluZGV4IGF0IHdoaWNoIGAuc2xpY2VgIHdpbGwgc3RhcnQgc2VsZWN0aW5nXG4gICAgLy8gbmV3IGFycmF5IGVsZW1lbnRzXG4gICAgZm9yICh2YXIgc3RhcnQgPSAwOyBzdGFydCA8IHNhbXBsZS5sZW5ndGg7IHN0YXJ0ICs9IGNodW5rU2l6ZSkge1xuXG4gICAgICAgIC8vIGZvciBlYWNoIGNodW5rLCBzbGljZSB0aGF0IHBhcnQgb2YgdGhlIGFycmF5IGFuZCBhZGQgaXRcbiAgICAgICAgLy8gdG8gdGhlIG91dHB1dC4gVGhlIGAuc2xpY2VgIGZ1bmN0aW9uIGRvZXMgbm90IGNoYW5nZVxuICAgICAgICAvLyB0aGUgb3JpZ2luYWwgYXJyYXkuXG4gICAgICAgIG91dHB1dC5wdXNoKHNhbXBsZS5zbGljZShzdGFydCwgc3RhcnQgKyBjaHVua1NpemUpKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjaHVuaztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNvcnRlZFVuaXF1ZUNvdW50ID0gcmVxdWlyZSgnLi9zb3J0ZWRfdW5pcXVlX2NvdW50JyksXG4gICAgbnVtZXJpY1NvcnQgPSByZXF1aXJlKCcuL251bWVyaWNfc29ydCcpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjb2x1bW4geCByb3cgbWF0cml4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uc1xuICogQHBhcmFtIHtudW1iZXJ9IHJvd3NcbiAqIEByZXR1cm4ge0FycmF5PEFycmF5PG51bWJlcj4+fSBtYXRyaXhcbiAqIEBleGFtcGxlXG4gKiBtYWtlTWF0cml4KDEwLCAxMCk7XG4gKi9cbmZ1bmN0aW9uIG1ha2VNYXRyaXgoY29sdW1ucywgcm93cykge1xuICAgIHZhciBtYXRyaXggPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbnM7IGkrKykge1xuICAgICAgICB2YXIgY29sdW1uID0gW107XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcm93czsgaisrKSB7XG4gICAgICAgICAgICBjb2x1bW4ucHVzaCgwKTtcbiAgICAgICAgfVxuICAgICAgICBtYXRyaXgucHVzaChjb2x1bW4pO1xuICAgIH1cbiAgICByZXR1cm4gbWF0cml4O1xufVxuXG4vKipcbiAqIENrbWVhbnMgY2x1c3RlcmluZyBpcyBhbiBpbXByb3ZlbWVudCBvbiBoZXVyaXN0aWMtYmFzZWQgY2x1c3RlcmluZ1xuICogYXBwcm9hY2hlcyBsaWtlIEplbmtzLiBUaGUgYWxnb3JpdGhtIHdhcyBkZXZlbG9wZWQgaW5cbiAqIFtIYWl6aG91IFdhbmcgYW5kIE1pbmd6aG91IFNvbmddKGh0dHA6Ly9qb3VybmFsLnItcHJvamVjdC5vcmcvYXJjaGl2ZS8yMDExLTIvUkpvdXJuYWxfMjAxMS0yX1dhbmcrU29uZy5wZGYpXG4gKiBhcyBhIFtkeW5hbWljIHByb2dyYW1taW5nXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EeW5hbWljX3Byb2dyYW1taW5nKSBhcHByb2FjaFxuICogdG8gdGhlIHByb2JsZW0gb2YgY2x1c3RlcmluZyBudW1lcmljIGRhdGEgaW50byBncm91cHMgd2l0aCB0aGUgbGVhc3RcbiAqIHdpdGhpbi1ncm91cCBzdW0tb2Ytc3F1YXJlZC1kZXZpYXRpb25zLlxuICpcbiAqIE1pbmltaXppbmcgdGhlIGRpZmZlcmVuY2Ugd2l0aGluIGdyb3VwcyAtIHdoYXQgV2FuZyAmIFNvbmcgcmVmZXIgdG8gYXNcbiAqIGB3aXRoaW5zc2AsIG9yIHdpdGhpbiBzdW0tb2Ytc3F1YXJlcywgbWVhbnMgdGhhdCBncm91cHMgYXJlIG9wdGltYWxseVxuICogaG9tb2dlbm91cyB3aXRoaW4gYW5kIHRoZSBkYXRhIGlzIHNwbGl0IGludG8gcmVwcmVzZW50YXRpdmUgZ3JvdXBzLlxuICogVGhpcyBpcyB2ZXJ5IHVzZWZ1bCBmb3IgdmlzdWFsaXphdGlvbiwgd2hlcmUgeW91IG1heSB3YW50IHRvIHJlcHJlc2VudFxuICogYSBjb250aW51b3VzIHZhcmlhYmxlIGluIGRpc2NyZXRlIGNvbG9yIG9yIHN0eWxlIGdyb3Vwcy4gVGhpcyBmdW5jdGlvblxuICogY2FuIHByb3ZpZGUgZ3JvdXBzIHRoYXQgZW1waGFzaXplIGRpZmZlcmVuY2VzIGJldHdlZW4gZGF0YS5cbiAqXG4gKiBCZWluZyBhIGR5bmFtaWMgYXBwcm9hY2gsIHRoaXMgYWxnb3JpdGhtIGlzIGJhc2VkIG9uIHR3byBtYXRyaWNlcyB0aGF0XG4gKiBzdG9yZSBpbmNyZW1lbnRhbGx5LWNvbXB1dGVkIHZhbHVlcyBmb3Igc3F1YXJlZCBkZXZpYXRpb25zIGFuZCBiYWNrdHJhY2tpbmdcbiAqIGluZGV4ZXMuXG4gKlxuICogVW5saWtlIHRoZSBbb3JpZ2luYWwgaW1wbGVtZW50YXRpb25dKGh0dHBzOi8vY3Jhbi5yLXByb2plY3Qub3JnL3dlYi9wYWNrYWdlcy9Da21lYW5zLjFkLmRwL2luZGV4Lmh0bWwpLFxuICogdGhpcyBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBpbmNsdWRlIGFueSBjb2RlIHRvIGF1dG9tYXRpY2FsbHkgZGV0ZXJtaW5lXG4gKiB0aGUgb3B0aW1hbCBudW1iZXIgb2YgY2x1c3RlcnM6IHRoaXMgaW5mb3JtYXRpb24gbmVlZHMgdG8gYmUgZXhwbGljaXRseVxuICogcHJvdmlkZWQuXG4gKlxuICogIyMjIFJlZmVyZW5jZXNcbiAqIF9Da21lYW5zLjFkLmRwOiBPcHRpbWFsIGstbWVhbnMgQ2x1c3RlcmluZyBpbiBPbmUgRGltZW5zaW9uIGJ5IER5bmFtaWNcbiAqIFByb2dyYW1taW5nXyBIYWl6aG91IFdhbmcgYW5kIE1pbmd6aG91IFNvbmcgSVNTTiAyMDczLTQ4NTlcbiAqXG4gKiBmcm9tIFRoZSBSIEpvdXJuYWwgVm9sLiAzLzIsIERlY2VtYmVyIDIwMTFcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gZGF0YSBpbnB1dCBkYXRhLCBhcyBhbiBhcnJheSBvZiBudW1iZXIgdmFsdWVzXG4gKiBAcGFyYW0ge251bWJlcn0gbkNsdXN0ZXJzIG51bWJlciBvZiBkZXNpcmVkIGNsYXNzZXMuIFRoaXMgY2Fubm90IGJlXG4gKiBncmVhdGVyIHRoYW4gdGhlIG51bWJlciBvZiB2YWx1ZXMgaW4gdGhlIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGNsdXN0ZXJlZCBpbnB1dFxuICogQGV4YW1wbGVcbiAqIGNrbWVhbnMoWy0xLCAyLCAtMSwgMiwgNCwgNSwgNiwgLTEsIDIsIC0xXSwgMyk7XG4gKiAvLyBUaGUgaW5wdXQsIGNsdXN0ZXJlZCBpbnRvIGdyb3VwcyBvZiBzaW1pbGFyIG51bWJlcnMuXG4gKiAvLz0gW1stMSwgLTEsIC0xLCAtMV0sIFsyLCAyLCAyXSwgWzQsIDUsIDZdXSk7XG4gKi9cbmZ1bmN0aW9uIGNrbWVhbnMoZGF0YSwgbkNsdXN0ZXJzKSB7XG5cbiAgICBpZiAobkNsdXN0ZXJzID4gZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgZ2VuZXJhdGUgbW9yZSBjbGFzc2VzIHRoYW4gdGhlcmUgYXJlIGRhdGEgdmFsdWVzJyk7XG4gICAgfVxuXG4gICAgdmFyIHNvcnRlZCA9IG51bWVyaWNTb3J0KGRhdGEpLFxuICAgICAgICAvLyB3ZSdsbCB1c2UgdGhpcyBhcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgY2x1c3RlcnNcbiAgICAgICAgdW5pcXVlQ291bnQgPSBzb3J0ZWRVbmlxdWVDb3VudChzb3J0ZWQpO1xuXG4gICAgLy8gaWYgYWxsIG9mIHRoZSBpbnB1dCB2YWx1ZXMgYXJlIGlkZW50aWNhbCwgdGhlcmUncyBvbmUgY2x1c3RlclxuICAgIC8vIHdpdGggYWxsIG9mIHRoZSBpbnB1dCBpbiBpdC5cbiAgICBpZiAodW5pcXVlQ291bnQgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFtzb3J0ZWRdO1xuICAgIH1cblxuICAgIC8vIG5hbWVkICdEJyBvcmlnaW5hbGx5XG4gICAgdmFyIG1hdHJpeCA9IG1ha2VNYXRyaXgobkNsdXN0ZXJzLCBzb3J0ZWQubGVuZ3RoKSxcbiAgICAgICAgLy8gbmFtZWQgJ0InIG9yaWdpbmFsbHlcbiAgICAgICAgYmFja3RyYWNrTWF0cml4ID0gbWFrZU1hdHJpeChuQ2x1c3RlcnMsIHNvcnRlZC5sZW5ndGgpO1xuXG4gICAgLy8gVGhpcyBpcyBhIGR5bmFtaWMgcHJvZ3JhbW1pbmcgd2F5IHRvIHNvbHZlIHRoZSBwcm9ibGVtIG9mIG1pbmltaXppbmdcbiAgICAvLyB3aXRoaW4tY2x1c3RlciBzdW0gb2Ygc3F1YXJlcy4gSXQncyBzaW1pbGFyIHRvIGxpbmVhciByZWdyZXNzaW9uXG4gICAgLy8gaW4gdGhpcyB3YXksIGFuZCB0aGlzIGNhbGN1bGF0aW9uIGluY3JlbWVudGFsbHkgY29tcHV0ZXMgdGhlXG4gICAgLy8gc3VtIG9mIHNxdWFyZXMgdGhhdCBhcmUgbGF0ZXIgcmVhZC5cblxuICAgIC8vIFRoZSBvdXRlciBsb29wIGl0ZXJhdGVzIHRocm91Z2ggY2x1c3RlcnMsIGZyb20gMCB0byBuQ2x1c3RlcnMuXG4gICAgZm9yICh2YXIgY2x1c3RlciA9IDA7IGNsdXN0ZXIgPCBuQ2x1c3RlcnM7IGNsdXN0ZXIrKykge1xuXG4gICAgICAgIC8vIEF0IHRoZSBzdGFydCBvZiBlYWNoIGxvb3AsIHRoZSBtZWFuIHN0YXJ0cyBhcyB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICB2YXIgZmlyc3RDbHVzdGVyTWVhbiA9IHNvcnRlZFswXTtcblxuICAgICAgICBmb3IgKHZhciBzb3J0ZWRJZHggPSBNYXRoLm1heChjbHVzdGVyLCAxKTtcbiAgICAgICAgICAgICBzb3J0ZWRJZHggPCBzb3J0ZWQubGVuZ3RoO1xuICAgICAgICAgICAgIHNvcnRlZElkeCsrKSB7XG5cbiAgICAgICAgICAgIGlmIChjbHVzdGVyID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBJbmNyZWFzZSB0aGUgcnVubmluZyBzdW0gb2Ygc3F1YXJlcyBjYWxjdWxhdGlvbiBieSB0aGlzXG4gICAgICAgICAgICAgICAgLy8gbmV3IHZhbHVlXG4gICAgICAgICAgICAgICAgdmFyIHNxdWFyZWREaWZmZXJlbmNlID0gTWF0aC5wb3coXG4gICAgICAgICAgICAgICAgICAgIHNvcnRlZFtzb3J0ZWRJZHhdIC0gZmlyc3RDbHVzdGVyTWVhbiwgMik7XG4gICAgICAgICAgICAgICAgbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4IC0gMV0gK1xuICAgICAgICAgICAgICAgICAgICAoc29ydGVkSWR4IC8gKHNvcnRlZElkeCArIDEpKSAqIHNxdWFyZWREaWZmZXJlbmNlO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UncmUgY29tcHV0aW5nIGEgcnVubmluZyBtZWFuIGJ5IHRha2luZyB0aGUgcHJldmlvdXNcbiAgICAgICAgICAgICAgICAvLyBtZWFuIHZhbHVlLCBtdWx0aXBseWluZyBpdCBieSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgLy8gc2VlbiBzbyBmYXIsIGFuZCB0aGVuIGRpdmlkaW5nIGl0IGJ5IHRoZSBudW1iZXIgb2ZcbiAgICAgICAgICAgICAgICAvLyBlbGVtZW50cyB0b3RhbC5cbiAgICAgICAgICAgICAgICB2YXIgbmV3U3VtID0gc29ydGVkSWR4ICogZmlyc3RDbHVzdGVyTWVhbiArIHNvcnRlZFtzb3J0ZWRJZHhdO1xuICAgICAgICAgICAgICAgIGZpcnN0Q2x1c3Rlck1lYW4gPSBuZXdTdW0gLyAoc29ydGVkSWR4ICsgMSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgc3VtU3F1YXJlZERpc3RhbmNlcyA9IDAsXG4gICAgICAgICAgICAgICAgICAgIG1lYW5YSiA9IDA7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gc29ydGVkSWR4OyBqID49IGNsdXN0ZXI7IGotLSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHN1bVNxdWFyZWREaXN0YW5jZXMgKz0gKHNvcnRlZElkeCAtIGopIC9cbiAgICAgICAgICAgICAgICAgICAgICAgIChzb3J0ZWRJZHggLSBqICsgMSkgKlxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5wb3coc29ydGVkW2pdIC0gbWVhblhKLCAyKTtcblxuICAgICAgICAgICAgICAgICAgICBtZWFuWEogPSAoc29ydGVkW2pdICsgKHNvcnRlZElkeCAtIGopICogbWVhblhKKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAoc29ydGVkSWR4IC0gaiArIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChqID09PSBzb3J0ZWRJZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gc3VtU3F1YXJlZERpc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2t0cmFja01hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdICs9IG1hdHJpeFtjbHVzdGVyIC0gMV1baiAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VtU3F1YXJlZERpc3RhbmNlcyA8PSBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IHN1bVNxdWFyZWREaXN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2t0cmFja01hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN1bVNxdWFyZWREaXN0YW5jZXMgKyBtYXRyaXhbY2x1c3RlciAtIDFdW2ogLSAxXSA8IG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBzdW1TcXVhcmVkRGlzdGFuY2VzICsgbWF0cml4W2NsdXN0ZXIgLSAxXVtqIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja3RyYWNrTWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhlIHJlYWwgd29yayBvZiBDa21lYW5zIGNsdXN0ZXJpbmcgaGFwcGVucyBpbiB0aGUgbWF0cml4IGdlbmVyYXRpb246XG4gICAgLy8gdGhlIGdlbmVyYXRlZCBtYXRyaWNlcyBlbmNvZGUgYWxsIHBvc3NpYmxlIGNsdXN0ZXJpbmcgY29tYmluYXRpb25zLCBhbmRcbiAgICAvLyBvbmNlIHRoZXkncmUgZ2VuZXJhdGVkIHdlIGNhbiBzb2x2ZSBmb3IgdGhlIGJlc3QgY2x1c3RlcmluZyBncm91cHNcbiAgICAvLyB2ZXJ5IHF1aWNrbHkuXG4gICAgdmFyIGNsdXN0ZXJzID0gW10sXG4gICAgICAgIGNsdXN0ZXJSaWdodCA9IGJhY2t0cmFja01hdHJpeFswXS5sZW5ndGggLSAxO1xuXG4gICAgLy8gQmFja3RyYWNrIHRoZSBjbHVzdGVycyBmcm9tIHRoZSBkeW5hbWljIHByb2dyYW1taW5nIG1hdHJpeC4gVGhpc1xuICAgIC8vIHN0YXJ0cyBhdCB0aGUgYm90dG9tLXJpZ2h0IGNvcm5lciBvZiB0aGUgbWF0cml4IChpZiB0aGUgdG9wLWxlZnQgaXMgMCwgMCksXG4gICAgLy8gYW5kIG1vdmVzIHRoZSBjbHVzdGVyIHRhcmdldCB3aXRoIHRoZSBsb29wLlxuICAgIGZvciAoY2x1c3RlciA9IGJhY2t0cmFja01hdHJpeC5sZW5ndGggLSAxOyBjbHVzdGVyID49IDA7IGNsdXN0ZXItLSkge1xuXG4gICAgICAgIHZhciBjbHVzdGVyTGVmdCA9IGJhY2t0cmFja01hdHJpeFtjbHVzdGVyXVtjbHVzdGVyUmlnaHRdO1xuXG4gICAgICAgIC8vIGZpbGwgdGhlIGNsdXN0ZXIgZnJvbSB0aGUgc29ydGVkIGlucHV0IGJ5IHRha2luZyBhIHNsaWNlIG9mIHRoZVxuICAgICAgICAvLyBhcnJheS4gdGhlIGJhY2t0cmFjayBtYXRyaXggbWFrZXMgdGhpcyBlYXN5IC0gaXQgc3RvcmVzIHRoZVxuICAgICAgICAvLyBpbmRleGVzIHdoZXJlIHRoZSBjbHVzdGVyIHNob3VsZCBzdGFydCBhbmQgZW5kLlxuICAgICAgICBjbHVzdGVyc1tjbHVzdGVyXSA9IHNvcnRlZC5zbGljZShjbHVzdGVyTGVmdCwgY2x1c3RlclJpZ2h0ICsgMSk7XG5cbiAgICAgICAgaWYgKGNsdXN0ZXIgPiAwKSB7XG4gICAgICAgICAgICBjbHVzdGVyUmlnaHQgPSBjbHVzdGVyTGVmdCAtIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2x1c3RlcnM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2ttZWFucztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN0YW5kYXJkTm9ybWFsVGFibGUgPSByZXF1aXJlKCcuL3N0YW5kYXJkX25vcm1hbF90YWJsZScpO1xuXG4vKipcbiAqICoqW0N1bXVsYXRpdmUgU3RhbmRhcmQgTm9ybWFsIFByb2JhYmlsaXR5XShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0YW5kYXJkX25vcm1hbF90YWJsZSkqKlxuICpcbiAqIFNpbmNlIHByb2JhYmlsaXR5IHRhYmxlcyBjYW5ub3QgYmVcbiAqIHByaW50ZWQgZm9yIGV2ZXJ5IG5vcm1hbCBkaXN0cmlidXRpb24sIGFzIHRoZXJlIGFyZSBhbiBpbmZpbml0ZSB2YXJpZXR5XG4gKiBvZiBub3JtYWwgZGlzdHJpYnV0aW9ucywgaXQgaXMgY29tbW9uIHByYWN0aWNlIHRvIGNvbnZlcnQgYSBub3JtYWwgdG8gYVxuICogc3RhbmRhcmQgbm9ybWFsIGFuZCB0aGVuIHVzZSB0aGUgc3RhbmRhcmQgbm9ybWFsIHRhYmxlIHRvIGZpbmQgcHJvYmFiaWxpdGllcy5cbiAqXG4gKiBZb3UgY2FuIHVzZSBgLjUgKyAuNSAqIGVycm9yRnVuY3Rpb24oeCAvIE1hdGguc3FydCgyKSlgIHRvIGNhbGN1bGF0ZSB0aGUgcHJvYmFiaWxpdHlcbiAqIGluc3RlYWQgb2YgbG9va2luZyBpdCB1cCBpbiBhIHRhYmxlLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB6XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBjdW11bGF0aXZlIHN0YW5kYXJkIG5vcm1hbCBwcm9iYWJpbGl0eVxuICovXG5mdW5jdGlvbiBjdW11bGF0aXZlU3RkTm9ybWFsUHJvYmFiaWxpdHkoeikge1xuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGlzIHZhbHVlLlxuICAgIHZhciBhYnNaID0gTWF0aC5hYnMoeiksXG4gICAgICAgIC8vIEVhY2ggcm93IGJlZ2lucyB3aXRoIGEgZGlmZmVyZW50XG4gICAgICAgIC8vIHNpZ25pZmljYW50IGRpZ2l0OiAwLjUsIDAuNiwgMC43LCBhbmQgc28gb24uIEVhY2ggdmFsdWUgaW4gdGhlIHRhYmxlXG4gICAgICAgIC8vIGNvcnJlc3BvbmRzIHRvIGEgcmFuZ2Ugb2YgMC4wMSBpbiB0aGUgaW5wdXQgdmFsdWVzLCBzbyB0aGUgdmFsdWUgaXNcbiAgICAgICAgLy8gbXVsdGlwbGllZCBieSAxMDAuXG4gICAgICAgIGluZGV4ID0gTWF0aC5taW4oTWF0aC5yb3VuZChhYnNaICogMTAwKSwgc3RhbmRhcmROb3JtYWxUYWJsZS5sZW5ndGggLSAxKTtcblxuICAgIC8vIFRoZSBpbmRleCB3ZSBjYWxjdWxhdGUgbXVzdCBiZSBpbiB0aGUgdGFibGUgYXMgYSBwb3NpdGl2ZSB2YWx1ZSxcbiAgICAvLyBidXQgd2Ugc3RpbGwgcGF5IGF0dGVudGlvbiB0byB3aGV0aGVyIHRoZSBpbnB1dCBpcyBwb3NpdGl2ZVxuICAgIC8vIG9yIG5lZ2F0aXZlLCBhbmQgZmxpcCB0aGUgb3V0cHV0IHZhbHVlIGFzIGEgbGFzdCBzdGVwLlxuICAgIGlmICh6ID49IDApIHtcbiAgICAgICAgcmV0dXJuIHN0YW5kYXJkTm9ybWFsVGFibGVbaW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGR1ZSB0byBmbG9hdGluZy1wb2ludCBhcml0aG1ldGljLCB2YWx1ZXMgaW4gdGhlIHRhYmxlIHdpdGhcbiAgICAgICAgLy8gNCBzaWduaWZpY2FudCBmaWd1cmVzIGNhbiBuZXZlcnRoZWxlc3MgZW5kIHVwIGFzIHJlcGVhdGluZ1xuICAgICAgICAvLyBmcmFjdGlvbnMgd2hlbiB0aGV5J3JlIGNvbXB1dGVkIGhlcmUuXG4gICAgICAgIHJldHVybiArKDEgLSBzdGFuZGFyZE5vcm1hbFRhYmxlW2luZGV4XSkudG9GaXhlZCg0KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3VtdWxhdGl2ZVN0ZE5vcm1hbFByb2JhYmlsaXR5O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFdlIHVzZSBgzrVgLCBlcHNpbG9uLCBhcyBhIHN0b3BwaW5nIGNyaXRlcmlvbiB3aGVuIHdlIHdhbnQgdG8gaXRlcmF0ZVxuICogdW50aWwgd2UncmUgXCJjbG9zZSBlbm91Z2hcIi4gRXBzaWxvbiBpcyBhIHZlcnkgc21hbGwgbnVtYmVyOiBmb3JcbiAqIHNpbXBsZSBzdGF0aXN0aWNzLCB0aGF0IG51bWJlciBpcyAqKjAuMDAwMSoqXG4gKlxuICogVGhpcyBpcyB1c2VkIGluIGNhbGN1bGF0aW9ucyBsaWtlIHRoZSBiaW5vbWlhbERpc3RyaWJ1dGlvbiwgaW4gd2hpY2hcbiAqIHRoZSBwcm9jZXNzIG9mIGZpbmRpbmcgYSB2YWx1ZSBpcyBbaXRlcmF0aXZlXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JdGVyYXRpdmVfbWV0aG9kKTpcbiAqIGl0IHByb2dyZXNzZXMgdW50aWwgaXQgaXMgY2xvc2UgZW5vdWdoLlxuICpcbiAqIEJlbG93IGlzIGFuIGV4YW1wbGUgb2YgdXNpbmcgZXBzaWxvbiBpbiBbZ3JhZGllbnQgZGVzY2VudF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR3JhZGllbnRfZGVzY2VudCksXG4gKiB3aGVyZSB3ZSdyZSB0cnlpbmcgdG8gZmluZCBhIGxvY2FsIG1pbmltdW0gb2YgYSBmdW5jdGlvbidzIGRlcml2YXRpdmUsXG4gKiBnaXZlbiBieSB0aGUgYGZEZXJpdmF0aXZlYCBtZXRob2QuXG4gKlxuICogQGV4YW1wbGVcbiAqIC8vIEZyb20gY2FsY3VsYXRpb24sIHdlIGV4cGVjdCB0aGF0IHRoZSBsb2NhbCBtaW5pbXVtIG9jY3VycyBhdCB4PTkvNFxuICogdmFyIHhfb2xkID0gMDtcbiAqIC8vIFRoZSBhbGdvcml0aG0gc3RhcnRzIGF0IHg9NlxuICogdmFyIHhfbmV3ID0gNjtcbiAqIHZhciBzdGVwU2l6ZSA9IDAuMDE7XG4gKlxuICogZnVuY3Rpb24gZkRlcml2YXRpdmUoeCkge1xuICogICByZXR1cm4gNCAqIE1hdGgucG93KHgsIDMpIC0gOSAqIE1hdGgucG93KHgsIDIpO1xuICogfVxuICpcbiAqIC8vIFRoZSBsb29wIHJ1bnMgdW50aWwgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgcHJldmlvdXNcbiAqIC8vIHZhbHVlIGFuZCB0aGUgY3VycmVudCB2YWx1ZSBpcyBzbWFsbGVyIHRoYW4gZXBzaWxvbiAtIGEgcm91Z2hcbiAqIC8vIG1lYXVyZSBvZiAnY2xvc2UgZW5vdWdoJ1xuICogd2hpbGUgKE1hdGguYWJzKHhfbmV3IC0geF9vbGQpID4gc3MuZXBzaWxvbikge1xuICogICB4X29sZCA9IHhfbmV3O1xuICogICB4X25ldyA9IHhfb2xkIC0gc3RlcFNpemUgKiBmRGVyaXZhdGl2ZSh4X29sZCk7XG4gKiB9XG4gKlxuICogY29uc29sZS5sb2coJ0xvY2FsIG1pbmltdW0gb2NjdXJzIGF0JywgeF9uZXcpO1xuICovXG52YXIgZXBzaWxvbiA9IDAuMDAwMTtcblxubW9kdWxlLmV4cG9ydHMgPSBlcHNpbG9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqICoqW0dhdXNzaWFuIGVycm9yIGZ1bmN0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Vycm9yX2Z1bmN0aW9uKSoqXG4gKlxuICogVGhlIGBlcnJvckZ1bmN0aW9uKHgvKHNkICogTWF0aC5zcXJ0KDIpKSlgIGlzIHRoZSBwcm9iYWJpbGl0eSB0aGF0IGEgdmFsdWUgaW4gYVxuICogbm9ybWFsIGRpc3RyaWJ1dGlvbiB3aXRoIHN0YW5kYXJkIGRldmlhdGlvbiBzZCBpcyB3aXRoaW4geCBvZiB0aGUgbWVhbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBudW1lcmljYWwgYXBwcm94aW1hdGlvbiB0byB0aGUgZXhhY3QgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHggaW5wdXRcbiAqIEByZXR1cm4ge251bWJlcn0gZXJyb3IgZXN0aW1hdGlvblxuICogQGV4YW1wbGVcbiAqIGVycm9yRnVuY3Rpb24oMSk7IC8vPSAwLjg0MjdcbiAqL1xuZnVuY3Rpb24gZXJyb3JGdW5jdGlvbih4KSB7XG4gICAgdmFyIHQgPSAxIC8gKDEgKyAwLjUgKiBNYXRoLmFicyh4KSk7XG4gICAgdmFyIHRhdSA9IHQgKiBNYXRoLmV4cCgtTWF0aC5wb3coeCwgMikgLVxuICAgICAgICAxLjI2NTUxMjIzICtcbiAgICAgICAgMS4wMDAwMjM2OCAqIHQgK1xuICAgICAgICAwLjM3NDA5MTk2ICogTWF0aC5wb3codCwgMikgK1xuICAgICAgICAwLjA5Njc4NDE4ICogTWF0aC5wb3codCwgMykgLVxuICAgICAgICAwLjE4NjI4ODA2ICogTWF0aC5wb3codCwgNCkgK1xuICAgICAgICAwLjI3ODg2ODA3ICogTWF0aC5wb3codCwgNSkgLVxuICAgICAgICAxLjEzNTIwMzk4ICogTWF0aC5wb3codCwgNikgK1xuICAgICAgICAxLjQ4ODUxNTg3ICogTWF0aC5wb3codCwgNykgLVxuICAgICAgICAwLjgyMjE1MjIzICogTWF0aC5wb3codCwgOCkgK1xuICAgICAgICAwLjE3MDg3Mjc3ICogTWF0aC5wb3codCwgOSkpO1xuICAgIGlmICh4ID49IDApIHtcbiAgICAgICAgcmV0dXJuIDEgLSB0YXU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRhdSAtIDE7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVycm9yRnVuY3Rpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBbRmFjdG9yaWFsXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GYWN0b3JpYWwpLCB1c3VhbGx5IHdyaXR0ZW4gbiEsIGlzIHRoZSBwcm9kdWN0IG9mIGFsbCBwb3NpdGl2ZVxuICogaW50ZWdlcnMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIG4uIE9mdGVuIGZhY3RvcmlhbCBpcyBpbXBsZW1lbnRlZFxuICogcmVjdXJzaXZlbHksIGJ1dCB0aGlzIGl0ZXJhdGl2ZSBhcHByb2FjaCBpcyBzaWduaWZpY2FudGx5IGZhc3RlclxuICogYW5kIHNpbXBsZXIuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG4gaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGZhY3RvcmlhbDogbiFcbiAqIEBleGFtcGxlXG4gKiBjb25zb2xlLmxvZyhmYWN0b3JpYWwoNSkpOyAvLyAxMjBcbiAqL1xuZnVuY3Rpb24gZmFjdG9yaWFsKG4pIHtcblxuICAgIC8vIGZhY3RvcmlhbCBpcyBtYXRoZW1hdGljYWxseSB1bmRlZmluZWQgZm9yIG5lZ2F0aXZlIG51bWJlcnNcbiAgICBpZiAobiA8IDAgKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyB0eXBpY2FsbHkgeW91J2xsIGV4cGFuZCB0aGUgZmFjdG9yaWFsIGZ1bmN0aW9uIGdvaW5nIGRvd24sIGxpa2VcbiAgICAvLyA1ISA9IDUgKiA0ICogMyAqIDIgKiAxLiBUaGlzIGlzIGdvaW5nIGluIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24sXG4gICAgLy8gY291bnRpbmcgZnJvbSAyIHVwIHRvIHRoZSBudW1iZXIgaW4gcXVlc3Rpb24sIGFuZCBzaW5jZSBhbnl0aGluZ1xuICAgIC8vIG11bHRpcGxpZWQgYnkgMSBpcyBpdHNlbGYsIHRoZSBsb29wIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgMi5cbiAgICB2YXIgYWNjdW11bGF0b3IgPSAxO1xuICAgIGZvciAodmFyIGkgPSAyOyBpIDw9IG47IGkrKykge1xuICAgICAgICAvLyBmb3IgZWFjaCBudW1iZXIgdXAgdG8gYW5kIGluY2x1ZGluZyB0aGUgbnVtYmVyIGBuYCwgbXVsdGlwbHlcbiAgICAgICAgLy8gdGhlIGFjY3VtdWxhdG9yIG15IHRoYXQgbnVtYmVyLlxuICAgICAgICBhY2N1bXVsYXRvciAqPSBpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjdW11bGF0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yaWFsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBbR2VvbWV0cmljIE1lYW5dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dlb21ldHJpY19tZWFuKSBpc1xuICogYSBtZWFuIGZ1bmN0aW9uIHRoYXQgaXMgbW9yZSB1c2VmdWwgZm9yIG51bWJlcnMgaW4gZGlmZmVyZW50XG4gKiByYW5nZXMuXG4gKlxuICogVGhpcyBpcyB0aGUgbnRoIHJvb3Qgb2YgdGhlIGlucHV0IG51bWJlcnMgbXVsdGlwbGllZCBieSBlYWNoIG90aGVyLlxuICpcbiAqIFRoZSBnZW9tZXRyaWMgbWVhbiBpcyBvZnRlbiB1c2VmdWwgZm9yXG4gKiAqKltwcm9wb3J0aW9uYWwgZ3Jvd3RoXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HZW9tZXRyaWNfbWVhbiNQcm9wb3J0aW9uYWxfZ3Jvd3RoKSoqOiBnaXZlblxuICogZ3Jvd3RoIHJhdGVzIGZvciBtdWx0aXBsZSB5ZWFycywgbGlrZSBfODAlLCAxNi42NiUgYW5kIDQyLjg1JV8sIGEgc2ltcGxlXG4gKiBtZWFuIHdpbGwgaW5jb3JyZWN0bHkgZXN0aW1hdGUgYW4gYXZlcmFnZSBncm93dGggcmF0ZSwgd2hlcmVhcyBhIGdlb21ldHJpY1xuICogbWVhbiB3aWxsIGNvcnJlY3RseSBlc3RpbWF0ZSBhIGdyb3d0aCByYXRlIHRoYXQsIG92ZXIgdGhvc2UgeWVhcnMsXG4gKiB3aWxsIHlpZWxkIHRoZSBzYW1lIGVuZCB2YWx1ZS5cbiAqXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dCBhcnJheVxuICogQHJldHVybnMge251bWJlcn0gZ2VvbWV0cmljIG1lYW5cbiAqIEBleGFtcGxlXG4gKiB2YXIgZ3Jvd3RoUmF0ZXMgPSBbMS44MCwgMS4xNjY2NjYsIDEuNDI4NTcxXTtcbiAqIHZhciBhdmVyYWdlR3Jvd3RoID0gZ2VvbWV0cmljTWVhbihncm93dGhSYXRlcyk7XG4gKiB2YXIgYXZlcmFnZUdyb3d0aFJhdGVzID0gW2F2ZXJhZ2VHcm93dGgsIGF2ZXJhZ2VHcm93dGgsIGF2ZXJhZ2VHcm93dGhdO1xuICogdmFyIHN0YXJ0aW5nVmFsdWUgPSAxMDtcbiAqIHZhciBzdGFydGluZ1ZhbHVlTWVhbiA9IDEwO1xuICogZ3Jvd3RoUmF0ZXMuZm9yRWFjaChmdW5jdGlvbihyYXRlKSB7XG4gKiAgIHN0YXJ0aW5nVmFsdWUgKj0gcmF0ZTtcbiAqIH0pO1xuICogYXZlcmFnZUdyb3d0aFJhdGVzLmZvckVhY2goZnVuY3Rpb24ocmF0ZSkge1xuICogICBzdGFydGluZ1ZhbHVlTWVhbiAqPSByYXRlO1xuICogfSk7XG4gKiBzdGFydGluZ1ZhbHVlTWVhbiA9PT0gc3RhcnRpbmdWYWx1ZTtcbiAqL1xuZnVuY3Rpb24gZ2VvbWV0cmljTWVhbih4KSB7XG4gICAgLy8gVGhlIG1lYW4gb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyB0aGUgc3RhcnRpbmcgdmFsdWUuXG4gICAgdmFyIHZhbHVlID0gMTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyB0aGUgZ2VvbWV0cmljIG1lYW4gaXMgb25seSB2YWxpZCBmb3IgcG9zaXRpdmUgbnVtYmVyc1xuICAgICAgICBpZiAoeFtpXSA8PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgLy8gcmVwZWF0ZWRseSBtdWx0aXBseSB0aGUgdmFsdWUgYnkgZWFjaCBudW1iZXJcbiAgICAgICAgdmFsdWUgKj0geFtpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5wb3codmFsdWUsIDEgLyB4Lmxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VvbWV0cmljTWVhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgW0hhcm1vbmljIE1lYW5dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhcm1vbmljX21lYW4pIGlzXG4gKiBhIG1lYW4gZnVuY3Rpb24gdHlwaWNhbGx5IHVzZWQgdG8gZmluZCB0aGUgYXZlcmFnZSBvZiByYXRlcy5cbiAqIFRoaXMgbWVhbiBpcyBjYWxjdWxhdGVkIGJ5IHRha2luZyB0aGUgcmVjaXByb2NhbCBvZiB0aGUgYXJpdGhtZXRpYyBtZWFuXG4gKiBvZiB0aGUgcmVjaXByb2NhbHMgb2YgdGhlIGlucHV0IG51bWJlcnMuXG4gKlxuICogVGhpcyBpcyBhIFttZWFzdXJlIG9mIGNlbnRyYWwgdGVuZGVuY3ldKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NlbnRyYWxfdGVuZGVuY3kpOlxuICogYSBtZXRob2Qgb2YgZmluZGluZyBhIHR5cGljYWwgb3IgY2VudHJhbCB2YWx1ZSBvZiBhIHNldCBvZiBudW1iZXJzLlxuICpcbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gaGFybW9uaWMgbWVhblxuICogQGV4YW1wbGVcbiAqIHNzLmhhcm1vbmljTWVhbihbMiwgM10pIC8vPSAyLjRcbiAqL1xuZnVuY3Rpb24gaGFybW9uaWNNZWFuKHgpIHtcbiAgICAvLyBUaGUgbWVhbiBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHZhciByZWNpcHJvY2FsU3VtID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyB0aGUgaGFybW9uaWMgbWVhbiBpcyBvbmx5IHZhbGlkIGZvciBwb3NpdGl2ZSBudW1iZXJzXG4gICAgICAgIGlmICh4W2ldIDw9IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICByZWNpcHJvY2FsU3VtICs9IDEgLyB4W2ldO1xuICAgIH1cblxuICAgIC8vIGRpdmlkZSBuIGJ5IHRoZSB0aGUgcmVjaXByb2NhbCBzdW1cbiAgICByZXR1cm4geC5sZW5ndGggLyByZWNpcHJvY2FsU3VtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhcm1vbmljTWVhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHF1YW50aWxlID0gcmVxdWlyZSgnLi9xdWFudGlsZScpO1xuXG4vKipcbiAqIFRoZSBbSW50ZXJxdWFydGlsZSByYW5nZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JbnRlcnF1YXJ0aWxlX3JhbmdlKSBpc1xuICogYSBtZWFzdXJlIG9mIHN0YXRpc3RpY2FsIGRpc3BlcnNpb24sIG9yIGhvdyBzY2F0dGVyZWQsIHNwcmVhZCwgb3JcbiAqIGNvbmNlbnRyYXRlZCBhIGRpc3RyaWJ1dGlvbiBpcy4gSXQncyBjb21wdXRlZCBhcyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuXG4gKiB0aGUgdGhpcmQgcXVhcnRpbGUgYW5kIGZpcnN0IHF1YXJ0aWxlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gc2FtcGxlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBpbnRlcnF1YXJ0aWxlIHJhbmdlOiB0aGUgc3BhbiBiZXR3ZWVuIGxvd2VyIGFuZCB1cHBlciBxdWFydGlsZSxcbiAqIDAuMjUgYW5kIDAuNzVcbiAqIEBleGFtcGxlXG4gKiBpbnRlcnF1YXJ0aWxlUmFuZ2UoWzAsIDEsIDIsIDNdKTsgLy89IDJcbiAqL1xuZnVuY3Rpb24gaW50ZXJxdWFydGlsZVJhbmdlKHNhbXBsZSkge1xuICAgIC8vIFdlIGNhbid0IGRlcml2ZSBxdWFudGlsZXMgZnJvbSBhbiBlbXB0eSBsaXN0XG4gICAgaWYgKHNhbXBsZS5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIEludGVycXVhcnRpbGUgcmFuZ2UgaXMgdGhlIHNwYW4gYmV0d2VlbiB0aGUgdXBwZXIgcXVhcnRpbGUsXG4gICAgLy8gYXQgYDAuNzVgLCBhbmQgbG93ZXIgcXVhcnRpbGUsIGAwLjI1YFxuICAgIHJldHVybiBxdWFudGlsZShzYW1wbGUsIDAuNzUpIC0gcXVhbnRpbGUoc2FtcGxlLCAwLjI1KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnF1YXJ0aWxlUmFuZ2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIEludmVyc2UgW0dhdXNzaWFuIGVycm9yIGZ1bmN0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Vycm9yX2Z1bmN0aW9uKVxuICogcmV0dXJucyBhIG51bWVyaWNhbCBhcHByb3hpbWF0aW9uIHRvIHRoZSB2YWx1ZSB0aGF0IHdvdWxkIGhhdmUgY2F1c2VkXG4gKiBgZXJyb3JGdW5jdGlvbigpYCB0byByZXR1cm4geC5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geCB2YWx1ZSBvZiBlcnJvciBmdW5jdGlvblxuICogQHJldHVybnMge251bWJlcn0gZXN0aW1hdGVkIGludmVydGVkIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGludmVyc2VFcnJvckZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgYSA9ICg4ICogKE1hdGguUEkgLSAzKSkgLyAoMyAqIE1hdGguUEkgKiAoNCAtIE1hdGguUEkpKTtcblxuICAgIHZhciBpbnYgPSBNYXRoLnNxcnQoTWF0aC5zcXJ0KFxuICAgICAgICBNYXRoLnBvdygyIC8gKE1hdGguUEkgKiBhKSArIE1hdGgubG9nKDEgLSB4ICogeCkgLyAyLCAyKSAtXG4gICAgICAgIE1hdGgubG9nKDEgLSB4ICogeCkgLyBhKSAtXG4gICAgICAgICgyIC8gKE1hdGguUEkgKiBhKSArIE1hdGgubG9nKDEgLSB4ICogeCkgLyAyKSk7XG5cbiAgICBpZiAoeCA+PSAwKSB7XG4gICAgICAgIHJldHVybiBpbnY7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC1pbnY7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludmVyc2VFcnJvckZ1bmN0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFtTaW1wbGUgbGluZWFyIHJlZ3Jlc3Npb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2ltcGxlX2xpbmVhcl9yZWdyZXNzaW9uKVxuICogaXMgYSBzaW1wbGUgd2F5IHRvIGZpbmQgYSBmaXR0ZWQgbGluZVxuICogYmV0d2VlbiBhIHNldCBvZiBjb29yZGluYXRlcy4gVGhpcyBhbGdvcml0aG0gZmluZHMgdGhlIHNsb3BlIGFuZCB5LWludGVyY2VwdCBvZiBhIHJlZ3Jlc3Npb24gbGluZVxuICogdXNpbmcgdGhlIGxlYXN0IHN1bSBvZiBzcXVhcmVzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGRhdGEgYW4gYXJyYXkgb2YgdHdvLWVsZW1lbnQgb2YgYXJyYXlzLFxuICogbGlrZSBgW1swLCAxXSwgWzIsIDNdXWBcbiAqIEByZXR1cm5zIHtPYmplY3R9IG9iamVjdCBjb250YWluaW5nIHNsb3BlIGFuZCBpbnRlcnNlY3Qgb2YgcmVncmVzc2lvbiBsaW5lXG4gKiBAZXhhbXBsZVxuICogbGluZWFyUmVncmVzc2lvbihbWzAsIDBdLCBbMSwgMV1dKTsgLy8geyBtOiAxLCBiOiAwIH1cbiAqL1xuZnVuY3Rpb24gbGluZWFyUmVncmVzc2lvbihkYXRhKSB7XG5cbiAgICB2YXIgbSwgYjtcblxuICAgIC8vIFN0b3JlIGRhdGEgbGVuZ3RoIGluIGEgbG9jYWwgdmFyaWFibGUgdG8gcmVkdWNlXG4gICAgLy8gcmVwZWF0ZWQgb2JqZWN0IHByb3BlcnR5IGxvb2t1cHNcbiAgICB2YXIgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gICAgLy9pZiB0aGVyZSdzIG9ubHkgb25lIHBvaW50LCBhcmJpdHJhcmlseSBjaG9vc2UgYSBzbG9wZSBvZiAwXG4gICAgLy9hbmQgYSB5LWludGVyY2VwdCBvZiB3aGF0ZXZlciB0aGUgeSBvZiB0aGUgaW5pdGlhbCBwb2ludCBpc1xuICAgIGlmIChkYXRhTGVuZ3RoID09PSAxKSB7XG4gICAgICAgIG0gPSAwO1xuICAgICAgICBiID0gZGF0YVswXVsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJbml0aWFsaXplIG91ciBzdW1zIGFuZCBzY29wZSB0aGUgYG1gIGFuZCBgYmBcbiAgICAgICAgLy8gdmFyaWFibGVzIHRoYXQgZGVmaW5lIHRoZSBsaW5lLlxuICAgICAgICB2YXIgc3VtWCA9IDAsIHN1bVkgPSAwLFxuICAgICAgICAgICAgc3VtWFggPSAwLCBzdW1YWSA9IDA7XG5cbiAgICAgICAgLy8gVXNlIGxvY2FsIHZhcmlhYmxlcyB0byBncmFiIHBvaW50IHZhbHVlc1xuICAgICAgICAvLyB3aXRoIG1pbmltYWwgb2JqZWN0IHByb3BlcnR5IGxvb2t1cHNcbiAgICAgICAgdmFyIHBvaW50LCB4LCB5O1xuXG4gICAgICAgIC8vIEdhdGhlciB0aGUgc3VtIG9mIGFsbCB4IHZhbHVlcywgdGhlIHN1bSBvZiBhbGxcbiAgICAgICAgLy8geSB2YWx1ZXMsIGFuZCB0aGUgc3VtIG9mIHheMiBhbmQgKHgqeSkgZm9yIGVhY2hcbiAgICAgICAgLy8gdmFsdWUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEluIG1hdGggbm90YXRpb24sIHRoZXNlIHdvdWxkIGJlIFNTX3gsIFNTX3ksIFNTX3h4LCBhbmQgU1NfeHlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBvaW50ID0gZGF0YVtpXTtcbiAgICAgICAgICAgIHggPSBwb2ludFswXTtcbiAgICAgICAgICAgIHkgPSBwb2ludFsxXTtcblxuICAgICAgICAgICAgc3VtWCArPSB4O1xuICAgICAgICAgICAgc3VtWSArPSB5O1xuXG4gICAgICAgICAgICBzdW1YWCArPSB4ICogeDtcbiAgICAgICAgICAgIHN1bVhZICs9IHggKiB5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYG1gIGlzIHRoZSBzbG9wZSBvZiB0aGUgcmVncmVzc2lvbiBsaW5lXG4gICAgICAgIG0gPSAoKGRhdGFMZW5ndGggKiBzdW1YWSkgLSAoc3VtWCAqIHN1bVkpKSAvXG4gICAgICAgICAgICAoKGRhdGFMZW5ndGggKiBzdW1YWCkgLSAoc3VtWCAqIHN1bVgpKTtcblxuICAgICAgICAvLyBgYmAgaXMgdGhlIHktaW50ZXJjZXB0IG9mIHRoZSBsaW5lLlxuICAgICAgICBiID0gKHN1bVkgLyBkYXRhTGVuZ3RoKSAtICgobSAqIHN1bVgpIC8gZGF0YUxlbmd0aCk7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGJvdGggdmFsdWVzIGFzIGFuIG9iamVjdC5cbiAgICByZXR1cm4ge1xuICAgICAgICBtOiBtLFxuICAgICAgICBiOiBiXG4gICAgfTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVhclJlZ3Jlc3Npb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogR2l2ZW4gdGhlIG91dHB1dCBvZiBgbGluZWFyUmVncmVzc2lvbmA6IGFuIG9iamVjdFxuICogd2l0aCBgbWAgYW5kIGBiYCB2YWx1ZXMgaW5kaWNhdGluZyBzbG9wZSBhbmQgaW50ZXJjZXB0LFxuICogcmVzcGVjdGl2ZWx5LCBnZW5lcmF0ZSBhIGxpbmUgZnVuY3Rpb24gdGhhdCB0cmFuc2xhdGVzXG4gKiB4IHZhbHVlcyBpbnRvIHkgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYiBvYmplY3Qgd2l0aCBgbWAgYW5kIGBiYCBtZW1iZXJzLCByZXByZXNlbnRpbmdcbiAqIHNsb3BlIGFuZCBpbnRlcnNlY3Qgb2YgZGVzaXJlZCBsaW5lXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IG1ldGhvZCB0aGF0IGNvbXB1dGVzIHktdmFsdWUgYXQgYW55IGdpdmVuXG4gKiB4LXZhbHVlIG9uIHRoZSBsaW5lLlxuICogQGV4YW1wbGVcbiAqIHZhciBsID0gbGluZWFyUmVncmVzc2lvbkxpbmUobGluZWFyUmVncmVzc2lvbihbWzAsIDBdLCBbMSwgMV1dKSk7XG4gKiBsKDApIC8vPSAwXG4gKiBsKDIpIC8vPSAyXG4gKi9cbmZ1bmN0aW9uIGxpbmVhclJlZ3Jlc3Npb25MaW5lKG1iKSB7XG4gICAgLy8gUmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBjb21wdXRlcyBhIGB5YCB2YWx1ZSBmb3IgZWFjaFxuICAgIC8vIHggdmFsdWUgaXQgaXMgZ2l2ZW4sIGJhc2VkIG9uIHRoZSB2YWx1ZXMgb2YgYGJgIGFuZCBgYWBcbiAgICAvLyB0aGF0IHdlIGp1c3QgY29tcHV0ZWQuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIG1iLmIgKyAobWIubSAqIHgpO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGluZWFyUmVncmVzc2lvbkxpbmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWRpYW4gPSByZXF1aXJlKCcuL21lZGlhbicpO1xuXG4vKipcbiAqIFRoZSBbTWVkaWFuIEFic29sdXRlIERldmlhdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NZWRpYW5fYWJzb2x1dGVfZGV2aWF0aW9uKSBpc1xuICogYSByb2J1c3QgbWVhc3VyZSBvZiBzdGF0aXN0aWNhbFxuICogZGlzcGVyc2lvbi4gSXQgaXMgbW9yZSByZXNpbGllbnQgdG8gb3V0bGllcnMgdGhhbiB0aGUgc3RhbmRhcmQgZGV2aWF0aW9uLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dCBhcnJheVxuICogQHJldHVybnMge251bWJlcn0gbWVkaWFuIGFic29sdXRlIGRldmlhdGlvblxuICogQGV4YW1wbGVcbiAqIG1hZChbMSwgMSwgMiwgMiwgNCwgNiwgOV0pOyAvLz0gMVxuICovXG5mdW5jdGlvbiBtYWQoeCkge1xuICAgIC8vIFRoZSBtYWQgb2Ygbm90aGluZyBpcyBudWxsXG4gICAgaWYgKCF4IHx8IHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICB2YXIgbWVkaWFuVmFsdWUgPSBtZWRpYW4oeCksXG4gICAgICAgIG1lZGlhbkFic29sdXRlRGV2aWF0aW9ucyA9IFtdO1xuXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgYWJzb2x1dGUgZGV2aWF0aW9ucyBmcm9tIHRoZSBtZWRpYW5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbWVkaWFuQWJzb2x1dGVEZXZpYXRpb25zLnB1c2goTWF0aC5hYnMoeFtpXSAtIG1lZGlhblZhbHVlKSk7XG4gICAgfVxuXG4gICAgLy8gRmluZCB0aGUgbWVkaWFuIHZhbHVlIG9mIHRoYXQgbGlzdFxuICAgIHJldHVybiBtZWRpYW4obWVkaWFuQWJzb2x1dGVEZXZpYXRpb25zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYWQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhpcyBjb21wdXRlcyB0aGUgbWF4aW11bSBudW1iZXIgaW4gYW4gYXJyYXkuXG4gKlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG1heGltdW0gdmFsdWVcbiAqIEBleGFtcGxlXG4gKiBjb25zb2xlLmxvZyhtYXgoWzEsIDIsIDMsIDRdKSk7IC8vIDRcbiAqL1xuZnVuY3Rpb24gbWF4KHgpIHtcbiAgICB2YXIgdmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb2YgdGhpcyBsb29wLCBtYXggaXNcbiAgICAgICAgLy8gdW5kZWZpbmVkIGFuZCBpcyB0aHVzIG1hZGUgdGhlIG1heGltdW0gZWxlbWVudCBpbiB0aGUgYXJyYXlcbiAgICAgICAgaWYgKHhbaV0gPiB2YWx1ZSB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHhbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1heDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN1bSA9IHJlcXVpcmUoJy4vc3VtJyk7XG5cbi8qKlxuICogVGhlIG1lYW4sIF9hbHNvIGtub3duIGFzIGF2ZXJhZ2VfLFxuICogaXMgdGhlIHN1bSBvZiBhbGwgdmFsdWVzIG92ZXIgdGhlIG51bWJlciBvZiB2YWx1ZXMuXG4gKiBUaGlzIGlzIGEgW21lYXN1cmUgb2YgY2VudHJhbCB0ZW5kZW5jeV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2VudHJhbF90ZW5kZW5jeSk6XG4gKiBhIG1ldGhvZCBvZiBmaW5kaW5nIGEgdHlwaWNhbCBvciBjZW50cmFsIHZhbHVlIG9mIGEgc2V0IG9mIG51bWJlcnMuXG4gKlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXQgdmFsdWVzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtZWFuXG4gKiBAZXhhbXBsZVxuICogY29uc29sZS5sb2cobWVhbihbMCwgMTBdKSk7IC8vIDVcbiAqL1xuZnVuY3Rpb24gbWVhbih4KSB7XG4gICAgLy8gVGhlIG1lYW4gb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICByZXR1cm4gc3VtKHgpIC8geC5sZW5ndGg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWVhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG51bWVyaWNTb3J0ID0gcmVxdWlyZSgnLi9udW1lcmljX3NvcnQnKTtcblxuLyoqXG4gKiBUaGUgW21lZGlhbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NZWRpYW4pIGlzXG4gKiB0aGUgbWlkZGxlIG51bWJlciBvZiBhIGxpc3QuIFRoaXMgaXMgb2Z0ZW4gYSBnb29kIGluZGljYXRvciBvZiAndGhlIG1pZGRsZSdcbiAqIHdoZW4gdGhlcmUgYXJlIG91dGxpZXJzIHRoYXQgc2tldyB0aGUgYG1lYW4oKWAgdmFsdWUuXG4gKiBUaGlzIGlzIGEgW21lYXN1cmUgb2YgY2VudHJhbCB0ZW5kZW5jeV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2VudHJhbF90ZW5kZW5jeSk6XG4gKiBhIG1ldGhvZCBvZiBmaW5kaW5nIGEgdHlwaWNhbCBvciBjZW50cmFsIHZhbHVlIG9mIGEgc2V0IG9mIG51bWJlcnMuXG4gKlxuICogVGhlIG1lZGlhbiBpc24ndCBuZWNlc3NhcmlseSBvbmUgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBsaXN0OiB0aGUgdmFsdWVcbiAqIGNhbiBiZSB0aGUgYXZlcmFnZSBvZiB0d28gZWxlbWVudHMgaWYgdGhlIGxpc3QgaGFzIGFuIGV2ZW4gbGVuZ3RoXG4gKiBhbmQgdGhlIHR3byBjZW50cmFsIHZhbHVlcyBhcmUgZGlmZmVyZW50LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gbWVkaWFuIHZhbHVlXG4gKiBAZXhhbXBsZVxuICogdmFyIGluY29tZXMgPSBbMTAsIDIsIDUsIDEwMCwgMiwgMV07XG4gKiBtZWRpYW4oaW5jb21lcyk7IC8vPSAzLjVcbiAqL1xuZnVuY3Rpb24gbWVkaWFuKHgpIHtcbiAgICAvLyBUaGUgbWVkaWFuIG9mIGFuIGVtcHR5IGxpc3QgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gU29ydGluZyB0aGUgYXJyYXkgbWFrZXMgaXQgZWFzeSB0byBmaW5kIHRoZSBjZW50ZXIsIGJ1dFxuICAgIC8vIHVzZSBgLnNsaWNlKClgIHRvIGVuc3VyZSB0aGUgb3JpZ2luYWwgYXJyYXkgYHhgIGlzIG5vdCBtb2RpZmllZFxuICAgIHZhciBzb3J0ZWQgPSBudW1lcmljU29ydCh4KTtcblxuICAgIC8vIElmIHRoZSBsZW5ndGggb2YgdGhlIGxpc3QgaXMgb2RkLCBpdCdzIHRoZSBjZW50cmFsIG51bWJlclxuICAgIGlmIChzb3J0ZWQubGVuZ3RoICUgMiA9PT0gMSkge1xuICAgICAgICByZXR1cm4gc29ydGVkWyhzb3J0ZWQubGVuZ3RoIC0gMSkgLyAyXTtcbiAgICAvLyBPdGhlcndpc2UsIHRoZSBtZWRpYW4gaXMgdGhlIGF2ZXJhZ2Ugb2YgdGhlIHR3byBudW1iZXJzXG4gICAgLy8gYXQgdGhlIGNlbnRlciBvZiB0aGUgbGlzdFxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhID0gc29ydGVkW3NvcnRlZC5sZW5ndGggLyAyIC0gMV07XG4gICAgICAgIHZhciBiID0gc29ydGVkW3NvcnRlZC5sZW5ndGggLyAyXTtcbiAgICAgICAgcmV0dXJuIChhICsgYikgLyAyO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtZWRpYW47XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIG1pbiBpcyB0aGUgbG93ZXN0IG51bWJlciBpbiB0aGUgYXJyYXkuIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtaW5pbXVtIHZhbHVlXG4gKiBAZXhhbXBsZVxuICogbWluKFsxLCA1LCAtMTAsIDEwMCwgMl0pOyAvLyAtMTAwXG4gKi9cbmZ1bmN0aW9uIG1pbih4KSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBPbiB0aGUgZmlyc3QgaXRlcmF0aW9uIG9mIHRoaXMgbG9vcCwgbWluIGlzXG4gICAgICAgIC8vIHVuZGVmaW5lZCBhbmQgaXMgdGh1cyBtYWRlIHRoZSBtaW5pbXVtIGVsZW1lbnQgaW4gdGhlIGFycmF5XG4gICAgICAgIGlmICh4W2ldIDwgdmFsdWUgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSB4W2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtaW47XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogKipNaXhpbioqIHNpbXBsZV9zdGF0aXN0aWNzIHRvIGEgc2luZ2xlIEFycmF5IGluc3RhbmNlIGlmIHByb3ZpZGVkXG4gKiBvciB0aGUgQXJyYXkgbmF0aXZlIG9iamVjdCBpZiBub3QuIFRoaXMgaXMgYW4gb3B0aW9uYWxcbiAqIGZlYXR1cmUgdGhhdCBsZXRzIHlvdSB0cmVhdCBzaW1wbGVfc3RhdGlzdGljcyBhcyBhIG5hdGl2ZSBmZWF0dXJlXG4gKiBvZiBKYXZhc2NyaXB0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcyBzaW1wbGUgc3RhdGlzdGljc1xuICogQHBhcmFtIHtBcnJheX0gW2FycmF5PV0gYSBzaW5nbGUgYXJyYXkgaW5zdGFuY2Ugd2hpY2ggd2lsbCBiZSBhdWdtZW50ZWRcbiAqIHdpdGggdGhlIGV4dHJhIG1ldGhvZHMuIElmIG9taXR0ZWQsIG1peGluIHdpbGwgYXBwbHkgdG8gYWxsIGFycmF5c1xuICogYnkgY2hhbmdpbmcgdGhlIGdsb2JhbCBgQXJyYXkucHJvdG90eXBlYC5cbiAqIEByZXR1cm5zIHsqfSB0aGUgZXh0ZW5kZWQgQXJyYXksIG9yIEFycmF5LnByb3RvdHlwZSBpZiBubyBvYmplY3RcbiAqIGlzIGdpdmVuLlxuICpcbiAqIEBleGFtcGxlXG4gKiB2YXIgbXlOdW1iZXJzID0gWzEsIDIsIDNdO1xuICogbWl4aW4oc3MsIG15TnVtYmVycyk7XG4gKiBjb25zb2xlLmxvZyhteU51bWJlcnMuc3VtKCkpOyAvLyA2XG4gKi9cbmZ1bmN0aW9uIG1peGluKHNzLCBhcnJheSkge1xuICAgIHZhciBzdXBwb3J0ID0gISEoT2JqZWN0LmRlZmluZVByb3BlcnR5ICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKTtcbiAgICAvLyBDb3ZlcmFnZSB0ZXN0aW5nIHdpbGwgbmV2ZXIgdGVzdCB0aGlzIGVycm9yLlxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYgKCFzdXBwb3J0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignd2l0aG91dCBkZWZpbmVQcm9wZXJ0eSwgc2ltcGxlLXN0YXRpc3RpY3MgY2Fubm90IGJlIG1peGVkIGluJyk7XG4gICAgfVxuXG4gICAgLy8gb25seSBtZXRob2RzIHdoaWNoIHdvcmsgb24gYmFzaWMgYXJyYXlzIGluIGEgc2luZ2xlIHN0ZXBcbiAgICAvLyBhcmUgc3VwcG9ydGVkXG4gICAgdmFyIGFycmF5TWV0aG9kcyA9IFsnbWVkaWFuJywgJ3N0YW5kYXJkRGV2aWF0aW9uJywgJ3N1bScsXG4gICAgICAgICdzYW1wbGVTa2V3bmVzcycsXG4gICAgICAgICdtZWFuJywgJ21pbicsICdtYXgnLCAncXVhbnRpbGUnLCAnZ2VvbWV0cmljTWVhbicsXG4gICAgICAgICdoYXJtb25pY01lYW4nLCAncm9vdF9tZWFuX3NxdWFyZSddO1xuXG4gICAgLy8gY3JlYXRlIGEgY2xvc3VyZSB3aXRoIGEgbWV0aG9kIG5hbWUgc28gdGhhdCBhIHJlZmVyZW5jZVxuICAgIC8vIGxpa2UgYGFycmF5TWV0aG9kc1tpXWAgZG9lc24ndCBmb2xsb3cgdGhlIGxvb3AgaW5jcmVtZW50XG4gICAgZnVuY3Rpb24gd3JhcChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gY2FzdCBhbnkgYXJndW1lbnRzIGludG8gYW4gYXJyYXksIHNpbmNlIHRoZXkncmVcbiAgICAgICAgICAgIC8vIG5hdGl2ZWx5IG9iamVjdHNcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAvLyBtYWtlIHRoZSBmaXJzdCBhcmd1bWVudCB0aGUgYXJyYXkgaXRzZWxmXG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgc3MgbWV0aG9kXG4gICAgICAgICAgICByZXR1cm4gc3NbbWV0aG9kXS5hcHBseShzcywgYXJncyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gc2VsZWN0IG9iamVjdCB0byBleHRlbmRcbiAgICB2YXIgZXh0ZW5kaW5nO1xuICAgIGlmIChhcnJheSkge1xuICAgICAgICAvLyBjcmVhdGUgYSBzaGFsbG93IGNvcHkgb2YgdGhlIGFycmF5IHNvIHRoYXQgb3VyIGludGVybmFsXG4gICAgICAgIC8vIG9wZXJhdGlvbnMgZG8gbm90IGNoYW5nZSBpdCBieSByZWZlcmVuY2VcbiAgICAgICAgZXh0ZW5kaW5nID0gYXJyYXkuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBleHRlbmRpbmcgPSBBcnJheS5wcm90b3R5cGU7XG4gICAgfVxuXG4gICAgLy8gZm9yIGVhY2ggYXJyYXkgZnVuY3Rpb24sIGRlZmluZSBhIGZ1bmN0aW9uIHRoYXQgZ2V0c1xuICAgIC8vIHRoZSBhcnJheSBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgLy8gV2UgdXNlIFtkZWZpbmVQcm9wZXJ0eV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvZGVmaW5lUHJvcGVydHkpXG4gICAgLy8gYmVjYXVzZSBpdCBhbGxvd3MgdGhlc2UgcHJvcGVydGllcyB0byBiZSBub24tZW51bWVyYWJsZTpcbiAgICAvLyBgZm9yICh2YXIgaW4geClgIGxvb3BzIHdpbGwgbm90IHJ1biBpbnRvIHByb2JsZW1zIHdpdGggdGhpc1xuICAgIC8vIGltcGxlbWVudGF0aW9uLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlNZXRob2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHRlbmRpbmcsIGFycmF5TWV0aG9kc1tpXSwge1xuICAgICAgICAgICAgdmFsdWU6IHdyYXAoYXJyYXlNZXRob2RzW2ldKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dGVuZGluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtaXhpbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG51bWVyaWNTb3J0ID0gcmVxdWlyZSgnLi9udW1lcmljX3NvcnQnKTtcblxuLyoqXG4gKiBUaGUgW21vZGVdKGh0dHA6Ly9iaXQubHkvVzVLNFl0KSBpcyB0aGUgbnVtYmVyIHRoYXQgYXBwZWFycyBpbiBhIGxpc3QgdGhlIGhpZ2hlc3QgbnVtYmVyIG9mIHRpbWVzLlxuICogVGhlcmUgY2FuIGJlIG11bHRpcGxlIG1vZGVzIGluIGEgbGlzdDogaW4gdGhlIGV2ZW50IG9mIGEgdGllLCB0aGlzXG4gKiBhbGdvcml0aG0gd2lsbCByZXR1cm4gdGhlIG1vc3QgcmVjZW50bHkgc2VlbiBtb2RlLlxuICpcbiAqIFRoaXMgaXMgYSBbbWVhc3VyZSBvZiBjZW50cmFsIHRlbmRlbmN5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DZW50cmFsX3RlbmRlbmN5KTpcbiAqIGEgbWV0aG9kIG9mIGZpbmRpbmcgYSB0eXBpY2FsIG9yIGNlbnRyYWwgdmFsdWUgb2YgYSBzZXQgb2YgbnVtYmVycy5cbiAqXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG1vZGVcbiAqIEBleGFtcGxlXG4gKiBtb2RlKFswLCAwLCAxXSk7IC8vPSAwXG4gKi9cbmZ1bmN0aW9uIG1vZGUoeCkge1xuXG4gICAgLy8gSGFuZGxlIGVkZ2UgY2FzZXM6XG4gICAgLy8gVGhlIG1lZGlhbiBvZiBhbiBlbXB0eSBsaXN0IGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cbiAgICBlbHNlIGlmICh4Lmxlbmd0aCA9PT0gMSkgeyByZXR1cm4geFswXTsgfVxuXG4gICAgLy8gU29ydGluZyB0aGUgYXJyYXkgbGV0cyB1cyBpdGVyYXRlIHRocm91Z2ggaXQgYmVsb3cgYW5kIGJlIHN1cmVcbiAgICAvLyB0aGF0IGV2ZXJ5IHRpbWUgd2Ugc2VlIGEgbmV3IG51bWJlciBpdCdzIG5ldyBhbmQgd2UnbGwgbmV2ZXJcbiAgICAvLyBzZWUgdGhlIHNhbWUgbnVtYmVyIHR3aWNlXG4gICAgdmFyIHNvcnRlZCA9IG51bWVyaWNTb3J0KHgpO1xuXG4gICAgLy8gVGhpcyBhc3N1bWVzIGl0IGlzIGRlYWxpbmcgd2l0aCBhbiBhcnJheSBvZiBzaXplID4gMSwgc2luY2Ugc2l6ZVxuICAgIC8vIDAgYW5kIDEgYXJlIGhhbmRsZWQgaW1tZWRpYXRlbHkuIEhlbmNlIGl0IHN0YXJ0cyBhdCBpbmRleCAxIGluIHRoZVxuICAgIC8vIGFycmF5LlxuICAgIHZhciBsYXN0ID0gc29ydGVkWzBdLFxuICAgICAgICAvLyBzdG9yZSB0aGUgbW9kZSBhcyB3ZSBmaW5kIG5ldyBtb2Rlc1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgLy8gc3RvcmUgaG93IG1hbnkgdGltZXMgd2UndmUgc2VlbiB0aGUgbW9kZVxuICAgICAgICBtYXhTZWVuID0gMCxcbiAgICAgICAgLy8gaG93IG1hbnkgdGltZXMgdGhlIGN1cnJlbnQgY2FuZGlkYXRlIGZvciB0aGUgbW9kZVxuICAgICAgICAvLyBoYXMgYmVlbiBzZWVuXG4gICAgICAgIHNlZW5UaGlzID0gMTtcblxuICAgIC8vIGVuZCBhdCBzb3J0ZWQubGVuZ3RoICsgMSB0byBmaXggdGhlIGNhc2UgaW4gd2hpY2ggdGhlIG1vZGUgaXNcbiAgICAvLyB0aGUgaGlnaGVzdCBudW1iZXIgdGhhdCBvY2N1cnMgaW4gdGhlIHNlcXVlbmNlLiB0aGUgbGFzdCBpdGVyYXRpb25cbiAgICAvLyBjb21wYXJlcyBzb3J0ZWRbaV0sIHdoaWNoIGlzIHVuZGVmaW5lZCwgdG8gdGhlIGhpZ2hlc3QgbnVtYmVyXG4gICAgLy8gaW4gdGhlIHNlcmllc1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgc29ydGVkLmxlbmd0aCArIDE7IGkrKykge1xuICAgICAgICAvLyB3ZSdyZSBzZWVpbmcgYSBuZXcgbnVtYmVyIHBhc3MgYnlcbiAgICAgICAgaWYgKHNvcnRlZFtpXSAhPT0gbGFzdCkge1xuICAgICAgICAgICAgLy8gdGhlIGxhc3QgbnVtYmVyIGlzIHRoZSBuZXcgbW9kZSBzaW5jZSB3ZSBzYXcgaXQgbW9yZVxuICAgICAgICAgICAgLy8gb2Z0ZW4gdGhhbiB0aGUgb2xkIG9uZVxuICAgICAgICAgICAgaWYgKHNlZW5UaGlzID4gbWF4U2Vlbikge1xuICAgICAgICAgICAgICAgIG1heFNlZW4gPSBzZWVuVGhpcztcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGxhc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWVuVGhpcyA9IDE7XG4gICAgICAgICAgICBsYXN0ID0gc29ydGVkW2ldO1xuICAgICAgICAvLyBpZiB0aGlzIGlzbid0IGEgbmV3IG51bWJlciwgaXQncyBvbmUgbW9yZSBvY2N1cnJlbmNlIG9mXG4gICAgICAgIC8vIHRoZSBwb3RlbnRpYWwgbW9kZVxuICAgICAgICB9IGVsc2UgeyBzZWVuVGhpcysrOyB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtb2RlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFNvcnQgYW4gYXJyYXkgb2YgbnVtYmVycyBieSB0aGVpciBudW1lcmljIHZhbHVlLCBlbnN1cmluZyB0aGF0IHRoZVxuICogYXJyYXkgaXMgbm90IGNoYW5nZWQgaW4gcGxhY2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiAuc29ydFxuICogaW4gSmF2YVNjcmlwdCBpcyB0byBzb3J0IGFycmF5cyBhcyBzdHJpbmcgdmFsdWVzXG4gKlxuICogICAgIFsxLCAxMCwgMTIsIDEwMiwgMjBdLnNvcnQoKVxuICogICAgIC8vIG91dHB1dFxuICogICAgIFsxLCAxMCwgMTAyLCAxMiwgMjBdXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBhcnJheSBpbnB1dCBhcnJheVxuICogQHJldHVybiB7QXJyYXk8bnVtYmVyPn0gc29ydGVkIGFycmF5XG4gKiBAcHJpdmF0ZVxuICogQGV4YW1wbGVcbiAqIG51bWVyaWNTb3J0KFszLCAyLCAxXSkgLy8gWzEsIDIsIDNdXG4gKi9cbmZ1bmN0aW9uIG51bWVyaWNTb3J0KGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5XG4gICAgICAgIC8vIGVuc3VyZSB0aGUgYXJyYXkgaXMgY2hhbmdlZCBpbi1wbGFjZVxuICAgICAgICAuc2xpY2UoKVxuICAgICAgICAvLyBjb21wYXJhdG9yIGZ1bmN0aW9uIHRoYXQgdHJlYXRzIGlucHV0IGFzIG51bWVyaWNcbiAgICAgICAgLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBudW1lcmljU29ydDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGlzIGlzIGEgc2luZ2xlLWxheWVyIFtQZXJjZXB0cm9uIENsYXNzaWZpZXJdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUGVyY2VwdHJvbikgdGhhdCB0YWtlc1xuICogYXJyYXlzIG9mIG51bWJlcnMgYW5kIHByZWRpY3RzIHdoZXRoZXIgdGhleSBzaG91bGQgYmUgY2xhc3NpZmllZFxuICogYXMgZWl0aGVyIDAgb3IgMSAobmVnYXRpdmUgb3IgcG9zaXRpdmUgZXhhbXBsZXMpLlxuICogQGNsYXNzXG4gKiBAZXhhbXBsZVxuICogLy8gQ3JlYXRlIHRoZSBtb2RlbFxuICogdmFyIHAgPSBuZXcgUGVyY2VwdHJvbk1vZGVsKCk7XG4gKiAvLyBUcmFpbiB0aGUgbW9kZWwgd2l0aCBpbnB1dCB3aXRoIGEgZGlhZ29uYWwgYm91bmRhcnkuXG4gKiBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICogICAgIHAudHJhaW4oWzEsIDFdLCAxKTtcbiAqICAgICBwLnRyYWluKFswLCAxXSwgMCk7XG4gKiAgICAgcC50cmFpbihbMSwgMF0sIDApO1xuICogICAgIHAudHJhaW4oWzAsIDBdLCAwKTtcbiAqIH1cbiAqIHAucHJlZGljdChbMCwgMF0pOyAvLyAwXG4gKiBwLnByZWRpY3QoWzAsIDFdKTsgLy8gMFxuICogcC5wcmVkaWN0KFsxLCAwXSk7IC8vIDBcbiAqIHAucHJlZGljdChbMSwgMV0pOyAvLyAxXG4gKi9cbmZ1bmN0aW9uIFBlcmNlcHRyb25Nb2RlbCgpIHtcbiAgICAvLyBUaGUgd2VpZ2h0cywgb3IgY29lZmZpY2llbnRzIG9mIHRoZSBtb2RlbDtcbiAgICAvLyB3ZWlnaHRzIGFyZSBvbmx5IHBvcHVsYXRlZCB3aGVuIHRyYWluaW5nIHdpdGggZGF0YS5cbiAgICB0aGlzLndlaWdodHMgPSBbXTtcbiAgICAvLyBUaGUgYmlhcyB0ZXJtLCBvciBpbnRlcmNlcHQ7IGl0IGlzIGFsc28gYSB3ZWlnaHQgYnV0XG4gICAgLy8gaXQncyBzdG9yZWQgc2VwYXJhdGVseSBmb3IgY29udmVuaWVuY2UgYXMgaXQgaXMgYWx3YXlzXG4gICAgLy8gbXVsdGlwbGllZCBieSBvbmUuXG4gICAgdGhpcy5iaWFzID0gMDtcbn1cblxuLyoqXG4gKiAqKlByZWRpY3QqKjogVXNlIGFuIGFycmF5IG9mIGZlYXR1cmVzIHdpdGggdGhlIHdlaWdodCBhcnJheSBhbmQgYmlhc1xuICogdG8gcHJlZGljdCB3aGV0aGVyIGFuIGV4YW1wbGUgaXMgbGFiZWxlZCAwIG9yIDEuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBmZWF0dXJlcyBhbiBhcnJheSBvZiBmZWF0dXJlcyBhcyBudW1iZXJzXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAxIGlmIHRoZSBzY29yZSBpcyBvdmVyIDAsIG90aGVyd2lzZSAwXG4gKi9cblBlcmNlcHRyb25Nb2RlbC5wcm90b3R5cGUucHJlZGljdCA9IGZ1bmN0aW9uKGZlYXR1cmVzKSB7XG5cbiAgICAvLyBPbmx5IHByZWRpY3QgaWYgcHJldmlvdXNseSB0cmFpbmVkXG4gICAgLy8gb24gdGhlIHNhbWUgc2l6ZSBmZWF0dXJlIGFycmF5KHMpLlxuICAgIGlmIChmZWF0dXJlcy5sZW5ndGggIT09IHRoaXMud2VpZ2h0cy5sZW5ndGgpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgc3VtIG9mIGZlYXR1cmVzIHRpbWVzIHdlaWdodHMsXG4gICAgLy8gd2l0aCB0aGUgYmlhcyBhZGRlZCAoaW1wbGljaXRseSB0aW1lcyBvbmUpLlxuICAgIHZhciBzY29yZSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2NvcmUgKz0gdGhpcy53ZWlnaHRzW2ldICogZmVhdHVyZXNbaV07XG4gICAgfVxuICAgIHNjb3JlICs9IHRoaXMuYmlhcztcblxuICAgIC8vIENsYXNzaWZ5IGFzIDEgaWYgdGhlIHNjb3JlIGlzIG92ZXIgMCwgb3RoZXJ3aXNlIDAuXG4gICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG59O1xuXG4vKipcbiAqICoqVHJhaW4qKiB0aGUgY2xhc3NpZmllciB3aXRoIGEgbmV3IGV4YW1wbGUsIHdoaWNoIGlzXG4gKiBhIG51bWVyaWMgYXJyYXkgb2YgZmVhdHVyZXMgYW5kIGEgMCBvciAxIGxhYmVsLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gZmVhdHVyZXMgYW4gYXJyYXkgb2YgZmVhdHVyZXMgYXMgbnVtYmVyc1xuICogQHBhcmFtIHtudW1iZXJ9IGxhYmVsIGVpdGhlciAwIG9yIDFcbiAqIEByZXR1cm5zIHtQZXJjZXB0cm9uTW9kZWx9IHRoaXNcbiAqL1xuUGVyY2VwdHJvbk1vZGVsLnByb3RvdHlwZS50cmFpbiA9IGZ1bmN0aW9uKGZlYXR1cmVzLCBsYWJlbCkge1xuICAgIC8vIFJlcXVpcmUgdGhhdCBvbmx5IGxhYmVscyBvZiAwIG9yIDEgYXJlIGNvbnNpZGVyZWQuXG4gICAgaWYgKGxhYmVsICE9PSAwICYmIGxhYmVsICE9PSAxKSB7IHJldHVybiBudWxsOyB9XG4gICAgLy8gVGhlIGxlbmd0aCBvZiB0aGUgZmVhdHVyZSBhcnJheSBkZXRlcm1pbmVzXG4gICAgLy8gdGhlIGxlbmd0aCBvZiB0aGUgd2VpZ2h0IGFycmF5LlxuICAgIC8vIFRoZSBwZXJjZXB0cm9uIHdpbGwgY29udGludWUgbGVhcm5pbmcgYXMgbG9uZyBhc1xuICAgIC8vIGl0IGtlZXBzIHNlZWluZyBmZWF0dXJlIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGguXG4gICAgLy8gV2hlbiBpdCBzZWVzIGEgbmV3IGRhdGEgc2hhcGUsIGl0IGluaXRpYWxpemVzLlxuICAgIGlmIChmZWF0dXJlcy5sZW5ndGggIT09IHRoaXMud2VpZ2h0cy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy53ZWlnaHRzID0gZmVhdHVyZXM7XG4gICAgICAgIHRoaXMuYmlhcyA9IDE7XG4gICAgfVxuICAgIC8vIE1ha2UgYSBwcmVkaWN0aW9uIGJhc2VkIG9uIGN1cnJlbnQgd2VpZ2h0cy5cbiAgICB2YXIgcHJlZGljdGlvbiA9IHRoaXMucHJlZGljdChmZWF0dXJlcyk7XG4gICAgLy8gVXBkYXRlIHRoZSB3ZWlnaHRzIGlmIHRoZSBwcmVkaWN0aW9uIGlzIHdyb25nLlxuICAgIGlmIChwcmVkaWN0aW9uICE9PSBsYWJlbCkge1xuICAgICAgICB2YXIgZ3JhZGllbnQgPSBsYWJlbCAtIHByZWRpY3Rpb247XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLndlaWdodHNbaV0gKz0gZ3JhZGllbnQgKiBmZWF0dXJlc1tpXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpYXMgKz0gZ3JhZGllbnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQZXJjZXB0cm9uTW9kZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcHNpbG9uID0gcmVxdWlyZSgnLi9lcHNpbG9uJyk7XG52YXIgZmFjdG9yaWFsID0gcmVxdWlyZSgnLi9mYWN0b3JpYWwnKTtcblxuLyoqXG4gKiBUaGUgW1BvaXNzb24gRGlzdHJpYnV0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BvaXNzb25fZGlzdHJpYnV0aW9uKVxuICogaXMgYSBkaXNjcmV0ZSBwcm9iYWJpbGl0eSBkaXN0cmlidXRpb24gdGhhdCBleHByZXNzZXMgdGhlIHByb2JhYmlsaXR5XG4gKiBvZiBhIGdpdmVuIG51bWJlciBvZiBldmVudHMgb2NjdXJyaW5nIGluIGEgZml4ZWQgaW50ZXJ2YWwgb2YgdGltZVxuICogYW5kL29yIHNwYWNlIGlmIHRoZXNlIGV2ZW50cyBvY2N1ciB3aXRoIGEga25vd24gYXZlcmFnZSByYXRlIGFuZFxuICogaW5kZXBlbmRlbnRseSBvZiB0aGUgdGltZSBzaW5jZSB0aGUgbGFzdCBldmVudC5cbiAqXG4gKiBUaGUgUG9pc3NvbiBEaXN0cmlidXRpb24gaXMgY2hhcmFjdGVyaXplZCBieSB0aGUgc3RyaWN0bHkgcG9zaXRpdmVcbiAqIG1lYW4gYXJyaXZhbCBvciBvY2N1cnJlbmNlIHJhdGUsIGDOu2AuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxhbWJkYSBsb2NhdGlvbiBwb2lzc29uIGRpc3RyaWJ1dGlvblxuICogQHJldHVybnMge251bWJlcn0gdmFsdWUgb2YgcG9pc3NvbiBkaXN0cmlidXRpb24gYXQgdGhhdCBwb2ludFxuICovXG5mdW5jdGlvbiBwb2lzc29uRGlzdHJpYnV0aW9uKGxhbWJkYSkge1xuICAgIC8vIENoZWNrIHRoYXQgbGFtYmRhIGlzIHN0cmljdGx5IHBvc2l0aXZlXG4gICAgaWYgKGxhbWJkYSA8PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBvdXIgY3VycmVudCBwbGFjZSBpbiB0aGUgZGlzdHJpYnV0aW9uXG4gICAgdmFyIHggPSAwLFxuICAgICAgICAvLyBhbmQgd2Uga2VlcCB0cmFjayBvZiB0aGUgY3VycmVudCBjdW11bGF0aXZlIHByb2JhYmlsaXR5LCBpblxuICAgICAgICAvLyBvcmRlciB0byBrbm93IHdoZW4gdG8gc3RvcCBjYWxjdWxhdGluZyBjaGFuY2VzLlxuICAgICAgICBjdW11bGF0aXZlUHJvYmFiaWxpdHkgPSAwLFxuICAgICAgICAvLyB0aGUgY2FsY3VsYXRlZCBjZWxscyB0byBiZSByZXR1cm5lZFxuICAgICAgICBjZWxscyA9IHt9O1xuXG4gICAgLy8gVGhpcyBhbGdvcml0aG0gaXRlcmF0ZXMgdGhyb3VnaCBlYWNoIHBvdGVudGlhbCBvdXRjb21lLFxuICAgIC8vIHVudGlsIHRoZSBgY3VtdWxhdGl2ZVByb2JhYmlsaXR5YCBpcyB2ZXJ5IGNsb3NlIHRvIDEsIGF0XG4gICAgLy8gd2hpY2ggcG9pbnQgd2UndmUgZGVmaW5lZCB0aGUgdmFzdCBtYWpvcml0eSBvZiBvdXRjb21lc1xuICAgIGRvIHtcbiAgICAgICAgLy8gYSBbcHJvYmFiaWxpdHkgbWFzcyBmdW5jdGlvbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUHJvYmFiaWxpdHlfbWFzc19mdW5jdGlvbilcbiAgICAgICAgY2VsbHNbeF0gPSAoTWF0aC5wb3coTWF0aC5FLCAtbGFtYmRhKSAqIE1hdGgucG93KGxhbWJkYSwgeCkpIC8gZmFjdG9yaWFsKHgpO1xuICAgICAgICBjdW11bGF0aXZlUHJvYmFiaWxpdHkgKz0gY2VsbHNbeF07XG4gICAgICAgIHgrKztcbiAgICAvLyB3aGVuIHRoZSBjdW11bGF0aXZlUHJvYmFiaWxpdHkgaXMgbmVhcmx5IDEsIHdlJ3ZlIGNhbGN1bGF0ZWRcbiAgICAvLyB0aGUgdXNlZnVsIHJhbmdlIG9mIHRoaXMgZGlzdHJpYnV0aW9uXG4gICAgfSB3aGlsZSAoY3VtdWxhdGl2ZVByb2JhYmlsaXR5IDwgMSAtIGVwc2lsb24pO1xuXG4gICAgcmV0dXJuIGNlbGxzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBvaXNzb25EaXN0cmlidXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlcHNpbG9uID0gcmVxdWlyZSgnLi9lcHNpbG9uJyk7XG52YXIgaW52ZXJzZUVycm9yRnVuY3Rpb24gPSByZXF1aXJlKCcuL2ludmVyc2VfZXJyb3JfZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBUaGUgW1Byb2JpdF0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qcm9iaXQpXG4gKiBpcyB0aGUgaW52ZXJzZSBvZiBjdW11bGF0aXZlU3RkTm9ybWFsUHJvYmFiaWxpdHkoKSxcbiAqIGFuZCBpcyBhbHNvIGtub3duIGFzIHRoZSBub3JtYWwgcXVhbnRpbGUgZnVuY3Rpb24uXG4gKlxuICogSXQgcmV0dXJucyB0aGUgbnVtYmVyIG9mIHN0YW5kYXJkIGRldmlhdGlvbnMgZnJvbSB0aGUgbWVhblxuICogd2hlcmUgdGhlIHAndGggcXVhbnRpbGUgb2YgdmFsdWVzIGNhbiBiZSBmb3VuZCBpbiBhIG5vcm1hbCBkaXN0cmlidXRpb24uXG4gKiBTbywgZm9yIGV4YW1wbGUsIHByb2JpdCgwLjUgKyAwLjY4MjcvMikg4omIIDEgYmVjYXVzZSA2OC4yNyUgb2YgdmFsdWVzIGFyZVxuICogbm9ybWFsbHkgZm91bmQgd2l0aGluIDEgc3RhbmRhcmQgZGV2aWF0aW9uIGFib3ZlIG9yIGJlbG93IHRoZSBtZWFuLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBwXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBwcm9iaXRcbiAqL1xuZnVuY3Rpb24gcHJvYml0KHApIHtcbiAgICBpZiAocCA9PT0gMCkge1xuICAgICAgICBwID0gZXBzaWxvbjtcbiAgICB9IGVsc2UgaWYgKHAgPj0gMSkge1xuICAgICAgICBwID0gMSAtIGVwc2lsb247XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnNxcnQoMikgKiBpbnZlcnNlRXJyb3JGdW5jdGlvbigyICogcCAtIDEpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2JpdDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHF1YW50aWxlU29ydGVkID0gcmVxdWlyZSgnLi9xdWFudGlsZV9zb3J0ZWQnKTtcbnZhciBudW1lcmljU29ydCA9IHJlcXVpcmUoJy4vbnVtZXJpY19zb3J0Jyk7XG5cbi8qKlxuICogVGhlIFtxdWFudGlsZV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUXVhbnRpbGUpOlxuICogdGhpcyBpcyBhIHBvcHVsYXRpb24gcXVhbnRpbGUsIHNpbmNlIHdlIGFzc3VtZSB0byBrbm93IHRoZSBlbnRpcmVcbiAqIGRhdGFzZXQgaW4gdGhpcyBsaWJyYXJ5LiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuICogW1F1YW50aWxlcyBvZiBhIFBvcHVsYXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUXVhbnRpbGUjUXVhbnRpbGVzX29mX2FfcG9wdWxhdGlvbilcbiAqIGFsZ29yaXRobSBmcm9tIHdpa2lwZWRpYS5cbiAqXG4gKiBTYW1wbGUgaXMgYSBvbmUtZGltZW5zaW9uYWwgYXJyYXkgb2YgbnVtYmVycyxcbiAqIGFuZCBwIGlzIGVpdGhlciBhIGRlY2ltYWwgbnVtYmVyIGZyb20gMCB0byAxIG9yIGFuIGFycmF5IG9mIGRlY2ltYWxcbiAqIG51bWJlcnMgZnJvbSAwIHRvIDEuXG4gKiBJbiB0ZXJtcyBvZiBhIGsvcSBxdWFudGlsZSwgcCA9IGsvcSAtIGl0J3MganVzdCBkZWFsaW5nIHdpdGggZnJhY3Rpb25zIG9yIGRlYWxpbmdcbiAqIHdpdGggZGVjaW1hbCB2YWx1ZXMuXG4gKiBXaGVuIHAgaXMgYW4gYXJyYXksIHRoZSByZXN1bHQgb2YgdGhlIGZ1bmN0aW9uIGlzIGFsc28gYW4gYXJyYXkgY29udGFpbmluZyB0aGUgYXBwcm9wcmlhdGVcbiAqIHF1YW50aWxlcyBpbiBpbnB1dCBvcmRlclxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gc2FtcGxlIGEgc2FtcGxlIGZyb20gdGhlIHBvcHVsYXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBwIHRoZSBkZXNpcmVkIHF1YW50aWxlLCBhcyBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDFcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHF1YW50aWxlXG4gKiBAZXhhbXBsZVxuICogdmFyIGRhdGEgPSBbMywgNiwgNywgOCwgOCwgOSwgMTAsIDEzLCAxNSwgMTYsIDIwXTtcbiAqIHF1YW50aWxlKGRhdGEsIDEpOyAvLz0gbWF4KGRhdGEpO1xuICogcXVhbnRpbGUoZGF0YSwgMCk7IC8vPSBtaW4oZGF0YSk7XG4gKiBxdWFudGlsZShkYXRhLCAwLjUpOyAvLz0gOVxuICovXG5mdW5jdGlvbiBxdWFudGlsZShzYW1wbGUsIHApIHtcblxuICAgIC8vIFdlIGNhbid0IGRlcml2ZSBxdWFudGlsZXMgZnJvbSBhbiBlbXB0eSBsaXN0XG4gICAgaWYgKHNhbXBsZS5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIFNvcnQgYSBjb3B5IG9mIHRoZSBhcnJheS4gV2UnbGwgbmVlZCBhIHNvcnRlZCBhcnJheSB0byBpbmRleFxuICAgIC8vIHRoZSB2YWx1ZXMgaW4gc29ydGVkIG9yZGVyLlxuICAgIHZhciBzb3J0ZWQgPSBudW1lcmljU29ydChzYW1wbGUpO1xuXG4gICAgaWYgKHAubGVuZ3RoKSB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIHJlc3VsdCBhcnJheVxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICAvLyBGb3IgZWFjaCByZXF1ZXN0ZWQgcXVhbnRpbGVcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHRzW2ldID0gcXVhbnRpbGVTb3J0ZWQoc29ydGVkLCBwW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcXVhbnRpbGVTb3J0ZWQoc29ydGVkLCBwKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcXVhbnRpbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgaW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgcXVhbnRpbGVzOiB3aGVuIHlvdSBrbm93XG4gKiB0aGF0IHRoZSBvcmRlciBpcyBzb3J0ZWQsIHlvdSBkb24ndCBuZWVkIHRvIHJlLXNvcnQgaXQsIGFuZCB0aGUgY29tcHV0YXRpb25zXG4gKiBhcmUgZmFzdGVyLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gc2FtcGxlIGlucHV0IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwIGRlc2lyZWQgcXVhbnRpbGU6IGEgbnVtYmVyIGJldHdlZW4gMCB0byAxLCBpbmNsdXNpdmVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHF1YW50aWxlIHZhbHVlXG4gKiBAZXhhbXBsZVxuICogdmFyIGRhdGEgPSBbMywgNiwgNywgOCwgOCwgOSwgMTAsIDEzLCAxNSwgMTYsIDIwXTtcbiAqIHF1YW50aWxlU29ydGVkKGRhdGEsIDEpOyAvLz0gbWF4KGRhdGEpO1xuICogcXVhbnRpbGVTb3J0ZWQoZGF0YSwgMCk7IC8vPSBtaW4oZGF0YSk7XG4gKiBxdWFudGlsZVNvcnRlZChkYXRhLCAwLjUpOyAvLz0gOVxuICovXG5mdW5jdGlvbiBxdWFudGlsZVNvcnRlZChzYW1wbGUsIHApIHtcbiAgICB2YXIgaWR4ID0gc2FtcGxlLmxlbmd0aCAqIHA7XG4gICAgaWYgKHAgPCAwIHx8IHAgPiAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gMSkge1xuICAgICAgICAvLyBJZiBwIGlzIDEsIGRpcmVjdGx5IHJldHVybiB0aGUgbGFzdCBlbGVtZW50XG4gICAgICAgIHJldHVybiBzYW1wbGVbc2FtcGxlLmxlbmd0aCAtIDFdO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gMCkge1xuICAgICAgICAvLyBJZiBwIGlzIDAsIGRpcmVjdGx5IHJldHVybiB0aGUgZmlyc3QgZWxlbWVudFxuICAgICAgICByZXR1cm4gc2FtcGxlWzBdO1xuICAgIH0gZWxzZSBpZiAoaWR4ICUgMSAhPT0gMCkge1xuICAgICAgICAvLyBJZiBwIGlzIG5vdCBpbnRlZ2VyLCByZXR1cm4gdGhlIG5leHQgZWxlbWVudCBpbiBhcnJheVxuICAgICAgICByZXR1cm4gc2FtcGxlW01hdGguY2VpbChpZHgpIC0gMV07XG4gICAgfSBlbHNlIGlmIChzYW1wbGUubGVuZ3RoICUgMiA9PT0gMCkge1xuICAgICAgICAvLyBJZiB0aGUgbGlzdCBoYXMgZXZlbi1sZW5ndGgsIHdlJ2xsIHRha2UgdGhlIGF2ZXJhZ2Ugb2YgdGhpcyBudW1iZXJcbiAgICAgICAgLy8gYW5kIHRoZSBuZXh0IHZhbHVlLCBpZiB0aGVyZSBpcyBvbmVcbiAgICAgICAgcmV0dXJuIChzYW1wbGVbaWR4IC0gMV0gKyBzYW1wbGVbaWR4XSkgLyAyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZpbmFsbHksIGluIHRoZSBzaW1wbGUgY2FzZSBvZiBhbiBpbnRlZ2VyIHZhbHVlXG4gICAgICAgIC8vIHdpdGggYW4gb2RkLWxlbmd0aCBsaXN0LCByZXR1cm4gdGhlIHNhbXBsZSB2YWx1ZSBhdCB0aGUgaW5kZXguXG4gICAgICAgIHJldHVybiBzYW1wbGVbaWR4XTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcXVhbnRpbGVTb3J0ZWQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFtSIFNxdWFyZWRdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29lZmZpY2llbnRfb2ZfZGV0ZXJtaW5hdGlvbilcbiAqIHZhbHVlIG9mIGRhdGEgY29tcGFyZWQgd2l0aCBhIGZ1bmN0aW9uIGBmYFxuICogaXMgdGhlIHN1bSBvZiB0aGUgc3F1YXJlZCBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSBwcmVkaWN0aW9uXG4gKiBhbmQgdGhlIGFjdHVhbCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBkYXRhIGlucHV0IGRhdGE6IHRoaXMgc2hvdWxkIGJlIGRvdWJseS1uZXN0ZWRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgZnVuY3Rpb24gY2FsbGVkIG9uIGBbaV1bMF1gIHZhbHVlcyB3aXRoaW4gdGhlIGRhdGFzZXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHItc3F1YXJlZCB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIHZhciBzYW1wbGVzID0gW1swLCAwXSwgWzEsIDFdXTtcbiAqIHZhciByZWdyZXNzaW9uTGluZSA9IGxpbmVhclJlZ3Jlc3Npb25MaW5lKGxpbmVhclJlZ3Jlc3Npb24oc2FtcGxlcykpO1xuICogclNxdWFyZWQoc2FtcGxlcywgcmVncmVzc2lvbkxpbmUpOyAvLz0gMSB0aGlzIGxpbmUgaXMgYSBwZXJmZWN0IGZpdFxuICovXG5mdW5jdGlvbiByU3F1YXJlZChkYXRhLCBmdW5jKSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoIDwgMikgeyByZXR1cm4gMTsgfVxuXG4gICAgLy8gQ29tcHV0ZSB0aGUgYXZlcmFnZSB5IHZhbHVlIGZvciB0aGUgYWN0dWFsXG4gICAgLy8gZGF0YSBzZXQgaW4gb3JkZXIgdG8gY29tcHV0ZSB0aGVcbiAgICAvLyBfdG90YWwgc3VtIG9mIHNxdWFyZXNfXG4gICAgdmFyIHN1bSA9IDAsIGF2ZXJhZ2U7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBkYXRhW2ldWzFdO1xuICAgIH1cbiAgICBhdmVyYWdlID0gc3VtIC8gZGF0YS5sZW5ndGg7XG5cbiAgICAvLyBDb21wdXRlIHRoZSB0b3RhbCBzdW0gb2Ygc3F1YXJlcyAtIHRoZVxuICAgIC8vIHNxdWFyZWQgZGlmZmVyZW5jZSBiZXR3ZWVuIGVhY2ggcG9pbnRcbiAgICAvLyBhbmQgdGhlIGF2ZXJhZ2Ugb2YgYWxsIHBvaW50cy5cbiAgICB2YXIgc3VtT2ZTcXVhcmVzID0gMDtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgc3VtT2ZTcXVhcmVzICs9IE1hdGgucG93KGF2ZXJhZ2UgLSBkYXRhW2pdWzFdLCAyKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5IGVzdGltYXRlIHRoZSBlcnJvcjogdGhlIHNxdWFyZWRcbiAgICAvLyBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGVzdGltYXRlIGFuZCB0aGUgYWN0dWFsIGRhdGFcbiAgICAvLyB2YWx1ZSBhdCBlYWNoIHBvaW50LlxuICAgIHZhciBlcnIgPSAwO1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZGF0YS5sZW5ndGg7IGsrKykge1xuICAgICAgICBlcnIgKz0gTWF0aC5wb3coZGF0YVtrXVsxXSAtIGZ1bmMoZGF0YVtrXVswXSksIDIpO1xuICAgIH1cblxuICAgIC8vIEFzIHRoZSBlcnJvciBncm93cyBsYXJnZXIsIGl0cyByYXRpbyB0byB0aGVcbiAgICAvLyBzdW0gb2Ygc3F1YXJlcyBpbmNyZWFzZXMgYW5kIHRoZSByIHNxdWFyZWRcbiAgICAvLyB2YWx1ZSBncm93cyBsb3dlci5cbiAgICByZXR1cm4gMSAtIGVyciAvIHN1bU9mU3F1YXJlcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByU3F1YXJlZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgUm9vdCBNZWFuIFNxdWFyZSAoUk1TKSBpc1xuICogYSBtZWFuIGZ1bmN0aW9uIHVzZWQgYXMgYSBtZWFzdXJlIG9mIHRoZSBtYWduaXR1ZGUgb2YgYSBzZXRcbiAqIG9mIG51bWJlcnMsIHJlZ2FyZGxlc3Mgb2YgdGhlaXIgc2lnbi5cbiAqIFRoaXMgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSBtZWFuIG9mIHRoZSBzcXVhcmVzIG9mIHRoZVxuICogaW5wdXQgbnVtYmVycy5cbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSByb290IG1lYW4gc3F1YXJlXG4gKiBAZXhhbXBsZVxuICogcm9vdE1lYW5TcXVhcmUoWy0xLCAxLCAtMSwgMV0pOyAvLz0gMVxuICovXG5mdW5jdGlvbiByb290TWVhblNxdWFyZSh4KSB7XG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICB2YXIgc3VtT2ZTcXVhcmVzID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtT2ZTcXVhcmVzICs9IE1hdGgucG93KHhbaV0sIDIpO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLnNxcnQoc3VtT2ZTcXVhcmVzIC8geC5sZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3RNZWFuU3F1YXJlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2h1ZmZsZSA9IHJlcXVpcmUoJy4vc2h1ZmZsZScpO1xuXG4vKipcbiAqIENyZWF0ZSBhIFtzaW1wbGUgcmFuZG9tIHNhbXBsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TaW1wbGVfcmFuZG9tX3NhbXBsZSlcbiAqIGZyb20gYSBnaXZlbiBhcnJheSBvZiBgbmAgZWxlbWVudHMuXG4gKlxuICogVGhlIHNhbXBsZWQgdmFsdWVzIHdpbGwgYmUgaW4gYW55IG9yZGVyLCBub3QgbmVjZXNzYXJpbHkgdGhlIG9yZGVyXG4gKiB0aGV5IGFwcGVhciBpbiB0aGUgaW5wdXQuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgaW5wdXQgYXJyYXkuIGNhbiBjb250YWluIGFueSB0eXBlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBjb3VudCBvZiBob3cgbWFueSBlbGVtZW50cyB0byB0YWtlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmFuZG9tU291cmNlPU1hdGgucmFuZG9tXSBhbiBvcHRpb25hbCBzb3VyY2Ugb2YgZW50cm9weVxuICogaW5zdGVhZCBvZiBNYXRoLnJhbmRvbVxuICogQHJldHVybiB7QXJyYXl9IHN1YnNldCBvZiBuIGVsZW1lbnRzIGluIG9yaWdpbmFsIGFycmF5XG4gKiBAZXhhbXBsZVxuICogdmFyIHZhbHVlcyA9IFsxLCAyLCA0LCA1LCA2LCA3LCA4LCA5XTtcbiAqIHNhbXBsZSh2YWx1ZXMsIDMpOyAvLyByZXR1cm5zIDMgcmFuZG9tIHZhbHVlcywgbGlrZSBbMiwgNSwgOF07XG4gKi9cbmZ1bmN0aW9uIHNhbXBsZShhcnJheSwgbiwgcmFuZG9tU291cmNlKSB7XG4gICAgLy8gc2h1ZmZsZSB0aGUgb3JpZ2luYWwgYXJyYXkgdXNpbmcgYSBmaXNoZXIteWF0ZXMgc2h1ZmZsZVxuICAgIHZhciBzaHVmZmxlZCA9IHNodWZmbGUoYXJyYXksIHJhbmRvbVNvdXJjZSk7XG5cbiAgICAvLyBhbmQgdGhlbiByZXR1cm4gYSBzdWJzZXQgb2YgaXQgLSB0aGUgZmlyc3QgYG5gIGVsZW1lbnRzLlxuICAgIHJldHVybiBzaHVmZmxlZC5zbGljZSgwLCBuKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW1wbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzYW1wbGVDb3ZhcmlhbmNlID0gcmVxdWlyZSgnLi9zYW1wbGVfY292YXJpYW5jZScpO1xudmFyIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uID0gcmVxdWlyZSgnLi9zYW1wbGVfc3RhbmRhcmRfZGV2aWF0aW9uJyk7XG5cbi8qKlxuICogVGhlIFtjb3JyZWxhdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db3JyZWxhdGlvbl9hbmRfZGVwZW5kZW5jZSkgaXNcbiAqIGEgbWVhc3VyZSBvZiBob3cgY29ycmVsYXRlZCB0d28gZGF0YXNldHMgYXJlLCBiZXR3ZWVuIC0xIGFuZCAxXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGZpcnN0IGlucHV0XG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHkgc2Vjb25kIGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzYW1wbGUgY29ycmVsYXRpb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgYSA9IFsxLCAyLCAzLCA0LCA1LCA2XTtcbiAqIHZhciBiID0gWzIsIDIsIDMsIDQsIDUsIDYwXTtcbiAqIHNhbXBsZUNvcnJlbGF0aW9uKGEsIGIpOyAvLz0gMC42OTFcbiAqL1xuZnVuY3Rpb24gc2FtcGxlQ29ycmVsYXRpb24oeCwgeSkge1xuICAgIHZhciBjb3YgPSBzYW1wbGVDb3ZhcmlhbmNlKHgsIHkpLFxuICAgICAgICB4c3RkID0gc2FtcGxlU3RhbmRhcmREZXZpYXRpb24oeCksXG4gICAgICAgIHlzdGQgPSBzYW1wbGVTdGFuZGFyZERldmlhdGlvbih5KTtcblxuICAgIGlmIChjb3YgPT09IG51bGwgfHwgeHN0ZCA9PT0gbnVsbCB8fCB5c3RkID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjb3YgLyB4c3RkIC8geXN0ZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW1wbGVDb3JyZWxhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lYW4gPSByZXF1aXJlKCcuL21lYW4nKTtcblxuLyoqXG4gKiBbU2FtcGxlIGNvdmFyaWFuY2VdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NhbXBsZV9tZWFuX2FuZF9zYW1wbGVDb3ZhcmlhbmNlKSBvZiB0d28gZGF0YXNldHM6XG4gKiBob3cgbXVjaCBkbyB0aGUgdHdvIGRhdGFzZXRzIG1vdmUgdG9nZXRoZXI/XG4gKiB4IGFuZCB5IGFyZSB0d28gZGF0YXNldHMsIHJlcHJlc2VudGVkIGFzIGFycmF5cyBvZiBudW1iZXJzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBmaXJzdCBpbnB1dFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB5IHNlY29uZCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gc2FtcGxlIGNvdmFyaWFuY2VcbiAqIEBleGFtcGxlXG4gKiB2YXIgeCA9IFsxLCAyLCAzLCA0LCA1LCA2XTtcbiAqIHZhciB5ID0gWzYsIDUsIDQsIDMsIDIsIDFdO1xuICogc2FtcGxlQ292YXJpYW5jZSh4LCB5KTsgLy89IC0zLjVcbiAqL1xuZnVuY3Rpb24gc2FtcGxlQ292YXJpYW5jZSh4LCB5KSB7XG5cbiAgICAvLyBUaGUgdHdvIGRhdGFzZXRzIG11c3QgaGF2ZSB0aGUgc2FtZSBsZW5ndGggd2hpY2ggbXVzdCBiZSBtb3JlIHRoYW4gMVxuICAgIGlmICh4Lmxlbmd0aCA8PSAxIHx8IHgubGVuZ3RoICE9PSB5Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBkZXRlcm1pbmUgdGhlIG1lYW4gb2YgZWFjaCBkYXRhc2V0IHNvIHRoYXQgd2UgY2FuIGp1ZGdlIGVhY2hcbiAgICAvLyB2YWx1ZSBvZiB0aGUgZGF0YXNldCBmYWlybHkgYXMgdGhlIGRpZmZlcmVuY2UgZnJvbSB0aGUgbWVhbi4gdGhpc1xuICAgIC8vIHdheSwgaWYgb25lIGRhdGFzZXQgaXMgWzEsIDIsIDNdIGFuZCBbMiwgMywgNF0sIHRoZWlyIGNvdmFyaWFuY2VcbiAgICAvLyBkb2VzIG5vdCBzdWZmZXIgYmVjYXVzZSBvZiB0aGUgZGlmZmVyZW5jZSBpbiBhYnNvbHV0ZSB2YWx1ZXNcbiAgICB2YXIgeG1lYW4gPSBtZWFuKHgpLFxuICAgICAgICB5bWVhbiA9IG1lYW4oeSksXG4gICAgICAgIHN1bSA9IDA7XG5cbiAgICAvLyBmb3IgZWFjaCBwYWlyIG9mIHZhbHVlcywgdGhlIGNvdmFyaWFuY2UgaW5jcmVhc2VzIHdoZW4gdGhlaXJcbiAgICAvLyBkaWZmZXJlbmNlIGZyb20gdGhlIG1lYW4gaXMgYXNzb2NpYXRlZCAtIGlmIGJvdGggYXJlIHdlbGwgYWJvdmVcbiAgICAvLyBvciBpZiBib3RoIGFyZSB3ZWxsIGJlbG93XG4gICAgLy8gdGhlIG1lYW4sIHRoZSBjb3ZhcmlhbmNlIGluY3JlYXNlcyBzaWduaWZpY2FudGx5LlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdW0gKz0gKHhbaV0gLSB4bWVhbikgKiAoeVtpXSAtIHltZWFuKTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIGlzIEJlc3NlbHMnIENvcnJlY3Rpb246IGFuIGFkanVzdG1lbnQgbWFkZSB0byBzYW1wbGUgc3RhdGlzdGljc1xuICAgIC8vIHRoYXQgYWxsb3dzIGZvciB0aGUgcmVkdWNlZCBkZWdyZWUgb2YgZnJlZWRvbSBlbnRhaWxlZCBpbiBjYWxjdWxhdGluZ1xuICAgIC8vIHZhbHVlcyBmcm9tIHNhbXBsZXMgcmF0aGVyIHRoYW4gY29tcGxldGUgcG9wdWxhdGlvbnMuXG4gICAgdmFyIGJlc3NlbHNDb3JyZWN0aW9uID0geC5sZW5ndGggLSAxO1xuXG4gICAgLy8gdGhlIGNvdmFyaWFuY2UgaXMgd2VpZ2h0ZWQgYnkgdGhlIGxlbmd0aCBvZiB0aGUgZGF0YXNldHMuXG4gICAgcmV0dXJuIHN1bSAvIGJlc3NlbHNDb3JyZWN0aW9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhbXBsZUNvdmFyaWFuY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdW1OdGhQb3dlckRldmlhdGlvbnMgPSByZXF1aXJlKCcuL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucycpO1xudmFyIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uID0gcmVxdWlyZSgnLi9zYW1wbGVfc3RhbmRhcmRfZGV2aWF0aW9uJyk7XG5cbi8qKlxuICogW1NrZXduZXNzXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NrZXduZXNzKSBpc1xuICogYSBtZWFzdXJlIG9mIHRoZSBleHRlbnQgdG8gd2hpY2ggYSBwcm9iYWJpbGl0eSBkaXN0cmlidXRpb24gb2YgYVxuICogcmVhbC12YWx1ZWQgcmFuZG9tIHZhcmlhYmxlIFwibGVhbnNcIiB0byBvbmUgc2lkZSBvZiB0aGUgbWVhbi5cbiAqIFRoZSBza2V3bmVzcyB2YWx1ZSBjYW4gYmUgcG9zaXRpdmUgb3IgbmVnYXRpdmUsIG9yIGV2ZW4gdW5kZWZpbmVkLlxuICpcbiAqIEltcGxlbWVudGF0aW9uIGlzIGJhc2VkIG9uIHRoZSBhZGp1c3RlZCBGaXNoZXItUGVhcnNvbiBzdGFuZGFyZGl6ZWRcbiAqIG1vbWVudCBjb2VmZmljaWVudCwgd2hpY2ggaXMgdGhlIHZlcnNpb24gZm91bmQgaW4gRXhjZWwgYW5kIHNldmVyYWxcbiAqIHN0YXRpc3RpY2FsIHBhY2thZ2VzIGluY2x1ZGluZyBNaW5pdGFiLCBTQVMgYW5kIFNQU1MuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzYW1wbGUgc2tld25lc3NcbiAqIEBleGFtcGxlXG4gKiB2YXIgZGF0YSA9IFsyLCA0LCA2LCAzLCAxXTtcbiAqIHNhbXBsZVNrZXduZXNzKGRhdGEpOyAvLz0gMC41OTAxMjg2NTY0XG4gKi9cbmZ1bmN0aW9uIHNhbXBsZVNrZXduZXNzKHgpIHtcbiAgICAvLyBUaGUgc2tld25lc3Mgb2YgbGVzcyB0aGFuIHRocmVlIGFyZ3VtZW50cyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoIDwgMykgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgdmFyIG4gPSB4Lmxlbmd0aCxcbiAgICAgICAgY3ViZWRTID0gTWF0aC5wb3coc2FtcGxlU3RhbmRhcmREZXZpYXRpb24oeCksIDMpLFxuICAgICAgICBzdW1DdWJlZERldmlhdGlvbnMgPSBzdW1OdGhQb3dlckRldmlhdGlvbnMoeCwgMyk7XG5cbiAgICByZXR1cm4gbiAqIHN1bUN1YmVkRGV2aWF0aW9ucyAvICgobiAtIDEpICogKG4gLSAyKSAqIGN1YmVkUyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2FtcGxlU2tld25lc3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzYW1wbGVWYXJpYW5jZSA9IHJlcXVpcmUoJy4vc2FtcGxlX3ZhcmlhbmNlJyk7XG5cbi8qKlxuICogVGhlIFtzdGFuZGFyZCBkZXZpYXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3RhbmRhcmRfZGV2aWF0aW9uKVxuICogaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YXJpYW5jZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXQgYXJyYXlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHNhbXBsZSBzdGFuZGFyZCBkZXZpYXRpb25cbiAqIEBleGFtcGxlXG4gKiBzcy5zYW1wbGVTdGFuZGFyZERldmlhdGlvbihbMiwgNCwgNCwgNCwgNSwgNSwgNywgOV0pO1xuICogLy89IDIuMTM4XG4gKi9cbmZ1bmN0aW9uIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uKHgpIHtcbiAgICAvLyBUaGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA8PSAxKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KHNhbXBsZVZhcmlhbmNlKHgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW1wbGVTdGFuZGFyZERldmlhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN1bU50aFBvd2VyRGV2aWF0aW9ucyA9IHJlcXVpcmUoJy4vc3VtX250aF9wb3dlcl9kZXZpYXRpb25zJyk7XG5cbi8qXG4gKiBUaGUgW3NhbXBsZSB2YXJpYW5jZV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVmFyaWFuY2UjU2FtcGxlX3ZhcmlhbmNlKVxuICogaXMgdGhlIHN1bSBvZiBzcXVhcmVkIGRldmlhdGlvbnMgZnJvbSB0aGUgbWVhbi4gVGhlIHNhbXBsZSB2YXJpYW5jZVxuICogaXMgZGlzdGluZ3Vpc2hlZCBmcm9tIHRoZSB2YXJpYW5jZSBieSB0aGUgdXNhZ2Ugb2YgW0Jlc3NlbCdzIENvcnJlY3Rpb25dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jlc3NlbCdzX2NvcnJlY3Rpb24pOlxuICogaW5zdGVhZCBvZiBkaXZpZGluZyB0aGUgc3VtIG9mIHNxdWFyZWQgZGV2aWF0aW9ucyBieSB0aGUgbGVuZ3RoIG9mIHRoZSBpbnB1dCxcbiAqIGl0IGlzIGRpdmlkZWQgYnkgdGhlIGxlbmd0aCBtaW51cyBvbmUuIFRoaXMgY29ycmVjdHMgdGhlIGJpYXMgaW4gZXN0aW1hdGluZ1xuICogYSB2YWx1ZSBmcm9tIGEgc2V0IHRoYXQgeW91IGRvbid0IGtub3cgaWYgZnVsbC5cbiAqXG4gKiBSZWZlcmVuY2VzOlxuICogKiBbV29sZnJhbSBNYXRoV29ybGQgb24gU2FtcGxlIFZhcmlhbmNlXShodHRwOi8vbWF0aHdvcmxkLndvbGZyYW0uY29tL1NhbXBsZVZhcmlhbmNlLmh0bWwpXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0IGFycmF5XG4gKiBAcmV0dXJuIHtudW1iZXJ9IHNhbXBsZSB2YXJpYW5jZVxuICogQGV4YW1wbGVcbiAqIHNhbXBsZVZhcmlhbmNlKFsxLCAyLCAzLCA0LCA1XSk7IC8vPSAyLjVcbiAqL1xuZnVuY3Rpb24gc2FtcGxlVmFyaWFuY2UoeCkge1xuICAgIC8vIFRoZSB2YXJpYW5jZSBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPD0gMSkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgdmFyIHN1bVNxdWFyZWREZXZpYXRpb25zVmFsdWUgPSBzdW1OdGhQb3dlckRldmlhdGlvbnMoeCwgMik7XG5cbiAgICAvLyB0aGlzIGlzIEJlc3NlbHMnIENvcnJlY3Rpb246IGFuIGFkanVzdG1lbnQgbWFkZSB0byBzYW1wbGUgc3RhdGlzdGljc1xuICAgIC8vIHRoYXQgYWxsb3dzIGZvciB0aGUgcmVkdWNlZCBkZWdyZWUgb2YgZnJlZWRvbSBlbnRhaWxlZCBpbiBjYWxjdWxhdGluZ1xuICAgIC8vIHZhbHVlcyBmcm9tIHNhbXBsZXMgcmF0aGVyIHRoYW4gY29tcGxldGUgcG9wdWxhdGlvbnMuXG4gICAgdmFyIGJlc3NlbHNDb3JyZWN0aW9uID0geC5sZW5ndGggLSAxO1xuXG4gICAgLy8gRmluZCB0aGUgbWVhbiB2YWx1ZSBvZiB0aGF0IGxpc3RcbiAgICByZXR1cm4gc3VtU3F1YXJlZERldmlhdGlvbnNWYWx1ZSAvIGJlc3NlbHNDb3JyZWN0aW9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhbXBsZVZhcmlhbmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2h1ZmZsZUluUGxhY2UgPSByZXF1aXJlKCcuL3NodWZmbGVfaW5fcGxhY2UnKTtcblxuLypcbiAqIEEgW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlciVFMiU4MCU5M1lhdGVzX3NodWZmbGUpXG4gKiBpcyBhIGZhc3Qgd2F5IHRvIGNyZWF0ZSBhIHJhbmRvbSBwZXJtdXRhdGlvbiBvZiBhIGZpbml0ZSBzZXQuIFRoaXMgaXNcbiAqIGEgZnVuY3Rpb24gYXJvdW5kIGBzaHVmZmxlX2luX3BsYWNlYCB0aGF0IGFkZHMgdGhlIGd1YXJhbnRlZSB0aGF0XG4gKiBpdCB3aWxsIG5vdCBtb2RpZnkgaXRzIGlucHV0LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNhbXBsZSBhbiBhcnJheSBvZiBhbnkga2luZCBvZiBlbGVtZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmFuZG9tU291cmNlPU1hdGgucmFuZG9tXSBhbiBvcHRpb25hbCBlbnRyb3B5IHNvdXJjZVxuICogQHJldHVybiB7QXJyYXl9IHNodWZmbGVkIHZlcnNpb24gb2YgaW5wdXRcbiAqIEBleGFtcGxlXG4gKiB2YXIgc2h1ZmZsZWQgPSBzaHVmZmxlKFsxLCAyLCAzLCA0XSk7XG4gKiBzaHVmZmxlZDsgLy8gPSBbMiwgMywgMSwgNF0gb3IgYW55IG90aGVyIHJhbmRvbSBwZXJtdXRhdGlvblxuICovXG5mdW5jdGlvbiBzaHVmZmxlKHNhbXBsZSwgcmFuZG9tU291cmNlKSB7XG4gICAgLy8gc2xpY2UgdGhlIG9yaWdpbmFsIGFycmF5IHNvIHRoYXQgaXQgaXMgbm90IG1vZGlmaWVkXG4gICAgc2FtcGxlID0gc2FtcGxlLnNsaWNlKCk7XG5cbiAgICAvLyBhbmQgdGhlbiBzaHVmZmxlIHRoYXQgc2hhbGxvdy1jb3BpZWQgYXJyYXksIGluIHBsYWNlXG4gICAgcmV0dXJuIHNodWZmbGVJblBsYWNlKHNhbXBsZS5zbGljZSgpLCByYW5kb21Tb3VyY2UpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNodWZmbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qXG4gKiBBIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXIlRTIlODAlOTNZYXRlc19zaHVmZmxlKVxuICogaW4tcGxhY2UgLSB3aGljaCBtZWFucyB0aGF0IGl0ICoqd2lsbCBjaGFuZ2UgdGhlIG9yZGVyIG9mIHRoZSBvcmlnaW5hbFxuICogYXJyYXkgYnkgcmVmZXJlbmNlKiouXG4gKlxuICogVGhpcyBpcyBhbiBhbGdvcml0aG0gdGhhdCBnZW5lcmF0ZXMgYSByYW5kb20gW3Blcm11dGF0aW9uXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9QZXJtdXRhdGlvbilcbiAqIG9mIGEgc2V0LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNhbXBsZSBpbnB1dCBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3JhbmRvbVNvdXJjZT1NYXRoLnJhbmRvbV0gYW4gb3B0aW9uYWwgc291cmNlIG9mIGVudHJvcHlcbiAqIEByZXR1cm5zIHtBcnJheX0gc2FtcGxlXG4gKiBAZXhhbXBsZVxuICogdmFyIHNhbXBsZSA9IFsxLCAyLCAzLCA0XTtcbiAqIHNodWZmbGVJblBsYWNlKHNhbXBsZSk7XG4gKiAvLyBzYW1wbGUgaXMgc2h1ZmZsZWQgdG8gYSB2YWx1ZSBsaWtlIFsyLCAxLCA0LCAzXVxuICovXG5mdW5jdGlvbiBzaHVmZmxlSW5QbGFjZShzYW1wbGUsIHJhbmRvbVNvdXJjZSkge1xuXG4gICAgLy8gYSBjdXN0b20gcmFuZG9tIG51bWJlciBzb3VyY2UgY2FuIGJlIHByb3ZpZGVkIGlmIHlvdSB3YW50IHRvIHVzZVxuICAgIC8vIGEgZml4ZWQgc2VlZCBvciBhbm90aGVyIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yLCBsaWtlXG4gICAgLy8gW3JhbmRvbS1qc10oaHR0cHM6Ly93d3cubnBtanMub3JnL3BhY2thZ2UvcmFuZG9tLWpzKVxuICAgIHJhbmRvbVNvdXJjZSA9IHJhbmRvbVNvdXJjZSB8fCBNYXRoLnJhbmRvbTtcblxuICAgIC8vIHN0b3JlIHRoZSBjdXJyZW50IGxlbmd0aCBvZiB0aGUgc2FtcGxlIHRvIGRldGVybWluZVxuICAgIC8vIHdoZW4gbm8gZWxlbWVudHMgcmVtYWluIHRvIHNodWZmbGUuXG4gICAgdmFyIGxlbmd0aCA9IHNhbXBsZS5sZW5ndGg7XG5cbiAgICAvLyB0ZW1wb3JhcnkgaXMgdXNlZCB0byBob2xkIGFuIGl0ZW0gd2hlbiBpdCBpcyBiZWluZ1xuICAgIC8vIHN3YXBwZWQgYmV0d2VlbiBpbmRpY2VzLlxuICAgIHZhciB0ZW1wb3Jhcnk7XG5cbiAgICAvLyBUaGUgaW5kZXggdG8gc3dhcCBhdCBlYWNoIHN0YWdlLlxuICAgIHZhciBpbmRleDtcblxuICAgIC8vIFdoaWxlIHRoZXJlIGFyZSBzdGlsbCBpdGVtcyB0byBzaHVmZmxlXG4gICAgd2hpbGUgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gY2hvc2UgYSByYW5kb20gaW5kZXggd2l0aGluIHRoZSBzdWJzZXQgb2YgdGhlIGFycmF5XG4gICAgICAgIC8vIHRoYXQgaXMgbm90IHlldCBzaHVmZmxlZFxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IocmFuZG9tU291cmNlKCkgKiBsZW5ndGgtLSk7XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHZhbHVlIHRoYXQgd2UnbGwgbW92ZSB0ZW1wb3JhcmlseVxuICAgICAgICB0ZW1wb3JhcnkgPSBzYW1wbGVbbGVuZ3RoXTtcblxuICAgICAgICAvLyBzd2FwIHRoZSB2YWx1ZSBhdCBgc2FtcGxlW2xlbmd0aF1gIHdpdGggYHNhbXBsZVtpbmRleF1gXG4gICAgICAgIHNhbXBsZVtsZW5ndGhdID0gc2FtcGxlW2luZGV4XTtcbiAgICAgICAgc2FtcGxlW2luZGV4XSA9IHRlbXBvcmFyeTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2FtcGxlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNodWZmbGVJblBsYWNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEZvciBhIHNvcnRlZCBpbnB1dCwgY291bnRpbmcgdGhlIG51bWJlciBvZiB1bmlxdWUgdmFsdWVzXG4gKiBpcyBwb3NzaWJsZSBpbiBjb25zdGFudCB0aW1lIGFuZCBjb25zdGFudCBtZW1vcnkuIFRoaXMgaXNcbiAqIGEgc2ltcGxlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBhbGdvcml0aG0uXG4gKlxuICogVmFsdWVzIGFyZSBjb21wYXJlZCB3aXRoIGA9PT1gLCBzbyBvYmplY3RzIGFuZCBub24tcHJpbWl0aXZlIG9iamVjdHNcbiAqIGFyZSBub3QgaGFuZGxlZCBpbiBhbnkgc3BlY2lhbCB3YXkuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gaW5wdXQgYW4gYXJyYXkgb2YgcHJpbWl0aXZlIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGNvdW50IG9mIHVuaXF1ZSB2YWx1ZXNcbiAqIEBleGFtcGxlXG4gKiBzb3J0ZWRVbmlxdWVDb3VudChbMSwgMiwgM10pOyAvLyAzXG4gKiBzb3J0ZWRVbmlxdWVDb3VudChbMSwgMSwgMV0pOyAvLyAxXG4gKi9cbmZ1bmN0aW9uIHNvcnRlZFVuaXF1ZUNvdW50KGlucHV0KSB7XG4gICAgdmFyIHVuaXF1ZVZhbHVlQ291bnQgPSAwLFxuICAgICAgICBsYXN0U2VlblZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaW5wdXRbaV0gIT09IGxhc3RTZWVuVmFsdWUpIHtcbiAgICAgICAgICAgIGxhc3RTZWVuVmFsdWUgPSBpbnB1dFtpXTtcbiAgICAgICAgICAgIHVuaXF1ZVZhbHVlQ291bnQrKztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5pcXVlVmFsdWVDb3VudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzb3J0ZWRVbmlxdWVDb3VudDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZhcmlhbmNlID0gcmVxdWlyZSgnLi92YXJpYW5jZScpO1xuXG4vKipcbiAqIFRoZSBbc3RhbmRhcmQgZGV2aWF0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0YW5kYXJkX2RldmlhdGlvbilcbiAqIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFyaWFuY2UuIEl0J3MgdXNlZnVsIGZvciBtZWFzdXJpbmcgdGhlIGFtb3VudFxuICogb2YgdmFyaWF0aW9uIG9yIGRpc3BlcnNpb24gaW4gYSBzZXQgb2YgdmFsdWVzLlxuICpcbiAqIFN0YW5kYXJkIGRldmlhdGlvbiBpcyBvbmx5IGFwcHJvcHJpYXRlIGZvciBmdWxsLXBvcHVsYXRpb24ga25vd2xlZGdlOiBmb3JcbiAqIHNhbXBsZXMgb2YgYSBwb3B1bGF0aW9uLCB7QGxpbmsgc2FtcGxlU3RhbmRhcmREZXZpYXRpb259IGlzXG4gKiBtb3JlIGFwcHJvcHJpYXRlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gc3RhbmRhcmQgZGV2aWF0aW9uXG4gKiBAZXhhbXBsZVxuICogdmFyIHNjb3JlcyA9IFsyLCA0LCA0LCA0LCA1LCA1LCA3LCA5XTtcbiAqIHZhcmlhbmNlKHNjb3Jlcyk7IC8vPSA0XG4gKiBzdGFuZGFyZERldmlhdGlvbihzY29yZXMpOyAvLz0gMlxuICovXG5mdW5jdGlvbiBzdGFuZGFyZERldmlhdGlvbih4KSB7XG4gICAgLy8gVGhlIHN0YW5kYXJkIGRldmlhdGlvbiBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiBNYXRoLnNxcnQodmFyaWFuY2UoeCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YW5kYXJkRGV2aWF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU1FSVF8yUEkgPSBNYXRoLnNxcnQoMiAqIE1hdGguUEkpO1xuXG5mdW5jdGlvbiBjdW11bGF0aXZlRGlzdHJpYnV0aW9uKHopIHtcbiAgICB2YXIgc3VtID0geixcbiAgICAgICAgdG1wID0gejtcblxuICAgIC8vIDE1IGl0ZXJhdGlvbnMgYXJlIGVub3VnaCBmb3IgNC1kaWdpdCBwcmVjaXNpb25cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IDE1OyBpKyspIHtcbiAgICAgICAgdG1wICo9IHogKiB6IC8gKDIgKiBpICsgMSk7XG4gICAgICAgIHN1bSArPSB0bXA7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnJvdW5kKCgwLjUgKyAoc3VtIC8gU1FSVF8yUEkpICogTWF0aC5leHAoLXogKiB6IC8gMikpICogMWU0KSAvIDFlNDtcbn1cblxuLyoqXG4gKiBBIHN0YW5kYXJkIG5vcm1hbCB0YWJsZSwgYWxzbyBjYWxsZWQgdGhlIHVuaXQgbm9ybWFsIHRhYmxlIG9yIFogdGFibGUsXG4gKiBpcyBhIG1hdGhlbWF0aWNhbCB0YWJsZSBmb3IgdGhlIHZhbHVlcyBvZiDOpiAocGhpKSwgd2hpY2ggYXJlIHRoZSB2YWx1ZXMgb2ZcbiAqIHRoZSBjdW11bGF0aXZlIGRpc3RyaWJ1dGlvbiBmdW5jdGlvbiBvZiB0aGUgbm9ybWFsIGRpc3RyaWJ1dGlvbi5cbiAqIEl0IGlzIHVzZWQgdG8gZmluZCB0aGUgcHJvYmFiaWxpdHkgdGhhdCBhIHN0YXRpc3RpYyBpcyBvYnNlcnZlZCBiZWxvdyxcbiAqIGFib3ZlLCBvciBiZXR3ZWVuIHZhbHVlcyBvbiB0aGUgc3RhbmRhcmQgbm9ybWFsIGRpc3RyaWJ1dGlvbiwgYW5kIGJ5XG4gKiBleHRlbnNpb24sIGFueSBub3JtYWwgZGlzdHJpYnV0aW9uLlxuICpcbiAqIFRoZSBwcm9iYWJpbGl0aWVzIGFyZSBjYWxjdWxhdGVkIHVzaW5nIHRoZVxuICogW0N1bXVsYXRpdmUgZGlzdHJpYnV0aW9uIGZ1bmN0aW9uXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ob3JtYWxfZGlzdHJpYnV0aW9uI0N1bXVsYXRpdmVfZGlzdHJpYnV0aW9uX2Z1bmN0aW9uKS5cbiAqIFRoZSB0YWJsZSB1c2VkIGlzIHRoZSBjdW11bGF0aXZlLCBhbmQgbm90IGN1bXVsYXRpdmUgZnJvbSAwIHRvIG1lYW5cbiAqIChldmVuIHRob3VnaCB0aGUgbGF0dGVyIGhhcyA1IGRpZ2l0cyBwcmVjaXNpb24sIGluc3RlYWQgb2YgNCkuXG4gKi9cbnZhciBzdGFuZGFyZE5vcm1hbFRhYmxlID0gW107XG5cbmZvciAodmFyIHogPSAwOyB6IDw9IDMuMDk7IHogKz0gMC4wMSkge1xuICAgIHN0YW5kYXJkTm9ybWFsVGFibGUucHVzaChjdW11bGF0aXZlRGlzdHJpYnV0aW9uKHopKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFuZGFyZE5vcm1hbFRhYmxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBbc3VtXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdW1tYXRpb24pIG9mIGFuIGFycmF5XG4gKiBpcyB0aGUgcmVzdWx0IG9mIGFkZGluZyBhbGwgbnVtYmVycyB0b2dldGhlciwgc3RhcnRpbmcgZnJvbSB6ZXJvLlxuICpcbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJuIHtudW1iZXJ9IHN1bSBvZiBhbGwgaW5wdXQgbnVtYmVyc1xuICogQGV4YW1wbGVcbiAqIGNvbnNvbGUubG9nKHN1bShbMSwgMiwgM10pKTsgLy8gNlxuICovXG5mdW5jdGlvbiBzdW0oeCkge1xuICAgIHZhciB2YWx1ZSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlICs9IHhbaV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdW07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWFuID0gcmVxdWlyZSgnLi9tZWFuJyk7XG5cbi8qKlxuICogVGhlIHN1bSBvZiBkZXZpYXRpb25zIHRvIHRoZSBOdGggcG93ZXIuXG4gKiBXaGVuIG49MiBpdCdzIHRoZSBzdW0gb2Ygc3F1YXJlZCBkZXZpYXRpb25zLlxuICogV2hlbiBuPTMgaXQncyB0aGUgc3VtIG9mIGN1YmVkIGRldmlhdGlvbnMuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4XG4gKiBAcGFyYW0ge251bWJlcn0gbiBwb3dlclxuICogQHJldHVybnMge251bWJlcn0gc3VtIG9mIG50aCBwb3dlciBkZXZpYXRpb25zXG4gKiBAZXhhbXBsZVxuICogdmFyIGlucHV0ID0gWzEsIDIsIDNdO1xuICogLy8gc2luY2UgdGhlIHZhcmlhbmNlIG9mIGEgc2V0IGlzIHRoZSBtZWFuIHNxdWFyZWRcbiAqIC8vIGRldmlhdGlvbnMsIHdlIGNhbiBjYWxjdWxhdGUgdGhhdCB3aXRoIHN1bU50aFBvd2VyRGV2aWF0aW9uczpcbiAqIHZhciB2YXJpYW5jZSA9IHN1bU50aFBvd2VyRGV2aWF0aW9ucyhpbnB1dCkgLyBpbnB1dC5sZW5ndGg7XG4gKi9cbmZ1bmN0aW9uIHN1bU50aFBvd2VyRGV2aWF0aW9ucyh4LCBuKSB7XG4gICAgdmFyIG1lYW5WYWx1ZSA9IG1lYW4oeCksXG4gICAgICAgIHN1bSA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtICs9IE1hdGgucG93KHhbaV0gLSBtZWFuVmFsdWUsIG4pO1xuICAgIH1cblxuICAgIHJldHVybiBzdW07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3VtTnRoUG93ZXJEZXZpYXRpb25zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RhbmRhcmREZXZpYXRpb24gPSByZXF1aXJlKCcuL3N0YW5kYXJkX2RldmlhdGlvbicpO1xudmFyIG1lYW4gPSByZXF1aXJlKCcuL21lYW4nKTtcblxuLyoqXG4gKiBUaGlzIGlzIHRvIGNvbXB1dGUgW2Egb25lLXNhbXBsZSB0LXRlc3RdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0dWRlbnQlMjdzX3QtdGVzdCNPbmUtc2FtcGxlX3QtdGVzdCksIGNvbXBhcmluZyB0aGUgbWVhblxuICogb2YgYSBzYW1wbGUgdG8gYSBrbm93biB2YWx1ZSwgeC5cbiAqXG4gKiBpbiB0aGlzIGNhc2UsIHdlJ3JlIHRyeWluZyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGVcbiAqIHBvcHVsYXRpb24gbWVhbiBpcyBlcXVhbCB0byB0aGUgdmFsdWUgdGhhdCB3ZSBrbm93LCB3aGljaCBpcyBgeGBcbiAqIGhlcmUuIHVzdWFsbHkgdGhlIHJlc3VsdHMgaGVyZSBhcmUgdXNlZCB0byBsb29rIHVwIGFcbiAqIFtwLXZhbHVlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1AtdmFsdWUpLCB3aGljaCwgZm9yXG4gKiBhIGNlcnRhaW4gbGV2ZWwgb2Ygc2lnbmlmaWNhbmNlLCB3aWxsIGxldCB5b3UgZGV0ZXJtaW5lIHRoYXQgdGhlXG4gKiBudWxsIGh5cG90aGVzaXMgY2FuIG9yIGNhbm5vdCBiZSByZWplY3RlZC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHNhbXBsZSBhbiBhcnJheSBvZiBudW1iZXJzIGFzIGlucHV0XG4gKiBAcGFyYW0ge251bWJlcn0geCBleHBlY3RlZCB2YWxlIG9mIHRoZSBwb3B1bGF0aW9uIG1lYW5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHZhbHVlXG4gKiBAZXhhbXBsZVxuICogdFRlc3QoWzEsIDIsIDMsIDQsIDUsIDZdLCAzLjM4NSk7IC8vPSAwLjE2NDk0MTU0XG4gKi9cbmZ1bmN0aW9uIHRUZXN0KHNhbXBsZSwgeCkge1xuICAgIC8vIFRoZSBtZWFuIG9mIHRoZSBzYW1wbGVcbiAgICB2YXIgc2FtcGxlTWVhbiA9IG1lYW4oc2FtcGxlKTtcblxuICAgIC8vIFRoZSBzdGFuZGFyZCBkZXZpYXRpb24gb2YgdGhlIHNhbXBsZVxuICAgIHZhciBzZCA9IHN0YW5kYXJkRGV2aWF0aW9uKHNhbXBsZSk7XG5cbiAgICAvLyBTcXVhcmUgcm9vdCB0aGUgbGVuZ3RoIG9mIHRoZSBzYW1wbGVcbiAgICB2YXIgcm9vdE4gPSBNYXRoLnNxcnQoc2FtcGxlLmxlbmd0aCk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSBrbm93biB2YWx1ZSBhZ2FpbnN0IHRoZSBzYW1wbGUsXG4gICAgLy8gcmV0dXJuaW5nIHRoZSB0IHZhbHVlXG4gICAgcmV0dXJuIChzYW1wbGVNZWFuIC0geCkgLyAoc2QgLyByb290Tik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdFRlc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWFuID0gcmVxdWlyZSgnLi9tZWFuJyk7XG52YXIgc2FtcGxlVmFyaWFuY2UgPSByZXF1aXJlKCcuL3NhbXBsZV92YXJpYW5jZScpO1xuXG4vKipcbiAqIFRoaXMgaXMgdG8gY29tcHV0ZSBbdHdvIHNhbXBsZSB0LXRlc3RdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3R1ZGVudCdzX3QtdGVzdCkuXG4gKiBUZXN0cyB3aGV0aGVyIFwibWVhbihYKS1tZWFuKFkpID0gZGlmZmVyZW5jZVwiLCAoXG4gKiBpbiB0aGUgbW9zdCBjb21tb24gY2FzZSwgd2Ugb2Z0ZW4gaGF2ZSBgZGlmZmVyZW5jZSA9PSAwYCB0byB0ZXN0IGlmIHR3byBzYW1wbGVzXG4gKiBhcmUgbGlrZWx5IHRvIGJlIHRha2VuIGZyb20gcG9wdWxhdGlvbnMgd2l0aCB0aGUgc2FtZSBtZWFuIHZhbHVlKSB3aXRoXG4gKiBubyBwcmlvciBrbm93bGVkZ2Ugb24gc3RhbmRhcmQgZGV2aWF0aW9ucyBvZiBib3RoIHNhbXBsZXNcbiAqIG90aGVyIHRoYW4gdGhlIGZhY3QgdGhhdCB0aGV5IGhhdmUgdGhlIHNhbWUgc3RhbmRhcmQgZGV2aWF0aW9uLlxuICpcbiAqIFVzdWFsbHkgdGhlIHJlc3VsdHMgaGVyZSBhcmUgdXNlZCB0byBsb29rIHVwIGFcbiAqIFtwLXZhbHVlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1AtdmFsdWUpLCB3aGljaCwgZm9yXG4gKiBhIGNlcnRhaW4gbGV2ZWwgb2Ygc2lnbmlmaWNhbmNlLCB3aWxsIGxldCB5b3UgZGV0ZXJtaW5lIHRoYXQgdGhlXG4gKiBudWxsIGh5cG90aGVzaXMgY2FuIG9yIGNhbm5vdCBiZSByZWplY3RlZC5cbiAqXG4gKiBgZGlmZmAgY2FuIGJlIG9taXR0ZWQgaWYgaXQgZXF1YWxzIDAuXG4gKlxuICogW1RoaXMgaXMgdXNlZCB0byBjb25maXJtIG9yIGRlbnldKGh0dHA6Ly93d3cubW9uYXJjaGxhYi5vcmcvTGFiL1Jlc2VhcmNoL1N0YXRzLzJTYW1wbGVULmFzcHgpXG4gKiBhIG51bGwgaHlwb3RoZXNpcyB0aGF0IHRoZSB0d28gcG9wdWxhdGlvbnMgdGhhdCBoYXZlIGJlZW4gc2FtcGxlZCBpbnRvXG4gKiBgc2FtcGxlWGAgYW5kIGBzYW1wbGVZYCBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlci5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHNhbXBsZVggYSBzYW1wbGUgYXMgYW4gYXJyYXkgb2YgbnVtYmVyc1xuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBzYW1wbGVZIGEgc2FtcGxlIGFzIGFuIGFycmF5IG9mIG51bWJlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBbZGlmZmVyZW5jZT0wXVxuICogQHJldHVybnMge251bWJlcn0gdGVzdCByZXN1bHRcbiAqIEBleGFtcGxlXG4gKiBzcy50VGVzdFR3b1NhbXBsZShbMSwgMiwgMywgNF0sIFszLCA0LCA1LCA2XSwgMCk7IC8vPSAtMi4xOTA4OTAyMzAwMjA2NjQzXG4gKi9cbmZ1bmN0aW9uIHRUZXN0VHdvU2FtcGxlKHNhbXBsZVgsIHNhbXBsZVksIGRpZmZlcmVuY2UpIHtcbiAgICB2YXIgbiA9IHNhbXBsZVgubGVuZ3RoLFxuICAgICAgICBtID0gc2FtcGxlWS5sZW5ndGg7XG5cbiAgICAvLyBJZiBlaXRoZXIgc2FtcGxlIGRvZXNuJ3QgYWN0dWFsbHkgaGF2ZSBhbnkgdmFsdWVzLCB3ZSBjYW4ndFxuICAgIC8vIGNvbXB1dGUgdGhpcyBhdCBhbGwsIHNvIHdlIHJldHVybiBgbnVsbGAuXG4gICAgaWYgKCFuIHx8ICFtKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBkZWZhdWx0IGRpZmZlcmVuY2UgKG11KSBpcyB6ZXJvXG4gICAgaWYgKCFkaWZmZXJlbmNlKSB7XG4gICAgICAgIGRpZmZlcmVuY2UgPSAwO1xuICAgIH1cblxuICAgIHZhciBtZWFuWCA9IG1lYW4oc2FtcGxlWCksXG4gICAgICAgIG1lYW5ZID0gbWVhbihzYW1wbGVZKTtcblxuICAgIHZhciB3ZWlnaHRlZFZhcmlhbmNlID0gKChuIC0gMSkgKiBzYW1wbGVWYXJpYW5jZShzYW1wbGVYKSArXG4gICAgICAgIChtIC0gMSkgKiBzYW1wbGVWYXJpYW5jZShzYW1wbGVZKSkgLyAobiArIG0gLSAyKTtcblxuICAgIHJldHVybiAobWVhblggLSBtZWFuWSAtIGRpZmZlcmVuY2UpIC9cbiAgICAgICAgTWF0aC5zcXJ0KHdlaWdodGVkVmFyaWFuY2UgKiAoMSAvIG4gKyAxIC8gbSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRUZXN0VHdvU2FtcGxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3VtTnRoUG93ZXJEZXZpYXRpb25zID0gcmVxdWlyZSgnLi9zdW1fbnRoX3Bvd2VyX2RldmlhdGlvbnMnKTtcblxuLyoqXG4gKiBUaGUgW3ZhcmlhbmNlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1ZhcmlhbmNlKVxuICogaXMgdGhlIHN1bSBvZiBzcXVhcmVkIGRldmlhdGlvbnMgZnJvbSB0aGUgbWVhbi5cbiAqXG4gKiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHZhcmlhbmNlLCBub3Qgc2FtcGxlIHZhcmlhbmNlOlxuICogc2VlIHRoZSBgc2FtcGxlVmFyaWFuY2VgIG1ldGhvZCBpZiB5b3Ugd2FudCBhIHNhbXBsZSBtZWFzdXJlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBhIHBvcHVsYXRpb25cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHZhcmlhbmNlOiBhIHZhbHVlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB6ZXJvLlxuICogemVybyBpbmRpY2F0ZXMgdGhhdCBhbGwgdmFsdWVzIGFyZSBpZGVudGljYWwuXG4gKiBAZXhhbXBsZVxuICogc3MudmFyaWFuY2UoWzEsIDIsIDMsIDQsIDUsIDZdKTsgLy89IDIuOTE3XG4gKi9cbmZ1bmN0aW9uIHZhcmlhbmNlKHgpIHtcbiAgICAvLyBUaGUgdmFyaWFuY2Ugb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBGaW5kIHRoZSBtZWFuIG9mIHNxdWFyZWQgZGV2aWF0aW9ucyBiZXR3ZWVuIHRoZVxuICAgIC8vIG1lYW4gdmFsdWUgYW5kIGVhY2ggdmFsdWUuXG4gICAgcmV0dXJuIHN1bU50aFBvd2VyRGV2aWF0aW9ucyh4LCAyKSAvIHgubGVuZ3RoO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZhcmlhbmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBbWi1TY29yZSwgb3IgU3RhbmRhcmQgU2NvcmVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3RhbmRhcmRfc2NvcmUpLlxuICpcbiAqIFRoZSBzdGFuZGFyZCBzY29yZSBpcyB0aGUgbnVtYmVyIG9mIHN0YW5kYXJkIGRldmlhdGlvbnMgYW4gb2JzZXJ2YXRpb25cbiAqIG9yIGRhdHVtIGlzIGFib3ZlIG9yIGJlbG93IHRoZSBtZWFuLiBUaHVzLCBhIHBvc2l0aXZlIHN0YW5kYXJkIHNjb3JlXG4gKiByZXByZXNlbnRzIGEgZGF0dW0gYWJvdmUgdGhlIG1lYW4sIHdoaWxlIGEgbmVnYXRpdmUgc3RhbmRhcmQgc2NvcmVcbiAqIHJlcHJlc2VudHMgYSBkYXR1bSBiZWxvdyB0aGUgbWVhbi4gSXQgaXMgYSBkaW1lbnNpb25sZXNzIHF1YW50aXR5XG4gKiBvYnRhaW5lZCBieSBzdWJ0cmFjdGluZyB0aGUgcG9wdWxhdGlvbiBtZWFuIGZyb20gYW4gaW5kaXZpZHVhbCByYXdcbiAqIHNjb3JlIGFuZCB0aGVuIGRpdmlkaW5nIHRoZSBkaWZmZXJlbmNlIGJ5IHRoZSBwb3B1bGF0aW9uIHN0YW5kYXJkXG4gKiBkZXZpYXRpb24uXG4gKlxuICogVGhlIHotc2NvcmUgaXMgb25seSBkZWZpbmVkIGlmIG9uZSBrbm93cyB0aGUgcG9wdWxhdGlvbiBwYXJhbWV0ZXJzO1xuICogaWYgb25lIG9ubHkgaGFzIGEgc2FtcGxlIHNldCwgdGhlbiB0aGUgYW5hbG9nb3VzIGNvbXB1dGF0aW9uIHdpdGhcbiAqIHNhbXBsZSBtZWFuIGFuZCBzYW1wbGUgc3RhbmRhcmQgZGV2aWF0aW9uIHlpZWxkcyB0aGVcbiAqIFN0dWRlbnQncyB0LXN0YXRpc3RpYy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IG1lYW5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFuZGFyZERldmlhdGlvblxuICogQHJldHVybiB7bnVtYmVyfSB6IHNjb3JlXG4gKiBAZXhhbXBsZVxuICogc3MuelNjb3JlKDc4LCA4MCwgNSk7IC8vPSAtMC40XG4gKi9cbmZ1bmN0aW9uIHpTY29yZSh4LCBtZWFuLCBzdGFuZGFyZERldmlhdGlvbikge1xuICAgIHJldHVybiAoeCAtIG1lYW4pIC8gc3RhbmRhcmREZXZpYXRpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gelNjb3JlO1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cblxuLy9jZWxsLmpzXG5cbmNsYXNzIENlbGwge1xuICBjb25zdHJ1Y3Rvcih4LCB5LCBtLCByLCBnLCBiKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMubW9ydG9uID0gbTtcbiAgICB0aGlzLnIgPSByO1xuICAgIHRoaXMuZyA9IGc7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLmx1bWluYW5jZSA9ICggMC4yOTg5MTIgKiByICsgMC41ODY2MTEgKiBnICsgMC4xMTQ0NzggKiBiICk7XG4gIH1cbn1cblxuLy9jb2xvci5sdW1pbm9zaXR5KCk7ICAvLyAwLjQxMiBcblxubW9kdWxlLmV4cG9ydHMgPSBDZWxsO1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8vY2VsbHMuanNcblxudmFyIENlbGwgPSByZXF1aXJlKCcuL2NlbGwnKTtcbnZhciBNb3J0b24gPSByZXF1aXJlKCcuL21vcnRvbicpO1xuXG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIHJvdW5kID0gTWF0aC5yb3VuZDtcbnZhciBwb3cgPSBNYXRoLnBvdztcblxudmFyIGJpdFNlcGVyYXRlMzIgPSBNb3J0b24uYml0U2VwZXJhdGUzMjtcblxuY2xhc3MgQ2VsbHMge1xuICBjb25zdHJ1Y3RvcihkYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkYXRhIGxlbmd0aCBpbmNvcnJlY3QuJylcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gW107XG4gICAgdGhpcy5yZWdpc3RlcihkYXRhLCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuICByZWdpc3RlcihkYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciB4ID0gMDtcbiAgICB2YXIgeSA9IDA7XG4gICAgdmFyIHUgPSBwb3coMiwgTW9ydG9uLk1BWF9MVkwpO1xuICAgIGNvbnNvbGUudGltZSgncmVhZCBkYXRhJyk7XG4gICAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgIC8v5LqL5YmN5Yem55CGXG4gICAgICB2YXIgciA9IGRhdGFbaV07XG4gICAgICB2YXIgZyA9IGRhdGFbaSArIDFdO1xuICAgICAgdmFyIGIgPSBkYXRhW2kgKyAyXTtcbiAgICAgIGxldCBfeCA9IGZsb29yKHggLyB3aWR0aCAqIHUpO1xuICAgICAgbGV0IF95ID0gZmxvb3IoeSAvIGhlaWdodCAqIHUpO1xuICAgICAgbGV0IG1vcnRvbiA9IChiaXRTZXBlcmF0ZTMyKF94KSB8IChiaXRTZXBlcmF0ZTMyKF95KSA8PCAxKSk7XG4gICAgICB0aGlzLmRhdGEucHVzaChuZXcgQ2VsbChfeCwgX3ksIG1vcnRvbiwgciwgZywgYikpO1xuICAgICAgLy9jb25zb2xlLmxvZyhyLCBnLCBiKTtcbiAgICAgIGlmICgrK3ggPT09IHdpZHRoKSB7XG4gICAgICAgIHggPSAwO1xuICAgICAgICB5Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUudGltZUVuZCgncmVhZCBkYXRhJyk7XG4gICAgY29uc29sZS5sb2codGhpcy5kYXRhKTtcbiAgfVxuICBmaW5kKGx2bCwgbW9ydG9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5maWx0ZXIoKGNlbGwpID0+IHtcbiAgICAgIHJldHVybiBNb3J0b24uYmVsb25ncyhjZWxsLm1vcnRvbiwgbW9ydG9uLCBsdmwpO1xuICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDZWxscztcbiIsIid1c2Ugc3RyaWN0JztcblxuLy9ncmF5Z3JpZC5qc1xuLy8gQ3JlYXRlIGdyaWQgd2l0aCBHcmF5IGNvZGVcblxuZnVuY3Rpb24gZ3JheWdyaWQoYml0KSB7XG4gIHZhciBsID0gTWF0aC5wb3coMiwgYml0KTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIHJlcy5wdXNoKChpIF4gKGkgPj4gMSkpLnRvU3RyaW5nKDIpKTtcbiAgICAvL2NvbnNvbGUubG9nKGkgXiAoaSA+PiAxKSk7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhyZXMpXG4gIHJldHVybiByZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ3JheWdyaWQ7XG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xudmFyIE51bGxOb2RlID0gcmVxdWlyZShcIi4vbnVsbG5vZGVcIik7XG5cbi8vIExpbmVyIFF1YXRlcm5hcnkgTm9kZVxuXG5jbGFzcyBMUU5vZGUgZXh0ZW5kcyBOdWxsTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHIsIGcsIGIsIHJvLCBtb3J0b24sIGxldmVsKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMucm8gPSBybztcbiAgICB0aGlzLnIgPSByO1xuICAgIHRoaXMuZyA9IGc7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLmNvbG9yID0gQ29sb3Ioe3I6cixnOmcsYjpifSk7XG4gICAgdGhpcy5tb3J0b24gPSBtb3J0b247XG4gICAgdGhpcy5sZXZlbCA9IGxldmVsO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTFFOb2RlO1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8vIExpbmVyIFF1YXRlcm5hcnkgVHJlZVxuXG52YXIgTFFOb2RlID0gcmVxdWlyZShcIi4vbHFub2RlXCIpO1xudmFyIE51bGxOb2RlID0gcmVxdWlyZShcIi4vbnVsbG5vZGVcIik7XG52YXIgTW9ydG9uID0gcmVxdWlyZShcIi4vbW9ydG9uXCIpO1xuXG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIHBvdyA9IE1hdGgucG93O1xuXG52YXIgb2Zmc2V0cyA9IFtdO1xuXG5jbGFzcyBMUVRyZWUge1xuICBjb25zdHJ1Y3RvcihmaWx0ZXIpIHtcbiAgICBpZiAodHlwZW9mIGZpbHRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZmlsdGVyID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG5cbiAgICB0aGlzLnBvaW50ZXIgPSAwO1xuICAgIHRoaXMubGV2ZWwgPSAwO1xuICAgIHRoaXMubWF4UG9pbnRlciA9IHRoaXMuZ2V0T2Zmc2V0KE1vcnRvbi5NQVhfTFZMICsgMSk7XG4gICAgdGhpcy5kYXRhID0gW107XG4gICAgdGhpcy5yZWdpc3RlcmVkID0gW107XG4gIH1cbiAgYWRkKG5vZGUpIHtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZmlsdGVyKG5vZGUpLCB0aGlzLmdldFBhcmVudERhdGEoKSAhPT0gbnVsbCk7XG4gICAgLy9pZiAobm9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKG5vZGUgaW5zdGFuY2VvZiBOdWxsTm9kZSk7XG4gICAgICAvL2NvbnNvbGUubG9nKG5vZGUgaW5zdGFuY2VvZiBMUU5vZGUpO1xuICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldE1vcnRvbigpLnRvU3RyaW5nKDIpLCB0aGlzLmdldFBhcmVudERhdGEoKSk7XG5cbiAgICB2YXIgcGFyZW50RGF0YSA9IHRoaXMuZ2V0UGFyZW50RGF0YSgpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5sZXZlbCk7XG5cbiAgICBpZiAocGFyZW50RGF0YSA9PT0gbnVsbCB8fCBwYXJlbnREYXRhIGluc3RhbmNlb2YgTFFOb2RlKSB7XG4gICAgICAvLyDopqrjg4fjg7zjgr/jgYwgbnVsbCDjgb7jgZ/jga/mnKjjg47jg7zjg4kgLT4gbnVsbFxuICAgICAgdGhpcy5kYXRhW3RoaXMucG9pbnRlcl0gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyDopqrjg4fjg7zjgr/jgYwg56m644OO44O844OJXG4gICAgICBpZiAodGhpcy5maWx0ZXIobm9kZSkpIHtcbiAgICAgICAgLy8g5qiZ5rqW5YGP5beu44GM6Za+5YCk5Lul5LiLIC0+IOeZu+mMsuOBmeOCi1xuICAgICAgICB0aGlzLmRhdGFbdGhpcy5wb2ludGVyXSA9IG5vZGU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGV2ZWwgPT09IDEpIHtcbiAgICAgICAgLy8g5pyA5aSn44Os44OZ44OrIC0+IOeZu+mMsuOBmeOCi1xuICAgICAgICB0aGlzLmRhdGFbdGhpcy5wb2ludGVyXSA9IG5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDmqJnmupblgY/lt67jgYzplr7lgKTku6XkuIsgLT4g56m644OO44O844OJ44Gn5Z+L44KB44KLXG4gICAgICAgIHRoaXMuZGF0YVt0aGlzLnBvaW50ZXJdID0gbmV3IE51bGxOb2RlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2cocGFyZW50RGF0YSwgdGhpcy5kYXRhW3RoaXMucG9pbnRlcl0pO1xuICAgIC8vfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5kYXRhW3RoaXMucG9pbnRlcl0pO1xuXG4gICAgdGhpcy5wb2ludGVyKys7XG5cbiAgICBpZiAodGhpcy5nZXRPZmZzZXQodGhpcy5sZXZlbCArIDEpID09PSB0aGlzLnBvaW50ZXIpIHtcbiAgICAgIHRoaXMubGV2ZWwrKztcbiAgICB9XG4gICAgLy9pZiAodGhpcy5sZXZlbCA+IE1vcnRvbi5NQVhfTFZMKSB7XG4gICAgLy8gIHRocm93IG5ldyBFcnJvcignTWF4aW11bSB0cmVlIGxldmVsIGV4Y2VlZGVkLicpO1xuICAgIC8vfVxuICB9XG4gIGdldE1vcnRvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wb2ludGVyIC0gdGhpcy5nZXRPZmZzZXQodGhpcy5sZXZlbCk7XG4gIH1cbiAgZ2V0U3BhY2UoKSB7XG4gICAgcmV0dXJuIE1vcnRvbi5nZXRPd25TcGFjZSh0aGlzLmdldE1vcnRvbigpKTtcbiAgfVxuICBnZXRQYXJlbnRNb3J0b24obW9ydG9uLCBsZXZlbCkge1xuICAgIG1vcnRvbiA9IHR5cGVvZiBtb3J0b24gPT09ICdudW1iZXInID8gbW9ydG9uIDogdGhpcy5nZXRNb3J0b24oKTtcbiAgICBsZXZlbCA9IHR5cGVvZiBsZXZlbCA9PT0gJ251bWJlcicgPyBsZXZlbCA6IHRoaXMubGV2ZWw7XG4gICAgcmV0dXJuIG1vcnRvbiA+PiAyO1xuICB9XG4gIGdldFBhcmVudERhdGEobW9ydG9uLCBsZXZlbCkge1xuICAgIG1vcnRvbiA9IHR5cGVvZiBtb3J0b24gPT09ICdudW1iZXInID8gbW9ydG9uIDogdGhpcy5nZXRNb3J0b24oKTtcbiAgICBsZXZlbCA9IHR5cGVvZiBsZXZlbCA9PT0gJ251bWJlcicgPyBsZXZlbCA6IHRoaXMubGV2ZWw7XG5cbiAgICBpZiAobGV2ZWwgPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgTnVsbE5vZGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZGF0YVt0aGlzLmdldE9mZnNldChsZXZlbCAtIDEpICsgKG1vcnRvbiA+PiAyKV07XG4gIH1cbiAgZ2V0T2Zmc2V0KGx2bCkge1xuICAgIGlmICghb2Zmc2V0c1tsdmxdKSB7XG4gICAgICBvZmZzZXRzW2x2bF0gPSBmbG9vcigocG93KDQsIGx2bCkgLSAxKSAvICg0IC0gMSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0c1tsdmxdO1xuICB9XG4gIGdldFRocmVzaG9sZCgpIHtcbiAgICBcbiAgfVxuICBpc1BvaW50ZXJNYXgoKSB7XG4gICAgcmV0dXJuICEodGhpcy5tYXhQb2ludGVyID4gdGhpcy5wb2ludGVyKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExRVHJlZTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBtYWluLmpzXG5cbnJlcXVpcmUoXCJuYXRpdmUtcHJvbWlzZS1vbmx5XCIpO1xuXG52YXIgc3MgPSByZXF1aXJlKFwic2ltcGxlLXN0YXRpc3RpY3NcIik7XG5cbnZhciBncmF5Z3JpZCA9IHJlcXVpcmUoXCIuL2dyYXlncmlkXCIpO1xudmFyIENlbGxzID0gcmVxdWlyZShcIi4vY2VsbHNcIik7XG52YXIgTW9ydG9uID0gcmVxdWlyZShcIi4vbW9ydG9uXCIpO1xudmFyIExRVHJlZSA9IHJlcXVpcmUoXCIuL2xxdHJlZVwiKTtcbnZhciBMUU5vZGUgPSByZXF1aXJlKFwiLi9scW5vZGVcIik7XG52YXIgTnVsbE5vZGUgPSByZXF1aXJlKFwiLi9udWxsbm9kZVwiKTtcblxudmFyIGJpdFNlcGVyYXRlMzIgPSBNb3J0b24uYml0U2VwZXJhdGUzMjtcbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XG52YXIgcG93ID0gTWF0aC5wb3c7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZSkgPT4ge1xuICBjb25zb2xlLmxvZygnRW50cnkgcG9pbnQnKTtcbiAgdmFyIGltYWdlRGF0YSA9IFtdO1xuXG4gIHZhciBsb2FkZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdmFyIHNyYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcmMnKTtcbiAgICBzcmMuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIChlKSA9PiB7XG4gICAgICByZXNvbHZlKHNyYyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGxvYWRlZC50aGVuKChzcmMpID0+IHtcbiAgICBjb25zb2xlLmxvZygnc3JjIGxvYWRlZC4nKTtcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZS5zcmMgPSBzcmMuZ2V0QXR0cmlidXRlKCdzcmMnKTtcblxuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxhY2UtaG9sZGVyJyk7XG4gICAgY2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcblxuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpO1xuXG4gICAgLy9jb25zb2xlLmxvZyhjb250ZXh0LmdldEltYWdlRGF0YSgwLDAsaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCkuZGF0YSk7XG4gICAgdmFyIGRhdGFBcnIgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLDAsaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCkuZGF0YTtcbiAgICBjb25zb2xlLnRpbWUoJ3JlYWQgZGF0YScpO1xuICAgIGNvbnNvbGUubG9nKGRhdGFBcnIubGVuZ3RoIC8gNCk7XG4gICAgaWYgKGRhdGFBcnIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkYXRhIGxlbmd0aCBpbmNvcnJlY3QuJylcbiAgICB9XG5cbiAgICB2YXIgY2VsbHMgPSBuZXcgQ2VsbHMoZGF0YUFyciwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCk7XG5cbiAgICAvLyB0ZXN0IGNlbGxzXG4gICAgLy9jZWxscy5kYXRhLmZvckVhY2goKGNlbGwpID0+IHtcbiAgICAvLyAgbGV0IG0gPSBNb3J0b24ucmV2ZXJzZShjZWxsLm1vcnRvbik7XG4gICAgLy8gIGxldCB1ID0gcG93KDIsIE1vcnRvbi5NQVhfTFZMKTtcbiAgICAvLyAgbGV0IHcgPSBpbWFnZS53aWR0aCAvIHU7XG4gICAgLy8gIGxldCBoID0gaW1hZ2UuaGVpZ2h0IC8gdTtcbiAgICAvLyAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAvLyAgY29udGV4dC5maWxsU3R5bGUgPSBgcmdiKCR7Y2VsbC5yfSwke2NlbGwuZ30sJHtjZWxsLmJ9KWA7XG4gICAgLy8gIGNvbnRleHQuZmlsbFJlY3QobS54ICogdywgbS55ICogaCwgdywgaCk7XG4gICAgLy8gIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgLy99KTtcblxuICAgIHZhciB0cmVlID0gbmV3IExRVHJlZSgobm9kZSkgPT4gbm9kZS5ybyA8IDUwKTtcblxuICAgIGNvbnNvbGUubG9nKHRyZWUpO1xuXG4gICAgdmFyIGEgPSBNb3J0b24uYmVsb25ncygwLCAyLCAxKTtcbiAgICB2YXIgYiA9IE1vcnRvbi5iZWxvbmdzKDEsIDIsIDEpO1xuICAgIHZhciBjID0gTW9ydG9uLmJlbG9uZ3MoMiwgMiwgMSk7XG4gICAgdmFyIGQgPSBNb3J0b24uYmVsb25ncygzLCAyLCAxKTtcbiAgICB2YXIgZSA9IE1vcnRvbi5iZWxvbmdzKDQ1LCA0NSwgMSk7XG4gICAgdmFyIGYgPSBNb3J0b24uYmVsb25ncyg0NiwgNDUsIDEpO1xuICAgIHZhciBnID0gTW9ydG9uLmJlbG9uZ3MoNDcsIDQ1LCAxKTtcbiAgICB2YXIgaCA9IE1vcnRvbi5iZWxvbmdzKDQ4LCA0NSwgMSk7XG5cbiAgICBjb25zb2xlLmxvZyhhLCBiLCBjLCBkKTtcbiAgICBjb25zb2xlLmxvZyhlLCBmLCBnLCBoKTtcblxuXG4gICAgd2hpbGUoIXRyZWUuaXNQb2ludGVyTWF4KCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRyZWUubGV2ZWwsIHRyZWUuZ2V0TW9ydG9uKCksIHRyZWUuZ2V0U3BhY2UoKSk7XG4gICAgICBsZXQgdGVtcCA9IGNlbGxzLmZpbmQodHJlZS5sZXZlbCwgdHJlZS5nZXRNb3J0b24oKSk7XG4gICAgICBjb25zb2xlLmxvZyh0ZW1wKTtcbiAgICAgIC8vIGNvbG9yIGF2ZXJhZ2VcbiAgICAgIGxldCByID0gcm91bmQoc3MuYXZlcmFnZSh0ZW1wLm1hcCgoY2VsbCkgPT4gY2VsbC5yKSkpO1xuICAgICAgbGV0IGcgPSByb3VuZChzcy5hdmVyYWdlKHRlbXAubWFwKChjZWxsKSA9PiBjZWxsLmcpKSk7XG4gICAgICBsZXQgYiA9IHJvdW5kKHNzLmF2ZXJhZ2UodGVtcC5tYXAoKGNlbGwpID0+IGNlbGwuYikpKTtcblxuICAgICAgLy8gc3RhbmRhcmQgZGV2aWF0aW9uIG9mIGx1bWluYW5jZVxuICAgICAgbGV0IHJvID0gc3Muc3RhbmRhcmREZXZpYXRpb24odGVtcC5tYXAoKGNlbGwpID0+IGNlbGwubHVtaW5hbmNlKSk7XG5cbiAgICAgIHRyZWUuYWRkKG5ldyBMUU5vZGUociwgZywgYiwgcm8sIHRyZWUuZ2V0TW9ydG9uKCksIHRyZWUubGV2ZWwpKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codHJlZS5kYXRhKTtcblxuICAgIC8vdmFyIGNlbGxjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2VsbHMnKTtcbiAgICAvL2NlbGxjYW52YXMud2lkdGggPSBwb3coMiwgTW9ydG9uLk1BWF9MVkwpO1xuICAgIC8vY2VsbGNhbnZhcy5oZWlnaHQgPSBwb3coMiwgTW9ydG9uLk1BWF9MVkwpO1xuICAgIC8vdmFyIGNlbGxjdHggPSBjZWxsY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgLy9jZWxsY3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICAvL2NlbGxjdHguZmlsbFJlY3QoMCwgMCwgY2VsbGNhbnZhcy53aWR0aCwgY2VsbGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgLyp0cmVlLmRhdGEuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgLy9jb25zb2xlLmxvZyhub2RlID09PSBudWxsLCBub2RlIGluc3RhbmNlb2YgTnVsbE5vZGUpO1xuICAgICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBMUU5vZGUpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub2RlKTtcbiAgICAgICAgbGV0IGNvbG9yID0gYHJnYigke25vZGUucn0sJHtub2RlLmd9LCR7bm9kZS5ifSlgO1xuICAgICAgICBsZXQgbmVnYXRlID0gYHJnYigke25vZGUuY29sb3IubmVnYXRlKCkucmdiQXJyYXkoKS5qb2luKCcsJyl9KWA7XG4gICAgICAgIGxldCB3ID0gaW1hZ2Uud2lkdGggLyBwb3coMiwgbm9kZS5sZXZlbCk7XG4gICAgICAgIGxldCBoID0gaW1hZ2UuaGVpZ2h0IC8gcG93KDIsIG5vZGUubGV2ZWwpO1xuICAgICAgICBsZXQgbSA9IE1vcnRvbi5yZXZlcnNlKG5vZGUubW9ydG9uKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyh3ICogbS54LCBoICogbS55LCB3LCBoKTtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IG5lZ2F0ZTtcbiAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAwLjI7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QodyAqIG0ueCwgaCAqIG0ueSwgdywgaCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHcgKiBtLngsIGggKiBtLnkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh3ICogbS54ICsgdywgaCAqIG0ueSArIGgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh3ICogbS54ICsgdywgaCAqIG0ueSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHcgKiBtLngsIGggKiBtLnkgKyBoKTtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBuZWdhdGU7XG4gICAgICAgIGNvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQofn5ub2RlLnJvLCB3ICogbS54ICsgdyAvIDIsIGggKiBtLnkgKyBoIC8gMik7XG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICB9XG4gICAgfSk7Ki9cbiAgfSk7XG59LCBmYWxzZSk7XG5cblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8vbW9ydG9uLmpzXG4vL21vcnRvbiBvcmRlciA8PT4geCwgeVxuXG4vL2h0dHA6Ly9kLmhhdGVuYS5uZS5qcC9yYW5tYXJ1NTAvMjAxMTExMDYvMTMyMDU1OTk1NVxuLy9odHRwOi8vbWFydXBla2UyOTYuY29tL0NPTF8yRF9ObzhfUXVhZFRyZWUuaHRtbFxuXG4vLyg0NSkudG9TdHJpbmcoMikgLy8gXCIxMDExMDFcIlxuLy8gMTAgPT4gMiA6IHBhcmVudCBwYXJlbnQgc3BhY2Vcbi8vIDExID0+IDMgOiBwYXJlbnQgc3BhY2Vcbi8vIDAxID0+IDEgOiBzZWxmIHNwYWNlXG5cbi8vIHl4XG4vLyAxMFxuXG4vKlxueVxceCAwICAxXG4gIC0tLS0tLS1cbjAgfDAwfDAxfFxuICAtLS0tLS0tXG4xIHwxMHwxMXxcbiAgLS0tLS0tLVxuKi9cblxuLy8gXCIxMDExMDFcIiBBTkQgXCIwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMVwiXG4vLyBcIjAwMDEwMVwiXG4vLyBcIjAxMDExMFwiIEFORCBcIjAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxXCJcbi8vIFwiMDEwMTAwXCJcblxudmFyIHNwYWNlRmlsdGVycyA9IFtdO1xuXG5mdW5jdGlvbiBnZXREaXNjcmV0ZUJpdHMobiwgZikge1xuICBsZXQgYiA9IG4udG9TdHJpbmcoMik7XG4gIGIgPSBiLmxlbmd0aCA8IDIgPyAnMCcgKyBiIDogYjtcbiAgcmV0dXJuIGIuc3BsaXQoJycpLnJldmVyc2UoKS5maWx0ZXIoZikucmV2ZXJzZSgpLmpvaW4oJycpO1xufVxuZnVuY3Rpb24gZ2V0RXZlbkJpdHMobikge1xuICByZXR1cm4gZ2V0RGlzY3JldGVCaXRzKG4sIChlLCBpKSA9PiBpICUgMiA9PT0gMCk7XG59XG5mdW5jdGlvbiBnZXRPZGRCaXRzKG4pIHtcbiAgcmV0dXJuIGdldERpc2NyZXRlQml0cyhuLCAoZSwgaSkgPT4gaSAlIDIgIT09IDApO1xufVxuXG5jbGFzcyBNb3J0b24ge1xuICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgaWYgKHggPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGFyZ3VtZW50cy4nKVxuICAgIH1cbiAgICBpZiAoeSA9PSBudWxsKSB7XG4gICAgICBsZXQgbSA9IE1vcnRvbi5yZXZlcnNlKHgpO1xuICAgICAgeSA9IG0ueTtcbiAgICAgIHggPSBtLng7XG4gICAgfVxuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLm51bWJlciA9IChNb3J0b24uYml0U2VwZXJhdGUzMih4KSB8IChNb3J0b24uYml0U2VwZXJhdGUzMih5KSA8PCAxKSk7XG4gIH1cbiAgc3RhdGljIGJpdFNlcGVyYXRlMzIobikge1xuICAgIG4gPSAobiB8IChuIDw8IDgpKSAmIDB4MDBmZjAwZmY7XG4gICAgbiA9IChuIHwgKG4gPDwgNCkpICYgMHgwZjBmMGYwZjtcbiAgICBuID0gKG4gfCAobiA8PCAyKSkgJiAweDMzMzMzMzMzO1xuICAgIHJldHVybiAobiB8IChuIDw8IDEpKSAmIDB4NTU1NTU1NTU7Ly9cIjAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxXCJcbiAgfVxuICBzdGF0aWMgcmV2ZXJzZShuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHBhcnNlSW50KGdldEV2ZW5CaXRzKG4pLCAyKSxcbiAgICAgIHk6IHBhcnNlSW50KGdldE9kZEJpdHMobiksIDIpXG4gICAgfVxuICB9XG4gIHN0YXRpYyBnZXRTcGFjZShtb3J0b24sIGx2bCwgbWF4ID0gTW9ydG9uLk1BWF9MVkwpIHtcbiAgICB2YXIgZmlsdGVyID0gc3BhY2VGaWx0ZXJzW2x2bF07XG4gICAgaWYgKCFmaWx0ZXIpIHtcbiAgICAgIGxldCBiID0gTWF0aC5wb3coMiwgbWF4ICogMiAtIChsdmwgKiAyIC0gMSkpO1xuICAgICAgZmlsdGVyID0gYiB8IChiID4+IDEpO1xuICAgIH1cbiAgICByZXR1cm4gKG1vcnRvbiAmIGZpbHRlcikgPj4gKG1heCAtIGx2bCkgKiAyO1xuICB9XG4gIHN0YXRpYyBiZWxvbmdzKGEsIGIsIGx2bCwgbWF4ID0gTW9ydG9uLk1BWF9MVkwpIHtcbiAgICAvLyBh44Gv5pyA5aSn44Os44OZ44Or44GuTW9ydG9u44CBIGLjga/mnIDlsI/jg6zjg5njg6vjgYvjgonmjqLntKJcbiAgICBhID0gTW9ydG9uLmdldFNwYWNlKGEsIGx2bCk7XG4gICAgLy9sZXQgc2hpZnRBID0gKG1heCAtIGx2bCkgKiAyO1xuICAgIC8vbGV0IHNoaWZ0QiA9IDA7Ly9+fk1hdGguZmxvb3IoYi50b1N0cmluZygyKS5sZW5ndGggLSAyKTtcbiAgICByZXR1cm4gYSA9PT0gYjtcbiAgfVxuXG4gIHN0YXRpYyBnZXRPd25TcGFjZShtb3J0b24pIHtcbiAgICByZXR1cm4gcGFyc2VJbnQobW9ydG9uLnRvU3RyaW5nKDIpLnNsaWNlKC0yKSwgMik7XG4gIH1cbiAgZ2V0U3BhY2VzKCkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc3RyID0gdGhpcy5udW1iZXIudG9TdHJpbmcoMik7XG4gICAgc3RyID0gc3RyLmxlbmd0aCAlIDIgIT09IDAgPyBzdHIgPSBcIjBcIiArIHN0ciA6IHN0cjtcbiAgICBzdHIuc3BsaXQoJycpLmZvckVhY2goKGUsIGkpID0+IHtcbiAgICAgIGkgJSAyID09PSAwID8gcmVzdWx0W2ldID0gJycgKyBlIDogcmVzdWx0W2kgLSAxXSArPSBlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQuZmlsdGVyKChlKSA9PiBlICE9PSB1bmRlZmluZWQpLm1hcCgoZSkgPT4gcGFyc2VJbnQoZSwgMikpO1xuICB9XG59XG5cbk1vcnRvbi5NQVhfTFZMID0gMztcblxubW9kdWxlLmV4cG9ydHMgPSBNb3J0b247XG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBFbXB0eSBOb2RlXG5cbmNsYXNzIE51bGxOb2RlIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gTnVsbE5vZGU7XG4iXX0=
