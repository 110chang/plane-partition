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

var Cell = function Cell(m, r, g, b) {
  _classCallCheck(this, Cell);

  this.morton = m;
  this.r = r;
  this.g = g;
  this.b = b;
  this.luminance = 0.298912 * r + 0.586611 * g + 0.114478 * b;
};

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

var Cells = (function () {
  function Cells(data, width, height) {
    _classCallCheck(this, Cells);

    if (data.length % 4 !== 0) {
      throw new Error('data length incorrect.');
    }
    this.data = [];
    this.mem = {};
    this.register(data, width, height);
  }

  _createClass(Cells, [{
    key: 'register',
    value: function register(data, width, height) {
      var x = 0;
      var y = 0;
      var u = pow(2, Morton.MAX_LVL);
      console.time('read data');
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var _x = floor(x / width * u);
        var _y = floor(y / height * u);
        var morton = Morton.create(_x, _y);
        this.data.push(new Cell(morton, r, g, b));

        if (++x === width) {
          x = 0;
          y++;
        }
      }
      console.timeEnd('read data');
    }
  }, {
    key: 'find',
    value: function find(lvl, morton) {
      var field = this.data;
      var result = undefined;

      if (this.mem[lvl - 1] && this.mem[lvl - 1][morton >> 2]) {
        field = this.mem[lvl - 1][morton >> 2];
      }

      result = field.filter(function (cell) {
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
  }]);

  return Cells;
})();

module.exports = Cells;

},{"./cell":57,"./morton":62}],59:[function(require,module,exports){

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
    _this.morton = morton;
    _this.level = level;
    return _this;
  }

  return LQNode;
})(NullNode);

module.exports = LQNode;

},{"./nullnode":63}],60:[function(require,module,exports){

'use strict';

// Linear Quaternary Tree

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LQNode = require("./lqnode");
var NullNode = require("./nullnode");
var Morton = require("./morton");

var floor = Math.floor;
var pow = Math.pow;

var offsets = [];

var LQTree = (function () {
  function LQTree() {
    _classCallCheck(this, LQTree);

    this.morton = 0;
    this.pointer = 0;
    this.level = 0;
    this.maxPointer = this.getOffset(Morton.MAX_LVL + 1);
    this.data = [];
  }

  _createClass(LQTree, [{
    key: "add",
    value: function add(node) {
      this.data[this.pointer] = node;

      this.pointer++;
      // ポインタが次のレベルのオフセットに達したらレベルを上げる
      if (this.getOffset(this.level + 1) === this.pointer) {
        this.level++;
      }
      this.morton = this.pointer - this.getOffset(this.level);
    }
  }, {
    key: "isMaxLevel",
    value: function isMaxLevel() {
      return this.level === Morton.MAX_LVL;
    }
  }, {
    key: "isPointerExceeded",
    value: function isPointerExceeded() {
      return !(this.maxPointer > this.pointer);
    }
  }, {
    key: "isRegisteredBranch",
    value: function isRegisteredBranch() {
      var parentData = this.getParentData();
      return parentData === null || parentData instanceof LQNode;
    }
  }, {
    key: "getParentData",
    value: function getParentData(morton, level) {
      morton = typeof morton === 'number' ? morton : this.morton;
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
  }]);

  return LQTree;
})();

module.exports = LQTree;

},{"./lqnode":59,"./morton":62,"./nullnode":63}],61:[function(require,module,exports){

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

var pow = Math.pow;

document.addEventListener('DOMContentLoaded', function (e) {
  //console.log('Entry point');
  var loaded = new Promise(function (resolve, reject) {
    var src = document.getElementById('src');
    src.addEventListener('load', function (e) {
      resolve(src);
    });
  });

  loaded.then(function (src) {
    console.log('image src loaded.');
    var image = new Image();
    image.src = src.getAttribute('src');

    var canvas = document.getElementById('place-holder');
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);

    var dataArr = context.getImageData(0, 0, image.width, image.height).data;

    var cells = new Cells(dataArr, image.width, image.height);
    var tree = new LQTree();

    console.time('register data');
    while (!tree.isPointerExceeded()) {

      if (tree.isRegisteredBranch()) {
        tree.add(null);
      } else {
        var temp = cells.find(tree.level, tree.morton);

        // standard deviation of luminance
        var ro = ss.standardDeviation(temp.map(function (cell) {
          return cell.luminance;
        }));

        if (ro < 18 || tree.isMaxLevel()) {
          var l = temp.length;

          // color average
          var rTotal = 0;
          var gTotal = 0;
          var bTotal = 0;

          for (var i = 0; i < l; i++) {
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

    var magnify = 2;

    canvas.width = image.width * magnify;
    canvas.height = image.height * magnify;

    console.time('draw data');
    tree.data.forEach(function (node) {
      if (node instanceof LQNode) {
        var color = Color().rgb([node.r, node.g, node.b]);
        var positive = "rgb(" + color.saturate(0.5).rgbArray().join(',') + ")";
        //let negative = `rgb(${color.clone().negate().rgbArray().join(',')})`;
        var w = image.width / pow(2, node.level);
        var h = image.height / pow(2, node.level);
        var m = Morton.reverse(node.morton);
        var left = w * m.x * magnify;
        var right = w * m.x * magnify + w * magnify;
        var top = h * m.y * magnify;
        var bottom = h * m.y * magnify + h * magnify;

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

},{"./cells":58,"./lqnode":59,"./lqtree":60,"./morton":62,"./nullnode":63,"color":1,"native-promise-only":6,"simple-statistics":7}],62:[function(require,module,exports){

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

var Morton = (function () {
  function Morton() {
    _classCallCheck(this, Morton);
  }

  _createClass(Morton, null, [{
    key: 'create',
    value: function create(x, y) {
      return Morton.bitSeperate32(x) | Morton.bitSeperate32(y) << 1;
    }
  }, {
    key: 'reverse',
    value: function reverse(n) {
      return {
        x: Morton.bitPack32(n & 0x55555555),
        y: Morton.bitPack32((n & 0xAAAAAAAA) >> 1)
      };
    }
  }, {
    key: 'bitSeperate32',
    value: function bitSeperate32(n) {
      n = (n | n << 8) & 0x00ff00ff;
      n = (n | n << 4) & 0x0f0f0f0f;
      n = (n | n << 2) & 0x33333333;
      return (n | n << 1) & 0x55555555;
    }
  }, {
    key: 'bitPack32',
    value: function bitPack32(n) {
      n = n & 0x33333333 | (n & 0x44444444) >> 1;
      n = n & 0x0f0f0f0f | (n & 0x30303030) >> 2;
      n = n & 0x00ff00ff | (n & 0x0f000f00) >> 4;
      return n & 0x0000ffff | (n & 0x00ff0000) >> 8;
    }
  }, {
    key: 'belongs',
    value: function belongs(a, b, lvl) {
      var max = arguments.length <= 3 || arguments[3] === undefined ? Morton.MAX_LVL : arguments[3];

      return a >> (max - lvl) * 2 === b;
    }
  }]);

  return Morton;
})();

Morton.MAX_LVL = 8;

module.exports = Morton;

},{}],63:[function(require,module,exports){

'use strict';

// Empty Node

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NullNode = function NullNode() {
  _classCallCheck(this, NullNode);
};

module.exports = NullNode;

},{}]},{},[61])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29sb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvY29udmVyc2lvbnMuanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9jb2xvci1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qc29uIiwibm9kZV9tb2R1bGVzL25hdGl2ZS1wcm9taXNlLW9ubHkvbGliL25wby5zcmMuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2JheWVzaWFuX2NsYXNzaWZpZXIuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Jlcm5vdWxsaV9kaXN0cmlidXRpb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Jpbm9taWFsX2Rpc3RyaWJ1dGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvY2hpX3NxdWFyZWRfZGlzdHJpYnV0aW9uX3RhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9jaGlfc3F1YXJlZF9nb29kbmVzc19vZl9maXQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2NodW5rLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9ja21lYW5zLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9jdW11bGF0aXZlX3N0ZF9ub3JtYWxfcHJvYmFiaWxpdHkuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Vwc2lsb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Vycm9yX2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9mYWN0b3JpYWwuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2dlb21ldHJpY19tZWFuLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9oYXJtb25pY19tZWFuLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9pbnRlcnF1YXJ0aWxlX3JhbmdlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9pbnZlcnNlX2Vycm9yX2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9saW5lYXJfcmVncmVzc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbGluZWFyX3JlZ3Jlc3Npb25fbGluZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbWFkLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9tYXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL21lYW4uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL21lZGlhbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbWluLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9taXhpbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbW9kZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbnVtZXJpY19zb3J0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9wZXJjZXB0cm9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9wb2lzc29uX2Rpc3RyaWJ1dGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvcHJvYml0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9xdWFudGlsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvcXVhbnRpbGVfc29ydGVkLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9yX3NxdWFyZWQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3Jvb3RfbWVhbl9zcXVhcmUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc2FtcGxlX2NvcnJlbGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfY292YXJpYW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc2FtcGxlX3NrZXduZXNzLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfc3RhbmRhcmRfZGV2aWF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfdmFyaWFuY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NodWZmbGUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NodWZmbGVfaW5fcGxhY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NvcnRlZF91bmlxdWVfY291bnQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3N0YW5kYXJkX2RldmlhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc3RhbmRhcmRfbm9ybWFsX3RhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zdW0uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvdF90ZXN0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy90X3Rlc3RfdHdvX3NhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvdmFyaWFuY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3pfc2NvcmUuanMiLCJzcmMvanMvY2VsbC5qcyIsInNyYy9qcy9jZWxscy5qcyIsInNyYy9qcy9scW5vZGUuanMiLCJzcmMvanMvbHF0cmVlLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvbW9ydG9uLmpzIiwic3JjL2pzL251bGxub2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdCQSxZQUFZOzs7O0FBQUM7O0lBS1AsSUFBSSxHQUNSLFNBREksSUFBSSxDQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTt3QkFEcEIsSUFBSTs7QUFFTixNQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixNQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLE1BQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsTUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxNQUFJLENBQUMsU0FBUyxHQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxBQUFFLENBQUM7Q0FDakU7O0FBR0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Ozs7QUNmdEIsWUFBWTs7OztBQUFDOzs7O0FBSWIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3pCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7O0lBRWYsS0FBSztBQUNULFdBREksS0FBSyxDQUNHLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFOzBCQUQ3QixLQUFLOztBQUVQLFFBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFlBQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtLQUMxQztBQUNELFFBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDZCxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDcEM7O2VBUkcsS0FBSzs7NkJBU0EsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDNUIsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsVUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsYUFBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsWUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUIsWUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0IsWUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUMsWUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDakIsV0FBQyxHQUFHLENBQUMsQ0FBQztBQUNOLFdBQUMsRUFBRSxDQUFDO1NBQ0w7T0FDRjtBQUNELGFBQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDOUI7Ozt5QkFDSSxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ2hCLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdEIsVUFBSSxNQUFNLFlBQUEsQ0FBQzs7QUFFWCxVQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsRUFBRTtBQUN2RCxhQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQ3hDOztBQUVELFlBQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQzlCLGVBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNqRCxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDcEI7QUFDRCxVQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMxQixZQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztPQUNoQztBQUNELGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztTQWpERyxLQUFLOzs7QUFvRFgsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Ozs7QUMvRHZCLFlBQVksQ0FBQzs7Ozs7Ozs7QUFFYixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDOzs7O0FBQUMsSUFJL0IsTUFBTTtZQUFOLE1BQU07O0FBQ1YsV0FESSxNQUFNLENBQ0UsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7MEJBRHBDLE1BQU07O3VFQUFOLE1BQU07O0FBSVIsVUFBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2IsVUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFVBQUssS0FBSyxHQUFHLEtBQUssQ0FBQzs7R0FDcEI7O1NBVkcsTUFBTTtHQUFTLFFBQVE7O0FBYTdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7O0FDbkJ4QixZQUFZOzs7O0FBQUM7Ozs7QUFJYixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6QixJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDOztBQUVyQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0lBRVgsTUFBTTtBQUNWLFdBREksTUFBTSxHQUNJOzBCQURWLE1BQU07O0FBRVIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRCxRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUNoQjs7ZUFQRyxNQUFNOzt3QkFRTixJQUFJLEVBQUU7QUFDUixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRS9CLFVBQUksQ0FBQyxPQUFPLEVBQUU7O0FBQUMsQUFFZixVQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ25ELFlBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkO0FBQ0QsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pEOzs7aUNBQ1k7QUFDWCxhQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQztLQUN0Qzs7O3dDQUNtQjtBQUNsQixhQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFBLEFBQUMsQ0FBQztLQUMxQzs7O3lDQUNvQjtBQUNuQixVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEMsYUFBTyxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsWUFBWSxNQUFNLENBQUM7S0FDNUQ7OztrQ0FDYSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzNCLFlBQU0sR0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0QsV0FBSyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFdkQsVUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsZUFBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO09BQ3ZCO0FBQ0QsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7S0FDN0Q7Ozs4QkFDUyxHQUFHLEVBQUU7QUFDYixVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pCLGVBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxJQUFLLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7T0FDbkQ7QUFDRCxhQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNyQjs7O1NBMUNHLE1BQU07OztBQTZDWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7OztBQzFEeEIsWUFBWTs7OztBQUFDLEFBSWIsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRS9CLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3RDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0IsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFckMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQzs7QUFFckIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFVBQUMsQ0FBQyxFQUFLOztBQUVuRCxNQUFJLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDNUMsUUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QyxPQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ2xDLGFBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNkLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxRQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ25CLFdBQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNqQyxRQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBQ3hCLFNBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFcEMsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyRCxVQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDM0IsVUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUU3QixRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RDLFdBQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTFELFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRXZFLFFBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxRCxRQUFJLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDOztBQUV4QixXQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzlCLFdBQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTs7QUFFL0IsVUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtBQUM3QixZQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2hCLE1BQU07QUFDTCxZQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7O0FBQUMsQUFHL0MsWUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJO2lCQUFLLElBQUksQ0FBQyxTQUFTO1NBQUEsQ0FBQyxDQUFDLENBQUM7O0FBRWxFLFlBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDaEMsY0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU07OztBQUFDLEFBR3BCLGNBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLGNBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLGNBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFZixlQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFCLGtCQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixrQkFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsa0JBQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ3JCLENBQUM7O0FBRUYsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN2RixNQUFNO0FBQ0wsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDMUI7T0FDRjtLQUNGO0FBQ0QsV0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFakMsUUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDOztBQUVoQixVQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3JDLFVBQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7O0FBRXZDLFdBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDMUIsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDMUIsVUFBSSxJQUFJLFlBQVksTUFBTSxFQUFFO0FBQzFCLFlBQUksS0FBSyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxZQUFJLFFBQVEsWUFBVSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRzs7QUFBQyxBQUVsRSxZQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLFlBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsWUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEMsWUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzdCLFlBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzVDLFlBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUM1QixZQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQzs7QUFFN0MsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzdCLGVBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQzs7QUFFdEQsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQzdCLGVBQU8sQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUNsQyxlQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxQixlQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QixlQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMzQixlQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM3QixlQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEIsZUFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQ2xCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0gsV0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUM5QixDQUFDLENBQUM7Q0FDSixFQUFFLEtBQUssQ0FBQyxDQUFDOzs7O0FDaEhWLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFDOzs7O0lBOEJQLE1BQU07V0FBTixNQUFNOzBCQUFOLE1BQU07OztlQUFOLE1BQU07OzJCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbEIsYUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7S0FDakU7Ozs0QkFDYyxDQUFDLEVBQUU7QUFDaEIsYUFBTztBQUNMLFNBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDbkMsU0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBLElBQUssQ0FBQyxDQUFDO09BQzNDLENBQUE7S0FDRjs7O2tDQUNvQixDQUFDLEVBQUU7QUFDdEIsT0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVLENBQUM7QUFDaEMsT0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVLENBQUM7QUFDaEMsT0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVLENBQUM7QUFDaEMsYUFBTyxDQUFDLENBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUksVUFBVSxDQUFDO0tBQ3BDOzs7OEJBQ2dCLENBQUMsRUFBRTtBQUNsQixPQUFDLEdBQUcsQUFBQyxDQUFDLEdBQUcsVUFBVSxHQUFLLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQSxJQUFLLENBQUMsQUFBQyxDQUFDO0FBQy9DLE9BQUMsR0FBRyxBQUFDLENBQUMsR0FBRyxVQUFVLEdBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBLElBQUssQ0FBQyxBQUFDLENBQUM7QUFDL0MsT0FBQyxHQUFHLEFBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUEsSUFBSyxDQUFDLEFBQUMsQ0FBQztBQUMvQyxhQUFPLEFBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUEsSUFBSyxDQUFDLEFBQUMsQ0FBQztLQUNuRDs7OzRCQUNjLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUF3QjtVQUF0QixHQUFHLHlEQUFHLE1BQU0sQ0FBQyxPQUFPOztBQUM1QyxhQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUEsR0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ25DOzs7U0F4QkcsTUFBTTs7O0FBMkJaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOztBQUVuQixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7OztBQzNEeEIsWUFBWTs7OztBQUFDOztJQUlQLFFBQVEsWUFBUixRQUFRO3dCQUFSLFFBQVE7OztBQUVkLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIE1JVCBsaWNlbnNlICovXG52YXIgY29udmVydCA9IHJlcXVpcmUoXCJjb2xvci1jb252ZXJ0XCIpLFxuICAgIHN0cmluZyA9IHJlcXVpcmUoXCJjb2xvci1zdHJpbmdcIik7XG5cbnZhciBDb2xvciA9IGZ1bmN0aW9uKG9iaikge1xuICBpZiAob2JqIGluc3RhbmNlb2YgQ29sb3IpIHJldHVybiBvYmo7XG4gIGlmICghICh0aGlzIGluc3RhbmNlb2YgQ29sb3IpKSByZXR1cm4gbmV3IENvbG9yKG9iaik7XG5cbiAgIHRoaXMudmFsdWVzID0ge1xuICAgICAgcmdiOiBbMCwgMCwgMF0sXG4gICAgICBoc2w6IFswLCAwLCAwXSxcbiAgICAgIGhzdjogWzAsIDAsIDBdLFxuICAgICAgaHdiOiBbMCwgMCwgMF0sXG4gICAgICBjbXlrOiBbMCwgMCwgMCwgMF0sXG4gICAgICBhbHBoYTogMVxuICAgfVxuXG4gICAvLyBwYXJzZSBDb2xvcigpIGFyZ3VtZW50XG4gICBpZiAodHlwZW9mIG9iaiA9PSBcInN0cmluZ1wiKSB7XG4gICAgICB2YXIgdmFscyA9IHN0cmluZy5nZXRSZ2JhKG9iaik7XG4gICAgICBpZiAodmFscykge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJyZ2JcIiwgdmFscyk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHMgPSBzdHJpbmcuZ2V0SHNsYShvYmopKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB2YWxzKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFscyA9IHN0cmluZy5nZXRId2Iob2JqKSkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJod2JcIiwgdmFscyk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gc3RyaW5nIFxcXCJcIiArIG9iaiArIFwiXFxcIlwiKTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKHR5cGVvZiBvYmogPT0gXCJvYmplY3RcIikge1xuICAgICAgdmFyIHZhbHMgPSBvYmo7XG4gICAgICBpZih2YWxzW1wiclwiXSAhPT0gdW5kZWZpbmVkIHx8IHZhbHNbXCJyZWRcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJyZ2JcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFsc1tcImxcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1wibGlnaHRuZXNzXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHNbXCJ2XCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcInZhbHVlXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHN2XCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHNbXCJ3XCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcIndoaXRlbmVzc1wiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcImh3YlwiLCB2YWxzKVxuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzW1wiY1wiXSAhPT0gdW5kZWZpbmVkIHx8IHZhbHNbXCJjeWFuXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiY215a1wiLCB2YWxzKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBwYXJzZSBjb2xvciBmcm9tIG9iamVjdCBcIiArIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgICAgfVxuICAgfVxufVxuXG5Db2xvci5wcm90b3R5cGUgPSB7XG4gICByZ2I6IGZ1bmN0aW9uICh2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcInJnYlwiLCBhcmd1bWVudHMpO1xuICAgfSxcbiAgIGhzbDogZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3BhY2UoXCJoc2xcIiwgYXJndW1lbnRzKTtcbiAgIH0sXG4gICBoc3Y6IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwiaHN2XCIsIGFyZ3VtZW50cyk7XG4gICB9LFxuICAgaHdiOiBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcImh3YlwiLCBhcmd1bWVudHMpO1xuICAgfSxcbiAgIGNteWs6IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwiY215a1wiLCBhcmd1bWVudHMpO1xuICAgfSxcblxuICAgcmdiQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLnJnYjtcbiAgIH0sXG4gICBoc2xBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMuaHNsO1xuICAgfSxcbiAgIGhzdkFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5oc3Y7XG4gICB9LFxuICAgaHdiQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudmFsdWVzLmFscGhhICE9PSAxKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5od2IuY29uY2F0KFt0aGlzLnZhbHVlcy5hbHBoYV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMuaHdiO1xuICAgfSxcbiAgIGNteWtBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMuY215aztcbiAgIH0sXG4gICByZ2JhQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcbiAgICAgIHJldHVybiByZ2IuY29uY2F0KFt0aGlzLnZhbHVlcy5hbHBoYV0pO1xuICAgfSxcbiAgIGhzbGFBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaHNsID0gdGhpcy52YWx1ZXMuaHNsO1xuICAgICAgcmV0dXJuIGhzbC5jb25jYXQoW3RoaXMudmFsdWVzLmFscGhhXSk7XG4gICB9LFxuICAgYWxwaGE6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICByZXR1cm4gdGhpcy52YWx1ZXMuYWxwaGE7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImFscGhhXCIsIHZhbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIHJlZDogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwicmdiXCIsIDAsIHZhbCk7XG4gICB9LFxuICAgZ3JlZW46IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcInJnYlwiLCAxLCB2YWwpO1xuICAgfSxcbiAgIGJsdWU6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcInJnYlwiLCAyLCB2YWwpO1xuICAgfSxcbiAgIGh1ZTogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHNsXCIsIDAsIHZhbCk7XG4gICB9LFxuICAgc2F0dXJhdGlvbjogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHNsXCIsIDEsIHZhbCk7XG4gICB9LFxuICAgbGlnaHRuZXNzOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJoc2xcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICBzYXR1cmF0aW9udjogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHN2XCIsIDEsIHZhbCk7XG4gICB9LFxuICAgd2hpdGVuZXNzOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJod2JcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICBibGFja25lc3M6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImh3YlwiLCAyLCB2YWwpO1xuICAgfSxcbiAgIHZhbHVlOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJoc3ZcIiwgMiwgdmFsKTtcbiAgIH0sXG4gICBjeWFuOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJjbXlrXCIsIDAsIHZhbCk7XG4gICB9LFxuICAgbWFnZW50YTogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiY215a1wiLCAxLCB2YWwpO1xuICAgfSxcbiAgIHllbGxvdzogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiY215a1wiLCAyLCB2YWwpO1xuICAgfSxcbiAgIGJsYWNrOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJjbXlrXCIsIDMsIHZhbCk7XG4gICB9LFxuXG4gICBoZXhTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5oZXhTdHJpbmcodGhpcy52YWx1ZXMucmdiKTtcbiAgIH0sXG4gICByZ2JTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5yZ2JTdHJpbmcodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuICAgcmdiYVN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnJnYmFTdHJpbmcodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuICAgcGVyY2VudFN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnBlcmNlbnRTdHJpbmcodGhpcy52YWx1ZXMucmdiLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuICAgaHNsU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcuaHNsU3RyaW5nKHRoaXMudmFsdWVzLmhzbCwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcbiAgIGhzbGFTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5oc2xhU3RyaW5nKHRoaXMudmFsdWVzLmhzbCwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcbiAgIGh3YlN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLmh3YlN0cmluZyh0aGlzLnZhbHVlcy5od2IsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG4gICBrZXl3b3JkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcua2V5d29yZCh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG5cbiAgIHJnYk51bWJlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKHRoaXMudmFsdWVzLnJnYlswXSA8PCAxNikgfCAodGhpcy52YWx1ZXMucmdiWzFdIDw8IDgpIHwgdGhpcy52YWx1ZXMucmdiWzJdO1xuICAgfSxcblxuICAgbHVtaW5vc2l0eTogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI3JlbGF0aXZlbHVtaW5hbmNlZGVmXG4gICAgICB2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuICAgICAgdmFyIGx1bSA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHZhciBjaGFuID0gcmdiW2ldIC8gMjU1O1xuICAgICAgICAgbHVtW2ldID0gKGNoYW4gPD0gMC4wMzkyOCkgPyBjaGFuIC8gMTIuOTJcbiAgICAgICAgICAgICAgICAgIDogTWF0aC5wb3coKChjaGFuICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpXG4gICAgICB9XG4gICAgICByZXR1cm4gMC4yMTI2ICogbHVtWzBdICsgMC43MTUyICogbHVtWzFdICsgMC4wNzIyICogbHVtWzJdO1xuICAgfSxcblxuICAgY29udHJhc3Q6IGZ1bmN0aW9uKGNvbG9yMikge1xuICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvV0NBRzIwLyNjb250cmFzdC1yYXRpb2RlZlxuICAgICAgdmFyIGx1bTEgPSB0aGlzLmx1bWlub3NpdHkoKTtcbiAgICAgIHZhciBsdW0yID0gY29sb3IyLmx1bWlub3NpdHkoKTtcbiAgICAgIGlmIChsdW0xID4gbHVtMikge1xuICAgICAgICAgcmV0dXJuIChsdW0xICsgMC4wNSkgLyAobHVtMiArIDAuMDUpXG4gICAgICB9O1xuICAgICAgcmV0dXJuIChsdW0yICsgMC4wNSkgLyAobHVtMSArIDAuMDUpO1xuICAgfSxcblxuICAgbGV2ZWw6IGZ1bmN0aW9uKGNvbG9yMikge1xuICAgICB2YXIgY29udHJhc3RSYXRpbyA9IHRoaXMuY29udHJhc3QoY29sb3IyKTtcbiAgICAgcmV0dXJuIChjb250cmFzdFJhdGlvID49IDcuMSlcbiAgICAgICA/ICdBQUEnXG4gICAgICAgOiAoY29udHJhc3RSYXRpbyA+PSA0LjUpXG4gICAgICAgID8gJ0FBJ1xuICAgICAgICA6ICcnO1xuICAgfSxcblxuICAgZGFyazogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBZSVEgZXF1YXRpb24gZnJvbSBodHRwOi8vMjR3YXlzLm9yZy8yMDEwL2NhbGN1bGF0aW5nLWNvbG9yLWNvbnRyYXN0XG4gICAgICB2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiLFxuICAgICAgICAgIHlpcSA9IChyZ2JbMF0gKiAyOTkgKyByZ2JbMV0gKiA1ODcgKyByZ2JbMl0gKiAxMTQpIC8gMTAwMDtcbiAgICAgIHJldHVybiB5aXEgPCAxMjg7XG4gICB9LFxuXG4gICBsaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXRoaXMuZGFyaygpO1xuICAgfSxcblxuICAgbmVnYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZ2IgPSBbXVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IDI1NSAtIHRoaXMudmFsdWVzLnJnYltpXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwicmdiXCIsIHJnYik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIGxpZ2h0ZW46IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnZhbHVlcy5oc2xbMl0gKz0gdGhpcy52YWx1ZXMuaHNsWzJdICogcmF0aW87XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB0aGlzLnZhbHVlcy5oc2wpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBkYXJrZW46IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnZhbHVlcy5oc2xbMl0gLT0gdGhpcy52YWx1ZXMuaHNsWzJdICogcmF0aW87XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB0aGlzLnZhbHVlcy5oc2wpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBzYXR1cmF0ZTogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMudmFsdWVzLmhzbFsxXSArPSB0aGlzLnZhbHVlcy5oc2xbMV0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzLmhzbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIGRlc2F0dXJhdGU6IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnZhbHVlcy5oc2xbMV0gLT0gdGhpcy52YWx1ZXMuaHNsWzFdICogcmF0aW87XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB0aGlzLnZhbHVlcy5oc2wpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICB3aGl0ZW46IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnZhbHVlcy5od2JbMV0gKz0gdGhpcy52YWx1ZXMuaHdiWzFdICogcmF0aW87XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImh3YlwiLCB0aGlzLnZhbHVlcy5od2IpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBibGFja2VuOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy52YWx1ZXMuaHdiWzJdICs9IHRoaXMudmFsdWVzLmh3YlsyXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJod2JcIiwgdGhpcy52YWx1ZXMuaHdiKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgZ3JleXNjYWxlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG4gICAgICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYXlzY2FsZSNDb252ZXJ0aW5nX2NvbG9yX3RvX2dyYXlzY2FsZVxuICAgICAgdmFyIHZhbCA9IHJnYlswXSAqIDAuMyArIHJnYlsxXSAqIDAuNTkgKyByZ2JbMl0gKiAwLjExO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJyZ2JcIiwgW3ZhbCwgdmFsLCB2YWxdKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgY2xlYXJlcjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiYWxwaGFcIiwgdGhpcy52YWx1ZXMuYWxwaGEgLSAodGhpcy52YWx1ZXMuYWxwaGEgKiByYXRpbykpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBvcGFxdWVyOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJhbHBoYVwiLCB0aGlzLnZhbHVlcy5hbHBoYSArICh0aGlzLnZhbHVlcy5hbHBoYSAqIHJhdGlvKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIHJvdGF0ZTogZnVuY3Rpb24oZGVncmVlcykge1xuICAgICAgdmFyIGh1ZSA9IHRoaXMudmFsdWVzLmhzbFswXTtcbiAgICAgIGh1ZSA9IChodWUgKyBkZWdyZWVzKSAlIDM2MDtcbiAgICAgIGh1ZSA9IGh1ZSA8IDAgPyAzNjAgKyBodWUgOiBodWU7XG4gICAgICB0aGlzLnZhbHVlcy5oc2xbMF0gPSBodWU7XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImhzbFwiLCB0aGlzLnZhbHVlcy5oc2wpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICAvKipcbiAgICAqIFBvcnRlZCBmcm9tIHNhc3MgaW1wbGVtZW50YXRpb24gaW4gQ1xuICAgICogaHR0cHM6Ly9naXRodWIuY29tL3Nhc3MvbGlic2Fzcy9ibG9iLzBlNmI0YTI4NTAwOTIzNTZhYTNlY2UwN2M2YjI0OWYwMjIxY2FjZWQvZnVuY3Rpb25zLmNwcCNMMjA5XG4gICAgKi9cbiAgIG1peDogZnVuY3Rpb24obWl4aW5Db2xvciwgd2VpZ2h0KSB7XG4gICAgICB2YXIgY29sb3IxID0gdGhpcztcbiAgICAgIHZhciBjb2xvcjIgPSBtaXhpbkNvbG9yO1xuICAgICAgdmFyIHAgPSB3ZWlnaHQgIT09IHVuZGVmaW5lZCA/IHdlaWdodCA6IDAuNTtcblxuICAgICAgdmFyIHcgPSAyICogcCAtIDE7XG4gICAgICB2YXIgYSA9IGNvbG9yMS5hbHBoYSgpIC0gY29sb3IyLmFscGhhKCk7XG5cbiAgICAgIHZhciB3MSA9ICgoKHcgKiBhID09IC0xKSA/IHcgOiAodyArIGEpLygxICsgdyphKSkgKyAxKSAvIDIuMDtcbiAgICAgIHZhciB3MiA9IDEgLSB3MTtcblxuICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgLnJnYihcbiAgICAgICAgICB3MSAqIGNvbG9yMS5yZWQoKSArIHcyICogY29sb3IyLnJlZCgpLFxuICAgICAgICAgIHcxICogY29sb3IxLmdyZWVuKCkgKyB3MiAqIGNvbG9yMi5ncmVlbigpLFxuICAgICAgICAgIHcxICogY29sb3IxLmJsdWUoKSArIHcyICogY29sb3IyLmJsdWUoKVxuICAgICAgICApXG4gICAgICAgIC5hbHBoYShjb2xvcjEuYWxwaGEoKSAqIHAgKyBjb2xvcjIuYWxwaGEoKSAqICgxIC0gcCkpO1xuICAgfSxcblxuICAgdG9KU09OOiBmdW5jdGlvbigpIHtcbiAgICAgcmV0dXJuIHRoaXMucmdiKCk7XG4gICB9LFxuXG4gICBjbG9uZTogZnVuY3Rpb24oKSB7XG4gICAgIHJldHVybiBuZXcgQ29sb3IodGhpcy5yZ2IoKSk7XG4gICB9XG59XG5cblxuQ29sb3IucHJvdG90eXBlLmdldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlKSB7XG4gICB2YXIgdmFscyA9IHt9O1xuICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFsc1tzcGFjZS5jaGFyQXQoaSldID0gdGhpcy52YWx1ZXNbc3BhY2VdW2ldO1xuICAgfVxuICAgaWYgKHRoaXMudmFsdWVzLmFscGhhICE9IDEpIHtcbiAgICAgIHZhbHNbXCJhXCJdID0gdGhpcy52YWx1ZXMuYWxwaGE7XG4gICB9XG4gICAvLyB7cjogMjU1LCBnOiAyNTUsIGI6IDI1NSwgYTogMC40fVxuICAgcmV0dXJuIHZhbHM7XG59XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSwgdmFscykge1xuICAgdmFyIHNwYWNlcyA9IHtcbiAgICAgIFwicmdiXCI6IFtcInJlZFwiLCBcImdyZWVuXCIsIFwiYmx1ZVwiXSxcbiAgICAgIFwiaHNsXCI6IFtcImh1ZVwiLCBcInNhdHVyYXRpb25cIiwgXCJsaWdodG5lc3NcIl0sXG4gICAgICBcImhzdlwiOiBbXCJodWVcIiwgXCJzYXR1cmF0aW9uXCIsIFwidmFsdWVcIl0sXG4gICAgICBcImh3YlwiOiBbXCJodWVcIiwgXCJ3aGl0ZW5lc3NcIiwgXCJibGFja25lc3NcIl0sXG4gICAgICBcImNteWtcIjogW1wiY3lhblwiLCBcIm1hZ2VudGFcIiwgXCJ5ZWxsb3dcIiwgXCJibGFja1wiXVxuICAgfTtcblxuICAgdmFyIG1heGVzID0ge1xuICAgICAgXCJyZ2JcIjogWzI1NSwgMjU1LCAyNTVdLFxuICAgICAgXCJoc2xcIjogWzM2MCwgMTAwLCAxMDBdLFxuICAgICAgXCJoc3ZcIjogWzM2MCwgMTAwLCAxMDBdLFxuICAgICAgXCJod2JcIjogWzM2MCwgMTAwLCAxMDBdLFxuICAgICAgXCJjbXlrXCI6IFsxMDAsIDEwMCwgMTAwLCAxMDBdXG4gICB9O1xuXG4gICB2YXIgYWxwaGEgPSAxO1xuICAgaWYgKHNwYWNlID09IFwiYWxwaGFcIikge1xuICAgICAgYWxwaGEgPSB2YWxzO1xuICAgfVxuICAgZWxzZSBpZiAodmFscy5sZW5ndGgpIHtcbiAgICAgIC8vIFsxMCwgMTAsIDEwXVxuICAgICAgdGhpcy52YWx1ZXNbc3BhY2VdID0gdmFscy5zbGljZSgwLCBzcGFjZS5sZW5ndGgpO1xuICAgICAgYWxwaGEgPSB2YWxzW3NwYWNlLmxlbmd0aF07XG4gICB9XG4gICBlbHNlIGlmICh2YWxzW3NwYWNlLmNoYXJBdCgwKV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8ge3I6IDEwLCBnOiAxMCwgYjogMTB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMudmFsdWVzW3NwYWNlXVtpXSA9IHZhbHNbc3BhY2UuY2hhckF0KGkpXTtcbiAgICAgIH1cbiAgICAgIGFscGhhID0gdmFscy5hO1xuICAgfVxuICAgZWxzZSBpZiAodmFsc1tzcGFjZXNbc3BhY2VdWzBdXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB7cmVkOiAxMCwgZ3JlZW46IDEwLCBibHVlOiAxMH1cbiAgICAgIHZhciBjaGFucyA9IHNwYWNlc1tzcGFjZV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMudmFsdWVzW3NwYWNlXVtpXSA9IHZhbHNbY2hhbnNbaV1dO1xuICAgICAgfVxuICAgICAgYWxwaGEgPSB2YWxzLmFscGhhO1xuICAgfVxuICAgdGhpcy52YWx1ZXMuYWxwaGEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCAoYWxwaGEgIT09IHVuZGVmaW5lZCA/IGFscGhhIDogdGhpcy52YWx1ZXMuYWxwaGEpICkpO1xuICAgaWYgKHNwYWNlID09IFwiYWxwaGFcIikge1xuICAgICAgcmV0dXJuO1xuICAgfVxuXG4gICAvLyBjYXAgdmFsdWVzIG9mIHRoZSBzcGFjZSBwcmlvciBjb252ZXJ0aW5nIGFsbCB2YWx1ZXNcbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjYXBwZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhlc1tzcGFjZV1baV0sIHRoaXMudmFsdWVzW3NwYWNlXVtpXSkpO1xuICAgICAgdGhpcy52YWx1ZXNbc3BhY2VdW2ldID0gTWF0aC5yb3VuZChjYXBwZWQpO1xuICAgfVxuXG4gICAvLyBjb252ZXJ0IHRvIGFsbCB0aGUgb3RoZXIgY29sb3Igc3BhY2VzXG4gICBmb3IgKHZhciBzbmFtZSBpbiBzcGFjZXMpIHtcbiAgICAgIGlmIChzbmFtZSAhPSBzcGFjZSkge1xuICAgICAgICAgdGhpcy52YWx1ZXNbc25hbWVdID0gY29udmVydFtzcGFjZV1bc25hbWVdKHRoaXMudmFsdWVzW3NwYWNlXSlcbiAgICAgIH1cblxuICAgICAgLy8gY2FwIHZhbHVlc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbmFtZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgdmFyIGNhcHBlZCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG1heGVzW3NuYW1lXVtpXSwgdGhpcy52YWx1ZXNbc25hbWVdW2ldKSk7XG4gICAgICAgICB0aGlzLnZhbHVlc1tzbmFtZV1baV0gPSBNYXRoLnJvdW5kKGNhcHBlZCk7XG4gICAgICB9XG4gICB9XG4gICByZXR1cm4gdHJ1ZTtcbn1cblxuQ29sb3IucHJvdG90eXBlLnNldFNwYWNlID0gZnVuY3Rpb24oc3BhY2UsIGFyZ3MpIHtcbiAgIHZhciB2YWxzID0gYXJnc1swXTtcbiAgIGlmICh2YWxzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGNvbG9yLnJnYigpXG4gICAgICByZXR1cm4gdGhpcy5nZXRWYWx1ZXMoc3BhY2UpO1xuICAgfVxuICAgLy8gY29sb3IucmdiKDEwLCAxMCwgMTApXG4gICBpZiAodHlwZW9mIHZhbHMgPT0gXCJudW1iZXJcIikge1xuICAgICAgdmFscyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuICAgfVxuICAgdGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHZhbHMpO1xuICAgcmV0dXJuIHRoaXM7XG59XG5cbkNvbG9yLnByb3RvdHlwZS5zZXRDaGFubmVsID0gZnVuY3Rpb24oc3BhY2UsIGluZGV4LCB2YWwpIHtcbiAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gY29sb3IucmVkKClcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlc1tzcGFjZV1baW5kZXhdO1xuICAgfVxuICAgLy8gY29sb3IucmVkKDEwMClcbiAgIHRoaXMudmFsdWVzW3NwYWNlXVtpbmRleF0gPSB2YWw7XG4gICB0aGlzLnNldFZhbHVlcyhzcGFjZSwgdGhpcy52YWx1ZXNbc3BhY2VdKTtcbiAgIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG9yO1xuIiwiLyogTUlUIGxpY2Vuc2UgKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJnYjJoc2w6IHJnYjJoc2wsXG4gIHJnYjJoc3Y6IHJnYjJoc3YsXG4gIHJnYjJod2I6IHJnYjJod2IsXG4gIHJnYjJjbXlrOiByZ2IyY215ayxcbiAgcmdiMmtleXdvcmQ6IHJnYjJrZXl3b3JkLFxuICByZ2IyeHl6OiByZ2IyeHl6LFxuICByZ2IybGFiOiByZ2IybGFiLFxuICByZ2IybGNoOiByZ2IybGNoLFxuXG4gIGhzbDJyZ2I6IGhzbDJyZ2IsXG4gIGhzbDJoc3Y6IGhzbDJoc3YsXG4gIGhzbDJod2I6IGhzbDJod2IsXG4gIGhzbDJjbXlrOiBoc2wyY215ayxcbiAgaHNsMmtleXdvcmQ6IGhzbDJrZXl3b3JkLFxuXG4gIGhzdjJyZ2I6IGhzdjJyZ2IsXG4gIGhzdjJoc2w6IGhzdjJoc2wsXG4gIGhzdjJod2I6IGhzdjJod2IsXG4gIGhzdjJjbXlrOiBoc3YyY215ayxcbiAgaHN2MmtleXdvcmQ6IGhzdjJrZXl3b3JkLFxuXG4gIGh3YjJyZ2I6IGh3YjJyZ2IsXG4gIGh3YjJoc2w6IGh3YjJoc2wsXG4gIGh3YjJoc3Y6IGh3YjJoc3YsXG4gIGh3YjJjbXlrOiBod2IyY215ayxcbiAgaHdiMmtleXdvcmQ6IGh3YjJrZXl3b3JkLFxuXG4gIGNteWsycmdiOiBjbXlrMnJnYixcbiAgY215azJoc2w6IGNteWsyaHNsLFxuICBjbXlrMmhzdjogY215azJoc3YsXG4gIGNteWsyaHdiOiBjbXlrMmh3YixcbiAgY215azJrZXl3b3JkOiBjbXlrMmtleXdvcmQsXG5cbiAga2V5d29yZDJyZ2I6IGtleXdvcmQycmdiLFxuICBrZXl3b3JkMmhzbDoga2V5d29yZDJoc2wsXG4gIGtleXdvcmQyaHN2OiBrZXl3b3JkMmhzdixcbiAga2V5d29yZDJod2I6IGtleXdvcmQyaHdiLFxuICBrZXl3b3JkMmNteWs6IGtleXdvcmQyY215ayxcbiAga2V5d29yZDJsYWI6IGtleXdvcmQybGFiLFxuICBrZXl3b3JkMnh5ejoga2V5d29yZDJ4eXosXG5cbiAgeHl6MnJnYjogeHl6MnJnYixcbiAgeHl6MmxhYjogeHl6MmxhYixcbiAgeHl6MmxjaDogeHl6MmxjaCxcblxuICBsYWIyeHl6OiBsYWIyeHl6LFxuICBsYWIycmdiOiBsYWIycmdiLFxuICBsYWIybGNoOiBsYWIybGNoLFxuXG4gIGxjaDJsYWI6IGxjaDJsYWIsXG4gIGxjaDJ4eXo6IGxjaDJ4eXosXG4gIGxjaDJyZ2I6IGxjaDJyZ2Jcbn1cblxuXG5mdW5jdGlvbiByZ2IyaHNsKHJnYikge1xuICB2YXIgciA9IHJnYlswXS8yNTUsXG4gICAgICBnID0gcmdiWzFdLzI1NSxcbiAgICAgIGIgPSByZ2JbMl0vMjU1LFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgaCwgcywgbDtcblxuICBpZiAobWF4ID09IG1pbilcbiAgICBoID0gMDtcbiAgZWxzZSBpZiAociA9PSBtYXgpXG4gICAgaCA9IChnIC0gYikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoZyA9PSBtYXgpXG4gICAgaCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGIgPT0gbWF4KVxuICAgIGggPSA0ICsgKHIgLSBnKS8gZGVsdGE7XG5cbiAgaCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuICBpZiAoaCA8IDApXG4gICAgaCArPSAzNjA7XG5cbiAgbCA9IChtaW4gKyBtYXgpIC8gMjtcblxuICBpZiAobWF4ID09IG1pbilcbiAgICBzID0gMDtcbiAgZWxzZSBpZiAobCA8PSAwLjUpXG4gICAgcyA9IGRlbHRhIC8gKG1heCArIG1pbik7XG4gIGVsc2VcbiAgICBzID0gZGVsdGEgLyAoMiAtIG1heCAtIG1pbik7XG5cbiAgcmV0dXJuIFtoLCBzICogMTAwLCBsICogMTAwXTtcbn1cblxuZnVuY3Rpb24gcmdiMmhzdihyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0sXG4gICAgICBnID0gcmdiWzFdLFxuICAgICAgYiA9IHJnYlsyXSxcbiAgICAgIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpLFxuICAgICAgbWF4ID0gTWF0aC5tYXgociwgZywgYiksXG4gICAgICBkZWx0YSA9IG1heCAtIG1pbixcbiAgICAgIGgsIHMsIHY7XG5cbiAgaWYgKG1heCA9PSAwKVxuICAgIHMgPSAwO1xuICBlbHNlXG4gICAgcyA9IChkZWx0YS9tYXggKiAxMDAwKS8xMDtcblxuICBpZiAobWF4ID09IG1pbilcbiAgICBoID0gMDtcbiAgZWxzZSBpZiAociA9PSBtYXgpXG4gICAgaCA9IChnIC0gYikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoZyA9PSBtYXgpXG4gICAgaCA9IDIgKyAoYiAtIHIpIC8gZGVsdGE7XG4gIGVsc2UgaWYgKGIgPT0gbWF4KVxuICAgIGggPSA0ICsgKHIgLSBnKSAvIGRlbHRhO1xuXG4gIGggPSBNYXRoLm1pbihoICogNjAsIDM2MCk7XG5cbiAgaWYgKGggPCAwKVxuICAgIGggKz0gMzYwO1xuXG4gIHYgPSAoKG1heCAvIDI1NSkgKiAxMDAwKSAvIDEwO1xuXG4gIHJldHVybiBbaCwgcywgdl07XG59XG5cbmZ1bmN0aW9uIHJnYjJod2IocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLFxuICAgICAgZyA9IHJnYlsxXSxcbiAgICAgIGIgPSByZ2JbMl0sXG4gICAgICBoID0gcmdiMmhzbChyZ2IpWzBdLFxuICAgICAgdyA9IDEvMjU1ICogTWF0aC5taW4ociwgTWF0aC5taW4oZywgYikpLFxuICAgICAgYiA9IDEgLSAxLzI1NSAqIE1hdGgubWF4KHIsIE1hdGgubWF4KGcsIGIpKTtcblxuICByZXR1cm4gW2gsIHcgKiAxMDAsIGIgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IyY215ayhyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0gLyAyNTUsXG4gICAgICBnID0gcmdiWzFdIC8gMjU1LFxuICAgICAgYiA9IHJnYlsyXSAvIDI1NSxcbiAgICAgIGMsIG0sIHksIGs7XG5cbiAgayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpO1xuICBjID0gKDEgLSByIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIG0gPSAoMSAtIGcgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgeSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICByZXR1cm4gW2MgKiAxMDAsIG0gKiAxMDAsIHkgKiAxMDAsIGsgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2Iya2V5d29yZChyZ2IpIHtcbiAgcmV0dXJuIHJldmVyc2VLZXl3b3Jkc1tKU09OLnN0cmluZ2lmeShyZ2IpXTtcbn1cblxuZnVuY3Rpb24gcmdiMnh5eihyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0gLyAyNTUsXG4gICAgICBnID0gcmdiWzFdIC8gMjU1LFxuICAgICAgYiA9IHJnYlsyXSAvIDI1NTtcblxuICAvLyBhc3N1bWUgc1JHQlxuICByID0gciA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKHIgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAociAvIDEyLjkyKTtcbiAgZyA9IGcgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChnICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGcgLyAxMi45Mik7XG4gIGIgPSBiID4gMC4wNDA0NSA/IE1hdGgucG93KCgoYiArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChiIC8gMTIuOTIpO1xuXG4gIHZhciB4ID0gKHIgKiAwLjQxMjQpICsgKGcgKiAwLjM1NzYpICsgKGIgKiAwLjE4MDUpO1xuICB2YXIgeSA9IChyICogMC4yMTI2KSArIChnICogMC43MTUyKSArIChiICogMC4wNzIyKTtcbiAgdmFyIHogPSAociAqIDAuMDE5MykgKyAoZyAqIDAuMTE5MikgKyAoYiAqIDAuOTUwNSk7XG5cbiAgcmV0dXJuIFt4ICogMTAwLCB5ICoxMDAsIHogKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IybGFiKHJnYikge1xuICB2YXIgeHl6ID0gcmdiMnh5eihyZ2IpLFxuICAgICAgICB4ID0geHl6WzBdLFxuICAgICAgICB5ID0geHl6WzFdLFxuICAgICAgICB6ID0geHl6WzJdLFxuICAgICAgICBsLCBhLCBiO1xuXG4gIHggLz0gOTUuMDQ3O1xuICB5IC89IDEwMDtcbiAgeiAvPSAxMDguODgzO1xuXG4gIHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxLzMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuICB5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMS8zKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcbiAgeiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEvMykgOiAoNy43ODcgKiB6KSArICgxNiAvIDExNik7XG5cbiAgbCA9ICgxMTYgKiB5KSAtIDE2O1xuICBhID0gNTAwICogKHggLSB5KTtcbiAgYiA9IDIwMCAqICh5IC0geik7XG5cbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuZnVuY3Rpb24gcmdiMmxjaChhcmdzKSB7XG4gIHJldHVybiBsYWIybGNoKHJnYjJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wycmdiKGhzbCkge1xuICB2YXIgaCA9IGhzbFswXSAvIDM2MCxcbiAgICAgIHMgPSBoc2xbMV0gLyAxMDAsXG4gICAgICBsID0gaHNsWzJdIC8gMTAwLFxuICAgICAgdDEsIHQyLCB0MywgcmdiLCB2YWw7XG5cbiAgaWYgKHMgPT0gMCkge1xuICAgIHZhbCA9IGwgKiAyNTU7XG4gICAgcmV0dXJuIFt2YWwsIHZhbCwgdmFsXTtcbiAgfVxuXG4gIGlmIChsIDwgMC41KVxuICAgIHQyID0gbCAqICgxICsgcyk7XG4gIGVsc2VcbiAgICB0MiA9IGwgKyBzIC0gbCAqIHM7XG4gIHQxID0gMiAqIGwgLSB0MjtcblxuICByZ2IgPSBbMCwgMCwgMF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgdDMgPSBoICsgMSAvIDMgKiAtIChpIC0gMSk7XG4gICAgdDMgPCAwICYmIHQzKys7XG4gICAgdDMgPiAxICYmIHQzLS07XG5cbiAgICBpZiAoNiAqIHQzIDwgMSlcbiAgICAgIHZhbCA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzO1xuICAgIGVsc2UgaWYgKDIgKiB0MyA8IDEpXG4gICAgICB2YWwgPSB0MjtcbiAgICBlbHNlIGlmICgzICogdDMgPCAyKVxuICAgICAgdmFsID0gdDEgKyAodDIgLSB0MSkgKiAoMiAvIDMgLSB0MykgKiA2O1xuICAgIGVsc2VcbiAgICAgIHZhbCA9IHQxO1xuXG4gICAgcmdiW2ldID0gdmFsICogMjU1O1xuICB9XG5cbiAgcmV0dXJuIHJnYjtcbn1cblxuZnVuY3Rpb24gaHNsMmhzdihoc2wpIHtcbiAgdmFyIGggPSBoc2xbMF0sXG4gICAgICBzID0gaHNsWzFdIC8gMTAwLFxuICAgICAgbCA9IGhzbFsyXSAvIDEwMCxcbiAgICAgIHN2LCB2O1xuXG4gIGlmKGwgPT09IDApIHtcbiAgICAgIC8vIG5vIG5lZWQgdG8gZG8gY2FsYyBvbiBibGFja1xuICAgICAgLy8gYWxzbyBhdm9pZHMgZGl2aWRlIGJ5IDAgZXJyb3JcbiAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gIH1cblxuICBsICo9IDI7XG4gIHMgKj0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG4gIHYgPSAobCArIHMpIC8gMjtcbiAgc3YgPSAoMiAqIHMpIC8gKGwgKyBzKTtcbiAgcmV0dXJuIFtoLCBzdiAqIDEwMCwgdiAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIGhzbDJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3Yihoc2wycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHNsMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGhzbDJyZ2IoYXJncykpO1xufVxuXG5cbmZ1bmN0aW9uIGhzdjJyZ2IoaHN2KSB7XG4gIHZhciBoID0gaHN2WzBdIC8gNjAsXG4gICAgICBzID0gaHN2WzFdIC8gMTAwLFxuICAgICAgdiA9IGhzdlsyXSAvIDEwMCxcbiAgICAgIGhpID0gTWF0aC5mbG9vcihoKSAlIDY7XG5cbiAgdmFyIGYgPSBoIC0gTWF0aC5mbG9vcihoKSxcbiAgICAgIHAgPSAyNTUgKiB2ICogKDEgLSBzKSxcbiAgICAgIHEgPSAyNTUgKiB2ICogKDEgLSAocyAqIGYpKSxcbiAgICAgIHQgPSAyNTUgKiB2ICogKDEgLSAocyAqICgxIC0gZikpKSxcbiAgICAgIHYgPSAyNTUgKiB2O1xuXG4gIHN3aXRjaChoaSkge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBbdiwgdCwgcF07XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIFtxLCB2LCBwXTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gW3AsIHYsIHRdO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBbcCwgcSwgdl07XG4gICAgY2FzZSA0OlxuICAgICAgcmV0dXJuIFt0LCBwLCB2XTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gW3YsIHAsIHFdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhzdjJoc2woaHN2KSB7XG4gIHZhciBoID0gaHN2WzBdLFxuICAgICAgcyA9IGhzdlsxXSAvIDEwMCxcbiAgICAgIHYgPSBoc3ZbMl0gLyAxMDAsXG4gICAgICBzbCwgbDtcblxuICBsID0gKDIgLSBzKSAqIHY7XG4gIHNsID0gcyAqIHY7XG4gIHNsIC89IChsIDw9IDEpID8gbCA6IDIgLSBsO1xuICBzbCA9IHNsIHx8IDA7XG4gIGwgLz0gMjtcbiAgcmV0dXJuIFtoLCBzbCAqIDEwMCwgbCAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIGhzdjJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3Yihoc3YycmdiKGFyZ3MpKVxufVxuXG5mdW5jdGlvbiBoc3YyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhoc3YycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHN2MmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHN2MnJnYihhcmdzKSk7XG59XG5cbi8vIGh0dHA6Ly9kZXYudzMub3JnL2Nzc3dnL2Nzcy1jb2xvci8jaHdiLXRvLXJnYlxuZnVuY3Rpb24gaHdiMnJnYihod2IpIHtcbiAgdmFyIGggPSBod2JbMF0gLyAzNjAsXG4gICAgICB3aCA9IGh3YlsxXSAvIDEwMCxcbiAgICAgIGJsID0gaHdiWzJdIC8gMTAwLFxuICAgICAgcmF0aW8gPSB3aCArIGJsLFxuICAgICAgaSwgdiwgZiwgbjtcblxuICAvLyB3aCArIGJsIGNhbnQgYmUgPiAxXG4gIGlmIChyYXRpbyA+IDEpIHtcbiAgICB3aCAvPSByYXRpbztcbiAgICBibCAvPSByYXRpbztcbiAgfVxuXG4gIGkgPSBNYXRoLmZsb29yKDYgKiBoKTtcbiAgdiA9IDEgLSBibDtcbiAgZiA9IDYgKiBoIC0gaTtcbiAgaWYgKChpICYgMHgwMSkgIT0gMCkge1xuICAgIGYgPSAxIC0gZjtcbiAgfVxuICBuID0gd2ggKyBmICogKHYgLSB3aCk7ICAvLyBsaW5lYXIgaW50ZXJwb2xhdGlvblxuXG4gIHN3aXRjaCAoaSkge1xuICAgIGRlZmF1bHQ6XG4gICAgY2FzZSA2OlxuICAgIGNhc2UgMDogciA9IHY7IGcgPSBuOyBiID0gd2g7IGJyZWFrO1xuICAgIGNhc2UgMTogciA9IG47IGcgPSB2OyBiID0gd2g7IGJyZWFrO1xuICAgIGNhc2UgMjogciA9IHdoOyBnID0gdjsgYiA9IG47IGJyZWFrO1xuICAgIGNhc2UgMzogciA9IHdoOyBnID0gbjsgYiA9IHY7IGJyZWFrO1xuICAgIGNhc2UgNDogciA9IG47IGcgPSB3aDsgYiA9IHY7IGJyZWFrO1xuICAgIGNhc2UgNTogciA9IHY7IGcgPSB3aDsgYiA9IG47IGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24gaHdiMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2IyaHN2KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc3YoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGh3YjJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBod2Iya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJyZ2IoY215aykge1xuICB2YXIgYyA9IGNteWtbMF0gLyAxMDAsXG4gICAgICBtID0gY215a1sxXSAvIDEwMCxcbiAgICAgIHkgPSBjbXlrWzJdIC8gMTAwLFxuICAgICAgayA9IGNteWtbM10gLyAxMDAsXG4gICAgICByLCBnLCBiO1xuXG4gIHIgPSAxIC0gTWF0aC5taW4oMSwgYyAqICgxIC0gaykgKyBrKTtcbiAgZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspO1xuICBiID0gMSAtIE1hdGgubWluKDEsIHkgKiAoMSAtIGspICsgayk7XG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIGNteWsyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmhzdihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHN2KGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJod2IoYXJncykge1xuICByZXR1cm4gcmdiMmh3YihjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChjbXlrMnJnYihhcmdzKSk7XG59XG5cblxuZnVuY3Rpb24geHl6MnJnYih4eXopIHtcbiAgdmFyIHggPSB4eXpbMF0gLyAxMDAsXG4gICAgICB5ID0geHl6WzFdIC8gMTAwLFxuICAgICAgeiA9IHh5elsyXSAvIDEwMCxcbiAgICAgIHIsIGcsIGI7XG5cbiAgciA9ICh4ICogMy4yNDA2KSArICh5ICogLTEuNTM3MikgKyAoeiAqIC0wLjQ5ODYpO1xuICBnID0gKHggKiAtMC45Njg5KSArICh5ICogMS44NzU4KSArICh6ICogMC4wNDE1KTtcbiAgYiA9ICh4ICogMC4wNTU3KSArICh5ICogLTAuMjA0MCkgKyAoeiAqIDEuMDU3MCk7XG5cbiAgLy8gYXNzdW1lIHNSR0JcbiAgciA9IHIgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3cociwgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IHIgPSAociAqIDEyLjkyKTtcblxuICBnID0gZyA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhnLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogZyA9IChnICogMTIuOTIpO1xuXG4gIGIgPSBiID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGIsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiBiID0gKGIgKiAxMi45Mik7XG5cbiAgciA9IE1hdGgubWluKE1hdGgubWF4KDAsIHIpLCAxKTtcbiAgZyA9IE1hdGgubWluKE1hdGgubWF4KDAsIGcpLCAxKTtcbiAgYiA9IE1hdGgubWluKE1hdGgubWF4KDAsIGIpLCAxKTtcblxuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiB4eXoybGFiKHh5eikge1xuICB2YXIgeCA9IHh5elswXSxcbiAgICAgIHkgPSB4eXpbMV0sXG4gICAgICB6ID0geHl6WzJdLFxuICAgICAgbCwgYSwgYjtcblxuICB4IC89IDk1LjA0NztcbiAgeSAvPSAxMDA7XG4gIHogLz0gMTA4Ljg4MztcblxuICB4ID0geCA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMS8zKSA6ICg3Ljc4NyAqIHgpICsgKDE2IC8gMTE2KTtcbiAgeSA9IHkgPiAwLjAwODg1NiA/IE1hdGgucG93KHksIDEvMykgOiAoNy43ODcgKiB5KSArICgxNiAvIDExNik7XG4gIHogPSB6ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh6LCAxLzMpIDogKDcuNzg3ICogeikgKyAoMTYgLyAxMTYpO1xuXG4gIGwgPSAoMTE2ICogeSkgLSAxNjtcbiAgYSA9IDUwMCAqICh4IC0geSk7XG4gIGIgPSAyMDAgKiAoeSAtIHopO1xuXG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIHh5ejJsY2goYXJncykge1xuICByZXR1cm4gbGFiMmxjaCh4eXoybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gbGFiMnh5eihsYWIpIHtcbiAgdmFyIGwgPSBsYWJbMF0sXG4gICAgICBhID0gbGFiWzFdLFxuICAgICAgYiA9IGxhYlsyXSxcbiAgICAgIHgsIHksIHosIHkyO1xuXG4gIGlmIChsIDw9IDgpIHtcbiAgICB5ID0gKGwgKiAxMDApIC8gOTAzLjM7XG4gICAgeTIgPSAoNy43ODcgKiAoeSAvIDEwMCkpICsgKDE2IC8gMTE2KTtcbiAgfSBlbHNlIHtcbiAgICB5ID0gMTAwICogTWF0aC5wb3coKGwgKyAxNikgLyAxMTYsIDMpO1xuICAgIHkyID0gTWF0aC5wb3coeSAvIDEwMCwgMS8zKTtcbiAgfVxuXG4gIHggPSB4IC8gOTUuMDQ3IDw9IDAuMDA4ODU2ID8geCA9ICg5NS4wNDcgKiAoKGEgLyA1MDApICsgeTIgLSAoMTYgLyAxMTYpKSkgLyA3Ljc4NyA6IDk1LjA0NyAqIE1hdGgucG93KChhIC8gNTAwKSArIHkyLCAzKTtcblxuICB6ID0geiAvIDEwOC44ODMgPD0gMC4wMDg4NTkgPyB6ID0gKDEwOC44ODMgKiAoeTIgLSAoYiAvIDIwMCkgLSAoMTYgLyAxMTYpKSkgLyA3Ljc4NyA6IDEwOC44ODMgKiBNYXRoLnBvdyh5MiAtIChiIC8gMjAwKSwgMyk7XG5cbiAgcmV0dXJuIFt4LCB5LCB6XTtcbn1cblxuZnVuY3Rpb24gbGFiMmxjaChsYWIpIHtcbiAgdmFyIGwgPSBsYWJbMF0sXG4gICAgICBhID0gbGFiWzFdLFxuICAgICAgYiA9IGxhYlsyXSxcbiAgICAgIGhyLCBoLCBjO1xuXG4gIGhyID0gTWF0aC5hdGFuMihiLCBhKTtcbiAgaCA9IGhyICogMzYwIC8gMiAvIE1hdGguUEk7XG4gIGlmIChoIDwgMCkge1xuICAgIGggKz0gMzYwO1xuICB9XG4gIGMgPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYik7XG4gIHJldHVybiBbbCwgYywgaF07XG59XG5cbmZ1bmN0aW9uIGxhYjJyZ2IoYXJncykge1xuICByZXR1cm4geHl6MnJnYihsYWIyeHl6KGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gbGNoMmxhYihsY2gpIHtcbiAgdmFyIGwgPSBsY2hbMF0sXG4gICAgICBjID0gbGNoWzFdLFxuICAgICAgaCA9IGxjaFsyXSxcbiAgICAgIGEsIGIsIGhyO1xuXG4gIGhyID0gaCAvIDM2MCAqIDIgKiBNYXRoLlBJO1xuICBhID0gYyAqIE1hdGguY29zKGhyKTtcbiAgYiA9IGMgKiBNYXRoLnNpbihocik7XG4gIHJldHVybiBbbCwgYSwgYl07XG59XG5cbmZ1bmN0aW9uIGxjaDJ4eXooYXJncykge1xuICByZXR1cm4gbGFiMnh5eihsY2gybGFiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gbGNoMnJnYihhcmdzKSB7XG4gIHJldHVybiBsYWIycmdiKGxjaDJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMnJnYihrZXl3b3JkKSB7XG4gIHJldHVybiBjc3NLZXl3b3Jkc1trZXl3b3JkXTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHN2KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc3Yoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJsYWIoYXJncykge1xuICByZXR1cm4gcmdiMmxhYihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyeHl6KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJ4eXooa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG52YXIgY3NzS2V5d29yZHMgPSB7XG4gIGFsaWNlYmx1ZTogIFsyNDAsMjQ4LDI1NV0sXG4gIGFudGlxdWV3aGl0ZTogWzI1MCwyMzUsMjE1XSxcbiAgYXF1YTogWzAsMjU1LDI1NV0sXG4gIGFxdWFtYXJpbmU6IFsxMjcsMjU1LDIxMl0sXG4gIGF6dXJlOiAgWzI0MCwyNTUsMjU1XSxcbiAgYmVpZ2U6ICBbMjQ1LDI0NSwyMjBdLFxuICBiaXNxdWU6IFsyNTUsMjI4LDE5Nl0sXG4gIGJsYWNrOiAgWzAsMCwwXSxcbiAgYmxhbmNoZWRhbG1vbmQ6IFsyNTUsMjM1LDIwNV0sXG4gIGJsdWU6IFswLDAsMjU1XSxcbiAgYmx1ZXZpb2xldDogWzEzOCw0MywyMjZdLFxuICBicm93bjogIFsxNjUsNDIsNDJdLFxuICBidXJseXdvb2Q6ICBbMjIyLDE4NCwxMzVdLFxuICBjYWRldGJsdWU6ICBbOTUsMTU4LDE2MF0sXG4gIGNoYXJ0cmV1c2U6IFsxMjcsMjU1LDBdLFxuICBjaG9jb2xhdGU6ICBbMjEwLDEwNSwzMF0sXG4gIGNvcmFsOiAgWzI1NSwxMjcsODBdLFxuICBjb3JuZmxvd2VyYmx1ZTogWzEwMCwxNDksMjM3XSxcbiAgY29ybnNpbGs6IFsyNTUsMjQ4LDIyMF0sXG4gIGNyaW1zb246ICBbMjIwLDIwLDYwXSxcbiAgY3lhbjogWzAsMjU1LDI1NV0sXG4gIGRhcmtibHVlOiBbMCwwLDEzOV0sXG4gIGRhcmtjeWFuOiBbMCwxMzksMTM5XSxcbiAgZGFya2dvbGRlbnJvZDogIFsxODQsMTM0LDExXSxcbiAgZGFya2dyYXk6IFsxNjksMTY5LDE2OV0sXG4gIGRhcmtncmVlbjogIFswLDEwMCwwXSxcbiAgZGFya2dyZXk6IFsxNjksMTY5LDE2OV0sXG4gIGRhcmtraGFraTogIFsxODksMTgzLDEwN10sXG4gIGRhcmttYWdlbnRhOiAgWzEzOSwwLDEzOV0sXG4gIGRhcmtvbGl2ZWdyZWVuOiBbODUsMTA3LDQ3XSxcbiAgZGFya29yYW5nZTogWzI1NSwxNDAsMF0sXG4gIGRhcmtvcmNoaWQ6IFsxNTMsNTAsMjA0XSxcbiAgZGFya3JlZDogIFsxMzksMCwwXSxcbiAgZGFya3NhbG1vbjogWzIzMywxNTAsMTIyXSxcbiAgZGFya3NlYWdyZWVuOiBbMTQzLDE4OCwxNDNdLFxuICBkYXJrc2xhdGVibHVlOiAgWzcyLDYxLDEzOV0sXG4gIGRhcmtzbGF0ZWdyYXk6ICBbNDcsNzksNzldLFxuICBkYXJrc2xhdGVncmV5OiAgWzQ3LDc5LDc5XSxcbiAgZGFya3R1cnF1b2lzZTogIFswLDIwNiwyMDldLFxuICBkYXJrdmlvbGV0OiBbMTQ4LDAsMjExXSxcbiAgZGVlcHBpbms6IFsyNTUsMjAsMTQ3XSxcbiAgZGVlcHNreWJsdWU6ICBbMCwxOTEsMjU1XSxcbiAgZGltZ3JheTogIFsxMDUsMTA1LDEwNV0sXG4gIGRpbWdyZXk6ICBbMTA1LDEwNSwxMDVdLFxuICBkb2RnZXJibHVlOiBbMzAsMTQ0LDI1NV0sXG4gIGZpcmVicmljazogIFsxNzgsMzQsMzRdLFxuICBmbG9yYWx3aGl0ZTogIFsyNTUsMjUwLDI0MF0sXG4gIGZvcmVzdGdyZWVuOiAgWzM0LDEzOSwzNF0sXG4gIGZ1Y2hzaWE6ICBbMjU1LDAsMjU1XSxcbiAgZ2FpbnNib3JvOiAgWzIyMCwyMjAsMjIwXSxcbiAgZ2hvc3R3aGl0ZTogWzI0OCwyNDgsMjU1XSxcbiAgZ29sZDogWzI1NSwyMTUsMF0sXG4gIGdvbGRlbnJvZDogIFsyMTgsMTY1LDMyXSxcbiAgZ3JheTogWzEyOCwxMjgsMTI4XSxcbiAgZ3JlZW46ICBbMCwxMjgsMF0sXG4gIGdyZWVueWVsbG93OiAgWzE3MywyNTUsNDddLFxuICBncmV5OiBbMTI4LDEyOCwxMjhdLFxuICBob25leWRldzogWzI0MCwyNTUsMjQwXSxcbiAgaG90cGluazogIFsyNTUsMTA1LDE4MF0sXG4gIGluZGlhbnJlZDogIFsyMDUsOTIsOTJdLFxuICBpbmRpZ286IFs3NSwwLDEzMF0sXG4gIGl2b3J5OiAgWzI1NSwyNTUsMjQwXSxcbiAga2hha2k6ICBbMjQwLDIzMCwxNDBdLFxuICBsYXZlbmRlcjogWzIzMCwyMzAsMjUwXSxcbiAgbGF2ZW5kZXJibHVzaDogIFsyNTUsMjQwLDI0NV0sXG4gIGxhd25ncmVlbjogIFsxMjQsMjUyLDBdLFxuICBsZW1vbmNoaWZmb246IFsyNTUsMjUwLDIwNV0sXG4gIGxpZ2h0Ymx1ZTogIFsxNzMsMjE2LDIzMF0sXG4gIGxpZ2h0Y29yYWw6IFsyNDAsMTI4LDEyOF0sXG4gIGxpZ2h0Y3lhbjogIFsyMjQsMjU1LDI1NV0sXG4gIGxpZ2h0Z29sZGVucm9keWVsbG93OiBbMjUwLDI1MCwyMTBdLFxuICBsaWdodGdyYXk6ICBbMjExLDIxMSwyMTFdLFxuICBsaWdodGdyZWVuOiBbMTQ0LDIzOCwxNDRdLFxuICBsaWdodGdyZXk6ICBbMjExLDIxMSwyMTFdLFxuICBsaWdodHBpbms6ICBbMjU1LDE4MiwxOTNdLFxuICBsaWdodHNhbG1vbjogIFsyNTUsMTYwLDEyMl0sXG4gIGxpZ2h0c2VhZ3JlZW46ICBbMzIsMTc4LDE3MF0sXG4gIGxpZ2h0c2t5Ymx1ZTogWzEzNSwyMDYsMjUwXSxcbiAgbGlnaHRzbGF0ZWdyYXk6IFsxMTksMTM2LDE1M10sXG4gIGxpZ2h0c2xhdGVncmV5OiBbMTE5LDEzNiwxNTNdLFxuICBsaWdodHN0ZWVsYmx1ZTogWzE3NiwxOTYsMjIyXSxcbiAgbGlnaHR5ZWxsb3c6ICBbMjU1LDI1NSwyMjRdLFxuICBsaW1lOiBbMCwyNTUsMF0sXG4gIGxpbWVncmVlbjogIFs1MCwyMDUsNTBdLFxuICBsaW5lbjogIFsyNTAsMjQwLDIzMF0sXG4gIG1hZ2VudGE6ICBbMjU1LDAsMjU1XSxcbiAgbWFyb29uOiBbMTI4LDAsMF0sXG4gIG1lZGl1bWFxdWFtYXJpbmU6IFsxMDIsMjA1LDE3MF0sXG4gIG1lZGl1bWJsdWU6IFswLDAsMjA1XSxcbiAgbWVkaXVtb3JjaGlkOiBbMTg2LDg1LDIxMV0sXG4gIG1lZGl1bXB1cnBsZTogWzE0NywxMTIsMjE5XSxcbiAgbWVkaXVtc2VhZ3JlZW46IFs2MCwxNzksMTEzXSxcbiAgbWVkaXVtc2xhdGVibHVlOiAgWzEyMywxMDQsMjM4XSxcbiAgbWVkaXVtc3ByaW5nZ3JlZW46ICBbMCwyNTAsMTU0XSxcbiAgbWVkaXVtdHVycXVvaXNlOiAgWzcyLDIwOSwyMDRdLFxuICBtZWRpdW12aW9sZXRyZWQ6ICBbMTk5LDIxLDEzM10sXG4gIG1pZG5pZ2h0Ymx1ZTogWzI1LDI1LDExMl0sXG4gIG1pbnRjcmVhbTogIFsyNDUsMjU1LDI1MF0sXG4gIG1pc3R5cm9zZTogIFsyNTUsMjI4LDIyNV0sXG4gIG1vY2Nhc2luOiBbMjU1LDIyOCwxODFdLFxuICBuYXZham93aGl0ZTogIFsyNTUsMjIyLDE3M10sXG4gIG5hdnk6IFswLDAsMTI4XSxcbiAgb2xkbGFjZTogIFsyNTMsMjQ1LDIzMF0sXG4gIG9saXZlOiAgWzEyOCwxMjgsMF0sXG4gIG9saXZlZHJhYjogIFsxMDcsMTQyLDM1XSxcbiAgb3JhbmdlOiBbMjU1LDE2NSwwXSxcbiAgb3JhbmdlcmVkOiAgWzI1NSw2OSwwXSxcbiAgb3JjaGlkOiBbMjE4LDExMiwyMTRdLFxuICBwYWxlZ29sZGVucm9kOiAgWzIzOCwyMzIsMTcwXSxcbiAgcGFsZWdyZWVuOiAgWzE1MiwyNTEsMTUyXSxcbiAgcGFsZXR1cnF1b2lzZTogIFsxNzUsMjM4LDIzOF0sXG4gIHBhbGV2aW9sZXRyZWQ6ICBbMjE5LDExMiwxNDddLFxuICBwYXBheWF3aGlwOiBbMjU1LDIzOSwyMTNdLFxuICBwZWFjaHB1ZmY6ICBbMjU1LDIxOCwxODVdLFxuICBwZXJ1OiBbMjA1LDEzMyw2M10sXG4gIHBpbms6IFsyNTUsMTkyLDIwM10sXG4gIHBsdW06IFsyMjEsMTYwLDIyMV0sXG4gIHBvd2RlcmJsdWU6IFsxNzYsMjI0LDIzMF0sXG4gIHB1cnBsZTogWzEyOCwwLDEyOF0sXG4gIHJlYmVjY2FwdXJwbGU6IFsxMDIsIDUxLCAxNTNdLFxuICByZWQ6ICBbMjU1LDAsMF0sXG4gIHJvc3licm93bjogIFsxODgsMTQzLDE0M10sXG4gIHJveWFsYmx1ZTogIFs2NSwxMDUsMjI1XSxcbiAgc2FkZGxlYnJvd246ICBbMTM5LDY5LDE5XSxcbiAgc2FsbW9uOiBbMjUwLDEyOCwxMTRdLFxuICBzYW5keWJyb3duOiBbMjQ0LDE2NCw5Nl0sXG4gIHNlYWdyZWVuOiBbNDYsMTM5LDg3XSxcbiAgc2Vhc2hlbGw6IFsyNTUsMjQ1LDIzOF0sXG4gIHNpZW5uYTogWzE2MCw4Miw0NV0sXG4gIHNpbHZlcjogWzE5MiwxOTIsMTkyXSxcbiAgc2t5Ymx1ZTogIFsxMzUsMjA2LDIzNV0sXG4gIHNsYXRlYmx1ZTogIFsxMDYsOTAsMjA1XSxcbiAgc2xhdGVncmF5OiAgWzExMiwxMjgsMTQ0XSxcbiAgc2xhdGVncmV5OiAgWzExMiwxMjgsMTQ0XSxcbiAgc25vdzogWzI1NSwyNTAsMjUwXSxcbiAgc3ByaW5nZ3JlZW46ICBbMCwyNTUsMTI3XSxcbiAgc3RlZWxibHVlOiAgWzcwLDEzMCwxODBdLFxuICB0YW46ICBbMjEwLDE4MCwxNDBdLFxuICB0ZWFsOiBbMCwxMjgsMTI4XSxcbiAgdGhpc3RsZTogIFsyMTYsMTkxLDIxNl0sXG4gIHRvbWF0bzogWzI1NSw5OSw3MV0sXG4gIHR1cnF1b2lzZTogIFs2NCwyMjQsMjA4XSxcbiAgdmlvbGV0OiBbMjM4LDEzMCwyMzhdLFxuICB3aGVhdDogIFsyNDUsMjIyLDE3OV0sXG4gIHdoaXRlOiAgWzI1NSwyNTUsMjU1XSxcbiAgd2hpdGVzbW9rZTogWzI0NSwyNDUsMjQ1XSxcbiAgeWVsbG93OiBbMjU1LDI1NSwwXSxcbiAgeWVsbG93Z3JlZW46ICBbMTU0LDIwNSw1MF1cbn07XG5cbnZhciByZXZlcnNlS2V5d29yZHMgPSB7fTtcbmZvciAodmFyIGtleSBpbiBjc3NLZXl3b3Jkcykge1xuICByZXZlcnNlS2V5d29yZHNbSlNPTi5zdHJpbmdpZnkoY3NzS2V5d29yZHNba2V5XSldID0ga2V5O1xufVxuIiwidmFyIGNvbnZlcnNpb25zID0gcmVxdWlyZShcIi4vY29udmVyc2lvbnNcIik7XG5cbnZhciBjb252ZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICByZXR1cm4gbmV3IENvbnZlcnRlcigpO1xufVxuXG5mb3IgKHZhciBmdW5jIGluIGNvbnZlcnNpb25zKSB7XG4gIC8vIGV4cG9ydCBSYXcgdmVyc2lvbnNcbiAgY29udmVydFtmdW5jICsgXCJSYXdcIl0gPSAgKGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBhY2NlcHQgYXJyYXkgb3IgcGxhaW4gYXJnc1xuICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09IFwibnVtYmVyXCIpXG4gICAgICAgIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY29udmVyc2lvbnNbZnVuY10oYXJnKTtcbiAgICB9XG4gIH0pKGZ1bmMpO1xuXG4gIHZhciBwYWlyID0gLyhcXHcrKTIoXFx3KykvLmV4ZWMoZnVuYyksXG4gICAgICBmcm9tID0gcGFpclsxXSxcbiAgICAgIHRvID0gcGFpclsyXTtcblxuICAvLyBleHBvcnQgcmdiMmhzbCBhbmQgW1wicmdiXCJdW1wiaHNsXCJdXG4gIGNvbnZlcnRbZnJvbV0gPSBjb252ZXJ0W2Zyb21dIHx8IHt9O1xuXG4gIGNvbnZlcnRbZnJvbV1bdG9dID0gY29udmVydFtmdW5jXSA9IChmdW5jdGlvbihmdW5jKSB7IFxuICAgIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnID09IFwibnVtYmVyXCIpXG4gICAgICAgIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICBcbiAgICAgIHZhciB2YWwgPSBjb252ZXJzaW9uc1tmdW5jXShhcmcpO1xuICAgICAgaWYgKHR5cGVvZiB2YWwgPT0gXCJzdHJpbmdcIiB8fCB2YWwgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHZhbDsgLy8ga2V5d29yZFxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKylcbiAgICAgICAgdmFsW2ldID0gTWF0aC5yb3VuZCh2YWxbaV0pO1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gIH0pKGZ1bmMpO1xufVxuXG5cbi8qIENvbnZlcnRlciBkb2VzIGxhenkgY29udmVyc2lvbiBhbmQgY2FjaGluZyAqL1xudmFyIENvbnZlcnRlciA9IGZ1bmN0aW9uKCkge1xuICAgdGhpcy5jb252cyA9IHt9O1xufTtcblxuLyogRWl0aGVyIGdldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlIG9yXG4gIHNldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLCBkZXBlbmRpbmcgb24gYXJncyAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5yb3V0ZVNwYWNlID0gZnVuY3Rpb24oc3BhY2UsIGFyZ3MpIHtcbiAgIHZhciB2YWx1ZXMgPSBhcmdzWzBdO1xuICAgaWYgKHZhbHVlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBjb2xvci5yZ2IoKVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsdWVzKHNwYWNlKTtcbiAgIH1cbiAgIC8vIGNvbG9yLnJnYigxMCwgMTAsIDEwKVxuICAgaWYgKHR5cGVvZiB2YWx1ZXMgPT0gXCJudW1iZXJcIikge1xuICAgICAgdmFsdWVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7ICAgICAgICBcbiAgIH1cblxuICAgcmV0dXJuIHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB2YWx1ZXMpO1xufTtcbiAgXG4vKiBTZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZSwgaW52YWxpZGF0aW5nIGNhY2hlICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlLCB2YWx1ZXMpIHtcbiAgIHRoaXMuc3BhY2UgPSBzcGFjZTtcbiAgIHRoaXMuY29udnMgPSB7fTtcbiAgIHRoaXMuY29udnNbc3BhY2VdID0gdmFsdWVzO1xuICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiBHZXQgdGhlIHZhbHVlcyBmb3IgYSBzcGFjZS4gSWYgdGhlcmUncyBhbHJlYWR5XG4gIGEgY29udmVyc2lvbiBmb3IgdGhlIHNwYWNlLCBmZXRjaCBpdCwgb3RoZXJ3aXNlXG4gIGNvbXB1dGUgaXQgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UpIHtcbiAgIHZhciB2YWxzID0gdGhpcy5jb252c1tzcGFjZV07XG4gICBpZiAoIXZhbHMpIHtcbiAgICAgIHZhciBmc3BhY2UgPSB0aGlzLnNwYWNlLFxuICAgICAgICAgIGZyb20gPSB0aGlzLmNvbnZzW2ZzcGFjZV07XG4gICAgICB2YWxzID0gY29udmVydFtmc3BhY2VdW3NwYWNlXShmcm9tKTtcblxuICAgICAgdGhpcy5jb252c1tzcGFjZV0gPSB2YWxzO1xuICAgfVxuICByZXR1cm4gdmFscztcbn07XG5cbltcInJnYlwiLCBcImhzbFwiLCBcImhzdlwiLCBcImNteWtcIiwgXCJrZXl3b3JkXCJdLmZvckVhY2goZnVuY3Rpb24oc3BhY2UpIHtcbiAgIENvbnZlcnRlci5wcm90b3R5cGVbc3BhY2VdID0gZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMucm91dGVTcGFjZShzcGFjZSwgYXJndW1lbnRzKTtcbiAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnZlcnQ7IiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb2xvck5hbWVzID0gcmVxdWlyZSgnY29sb3ItbmFtZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgIGdldFJnYmE6IGdldFJnYmEsXG4gICBnZXRIc2xhOiBnZXRIc2xhLFxuICAgZ2V0UmdiOiBnZXRSZ2IsXG4gICBnZXRIc2w6IGdldEhzbCxcbiAgIGdldEh3YjogZ2V0SHdiLFxuICAgZ2V0QWxwaGE6IGdldEFscGhhLFxuXG4gICBoZXhTdHJpbmc6IGhleFN0cmluZyxcbiAgIHJnYlN0cmluZzogcmdiU3RyaW5nLFxuICAgcmdiYVN0cmluZzogcmdiYVN0cmluZyxcbiAgIHBlcmNlbnRTdHJpbmc6IHBlcmNlbnRTdHJpbmcsXG4gICBwZXJjZW50YVN0cmluZzogcGVyY2VudGFTdHJpbmcsXG4gICBoc2xTdHJpbmc6IGhzbFN0cmluZyxcbiAgIGhzbGFTdHJpbmc6IGhzbGFTdHJpbmcsXG4gICBod2JTdHJpbmc6IGh3YlN0cmluZyxcbiAgIGtleXdvcmQ6IGtleXdvcmRcbn1cblxuZnVuY3Rpb24gZ2V0UmdiYShzdHJpbmcpIHtcbiAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICB9XG4gICB2YXIgYWJiciA9ICAvXiMoW2EtZkEtRjAtOV17M30pJC8sXG4gICAgICAgaGV4ID0gIC9eIyhbYS1mQS1GMC05XXs2fSkkLyxcbiAgICAgICByZ2JhID0gL15yZ2JhP1xcKFxccyooWystXT9cXGQrKVxccyosXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC8sXG4gICAgICAgcGVyID0gL15yZ2JhP1xcKFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpJC8sXG4gICAgICAga2V5d29yZCA9IC8oXFxEKykvO1xuXG4gICB2YXIgcmdiID0gWzAsIDAsIDBdLFxuICAgICAgIGEgPSAxLFxuICAgICAgIG1hdGNoID0gc3RyaW5nLm1hdGNoKGFiYnIpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgICBtYXRjaCA9IG1hdGNoWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IHBhcnNlSW50KG1hdGNoW2ldICsgbWF0Y2hbaV0sIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKGhleCkpIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2guc2xpY2UoaSAqIDIsIGkgKiAyICsgMiksIDE2KTtcbiAgICAgIH1cbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHJnYmEpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaSArIDFdKTtcbiAgICAgIH1cbiAgICAgIGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgIH1cbiAgIGVsc2UgaWYgKG1hdGNoID0gc3RyaW5nLm1hdGNoKHBlcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQobWF0Y2hbaSArIDFdKSAqIDIuNTUpO1xuICAgICAgfVxuICAgICAgYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goa2V5d29yZCkpIHtcbiAgICAgIGlmIChtYXRjaFsxXSA9PSBcInRyYW5zcGFyZW50XCIpIHtcbiAgICAgICAgIHJldHVybiBbMCwgMCwgMCwgMF07XG4gICAgICB9XG4gICAgICByZ2IgPSBjb2xvck5hbWVzW21hdGNoWzFdXTtcbiAgICAgIGlmICghcmdiKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICB9XG5cbiAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZ2JbaV0gPSBzY2FsZShyZ2JbaV0sIDAsIDI1NSk7XG4gICB9XG4gICBpZiAoIWEgJiYgYSAhPSAwKSB7XG4gICAgICBhID0gMTtcbiAgIH1cbiAgIGVsc2Uge1xuICAgICAgYSA9IHNjYWxlKGEsIDAsIDEpO1xuICAgfVxuICAgcmdiWzNdID0gYTtcbiAgIHJldHVybiByZ2I7XG59XG5cbmZ1bmN0aW9uIGdldEhzbGEoc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGhzbCA9IC9eaHNsYT9cXChcXHMqKFsrLV0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpLztcbiAgIHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChoc2wpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgICB2YXIgYWxwaGEgPSBwYXJzZUZsb2F0KG1hdGNoWzRdKTtcbiAgICAgIHZhciBoID0gc2NhbGUocGFyc2VJbnQobWF0Y2hbMV0pLCAwLCAzNjApLFxuICAgICAgICAgIHMgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzJdKSwgMCwgMTAwKSxcbiAgICAgICAgICBsID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFszXSksIDAsIDEwMCksXG4gICAgICAgICAgYSA9IHNjYWxlKGlzTmFOKGFscGhhKSA/IDEgOiBhbHBoYSwgMCwgMSk7XG4gICAgICByZXR1cm4gW2gsIHMsIGwsIGFdO1xuICAgfVxufVxuXG5mdW5jdGlvbiBnZXRId2Ioc3RyaW5nKSB7XG4gICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuO1xuICAgfVxuICAgdmFyIGh3YiA9IC9eaHdiXFwoXFxzKihbKy1dP1xcZCspKD86ZGVnKT9cXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKig/OixcXHMqKFsrLV0/W1xcZFxcLl0rKVxccyopP1xcKS87XG4gICB2YXIgbWF0Y2ggPSBzdHJpbmcubWF0Y2goaHdiKTtcbiAgIGlmIChtYXRjaCkge1xuICAgIHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgICAgdmFyIGggPSBzY2FsZShwYXJzZUludChtYXRjaFsxXSksIDAsIDM2MCksXG4gICAgICAgICAgdyA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApLFxuICAgICAgICAgIGIgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKSxcbiAgICAgICAgICBhID0gc2NhbGUoaXNOYU4oYWxwaGEpID8gMSA6IGFscGhhLCAwLCAxKTtcbiAgICAgIHJldHVybiBbaCwgdywgYiwgYV07XG4gICB9XG59XG5cbmZ1bmN0aW9uIGdldFJnYihzdHJpbmcpIHtcbiAgIHZhciByZ2JhID0gZ2V0UmdiYShzdHJpbmcpO1xuICAgcmV0dXJuIHJnYmEgJiYgcmdiYS5zbGljZSgwLCAzKTtcbn1cblxuZnVuY3Rpb24gZ2V0SHNsKHN0cmluZykge1xuICB2YXIgaHNsYSA9IGdldEhzbGEoc3RyaW5nKTtcbiAgcmV0dXJuIGhzbGEgJiYgaHNsYS5zbGljZSgwLCAzKTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxwaGEoc3RyaW5nKSB7XG4gICB2YXIgdmFscyA9IGdldFJnYmEoc3RyaW5nKTtcbiAgIGlmICh2YWxzKSB7XG4gICAgICByZXR1cm4gdmFsc1szXTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHMgPSBnZXRIc2xhKHN0cmluZykpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxuICAgZWxzZSBpZiAodmFscyA9IGdldEh3YihzdHJpbmcpKSB7XG4gICAgICByZXR1cm4gdmFsc1szXTtcbiAgIH1cbn1cblxuLy8gZ2VuZXJhdG9yc1xuZnVuY3Rpb24gaGV4U3RyaW5nKHJnYikge1xuICAgcmV0dXJuIFwiI1wiICsgaGV4RG91YmxlKHJnYlswXSkgKyBoZXhEb3VibGUocmdiWzFdKVxuICAgICAgICAgICAgICArIGhleERvdWJsZShyZ2JbMl0pO1xufVxuXG5mdW5jdGlvbiByZ2JTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKHJnYmFbM10gJiYgcmdiYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gcmdiYVN0cmluZyhyZ2JhLCBhbHBoYSk7XG4gICB9XG4gICByZXR1cm4gXCJyZ2IoXCIgKyByZ2JhWzBdICsgXCIsIFwiICsgcmdiYVsxXSArIFwiLCBcIiArIHJnYmFbMl0gKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gcmdiYVN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFscGhhID0gKHJnYmFbM10gIT09IHVuZGVmaW5lZCA/IHJnYmFbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcInJnYmEoXCIgKyByZ2JhWzBdICsgXCIsIFwiICsgcmdiYVsxXSArIFwiLCBcIiArIHJnYmFbMl1cbiAgICAgICAgICAgKyBcIiwgXCIgKyBhbHBoYSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50U3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPCAxIHx8IChyZ2JhWzNdICYmIHJnYmFbM10gPCAxKSkge1xuICAgICAgcmV0dXJuIHBlcmNlbnRhU3RyaW5nKHJnYmEsIGFscGhhKTtcbiAgIH1cbiAgIHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdLzI1NSAqIDEwMCksXG4gICAgICAgZyA9IE1hdGgucm91bmQocmdiYVsxXS8yNTUgKiAxMDApLFxuICAgICAgIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0vMjU1ICogMTAwKTtcblxuICAgcmV0dXJuIFwicmdiKFwiICsgciArIFwiJSwgXCIgKyBnICsgXCIlLCBcIiArIGIgKyBcIiUpXCI7XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRhU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICB2YXIgciA9IE1hdGgucm91bmQocmdiYVswXS8yNTUgKiAxMDApLFxuICAgICAgIGcgPSBNYXRoLnJvdW5kKHJnYmFbMV0vMjU1ICogMTAwKSxcbiAgICAgICBiID0gTWF0aC5yb3VuZChyZ2JhWzJdLzI1NSAqIDEwMCk7XG4gICByZXR1cm4gXCJyZ2JhKFwiICsgciArIFwiJSwgXCIgKyBnICsgXCIlLCBcIiArIGIgKyBcIiUsIFwiICsgKGFscGhhIHx8IHJnYmFbM10gfHwgMSkgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24gaHNsU3RyaW5nKGhzbGEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPCAxIHx8IChoc2xhWzNdICYmIGhzbGFbM10gPCAxKSkge1xuICAgICAgcmV0dXJuIGhzbGFTdHJpbmcoaHNsYSwgYWxwaGEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHNsKFwiICsgaHNsYVswXSArIFwiLCBcIiArIGhzbGFbMV0gKyBcIiUsIFwiICsgaHNsYVsyXSArIFwiJSlcIjtcbn1cblxuZnVuY3Rpb24gaHNsYVN0cmluZyhoc2xhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFscGhhID0gKGhzbGFbM10gIT09IHVuZGVmaW5lZCA/IGhzbGFbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcImhzbGEoXCIgKyBoc2xhWzBdICsgXCIsIFwiICsgaHNsYVsxXSArIFwiJSwgXCIgKyBoc2xhWzJdICsgXCIlLCBcIlxuICAgICAgICAgICArIGFscGhhICsgXCIpXCI7XG59XG5cbi8vIGh3YiBpcyBhIGJpdCBkaWZmZXJlbnQgdGhhbiByZ2IoYSkgJiBoc2woYSkgc2luY2UgdGhlcmUgaXMgbm8gYWxwaGEgc3BlY2lmaWMgc3ludGF4XG4vLyAoaHdiIGhhdmUgYWxwaGEgb3B0aW9uYWwgJiAxIGlzIGRlZmF1bHQgdmFsdWUpXG5mdW5jdGlvbiBod2JTdHJpbmcoaHdiLCBhbHBoYSkge1xuICAgaWYgKGFscGhhID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGFscGhhID0gKGh3YlszXSAhPT0gdW5kZWZpbmVkID8gaHdiWzNdIDogMSk7XG4gICB9XG4gICByZXR1cm4gXCJod2IoXCIgKyBod2JbMF0gKyBcIiwgXCIgKyBod2JbMV0gKyBcIiUsIFwiICsgaHdiWzJdICsgXCIlXCJcbiAgICAgICAgICAgKyAoYWxwaGEgIT09IHVuZGVmaW5lZCAmJiBhbHBoYSAhPT0gMSA/IFwiLCBcIiArIGFscGhhIDogXCJcIikgKyBcIilcIjtcbn1cblxuZnVuY3Rpb24ga2V5d29yZChyZ2IpIHtcbiAgcmV0dXJuIHJldmVyc2VOYW1lc1tyZ2Iuc2xpY2UoMCwgMyldO1xufVxuXG4vLyBoZWxwZXJzXG5mdW5jdGlvbiBzY2FsZShudW0sIG1pbiwgbWF4KSB7XG4gICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobWluLCBudW0pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiBoZXhEb3VibGUobnVtKSB7XG4gIHZhciBzdHIgPSBudW0udG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiAoc3RyLmxlbmd0aCA8IDIpID8gXCIwXCIgKyBzdHIgOiBzdHI7XG59XG5cblxuLy9jcmVhdGUgYSBsaXN0IG9mIHJldmVyc2UgY29sb3IgbmFtZXNcbnZhciByZXZlcnNlTmFtZXMgPSB7fTtcbmZvciAodmFyIG5hbWUgaW4gY29sb3JOYW1lcykge1xuICAgcmV2ZXJzZU5hbWVzW2NvbG9yTmFtZXNbbmFtZV1dID0gbmFtZTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcclxuXHRcImFsaWNlYmx1ZVwiOiBbMjQwLCAyNDgsIDI1NV0sXHJcblx0XCJhbnRpcXVld2hpdGVcIjogWzI1MCwgMjM1LCAyMTVdLFxyXG5cdFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiYXF1YW1hcmluZVwiOiBbMTI3LCAyNTUsIDIxMl0sXHJcblx0XCJhenVyZVwiOiBbMjQwLCAyNTUsIDI1NV0sXHJcblx0XCJiZWlnZVwiOiBbMjQ1LCAyNDUsIDIyMF0sXHJcblx0XCJiaXNxdWVcIjogWzI1NSwgMjI4LCAxOTZdLFxyXG5cdFwiYmxhY2tcIjogWzAsIDAsIDBdLFxyXG5cdFwiYmxhbmNoZWRhbG1vbmRcIjogWzI1NSwgMjM1LCAyMDVdLFxyXG5cdFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcclxuXHRcImJsdWV2aW9sZXRcIjogWzEzOCwgNDMsIDIyNl0sXHJcblx0XCJicm93blwiOiBbMTY1LCA0MiwgNDJdLFxyXG5cdFwiYnVybHl3b29kXCI6IFsyMjIsIDE4NCwgMTM1XSxcclxuXHRcImNhZGV0Ymx1ZVwiOiBbOTUsIDE1OCwgMTYwXSxcclxuXHRcImNoYXJ0cmV1c2VcIjogWzEyNywgMjU1LCAwXSxcclxuXHRcImNob2NvbGF0ZVwiOiBbMjEwLCAxMDUsIDMwXSxcclxuXHRcImNvcmFsXCI6IFsyNTUsIDEyNywgODBdLFxyXG5cdFwiY29ybmZsb3dlcmJsdWVcIjogWzEwMCwgMTQ5LCAyMzddLFxyXG5cdFwiY29ybnNpbGtcIjogWzI1NSwgMjQ4LCAyMjBdLFxyXG5cdFwiY3JpbXNvblwiOiBbMjIwLCAyMCwgNjBdLFxyXG5cdFwiY3lhblwiOiBbMCwgMjU1LCAyNTVdLFxyXG5cdFwiZGFya2JsdWVcIjogWzAsIDAsIDEzOV0sXHJcblx0XCJkYXJrY3lhblwiOiBbMCwgMTM5LCAxMzldLFxyXG5cdFwiZGFya2dvbGRlbnJvZFwiOiBbMTg0LCAxMzQsIDExXSxcclxuXHRcImRhcmtncmF5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtncmVlblwiOiBbMCwgMTAwLCAwXSxcclxuXHRcImRhcmtncmV5XCI6IFsxNjksIDE2OSwgMTY5XSxcclxuXHRcImRhcmtraGFraVwiOiBbMTg5LCAxODMsIDEwN10sXHJcblx0XCJkYXJrbWFnZW50YVwiOiBbMTM5LCAwLCAxMzldLFxyXG5cdFwiZGFya29saXZlZ3JlZW5cIjogWzg1LCAxMDcsIDQ3XSxcclxuXHRcImRhcmtvcmFuZ2VcIjogWzI1NSwgMTQwLCAwXSxcclxuXHRcImRhcmtvcmNoaWRcIjogWzE1MywgNTAsIDIwNF0sXHJcblx0XCJkYXJrcmVkXCI6IFsxMzksIDAsIDBdLFxyXG5cdFwiZGFya3NhbG1vblwiOiBbMjMzLCAxNTAsIDEyMl0sXHJcblx0XCJkYXJrc2VhZ3JlZW5cIjogWzE0MywgMTg4LCAxNDNdLFxyXG5cdFwiZGFya3NsYXRlYmx1ZVwiOiBbNzIsIDYxLCAxMzldLFxyXG5cdFwiZGFya3NsYXRlZ3JheVwiOiBbNDcsIDc5LCA3OV0sXHJcblx0XCJkYXJrc2xhdGVncmV5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmt0dXJxdW9pc2VcIjogWzAsIDIwNiwgMjA5XSxcclxuXHRcImRhcmt2aW9sZXRcIjogWzE0OCwgMCwgMjExXSxcclxuXHRcImRlZXBwaW5rXCI6IFsyNTUsIDIwLCAxNDddLFxyXG5cdFwiZGVlcHNreWJsdWVcIjogWzAsIDE5MSwgMjU1XSxcclxuXHRcImRpbWdyYXlcIjogWzEwNSwgMTA1LCAxMDVdLFxyXG5cdFwiZGltZ3JleVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkb2RnZXJibHVlXCI6IFszMCwgMTQ0LCAyNTVdLFxyXG5cdFwiZmlyZWJyaWNrXCI6IFsxNzgsIDM0LCAzNF0sXHJcblx0XCJmbG9yYWx3aGl0ZVwiOiBbMjU1LCAyNTAsIDI0MF0sXHJcblx0XCJmb3Jlc3RncmVlblwiOiBbMzQsIDEzOSwgMzRdLFxyXG5cdFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxyXG5cdFwiZ2FpbnNib3JvXCI6IFsyMjAsIDIyMCwgMjIwXSxcclxuXHRcImdob3N0d2hpdGVcIjogWzI0OCwgMjQ4LCAyNTVdLFxyXG5cdFwiZ29sZFwiOiBbMjU1LCAyMTUsIDBdLFxyXG5cdFwiZ29sZGVucm9kXCI6IFsyMTgsIDE2NSwgMzJdLFxyXG5cdFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJncmVlblwiOiBbMCwgMTI4LCAwXSxcclxuXHRcImdyZWVueWVsbG93XCI6IFsxNzMsIDI1NSwgNDddLFxyXG5cdFwiZ3JleVwiOiBbMTI4LCAxMjgsIDEyOF0sXHJcblx0XCJob25leWRld1wiOiBbMjQwLCAyNTUsIDI0MF0sXHJcblx0XCJob3RwaW5rXCI6IFsyNTUsIDEwNSwgMTgwXSxcclxuXHRcImluZGlhbnJlZFwiOiBbMjA1LCA5MiwgOTJdLFxyXG5cdFwiaW5kaWdvXCI6IFs3NSwgMCwgMTMwXSxcclxuXHRcIml2b3J5XCI6IFsyNTUsIDI1NSwgMjQwXSxcclxuXHRcImtoYWtpXCI6IFsyNDAsIDIzMCwgMTQwXSxcclxuXHRcImxhdmVuZGVyXCI6IFsyMzAsIDIzMCwgMjUwXSxcclxuXHRcImxhdmVuZGVyYmx1c2hcIjogWzI1NSwgMjQwLCAyNDVdLFxyXG5cdFwibGF3bmdyZWVuXCI6IFsxMjQsIDI1MiwgMF0sXHJcblx0XCJsZW1vbmNoaWZmb25cIjogWzI1NSwgMjUwLCAyMDVdLFxyXG5cdFwibGlnaHRibHVlXCI6IFsxNzMsIDIxNiwgMjMwXSxcclxuXHRcImxpZ2h0Y29yYWxcIjogWzI0MCwgMTI4LCAxMjhdLFxyXG5cdFwibGlnaHRjeWFuXCI6IFsyMjQsIDI1NSwgMjU1XSxcclxuXHRcImxpZ2h0Z29sZGVucm9keWVsbG93XCI6IFsyNTAsIDI1MCwgMjEwXSxcclxuXHRcImxpZ2h0Z3JheVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodGdyZWVuXCI6IFsxNDQsIDIzOCwgMTQ0XSxcclxuXHRcImxpZ2h0Z3JleVwiOiBbMjExLCAyMTEsIDIxMV0sXHJcblx0XCJsaWdodHBpbmtcIjogWzI1NSwgMTgyLCAxOTNdLFxyXG5cdFwibGlnaHRzYWxtb25cIjogWzI1NSwgMTYwLCAxMjJdLFxyXG5cdFwibGlnaHRzZWFncmVlblwiOiBbMzIsIDE3OCwgMTcwXSxcclxuXHRcImxpZ2h0c2t5Ymx1ZVwiOiBbMTM1LCAyMDYsIDI1MF0sXHJcblx0XCJsaWdodHNsYXRlZ3JheVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHNsYXRlZ3JleVwiOiBbMTE5LCAxMzYsIDE1M10sXHJcblx0XCJsaWdodHN0ZWVsYmx1ZVwiOiBbMTc2LCAxOTYsIDIyMl0sXHJcblx0XCJsaWdodHllbGxvd1wiOiBbMjU1LCAyNTUsIDIyNF0sXHJcblx0XCJsaW1lXCI6IFswLCAyNTUsIDBdLFxyXG5cdFwibGltZWdyZWVuXCI6IFs1MCwgMjA1LCA1MF0sXHJcblx0XCJsaW5lblwiOiBbMjUwLCAyNDAsIDIzMF0sXHJcblx0XCJtYWdlbnRhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXHJcblx0XCJtZWRpdW1hcXVhbWFyaW5lXCI6IFsxMDIsIDIwNSwgMTcwXSxcclxuXHRcIm1lZGl1bWJsdWVcIjogWzAsIDAsIDIwNV0sXHJcblx0XCJtZWRpdW1vcmNoaWRcIjogWzE4NiwgODUsIDIxMV0sXHJcblx0XCJtZWRpdW1wdXJwbGVcIjogWzE0NywgMTEyLCAyMTldLFxyXG5cdFwibWVkaXVtc2VhZ3JlZW5cIjogWzYwLCAxNzksIDExM10sXHJcblx0XCJtZWRpdW1zbGF0ZWJsdWVcIjogWzEyMywgMTA0LCAyMzhdLFxyXG5cdFwibWVkaXVtc3ByaW5nZ3JlZW5cIjogWzAsIDI1MCwgMTU0XSxcclxuXHRcIm1lZGl1bXR1cnF1b2lzZVwiOiBbNzIsIDIwOSwgMjA0XSxcclxuXHRcIm1lZGl1bXZpb2xldHJlZFwiOiBbMTk5LCAyMSwgMTMzXSxcclxuXHRcIm1pZG5pZ2h0Ymx1ZVwiOiBbMjUsIDI1LCAxMTJdLFxyXG5cdFwibWludGNyZWFtXCI6IFsyNDUsIDI1NSwgMjUwXSxcclxuXHRcIm1pc3R5cm9zZVwiOiBbMjU1LCAyMjgsIDIyNV0sXHJcblx0XCJtb2NjYXNpblwiOiBbMjU1LCAyMjgsIDE4MV0sXHJcblx0XCJuYXZham93aGl0ZVwiOiBbMjU1LCAyMjIsIDE3M10sXHJcblx0XCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxyXG5cdFwib2xkbGFjZVwiOiBbMjUzLCAyNDUsIDIzMF0sXHJcblx0XCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxyXG5cdFwib2xpdmVkcmFiXCI6IFsxMDcsIDE0MiwgMzVdLFxyXG5cdFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXHJcblx0XCJvcmFuZ2VyZWRcIjogWzI1NSwgNjksIDBdLFxyXG5cdFwib3JjaGlkXCI6IFsyMTgsIDExMiwgMjE0XSxcclxuXHRcInBhbGVnb2xkZW5yb2RcIjogWzIzOCwgMjMyLCAxNzBdLFxyXG5cdFwicGFsZWdyZWVuXCI6IFsxNTIsIDI1MSwgMTUyXSxcclxuXHRcInBhbGV0dXJxdW9pc2VcIjogWzE3NSwgMjM4LCAyMzhdLFxyXG5cdFwicGFsZXZpb2xldHJlZFwiOiBbMjE5LCAxMTIsIDE0N10sXHJcblx0XCJwYXBheWF3aGlwXCI6IFsyNTUsIDIzOSwgMjEzXSxcclxuXHRcInBlYWNocHVmZlwiOiBbMjU1LCAyMTgsIDE4NV0sXHJcblx0XCJwZXJ1XCI6IFsyMDUsIDEzMywgNjNdLFxyXG5cdFwicGlua1wiOiBbMjU1LCAxOTIsIDIwM10sXHJcblx0XCJwbHVtXCI6IFsyMjEsIDE2MCwgMjIxXSxcclxuXHRcInBvd2RlcmJsdWVcIjogWzE3NiwgMjI0LCAyMzBdLFxyXG5cdFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXHJcblx0XCJyZWJlY2NhcHVycGxlXCI6IFsxMDIsIDUxLCAxNTNdLFxyXG5cdFwicmVkXCI6IFsyNTUsIDAsIDBdLFxyXG5cdFwicm9zeWJyb3duXCI6IFsxODgsIDE0MywgMTQzXSxcclxuXHRcInJveWFsYmx1ZVwiOiBbNjUsIDEwNSwgMjI1XSxcclxuXHRcInNhZGRsZWJyb3duXCI6IFsxMzksIDY5LCAxOV0sXHJcblx0XCJzYWxtb25cIjogWzI1MCwgMTI4LCAxMTRdLFxyXG5cdFwic2FuZHlicm93blwiOiBbMjQ0LCAxNjQsIDk2XSxcclxuXHRcInNlYWdyZWVuXCI6IFs0NiwgMTM5LCA4N10sXHJcblx0XCJzZWFzaGVsbFwiOiBbMjU1LCAyNDUsIDIzOF0sXHJcblx0XCJzaWVubmFcIjogWzE2MCwgODIsIDQ1XSxcclxuXHRcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXHJcblx0XCJza3libHVlXCI6IFsxMzUsIDIwNiwgMjM1XSxcclxuXHRcInNsYXRlYmx1ZVwiOiBbMTA2LCA5MCwgMjA1XSxcclxuXHRcInNsYXRlZ3JheVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbGF0ZWdyZXlcIjogWzExMiwgMTI4LCAxNDRdLFxyXG5cdFwic25vd1wiOiBbMjU1LCAyNTAsIDI1MF0sXHJcblx0XCJzcHJpbmdncmVlblwiOiBbMCwgMjU1LCAxMjddLFxyXG5cdFwic3RlZWxibHVlXCI6IFs3MCwgMTMwLCAxODBdLFxyXG5cdFwidGFuXCI6IFsyMTAsIDE4MCwgMTQwXSxcclxuXHRcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcclxuXHRcInRoaXN0bGVcIjogWzIxNiwgMTkxLCAyMTZdLFxyXG5cdFwidG9tYXRvXCI6IFsyNTUsIDk5LCA3MV0sXHJcblx0XCJ0dXJxdW9pc2VcIjogWzY0LCAyMjQsIDIwOF0sXHJcblx0XCJ2aW9sZXRcIjogWzIzOCwgMTMwLCAyMzhdLFxyXG5cdFwid2hlYXRcIjogWzI0NSwgMjIyLCAxNzldLFxyXG5cdFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxyXG5cdFwid2hpdGVzbW9rZVwiOiBbMjQ1LCAyNDUsIDI0NV0sXHJcblx0XCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXSxcclxuXHRcInllbGxvd2dyZWVuXCI6IFsxNTQsIDIwNSwgNTBdXHJcbn0iLCIvKiEgTmF0aXZlIFByb21pc2UgT25seVxuICAgIHYwLjguMSAoYykgS3lsZSBTaW1wc29uXG4gICAgTUlUIExpY2Vuc2U6IGh0dHA6Ly9nZXRpZnkubWl0LWxpY2Vuc2Uub3JnXG4qL1xuXG4oZnVuY3Rpb24gVU1EKG5hbWUsY29udGV4dCxkZWZpbml0aW9uKXtcblx0Ly8gc3BlY2lhbCBmb3JtIG9mIFVNRCBmb3IgcG9seWZpbGxpbmcgYWNyb3NzIGV2aXJvbm1lbnRzXG5cdGNvbnRleHRbbmFtZV0gPSBjb250ZXh0W25hbWVdIHx8IGRlZmluaXRpb24oKTtcblx0aWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykgeyBtb2R1bGUuZXhwb3J0cyA9IGNvbnRleHRbbmFtZV07IH1cblx0ZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgeyBkZWZpbmUoZnVuY3Rpb24gJEFNRCQoKXsgcmV0dXJuIGNvbnRleHRbbmFtZV07IH0pOyB9XG59KShcIlByb21pc2VcIix0eXBlb2YgZ2xvYmFsICE9IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0aGlzLGZ1bmN0aW9uIERFRigpe1xuXHQvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgYnVpbHRJblByb3AsIGN5Y2xlLCBzY2hlZHVsaW5nX3F1ZXVlLFxuXHRcdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcblx0XHR0aW1lciA9ICh0eXBlb2Ygc2V0SW1tZWRpYXRlICE9IFwidW5kZWZpbmVkXCIpID9cblx0XHRcdGZ1bmN0aW9uIHRpbWVyKGZuKSB7IHJldHVybiBzZXRJbW1lZGlhdGUoZm4pOyB9IDpcblx0XHRcdHNldFRpbWVvdXRcblx0O1xuXG5cdC8vIGRhbW1pdCwgSUU4LlxuXHR0cnkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSxcInhcIix7fSk7XG5cdFx0YnVpbHRJblByb3AgPSBmdW5jdGlvbiBidWlsdEluUHJvcChvYmosbmFtZSx2YWwsY29uZmlnKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaixuYW1lLHtcblx0XHRcdFx0dmFsdWU6IHZhbCxcblx0XHRcdFx0d3JpdGFibGU6IHRydWUsXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogY29uZmlnICE9PSBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0fVxuXHRjYXRjaCAoZXJyKSB7XG5cdFx0YnVpbHRJblByb3AgPSBmdW5jdGlvbiBidWlsdEluUHJvcChvYmosbmFtZSx2YWwpIHtcblx0XHRcdG9ialtuYW1lXSA9IHZhbDtcblx0XHRcdHJldHVybiBvYmo7XG5cdFx0fTtcblx0fVxuXG5cdC8vIE5vdGU6IHVzaW5nIGEgcXVldWUgaW5zdGVhZCBvZiBhcnJheSBmb3IgZWZmaWNpZW5jeVxuXHRzY2hlZHVsaW5nX3F1ZXVlID0gKGZ1bmN0aW9uIFF1ZXVlKCkge1xuXHRcdHZhciBmaXJzdCwgbGFzdCwgaXRlbTtcblxuXHRcdGZ1bmN0aW9uIEl0ZW0oZm4sc2VsZikge1xuXHRcdFx0dGhpcy5mbiA9IGZuO1xuXHRcdFx0dGhpcy5zZWxmID0gc2VsZjtcblx0XHRcdHRoaXMubmV4dCA9IHZvaWQgMDtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0YWRkOiBmdW5jdGlvbiBhZGQoZm4sc2VsZikge1xuXHRcdFx0XHRpdGVtID0gbmV3IEl0ZW0oZm4sc2VsZik7XG5cdFx0XHRcdGlmIChsYXN0KSB7XG5cdFx0XHRcdFx0bGFzdC5uZXh0ID0gaXRlbTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRmaXJzdCA9IGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdFx0bGFzdCA9IGl0ZW07XG5cdFx0XHRcdGl0ZW0gPSB2b2lkIDA7XG5cdFx0XHR9LFxuXHRcdFx0ZHJhaW46IGZ1bmN0aW9uIGRyYWluKCkge1xuXHRcdFx0XHR2YXIgZiA9IGZpcnN0O1xuXHRcdFx0XHRmaXJzdCA9IGxhc3QgPSBjeWNsZSA9IHZvaWQgMDtcblxuXHRcdFx0XHR3aGlsZSAoZikge1xuXHRcdFx0XHRcdGYuZm4uY2FsbChmLnNlbGYpO1xuXHRcdFx0XHRcdGYgPSBmLm5leHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHR9KSgpO1xuXG5cdGZ1bmN0aW9uIHNjaGVkdWxlKGZuLHNlbGYpIHtcblx0XHRzY2hlZHVsaW5nX3F1ZXVlLmFkZChmbixzZWxmKTtcblx0XHRpZiAoIWN5Y2xlKSB7XG5cdFx0XHRjeWNsZSA9IHRpbWVyKHNjaGVkdWxpbmdfcXVldWUuZHJhaW4pO1xuXHRcdH1cblx0fVxuXG5cdC8vIHByb21pc2UgZHVjayB0eXBpbmdcblx0ZnVuY3Rpb24gaXNUaGVuYWJsZShvKSB7XG5cdFx0dmFyIF90aGVuLCBvX3R5cGUgPSB0eXBlb2YgbztcblxuXHRcdGlmIChvICE9IG51bGwgJiZcblx0XHRcdChcblx0XHRcdFx0b190eXBlID09IFwib2JqZWN0XCIgfHwgb190eXBlID09IFwiZnVuY3Rpb25cIlxuXHRcdFx0KVxuXHRcdCkge1xuXHRcdFx0X3RoZW4gPSBvLnRoZW47XG5cdFx0fVxuXHRcdHJldHVybiB0eXBlb2YgX3RoZW4gPT0gXCJmdW5jdGlvblwiID8gX3RoZW4gOiBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIG5vdGlmeSgpIHtcblx0XHRmb3IgKHZhciBpPTA7IGk8dGhpcy5jaGFpbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0bm90aWZ5SXNvbGF0ZWQoXG5cdFx0XHRcdHRoaXMsXG5cdFx0XHRcdCh0aGlzLnN0YXRlID09PSAxKSA/IHRoaXMuY2hhaW5baV0uc3VjY2VzcyA6IHRoaXMuY2hhaW5baV0uZmFpbHVyZSxcblx0XHRcdFx0dGhpcy5jaGFpbltpXVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0dGhpcy5jaGFpbi5sZW5ndGggPSAwO1xuXHR9XG5cblx0Ly8gTk9URTogVGhpcyBpcyBhIHNlcGFyYXRlIGZ1bmN0aW9uIHRvIGlzb2xhdGVcblx0Ly8gdGhlIGB0cnkuLmNhdGNoYCBzbyB0aGF0IG90aGVyIGNvZGUgY2FuIGJlXG5cdC8vIG9wdGltaXplZCBiZXR0ZXJcblx0ZnVuY3Rpb24gbm90aWZ5SXNvbGF0ZWQoc2VsZixjYixjaGFpbikge1xuXHRcdHZhciByZXQsIF90aGVuO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoY2IgPT09IGZhbHNlKSB7XG5cdFx0XHRcdGNoYWluLnJlamVjdChzZWxmLm1zZyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNiID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0cmV0ID0gc2VsZi5tc2c7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0cmV0ID0gY2IuY2FsbCh2b2lkIDAsc2VsZi5tc2cpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHJldCA9PT0gY2hhaW4ucHJvbWlzZSkge1xuXHRcdFx0XHRcdGNoYWluLnJlamVjdChUeXBlRXJyb3IoXCJQcm9taXNlLWNoYWluIGN5Y2xlXCIpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChfdGhlbiA9IGlzVGhlbmFibGUocmV0KSkge1xuXHRcdFx0XHRcdF90aGVuLmNhbGwocmV0LGNoYWluLnJlc29sdmUsY2hhaW4ucmVqZWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRjaGFpbi5yZXNvbHZlKHJldCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y2F0Y2ggKGVycikge1xuXHRcdFx0Y2hhaW4ucmVqZWN0KGVycik7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVzb2x2ZShtc2cpIHtcblx0XHR2YXIgX3RoZW4sIHNlbGYgPSB0aGlzO1xuXG5cdFx0Ly8gYWxyZWFkeSB0cmlnZ2VyZWQ/XG5cdFx0aWYgKHNlbGYudHJpZ2dlcmVkKSB7IHJldHVybjsgfVxuXG5cdFx0c2VsZi50cmlnZ2VyZWQgPSB0cnVlO1xuXG5cdFx0Ly8gdW53cmFwXG5cdFx0aWYgKHNlbGYuZGVmKSB7XG5cdFx0XHRzZWxmID0gc2VsZi5kZWY7XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChfdGhlbiA9IGlzVGhlbmFibGUobXNnKSkge1xuXHRcdFx0XHRzY2hlZHVsZShmdW5jdGlvbigpe1xuXHRcdFx0XHRcdHZhciBkZWZfd3JhcHBlciA9IG5ldyBNYWtlRGVmV3JhcHBlcihzZWxmKTtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0X3RoZW4uY2FsbChtc2csXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICRyZXNvbHZlJCgpeyByZXNvbHZlLmFwcGx5KGRlZl93cmFwcGVyLGFyZ3VtZW50cyk7IH0sXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICRyZWplY3QkKCl7IHJlamVjdC5hcHBseShkZWZfd3JhcHBlcixhcmd1bWVudHMpOyB9XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRyZWplY3QuY2FsbChkZWZfd3JhcHBlcixlcnIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRzZWxmLm1zZyA9IG1zZztcblx0XHRcdFx0c2VsZi5zdGF0ZSA9IDE7XG5cdFx0XHRcdGlmIChzZWxmLmNoYWluLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRzY2hlZHVsZShub3RpZnksc2VsZik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y2F0Y2ggKGVycikge1xuXHRcdFx0cmVqZWN0LmNhbGwobmV3IE1ha2VEZWZXcmFwcGVyKHNlbGYpLGVycik7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcmVqZWN0KG1zZykge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdC8vIGFscmVhZHkgdHJpZ2dlcmVkP1xuXHRcdGlmIChzZWxmLnRyaWdnZXJlZCkgeyByZXR1cm47IH1cblxuXHRcdHNlbGYudHJpZ2dlcmVkID0gdHJ1ZTtcblxuXHRcdC8vIHVud3JhcFxuXHRcdGlmIChzZWxmLmRlZikge1xuXHRcdFx0c2VsZiA9IHNlbGYuZGVmO1xuXHRcdH1cblxuXHRcdHNlbGYubXNnID0gbXNnO1xuXHRcdHNlbGYuc3RhdGUgPSAyO1xuXHRcdGlmIChzZWxmLmNoYWluLmxlbmd0aCA+IDApIHtcblx0XHRcdHNjaGVkdWxlKG5vdGlmeSxzZWxmKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBpdGVyYXRlUHJvbWlzZXMoQ29uc3RydWN0b3IsYXJyLHJlc29sdmVyLHJlamVjdGVyKSB7XG5cdFx0Zm9yICh2YXIgaWR4PTA7IGlkeDxhcnIubGVuZ3RoOyBpZHgrKykge1xuXHRcdFx0KGZ1bmN0aW9uIElJRkUoaWR4KXtcblx0XHRcdFx0Q29uc3RydWN0b3IucmVzb2x2ZShhcnJbaWR4XSlcblx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0ZnVuY3Rpb24gJHJlc29sdmVyJChtc2cpe1xuXHRcdFx0XHRcdFx0cmVzb2x2ZXIoaWR4LG1zZyk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyZWplY3RlclxuXHRcdFx0XHQpO1xuXHRcdFx0fSkoaWR4KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBNYWtlRGVmV3JhcHBlcihzZWxmKSB7XG5cdFx0dGhpcy5kZWYgPSBzZWxmO1xuXHRcdHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG5cdH1cblxuXHRmdW5jdGlvbiBNYWtlRGVmKHNlbGYpIHtcblx0XHR0aGlzLnByb21pc2UgPSBzZWxmO1xuXHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdHRoaXMudHJpZ2dlcmVkID0gZmFsc2U7XG5cdFx0dGhpcy5jaGFpbiA9IFtdO1xuXHRcdHRoaXMubXNnID0gdm9pZCAwO1xuXHR9XG5cblx0ZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuXHRcdGlmICh0eXBlb2YgZXhlY3V0b3IgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fX05QT19fICE9PSAwKSB7XG5cdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBwcm9taXNlXCIpO1xuXHRcdH1cblxuXHRcdC8vIGluc3RhbmNlIHNoYWRvd2luZyB0aGUgaW5oZXJpdGVkIFwiYnJhbmRcIlxuXHRcdC8vIHRvIHNpZ25hbCBhbiBhbHJlYWR5IFwiaW5pdGlhbGl6ZWRcIiBwcm9taXNlXG5cdFx0dGhpcy5fX05QT19fID0gMTtcblxuXHRcdHZhciBkZWYgPSBuZXcgTWFrZURlZih0aGlzKTtcblxuXHRcdHRoaXNbXCJ0aGVuXCJdID0gZnVuY3Rpb24gdGhlbihzdWNjZXNzLGZhaWx1cmUpIHtcblx0XHRcdHZhciBvID0ge1xuXHRcdFx0XHRzdWNjZXNzOiB0eXBlb2Ygc3VjY2VzcyA9PSBcImZ1bmN0aW9uXCIgPyBzdWNjZXNzIDogdHJ1ZSxcblx0XHRcdFx0ZmFpbHVyZTogdHlwZW9mIGZhaWx1cmUgPT0gXCJmdW5jdGlvblwiID8gZmFpbHVyZSA6IGZhbHNlXG5cdFx0XHR9O1xuXHRcdFx0Ly8gTm90ZTogYHRoZW4oLi4pYCBpdHNlbGYgY2FuIGJlIGJvcnJvd2VkIHRvIGJlIHVzZWQgYWdhaW5zdFxuXHRcdFx0Ly8gYSBkaWZmZXJlbnQgcHJvbWlzZSBjb25zdHJ1Y3RvciBmb3IgbWFraW5nIHRoZSBjaGFpbmVkIHByb21pc2UsXG5cdFx0XHQvLyBieSBzdWJzdGl0dXRpbmcgYSBkaWZmZXJlbnQgYHRoaXNgIGJpbmRpbmcuXG5cdFx0XHRvLnByb21pc2UgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihmdW5jdGlvbiBleHRyYWN0Q2hhaW4ocmVzb2x2ZSxyZWplY3QpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiByZXNvbHZlICE9IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVqZWN0ICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0by5yZXNvbHZlID0gcmVzb2x2ZTtcblx0XHRcdFx0by5yZWplY3QgPSByZWplY3Q7XG5cdFx0XHR9KTtcblx0XHRcdGRlZi5jaGFpbi5wdXNoKG8pO1xuXG5cdFx0XHRpZiAoZGVmLnN0YXRlICE9PSAwKSB7XG5cdFx0XHRcdHNjaGVkdWxlKG5vdGlmeSxkZWYpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gby5wcm9taXNlO1xuXHRcdH07XG5cdFx0dGhpc1tcImNhdGNoXCJdID0gZnVuY3Rpb24gJGNhdGNoJChmYWlsdXJlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50aGVuKHZvaWQgMCxmYWlsdXJlKTtcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGV4ZWN1dG9yLmNhbGwoXG5cdFx0XHRcdHZvaWQgMCxcblx0XHRcdFx0ZnVuY3Rpb24gcHVibGljUmVzb2x2ZShtc2cpe1xuXHRcdFx0XHRcdHJlc29sdmUuY2FsbChkZWYsbXNnKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24gcHVibGljUmVqZWN0KG1zZykge1xuXHRcdFx0XHRcdHJlamVjdC5jYWxsKGRlZixtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH1cblx0XHRjYXRjaCAoZXJyKSB7XG5cdFx0XHRyZWplY3QuY2FsbChkZWYsZXJyKTtcblx0XHR9XG5cdH1cblxuXHR2YXIgUHJvbWlzZVByb3RvdHlwZSA9IGJ1aWx0SW5Qcm9wKHt9LFwiY29uc3RydWN0b3JcIixQcm9taXNlLFxuXHRcdC8qY29uZmlndXJhYmxlPSovZmFsc2Vcblx0KTtcblxuXHQvLyBOb3RlOiBBbmRyb2lkIDQgY2Fubm90IHVzZSBgT2JqZWN0LmRlZmluZVByb3BlcnR5KC4uKWAgaGVyZVxuXHRQcm9taXNlLnByb3RvdHlwZSA9IFByb21pc2VQcm90b3R5cGU7XG5cblx0Ly8gYnVpbHQtaW4gXCJicmFuZFwiIHRvIHNpZ25hbCBhbiBcInVuaW5pdGlhbGl6ZWRcIiBwcm9taXNlXG5cdGJ1aWx0SW5Qcm9wKFByb21pc2VQcm90b3R5cGUsXCJfX05QT19fXCIsMCxcblx0XHQvKmNvbmZpZ3VyYWJsZT0qL2ZhbHNlXG5cdCk7XG5cblx0YnVpbHRJblByb3AoUHJvbWlzZSxcInJlc29sdmVcIixmdW5jdGlvbiBQcm9taXNlJHJlc29sdmUobXNnKSB7XG5cdFx0dmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuXHRcdC8vIHNwZWMgbWFuZGF0ZWQgY2hlY2tzXG5cdFx0Ly8gbm90ZTogYmVzdCBcImlzUHJvbWlzZVwiIGNoZWNrIHRoYXQncyBwcmFjdGljYWwgZm9yIG5vd1xuXHRcdGlmIChtc2cgJiYgdHlwZW9mIG1zZyA9PSBcIm9iamVjdFwiICYmIG1zZy5fX05QT19fID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gbXNnO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSxyZWplY3Qpe1xuXHRcdFx0aWYgKHR5cGVvZiByZXNvbHZlICE9IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVqZWN0ICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0cmVzb2x2ZShtc2cpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRidWlsdEluUHJvcChQcm9taXNlLFwicmVqZWN0XCIsZnVuY3Rpb24gUHJvbWlzZSRyZWplY3QobXNnKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUscmVqZWN0KXtcblx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdHJlamVjdChtc2cpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRidWlsdEluUHJvcChQcm9taXNlLFwiYWxsXCIsZnVuY3Rpb24gUHJvbWlzZSRhbGwoYXJyKSB7XG5cdFx0dmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuXHRcdC8vIHNwZWMgbWFuZGF0ZWQgY2hlY2tzXG5cdFx0aWYgKFRvU3RyaW5nLmNhbGwoYXJyKSAhPSBcIltvYmplY3QgQXJyYXldXCIpIHtcblx0XHRcdHJldHVybiBDb25zdHJ1Y3Rvci5yZWplY3QoVHlwZUVycm9yKFwiTm90IGFuIGFycmF5XCIpKTtcblx0XHR9XG5cdFx0aWYgKGFyci5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBDb25zdHJ1Y3Rvci5yZXNvbHZlKFtdKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IENvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUscmVqZWN0KXtcblx0XHRcdGlmICh0eXBlb2YgcmVzb2x2ZSAhPSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHJlamVjdCAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBsZW4gPSBhcnIubGVuZ3RoLCBtc2dzID0gQXJyYXkobGVuKSwgY291bnQgPSAwO1xuXG5cdFx0XHRpdGVyYXRlUHJvbWlzZXMoQ29uc3RydWN0b3IsYXJyLGZ1bmN0aW9uIHJlc29sdmVyKGlkeCxtc2cpIHtcblx0XHRcdFx0bXNnc1tpZHhdID0gbXNnO1xuXHRcdFx0XHRpZiAoKytjb3VudCA9PT0gbGVuKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZShtc2dzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxyZWplY3QpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRidWlsdEluUHJvcChQcm9taXNlLFwicmFjZVwiLGZ1bmN0aW9uIFByb21pc2UkcmFjZShhcnIpIHtcblx0XHR2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG5cdFx0Ly8gc3BlYyBtYW5kYXRlZCBjaGVja3Ncblx0XHRpZiAoVG9TdHJpbmcuY2FsbChhcnIpICE9IFwiW29iamVjdCBBcnJheV1cIikge1xuXHRcdFx0cmV0dXJuIENvbnN0cnVjdG9yLnJlamVjdChUeXBlRXJyb3IoXCJOb3QgYW4gYXJyYXlcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSxyZWplY3Qpe1xuXHRcdFx0aWYgKHR5cGVvZiByZXNvbHZlICE9IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVqZWN0ICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aXRlcmF0ZVByb21pc2VzKENvbnN0cnVjdG9yLGFycixmdW5jdGlvbiByZXNvbHZlcihpZHgsbXNnKXtcblx0XHRcdFx0cmVzb2x2ZShtc2cpO1xuXHRcdFx0fSxyZWplY3QpO1xuXHRcdH0pO1xuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyAjIHNpbXBsZS1zdGF0aXN0aWNzXG4vL1xuLy8gQSBzaW1wbGUsIGxpdGVyYXRlIHN0YXRpc3RpY3Mgc3lzdGVtLlxuXG52YXIgc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBMaW5lYXIgUmVncmVzc2lvblxuc3MubGluZWFyUmVncmVzc2lvbiA9IHJlcXVpcmUoJy4vc3JjL2xpbmVhcl9yZWdyZXNzaW9uJyk7XG5zcy5saW5lYXJSZWdyZXNzaW9uTGluZSA9IHJlcXVpcmUoJy4vc3JjL2xpbmVhcl9yZWdyZXNzaW9uX2xpbmUnKTtcbnNzLnN0YW5kYXJkRGV2aWF0aW9uID0gcmVxdWlyZSgnLi9zcmMvc3RhbmRhcmRfZGV2aWF0aW9uJyk7XG5zcy5yU3F1YXJlZCA9IHJlcXVpcmUoJy4vc3JjL3Jfc3F1YXJlZCcpO1xuc3MubW9kZSA9IHJlcXVpcmUoJy4vc3JjL21vZGUnKTtcbnNzLm1pbiA9IHJlcXVpcmUoJy4vc3JjL21pbicpO1xuc3MubWF4ID0gcmVxdWlyZSgnLi9zcmMvbWF4Jyk7XG5zcy5zdW0gPSByZXF1aXJlKCcuL3NyYy9zdW0nKTtcbnNzLnF1YW50aWxlID0gcmVxdWlyZSgnLi9zcmMvcXVhbnRpbGUnKTtcbnNzLnF1YW50aWxlU29ydGVkID0gcmVxdWlyZSgnLi9zcmMvcXVhbnRpbGVfc29ydGVkJyk7XG5zcy5pcXIgPSBzcy5pbnRlcnF1YXJ0aWxlUmFuZ2UgPSByZXF1aXJlKCcuL3NyYy9pbnRlcnF1YXJ0aWxlX3JhbmdlJyk7XG5zcy5tZWRpYW5BYnNvbHV0ZURldmlhdGlvbiA9IHNzLm1hZCA9IHJlcXVpcmUoJy4vc3JjL21hZCcpO1xuc3MuY2h1bmsgPSByZXF1aXJlKCcuL3NyYy9jaHVuaycpO1xuc3Muc2h1ZmZsZSA9IHJlcXVpcmUoJy4vc3JjL3NodWZmbGUnKTtcbnNzLnNodWZmbGVJblBsYWNlID0gcmVxdWlyZSgnLi9zcmMvc2h1ZmZsZV9pbl9wbGFjZScpO1xuc3Muc2FtcGxlID0gcmVxdWlyZSgnLi9zcmMvc2FtcGxlJyk7XG5zcy5ja21lYW5zID0gcmVxdWlyZSgnLi9zcmMvY2ttZWFucycpO1xuc3Muc29ydGVkVW5pcXVlQ291bnQgPSByZXF1aXJlKCcuL3NyYy9zb3J0ZWRfdW5pcXVlX2NvdW50Jyk7XG5zcy5zdW1OdGhQb3dlckRldmlhdGlvbnMgPSByZXF1aXJlKCcuL3NyYy9zdW1fbnRoX3Bvd2VyX2RldmlhdGlvbnMnKTtcblxuLy8gc2FtcGxlIHN0YXRpc3RpY3NcbnNzLnNhbXBsZUNvdmFyaWFuY2UgPSByZXF1aXJlKCcuL3NyYy9zYW1wbGVfY292YXJpYW5jZScpO1xuc3Muc2FtcGxlQ29ycmVsYXRpb24gPSByZXF1aXJlKCcuL3NyYy9zYW1wbGVfY29ycmVsYXRpb24nKTtcbnNzLnNhbXBsZVZhcmlhbmNlID0gcmVxdWlyZSgnLi9zcmMvc2FtcGxlX3ZhcmlhbmNlJyk7XG5zcy5zYW1wbGVTdGFuZGFyZERldmlhdGlvbiA9IHJlcXVpcmUoJy4vc3JjL3NhbXBsZV9zdGFuZGFyZF9kZXZpYXRpb24nKTtcbnNzLnNhbXBsZVNrZXduZXNzID0gcmVxdWlyZSgnLi9zcmMvc2FtcGxlX3NrZXduZXNzJyk7XG5cbi8vIG1lYXN1cmVzIG9mIGNlbnRyYWxpdHlcbnNzLmdlb21ldHJpY01lYW4gPSByZXF1aXJlKCcuL3NyYy9nZW9tZXRyaWNfbWVhbicpO1xuc3MuaGFybW9uaWNNZWFuID0gcmVxdWlyZSgnLi9zcmMvaGFybW9uaWNfbWVhbicpO1xuc3MubWVhbiA9IHNzLmF2ZXJhZ2UgPSByZXF1aXJlKCcuL3NyYy9tZWFuJyk7XG5zcy5tZWRpYW4gPSByZXF1aXJlKCcuL3NyYy9tZWRpYW4nKTtcblxuc3Mucm9vdE1lYW5TcXVhcmUgPSBzcy5ybXMgPSByZXF1aXJlKCcuL3NyYy9yb290X21lYW5fc3F1YXJlJyk7XG5zcy52YXJpYW5jZSA9IHJlcXVpcmUoJy4vc3JjL3ZhcmlhbmNlJyk7XG5zcy50VGVzdCA9IHJlcXVpcmUoJy4vc3JjL3RfdGVzdCcpO1xuc3MudFRlc3RUd29TYW1wbGUgPSByZXF1aXJlKCcuL3NyYy90X3Rlc3RfdHdvX3NhbXBsZScpO1xuLy8gc3MuamVua3MgPSByZXF1aXJlKCcuL3NyYy9qZW5rcycpO1xuXG4vLyBDbGFzc2lmaWVyc1xuc3MuYmF5ZXNpYW4gPSByZXF1aXJlKCcuL3NyYy9iYXllc2lhbl9jbGFzc2lmaWVyJyk7XG5zcy5wZXJjZXB0cm9uID0gcmVxdWlyZSgnLi9zcmMvcGVyY2VwdHJvbicpO1xuXG4vLyBEaXN0cmlidXRpb24tcmVsYXRlZCBtZXRob2RzXG5zcy5lcHNpbG9uID0gcmVxdWlyZSgnLi9zcmMvZXBzaWxvbicpOyAvLyBXZSBtYWtlIM61IGF2YWlsYWJsZSB0byB0aGUgdGVzdCBzdWl0ZS5cbnNzLmZhY3RvcmlhbCA9IHJlcXVpcmUoJy4vc3JjL2ZhY3RvcmlhbCcpO1xuc3MuYmVybm91bGxpRGlzdHJpYnV0aW9uID0gcmVxdWlyZSgnLi9zcmMvYmVybm91bGxpX2Rpc3RyaWJ1dGlvbicpO1xuc3MuYmlub21pYWxEaXN0cmlidXRpb24gPSByZXF1aXJlKCcuL3NyYy9iaW5vbWlhbF9kaXN0cmlidXRpb24nKTtcbnNzLnBvaXNzb25EaXN0cmlidXRpb24gPSByZXF1aXJlKCcuL3NyYy9wb2lzc29uX2Rpc3RyaWJ1dGlvbicpO1xuc3MuY2hpU3F1YXJlZEdvb2RuZXNzT2ZGaXQgPSByZXF1aXJlKCcuL3NyYy9jaGlfc3F1YXJlZF9nb29kbmVzc19vZl9maXQnKTtcblxuLy8gTm9ybWFsIGRpc3RyaWJ1dGlvblxuc3MuelNjb3JlID0gcmVxdWlyZSgnLi9zcmMvel9zY29yZScpO1xuc3MuY3VtdWxhdGl2ZVN0ZE5vcm1hbFByb2JhYmlsaXR5ID0gcmVxdWlyZSgnLi9zcmMvY3VtdWxhdGl2ZV9zdGRfbm9ybWFsX3Byb2JhYmlsaXR5Jyk7XG5zcy5zdGFuZGFyZE5vcm1hbFRhYmxlID0gcmVxdWlyZSgnLi9zcmMvc3RhbmRhcmRfbm9ybWFsX3RhYmxlJyk7XG5zcy5lcnJvckZ1bmN0aW9uID0gc3MuZXJmID0gcmVxdWlyZSgnLi9zcmMvZXJyb3JfZnVuY3Rpb24nKTtcbnNzLmludmVyc2VFcnJvckZ1bmN0aW9uID0gcmVxdWlyZSgnLi9zcmMvaW52ZXJzZV9lcnJvcl9mdW5jdGlvbicpO1xuc3MucHJvYml0ID0gcmVxdWlyZSgnLi9zcmMvcHJvYml0Jyk7XG5zcy5taXhpbiA9IHJlcXVpcmUoJy4vc3JjL21peGluJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogW0JheWVzaWFuIENsYXNzaWZpZXJdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTmFpdmVfQmF5ZXNfY2xhc3NpZmllcilcbiAqXG4gKiBUaGlzIGlzIGEgbmHDr3ZlIGJheWVzaWFuIGNsYXNzaWZpZXIgdGhhdCB0YWtlc1xuICogc2luZ2x5LW5lc3RlZCBvYmplY3RzLlxuICpcbiAqIEBjbGFzc1xuICogQGV4YW1wbGVcbiAqIHZhciBiYXllcyA9IG5ldyBCYXllc2lhbkNsYXNzaWZpZXIoKTtcbiAqIGJheWVzLnRyYWluKHtcbiAqICAgc3BlY2llczogJ0NhdCdcbiAqIH0sICdhbmltYWwnKTtcbiAqIHZhciByZXN1bHQgPSBiYXllcy5zY29yZSh7XG4gKiAgIHNwZWNpZXM6ICdDYXQnXG4gKiB9KVxuICogLy8gcmVzdWx0XG4gKiAvLyB7XG4gKiAvLyAgIGFuaW1hbDogMVxuICogLy8gfVxuICovXG5mdW5jdGlvbiBCYXllc2lhbkNsYXNzaWZpZXIoKSB7XG4gICAgLy8gVGhlIG51bWJlciBvZiBpdGVtcyB0aGF0IGFyZSBjdXJyZW50bHlcbiAgICAvLyBjbGFzc2lmaWVkIGluIHRoZSBtb2RlbFxuICAgIHRoaXMudG90YWxDb3VudCA9IDA7XG4gICAgLy8gRXZlcnkgaXRlbSBjbGFzc2lmaWVkIGluIHRoZSBtb2RlbFxuICAgIHRoaXMuZGF0YSA9IHt9O1xufVxuXG4vKipcbiAqIFRyYWluIHRoZSBjbGFzc2lmaWVyIHdpdGggYSBuZXcgaXRlbSwgd2hpY2ggaGFzIGEgc2luZ2xlXG4gKiBkaW1lbnNpb24gb2YgSmF2YXNjcmlwdCBsaXRlcmFsIGtleXMgYW5kIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaXRlbSBhbiBvYmplY3Qgd2l0aCBzaW5nbHktZGVlcCBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge3N0cmluZ30gY2F0ZWdvcnkgdGhlIGNhdGVnb3J5IHRoaXMgaXRlbSBiZWxvbmdzIHRvXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IGFkZHMgdGhlIGl0ZW0gdG8gdGhlIGNsYXNzaWZpZXJcbiAqL1xuQmF5ZXNpYW5DbGFzc2lmaWVyLnByb3RvdHlwZS50cmFpbiA9IGZ1bmN0aW9uKGl0ZW0sIGNhdGVnb3J5KSB7XG4gICAgLy8gSWYgdGhlIGRhdGEgb2JqZWN0IGRvZXNuJ3QgaGF2ZSBhbnkgdmFsdWVzXG4gICAgLy8gZm9yIHRoaXMgY2F0ZWdvcnksIGNyZWF0ZSBhIG5ldyBvYmplY3QgZm9yIGl0LlxuICAgIGlmICghdGhpcy5kYXRhW2NhdGVnb3J5XSkge1xuICAgICAgICB0aGlzLmRhdGFbY2F0ZWdvcnldID0ge307XG4gICAgfVxuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2gga2V5IGluIHRoZSBpdGVtLlxuICAgIGZvciAodmFyIGsgaW4gaXRlbSkge1xuICAgICAgICB2YXIgdiA9IGl0ZW1ba107XG4gICAgICAgIC8vIEluaXRpYWxpemUgdGhlIG5lc3RlZCBvYmplY3QgYGRhdGFbY2F0ZWdvcnldW2tdW2l0ZW1ba11dYFxuICAgICAgICAvLyB3aXRoIGFuIG9iamVjdCBvZiBrZXlzIHRoYXQgZXF1YWwgMC5cbiAgICAgICAgaWYgKHRoaXMuZGF0YVtjYXRlZ29yeV1ba10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhW2NhdGVnb3J5XVtrXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmRhdGFbY2F0ZWdvcnldW2tdW3ZdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtjYXRlZ29yeV1ba11bdl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW5kIGluY3JlbWVudCB0aGUga2V5IGZvciB0aGlzIGtleS92YWx1ZSBjb21iaW5hdGlvbi5cbiAgICAgICAgdGhpcy5kYXRhW2NhdGVnb3J5XVtrXVtpdGVtW2tdXSsrO1xuICAgIH1cblxuICAgIC8vIEluY3JlbWVudCB0aGUgbnVtYmVyIG9mIGl0ZW1zIGNsYXNzaWZpZWRcbiAgICB0aGlzLnRvdGFsQ291bnQrKztcbn07XG5cbi8qKlxuICogR2VuZXJhdGUgYSBzY29yZSBvZiBob3cgd2VsbCB0aGlzIGl0ZW0gbWF0Y2hlcyBhbGxcbiAqIHBvc3NpYmxlIGNhdGVnb3JpZXMgYmFzZWQgb24gaXRzIGF0dHJpYnV0ZXNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaXRlbSBhbiBpdGVtIGluIHRoZSBzYW1lIGZvcm1hdCBhcyB3aXRoIHRyYWluXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBvZiBwcm9iYWJpbGl0aWVzIHRoYXQgdGhpcyBpdGVtIGJlbG9uZ3MgdG8gYVxuICogZ2l2ZW4gY2F0ZWdvcnkuXG4gKi9cbkJheWVzaWFuQ2xhc3NpZmllci5wcm90b3R5cGUuc2NvcmUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSBhbiBlbXB0eSBhcnJheSBvZiBvZGRzIHBlciBjYXRlZ29yeS5cbiAgICB2YXIgb2RkcyA9IHt9LCBjYXRlZ29yeTtcbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBrZXkgaW4gdGhlIGl0ZW0sXG4gICAgLy8gdGhlbiBpdGVyYXRlIHRocm91Z2ggZWFjaCBjYXRlZ29yeSB0aGF0IGhhcyBiZWVuIHVzZWRcbiAgICAvLyBpbiBwcmV2aW91cyBjYWxscyB0byBgLnRyYWluKClgXG4gICAgZm9yICh2YXIgayBpbiBpdGVtKSB7XG4gICAgICAgIHZhciB2ID0gaXRlbVtrXTtcbiAgICAgICAgZm9yIChjYXRlZ29yeSBpbiB0aGlzLmRhdGEpIHtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBvYmplY3QgZm9yIHN0b3Jpbmcga2V5IC0gdmFsdWUgY29tYmluYXRpb25zXG4gICAgICAgICAgICAvLyBmb3IgdGhpcyBjYXRlZ29yeS5cbiAgICAgICAgICAgIGlmIChvZGRzW2NhdGVnb3J5XSA9PT0gdW5kZWZpbmVkKSB7IG9kZHNbY2F0ZWdvcnldID0ge307IH1cblxuICAgICAgICAgICAgLy8gSWYgdGhpcyBpdGVtIGRvZXNuJ3QgZXZlbiBoYXZlIGEgcHJvcGVydHksIGl0IGNvdW50cyBmb3Igbm90aGluZyxcbiAgICAgICAgICAgIC8vIGJ1dCBpZiBpdCBkb2VzIGhhdmUgdGhlIHByb3BlcnR5IHRoYXQgd2UncmUgbG9va2luZyBmb3IgZnJvbVxuICAgICAgICAgICAgLy8gdGhlIGl0ZW0gdG8gY2F0ZWdvcml6ZSwgaXQgY291bnRzIGJhc2VkIG9uIGhvdyBwb3B1bGFyIGl0IGlzXG4gICAgICAgICAgICAvLyB2ZXJzdXMgdGhlIHdob2xlIHBvcHVsYXRpb24uXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhW2NhdGVnb3J5XVtrXSkge1xuICAgICAgICAgICAgICAgIG9kZHNbY2F0ZWdvcnldW2sgKyAnXycgKyB2XSA9ICh0aGlzLmRhdGFbY2F0ZWdvcnldW2tdW3ZdIHx8IDApIC8gdGhpcy50b3RhbENvdW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvZGRzW2NhdGVnb3J5XVtrICsgJ18nICsgdl0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIGEgbmV3IG9iamVjdCB0aGF0IHdpbGwgY29udGFpbiBzdW1zIG9mIHRoZXNlIG9kZHMgYnkgY2F0ZWdvcnlcbiAgICB2YXIgb2Rkc1N1bXMgPSB7fTtcblxuICAgIGZvciAoY2F0ZWdvcnkgaW4gb2Rkcykge1xuICAgICAgICAvLyBUYWxseSBhbGwgb2YgdGhlIG9kZHMgZm9yIGVhY2ggY2F0ZWdvcnktY29tYmluYXRpb24gcGFpciAtXG4gICAgICAgIC8vIHRoZSBub24tZXhpc3RlbmNlIG9mIGEgY2F0ZWdvcnkgZG9lcyBub3QgYWRkIGFueXRoaW5nIHRvIHRoZVxuICAgICAgICAvLyBzY29yZS5cbiAgICAgICAgZm9yICh2YXIgY29tYmluYXRpb24gaW4gb2Rkc1tjYXRlZ29yeV0pIHtcbiAgICAgICAgICAgIGlmIChvZGRzU3Vtc1tjYXRlZ29yeV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG9kZHNTdW1zW2NhdGVnb3J5XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvZGRzU3Vtc1tjYXRlZ29yeV0gKz0gb2Rkc1tjYXRlZ29yeV1bY29tYmluYXRpb25dO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9kZHNTdW1zO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXllc2lhbkNsYXNzaWZpZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5vbWlhbERpc3RyaWJ1dGlvbiA9IHJlcXVpcmUoJy4vYmlub21pYWxfZGlzdHJpYnV0aW9uJyk7XG5cbi8qKlxuICogVGhlIFtCZXJub3VsbGkgZGlzdHJpYnV0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jlcm5vdWxsaV9kaXN0cmlidXRpb24pXG4gKiBpcyB0aGUgcHJvYmFiaWxpdHkgZGlzY3JldGVcbiAqIGRpc3RyaWJ1dGlvbiBvZiBhIHJhbmRvbSB2YXJpYWJsZSB3aGljaCB0YWtlcyB2YWx1ZSAxIHdpdGggc3VjY2Vzc1xuICogcHJvYmFiaWxpdHkgYHBgIGFuZCB2YWx1ZSAwIHdpdGggZmFpbHVyZVxuICogcHJvYmFiaWxpdHkgYHFgID0gMSAtIGBwYC4gSXQgY2FuIGJlIHVzZWQsIGZvciBleGFtcGxlLCB0byByZXByZXNlbnQgdGhlXG4gKiB0b3NzIG9mIGEgY29pbiwgd2hlcmUgXCIxXCIgaXMgZGVmaW5lZCB0byBtZWFuIFwiaGVhZHNcIiBhbmQgXCIwXCIgaXMgZGVmaW5lZFxuICogdG8gbWVhbiBcInRhaWxzXCIgKG9yIHZpY2UgdmVyc2EpLiBJdCBpc1xuICogYSBzcGVjaWFsIGNhc2Ugb2YgYSBCaW5vbWlhbCBEaXN0cmlidXRpb25cbiAqIHdoZXJlIGBuYCA9IDEuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHAgaW5wdXQgdmFsdWUsIGJldHdlZW4gMCBhbmQgMSBpbmNsdXNpdmVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHZhbHVlIG9mIGJlcm5vdWxsaSBkaXN0cmlidXRpb24gYXQgdGhpcyBwb2ludFxuICovXG5mdW5jdGlvbiBiZXJub3VsbGlEaXN0cmlidXRpb24ocCkge1xuICAgIC8vIENoZWNrIHRoYXQgYHBgIGlzIGEgdmFsaWQgcHJvYmFiaWxpdHkgKDAg4omkIHAg4omkIDEpXG4gICAgaWYgKHAgPCAwIHx8IHAgPiAxICkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgcmV0dXJuIGJpbm9taWFsRGlzdHJpYnV0aW9uKDEsIHApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJlcm5vdWxsaURpc3RyaWJ1dGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVwc2lsb24gPSByZXF1aXJlKCcuL2Vwc2lsb24nKTtcbnZhciBmYWN0b3JpYWwgPSByZXF1aXJlKCcuL2ZhY3RvcmlhbCcpO1xuXG4vKipcbiAqIFRoZSBbQmlub21pYWwgRGlzdHJpYnV0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Jpbm9taWFsX2Rpc3RyaWJ1dGlvbikgaXMgdGhlIGRpc2NyZXRlIHByb2JhYmlsaXR5XG4gKiBkaXN0cmlidXRpb24gb2YgdGhlIG51bWJlciBvZiBzdWNjZXNzZXMgaW4gYSBzZXF1ZW5jZSBvZiBuIGluZGVwZW5kZW50IHllcy9ubyBleHBlcmltZW50cywgZWFjaCBvZiB3aGljaCB5aWVsZHNcbiAqIHN1Y2Nlc3Mgd2l0aCBwcm9iYWJpbGl0eSBgcHJvYmFiaWxpdHlgLiBTdWNoIGEgc3VjY2Vzcy9mYWlsdXJlIGV4cGVyaW1lbnQgaXMgYWxzbyBjYWxsZWQgYSBCZXJub3VsbGkgZXhwZXJpbWVudCBvclxuICogQmVybm91bGxpIHRyaWFsOyB3aGVuIHRyaWFscyA9IDEsIHRoZSBCaW5vbWlhbCBEaXN0cmlidXRpb24gaXMgYSBCZXJub3VsbGkgRGlzdHJpYnV0aW9uLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB0cmlhbHMgbnVtYmVyIG9mIHRyaWFscyB0byBzaW11bGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHByb2JhYmlsaXR5XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBvdXRwdXRcbiAqL1xuZnVuY3Rpb24gYmlub21pYWxEaXN0cmlidXRpb24odHJpYWxzLCBwcm9iYWJpbGl0eSkge1xuICAgIC8vIENoZWNrIHRoYXQgYHBgIGlzIGEgdmFsaWQgcHJvYmFiaWxpdHkgKDAg4omkIHAg4omkIDEpLFxuICAgIC8vIHRoYXQgYG5gIGlzIGFuIGludGVnZXIsIHN0cmljdGx5IHBvc2l0aXZlLlxuICAgIGlmIChwcm9iYWJpbGl0eSA8IDAgfHwgcHJvYmFiaWxpdHkgPiAxIHx8XG4gICAgICAgIHRyaWFscyA8PSAwIHx8IHRyaWFscyAlIDEgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2UgaW5pdGlhbGl6ZSBgeGAsIHRoZSByYW5kb20gdmFyaWFibGUsIGFuZCBgYWNjdW11bGF0b3JgLCBhbiBhY2N1bXVsYXRvclxuICAgIC8vIGZvciB0aGUgY3VtdWxhdGl2ZSBkaXN0cmlidXRpb24gZnVuY3Rpb24gdG8gMC4gYGRpc3RyaWJ1dGlvbl9mdW5jdGlvbnNgXG4gICAgLy8gaXMgdGhlIG9iamVjdCB3ZSdsbCByZXR1cm4gd2l0aCB0aGUgYHByb2JhYmlsaXR5X29mX3hgIGFuZCB0aGVcbiAgICAvLyBgY3VtdWxhdGl2ZVByb2JhYmlsaXR5X29mX3hgLCBhcyB3ZWxsIGFzIHRoZSBjYWxjdWxhdGVkIG1lYW4gJlxuICAgIC8vIHZhcmlhbmNlLiBXZSBpdGVyYXRlIHVudGlsIHRoZSBgY3VtdWxhdGl2ZVByb2JhYmlsaXR5X29mX3hgIGlzXG4gICAgLy8gd2l0aGluIGBlcHNpbG9uYCBvZiAxLjAuXG4gICAgdmFyIHggPSAwLFxuICAgICAgICBjdW11bGF0aXZlUHJvYmFiaWxpdHkgPSAwLFxuICAgICAgICBjZWxscyA9IHt9O1xuXG4gICAgLy8gVGhpcyBhbGdvcml0aG0gaXRlcmF0ZXMgdGhyb3VnaCBlYWNoIHBvdGVudGlhbCBvdXRjb21lLFxuICAgIC8vIHVudGlsIHRoZSBgY3VtdWxhdGl2ZVByb2JhYmlsaXR5YCBpcyB2ZXJ5IGNsb3NlIHRvIDEsIGF0XG4gICAgLy8gd2hpY2ggcG9pbnQgd2UndmUgZGVmaW5lZCB0aGUgdmFzdCBtYWpvcml0eSBvZiBvdXRjb21lc1xuICAgIGRvIHtcbiAgICAgICAgLy8gYSBbcHJvYmFiaWxpdHkgbWFzcyBmdW5jdGlvbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUHJvYmFiaWxpdHlfbWFzc19mdW5jdGlvbilcbiAgICAgICAgY2VsbHNbeF0gPSBmYWN0b3JpYWwodHJpYWxzKSAvXG4gICAgICAgICAgICAoZmFjdG9yaWFsKHgpICogZmFjdG9yaWFsKHRyaWFscyAtIHgpKSAqXG4gICAgICAgICAgICAoTWF0aC5wb3cocHJvYmFiaWxpdHksIHgpICogTWF0aC5wb3coMSAtIHByb2JhYmlsaXR5LCB0cmlhbHMgLSB4KSk7XG4gICAgICAgIGN1bXVsYXRpdmVQcm9iYWJpbGl0eSArPSBjZWxsc1t4XTtcbiAgICAgICAgeCsrO1xuICAgIC8vIHdoZW4gdGhlIGN1bXVsYXRpdmVQcm9iYWJpbGl0eSBpcyBuZWFybHkgMSwgd2UndmUgY2FsY3VsYXRlZFxuICAgIC8vIHRoZSB1c2VmdWwgcmFuZ2Ugb2YgdGhpcyBkaXN0cmlidXRpb25cbiAgICB9IHdoaWxlIChjdW11bGF0aXZlUHJvYmFiaWxpdHkgPCAxIC0gZXBzaWxvbik7XG5cbiAgICByZXR1cm4gY2VsbHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmlub21pYWxEaXN0cmlidXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogKipQZXJjZW50YWdlIFBvaW50cyBvZiB0aGUgz4cyIChDaGktU3F1YXJlZCkgRGlzdHJpYnV0aW9uKipcbiAqXG4gKiBUaGUgW8+HMiAoQ2hpLVNxdWFyZWQpIERpc3RyaWJ1dGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DaGktc3F1YXJlZF9kaXN0cmlidXRpb24pIGlzIHVzZWQgaW4gdGhlIGNvbW1vblxuICogY2hpLXNxdWFyZWQgdGVzdHMgZm9yIGdvb2RuZXNzIG9mIGZpdCBvZiBhbiBvYnNlcnZlZCBkaXN0cmlidXRpb24gdG8gYSB0aGVvcmV0aWNhbCBvbmUsIHRoZSBpbmRlcGVuZGVuY2Ugb2YgdHdvXG4gKiBjcml0ZXJpYSBvZiBjbGFzc2lmaWNhdGlvbiBvZiBxdWFsaXRhdGl2ZSBkYXRhLCBhbmQgaW4gY29uZmlkZW5jZSBpbnRlcnZhbCBlc3RpbWF0aW9uIGZvciBhIHBvcHVsYXRpb24gc3RhbmRhcmRcbiAqIGRldmlhdGlvbiBvZiBhIG5vcm1hbCBkaXN0cmlidXRpb24gZnJvbSBhIHNhbXBsZSBzdGFuZGFyZCBkZXZpYXRpb24uXG4gKlxuICogVmFsdWVzIGZyb20gQXBwZW5kaXggMSwgVGFibGUgSUlJIG9mIFdpbGxpYW0gVy4gSGluZXMgJiBEb3VnbGFzIEMuIE1vbnRnb21lcnksIFwiUHJvYmFiaWxpdHkgYW5kIFN0YXRpc3RpY3MgaW5cbiAqIEVuZ2luZWVyaW5nIGFuZCBNYW5hZ2VtZW50IFNjaWVuY2VcIiwgV2lsZXkgKDE5ODApLlxuICovXG52YXIgY2hpU3F1YXJlZERpc3RyaWJ1dGlvblRhYmxlID0ge1xuICAgIDE6IHsgMC45OTU6ICAwLjAwLCAwLjk5OiAgMC4wMCwgMC45NzU6ICAwLjAwLCAwLjk1OiAgMC4wMCwgMC45OiAgMC4wMiwgMC41OiAgMC40NSwgMC4xOiAgMi43MSwgMC4wNTogIDMuODQsIDAuMDI1OiAgNS4wMiwgMC4wMTogIDYuNjMsIDAuMDA1OiAgNy44OCB9LFxuICAgIDI6IHsgMC45OTU6ICAwLjAxLCAwLjk5OiAgMC4wMiwgMC45NzU6ICAwLjA1LCAwLjk1OiAgMC4xMCwgMC45OiAgMC4yMSwgMC41OiAgMS4zOSwgMC4xOiAgNC42MSwgMC4wNTogIDUuOTksIDAuMDI1OiAgNy4zOCwgMC4wMTogIDkuMjEsIDAuMDA1OiAxMC42MCB9LFxuICAgIDM6IHsgMC45OTU6ICAwLjA3LCAwLjk5OiAgMC4xMSwgMC45NzU6ICAwLjIyLCAwLjk1OiAgMC4zNSwgMC45OiAgMC41OCwgMC41OiAgMi4zNywgMC4xOiAgNi4yNSwgMC4wNTogIDcuODEsIDAuMDI1OiAgOS4zNSwgMC4wMTogMTEuMzQsIDAuMDA1OiAxMi44NCB9LFxuICAgIDQ6IHsgMC45OTU6ICAwLjIxLCAwLjk5OiAgMC4zMCwgMC45NzU6ICAwLjQ4LCAwLjk1OiAgMC43MSwgMC45OiAgMS4wNiwgMC41OiAgMy4zNiwgMC4xOiAgNy43OCwgMC4wNTogIDkuNDksIDAuMDI1OiAxMS4xNCwgMC4wMTogMTMuMjgsIDAuMDA1OiAxNC44NiB9LFxuICAgIDU6IHsgMC45OTU6ICAwLjQxLCAwLjk5OiAgMC41NSwgMC45NzU6ICAwLjgzLCAwLjk1OiAgMS4xNSwgMC45OiAgMS42MSwgMC41OiAgNC4zNSwgMC4xOiAgOS4yNCwgMC4wNTogMTEuMDcsIDAuMDI1OiAxMi44MywgMC4wMTogMTUuMDksIDAuMDA1OiAxNi43NSB9LFxuICAgIDY6IHsgMC45OTU6ICAwLjY4LCAwLjk5OiAgMC44NywgMC45NzU6ICAxLjI0LCAwLjk1OiAgMS42NCwgMC45OiAgMi4yMCwgMC41OiAgNS4zNSwgMC4xOiAxMC42NSwgMC4wNTogMTIuNTksIDAuMDI1OiAxNC40NSwgMC4wMTogMTYuODEsIDAuMDA1OiAxOC41NSB9LFxuICAgIDc6IHsgMC45OTU6ICAwLjk5LCAwLjk5OiAgMS4yNSwgMC45NzU6ICAxLjY5LCAwLjk1OiAgMi4xNywgMC45OiAgMi44MywgMC41OiAgNi4zNSwgMC4xOiAxMi4wMiwgMC4wNTogMTQuMDcsIDAuMDI1OiAxNi4wMSwgMC4wMTogMTguNDgsIDAuMDA1OiAyMC4yOCB9LFxuICAgIDg6IHsgMC45OTU6ICAxLjM0LCAwLjk5OiAgMS42NSwgMC45NzU6ICAyLjE4LCAwLjk1OiAgMi43MywgMC45OiAgMy40OSwgMC41OiAgNy4zNCwgMC4xOiAxMy4zNiwgMC4wNTogMTUuNTEsIDAuMDI1OiAxNy41MywgMC4wMTogMjAuMDksIDAuMDA1OiAyMS45NiB9LFxuICAgIDk6IHsgMC45OTU6ICAxLjczLCAwLjk5OiAgMi4wOSwgMC45NzU6ICAyLjcwLCAwLjk1OiAgMy4zMywgMC45OiAgNC4xNywgMC41OiAgOC4zNCwgMC4xOiAxNC42OCwgMC4wNTogMTYuOTIsIDAuMDI1OiAxOS4wMiwgMC4wMTogMjEuNjcsIDAuMDA1OiAyMy41OSB9LFxuICAgIDEwOiB7IDAuOTk1OiAgMi4xNiwgMC45OTogIDIuNTYsIDAuOTc1OiAgMy4yNSwgMC45NTogIDMuOTQsIDAuOTogIDQuODcsIDAuNTogIDkuMzQsIDAuMTogMTUuOTksIDAuMDU6IDE4LjMxLCAwLjAyNTogMjAuNDgsIDAuMDE6IDIzLjIxLCAwLjAwNTogMjUuMTkgfSxcbiAgICAxMTogeyAwLjk5NTogIDIuNjAsIDAuOTk6ICAzLjA1LCAwLjk3NTogIDMuODIsIDAuOTU6ICA0LjU3LCAwLjk6ICA1LjU4LCAwLjU6IDEwLjM0LCAwLjE6IDE3LjI4LCAwLjA1OiAxOS42OCwgMC4wMjU6IDIxLjkyLCAwLjAxOiAyNC43MiwgMC4wMDU6IDI2Ljc2IH0sXG4gICAgMTI6IHsgMC45OTU6ICAzLjA3LCAwLjk5OiAgMy41NywgMC45NzU6ICA0LjQwLCAwLjk1OiAgNS4yMywgMC45OiAgNi4zMCwgMC41OiAxMS4zNCwgMC4xOiAxOC41NSwgMC4wNTogMjEuMDMsIDAuMDI1OiAyMy4zNCwgMC4wMTogMjYuMjIsIDAuMDA1OiAyOC4zMCB9LFxuICAgIDEzOiB7IDAuOTk1OiAgMy41NywgMC45OTogIDQuMTEsIDAuOTc1OiAgNS4wMSwgMC45NTogIDUuODksIDAuOTogIDcuMDQsIDAuNTogMTIuMzQsIDAuMTogMTkuODEsIDAuMDU6IDIyLjM2LCAwLjAyNTogMjQuNzQsIDAuMDE6IDI3LjY5LCAwLjAwNTogMjkuODIgfSxcbiAgICAxNDogeyAwLjk5NTogIDQuMDcsIDAuOTk6ICA0LjY2LCAwLjk3NTogIDUuNjMsIDAuOTU6ICA2LjU3LCAwLjk6ICA3Ljc5LCAwLjU6IDEzLjM0LCAwLjE6IDIxLjA2LCAwLjA1OiAyMy42OCwgMC4wMjU6IDI2LjEyLCAwLjAxOiAyOS4xNCwgMC4wMDU6IDMxLjMyIH0sXG4gICAgMTU6IHsgMC45OTU6ICA0LjYwLCAwLjk5OiAgNS4yMywgMC45NzU6ICA2LjI3LCAwLjk1OiAgNy4yNiwgMC45OiAgOC41NSwgMC41OiAxNC4zNCwgMC4xOiAyMi4zMSwgMC4wNTogMjUuMDAsIDAuMDI1OiAyNy40OSwgMC4wMTogMzAuNTgsIDAuMDA1OiAzMi44MCB9LFxuICAgIDE2OiB7IDAuOTk1OiAgNS4xNCwgMC45OTogIDUuODEsIDAuOTc1OiAgNi45MSwgMC45NTogIDcuOTYsIDAuOTogIDkuMzEsIDAuNTogMTUuMzQsIDAuMTogMjMuNTQsIDAuMDU6IDI2LjMwLCAwLjAyNTogMjguODUsIDAuMDE6IDMyLjAwLCAwLjAwNTogMzQuMjcgfSxcbiAgICAxNzogeyAwLjk5NTogIDUuNzAsIDAuOTk6ICA2LjQxLCAwLjk3NTogIDcuNTYsIDAuOTU6ICA4LjY3LCAwLjk6IDEwLjA5LCAwLjU6IDE2LjM0LCAwLjE6IDI0Ljc3LCAwLjA1OiAyNy41OSwgMC4wMjU6IDMwLjE5LCAwLjAxOiAzMy40MSwgMC4wMDU6IDM1LjcyIH0sXG4gICAgMTg6IHsgMC45OTU6ICA2LjI2LCAwLjk5OiAgNy4wMSwgMC45NzU6ICA4LjIzLCAwLjk1OiAgOS4zOSwgMC45OiAxMC44NywgMC41OiAxNy4zNCwgMC4xOiAyNS45OSwgMC4wNTogMjguODcsIDAuMDI1OiAzMS41MywgMC4wMTogMzQuODEsIDAuMDA1OiAzNy4xNiB9LFxuICAgIDE5OiB7IDAuOTk1OiAgNi44NCwgMC45OTogIDcuNjMsIDAuOTc1OiAgOC45MSwgMC45NTogMTAuMTIsIDAuOTogMTEuNjUsIDAuNTogMTguMzQsIDAuMTogMjcuMjAsIDAuMDU6IDMwLjE0LCAwLjAyNTogMzIuODUsIDAuMDE6IDM2LjE5LCAwLjAwNTogMzguNTggfSxcbiAgICAyMDogeyAwLjk5NTogIDcuNDMsIDAuOTk6ICA4LjI2LCAwLjk3NTogIDkuNTksIDAuOTU6IDEwLjg1LCAwLjk6IDEyLjQ0LCAwLjU6IDE5LjM0LCAwLjE6IDI4LjQxLCAwLjA1OiAzMS40MSwgMC4wMjU6IDM0LjE3LCAwLjAxOiAzNy41NywgMC4wMDU6IDQwLjAwIH0sXG4gICAgMjE6IHsgMC45OTU6ICA4LjAzLCAwLjk5OiAgOC45MCwgMC45NzU6IDEwLjI4LCAwLjk1OiAxMS41OSwgMC45OiAxMy4yNCwgMC41OiAyMC4zNCwgMC4xOiAyOS42MiwgMC4wNTogMzIuNjcsIDAuMDI1OiAzNS40OCwgMC4wMTogMzguOTMsIDAuMDA1OiA0MS40MCB9LFxuICAgIDIyOiB7IDAuOTk1OiAgOC42NCwgMC45OTogIDkuNTQsIDAuOTc1OiAxMC45OCwgMC45NTogMTIuMzQsIDAuOTogMTQuMDQsIDAuNTogMjEuMzQsIDAuMTogMzAuODEsIDAuMDU6IDMzLjkyLCAwLjAyNTogMzYuNzgsIDAuMDE6IDQwLjI5LCAwLjAwNTogNDIuODAgfSxcbiAgICAyMzogeyAwLjk5NTogIDkuMjYsIDAuOTk6IDEwLjIwLCAwLjk3NTogMTEuNjksIDAuOTU6IDEzLjA5LCAwLjk6IDE0Ljg1LCAwLjU6IDIyLjM0LCAwLjE6IDMyLjAxLCAwLjA1OiAzNS4xNywgMC4wMjU6IDM4LjA4LCAwLjAxOiA0MS42NCwgMC4wMDU6IDQ0LjE4IH0sXG4gICAgMjQ6IHsgMC45OTU6ICA5Ljg5LCAwLjk5OiAxMC44NiwgMC45NzU6IDEyLjQwLCAwLjk1OiAxMy44NSwgMC45OiAxNS42NiwgMC41OiAyMy4zNCwgMC4xOiAzMy4yMCwgMC4wNTogMzYuNDIsIDAuMDI1OiAzOS4zNiwgMC4wMTogNDIuOTgsIDAuMDA1OiA0NS41NiB9LFxuICAgIDI1OiB7IDAuOTk1OiAxMC41MiwgMC45OTogMTEuNTIsIDAuOTc1OiAxMy4xMiwgMC45NTogMTQuNjEsIDAuOTogMTYuNDcsIDAuNTogMjQuMzQsIDAuMTogMzQuMjgsIDAuMDU6IDM3LjY1LCAwLjAyNTogNDAuNjUsIDAuMDE6IDQ0LjMxLCAwLjAwNTogNDYuOTMgfSxcbiAgICAyNjogeyAwLjk5NTogMTEuMTYsIDAuOTk6IDEyLjIwLCAwLjk3NTogMTMuODQsIDAuOTU6IDE1LjM4LCAwLjk6IDE3LjI5LCAwLjU6IDI1LjM0LCAwLjE6IDM1LjU2LCAwLjA1OiAzOC44OSwgMC4wMjU6IDQxLjkyLCAwLjAxOiA0NS42NCwgMC4wMDU6IDQ4LjI5IH0sXG4gICAgMjc6IHsgMC45OTU6IDExLjgxLCAwLjk5OiAxMi44OCwgMC45NzU6IDE0LjU3LCAwLjk1OiAxNi4xNSwgMC45OiAxOC4xMSwgMC41OiAyNi4zNCwgMC4xOiAzNi43NCwgMC4wNTogNDAuMTEsIDAuMDI1OiA0My4xOSwgMC4wMTogNDYuOTYsIDAuMDA1OiA0OS42NSB9LFxuICAgIDI4OiB7IDAuOTk1OiAxMi40NiwgMC45OTogMTMuNTcsIDAuOTc1OiAxNS4zMSwgMC45NTogMTYuOTMsIDAuOTogMTguOTQsIDAuNTogMjcuMzQsIDAuMTogMzcuOTIsIDAuMDU6IDQxLjM0LCAwLjAyNTogNDQuNDYsIDAuMDE6IDQ4LjI4LCAwLjAwNTogNTAuOTkgfSxcbiAgICAyOTogeyAwLjk5NTogMTMuMTIsIDAuOTk6IDE0LjI2LCAwLjk3NTogMTYuMDUsIDAuOTU6IDE3LjcxLCAwLjk6IDE5Ljc3LCAwLjU6IDI4LjM0LCAwLjE6IDM5LjA5LCAwLjA1OiA0Mi41NiwgMC4wMjU6IDQ1LjcyLCAwLjAxOiA0OS41OSwgMC4wMDU6IDUyLjM0IH0sXG4gICAgMzA6IHsgMC45OTU6IDEzLjc5LCAwLjk5OiAxNC45NSwgMC45NzU6IDE2Ljc5LCAwLjk1OiAxOC40OSwgMC45OiAyMC42MCwgMC41OiAyOS4zNCwgMC4xOiA0MC4yNiwgMC4wNTogNDMuNzcsIDAuMDI1OiA0Ni45OCwgMC4wMTogNTAuODksIDAuMDA1OiA1My42NyB9LFxuICAgIDQwOiB7IDAuOTk1OiAyMC43MSwgMC45OTogMjIuMTYsIDAuOTc1OiAyNC40MywgMC45NTogMjYuNTEsIDAuOTogMjkuMDUsIDAuNTogMzkuMzQsIDAuMTogNTEuODEsIDAuMDU6IDU1Ljc2LCAwLjAyNTogNTkuMzQsIDAuMDE6IDYzLjY5LCAwLjAwNTogNjYuNzcgfSxcbiAgICA1MDogeyAwLjk5NTogMjcuOTksIDAuOTk6IDI5LjcxLCAwLjk3NTogMzIuMzYsIDAuOTU6IDM0Ljc2LCAwLjk6IDM3LjY5LCAwLjU6IDQ5LjMzLCAwLjE6IDYzLjE3LCAwLjA1OiA2Ny41MCwgMC4wMjU6IDcxLjQyLCAwLjAxOiA3Ni4xNSwgMC4wMDU6IDc5LjQ5IH0sXG4gICAgNjA6IHsgMC45OTU6IDM1LjUzLCAwLjk5OiAzNy40OCwgMC45NzU6IDQwLjQ4LCAwLjk1OiA0My4xOSwgMC45OiA0Ni40NiwgMC41OiA1OS4zMywgMC4xOiA3NC40MCwgMC4wNTogNzkuMDgsIDAuMDI1OiA4My4zMCwgMC4wMTogODguMzgsIDAuMDA1OiA5MS45NSB9LFxuICAgIDcwOiB7IDAuOTk1OiA0My4yOCwgMC45OTogNDUuNDQsIDAuOTc1OiA0OC43NiwgMC45NTogNTEuNzQsIDAuOTogNTUuMzMsIDAuNTogNjkuMzMsIDAuMTogODUuNTMsIDAuMDU6IDkwLjUzLCAwLjAyNTogOTUuMDIsIDAuMDE6IDEwMC40MiwgMC4wMDU6IDEwNC4yMiB9LFxuICAgIDgwOiB7IDAuOTk1OiA1MS4xNywgMC45OTogNTMuNTQsIDAuOTc1OiA1Ny4xNSwgMC45NTogNjAuMzksIDAuOTogNjQuMjgsIDAuNTogNzkuMzMsIDAuMTogOTYuNTgsIDAuMDU6IDEwMS44OCwgMC4wMjU6IDEwNi42MywgMC4wMTogMTEyLjMzLCAwLjAwNTogMTE2LjMyIH0sXG4gICAgOTA6IHsgMC45OTU6IDU5LjIwLCAwLjk5OiA2MS43NSwgMC45NzU6IDY1LjY1LCAwLjk1OiA2OS4xMywgMC45OiA3My4yOSwgMC41OiA4OS4zMywgMC4xOiAxMDcuNTcsIDAuMDU6IDExMy4xNCwgMC4wMjU6IDExOC4xNCwgMC4wMTogMTI0LjEyLCAwLjAwNTogMTI4LjMwIH0sXG4gICAgMTAwOiB7IDAuOTk1OiA2Ny4zMywgMC45OTogNzAuMDYsIDAuOTc1OiA3NC4yMiwgMC45NTogNzcuOTMsIDAuOTogODIuMzYsIDAuNTogOTkuMzMsIDAuMTogMTE4LjUwLCAwLjA1OiAxMjQuMzQsIDAuMDI1OiAxMjkuNTYsIDAuMDE6IDEzNS44MSwgMC4wMDU6IDE0MC4xNyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNoaVNxdWFyZWREaXN0cmlidXRpb25UYWJsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lYW4gPSByZXF1aXJlKCcuL21lYW4nKTtcbnZhciBjaGlTcXVhcmVkRGlzdHJpYnV0aW9uVGFibGUgPSByZXF1aXJlKCcuL2NoaV9zcXVhcmVkX2Rpc3RyaWJ1dGlvbl90YWJsZScpO1xuXG4vKipcbiAqIFRoZSBbz4cyIChDaGktU3F1YXJlZCkgR29vZG5lc3Mtb2YtRml0IFRlc3RdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR29vZG5lc3Nfb2ZfZml0I1BlYXJzb24uMjdzX2NoaS1zcXVhcmVkX3Rlc3QpXG4gKiB1c2VzIGEgbWVhc3VyZSBvZiBnb29kbmVzcyBvZiBmaXQgd2hpY2ggaXMgdGhlIHN1bSBvZiBkaWZmZXJlbmNlcyBiZXR3ZWVuIG9ic2VydmVkIGFuZCBleHBlY3RlZCBvdXRjb21lIGZyZXF1ZW5jaWVzXG4gKiAodGhhdCBpcywgY291bnRzIG9mIG9ic2VydmF0aW9ucyksIGVhY2ggc3F1YXJlZCBhbmQgZGl2aWRlZCBieSB0aGUgbnVtYmVyIG9mIG9ic2VydmF0aW9ucyBleHBlY3RlZCBnaXZlbiB0aGVcbiAqIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24uIFRoZSByZXN1bHRpbmcgz4cyIHN0YXRpc3RpYywgYGNoaVNxdWFyZWRgLCBjYW4gYmUgY29tcGFyZWQgdG8gdGhlIGNoaS1zcXVhcmVkIGRpc3RyaWJ1dGlvblxuICogdG8gZGV0ZXJtaW5lIHRoZSBnb29kbmVzcyBvZiBmaXQuIEluIG9yZGVyIHRvIGRldGVybWluZSB0aGUgZGVncmVlcyBvZiBmcmVlZG9tIG9mIHRoZSBjaGktc3F1YXJlZCBkaXN0cmlidXRpb24sIG9uZVxuICogdGFrZXMgdGhlIHRvdGFsIG51bWJlciBvZiBvYnNlcnZlZCBmcmVxdWVuY2llcyBhbmQgc3VidHJhY3RzIHRoZSBudW1iZXIgb2YgZXN0aW1hdGVkIHBhcmFtZXRlcnMuIFRoZSB0ZXN0IHN0YXRpc3RpY1xuICogZm9sbG93cywgYXBwcm94aW1hdGVseSwgYSBjaGktc3F1YXJlIGRpc3RyaWJ1dGlvbiB3aXRoIChrIOKIkiBjKSBkZWdyZWVzIG9mIGZyZWVkb20gd2hlcmUgYGtgIGlzIHRoZSBudW1iZXIgb2Ygbm9uLWVtcHR5XG4gKiBjZWxscyBhbmQgYGNgIGlzIHRoZSBudW1iZXIgb2YgZXN0aW1hdGVkIHBhcmFtZXRlcnMgZm9yIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXN0cmlidXRpb25UeXBlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcG9pbnQgaW4gYSBkaXN0cmlidXRpb246XG4gKiBmb3IgaW5zdGFuY2UsIGJpbm9taWFsLCBiZXJub3VsbGksIG9yIHBvaXNzb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBzaWduaWZpY2FuY2VcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGNoaSBzcXVhcmVkIGdvb2RuZXNzIG9mIGZpdFxuICogQGV4YW1wbGVcbiAqIC8vIERhdGEgZnJvbSBQb2lzc29uIGdvb2RuZXNzLW9mLWZpdCBleGFtcGxlIDEwLTE5IGluIFdpbGxpYW0gVy4gSGluZXMgJiBEb3VnbGFzIEMuIE1vbnRnb21lcnksXG4gKiAvLyBcIlByb2JhYmlsaXR5IGFuZCBTdGF0aXN0aWNzIGluIEVuZ2luZWVyaW5nIGFuZCBNYW5hZ2VtZW50IFNjaWVuY2VcIiwgV2lsZXkgKDE5ODApLlxuICogdmFyIGRhdGExMDE5ID0gW1xuICogICAgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsXG4gKiAgICAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCxcbiAqICAgICAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLFxuICogICAgIDIsIDIsIDIsIDIsIDIsIDIsIDIsIDIsIDIsXG4gKiAgICAgMywgMywgMywgM1xuICogXTtcbiAqIHNzLmNoaVNxdWFyZWRHb29kbmVzc09mRml0KGRhdGExMDE5LCBzcy5wb2lzc29uRGlzdHJpYnV0aW9uLCAwLjA1KSk7IC8vPSBmYWxzZVxuICovXG5mdW5jdGlvbiBjaGlTcXVhcmVkR29vZG5lc3NPZkZpdChkYXRhLCBkaXN0cmlidXRpb25UeXBlLCBzaWduaWZpY2FuY2UpIHtcbiAgICAvLyBFc3RpbWF0ZSBmcm9tIHRoZSBzYW1wbGUgZGF0YSwgYSB3ZWlnaHRlZCBtZWFuLlxuICAgIHZhciBpbnB1dE1lYW4gPSBtZWFuKGRhdGEpLFxuICAgICAgICAvLyBDYWxjdWxhdGVkIHZhbHVlIG9mIHRoZSDPhzIgc3RhdGlzdGljLlxuICAgICAgICBjaGlTcXVhcmVkID0gMCxcbiAgICAgICAgLy8gRGVncmVlcyBvZiBmcmVlZG9tLCBjYWxjdWxhdGVkIGFzIChudW1iZXIgb2YgY2xhc3MgaW50ZXJ2YWxzIC1cbiAgICAgICAgLy8gbnVtYmVyIG9mIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24gcGFyYW1ldGVycyBlc3RpbWF0ZWQgLSAxKVxuICAgICAgICBkZWdyZWVzT2ZGcmVlZG9tLFxuICAgICAgICAvLyBOdW1iZXIgb2YgaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbiBwYXJhbWV0ZXJzIGVzdGltYXRlZCwgZXhwZWN0ZWQgdG8gYmUgc3VwcGxpZWQgaW4gdGhlIGRpc3RyaWJ1dGlvbiB0ZXN0LlxuICAgICAgICAvLyBMb3NlIG9uZSBkZWdyZWUgb2YgZnJlZWRvbSBmb3IgZXN0aW1hdGluZyBgbGFtYmRhYCBmcm9tIHRoZSBzYW1wbGUgZGF0YS5cbiAgICAgICAgYyA9IDEsXG4gICAgICAgIC8vIFRoZSBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uLlxuICAgICAgICAvLyBHZW5lcmF0ZSB0aGUgaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbi5cbiAgICAgICAgaHlwb3RoZXNpemVkRGlzdHJpYnV0aW9uID0gZGlzdHJpYnV0aW9uVHlwZShpbnB1dE1lYW4pLFxuICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzID0gW10sXG4gICAgICAgIGV4cGVjdGVkRnJlcXVlbmNpZXMgPSBbXSxcbiAgICAgICAgaztcblxuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBob2xkaW5nIGEgaGlzdG9ncmFtIGZyb20gdGhlIHNhbXBsZSBkYXRhLCBvZlxuICAgIC8vIHRoZSBmb3JtIGB7IHZhbHVlOiBudW1iZXJPZk9jdXJyZW5jZXMgfWBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKG9ic2VydmVkRnJlcXVlbmNpZXNbZGF0YVtpXV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llc1tkYXRhW2ldXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llc1tkYXRhW2ldXSsrO1xuICAgIH1cblxuICAgIC8vIFRoZSBoaXN0b2dyYW0gd2UgY3JlYXRlZCBtaWdodCBiZSBzcGFyc2UgLSB0aGVyZSBtaWdodCBiZSBnYXBzXG4gICAgLy8gYmV0d2VlbiB2YWx1ZXMuIFNvIHdlIGl0ZXJhdGUgdGhyb3VnaCB0aGUgaGlzdG9ncmFtLCBtYWtpbmdcbiAgICAvLyBzdXJlIHRoYXQgaW5zdGVhZCBvZiB1bmRlZmluZWQsIGdhcHMgaGF2ZSAwIHZhbHVlcy5cbiAgICBmb3IgKGkgPSAwOyBpIDwgb2JzZXJ2ZWRGcmVxdWVuY2llcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob2JzZXJ2ZWRGcmVxdWVuY2llc1tpXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzW2ldID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBob2xkaW5nIGEgaGlzdG9ncmFtIG9mIGV4cGVjdGVkIGRhdGEgZ2l2ZW4gdGhlXG4gICAgLy8gc2FtcGxlIHNpemUgYW5kIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24uXG4gICAgZm9yIChrIGluIGh5cG90aGVzaXplZERpc3RyaWJ1dGlvbikge1xuICAgICAgICBpZiAoayBpbiBvYnNlcnZlZEZyZXF1ZW5jaWVzKSB7XG4gICAgICAgICAgICBleHBlY3RlZEZyZXF1ZW5jaWVzW2tdID0gaHlwb3RoZXNpemVkRGlzdHJpYnV0aW9uW2tdICogZGF0YS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXb3JraW5nIGJhY2t3YXJkIHRocm91Z2ggdGhlIGV4cGVjdGVkIGZyZXF1ZW5jaWVzLCBjb2xsYXBzZSBjbGFzc2VzXG4gICAgLy8gaWYgbGVzcyB0aGFuIHRocmVlIG9ic2VydmF0aW9ucyBhcmUgZXhwZWN0ZWQgZm9yIGEgY2xhc3MuXG4gICAgLy8gVGhpcyB0cmFuc2Zvcm1hdGlvbiBpcyBhcHBsaWVkIHRvIHRoZSBvYnNlcnZlZCBmcmVxdWVuY2llcyBhcyB3ZWxsLlxuICAgIGZvciAoayA9IGV4cGVjdGVkRnJlcXVlbmNpZXMubGVuZ3RoIC0gMTsgayA+PSAwOyBrLS0pIHtcbiAgICAgICAgaWYgKGV4cGVjdGVkRnJlcXVlbmNpZXNba10gPCAzKSB7XG4gICAgICAgICAgICBleHBlY3RlZEZyZXF1ZW5jaWVzW2sgLSAxXSArPSBleHBlY3RlZEZyZXF1ZW5jaWVzW2tdO1xuICAgICAgICAgICAgZXhwZWN0ZWRGcmVxdWVuY2llcy5wb3AoKTtcblxuICAgICAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llc1trIC0gMV0gKz0gb2JzZXJ2ZWRGcmVxdWVuY2llc1trXTtcbiAgICAgICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIHNxdWFyZWQgZGlmZmVyZW5jZXMgYmV0d2VlbiBvYnNlcnZlZCAmIGV4cGVjdGVkXG4gICAgLy8gZnJlcXVlbmNpZXMsIGFjY3VtdWxhdGluZyB0aGUgYGNoaVNxdWFyZWRgIHN0YXRpc3RpYy5cbiAgICBmb3IgKGsgPSAwOyBrIDwgb2JzZXJ2ZWRGcmVxdWVuY2llcy5sZW5ndGg7IGsrKykge1xuICAgICAgICBjaGlTcXVhcmVkICs9IE1hdGgucG93KFxuICAgICAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llc1trXSAtIGV4cGVjdGVkRnJlcXVlbmNpZXNba10sIDIpIC9cbiAgICAgICAgICAgIGV4cGVjdGVkRnJlcXVlbmNpZXNba107XG4gICAgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIGRlZ3JlZXMgb2YgZnJlZWRvbSBmb3IgdGhpcyB0ZXN0IGFuZCBsb29rIGl0IHVwIGluIHRoZVxuICAgIC8vIGBjaGlTcXVhcmVkRGlzdHJpYnV0aW9uVGFibGVgIGluIG9yZGVyIHRvXG4gICAgLy8gYWNjZXB0IG9yIHJlamVjdCB0aGUgZ29vZG5lc3Mtb2YtZml0IG9mIHRoZSBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uLlxuICAgIGRlZ3JlZXNPZkZyZWVkb20gPSBvYnNlcnZlZEZyZXF1ZW5jaWVzLmxlbmd0aCAtIGMgLSAxO1xuICAgIHJldHVybiBjaGlTcXVhcmVkRGlzdHJpYnV0aW9uVGFibGVbZGVncmVlc09mRnJlZWRvbV1bc2lnbmlmaWNhbmNlXSA8IGNoaVNxdWFyZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2hpU3F1YXJlZEdvb2RuZXNzT2ZGaXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3BsaXQgYW4gYXJyYXkgaW50byBjaHVua3Mgb2YgYSBzcGVjaWZpZWQgc2l6ZS4gVGhpcyBmdW5jdGlvblxuICogaGFzIHRoZSBzYW1lIGJlaGF2aW9yIGFzIFtQSFAncyBhcnJheV9jaHVua10oaHR0cDovL3BocC5uZXQvbWFudWFsL2VuL2Z1bmN0aW9uLmFycmF5LWNodW5rLnBocClcbiAqIGZ1bmN0aW9uLCBhbmQgdGh1cyB3aWxsIGluc2VydCBzbWFsbGVyLXNpemVkIGNodW5rcyBhdCB0aGUgZW5kIGlmXG4gKiB0aGUgaW5wdXQgc2l6ZSBpcyBub3QgZGl2aXNpYmxlIGJ5IHRoZSBjaHVuayBzaXplLlxuICpcbiAqIGBzYW1wbGVgIGlzIGV4cGVjdGVkIHRvIGJlIGFuIGFycmF5LCBhbmQgYGNodW5rU2l6ZWAgYSBudW1iZXIuXG4gKiBUaGUgYHNhbXBsZWAgYXJyYXkgY2FuIGNvbnRhaW4gYW55IGtpbmQgb2YgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzYW1wbGUgYW55IGFycmF5IG9mIHZhbHVlc1xuICogQHBhcmFtIHtudW1iZXJ9IGNodW5rU2l6ZSBzaXplIG9mIGVhY2ggb3V0cHV0IGFycmF5XG4gKiBAcmV0dXJucyB7QXJyYXk8QXJyYXk+fSBhIGNodW5rZWQgYXJyYXlcbiAqIEBleGFtcGxlXG4gKiBjb25zb2xlLmxvZyhjaHVuayhbMSwgMiwgMywgNF0sIDIpKTsgLy8gW1sxLCAyXSwgWzMsIDRdXVxuICovXG5mdW5jdGlvbiBjaHVuayhzYW1wbGUsIGNodW5rU2l6ZSkge1xuXG4gICAgLy8gYSBsaXN0IG9mIHJlc3VsdCBjaHVua3MsIGFzIGFycmF5cyBpbiBhbiBhcnJheVxuICAgIHZhciBvdXRwdXQgPSBbXTtcblxuICAgIC8vIGBjaHVua1NpemVgIG11c3QgYmUgemVybyBvciBoaWdoZXIgLSBvdGhlcndpc2UgdGhlIGxvb3AgYmVsb3csXG4gICAgLy8gaW4gd2hpY2ggd2UgY2FsbCBgc3RhcnQgKz0gY2h1bmtTaXplYCwgd2lsbCBsb29wIGluZmluaXRlbHkuXG4gICAgLy8gU28sIHdlJ2xsIGRldGVjdCBhbmQgcmV0dXJuIG51bGwgaW4gdGhhdCBjYXNlIHRvIGluZGljYXRlXG4gICAgLy8gaW52YWxpZCBpbnB1dC5cbiAgICBpZiAoY2h1bmtTaXplIDw9IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gYHN0YXJ0YCBpcyB0aGUgaW5kZXggYXQgd2hpY2ggYC5zbGljZWAgd2lsbCBzdGFydCBzZWxlY3RpbmdcbiAgICAvLyBuZXcgYXJyYXkgZWxlbWVudHNcbiAgICBmb3IgKHZhciBzdGFydCA9IDA7IHN0YXJ0IDwgc2FtcGxlLmxlbmd0aDsgc3RhcnQgKz0gY2h1bmtTaXplKSB7XG5cbiAgICAgICAgLy8gZm9yIGVhY2ggY2h1bmssIHNsaWNlIHRoYXQgcGFydCBvZiB0aGUgYXJyYXkgYW5kIGFkZCBpdFxuICAgICAgICAvLyB0byB0aGUgb3V0cHV0LiBUaGUgYC5zbGljZWAgZnVuY3Rpb24gZG9lcyBub3QgY2hhbmdlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBhcnJheS5cbiAgICAgICAgb3V0cHV0LnB1c2goc2FtcGxlLnNsaWNlKHN0YXJ0LCBzdGFydCArIGNodW5rU2l6ZSkpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNodW5rO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc29ydGVkVW5pcXVlQ291bnQgPSByZXF1aXJlKCcuL3NvcnRlZF91bmlxdWVfY291bnQnKSxcbiAgICBudW1lcmljU29ydCA9IHJlcXVpcmUoJy4vbnVtZXJpY19zb3J0Jyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGNvbHVtbiB4IHJvdyBtYXRyaXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5zXG4gKiBAcGFyYW0ge251bWJlcn0gcm93c1xuICogQHJldHVybiB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IG1hdHJpeFxuICogQGV4YW1wbGVcbiAqIG1ha2VNYXRyaXgoMTAsIDEwKTtcbiAqL1xuZnVuY3Rpb24gbWFrZU1hdHJpeChjb2x1bW5zLCByb3dzKSB7XG4gICAgdmFyIG1hdHJpeCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sdW1uczsgaSsrKSB7XG4gICAgICAgIHZhciBjb2x1bW4gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCByb3dzOyBqKyspIHtcbiAgICAgICAgICAgIGNvbHVtbi5wdXNoKDApO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeC5wdXNoKGNvbHVtbik7XG4gICAgfVxuICAgIHJldHVybiBtYXRyaXg7XG59XG5cbi8qKlxuICogQ2ttZWFucyBjbHVzdGVyaW5nIGlzIGFuIGltcHJvdmVtZW50IG9uIGhldXJpc3RpYy1iYXNlZCBjbHVzdGVyaW5nXG4gKiBhcHByb2FjaGVzIGxpa2UgSmVua3MuIFRoZSBhbGdvcml0aG0gd2FzIGRldmVsb3BlZCBpblxuICogW0hhaXpob3UgV2FuZyBhbmQgTWluZ3pob3UgU29uZ10oaHR0cDovL2pvdXJuYWwuci1wcm9qZWN0Lm9yZy9hcmNoaXZlLzIwMTEtMi9SSm91cm5hbF8yMDExLTJfV2FuZytTb25nLnBkZilcbiAqIGFzIGEgW2R5bmFtaWMgcHJvZ3JhbW1pbmddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0R5bmFtaWNfcHJvZ3JhbW1pbmcpIGFwcHJvYWNoXG4gKiB0byB0aGUgcHJvYmxlbSBvZiBjbHVzdGVyaW5nIG51bWVyaWMgZGF0YSBpbnRvIGdyb3VwcyB3aXRoIHRoZSBsZWFzdFxuICogd2l0aGluLWdyb3VwIHN1bS1vZi1zcXVhcmVkLWRldmlhdGlvbnMuXG4gKlxuICogTWluaW1pemluZyB0aGUgZGlmZmVyZW5jZSB3aXRoaW4gZ3JvdXBzIC0gd2hhdCBXYW5nICYgU29uZyByZWZlciB0byBhc1xuICogYHdpdGhpbnNzYCwgb3Igd2l0aGluIHN1bS1vZi1zcXVhcmVzLCBtZWFucyB0aGF0IGdyb3VwcyBhcmUgb3B0aW1hbGx5XG4gKiBob21vZ2Vub3VzIHdpdGhpbiBhbmQgdGhlIGRhdGEgaXMgc3BsaXQgaW50byByZXByZXNlbnRhdGl2ZSBncm91cHMuXG4gKiBUaGlzIGlzIHZlcnkgdXNlZnVsIGZvciB2aXN1YWxpemF0aW9uLCB3aGVyZSB5b3UgbWF5IHdhbnQgdG8gcmVwcmVzZW50XG4gKiBhIGNvbnRpbnVvdXMgdmFyaWFibGUgaW4gZGlzY3JldGUgY29sb3Igb3Igc3R5bGUgZ3JvdXBzLiBUaGlzIGZ1bmN0aW9uXG4gKiBjYW4gcHJvdmlkZSBncm91cHMgdGhhdCBlbXBoYXNpemUgZGlmZmVyZW5jZXMgYmV0d2VlbiBkYXRhLlxuICpcbiAqIEJlaW5nIGEgZHluYW1pYyBhcHByb2FjaCwgdGhpcyBhbGdvcml0aG0gaXMgYmFzZWQgb24gdHdvIG1hdHJpY2VzIHRoYXRcbiAqIHN0b3JlIGluY3JlbWVudGFsbHktY29tcHV0ZWQgdmFsdWVzIGZvciBzcXVhcmVkIGRldmlhdGlvbnMgYW5kIGJhY2t0cmFja2luZ1xuICogaW5kZXhlcy5cbiAqXG4gKiBVbmxpa2UgdGhlIFtvcmlnaW5hbCBpbXBsZW1lbnRhdGlvbl0oaHR0cHM6Ly9jcmFuLnItcHJvamVjdC5vcmcvd2ViL3BhY2thZ2VzL0NrbWVhbnMuMWQuZHAvaW5kZXguaHRtbCksXG4gKiB0aGlzIGltcGxlbWVudGF0aW9uIGRvZXMgbm90IGluY2x1ZGUgYW55IGNvZGUgdG8gYXV0b21hdGljYWxseSBkZXRlcm1pbmVcbiAqIHRoZSBvcHRpbWFsIG51bWJlciBvZiBjbHVzdGVyczogdGhpcyBpbmZvcm1hdGlvbiBuZWVkcyB0byBiZSBleHBsaWNpdGx5XG4gKiBwcm92aWRlZC5cbiAqXG4gKiAjIyMgUmVmZXJlbmNlc1xuICogX0NrbWVhbnMuMWQuZHA6IE9wdGltYWwgay1tZWFucyBDbHVzdGVyaW5nIGluIE9uZSBEaW1lbnNpb24gYnkgRHluYW1pY1xuICogUHJvZ3JhbW1pbmdfIEhhaXpob3UgV2FuZyBhbmQgTWluZ3pob3UgU29uZyBJU1NOIDIwNzMtNDg1OVxuICpcbiAqIGZyb20gVGhlIFIgSm91cm5hbCBWb2wuIDMvMiwgRGVjZW1iZXIgMjAxMVxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBkYXRhIGlucHV0IGRhdGEsIGFzIGFuIGFycmF5IG9mIG51bWJlciB2YWx1ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBuQ2x1c3RlcnMgbnVtYmVyIG9mIGRlc2lyZWQgY2xhc3Nlcy4gVGhpcyBjYW5ub3QgYmVcbiAqIGdyZWF0ZXIgdGhhbiB0aGUgbnVtYmVyIG9mIHZhbHVlcyBpbiB0aGUgZGF0YSBhcnJheS5cbiAqIEByZXR1cm5zIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gY2x1c3RlcmVkIGlucHV0XG4gKiBAZXhhbXBsZVxuICogY2ttZWFucyhbLTEsIDIsIC0xLCAyLCA0LCA1LCA2LCAtMSwgMiwgLTFdLCAzKTtcbiAqIC8vIFRoZSBpbnB1dCwgY2x1c3RlcmVkIGludG8gZ3JvdXBzIG9mIHNpbWlsYXIgbnVtYmVycy5cbiAqIC8vPSBbWy0xLCAtMSwgLTEsIC0xXSwgWzIsIDIsIDJdLCBbNCwgNSwgNl1dKTtcbiAqL1xuZnVuY3Rpb24gY2ttZWFucyhkYXRhLCBuQ2x1c3RlcnMpIHtcblxuICAgIGlmIChuQ2x1c3RlcnMgPiBkYXRhLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBnZW5lcmF0ZSBtb3JlIGNsYXNzZXMgdGhhbiB0aGVyZSBhcmUgZGF0YSB2YWx1ZXMnKTtcbiAgICB9XG5cbiAgICB2YXIgc29ydGVkID0gbnVtZXJpY1NvcnQoZGF0YSksXG4gICAgICAgIC8vIHdlJ2xsIHVzZSB0aGlzIGFzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBjbHVzdGVyc1xuICAgICAgICB1bmlxdWVDb3VudCA9IHNvcnRlZFVuaXF1ZUNvdW50KHNvcnRlZCk7XG5cbiAgICAvLyBpZiBhbGwgb2YgdGhlIGlucHV0IHZhbHVlcyBhcmUgaWRlbnRpY2FsLCB0aGVyZSdzIG9uZSBjbHVzdGVyXG4gICAgLy8gd2l0aCBhbGwgb2YgdGhlIGlucHV0IGluIGl0LlxuICAgIGlmICh1bmlxdWVDb3VudCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gW3NvcnRlZF07XG4gICAgfVxuXG4gICAgLy8gbmFtZWQgJ0QnIG9yaWdpbmFsbHlcbiAgICB2YXIgbWF0cml4ID0gbWFrZU1hdHJpeChuQ2x1c3RlcnMsIHNvcnRlZC5sZW5ndGgpLFxuICAgICAgICAvLyBuYW1lZCAnQicgb3JpZ2luYWxseVxuICAgICAgICBiYWNrdHJhY2tNYXRyaXggPSBtYWtlTWF0cml4KG5DbHVzdGVycywgc29ydGVkLmxlbmd0aCk7XG5cbiAgICAvLyBUaGlzIGlzIGEgZHluYW1pYyBwcm9ncmFtbWluZyB3YXkgdG8gc29sdmUgdGhlIHByb2JsZW0gb2YgbWluaW1pemluZ1xuICAgIC8vIHdpdGhpbi1jbHVzdGVyIHN1bSBvZiBzcXVhcmVzLiBJdCdzIHNpbWlsYXIgdG8gbGluZWFyIHJlZ3Jlc3Npb25cbiAgICAvLyBpbiB0aGlzIHdheSwgYW5kIHRoaXMgY2FsY3VsYXRpb24gaW5jcmVtZW50YWxseSBjb21wdXRlcyB0aGVcbiAgICAvLyBzdW0gb2Ygc3F1YXJlcyB0aGF0IGFyZSBsYXRlciByZWFkLlxuXG4gICAgLy8gVGhlIG91dGVyIGxvb3AgaXRlcmF0ZXMgdGhyb3VnaCBjbHVzdGVycywgZnJvbSAwIHRvIG5DbHVzdGVycy5cbiAgICBmb3IgKHZhciBjbHVzdGVyID0gMDsgY2x1c3RlciA8IG5DbHVzdGVyczsgY2x1c3RlcisrKSB7XG5cbiAgICAgICAgLy8gQXQgdGhlIHN0YXJ0IG9mIGVhY2ggbG9vcCwgdGhlIG1lYW4gc3RhcnRzIGFzIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICAgIHZhciBmaXJzdENsdXN0ZXJNZWFuID0gc29ydGVkWzBdO1xuXG4gICAgICAgIGZvciAodmFyIHNvcnRlZElkeCA9IE1hdGgubWF4KGNsdXN0ZXIsIDEpO1xuICAgICAgICAgICAgIHNvcnRlZElkeCA8IHNvcnRlZC5sZW5ndGg7XG4gICAgICAgICAgICAgc29ydGVkSWR4KyspIHtcblxuICAgICAgICAgICAgaWYgKGNsdXN0ZXIgPT09IDApIHtcblxuICAgICAgICAgICAgICAgIC8vIEluY3JlYXNlIHRoZSBydW5uaW5nIHN1bSBvZiBzcXVhcmVzIGNhbGN1bGF0aW9uIGJ5IHRoaXNcbiAgICAgICAgICAgICAgICAvLyBuZXcgdmFsdWVcbiAgICAgICAgICAgICAgICB2YXIgc3F1YXJlZERpZmZlcmVuY2UgPSBNYXRoLnBvdyhcbiAgICAgICAgICAgICAgICAgICAgc29ydGVkW3NvcnRlZElkeF0gLSBmaXJzdENsdXN0ZXJNZWFuLCAyKTtcbiAgICAgICAgICAgICAgICBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHggLSAxXSArXG4gICAgICAgICAgICAgICAgICAgIChzb3J0ZWRJZHggLyAoc29ydGVkSWR4ICsgMSkpICogc3F1YXJlZERpZmZlcmVuY2U7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSdyZSBjb21wdXRpbmcgYSBydW5uaW5nIG1lYW4gYnkgdGFraW5nIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgICAgIC8vIG1lYW4gdmFsdWUsIG11bHRpcGx5aW5nIGl0IGJ5IHRoZSBudW1iZXIgb2YgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAvLyBzZWVuIHNvIGZhciwgYW5kIHRoZW4gZGl2aWRpbmcgaXQgYnkgdGhlIG51bWJlciBvZlxuICAgICAgICAgICAgICAgIC8vIGVsZW1lbnRzIHRvdGFsLlxuICAgICAgICAgICAgICAgIHZhciBuZXdTdW0gPSBzb3J0ZWRJZHggKiBmaXJzdENsdXN0ZXJNZWFuICsgc29ydGVkW3NvcnRlZElkeF07XG4gICAgICAgICAgICAgICAgZmlyc3RDbHVzdGVyTWVhbiA9IG5ld1N1bSAvIChzb3J0ZWRJZHggKyAxKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHZhciBzdW1TcXVhcmVkRGlzdGFuY2VzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgbWVhblhKID0gMDtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBzb3J0ZWRJZHg7IGogPj0gY2x1c3Rlcjsgai0tKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc3VtU3F1YXJlZERpc3RhbmNlcyArPSAoc29ydGVkSWR4IC0gaikgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKHNvcnRlZElkeCAtIGogKyAxKSAqXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyhzb3J0ZWRbal0gLSBtZWFuWEosIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgIG1lYW5YSiA9IChzb3J0ZWRbal0gKyAoc29ydGVkSWR4IC0gaikgKiBtZWFuWEopIC9cbiAgICAgICAgICAgICAgICAgICAgICAgIChzb3J0ZWRJZHggLSBqICsgMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGogPT09IHNvcnRlZElkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBzdW1TcXVhcmVkRGlzdGFuY2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja3RyYWNrTWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gKz0gbWF0cml4W2NsdXN0ZXIgLSAxXVtqIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdW1TcXVhcmVkRGlzdGFuY2VzIDw9IG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gc3VtU3F1YXJlZERpc3RhbmNlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja3RyYWNrTWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3VtU3F1YXJlZERpc3RhbmNlcyArIG1hdHJpeFtjbHVzdGVyIC0gMV1baiAtIDFdIDwgbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IHN1bVNxdWFyZWREaXN0YW5jZXMgKyBtYXRyaXhbY2x1c3RlciAtIDFdW2ogLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrdHJhY2tNYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IGo7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgcmVhbCB3b3JrIG9mIENrbWVhbnMgY2x1c3RlcmluZyBoYXBwZW5zIGluIHRoZSBtYXRyaXggZ2VuZXJhdGlvbjpcbiAgICAvLyB0aGUgZ2VuZXJhdGVkIG1hdHJpY2VzIGVuY29kZSBhbGwgcG9zc2libGUgY2x1c3RlcmluZyBjb21iaW5hdGlvbnMsIGFuZFxuICAgIC8vIG9uY2UgdGhleSdyZSBnZW5lcmF0ZWQgd2UgY2FuIHNvbHZlIGZvciB0aGUgYmVzdCBjbHVzdGVyaW5nIGdyb3Vwc1xuICAgIC8vIHZlcnkgcXVpY2tseS5cbiAgICB2YXIgY2x1c3RlcnMgPSBbXSxcbiAgICAgICAgY2x1c3RlclJpZ2h0ID0gYmFja3RyYWNrTWF0cml4WzBdLmxlbmd0aCAtIDE7XG5cbiAgICAvLyBCYWNrdHJhY2sgdGhlIGNsdXN0ZXJzIGZyb20gdGhlIGR5bmFtaWMgcHJvZ3JhbW1pbmcgbWF0cml4LiBUaGlzXG4gICAgLy8gc3RhcnRzIGF0IHRoZSBib3R0b20tcmlnaHQgY29ybmVyIG9mIHRoZSBtYXRyaXggKGlmIHRoZSB0b3AtbGVmdCBpcyAwLCAwKSxcbiAgICAvLyBhbmQgbW92ZXMgdGhlIGNsdXN0ZXIgdGFyZ2V0IHdpdGggdGhlIGxvb3AuXG4gICAgZm9yIChjbHVzdGVyID0gYmFja3RyYWNrTWF0cml4Lmxlbmd0aCAtIDE7IGNsdXN0ZXIgPj0gMDsgY2x1c3Rlci0tKSB7XG5cbiAgICAgICAgdmFyIGNsdXN0ZXJMZWZ0ID0gYmFja3RyYWNrTWF0cml4W2NsdXN0ZXJdW2NsdXN0ZXJSaWdodF07XG5cbiAgICAgICAgLy8gZmlsbCB0aGUgY2x1c3RlciBmcm9tIHRoZSBzb3J0ZWQgaW5wdXQgYnkgdGFraW5nIGEgc2xpY2Ugb2YgdGhlXG4gICAgICAgIC8vIGFycmF5LiB0aGUgYmFja3RyYWNrIG1hdHJpeCBtYWtlcyB0aGlzIGVhc3kgLSBpdCBzdG9yZXMgdGhlXG4gICAgICAgIC8vIGluZGV4ZXMgd2hlcmUgdGhlIGNsdXN0ZXIgc2hvdWxkIHN0YXJ0IGFuZCBlbmQuXG4gICAgICAgIGNsdXN0ZXJzW2NsdXN0ZXJdID0gc29ydGVkLnNsaWNlKGNsdXN0ZXJMZWZ0LCBjbHVzdGVyUmlnaHQgKyAxKTtcblxuICAgICAgICBpZiAoY2x1c3RlciA+IDApIHtcbiAgICAgICAgICAgIGNsdXN0ZXJSaWdodCA9IGNsdXN0ZXJMZWZ0IC0gMTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbHVzdGVycztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBja21lYW5zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RhbmRhcmROb3JtYWxUYWJsZSA9IHJlcXVpcmUoJy4vc3RhbmRhcmRfbm9ybWFsX3RhYmxlJyk7XG5cbi8qKlxuICogKipbQ3VtdWxhdGl2ZSBTdGFuZGFyZCBOb3JtYWwgUHJvYmFiaWxpdHldKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3RhbmRhcmRfbm9ybWFsX3RhYmxlKSoqXG4gKlxuICogU2luY2UgcHJvYmFiaWxpdHkgdGFibGVzIGNhbm5vdCBiZVxuICogcHJpbnRlZCBmb3IgZXZlcnkgbm9ybWFsIGRpc3RyaWJ1dGlvbiwgYXMgdGhlcmUgYXJlIGFuIGluZmluaXRlIHZhcmlldHlcbiAqIG9mIG5vcm1hbCBkaXN0cmlidXRpb25zLCBpdCBpcyBjb21tb24gcHJhY3RpY2UgdG8gY29udmVydCBhIG5vcm1hbCB0byBhXG4gKiBzdGFuZGFyZCBub3JtYWwgYW5kIHRoZW4gdXNlIHRoZSBzdGFuZGFyZCBub3JtYWwgdGFibGUgdG8gZmluZCBwcm9iYWJpbGl0aWVzLlxuICpcbiAqIFlvdSBjYW4gdXNlIGAuNSArIC41ICogZXJyb3JGdW5jdGlvbih4IC8gTWF0aC5zcXJ0KDIpKWAgdG8gY2FsY3VsYXRlIHRoZSBwcm9iYWJpbGl0eVxuICogaW5zdGVhZCBvZiBsb29raW5nIGl0IHVwIGluIGEgdGFibGUuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHpcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGN1bXVsYXRpdmUgc3RhbmRhcmQgbm9ybWFsIHByb2JhYmlsaXR5XG4gKi9cbmZ1bmN0aW9uIGN1bXVsYXRpdmVTdGROb3JtYWxQcm9iYWJpbGl0eSh6KSB7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIHBvc2l0aW9uIG9mIHRoaXMgdmFsdWUuXG4gICAgdmFyIGFic1ogPSBNYXRoLmFicyh6KSxcbiAgICAgICAgLy8gRWFjaCByb3cgYmVnaW5zIHdpdGggYSBkaWZmZXJlbnRcbiAgICAgICAgLy8gc2lnbmlmaWNhbnQgZGlnaXQ6IDAuNSwgMC42LCAwLjcsIGFuZCBzbyBvbi4gRWFjaCB2YWx1ZSBpbiB0aGUgdGFibGVcbiAgICAgICAgLy8gY29ycmVzcG9uZHMgdG8gYSByYW5nZSBvZiAwLjAxIGluIHRoZSBpbnB1dCB2YWx1ZXMsIHNvIHRoZSB2YWx1ZSBpc1xuICAgICAgICAvLyBtdWx0aXBsaWVkIGJ5IDEwMC5cbiAgICAgICAgaW5kZXggPSBNYXRoLm1pbihNYXRoLnJvdW5kKGFic1ogKiAxMDApLCBzdGFuZGFyZE5vcm1hbFRhYmxlLmxlbmd0aCAtIDEpO1xuXG4gICAgLy8gVGhlIGluZGV4IHdlIGNhbGN1bGF0ZSBtdXN0IGJlIGluIHRoZSB0YWJsZSBhcyBhIHBvc2l0aXZlIHZhbHVlLFxuICAgIC8vIGJ1dCB3ZSBzdGlsbCBwYXkgYXR0ZW50aW9uIHRvIHdoZXRoZXIgdGhlIGlucHV0IGlzIHBvc2l0aXZlXG4gICAgLy8gb3IgbmVnYXRpdmUsIGFuZCBmbGlwIHRoZSBvdXRwdXQgdmFsdWUgYXMgYSBsYXN0IHN0ZXAuXG4gICAgaWYgKHogPj0gMCkge1xuICAgICAgICByZXR1cm4gc3RhbmRhcmROb3JtYWxUYWJsZVtpbmRleF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZHVlIHRvIGZsb2F0aW5nLXBvaW50IGFyaXRobWV0aWMsIHZhbHVlcyBpbiB0aGUgdGFibGUgd2l0aFxuICAgICAgICAvLyA0IHNpZ25pZmljYW50IGZpZ3VyZXMgY2FuIG5ldmVydGhlbGVzcyBlbmQgdXAgYXMgcmVwZWF0aW5nXG4gICAgICAgIC8vIGZyYWN0aW9ucyB3aGVuIHRoZXkncmUgY29tcHV0ZWQgaGVyZS5cbiAgICAgICAgcmV0dXJuICsoMSAtIHN0YW5kYXJkTm9ybWFsVGFibGVbaW5kZXhdKS50b0ZpeGVkKDQpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjdW11bGF0aXZlU3RkTm9ybWFsUHJvYmFiaWxpdHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogV2UgdXNlIGDOtWAsIGVwc2lsb24sIGFzIGEgc3RvcHBpbmcgY3JpdGVyaW9uIHdoZW4gd2Ugd2FudCB0byBpdGVyYXRlXG4gKiB1bnRpbCB3ZSdyZSBcImNsb3NlIGVub3VnaFwiLiBFcHNpbG9uIGlzIGEgdmVyeSBzbWFsbCBudW1iZXI6IGZvclxuICogc2ltcGxlIHN0YXRpc3RpY3MsIHRoYXQgbnVtYmVyIGlzICoqMC4wMDAxKipcbiAqXG4gKiBUaGlzIGlzIHVzZWQgaW4gY2FsY3VsYXRpb25zIGxpa2UgdGhlIGJpbm9taWFsRGlzdHJpYnV0aW9uLCBpbiB3aGljaFxuICogdGhlIHByb2Nlc3Mgb2YgZmluZGluZyBhIHZhbHVlIGlzIFtpdGVyYXRpdmVdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0l0ZXJhdGl2ZV9tZXRob2QpOlxuICogaXQgcHJvZ3Jlc3NlcyB1bnRpbCBpdCBpcyBjbG9zZSBlbm91Z2guXG4gKlxuICogQmVsb3cgaXMgYW4gZXhhbXBsZSBvZiB1c2luZyBlcHNpbG9uIGluIFtncmFkaWVudCBkZXNjZW50XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HcmFkaWVudF9kZXNjZW50KSxcbiAqIHdoZXJlIHdlJ3JlIHRyeWluZyB0byBmaW5kIGEgbG9jYWwgbWluaW11bSBvZiBhIGZ1bmN0aW9uJ3MgZGVyaXZhdGl2ZSxcbiAqIGdpdmVuIGJ5IHRoZSBgZkRlcml2YXRpdmVgIG1ldGhvZC5cbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gRnJvbSBjYWxjdWxhdGlvbiwgd2UgZXhwZWN0IHRoYXQgdGhlIGxvY2FsIG1pbmltdW0gb2NjdXJzIGF0IHg9OS80XG4gKiB2YXIgeF9vbGQgPSAwO1xuICogLy8gVGhlIGFsZ29yaXRobSBzdGFydHMgYXQgeD02XG4gKiB2YXIgeF9uZXcgPSA2O1xuICogdmFyIHN0ZXBTaXplID0gMC4wMTtcbiAqXG4gKiBmdW5jdGlvbiBmRGVyaXZhdGl2ZSh4KSB7XG4gKiAgIHJldHVybiA0ICogTWF0aC5wb3coeCwgMykgLSA5ICogTWF0aC5wb3coeCwgMik7XG4gKiB9XG4gKlxuICogLy8gVGhlIGxvb3AgcnVucyB1bnRpbCB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBwcmV2aW91c1xuICogLy8gdmFsdWUgYW5kIHRoZSBjdXJyZW50IHZhbHVlIGlzIHNtYWxsZXIgdGhhbiBlcHNpbG9uIC0gYSByb3VnaFxuICogLy8gbWVhdXJlIG9mICdjbG9zZSBlbm91Z2gnXG4gKiB3aGlsZSAoTWF0aC5hYnMoeF9uZXcgLSB4X29sZCkgPiBzcy5lcHNpbG9uKSB7XG4gKiAgIHhfb2xkID0geF9uZXc7XG4gKiAgIHhfbmV3ID0geF9vbGQgLSBzdGVwU2l6ZSAqIGZEZXJpdmF0aXZlKHhfb2xkKTtcbiAqIH1cbiAqXG4gKiBjb25zb2xlLmxvZygnTG9jYWwgbWluaW11bSBvY2N1cnMgYXQnLCB4X25ldyk7XG4gKi9cbnZhciBlcHNpbG9uID0gMC4wMDAxO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVwc2lsb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogKipbR2F1c3NpYW4gZXJyb3IgZnVuY3Rpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXJyb3JfZnVuY3Rpb24pKipcbiAqXG4gKiBUaGUgYGVycm9yRnVuY3Rpb24oeC8oc2QgKiBNYXRoLnNxcnQoMikpKWAgaXMgdGhlIHByb2JhYmlsaXR5IHRoYXQgYSB2YWx1ZSBpbiBhXG4gKiBub3JtYWwgZGlzdHJpYnV0aW9uIHdpdGggc3RhbmRhcmQgZGV2aWF0aW9uIHNkIGlzIHdpdGhpbiB4IG9mIHRoZSBtZWFuLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIG51bWVyaWNhbCBhcHByb3hpbWF0aW9uIHRvIHRoZSBleGFjdCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geCBpbnB1dFxuICogQHJldHVybiB7bnVtYmVyfSBlcnJvciBlc3RpbWF0aW9uXG4gKiBAZXhhbXBsZVxuICogZXJyb3JGdW5jdGlvbigxKTsgLy89IDAuODQyN1xuICovXG5mdW5jdGlvbiBlcnJvckZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgdCA9IDEgLyAoMSArIDAuNSAqIE1hdGguYWJzKHgpKTtcbiAgICB2YXIgdGF1ID0gdCAqIE1hdGguZXhwKC1NYXRoLnBvdyh4LCAyKSAtXG4gICAgICAgIDEuMjY1NTEyMjMgK1xuICAgICAgICAxLjAwMDAyMzY4ICogdCArXG4gICAgICAgIDAuMzc0MDkxOTYgKiBNYXRoLnBvdyh0LCAyKSArXG4gICAgICAgIDAuMDk2Nzg0MTggKiBNYXRoLnBvdyh0LCAzKSAtXG4gICAgICAgIDAuMTg2Mjg4MDYgKiBNYXRoLnBvdyh0LCA0KSArXG4gICAgICAgIDAuMjc4ODY4MDcgKiBNYXRoLnBvdyh0LCA1KSAtXG4gICAgICAgIDEuMTM1MjAzOTggKiBNYXRoLnBvdyh0LCA2KSArXG4gICAgICAgIDEuNDg4NTE1ODcgKiBNYXRoLnBvdyh0LCA3KSAtXG4gICAgICAgIDAuODIyMTUyMjMgKiBNYXRoLnBvdyh0LCA4KSArXG4gICAgICAgIDAuMTcwODcyNzcgKiBNYXRoLnBvdyh0LCA5KSk7XG4gICAgaWYgKHggPj0gMCkge1xuICAgICAgICByZXR1cm4gMSAtIHRhdTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGF1IC0gMTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXJyb3JGdW5jdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIFtGYWN0b3JpYWxdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0ZhY3RvcmlhbCksIHVzdWFsbHkgd3JpdHRlbiBuISwgaXMgdGhlIHByb2R1Y3Qgb2YgYWxsIHBvc2l0aXZlXG4gKiBpbnRlZ2VycyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gbi4gT2Z0ZW4gZmFjdG9yaWFsIGlzIGltcGxlbWVudGVkXG4gKiByZWN1cnNpdmVseSwgYnV0IHRoaXMgaXRlcmF0aXZlIGFwcHJvYWNoIGlzIHNpZ25pZmljYW50bHkgZmFzdGVyXG4gKiBhbmQgc2ltcGxlci5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbiBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gZmFjdG9yaWFsOiBuIVxuICogQGV4YW1wbGVcbiAqIGNvbnNvbGUubG9nKGZhY3RvcmlhbCg1KSk7IC8vIDEyMFxuICovXG5mdW5jdGlvbiBmYWN0b3JpYWwobikge1xuXG4gICAgLy8gZmFjdG9yaWFsIGlzIG1hdGhlbWF0aWNhbGx5IHVuZGVmaW5lZCBmb3IgbmVnYXRpdmUgbnVtYmVyc1xuICAgIGlmIChuIDwgMCApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIHR5cGljYWxseSB5b3UnbGwgZXhwYW5kIHRoZSBmYWN0b3JpYWwgZnVuY3Rpb24gZ29pbmcgZG93biwgbGlrZVxuICAgIC8vIDUhID0gNSAqIDQgKiAzICogMiAqIDEuIFRoaXMgaXMgZ29pbmcgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbixcbiAgICAvLyBjb3VudGluZyBmcm9tIDIgdXAgdG8gdGhlIG51bWJlciBpbiBxdWVzdGlvbiwgYW5kIHNpbmNlIGFueXRoaW5nXG4gICAgLy8gbXVsdGlwbGllZCBieSAxIGlzIGl0c2VsZiwgdGhlIGxvb3Agb25seSBuZWVkcyB0byBzdGFydCBhdCAyLlxuICAgIHZhciBhY2N1bXVsYXRvciA9IDE7XG4gICAgZm9yICh2YXIgaSA9IDI7IGkgPD0gbjsgaSsrKSB7XG4gICAgICAgIC8vIGZvciBlYWNoIG51bWJlciB1cCB0byBhbmQgaW5jbHVkaW5nIHRoZSBudW1iZXIgYG5gLCBtdWx0aXBseVxuICAgICAgICAvLyB0aGUgYWNjdW11bGF0b3IgbXkgdGhhdCBudW1iZXIuXG4gICAgICAgIGFjY3VtdWxhdG9yICo9IGk7XG4gICAgfVxuICAgIHJldHVybiBhY2N1bXVsYXRvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3JpYWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFtHZW9tZXRyaWMgTWVhbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR2VvbWV0cmljX21lYW4pIGlzXG4gKiBhIG1lYW4gZnVuY3Rpb24gdGhhdCBpcyBtb3JlIHVzZWZ1bCBmb3IgbnVtYmVycyBpbiBkaWZmZXJlbnRcbiAqIHJhbmdlcy5cbiAqXG4gKiBUaGlzIGlzIHRoZSBudGggcm9vdCBvZiB0aGUgaW5wdXQgbnVtYmVycyBtdWx0aXBsaWVkIGJ5IGVhY2ggb3RoZXIuXG4gKlxuICogVGhlIGdlb21ldHJpYyBtZWFuIGlzIG9mdGVuIHVzZWZ1bCBmb3JcbiAqICoqW3Byb3BvcnRpb25hbCBncm93dGhdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dlb21ldHJpY19tZWFuI1Byb3BvcnRpb25hbF9ncm93dGgpKio6IGdpdmVuXG4gKiBncm93dGggcmF0ZXMgZm9yIG11bHRpcGxlIHllYXJzLCBsaWtlIF84MCUsIDE2LjY2JSBhbmQgNDIuODUlXywgYSBzaW1wbGVcbiAqIG1lYW4gd2lsbCBpbmNvcnJlY3RseSBlc3RpbWF0ZSBhbiBhdmVyYWdlIGdyb3d0aCByYXRlLCB3aGVyZWFzIGEgZ2VvbWV0cmljXG4gKiBtZWFuIHdpbGwgY29ycmVjdGx5IGVzdGltYXRlIGEgZ3Jvd3RoIHJhdGUgdGhhdCwgb3ZlciB0aG9zZSB5ZWFycyxcbiAqIHdpbGwgeWllbGQgdGhlIHNhbWUgZW5kIHZhbHVlLlxuICpcbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0IGFycmF5XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBnZW9tZXRyaWMgbWVhblxuICogQGV4YW1wbGVcbiAqIHZhciBncm93dGhSYXRlcyA9IFsxLjgwLCAxLjE2NjY2NiwgMS40Mjg1NzFdO1xuICogdmFyIGF2ZXJhZ2VHcm93dGggPSBnZW9tZXRyaWNNZWFuKGdyb3d0aFJhdGVzKTtcbiAqIHZhciBhdmVyYWdlR3Jvd3RoUmF0ZXMgPSBbYXZlcmFnZUdyb3d0aCwgYXZlcmFnZUdyb3d0aCwgYXZlcmFnZUdyb3d0aF07XG4gKiB2YXIgc3RhcnRpbmdWYWx1ZSA9IDEwO1xuICogdmFyIHN0YXJ0aW5nVmFsdWVNZWFuID0gMTA7XG4gKiBncm93dGhSYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHJhdGUpIHtcbiAqICAgc3RhcnRpbmdWYWx1ZSAqPSByYXRlO1xuICogfSk7XG4gKiBhdmVyYWdlR3Jvd3RoUmF0ZXMuZm9yRWFjaChmdW5jdGlvbihyYXRlKSB7XG4gKiAgIHN0YXJ0aW5nVmFsdWVNZWFuICo9IHJhdGU7XG4gKiB9KTtcbiAqIHN0YXJ0aW5nVmFsdWVNZWFuID09PSBzdGFydGluZ1ZhbHVlO1xuICovXG5mdW5jdGlvbiBnZW9tZXRyaWNNZWFuKHgpIHtcbiAgICAvLyBUaGUgbWVhbiBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIHRoZSBzdGFydGluZyB2YWx1ZS5cbiAgICB2YXIgdmFsdWUgPSAxO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIHRoZSBnZW9tZXRyaWMgbWVhbiBpcyBvbmx5IHZhbGlkIGZvciBwb3NpdGl2ZSBudW1iZXJzXG4gICAgICAgIGlmICh4W2ldIDw9IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICAvLyByZXBlYXRlZGx5IG11bHRpcGx5IHRoZSB2YWx1ZSBieSBlYWNoIG51bWJlclxuICAgICAgICB2YWx1ZSAqPSB4W2ldO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLnBvdyh2YWx1ZSwgMSAvIHgubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW9tZXRyaWNNZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBbSGFybW9uaWMgTWVhbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGFybW9uaWNfbWVhbikgaXNcbiAqIGEgbWVhbiBmdW5jdGlvbiB0eXBpY2FsbHkgdXNlZCB0byBmaW5kIHRoZSBhdmVyYWdlIG9mIHJhdGVzLlxuICogVGhpcyBtZWFuIGlzIGNhbGN1bGF0ZWQgYnkgdGFraW5nIHRoZSByZWNpcHJvY2FsIG9mIHRoZSBhcml0aG1ldGljIG1lYW5cbiAqIG9mIHRoZSByZWNpcHJvY2FscyBvZiB0aGUgaW5wdXQgbnVtYmVycy5cbiAqXG4gKiBUaGlzIGlzIGEgW21lYXN1cmUgb2YgY2VudHJhbCB0ZW5kZW5jeV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2VudHJhbF90ZW5kZW5jeSk6XG4gKiBhIG1ldGhvZCBvZiBmaW5kaW5nIGEgdHlwaWNhbCBvciBjZW50cmFsIHZhbHVlIG9mIGEgc2V0IG9mIG51bWJlcnMuXG4gKlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBoYXJtb25pYyBtZWFuXG4gKiBAZXhhbXBsZVxuICogc3MuaGFybW9uaWNNZWFuKFsyLCAzXSkgLy89IDIuNFxuICovXG5mdW5jdGlvbiBoYXJtb25pY01lYW4oeCkge1xuICAgIC8vIFRoZSBtZWFuIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgdmFyIHJlY2lwcm9jYWxTdW0gPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIHRoZSBoYXJtb25pYyBtZWFuIGlzIG9ubHkgdmFsaWQgZm9yIHBvc2l0aXZlIG51bWJlcnNcbiAgICAgICAgaWYgKHhbaV0gPD0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIHJlY2lwcm9jYWxTdW0gKz0gMSAvIHhbaV07XG4gICAgfVxuXG4gICAgLy8gZGl2aWRlIG4gYnkgdGhlIHRoZSByZWNpcHJvY2FsIHN1bVxuICAgIHJldHVybiB4Lmxlbmd0aCAvIHJlY2lwcm9jYWxTdW07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFybW9uaWNNZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcXVhbnRpbGUgPSByZXF1aXJlKCcuL3F1YW50aWxlJyk7XG5cbi8qKlxuICogVGhlIFtJbnRlcnF1YXJ0aWxlIHJhbmdlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0ludGVycXVhcnRpbGVfcmFuZ2UpIGlzXG4gKiBhIG1lYXN1cmUgb2Ygc3RhdGlzdGljYWwgZGlzcGVyc2lvbiwgb3IgaG93IHNjYXR0ZXJlZCwgc3ByZWFkLCBvclxuICogY29uY2VudHJhdGVkIGEgZGlzdHJpYnV0aW9uIGlzLiBJdCdzIGNvbXB1dGVkIGFzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW5cbiAqIHRoZSB0aGlyZCBxdWFydGlsZSBhbmQgZmlyc3QgcXVhcnRpbGUuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBzYW1wbGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGludGVycXVhcnRpbGUgcmFuZ2U6IHRoZSBzcGFuIGJldHdlZW4gbG93ZXIgYW5kIHVwcGVyIHF1YXJ0aWxlLFxuICogMC4yNSBhbmQgMC43NVxuICogQGV4YW1wbGVcbiAqIGludGVycXVhcnRpbGVSYW5nZShbMCwgMSwgMiwgM10pOyAvLz0gMlxuICovXG5mdW5jdGlvbiBpbnRlcnF1YXJ0aWxlUmFuZ2Uoc2FtcGxlKSB7XG4gICAgLy8gV2UgY2FuJ3QgZGVyaXZlIHF1YW50aWxlcyBmcm9tIGFuIGVtcHR5IGxpc3RcbiAgICBpZiAoc2FtcGxlLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gSW50ZXJxdWFydGlsZSByYW5nZSBpcyB0aGUgc3BhbiBiZXR3ZWVuIHRoZSB1cHBlciBxdWFydGlsZSxcbiAgICAvLyBhdCBgMC43NWAsIGFuZCBsb3dlciBxdWFydGlsZSwgYDAuMjVgXG4gICAgcmV0dXJuIHF1YW50aWxlKHNhbXBsZSwgMC43NSkgLSBxdWFudGlsZShzYW1wbGUsIDAuMjUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludGVycXVhcnRpbGVSYW5nZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgSW52ZXJzZSBbR2F1c3NpYW4gZXJyb3IgZnVuY3Rpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXJyb3JfZnVuY3Rpb24pXG4gKiByZXR1cm5zIGEgbnVtZXJpY2FsIGFwcHJveGltYXRpb24gdG8gdGhlIHZhbHVlIHRoYXQgd291bGQgaGF2ZSBjYXVzZWRcbiAqIGBlcnJvckZ1bmN0aW9uKClgIHRvIHJldHVybiB4LlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IHZhbHVlIG9mIGVycm9yIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBlc3RpbWF0ZWQgaW52ZXJ0ZWQgdmFsdWVcbiAqL1xuZnVuY3Rpb24gaW52ZXJzZUVycm9yRnVuY3Rpb24oeCkge1xuICAgIHZhciBhID0gKDggKiAoTWF0aC5QSSAtIDMpKSAvICgzICogTWF0aC5QSSAqICg0IC0gTWF0aC5QSSkpO1xuXG4gICAgdmFyIGludiA9IE1hdGguc3FydChNYXRoLnNxcnQoXG4gICAgICAgIE1hdGgucG93KDIgLyAoTWF0aC5QSSAqIGEpICsgTWF0aC5sb2coMSAtIHggKiB4KSAvIDIsIDIpIC1cbiAgICAgICAgTWF0aC5sb2coMSAtIHggKiB4KSAvIGEpIC1cbiAgICAgICAgKDIgLyAoTWF0aC5QSSAqIGEpICsgTWF0aC5sb2coMSAtIHggKiB4KSAvIDIpKTtcblxuICAgIGlmICh4ID49IDApIHtcbiAgICAgICAgcmV0dXJuIGludjtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gLWludjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW52ZXJzZUVycm9yRnVuY3Rpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogW1NpbXBsZSBsaW5lYXIgcmVncmVzc2lvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TaW1wbGVfbGluZWFyX3JlZ3Jlc3Npb24pXG4gKiBpcyBhIHNpbXBsZSB3YXkgdG8gZmluZCBhIGZpdHRlZCBsaW5lXG4gKiBiZXR3ZWVuIGEgc2V0IG9mIGNvb3JkaW5hdGVzLiBUaGlzIGFsZ29yaXRobSBmaW5kcyB0aGUgc2xvcGUgYW5kIHktaW50ZXJjZXB0IG9mIGEgcmVncmVzc2lvbiBsaW5lXG4gKiB1c2luZyB0aGUgbGVhc3Qgc3VtIG9mIHNxdWFyZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gZGF0YSBhbiBhcnJheSBvZiB0d28tZWxlbWVudCBvZiBhcnJheXMsXG4gKiBsaWtlIGBbWzAsIDFdLCBbMiwgM11dYFxuICogQHJldHVybnMge09iamVjdH0gb2JqZWN0IGNvbnRhaW5pbmcgc2xvcGUgYW5kIGludGVyc2VjdCBvZiByZWdyZXNzaW9uIGxpbmVcbiAqIEBleGFtcGxlXG4gKiBsaW5lYXJSZWdyZXNzaW9uKFtbMCwgMF0sIFsxLCAxXV0pOyAvLyB7IG06IDEsIGI6IDAgfVxuICovXG5mdW5jdGlvbiBsaW5lYXJSZWdyZXNzaW9uKGRhdGEpIHtcblxuICAgIHZhciBtLCBiO1xuXG4gICAgLy8gU3RvcmUgZGF0YSBsZW5ndGggaW4gYSBsb2NhbCB2YXJpYWJsZSB0byByZWR1Y2VcbiAgICAvLyByZXBlYXRlZCBvYmplY3QgcHJvcGVydHkgbG9va3Vwc1xuICAgIHZhciBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgICAvL2lmIHRoZXJlJ3Mgb25seSBvbmUgcG9pbnQsIGFyYml0cmFyaWx5IGNob29zZSBhIHNsb3BlIG9mIDBcbiAgICAvL2FuZCBhIHktaW50ZXJjZXB0IG9mIHdoYXRldmVyIHRoZSB5IG9mIHRoZSBpbml0aWFsIHBvaW50IGlzXG4gICAgaWYgKGRhdGFMZW5ndGggPT09IDEpIHtcbiAgICAgICAgbSA9IDA7XG4gICAgICAgIGIgPSBkYXRhWzBdWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEluaXRpYWxpemUgb3VyIHN1bXMgYW5kIHNjb3BlIHRoZSBgbWAgYW5kIGBiYFxuICAgICAgICAvLyB2YXJpYWJsZXMgdGhhdCBkZWZpbmUgdGhlIGxpbmUuXG4gICAgICAgIHZhciBzdW1YID0gMCwgc3VtWSA9IDAsXG4gICAgICAgICAgICBzdW1YWCA9IDAsIHN1bVhZID0gMDtcblxuICAgICAgICAvLyBVc2UgbG9jYWwgdmFyaWFibGVzIHRvIGdyYWIgcG9pbnQgdmFsdWVzXG4gICAgICAgIC8vIHdpdGggbWluaW1hbCBvYmplY3QgcHJvcGVydHkgbG9va3Vwc1xuICAgICAgICB2YXIgcG9pbnQsIHgsIHk7XG5cbiAgICAgICAgLy8gR2F0aGVyIHRoZSBzdW0gb2YgYWxsIHggdmFsdWVzLCB0aGUgc3VtIG9mIGFsbFxuICAgICAgICAvLyB5IHZhbHVlcywgYW5kIHRoZSBzdW0gb2YgeF4yIGFuZCAoeCp5KSBmb3IgZWFjaFxuICAgICAgICAvLyB2YWx1ZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSW4gbWF0aCBub3RhdGlvbiwgdGhlc2Ugd291bGQgYmUgU1NfeCwgU1NfeSwgU1NfeHgsIGFuZCBTU194eVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcG9pbnQgPSBkYXRhW2ldO1xuICAgICAgICAgICAgeCA9IHBvaW50WzBdO1xuICAgICAgICAgICAgeSA9IHBvaW50WzFdO1xuXG4gICAgICAgICAgICBzdW1YICs9IHg7XG4gICAgICAgICAgICBzdW1ZICs9IHk7XG5cbiAgICAgICAgICAgIHN1bVhYICs9IHggKiB4O1xuICAgICAgICAgICAgc3VtWFkgKz0geCAqIHk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgbWAgaXMgdGhlIHNsb3BlIG9mIHRoZSByZWdyZXNzaW9uIGxpbmVcbiAgICAgICAgbSA9ICgoZGF0YUxlbmd0aCAqIHN1bVhZKSAtIChzdW1YICogc3VtWSkpIC9cbiAgICAgICAgICAgICgoZGF0YUxlbmd0aCAqIHN1bVhYKSAtIChzdW1YICogc3VtWCkpO1xuXG4gICAgICAgIC8vIGBiYCBpcyB0aGUgeS1pbnRlcmNlcHQgb2YgdGhlIGxpbmUuXG4gICAgICAgIGIgPSAoc3VtWSAvIGRhdGFMZW5ndGgpIC0gKChtICogc3VtWCkgLyBkYXRhTGVuZ3RoKTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYm90aCB2YWx1ZXMgYXMgYW4gb2JqZWN0LlxuICAgIHJldHVybiB7XG4gICAgICAgIG06IG0sXG4gICAgICAgIGI6IGJcbiAgICB9O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gbGluZWFyUmVncmVzc2lvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBHaXZlbiB0aGUgb3V0cHV0IG9mIGBsaW5lYXJSZWdyZXNzaW9uYDogYW4gb2JqZWN0XG4gKiB3aXRoIGBtYCBhbmQgYGJgIHZhbHVlcyBpbmRpY2F0aW5nIHNsb3BlIGFuZCBpbnRlcmNlcHQsXG4gKiByZXNwZWN0aXZlbHksIGdlbmVyYXRlIGEgbGluZSBmdW5jdGlvbiB0aGF0IHRyYW5zbGF0ZXNcbiAqIHggdmFsdWVzIGludG8geSB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1iIG9iamVjdCB3aXRoIGBtYCBhbmQgYGJgIG1lbWJlcnMsIHJlcHJlc2VudGluZ1xuICogc2xvcGUgYW5kIGludGVyc2VjdCBvZiBkZXNpcmVkIGxpbmVcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gbWV0aG9kIHRoYXQgY29tcHV0ZXMgeS12YWx1ZSBhdCBhbnkgZ2l2ZW5cbiAqIHgtdmFsdWUgb24gdGhlIGxpbmUuXG4gKiBAZXhhbXBsZVxuICogdmFyIGwgPSBsaW5lYXJSZWdyZXNzaW9uTGluZShsaW5lYXJSZWdyZXNzaW9uKFtbMCwgMF0sIFsxLCAxXV0pKTtcbiAqIGwoMCkgLy89IDBcbiAqIGwoMikgLy89IDJcbiAqL1xuZnVuY3Rpb24gbGluZWFyUmVncmVzc2lvbkxpbmUobWIpIHtcbiAgICAvLyBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGNvbXB1dGVzIGEgYHlgIHZhbHVlIGZvciBlYWNoXG4gICAgLy8geCB2YWx1ZSBpdCBpcyBnaXZlbiwgYmFzZWQgb24gdGhlIHZhbHVlcyBvZiBgYmAgYW5kIGBhYFxuICAgIC8vIHRoYXQgd2UganVzdCBjb21wdXRlZC5cbiAgICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gbWIuYiArIChtYi5tICogeCk7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaW5lYXJSZWdyZXNzaW9uTGluZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lZGlhbiA9IHJlcXVpcmUoJy4vbWVkaWFuJyk7XG5cbi8qKlxuICogVGhlIFtNZWRpYW4gQWJzb2x1dGUgRGV2aWF0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01lZGlhbl9hYnNvbHV0ZV9kZXZpYXRpb24pIGlzXG4gKiBhIHJvYnVzdCBtZWFzdXJlIG9mIHN0YXRpc3RpY2FsXG4gKiBkaXNwZXJzaW9uLiBJdCBpcyBtb3JlIHJlc2lsaWVudCB0byBvdXRsaWVycyB0aGFuIHRoZSBzdGFuZGFyZCBkZXZpYXRpb24uXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0IGFycmF5XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtZWRpYW4gYWJzb2x1dGUgZGV2aWF0aW9uXG4gKiBAZXhhbXBsZVxuICogbWFkKFsxLCAxLCAyLCAyLCA0LCA2LCA5XSk7IC8vPSAxXG4gKi9cbmZ1bmN0aW9uIG1hZCh4KSB7XG4gICAgLy8gVGhlIG1hZCBvZiBub3RoaW5nIGlzIG51bGxcbiAgICBpZiAoIXggfHwgeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHZhciBtZWRpYW5WYWx1ZSA9IG1lZGlhbih4KSxcbiAgICAgICAgbWVkaWFuQWJzb2x1dGVEZXZpYXRpb25zID0gW107XG5cbiAgICAvLyBNYWtlIGEgbGlzdCBvZiBhYnNvbHV0ZSBkZXZpYXRpb25zIGZyb20gdGhlIG1lZGlhblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICBtZWRpYW5BYnNvbHV0ZURldmlhdGlvbnMucHVzaChNYXRoLmFicyh4W2ldIC0gbWVkaWFuVmFsdWUpKTtcbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBtZWRpYW4gdmFsdWUgb2YgdGhhdCBsaXN0XG4gICAgcmV0dXJuIG1lZGlhbihtZWRpYW5BYnNvbHV0ZURldmlhdGlvbnMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGlzIGNvbXB1dGVzIHRoZSBtYXhpbXVtIG51bWJlciBpbiBhbiBhcnJheS5cbiAqXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gbWF4aW11bSB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIGNvbnNvbGUubG9nKG1heChbMSwgMiwgMywgNF0pKTsgLy8gNFxuICovXG5mdW5jdGlvbiBtYXgoeCkge1xuICAgIHZhciB2YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gT24gdGhlIGZpcnN0IGl0ZXJhdGlvbiBvZiB0aGlzIGxvb3AsIG1heCBpc1xuICAgICAgICAvLyB1bmRlZmluZWQgYW5kIGlzIHRodXMgbWFkZSB0aGUgbWF4aW11bSBlbGVtZW50IGluIHRoZSBhcnJheVxuICAgICAgICBpZiAoeFtpXSA+IHZhbHVlIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0geFtpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWF4O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3VtID0gcmVxdWlyZSgnLi9zdW0nKTtcblxuLyoqXG4gKiBUaGUgbWVhbiwgX2Fsc28ga25vd24gYXMgYXZlcmFnZV8sXG4gKiBpcyB0aGUgc3VtIG9mIGFsbCB2YWx1ZXMgb3ZlciB0aGUgbnVtYmVyIG9mIHZhbHVlcy5cbiAqIFRoaXMgaXMgYSBbbWVhc3VyZSBvZiBjZW50cmFsIHRlbmRlbmN5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DZW50cmFsX3RlbmRlbmN5KTpcbiAqIGEgbWV0aG9kIG9mIGZpbmRpbmcgYSB0eXBpY2FsIG9yIGNlbnRyYWwgdmFsdWUgb2YgYSBzZXQgb2YgbnVtYmVycy5cbiAqXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dCB2YWx1ZXNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG1lYW5cbiAqIEBleGFtcGxlXG4gKiBjb25zb2xlLmxvZyhtZWFuKFswLCAxMF0pKTsgLy8gNVxuICovXG5mdW5jdGlvbiBtZWFuKHgpIHtcbiAgICAvLyBUaGUgbWVhbiBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiBzdW0oeCkgLyB4Lmxlbmd0aDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnVtZXJpY1NvcnQgPSByZXF1aXJlKCcuL251bWVyaWNfc29ydCcpO1xuXG4vKipcbiAqIFRoZSBbbWVkaWFuXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01lZGlhbikgaXNcbiAqIHRoZSBtaWRkbGUgbnVtYmVyIG9mIGEgbGlzdC4gVGhpcyBpcyBvZnRlbiBhIGdvb2QgaW5kaWNhdG9yIG9mICd0aGUgbWlkZGxlJ1xuICogd2hlbiB0aGVyZSBhcmUgb3V0bGllcnMgdGhhdCBza2V3IHRoZSBgbWVhbigpYCB2YWx1ZS5cbiAqIFRoaXMgaXMgYSBbbWVhc3VyZSBvZiBjZW50cmFsIHRlbmRlbmN5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DZW50cmFsX3RlbmRlbmN5KTpcbiAqIGEgbWV0aG9kIG9mIGZpbmRpbmcgYSB0eXBpY2FsIG9yIGNlbnRyYWwgdmFsdWUgb2YgYSBzZXQgb2YgbnVtYmVycy5cbiAqXG4gKiBUaGUgbWVkaWFuIGlzbid0IG5lY2Vzc2FyaWx5IG9uZSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGxpc3Q6IHRoZSB2YWx1ZVxuICogY2FuIGJlIHRoZSBhdmVyYWdlIG9mIHR3byBlbGVtZW50cyBpZiB0aGUgbGlzdCBoYXMgYW4gZXZlbiBsZW5ndGhcbiAqIGFuZCB0aGUgdHdvIGNlbnRyYWwgdmFsdWVzIGFyZSBkaWZmZXJlbnQuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtZWRpYW4gdmFsdWVcbiAqIEBleGFtcGxlXG4gKiB2YXIgaW5jb21lcyA9IFsxMCwgMiwgNSwgMTAwLCAyLCAxXTtcbiAqIG1lZGlhbihpbmNvbWVzKTsgLy89IDMuNVxuICovXG5mdW5jdGlvbiBtZWRpYW4oeCkge1xuICAgIC8vIFRoZSBtZWRpYW4gb2YgYW4gZW1wdHkgbGlzdCBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBTb3J0aW5nIHRoZSBhcnJheSBtYWtlcyBpdCBlYXN5IHRvIGZpbmQgdGhlIGNlbnRlciwgYnV0XG4gICAgLy8gdXNlIGAuc2xpY2UoKWAgdG8gZW5zdXJlIHRoZSBvcmlnaW5hbCBhcnJheSBgeGAgaXMgbm90IG1vZGlmaWVkXG4gICAgdmFyIHNvcnRlZCA9IG51bWVyaWNTb3J0KHgpO1xuXG4gICAgLy8gSWYgdGhlIGxlbmd0aCBvZiB0aGUgbGlzdCBpcyBvZGQsIGl0J3MgdGhlIGNlbnRyYWwgbnVtYmVyXG4gICAgaWYgKHNvcnRlZC5sZW5ndGggJSAyID09PSAxKSB7XG4gICAgICAgIHJldHVybiBzb3J0ZWRbKHNvcnRlZC5sZW5ndGggLSAxKSAvIDJdO1xuICAgIC8vIE90aGVyd2lzZSwgdGhlIG1lZGlhbiBpcyB0aGUgYXZlcmFnZSBvZiB0aGUgdHdvIG51bWJlcnNcbiAgICAvLyBhdCB0aGUgY2VudGVyIG9mIHRoZSBsaXN0XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGEgPSBzb3J0ZWRbc29ydGVkLmxlbmd0aCAvIDIgLSAxXTtcbiAgICAgICAgdmFyIGIgPSBzb3J0ZWRbc29ydGVkLmxlbmd0aCAvIDJdO1xuICAgICAgICByZXR1cm4gKGEgKyBiKSAvIDI7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lZGlhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgbWluIGlzIHRoZSBsb3dlc3QgbnVtYmVyIGluIHRoZSBhcnJheS4gVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG1pbmltdW0gdmFsdWVcbiAqIEBleGFtcGxlXG4gKiBtaW4oWzEsIDUsIC0xMCwgMTAwLCAyXSk7IC8vIC0xMDBcbiAqL1xuZnVuY3Rpb24gbWluKHgpIHtcbiAgICB2YXIgdmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb2YgdGhpcyBsb29wLCBtaW4gaXNcbiAgICAgICAgLy8gdW5kZWZpbmVkIGFuZCBpcyB0aHVzIG1hZGUgdGhlIG1pbmltdW0gZWxlbWVudCBpbiB0aGUgYXJyYXlcbiAgICAgICAgaWYgKHhbaV0gPCB2YWx1ZSB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHhbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1pbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiAqKk1peGluKiogc2ltcGxlX3N0YXRpc3RpY3MgdG8gYSBzaW5nbGUgQXJyYXkgaW5zdGFuY2UgaWYgcHJvdmlkZWRcbiAqIG9yIHRoZSBBcnJheSBuYXRpdmUgb2JqZWN0IGlmIG5vdC4gVGhpcyBpcyBhbiBvcHRpb25hbFxuICogZmVhdHVyZSB0aGF0IGxldHMgeW91IHRyZWF0IHNpbXBsZV9zdGF0aXN0aWNzIGFzIGEgbmF0aXZlIGZlYXR1cmVcbiAqIG9mIEphdmFzY3JpcHQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNzIHNpbXBsZSBzdGF0aXN0aWNzXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXk9XSBhIHNpbmdsZSBhcnJheSBpbnN0YW5jZSB3aGljaCB3aWxsIGJlIGF1Z21lbnRlZFxuICogd2l0aCB0aGUgZXh0cmEgbWV0aG9kcy4gSWYgb21pdHRlZCwgbWl4aW4gd2lsbCBhcHBseSB0byBhbGwgYXJyYXlzXG4gKiBieSBjaGFuZ2luZyB0aGUgZ2xvYmFsIGBBcnJheS5wcm90b3R5cGVgLlxuICogQHJldHVybnMgeyp9IHRoZSBleHRlbmRlZCBBcnJheSwgb3IgQXJyYXkucHJvdG90eXBlIGlmIG5vIG9iamVjdFxuICogaXMgZ2l2ZW4uXG4gKlxuICogQGV4YW1wbGVcbiAqIHZhciBteU51bWJlcnMgPSBbMSwgMiwgM107XG4gKiBtaXhpbihzcywgbXlOdW1iZXJzKTtcbiAqIGNvbnNvbGUubG9nKG15TnVtYmVycy5zdW0oKSk7IC8vIDZcbiAqL1xuZnVuY3Rpb24gbWl4aW4oc3MsIGFycmF5KSB7XG4gICAgdmFyIHN1cHBvcnQgPSAhIShPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMpO1xuICAgIC8vIENvdmVyYWdlIHRlc3Rpbmcgd2lsbCBuZXZlciB0ZXN0IHRoaXMgZXJyb3IuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAoIXN1cHBvcnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd3aXRob3V0IGRlZmluZVByb3BlcnR5LCBzaW1wbGUtc3RhdGlzdGljcyBjYW5ub3QgYmUgbWl4ZWQgaW4nKTtcbiAgICB9XG5cbiAgICAvLyBvbmx5IG1ldGhvZHMgd2hpY2ggd29yayBvbiBiYXNpYyBhcnJheXMgaW4gYSBzaW5nbGUgc3RlcFxuICAgIC8vIGFyZSBzdXBwb3J0ZWRcbiAgICB2YXIgYXJyYXlNZXRob2RzID0gWydtZWRpYW4nLCAnc3RhbmRhcmREZXZpYXRpb24nLCAnc3VtJyxcbiAgICAgICAgJ3NhbXBsZVNrZXduZXNzJyxcbiAgICAgICAgJ21lYW4nLCAnbWluJywgJ21heCcsICdxdWFudGlsZScsICdnZW9tZXRyaWNNZWFuJyxcbiAgICAgICAgJ2hhcm1vbmljTWVhbicsICdyb290X21lYW5fc3F1YXJlJ107XG5cbiAgICAvLyBjcmVhdGUgYSBjbG9zdXJlIHdpdGggYSBtZXRob2QgbmFtZSBzbyB0aGF0IGEgcmVmZXJlbmNlXG4gICAgLy8gbGlrZSBgYXJyYXlNZXRob2RzW2ldYCBkb2Vzbid0IGZvbGxvdyB0aGUgbG9vcCBpbmNyZW1lbnRcbiAgICBmdW5jdGlvbiB3cmFwKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBjYXN0IGFueSBhcmd1bWVudHMgaW50byBhbiBhcnJheSwgc2luY2UgdGhleSdyZVxuICAgICAgICAgICAgLy8gbmF0aXZlbHkgb2JqZWN0c1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIGZpcnN0IGFyZ3VtZW50IHRoZSBhcnJheSBpdHNlbGZcbiAgICAgICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBzcyBtZXRob2RcbiAgICAgICAgICAgIHJldHVybiBzc1ttZXRob2RdLmFwcGx5KHNzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBzZWxlY3Qgb2JqZWN0IHRvIGV4dGVuZFxuICAgIHZhciBleHRlbmRpbmc7XG4gICAgaWYgKGFycmF5KSB7XG4gICAgICAgIC8vIGNyZWF0ZSBhIHNoYWxsb3cgY29weSBvZiB0aGUgYXJyYXkgc28gdGhhdCBvdXIgaW50ZXJuYWxcbiAgICAgICAgLy8gb3BlcmF0aW9ucyBkbyBub3QgY2hhbmdlIGl0IGJ5IHJlZmVyZW5jZVxuICAgICAgICBleHRlbmRpbmcgPSBhcnJheS5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGV4dGVuZGluZyA9IEFycmF5LnByb3RvdHlwZTtcbiAgICB9XG5cbiAgICAvLyBmb3IgZWFjaCBhcnJheSBmdW5jdGlvbiwgZGVmaW5lIGEgZnVuY3Rpb24gdGhhdCBnZXRzXG4gICAgLy8gdGhlIGFycmF5IGFzIHRoZSBmaXJzdCBhcmd1bWVudC5cbiAgICAvLyBXZSB1c2UgW2RlZmluZVByb3BlcnR5XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9kZWZpbmVQcm9wZXJ0eSlcbiAgICAvLyBiZWNhdXNlIGl0IGFsbG93cyB0aGVzZSBwcm9wZXJ0aWVzIHRvIGJlIG5vbi1lbnVtZXJhYmxlOlxuICAgIC8vIGBmb3IgKHZhciBpbiB4KWAgbG9vcHMgd2lsbCBub3QgcnVuIGludG8gcHJvYmxlbXMgd2l0aCB0aGlzXG4gICAgLy8gaW1wbGVtZW50YXRpb24uXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheU1ldGhvZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4dGVuZGluZywgYXJyYXlNZXRob2RzW2ldLCB7XG4gICAgICAgICAgICB2YWx1ZTogd3JhcChhcnJheU1ldGhvZHNbaV0pLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXh0ZW5kaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1peGluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnVtZXJpY1NvcnQgPSByZXF1aXJlKCcuL251bWVyaWNfc29ydCcpO1xuXG4vKipcbiAqIFRoZSBbbW9kZV0oaHR0cDovL2JpdC5seS9XNUs0WXQpIGlzIHRoZSBudW1iZXIgdGhhdCBhcHBlYXJzIGluIGEgbGlzdCB0aGUgaGlnaGVzdCBudW1iZXIgb2YgdGltZXMuXG4gKiBUaGVyZSBjYW4gYmUgbXVsdGlwbGUgbW9kZXMgaW4gYSBsaXN0OiBpbiB0aGUgZXZlbnQgb2YgYSB0aWUsIHRoaXNcbiAqIGFsZ29yaXRobSB3aWxsIHJldHVybiB0aGUgbW9zdCByZWNlbnRseSBzZWVuIG1vZGUuXG4gKlxuICogVGhpcyBpcyBhIFttZWFzdXJlIG9mIGNlbnRyYWwgdGVuZGVuY3ldKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NlbnRyYWxfdGVuZGVuY3kpOlxuICogYSBtZXRob2Qgb2YgZmluZGluZyBhIHR5cGljYWwgb3IgY2VudHJhbCB2YWx1ZSBvZiBhIHNldCBvZiBudW1iZXJzLlxuICpcbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gbW9kZVxuICogQGV4YW1wbGVcbiAqIG1vZGUoWzAsIDAsIDFdKTsgLy89IDBcbiAqL1xuZnVuY3Rpb24gbW9kZSh4KSB7XG5cbiAgICAvLyBIYW5kbGUgZWRnZSBjYXNlczpcbiAgICAvLyBUaGUgbWVkaWFuIG9mIGFuIGVtcHR5IGxpc3QgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGVsc2UgaWYgKHgubGVuZ3RoID09PSAxKSB7IHJldHVybiB4WzBdOyB9XG5cbiAgICAvLyBTb3J0aW5nIHRoZSBhcnJheSBsZXRzIHVzIGl0ZXJhdGUgdGhyb3VnaCBpdCBiZWxvdyBhbmQgYmUgc3VyZVxuICAgIC8vIHRoYXQgZXZlcnkgdGltZSB3ZSBzZWUgYSBuZXcgbnVtYmVyIGl0J3MgbmV3IGFuZCB3ZSdsbCBuZXZlclxuICAgIC8vIHNlZSB0aGUgc2FtZSBudW1iZXIgdHdpY2VcbiAgICB2YXIgc29ydGVkID0gbnVtZXJpY1NvcnQoeCk7XG5cbiAgICAvLyBUaGlzIGFzc3VtZXMgaXQgaXMgZGVhbGluZyB3aXRoIGFuIGFycmF5IG9mIHNpemUgPiAxLCBzaW5jZSBzaXplXG4gICAgLy8gMCBhbmQgMSBhcmUgaGFuZGxlZCBpbW1lZGlhdGVseS4gSGVuY2UgaXQgc3RhcnRzIGF0IGluZGV4IDEgaW4gdGhlXG4gICAgLy8gYXJyYXkuXG4gICAgdmFyIGxhc3QgPSBzb3J0ZWRbMF0sXG4gICAgICAgIC8vIHN0b3JlIHRoZSBtb2RlIGFzIHdlIGZpbmQgbmV3IG1vZGVzXG4gICAgICAgIHZhbHVlLFxuICAgICAgICAvLyBzdG9yZSBob3cgbWFueSB0aW1lcyB3ZSd2ZSBzZWVuIHRoZSBtb2RlXG4gICAgICAgIG1heFNlZW4gPSAwLFxuICAgICAgICAvLyBob3cgbWFueSB0aW1lcyB0aGUgY3VycmVudCBjYW5kaWRhdGUgZm9yIHRoZSBtb2RlXG4gICAgICAgIC8vIGhhcyBiZWVuIHNlZW5cbiAgICAgICAgc2VlblRoaXMgPSAxO1xuXG4gICAgLy8gZW5kIGF0IHNvcnRlZC5sZW5ndGggKyAxIHRvIGZpeCB0aGUgY2FzZSBpbiB3aGljaCB0aGUgbW9kZSBpc1xuICAgIC8vIHRoZSBoaWdoZXN0IG51bWJlciB0aGF0IG9jY3VycyBpbiB0aGUgc2VxdWVuY2UuIHRoZSBsYXN0IGl0ZXJhdGlvblxuICAgIC8vIGNvbXBhcmVzIHNvcnRlZFtpXSwgd2hpY2ggaXMgdW5kZWZpbmVkLCB0byB0aGUgaGlnaGVzdCBudW1iZXJcbiAgICAvLyBpbiB0aGUgc2VyaWVzXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBzb3J0ZWQubGVuZ3RoICsgMTsgaSsrKSB7XG4gICAgICAgIC8vIHdlJ3JlIHNlZWluZyBhIG5ldyBudW1iZXIgcGFzcyBieVxuICAgICAgICBpZiAoc29ydGVkW2ldICE9PSBsYXN0KSB7XG4gICAgICAgICAgICAvLyB0aGUgbGFzdCBudW1iZXIgaXMgdGhlIG5ldyBtb2RlIHNpbmNlIHdlIHNhdyBpdCBtb3JlXG4gICAgICAgICAgICAvLyBvZnRlbiB0aGFuIHRoZSBvbGQgb25lXG4gICAgICAgICAgICBpZiAoc2VlblRoaXMgPiBtYXhTZWVuKSB7XG4gICAgICAgICAgICAgICAgbWF4U2VlbiA9IHNlZW5UaGlzO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbGFzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlZW5UaGlzID0gMTtcbiAgICAgICAgICAgIGxhc3QgPSBzb3J0ZWRbaV07XG4gICAgICAgIC8vIGlmIHRoaXMgaXNuJ3QgYSBuZXcgbnVtYmVyLCBpdCdzIG9uZSBtb3JlIG9jY3VycmVuY2Ugb2ZcbiAgICAgICAgLy8gdGhlIHBvdGVudGlhbCBtb2RlXG4gICAgICAgIH0gZWxzZSB7IHNlZW5UaGlzKys7IH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU29ydCBhbiBhcnJheSBvZiBudW1iZXJzIGJ5IHRoZWlyIG51bWVyaWMgdmFsdWUsIGVuc3VyaW5nIHRoYXQgdGhlXG4gKiBhcnJheSBpcyBub3QgY2hhbmdlZCBpbiBwbGFjZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIC5zb3J0XG4gKiBpbiBKYXZhU2NyaXB0IGlzIHRvIHNvcnQgYXJyYXlzIGFzIHN0cmluZyB2YWx1ZXNcbiAqXG4gKiAgICAgWzEsIDEwLCAxMiwgMTAyLCAyMF0uc29ydCgpXG4gKiAgICAgLy8gb3V0cHV0XG4gKiAgICAgWzEsIDEwLCAxMDIsIDEyLCAyMF1cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGFycmF5IGlucHV0IGFycmF5XG4gKiBAcmV0dXJuIHtBcnJheTxudW1iZXI+fSBzb3J0ZWQgYXJyYXlcbiAqIEBwcml2YXRlXG4gKiBAZXhhbXBsZVxuICogbnVtZXJpY1NvcnQoWzMsIDIsIDFdKSAvLyBbMSwgMiwgM11cbiAqL1xuZnVuY3Rpb24gbnVtZXJpY1NvcnQoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXlcbiAgICAgICAgLy8gZW5zdXJlIHRoZSBhcnJheSBpcyBjaGFuZ2VkIGluLXBsYWNlXG4gICAgICAgIC5zbGljZSgpXG4gICAgICAgIC8vIGNvbXBhcmF0b3IgZnVuY3Rpb24gdGhhdCB0cmVhdHMgaW5wdXQgYXMgbnVtZXJpY1xuICAgICAgICAuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG51bWVyaWNTb3J0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBzaW5nbGUtbGF5ZXIgW1BlcmNlcHRyb24gQ2xhc3NpZmllcl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9QZXJjZXB0cm9uKSB0aGF0IHRha2VzXG4gKiBhcnJheXMgb2YgbnVtYmVycyBhbmQgcHJlZGljdHMgd2hldGhlciB0aGV5IHNob3VsZCBiZSBjbGFzc2lmaWVkXG4gKiBhcyBlaXRoZXIgMCBvciAxIChuZWdhdGl2ZSBvciBwb3NpdGl2ZSBleGFtcGxlcykuXG4gKiBAY2xhc3NcbiAqIEBleGFtcGxlXG4gKiAvLyBDcmVhdGUgdGhlIG1vZGVsXG4gKiB2YXIgcCA9IG5ldyBQZXJjZXB0cm9uTW9kZWwoKTtcbiAqIC8vIFRyYWluIHRoZSBtb2RlbCB3aXRoIGlucHV0IHdpdGggYSBkaWFnb25hbCBib3VuZGFyeS5cbiAqIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gKiAgICAgcC50cmFpbihbMSwgMV0sIDEpO1xuICogICAgIHAudHJhaW4oWzAsIDFdLCAwKTtcbiAqICAgICBwLnRyYWluKFsxLCAwXSwgMCk7XG4gKiAgICAgcC50cmFpbihbMCwgMF0sIDApO1xuICogfVxuICogcC5wcmVkaWN0KFswLCAwXSk7IC8vIDBcbiAqIHAucHJlZGljdChbMCwgMV0pOyAvLyAwXG4gKiBwLnByZWRpY3QoWzEsIDBdKTsgLy8gMFxuICogcC5wcmVkaWN0KFsxLCAxXSk7IC8vIDFcbiAqL1xuZnVuY3Rpb24gUGVyY2VwdHJvbk1vZGVsKCkge1xuICAgIC8vIFRoZSB3ZWlnaHRzLCBvciBjb2VmZmljaWVudHMgb2YgdGhlIG1vZGVsO1xuICAgIC8vIHdlaWdodHMgYXJlIG9ubHkgcG9wdWxhdGVkIHdoZW4gdHJhaW5pbmcgd2l0aCBkYXRhLlxuICAgIHRoaXMud2VpZ2h0cyA9IFtdO1xuICAgIC8vIFRoZSBiaWFzIHRlcm0sIG9yIGludGVyY2VwdDsgaXQgaXMgYWxzbyBhIHdlaWdodCBidXRcbiAgICAvLyBpdCdzIHN0b3JlZCBzZXBhcmF0ZWx5IGZvciBjb252ZW5pZW5jZSBhcyBpdCBpcyBhbHdheXNcbiAgICAvLyBtdWx0aXBsaWVkIGJ5IG9uZS5cbiAgICB0aGlzLmJpYXMgPSAwO1xufVxuXG4vKipcbiAqICoqUHJlZGljdCoqOiBVc2UgYW4gYXJyYXkgb2YgZmVhdHVyZXMgd2l0aCB0aGUgd2VpZ2h0IGFycmF5IGFuZCBiaWFzXG4gKiB0byBwcmVkaWN0IHdoZXRoZXIgYW4gZXhhbXBsZSBpcyBsYWJlbGVkIDAgb3IgMS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGZlYXR1cmVzIGFuIGFycmF5IG9mIGZlYXR1cmVzIGFzIG51bWJlcnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9IDEgaWYgdGhlIHNjb3JlIGlzIG92ZXIgMCwgb3RoZXJ3aXNlIDBcbiAqL1xuUGVyY2VwdHJvbk1vZGVsLnByb3RvdHlwZS5wcmVkaWN0ID0gZnVuY3Rpb24oZmVhdHVyZXMpIHtcblxuICAgIC8vIE9ubHkgcHJlZGljdCBpZiBwcmV2aW91c2x5IHRyYWluZWRcbiAgICAvLyBvbiB0aGUgc2FtZSBzaXplIGZlYXR1cmUgYXJyYXkocykuXG4gICAgaWYgKGZlYXR1cmVzLmxlbmd0aCAhPT0gdGhpcy53ZWlnaHRzLmxlbmd0aCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBzdW0gb2YgZmVhdHVyZXMgdGltZXMgd2VpZ2h0cyxcbiAgICAvLyB3aXRoIHRoZSBiaWFzIGFkZGVkIChpbXBsaWNpdGx5IHRpbWVzIG9uZSkuXG4gICAgdmFyIHNjb3JlID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzY29yZSArPSB0aGlzLndlaWdodHNbaV0gKiBmZWF0dXJlc1tpXTtcbiAgICB9XG4gICAgc2NvcmUgKz0gdGhpcy5iaWFzO1xuXG4gICAgLy8gQ2xhc3NpZnkgYXMgMSBpZiB0aGUgc2NvcmUgaXMgb3ZlciAwLCBvdGhlcndpc2UgMC5cbiAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn07XG5cbi8qKlxuICogKipUcmFpbioqIHRoZSBjbGFzc2lmaWVyIHdpdGggYSBuZXcgZXhhbXBsZSwgd2hpY2ggaXNcbiAqIGEgbnVtZXJpYyBhcnJheSBvZiBmZWF0dXJlcyBhbmQgYSAwIG9yIDEgbGFiZWwuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBmZWF0dXJlcyBhbiBhcnJheSBvZiBmZWF0dXJlcyBhcyBudW1iZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gbGFiZWwgZWl0aGVyIDAgb3IgMVxuICogQHJldHVybnMge1BlcmNlcHRyb25Nb2RlbH0gdGhpc1xuICovXG5QZXJjZXB0cm9uTW9kZWwucHJvdG90eXBlLnRyYWluID0gZnVuY3Rpb24oZmVhdHVyZXMsIGxhYmVsKSB7XG4gICAgLy8gUmVxdWlyZSB0aGF0IG9ubHkgbGFiZWxzIG9mIDAgb3IgMSBhcmUgY29uc2lkZXJlZC5cbiAgICBpZiAobGFiZWwgIT09IDAgJiYgbGFiZWwgIT09IDEpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAvLyBUaGUgbGVuZ3RoIG9mIHRoZSBmZWF0dXJlIGFycmF5IGRldGVybWluZXNcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIHRoZSB3ZWlnaHQgYXJyYXkuXG4gICAgLy8gVGhlIHBlcmNlcHRyb24gd2lsbCBjb250aW51ZSBsZWFybmluZyBhcyBsb25nIGFzXG4gICAgLy8gaXQga2VlcHMgc2VlaW5nIGZlYXR1cmUgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aC5cbiAgICAvLyBXaGVuIGl0IHNlZXMgYSBuZXcgZGF0YSBzaGFwZSwgaXQgaW5pdGlhbGl6ZXMuXG4gICAgaWYgKGZlYXR1cmVzLmxlbmd0aCAhPT0gdGhpcy53ZWlnaHRzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLndlaWdodHMgPSBmZWF0dXJlcztcbiAgICAgICAgdGhpcy5iaWFzID0gMTtcbiAgICB9XG4gICAgLy8gTWFrZSBhIHByZWRpY3Rpb24gYmFzZWQgb24gY3VycmVudCB3ZWlnaHRzLlxuICAgIHZhciBwcmVkaWN0aW9uID0gdGhpcy5wcmVkaWN0KGZlYXR1cmVzKTtcbiAgICAvLyBVcGRhdGUgdGhlIHdlaWdodHMgaWYgdGhlIHByZWRpY3Rpb24gaXMgd3JvbmcuXG4gICAgaWYgKHByZWRpY3Rpb24gIT09IGxhYmVsKSB7XG4gICAgICAgIHZhciBncmFkaWVudCA9IGxhYmVsIC0gcHJlZGljdGlvbjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLndlaWdodHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMud2VpZ2h0c1tpXSArPSBncmFkaWVudCAqIGZlYXR1cmVzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmlhcyArPSBncmFkaWVudDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBlcmNlcHRyb25Nb2RlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVwc2lsb24gPSByZXF1aXJlKCcuL2Vwc2lsb24nKTtcbnZhciBmYWN0b3JpYWwgPSByZXF1aXJlKCcuL2ZhY3RvcmlhbCcpO1xuXG4vKipcbiAqIFRoZSBbUG9pc3NvbiBEaXN0cmlidXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9pc3Nvbl9kaXN0cmlidXRpb24pXG4gKiBpcyBhIGRpc2NyZXRlIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiB0aGF0IGV4cHJlc3NlcyB0aGUgcHJvYmFiaWxpdHlcbiAqIG9mIGEgZ2l2ZW4gbnVtYmVyIG9mIGV2ZW50cyBvY2N1cnJpbmcgaW4gYSBmaXhlZCBpbnRlcnZhbCBvZiB0aW1lXG4gKiBhbmQvb3Igc3BhY2UgaWYgdGhlc2UgZXZlbnRzIG9jY3VyIHdpdGggYSBrbm93biBhdmVyYWdlIHJhdGUgYW5kXG4gKiBpbmRlcGVuZGVudGx5IG9mIHRoZSB0aW1lIHNpbmNlIHRoZSBsYXN0IGV2ZW50LlxuICpcbiAqIFRoZSBQb2lzc29uIERpc3RyaWJ1dGlvbiBpcyBjaGFyYWN0ZXJpemVkIGJ5IHRoZSBzdHJpY3RseSBwb3NpdGl2ZVxuICogbWVhbiBhcnJpdmFsIG9yIG9jY3VycmVuY2UgcmF0ZSwgYM67YC5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbGFtYmRhIGxvY2F0aW9uIHBvaXNzb24gZGlzdHJpYnV0aW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB2YWx1ZSBvZiBwb2lzc29uIGRpc3RyaWJ1dGlvbiBhdCB0aGF0IHBvaW50XG4gKi9cbmZ1bmN0aW9uIHBvaXNzb25EaXN0cmlidXRpb24obGFtYmRhKSB7XG4gICAgLy8gQ2hlY2sgdGhhdCBsYW1iZGEgaXMgc3RyaWN0bHkgcG9zaXRpdmVcbiAgICBpZiAobGFtYmRhIDw9IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIG91ciBjdXJyZW50IHBsYWNlIGluIHRoZSBkaXN0cmlidXRpb25cbiAgICB2YXIgeCA9IDAsXG4gICAgICAgIC8vIGFuZCB3ZSBrZWVwIHRyYWNrIG9mIHRoZSBjdXJyZW50IGN1bXVsYXRpdmUgcHJvYmFiaWxpdHksIGluXG4gICAgICAgIC8vIG9yZGVyIHRvIGtub3cgd2hlbiB0byBzdG9wIGNhbGN1bGF0aW5nIGNoYW5jZXMuXG4gICAgICAgIGN1bXVsYXRpdmVQcm9iYWJpbGl0eSA9IDAsXG4gICAgICAgIC8vIHRoZSBjYWxjdWxhdGVkIGNlbGxzIHRvIGJlIHJldHVybmVkXG4gICAgICAgIGNlbGxzID0ge307XG5cbiAgICAvLyBUaGlzIGFsZ29yaXRobSBpdGVyYXRlcyB0aHJvdWdoIGVhY2ggcG90ZW50aWFsIG91dGNvbWUsXG4gICAgLy8gdW50aWwgdGhlIGBjdW11bGF0aXZlUHJvYmFiaWxpdHlgIGlzIHZlcnkgY2xvc2UgdG8gMSwgYXRcbiAgICAvLyB3aGljaCBwb2ludCB3ZSd2ZSBkZWZpbmVkIHRoZSB2YXN0IG1ham9yaXR5IG9mIG91dGNvbWVzXG4gICAgZG8ge1xuICAgICAgICAvLyBhIFtwcm9iYWJpbGl0eSBtYXNzIGZ1bmN0aW9uXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qcm9iYWJpbGl0eV9tYXNzX2Z1bmN0aW9uKVxuICAgICAgICBjZWxsc1t4XSA9IChNYXRoLnBvdyhNYXRoLkUsIC1sYW1iZGEpICogTWF0aC5wb3cobGFtYmRhLCB4KSkgLyBmYWN0b3JpYWwoeCk7XG4gICAgICAgIGN1bXVsYXRpdmVQcm9iYWJpbGl0eSArPSBjZWxsc1t4XTtcbiAgICAgICAgeCsrO1xuICAgIC8vIHdoZW4gdGhlIGN1bXVsYXRpdmVQcm9iYWJpbGl0eSBpcyBuZWFybHkgMSwgd2UndmUgY2FsY3VsYXRlZFxuICAgIC8vIHRoZSB1c2VmdWwgcmFuZ2Ugb2YgdGhpcyBkaXN0cmlidXRpb25cbiAgICB9IHdoaWxlIChjdW11bGF0aXZlUHJvYmFiaWxpdHkgPCAxIC0gZXBzaWxvbik7XG5cbiAgICByZXR1cm4gY2VsbHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcG9pc3NvbkRpc3RyaWJ1dGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVwc2lsb24gPSByZXF1aXJlKCcuL2Vwc2lsb24nKTtcbnZhciBpbnZlcnNlRXJyb3JGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaW52ZXJzZV9lcnJvcl9mdW5jdGlvbicpO1xuXG4vKipcbiAqIFRoZSBbUHJvYml0XShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Byb2JpdClcbiAqIGlzIHRoZSBpbnZlcnNlIG9mIGN1bXVsYXRpdmVTdGROb3JtYWxQcm9iYWJpbGl0eSgpLFxuICogYW5kIGlzIGFsc28ga25vd24gYXMgdGhlIG5vcm1hbCBxdWFudGlsZSBmdW5jdGlvbi5cbiAqXG4gKiBJdCByZXR1cm5zIHRoZSBudW1iZXIgb2Ygc3RhbmRhcmQgZGV2aWF0aW9ucyBmcm9tIHRoZSBtZWFuXG4gKiB3aGVyZSB0aGUgcCd0aCBxdWFudGlsZSBvZiB2YWx1ZXMgY2FuIGJlIGZvdW5kIGluIGEgbm9ybWFsIGRpc3RyaWJ1dGlvbi5cbiAqIFNvLCBmb3IgZXhhbXBsZSwgcHJvYml0KDAuNSArIDAuNjgyNy8yKSDiiYggMSBiZWNhdXNlIDY4LjI3JSBvZiB2YWx1ZXMgYXJlXG4gKiBub3JtYWxseSBmb3VuZCB3aXRoaW4gMSBzdGFuZGFyZCBkZXZpYXRpb24gYWJvdmUgb3IgYmVsb3cgdGhlIG1lYW4uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHBcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHByb2JpdFxuICovXG5mdW5jdGlvbiBwcm9iaXQocCkge1xuICAgIGlmIChwID09PSAwKSB7XG4gICAgICAgIHAgPSBlcHNpbG9uO1xuICAgIH0gZWxzZSBpZiAocCA+PSAxKSB7XG4gICAgICAgIHAgPSAxIC0gZXBzaWxvbjtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGguc3FydCgyKSAqIGludmVyc2VFcnJvckZ1bmN0aW9uKDIgKiBwIC0gMSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvYml0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcXVhbnRpbGVTb3J0ZWQgPSByZXF1aXJlKCcuL3F1YW50aWxlX3NvcnRlZCcpO1xudmFyIG51bWVyaWNTb3J0ID0gcmVxdWlyZSgnLi9udW1lcmljX3NvcnQnKTtcblxuLyoqXG4gKiBUaGUgW3F1YW50aWxlXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9RdWFudGlsZSk6XG4gKiB0aGlzIGlzIGEgcG9wdWxhdGlvbiBxdWFudGlsZSwgc2luY2Ugd2UgYXNzdW1lIHRvIGtub3cgdGhlIGVudGlyZVxuICogZGF0YXNldCBpbiB0aGlzIGxpYnJhcnkuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4gKiBbUXVhbnRpbGVzIG9mIGEgUG9wdWxhdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9RdWFudGlsZSNRdWFudGlsZXNfb2ZfYV9wb3B1bGF0aW9uKVxuICogYWxnb3JpdGhtIGZyb20gd2lraXBlZGlhLlxuICpcbiAqIFNhbXBsZSBpcyBhIG9uZS1kaW1lbnNpb25hbCBhcnJheSBvZiBudW1iZXJzLFxuICogYW5kIHAgaXMgZWl0aGVyIGEgZGVjaW1hbCBudW1iZXIgZnJvbSAwIHRvIDEgb3IgYW4gYXJyYXkgb2YgZGVjaW1hbFxuICogbnVtYmVycyBmcm9tIDAgdG8gMS5cbiAqIEluIHRlcm1zIG9mIGEgay9xIHF1YW50aWxlLCBwID0gay9xIC0gaXQncyBqdXN0IGRlYWxpbmcgd2l0aCBmcmFjdGlvbnMgb3IgZGVhbGluZ1xuICogd2l0aCBkZWNpbWFsIHZhbHVlcy5cbiAqIFdoZW4gcCBpcyBhbiBhcnJheSwgdGhlIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24gaXMgYWxzbyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBhcHByb3ByaWF0ZVxuICogcXVhbnRpbGVzIGluIGlucHV0IG9yZGVyXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBzYW1wbGUgYSBzYW1wbGUgZnJvbSB0aGUgcG9wdWxhdGlvblxuICogQHBhcmFtIHtudW1iZXJ9IHAgdGhlIGRlc2lyZWQgcXVhbnRpbGUsIGFzIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMVxuICogQHJldHVybnMge251bWJlcn0gcXVhbnRpbGVcbiAqIEBleGFtcGxlXG4gKiB2YXIgZGF0YSA9IFszLCA2LCA3LCA4LCA4LCA5LCAxMCwgMTMsIDE1LCAxNiwgMjBdO1xuICogcXVhbnRpbGUoZGF0YSwgMSk7IC8vPSBtYXgoZGF0YSk7XG4gKiBxdWFudGlsZShkYXRhLCAwKTsgLy89IG1pbihkYXRhKTtcbiAqIHF1YW50aWxlKGRhdGEsIDAuNSk7IC8vPSA5XG4gKi9cbmZ1bmN0aW9uIHF1YW50aWxlKHNhbXBsZSwgcCkge1xuXG4gICAgLy8gV2UgY2FuJ3QgZGVyaXZlIHF1YW50aWxlcyBmcm9tIGFuIGVtcHR5IGxpc3RcbiAgICBpZiAoc2FtcGxlLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gU29ydCBhIGNvcHkgb2YgdGhlIGFycmF5LiBXZSdsbCBuZWVkIGEgc29ydGVkIGFycmF5IHRvIGluZGV4XG4gICAgLy8gdGhlIHZhbHVlcyBpbiBzb3J0ZWQgb3JkZXIuXG4gICAgdmFyIHNvcnRlZCA9IG51bWVyaWNTb3J0KHNhbXBsZSk7XG5cbiAgICBpZiAocC5sZW5ndGgpIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgcmVzdWx0IGFycmF5XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIC8vIEZvciBlYWNoIHJlcXVlc3RlZCBxdWFudGlsZVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdHNbaV0gPSBxdWFudGlsZVNvcnRlZChzb3J0ZWQsIHBbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBxdWFudGlsZVNvcnRlZChzb3J0ZWQsIHApO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBxdWFudGlsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBpbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBxdWFudGlsZXM6IHdoZW4geW91IGtub3dcbiAqIHRoYXQgdGhlIG9yZGVyIGlzIHNvcnRlZCwgeW91IGRvbid0IG5lZWQgdG8gcmUtc29ydCBpdCwgYW5kIHRoZSBjb21wdXRhdGlvbnNcbiAqIGFyZSBmYXN0ZXIuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBzYW1wbGUgaW5wdXQgZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHAgZGVzaXJlZCBxdWFudGlsZTogYSBudW1iZXIgYmV0d2VlbiAwIHRvIDEsIGluY2x1c2l2ZVxuICogQHJldHVybnMge251bWJlcn0gcXVhbnRpbGUgdmFsdWVcbiAqIEBleGFtcGxlXG4gKiB2YXIgZGF0YSA9IFszLCA2LCA3LCA4LCA4LCA5LCAxMCwgMTMsIDE1LCAxNiwgMjBdO1xuICogcXVhbnRpbGVTb3J0ZWQoZGF0YSwgMSk7IC8vPSBtYXgoZGF0YSk7XG4gKiBxdWFudGlsZVNvcnRlZChkYXRhLCAwKTsgLy89IG1pbihkYXRhKTtcbiAqIHF1YW50aWxlU29ydGVkKGRhdGEsIDAuNSk7IC8vPSA5XG4gKi9cbmZ1bmN0aW9uIHF1YW50aWxlU29ydGVkKHNhbXBsZSwgcCkge1xuICAgIHZhciBpZHggPSBzYW1wbGUubGVuZ3RoICogcDtcbiAgICBpZiAocCA8IDAgfHwgcCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChwID09PSAxKSB7XG4gICAgICAgIC8vIElmIHAgaXMgMSwgZGlyZWN0bHkgcmV0dXJuIHRoZSBsYXN0IGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIHNhbXBsZVtzYW1wbGUubGVuZ3RoIC0gMV07XG4gICAgfSBlbHNlIGlmIChwID09PSAwKSB7XG4gICAgICAgIC8vIElmIHAgaXMgMCwgZGlyZWN0bHkgcmV0dXJuIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICAgIHJldHVybiBzYW1wbGVbMF07XG4gICAgfSBlbHNlIGlmIChpZHggJSAxICE9PSAwKSB7XG4gICAgICAgIC8vIElmIHAgaXMgbm90IGludGVnZXIsIHJldHVybiB0aGUgbmV4dCBlbGVtZW50IGluIGFycmF5XG4gICAgICAgIHJldHVybiBzYW1wbGVbTWF0aC5jZWlsKGlkeCkgLSAxXTtcbiAgICB9IGVsc2UgaWYgKHNhbXBsZS5sZW5ndGggJSAyID09PSAwKSB7XG4gICAgICAgIC8vIElmIHRoZSBsaXN0IGhhcyBldmVuLWxlbmd0aCwgd2UnbGwgdGFrZSB0aGUgYXZlcmFnZSBvZiB0aGlzIG51bWJlclxuICAgICAgICAvLyBhbmQgdGhlIG5leHQgdmFsdWUsIGlmIHRoZXJlIGlzIG9uZVxuICAgICAgICByZXR1cm4gKHNhbXBsZVtpZHggLSAxXSArIHNhbXBsZVtpZHhdKSAvIDI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gRmluYWxseSwgaW4gdGhlIHNpbXBsZSBjYXNlIG9mIGFuIGludGVnZXIgdmFsdWVcbiAgICAgICAgLy8gd2l0aCBhbiBvZGQtbGVuZ3RoIGxpc3QsIHJldHVybiB0aGUgc2FtcGxlIHZhbHVlIGF0IHRoZSBpbmRleC5cbiAgICAgICAgcmV0dXJuIHNhbXBsZVtpZHhdO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBxdWFudGlsZVNvcnRlZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgW1IgU3F1YXJlZF0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db2VmZmljaWVudF9vZl9kZXRlcm1pbmF0aW9uKVxuICogdmFsdWUgb2YgZGF0YSBjb21wYXJlZCB3aXRoIGEgZnVuY3Rpb24gYGZgXG4gKiBpcyB0aGUgc3VtIG9mIHRoZSBzcXVhcmVkIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHByZWRpY3Rpb25cbiAqIGFuZCB0aGUgYWN0dWFsIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8bnVtYmVyPj59IGRhdGEgaW5wdXQgZGF0YTogdGhpcyBzaG91bGQgYmUgZG91Ymx5LW5lc3RlZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBmdW5jdGlvbiBjYWxsZWQgb24gYFtpXVswXWAgdmFsdWVzIHdpdGhpbiB0aGUgZGF0YXNldFxuICogQHJldHVybnMge251bWJlcn0gci1zcXVhcmVkIHZhbHVlXG4gKiBAZXhhbXBsZVxuICogdmFyIHNhbXBsZXMgPSBbWzAsIDBdLCBbMSwgMV1dO1xuICogdmFyIHJlZ3Jlc3Npb25MaW5lID0gbGluZWFyUmVncmVzc2lvbkxpbmUobGluZWFyUmVncmVzc2lvbihzYW1wbGVzKSk7XG4gKiByU3F1YXJlZChzYW1wbGVzLCByZWdyZXNzaW9uTGluZSk7IC8vPSAxIHRoaXMgbGluZSBpcyBhIHBlcmZlY3QgZml0XG4gKi9cbmZ1bmN0aW9uIHJTcXVhcmVkKGRhdGEsIGZ1bmMpIHtcbiAgICBpZiAoZGF0YS5sZW5ndGggPCAyKSB7IHJldHVybiAxOyB9XG5cbiAgICAvLyBDb21wdXRlIHRoZSBhdmVyYWdlIHkgdmFsdWUgZm9yIHRoZSBhY3R1YWxcbiAgICAvLyBkYXRhIHNldCBpbiBvcmRlciB0byBjb21wdXRlIHRoZVxuICAgIC8vIF90b3RhbCBzdW0gb2Ygc3F1YXJlc19cbiAgICB2YXIgc3VtID0gMCwgYXZlcmFnZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtICs9IGRhdGFbaV1bMV07XG4gICAgfVxuICAgIGF2ZXJhZ2UgPSBzdW0gLyBkYXRhLmxlbmd0aDtcblxuICAgIC8vIENvbXB1dGUgdGhlIHRvdGFsIHN1bSBvZiBzcXVhcmVzIC0gdGhlXG4gICAgLy8gc3F1YXJlZCBkaWZmZXJlbmNlIGJldHdlZW4gZWFjaCBwb2ludFxuICAgIC8vIGFuZCB0aGUgYXZlcmFnZSBvZiBhbGwgcG9pbnRzLlxuICAgIHZhciBzdW1PZlNxdWFyZXMgPSAwO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0YS5sZW5ndGg7IGorKykge1xuICAgICAgICBzdW1PZlNxdWFyZXMgKz0gTWF0aC5wb3coYXZlcmFnZSAtIGRhdGFbal1bMV0sIDIpO1xuICAgIH1cblxuICAgIC8vIEZpbmFsbHkgZXN0aW1hdGUgdGhlIGVycm9yOiB0aGUgc3F1YXJlZFxuICAgIC8vIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgZXN0aW1hdGUgYW5kIHRoZSBhY3R1YWwgZGF0YVxuICAgIC8vIHZhbHVlIGF0IGVhY2ggcG9pbnQuXG4gICAgdmFyIGVyciA9IDA7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBkYXRhLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIGVyciArPSBNYXRoLnBvdyhkYXRhW2tdWzFdIC0gZnVuYyhkYXRhW2tdWzBdKSwgMik7XG4gICAgfVxuXG4gICAgLy8gQXMgdGhlIGVycm9yIGdyb3dzIGxhcmdlciwgaXRzIHJhdGlvIHRvIHRoZVxuICAgIC8vIHN1bSBvZiBzcXVhcmVzIGluY3JlYXNlcyBhbmQgdGhlIHIgc3F1YXJlZFxuICAgIC8vIHZhbHVlIGdyb3dzIGxvd2VyLlxuICAgIHJldHVybiAxIC0gZXJyIC8gc3VtT2ZTcXVhcmVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJTcXVhcmVkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBSb290IE1lYW4gU3F1YXJlIChSTVMpIGlzXG4gKiBhIG1lYW4gZnVuY3Rpb24gdXNlZCBhcyBhIG1lYXN1cmUgb2YgdGhlIG1hZ25pdHVkZSBvZiBhIHNldFxuICogb2YgbnVtYmVycywgcmVnYXJkbGVzcyBvZiB0aGVpciBzaWduLlxuICogVGhpcyBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIG1lYW4gb2YgdGhlIHNxdWFyZXMgb2YgdGhlXG4gKiBpbnB1dCBudW1iZXJzLlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHJvb3QgbWVhbiBzcXVhcmVcbiAqIEBleGFtcGxlXG4gKiByb290TWVhblNxdWFyZShbLTEsIDEsIC0xLCAxXSk7IC8vPSAxXG4gKi9cbmZ1bmN0aW9uIHJvb3RNZWFuU3F1YXJlKHgpIHtcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHZhciBzdW1PZlNxdWFyZXMgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdW1PZlNxdWFyZXMgKz0gTWF0aC5wb3coeFtpXSwgMik7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGguc3FydChzdW1PZlNxdWFyZXMgLyB4Lmxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdE1lYW5TcXVhcmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzaHVmZmxlID0gcmVxdWlyZSgnLi9zaHVmZmxlJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgW3NpbXBsZSByYW5kb20gc2FtcGxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NpbXBsZV9yYW5kb21fc2FtcGxlKVxuICogZnJvbSBhIGdpdmVuIGFycmF5IG9mIGBuYCBlbGVtZW50cy5cbiAqXG4gKiBUaGUgc2FtcGxlZCB2YWx1ZXMgd2lsbCBiZSBpbiBhbnkgb3JkZXIsIG5vdCBuZWNlc3NhcmlseSB0aGUgb3JkZXJcbiAqIHRoZXkgYXBwZWFyIGluIHRoZSBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBpbnB1dCBhcnJheS4gY2FuIGNvbnRhaW4gYW55IHR5cGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIGNvdW50IG9mIGhvdyBtYW55IGVsZW1lbnRzIHRvIHRha2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyYW5kb21Tb3VyY2U9TWF0aC5yYW5kb21dIGFuIG9wdGlvbmFsIHNvdXJjZSBvZiBlbnRyb3B5XG4gKiBpbnN0ZWFkIG9mIE1hdGgucmFuZG9tXG4gKiBAcmV0dXJuIHtBcnJheX0gc3Vic2V0IG9mIG4gZWxlbWVudHMgaW4gb3JpZ2luYWwgYXJyYXlcbiAqIEBleGFtcGxlXG4gKiB2YXIgdmFsdWVzID0gWzEsIDIsIDQsIDUsIDYsIDcsIDgsIDldO1xuICogc2FtcGxlKHZhbHVlcywgMyk7IC8vIHJldHVybnMgMyByYW5kb20gdmFsdWVzLCBsaWtlIFsyLCA1LCA4XTtcbiAqL1xuZnVuY3Rpb24gc2FtcGxlKGFycmF5LCBuLCByYW5kb21Tb3VyY2UpIHtcbiAgICAvLyBzaHVmZmxlIHRoZSBvcmlnaW5hbCBhcnJheSB1c2luZyBhIGZpc2hlci15YXRlcyBzaHVmZmxlXG4gICAgdmFyIHNodWZmbGVkID0gc2h1ZmZsZShhcnJheSwgcmFuZG9tU291cmNlKTtcblxuICAgIC8vIGFuZCB0aGVuIHJldHVybiBhIHN1YnNldCBvZiBpdCAtIHRoZSBmaXJzdCBgbmAgZWxlbWVudHMuXG4gICAgcmV0dXJuIHNodWZmbGVkLnNsaWNlKDAsIG4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhbXBsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNhbXBsZUNvdmFyaWFuY2UgPSByZXF1aXJlKCcuL3NhbXBsZV9jb3ZhcmlhbmNlJyk7XG52YXIgc2FtcGxlU3RhbmRhcmREZXZpYXRpb24gPSByZXF1aXJlKCcuL3NhbXBsZV9zdGFuZGFyZF9kZXZpYXRpb24nKTtcblxuLyoqXG4gKiBUaGUgW2NvcnJlbGF0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvcnJlbGF0aW9uX2FuZF9kZXBlbmRlbmNlKSBpc1xuICogYSBtZWFzdXJlIG9mIGhvdyBjb3JyZWxhdGVkIHR3byBkYXRhc2V0cyBhcmUsIGJldHdlZW4gLTEgYW5kIDFcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggZmlyc3QgaW5wdXRcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geSBzZWNvbmQgaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHNhbXBsZSBjb3JyZWxhdGlvblxuICogQGV4YW1wbGVcbiAqIHZhciBhID0gWzEsIDIsIDMsIDQsIDUsIDZdO1xuICogdmFyIGIgPSBbMiwgMiwgMywgNCwgNSwgNjBdO1xuICogc2FtcGxlQ29ycmVsYXRpb24oYSwgYik7IC8vPSAwLjY5MVxuICovXG5mdW5jdGlvbiBzYW1wbGVDb3JyZWxhdGlvbih4LCB5KSB7XG4gICAgdmFyIGNvdiA9IHNhbXBsZUNvdmFyaWFuY2UoeCwgeSksXG4gICAgICAgIHhzdGQgPSBzYW1wbGVTdGFuZGFyZERldmlhdGlvbih4KSxcbiAgICAgICAgeXN0ZCA9IHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uKHkpO1xuXG4gICAgaWYgKGNvdiA9PT0gbnVsbCB8fCB4c3RkID09PSBudWxsIHx8IHlzdGQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvdiAvIHhzdGQgLyB5c3RkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhbXBsZUNvcnJlbGF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVhbiA9IHJlcXVpcmUoJy4vbWVhbicpO1xuXG4vKipcbiAqIFtTYW1wbGUgY292YXJpYW5jZV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2FtcGxlX21lYW5fYW5kX3NhbXBsZUNvdmFyaWFuY2UpIG9mIHR3byBkYXRhc2V0czpcbiAqIGhvdyBtdWNoIGRvIHRoZSB0d28gZGF0YXNldHMgbW92ZSB0b2dldGhlcj9cbiAqIHggYW5kIHkgYXJlIHR3byBkYXRhc2V0cywgcmVwcmVzZW50ZWQgYXMgYXJyYXlzIG9mIG51bWJlcnMuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGZpcnN0IGlucHV0XG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHkgc2Vjb25kIGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzYW1wbGUgY292YXJpYW5jZVxuICogQGV4YW1wbGVcbiAqIHZhciB4ID0gWzEsIDIsIDMsIDQsIDUsIDZdO1xuICogdmFyIHkgPSBbNiwgNSwgNCwgMywgMiwgMV07XG4gKiBzYW1wbGVDb3ZhcmlhbmNlKHgsIHkpOyAvLz0gLTMuNVxuICovXG5mdW5jdGlvbiBzYW1wbGVDb3ZhcmlhbmNlKHgsIHkpIHtcblxuICAgIC8vIFRoZSB0d28gZGF0YXNldHMgbXVzdCBoYXZlIHRoZSBzYW1lIGxlbmd0aCB3aGljaCBtdXN0IGJlIG1vcmUgdGhhbiAxXG4gICAgaWYgKHgubGVuZ3RoIDw9IDEgfHwgeC5sZW5ndGggIT09IHkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIGRldGVybWluZSB0aGUgbWVhbiBvZiBlYWNoIGRhdGFzZXQgc28gdGhhdCB3ZSBjYW4ganVkZ2UgZWFjaFxuICAgIC8vIHZhbHVlIG9mIHRoZSBkYXRhc2V0IGZhaXJseSBhcyB0aGUgZGlmZmVyZW5jZSBmcm9tIHRoZSBtZWFuLiB0aGlzXG4gICAgLy8gd2F5LCBpZiBvbmUgZGF0YXNldCBpcyBbMSwgMiwgM10gYW5kIFsyLCAzLCA0XSwgdGhlaXIgY292YXJpYW5jZVxuICAgIC8vIGRvZXMgbm90IHN1ZmZlciBiZWNhdXNlIG9mIHRoZSBkaWZmZXJlbmNlIGluIGFic29sdXRlIHZhbHVlc1xuICAgIHZhciB4bWVhbiA9IG1lYW4oeCksXG4gICAgICAgIHltZWFuID0gbWVhbih5KSxcbiAgICAgICAgc3VtID0gMDtcblxuICAgIC8vIGZvciBlYWNoIHBhaXIgb2YgdmFsdWVzLCB0aGUgY292YXJpYW5jZSBpbmNyZWFzZXMgd2hlbiB0aGVpclxuICAgIC8vIGRpZmZlcmVuY2UgZnJvbSB0aGUgbWVhbiBpcyBhc3NvY2lhdGVkIC0gaWYgYm90aCBhcmUgd2VsbCBhYm92ZVxuICAgIC8vIG9yIGlmIGJvdGggYXJlIHdlbGwgYmVsb3dcbiAgICAvLyB0aGUgbWVhbiwgdGhlIGNvdmFyaWFuY2UgaW5jcmVhc2VzIHNpZ25pZmljYW50bHkuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSAoeFtpXSAtIHhtZWFuKSAqICh5W2ldIC0geW1lYW4pO1xuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgQmVzc2VscycgQ29ycmVjdGlvbjogYW4gYWRqdXN0bWVudCBtYWRlIHRvIHNhbXBsZSBzdGF0aXN0aWNzXG4gICAgLy8gdGhhdCBhbGxvd3MgZm9yIHRoZSByZWR1Y2VkIGRlZ3JlZSBvZiBmcmVlZG9tIGVudGFpbGVkIGluIGNhbGN1bGF0aW5nXG4gICAgLy8gdmFsdWVzIGZyb20gc2FtcGxlcyByYXRoZXIgdGhhbiBjb21wbGV0ZSBwb3B1bGF0aW9ucy5cbiAgICB2YXIgYmVzc2Vsc0NvcnJlY3Rpb24gPSB4Lmxlbmd0aCAtIDE7XG5cbiAgICAvLyB0aGUgY292YXJpYW5jZSBpcyB3ZWlnaHRlZCBieSB0aGUgbGVuZ3RoIG9mIHRoZSBkYXRhc2V0cy5cbiAgICByZXR1cm4gc3VtIC8gYmVzc2Vsc0NvcnJlY3Rpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2FtcGxlQ292YXJpYW5jZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN1bU50aFBvd2VyRGV2aWF0aW9ucyA9IHJlcXVpcmUoJy4vc3VtX250aF9wb3dlcl9kZXZpYXRpb25zJyk7XG52YXIgc2FtcGxlU3RhbmRhcmREZXZpYXRpb24gPSByZXF1aXJlKCcuL3NhbXBsZV9zdGFuZGFyZF9kZXZpYXRpb24nKTtcblxuLyoqXG4gKiBbU2tld25lc3NdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2tld25lc3MpIGlzXG4gKiBhIG1lYXN1cmUgb2YgdGhlIGV4dGVudCB0byB3aGljaCBhIHByb2JhYmlsaXR5IGRpc3RyaWJ1dGlvbiBvZiBhXG4gKiByZWFsLXZhbHVlZCByYW5kb20gdmFyaWFibGUgXCJsZWFuc1wiIHRvIG9uZSBzaWRlIG9mIHRoZSBtZWFuLlxuICogVGhlIHNrZXduZXNzIHZhbHVlIGNhbiBiZSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSwgb3IgZXZlbiB1bmRlZmluZWQuXG4gKlxuICogSW1wbGVtZW50YXRpb24gaXMgYmFzZWQgb24gdGhlIGFkanVzdGVkIEZpc2hlci1QZWFyc29uIHN0YW5kYXJkaXplZFxuICogbW9tZW50IGNvZWZmaWNpZW50LCB3aGljaCBpcyB0aGUgdmVyc2lvbiBmb3VuZCBpbiBFeGNlbCBhbmQgc2V2ZXJhbFxuICogc3RhdGlzdGljYWwgcGFja2FnZXMgaW5jbHVkaW5nIE1pbml0YWIsIFNBUyBhbmQgU1BTUy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHNhbXBsZSBza2V3bmVzc1xuICogQGV4YW1wbGVcbiAqIHZhciBkYXRhID0gWzIsIDQsIDYsIDMsIDFdO1xuICogc2FtcGxlU2tld25lc3MoZGF0YSk7IC8vPSAwLjU5MDEyODY1NjRcbiAqL1xuZnVuY3Rpb24gc2FtcGxlU2tld25lc3MoeCkge1xuICAgIC8vIFRoZSBza2V3bmVzcyBvZiBsZXNzIHRoYW4gdGhyZWUgYXJndW1lbnRzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPCAzKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICB2YXIgbiA9IHgubGVuZ3RoLFxuICAgICAgICBjdWJlZFMgPSBNYXRoLnBvdyhzYW1wbGVTdGFuZGFyZERldmlhdGlvbih4KSwgMyksXG4gICAgICAgIHN1bUN1YmVkRGV2aWF0aW9ucyA9IHN1bU50aFBvd2VyRGV2aWF0aW9ucyh4LCAzKTtcblxuICAgIHJldHVybiBuICogc3VtQ3ViZWREZXZpYXRpb25zIC8gKChuIC0gMSkgKiAobiAtIDIpICogY3ViZWRTKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW1wbGVTa2V3bmVzcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNhbXBsZVZhcmlhbmNlID0gcmVxdWlyZSgnLi9zYW1wbGVfdmFyaWFuY2UnKTtcblxuLyoqXG4gKiBUaGUgW3N0YW5kYXJkIGRldmlhdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdGFuZGFyZF9kZXZpYXRpb24pXG4gKiBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhcmlhbmNlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dCBhcnJheVxuICogQHJldHVybnMge251bWJlcn0gc2FtcGxlIHN0YW5kYXJkIGRldmlhdGlvblxuICogQGV4YW1wbGVcbiAqIHNzLnNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uKFsyLCA0LCA0LCA0LCA1LCA1LCA3LCA5XSk7XG4gKiAvLz0gMi4xMzhcbiAqL1xuZnVuY3Rpb24gc2FtcGxlU3RhbmRhcmREZXZpYXRpb24oeCkge1xuICAgIC8vIFRoZSBzdGFuZGFyZCBkZXZpYXRpb24gb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoIDw9IDEpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiBNYXRoLnNxcnQoc2FtcGxlVmFyaWFuY2UoeCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3VtTnRoUG93ZXJEZXZpYXRpb25zID0gcmVxdWlyZSgnLi9zdW1fbnRoX3Bvd2VyX2RldmlhdGlvbnMnKTtcblxuLypcbiAqIFRoZSBbc2FtcGxlIHZhcmlhbmNlXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9WYXJpYW5jZSNTYW1wbGVfdmFyaWFuY2UpXG4gKiBpcyB0aGUgc3VtIG9mIHNxdWFyZWQgZGV2aWF0aW9ucyBmcm9tIHRoZSBtZWFuLiBUaGUgc2FtcGxlIHZhcmlhbmNlXG4gKiBpcyBkaXN0aW5ndWlzaGVkIGZyb20gdGhlIHZhcmlhbmNlIGJ5IHRoZSB1c2FnZSBvZiBbQmVzc2VsJ3MgQ29ycmVjdGlvbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmVzc2VsJ3NfY29ycmVjdGlvbik6XG4gKiBpbnN0ZWFkIG9mIGRpdmlkaW5nIHRoZSBzdW0gb2Ygc3F1YXJlZCBkZXZpYXRpb25zIGJ5IHRoZSBsZW5ndGggb2YgdGhlIGlucHV0LFxuICogaXQgaXMgZGl2aWRlZCBieSB0aGUgbGVuZ3RoIG1pbnVzIG9uZS4gVGhpcyBjb3JyZWN0cyB0aGUgYmlhcyBpbiBlc3RpbWF0aW5nXG4gKiBhIHZhbHVlIGZyb20gYSBzZXQgdGhhdCB5b3UgZG9uJ3Qga25vdyBpZiBmdWxsLlxuICpcbiAqIFJlZmVyZW5jZXM6XG4gKiAqIFtXb2xmcmFtIE1hdGhXb3JsZCBvbiBTYW1wbGUgVmFyaWFuY2VdKGh0dHA6Ly9tYXRod29ybGQud29sZnJhbS5jb20vU2FtcGxlVmFyaWFuY2UuaHRtbClcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXQgYXJyYXlcbiAqIEByZXR1cm4ge251bWJlcn0gc2FtcGxlIHZhcmlhbmNlXG4gKiBAZXhhbXBsZVxuICogc2FtcGxlVmFyaWFuY2UoWzEsIDIsIDMsIDQsIDVdKTsgLy89IDIuNVxuICovXG5mdW5jdGlvbiBzYW1wbGVWYXJpYW5jZSh4KSB7XG4gICAgLy8gVGhlIHZhcmlhbmNlIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA8PSAxKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICB2YXIgc3VtU3F1YXJlZERldmlhdGlvbnNWYWx1ZSA9IHN1bU50aFBvd2VyRGV2aWF0aW9ucyh4LCAyKTtcblxuICAgIC8vIHRoaXMgaXMgQmVzc2VscycgQ29ycmVjdGlvbjogYW4gYWRqdXN0bWVudCBtYWRlIHRvIHNhbXBsZSBzdGF0aXN0aWNzXG4gICAgLy8gdGhhdCBhbGxvd3MgZm9yIHRoZSByZWR1Y2VkIGRlZ3JlZSBvZiBmcmVlZG9tIGVudGFpbGVkIGluIGNhbGN1bGF0aW5nXG4gICAgLy8gdmFsdWVzIGZyb20gc2FtcGxlcyByYXRoZXIgdGhhbiBjb21wbGV0ZSBwb3B1bGF0aW9ucy5cbiAgICB2YXIgYmVzc2Vsc0NvcnJlY3Rpb24gPSB4Lmxlbmd0aCAtIDE7XG5cbiAgICAvLyBGaW5kIHRoZSBtZWFuIHZhbHVlIG9mIHRoYXQgbGlzdFxuICAgIHJldHVybiBzdW1TcXVhcmVkRGV2aWF0aW9uc1ZhbHVlIC8gYmVzc2Vsc0NvcnJlY3Rpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2FtcGxlVmFyaWFuY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzaHVmZmxlSW5QbGFjZSA9IHJlcXVpcmUoJy4vc2h1ZmZsZV9pbl9wbGFjZScpO1xuXG4vKlxuICogQSBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVyJUUyJTgwJTkzWWF0ZXNfc2h1ZmZsZSlcbiAqIGlzIGEgZmFzdCB3YXkgdG8gY3JlYXRlIGEgcmFuZG9tIHBlcm11dGF0aW9uIG9mIGEgZmluaXRlIHNldC4gVGhpcyBpc1xuICogYSBmdW5jdGlvbiBhcm91bmQgYHNodWZmbGVfaW5fcGxhY2VgIHRoYXQgYWRkcyB0aGUgZ3VhcmFudGVlIHRoYXRcbiAqIGl0IHdpbGwgbm90IG1vZGlmeSBpdHMgaW5wdXQuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gc2FtcGxlIGFuIGFycmF5IG9mIGFueSBraW5kIG9mIGVsZW1lbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyYW5kb21Tb3VyY2U9TWF0aC5yYW5kb21dIGFuIG9wdGlvbmFsIGVudHJvcHkgc291cmNlXG4gKiBAcmV0dXJuIHtBcnJheX0gc2h1ZmZsZWQgdmVyc2lvbiBvZiBpbnB1dFxuICogQGV4YW1wbGVcbiAqIHZhciBzaHVmZmxlZCA9IHNodWZmbGUoWzEsIDIsIDMsIDRdKTtcbiAqIHNodWZmbGVkOyAvLyA9IFsyLCAzLCAxLCA0XSBvciBhbnkgb3RoZXIgcmFuZG9tIHBlcm11dGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHNodWZmbGUoc2FtcGxlLCByYW5kb21Tb3VyY2UpIHtcbiAgICAvLyBzbGljZSB0aGUgb3JpZ2luYWwgYXJyYXkgc28gdGhhdCBpdCBpcyBub3QgbW9kaWZpZWRcbiAgICBzYW1wbGUgPSBzYW1wbGUuc2xpY2UoKTtcblxuICAgIC8vIGFuZCB0aGVuIHNodWZmbGUgdGhhdCBzaGFsbG93LWNvcGllZCBhcnJheSwgaW4gcGxhY2VcbiAgICByZXR1cm4gc2h1ZmZsZUluUGxhY2Uoc2FtcGxlLnNsaWNlKCksIHJhbmRvbVNvdXJjZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2h1ZmZsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIEEgW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlciVFMiU4MCU5M1lhdGVzX3NodWZmbGUpXG4gKiBpbi1wbGFjZSAtIHdoaWNoIG1lYW5zIHRoYXQgaXQgKip3aWxsIGNoYW5nZSB0aGUgb3JkZXIgb2YgdGhlIG9yaWdpbmFsXG4gKiBhcnJheSBieSByZWZlcmVuY2UqKi5cbiAqXG4gKiBUaGlzIGlzIGFuIGFsZ29yaXRobSB0aGF0IGdlbmVyYXRlcyBhIHJhbmRvbSBbcGVybXV0YXRpb25dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Blcm11dGF0aW9uKVxuICogb2YgYSBzZXQuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gc2FtcGxlIGlucHV0IGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmFuZG9tU291cmNlPU1hdGgucmFuZG9tXSBhbiBvcHRpb25hbCBzb3VyY2Ugb2YgZW50cm9weVxuICogQHJldHVybnMge0FycmF5fSBzYW1wbGVcbiAqIEBleGFtcGxlXG4gKiB2YXIgc2FtcGxlID0gWzEsIDIsIDMsIDRdO1xuICogc2h1ZmZsZUluUGxhY2Uoc2FtcGxlKTtcbiAqIC8vIHNhbXBsZSBpcyBzaHVmZmxlZCB0byBhIHZhbHVlIGxpa2UgWzIsIDEsIDQsIDNdXG4gKi9cbmZ1bmN0aW9uIHNodWZmbGVJblBsYWNlKHNhbXBsZSwgcmFuZG9tU291cmNlKSB7XG5cbiAgICAvLyBhIGN1c3RvbSByYW5kb20gbnVtYmVyIHNvdXJjZSBjYW4gYmUgcHJvdmlkZWQgaWYgeW91IHdhbnQgdG8gdXNlXG4gICAgLy8gYSBmaXhlZCBzZWVkIG9yIGFub3RoZXIgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IsIGxpa2VcbiAgICAvLyBbcmFuZG9tLWpzXShodHRwczovL3d3dy5ucG1qcy5vcmcvcGFja2FnZS9yYW5kb20tanMpXG4gICAgcmFuZG9tU291cmNlID0gcmFuZG9tU291cmNlIHx8IE1hdGgucmFuZG9tO1xuXG4gICAgLy8gc3RvcmUgdGhlIGN1cnJlbnQgbGVuZ3RoIG9mIHRoZSBzYW1wbGUgdG8gZGV0ZXJtaW5lXG4gICAgLy8gd2hlbiBubyBlbGVtZW50cyByZW1haW4gdG8gc2h1ZmZsZS5cbiAgICB2YXIgbGVuZ3RoID0gc2FtcGxlLmxlbmd0aDtcblxuICAgIC8vIHRlbXBvcmFyeSBpcyB1c2VkIHRvIGhvbGQgYW4gaXRlbSB3aGVuIGl0IGlzIGJlaW5nXG4gICAgLy8gc3dhcHBlZCBiZXR3ZWVuIGluZGljZXMuXG4gICAgdmFyIHRlbXBvcmFyeTtcblxuICAgIC8vIFRoZSBpbmRleCB0byBzd2FwIGF0IGVhY2ggc3RhZ2UuXG4gICAgdmFyIGluZGV4O1xuXG4gICAgLy8gV2hpbGUgdGhlcmUgYXJlIHN0aWxsIGl0ZW1zIHRvIHNodWZmbGVcbiAgICB3aGlsZSAobGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBjaG9zZSBhIHJhbmRvbSBpbmRleCB3aXRoaW4gdGhlIHN1YnNldCBvZiB0aGUgYXJyYXlcbiAgICAgICAgLy8gdGhhdCBpcyBub3QgeWV0IHNodWZmbGVkXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihyYW5kb21Tb3VyY2UoKSAqIGxlbmd0aC0tKTtcblxuICAgICAgICAvLyBzdG9yZSB0aGUgdmFsdWUgdGhhdCB3ZSdsbCBtb3ZlIHRlbXBvcmFyaWx5XG4gICAgICAgIHRlbXBvcmFyeSA9IHNhbXBsZVtsZW5ndGhdO1xuXG4gICAgICAgIC8vIHN3YXAgdGhlIHZhbHVlIGF0IGBzYW1wbGVbbGVuZ3RoXWAgd2l0aCBgc2FtcGxlW2luZGV4XWBcbiAgICAgICAgc2FtcGxlW2xlbmd0aF0gPSBzYW1wbGVbaW5kZXhdO1xuICAgICAgICBzYW1wbGVbaW5kZXhdID0gdGVtcG9yYXJ5O1xuICAgIH1cblxuICAgIHJldHVybiBzYW1wbGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2h1ZmZsZUluUGxhY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRm9yIGEgc29ydGVkIGlucHV0LCBjb3VudGluZyB0aGUgbnVtYmVyIG9mIHVuaXF1ZSB2YWx1ZXNcbiAqIGlzIHBvc3NpYmxlIGluIGNvbnN0YW50IHRpbWUgYW5kIGNvbnN0YW50IG1lbW9yeS4gVGhpcyBpc1xuICogYSBzaW1wbGUgaW1wbGVtZW50YXRpb24gb2YgdGhlIGFsZ29yaXRobS5cbiAqXG4gKiBWYWx1ZXMgYXJlIGNvbXBhcmVkIHdpdGggYD09PWAsIHNvIG9iamVjdHMgYW5kIG5vbi1wcmltaXRpdmUgb2JqZWN0c1xuICogYXJlIG5vdCBoYW5kbGVkIGluIGFueSBzcGVjaWFsIHdheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBpbnB1dCBhbiBhcnJheSBvZiBwcmltaXRpdmUgdmFsdWVzLlxuICogQHJldHVybnMge251bWJlcn0gY291bnQgb2YgdW5pcXVlIHZhbHVlc1xuICogQGV4YW1wbGVcbiAqIHNvcnRlZFVuaXF1ZUNvdW50KFsxLCAyLCAzXSk7IC8vIDNcbiAqIHNvcnRlZFVuaXF1ZUNvdW50KFsxLCAxLCAxXSk7IC8vIDFcbiAqL1xuZnVuY3Rpb24gc29ydGVkVW5pcXVlQ291bnQoaW5wdXQpIHtcbiAgICB2YXIgdW5pcXVlVmFsdWVDb3VudCA9IDAsXG4gICAgICAgIGxhc3RTZWVuVmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSA9PT0gMCB8fCBpbnB1dFtpXSAhPT0gbGFzdFNlZW5WYWx1ZSkge1xuICAgICAgICAgICAgbGFzdFNlZW5WYWx1ZSA9IGlucHV0W2ldO1xuICAgICAgICAgICAgdW5pcXVlVmFsdWVDb3VudCsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmlxdWVWYWx1ZUNvdW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNvcnRlZFVuaXF1ZUNvdW50O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmFyaWFuY2UgPSByZXF1aXJlKCcuL3ZhcmlhbmNlJyk7XG5cbi8qKlxuICogVGhlIFtzdGFuZGFyZCBkZXZpYXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3RhbmRhcmRfZGV2aWF0aW9uKVxuICogaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YXJpYW5jZS4gSXQncyB1c2VmdWwgZm9yIG1lYXN1cmluZyB0aGUgYW1vdW50XG4gKiBvZiB2YXJpYXRpb24gb3IgZGlzcGVyc2lvbiBpbiBhIHNldCBvZiB2YWx1ZXMuXG4gKlxuICogU3RhbmRhcmQgZGV2aWF0aW9uIGlzIG9ubHkgYXBwcm9wcmlhdGUgZm9yIGZ1bGwtcG9wdWxhdGlvbiBrbm93bGVkZ2U6IGZvclxuICogc2FtcGxlcyBvZiBhIHBvcHVsYXRpb24sIHtAbGluayBzYW1wbGVTdGFuZGFyZERldmlhdGlvbn0gaXNcbiAqIG1vcmUgYXBwcm9wcmlhdGUuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzdGFuZGFyZCBkZXZpYXRpb25cbiAqIEBleGFtcGxlXG4gKiB2YXIgc2NvcmVzID0gWzIsIDQsIDQsIDQsIDUsIDUsIDcsIDldO1xuICogdmFyaWFuY2Uoc2NvcmVzKTsgLy89IDRcbiAqIHN0YW5kYXJkRGV2aWF0aW9uKHNjb3Jlcyk7IC8vPSAyXG4gKi9cbmZ1bmN0aW9uIHN0YW5kYXJkRGV2aWF0aW9uKHgpIHtcbiAgICAvLyBUaGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgcmV0dXJuIE1hdGguc3FydCh2YXJpYW5jZSh4KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhbmRhcmREZXZpYXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTUVJUXzJQSSA9IE1hdGguc3FydCgyICogTWF0aC5QSSk7XG5cbmZ1bmN0aW9uIGN1bXVsYXRpdmVEaXN0cmlidXRpb24oeikge1xuICAgIHZhciBzdW0gPSB6LFxuICAgICAgICB0bXAgPSB6O1xuXG4gICAgLy8gMTUgaXRlcmF0aW9ucyBhcmUgZW5vdWdoIGZvciA0LWRpZ2l0IHByZWNpc2lvblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgMTU7IGkrKykge1xuICAgICAgICB0bXAgKj0geiAqIHogLyAoMiAqIGkgKyAxKTtcbiAgICAgICAgc3VtICs9IHRtcDtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKDAuNSArIChzdW0gLyBTUVJUXzJQSSkgKiBNYXRoLmV4cCgteiAqIHogLyAyKSkgKiAxZTQpIC8gMWU0O1xufVxuXG4vKipcbiAqIEEgc3RhbmRhcmQgbm9ybWFsIHRhYmxlLCBhbHNvIGNhbGxlZCB0aGUgdW5pdCBub3JtYWwgdGFibGUgb3IgWiB0YWJsZSxcbiAqIGlzIGEgbWF0aGVtYXRpY2FsIHRhYmxlIGZvciB0aGUgdmFsdWVzIG9mIM6mIChwaGkpLCB3aGljaCBhcmUgdGhlIHZhbHVlcyBvZlxuICogdGhlIGN1bXVsYXRpdmUgZGlzdHJpYnV0aW9uIGZ1bmN0aW9uIG9mIHRoZSBub3JtYWwgZGlzdHJpYnV0aW9uLlxuICogSXQgaXMgdXNlZCB0byBmaW5kIHRoZSBwcm9iYWJpbGl0eSB0aGF0IGEgc3RhdGlzdGljIGlzIG9ic2VydmVkIGJlbG93LFxuICogYWJvdmUsIG9yIGJldHdlZW4gdmFsdWVzIG9uIHRoZSBzdGFuZGFyZCBub3JtYWwgZGlzdHJpYnV0aW9uLCBhbmQgYnlcbiAqIGV4dGVuc2lvbiwgYW55IG5vcm1hbCBkaXN0cmlidXRpb24uXG4gKlxuICogVGhlIHByb2JhYmlsaXRpZXMgYXJlIGNhbGN1bGF0ZWQgdXNpbmcgdGhlXG4gKiBbQ3VtdWxhdGl2ZSBkaXN0cmlidXRpb24gZnVuY3Rpb25dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05vcm1hbF9kaXN0cmlidXRpb24jQ3VtdWxhdGl2ZV9kaXN0cmlidXRpb25fZnVuY3Rpb24pLlxuICogVGhlIHRhYmxlIHVzZWQgaXMgdGhlIGN1bXVsYXRpdmUsIGFuZCBub3QgY3VtdWxhdGl2ZSBmcm9tIDAgdG8gbWVhblxuICogKGV2ZW4gdGhvdWdoIHRoZSBsYXR0ZXIgaGFzIDUgZGlnaXRzIHByZWNpc2lvbiwgaW5zdGVhZCBvZiA0KS5cbiAqL1xudmFyIHN0YW5kYXJkTm9ybWFsVGFibGUgPSBbXTtcblxuZm9yICh2YXIgeiA9IDA7IHogPD0gMy4wOTsgeiArPSAwLjAxKSB7XG4gICAgc3RhbmRhcmROb3JtYWxUYWJsZS5wdXNoKGN1bXVsYXRpdmVEaXN0cmlidXRpb24oeikpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YW5kYXJkTm9ybWFsVGFibGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFtzdW1dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N1bW1hdGlvbikgb2YgYW4gYXJyYXlcbiAqIGlzIHRoZSByZXN1bHQgb2YgYWRkaW5nIGFsbCBudW1iZXJzIHRvZ2V0aGVyLCBzdGFydGluZyBmcm9tIHplcm8uXG4gKlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm4ge251bWJlcn0gc3VtIG9mIGFsbCBpbnB1dCBudW1iZXJzXG4gKiBAZXhhbXBsZVxuICogY29uc29sZS5sb2coc3VtKFsxLCAyLCAzXSkpOyAvLyA2XG4gKi9cbmZ1bmN0aW9uIHN1bSh4KSB7XG4gICAgdmFyIHZhbHVlID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgKz0geFtpXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN1bTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lYW4gPSByZXF1aXJlKCcuL21lYW4nKTtcblxuLyoqXG4gKiBUaGUgc3VtIG9mIGRldmlhdGlvbnMgdG8gdGhlIE50aCBwb3dlci5cbiAqIFdoZW4gbj0yIGl0J3MgdGhlIHN1bSBvZiBzcXVhcmVkIGRldmlhdGlvbnMuXG4gKiBXaGVuIG49MyBpdCdzIHRoZSBzdW0gb2YgY3ViZWQgZGV2aWF0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHhcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIHBvd2VyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzdW0gb2YgbnRoIHBvd2VyIGRldmlhdGlvbnNcbiAqIEBleGFtcGxlXG4gKiB2YXIgaW5wdXQgPSBbMSwgMiwgM107XG4gKiAvLyBzaW5jZSB0aGUgdmFyaWFuY2Ugb2YgYSBzZXQgaXMgdGhlIG1lYW4gc3F1YXJlZFxuICogLy8gZGV2aWF0aW9ucywgd2UgY2FuIGNhbGN1bGF0ZSB0aGF0IHdpdGggc3VtTnRoUG93ZXJEZXZpYXRpb25zOlxuICogdmFyIHZhcmlhbmNlID0gc3VtTnRoUG93ZXJEZXZpYXRpb25zKGlucHV0KSAvIGlucHV0Lmxlbmd0aDtcbiAqL1xuZnVuY3Rpb24gc3VtTnRoUG93ZXJEZXZpYXRpb25zKHgsIG4pIHtcbiAgICB2YXIgbWVhblZhbHVlID0gbWVhbih4KSxcbiAgICAgICAgc3VtID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdW0gKz0gTWF0aC5wb3coeFtpXSAtIG1lYW5WYWx1ZSwgbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1bTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdW1OdGhQb3dlckRldmlhdGlvbnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdGFuZGFyZERldmlhdGlvbiA9IHJlcXVpcmUoJy4vc3RhbmRhcmRfZGV2aWF0aW9uJyk7XG52YXIgbWVhbiA9IHJlcXVpcmUoJy4vbWVhbicpO1xuXG4vKipcbiAqIFRoaXMgaXMgdG8gY29tcHV0ZSBbYSBvbmUtc2FtcGxlIHQtdGVzdF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3R1ZGVudCUyN3NfdC10ZXN0I09uZS1zYW1wbGVfdC10ZXN0KSwgY29tcGFyaW5nIHRoZSBtZWFuXG4gKiBvZiBhIHNhbXBsZSB0byBhIGtub3duIHZhbHVlLCB4LlxuICpcbiAqIGluIHRoaXMgY2FzZSwgd2UncmUgdHJ5aW5nIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZVxuICogcG9wdWxhdGlvbiBtZWFuIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSB0aGF0IHdlIGtub3csIHdoaWNoIGlzIGB4YFxuICogaGVyZS4gdXN1YWxseSB0aGUgcmVzdWx0cyBoZXJlIGFyZSB1c2VkIHRvIGxvb2sgdXAgYVxuICogW3AtdmFsdWVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUC12YWx1ZSksIHdoaWNoLCBmb3JcbiAqIGEgY2VydGFpbiBsZXZlbCBvZiBzaWduaWZpY2FuY2UsIHdpbGwgbGV0IHlvdSBkZXRlcm1pbmUgdGhhdCB0aGVcbiAqIG51bGwgaHlwb3RoZXNpcyBjYW4gb3IgY2Fubm90IGJlIHJlamVjdGVkLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gc2FtcGxlIGFuIGFycmF5IG9mIG51bWJlcnMgYXMgaW5wdXRcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IGV4cGVjdGVkIHZhbGUgb2YgdGhlIHBvcHVsYXRpb24gbWVhblxuICogQHJldHVybnMge251bWJlcn0gdmFsdWVcbiAqIEBleGFtcGxlXG4gKiB0VGVzdChbMSwgMiwgMywgNCwgNSwgNl0sIDMuMzg1KTsgLy89IDAuMTY0OTQxNTRcbiAqL1xuZnVuY3Rpb24gdFRlc3Qoc2FtcGxlLCB4KSB7XG4gICAgLy8gVGhlIG1lYW4gb2YgdGhlIHNhbXBsZVxuICAgIHZhciBzYW1wbGVNZWFuID0gbWVhbihzYW1wbGUpO1xuXG4gICAgLy8gVGhlIHN0YW5kYXJkIGRldmlhdGlvbiBvZiB0aGUgc2FtcGxlXG4gICAgdmFyIHNkID0gc3RhbmRhcmREZXZpYXRpb24oc2FtcGxlKTtcblxuICAgIC8vIFNxdWFyZSByb290IHRoZSBsZW5ndGggb2YgdGhlIHNhbXBsZVxuICAgIHZhciByb290TiA9IE1hdGguc3FydChzYW1wbGUubGVuZ3RoKTtcblxuICAgIC8vIENvbXB1dGUgdGhlIGtub3duIHZhbHVlIGFnYWluc3QgdGhlIHNhbXBsZSxcbiAgICAvLyByZXR1cm5pbmcgdGhlIHQgdmFsdWVcbiAgICByZXR1cm4gKHNhbXBsZU1lYW4gLSB4KSAvIChzZCAvIHJvb3ROKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0VGVzdDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG1lYW4gPSByZXF1aXJlKCcuL21lYW4nKTtcbnZhciBzYW1wbGVWYXJpYW5jZSA9IHJlcXVpcmUoJy4vc2FtcGxlX3ZhcmlhbmNlJyk7XG5cbi8qKlxuICogVGhpcyBpcyB0byBjb21wdXRlIFt0d28gc2FtcGxlIHQtdGVzdF0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdHVkZW50J3NfdC10ZXN0KS5cbiAqIFRlc3RzIHdoZXRoZXIgXCJtZWFuKFgpLW1lYW4oWSkgPSBkaWZmZXJlbmNlXCIsIChcbiAqIGluIHRoZSBtb3N0IGNvbW1vbiBjYXNlLCB3ZSBvZnRlbiBoYXZlIGBkaWZmZXJlbmNlID09IDBgIHRvIHRlc3QgaWYgdHdvIHNhbXBsZXNcbiAqIGFyZSBsaWtlbHkgdG8gYmUgdGFrZW4gZnJvbSBwb3B1bGF0aW9ucyB3aXRoIHRoZSBzYW1lIG1lYW4gdmFsdWUpIHdpdGhcbiAqIG5vIHByaW9yIGtub3dsZWRnZSBvbiBzdGFuZGFyZCBkZXZpYXRpb25zIG9mIGJvdGggc2FtcGxlc1xuICogb3RoZXIgdGhhbiB0aGUgZmFjdCB0aGF0IHRoZXkgaGF2ZSB0aGUgc2FtZSBzdGFuZGFyZCBkZXZpYXRpb24uXG4gKlxuICogVXN1YWxseSB0aGUgcmVzdWx0cyBoZXJlIGFyZSB1c2VkIHRvIGxvb2sgdXAgYVxuICogW3AtdmFsdWVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUC12YWx1ZSksIHdoaWNoLCBmb3JcbiAqIGEgY2VydGFpbiBsZXZlbCBvZiBzaWduaWZpY2FuY2UsIHdpbGwgbGV0IHlvdSBkZXRlcm1pbmUgdGhhdCB0aGVcbiAqIG51bGwgaHlwb3RoZXNpcyBjYW4gb3IgY2Fubm90IGJlIHJlamVjdGVkLlxuICpcbiAqIGBkaWZmYCBjYW4gYmUgb21pdHRlZCBpZiBpdCBlcXVhbHMgMC5cbiAqXG4gKiBbVGhpcyBpcyB1c2VkIHRvIGNvbmZpcm0gb3IgZGVueV0oaHR0cDovL3d3dy5tb25hcmNobGFiLm9yZy9MYWIvUmVzZWFyY2gvU3RhdHMvMlNhbXBsZVQuYXNweClcbiAqIGEgbnVsbCBoeXBvdGhlc2lzIHRoYXQgdGhlIHR3byBwb3B1bGF0aW9ucyB0aGF0IGhhdmUgYmVlbiBzYW1wbGVkIGludG9cbiAqIGBzYW1wbGVYYCBhbmQgYHNhbXBsZVlgIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gc2FtcGxlWCBhIHNhbXBsZSBhcyBhbiBhcnJheSBvZiBudW1iZXJzXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHNhbXBsZVkgYSBzYW1wbGUgYXMgYW4gYXJyYXkgb2YgbnVtYmVyc1xuICogQHBhcmFtIHtudW1iZXJ9IFtkaWZmZXJlbmNlPTBdXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB0ZXN0IHJlc3VsdFxuICogQGV4YW1wbGVcbiAqIHNzLnRUZXN0VHdvU2FtcGxlKFsxLCAyLCAzLCA0XSwgWzMsIDQsIDUsIDZdLCAwKTsgLy89IC0yLjE5MDg5MDIzMDAyMDY2NDNcbiAqL1xuZnVuY3Rpb24gdFRlc3RUd29TYW1wbGUoc2FtcGxlWCwgc2FtcGxlWSwgZGlmZmVyZW5jZSkge1xuICAgIHZhciBuID0gc2FtcGxlWC5sZW5ndGgsXG4gICAgICAgIG0gPSBzYW1wbGVZLmxlbmd0aDtcblxuICAgIC8vIElmIGVpdGhlciBzYW1wbGUgZG9lc24ndCBhY3R1YWxseSBoYXZlIGFueSB2YWx1ZXMsIHdlIGNhbid0XG4gICAgLy8gY29tcHV0ZSB0aGlzIGF0IGFsbCwgc28gd2UgcmV0dXJuIGBudWxsYC5cbiAgICBpZiAoIW4gfHwgIW0pIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIGRlZmF1bHQgZGlmZmVyZW5jZSAobXUpIGlzIHplcm9cbiAgICBpZiAoIWRpZmZlcmVuY2UpIHtcbiAgICAgICAgZGlmZmVyZW5jZSA9IDA7XG4gICAgfVxuXG4gICAgdmFyIG1lYW5YID0gbWVhbihzYW1wbGVYKSxcbiAgICAgICAgbWVhblkgPSBtZWFuKHNhbXBsZVkpO1xuXG4gICAgdmFyIHdlaWdodGVkVmFyaWFuY2UgPSAoKG4gLSAxKSAqIHNhbXBsZVZhcmlhbmNlKHNhbXBsZVgpICtcbiAgICAgICAgKG0gLSAxKSAqIHNhbXBsZVZhcmlhbmNlKHNhbXBsZVkpKSAvIChuICsgbSAtIDIpO1xuXG4gICAgcmV0dXJuIChtZWFuWCAtIG1lYW5ZIC0gZGlmZmVyZW5jZSkgL1xuICAgICAgICBNYXRoLnNxcnQod2VpZ2h0ZWRWYXJpYW5jZSAqICgxIC8gbiArIDEgLyBtKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdFRlc3RUd29TYW1wbGU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdW1OdGhQb3dlckRldmlhdGlvbnMgPSByZXF1aXJlKCcuL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucycpO1xuXG4vKipcbiAqIFRoZSBbdmFyaWFuY2VdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVmFyaWFuY2UpXG4gKiBpcyB0aGUgc3VtIG9mIHNxdWFyZWQgZGV2aWF0aW9ucyBmcm9tIHRoZSBtZWFuLlxuICpcbiAqIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdmFyaWFuY2UsIG5vdCBzYW1wbGUgdmFyaWFuY2U6XG4gKiBzZWUgdGhlIGBzYW1wbGVWYXJpYW5jZWAgbWV0aG9kIGlmIHlvdSB3YW50IGEgc2FtcGxlIG1lYXN1cmUuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGEgcG9wdWxhdGlvblxuICogQHJldHVybnMge251bWJlcn0gdmFyaWFuY2U6IGEgdmFsdWUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHplcm8uXG4gKiB6ZXJvIGluZGljYXRlcyB0aGF0IGFsbCB2YWx1ZXMgYXJlIGlkZW50aWNhbC5cbiAqIEBleGFtcGxlXG4gKiBzcy52YXJpYW5jZShbMSwgMiwgMywgNCwgNSwgNl0pOyAvLz0gMi45MTdcbiAqL1xuZnVuY3Rpb24gdmFyaWFuY2UoeCkge1xuICAgIC8vIFRoZSB2YXJpYW5jZSBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIEZpbmQgdGhlIG1lYW4gb2Ygc3F1YXJlZCBkZXZpYXRpb25zIGJldHdlZW4gdGhlXG4gICAgLy8gbWVhbiB2YWx1ZSBhbmQgZWFjaCB2YWx1ZS5cbiAgICByZXR1cm4gc3VtTnRoUG93ZXJEZXZpYXRpb25zKHgsIDIpIC8geC5sZW5ndGg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdmFyaWFuY2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFtaLVNjb3JlLCBvciBTdGFuZGFyZCBTY29yZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdGFuZGFyZF9zY29yZSkuXG4gKlxuICogVGhlIHN0YW5kYXJkIHNjb3JlIGlzIHRoZSBudW1iZXIgb2Ygc3RhbmRhcmQgZGV2aWF0aW9ucyBhbiBvYnNlcnZhdGlvblxuICogb3IgZGF0dW0gaXMgYWJvdmUgb3IgYmVsb3cgdGhlIG1lYW4uIFRodXMsIGEgcG9zaXRpdmUgc3RhbmRhcmQgc2NvcmVcbiAqIHJlcHJlc2VudHMgYSBkYXR1bSBhYm92ZSB0aGUgbWVhbiwgd2hpbGUgYSBuZWdhdGl2ZSBzdGFuZGFyZCBzY29yZVxuICogcmVwcmVzZW50cyBhIGRhdHVtIGJlbG93IHRoZSBtZWFuLiBJdCBpcyBhIGRpbWVuc2lvbmxlc3MgcXVhbnRpdHlcbiAqIG9idGFpbmVkIGJ5IHN1YnRyYWN0aW5nIHRoZSBwb3B1bGF0aW9uIG1lYW4gZnJvbSBhbiBpbmRpdmlkdWFsIHJhd1xuICogc2NvcmUgYW5kIHRoZW4gZGl2aWRpbmcgdGhlIGRpZmZlcmVuY2UgYnkgdGhlIHBvcHVsYXRpb24gc3RhbmRhcmRcbiAqIGRldmlhdGlvbi5cbiAqXG4gKiBUaGUgei1zY29yZSBpcyBvbmx5IGRlZmluZWQgaWYgb25lIGtub3dzIHRoZSBwb3B1bGF0aW9uIHBhcmFtZXRlcnM7XG4gKiBpZiBvbmUgb25seSBoYXMgYSBzYW1wbGUgc2V0LCB0aGVuIHRoZSBhbmFsb2dvdXMgY29tcHV0YXRpb24gd2l0aFxuICogc2FtcGxlIG1lYW4gYW5kIHNhbXBsZSBzdGFuZGFyZCBkZXZpYXRpb24geWllbGRzIHRoZVxuICogU3R1ZGVudCdzIHQtc3RhdGlzdGljLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gKiBAcGFyYW0ge251bWJlcn0gbWVhblxuICogQHBhcmFtIHtudW1iZXJ9IHN0YW5kYXJkRGV2aWF0aW9uXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHogc2NvcmVcbiAqIEBleGFtcGxlXG4gKiBzcy56U2NvcmUoNzgsIDgwLCA1KTsgLy89IC0wLjRcbiAqL1xuZnVuY3Rpb24gelNjb3JlKHgsIG1lYW4sIHN0YW5kYXJkRGV2aWF0aW9uKSB7XG4gICAgcmV0dXJuICh4IC0gbWVhbikgLyBzdGFuZGFyZERldmlhdGlvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB6U2NvcmU7XG4iLCJcbid1c2Ugc3RyaWN0JztcblxuXG4vL2NlbGwuanNcblxuY2xhc3MgQ2VsbCB7XG4gIGNvbnN0cnVjdG9yKG0sIHIsIGcsIGIpIHtcbiAgICB0aGlzLm1vcnRvbiA9IG07XG4gICAgdGhpcy5yID0gcjtcbiAgICB0aGlzLmcgPSBnO1xuICAgIHRoaXMuYiA9IGI7XG4gICAgdGhpcy5sdW1pbmFuY2UgPSAoIDAuMjk4OTEyICogciArIDAuNTg2NjExICogZyArIDAuMTE0NDc4ICogYiApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbDtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vL2NlbGxzLmpzXG5cbmxldCBDZWxsID0gcmVxdWlyZSgnLi9jZWxsJyk7XG5sZXQgTW9ydG9uID0gcmVxdWlyZSgnLi9tb3J0b24nKTtcblxuY29uc3QgZmxvb3IgPSBNYXRoLmZsb29yO1xuY29uc3Qgcm91bmQgPSBNYXRoLnJvdW5kO1xuY29uc3QgcG93ID0gTWF0aC5wb3c7XG5cbmNsYXNzIENlbGxzIHtcbiAgY29uc3RydWN0b3IoZGF0YSwgd2lkdGgsIGhlaWdodCkge1xuICAgIGlmIChkYXRhLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGF0YSBsZW5ndGggaW5jb3JyZWN0LicpXG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IFtdO1xuICAgIHRoaXMubWVtID0ge307XG4gICAgdGhpcy5yZWdpc3RlcihkYXRhLCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuICByZWdpc3RlcihkYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0IHggPSAwO1xuICAgIGxldCB5ID0gMDtcbiAgICBsZXQgdSA9IHBvdygyLCBNb3J0b24uTUFYX0xWTCk7XG4gICAgY29uc29sZS50aW1lKCdyZWFkIGRhdGEnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgIGxldCByID0gZGF0YVtpXTtcbiAgICAgIGxldCBnID0gZGF0YVtpICsgMV07XG4gICAgICBsZXQgYiA9IGRhdGFbaSArIDJdO1xuICAgICAgbGV0IF94ID0gZmxvb3IoeCAvIHdpZHRoICogdSk7XG4gICAgICBsZXQgX3kgPSBmbG9vcih5IC8gaGVpZ2h0ICogdSk7XG4gICAgICBsZXQgbW9ydG9uID0gTW9ydG9uLmNyZWF0ZShfeCwgX3kpO1xuICAgICAgdGhpcy5kYXRhLnB1c2gobmV3IENlbGwobW9ydG9uLCByLCBnLCBiKSk7XG5cbiAgICAgIGlmICgrK3ggPT09IHdpZHRoKSB7XG4gICAgICAgIHggPSAwO1xuICAgICAgICB5Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUudGltZUVuZCgncmVhZCBkYXRhJyk7XG4gIH1cbiAgZmluZChsdmwsIG1vcnRvbikge1xuICAgIGxldCBmaWVsZCA9IHRoaXMuZGF0YTtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYgKHRoaXMubWVtW2x2bCAtIDFdICYmIHRoaXMubWVtW2x2bCAtIDFdW21vcnRvbiA+PiAyXSkge1xuICAgICAgZmllbGQgPSB0aGlzLm1lbVtsdmwgLSAxXVttb3J0b24gPj4gMl07XG4gICAgfVxuXG4gICAgcmVzdWx0ID0gZmllbGQuZmlsdGVyKChjZWxsKSA9PiB7XG4gICAgICByZXR1cm4gTW9ydG9uLmJlbG9uZ3MoY2VsbC5tb3J0b24sIG1vcnRvbiwgbHZsKTtcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5tZW1bbHZsXSkge1xuICAgICAgdGhpcy5tZW1bbHZsXSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIXRoaXMubWVtW2x2bF1bbW9ydG9uXSkge1xuICAgICAgdGhpcy5tZW1bbHZsXVttb3J0b25dID0gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbHM7XG4iLCJcbid1c2Ugc3RyaWN0JztcblxubGV0IE51bGxOb2RlID0gcmVxdWlyZShcIi4vbnVsbG5vZGVcIik7XG5cbi8vIExpbmVyIFF1YXRlcm5hcnkgTm9kZVxuXG5jbGFzcyBMUU5vZGUgZXh0ZW5kcyBOdWxsTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHIsIGcsIGIsIHJvLCBtb3J0b24sIGxldmVsKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMucm8gPSBybztcbiAgICB0aGlzLnIgPSByO1xuICAgIHRoaXMuZyA9IGc7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLm1vcnRvbiA9IG1vcnRvbjtcbiAgICB0aGlzLmxldmVsID0gbGV2ZWw7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMUU5vZGU7XG4iLCJcbid1c2Ugc3RyaWN0JztcblxuLy8gTGluZWFyIFF1YXRlcm5hcnkgVHJlZVxuXG5sZXQgTFFOb2RlID0gcmVxdWlyZShcIi4vbHFub2RlXCIpO1xubGV0IE51bGxOb2RlID0gcmVxdWlyZShcIi4vbnVsbG5vZGVcIik7XG5sZXQgTW9ydG9uID0gcmVxdWlyZShcIi4vbW9ydG9uXCIpO1xuXG5jb25zdCBmbG9vciA9IE1hdGguZmxvb3I7XG5jb25zdCBwb3cgPSBNYXRoLnBvdztcblxubGV0IG9mZnNldHMgPSBbXTtcblxuY2xhc3MgTFFUcmVlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tb3J0b24gPSAwO1xuICAgIHRoaXMucG9pbnRlciA9IDA7XG4gICAgdGhpcy5sZXZlbCA9IDA7XG4gICAgdGhpcy5tYXhQb2ludGVyID0gdGhpcy5nZXRPZmZzZXQoTW9ydG9uLk1BWF9MVkwgKyAxKTtcbiAgICB0aGlzLmRhdGEgPSBbXTtcbiAgfVxuICBhZGQobm9kZSkge1xuICAgIHRoaXMuZGF0YVt0aGlzLnBvaW50ZXJdID0gbm9kZTtcblxuICAgIHRoaXMucG9pbnRlcisrO1xuICAgIC8vIOODneOCpOODs+OCv+OBjOasoeOBruODrOODmeODq+OBruOCquODleOCu+ODg+ODiOOBq+mBlOOBl+OBn+OCieODrOODmeODq+OCkuS4iuOBkuOCi1xuICAgIGlmICh0aGlzLmdldE9mZnNldCh0aGlzLmxldmVsICsgMSkgPT09IHRoaXMucG9pbnRlcikge1xuICAgICAgdGhpcy5sZXZlbCsrO1xuICAgIH1cbiAgICB0aGlzLm1vcnRvbiA9IHRoaXMucG9pbnRlciAtIHRoaXMuZ2V0T2Zmc2V0KHRoaXMubGV2ZWwpO1xuICB9XG4gIGlzTWF4TGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWwgPT09IE1vcnRvbi5NQVhfTFZMO1xuICB9XG4gIGlzUG9pbnRlckV4Y2VlZGVkKCkge1xuICAgIHJldHVybiAhKHRoaXMubWF4UG9pbnRlciA+IHRoaXMucG9pbnRlcik7XG4gIH1cbiAgaXNSZWdpc3RlcmVkQnJhbmNoKCkge1xuICAgIGxldCBwYXJlbnREYXRhID0gdGhpcy5nZXRQYXJlbnREYXRhKCk7XG4gICAgcmV0dXJuIHBhcmVudERhdGEgPT09IG51bGwgfHwgcGFyZW50RGF0YSBpbnN0YW5jZW9mIExRTm9kZTtcbiAgfVxuICBnZXRQYXJlbnREYXRhKG1vcnRvbiwgbGV2ZWwpIHtcbiAgICBtb3J0b24gPSB0eXBlb2YgbW9ydG9uID09PSAnbnVtYmVyJyA/IG1vcnRvbiA6IHRoaXMubW9ydG9uO1xuICAgIGxldmVsID0gdHlwZW9mIGxldmVsID09PSAnbnVtYmVyJyA/IGxldmVsIDogdGhpcy5sZXZlbDtcblxuICAgIGlmIChsZXZlbCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBOdWxsTm9kZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXRhW3RoaXMuZ2V0T2Zmc2V0KGxldmVsIC0gMSkgKyAobW9ydG9uID4+IDIpXTtcbiAgfVxuICBnZXRPZmZzZXQobHZsKSB7XG4gICAgaWYgKCFvZmZzZXRzW2x2bF0pIHtcbiAgICAgIG9mZnNldHNbbHZsXSA9IGZsb29yKChwb3coNCwgbHZsKSAtIDEpIC8gKDQgLSAxKSk7XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRzW2x2bF07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMUVRyZWU7XG4iLCJcbid1c2Ugc3RyaWN0JztcblxuLy8gbWFpbi5qc1xuXG5yZXF1aXJlKFwibmF0aXZlLXByb21pc2Utb25seVwiKTtcblxubGV0IHNzID0gcmVxdWlyZShcInNpbXBsZS1zdGF0aXN0aWNzXCIpO1xubGV0IENvbG9yID0gcmVxdWlyZSgnY29sb3InKTtcblxubGV0IENlbGxzID0gcmVxdWlyZShcIi4vY2VsbHNcIik7XG5sZXQgTW9ydG9uID0gcmVxdWlyZShcIi4vbW9ydG9uXCIpO1xubGV0IExRVHJlZSA9IHJlcXVpcmUoXCIuL2xxdHJlZVwiKTtcbmxldCBMUU5vZGUgPSByZXF1aXJlKFwiLi9scW5vZGVcIik7XG5sZXQgTnVsbE5vZGUgPSByZXF1aXJlKFwiLi9udWxsbm9kZVwiKTtcblxuY29uc3QgcG93ID0gTWF0aC5wb3c7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoZSkgPT4ge1xuICAvL2NvbnNvbGUubG9nKCdFbnRyeSBwb2ludCcpO1xuICBsZXQgbG9hZGVkID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBzcmMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3JjJyk7XG4gICAgc3JjLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZSkgPT4ge1xuICAgICAgcmVzb2x2ZShzcmMpO1xuICAgIH0pO1xuICB9KTtcblxuICBsb2FkZWQudGhlbigoc3JjKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ2ltYWdlIHNyYyBsb2FkZWQuJyk7XG4gICAgbGV0IGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2Uuc3JjID0gc3JjLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG5cbiAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYWNlLWhvbGRlcicpO1xuICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG5cbiAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KTtcblxuICAgIGxldCBkYXRhQXJyID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwwLGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpLmRhdGE7XG5cbiAgICBsZXQgY2VsbHMgPSBuZXcgQ2VsbHMoZGF0YUFyciwgaW1hZ2Uud2lkdGgsIGltYWdlLmhlaWdodCk7XG4gICAgbGV0IHRyZWUgPSBuZXcgTFFUcmVlKCk7XG5cbiAgICBjb25zb2xlLnRpbWUoJ3JlZ2lzdGVyIGRhdGEnKTtcbiAgICB3aGlsZSghdHJlZS5pc1BvaW50ZXJFeGNlZWRlZCgpKSB7XG5cbiAgICAgIGlmICh0cmVlLmlzUmVnaXN0ZXJlZEJyYW5jaCgpKSB7XG4gICAgICAgIHRyZWUuYWRkKG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHRlbXAgPSBjZWxscy5maW5kKHRyZWUubGV2ZWwsIHRyZWUubW9ydG9uKTtcbiAgICAgICAgXG4gICAgICAgIC8vIHN0YW5kYXJkIGRldmlhdGlvbiBvZiBsdW1pbmFuY2VcbiAgICAgICAgbGV0IHJvID0gc3Muc3RhbmRhcmREZXZpYXRpb24odGVtcC5tYXAoKGNlbGwpID0+IGNlbGwubHVtaW5hbmNlKSk7XG5cbiAgICAgICAgaWYgKHJvIDwgMTggfHwgdHJlZS5pc01heExldmVsKCkpIHtcbiAgICAgICAgICBsZXQgbCA9IHRlbXAubGVuZ3RoO1xuXG4gICAgICAgICAgLy8gY29sb3IgYXZlcmFnZVxuICAgICAgICAgIGxldCByVG90YWwgPSAwO1xuICAgICAgICAgIGxldCBnVG90YWwgPSAwO1xuICAgICAgICAgIGxldCBiVG90YWwgPSAwO1xuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHJUb3RhbCArPSB0ZW1wW2ldLnI7XG4gICAgICAgICAgICBnVG90YWwgKz0gdGVtcFtpXS5nO1xuICAgICAgICAgICAgYlRvdGFsICs9IHRlbXBbaV0uYjtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdHJlZS5hZGQobmV3IExRTm9kZShyVG90YWwgLyBsLCBnVG90YWwgLyBsLCBiVG90YWwgLyBsLCBybywgdHJlZS5tb3J0b24sIHRyZWUubGV2ZWwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cmVlLmFkZChuZXcgTnVsbE5vZGUoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS50aW1lRW5kKCdyZWdpc3RlciBkYXRhJyk7XG5cbiAgICBsZXQgbWFnbmlmeSA9IDI7XG5cbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aCAqIG1hZ25pZnk7XG4gICAgY2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodCAqIG1hZ25pZnk7XG5cbiAgICBjb25zb2xlLnRpbWUoJ2RyYXcgZGF0YScpO1xuICAgIHRyZWUuZGF0YS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIExRTm9kZSkge1xuICAgICAgICBsZXQgY29sb3IgPSBDb2xvcigpLnJnYihbbm9kZS5yLCBub2RlLmcsIG5vZGUuYl0pXG4gICAgICAgIGxldCBwb3NpdGl2ZSA9IGByZ2IoJHtjb2xvci5zYXR1cmF0ZSgwLjUpLnJnYkFycmF5KCkuam9pbignLCcpfSlgO1xuICAgICAgICAvL2xldCBuZWdhdGl2ZSA9IGByZ2IoJHtjb2xvci5jbG9uZSgpLm5lZ2F0ZSgpLnJnYkFycmF5KCkuam9pbignLCcpfSlgO1xuICAgICAgICBsZXQgdyA9IGltYWdlLndpZHRoIC8gcG93KDIsIG5vZGUubGV2ZWwpO1xuICAgICAgICBsZXQgaCA9IGltYWdlLmhlaWdodCAvIHBvdygyLCBub2RlLmxldmVsKTtcbiAgICAgICAgbGV0IG0gPSBNb3J0b24ucmV2ZXJzZShub2RlLm1vcnRvbik7XG4gICAgICAgIGxldCBsZWZ0ID0gdyAqIG0ueCAqIG1hZ25pZnk7XG4gICAgICAgIGxldCByaWdodCA9IHcgKiBtLnggKiBtYWduaWZ5ICsgdyAqIG1hZ25pZnk7XG4gICAgICAgIGxldCB0b3AgPSBoICogbS55ICogbWFnbmlmeTtcbiAgICAgICAgbGV0IGJvdHRvbSA9IGggKiBtLnkgKiBtYWduaWZ5ICsgaCAqIG1hZ25pZnk7XG5cbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBwb3NpdGl2ZTtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChsZWZ0LCB0b3AsIHcgKiBtYWduaWZ5LCBoICogbWFnbmlmeSk7XG5cbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICcjRkZGJztcbiAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAwLjEgKiBtYWduaWZ5O1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhsZWZ0LCB0b3ApO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhyaWdodCwgYm90dG9tKTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8ocmlnaHQsIHRvcCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKGxlZnQsIGJvdHRvbSk7XG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS50aW1lRW5kKCdkcmF3IGRhdGEnKTtcbiAgfSk7XG59LCBmYWxzZSk7XG5cblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8vbW9ydG9uLmpzXG4vL21vcnRvbiBvcmRlciA8PT4geCwgeVxuXG4vL2h0dHA6Ly9kLmhhdGVuYS5uZS5qcC9yYW5tYXJ1NTAvMjAxMTExMDYvMTMyMDU1OTk1NVxuLy9odHRwOi8vbWFydXBla2UyOTYuY29tL0NPTF8yRF9ObzhfUXVhZFRyZWUuaHRtbFxuXG4vLyg0NSkudG9TdHJpbmcoMikgLy8gXCIxMDExMDFcIlxuLy8gMTAgPT4gMiA6IHBhcmVudCBwYXJlbnQgc3BhY2Vcbi8vIDExID0+IDMgOiBwYXJlbnQgc3BhY2Vcbi8vIDAxID0+IDEgOiBzZWxmIHNwYWNlXG5cbi8vIHl4XG4vLyAxMFxuXG4vKlxueVxceCAwICAxXG4gIC0tLS0tLS1cbjAgfDAwfDAxfFxuICAtLS0tLS0tXG4xIHwxMHwxMXxcbiAgLS0tLS0tLVxuKi9cblxuLy8gXCIxMDExMDFcIiBBTkQgXCIwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMVwiXG4vLyBcIjAwMDEwMVwiXG4vLyBcIjAxMDExMFwiIEFORCBcIjAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxXCJcbi8vIFwiMDEwMTAwXCJcblxuY2xhc3MgTW9ydG9uIHtcbiAgc3RhdGljIGNyZWF0ZSh4LCB5KSB7XG4gICAgcmV0dXJuIE1vcnRvbi5iaXRTZXBlcmF0ZTMyKHgpIHwgKE1vcnRvbi5iaXRTZXBlcmF0ZTMyKHkpIDw8IDEpO1xuICB9XG4gIHN0YXRpYyByZXZlcnNlKG4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogTW9ydG9uLmJpdFBhY2szMihuICYgMHg1NTU1NTU1NSksXG4gICAgICB5OiBNb3J0b24uYml0UGFjazMyKChuICYgMHhBQUFBQUFBQSkgPj4gMSlcbiAgICB9XG4gIH1cbiAgc3RhdGljIGJpdFNlcGVyYXRlMzIobikge1xuICAgIG4gPSAobiB8IChuIDw8IDgpKSAmIDB4MDBmZjAwZmY7XG4gICAgbiA9IChuIHwgKG4gPDwgNCkpICYgMHgwZjBmMGYwZjtcbiAgICBuID0gKG4gfCAobiA8PCAyKSkgJiAweDMzMzMzMzMzO1xuICAgIHJldHVybiAobiB8IChuIDw8IDEpKSAmIDB4NTU1NTU1NTU7XG4gIH1cbiAgc3RhdGljIGJpdFBhY2szMihuKSB7XG4gICAgbiA9IChuICYgMHgzMzMzMzMzMykgfCAoKG4gJiAweDQ0NDQ0NDQ0KSA+PiAxKTtcbiAgICBuID0gKG4gJiAweDBmMGYwZjBmKSB8ICgobiAmIDB4MzAzMDMwMzApID4+IDIpO1xuICAgIG4gPSAobiAmIDB4MDBmZjAwZmYpIHwgKChuICYgMHgwZjAwMGYwMCkgPj4gNCk7XG4gICAgcmV0dXJuIChuICYgMHgwMDAwZmZmZikgfCAoKG4gJiAweDAwZmYwMDAwKSA+PiA4KTtcbiAgfVxuICBzdGF0aWMgYmVsb25ncyhhLCBiLCBsdmwsIG1heCA9IE1vcnRvbi5NQVhfTFZMKSB7XG4gICAgcmV0dXJuIGEgPj4gKG1heCAtIGx2bCkgKiAyID09PSBiO1xuICB9XG59XG5cbk1vcnRvbi5NQVhfTFZMID0gODtcblxubW9kdWxlLmV4cG9ydHMgPSBNb3J0b247XG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBFbXB0eSBOb2RlXG5cbmNsYXNzIE51bGxOb2RlIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gTnVsbE5vZGU7XG4iXX0=
