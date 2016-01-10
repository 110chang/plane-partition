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

    this.morton = 0;
    this.pointer = 0;
    this.level = 0;
    this.maxPointer = this.getOffset(Morton.MAX_LVL + 1);
    this.data = [];
  }

  _createClass(LQTree, [{
    key: "isRegisteredBranch",
    value: function isRegisteredBranch() {
      var parentData = this.getParentData();
      return parentData === null || parentData instanceof LQNode;
    }
  }, {
    key: "add",
    value: function add(node) {
      this.data[this.pointer] = node;

      //最大レベルなら登録
      if (this.level === Morton.MAX_LVL) {
        this.data[this.pointer] = node;
      }

      this.pointer++;
      // ポインタが次のレベルのオフセットに達したらレベルを上げる
      if (this.getOffset(this.level + 1) === this.pointer) {
        this.level++;
      }
      this.morton = this.pointer - this.getOffset(this.level);
    }
  }, {
    key: "getParentMorton",
    value: function getParentMorton(morton, level) {
      morton = typeof morton === 'number' ? morton : this.morton;
      level = typeof level === 'number' ? level : this.level;
      return morton >> 2;
    }
  }, {
    key: "getParentData",
    value: function getParentData(morton, level) {
      morton = typeof morton === 'number' ? morton : this.morton;
      level = typeof level === 'number' ? level : this.level;

      if (level === 0) {
        return new NullNode();
      }
      //console.log(this.pointer, this.getMorton(), this.getOffset(level - 1) + (morton >> 2));
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
    key: "isPointerMax",
    value: function isPointerMax() {
      return !(this.maxPointer > this.pointer);
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

    var dataArr = context.getImageData(0, 0, image.width, image.height).data;

    if (dataArr.length % 4 !== 0) {
      throw new Error('data length incorrect.');
    }

    var cells = new Cells(dataArr, image.width, image.height);

    var tree = new LQTree(function (node) {
      return node.ro < 18;
    });
    var filter = function filter(node) {
      return node.ro < 18;
    };

    console.time('register data');
    while (!tree.isPointerMax()) {

      if (tree.isRegisteredBranch()) {
        tree.add(null);
      } else {
        var temp = cells.find(tree.level, tree.morton);

        // standard deviation of luminance
        var ro = ss.standardDeviation(temp.map(function (cell) {
          return cell.luminance;
        }));

        if (ro < 18 || tree.level === Morton.MAX_LVL) {
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

    console.time('draw data 1');
    tree.data.forEach(function (node) {
      if (node instanceof LQNode) {
        var color = Color().rgb([node.r, node.g, node.b]);
        var positive = "rgb(" + color.saturate(0.5).rgbArray().join(',') + ")";
        //let negative = `rgb(${color.clone().negate().rgbArray().join(',')})`;
        //let glow = `rgba(${color.clone().lighten(0.5).rgbArray().join(',')},0.2)`;
        //let vivid = `rgb(${color.clone().saturate(0.5).rgbArray().join(',')},0.2)`;
        var w = image.width / pow(2, node.level);
        var h = image.height / pow(2, node.level);
        var m = Morton.reverse(node.morton);
        var magnify = 1;
        var left = w * m.x * magnify;
        var right = w * m.x * magnify + w * magnify;
        var top = h * m.y * magnify;
        var bottom = h * m.y * magnify + h * magnify;

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
    tree.data.forEach(function (node) {
      if (node instanceof LQNode) {
        var color = Color().rgb([node.r, node.g, node.b]);
        var positive = "rgb(" + color.saturate(0.5).rgbArray().join(',') + ")";
        //let negative = `rgb(${color.clone().negate().rgbArray().join(',')})`;
        //let glow = `rgba(${color.clone().lighten(0.5).rgbArray().join(',')},0.2)`;
        //let vivid = `rgb(${color.clone().saturate(0.5).rgbArray().join(',')},0.2)`;
        var w = image.width / pow(2, node.level);
        var h = image.height / pow(2, node.level);
        var m = Morton.reverse(node.morton);
        var magnify = 2;
        var left = w * m.x * magnify;
        var right = w * m.x * magnify + w * magnify;
        var top = h * m.y * magnify;
        var bottom = h * m.y * magnify + h * magnify;

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

var spaceFilters = [];

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

      //let f = Math.pow(2, lvl * 2) - 1 << (max - lvl) * 2;
      //return ((a & f) >> (max - lvl) * 2) === b;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY29sb3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvY29udmVyc2lvbnMuanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLWNvbnZlcnQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9jb2xvci1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29sb3Ivbm9kZV9tb2R1bGVzL2NvbG9yLXN0cmluZy9ub2RlX21vZHVsZXMvY29sb3ItbmFtZS9pbmRleC5qc29uIiwibm9kZV9tb2R1bGVzL25hdGl2ZS1wcm9taXNlLW9ubHkvbGliL25wby5zcmMuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2JheWVzaWFuX2NsYXNzaWZpZXIuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Jlcm5vdWxsaV9kaXN0cmlidXRpb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Jpbm9taWFsX2Rpc3RyaWJ1dGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvY2hpX3NxdWFyZWRfZGlzdHJpYnV0aW9uX3RhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9jaGlfc3F1YXJlZF9nb29kbmVzc19vZl9maXQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2NodW5rLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9ja21lYW5zLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9jdW11bGF0aXZlX3N0ZF9ub3JtYWxfcHJvYmFiaWxpdHkuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Vwc2lsb24uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2Vycm9yX2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9mYWN0b3JpYWwuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL2dlb21ldHJpY19tZWFuLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9oYXJtb25pY19tZWFuLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9pbnRlcnF1YXJ0aWxlX3JhbmdlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9pbnZlcnNlX2Vycm9yX2Z1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9saW5lYXJfcmVncmVzc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbGluZWFyX3JlZ3Jlc3Npb25fbGluZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbWFkLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9tYXguanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL21lYW4uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL21lZGlhbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbWluLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9taXhpbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbW9kZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvbnVtZXJpY19zb3J0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9wZXJjZXB0cm9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9wb2lzc29uX2Rpc3RyaWJ1dGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvcHJvYml0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9xdWFudGlsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvcXVhbnRpbGVfc29ydGVkLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9yX3NxdWFyZWQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3Jvb3RfbWVhbl9zcXVhcmUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc2FtcGxlX2NvcnJlbGF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfY292YXJpYW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc2FtcGxlX3NrZXduZXNzLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfc3RhbmRhcmRfZGV2aWF0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zYW1wbGVfdmFyaWFuY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NodWZmbGUuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NodWZmbGVfaW5fcGxhY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3NvcnRlZF91bmlxdWVfY291bnQuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3N0YW5kYXJkX2RldmlhdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvc3RhbmRhcmRfbm9ybWFsX3RhYmxlLmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy9zdW0uanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucy5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvdF90ZXN0LmpzIiwibm9kZV9tb2R1bGVzL3NpbXBsZS1zdGF0aXN0aWNzL3NyYy90X3Rlc3RfdHdvX3NhbXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9zaW1wbGUtc3RhdGlzdGljcy9zcmMvdmFyaWFuY2UuanMiLCJub2RlX21vZHVsZXMvc2ltcGxlLXN0YXRpc3RpY3Mvc3JjL3pfc2NvcmUuanMiLCJzcmMvanMvY2VsbC5qcyIsInNyYy9qcy9jZWxscy5qcyIsInNyYy9qcy9scW5vZGUuanMiLCJzcmMvanMvbHF0cmVlLmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvbW9ydG9uLmpzIiwic3JjL2pzL251bGxub2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdCQSxZQUFZOzs7O0FBQUM7O0lBS1AsSUFBSSxHQUNSLFNBREksSUFBSSxDQUNJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTt3QkFEcEIsSUFBSTs7QUFFTixNQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixNQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLE1BQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsTUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxNQUFJLENBQUMsU0FBUyxHQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxBQUFFLENBQUM7Q0FDakU7O0FBR0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Ozs7QUNmdEIsWUFBWTs7OztBQUFDOzs7O0FBSWIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7O0lBRWIsS0FBSztBQUNULFdBREksS0FBSyxDQUNHLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFOzBCQUQ3QixLQUFLOztBQUVQLFFBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLFlBQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtLQUMxQztBQUNELFFBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDZCxRQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDcEM7O2VBUkcsS0FBSzs7NkJBU0EsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDNUIsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsVUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsYUFBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMxQixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZDLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQixZQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsWUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUIsWUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0IsWUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFMUMsWUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDakIsV0FBQyxHQUFHLENBQUMsQ0FBQztBQUNOLFdBQUMsRUFBRSxDQUFDO1NBQ0w7T0FDRjtBQUNELGFBQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDOUI7Ozt5QkFDSSxHQUFHLEVBQUUsTUFBTSxFQUFFO0FBQ2hCLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdEIsVUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLFVBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ3ZELGFBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDeEM7QUFDRCxZQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBSztBQUM5QixlQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7T0FDakQsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7T0FDcEI7QUFDRCxVQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMxQixZQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQztPQUNoQztBQUNELGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztTQTlDRyxLQUFLOzs7QUFpRFgsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Ozs7QUM1RHZCLFlBQVksQ0FBQzs7Ozs7Ozs7QUFFYixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDOzs7O0FBQUMsSUFJL0IsTUFBTTtZQUFOLE1BQU07O0FBQ1YsV0FESSxNQUFNLENBQ0UsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7MEJBRHBDLE1BQU07O3VFQUFOLE1BQU07O0FBSVIsVUFBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2IsVUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsVUFBSyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFVBQUssS0FBSyxHQUFHLEtBQUssQ0FBQzs7R0FDcEI7O1NBVkcsTUFBTTtHQUFTLFFBQVE7O0FBYTdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7O0FDbkJ4QixZQUFZOzs7O0FBQUM7Ozs7QUFJYixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDOztBQUVuQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0lBRVgsTUFBTTtBQUNWLFdBREksTUFBTSxDQUNFLE1BQU0sRUFBRTswQkFEaEIsTUFBTTs7QUFFUixRQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtBQUNoQyxZQUFNLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDdEIsZUFBTyxJQUFJLENBQUM7T0FDYixDQUFBO0tBQ0Y7QUFDRCxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFckIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyRCxRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUNoQjs7ZUFkRyxNQUFNOzt5Q0FlVztBQUNuQixVQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEMsYUFBTyxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsWUFBWSxNQUFNLENBQUM7S0FDNUQ7Ozt3QkFDRyxJQUFJLEVBQUU7QUFDUixVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJOzs7QUFBQyxBQUcvQixVQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRTtBQUNqQyxZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUM7T0FDaEM7O0FBRUQsVUFBSSxDQUFDLE9BQU8sRUFBRTs7QUFBQyxBQUVmLFVBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDbkQsWUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2Q7QUFDRCxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekQ7OztvQ0FDZSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzdCLFlBQU0sR0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0QsV0FBSyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2RCxhQUFPLE1BQU0sSUFBSSxDQUFDLENBQUM7S0FDcEI7OztrQ0FDYSxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzNCLFlBQU0sR0FBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDM0QsV0FBSyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFdkQsVUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsZUFBTyxJQUFJLFFBQVEsRUFBRSxDQUFDO09BQ3ZCOztBQUFBLEFBRUQsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7S0FDN0Q7Ozs4QkFDUyxHQUFHLEVBQUU7QUFDYixVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2pCLGVBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxJQUFLLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7T0FDbkQ7QUFDRCxhQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNyQjs7O21DQUNjO0FBQ2IsYUFBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQSxBQUFDLENBQUM7S0FDMUM7OztTQXpERyxNQUFNOzs7QUE0RFosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Ozs7QUN6RXhCLFlBQVk7Ozs7QUFBQyxBQUliLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUUvQixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN0QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTdCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXJDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQzs7QUFFbkIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ25ELFNBQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0IsTUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVuQixNQUFJLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDNUMsUUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QyxPQUFHLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQ2xDLGFBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNkLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxRQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQ25CLFdBQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDM0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUN4QixTQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXBDLFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckQsVUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzNCLFVBQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFN0IsUUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxXQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUxRCxRQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDOztBQUV2RSxRQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUM1QixZQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUE7S0FDMUM7O0FBRUQsUUFBSSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUxRCxRQUFJLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFDLElBQUk7YUFBSyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUU7S0FBQSxDQUFDLENBQUM7QUFDOUMsUUFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksSUFBSTthQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRTtLQUFBLENBQUM7O0FBRXBDLFdBQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDOUIsV0FBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRTs7QUFFMUIsVUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtBQUM3QixZQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2hCLE1BQU07QUFDTCxZQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7O0FBQUMsQUFHL0MsWUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJO2lCQUFLLElBQUksQ0FBQyxTQUFTO1NBQUEsQ0FBQyxDQUFDLENBQUM7O0FBRWxFLFlBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUU7QUFDNUMsY0FBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU07OztBQUFDLEFBR3BCLGNBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLGNBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNmLGNBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFZixlQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFCLGtCQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixrQkFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsa0JBQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ3JCLENBQUM7O0FBRUYsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN2RixNQUFNO0FBQ0wsY0FBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDMUI7T0FDRjtLQUNGO0FBQ0QsV0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFakMsV0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1QixRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBSztBQUMxQixVQUFJLElBQUksWUFBWSxNQUFNLEVBQUU7QUFDMUIsWUFBSSxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pELFlBQUksUUFBUSxZQUFVLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFHOzs7O0FBQUMsQUFJbEUsWUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QyxZQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFDLFlBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLFlBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNoQixZQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDN0IsWUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDNUMsWUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzVCLFlBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDOztBQUU3QyxlQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEIsZUFBTyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDN0IsZUFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDOztBQUV0RCxlQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDcEIsZUFBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFDN0IsZUFBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDeEIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDMUIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0IsZUFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0IsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNsQjtLQUNGLENBQUMsQ0FBQztBQUNILFdBQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRS9CLFdBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDNUIsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxVQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLFVBQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRWpDLFFBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDMUIsVUFBSSxJQUFJLFlBQVksTUFBTSxFQUFFO0FBQzFCLFlBQUksS0FBSyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqRCxZQUFJLFFBQVEsWUFBVSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRzs7OztBQUFDLEFBSWxFLFlBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekMsWUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxZQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQyxZQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDaEIsWUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzdCLFlBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQzVDLFlBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUM1QixZQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQzs7QUFFN0MsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzdCLGVBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQzs7QUFFdEQsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxXQUFXLEdBQUcsdUJBQXVCLENBQUM7QUFDOUMsZUFBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFDeEIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDMUIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDM0IsZUFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0IsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNsQjtLQUNGLENBQUMsQ0FBQztBQUNILFdBQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDaEMsQ0FBQyxDQUFDO0NBQ0osRUFBRSxLQUFLLENBQUMsQ0FBQzs7OztBQzlKVixZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQzs7OztBQThCYixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7O0lBRWhCLE1BQU07V0FBTixNQUFNOzBCQUFOLE1BQU07OztlQUFOLE1BQU07OzJCQUNJLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbEIsYUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7S0FDakU7Ozs0QkFDYyxDQUFDLEVBQUU7QUFDaEIsYUFBTztBQUNMLFNBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDbkMsU0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBLElBQUssQ0FBQyxDQUFDO09BQzNDLENBQUE7S0FDRjs7O2tDQUNvQixDQUFDLEVBQUU7QUFDdEIsT0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVLENBQUM7QUFDaEMsT0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVLENBQUM7QUFDaEMsT0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBSSxVQUFVLENBQUM7QUFDaEMsYUFBTyxDQUFDLENBQUMsR0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUksVUFBVSxDQUFDO0tBQ3BDOzs7OEJBQ2dCLENBQUMsRUFBRTtBQUNsQixPQUFDLEdBQUcsQUFBQyxDQUFDLEdBQUcsVUFBVSxHQUFLLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQSxJQUFLLENBQUMsQUFBQyxDQUFDO0FBQy9DLE9BQUMsR0FBRyxBQUFDLENBQUMsR0FBRyxVQUFVLEdBQUssQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFBLElBQUssQ0FBQyxBQUFDLENBQUM7QUFDL0MsT0FBQyxHQUFHLEFBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUEsSUFBSyxDQUFDLEFBQUMsQ0FBQztBQUMvQyxhQUFPLEFBQUMsQ0FBQyxHQUFHLFVBQVUsR0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUEsSUFBSyxDQUFDLEFBQUMsQ0FBQztLQUNuRDs7OzRCQUNjLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUF3QjtVQUF0QixHQUFHLHlEQUFHLE1BQU0sQ0FBQyxPQUFPOzs7O0FBRzVDLGFBQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQSxHQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbkM7OztTQTFCRyxNQUFNOzs7QUE2QlosTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRW5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7O0FDL0R4QixZQUFZOzs7O0FBQUM7O0lBSVAsUUFBUSxZQUFSLFFBQVE7d0JBQVIsUUFBUTs7O0FBRWQsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogTUlUIGxpY2Vuc2UgKi9cbnZhciBjb252ZXJ0ID0gcmVxdWlyZShcImNvbG9yLWNvbnZlcnRcIiksXG4gICAgc3RyaW5nID0gcmVxdWlyZShcImNvbG9yLXN0cmluZ1wiKTtcblxudmFyIENvbG9yID0gZnVuY3Rpb24ob2JqKSB7XG4gIGlmIChvYmogaW5zdGFuY2VvZiBDb2xvcikgcmV0dXJuIG9iajtcbiAgaWYgKCEgKHRoaXMgaW5zdGFuY2VvZiBDb2xvcikpIHJldHVybiBuZXcgQ29sb3Iob2JqKTtcblxuICAgdGhpcy52YWx1ZXMgPSB7XG4gICAgICByZ2I6IFswLCAwLCAwXSxcbiAgICAgIGhzbDogWzAsIDAsIDBdLFxuICAgICAgaHN2OiBbMCwgMCwgMF0sXG4gICAgICBod2I6IFswLCAwLCAwXSxcbiAgICAgIGNteWs6IFswLCAwLCAwLCAwXSxcbiAgICAgIGFscGhhOiAxXG4gICB9XG5cbiAgIC8vIHBhcnNlIENvbG9yKCkgYXJndW1lbnRcbiAgIGlmICh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHtcbiAgICAgIHZhciB2YWxzID0gc3RyaW5nLmdldFJnYmEob2JqKTtcbiAgICAgIGlmICh2YWxzKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcInJnYlwiLCB2YWxzKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFscyA9IHN0cmluZy5nZXRIc2xhKG9iaikpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHZhbHMpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzID0gc3RyaW5nLmdldEh3YihvYmopKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcImh3YlwiLCB2YWxzKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcGFyc2UgY29sb3IgZnJvbSBzdHJpbmcgXFxcIlwiICsgb2JqICsgXCJcXFwiXCIpO1xuICAgICAgfVxuICAgfVxuICAgZWxzZSBpZiAodHlwZW9mIG9iaiA9PSBcIm9iamVjdFwiKSB7XG4gICAgICB2YXIgdmFscyA9IG9iajtcbiAgICAgIGlmKHZhbHNbXCJyXCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcInJlZFwiXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICB0aGlzLnNldFZhbHVlcyhcInJnYlwiLCB2YWxzKVxuICAgICAgfVxuICAgICAgZWxzZSBpZih2YWxzW1wibFwiXSAhPT0gdW5kZWZpbmVkIHx8IHZhbHNbXCJsaWdodG5lc3NcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFsc1tcInZcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1widmFsdWVcIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc3ZcIiwgdmFscylcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYodmFsc1tcIndcIl0gIT09IHVuZGVmaW5lZCB8fCB2YWxzW1wid2hpdGVuZXNzXCJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHdiXCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIGlmKHZhbHNbXCJjXCJdICE9PSB1bmRlZmluZWQgfHwgdmFsc1tcImN5YW5cIl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJjbXlrXCIsIHZhbHMpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHBhcnNlIGNvbG9yIGZyb20gb2JqZWN0IFwiICsgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgICB9XG4gICB9XG59XG5cbkNvbG9yLnByb3RvdHlwZSA9IHtcbiAgIHJnYjogZnVuY3Rpb24gKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwicmdiXCIsIGFyZ3VtZW50cyk7XG4gICB9LFxuICAgaHNsOiBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTcGFjZShcImhzbFwiLCBhcmd1bWVudHMpO1xuICAgfSxcbiAgIGhzdjogZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3BhY2UoXCJoc3ZcIiwgYXJndW1lbnRzKTtcbiAgIH0sXG4gICBod2I6IGZ1bmN0aW9uKHZhbHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldFNwYWNlKFwiaHdiXCIsIGFyZ3VtZW50cyk7XG4gICB9LFxuICAgY215azogZnVuY3Rpb24odmFscykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3BhY2UoXCJjbXlrXCIsIGFyZ3VtZW50cyk7XG4gICB9LFxuXG4gICByZ2JBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXMucmdiO1xuICAgfSxcbiAgIGhzbEFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5oc2w7XG4gICB9LFxuICAgaHN2QXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLmhzdjtcbiAgIH0sXG4gICBod2JBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy52YWx1ZXMuYWxwaGEgIT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVzLmh3Yi5jb25jYXQoW3RoaXMudmFsdWVzLmFscGhhXSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5od2I7XG4gICB9LFxuICAgY215a0FycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5jbXlrO1xuICAgfSxcbiAgIHJnYmFBcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmdiID0gdGhpcy52YWx1ZXMucmdiO1xuICAgICAgcmV0dXJuIHJnYi5jb25jYXQoW3RoaXMudmFsdWVzLmFscGhhXSk7XG4gICB9LFxuICAgaHNsYUFycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoc2wgPSB0aGlzLnZhbHVlcy5oc2w7XG4gICAgICByZXR1cm4gaHNsLmNvbmNhdChbdGhpcy52YWx1ZXMuYWxwaGFdKTtcbiAgIH0sXG4gICBhbHBoYTogZnVuY3Rpb24odmFsKSB7XG4gICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5hbHBoYTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiYWxwaGFcIiwgdmFsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgcmVkOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJyZ2JcIiwgMCwgdmFsKTtcbiAgIH0sXG4gICBncmVlbjogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwicmdiXCIsIDEsIHZhbCk7XG4gICB9LFxuICAgYmx1ZTogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwicmdiXCIsIDIsIHZhbCk7XG4gICB9LFxuICAgaHVlOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJoc2xcIiwgMCwgdmFsKTtcbiAgIH0sXG4gICBzYXR1cmF0aW9uOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJoc2xcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICBsaWdodG5lc3M6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzbFwiLCAyLCB2YWwpO1xuICAgfSxcbiAgIHNhdHVyYXRpb252OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJoc3ZcIiwgMSwgdmFsKTtcbiAgIH0sXG4gICB3aGl0ZW5lc3M6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImh3YlwiLCAxLCB2YWwpO1xuICAgfSxcbiAgIGJsYWNrbmVzczogZnVuY3Rpb24odmFsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDaGFubmVsKFwiaHdiXCIsIDIsIHZhbCk7XG4gICB9LFxuICAgdmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImhzdlwiLCAyLCB2YWwpO1xuICAgfSxcbiAgIGN5YW46IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImNteWtcIiwgMCwgdmFsKTtcbiAgIH0sXG4gICBtYWdlbnRhOiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJjbXlrXCIsIDEsIHZhbCk7XG4gICB9LFxuICAgeWVsbG93OiBmdW5jdGlvbih2YWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldENoYW5uZWwoXCJjbXlrXCIsIDIsIHZhbCk7XG4gICB9LFxuICAgYmxhY2s6IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0Q2hhbm5lbChcImNteWtcIiwgMywgdmFsKTtcbiAgIH0sXG5cbiAgIGhleFN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLmhleFN0cmluZyh0aGlzLnZhbHVlcy5yZ2IpO1xuICAgfSxcbiAgIHJnYlN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnJnYlN0cmluZyh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG4gICByZ2JhU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcucmdiYVN0cmluZyh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG4gICBwZXJjZW50U3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcucGVyY2VudFN0cmluZyh0aGlzLnZhbHVlcy5yZ2IsIHRoaXMudmFsdWVzLmFscGhhKTtcbiAgIH0sXG4gICBoc2xTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5oc2xTdHJpbmcodGhpcy52YWx1ZXMuaHNsLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuICAgaHNsYVN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLmhzbGFTdHJpbmcodGhpcy52YWx1ZXMuaHNsLCB0aGlzLnZhbHVlcy5hbHBoYSk7XG4gICB9LFxuICAgaHdiU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzdHJpbmcuaHdiU3RyaW5nKHRoaXMudmFsdWVzLmh3YiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcbiAgIGtleXdvcmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0cmluZy5rZXl3b3JkKHRoaXMudmFsdWVzLnJnYiwgdGhpcy52YWx1ZXMuYWxwaGEpO1xuICAgfSxcblxuICAgcmdiTnVtYmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAodGhpcy52YWx1ZXMucmdiWzBdIDw8IDE2KSB8ICh0aGlzLnZhbHVlcy5yZ2JbMV0gPDwgOCkgfCB0aGlzLnZhbHVlcy5yZ2JbMl07XG4gICB9LFxuXG4gICBsdW1pbm9zaXR5OiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1dDQUcyMC8jcmVsYXRpdmVsdW1pbmFuY2VkZWZcbiAgICAgIHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2I7XG4gICAgICB2YXIgbHVtID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgdmFyIGNoYW4gPSByZ2JbaV0gLyAyNTU7XG4gICAgICAgICBsdW1baV0gPSAoY2hhbiA8PSAwLjAzOTI4KSA/IGNoYW4gLyAxMi45MlxuICAgICAgICAgICAgICAgICAgOiBNYXRoLnBvdygoKGNoYW4gKyAwLjA1NSkgLyAxLjA1NSksIDIuNClcbiAgICAgIH1cbiAgICAgIHJldHVybiAwLjIxMjYgKiBsdW1bMF0gKyAwLjcxNTIgKiBsdW1bMV0gKyAwLjA3MjIgKiBsdW1bMl07XG4gICB9LFxuXG4gICBjb250cmFzdDogZnVuY3Rpb24oY29sb3IyKSB7XG4gICAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9XQ0FHMjAvI2NvbnRyYXN0LXJhdGlvZGVmXG4gICAgICB2YXIgbHVtMSA9IHRoaXMubHVtaW5vc2l0eSgpO1xuICAgICAgdmFyIGx1bTIgPSBjb2xvcjIubHVtaW5vc2l0eSgpO1xuICAgICAgaWYgKGx1bTEgPiBsdW0yKSB7XG4gICAgICAgICByZXR1cm4gKGx1bTEgKyAwLjA1KSAvIChsdW0yICsgMC4wNSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gKGx1bTIgKyAwLjA1KSAvIChsdW0xICsgMC4wNSk7XG4gICB9LFxuXG4gICBsZXZlbDogZnVuY3Rpb24oY29sb3IyKSB7XG4gICAgIHZhciBjb250cmFzdFJhdGlvID0gdGhpcy5jb250cmFzdChjb2xvcjIpO1xuICAgICByZXR1cm4gKGNvbnRyYXN0UmF0aW8gPj0gNy4xKVxuICAgICAgID8gJ0FBQSdcbiAgICAgICA6IChjb250cmFzdFJhdGlvID49IDQuNSlcbiAgICAgICAgPyAnQUEnXG4gICAgICAgIDogJyc7XG4gICB9LFxuXG4gICBkYXJrOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFlJUSBlcXVhdGlvbiBmcm9tIGh0dHA6Ly8yNHdheXMub3JnLzIwMTAvY2FsY3VsYXRpbmctY29sb3ItY29udHJhc3RcbiAgICAgIHZhciByZ2IgPSB0aGlzLnZhbHVlcy5yZ2IsXG4gICAgICAgICAgeWlxID0gKHJnYlswXSAqIDI5OSArIHJnYlsxXSAqIDU4NyArIHJnYlsyXSAqIDExNCkgLyAxMDAwO1xuICAgICAgcmV0dXJuIHlpcSA8IDEyODtcbiAgIH0sXG5cbiAgIGxpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhdGhpcy5kYXJrKCk7XG4gICB9LFxuXG4gICBuZWdhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJnYiA9IFtdXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gMjU1IC0gdGhpcy52YWx1ZXMucmdiW2ldO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJyZ2JcIiwgcmdiKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgbGlnaHRlbjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMudmFsdWVzLmhzbFsyXSArPSB0aGlzLnZhbHVlcy5oc2xbMl0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzLmhzbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIGRhcmtlbjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMudmFsdWVzLmhzbFsyXSAtPSB0aGlzLnZhbHVlcy5oc2xbMl0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzLmhzbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIHNhdHVyYXRlOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy52YWx1ZXMuaHNsWzFdICs9IHRoaXMudmFsdWVzLmhzbFsxXSAqIHJhdGlvO1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJoc2xcIiwgdGhpcy52YWx1ZXMuaHNsKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgZGVzYXR1cmF0ZTogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMudmFsdWVzLmhzbFsxXSAtPSB0aGlzLnZhbHVlcy5oc2xbMV0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzLmhzbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIHdoaXRlbjogZnVuY3Rpb24ocmF0aW8pIHtcbiAgICAgIHRoaXMudmFsdWVzLmh3YlsxXSArPSB0aGlzLnZhbHVlcy5od2JbMV0gKiByYXRpbztcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHdiXCIsIHRoaXMudmFsdWVzLmh3Yik7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIGJsYWNrZW46IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnZhbHVlcy5od2JbMl0gKz0gdGhpcy52YWx1ZXMuaHdiWzJdICogcmF0aW87XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImh3YlwiLCB0aGlzLnZhbHVlcy5od2IpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBncmV5c2NhbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJnYiA9IHRoaXMudmFsdWVzLnJnYjtcbiAgICAgIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR3JheXNjYWxlI0NvbnZlcnRpbmdfY29sb3JfdG9fZ3JheXNjYWxlXG4gICAgICB2YXIgdmFsID0gcmdiWzBdICogMC4zICsgcmdiWzFdICogMC41OSArIHJnYlsyXSAqIDAuMTE7XG4gICAgICB0aGlzLnNldFZhbHVlcyhcInJnYlwiLCBbdmFsLCB2YWwsIHZhbF0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICB9LFxuXG4gICBjbGVhcmVyOiBmdW5jdGlvbihyYXRpbykge1xuICAgICAgdGhpcy5zZXRWYWx1ZXMoXCJhbHBoYVwiLCB0aGlzLnZhbHVlcy5hbHBoYSAtICh0aGlzLnZhbHVlcy5hbHBoYSAqIHJhdGlvKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIG9wYXF1ZXI6IGZ1bmN0aW9uKHJhdGlvKSB7XG4gICAgICB0aGlzLnNldFZhbHVlcyhcImFscGhhXCIsIHRoaXMudmFsdWVzLmFscGhhICsgKHRoaXMudmFsdWVzLmFscGhhICogcmF0aW8pKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgfSxcblxuICAgcm90YXRlOiBmdW5jdGlvbihkZWdyZWVzKSB7XG4gICAgICB2YXIgaHVlID0gdGhpcy52YWx1ZXMuaHNsWzBdO1xuICAgICAgaHVlID0gKGh1ZSArIGRlZ3JlZXMpICUgMzYwO1xuICAgICAgaHVlID0gaHVlIDwgMCA/IDM2MCArIGh1ZSA6IGh1ZTtcbiAgICAgIHRoaXMudmFsdWVzLmhzbFswXSA9IGh1ZTtcbiAgICAgIHRoaXMuc2V0VmFsdWVzKFwiaHNsXCIsIHRoaXMudmFsdWVzLmhzbCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgIH0sXG5cbiAgIC8qKlxuICAgICogUG9ydGVkIGZyb20gc2FzcyBpbXBsZW1lbnRhdGlvbiBpbiBDXG4gICAgKiBodHRwczovL2dpdGh1Yi5jb20vc2Fzcy9saWJzYXNzL2Jsb2IvMGU2YjRhMjg1MDA5MjM1NmFhM2VjZTA3YzZiMjQ5ZjAyMjFjYWNlZC9mdW5jdGlvbnMuY3BwI0wyMDlcbiAgICAqL1xuICAgbWl4OiBmdW5jdGlvbihtaXhpbkNvbG9yLCB3ZWlnaHQpIHtcbiAgICAgIHZhciBjb2xvcjEgPSB0aGlzO1xuICAgICAgdmFyIGNvbG9yMiA9IG1peGluQ29sb3I7XG4gICAgICB2YXIgcCA9IHdlaWdodCAhPT0gdW5kZWZpbmVkID8gd2VpZ2h0IDogMC41O1xuXG4gICAgICB2YXIgdyA9IDIgKiBwIC0gMTtcbiAgICAgIHZhciBhID0gY29sb3IxLmFscGhhKCkgLSBjb2xvcjIuYWxwaGEoKTtcblxuICAgICAgdmFyIHcxID0gKCgodyAqIGEgPT0gLTEpID8gdyA6ICh3ICsgYSkvKDEgKyB3KmEpKSArIDEpIC8gMi4wO1xuICAgICAgdmFyIHcyID0gMSAtIHcxO1xuXG4gICAgICByZXR1cm4gdGhpc1xuICAgICAgICAucmdiKFxuICAgICAgICAgIHcxICogY29sb3IxLnJlZCgpICsgdzIgKiBjb2xvcjIucmVkKCksXG4gICAgICAgICAgdzEgKiBjb2xvcjEuZ3JlZW4oKSArIHcyICogY29sb3IyLmdyZWVuKCksXG4gICAgICAgICAgdzEgKiBjb2xvcjEuYmx1ZSgpICsgdzIgKiBjb2xvcjIuYmx1ZSgpXG4gICAgICAgIClcbiAgICAgICAgLmFscGhhKGNvbG9yMS5hbHBoYSgpICogcCArIGNvbG9yMi5hbHBoYSgpICogKDEgLSBwKSk7XG4gICB9LFxuXG4gICB0b0pTT046IGZ1bmN0aW9uKCkge1xuICAgICByZXR1cm4gdGhpcy5yZ2IoKTtcbiAgIH0sXG5cbiAgIGNsb25lOiBmdW5jdGlvbigpIHtcbiAgICAgcmV0dXJuIG5ldyBDb2xvcih0aGlzLnJnYigpKTtcbiAgIH1cbn1cblxuXG5Db2xvci5wcm90b3R5cGUuZ2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UpIHtcbiAgIHZhciB2YWxzID0ge307XG4gICBmb3IgKHZhciBpID0gMDsgaSA8IHNwYWNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWxzW3NwYWNlLmNoYXJBdChpKV0gPSB0aGlzLnZhbHVlc1tzcGFjZV1baV07XG4gICB9XG4gICBpZiAodGhpcy52YWx1ZXMuYWxwaGEgIT0gMSkge1xuICAgICAgdmFsc1tcImFcIl0gPSB0aGlzLnZhbHVlcy5hbHBoYTtcbiAgIH1cbiAgIC8vIHtyOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAwLjR9XG4gICByZXR1cm4gdmFscztcbn1cblxuQ29sb3IucHJvdG90eXBlLnNldFZhbHVlcyA9IGZ1bmN0aW9uKHNwYWNlLCB2YWxzKSB7XG4gICB2YXIgc3BhY2VzID0ge1xuICAgICAgXCJyZ2JcIjogW1wicmVkXCIsIFwiZ3JlZW5cIiwgXCJibHVlXCJdLFxuICAgICAgXCJoc2xcIjogW1wiaHVlXCIsIFwic2F0dXJhdGlvblwiLCBcImxpZ2h0bmVzc1wiXSxcbiAgICAgIFwiaHN2XCI6IFtcImh1ZVwiLCBcInNhdHVyYXRpb25cIiwgXCJ2YWx1ZVwiXSxcbiAgICAgIFwiaHdiXCI6IFtcImh1ZVwiLCBcIndoaXRlbmVzc1wiLCBcImJsYWNrbmVzc1wiXSxcbiAgICAgIFwiY215a1wiOiBbXCJjeWFuXCIsIFwibWFnZW50YVwiLCBcInllbGxvd1wiLCBcImJsYWNrXCJdXG4gICB9O1xuXG4gICB2YXIgbWF4ZXMgPSB7XG4gICAgICBcInJnYlwiOiBbMjU1LCAyNTUsIDI1NV0sXG4gICAgICBcImhzbFwiOiBbMzYwLCAxMDAsIDEwMF0sXG4gICAgICBcImhzdlwiOiBbMzYwLCAxMDAsIDEwMF0sXG4gICAgICBcImh3YlwiOiBbMzYwLCAxMDAsIDEwMF0sXG4gICAgICBcImNteWtcIjogWzEwMCwgMTAwLCAxMDAsIDEwMF1cbiAgIH07XG5cbiAgIHZhciBhbHBoYSA9IDE7XG4gICBpZiAoc3BhY2UgPT0gXCJhbHBoYVwiKSB7XG4gICAgICBhbHBoYSA9IHZhbHM7XG4gICB9XG4gICBlbHNlIGlmICh2YWxzLmxlbmd0aCkge1xuICAgICAgLy8gWzEwLCAxMCwgMTBdXG4gICAgICB0aGlzLnZhbHVlc1tzcGFjZV0gPSB2YWxzLnNsaWNlKDAsIHNwYWNlLmxlbmd0aCk7XG4gICAgICBhbHBoYSA9IHZhbHNbc3BhY2UubGVuZ3RoXTtcbiAgIH1cbiAgIGVsc2UgaWYgKHZhbHNbc3BhY2UuY2hhckF0KDApXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyB7cjogMTAsIGc6IDEwLCBiOiAxMH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy52YWx1ZXNbc3BhY2VdW2ldID0gdmFsc1tzcGFjZS5jaGFyQXQoaSldO1xuICAgICAgfVxuICAgICAgYWxwaGEgPSB2YWxzLmE7XG4gICB9XG4gICBlbHNlIGlmICh2YWxzW3NwYWNlc1tzcGFjZV1bMF1dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIHtyZWQ6IDEwLCBncmVlbjogMTAsIGJsdWU6IDEwfVxuICAgICAgdmFyIGNoYW5zID0gc3BhY2VzW3NwYWNlXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BhY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy52YWx1ZXNbc3BhY2VdW2ldID0gdmFsc1tjaGFuc1tpXV07XG4gICAgICB9XG4gICAgICBhbHBoYSA9IHZhbHMuYWxwaGE7XG4gICB9XG4gICB0aGlzLnZhbHVlcy5hbHBoYSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChhbHBoYSAhPT0gdW5kZWZpbmVkID8gYWxwaGEgOiB0aGlzLnZhbHVlcy5hbHBoYSkgKSk7XG4gICBpZiAoc3BhY2UgPT0gXCJhbHBoYVwiKSB7XG4gICAgICByZXR1cm47XG4gICB9XG5cbiAgIC8vIGNhcCB2YWx1ZXMgb2YgdGhlIHNwYWNlIHByaW9yIGNvbnZlcnRpbmcgYWxsIHZhbHVlc1xuICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGNhcHBlZCA9IE1hdGgubWF4KDAsIE1hdGgubWluKG1heGVzW3NwYWNlXVtpXSwgdGhpcy52YWx1ZXNbc3BhY2VdW2ldKSk7XG4gICAgICB0aGlzLnZhbHVlc1tzcGFjZV1baV0gPSBNYXRoLnJvdW5kKGNhcHBlZCk7XG4gICB9XG5cbiAgIC8vIGNvbnZlcnQgdG8gYWxsIHRoZSBvdGhlciBjb2xvciBzcGFjZXNcbiAgIGZvciAodmFyIHNuYW1lIGluIHNwYWNlcykge1xuICAgICAgaWYgKHNuYW1lICE9IHNwYWNlKSB7XG4gICAgICAgICB0aGlzLnZhbHVlc1tzbmFtZV0gPSBjb252ZXJ0W3NwYWNlXVtzbmFtZV0odGhpcy52YWx1ZXNbc3BhY2VdKVxuICAgICAgfVxuXG4gICAgICAvLyBjYXAgdmFsdWVzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNuYW1lLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICB2YXIgY2FwcGVkID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4ZXNbc25hbWVdW2ldLCB0aGlzLnZhbHVlc1tzbmFtZV1baV0pKTtcbiAgICAgICAgIHRoaXMudmFsdWVzW3NuYW1lXVtpXSA9IE1hdGgucm91bmQoY2FwcGVkKTtcbiAgICAgIH1cbiAgIH1cbiAgIHJldHVybiB0cnVlO1xufVxuXG5Db2xvci5wcm90b3R5cGUuc2V0U3BhY2UgPSBmdW5jdGlvbihzcGFjZSwgYXJncykge1xuICAgdmFyIHZhbHMgPSBhcmdzWzBdO1xuICAgaWYgKHZhbHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gY29sb3IucmdiKClcbiAgICAgIHJldHVybiB0aGlzLmdldFZhbHVlcyhzcGFjZSk7XG4gICB9XG4gICAvLyBjb2xvci5yZ2IoMTAsIDEwLCAxMClcbiAgIGlmICh0eXBlb2YgdmFscyA9PSBcIm51bWJlclwiKSB7XG4gICAgICB2YWxzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gICB9XG4gICB0aGlzLnNldFZhbHVlcyhzcGFjZSwgdmFscyk7XG4gICByZXR1cm4gdGhpcztcbn1cblxuQ29sb3IucHJvdG90eXBlLnNldENoYW5uZWwgPSBmdW5jdGlvbihzcGFjZSwgaW5kZXgsIHZhbCkge1xuICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBjb2xvci5yZWQoKVxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVzW3NwYWNlXVtpbmRleF07XG4gICB9XG4gICAvLyBjb2xvci5yZWQoMTAwKVxuICAgdGhpcy52YWx1ZXNbc3BhY2VdW2luZGV4XSA9IHZhbDtcbiAgIHRoaXMuc2V0VmFsdWVzKHNwYWNlLCB0aGlzLnZhbHVlc1tzcGFjZV0pO1xuICAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sb3I7XG4iLCIvKiBNSVQgbGljZW5zZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmdiMmhzbDogcmdiMmhzbCxcbiAgcmdiMmhzdjogcmdiMmhzdixcbiAgcmdiMmh3YjogcmdiMmh3YixcbiAgcmdiMmNteWs6IHJnYjJjbXlrLFxuICByZ2Iya2V5d29yZDogcmdiMmtleXdvcmQsXG4gIHJnYjJ4eXo6IHJnYjJ4eXosXG4gIHJnYjJsYWI6IHJnYjJsYWIsXG4gIHJnYjJsY2g6IHJnYjJsY2gsXG5cbiAgaHNsMnJnYjogaHNsMnJnYixcbiAgaHNsMmhzdjogaHNsMmhzdixcbiAgaHNsMmh3YjogaHNsMmh3YixcbiAgaHNsMmNteWs6IGhzbDJjbXlrLFxuICBoc2wya2V5d29yZDogaHNsMmtleXdvcmQsXG5cbiAgaHN2MnJnYjogaHN2MnJnYixcbiAgaHN2MmhzbDogaHN2MmhzbCxcbiAgaHN2Mmh3YjogaHN2Mmh3YixcbiAgaHN2MmNteWs6IGhzdjJjbXlrLFxuICBoc3Yya2V5d29yZDogaHN2MmtleXdvcmQsXG5cbiAgaHdiMnJnYjogaHdiMnJnYixcbiAgaHdiMmhzbDogaHdiMmhzbCxcbiAgaHdiMmhzdjogaHdiMmhzdixcbiAgaHdiMmNteWs6IGh3YjJjbXlrLFxuICBod2Iya2V5d29yZDogaHdiMmtleXdvcmQsXG5cbiAgY215azJyZ2I6IGNteWsycmdiLFxuICBjbXlrMmhzbDogY215azJoc2wsXG4gIGNteWsyaHN2OiBjbXlrMmhzdixcbiAgY215azJod2I6IGNteWsyaHdiLFxuICBjbXlrMmtleXdvcmQ6IGNteWsya2V5d29yZCxcblxuICBrZXl3b3JkMnJnYjoga2V5d29yZDJyZ2IsXG4gIGtleXdvcmQyaHNsOiBrZXl3b3JkMmhzbCxcbiAga2V5d29yZDJoc3Y6IGtleXdvcmQyaHN2LFxuICBrZXl3b3JkMmh3Yjoga2V5d29yZDJod2IsXG4gIGtleXdvcmQyY215azoga2V5d29yZDJjbXlrLFxuICBrZXl3b3JkMmxhYjoga2V5d29yZDJsYWIsXG4gIGtleXdvcmQyeHl6OiBrZXl3b3JkMnh5eixcblxuICB4eXoycmdiOiB4eXoycmdiLFxuICB4eXoybGFiOiB4eXoybGFiLFxuICB4eXoybGNoOiB4eXoybGNoLFxuXG4gIGxhYjJ4eXo6IGxhYjJ4eXosXG4gIGxhYjJyZ2I6IGxhYjJyZ2IsXG4gIGxhYjJsY2g6IGxhYjJsY2gsXG5cbiAgbGNoMmxhYjogbGNoMmxhYixcbiAgbGNoMnh5ejogbGNoMnh5eixcbiAgbGNoMnJnYjogbGNoMnJnYlxufVxuXG5cbmZ1bmN0aW9uIHJnYjJoc2wocmdiKSB7XG4gIHZhciByID0gcmdiWzBdLzI1NSxcbiAgICAgIGcgPSByZ2JbMV0vMjU1LFxuICAgICAgYiA9IHJnYlsyXS8yNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgZGVsdGEgPSBtYXggLSBtaW4sXG4gICAgICBoLCBzLCBsO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIGggPSAwO1xuICBlbHNlIGlmIChyID09IG1heClcbiAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICBlbHNlIGlmIChnID09IG1heClcbiAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoYiA9PSBtYXgpXG4gICAgaCA9IDQgKyAociAtIGcpLyBkZWx0YTtcblxuICBoID0gTWF0aC5taW4oaCAqIDYwLCAzNjApO1xuXG4gIGlmIChoIDwgMClcbiAgICBoICs9IDM2MDtcblxuICBsID0gKG1pbiArIG1heCkgLyAyO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIHMgPSAwO1xuICBlbHNlIGlmIChsIDw9IDAuNSlcbiAgICBzID0gZGVsdGEgLyAobWF4ICsgbWluKTtcbiAgZWxzZVxuICAgIHMgPSBkZWx0YSAvICgyIC0gbWF4IC0gbWluKTtcblxuICByZXR1cm4gW2gsIHMgKiAxMDAsIGwgKiAxMDBdO1xufVxuXG5mdW5jdGlvbiByZ2IyaHN2KHJnYikge1xuICB2YXIgciA9IHJnYlswXSxcbiAgICAgIGcgPSByZ2JbMV0sXG4gICAgICBiID0gcmdiWzJdLFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGRlbHRhID0gbWF4IC0gbWluLFxuICAgICAgaCwgcywgdjtcblxuICBpZiAobWF4ID09IDApXG4gICAgcyA9IDA7XG4gIGVsc2VcbiAgICBzID0gKGRlbHRhL21heCAqIDEwMDApLzEwO1xuXG4gIGlmIChtYXggPT0gbWluKVxuICAgIGggPSAwO1xuICBlbHNlIGlmIChyID09IG1heClcbiAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICBlbHNlIGlmIChnID09IG1heClcbiAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgZWxzZSBpZiAoYiA9PSBtYXgpXG4gICAgaCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG5cbiAgaCA9IE1hdGgubWluKGggKiA2MCwgMzYwKTtcblxuICBpZiAoaCA8IDApXG4gICAgaCArPSAzNjA7XG5cbiAgdiA9ICgobWF4IC8gMjU1KSAqIDEwMDApIC8gMTA7XG5cbiAgcmV0dXJuIFtoLCBzLCB2XTtcbn1cblxuZnVuY3Rpb24gcmdiMmh3YihyZ2IpIHtcbiAgdmFyIHIgPSByZ2JbMF0sXG4gICAgICBnID0gcmdiWzFdLFxuICAgICAgYiA9IHJnYlsyXSxcbiAgICAgIGggPSByZ2IyaHNsKHJnYilbMF0sXG4gICAgICB3ID0gMS8yNTUgKiBNYXRoLm1pbihyLCBNYXRoLm1pbihnLCBiKSksXG4gICAgICBiID0gMSAtIDEvMjU1ICogTWF0aC5tYXgociwgTWF0aC5tYXgoZywgYikpO1xuXG4gIHJldHVybiBbaCwgdyAqIDEwMCwgYiAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJjbXlrKHJnYikge1xuICB2YXIgciA9IHJnYlswXSAvIDI1NSxcbiAgICAgIGcgPSByZ2JbMV0gLyAyNTUsXG4gICAgICBiID0gcmdiWzJdIC8gMjU1LFxuICAgICAgYywgbSwgeSwgaztcblxuICBrID0gTWF0aC5taW4oMSAtIHIsIDEgLSBnLCAxIC0gYik7XG4gIGMgPSAoMSAtIHIgLSBrKSAvICgxIC0gaykgfHwgMDtcbiAgbSA9ICgxIC0gZyAtIGspIC8gKDEgLSBrKSB8fCAwO1xuICB5ID0gKDEgLSBiIC0gaykgLyAoMSAtIGspIHx8IDA7XG4gIHJldHVybiBbYyAqIDEwMCwgbSAqIDEwMCwgeSAqIDEwMCwgayAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZUtleXdvcmRzW0pTT04uc3RyaW5naWZ5KHJnYildO1xufVxuXG5mdW5jdGlvbiByZ2IyeHl6KHJnYikge1xuICB2YXIgciA9IHJnYlswXSAvIDI1NSxcbiAgICAgIGcgPSByZ2JbMV0gLyAyNTUsXG4gICAgICBiID0gcmdiWzJdIC8gMjU1O1xuXG4gIC8vIGFzc3VtZSBzUkdCXG4gIHIgPSByID4gMC4wNDA0NSA/IE1hdGgucG93KCgociArIDAuMDU1KSAvIDEuMDU1KSwgMi40KSA6IChyIC8gMTIuOTIpO1xuICBnID0gZyA+IDAuMDQwNDUgPyBNYXRoLnBvdygoKGcgKyAwLjA1NSkgLyAxLjA1NSksIDIuNCkgOiAoZyAvIDEyLjkyKTtcbiAgYiA9IGIgPiAwLjA0MDQ1ID8gTWF0aC5wb3coKChiICsgMC4wNTUpIC8gMS4wNTUpLCAyLjQpIDogKGIgLyAxMi45Mik7XG5cbiAgdmFyIHggPSAociAqIDAuNDEyNCkgKyAoZyAqIDAuMzU3NikgKyAoYiAqIDAuMTgwNSk7XG4gIHZhciB5ID0gKHIgKiAwLjIxMjYpICsgKGcgKiAwLjcxNTIpICsgKGIgKiAwLjA3MjIpO1xuICB2YXIgeiA9IChyICogMC4wMTkzKSArIChnICogMC4xMTkyKSArIChiICogMC45NTA1KTtcblxuICByZXR1cm4gW3ggKiAxMDAsIHkgKjEwMCwgeiAqIDEwMF07XG59XG5cbmZ1bmN0aW9uIHJnYjJsYWIocmdiKSB7XG4gIHZhciB4eXogPSByZ2IyeHl6KHJnYiksXG4gICAgICAgIHggPSB4eXpbMF0sXG4gICAgICAgIHkgPSB4eXpbMV0sXG4gICAgICAgIHogPSB4eXpbMl0sXG4gICAgICAgIGwsIGEsIGI7XG5cbiAgeCAvPSA5NS4wNDc7XG4gIHkgLz0gMTAwO1xuICB6IC89IDEwOC44ODM7XG5cbiAgeCA9IHggPiAwLjAwODg1NiA/IE1hdGgucG93KHgsIDEvMykgOiAoNy43ODcgKiB4KSArICgxNiAvIDExNik7XG4gIHkgPSB5ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh5LCAxLzMpIDogKDcuNzg3ICogeSkgKyAoMTYgLyAxMTYpO1xuICB6ID0geiA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeiwgMS8zKSA6ICg3Ljc4NyAqIHopICsgKDE2IC8gMTE2KTtcblxuICBsID0gKDExNiAqIHkpIC0gMTY7XG4gIGEgPSA1MDAgKiAoeCAtIHkpO1xuICBiID0gMjAwICogKHkgLSB6KTtcblxuICByZXR1cm4gW2wsIGEsIGJdO1xufVxuXG5mdW5jdGlvbiByZ2IybGNoKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJsY2gocmdiMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGhzbDJyZ2IoaHNsKSB7XG4gIHZhciBoID0gaHNsWzBdIC8gMzYwLFxuICAgICAgcyA9IGhzbFsxXSAvIDEwMCxcbiAgICAgIGwgPSBoc2xbMl0gLyAxMDAsXG4gICAgICB0MSwgdDIsIHQzLCByZ2IsIHZhbDtcblxuICBpZiAocyA9PSAwKSB7XG4gICAgdmFsID0gbCAqIDI1NTtcbiAgICByZXR1cm4gW3ZhbCwgdmFsLCB2YWxdO1xuICB9XG5cbiAgaWYgKGwgPCAwLjUpXG4gICAgdDIgPSBsICogKDEgKyBzKTtcbiAgZWxzZVxuICAgIHQyID0gbCArIHMgLSBsICogcztcbiAgdDEgPSAyICogbCAtIHQyO1xuXG4gIHJnYiA9IFswLCAwLCAwXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICB0MyA9IGggKyAxIC8gMyAqIC0gKGkgLSAxKTtcbiAgICB0MyA8IDAgJiYgdDMrKztcbiAgICB0MyA+IDEgJiYgdDMtLTtcblxuICAgIGlmICg2ICogdDMgPCAxKVxuICAgICAgdmFsID0gdDEgKyAodDIgLSB0MSkgKiA2ICogdDM7XG4gICAgZWxzZSBpZiAoMiAqIHQzIDwgMSlcbiAgICAgIHZhbCA9IHQyO1xuICAgIGVsc2UgaWYgKDMgKiB0MyA8IDIpXG4gICAgICB2YWwgPSB0MSArICh0MiAtIHQxKSAqICgyIC8gMyAtIHQzKSAqIDY7XG4gICAgZWxzZVxuICAgICAgdmFsID0gdDE7XG5cbiAgICByZ2JbaV0gPSB2YWwgKiAyNTU7XG4gIH1cblxuICByZXR1cm4gcmdiO1xufVxuXG5mdW5jdGlvbiBoc2wyaHN2KGhzbCkge1xuICB2YXIgaCA9IGhzbFswXSxcbiAgICAgIHMgPSBoc2xbMV0gLyAxMDAsXG4gICAgICBsID0gaHNsWzJdIC8gMTAwLFxuICAgICAgc3YsIHY7XG5cbiAgaWYobCA9PT0gMCkge1xuICAgICAgLy8gbm8gbmVlZCB0byBkbyBjYWxjIG9uIGJsYWNrXG4gICAgICAvLyBhbHNvIGF2b2lkcyBkaXZpZGUgYnkgMCBlcnJvclxuICAgICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgfVxuXG4gIGwgKj0gMjtcbiAgcyAqPSAobCA8PSAxKSA/IGwgOiAyIC0gbDtcbiAgdiA9IChsICsgcykgLyAyO1xuICBzdiA9ICgyICogcykgLyAobCArIHMpO1xuICByZXR1cm4gW2gsIHN2ICogMTAwLCB2ICogMTAwXTtcbn1cblxuZnVuY3Rpb24gaHNsMmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGhzbDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc2wyY215ayhhcmdzKSB7XG4gIHJldHVybiByZ2IyY215ayhoc2wycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHNsMmtleXdvcmQoYXJncykge1xuICByZXR1cm4gcmdiMmtleXdvcmQoaHNsMnJnYihhcmdzKSk7XG59XG5cblxuZnVuY3Rpb24gaHN2MnJnYihoc3YpIHtcbiAgdmFyIGggPSBoc3ZbMF0gLyA2MCxcbiAgICAgIHMgPSBoc3ZbMV0gLyAxMDAsXG4gICAgICB2ID0gaHN2WzJdIC8gMTAwLFxuICAgICAgaGkgPSBNYXRoLmZsb29yKGgpICUgNjtcblxuICB2YXIgZiA9IGggLSBNYXRoLmZsb29yKGgpLFxuICAgICAgcCA9IDI1NSAqIHYgKiAoMSAtIHMpLFxuICAgICAgcSA9IDI1NSAqIHYgKiAoMSAtIChzICogZikpLFxuICAgICAgdCA9IDI1NSAqIHYgKiAoMSAtIChzICogKDEgLSBmKSkpLFxuICAgICAgdiA9IDI1NSAqIHY7XG5cbiAgc3dpdGNoKGhpKSB7XG4gICAgY2FzZSAwOlxuICAgICAgcmV0dXJuIFt2LCB0LCBwXTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gW3EsIHYsIHBdO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBbcCwgdiwgdF07XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFtwLCBxLCB2XTtcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gW3QsIHAsIHZdO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBbdiwgcCwgcV07XG4gIH1cbn1cblxuZnVuY3Rpb24gaHN2MmhzbChoc3YpIHtcbiAgdmFyIGggPSBoc3ZbMF0sXG4gICAgICBzID0gaHN2WzFdIC8gMTAwLFxuICAgICAgdiA9IGhzdlsyXSAvIDEwMCxcbiAgICAgIHNsLCBsO1xuXG4gIGwgPSAoMiAtIHMpICogdjtcbiAgc2wgPSBzICogdjtcbiAgc2wgLz0gKGwgPD0gMSkgPyBsIDogMiAtIGw7XG4gIHNsID0gc2wgfHwgMDtcbiAgbCAvPSAyO1xuICByZXR1cm4gW2gsIHNsICogMTAwLCBsICogMTAwXTtcbn1cblxuZnVuY3Rpb24gaHN2Mmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGhzdjJyZ2IoYXJncykpXG59XG5cbmZ1bmN0aW9uIGhzdjJjbXlrKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJjbXlrKGhzdjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBoc3Yya2V5d29yZChhcmdzKSB7XG4gIHJldHVybiByZ2Iya2V5d29yZChoc3YycmdiKGFyZ3MpKTtcbn1cblxuLy8gaHR0cDovL2Rldi53My5vcmcvY3Nzd2cvY3NzLWNvbG9yLyNod2ItdG8tcmdiXG5mdW5jdGlvbiBod2IycmdiKGh3Yikge1xuICB2YXIgaCA9IGh3YlswXSAvIDM2MCxcbiAgICAgIHdoID0gaHdiWzFdIC8gMTAwLFxuICAgICAgYmwgPSBod2JbMl0gLyAxMDAsXG4gICAgICByYXRpbyA9IHdoICsgYmwsXG4gICAgICBpLCB2LCBmLCBuO1xuXG4gIC8vIHdoICsgYmwgY2FudCBiZSA+IDFcbiAgaWYgKHJhdGlvID4gMSkge1xuICAgIHdoIC89IHJhdGlvO1xuICAgIGJsIC89IHJhdGlvO1xuICB9XG5cbiAgaSA9IE1hdGguZmxvb3IoNiAqIGgpO1xuICB2ID0gMSAtIGJsO1xuICBmID0gNiAqIGggLSBpO1xuICBpZiAoKGkgJiAweDAxKSAhPSAwKSB7XG4gICAgZiA9IDEgLSBmO1xuICB9XG4gIG4gPSB3aCArIGYgKiAodiAtIHdoKTsgIC8vIGxpbmVhciBpbnRlcnBvbGF0aW9uXG5cbiAgc3dpdGNoIChpKSB7XG4gICAgZGVmYXVsdDpcbiAgICBjYXNlIDY6XG4gICAgY2FzZSAwOiByID0gdjsgZyA9IG47IGIgPSB3aDsgYnJlYWs7XG4gICAgY2FzZSAxOiByID0gbjsgZyA9IHY7IGIgPSB3aDsgYnJlYWs7XG4gICAgY2FzZSAyOiByID0gd2g7IGcgPSB2OyBiID0gbjsgYnJlYWs7XG4gICAgY2FzZSAzOiByID0gd2g7IGcgPSBuOyBiID0gdjsgYnJlYWs7XG4gICAgY2FzZSA0OiByID0gbjsgZyA9IHdoOyBiID0gdjsgYnJlYWs7XG4gICAgY2FzZSA1OiByID0gdjsgZyA9IHdoOyBiID0gbjsgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdO1xufVxuXG5mdW5jdGlvbiBod2IyaHNsKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc2woaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGh3YjJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihod2IycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gaHdiMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoaHdiMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGh3YjJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGh3YjJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMnJnYihjbXlrKSB7XG4gIHZhciBjID0gY215a1swXSAvIDEwMCxcbiAgICAgIG0gPSBjbXlrWzFdIC8gMTAwLFxuICAgICAgeSA9IGNteWtbMl0gLyAxMDAsXG4gICAgICBrID0gY215a1szXSAvIDEwMCxcbiAgICAgIHIsIGcsIGI7XG5cbiAgciA9IDEgLSBNYXRoLm1pbigxLCBjICogKDEgLSBrKSArIGspO1xuICBnID0gMSAtIE1hdGgubWluKDEsIG0gKiAoMSAtIGspICsgayk7XG4gIGIgPSAxIC0gTWF0aC5taW4oMSwgeSAqICgxIC0gaykgKyBrKTtcbiAgcmV0dXJuIFtyICogMjU1LCBnICogMjU1LCBiICogMjU1XTtcbn1cblxuZnVuY3Rpb24gY215azJoc2woYXJncykge1xuICByZXR1cm4gcmdiMmhzbChjbXlrMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGNteWsyaHN2KGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJoc3YoY215azJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBjbXlrMmh3YihhcmdzKSB7XG4gIHJldHVybiByZ2IyaHdiKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24gY215azJrZXl3b3JkKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJrZXl3b3JkKGNteWsycmdiKGFyZ3MpKTtcbn1cblxuXG5mdW5jdGlvbiB4eXoycmdiKHh5eikge1xuICB2YXIgeCA9IHh5elswXSAvIDEwMCxcbiAgICAgIHkgPSB4eXpbMV0gLyAxMDAsXG4gICAgICB6ID0geHl6WzJdIC8gMTAwLFxuICAgICAgciwgZywgYjtcblxuICByID0gKHggKiAzLjI0MDYpICsgKHkgKiAtMS41MzcyKSArICh6ICogLTAuNDk4Nik7XG4gIGcgPSAoeCAqIC0wLjk2ODkpICsgKHkgKiAxLjg3NTgpICsgKHogKiAwLjA0MTUpO1xuICBiID0gKHggKiAwLjA1NTcpICsgKHkgKiAtMC4yMDQwKSArICh6ICogMS4wNTcwKTtcblxuICAvLyBhc3N1bWUgc1JHQlxuICByID0gciA+IDAuMDAzMTMwOCA/ICgoMS4wNTUgKiBNYXRoLnBvdyhyLCAxLjAgLyAyLjQpKSAtIDAuMDU1KVxuICAgIDogciA9IChyICogMTIuOTIpO1xuXG4gIGcgPSBnID4gMC4wMDMxMzA4ID8gKCgxLjA1NSAqIE1hdGgucG93KGcsIDEuMCAvIDIuNCkpIC0gMC4wNTUpXG4gICAgOiBnID0gKGcgKiAxMi45Mik7XG5cbiAgYiA9IGIgPiAwLjAwMzEzMDggPyAoKDEuMDU1ICogTWF0aC5wb3coYiwgMS4wIC8gMi40KSkgLSAwLjA1NSlcbiAgICA6IGIgPSAoYiAqIDEyLjkyKTtcblxuICByID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgciksIDEpO1xuICBnID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgZyksIDEpO1xuICBiID0gTWF0aC5taW4oTWF0aC5tYXgoMCwgYiksIDEpO1xuXG4gIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV07XG59XG5cbmZ1bmN0aW9uIHh5ejJsYWIoeHl6KSB7XG4gIHZhciB4ID0geHl6WzBdLFxuICAgICAgeSA9IHh5elsxXSxcbiAgICAgIHogPSB4eXpbMl0sXG4gICAgICBsLCBhLCBiO1xuXG4gIHggLz0gOTUuMDQ3O1xuICB5IC89IDEwMDtcbiAgeiAvPSAxMDguODgzO1xuXG4gIHggPSB4ID4gMC4wMDg4NTYgPyBNYXRoLnBvdyh4LCAxLzMpIDogKDcuNzg3ICogeCkgKyAoMTYgLyAxMTYpO1xuICB5ID0geSA+IDAuMDA4ODU2ID8gTWF0aC5wb3coeSwgMS8zKSA6ICg3Ljc4NyAqIHkpICsgKDE2IC8gMTE2KTtcbiAgeiA9IHogPiAwLjAwODg1NiA/IE1hdGgucG93KHosIDEvMykgOiAoNy43ODcgKiB6KSArICgxNiAvIDExNik7XG5cbiAgbCA9ICgxMTYgKiB5KSAtIDE2O1xuICBhID0gNTAwICogKHggLSB5KTtcbiAgYiA9IDIwMCAqICh5IC0geik7XG5cbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuZnVuY3Rpb24geHl6MmxjaChhcmdzKSB7XG4gIHJldHVybiBsYWIybGNoKHh5ejJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBsYWIyeHl6KGxhYikge1xuICB2YXIgbCA9IGxhYlswXSxcbiAgICAgIGEgPSBsYWJbMV0sXG4gICAgICBiID0gbGFiWzJdLFxuICAgICAgeCwgeSwgeiwgeTI7XG5cbiAgaWYgKGwgPD0gOCkge1xuICAgIHkgPSAobCAqIDEwMCkgLyA5MDMuMztcbiAgICB5MiA9ICg3Ljc4NyAqICh5IC8gMTAwKSkgKyAoMTYgLyAxMTYpO1xuICB9IGVsc2Uge1xuICAgIHkgPSAxMDAgKiBNYXRoLnBvdygobCArIDE2KSAvIDExNiwgMyk7XG4gICAgeTIgPSBNYXRoLnBvdyh5IC8gMTAwLCAxLzMpO1xuICB9XG5cbiAgeCA9IHggLyA5NS4wNDcgPD0gMC4wMDg4NTYgPyB4ID0gKDk1LjA0NyAqICgoYSAvIDUwMCkgKyB5MiAtICgxNiAvIDExNikpKSAvIDcuNzg3IDogOTUuMDQ3ICogTWF0aC5wb3coKGEgLyA1MDApICsgeTIsIDMpO1xuXG4gIHogPSB6IC8gMTA4Ljg4MyA8PSAwLjAwODg1OSA/IHogPSAoMTA4Ljg4MyAqICh5MiAtIChiIC8gMjAwKSAtICgxNiAvIDExNikpKSAvIDcuNzg3IDogMTA4Ljg4MyAqIE1hdGgucG93KHkyIC0gKGIgLyAyMDApLCAzKTtcblxuICByZXR1cm4gW3gsIHksIHpdO1xufVxuXG5mdW5jdGlvbiBsYWIybGNoKGxhYikge1xuICB2YXIgbCA9IGxhYlswXSxcbiAgICAgIGEgPSBsYWJbMV0sXG4gICAgICBiID0gbGFiWzJdLFxuICAgICAgaHIsIGgsIGM7XG5cbiAgaHIgPSBNYXRoLmF0YW4yKGIsIGEpO1xuICBoID0gaHIgKiAzNjAgLyAyIC8gTWF0aC5QSTtcbiAgaWYgKGggPCAwKSB7XG4gICAgaCArPSAzNjA7XG4gIH1cbiAgYyA9IE1hdGguc3FydChhICogYSArIGIgKiBiKTtcbiAgcmV0dXJuIFtsLCBjLCBoXTtcbn1cblxuZnVuY3Rpb24gbGFiMnJnYihhcmdzKSB7XG4gIHJldHVybiB4eXoycmdiKGxhYjJ4eXooYXJncykpO1xufVxuXG5mdW5jdGlvbiBsY2gybGFiKGxjaCkge1xuICB2YXIgbCA9IGxjaFswXSxcbiAgICAgIGMgPSBsY2hbMV0sXG4gICAgICBoID0gbGNoWzJdLFxuICAgICAgYSwgYiwgaHI7XG5cbiAgaHIgPSBoIC8gMzYwICogMiAqIE1hdGguUEk7XG4gIGEgPSBjICogTWF0aC5jb3MoaHIpO1xuICBiID0gYyAqIE1hdGguc2luKGhyKTtcbiAgcmV0dXJuIFtsLCBhLCBiXTtcbn1cblxuZnVuY3Rpb24gbGNoMnh5eihhcmdzKSB7XG4gIHJldHVybiBsYWIyeHl6KGxjaDJsYWIoYXJncykpO1xufVxuXG5mdW5jdGlvbiBsY2gycmdiKGFyZ3MpIHtcbiAgcmV0dXJuIGxhYjJyZ2IobGNoMmxhYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQycmdiKGtleXdvcmQpIHtcbiAgcmV0dXJuIGNzc0tleXdvcmRzW2tleXdvcmRdO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmhzbChhcmdzKSB7XG4gIHJldHVybiByZ2IyaHNsKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJoc3YoYXJncykge1xuICByZXR1cm4gcmdiMmhzdihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbmZ1bmN0aW9uIGtleXdvcmQyaHdiKGFyZ3MpIHtcbiAgcmV0dXJuIHJnYjJod2Ioa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmNteWsoYXJncykge1xuICByZXR1cm4gcmdiMmNteWsoa2V5d29yZDJyZ2IoYXJncykpO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkMmxhYihhcmdzKSB7XG4gIHJldHVybiByZ2IybGFiKGtleXdvcmQycmdiKGFyZ3MpKTtcbn1cblxuZnVuY3Rpb24ga2V5d29yZDJ4eXooYXJncykge1xuICByZXR1cm4gcmdiMnh5eihrZXl3b3JkMnJnYihhcmdzKSk7XG59XG5cbnZhciBjc3NLZXl3b3JkcyA9IHtcbiAgYWxpY2VibHVlOiAgWzI0MCwyNDgsMjU1XSxcbiAgYW50aXF1ZXdoaXRlOiBbMjUwLDIzNSwyMTVdLFxuICBhcXVhOiBbMCwyNTUsMjU1XSxcbiAgYXF1YW1hcmluZTogWzEyNywyNTUsMjEyXSxcbiAgYXp1cmU6ICBbMjQwLDI1NSwyNTVdLFxuICBiZWlnZTogIFsyNDUsMjQ1LDIyMF0sXG4gIGJpc3F1ZTogWzI1NSwyMjgsMTk2XSxcbiAgYmxhY2s6ICBbMCwwLDBdLFxuICBibGFuY2hlZGFsbW9uZDogWzI1NSwyMzUsMjA1XSxcbiAgYmx1ZTogWzAsMCwyNTVdLFxuICBibHVldmlvbGV0OiBbMTM4LDQzLDIyNl0sXG4gIGJyb3duOiAgWzE2NSw0Miw0Ml0sXG4gIGJ1cmx5d29vZDogIFsyMjIsMTg0LDEzNV0sXG4gIGNhZGV0Ymx1ZTogIFs5NSwxNTgsMTYwXSxcbiAgY2hhcnRyZXVzZTogWzEyNywyNTUsMF0sXG4gIGNob2NvbGF0ZTogIFsyMTAsMTA1LDMwXSxcbiAgY29yYWw6ICBbMjU1LDEyNyw4MF0sXG4gIGNvcm5mbG93ZXJibHVlOiBbMTAwLDE0OSwyMzddLFxuICBjb3Juc2lsazogWzI1NSwyNDgsMjIwXSxcbiAgY3JpbXNvbjogIFsyMjAsMjAsNjBdLFxuICBjeWFuOiBbMCwyNTUsMjU1XSxcbiAgZGFya2JsdWU6IFswLDAsMTM5XSxcbiAgZGFya2N5YW46IFswLDEzOSwxMzldLFxuICBkYXJrZ29sZGVucm9kOiAgWzE4NCwxMzQsMTFdLFxuICBkYXJrZ3JheTogWzE2OSwxNjksMTY5XSxcbiAgZGFya2dyZWVuOiAgWzAsMTAwLDBdLFxuICBkYXJrZ3JleTogWzE2OSwxNjksMTY5XSxcbiAgZGFya2toYWtpOiAgWzE4OSwxODMsMTA3XSxcbiAgZGFya21hZ2VudGE6ICBbMTM5LDAsMTM5XSxcbiAgZGFya29saXZlZ3JlZW46IFs4NSwxMDcsNDddLFxuICBkYXJrb3JhbmdlOiBbMjU1LDE0MCwwXSxcbiAgZGFya29yY2hpZDogWzE1Myw1MCwyMDRdLFxuICBkYXJrcmVkOiAgWzEzOSwwLDBdLFxuICBkYXJrc2FsbW9uOiBbMjMzLDE1MCwxMjJdLFxuICBkYXJrc2VhZ3JlZW46IFsxNDMsMTg4LDE0M10sXG4gIGRhcmtzbGF0ZWJsdWU6ICBbNzIsNjEsMTM5XSxcbiAgZGFya3NsYXRlZ3JheTogIFs0Nyw3OSw3OV0sXG4gIGRhcmtzbGF0ZWdyZXk6ICBbNDcsNzksNzldLFxuICBkYXJrdHVycXVvaXNlOiAgWzAsMjA2LDIwOV0sXG4gIGRhcmt2aW9sZXQ6IFsxNDgsMCwyMTFdLFxuICBkZWVwcGluazogWzI1NSwyMCwxNDddLFxuICBkZWVwc2t5Ymx1ZTogIFswLDE5MSwyNTVdLFxuICBkaW1ncmF5OiAgWzEwNSwxMDUsMTA1XSxcbiAgZGltZ3JleTogIFsxMDUsMTA1LDEwNV0sXG4gIGRvZGdlcmJsdWU6IFszMCwxNDQsMjU1XSxcbiAgZmlyZWJyaWNrOiAgWzE3OCwzNCwzNF0sXG4gIGZsb3JhbHdoaXRlOiAgWzI1NSwyNTAsMjQwXSxcbiAgZm9yZXN0Z3JlZW46ICBbMzQsMTM5LDM0XSxcbiAgZnVjaHNpYTogIFsyNTUsMCwyNTVdLFxuICBnYWluc2Jvcm86ICBbMjIwLDIyMCwyMjBdLFxuICBnaG9zdHdoaXRlOiBbMjQ4LDI0OCwyNTVdLFxuICBnb2xkOiBbMjU1LDIxNSwwXSxcbiAgZ29sZGVucm9kOiAgWzIxOCwxNjUsMzJdLFxuICBncmF5OiBbMTI4LDEyOCwxMjhdLFxuICBncmVlbjogIFswLDEyOCwwXSxcbiAgZ3JlZW55ZWxsb3c6ICBbMTczLDI1NSw0N10sXG4gIGdyZXk6IFsxMjgsMTI4LDEyOF0sXG4gIGhvbmV5ZGV3OiBbMjQwLDI1NSwyNDBdLFxuICBob3RwaW5rOiAgWzI1NSwxMDUsMTgwXSxcbiAgaW5kaWFucmVkOiAgWzIwNSw5Miw5Ml0sXG4gIGluZGlnbzogWzc1LDAsMTMwXSxcbiAgaXZvcnk6ICBbMjU1LDI1NSwyNDBdLFxuICBraGFraTogIFsyNDAsMjMwLDE0MF0sXG4gIGxhdmVuZGVyOiBbMjMwLDIzMCwyNTBdLFxuICBsYXZlbmRlcmJsdXNoOiAgWzI1NSwyNDAsMjQ1XSxcbiAgbGF3bmdyZWVuOiAgWzEyNCwyNTIsMF0sXG4gIGxlbW9uY2hpZmZvbjogWzI1NSwyNTAsMjA1XSxcbiAgbGlnaHRibHVlOiAgWzE3MywyMTYsMjMwXSxcbiAgbGlnaHRjb3JhbDogWzI0MCwxMjgsMTI4XSxcbiAgbGlnaHRjeWFuOiAgWzIyNCwyNTUsMjU1XSxcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFsyNTAsMjUwLDIxMF0sXG4gIGxpZ2h0Z3JheTogIFsyMTEsMjExLDIxMV0sXG4gIGxpZ2h0Z3JlZW46IFsxNDQsMjM4LDE0NF0sXG4gIGxpZ2h0Z3JleTogIFsyMTEsMjExLDIxMV0sXG4gIGxpZ2h0cGluazogIFsyNTUsMTgyLDE5M10sXG4gIGxpZ2h0c2FsbW9uOiAgWzI1NSwxNjAsMTIyXSxcbiAgbGlnaHRzZWFncmVlbjogIFszMiwxNzgsMTcwXSxcbiAgbGlnaHRza3libHVlOiBbMTM1LDIwNiwyNTBdLFxuICBsaWdodHNsYXRlZ3JheTogWzExOSwxMzYsMTUzXSxcbiAgbGlnaHRzbGF0ZWdyZXk6IFsxMTksMTM2LDE1M10sXG4gIGxpZ2h0c3RlZWxibHVlOiBbMTc2LDE5NiwyMjJdLFxuICBsaWdodHllbGxvdzogIFsyNTUsMjU1LDIyNF0sXG4gIGxpbWU6IFswLDI1NSwwXSxcbiAgbGltZWdyZWVuOiAgWzUwLDIwNSw1MF0sXG4gIGxpbmVuOiAgWzI1MCwyNDAsMjMwXSxcbiAgbWFnZW50YTogIFsyNTUsMCwyNTVdLFxuICBtYXJvb246IFsxMjgsMCwwXSxcbiAgbWVkaXVtYXF1YW1hcmluZTogWzEwMiwyMDUsMTcwXSxcbiAgbWVkaXVtYmx1ZTogWzAsMCwyMDVdLFxuICBtZWRpdW1vcmNoaWQ6IFsxODYsODUsMjExXSxcbiAgbWVkaXVtcHVycGxlOiBbMTQ3LDExMiwyMTldLFxuICBtZWRpdW1zZWFncmVlbjogWzYwLDE3OSwxMTNdLFxuICBtZWRpdW1zbGF0ZWJsdWU6ICBbMTIzLDEwNCwyMzhdLFxuICBtZWRpdW1zcHJpbmdncmVlbjogIFswLDI1MCwxNTRdLFxuICBtZWRpdW10dXJxdW9pc2U6ICBbNzIsMjA5LDIwNF0sXG4gIG1lZGl1bXZpb2xldHJlZDogIFsxOTksMjEsMTMzXSxcbiAgbWlkbmlnaHRibHVlOiBbMjUsMjUsMTEyXSxcbiAgbWludGNyZWFtOiAgWzI0NSwyNTUsMjUwXSxcbiAgbWlzdHlyb3NlOiAgWzI1NSwyMjgsMjI1XSxcbiAgbW9jY2FzaW46IFsyNTUsMjI4LDE4MV0sXG4gIG5hdmFqb3doaXRlOiAgWzI1NSwyMjIsMTczXSxcbiAgbmF2eTogWzAsMCwxMjhdLFxuICBvbGRsYWNlOiAgWzI1MywyNDUsMjMwXSxcbiAgb2xpdmU6ICBbMTI4LDEyOCwwXSxcbiAgb2xpdmVkcmFiOiAgWzEwNywxNDIsMzVdLFxuICBvcmFuZ2U6IFsyNTUsMTY1LDBdLFxuICBvcmFuZ2VyZWQ6ICBbMjU1LDY5LDBdLFxuICBvcmNoaWQ6IFsyMTgsMTEyLDIxNF0sXG4gIHBhbGVnb2xkZW5yb2Q6ICBbMjM4LDIzMiwxNzBdLFxuICBwYWxlZ3JlZW46ICBbMTUyLDI1MSwxNTJdLFxuICBwYWxldHVycXVvaXNlOiAgWzE3NSwyMzgsMjM4XSxcbiAgcGFsZXZpb2xldHJlZDogIFsyMTksMTEyLDE0N10sXG4gIHBhcGF5YXdoaXA6IFsyNTUsMjM5LDIxM10sXG4gIHBlYWNocHVmZjogIFsyNTUsMjE4LDE4NV0sXG4gIHBlcnU6IFsyMDUsMTMzLDYzXSxcbiAgcGluazogWzI1NSwxOTIsMjAzXSxcbiAgcGx1bTogWzIyMSwxNjAsMjIxXSxcbiAgcG93ZGVyYmx1ZTogWzE3NiwyMjQsMjMwXSxcbiAgcHVycGxlOiBbMTI4LDAsMTI4XSxcbiAgcmViZWNjYXB1cnBsZTogWzEwMiwgNTEsIDE1M10sXG4gIHJlZDogIFsyNTUsMCwwXSxcbiAgcm9zeWJyb3duOiAgWzE4OCwxNDMsMTQzXSxcbiAgcm95YWxibHVlOiAgWzY1LDEwNSwyMjVdLFxuICBzYWRkbGVicm93bjogIFsxMzksNjksMTldLFxuICBzYWxtb246IFsyNTAsMTI4LDExNF0sXG4gIHNhbmR5YnJvd246IFsyNDQsMTY0LDk2XSxcbiAgc2VhZ3JlZW46IFs0NiwxMzksODddLFxuICBzZWFzaGVsbDogWzI1NSwyNDUsMjM4XSxcbiAgc2llbm5hOiBbMTYwLDgyLDQ1XSxcbiAgc2lsdmVyOiBbMTkyLDE5MiwxOTJdLFxuICBza3libHVlOiAgWzEzNSwyMDYsMjM1XSxcbiAgc2xhdGVibHVlOiAgWzEwNiw5MCwyMDVdLFxuICBzbGF0ZWdyYXk6ICBbMTEyLDEyOCwxNDRdLFxuICBzbGF0ZWdyZXk6ICBbMTEyLDEyOCwxNDRdLFxuICBzbm93OiBbMjU1LDI1MCwyNTBdLFxuICBzcHJpbmdncmVlbjogIFswLDI1NSwxMjddLFxuICBzdGVlbGJsdWU6ICBbNzAsMTMwLDE4MF0sXG4gIHRhbjogIFsyMTAsMTgwLDE0MF0sXG4gIHRlYWw6IFswLDEyOCwxMjhdLFxuICB0aGlzdGxlOiAgWzIxNiwxOTEsMjE2XSxcbiAgdG9tYXRvOiBbMjU1LDk5LDcxXSxcbiAgdHVycXVvaXNlOiAgWzY0LDIyNCwyMDhdLFxuICB2aW9sZXQ6IFsyMzgsMTMwLDIzOF0sXG4gIHdoZWF0OiAgWzI0NSwyMjIsMTc5XSxcbiAgd2hpdGU6ICBbMjU1LDI1NSwyNTVdLFxuICB3aGl0ZXNtb2tlOiBbMjQ1LDI0NSwyNDVdLFxuICB5ZWxsb3c6IFsyNTUsMjU1LDBdLFxuICB5ZWxsb3dncmVlbjogIFsxNTQsMjA1LDUwXVxufTtcblxudmFyIHJldmVyc2VLZXl3b3JkcyA9IHt9O1xuZm9yICh2YXIga2V5IGluIGNzc0tleXdvcmRzKSB7XG4gIHJldmVyc2VLZXl3b3Jkc1tKU09OLnN0cmluZ2lmeShjc3NLZXl3b3Jkc1trZXldKV0gPSBrZXk7XG59XG4iLCJ2YXIgY29udmVyc2lvbnMgPSByZXF1aXJlKFwiLi9jb252ZXJzaW9uc1wiKTtcblxudmFyIGNvbnZlcnQgPSBmdW5jdGlvbigpIHtcbiAgIHJldHVybiBuZXcgQ29udmVydGVyKCk7XG59XG5cbmZvciAodmFyIGZ1bmMgaW4gY29udmVyc2lvbnMpIHtcbiAgLy8gZXhwb3J0IFJhdyB2ZXJzaW9uc1xuICBjb252ZXJ0W2Z1bmMgKyBcIlJhd1wiXSA9ICAoZnVuY3Rpb24oZnVuYykge1xuICAgIC8vIGFjY2VwdCBhcnJheSBvciBwbGFpbiBhcmdzXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHR5cGVvZiBhcmcgPT0gXCJudW1iZXJcIilcbiAgICAgICAgYXJnID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjb252ZXJzaW9uc1tmdW5jXShhcmcpO1xuICAgIH1cbiAgfSkoZnVuYyk7XG5cbiAgdmFyIHBhaXIgPSAvKFxcdyspMihcXHcrKS8uZXhlYyhmdW5jKSxcbiAgICAgIGZyb20gPSBwYWlyWzFdLFxuICAgICAgdG8gPSBwYWlyWzJdO1xuXG4gIC8vIGV4cG9ydCByZ2IyaHNsIGFuZCBbXCJyZ2JcIl1bXCJoc2xcIl1cbiAgY29udmVydFtmcm9tXSA9IGNvbnZlcnRbZnJvbV0gfHwge307XG5cbiAgY29udmVydFtmcm9tXVt0b10gPSBjb252ZXJ0W2Z1bmNdID0gKGZ1bmN0aW9uKGZ1bmMpIHsgXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgICAgaWYgKHR5cGVvZiBhcmcgPT0gXCJudW1iZXJcIilcbiAgICAgICAgYXJnID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIFxuICAgICAgdmFyIHZhbCA9IGNvbnZlcnNpb25zW2Z1bmNdKGFyZyk7XG4gICAgICBpZiAodHlwZW9mIHZhbCA9PSBcInN0cmluZ1wiIHx8IHZhbCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdmFsOyAvLyBrZXl3b3JkXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsLmxlbmd0aDsgaSsrKVxuICAgICAgICB2YWxbaV0gPSBNYXRoLnJvdW5kKHZhbFtpXSk7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgfSkoZnVuYyk7XG59XG5cblxuLyogQ29udmVydGVyIGRvZXMgbGF6eSBjb252ZXJzaW9uIGFuZCBjYWNoaW5nICovXG52YXIgQ29udmVydGVyID0gZnVuY3Rpb24oKSB7XG4gICB0aGlzLmNvbnZzID0ge307XG59O1xuXG4vKiBFaXRoZXIgZ2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2Ugb3JcbiAgc2V0IHRoZSB2YWx1ZXMgZm9yIGEgc3BhY2UsIGRlcGVuZGluZyBvbiBhcmdzICovXG5Db252ZXJ0ZXIucHJvdG90eXBlLnJvdXRlU3BhY2UgPSBmdW5jdGlvbihzcGFjZSwgYXJncykge1xuICAgdmFyIHZhbHVlcyA9IGFyZ3NbMF07XG4gICBpZiAodmFsdWVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGNvbG9yLnJnYigpXG4gICAgICByZXR1cm4gdGhpcy5nZXRWYWx1ZXMoc3BhY2UpO1xuICAgfVxuICAgLy8gY29sb3IucmdiKDEwLCAxMCwgMTApXG4gICBpZiAodHlwZW9mIHZhbHVlcyA9PSBcIm51bWJlclwiKSB7XG4gICAgICB2YWx1ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzKTsgICAgICAgIFxuICAgfVxuXG4gICByZXR1cm4gdGhpcy5zZXRWYWx1ZXMoc3BhY2UsIHZhbHVlcyk7XG59O1xuICBcbi8qIFNldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLCBpbnZhbGlkYXRpbmcgY2FjaGUgKi9cbkNvbnZlcnRlci5wcm90b3R5cGUuc2V0VmFsdWVzID0gZnVuY3Rpb24oc3BhY2UsIHZhbHVlcykge1xuICAgdGhpcy5zcGFjZSA9IHNwYWNlO1xuICAgdGhpcy5jb252cyA9IHt9O1xuICAgdGhpcy5jb252c1tzcGFjZV0gPSB2YWx1ZXM7XG4gICByZXR1cm4gdGhpcztcbn07XG5cbi8qIEdldCB0aGUgdmFsdWVzIGZvciBhIHNwYWNlLiBJZiB0aGVyZSdzIGFscmVhZHlcbiAgYSBjb252ZXJzaW9uIGZvciB0aGUgc3BhY2UsIGZldGNoIGl0LCBvdGhlcndpc2VcbiAgY29tcHV0ZSBpdCAqL1xuQ29udmVydGVyLnByb3RvdHlwZS5nZXRWYWx1ZXMgPSBmdW5jdGlvbihzcGFjZSkge1xuICAgdmFyIHZhbHMgPSB0aGlzLmNvbnZzW3NwYWNlXTtcbiAgIGlmICghdmFscykge1xuICAgICAgdmFyIGZzcGFjZSA9IHRoaXMuc3BhY2UsXG4gICAgICAgICAgZnJvbSA9IHRoaXMuY29udnNbZnNwYWNlXTtcbiAgICAgIHZhbHMgPSBjb252ZXJ0W2ZzcGFjZV1bc3BhY2VdKGZyb20pO1xuXG4gICAgICB0aGlzLmNvbnZzW3NwYWNlXSA9IHZhbHM7XG4gICB9XG4gIHJldHVybiB2YWxzO1xufTtcblxuW1wicmdiXCIsIFwiaHNsXCIsIFwiaHN2XCIsIFwiY215a1wiLCBcImtleXdvcmRcIl0uZm9yRWFjaChmdW5jdGlvbihzcGFjZSkge1xuICAgQ29udmVydGVyLnByb3RvdHlwZVtzcGFjZV0gPSBmdW5jdGlvbih2YWxzKSB7XG4gICAgICByZXR1cm4gdGhpcy5yb3V0ZVNwYWNlKHNwYWNlLCBhcmd1bWVudHMpO1xuICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udmVydDsiLCIvKiBNSVQgbGljZW5zZSAqL1xudmFyIGNvbG9yTmFtZXMgPSByZXF1aXJlKCdjb2xvci1uYW1lJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgZ2V0UmdiYTogZ2V0UmdiYSxcbiAgIGdldEhzbGE6IGdldEhzbGEsXG4gICBnZXRSZ2I6IGdldFJnYixcbiAgIGdldEhzbDogZ2V0SHNsLFxuICAgZ2V0SHdiOiBnZXRId2IsXG4gICBnZXRBbHBoYTogZ2V0QWxwaGEsXG5cbiAgIGhleFN0cmluZzogaGV4U3RyaW5nLFxuICAgcmdiU3RyaW5nOiByZ2JTdHJpbmcsXG4gICByZ2JhU3RyaW5nOiByZ2JhU3RyaW5nLFxuICAgcGVyY2VudFN0cmluZzogcGVyY2VudFN0cmluZyxcbiAgIHBlcmNlbnRhU3RyaW5nOiBwZXJjZW50YVN0cmluZyxcbiAgIGhzbFN0cmluZzogaHNsU3RyaW5nLFxuICAgaHNsYVN0cmluZzogaHNsYVN0cmluZyxcbiAgIGh3YlN0cmluZzogaHdiU3RyaW5nLFxuICAga2V5d29yZDoga2V5d29yZFxufVxuXG5mdW5jdGlvbiBnZXRSZ2JhKHN0cmluZykge1xuICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgIH1cbiAgIHZhciBhYmJyID0gIC9eIyhbYS1mQS1GMC05XXszfSkkLyxcbiAgICAgICBoZXggPSAgL14jKFthLWZBLUYwLTldezZ9KSQvLFxuICAgICAgIHJnYmEgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1xcZCspXFxzKixcXHMqKFsrLV0/XFxkKylcXHMqLFxccyooWystXT9cXGQrKVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLyxcbiAgICAgICBwZXIgPSAvXnJnYmE/XFwoXFxzKihbKy1dP1tcXGRcXC5dKylcXCVcXHMqLFxccyooWystXT9bXFxkXFwuXSspXFwlXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKVxcJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkkLyxcbiAgICAgICBrZXl3b3JkID0gLyhcXEQrKS87XG5cbiAgIHZhciByZ2IgPSBbMCwgMCwgMF0sXG4gICAgICAgYSA9IDEsXG4gICAgICAgbWF0Y2ggPSBzdHJpbmcubWF0Y2goYWJicik7XG4gICBpZiAobWF0Y2gpIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hbMV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJnYi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgcmdiW2ldID0gcGFyc2VJbnQobWF0Y2hbaV0gKyBtYXRjaFtpXSwgMTYpO1xuICAgICAgfVxuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2goaGV4KSkge1xuICAgICAgbWF0Y2ggPSBtYXRjaFsxXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBwYXJzZUludChtYXRjaC5zbGljZShpICogMiwgaSAqIDIgKyAyKSwgMTYpO1xuICAgICAgfVxuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocmdiYSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmdiLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICByZ2JbaV0gPSBwYXJzZUludChtYXRjaFtpICsgMV0pO1xuICAgICAgfVxuICAgICAgYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgfVxuICAgZWxzZSBpZiAobWF0Y2ggPSBzdHJpbmcubWF0Y2gocGVyKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgIHJnYltpXSA9IE1hdGgucm91bmQocGFyc2VGbG9hdChtYXRjaFtpICsgMV0pICogMi41NSk7XG4gICAgICB9XG4gICAgICBhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICB9XG4gICBlbHNlIGlmIChtYXRjaCA9IHN0cmluZy5tYXRjaChrZXl3b3JkKSkge1xuICAgICAgaWYgKG1hdGNoWzFdID09IFwidHJhbnNwYXJlbnRcIikge1xuICAgICAgICAgcmV0dXJuIFswLCAwLCAwLCAwXTtcbiAgICAgIH1cbiAgICAgIHJnYiA9IGNvbG9yTmFtZXNbbWF0Y2hbMV1dO1xuICAgICAgaWYgKCFyZ2IpIHtcbiAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgIH1cblxuICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZ2IubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJnYltpXSA9IHNjYWxlKHJnYltpXSwgMCwgMjU1KTtcbiAgIH1cbiAgIGlmICghYSAmJiBhICE9IDApIHtcbiAgICAgIGEgPSAxO1xuICAgfVxuICAgZWxzZSB7XG4gICAgICBhID0gc2NhbGUoYSwgMCwgMSk7XG4gICB9XG4gICByZ2JbM10gPSBhO1xuICAgcmV0dXJuIHJnYjtcbn1cblxuZnVuY3Rpb24gZ2V0SHNsYShzdHJpbmcpIHtcbiAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICB9XG4gICB2YXIgaHNsID0gL15oc2xhP1xcKFxccyooWystXT9cXGQrKSg/OmRlZyk/XFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqLFxccyooWystXT9bXFxkXFwuXSspJVxccyooPzosXFxzKihbKy1dP1tcXGRcXC5dKylcXHMqKT9cXCkvO1xuICAgdmFyIG1hdGNoID0gc3RyaW5nLm1hdGNoKGhzbCk7XG4gICBpZiAobWF0Y2gpIHtcbiAgICAgIHZhciBhbHBoYSA9IHBhcnNlRmxvYXQobWF0Y2hbNF0pO1xuICAgICAgdmFyIGggPSBzY2FsZShwYXJzZUludChtYXRjaFsxXSksIDAsIDM2MCksXG4gICAgICAgICAgcyA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbMl0pLCAwLCAxMDApLFxuICAgICAgICAgIGwgPSBzY2FsZShwYXJzZUZsb2F0KG1hdGNoWzNdKSwgMCwgMTAwKSxcbiAgICAgICAgICBhID0gc2NhbGUoaXNOYU4oYWxwaGEpID8gMSA6IGFscGhhLCAwLCAxKTtcbiAgICAgIHJldHVybiBbaCwgcywgbCwgYV07XG4gICB9XG59XG5cbmZ1bmN0aW9uIGdldEh3YihzdHJpbmcpIHtcbiAgIGlmICghc3RyaW5nKSB7XG4gICAgICByZXR1cm47XG4gICB9XG4gICB2YXIgaHdiID0gL15od2JcXChcXHMqKFsrLV0/XFxkKykoPzpkZWcpP1xccyosXFxzKihbKy1dP1tcXGRcXC5dKyklXFxzKixcXHMqKFsrLV0/W1xcZFxcLl0rKSVcXHMqKD86LFxccyooWystXT9bXFxkXFwuXSspXFxzKik/XFwpLztcbiAgIHZhciBtYXRjaCA9IHN0cmluZy5tYXRjaChod2IpO1xuICAgaWYgKG1hdGNoKSB7XG4gICAgdmFyIGFscGhhID0gcGFyc2VGbG9hdChtYXRjaFs0XSk7XG4gICAgICB2YXIgaCA9IHNjYWxlKHBhcnNlSW50KG1hdGNoWzFdKSwgMCwgMzYwKSxcbiAgICAgICAgICB3ID0gc2NhbGUocGFyc2VGbG9hdChtYXRjaFsyXSksIDAsIDEwMCksXG4gICAgICAgICAgYiA9IHNjYWxlKHBhcnNlRmxvYXQobWF0Y2hbM10pLCAwLCAxMDApLFxuICAgICAgICAgIGEgPSBzY2FsZShpc05hTihhbHBoYSkgPyAxIDogYWxwaGEsIDAsIDEpO1xuICAgICAgcmV0dXJuIFtoLCB3LCBiLCBhXTtcbiAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmdiKHN0cmluZykge1xuICAgdmFyIHJnYmEgPSBnZXRSZ2JhKHN0cmluZyk7XG4gICByZXR1cm4gcmdiYSAmJiByZ2JhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRIc2woc3RyaW5nKSB7XG4gIHZhciBoc2xhID0gZ2V0SHNsYShzdHJpbmcpO1xuICByZXR1cm4gaHNsYSAmJiBoc2xhLnNsaWNlKDAsIDMpO1xufVxuXG5mdW5jdGlvbiBnZXRBbHBoYShzdHJpbmcpIHtcbiAgIHZhciB2YWxzID0gZ2V0UmdiYShzdHJpbmcpO1xuICAgaWYgKHZhbHMpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxuICAgZWxzZSBpZiAodmFscyA9IGdldEhzbGEoc3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHZhbHNbM107XG4gICB9XG4gICBlbHNlIGlmICh2YWxzID0gZ2V0SHdiKHN0cmluZykpIHtcbiAgICAgIHJldHVybiB2YWxzWzNdO1xuICAgfVxufVxuXG4vLyBnZW5lcmF0b3JzXG5mdW5jdGlvbiBoZXhTdHJpbmcocmdiKSB7XG4gICByZXR1cm4gXCIjXCIgKyBoZXhEb3VibGUocmdiWzBdKSArIGhleERvdWJsZShyZ2JbMV0pXG4gICAgICAgICAgICAgICsgaGV4RG91YmxlKHJnYlsyXSk7XG59XG5cbmZ1bmN0aW9uIHJnYlN0cmluZyhyZ2JhLCBhbHBoYSkge1xuICAgaWYgKGFscGhhIDwgMSB8fCAocmdiYVszXSAmJiByZ2JhWzNdIDwgMSkpIHtcbiAgICAgIHJldHVybiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKTtcbiAgIH1cbiAgIHJldHVybiBcInJnYihcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiByZ2JhU3RyaW5nKHJnYmEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAocmdiYVszXSAhPT0gdW5kZWZpbmVkID8gcmdiYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwicmdiYShcIiArIHJnYmFbMF0gKyBcIiwgXCIgKyByZ2JhWzFdICsgXCIsIFwiICsgcmdiYVsyXVxuICAgICAgICAgICArIFwiLCBcIiArIGFscGhhICsgXCIpXCI7XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKHJnYmFbM10gJiYgcmdiYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpO1xuICAgfVxuICAgdmFyIHIgPSBNYXRoLnJvdW5kKHJnYmFbMF0vMjU1ICogMTAwKSxcbiAgICAgICBnID0gTWF0aC5yb3VuZChyZ2JhWzFdLzI1NSAqIDEwMCksXG4gICAgICAgYiA9IE1hdGgucm91bmQocmdiYVsyXS8yNTUgKiAxMDApO1xuXG4gICByZXR1cm4gXCJyZ2IoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSlcIjtcbn1cblxuZnVuY3Rpb24gcGVyY2VudGFTdHJpbmcocmdiYSwgYWxwaGEpIHtcbiAgIHZhciByID0gTWF0aC5yb3VuZChyZ2JhWzBdLzI1NSAqIDEwMCksXG4gICAgICAgZyA9IE1hdGgucm91bmQocmdiYVsxXS8yNTUgKiAxMDApLFxuICAgICAgIGIgPSBNYXRoLnJvdW5kKHJnYmFbMl0vMjU1ICogMTAwKTtcbiAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIlLCBcIiArIGcgKyBcIiUsIFwiICsgYiArIFwiJSwgXCIgKyAoYWxwaGEgfHwgcmdiYVszXSB8fCAxKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xTdHJpbmcoaHNsYSwgYWxwaGEpIHtcbiAgIGlmIChhbHBoYSA8IDEgfHwgKGhzbGFbM10gJiYgaHNsYVszXSA8IDEpKSB7XG4gICAgICByZXR1cm4gaHNsYVN0cmluZyhoc2xhLCBhbHBoYSk7XG4gICB9XG4gICByZXR1cm4gXCJoc2woXCIgKyBoc2xhWzBdICsgXCIsIFwiICsgaHNsYVsxXSArIFwiJSwgXCIgKyBoc2xhWzJdICsgXCIlKVwiO1xufVxuXG5mdW5jdGlvbiBoc2xhU3RyaW5nKGhzbGEsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHNsYVszXSAhPT0gdW5kZWZpbmVkID8gaHNsYVszXSA6IDEpO1xuICAgfVxuICAgcmV0dXJuIFwiaHNsYShcIiArIGhzbGFbMF0gKyBcIiwgXCIgKyBoc2xhWzFdICsgXCIlLCBcIiArIGhzbGFbMl0gKyBcIiUsIFwiXG4gICAgICAgICAgICsgYWxwaGEgKyBcIilcIjtcbn1cblxuLy8gaHdiIGlzIGEgYml0IGRpZmZlcmVudCB0aGFuIHJnYihhKSAmIGhzbChhKSBzaW5jZSB0aGVyZSBpcyBubyBhbHBoYSBzcGVjaWZpYyBzeW50YXhcbi8vIChod2IgaGF2ZSBhbHBoYSBvcHRpb25hbCAmIDEgaXMgZGVmYXVsdCB2YWx1ZSlcbmZ1bmN0aW9uIGh3YlN0cmluZyhod2IsIGFscGhhKSB7XG4gICBpZiAoYWxwaGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYWxwaGEgPSAoaHdiWzNdICE9PSB1bmRlZmluZWQgPyBod2JbM10gOiAxKTtcbiAgIH1cbiAgIHJldHVybiBcImh3YihcIiArIGh3YlswXSArIFwiLCBcIiArIGh3YlsxXSArIFwiJSwgXCIgKyBod2JbMl0gKyBcIiVcIlxuICAgICAgICAgICArIChhbHBoYSAhPT0gdW5kZWZpbmVkICYmIGFscGhhICE9PSAxID8gXCIsIFwiICsgYWxwaGEgOiBcIlwiKSArIFwiKVwiO1xufVxuXG5mdW5jdGlvbiBrZXl3b3JkKHJnYikge1xuICByZXR1cm4gcmV2ZXJzZU5hbWVzW3JnYi5zbGljZSgwLCAzKV07XG59XG5cbi8vIGhlbHBlcnNcbmZ1bmN0aW9uIHNjYWxlKG51bSwgbWluLCBtYXgpIHtcbiAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtaW4sIG51bSksIG1heCk7XG59XG5cbmZ1bmN0aW9uIGhleERvdWJsZShudW0pIHtcbiAgdmFyIHN0ciA9IG51bS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIChzdHIubGVuZ3RoIDwgMikgPyBcIjBcIiArIHN0ciA6IHN0cjtcbn1cblxuXG4vL2NyZWF0ZSBhIGxpc3Qgb2YgcmV2ZXJzZSBjb2xvciBuYW1lc1xudmFyIHJldmVyc2VOYW1lcyA9IHt9O1xuZm9yICh2YXIgbmFtZSBpbiBjb2xvck5hbWVzKSB7XG4gICByZXZlcnNlTmFtZXNbY29sb3JOYW1lc1tuYW1lXV0gPSBuYW1lO1xufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xyXG5cdFwiYWxpY2VibHVlXCI6IFsyNDAsIDI0OCwgMjU1XSxcclxuXHRcImFudGlxdWV3aGl0ZVwiOiBbMjUwLCAyMzUsIDIxNV0sXHJcblx0XCJhcXVhXCI6IFswLCAyNTUsIDI1NV0sXHJcblx0XCJhcXVhbWFyaW5lXCI6IFsxMjcsIDI1NSwgMjEyXSxcclxuXHRcImF6dXJlXCI6IFsyNDAsIDI1NSwgMjU1XSxcclxuXHRcImJlaWdlXCI6IFsyNDUsIDI0NSwgMjIwXSxcclxuXHRcImJpc3F1ZVwiOiBbMjU1LCAyMjgsIDE5Nl0sXHJcblx0XCJibGFja1wiOiBbMCwgMCwgMF0sXHJcblx0XCJibGFuY2hlZGFsbW9uZFwiOiBbMjU1LCAyMzUsIDIwNV0sXHJcblx0XCJibHVlXCI6IFswLCAwLCAyNTVdLFxyXG5cdFwiYmx1ZXZpb2xldFwiOiBbMTM4LCA0MywgMjI2XSxcclxuXHRcImJyb3duXCI6IFsxNjUsIDQyLCA0Ml0sXHJcblx0XCJidXJseXdvb2RcIjogWzIyMiwgMTg0LCAxMzVdLFxyXG5cdFwiY2FkZXRibHVlXCI6IFs5NSwgMTU4LCAxNjBdLFxyXG5cdFwiY2hhcnRyZXVzZVwiOiBbMTI3LCAyNTUsIDBdLFxyXG5cdFwiY2hvY29sYXRlXCI6IFsyMTAsIDEwNSwgMzBdLFxyXG5cdFwiY29yYWxcIjogWzI1NSwgMTI3LCA4MF0sXHJcblx0XCJjb3JuZmxvd2VyYmx1ZVwiOiBbMTAwLCAxNDksIDIzN10sXHJcblx0XCJjb3Juc2lsa1wiOiBbMjU1LCAyNDgsIDIyMF0sXHJcblx0XCJjcmltc29uXCI6IFsyMjAsIDIwLCA2MF0sXHJcblx0XCJjeWFuXCI6IFswLCAyNTUsIDI1NV0sXHJcblx0XCJkYXJrYmx1ZVwiOiBbMCwgMCwgMTM5XSxcclxuXHRcImRhcmtjeWFuXCI6IFswLCAxMzksIDEzOV0sXHJcblx0XCJkYXJrZ29sZGVucm9kXCI6IFsxODQsIDEzNCwgMTFdLFxyXG5cdFwiZGFya2dyYXlcIjogWzE2OSwgMTY5LCAxNjldLFxyXG5cdFwiZGFya2dyZWVuXCI6IFswLCAxMDAsIDBdLFxyXG5cdFwiZGFya2dyZXlcIjogWzE2OSwgMTY5LCAxNjldLFxyXG5cdFwiZGFya2toYWtpXCI6IFsxODksIDE4MywgMTA3XSxcclxuXHRcImRhcmttYWdlbnRhXCI6IFsxMzksIDAsIDEzOV0sXHJcblx0XCJkYXJrb2xpdmVncmVlblwiOiBbODUsIDEwNywgNDddLFxyXG5cdFwiZGFya29yYW5nZVwiOiBbMjU1LCAxNDAsIDBdLFxyXG5cdFwiZGFya29yY2hpZFwiOiBbMTUzLCA1MCwgMjA0XSxcclxuXHRcImRhcmtyZWRcIjogWzEzOSwgMCwgMF0sXHJcblx0XCJkYXJrc2FsbW9uXCI6IFsyMzMsIDE1MCwgMTIyXSxcclxuXHRcImRhcmtzZWFncmVlblwiOiBbMTQzLCAxODgsIDE0M10sXHJcblx0XCJkYXJrc2xhdGVibHVlXCI6IFs3MiwgNjEsIDEzOV0sXHJcblx0XCJkYXJrc2xhdGVncmF5XCI6IFs0NywgNzksIDc5XSxcclxuXHRcImRhcmtzbGF0ZWdyZXlcIjogWzQ3LCA3OSwgNzldLFxyXG5cdFwiZGFya3R1cnF1b2lzZVwiOiBbMCwgMjA2LCAyMDldLFxyXG5cdFwiZGFya3Zpb2xldFwiOiBbMTQ4LCAwLCAyMTFdLFxyXG5cdFwiZGVlcHBpbmtcIjogWzI1NSwgMjAsIDE0N10sXHJcblx0XCJkZWVwc2t5Ymx1ZVwiOiBbMCwgMTkxLCAyNTVdLFxyXG5cdFwiZGltZ3JheVwiOiBbMTA1LCAxMDUsIDEwNV0sXHJcblx0XCJkaW1ncmV5XCI6IFsxMDUsIDEwNSwgMTA1XSxcclxuXHRcImRvZGdlcmJsdWVcIjogWzMwLCAxNDQsIDI1NV0sXHJcblx0XCJmaXJlYnJpY2tcIjogWzE3OCwgMzQsIDM0XSxcclxuXHRcImZsb3JhbHdoaXRlXCI6IFsyNTUsIDI1MCwgMjQwXSxcclxuXHRcImZvcmVzdGdyZWVuXCI6IFszNCwgMTM5LCAzNF0sXHJcblx0XCJmdWNoc2lhXCI6IFsyNTUsIDAsIDI1NV0sXHJcblx0XCJnYWluc2Jvcm9cIjogWzIyMCwgMjIwLCAyMjBdLFxyXG5cdFwiZ2hvc3R3aGl0ZVwiOiBbMjQ4LCAyNDgsIDI1NV0sXHJcblx0XCJnb2xkXCI6IFsyNTUsIDIxNSwgMF0sXHJcblx0XCJnb2xkZW5yb2RcIjogWzIxOCwgMTY1LCAzMl0sXHJcblx0XCJncmF5XCI6IFsxMjgsIDEyOCwgMTI4XSxcclxuXHRcImdyZWVuXCI6IFswLCAxMjgsIDBdLFxyXG5cdFwiZ3JlZW55ZWxsb3dcIjogWzE3MywgMjU1LCA0N10sXHJcblx0XCJncmV5XCI6IFsxMjgsIDEyOCwgMTI4XSxcclxuXHRcImhvbmV5ZGV3XCI6IFsyNDAsIDI1NSwgMjQwXSxcclxuXHRcImhvdHBpbmtcIjogWzI1NSwgMTA1LCAxODBdLFxyXG5cdFwiaW5kaWFucmVkXCI6IFsyMDUsIDkyLCA5Ml0sXHJcblx0XCJpbmRpZ29cIjogWzc1LCAwLCAxMzBdLFxyXG5cdFwiaXZvcnlcIjogWzI1NSwgMjU1LCAyNDBdLFxyXG5cdFwia2hha2lcIjogWzI0MCwgMjMwLCAxNDBdLFxyXG5cdFwibGF2ZW5kZXJcIjogWzIzMCwgMjMwLCAyNTBdLFxyXG5cdFwibGF2ZW5kZXJibHVzaFwiOiBbMjU1LCAyNDAsIDI0NV0sXHJcblx0XCJsYXduZ3JlZW5cIjogWzEyNCwgMjUyLCAwXSxcclxuXHRcImxlbW9uY2hpZmZvblwiOiBbMjU1LCAyNTAsIDIwNV0sXHJcblx0XCJsaWdodGJsdWVcIjogWzE3MywgMjE2LCAyMzBdLFxyXG5cdFwibGlnaHRjb3JhbFwiOiBbMjQwLCAxMjgsIDEyOF0sXHJcblx0XCJsaWdodGN5YW5cIjogWzIyNCwgMjU1LCAyNTVdLFxyXG5cdFwibGlnaHRnb2xkZW5yb2R5ZWxsb3dcIjogWzI1MCwgMjUwLCAyMTBdLFxyXG5cdFwibGlnaHRncmF5XCI6IFsyMTEsIDIxMSwgMjExXSxcclxuXHRcImxpZ2h0Z3JlZW5cIjogWzE0NCwgMjM4LCAxNDRdLFxyXG5cdFwibGlnaHRncmV5XCI6IFsyMTEsIDIxMSwgMjExXSxcclxuXHRcImxpZ2h0cGlua1wiOiBbMjU1LCAxODIsIDE5M10sXHJcblx0XCJsaWdodHNhbG1vblwiOiBbMjU1LCAxNjAsIDEyMl0sXHJcblx0XCJsaWdodHNlYWdyZWVuXCI6IFszMiwgMTc4LCAxNzBdLFxyXG5cdFwibGlnaHRza3libHVlXCI6IFsxMzUsIDIwNiwgMjUwXSxcclxuXHRcImxpZ2h0c2xhdGVncmF5XCI6IFsxMTksIDEzNiwgMTUzXSxcclxuXHRcImxpZ2h0c2xhdGVncmV5XCI6IFsxMTksIDEzNiwgMTUzXSxcclxuXHRcImxpZ2h0c3RlZWxibHVlXCI6IFsxNzYsIDE5NiwgMjIyXSxcclxuXHRcImxpZ2h0eWVsbG93XCI6IFsyNTUsIDI1NSwgMjI0XSxcclxuXHRcImxpbWVcIjogWzAsIDI1NSwgMF0sXHJcblx0XCJsaW1lZ3JlZW5cIjogWzUwLCAyMDUsIDUwXSxcclxuXHRcImxpbmVuXCI6IFsyNTAsIDI0MCwgMjMwXSxcclxuXHRcIm1hZ2VudGFcIjogWzI1NSwgMCwgMjU1XSxcclxuXHRcIm1hcm9vblwiOiBbMTI4LCAwLCAwXSxcclxuXHRcIm1lZGl1bWFxdWFtYXJpbmVcIjogWzEwMiwgMjA1LCAxNzBdLFxyXG5cdFwibWVkaXVtYmx1ZVwiOiBbMCwgMCwgMjA1XSxcclxuXHRcIm1lZGl1bW9yY2hpZFwiOiBbMTg2LCA4NSwgMjExXSxcclxuXHRcIm1lZGl1bXB1cnBsZVwiOiBbMTQ3LCAxMTIsIDIxOV0sXHJcblx0XCJtZWRpdW1zZWFncmVlblwiOiBbNjAsIDE3OSwgMTEzXSxcclxuXHRcIm1lZGl1bXNsYXRlYmx1ZVwiOiBbMTIzLCAxMDQsIDIzOF0sXHJcblx0XCJtZWRpdW1zcHJpbmdncmVlblwiOiBbMCwgMjUwLCAxNTRdLFxyXG5cdFwibWVkaXVtdHVycXVvaXNlXCI6IFs3MiwgMjA5LCAyMDRdLFxyXG5cdFwibWVkaXVtdmlvbGV0cmVkXCI6IFsxOTksIDIxLCAxMzNdLFxyXG5cdFwibWlkbmlnaHRibHVlXCI6IFsyNSwgMjUsIDExMl0sXHJcblx0XCJtaW50Y3JlYW1cIjogWzI0NSwgMjU1LCAyNTBdLFxyXG5cdFwibWlzdHlyb3NlXCI6IFsyNTUsIDIyOCwgMjI1XSxcclxuXHRcIm1vY2Nhc2luXCI6IFsyNTUsIDIyOCwgMTgxXSxcclxuXHRcIm5hdmFqb3doaXRlXCI6IFsyNTUsIDIyMiwgMTczXSxcclxuXHRcIm5hdnlcIjogWzAsIDAsIDEyOF0sXHJcblx0XCJvbGRsYWNlXCI6IFsyNTMsIDI0NSwgMjMwXSxcclxuXHRcIm9saXZlXCI6IFsxMjgsIDEyOCwgMF0sXHJcblx0XCJvbGl2ZWRyYWJcIjogWzEwNywgMTQyLCAzNV0sXHJcblx0XCJvcmFuZ2VcIjogWzI1NSwgMTY1LCAwXSxcclxuXHRcIm9yYW5nZXJlZFwiOiBbMjU1LCA2OSwgMF0sXHJcblx0XCJvcmNoaWRcIjogWzIxOCwgMTEyLCAyMTRdLFxyXG5cdFwicGFsZWdvbGRlbnJvZFwiOiBbMjM4LCAyMzIsIDE3MF0sXHJcblx0XCJwYWxlZ3JlZW5cIjogWzE1MiwgMjUxLCAxNTJdLFxyXG5cdFwicGFsZXR1cnF1b2lzZVwiOiBbMTc1LCAyMzgsIDIzOF0sXHJcblx0XCJwYWxldmlvbGV0cmVkXCI6IFsyMTksIDExMiwgMTQ3XSxcclxuXHRcInBhcGF5YXdoaXBcIjogWzI1NSwgMjM5LCAyMTNdLFxyXG5cdFwicGVhY2hwdWZmXCI6IFsyNTUsIDIxOCwgMTg1XSxcclxuXHRcInBlcnVcIjogWzIwNSwgMTMzLCA2M10sXHJcblx0XCJwaW5rXCI6IFsyNTUsIDE5MiwgMjAzXSxcclxuXHRcInBsdW1cIjogWzIyMSwgMTYwLCAyMjFdLFxyXG5cdFwicG93ZGVyYmx1ZVwiOiBbMTc2LCAyMjQsIDIzMF0sXHJcblx0XCJwdXJwbGVcIjogWzEyOCwgMCwgMTI4XSxcclxuXHRcInJlYmVjY2FwdXJwbGVcIjogWzEwMiwgNTEsIDE1M10sXHJcblx0XCJyZWRcIjogWzI1NSwgMCwgMF0sXHJcblx0XCJyb3N5YnJvd25cIjogWzE4OCwgMTQzLCAxNDNdLFxyXG5cdFwicm95YWxibHVlXCI6IFs2NSwgMTA1LCAyMjVdLFxyXG5cdFwic2FkZGxlYnJvd25cIjogWzEzOSwgNjksIDE5XSxcclxuXHRcInNhbG1vblwiOiBbMjUwLCAxMjgsIDExNF0sXHJcblx0XCJzYW5keWJyb3duXCI6IFsyNDQsIDE2NCwgOTZdLFxyXG5cdFwic2VhZ3JlZW5cIjogWzQ2LCAxMzksIDg3XSxcclxuXHRcInNlYXNoZWxsXCI6IFsyNTUsIDI0NSwgMjM4XSxcclxuXHRcInNpZW5uYVwiOiBbMTYwLCA4MiwgNDVdLFxyXG5cdFwic2lsdmVyXCI6IFsxOTIsIDE5MiwgMTkyXSxcclxuXHRcInNreWJsdWVcIjogWzEzNSwgMjA2LCAyMzVdLFxyXG5cdFwic2xhdGVibHVlXCI6IFsxMDYsIDkwLCAyMDVdLFxyXG5cdFwic2xhdGVncmF5XCI6IFsxMTIsIDEyOCwgMTQ0XSxcclxuXHRcInNsYXRlZ3JleVwiOiBbMTEyLCAxMjgsIDE0NF0sXHJcblx0XCJzbm93XCI6IFsyNTUsIDI1MCwgMjUwXSxcclxuXHRcInNwcmluZ2dyZWVuXCI6IFswLCAyNTUsIDEyN10sXHJcblx0XCJzdGVlbGJsdWVcIjogWzcwLCAxMzAsIDE4MF0sXHJcblx0XCJ0YW5cIjogWzIxMCwgMTgwLCAxNDBdLFxyXG5cdFwidGVhbFwiOiBbMCwgMTI4LCAxMjhdLFxyXG5cdFwidGhpc3RsZVwiOiBbMjE2LCAxOTEsIDIxNl0sXHJcblx0XCJ0b21hdG9cIjogWzI1NSwgOTksIDcxXSxcclxuXHRcInR1cnF1b2lzZVwiOiBbNjQsIDIyNCwgMjA4XSxcclxuXHRcInZpb2xldFwiOiBbMjM4LCAxMzAsIDIzOF0sXHJcblx0XCJ3aGVhdFwiOiBbMjQ1LCAyMjIsIDE3OV0sXHJcblx0XCJ3aGl0ZVwiOiBbMjU1LCAyNTUsIDI1NV0sXHJcblx0XCJ3aGl0ZXNtb2tlXCI6IFsyNDUsIDI0NSwgMjQ1XSxcclxuXHRcInllbGxvd1wiOiBbMjU1LCAyNTUsIDBdLFxyXG5cdFwieWVsbG93Z3JlZW5cIjogWzE1NCwgMjA1LCA1MF1cclxufSIsIi8qISBOYXRpdmUgUHJvbWlzZSBPbmx5XG4gICAgdjAuOC4xIChjKSBLeWxlIFNpbXBzb25cbiAgICBNSVQgTGljZW5zZTogaHR0cDovL2dldGlmeS5taXQtbGljZW5zZS5vcmdcbiovXG5cbihmdW5jdGlvbiBVTUQobmFtZSxjb250ZXh0LGRlZmluaXRpb24pe1xuXHQvLyBzcGVjaWFsIGZvcm0gb2YgVU1EIGZvciBwb2x5ZmlsbGluZyBhY3Jvc3MgZXZpcm9ubWVudHNcblx0Y29udGV4dFtuYW1lXSA9IGNvbnRleHRbbmFtZV0gfHwgZGVmaW5pdGlvbigpO1xuXHRpZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7IG1vZHVsZS5leHBvcnRzID0gY29udGV4dFtuYW1lXTsgfVxuXHRlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7IGRlZmluZShmdW5jdGlvbiAkQU1EJCgpeyByZXR1cm4gY29udGV4dFtuYW1lXTsgfSk7IH1cbn0pKFwiUHJvbWlzZVwiLHR5cGVvZiBnbG9iYWwgIT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHRoaXMsZnVuY3Rpb24gREVGKCl7XG5cdC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBidWlsdEluUHJvcCwgY3ljbGUsIHNjaGVkdWxpbmdfcXVldWUsXG5cdFx0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuXHRcdHRpbWVyID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgIT0gXCJ1bmRlZmluZWRcIikgP1xuXHRcdFx0ZnVuY3Rpb24gdGltZXIoZm4pIHsgcmV0dXJuIHNldEltbWVkaWF0ZShmbik7IH0gOlxuXHRcdFx0c2V0VGltZW91dFxuXHQ7XG5cblx0Ly8gZGFtbWl0LCBJRTguXG5cdHRyeSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LFwieFwiLHt9KTtcblx0XHRidWlsdEluUHJvcCA9IGZ1bmN0aW9uIGJ1aWx0SW5Qcm9wKG9iaixuYW1lLHZhbCxjb25maWcpIHtcblx0XHRcdHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLG5hbWUse1xuXHRcdFx0XHR2YWx1ZTogdmFsLFxuXHRcdFx0XHR3cml0YWJsZTogdHJ1ZSxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiBjb25maWcgIT09IGZhbHNlXG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9XG5cdGNhdGNoIChlcnIpIHtcblx0XHRidWlsdEluUHJvcCA9IGZ1bmN0aW9uIGJ1aWx0SW5Qcm9wKG9iaixuYW1lLHZhbCkge1xuXHRcdFx0b2JqW25hbWVdID0gdmFsO1xuXHRcdFx0cmV0dXJuIG9iajtcblx0XHR9O1xuXHR9XG5cblx0Ly8gTm90ZTogdXNpbmcgYSBxdWV1ZSBpbnN0ZWFkIG9mIGFycmF5IGZvciBlZmZpY2llbmN5XG5cdHNjaGVkdWxpbmdfcXVldWUgPSAoZnVuY3Rpb24gUXVldWUoKSB7XG5cdFx0dmFyIGZpcnN0LCBsYXN0LCBpdGVtO1xuXG5cdFx0ZnVuY3Rpb24gSXRlbShmbixzZWxmKSB7XG5cdFx0XHR0aGlzLmZuID0gZm47XG5cdFx0XHR0aGlzLnNlbGYgPSBzZWxmO1xuXHRcdFx0dGhpcy5uZXh0ID0gdm9pZCAwO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRhZGQ6IGZ1bmN0aW9uIGFkZChmbixzZWxmKSB7XG5cdFx0XHRcdGl0ZW0gPSBuZXcgSXRlbShmbixzZWxmKTtcblx0XHRcdFx0aWYgKGxhc3QpIHtcblx0XHRcdFx0XHRsYXN0Lm5leHQgPSBpdGVtO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGZpcnN0ID0gaXRlbTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsYXN0ID0gaXRlbTtcblx0XHRcdFx0aXRlbSA9IHZvaWQgMDtcblx0XHRcdH0sXG5cdFx0XHRkcmFpbjogZnVuY3Rpb24gZHJhaW4oKSB7XG5cdFx0XHRcdHZhciBmID0gZmlyc3Q7XG5cdFx0XHRcdGZpcnN0ID0gbGFzdCA9IGN5Y2xlID0gdm9pZCAwO1xuXG5cdFx0XHRcdHdoaWxlIChmKSB7XG5cdFx0XHRcdFx0Zi5mbi5jYWxsKGYuc2VsZik7XG5cdFx0XHRcdFx0ZiA9IGYubmV4dDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH0pKCk7XG5cblx0ZnVuY3Rpb24gc2NoZWR1bGUoZm4sc2VsZikge1xuXHRcdHNjaGVkdWxpbmdfcXVldWUuYWRkKGZuLHNlbGYpO1xuXHRcdGlmICghY3ljbGUpIHtcblx0XHRcdGN5Y2xlID0gdGltZXIoc2NoZWR1bGluZ19xdWV1ZS5kcmFpbik7XG5cdFx0fVxuXHR9XG5cblx0Ly8gcHJvbWlzZSBkdWNrIHR5cGluZ1xuXHRmdW5jdGlvbiBpc1RoZW5hYmxlKG8pIHtcblx0XHR2YXIgX3RoZW4sIG9fdHlwZSA9IHR5cGVvZiBvO1xuXG5cdFx0aWYgKG8gIT0gbnVsbCAmJlxuXHRcdFx0KFxuXHRcdFx0XHRvX3R5cGUgPT0gXCJvYmplY3RcIiB8fCBvX3R5cGUgPT0gXCJmdW5jdGlvblwiXG5cdFx0XHQpXG5cdFx0KSB7XG5cdFx0XHRfdGhlbiA9IG8udGhlbjtcblx0XHR9XG5cdFx0cmV0dXJuIHR5cGVvZiBfdGhlbiA9PSBcImZ1bmN0aW9uXCIgPyBfdGhlbiA6IGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gbm90aWZ5KCkge1xuXHRcdGZvciAodmFyIGk9MDsgaTx0aGlzLmNoYWluLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRub3RpZnlJc29sYXRlZChcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0KHRoaXMuc3RhdGUgPT09IDEpID8gdGhpcy5jaGFpbltpXS5zdWNjZXNzIDogdGhpcy5jaGFpbltpXS5mYWlsdXJlLFxuXHRcdFx0XHR0aGlzLmNoYWluW2ldXG5cdFx0XHQpO1xuXHRcdH1cblx0XHR0aGlzLmNoYWluLmxlbmd0aCA9IDA7XG5cdH1cblxuXHQvLyBOT1RFOiBUaGlzIGlzIGEgc2VwYXJhdGUgZnVuY3Rpb24gdG8gaXNvbGF0ZVxuXHQvLyB0aGUgYHRyeS4uY2F0Y2hgIHNvIHRoYXQgb3RoZXIgY29kZSBjYW4gYmVcblx0Ly8gb3B0aW1pemVkIGJldHRlclxuXHRmdW5jdGlvbiBub3RpZnlJc29sYXRlZChzZWxmLGNiLGNoYWluKSB7XG5cdFx0dmFyIHJldCwgX3RoZW47XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChjYiA9PT0gZmFsc2UpIHtcblx0XHRcdFx0Y2hhaW4ucmVqZWN0KHNlbGYubXNnKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAoY2IgPT09IHRydWUpIHtcblx0XHRcdFx0XHRyZXQgPSBzZWxmLm1zZztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRyZXQgPSBjYi5jYWxsKHZvaWQgMCxzZWxmLm1zZyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAocmV0ID09PSBjaGFpbi5wcm9taXNlKSB7XG5cdFx0XHRcdFx0Y2hhaW4ucmVqZWN0KFR5cGVFcnJvcihcIlByb21pc2UtY2hhaW4gY3ljbGVcIikpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKF90aGVuID0gaXNUaGVuYWJsZShyZXQpKSB7XG5cdFx0XHRcdFx0X3RoZW4uY2FsbChyZXQsY2hhaW4ucmVzb2x2ZSxjaGFpbi5yZWplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGNoYWluLnJlc29sdmUocmV0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjYXRjaCAoZXJyKSB7XG5cdFx0XHRjaGFpbi5yZWplY3QoZXJyKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZXNvbHZlKG1zZykge1xuXHRcdHZhciBfdGhlbiwgc2VsZiA9IHRoaXM7XG5cblx0XHQvLyBhbHJlYWR5IHRyaWdnZXJlZD9cblx0XHRpZiAoc2VsZi50cmlnZ2VyZWQpIHsgcmV0dXJuOyB9XG5cblx0XHRzZWxmLnRyaWdnZXJlZCA9IHRydWU7XG5cblx0XHQvLyB1bndyYXBcblx0XHRpZiAoc2VsZi5kZWYpIHtcblx0XHRcdHNlbGYgPSBzZWxmLmRlZjtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKF90aGVuID0gaXNUaGVuYWJsZShtc2cpKSB7XG5cdFx0XHRcdHNjaGVkdWxlKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0dmFyIGRlZl93cmFwcGVyID0gbmV3IE1ha2VEZWZXcmFwcGVyKHNlbGYpO1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRfdGhlbi5jYWxsKG1zZyxcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gJHJlc29sdmUkKCl7IHJlc29sdmUuYXBwbHkoZGVmX3dyYXBwZXIsYXJndW1lbnRzKTsgfSxcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gJHJlamVjdCQoKXsgcmVqZWN0LmFwcGx5KGRlZl93cmFwcGVyLGFyZ3VtZW50cyk7IH1cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdHJlamVjdC5jYWxsKGRlZl93cmFwcGVyLGVycik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNlbGYubXNnID0gbXNnO1xuXHRcdFx0XHRzZWxmLnN0YXRlID0gMTtcblx0XHRcdFx0aWYgKHNlbGYuY2hhaW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHNjaGVkdWxlKG5vdGlmeSxzZWxmKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjYXRjaCAoZXJyKSB7XG5cdFx0XHRyZWplY3QuY2FsbChuZXcgTWFrZURlZldyYXBwZXIoc2VsZiksZXJyKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByZWplY3QobXNnKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0Ly8gYWxyZWFkeSB0cmlnZ2VyZWQ/XG5cdFx0aWYgKHNlbGYudHJpZ2dlcmVkKSB7IHJldHVybjsgfVxuXG5cdFx0c2VsZi50cmlnZ2VyZWQgPSB0cnVlO1xuXG5cdFx0Ly8gdW53cmFwXG5cdFx0aWYgKHNlbGYuZGVmKSB7XG5cdFx0XHRzZWxmID0gc2VsZi5kZWY7XG5cdFx0fVxuXG5cdFx0c2VsZi5tc2cgPSBtc2c7XG5cdFx0c2VsZi5zdGF0ZSA9IDI7XG5cdFx0aWYgKHNlbGYuY2hhaW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0c2NoZWR1bGUobm90aWZ5LHNlbGYpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGl0ZXJhdGVQcm9taXNlcyhDb25zdHJ1Y3RvcixhcnIscmVzb2x2ZXIscmVqZWN0ZXIpIHtcblx0XHRmb3IgKHZhciBpZHg9MDsgaWR4PGFyci5sZW5ndGg7IGlkeCsrKSB7XG5cdFx0XHQoZnVuY3Rpb24gSUlGRShpZHgpe1xuXHRcdFx0XHRDb25zdHJ1Y3Rvci5yZXNvbHZlKGFycltpZHhdKVxuXHRcdFx0XHQudGhlbihcblx0XHRcdFx0XHRmdW5jdGlvbiAkcmVzb2x2ZXIkKG1zZyl7XG5cdFx0XHRcdFx0XHRyZXNvbHZlcihpZHgsbXNnKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHJlamVjdGVyXG5cdFx0XHRcdCk7XG5cdFx0XHR9KShpZHgpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIE1ha2VEZWZXcmFwcGVyKHNlbGYpIHtcblx0XHR0aGlzLmRlZiA9IHNlbGY7XG5cdFx0dGhpcy50cmlnZ2VyZWQgPSBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIE1ha2VEZWYoc2VsZikge1xuXHRcdHRoaXMucHJvbWlzZSA9IHNlbGY7XG5cdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0dGhpcy50cmlnZ2VyZWQgPSBmYWxzZTtcblx0XHR0aGlzLmNoYWluID0gW107XG5cdFx0dGhpcy5tc2cgPSB2b2lkIDA7XG5cdH1cblxuXHRmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKSB7XG5cdFx0aWYgKHR5cGVvZiBleGVjdXRvciAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9fTlBPX18gIT09IDApIHtcblx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIHByb21pc2VcIik7XG5cdFx0fVxuXG5cdFx0Ly8gaW5zdGFuY2Ugc2hhZG93aW5nIHRoZSBpbmhlcml0ZWQgXCJicmFuZFwiXG5cdFx0Ly8gdG8gc2lnbmFsIGFuIGFscmVhZHkgXCJpbml0aWFsaXplZFwiIHByb21pc2Vcblx0XHR0aGlzLl9fTlBPX18gPSAxO1xuXG5cdFx0dmFyIGRlZiA9IG5ldyBNYWtlRGVmKHRoaXMpO1xuXG5cdFx0dGhpc1tcInRoZW5cIl0gPSBmdW5jdGlvbiB0aGVuKHN1Y2Nlc3MsZmFpbHVyZSkge1xuXHRcdFx0dmFyIG8gPSB7XG5cdFx0XHRcdHN1Y2Nlc3M6IHR5cGVvZiBzdWNjZXNzID09IFwiZnVuY3Rpb25cIiA/IHN1Y2Nlc3MgOiB0cnVlLFxuXHRcdFx0XHRmYWlsdXJlOiB0eXBlb2YgZmFpbHVyZSA9PSBcImZ1bmN0aW9uXCIgPyBmYWlsdXJlIDogZmFsc2Vcblx0XHRcdH07XG5cdFx0XHQvLyBOb3RlOiBgdGhlbiguLilgIGl0c2VsZiBjYW4gYmUgYm9ycm93ZWQgdG8gYmUgdXNlZCBhZ2FpbnN0XG5cdFx0XHQvLyBhIGRpZmZlcmVudCBwcm9taXNlIGNvbnN0cnVjdG9yIGZvciBtYWtpbmcgdGhlIGNoYWluZWQgcHJvbWlzZSxcblx0XHRcdC8vIGJ5IHN1YnN0aXR1dGluZyBhIGRpZmZlcmVudCBgdGhpc2AgYmluZGluZy5cblx0XHRcdG8ucHJvbWlzZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGZ1bmN0aW9uIGV4dHJhY3RDaGFpbihyZXNvbHZlLHJlamVjdCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dGhyb3cgVHlwZUVycm9yKFwiTm90IGEgZnVuY3Rpb25cIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvLnJlc29sdmUgPSByZXNvbHZlO1xuXHRcdFx0XHRvLnJlamVjdCA9IHJlamVjdDtcblx0XHRcdH0pO1xuXHRcdFx0ZGVmLmNoYWluLnB1c2gobyk7XG5cblx0XHRcdGlmIChkZWYuc3RhdGUgIT09IDApIHtcblx0XHRcdFx0c2NoZWR1bGUobm90aWZ5LGRlZik7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvLnByb21pc2U7XG5cdFx0fTtcblx0XHR0aGlzW1wiY2F0Y2hcIl0gPSBmdW5jdGlvbiAkY2F0Y2gkKGZhaWx1cmUpIHtcblx0XHRcdHJldHVybiB0aGlzLnRoZW4odm9pZCAwLGZhaWx1cmUpO1xuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0ZXhlY3V0b3IuY2FsbChcblx0XHRcdFx0dm9pZCAwLFxuXHRcdFx0XHRmdW5jdGlvbiBwdWJsaWNSZXNvbHZlKG1zZyl7XG5cdFx0XHRcdFx0cmVzb2x2ZS5jYWxsKGRlZixtc2cpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRmdW5jdGlvbiBwdWJsaWNSZWplY3QobXNnKSB7XG5cdFx0XHRcdFx0cmVqZWN0LmNhbGwoZGVmLG1zZyk7XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdGNhdGNoIChlcnIpIHtcblx0XHRcdHJlamVjdC5jYWxsKGRlZixlcnIpO1xuXHRcdH1cblx0fVxuXG5cdHZhciBQcm9taXNlUHJvdG90eXBlID0gYnVpbHRJblByb3Aoe30sXCJjb25zdHJ1Y3RvclwiLFByb21pc2UsXG5cdFx0Lypjb25maWd1cmFibGU9Ki9mYWxzZVxuXHQpO1xuXG5cdC8vIE5vdGU6IEFuZHJvaWQgNCBjYW5ub3QgdXNlIGBPYmplY3QuZGVmaW5lUHJvcGVydHkoLi4pYCBoZXJlXG5cdFByb21pc2UucHJvdG90eXBlID0gUHJvbWlzZVByb3RvdHlwZTtcblxuXHQvLyBidWlsdC1pbiBcImJyYW5kXCIgdG8gc2lnbmFsIGFuIFwidW5pbml0aWFsaXplZFwiIHByb21pc2Vcblx0YnVpbHRJblByb3AoUHJvbWlzZVByb3RvdHlwZSxcIl9fTlBPX19cIiwwLFxuXHRcdC8qY29uZmlndXJhYmxlPSovZmFsc2Vcblx0KTtcblxuXHRidWlsdEluUHJvcChQcm9taXNlLFwicmVzb2x2ZVwiLGZ1bmN0aW9uIFByb21pc2UkcmVzb2x2ZShtc2cpIHtcblx0XHR2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG5cdFx0Ly8gc3BlYyBtYW5kYXRlZCBjaGVja3Ncblx0XHQvLyBub3RlOiBiZXN0IFwiaXNQcm9taXNlXCIgY2hlY2sgdGhhdCdzIHByYWN0aWNhbCBmb3Igbm93XG5cdFx0aWYgKG1zZyAmJiB0eXBlb2YgbXNnID09IFwib2JqZWN0XCIgJiYgbXNnLl9fTlBPX18gPT09IDEpIHtcblx0XHRcdHJldHVybiBtc2c7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLHJlamVjdCl7XG5cdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXNvbHZlKG1zZyk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGJ1aWx0SW5Qcm9wKFByb21pc2UsXCJyZWplY3RcIixmdW5jdGlvbiBQcm9taXNlJHJlamVjdChtc2cpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSxyZWplY3Qpe1xuXHRcdFx0aWYgKHR5cGVvZiByZXNvbHZlICE9IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVqZWN0ICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0cmVqZWN0KG1zZyk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGJ1aWx0SW5Qcm9wKFByb21pc2UsXCJhbGxcIixmdW5jdGlvbiBQcm9taXNlJGFsbChhcnIpIHtcblx0XHR2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG5cdFx0Ly8gc3BlYyBtYW5kYXRlZCBjaGVja3Ncblx0XHRpZiAoVG9TdHJpbmcuY2FsbChhcnIpICE9IFwiW29iamVjdCBBcnJheV1cIikge1xuXHRcdFx0cmV0dXJuIENvbnN0cnVjdG9yLnJlamVjdChUeXBlRXJyb3IoXCJOb3QgYW4gYXJyYXlcIikpO1xuXHRcdH1cblx0XHRpZiAoYXJyLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIENvbnN0cnVjdG9yLnJlc29sdmUoW10pO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSxyZWplY3Qpe1xuXHRcdFx0aWYgKHR5cGVvZiByZXNvbHZlICE9IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgcmVqZWN0ICE9IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBUeXBlRXJyb3IoXCJOb3QgYSBmdW5jdGlvblwiKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGxlbiA9IGFyci5sZW5ndGgsIG1zZ3MgPSBBcnJheShsZW4pLCBjb3VudCA9IDA7XG5cblx0XHRcdGl0ZXJhdGVQcm9taXNlcyhDb25zdHJ1Y3RvcixhcnIsZnVuY3Rpb24gcmVzb2x2ZXIoaWR4LG1zZykge1xuXHRcdFx0XHRtc2dzW2lkeF0gPSBtc2c7XG5cdFx0XHRcdGlmICgrK2NvdW50ID09PSBsZW4pIHtcblx0XHRcdFx0XHRyZXNvbHZlKG1zZ3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LHJlamVjdCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGJ1aWx0SW5Qcm9wKFByb21pc2UsXCJyYWNlXCIsZnVuY3Rpb24gUHJvbWlzZSRyYWNlKGFycikge1xuXHRcdHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cblx0XHQvLyBzcGVjIG1hbmRhdGVkIGNoZWNrc1xuXHRcdGlmIChUb1N0cmluZy5jYWxsKGFycikgIT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG5cdFx0XHRyZXR1cm4gQ29uc3RydWN0b3IucmVqZWN0KFR5cGVFcnJvcihcIk5vdCBhbiBhcnJheVwiKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBDb25zdHJ1Y3RvcihmdW5jdGlvbiBleGVjdXRvcihyZXNvbHZlLHJlamVjdCl7XG5cdFx0XHRpZiAodHlwZW9mIHJlc29sdmUgIT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiByZWplY3QgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdHRocm93IFR5cGVFcnJvcihcIk5vdCBhIGZ1bmN0aW9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpdGVyYXRlUHJvbWlzZXMoQ29uc3RydWN0b3IsYXJyLGZ1bmN0aW9uIHJlc29sdmVyKGlkeCxtc2cpe1xuXHRcdFx0XHRyZXNvbHZlKG1zZyk7XG5cdFx0XHR9LHJlamVjdCk7XG5cdFx0fSk7XG5cdH0pO1xuXG5cdHJldHVybiBQcm9taXNlO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vICMgc2ltcGxlLXN0YXRpc3RpY3Ncbi8vXG4vLyBBIHNpbXBsZSwgbGl0ZXJhdGUgc3RhdGlzdGljcyBzeXN0ZW0uXG5cbnZhciBzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIExpbmVhciBSZWdyZXNzaW9uXG5zcy5saW5lYXJSZWdyZXNzaW9uID0gcmVxdWlyZSgnLi9zcmMvbGluZWFyX3JlZ3Jlc3Npb24nKTtcbnNzLmxpbmVhclJlZ3Jlc3Npb25MaW5lID0gcmVxdWlyZSgnLi9zcmMvbGluZWFyX3JlZ3Jlc3Npb25fbGluZScpO1xuc3Muc3RhbmRhcmREZXZpYXRpb24gPSByZXF1aXJlKCcuL3NyYy9zdGFuZGFyZF9kZXZpYXRpb24nKTtcbnNzLnJTcXVhcmVkID0gcmVxdWlyZSgnLi9zcmMvcl9zcXVhcmVkJyk7XG5zcy5tb2RlID0gcmVxdWlyZSgnLi9zcmMvbW9kZScpO1xuc3MubWluID0gcmVxdWlyZSgnLi9zcmMvbWluJyk7XG5zcy5tYXggPSByZXF1aXJlKCcuL3NyYy9tYXgnKTtcbnNzLnN1bSA9IHJlcXVpcmUoJy4vc3JjL3N1bScpO1xuc3MucXVhbnRpbGUgPSByZXF1aXJlKCcuL3NyYy9xdWFudGlsZScpO1xuc3MucXVhbnRpbGVTb3J0ZWQgPSByZXF1aXJlKCcuL3NyYy9xdWFudGlsZV9zb3J0ZWQnKTtcbnNzLmlxciA9IHNzLmludGVycXVhcnRpbGVSYW5nZSA9IHJlcXVpcmUoJy4vc3JjL2ludGVycXVhcnRpbGVfcmFuZ2UnKTtcbnNzLm1lZGlhbkFic29sdXRlRGV2aWF0aW9uID0gc3MubWFkID0gcmVxdWlyZSgnLi9zcmMvbWFkJyk7XG5zcy5jaHVuayA9IHJlcXVpcmUoJy4vc3JjL2NodW5rJyk7XG5zcy5zaHVmZmxlID0gcmVxdWlyZSgnLi9zcmMvc2h1ZmZsZScpO1xuc3Muc2h1ZmZsZUluUGxhY2UgPSByZXF1aXJlKCcuL3NyYy9zaHVmZmxlX2luX3BsYWNlJyk7XG5zcy5zYW1wbGUgPSByZXF1aXJlKCcuL3NyYy9zYW1wbGUnKTtcbnNzLmNrbWVhbnMgPSByZXF1aXJlKCcuL3NyYy9ja21lYW5zJyk7XG5zcy5zb3J0ZWRVbmlxdWVDb3VudCA9IHJlcXVpcmUoJy4vc3JjL3NvcnRlZF91bmlxdWVfY291bnQnKTtcbnNzLnN1bU50aFBvd2VyRGV2aWF0aW9ucyA9IHJlcXVpcmUoJy4vc3JjL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucycpO1xuXG4vLyBzYW1wbGUgc3RhdGlzdGljc1xuc3Muc2FtcGxlQ292YXJpYW5jZSA9IHJlcXVpcmUoJy4vc3JjL3NhbXBsZV9jb3ZhcmlhbmNlJyk7XG5zcy5zYW1wbGVDb3JyZWxhdGlvbiA9IHJlcXVpcmUoJy4vc3JjL3NhbXBsZV9jb3JyZWxhdGlvbicpO1xuc3Muc2FtcGxlVmFyaWFuY2UgPSByZXF1aXJlKCcuL3NyYy9zYW1wbGVfdmFyaWFuY2UnKTtcbnNzLnNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uID0gcmVxdWlyZSgnLi9zcmMvc2FtcGxlX3N0YW5kYXJkX2RldmlhdGlvbicpO1xuc3Muc2FtcGxlU2tld25lc3MgPSByZXF1aXJlKCcuL3NyYy9zYW1wbGVfc2tld25lc3MnKTtcblxuLy8gbWVhc3VyZXMgb2YgY2VudHJhbGl0eVxuc3MuZ2VvbWV0cmljTWVhbiA9IHJlcXVpcmUoJy4vc3JjL2dlb21ldHJpY19tZWFuJyk7XG5zcy5oYXJtb25pY01lYW4gPSByZXF1aXJlKCcuL3NyYy9oYXJtb25pY19tZWFuJyk7XG5zcy5tZWFuID0gc3MuYXZlcmFnZSA9IHJlcXVpcmUoJy4vc3JjL21lYW4nKTtcbnNzLm1lZGlhbiA9IHJlcXVpcmUoJy4vc3JjL21lZGlhbicpO1xuXG5zcy5yb290TWVhblNxdWFyZSA9IHNzLnJtcyA9IHJlcXVpcmUoJy4vc3JjL3Jvb3RfbWVhbl9zcXVhcmUnKTtcbnNzLnZhcmlhbmNlID0gcmVxdWlyZSgnLi9zcmMvdmFyaWFuY2UnKTtcbnNzLnRUZXN0ID0gcmVxdWlyZSgnLi9zcmMvdF90ZXN0Jyk7XG5zcy50VGVzdFR3b1NhbXBsZSA9IHJlcXVpcmUoJy4vc3JjL3RfdGVzdF90d29fc2FtcGxlJyk7XG4vLyBzcy5qZW5rcyA9IHJlcXVpcmUoJy4vc3JjL2plbmtzJyk7XG5cbi8vIENsYXNzaWZpZXJzXG5zcy5iYXllc2lhbiA9IHJlcXVpcmUoJy4vc3JjL2JheWVzaWFuX2NsYXNzaWZpZXInKTtcbnNzLnBlcmNlcHRyb24gPSByZXF1aXJlKCcuL3NyYy9wZXJjZXB0cm9uJyk7XG5cbi8vIERpc3RyaWJ1dGlvbi1yZWxhdGVkIG1ldGhvZHNcbnNzLmVwc2lsb24gPSByZXF1aXJlKCcuL3NyYy9lcHNpbG9uJyk7IC8vIFdlIG1ha2UgzrUgYXZhaWxhYmxlIHRvIHRoZSB0ZXN0IHN1aXRlLlxuc3MuZmFjdG9yaWFsID0gcmVxdWlyZSgnLi9zcmMvZmFjdG9yaWFsJyk7XG5zcy5iZXJub3VsbGlEaXN0cmlidXRpb24gPSByZXF1aXJlKCcuL3NyYy9iZXJub3VsbGlfZGlzdHJpYnV0aW9uJyk7XG5zcy5iaW5vbWlhbERpc3RyaWJ1dGlvbiA9IHJlcXVpcmUoJy4vc3JjL2Jpbm9taWFsX2Rpc3RyaWJ1dGlvbicpO1xuc3MucG9pc3NvbkRpc3RyaWJ1dGlvbiA9IHJlcXVpcmUoJy4vc3JjL3BvaXNzb25fZGlzdHJpYnV0aW9uJyk7XG5zcy5jaGlTcXVhcmVkR29vZG5lc3NPZkZpdCA9IHJlcXVpcmUoJy4vc3JjL2NoaV9zcXVhcmVkX2dvb2RuZXNzX29mX2ZpdCcpO1xuXG4vLyBOb3JtYWwgZGlzdHJpYnV0aW9uXG5zcy56U2NvcmUgPSByZXF1aXJlKCcuL3NyYy96X3Njb3JlJyk7XG5zcy5jdW11bGF0aXZlU3RkTm9ybWFsUHJvYmFiaWxpdHkgPSByZXF1aXJlKCcuL3NyYy9jdW11bGF0aXZlX3N0ZF9ub3JtYWxfcHJvYmFiaWxpdHknKTtcbnNzLnN0YW5kYXJkTm9ybWFsVGFibGUgPSByZXF1aXJlKCcuL3NyYy9zdGFuZGFyZF9ub3JtYWxfdGFibGUnKTtcbnNzLmVycm9yRnVuY3Rpb24gPSBzcy5lcmYgPSByZXF1aXJlKCcuL3NyYy9lcnJvcl9mdW5jdGlvbicpO1xuc3MuaW52ZXJzZUVycm9yRnVuY3Rpb24gPSByZXF1aXJlKCcuL3NyYy9pbnZlcnNlX2Vycm9yX2Z1bmN0aW9uJyk7XG5zcy5wcm9iaXQgPSByZXF1aXJlKCcuL3NyYy9wcm9iaXQnKTtcbnNzLm1peGluID0gcmVxdWlyZSgnLi9zcmMvbWl4aW4nKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBbQmF5ZXNpYW4gQ2xhc3NpZmllcl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9OYWl2ZV9CYXllc19jbGFzc2lmaWVyKVxuICpcbiAqIFRoaXMgaXMgYSBuYcOvdmUgYmF5ZXNpYW4gY2xhc3NpZmllciB0aGF0IHRha2VzXG4gKiBzaW5nbHktbmVzdGVkIG9iamVjdHMuXG4gKlxuICogQGNsYXNzXG4gKiBAZXhhbXBsZVxuICogdmFyIGJheWVzID0gbmV3IEJheWVzaWFuQ2xhc3NpZmllcigpO1xuICogYmF5ZXMudHJhaW4oe1xuICogICBzcGVjaWVzOiAnQ2F0J1xuICogfSwgJ2FuaW1hbCcpO1xuICogdmFyIHJlc3VsdCA9IGJheWVzLnNjb3JlKHtcbiAqICAgc3BlY2llczogJ0NhdCdcbiAqIH0pXG4gKiAvLyByZXN1bHRcbiAqIC8vIHtcbiAqIC8vICAgYW5pbWFsOiAxXG4gKiAvLyB9XG4gKi9cbmZ1bmN0aW9uIEJheWVzaWFuQ2xhc3NpZmllcigpIHtcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGl0ZW1zIHRoYXQgYXJlIGN1cnJlbnRseVxuICAgIC8vIGNsYXNzaWZpZWQgaW4gdGhlIG1vZGVsXG4gICAgdGhpcy50b3RhbENvdW50ID0gMDtcbiAgICAvLyBFdmVyeSBpdGVtIGNsYXNzaWZpZWQgaW4gdGhlIG1vZGVsXG4gICAgdGhpcy5kYXRhID0ge307XG59XG5cbi8qKlxuICogVHJhaW4gdGhlIGNsYXNzaWZpZXIgd2l0aCBhIG5ldyBpdGVtLCB3aGljaCBoYXMgYSBzaW5nbGVcbiAqIGRpbWVuc2lvbiBvZiBKYXZhc2NyaXB0IGxpdGVyYWwga2V5cyBhbmQgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIGFuIG9iamVjdCB3aXRoIHNpbmdseS1kZWVwIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSBjYXRlZ29yeSB0aGUgY2F0ZWdvcnkgdGhpcyBpdGVtIGJlbG9uZ3MgdG9cbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gYWRkcyB0aGUgaXRlbSB0byB0aGUgY2xhc3NpZmllclxuICovXG5CYXllc2lhbkNsYXNzaWZpZXIucHJvdG90eXBlLnRyYWluID0gZnVuY3Rpb24oaXRlbSwgY2F0ZWdvcnkpIHtcbiAgICAvLyBJZiB0aGUgZGF0YSBvYmplY3QgZG9lc24ndCBoYXZlIGFueSB2YWx1ZXNcbiAgICAvLyBmb3IgdGhpcyBjYXRlZ29yeSwgY3JlYXRlIGEgbmV3IG9iamVjdCBmb3IgaXQuXG4gICAgaWYgKCF0aGlzLmRhdGFbY2F0ZWdvcnldKSB7XG4gICAgICAgIHRoaXMuZGF0YVtjYXRlZ29yeV0gPSB7fTtcbiAgICB9XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBrZXkgaW4gdGhlIGl0ZW0uXG4gICAgZm9yICh2YXIgayBpbiBpdGVtKSB7XG4gICAgICAgIHZhciB2ID0gaXRlbVtrXTtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgbmVzdGVkIG9iamVjdCBgZGF0YVtjYXRlZ29yeV1ba11baXRlbVtrXV1gXG4gICAgICAgIC8vIHdpdGggYW4gb2JqZWN0IG9mIGtleXMgdGhhdCBlcXVhbCAwLlxuICAgICAgICBpZiAodGhpcy5kYXRhW2NhdGVnb3J5XVtrXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFbY2F0ZWdvcnldW2tdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZGF0YVtjYXRlZ29yeV1ba11bdl0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhW2NhdGVnb3J5XVtrXVt2XSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbmQgaW5jcmVtZW50IHRoZSBrZXkgZm9yIHRoaXMga2V5L3ZhbHVlIGNvbWJpbmF0aW9uLlxuICAgICAgICB0aGlzLmRhdGFbY2F0ZWdvcnldW2tdW2l0ZW1ba11dKys7XG4gICAgfVxuXG4gICAgLy8gSW5jcmVtZW50IHRoZSBudW1iZXIgb2YgaXRlbXMgY2xhc3NpZmllZFxuICAgIHRoaXMudG90YWxDb3VudCsrO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHNjb3JlIG9mIGhvdyB3ZWxsIHRoaXMgaXRlbSBtYXRjaGVzIGFsbFxuICogcG9zc2libGUgY2F0ZWdvcmllcyBiYXNlZCBvbiBpdHMgYXR0cmlidXRlc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIGFuIGl0ZW0gaW4gdGhlIHNhbWUgZm9ybWF0IGFzIHdpdGggdHJhaW5cbiAqIEByZXR1cm5zIHtPYmplY3R9IG9mIHByb2JhYmlsaXRpZXMgdGhhdCB0aGlzIGl0ZW0gYmVsb25ncyB0byBhXG4gKiBnaXZlbiBjYXRlZ29yeS5cbiAqL1xuQmF5ZXNpYW5DbGFzc2lmaWVyLnByb3RvdHlwZS5zY29yZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAvLyBJbml0aWFsaXplIGFuIGVtcHR5IGFycmF5IG9mIG9kZHMgcGVyIGNhdGVnb3J5LlxuICAgIHZhciBvZGRzID0ge30sIGNhdGVnb3J5O1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIGtleSBpbiB0aGUgaXRlbSxcbiAgICAvLyB0aGVuIGl0ZXJhdGUgdGhyb3VnaCBlYWNoIGNhdGVnb3J5IHRoYXQgaGFzIGJlZW4gdXNlZFxuICAgIC8vIGluIHByZXZpb3VzIGNhbGxzIHRvIGAudHJhaW4oKWBcbiAgICBmb3IgKHZhciBrIGluIGl0ZW0pIHtcbiAgICAgICAgdmFyIHYgPSBpdGVtW2tdO1xuICAgICAgICBmb3IgKGNhdGVnb3J5IGluIHRoaXMuZGF0YSkge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGFuIGVtcHR5IG9iamVjdCBmb3Igc3RvcmluZyBrZXkgLSB2YWx1ZSBjb21iaW5hdGlvbnNcbiAgICAgICAgICAgIC8vIGZvciB0aGlzIGNhdGVnb3J5LlxuICAgICAgICAgICAgaWYgKG9kZHNbY2F0ZWdvcnldID09PSB1bmRlZmluZWQpIHsgb2Rkc1tjYXRlZ29yeV0gPSB7fTsgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGlzIGl0ZW0gZG9lc24ndCBldmVuIGhhdmUgYSBwcm9wZXJ0eSwgaXQgY291bnRzIGZvciBub3RoaW5nLFxuICAgICAgICAgICAgLy8gYnV0IGlmIGl0IGRvZXMgaGF2ZSB0aGUgcHJvcGVydHkgdGhhdCB3ZSdyZSBsb29raW5nIGZvciBmcm9tXG4gICAgICAgICAgICAvLyB0aGUgaXRlbSB0byBjYXRlZ29yaXplLCBpdCBjb3VudHMgYmFzZWQgb24gaG93IHBvcHVsYXIgaXQgaXNcbiAgICAgICAgICAgIC8vIHZlcnN1cyB0aGUgd2hvbGUgcG9wdWxhdGlvbi5cbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFbY2F0ZWdvcnldW2tdKSB7XG4gICAgICAgICAgICAgICAgb2Rkc1tjYXRlZ29yeV1bayArICdfJyArIHZdID0gKHRoaXMuZGF0YVtjYXRlZ29yeV1ba11bdl0gfHwgMCkgLyB0aGlzLnRvdGFsQ291bnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9kZHNbY2F0ZWdvcnldW2sgKyAnXycgKyB2XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgYSBuZXcgb2JqZWN0IHRoYXQgd2lsbCBjb250YWluIHN1bXMgb2YgdGhlc2Ugb2RkcyBieSBjYXRlZ29yeVxuICAgIHZhciBvZGRzU3VtcyA9IHt9O1xuXG4gICAgZm9yIChjYXRlZ29yeSBpbiBvZGRzKSB7XG4gICAgICAgIC8vIFRhbGx5IGFsbCBvZiB0aGUgb2RkcyBmb3IgZWFjaCBjYXRlZ29yeS1jb21iaW5hdGlvbiBwYWlyIC1cbiAgICAgICAgLy8gdGhlIG5vbi1leGlzdGVuY2Ugb2YgYSBjYXRlZ29yeSBkb2VzIG5vdCBhZGQgYW55dGhpbmcgdG8gdGhlXG4gICAgICAgIC8vIHNjb3JlLlxuICAgICAgICBmb3IgKHZhciBjb21iaW5hdGlvbiBpbiBvZGRzW2NhdGVnb3J5XSkge1xuICAgICAgICAgICAgaWYgKG9kZHNTdW1zW2NhdGVnb3J5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb2Rkc1N1bXNbY2F0ZWdvcnldID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9kZHNTdW1zW2NhdGVnb3J5XSArPSBvZGRzW2NhdGVnb3J5XVtjb21iaW5hdGlvbl07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2Rkc1N1bXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJheWVzaWFuQ2xhc3NpZmllcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbm9taWFsRGlzdHJpYnV0aW9uID0gcmVxdWlyZSgnLi9iaW5vbWlhbF9kaXN0cmlidXRpb24nKTtcblxuLyoqXG4gKiBUaGUgW0Jlcm5vdWxsaSBkaXN0cmlidXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmVybm91bGxpX2Rpc3RyaWJ1dGlvbilcbiAqIGlzIHRoZSBwcm9iYWJpbGl0eSBkaXNjcmV0ZVxuICogZGlzdHJpYnV0aW9uIG9mIGEgcmFuZG9tIHZhcmlhYmxlIHdoaWNoIHRha2VzIHZhbHVlIDEgd2l0aCBzdWNjZXNzXG4gKiBwcm9iYWJpbGl0eSBgcGAgYW5kIHZhbHVlIDAgd2l0aCBmYWlsdXJlXG4gKiBwcm9iYWJpbGl0eSBgcWAgPSAxIC0gYHBgLiBJdCBjYW4gYmUgdXNlZCwgZm9yIGV4YW1wbGUsIHRvIHJlcHJlc2VudCB0aGVcbiAqIHRvc3Mgb2YgYSBjb2luLCB3aGVyZSBcIjFcIiBpcyBkZWZpbmVkIHRvIG1lYW4gXCJoZWFkc1wiIGFuZCBcIjBcIiBpcyBkZWZpbmVkXG4gKiB0byBtZWFuIFwidGFpbHNcIiAob3IgdmljZSB2ZXJzYSkuIEl0IGlzXG4gKiBhIHNwZWNpYWwgY2FzZSBvZiBhIEJpbm9taWFsIERpc3RyaWJ1dGlvblxuICogd2hlcmUgYG5gID0gMS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gcCBpbnB1dCB2YWx1ZSwgYmV0d2VlbiAwIGFuZCAxIGluY2x1c2l2ZVxuICogQHJldHVybnMge251bWJlcn0gdmFsdWUgb2YgYmVybm91bGxpIGRpc3RyaWJ1dGlvbiBhdCB0aGlzIHBvaW50XG4gKi9cbmZ1bmN0aW9uIGJlcm5vdWxsaURpc3RyaWJ1dGlvbihwKSB7XG4gICAgLy8gQ2hlY2sgdGhhdCBgcGAgaXMgYSB2YWxpZCBwcm9iYWJpbGl0eSAoMCDiiaQgcCDiiaQgMSlcbiAgICBpZiAocCA8IDAgfHwgcCA+IDEgKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICByZXR1cm4gYmlub21pYWxEaXN0cmlidXRpb24oMSwgcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmVybm91bGxpRGlzdHJpYnV0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXBzaWxvbiA9IHJlcXVpcmUoJy4vZXBzaWxvbicpO1xudmFyIGZhY3RvcmlhbCA9IHJlcXVpcmUoJy4vZmFjdG9yaWFsJyk7XG5cbi8qKlxuICogVGhlIFtCaW5vbWlhbCBEaXN0cmlidXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmlub21pYWxfZGlzdHJpYnV0aW9uKSBpcyB0aGUgZGlzY3JldGUgcHJvYmFiaWxpdHlcbiAqIGRpc3RyaWJ1dGlvbiBvZiB0aGUgbnVtYmVyIG9mIHN1Y2Nlc3NlcyBpbiBhIHNlcXVlbmNlIG9mIG4gaW5kZXBlbmRlbnQgeWVzL25vIGV4cGVyaW1lbnRzLCBlYWNoIG9mIHdoaWNoIHlpZWxkc1xuICogc3VjY2VzcyB3aXRoIHByb2JhYmlsaXR5IGBwcm9iYWJpbGl0eWAuIFN1Y2ggYSBzdWNjZXNzL2ZhaWx1cmUgZXhwZXJpbWVudCBpcyBhbHNvIGNhbGxlZCBhIEJlcm5vdWxsaSBleHBlcmltZW50IG9yXG4gKiBCZXJub3VsbGkgdHJpYWw7IHdoZW4gdHJpYWxzID0gMSwgdGhlIEJpbm9taWFsIERpc3RyaWJ1dGlvbiBpcyBhIEJlcm5vdWxsaSBEaXN0cmlidXRpb24uXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHRyaWFscyBudW1iZXIgb2YgdHJpYWxzIHRvIHNpbXVsYXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcHJvYmFiaWxpdHlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG91dHB1dFxuICovXG5mdW5jdGlvbiBiaW5vbWlhbERpc3RyaWJ1dGlvbih0cmlhbHMsIHByb2JhYmlsaXR5KSB7XG4gICAgLy8gQ2hlY2sgdGhhdCBgcGAgaXMgYSB2YWxpZCBwcm9iYWJpbGl0eSAoMCDiiaQgcCDiiaQgMSksXG4gICAgLy8gdGhhdCBgbmAgaXMgYW4gaW50ZWdlciwgc3RyaWN0bHkgcG9zaXRpdmUuXG4gICAgaWYgKHByb2JhYmlsaXR5IDwgMCB8fCBwcm9iYWJpbGl0eSA+IDEgfHxcbiAgICAgICAgdHJpYWxzIDw9IDAgfHwgdHJpYWxzICUgMSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBXZSBpbml0aWFsaXplIGB4YCwgdGhlIHJhbmRvbSB2YXJpYWJsZSwgYW5kIGBhY2N1bXVsYXRvcmAsIGFuIGFjY3VtdWxhdG9yXG4gICAgLy8gZm9yIHRoZSBjdW11bGF0aXZlIGRpc3RyaWJ1dGlvbiBmdW5jdGlvbiB0byAwLiBgZGlzdHJpYnV0aW9uX2Z1bmN0aW9uc2BcbiAgICAvLyBpcyB0aGUgb2JqZWN0IHdlJ2xsIHJldHVybiB3aXRoIHRoZSBgcHJvYmFiaWxpdHlfb2ZfeGAgYW5kIHRoZVxuICAgIC8vIGBjdW11bGF0aXZlUHJvYmFiaWxpdHlfb2ZfeGAsIGFzIHdlbGwgYXMgdGhlIGNhbGN1bGF0ZWQgbWVhbiAmXG4gICAgLy8gdmFyaWFuY2UuIFdlIGl0ZXJhdGUgdW50aWwgdGhlIGBjdW11bGF0aXZlUHJvYmFiaWxpdHlfb2ZfeGAgaXNcbiAgICAvLyB3aXRoaW4gYGVwc2lsb25gIG9mIDEuMC5cbiAgICB2YXIgeCA9IDAsXG4gICAgICAgIGN1bXVsYXRpdmVQcm9iYWJpbGl0eSA9IDAsXG4gICAgICAgIGNlbGxzID0ge307XG5cbiAgICAvLyBUaGlzIGFsZ29yaXRobSBpdGVyYXRlcyB0aHJvdWdoIGVhY2ggcG90ZW50aWFsIG91dGNvbWUsXG4gICAgLy8gdW50aWwgdGhlIGBjdW11bGF0aXZlUHJvYmFiaWxpdHlgIGlzIHZlcnkgY2xvc2UgdG8gMSwgYXRcbiAgICAvLyB3aGljaCBwb2ludCB3ZSd2ZSBkZWZpbmVkIHRoZSB2YXN0IG1ham9yaXR5IG9mIG91dGNvbWVzXG4gICAgZG8ge1xuICAgICAgICAvLyBhIFtwcm9iYWJpbGl0eSBtYXNzIGZ1bmN0aW9uXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qcm9iYWJpbGl0eV9tYXNzX2Z1bmN0aW9uKVxuICAgICAgICBjZWxsc1t4XSA9IGZhY3RvcmlhbCh0cmlhbHMpIC9cbiAgICAgICAgICAgIChmYWN0b3JpYWwoeCkgKiBmYWN0b3JpYWwodHJpYWxzIC0geCkpICpcbiAgICAgICAgICAgIChNYXRoLnBvdyhwcm9iYWJpbGl0eSwgeCkgKiBNYXRoLnBvdygxIC0gcHJvYmFiaWxpdHksIHRyaWFscyAtIHgpKTtcbiAgICAgICAgY3VtdWxhdGl2ZVByb2JhYmlsaXR5ICs9IGNlbGxzW3hdO1xuICAgICAgICB4Kys7XG4gICAgLy8gd2hlbiB0aGUgY3VtdWxhdGl2ZVByb2JhYmlsaXR5IGlzIG5lYXJseSAxLCB3ZSd2ZSBjYWxjdWxhdGVkXG4gICAgLy8gdGhlIHVzZWZ1bCByYW5nZSBvZiB0aGlzIGRpc3RyaWJ1dGlvblxuICAgIH0gd2hpbGUgKGN1bXVsYXRpdmVQcm9iYWJpbGl0eSA8IDEgLSBlcHNpbG9uKTtcblxuICAgIHJldHVybiBjZWxscztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5vbWlhbERpc3RyaWJ1dGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiAqKlBlcmNlbnRhZ2UgUG9pbnRzIG9mIHRoZSDPhzIgKENoaS1TcXVhcmVkKSBEaXN0cmlidXRpb24qKlxuICpcbiAqIFRoZSBbz4cyIChDaGktU3F1YXJlZCkgRGlzdHJpYnV0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NoaS1zcXVhcmVkX2Rpc3RyaWJ1dGlvbikgaXMgdXNlZCBpbiB0aGUgY29tbW9uXG4gKiBjaGktc3F1YXJlZCB0ZXN0cyBmb3IgZ29vZG5lc3Mgb2YgZml0IG9mIGFuIG9ic2VydmVkIGRpc3RyaWJ1dGlvbiB0byBhIHRoZW9yZXRpY2FsIG9uZSwgdGhlIGluZGVwZW5kZW5jZSBvZiB0d29cbiAqIGNyaXRlcmlhIG9mIGNsYXNzaWZpY2F0aW9uIG9mIHF1YWxpdGF0aXZlIGRhdGEsIGFuZCBpbiBjb25maWRlbmNlIGludGVydmFsIGVzdGltYXRpb24gZm9yIGEgcG9wdWxhdGlvbiBzdGFuZGFyZFxuICogZGV2aWF0aW9uIG9mIGEgbm9ybWFsIGRpc3RyaWJ1dGlvbiBmcm9tIGEgc2FtcGxlIHN0YW5kYXJkIGRldmlhdGlvbi5cbiAqXG4gKiBWYWx1ZXMgZnJvbSBBcHBlbmRpeCAxLCBUYWJsZSBJSUkgb2YgV2lsbGlhbSBXLiBIaW5lcyAmIERvdWdsYXMgQy4gTW9udGdvbWVyeSwgXCJQcm9iYWJpbGl0eSBhbmQgU3RhdGlzdGljcyBpblxuICogRW5naW5lZXJpbmcgYW5kIE1hbmFnZW1lbnQgU2NpZW5jZVwiLCBXaWxleSAoMTk4MCkuXG4gKi9cbnZhciBjaGlTcXVhcmVkRGlzdHJpYnV0aW9uVGFibGUgPSB7XG4gICAgMTogeyAwLjk5NTogIDAuMDAsIDAuOTk6ICAwLjAwLCAwLjk3NTogIDAuMDAsIDAuOTU6ICAwLjAwLCAwLjk6ICAwLjAyLCAwLjU6ICAwLjQ1LCAwLjE6ICAyLjcxLCAwLjA1OiAgMy44NCwgMC4wMjU6ICA1LjAyLCAwLjAxOiAgNi42MywgMC4wMDU6ICA3Ljg4IH0sXG4gICAgMjogeyAwLjk5NTogIDAuMDEsIDAuOTk6ICAwLjAyLCAwLjk3NTogIDAuMDUsIDAuOTU6ICAwLjEwLCAwLjk6ICAwLjIxLCAwLjU6ICAxLjM5LCAwLjE6ICA0LjYxLCAwLjA1OiAgNS45OSwgMC4wMjU6ICA3LjM4LCAwLjAxOiAgOS4yMSwgMC4wMDU6IDEwLjYwIH0sXG4gICAgMzogeyAwLjk5NTogIDAuMDcsIDAuOTk6ICAwLjExLCAwLjk3NTogIDAuMjIsIDAuOTU6ICAwLjM1LCAwLjk6ICAwLjU4LCAwLjU6ICAyLjM3LCAwLjE6ICA2LjI1LCAwLjA1OiAgNy44MSwgMC4wMjU6ICA5LjM1LCAwLjAxOiAxMS4zNCwgMC4wMDU6IDEyLjg0IH0sXG4gICAgNDogeyAwLjk5NTogIDAuMjEsIDAuOTk6ICAwLjMwLCAwLjk3NTogIDAuNDgsIDAuOTU6ICAwLjcxLCAwLjk6ICAxLjA2LCAwLjU6ICAzLjM2LCAwLjE6ICA3Ljc4LCAwLjA1OiAgOS40OSwgMC4wMjU6IDExLjE0LCAwLjAxOiAxMy4yOCwgMC4wMDU6IDE0Ljg2IH0sXG4gICAgNTogeyAwLjk5NTogIDAuNDEsIDAuOTk6ICAwLjU1LCAwLjk3NTogIDAuODMsIDAuOTU6ICAxLjE1LCAwLjk6ICAxLjYxLCAwLjU6ICA0LjM1LCAwLjE6ICA5LjI0LCAwLjA1OiAxMS4wNywgMC4wMjU6IDEyLjgzLCAwLjAxOiAxNS4wOSwgMC4wMDU6IDE2Ljc1IH0sXG4gICAgNjogeyAwLjk5NTogIDAuNjgsIDAuOTk6ICAwLjg3LCAwLjk3NTogIDEuMjQsIDAuOTU6ICAxLjY0LCAwLjk6ICAyLjIwLCAwLjU6ICA1LjM1LCAwLjE6IDEwLjY1LCAwLjA1OiAxMi41OSwgMC4wMjU6IDE0LjQ1LCAwLjAxOiAxNi44MSwgMC4wMDU6IDE4LjU1IH0sXG4gICAgNzogeyAwLjk5NTogIDAuOTksIDAuOTk6ICAxLjI1LCAwLjk3NTogIDEuNjksIDAuOTU6ICAyLjE3LCAwLjk6ICAyLjgzLCAwLjU6ICA2LjM1LCAwLjE6IDEyLjAyLCAwLjA1OiAxNC4wNywgMC4wMjU6IDE2LjAxLCAwLjAxOiAxOC40OCwgMC4wMDU6IDIwLjI4IH0sXG4gICAgODogeyAwLjk5NTogIDEuMzQsIDAuOTk6ICAxLjY1LCAwLjk3NTogIDIuMTgsIDAuOTU6ICAyLjczLCAwLjk6ICAzLjQ5LCAwLjU6ICA3LjM0LCAwLjE6IDEzLjM2LCAwLjA1OiAxNS41MSwgMC4wMjU6IDE3LjUzLCAwLjAxOiAyMC4wOSwgMC4wMDU6IDIxLjk2IH0sXG4gICAgOTogeyAwLjk5NTogIDEuNzMsIDAuOTk6ICAyLjA5LCAwLjk3NTogIDIuNzAsIDAuOTU6ICAzLjMzLCAwLjk6ICA0LjE3LCAwLjU6ICA4LjM0LCAwLjE6IDE0LjY4LCAwLjA1OiAxNi45MiwgMC4wMjU6IDE5LjAyLCAwLjAxOiAyMS42NywgMC4wMDU6IDIzLjU5IH0sXG4gICAgMTA6IHsgMC45OTU6ICAyLjE2LCAwLjk5OiAgMi41NiwgMC45NzU6ICAzLjI1LCAwLjk1OiAgMy45NCwgMC45OiAgNC44NywgMC41OiAgOS4zNCwgMC4xOiAxNS45OSwgMC4wNTogMTguMzEsIDAuMDI1OiAyMC40OCwgMC4wMTogMjMuMjEsIDAuMDA1OiAyNS4xOSB9LFxuICAgIDExOiB7IDAuOTk1OiAgMi42MCwgMC45OTogIDMuMDUsIDAuOTc1OiAgMy44MiwgMC45NTogIDQuNTcsIDAuOTogIDUuNTgsIDAuNTogMTAuMzQsIDAuMTogMTcuMjgsIDAuMDU6IDE5LjY4LCAwLjAyNTogMjEuOTIsIDAuMDE6IDI0LjcyLCAwLjAwNTogMjYuNzYgfSxcbiAgICAxMjogeyAwLjk5NTogIDMuMDcsIDAuOTk6ICAzLjU3LCAwLjk3NTogIDQuNDAsIDAuOTU6ICA1LjIzLCAwLjk6ICA2LjMwLCAwLjU6IDExLjM0LCAwLjE6IDE4LjU1LCAwLjA1OiAyMS4wMywgMC4wMjU6IDIzLjM0LCAwLjAxOiAyNi4yMiwgMC4wMDU6IDI4LjMwIH0sXG4gICAgMTM6IHsgMC45OTU6ICAzLjU3LCAwLjk5OiAgNC4xMSwgMC45NzU6ICA1LjAxLCAwLjk1OiAgNS44OSwgMC45OiAgNy4wNCwgMC41OiAxMi4zNCwgMC4xOiAxOS44MSwgMC4wNTogMjIuMzYsIDAuMDI1OiAyNC43NCwgMC4wMTogMjcuNjksIDAuMDA1OiAyOS44MiB9LFxuICAgIDE0OiB7IDAuOTk1OiAgNC4wNywgMC45OTogIDQuNjYsIDAuOTc1OiAgNS42MywgMC45NTogIDYuNTcsIDAuOTogIDcuNzksIDAuNTogMTMuMzQsIDAuMTogMjEuMDYsIDAuMDU6IDIzLjY4LCAwLjAyNTogMjYuMTIsIDAuMDE6IDI5LjE0LCAwLjAwNTogMzEuMzIgfSxcbiAgICAxNTogeyAwLjk5NTogIDQuNjAsIDAuOTk6ICA1LjIzLCAwLjk3NTogIDYuMjcsIDAuOTU6ICA3LjI2LCAwLjk6ICA4LjU1LCAwLjU6IDE0LjM0LCAwLjE6IDIyLjMxLCAwLjA1OiAyNS4wMCwgMC4wMjU6IDI3LjQ5LCAwLjAxOiAzMC41OCwgMC4wMDU6IDMyLjgwIH0sXG4gICAgMTY6IHsgMC45OTU6ICA1LjE0LCAwLjk5OiAgNS44MSwgMC45NzU6ICA2LjkxLCAwLjk1OiAgNy45NiwgMC45OiAgOS4zMSwgMC41OiAxNS4zNCwgMC4xOiAyMy41NCwgMC4wNTogMjYuMzAsIDAuMDI1OiAyOC44NSwgMC4wMTogMzIuMDAsIDAuMDA1OiAzNC4yNyB9LFxuICAgIDE3OiB7IDAuOTk1OiAgNS43MCwgMC45OTogIDYuNDEsIDAuOTc1OiAgNy41NiwgMC45NTogIDguNjcsIDAuOTogMTAuMDksIDAuNTogMTYuMzQsIDAuMTogMjQuNzcsIDAuMDU6IDI3LjU5LCAwLjAyNTogMzAuMTksIDAuMDE6IDMzLjQxLCAwLjAwNTogMzUuNzIgfSxcbiAgICAxODogeyAwLjk5NTogIDYuMjYsIDAuOTk6ICA3LjAxLCAwLjk3NTogIDguMjMsIDAuOTU6ICA5LjM5LCAwLjk6IDEwLjg3LCAwLjU6IDE3LjM0LCAwLjE6IDI1Ljk5LCAwLjA1OiAyOC44NywgMC4wMjU6IDMxLjUzLCAwLjAxOiAzNC44MSwgMC4wMDU6IDM3LjE2IH0sXG4gICAgMTk6IHsgMC45OTU6ICA2Ljg0LCAwLjk5OiAgNy42MywgMC45NzU6ICA4LjkxLCAwLjk1OiAxMC4xMiwgMC45OiAxMS42NSwgMC41OiAxOC4zNCwgMC4xOiAyNy4yMCwgMC4wNTogMzAuMTQsIDAuMDI1OiAzMi44NSwgMC4wMTogMzYuMTksIDAuMDA1OiAzOC41OCB9LFxuICAgIDIwOiB7IDAuOTk1OiAgNy40MywgMC45OTogIDguMjYsIDAuOTc1OiAgOS41OSwgMC45NTogMTAuODUsIDAuOTogMTIuNDQsIDAuNTogMTkuMzQsIDAuMTogMjguNDEsIDAuMDU6IDMxLjQxLCAwLjAyNTogMzQuMTcsIDAuMDE6IDM3LjU3LCAwLjAwNTogNDAuMDAgfSxcbiAgICAyMTogeyAwLjk5NTogIDguMDMsIDAuOTk6ICA4LjkwLCAwLjk3NTogMTAuMjgsIDAuOTU6IDExLjU5LCAwLjk6IDEzLjI0LCAwLjU6IDIwLjM0LCAwLjE6IDI5LjYyLCAwLjA1OiAzMi42NywgMC4wMjU6IDM1LjQ4LCAwLjAxOiAzOC45MywgMC4wMDU6IDQxLjQwIH0sXG4gICAgMjI6IHsgMC45OTU6ICA4LjY0LCAwLjk5OiAgOS41NCwgMC45NzU6IDEwLjk4LCAwLjk1OiAxMi4zNCwgMC45OiAxNC4wNCwgMC41OiAyMS4zNCwgMC4xOiAzMC44MSwgMC4wNTogMzMuOTIsIDAuMDI1OiAzNi43OCwgMC4wMTogNDAuMjksIDAuMDA1OiA0Mi44MCB9LFxuICAgIDIzOiB7IDAuOTk1OiAgOS4yNiwgMC45OTogMTAuMjAsIDAuOTc1OiAxMS42OSwgMC45NTogMTMuMDksIDAuOTogMTQuODUsIDAuNTogMjIuMzQsIDAuMTogMzIuMDEsIDAuMDU6IDM1LjE3LCAwLjAyNTogMzguMDgsIDAuMDE6IDQxLjY0LCAwLjAwNTogNDQuMTggfSxcbiAgICAyNDogeyAwLjk5NTogIDkuODksIDAuOTk6IDEwLjg2LCAwLjk3NTogMTIuNDAsIDAuOTU6IDEzLjg1LCAwLjk6IDE1LjY2LCAwLjU6IDIzLjM0LCAwLjE6IDMzLjIwLCAwLjA1OiAzNi40MiwgMC4wMjU6IDM5LjM2LCAwLjAxOiA0Mi45OCwgMC4wMDU6IDQ1LjU2IH0sXG4gICAgMjU6IHsgMC45OTU6IDEwLjUyLCAwLjk5OiAxMS41MiwgMC45NzU6IDEzLjEyLCAwLjk1OiAxNC42MSwgMC45OiAxNi40NywgMC41OiAyNC4zNCwgMC4xOiAzNC4yOCwgMC4wNTogMzcuNjUsIDAuMDI1OiA0MC42NSwgMC4wMTogNDQuMzEsIDAuMDA1OiA0Ni45MyB9LFxuICAgIDI2OiB7IDAuOTk1OiAxMS4xNiwgMC45OTogMTIuMjAsIDAuOTc1OiAxMy44NCwgMC45NTogMTUuMzgsIDAuOTogMTcuMjksIDAuNTogMjUuMzQsIDAuMTogMzUuNTYsIDAuMDU6IDM4Ljg5LCAwLjAyNTogNDEuOTIsIDAuMDE6IDQ1LjY0LCAwLjAwNTogNDguMjkgfSxcbiAgICAyNzogeyAwLjk5NTogMTEuODEsIDAuOTk6IDEyLjg4LCAwLjk3NTogMTQuNTcsIDAuOTU6IDE2LjE1LCAwLjk6IDE4LjExLCAwLjU6IDI2LjM0LCAwLjE6IDM2Ljc0LCAwLjA1OiA0MC4xMSwgMC4wMjU6IDQzLjE5LCAwLjAxOiA0Ni45NiwgMC4wMDU6IDQ5LjY1IH0sXG4gICAgMjg6IHsgMC45OTU6IDEyLjQ2LCAwLjk5OiAxMy41NywgMC45NzU6IDE1LjMxLCAwLjk1OiAxNi45MywgMC45OiAxOC45NCwgMC41OiAyNy4zNCwgMC4xOiAzNy45MiwgMC4wNTogNDEuMzQsIDAuMDI1OiA0NC40NiwgMC4wMTogNDguMjgsIDAuMDA1OiA1MC45OSB9LFxuICAgIDI5OiB7IDAuOTk1OiAxMy4xMiwgMC45OTogMTQuMjYsIDAuOTc1OiAxNi4wNSwgMC45NTogMTcuNzEsIDAuOTogMTkuNzcsIDAuNTogMjguMzQsIDAuMTogMzkuMDksIDAuMDU6IDQyLjU2LCAwLjAyNTogNDUuNzIsIDAuMDE6IDQ5LjU5LCAwLjAwNTogNTIuMzQgfSxcbiAgICAzMDogeyAwLjk5NTogMTMuNzksIDAuOTk6IDE0Ljk1LCAwLjk3NTogMTYuNzksIDAuOTU6IDE4LjQ5LCAwLjk6IDIwLjYwLCAwLjU6IDI5LjM0LCAwLjE6IDQwLjI2LCAwLjA1OiA0My43NywgMC4wMjU6IDQ2Ljk4LCAwLjAxOiA1MC44OSwgMC4wMDU6IDUzLjY3IH0sXG4gICAgNDA6IHsgMC45OTU6IDIwLjcxLCAwLjk5OiAyMi4xNiwgMC45NzU6IDI0LjQzLCAwLjk1OiAyNi41MSwgMC45OiAyOS4wNSwgMC41OiAzOS4zNCwgMC4xOiA1MS44MSwgMC4wNTogNTUuNzYsIDAuMDI1OiA1OS4zNCwgMC4wMTogNjMuNjksIDAuMDA1OiA2Ni43NyB9LFxuICAgIDUwOiB7IDAuOTk1OiAyNy45OSwgMC45OTogMjkuNzEsIDAuOTc1OiAzMi4zNiwgMC45NTogMzQuNzYsIDAuOTogMzcuNjksIDAuNTogNDkuMzMsIDAuMTogNjMuMTcsIDAuMDU6IDY3LjUwLCAwLjAyNTogNzEuNDIsIDAuMDE6IDc2LjE1LCAwLjAwNTogNzkuNDkgfSxcbiAgICA2MDogeyAwLjk5NTogMzUuNTMsIDAuOTk6IDM3LjQ4LCAwLjk3NTogNDAuNDgsIDAuOTU6IDQzLjE5LCAwLjk6IDQ2LjQ2LCAwLjU6IDU5LjMzLCAwLjE6IDc0LjQwLCAwLjA1OiA3OS4wOCwgMC4wMjU6IDgzLjMwLCAwLjAxOiA4OC4zOCwgMC4wMDU6IDkxLjk1IH0sXG4gICAgNzA6IHsgMC45OTU6IDQzLjI4LCAwLjk5OiA0NS40NCwgMC45NzU6IDQ4Ljc2LCAwLjk1OiA1MS43NCwgMC45OiA1NS4zMywgMC41OiA2OS4zMywgMC4xOiA4NS41MywgMC4wNTogOTAuNTMsIDAuMDI1OiA5NS4wMiwgMC4wMTogMTAwLjQyLCAwLjAwNTogMTA0LjIyIH0sXG4gICAgODA6IHsgMC45OTU6IDUxLjE3LCAwLjk5OiA1My41NCwgMC45NzU6IDU3LjE1LCAwLjk1OiA2MC4zOSwgMC45OiA2NC4yOCwgMC41OiA3OS4zMywgMC4xOiA5Ni41OCwgMC4wNTogMTAxLjg4LCAwLjAyNTogMTA2LjYzLCAwLjAxOiAxMTIuMzMsIDAuMDA1OiAxMTYuMzIgfSxcbiAgICA5MDogeyAwLjk5NTogNTkuMjAsIDAuOTk6IDYxLjc1LCAwLjk3NTogNjUuNjUsIDAuOTU6IDY5LjEzLCAwLjk6IDczLjI5LCAwLjU6IDg5LjMzLCAwLjE6IDEwNy41NywgMC4wNTogMTEzLjE0LCAwLjAyNTogMTE4LjE0LCAwLjAxOiAxMjQuMTIsIDAuMDA1OiAxMjguMzAgfSxcbiAgICAxMDA6IHsgMC45OTU6IDY3LjMzLCAwLjk5OiA3MC4wNiwgMC45NzU6IDc0LjIyLCAwLjk1OiA3Ny45MywgMC45OiA4Mi4zNiwgMC41OiA5OS4zMywgMC4xOiAxMTguNTAsIDAuMDU6IDEyNC4zNCwgMC4wMjU6IDEyOS41NiwgMC4wMTogMTM1LjgxLCAwLjAwNTogMTQwLjE3IH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2hpU3F1YXJlZERpc3RyaWJ1dGlvblRhYmxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVhbiA9IHJlcXVpcmUoJy4vbWVhbicpO1xudmFyIGNoaVNxdWFyZWREaXN0cmlidXRpb25UYWJsZSA9IHJlcXVpcmUoJy4vY2hpX3NxdWFyZWRfZGlzdHJpYnV0aW9uX3RhYmxlJyk7XG5cbi8qKlxuICogVGhlIFvPhzIgKENoaS1TcXVhcmVkKSBHb29kbmVzcy1vZi1GaXQgVGVzdF0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Hb29kbmVzc19vZl9maXQjUGVhcnNvbi4yN3NfY2hpLXNxdWFyZWRfdGVzdClcbiAqIHVzZXMgYSBtZWFzdXJlIG9mIGdvb2RuZXNzIG9mIGZpdCB3aGljaCBpcyB0aGUgc3VtIG9mIGRpZmZlcmVuY2VzIGJldHdlZW4gb2JzZXJ2ZWQgYW5kIGV4cGVjdGVkIG91dGNvbWUgZnJlcXVlbmNpZXNcbiAqICh0aGF0IGlzLCBjb3VudHMgb2Ygb2JzZXJ2YXRpb25zKSwgZWFjaCBzcXVhcmVkIGFuZCBkaXZpZGVkIGJ5IHRoZSBudW1iZXIgb2Ygb2JzZXJ2YXRpb25zIGV4cGVjdGVkIGdpdmVuIHRoZVxuICogaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbi4gVGhlIHJlc3VsdGluZyDPhzIgc3RhdGlzdGljLCBgY2hpU3F1YXJlZGAsIGNhbiBiZSBjb21wYXJlZCB0byB0aGUgY2hpLXNxdWFyZWQgZGlzdHJpYnV0aW9uXG4gKiB0byBkZXRlcm1pbmUgdGhlIGdvb2RuZXNzIG9mIGZpdC4gSW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHRoZSBkZWdyZWVzIG9mIGZyZWVkb20gb2YgdGhlIGNoaS1zcXVhcmVkIGRpc3RyaWJ1dGlvbiwgb25lXG4gKiB0YWtlcyB0aGUgdG90YWwgbnVtYmVyIG9mIG9ic2VydmVkIGZyZXF1ZW5jaWVzIGFuZCBzdWJ0cmFjdHMgdGhlIG51bWJlciBvZiBlc3RpbWF0ZWQgcGFyYW1ldGVycy4gVGhlIHRlc3Qgc3RhdGlzdGljXG4gKiBmb2xsb3dzLCBhcHByb3hpbWF0ZWx5LCBhIGNoaS1zcXVhcmUgZGlzdHJpYnV0aW9uIHdpdGggKGsg4oiSIGMpIGRlZ3JlZXMgb2YgZnJlZWRvbSB3aGVyZSBga2AgaXMgdGhlIG51bWJlciBvZiBub24tZW1wdHlcbiAqIGNlbGxzIGFuZCBgY2AgaXMgdGhlIG51bWJlciBvZiBlc3RpbWF0ZWQgcGFyYW1ldGVycyBmb3IgdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRpc3RyaWJ1dGlvblR5cGUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwb2ludCBpbiBhIGRpc3RyaWJ1dGlvbjpcbiAqIGZvciBpbnN0YW5jZSwgYmlub21pYWwsIGJlcm5vdWxsaSwgb3IgcG9pc3NvblxuICogQHBhcmFtIHtudW1iZXJ9IHNpZ25pZmljYW5jZVxuICogQHJldHVybnMge251bWJlcn0gY2hpIHNxdWFyZWQgZ29vZG5lc3Mgb2YgZml0XG4gKiBAZXhhbXBsZVxuICogLy8gRGF0YSBmcm9tIFBvaXNzb24gZ29vZG5lc3Mtb2YtZml0IGV4YW1wbGUgMTAtMTkgaW4gV2lsbGlhbSBXLiBIaW5lcyAmIERvdWdsYXMgQy4gTW9udGdvbWVyeSxcbiAqIC8vIFwiUHJvYmFiaWxpdHkgYW5kIFN0YXRpc3RpY3MgaW4gRW5naW5lZXJpbmcgYW5kIE1hbmFnZW1lbnQgU2NpZW5jZVwiLCBXaWxleSAoMTk4MCkuXG4gKiB2YXIgZGF0YTEwMTkgPSBbXG4gKiAgICAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCxcbiAqICAgICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLFxuICogICAgIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsXG4gKiAgICAgMiwgMiwgMiwgMiwgMiwgMiwgMiwgMiwgMixcbiAqICAgICAzLCAzLCAzLCAzXG4gKiBdO1xuICogc3MuY2hpU3F1YXJlZEdvb2RuZXNzT2ZGaXQoZGF0YTEwMTksIHNzLnBvaXNzb25EaXN0cmlidXRpb24sIDAuMDUpKTsgLy89IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGNoaVNxdWFyZWRHb29kbmVzc09mRml0KGRhdGEsIGRpc3RyaWJ1dGlvblR5cGUsIHNpZ25pZmljYW5jZSkge1xuICAgIC8vIEVzdGltYXRlIGZyb20gdGhlIHNhbXBsZSBkYXRhLCBhIHdlaWdodGVkIG1lYW4uXG4gICAgdmFyIGlucHV0TWVhbiA9IG1lYW4oZGF0YSksXG4gICAgICAgIC8vIENhbGN1bGF0ZWQgdmFsdWUgb2YgdGhlIM+HMiBzdGF0aXN0aWMuXG4gICAgICAgIGNoaVNxdWFyZWQgPSAwLFxuICAgICAgICAvLyBEZWdyZWVzIG9mIGZyZWVkb20sIGNhbGN1bGF0ZWQgYXMgKG51bWJlciBvZiBjbGFzcyBpbnRlcnZhbHMgLVxuICAgICAgICAvLyBudW1iZXIgb2YgaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbiBwYXJhbWV0ZXJzIGVzdGltYXRlZCAtIDEpXG4gICAgICAgIGRlZ3JlZXNPZkZyZWVkb20sXG4gICAgICAgIC8vIE51bWJlciBvZiBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uIHBhcmFtZXRlcnMgZXN0aW1hdGVkLCBleHBlY3RlZCB0byBiZSBzdXBwbGllZCBpbiB0aGUgZGlzdHJpYnV0aW9uIHRlc3QuXG4gICAgICAgIC8vIExvc2Ugb25lIGRlZ3JlZSBvZiBmcmVlZG9tIGZvciBlc3RpbWF0aW5nIGBsYW1iZGFgIGZyb20gdGhlIHNhbXBsZSBkYXRhLlxuICAgICAgICBjID0gMSxcbiAgICAgICAgLy8gVGhlIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24uXG4gICAgICAgIC8vIEdlbmVyYXRlIHRoZSBoeXBvdGhlc2l6ZWQgZGlzdHJpYnV0aW9uLlxuICAgICAgICBoeXBvdGhlc2l6ZWREaXN0cmlidXRpb24gPSBkaXN0cmlidXRpb25UeXBlKGlucHV0TWVhbiksXG4gICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXMgPSBbXSxcbiAgICAgICAgZXhwZWN0ZWRGcmVxdWVuY2llcyA9IFtdLFxuICAgICAgICBrO1xuXG4gICAgLy8gQ3JlYXRlIGFuIGFycmF5IGhvbGRpbmcgYSBoaXN0b2dyYW0gZnJvbSB0aGUgc2FtcGxlIGRhdGEsIG9mXG4gICAgLy8gdGhlIGZvcm0gYHsgdmFsdWU6IG51bWJlck9mT2N1cnJlbmNlcyB9YFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAob2JzZXJ2ZWRGcmVxdWVuY2llc1tkYXRhW2ldXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzW2RhdGFbaV1dID0gMDtcbiAgICAgICAgfVxuICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzW2RhdGFbaV1dKys7XG4gICAgfVxuXG4gICAgLy8gVGhlIGhpc3RvZ3JhbSB3ZSBjcmVhdGVkIG1pZ2h0IGJlIHNwYXJzZSAtIHRoZXJlIG1pZ2h0IGJlIGdhcHNcbiAgICAvLyBiZXR3ZWVuIHZhbHVlcy4gU28gd2UgaXRlcmF0ZSB0aHJvdWdoIHRoZSBoaXN0b2dyYW0sIG1ha2luZ1xuICAgIC8vIHN1cmUgdGhhdCBpbnN0ZWFkIG9mIHVuZGVmaW5lZCwgZ2FwcyBoYXZlIDAgdmFsdWVzLlxuICAgIGZvciAoaSA9IDA7IGkgPCBvYnNlcnZlZEZyZXF1ZW5jaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvYnNlcnZlZEZyZXF1ZW5jaWVzW2ldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG9ic2VydmVkRnJlcXVlbmNpZXNbaV0gPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuIGFycmF5IGhvbGRpbmcgYSBoaXN0b2dyYW0gb2YgZXhwZWN0ZWQgZGF0YSBnaXZlbiB0aGVcbiAgICAvLyBzYW1wbGUgc2l6ZSBhbmQgaHlwb3RoZXNpemVkIGRpc3RyaWJ1dGlvbi5cbiAgICBmb3IgKGsgaW4gaHlwb3RoZXNpemVkRGlzdHJpYnV0aW9uKSB7XG4gICAgICAgIGlmIChrIGluIG9ic2VydmVkRnJlcXVlbmNpZXMpIHtcbiAgICAgICAgICAgIGV4cGVjdGVkRnJlcXVlbmNpZXNba10gPSBoeXBvdGhlc2l6ZWREaXN0cmlidXRpb25ba10gKiBkYXRhLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdvcmtpbmcgYmFja3dhcmQgdGhyb3VnaCB0aGUgZXhwZWN0ZWQgZnJlcXVlbmNpZXMsIGNvbGxhcHNlIGNsYXNzZXNcbiAgICAvLyBpZiBsZXNzIHRoYW4gdGhyZWUgb2JzZXJ2YXRpb25zIGFyZSBleHBlY3RlZCBmb3IgYSBjbGFzcy5cbiAgICAvLyBUaGlzIHRyYW5zZm9ybWF0aW9uIGlzIGFwcGxpZWQgdG8gdGhlIG9ic2VydmVkIGZyZXF1ZW5jaWVzIGFzIHdlbGwuXG4gICAgZm9yIChrID0gZXhwZWN0ZWRGcmVxdWVuY2llcy5sZW5ndGggLSAxOyBrID49IDA7IGstLSkge1xuICAgICAgICBpZiAoZXhwZWN0ZWRGcmVxdWVuY2llc1trXSA8IDMpIHtcbiAgICAgICAgICAgIGV4cGVjdGVkRnJlcXVlbmNpZXNbayAtIDFdICs9IGV4cGVjdGVkRnJlcXVlbmNpZXNba107XG4gICAgICAgICAgICBleHBlY3RlZEZyZXF1ZW5jaWVzLnBvcCgpO1xuXG4gICAgICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzW2sgLSAxXSArPSBvYnNlcnZlZEZyZXF1ZW5jaWVzW2tdO1xuICAgICAgICAgICAgb2JzZXJ2ZWRGcmVxdWVuY2llcy5wb3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgc3F1YXJlZCBkaWZmZXJlbmNlcyBiZXR3ZWVuIG9ic2VydmVkICYgZXhwZWN0ZWRcbiAgICAvLyBmcmVxdWVuY2llcywgYWNjdW11bGF0aW5nIHRoZSBgY2hpU3F1YXJlZGAgc3RhdGlzdGljLlxuICAgIGZvciAoayA9IDA7IGsgPCBvYnNlcnZlZEZyZXF1ZW5jaWVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIGNoaVNxdWFyZWQgKz0gTWF0aC5wb3coXG4gICAgICAgICAgICBvYnNlcnZlZEZyZXF1ZW5jaWVzW2tdIC0gZXhwZWN0ZWRGcmVxdWVuY2llc1trXSwgMikgL1xuICAgICAgICAgICAgZXhwZWN0ZWRGcmVxdWVuY2llc1trXTtcbiAgICB9XG5cbiAgICAvLyBDYWxjdWxhdGUgZGVncmVlcyBvZiBmcmVlZG9tIGZvciB0aGlzIHRlc3QgYW5kIGxvb2sgaXQgdXAgaW4gdGhlXG4gICAgLy8gYGNoaVNxdWFyZWREaXN0cmlidXRpb25UYWJsZWAgaW4gb3JkZXIgdG9cbiAgICAvLyBhY2NlcHQgb3IgcmVqZWN0IHRoZSBnb29kbmVzcy1vZi1maXQgb2YgdGhlIGh5cG90aGVzaXplZCBkaXN0cmlidXRpb24uXG4gICAgZGVncmVlc09mRnJlZWRvbSA9IG9ic2VydmVkRnJlcXVlbmNpZXMubGVuZ3RoIC0gYyAtIDE7XG4gICAgcmV0dXJuIGNoaVNxdWFyZWREaXN0cmlidXRpb25UYWJsZVtkZWdyZWVzT2ZGcmVlZG9tXVtzaWduaWZpY2FuY2VdIDwgY2hpU3F1YXJlZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjaGlTcXVhcmVkR29vZG5lc3NPZkZpdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTcGxpdCBhbiBhcnJheSBpbnRvIGNodW5rcyBvZiBhIHNwZWNpZmllZCBzaXplLiBUaGlzIGZ1bmN0aW9uXG4gKiBoYXMgdGhlIHNhbWUgYmVoYXZpb3IgYXMgW1BIUCdzIGFycmF5X2NodW5rXShodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vZnVuY3Rpb24uYXJyYXktY2h1bmsucGhwKVxuICogZnVuY3Rpb24sIGFuZCB0aHVzIHdpbGwgaW5zZXJ0IHNtYWxsZXItc2l6ZWQgY2h1bmtzIGF0IHRoZSBlbmQgaWZcbiAqIHRoZSBpbnB1dCBzaXplIGlzIG5vdCBkaXZpc2libGUgYnkgdGhlIGNodW5rIHNpemUuXG4gKlxuICogYHNhbXBsZWAgaXMgZXhwZWN0ZWQgdG8gYmUgYW4gYXJyYXksIGFuZCBgY2h1bmtTaXplYCBhIG51bWJlci5cbiAqIFRoZSBgc2FtcGxlYCBhcnJheSBjYW4gY29udGFpbiBhbnkga2luZCBvZiBkYXRhLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNhbXBsZSBhbnkgYXJyYXkgb2YgdmFsdWVzXG4gKiBAcGFyYW0ge251bWJlcn0gY2h1bmtTaXplIHNpemUgb2YgZWFjaCBvdXRwdXQgYXJyYXlcbiAqIEByZXR1cm5zIHtBcnJheTxBcnJheT59IGEgY2h1bmtlZCBhcnJheVxuICogQGV4YW1wbGVcbiAqIGNvbnNvbGUubG9nKGNodW5rKFsxLCAyLCAzLCA0XSwgMikpOyAvLyBbWzEsIDJdLCBbMywgNF1dXG4gKi9cbmZ1bmN0aW9uIGNodW5rKHNhbXBsZSwgY2h1bmtTaXplKSB7XG5cbiAgICAvLyBhIGxpc3Qgb2YgcmVzdWx0IGNodW5rcywgYXMgYXJyYXlzIGluIGFuIGFycmF5XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuXG4gICAgLy8gYGNodW5rU2l6ZWAgbXVzdCBiZSB6ZXJvIG9yIGhpZ2hlciAtIG90aGVyd2lzZSB0aGUgbG9vcCBiZWxvdyxcbiAgICAvLyBpbiB3aGljaCB3ZSBjYWxsIGBzdGFydCArPSBjaHVua1NpemVgLCB3aWxsIGxvb3AgaW5maW5pdGVseS5cbiAgICAvLyBTbywgd2UnbGwgZGV0ZWN0IGFuZCByZXR1cm4gbnVsbCBpbiB0aGF0IGNhc2UgdG8gaW5kaWNhdGVcbiAgICAvLyBpbnZhbGlkIGlucHV0LlxuICAgIGlmIChjaHVua1NpemUgPD0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBgc3RhcnRgIGlzIHRoZSBpbmRleCBhdCB3aGljaCBgLnNsaWNlYCB3aWxsIHN0YXJ0IHNlbGVjdGluZ1xuICAgIC8vIG5ldyBhcnJheSBlbGVtZW50c1xuICAgIGZvciAodmFyIHN0YXJ0ID0gMDsgc3RhcnQgPCBzYW1wbGUubGVuZ3RoOyBzdGFydCArPSBjaHVua1NpemUpIHtcblxuICAgICAgICAvLyBmb3IgZWFjaCBjaHVuaywgc2xpY2UgdGhhdCBwYXJ0IG9mIHRoZSBhcnJheSBhbmQgYWRkIGl0XG4gICAgICAgIC8vIHRvIHRoZSBvdXRwdXQuIFRoZSBgLnNsaWNlYCBmdW5jdGlvbiBkb2VzIG5vdCBjaGFuZ2VcbiAgICAgICAgLy8gdGhlIG9yaWdpbmFsIGFycmF5LlxuICAgICAgICBvdXRwdXQucHVzaChzYW1wbGUuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgY2h1bmtTaXplKSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2h1bms7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzb3J0ZWRVbmlxdWVDb3VudCA9IHJlcXVpcmUoJy4vc29ydGVkX3VuaXF1ZV9jb3VudCcpLFxuICAgIG51bWVyaWNTb3J0ID0gcmVxdWlyZSgnLi9udW1lcmljX3NvcnQnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY29sdW1uIHggcm93IG1hdHJpeC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSByb3dzXG4gKiBAcmV0dXJuIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gbWF0cml4XG4gKiBAZXhhbXBsZVxuICogbWFrZU1hdHJpeCgxMCwgMTApO1xuICovXG5mdW5jdGlvbiBtYWtlTWF0cml4KGNvbHVtbnMsIHJvd3MpIHtcbiAgICB2YXIgbWF0cml4ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2x1bW5zOyBpKyspIHtcbiAgICAgICAgdmFyIGNvbHVtbiA9IFtdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJvd3M7IGorKykge1xuICAgICAgICAgICAgY29sdW1uLnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgICAgbWF0cml4LnB1c2goY29sdW1uKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdHJpeDtcbn1cblxuLyoqXG4gKiBDa21lYW5zIGNsdXN0ZXJpbmcgaXMgYW4gaW1wcm92ZW1lbnQgb24gaGV1cmlzdGljLWJhc2VkIGNsdXN0ZXJpbmdcbiAqIGFwcHJvYWNoZXMgbGlrZSBKZW5rcy4gVGhlIGFsZ29yaXRobSB3YXMgZGV2ZWxvcGVkIGluXG4gKiBbSGFpemhvdSBXYW5nIGFuZCBNaW5nemhvdSBTb25nXShodHRwOi8vam91cm5hbC5yLXByb2plY3Qub3JnL2FyY2hpdmUvMjAxMS0yL1JKb3VybmFsXzIwMTEtMl9XYW5nK1NvbmcucGRmKVxuICogYXMgYSBbZHluYW1pYyBwcm9ncmFtbWluZ10oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRHluYW1pY19wcm9ncmFtbWluZykgYXBwcm9hY2hcbiAqIHRvIHRoZSBwcm9ibGVtIG9mIGNsdXN0ZXJpbmcgbnVtZXJpYyBkYXRhIGludG8gZ3JvdXBzIHdpdGggdGhlIGxlYXN0XG4gKiB3aXRoaW4tZ3JvdXAgc3VtLW9mLXNxdWFyZWQtZGV2aWF0aW9ucy5cbiAqXG4gKiBNaW5pbWl6aW5nIHRoZSBkaWZmZXJlbmNlIHdpdGhpbiBncm91cHMgLSB3aGF0IFdhbmcgJiBTb25nIHJlZmVyIHRvIGFzXG4gKiBgd2l0aGluc3NgLCBvciB3aXRoaW4gc3VtLW9mLXNxdWFyZXMsIG1lYW5zIHRoYXQgZ3JvdXBzIGFyZSBvcHRpbWFsbHlcbiAqIGhvbW9nZW5vdXMgd2l0aGluIGFuZCB0aGUgZGF0YSBpcyBzcGxpdCBpbnRvIHJlcHJlc2VudGF0aXZlIGdyb3Vwcy5cbiAqIFRoaXMgaXMgdmVyeSB1c2VmdWwgZm9yIHZpc3VhbGl6YXRpb24sIHdoZXJlIHlvdSBtYXkgd2FudCB0byByZXByZXNlbnRcbiAqIGEgY29udGludW91cyB2YXJpYWJsZSBpbiBkaXNjcmV0ZSBjb2xvciBvciBzdHlsZSBncm91cHMuIFRoaXMgZnVuY3Rpb25cbiAqIGNhbiBwcm92aWRlIGdyb3VwcyB0aGF0IGVtcGhhc2l6ZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGRhdGEuXG4gKlxuICogQmVpbmcgYSBkeW5hbWljIGFwcHJvYWNoLCB0aGlzIGFsZ29yaXRobSBpcyBiYXNlZCBvbiB0d28gbWF0cmljZXMgdGhhdFxuICogc3RvcmUgaW5jcmVtZW50YWxseS1jb21wdXRlZCB2YWx1ZXMgZm9yIHNxdWFyZWQgZGV2aWF0aW9ucyBhbmQgYmFja3RyYWNraW5nXG4gKiBpbmRleGVzLlxuICpcbiAqIFVubGlrZSB0aGUgW29yaWdpbmFsIGltcGxlbWVudGF0aW9uXShodHRwczovL2NyYW4uci1wcm9qZWN0Lm9yZy93ZWIvcGFja2FnZXMvQ2ttZWFucy4xZC5kcC9pbmRleC5odG1sKSxcbiAqIHRoaXMgaW1wbGVtZW50YXRpb24gZG9lcyBub3QgaW5jbHVkZSBhbnkgY29kZSB0byBhdXRvbWF0aWNhbGx5IGRldGVybWluZVxuICogdGhlIG9wdGltYWwgbnVtYmVyIG9mIGNsdXN0ZXJzOiB0aGlzIGluZm9ybWF0aW9uIG5lZWRzIHRvIGJlIGV4cGxpY2l0bHlcbiAqIHByb3ZpZGVkLlxuICpcbiAqICMjIyBSZWZlcmVuY2VzXG4gKiBfQ2ttZWFucy4xZC5kcDogT3B0aW1hbCBrLW1lYW5zIENsdXN0ZXJpbmcgaW4gT25lIERpbWVuc2lvbiBieSBEeW5hbWljXG4gKiBQcm9ncmFtbWluZ18gSGFpemhvdSBXYW5nIGFuZCBNaW5nemhvdSBTb25nIElTU04gMjA3My00ODU5XG4gKlxuICogZnJvbSBUaGUgUiBKb3VybmFsIFZvbC4gMy8yLCBEZWNlbWJlciAyMDExXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGRhdGEgaW5wdXQgZGF0YSwgYXMgYW4gYXJyYXkgb2YgbnVtYmVyIHZhbHVlc1xuICogQHBhcmFtIHtudW1iZXJ9IG5DbHVzdGVycyBudW1iZXIgb2YgZGVzaXJlZCBjbGFzc2VzLiBUaGlzIGNhbm5vdCBiZVxuICogZ3JlYXRlciB0aGFuIHRoZSBudW1iZXIgb2YgdmFsdWVzIGluIHRoZSBkYXRhIGFycmF5LlxuICogQHJldHVybnMge0FycmF5PEFycmF5PG51bWJlcj4+fSBjbHVzdGVyZWQgaW5wdXRcbiAqIEBleGFtcGxlXG4gKiBja21lYW5zKFstMSwgMiwgLTEsIDIsIDQsIDUsIDYsIC0xLCAyLCAtMV0sIDMpO1xuICogLy8gVGhlIGlucHV0LCBjbHVzdGVyZWQgaW50byBncm91cHMgb2Ygc2ltaWxhciBudW1iZXJzLlxuICogLy89IFtbLTEsIC0xLCAtMSwgLTFdLCBbMiwgMiwgMl0sIFs0LCA1LCA2XV0pO1xuICovXG5mdW5jdGlvbiBja21lYW5zKGRhdGEsIG5DbHVzdGVycykge1xuXG4gICAgaWYgKG5DbHVzdGVycyA+IGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGdlbmVyYXRlIG1vcmUgY2xhc3NlcyB0aGFuIHRoZXJlIGFyZSBkYXRhIHZhbHVlcycpO1xuICAgIH1cblxuICAgIHZhciBzb3J0ZWQgPSBudW1lcmljU29ydChkYXRhKSxcbiAgICAgICAgLy8gd2UnbGwgdXNlIHRoaXMgYXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGNsdXN0ZXJzXG4gICAgICAgIHVuaXF1ZUNvdW50ID0gc29ydGVkVW5pcXVlQ291bnQoc29ydGVkKTtcblxuICAgIC8vIGlmIGFsbCBvZiB0aGUgaW5wdXQgdmFsdWVzIGFyZSBpZGVudGljYWwsIHRoZXJlJ3Mgb25lIGNsdXN0ZXJcbiAgICAvLyB3aXRoIGFsbCBvZiB0aGUgaW5wdXQgaW4gaXQuXG4gICAgaWYgKHVuaXF1ZUNvdW50ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBbc29ydGVkXTtcbiAgICB9XG5cbiAgICAvLyBuYW1lZCAnRCcgb3JpZ2luYWxseVxuICAgIHZhciBtYXRyaXggPSBtYWtlTWF0cml4KG5DbHVzdGVycywgc29ydGVkLmxlbmd0aCksXG4gICAgICAgIC8vIG5hbWVkICdCJyBvcmlnaW5hbGx5XG4gICAgICAgIGJhY2t0cmFja01hdHJpeCA9IG1ha2VNYXRyaXgobkNsdXN0ZXJzLCBzb3J0ZWQubGVuZ3RoKTtcblxuICAgIC8vIFRoaXMgaXMgYSBkeW5hbWljIHByb2dyYW1taW5nIHdheSB0byBzb2x2ZSB0aGUgcHJvYmxlbSBvZiBtaW5pbWl6aW5nXG4gICAgLy8gd2l0aGluLWNsdXN0ZXIgc3VtIG9mIHNxdWFyZXMuIEl0J3Mgc2ltaWxhciB0byBsaW5lYXIgcmVncmVzc2lvblxuICAgIC8vIGluIHRoaXMgd2F5LCBhbmQgdGhpcyBjYWxjdWxhdGlvbiBpbmNyZW1lbnRhbGx5IGNvbXB1dGVzIHRoZVxuICAgIC8vIHN1bSBvZiBzcXVhcmVzIHRoYXQgYXJlIGxhdGVyIHJlYWQuXG5cbiAgICAvLyBUaGUgb3V0ZXIgbG9vcCBpdGVyYXRlcyB0aHJvdWdoIGNsdXN0ZXJzLCBmcm9tIDAgdG8gbkNsdXN0ZXJzLlxuICAgIGZvciAodmFyIGNsdXN0ZXIgPSAwOyBjbHVzdGVyIDwgbkNsdXN0ZXJzOyBjbHVzdGVyKyspIHtcblxuICAgICAgICAvLyBBdCB0aGUgc3RhcnQgb2YgZWFjaCBsb29wLCB0aGUgbWVhbiBzdGFydHMgYXMgdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgdmFyIGZpcnN0Q2x1c3Rlck1lYW4gPSBzb3J0ZWRbMF07XG5cbiAgICAgICAgZm9yICh2YXIgc29ydGVkSWR4ID0gTWF0aC5tYXgoY2x1c3RlciwgMSk7XG4gICAgICAgICAgICAgc29ydGVkSWR4IDwgc29ydGVkLmxlbmd0aDtcbiAgICAgICAgICAgICBzb3J0ZWRJZHgrKykge1xuXG4gICAgICAgICAgICBpZiAoY2x1c3RlciA9PT0gMCkge1xuXG4gICAgICAgICAgICAgICAgLy8gSW5jcmVhc2UgdGhlIHJ1bm5pbmcgc3VtIG9mIHNxdWFyZXMgY2FsY3VsYXRpb24gYnkgdGhpc1xuICAgICAgICAgICAgICAgIC8vIG5ldyB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciBzcXVhcmVkRGlmZmVyZW5jZSA9IE1hdGgucG93KFxuICAgICAgICAgICAgICAgICAgICBzb3J0ZWRbc29ydGVkSWR4XSAtIGZpcnN0Q2x1c3Rlck1lYW4sIDIpO1xuICAgICAgICAgICAgICAgIG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeCAtIDFdICtcbiAgICAgICAgICAgICAgICAgICAgKHNvcnRlZElkeCAvIChzb3J0ZWRJZHggKyAxKSkgKiBzcXVhcmVkRGlmZmVyZW5jZTtcblxuICAgICAgICAgICAgICAgIC8vIFdlJ3JlIGNvbXB1dGluZyBhIHJ1bm5pbmcgbWVhbiBieSB0YWtpbmcgdGhlIHByZXZpb3VzXG4gICAgICAgICAgICAgICAgLy8gbWVhbiB2YWx1ZSwgbXVsdGlwbHlpbmcgaXQgYnkgdGhlIG51bWJlciBvZiBlbGVtZW50c1xuICAgICAgICAgICAgICAgIC8vIHNlZW4gc28gZmFyLCBhbmQgdGhlbiBkaXZpZGluZyBpdCBieSB0aGUgbnVtYmVyIG9mXG4gICAgICAgICAgICAgICAgLy8gZWxlbWVudHMgdG90YWwuXG4gICAgICAgICAgICAgICAgdmFyIG5ld1N1bSA9IHNvcnRlZElkeCAqIGZpcnN0Q2x1c3Rlck1lYW4gKyBzb3J0ZWRbc29ydGVkSWR4XTtcbiAgICAgICAgICAgICAgICBmaXJzdENsdXN0ZXJNZWFuID0gbmV3U3VtIC8gKHNvcnRlZElkeCArIDEpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdmFyIHN1bVNxdWFyZWREaXN0YW5jZXMgPSAwLFxuICAgICAgICAgICAgICAgICAgICBtZWFuWEogPSAwO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IHNvcnRlZElkeDsgaiA+PSBjbHVzdGVyOyBqLS0pIHtcblxuICAgICAgICAgICAgICAgICAgICBzdW1TcXVhcmVkRGlzdGFuY2VzICs9IChzb3J0ZWRJZHggLSBqKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAoc29ydGVkSWR4IC0gaiArIDEpICpcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucG93KHNvcnRlZFtqXSAtIG1lYW5YSiwgMik7XG5cbiAgICAgICAgICAgICAgICAgICAgbWVhblhKID0gKHNvcnRlZFtqXSArIChzb3J0ZWRJZHggLSBqKSAqIG1lYW5YSikgL1xuICAgICAgICAgICAgICAgICAgICAgICAgKHNvcnRlZElkeCAtIGogKyAxKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaiA9PT0gc29ydGVkSWR4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IHN1bVNxdWFyZWREaXN0YW5jZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrdHJhY2tNYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IGo7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaiA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSArPSBtYXRyaXhbY2x1c3RlciAtIDFdW2ogLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN1bVNxdWFyZWREaXN0YW5jZXMgPD0gbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4W2NsdXN0ZXJdW3NvcnRlZElkeF0gPSBzdW1TcXVhcmVkRGlzdGFuY2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrdHJhY2tNYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSA9IGo7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzdW1TcXVhcmVkRGlzdGFuY2VzICsgbWF0cml4W2NsdXN0ZXIgLSAxXVtqIC0gMV0gPCBtYXRyaXhbY2x1c3Rlcl1bc29ydGVkSWR4XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gc3VtU3F1YXJlZERpc3RhbmNlcyArIG1hdHJpeFtjbHVzdGVyIC0gMV1baiAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2t0cmFja01hdHJpeFtjbHVzdGVyXVtzb3J0ZWRJZHhdID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZSByZWFsIHdvcmsgb2YgQ2ttZWFucyBjbHVzdGVyaW5nIGhhcHBlbnMgaW4gdGhlIG1hdHJpeCBnZW5lcmF0aW9uOlxuICAgIC8vIHRoZSBnZW5lcmF0ZWQgbWF0cmljZXMgZW5jb2RlIGFsbCBwb3NzaWJsZSBjbHVzdGVyaW5nIGNvbWJpbmF0aW9ucywgYW5kXG4gICAgLy8gb25jZSB0aGV5J3JlIGdlbmVyYXRlZCB3ZSBjYW4gc29sdmUgZm9yIHRoZSBiZXN0IGNsdXN0ZXJpbmcgZ3JvdXBzXG4gICAgLy8gdmVyeSBxdWlja2x5LlxuICAgIHZhciBjbHVzdGVycyA9IFtdLFxuICAgICAgICBjbHVzdGVyUmlnaHQgPSBiYWNrdHJhY2tNYXRyaXhbMF0ubGVuZ3RoIC0gMTtcblxuICAgIC8vIEJhY2t0cmFjayB0aGUgY2x1c3RlcnMgZnJvbSB0aGUgZHluYW1pYyBwcm9ncmFtbWluZyBtYXRyaXguIFRoaXNcbiAgICAvLyBzdGFydHMgYXQgdGhlIGJvdHRvbS1yaWdodCBjb3JuZXIgb2YgdGhlIG1hdHJpeCAoaWYgdGhlIHRvcC1sZWZ0IGlzIDAsIDApLFxuICAgIC8vIGFuZCBtb3ZlcyB0aGUgY2x1c3RlciB0YXJnZXQgd2l0aCB0aGUgbG9vcC5cbiAgICBmb3IgKGNsdXN0ZXIgPSBiYWNrdHJhY2tNYXRyaXgubGVuZ3RoIC0gMTsgY2x1c3RlciA+PSAwOyBjbHVzdGVyLS0pIHtcblxuICAgICAgICB2YXIgY2x1c3RlckxlZnQgPSBiYWNrdHJhY2tNYXRyaXhbY2x1c3Rlcl1bY2x1c3RlclJpZ2h0XTtcblxuICAgICAgICAvLyBmaWxsIHRoZSBjbHVzdGVyIGZyb20gdGhlIHNvcnRlZCBpbnB1dCBieSB0YWtpbmcgYSBzbGljZSBvZiB0aGVcbiAgICAgICAgLy8gYXJyYXkuIHRoZSBiYWNrdHJhY2sgbWF0cml4IG1ha2VzIHRoaXMgZWFzeSAtIGl0IHN0b3JlcyB0aGVcbiAgICAgICAgLy8gaW5kZXhlcyB3aGVyZSB0aGUgY2x1c3RlciBzaG91bGQgc3RhcnQgYW5kIGVuZC5cbiAgICAgICAgY2x1c3RlcnNbY2x1c3Rlcl0gPSBzb3J0ZWQuc2xpY2UoY2x1c3RlckxlZnQsIGNsdXN0ZXJSaWdodCArIDEpO1xuXG4gICAgICAgIGlmIChjbHVzdGVyID4gMCkge1xuICAgICAgICAgICAgY2x1c3RlclJpZ2h0ID0gY2x1c3RlckxlZnQgLSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsdXN0ZXJzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNrbWVhbnM7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdGFuZGFyZE5vcm1hbFRhYmxlID0gcmVxdWlyZSgnLi9zdGFuZGFyZF9ub3JtYWxfdGFibGUnKTtcblxuLyoqXG4gKiAqKltDdW11bGF0aXZlIFN0YW5kYXJkIE5vcm1hbCBQcm9iYWJpbGl0eV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdGFuZGFyZF9ub3JtYWxfdGFibGUpKipcbiAqXG4gKiBTaW5jZSBwcm9iYWJpbGl0eSB0YWJsZXMgY2Fubm90IGJlXG4gKiBwcmludGVkIGZvciBldmVyeSBub3JtYWwgZGlzdHJpYnV0aW9uLCBhcyB0aGVyZSBhcmUgYW4gaW5maW5pdGUgdmFyaWV0eVxuICogb2Ygbm9ybWFsIGRpc3RyaWJ1dGlvbnMsIGl0IGlzIGNvbW1vbiBwcmFjdGljZSB0byBjb252ZXJ0IGEgbm9ybWFsIHRvIGFcbiAqIHN0YW5kYXJkIG5vcm1hbCBhbmQgdGhlbiB1c2UgdGhlIHN0YW5kYXJkIG5vcm1hbCB0YWJsZSB0byBmaW5kIHByb2JhYmlsaXRpZXMuXG4gKlxuICogWW91IGNhbiB1c2UgYC41ICsgLjUgKiBlcnJvckZ1bmN0aW9uKHggLyBNYXRoLnNxcnQoMikpYCB0byBjYWxjdWxhdGUgdGhlIHByb2JhYmlsaXR5XG4gKiBpbnN0ZWFkIG9mIGxvb2tpbmcgaXQgdXAgaW4gYSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gelxuICogQHJldHVybnMge251bWJlcn0gY3VtdWxhdGl2ZSBzdGFuZGFyZCBub3JtYWwgcHJvYmFiaWxpdHlcbiAqL1xuZnVuY3Rpb24gY3VtdWxhdGl2ZVN0ZE5vcm1hbFByb2JhYmlsaXR5KHopIHtcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhpcyB2YWx1ZS5cbiAgICB2YXIgYWJzWiA9IE1hdGguYWJzKHopLFxuICAgICAgICAvLyBFYWNoIHJvdyBiZWdpbnMgd2l0aCBhIGRpZmZlcmVudFxuICAgICAgICAvLyBzaWduaWZpY2FudCBkaWdpdDogMC41LCAwLjYsIDAuNywgYW5kIHNvIG9uLiBFYWNoIHZhbHVlIGluIHRoZSB0YWJsZVxuICAgICAgICAvLyBjb3JyZXNwb25kcyB0byBhIHJhbmdlIG9mIDAuMDEgaW4gdGhlIGlucHV0IHZhbHVlcywgc28gdGhlIHZhbHVlIGlzXG4gICAgICAgIC8vIG11bHRpcGxpZWQgYnkgMTAwLlxuICAgICAgICBpbmRleCA9IE1hdGgubWluKE1hdGgucm91bmQoYWJzWiAqIDEwMCksIHN0YW5kYXJkTm9ybWFsVGFibGUubGVuZ3RoIC0gMSk7XG5cbiAgICAvLyBUaGUgaW5kZXggd2UgY2FsY3VsYXRlIG11c3QgYmUgaW4gdGhlIHRhYmxlIGFzIGEgcG9zaXRpdmUgdmFsdWUsXG4gICAgLy8gYnV0IHdlIHN0aWxsIHBheSBhdHRlbnRpb24gdG8gd2hldGhlciB0aGUgaW5wdXQgaXMgcG9zaXRpdmVcbiAgICAvLyBvciBuZWdhdGl2ZSwgYW5kIGZsaXAgdGhlIG91dHB1dCB2YWx1ZSBhcyBhIGxhc3Qgc3RlcC5cbiAgICBpZiAoeiA+PSAwKSB7XG4gICAgICAgIHJldHVybiBzdGFuZGFyZE5vcm1hbFRhYmxlW2luZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkdWUgdG8gZmxvYXRpbmctcG9pbnQgYXJpdGhtZXRpYywgdmFsdWVzIGluIHRoZSB0YWJsZSB3aXRoXG4gICAgICAgIC8vIDQgc2lnbmlmaWNhbnQgZmlndXJlcyBjYW4gbmV2ZXJ0aGVsZXNzIGVuZCB1cCBhcyByZXBlYXRpbmdcbiAgICAgICAgLy8gZnJhY3Rpb25zIHdoZW4gdGhleSdyZSBjb21wdXRlZCBoZXJlLlxuICAgICAgICByZXR1cm4gKygxIC0gc3RhbmRhcmROb3JtYWxUYWJsZVtpbmRleF0pLnRvRml4ZWQoNCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGN1bXVsYXRpdmVTdGROb3JtYWxQcm9iYWJpbGl0eTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBXZSB1c2UgYM61YCwgZXBzaWxvbiwgYXMgYSBzdG9wcGluZyBjcml0ZXJpb24gd2hlbiB3ZSB3YW50IHRvIGl0ZXJhdGVcbiAqIHVudGlsIHdlJ3JlIFwiY2xvc2UgZW5vdWdoXCIuIEVwc2lsb24gaXMgYSB2ZXJ5IHNtYWxsIG51bWJlcjogZm9yXG4gKiBzaW1wbGUgc3RhdGlzdGljcywgdGhhdCBudW1iZXIgaXMgKiowLjAwMDEqKlxuICpcbiAqIFRoaXMgaXMgdXNlZCBpbiBjYWxjdWxhdGlvbnMgbGlrZSB0aGUgYmlub21pYWxEaXN0cmlidXRpb24sIGluIHdoaWNoXG4gKiB0aGUgcHJvY2VzcyBvZiBmaW5kaW5nIGEgdmFsdWUgaXMgW2l0ZXJhdGl2ZV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSXRlcmF0aXZlX21ldGhvZCk6XG4gKiBpdCBwcm9ncmVzc2VzIHVudGlsIGl0IGlzIGNsb3NlIGVub3VnaC5cbiAqXG4gKiBCZWxvdyBpcyBhbiBleGFtcGxlIG9mIHVzaW5nIGVwc2lsb24gaW4gW2dyYWRpZW50IGRlc2NlbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYWRpZW50X2Rlc2NlbnQpLFxuICogd2hlcmUgd2UncmUgdHJ5aW5nIHRvIGZpbmQgYSBsb2NhbCBtaW5pbXVtIG9mIGEgZnVuY3Rpb24ncyBkZXJpdmF0aXZlLFxuICogZ2l2ZW4gYnkgdGhlIGBmRGVyaXZhdGl2ZWAgbWV0aG9kLlxuICpcbiAqIEBleGFtcGxlXG4gKiAvLyBGcm9tIGNhbGN1bGF0aW9uLCB3ZSBleHBlY3QgdGhhdCB0aGUgbG9jYWwgbWluaW11bSBvY2N1cnMgYXQgeD05LzRcbiAqIHZhciB4X29sZCA9IDA7XG4gKiAvLyBUaGUgYWxnb3JpdGhtIHN0YXJ0cyBhdCB4PTZcbiAqIHZhciB4X25ldyA9IDY7XG4gKiB2YXIgc3RlcFNpemUgPSAwLjAxO1xuICpcbiAqIGZ1bmN0aW9uIGZEZXJpdmF0aXZlKHgpIHtcbiAqICAgcmV0dXJuIDQgKiBNYXRoLnBvdyh4LCAzKSAtIDkgKiBNYXRoLnBvdyh4LCAyKTtcbiAqIH1cbiAqXG4gKiAvLyBUaGUgbG9vcCBydW5zIHVudGlsIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHByZXZpb3VzXG4gKiAvLyB2YWx1ZSBhbmQgdGhlIGN1cnJlbnQgdmFsdWUgaXMgc21hbGxlciB0aGFuIGVwc2lsb24gLSBhIHJvdWdoXG4gKiAvLyBtZWF1cmUgb2YgJ2Nsb3NlIGVub3VnaCdcbiAqIHdoaWxlIChNYXRoLmFicyh4X25ldyAtIHhfb2xkKSA+IHNzLmVwc2lsb24pIHtcbiAqICAgeF9vbGQgPSB4X25ldztcbiAqICAgeF9uZXcgPSB4X29sZCAtIHN0ZXBTaXplICogZkRlcml2YXRpdmUoeF9vbGQpO1xuICogfVxuICpcbiAqIGNvbnNvbGUubG9nKCdMb2NhbCBtaW5pbXVtIG9jY3VycyBhdCcsIHhfbmV3KTtcbiAqL1xudmFyIGVwc2lsb24gPSAwLjAwMDE7XG5cbm1vZHVsZS5leHBvcnRzID0gZXBzaWxvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiAqKltHYXVzc2lhbiBlcnJvciBmdW5jdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FcnJvcl9mdW5jdGlvbikqKlxuICpcbiAqIFRoZSBgZXJyb3JGdW5jdGlvbih4LyhzZCAqIE1hdGguc3FydCgyKSkpYCBpcyB0aGUgcHJvYmFiaWxpdHkgdGhhdCBhIHZhbHVlIGluIGFcbiAqIG5vcm1hbCBkaXN0cmlidXRpb24gd2l0aCBzdGFuZGFyZCBkZXZpYXRpb24gc2QgaXMgd2l0aGluIHggb2YgdGhlIG1lYW4uXG4gKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgbnVtZXJpY2FsIGFwcHJveGltYXRpb24gdG8gdGhlIGV4YWN0IHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IGlucHV0XG4gKiBAcmV0dXJuIHtudW1iZXJ9IGVycm9yIGVzdGltYXRpb25cbiAqIEBleGFtcGxlXG4gKiBlcnJvckZ1bmN0aW9uKDEpOyAvLz0gMC44NDI3XG4gKi9cbmZ1bmN0aW9uIGVycm9yRnVuY3Rpb24oeCkge1xuICAgIHZhciB0ID0gMSAvICgxICsgMC41ICogTWF0aC5hYnMoeCkpO1xuICAgIHZhciB0YXUgPSB0ICogTWF0aC5leHAoLU1hdGgucG93KHgsIDIpIC1cbiAgICAgICAgMS4yNjU1MTIyMyArXG4gICAgICAgIDEuMDAwMDIzNjggKiB0ICtcbiAgICAgICAgMC4zNzQwOTE5NiAqIE1hdGgucG93KHQsIDIpICtcbiAgICAgICAgMC4wOTY3ODQxOCAqIE1hdGgucG93KHQsIDMpIC1cbiAgICAgICAgMC4xODYyODgwNiAqIE1hdGgucG93KHQsIDQpICtcbiAgICAgICAgMC4yNzg4NjgwNyAqIE1hdGgucG93KHQsIDUpIC1cbiAgICAgICAgMS4xMzUyMDM5OCAqIE1hdGgucG93KHQsIDYpICtcbiAgICAgICAgMS40ODg1MTU4NyAqIE1hdGgucG93KHQsIDcpIC1cbiAgICAgICAgMC44MjIxNTIyMyAqIE1hdGgucG93KHQsIDgpICtcbiAgICAgICAgMC4xNzA4NzI3NyAqIE1hdGgucG93KHQsIDkpKTtcbiAgICBpZiAoeCA+PSAwKSB7XG4gICAgICAgIHJldHVybiAxIC0gdGF1O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0YXUgLSAxO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcnJvckZ1bmN0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgW0ZhY3RvcmlhbF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmFjdG9yaWFsKSwgdXN1YWxseSB3cml0dGVuIG4hLCBpcyB0aGUgcHJvZHVjdCBvZiBhbGwgcG9zaXRpdmVcbiAqIGludGVnZXJzIGxlc3MgdGhhbiBvciBlcXVhbCB0byBuLiBPZnRlbiBmYWN0b3JpYWwgaXMgaW1wbGVtZW50ZWRcbiAqIHJlY3Vyc2l2ZWx5LCBidXQgdGhpcyBpdGVyYXRpdmUgYXBwcm9hY2ggaXMgc2lnbmlmaWNhbnRseSBmYXN0ZXJcbiAqIGFuZCBzaW1wbGVyLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBmYWN0b3JpYWw6IG4hXG4gKiBAZXhhbXBsZVxuICogY29uc29sZS5sb2coZmFjdG9yaWFsKDUpKTsgLy8gMTIwXG4gKi9cbmZ1bmN0aW9uIGZhY3RvcmlhbChuKSB7XG5cbiAgICAvLyBmYWN0b3JpYWwgaXMgbWF0aGVtYXRpY2FsbHkgdW5kZWZpbmVkIGZvciBuZWdhdGl2ZSBudW1iZXJzXG4gICAgaWYgKG4gPCAwICkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gdHlwaWNhbGx5IHlvdSdsbCBleHBhbmQgdGhlIGZhY3RvcmlhbCBmdW5jdGlvbiBnb2luZyBkb3duLCBsaWtlXG4gICAgLy8gNSEgPSA1ICogNCAqIDMgKiAyICogMS4gVGhpcyBpcyBnb2luZyBpbiB0aGUgb3Bwb3NpdGUgZGlyZWN0aW9uLFxuICAgIC8vIGNvdW50aW5nIGZyb20gMiB1cCB0byB0aGUgbnVtYmVyIGluIHF1ZXN0aW9uLCBhbmQgc2luY2UgYW55dGhpbmdcbiAgICAvLyBtdWx0aXBsaWVkIGJ5IDEgaXMgaXRzZWxmLCB0aGUgbG9vcCBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IDIuXG4gICAgdmFyIGFjY3VtdWxhdG9yID0gMTtcbiAgICBmb3IgKHZhciBpID0gMjsgaSA8PSBuOyBpKyspIHtcbiAgICAgICAgLy8gZm9yIGVhY2ggbnVtYmVyIHVwIHRvIGFuZCBpbmNsdWRpbmcgdGhlIG51bWJlciBgbmAsIG11bHRpcGx5XG4gICAgICAgIC8vIHRoZSBhY2N1bXVsYXRvciBteSB0aGF0IG51bWJlci5cbiAgICAgICAgYWNjdW11bGF0b3IgKj0gaTtcbiAgICB9XG4gICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3RvcmlhbDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgW0dlb21ldHJpYyBNZWFuXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9HZW9tZXRyaWNfbWVhbikgaXNcbiAqIGEgbWVhbiBmdW5jdGlvbiB0aGF0IGlzIG1vcmUgdXNlZnVsIGZvciBudW1iZXJzIGluIGRpZmZlcmVudFxuICogcmFuZ2VzLlxuICpcbiAqIFRoaXMgaXMgdGhlIG50aCByb290IG9mIHRoZSBpbnB1dCBudW1iZXJzIG11bHRpcGxpZWQgYnkgZWFjaCBvdGhlci5cbiAqXG4gKiBUaGUgZ2VvbWV0cmljIG1lYW4gaXMgb2Z0ZW4gdXNlZnVsIGZvclxuICogKipbcHJvcG9ydGlvbmFsIGdyb3d0aF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR2VvbWV0cmljX21lYW4jUHJvcG9ydGlvbmFsX2dyb3d0aCkqKjogZ2l2ZW5cbiAqIGdyb3d0aCByYXRlcyBmb3IgbXVsdGlwbGUgeWVhcnMsIGxpa2UgXzgwJSwgMTYuNjYlIGFuZCA0Mi44NSVfLCBhIHNpbXBsZVxuICogbWVhbiB3aWxsIGluY29ycmVjdGx5IGVzdGltYXRlIGFuIGF2ZXJhZ2UgZ3Jvd3RoIHJhdGUsIHdoZXJlYXMgYSBnZW9tZXRyaWNcbiAqIG1lYW4gd2lsbCBjb3JyZWN0bHkgZXN0aW1hdGUgYSBncm93dGggcmF0ZSB0aGF0LCBvdmVyIHRob3NlIHllYXJzLFxuICogd2lsbCB5aWVsZCB0aGUgc2FtZSBlbmQgdmFsdWUuXG4gKlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXlcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXQgYXJyYXlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGdlb21ldHJpYyBtZWFuXG4gKiBAZXhhbXBsZVxuICogdmFyIGdyb3d0aFJhdGVzID0gWzEuODAsIDEuMTY2NjY2LCAxLjQyODU3MV07XG4gKiB2YXIgYXZlcmFnZUdyb3d0aCA9IGdlb21ldHJpY01lYW4oZ3Jvd3RoUmF0ZXMpO1xuICogdmFyIGF2ZXJhZ2VHcm93dGhSYXRlcyA9IFthdmVyYWdlR3Jvd3RoLCBhdmVyYWdlR3Jvd3RoLCBhdmVyYWdlR3Jvd3RoXTtcbiAqIHZhciBzdGFydGluZ1ZhbHVlID0gMTA7XG4gKiB2YXIgc3RhcnRpbmdWYWx1ZU1lYW4gPSAxMDtcbiAqIGdyb3d0aFJhdGVzLmZvckVhY2goZnVuY3Rpb24ocmF0ZSkge1xuICogICBzdGFydGluZ1ZhbHVlICo9IHJhdGU7XG4gKiB9KTtcbiAqIGF2ZXJhZ2VHcm93dGhSYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKHJhdGUpIHtcbiAqICAgc3RhcnRpbmdWYWx1ZU1lYW4gKj0gcmF0ZTtcbiAqIH0pO1xuICogc3RhcnRpbmdWYWx1ZU1lYW4gPT09IHN0YXJ0aW5nVmFsdWU7XG4gKi9cbmZ1bmN0aW9uIGdlb21ldHJpY01lYW4oeCkge1xuICAgIC8vIFRoZSBtZWFuIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gdGhlIHN0YXJ0aW5nIHZhbHVlLlxuICAgIHZhciB2YWx1ZSA9IDE7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gdGhlIGdlb21ldHJpYyBtZWFuIGlzIG9ubHkgdmFsaWQgZm9yIHBvc2l0aXZlIG51bWJlcnNcbiAgICAgICAgaWYgKHhbaV0gPD0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgICAgIC8vIHJlcGVhdGVkbHkgbXVsdGlwbHkgdGhlIHZhbHVlIGJ5IGVhY2ggbnVtYmVyXG4gICAgICAgIHZhbHVlICo9IHhbaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgucG93KHZhbHVlLCAxIC8geC5sZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlb21ldHJpY01lYW47XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFtIYXJtb25pYyBNZWFuXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXJtb25pY19tZWFuKSBpc1xuICogYSBtZWFuIGZ1bmN0aW9uIHR5cGljYWxseSB1c2VkIHRvIGZpbmQgdGhlIGF2ZXJhZ2Ugb2YgcmF0ZXMuXG4gKiBUaGlzIG1lYW4gaXMgY2FsY3VsYXRlZCBieSB0YWtpbmcgdGhlIHJlY2lwcm9jYWwgb2YgdGhlIGFyaXRobWV0aWMgbWVhblxuICogb2YgdGhlIHJlY2lwcm9jYWxzIG9mIHRoZSBpbnB1dCBudW1iZXJzLlxuICpcbiAqIFRoaXMgaXMgYSBbbWVhc3VyZSBvZiBjZW50cmFsIHRlbmRlbmN5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DZW50cmFsX3RlbmRlbmN5KTpcbiAqIGEgbWV0aG9kIG9mIGZpbmRpbmcgYSB0eXBpY2FsIG9yIGNlbnRyYWwgdmFsdWUgb2YgYSBzZXQgb2YgbnVtYmVycy5cbiAqXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IGhhcm1vbmljIG1lYW5cbiAqIEBleGFtcGxlXG4gKiBzcy5oYXJtb25pY01lYW4oWzIsIDNdKSAvLz0gMi40XG4gKi9cbmZ1bmN0aW9uIGhhcm1vbmljTWVhbih4KSB7XG4gICAgLy8gVGhlIG1lYW4gb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICB2YXIgcmVjaXByb2NhbFN1bSA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gdGhlIGhhcm1vbmljIG1lYW4gaXMgb25seSB2YWxpZCBmb3IgcG9zaXRpdmUgbnVtYmVyc1xuICAgICAgICBpZiAoeFtpXSA8PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAgICAgcmVjaXByb2NhbFN1bSArPSAxIC8geFtpXTtcbiAgICB9XG5cbiAgICAvLyBkaXZpZGUgbiBieSB0aGUgdGhlIHJlY2lwcm9jYWwgc3VtXG4gICAgcmV0dXJuIHgubGVuZ3RoIC8gcmVjaXByb2NhbFN1bTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXJtb25pY01lYW47XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBxdWFudGlsZSA9IHJlcXVpcmUoJy4vcXVhbnRpbGUnKTtcblxuLyoqXG4gKiBUaGUgW0ludGVycXVhcnRpbGUgcmFuZ2VdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSW50ZXJxdWFydGlsZV9yYW5nZSkgaXNcbiAqIGEgbWVhc3VyZSBvZiBzdGF0aXN0aWNhbCBkaXNwZXJzaW9uLCBvciBob3cgc2NhdHRlcmVkLCBzcHJlYWQsIG9yXG4gKiBjb25jZW50cmF0ZWQgYSBkaXN0cmlidXRpb24gaXMuIEl0J3MgY29tcHV0ZWQgYXMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlblxuICogdGhlIHRoaXJkIHF1YXJ0aWxlIGFuZCBmaXJzdCBxdWFydGlsZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHNhbXBsZVxuICogQHJldHVybnMge251bWJlcn0gaW50ZXJxdWFydGlsZSByYW5nZTogdGhlIHNwYW4gYmV0d2VlbiBsb3dlciBhbmQgdXBwZXIgcXVhcnRpbGUsXG4gKiAwLjI1IGFuZCAwLjc1XG4gKiBAZXhhbXBsZVxuICogaW50ZXJxdWFydGlsZVJhbmdlKFswLCAxLCAyLCAzXSk7IC8vPSAyXG4gKi9cbmZ1bmN0aW9uIGludGVycXVhcnRpbGVSYW5nZShzYW1wbGUpIHtcbiAgICAvLyBXZSBjYW4ndCBkZXJpdmUgcXVhbnRpbGVzIGZyb20gYW4gZW1wdHkgbGlzdFxuICAgIGlmIChzYW1wbGUubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBJbnRlcnF1YXJ0aWxlIHJhbmdlIGlzIHRoZSBzcGFuIGJldHdlZW4gdGhlIHVwcGVyIHF1YXJ0aWxlLFxuICAgIC8vIGF0IGAwLjc1YCwgYW5kIGxvd2VyIHF1YXJ0aWxlLCBgMC4yNWBcbiAgICByZXR1cm4gcXVhbnRpbGUoc2FtcGxlLCAwLjc1KSAtIHF1YW50aWxlKHNhbXBsZSwgMC4yNSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW50ZXJxdWFydGlsZVJhbmdlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBJbnZlcnNlIFtHYXVzc2lhbiBlcnJvciBmdW5jdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FcnJvcl9mdW5jdGlvbilcbiAqIHJldHVybnMgYSBudW1lcmljYWwgYXBwcm94aW1hdGlvbiB0byB0aGUgdmFsdWUgdGhhdCB3b3VsZCBoYXZlIGNhdXNlZFxuICogYGVycm9yRnVuY3Rpb24oKWAgdG8gcmV0dXJuIHguXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHggdmFsdWUgb2YgZXJyb3IgZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtudW1iZXJ9IGVzdGltYXRlZCBpbnZlcnRlZCB2YWx1ZVxuICovXG5mdW5jdGlvbiBpbnZlcnNlRXJyb3JGdW5jdGlvbih4KSB7XG4gICAgdmFyIGEgPSAoOCAqIChNYXRoLlBJIC0gMykpIC8gKDMgKiBNYXRoLlBJICogKDQgLSBNYXRoLlBJKSk7XG5cbiAgICB2YXIgaW52ID0gTWF0aC5zcXJ0KE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3coMiAvIChNYXRoLlBJICogYSkgKyBNYXRoLmxvZygxIC0geCAqIHgpIC8gMiwgMikgLVxuICAgICAgICBNYXRoLmxvZygxIC0geCAqIHgpIC8gYSkgLVxuICAgICAgICAoMiAvIChNYXRoLlBJICogYSkgKyBNYXRoLmxvZygxIC0geCAqIHgpIC8gMikpO1xuXG4gICAgaWYgKHggPj0gMCkge1xuICAgICAgICByZXR1cm4gaW52O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAtaW52O1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnZlcnNlRXJyb3JGdW5jdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBbU2ltcGxlIGxpbmVhciByZWdyZXNzaW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NpbXBsZV9saW5lYXJfcmVncmVzc2lvbilcbiAqIGlzIGEgc2ltcGxlIHdheSB0byBmaW5kIGEgZml0dGVkIGxpbmVcbiAqIGJldHdlZW4gYSBzZXQgb2YgY29vcmRpbmF0ZXMuIFRoaXMgYWxnb3JpdGhtIGZpbmRzIHRoZSBzbG9wZSBhbmQgeS1pbnRlcmNlcHQgb2YgYSByZWdyZXNzaW9uIGxpbmVcbiAqIHVzaW5nIHRoZSBsZWFzdCBzdW0gb2Ygc3F1YXJlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PEFycmF5PG51bWJlcj4+fSBkYXRhIGFuIGFycmF5IG9mIHR3by1lbGVtZW50IG9mIGFycmF5cyxcbiAqIGxpa2UgYFtbMCwgMV0sIFsyLCAzXV1gXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBvYmplY3QgY29udGFpbmluZyBzbG9wZSBhbmQgaW50ZXJzZWN0IG9mIHJlZ3Jlc3Npb24gbGluZVxuICogQGV4YW1wbGVcbiAqIGxpbmVhclJlZ3Jlc3Npb24oW1swLCAwXSwgWzEsIDFdXSk7IC8vIHsgbTogMSwgYjogMCB9XG4gKi9cbmZ1bmN0aW9uIGxpbmVhclJlZ3Jlc3Npb24oZGF0YSkge1xuXG4gICAgdmFyIG0sIGI7XG5cbiAgICAvLyBTdG9yZSBkYXRhIGxlbmd0aCBpbiBhIGxvY2FsIHZhcmlhYmxlIHRvIHJlZHVjZVxuICAgIC8vIHJlcGVhdGVkIG9iamVjdCBwcm9wZXJ0eSBsb29rdXBzXG4gICAgdmFyIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aDtcblxuICAgIC8vaWYgdGhlcmUncyBvbmx5IG9uZSBwb2ludCwgYXJiaXRyYXJpbHkgY2hvb3NlIGEgc2xvcGUgb2YgMFxuICAgIC8vYW5kIGEgeS1pbnRlcmNlcHQgb2Ygd2hhdGV2ZXIgdGhlIHkgb2YgdGhlIGluaXRpYWwgcG9pbnQgaXNcbiAgICBpZiAoZGF0YUxlbmd0aCA9PT0gMSkge1xuICAgICAgICBtID0gMDtcbiAgICAgICAgYiA9IGRhdGFbMF1bMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBvdXIgc3VtcyBhbmQgc2NvcGUgdGhlIGBtYCBhbmQgYGJgXG4gICAgICAgIC8vIHZhcmlhYmxlcyB0aGF0IGRlZmluZSB0aGUgbGluZS5cbiAgICAgICAgdmFyIHN1bVggPSAwLCBzdW1ZID0gMCxcbiAgICAgICAgICAgIHN1bVhYID0gMCwgc3VtWFkgPSAwO1xuXG4gICAgICAgIC8vIFVzZSBsb2NhbCB2YXJpYWJsZXMgdG8gZ3JhYiBwb2ludCB2YWx1ZXNcbiAgICAgICAgLy8gd2l0aCBtaW5pbWFsIG9iamVjdCBwcm9wZXJ0eSBsb29rdXBzXG4gICAgICAgIHZhciBwb2ludCwgeCwgeTtcblxuICAgICAgICAvLyBHYXRoZXIgdGhlIHN1bSBvZiBhbGwgeCB2YWx1ZXMsIHRoZSBzdW0gb2YgYWxsXG4gICAgICAgIC8vIHkgdmFsdWVzLCBhbmQgdGhlIHN1bSBvZiB4XjIgYW5kICh4KnkpIGZvciBlYWNoXG4gICAgICAgIC8vIHZhbHVlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBJbiBtYXRoIG5vdGF0aW9uLCB0aGVzZSB3b3VsZCBiZSBTU194LCBTU195LCBTU194eCwgYW5kIFNTX3h5XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwb2ludCA9IGRhdGFbaV07XG4gICAgICAgICAgICB4ID0gcG9pbnRbMF07XG4gICAgICAgICAgICB5ID0gcG9pbnRbMV07XG5cbiAgICAgICAgICAgIHN1bVggKz0geDtcbiAgICAgICAgICAgIHN1bVkgKz0geTtcblxuICAgICAgICAgICAgc3VtWFggKz0geCAqIHg7XG4gICAgICAgICAgICBzdW1YWSArPSB4ICogeTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGBtYCBpcyB0aGUgc2xvcGUgb2YgdGhlIHJlZ3Jlc3Npb24gbGluZVxuICAgICAgICBtID0gKChkYXRhTGVuZ3RoICogc3VtWFkpIC0gKHN1bVggKiBzdW1ZKSkgL1xuICAgICAgICAgICAgKChkYXRhTGVuZ3RoICogc3VtWFgpIC0gKHN1bVggKiBzdW1YKSk7XG5cbiAgICAgICAgLy8gYGJgIGlzIHRoZSB5LWludGVyY2VwdCBvZiB0aGUgbGluZS5cbiAgICAgICAgYiA9IChzdW1ZIC8gZGF0YUxlbmd0aCkgLSAoKG0gKiBzdW1YKSAvIGRhdGFMZW5ndGgpO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBib3RoIHZhbHVlcyBhcyBhbiBvYmplY3QuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbTogbSxcbiAgICAgICAgYjogYlxuICAgIH07XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBsaW5lYXJSZWdyZXNzaW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEdpdmVuIHRoZSBvdXRwdXQgb2YgYGxpbmVhclJlZ3Jlc3Npb25gOiBhbiBvYmplY3RcbiAqIHdpdGggYG1gIGFuZCBgYmAgdmFsdWVzIGluZGljYXRpbmcgc2xvcGUgYW5kIGludGVyY2VwdCxcbiAqIHJlc3BlY3RpdmVseSwgZ2VuZXJhdGUgYSBsaW5lIGZ1bmN0aW9uIHRoYXQgdHJhbnNsYXRlc1xuICogeCB2YWx1ZXMgaW50byB5IHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbWIgb2JqZWN0IHdpdGggYG1gIGFuZCBgYmAgbWVtYmVycywgcmVwcmVzZW50aW5nXG4gKiBzbG9wZSBhbmQgaW50ZXJzZWN0IG9mIGRlc2lyZWQgbGluZVxuICogQHJldHVybnMge0Z1bmN0aW9ufSBtZXRob2QgdGhhdCBjb21wdXRlcyB5LXZhbHVlIGF0IGFueSBnaXZlblxuICogeC12YWx1ZSBvbiB0aGUgbGluZS5cbiAqIEBleGFtcGxlXG4gKiB2YXIgbCA9IGxpbmVhclJlZ3Jlc3Npb25MaW5lKGxpbmVhclJlZ3Jlc3Npb24oW1swLCAwXSwgWzEsIDFdXSkpO1xuICogbCgwKSAvLz0gMFxuICogbCgyKSAvLz0gMlxuICovXG5mdW5jdGlvbiBsaW5lYXJSZWdyZXNzaW9uTGluZShtYikge1xuICAgIC8vIFJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY29tcHV0ZXMgYSBgeWAgdmFsdWUgZm9yIGVhY2hcbiAgICAvLyB4IHZhbHVlIGl0IGlzIGdpdmVuLCBiYXNlZCBvbiB0aGUgdmFsdWVzIG9mIGBiYCBhbmQgYGFgXG4gICAgLy8gdGhhdCB3ZSBqdXN0IGNvbXB1dGVkLlxuICAgIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBtYi5iICsgKG1iLm0gKiB4KTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVhclJlZ3Jlc3Npb25MaW5lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVkaWFuID0gcmVxdWlyZSgnLi9tZWRpYW4nKTtcblxuLyoqXG4gKiBUaGUgW01lZGlhbiBBYnNvbHV0ZSBEZXZpYXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWVkaWFuX2Fic29sdXRlX2RldmlhdGlvbikgaXNcbiAqIGEgcm9idXN0IG1lYXN1cmUgb2Ygc3RhdGlzdGljYWxcbiAqIGRpc3BlcnNpb24uIEl0IGlzIG1vcmUgcmVzaWxpZW50IHRvIG91dGxpZXJzIHRoYW4gdGhlIHN0YW5kYXJkIGRldmlhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXQgYXJyYXlcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG1lZGlhbiBhYnNvbHV0ZSBkZXZpYXRpb25cbiAqIEBleGFtcGxlXG4gKiBtYWQoWzEsIDEsIDIsIDIsIDQsIDYsIDldKTsgLy89IDFcbiAqL1xuZnVuY3Rpb24gbWFkKHgpIHtcbiAgICAvLyBUaGUgbWFkIG9mIG5vdGhpbmcgaXMgbnVsbFxuICAgIGlmICgheCB8fCB4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgdmFyIG1lZGlhblZhbHVlID0gbWVkaWFuKHgpLFxuICAgICAgICBtZWRpYW5BYnNvbHV0ZURldmlhdGlvbnMgPSBbXTtcblxuICAgIC8vIE1ha2UgYSBsaXN0IG9mIGFic29sdXRlIGRldmlhdGlvbnMgZnJvbSB0aGUgbWVkaWFuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG1lZGlhbkFic29sdXRlRGV2aWF0aW9ucy5wdXNoKE1hdGguYWJzKHhbaV0gLSBtZWRpYW5WYWx1ZSkpO1xuICAgIH1cblxuICAgIC8vIEZpbmQgdGhlIG1lZGlhbiB2YWx1ZSBvZiB0aGF0IGxpc3RcbiAgICByZXR1cm4gbWVkaWFuKG1lZGlhbkFic29sdXRlRGV2aWF0aW9ucyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoaXMgY29tcHV0ZXMgdGhlIG1heGltdW0gbnVtYmVyIGluIGFuIGFycmF5LlxuICpcbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtYXhpbXVtIHZhbHVlXG4gKiBAZXhhbXBsZVxuICogY29uc29sZS5sb2cobWF4KFsxLCAyLCAzLCA0XSkpOyAvLyA0XG4gKi9cbmZ1bmN0aW9uIG1heCh4KSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBPbiB0aGUgZmlyc3QgaXRlcmF0aW9uIG9mIHRoaXMgbG9vcCwgbWF4IGlzXG4gICAgICAgIC8vIHVuZGVmaW5lZCBhbmQgaXMgdGh1cyBtYWRlIHRoZSBtYXhpbXVtIGVsZW1lbnQgaW4gdGhlIGFycmF5XG4gICAgICAgIGlmICh4W2ldID4gdmFsdWUgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSB4W2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXg7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdW0gPSByZXF1aXJlKCcuL3N1bScpO1xuXG4vKipcbiAqIFRoZSBtZWFuLCBfYWxzbyBrbm93biBhcyBhdmVyYWdlXyxcbiAqIGlzIHRoZSBzdW0gb2YgYWxsIHZhbHVlcyBvdmVyIHRoZSBudW1iZXIgb2YgdmFsdWVzLlxuICogVGhpcyBpcyBhIFttZWFzdXJlIG9mIGNlbnRyYWwgdGVuZGVuY3ldKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NlbnRyYWxfdGVuZGVuY3kpOlxuICogYSBtZXRob2Qgb2YgZmluZGluZyBhIHR5cGljYWwgb3IgY2VudHJhbCB2YWx1ZSBvZiBhIHNldCBvZiBudW1iZXJzLlxuICpcbiAqIFRoaXMgcnVucyBvbiBgTyhuKWAsIGxpbmVhciB0aW1lIGluIHJlc3BlY3QgdG8gdGhlIGFycmF5XG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0IHZhbHVlc1xuICogQHJldHVybnMge251bWJlcn0gbWVhblxuICogQGV4YW1wbGVcbiAqIGNvbnNvbGUubG9nKG1lYW4oWzAsIDEwXSkpOyAvLyA1XG4gKi9cbmZ1bmN0aW9uIG1lYW4oeCkge1xuICAgIC8vIFRoZSBtZWFuIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgcmV0dXJuIHN1bSh4KSAvIHgubGVuZ3RoO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1lYW47XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBudW1lcmljU29ydCA9IHJlcXVpcmUoJy4vbnVtZXJpY19zb3J0Jyk7XG5cbi8qKlxuICogVGhlIFttZWRpYW5dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWVkaWFuKSBpc1xuICogdGhlIG1pZGRsZSBudW1iZXIgb2YgYSBsaXN0LiBUaGlzIGlzIG9mdGVuIGEgZ29vZCBpbmRpY2F0b3Igb2YgJ3RoZSBtaWRkbGUnXG4gKiB3aGVuIHRoZXJlIGFyZSBvdXRsaWVycyB0aGF0IHNrZXcgdGhlIGBtZWFuKClgIHZhbHVlLlxuICogVGhpcyBpcyBhIFttZWFzdXJlIG9mIGNlbnRyYWwgdGVuZGVuY3ldKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NlbnRyYWxfdGVuZGVuY3kpOlxuICogYSBtZXRob2Qgb2YgZmluZGluZyBhIHR5cGljYWwgb3IgY2VudHJhbCB2YWx1ZSBvZiBhIHNldCBvZiBudW1iZXJzLlxuICpcbiAqIFRoZSBtZWRpYW4gaXNuJ3QgbmVjZXNzYXJpbHkgb25lIG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgbGlzdDogdGhlIHZhbHVlXG4gKiBjYW4gYmUgdGhlIGF2ZXJhZ2Ugb2YgdHdvIGVsZW1lbnRzIGlmIHRoZSBsaXN0IGhhcyBhbiBldmVuIGxlbmd0aFxuICogYW5kIHRoZSB0d28gY2VudHJhbCB2YWx1ZXMgYXJlIGRpZmZlcmVudC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IG1lZGlhbiB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIHZhciBpbmNvbWVzID0gWzEwLCAyLCA1LCAxMDAsIDIsIDFdO1xuICogbWVkaWFuKGluY29tZXMpOyAvLz0gMy41XG4gKi9cbmZ1bmN0aW9uIG1lZGlhbih4KSB7XG4gICAgLy8gVGhlIG1lZGlhbiBvZiBhbiBlbXB0eSBsaXN0IGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIC8vIFNvcnRpbmcgdGhlIGFycmF5IG1ha2VzIGl0IGVhc3kgdG8gZmluZCB0aGUgY2VudGVyLCBidXRcbiAgICAvLyB1c2UgYC5zbGljZSgpYCB0byBlbnN1cmUgdGhlIG9yaWdpbmFsIGFycmF5IGB4YCBpcyBub3QgbW9kaWZpZWRcbiAgICB2YXIgc29ydGVkID0gbnVtZXJpY1NvcnQoeCk7XG5cbiAgICAvLyBJZiB0aGUgbGVuZ3RoIG9mIHRoZSBsaXN0IGlzIG9kZCwgaXQncyB0aGUgY2VudHJhbCBudW1iZXJcbiAgICBpZiAoc29ydGVkLmxlbmd0aCAlIDIgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHNvcnRlZFsoc29ydGVkLmxlbmd0aCAtIDEpIC8gMl07XG4gICAgLy8gT3RoZXJ3aXNlLCB0aGUgbWVkaWFuIGlzIHRoZSBhdmVyYWdlIG9mIHRoZSB0d28gbnVtYmVyc1xuICAgIC8vIGF0IHRoZSBjZW50ZXIgb2YgdGhlIGxpc3RcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYSA9IHNvcnRlZFtzb3J0ZWQubGVuZ3RoIC8gMiAtIDFdO1xuICAgICAgICB2YXIgYiA9IHNvcnRlZFtzb3J0ZWQubGVuZ3RoIC8gMl07XG4gICAgICAgIHJldHVybiAoYSArIGIpIC8gMjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWVkaWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBtaW4gaXMgdGhlIGxvd2VzdCBudW1iZXIgaW4gdGhlIGFycmF5LiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gbWluaW11bSB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIG1pbihbMSwgNSwgLTEwLCAxMDAsIDJdKTsgLy8gLTEwMFxuICovXG5mdW5jdGlvbiBtaW4oeCkge1xuICAgIHZhciB2YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gT24gdGhlIGZpcnN0IGl0ZXJhdGlvbiBvZiB0aGlzIGxvb3AsIG1pbiBpc1xuICAgICAgICAvLyB1bmRlZmluZWQgYW5kIGlzIHRodXMgbWFkZSB0aGUgbWluaW11bSBlbGVtZW50IGluIHRoZSBhcnJheVxuICAgICAgICBpZiAoeFtpXSA8IHZhbHVlIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbHVlID0geFtpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqICoqTWl4aW4qKiBzaW1wbGVfc3RhdGlzdGljcyB0byBhIHNpbmdsZSBBcnJheSBpbnN0YW5jZSBpZiBwcm92aWRlZFxuICogb3IgdGhlIEFycmF5IG5hdGl2ZSBvYmplY3QgaWYgbm90LiBUaGlzIGlzIGFuIG9wdGlvbmFsXG4gKiBmZWF0dXJlIHRoYXQgbGV0cyB5b3UgdHJlYXQgc2ltcGxlX3N0YXRpc3RpY3MgYXMgYSBuYXRpdmUgZmVhdHVyZVxuICogb2YgSmF2YXNjcmlwdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gc3Mgc2ltcGxlIHN0YXRpc3RpY3NcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1dIGEgc2luZ2xlIGFycmF5IGluc3RhbmNlIHdoaWNoIHdpbGwgYmUgYXVnbWVudGVkXG4gKiB3aXRoIHRoZSBleHRyYSBtZXRob2RzLiBJZiBvbWl0dGVkLCBtaXhpbiB3aWxsIGFwcGx5IHRvIGFsbCBhcnJheXNcbiAqIGJ5IGNoYW5naW5nIHRoZSBnbG9iYWwgYEFycmF5LnByb3RvdHlwZWAuXG4gKiBAcmV0dXJucyB7Kn0gdGhlIGV4dGVuZGVkIEFycmF5LCBvciBBcnJheS5wcm90b3R5cGUgaWYgbm8gb2JqZWN0XG4gKiBpcyBnaXZlbi5cbiAqXG4gKiBAZXhhbXBsZVxuICogdmFyIG15TnVtYmVycyA9IFsxLCAyLCAzXTtcbiAqIG1peGluKHNzLCBteU51bWJlcnMpO1xuICogY29uc29sZS5sb2cobXlOdW1iZXJzLnN1bSgpKTsgLy8gNlxuICovXG5mdW5jdGlvbiBtaXhpbihzcywgYXJyYXkpIHtcbiAgICB2YXIgc3VwcG9ydCA9ICEhKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSAmJiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyk7XG4gICAgLy8gQ292ZXJhZ2UgdGVzdGluZyB3aWxsIG5ldmVyIHRlc3QgdGhpcyBlcnJvci5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmICghc3VwcG9ydCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3dpdGhvdXQgZGVmaW5lUHJvcGVydHksIHNpbXBsZS1zdGF0aXN0aWNzIGNhbm5vdCBiZSBtaXhlZCBpbicpO1xuICAgIH1cblxuICAgIC8vIG9ubHkgbWV0aG9kcyB3aGljaCB3b3JrIG9uIGJhc2ljIGFycmF5cyBpbiBhIHNpbmdsZSBzdGVwXG4gICAgLy8gYXJlIHN1cHBvcnRlZFxuICAgIHZhciBhcnJheU1ldGhvZHMgPSBbJ21lZGlhbicsICdzdGFuZGFyZERldmlhdGlvbicsICdzdW0nLFxuICAgICAgICAnc2FtcGxlU2tld25lc3MnLFxuICAgICAgICAnbWVhbicsICdtaW4nLCAnbWF4JywgJ3F1YW50aWxlJywgJ2dlb21ldHJpY01lYW4nLFxuICAgICAgICAnaGFybW9uaWNNZWFuJywgJ3Jvb3RfbWVhbl9zcXVhcmUnXTtcblxuICAgIC8vIGNyZWF0ZSBhIGNsb3N1cmUgd2l0aCBhIG1ldGhvZCBuYW1lIHNvIHRoYXQgYSByZWZlcmVuY2VcbiAgICAvLyBsaWtlIGBhcnJheU1ldGhvZHNbaV1gIGRvZXNuJ3QgZm9sbG93IHRoZSBsb29wIGluY3JlbWVudFxuICAgIGZ1bmN0aW9uIHdyYXAobWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGNhc3QgYW55IGFyZ3VtZW50cyBpbnRvIGFuIGFycmF5LCBzaW5jZSB0aGV5J3JlXG4gICAgICAgICAgICAvLyBuYXRpdmVseSBvYmplY3RzXG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhcmd1bWVudHMpO1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgZmlyc3QgYXJndW1lbnQgdGhlIGFycmF5IGl0c2VsZlxuICAgICAgICAgICAgYXJncy51bnNoaWZ0KHRoaXMpO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIHNzIG1ldGhvZFxuICAgICAgICAgICAgcmV0dXJuIHNzW21ldGhvZF0uYXBwbHkoc3MsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIHNlbGVjdCBvYmplY3QgdG8gZXh0ZW5kXG4gICAgdmFyIGV4dGVuZGluZztcbiAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgLy8gY3JlYXRlIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBhcnJheSBzbyB0aGF0IG91ciBpbnRlcm5hbFxuICAgICAgICAvLyBvcGVyYXRpb25zIGRvIG5vdCBjaGFuZ2UgaXQgYnkgcmVmZXJlbmNlXG4gICAgICAgIGV4dGVuZGluZyA9IGFycmF5LnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZXh0ZW5kaW5nID0gQXJyYXkucHJvdG90eXBlO1xuICAgIH1cblxuICAgIC8vIGZvciBlYWNoIGFycmF5IGZ1bmN0aW9uLCBkZWZpbmUgYSBmdW5jdGlvbiB0aGF0IGdldHNcbiAgICAvLyB0aGUgYXJyYXkgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgIC8vIFdlIHVzZSBbZGVmaW5lUHJvcGVydHldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2RlZmluZVByb3BlcnR5KVxuICAgIC8vIGJlY2F1c2UgaXQgYWxsb3dzIHRoZXNlIHByb3BlcnRpZXMgdG8gYmUgbm9uLWVudW1lcmFibGU6XG4gICAgLy8gYGZvciAodmFyIGluIHgpYCBsb29wcyB3aWxsIG5vdCBydW4gaW50byBwcm9ibGVtcyB3aXRoIHRoaXNcbiAgICAvLyBpbXBsZW1lbnRhdGlvbi5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5TWV0aG9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXh0ZW5kaW5nLCBhcnJheU1ldGhvZHNbaV0sIHtcbiAgICAgICAgICAgIHZhbHVlOiB3cmFwKGFycmF5TWV0aG9kc1tpXSksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBleHRlbmRpbmc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWl4aW47XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBudW1lcmljU29ydCA9IHJlcXVpcmUoJy4vbnVtZXJpY19zb3J0Jyk7XG5cbi8qKlxuICogVGhlIFttb2RlXShodHRwOi8vYml0Lmx5L1c1SzRZdCkgaXMgdGhlIG51bWJlciB0aGF0IGFwcGVhcnMgaW4gYSBsaXN0IHRoZSBoaWdoZXN0IG51bWJlciBvZiB0aW1lcy5cbiAqIFRoZXJlIGNhbiBiZSBtdWx0aXBsZSBtb2RlcyBpbiBhIGxpc3Q6IGluIHRoZSBldmVudCBvZiBhIHRpZSwgdGhpc1xuICogYWxnb3JpdGhtIHdpbGwgcmV0dXJuIHRoZSBtb3N0IHJlY2VudGx5IHNlZW4gbW9kZS5cbiAqXG4gKiBUaGlzIGlzIGEgW21lYXN1cmUgb2YgY2VudHJhbCB0ZW5kZW5jeV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2VudHJhbF90ZW5kZW5jeSk6XG4gKiBhIG1ldGhvZCBvZiBmaW5kaW5nIGEgdHlwaWNhbCBvciBjZW50cmFsIHZhbHVlIG9mIGEgc2V0IG9mIG51bWJlcnMuXG4gKlxuICogVGhpcyBydW5zIG9uIGBPKG4pYCwgbGluZWFyIHRpbWUgaW4gcmVzcGVjdCB0byB0aGUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBtb2RlXG4gKiBAZXhhbXBsZVxuICogbW9kZShbMCwgMCwgMV0pOyAvLz0gMFxuICovXG5mdW5jdGlvbiBtb2RlKHgpIHtcblxuICAgIC8vIEhhbmRsZSBlZGdlIGNhc2VzOlxuICAgIC8vIFRoZSBtZWRpYW4gb2YgYW4gZW1wdHkgbGlzdCBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG4gICAgZWxzZSBpZiAoeC5sZW5ndGggPT09IDEpIHsgcmV0dXJuIHhbMF07IH1cblxuICAgIC8vIFNvcnRpbmcgdGhlIGFycmF5IGxldHMgdXMgaXRlcmF0ZSB0aHJvdWdoIGl0IGJlbG93IGFuZCBiZSBzdXJlXG4gICAgLy8gdGhhdCBldmVyeSB0aW1lIHdlIHNlZSBhIG5ldyBudW1iZXIgaXQncyBuZXcgYW5kIHdlJ2xsIG5ldmVyXG4gICAgLy8gc2VlIHRoZSBzYW1lIG51bWJlciB0d2ljZVxuICAgIHZhciBzb3J0ZWQgPSBudW1lcmljU29ydCh4KTtcblxuICAgIC8vIFRoaXMgYXNzdW1lcyBpdCBpcyBkZWFsaW5nIHdpdGggYW4gYXJyYXkgb2Ygc2l6ZSA+IDEsIHNpbmNlIHNpemVcbiAgICAvLyAwIGFuZCAxIGFyZSBoYW5kbGVkIGltbWVkaWF0ZWx5LiBIZW5jZSBpdCBzdGFydHMgYXQgaW5kZXggMSBpbiB0aGVcbiAgICAvLyBhcnJheS5cbiAgICB2YXIgbGFzdCA9IHNvcnRlZFswXSxcbiAgICAgICAgLy8gc3RvcmUgdGhlIG1vZGUgYXMgd2UgZmluZCBuZXcgbW9kZXNcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIC8vIHN0b3JlIGhvdyBtYW55IHRpbWVzIHdlJ3ZlIHNlZW4gdGhlIG1vZGVcbiAgICAgICAgbWF4U2VlbiA9IDAsXG4gICAgICAgIC8vIGhvdyBtYW55IHRpbWVzIHRoZSBjdXJyZW50IGNhbmRpZGF0ZSBmb3IgdGhlIG1vZGVcbiAgICAgICAgLy8gaGFzIGJlZW4gc2VlblxuICAgICAgICBzZWVuVGhpcyA9IDE7XG5cbiAgICAvLyBlbmQgYXQgc29ydGVkLmxlbmd0aCArIDEgdG8gZml4IHRoZSBjYXNlIGluIHdoaWNoIHRoZSBtb2RlIGlzXG4gICAgLy8gdGhlIGhpZ2hlc3QgbnVtYmVyIHRoYXQgb2NjdXJzIGluIHRoZSBzZXF1ZW5jZS4gdGhlIGxhc3QgaXRlcmF0aW9uXG4gICAgLy8gY29tcGFyZXMgc29ydGVkW2ldLCB3aGljaCBpcyB1bmRlZmluZWQsIHRvIHRoZSBoaWdoZXN0IG51bWJlclxuICAgIC8vIGluIHRoZSBzZXJpZXNcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHNvcnRlZC5sZW5ndGggKyAxOyBpKyspIHtcbiAgICAgICAgLy8gd2UncmUgc2VlaW5nIGEgbmV3IG51bWJlciBwYXNzIGJ5XG4gICAgICAgIGlmIChzb3J0ZWRbaV0gIT09IGxhc3QpIHtcbiAgICAgICAgICAgIC8vIHRoZSBsYXN0IG51bWJlciBpcyB0aGUgbmV3IG1vZGUgc2luY2Ugd2Ugc2F3IGl0IG1vcmVcbiAgICAgICAgICAgIC8vIG9mdGVuIHRoYW4gdGhlIG9sZCBvbmVcbiAgICAgICAgICAgIGlmIChzZWVuVGhpcyA+IG1heFNlZW4pIHtcbiAgICAgICAgICAgICAgICBtYXhTZWVuID0gc2VlblRoaXM7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBsYXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VlblRoaXMgPSAxO1xuICAgICAgICAgICAgbGFzdCA9IHNvcnRlZFtpXTtcbiAgICAgICAgLy8gaWYgdGhpcyBpc24ndCBhIG5ldyBudW1iZXIsIGl0J3Mgb25lIG1vcmUgb2NjdXJyZW5jZSBvZlxuICAgICAgICAvLyB0aGUgcG90ZW50aWFsIG1vZGVcbiAgICAgICAgfSBlbHNlIHsgc2VlblRoaXMrKzsgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTb3J0IGFuIGFycmF5IG9mIG51bWJlcnMgYnkgdGhlaXIgbnVtZXJpYyB2YWx1ZSwgZW5zdXJpbmcgdGhhdCB0aGVcbiAqIGFycmF5IGlzIG5vdCBjaGFuZ2VkIGluIHBsYWNlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgLnNvcnRcbiAqIGluIEphdmFTY3JpcHQgaXMgdG8gc29ydCBhcnJheXMgYXMgc3RyaW5nIHZhbHVlc1xuICpcbiAqICAgICBbMSwgMTAsIDEyLCAxMDIsIDIwXS5zb3J0KClcbiAqICAgICAvLyBvdXRwdXRcbiAqICAgICBbMSwgMTAsIDEwMiwgMTIsIDIwXVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gYXJyYXkgaW5wdXQgYXJyYXlcbiAqIEByZXR1cm4ge0FycmF5PG51bWJlcj59IHNvcnRlZCBhcnJheVxuICogQHByaXZhdGVcbiAqIEBleGFtcGxlXG4gKiBudW1lcmljU29ydChbMywgMiwgMV0pIC8vIFsxLCAyLCAzXVxuICovXG5mdW5jdGlvbiBudW1lcmljU29ydChhcnJheSkge1xuICAgIHJldHVybiBhcnJheVxuICAgICAgICAvLyBlbnN1cmUgdGhlIGFycmF5IGlzIGNoYW5nZWQgaW4tcGxhY2VcbiAgICAgICAgLnNsaWNlKClcbiAgICAgICAgLy8gY29tcGFyYXRvciBmdW5jdGlvbiB0aGF0IHRyZWF0cyBpbnB1dCBhcyBudW1lcmljXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbnVtZXJpY1NvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhpcyBpcyBhIHNpbmdsZS1sYXllciBbUGVyY2VwdHJvbiBDbGFzc2lmaWVyXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BlcmNlcHRyb24pIHRoYXQgdGFrZXNcbiAqIGFycmF5cyBvZiBudW1iZXJzIGFuZCBwcmVkaWN0cyB3aGV0aGVyIHRoZXkgc2hvdWxkIGJlIGNsYXNzaWZpZWRcbiAqIGFzIGVpdGhlciAwIG9yIDEgKG5lZ2F0aXZlIG9yIHBvc2l0aXZlIGV4YW1wbGVzKS5cbiAqIEBjbGFzc1xuICogQGV4YW1wbGVcbiAqIC8vIENyZWF0ZSB0aGUgbW9kZWxcbiAqIHZhciBwID0gbmV3IFBlcmNlcHRyb25Nb2RlbCgpO1xuICogLy8gVHJhaW4gdGhlIG1vZGVsIHdpdGggaW5wdXQgd2l0aCBhIGRpYWdvbmFsIGJvdW5kYXJ5LlxuICogZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAqICAgICBwLnRyYWluKFsxLCAxXSwgMSk7XG4gKiAgICAgcC50cmFpbihbMCwgMV0sIDApO1xuICogICAgIHAudHJhaW4oWzEsIDBdLCAwKTtcbiAqICAgICBwLnRyYWluKFswLCAwXSwgMCk7XG4gKiB9XG4gKiBwLnByZWRpY3QoWzAsIDBdKTsgLy8gMFxuICogcC5wcmVkaWN0KFswLCAxXSk7IC8vIDBcbiAqIHAucHJlZGljdChbMSwgMF0pOyAvLyAwXG4gKiBwLnByZWRpY3QoWzEsIDFdKTsgLy8gMVxuICovXG5mdW5jdGlvbiBQZXJjZXB0cm9uTW9kZWwoKSB7XG4gICAgLy8gVGhlIHdlaWdodHMsIG9yIGNvZWZmaWNpZW50cyBvZiB0aGUgbW9kZWw7XG4gICAgLy8gd2VpZ2h0cyBhcmUgb25seSBwb3B1bGF0ZWQgd2hlbiB0cmFpbmluZyB3aXRoIGRhdGEuXG4gICAgdGhpcy53ZWlnaHRzID0gW107XG4gICAgLy8gVGhlIGJpYXMgdGVybSwgb3IgaW50ZXJjZXB0OyBpdCBpcyBhbHNvIGEgd2VpZ2h0IGJ1dFxuICAgIC8vIGl0J3Mgc3RvcmVkIHNlcGFyYXRlbHkgZm9yIGNvbnZlbmllbmNlIGFzIGl0IGlzIGFsd2F5c1xuICAgIC8vIG11bHRpcGxpZWQgYnkgb25lLlxuICAgIHRoaXMuYmlhcyA9IDA7XG59XG5cbi8qKlxuICogKipQcmVkaWN0Kio6IFVzZSBhbiBhcnJheSBvZiBmZWF0dXJlcyB3aXRoIHRoZSB3ZWlnaHQgYXJyYXkgYW5kIGJpYXNcbiAqIHRvIHByZWRpY3Qgd2hldGhlciBhbiBleGFtcGxlIGlzIGxhYmVsZWQgMCBvciAxLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gZmVhdHVyZXMgYW4gYXJyYXkgb2YgZmVhdHVyZXMgYXMgbnVtYmVyc1xuICogQHJldHVybnMge251bWJlcn0gMSBpZiB0aGUgc2NvcmUgaXMgb3ZlciAwLCBvdGhlcndpc2UgMFxuICovXG5QZXJjZXB0cm9uTW9kZWwucHJvdG90eXBlLnByZWRpY3QgPSBmdW5jdGlvbihmZWF0dXJlcykge1xuXG4gICAgLy8gT25seSBwcmVkaWN0IGlmIHByZXZpb3VzbHkgdHJhaW5lZFxuICAgIC8vIG9uIHRoZSBzYW1lIHNpemUgZmVhdHVyZSBhcnJheShzKS5cbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoICE9PSB0aGlzLndlaWdodHMubGVuZ3RoKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIHN1bSBvZiBmZWF0dXJlcyB0aW1lcyB3ZWlnaHRzLFxuICAgIC8vIHdpdGggdGhlIGJpYXMgYWRkZWQgKGltcGxpY2l0bHkgdGltZXMgb25lKS5cbiAgICB2YXIgc2NvcmUgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy53ZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNjb3JlICs9IHRoaXMud2VpZ2h0c1tpXSAqIGZlYXR1cmVzW2ldO1xuICAgIH1cbiAgICBzY29yZSArPSB0aGlzLmJpYXM7XG5cbiAgICAvLyBDbGFzc2lmeSBhcyAxIGlmIHRoZSBzY29yZSBpcyBvdmVyIDAsIG90aGVyd2lzZSAwLlxuICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxufTtcblxuLyoqXG4gKiAqKlRyYWluKiogdGhlIGNsYXNzaWZpZXIgd2l0aCBhIG5ldyBleGFtcGxlLCB3aGljaCBpc1xuICogYSBudW1lcmljIGFycmF5IG9mIGZlYXR1cmVzIGFuZCBhIDAgb3IgMSBsYWJlbC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IGZlYXR1cmVzIGFuIGFycmF5IG9mIGZlYXR1cmVzIGFzIG51bWJlcnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBsYWJlbCBlaXRoZXIgMCBvciAxXG4gKiBAcmV0dXJucyB7UGVyY2VwdHJvbk1vZGVsfSB0aGlzXG4gKi9cblBlcmNlcHRyb25Nb2RlbC5wcm90b3R5cGUudHJhaW4gPSBmdW5jdGlvbihmZWF0dXJlcywgbGFiZWwpIHtcbiAgICAvLyBSZXF1aXJlIHRoYXQgb25seSBsYWJlbHMgb2YgMCBvciAxIGFyZSBjb25zaWRlcmVkLlxuICAgIGlmIChsYWJlbCAhPT0gMCAmJiBsYWJlbCAhPT0gMSkgeyByZXR1cm4gbnVsbDsgfVxuICAgIC8vIFRoZSBsZW5ndGggb2YgdGhlIGZlYXR1cmUgYXJyYXkgZGV0ZXJtaW5lc1xuICAgIC8vIHRoZSBsZW5ndGggb2YgdGhlIHdlaWdodCBhcnJheS5cbiAgICAvLyBUaGUgcGVyY2VwdHJvbiB3aWxsIGNvbnRpbnVlIGxlYXJuaW5nIGFzIGxvbmcgYXNcbiAgICAvLyBpdCBrZWVwcyBzZWVpbmcgZmVhdHVyZSBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoLlxuICAgIC8vIFdoZW4gaXQgc2VlcyBhIG5ldyBkYXRhIHNoYXBlLCBpdCBpbml0aWFsaXplcy5cbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoICE9PSB0aGlzLndlaWdodHMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMud2VpZ2h0cyA9IGZlYXR1cmVzO1xuICAgICAgICB0aGlzLmJpYXMgPSAxO1xuICAgIH1cbiAgICAvLyBNYWtlIGEgcHJlZGljdGlvbiBiYXNlZCBvbiBjdXJyZW50IHdlaWdodHMuXG4gICAgdmFyIHByZWRpY3Rpb24gPSB0aGlzLnByZWRpY3QoZmVhdHVyZXMpO1xuICAgIC8vIFVwZGF0ZSB0aGUgd2VpZ2h0cyBpZiB0aGUgcHJlZGljdGlvbiBpcyB3cm9uZy5cbiAgICBpZiAocHJlZGljdGlvbiAhPT0gbGFiZWwpIHtcbiAgICAgICAgdmFyIGdyYWRpZW50ID0gbGFiZWwgLSBwcmVkaWN0aW9uO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMud2VpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy53ZWlnaHRzW2ldICs9IGdyYWRpZW50ICogZmVhdHVyZXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaWFzICs9IGdyYWRpZW50O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGVyY2VwdHJvbk1vZGVsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXBzaWxvbiA9IHJlcXVpcmUoJy4vZXBzaWxvbicpO1xudmFyIGZhY3RvcmlhbCA9IHJlcXVpcmUoJy4vZmFjdG9yaWFsJyk7XG5cbi8qKlxuICogVGhlIFtQb2lzc29uIERpc3RyaWJ1dGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Qb2lzc29uX2Rpc3RyaWJ1dGlvbilcbiAqIGlzIGEgZGlzY3JldGUgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIHRoYXQgZXhwcmVzc2VzIHRoZSBwcm9iYWJpbGl0eVxuICogb2YgYSBnaXZlbiBudW1iZXIgb2YgZXZlbnRzIG9jY3VycmluZyBpbiBhIGZpeGVkIGludGVydmFsIG9mIHRpbWVcbiAqIGFuZC9vciBzcGFjZSBpZiB0aGVzZSBldmVudHMgb2NjdXIgd2l0aCBhIGtub3duIGF2ZXJhZ2UgcmF0ZSBhbmRcbiAqIGluZGVwZW5kZW50bHkgb2YgdGhlIHRpbWUgc2luY2UgdGhlIGxhc3QgZXZlbnQuXG4gKlxuICogVGhlIFBvaXNzb24gRGlzdHJpYnV0aW9uIGlzIGNoYXJhY3Rlcml6ZWQgYnkgdGhlIHN0cmljdGx5IHBvc2l0aXZlXG4gKiBtZWFuIGFycml2YWwgb3Igb2NjdXJyZW5jZSByYXRlLCBgzrtgLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsYW1iZGEgbG9jYXRpb24gcG9pc3NvbiBkaXN0cmlidXRpb25cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHZhbHVlIG9mIHBvaXNzb24gZGlzdHJpYnV0aW9uIGF0IHRoYXQgcG9pbnRcbiAqL1xuZnVuY3Rpb24gcG9pc3NvbkRpc3RyaWJ1dGlvbihsYW1iZGEpIHtcbiAgICAvLyBDaGVjayB0aGF0IGxhbWJkYSBpcyBzdHJpY3RseSBwb3NpdGl2ZVxuICAgIGlmIChsYW1iZGEgPD0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gb3VyIGN1cnJlbnQgcGxhY2UgaW4gdGhlIGRpc3RyaWJ1dGlvblxuICAgIHZhciB4ID0gMCxcbiAgICAgICAgLy8gYW5kIHdlIGtlZXAgdHJhY2sgb2YgdGhlIGN1cnJlbnQgY3VtdWxhdGl2ZSBwcm9iYWJpbGl0eSwgaW5cbiAgICAgICAgLy8gb3JkZXIgdG8ga25vdyB3aGVuIHRvIHN0b3AgY2FsY3VsYXRpbmcgY2hhbmNlcy5cbiAgICAgICAgY3VtdWxhdGl2ZVByb2JhYmlsaXR5ID0gMCxcbiAgICAgICAgLy8gdGhlIGNhbGN1bGF0ZWQgY2VsbHMgdG8gYmUgcmV0dXJuZWRcbiAgICAgICAgY2VsbHMgPSB7fTtcblxuICAgIC8vIFRoaXMgYWxnb3JpdGhtIGl0ZXJhdGVzIHRocm91Z2ggZWFjaCBwb3RlbnRpYWwgb3V0Y29tZSxcbiAgICAvLyB1bnRpbCB0aGUgYGN1bXVsYXRpdmVQcm9iYWJpbGl0eWAgaXMgdmVyeSBjbG9zZSB0byAxLCBhdFxuICAgIC8vIHdoaWNoIHBvaW50IHdlJ3ZlIGRlZmluZWQgdGhlIHZhc3QgbWFqb3JpdHkgb2Ygb3V0Y29tZXNcbiAgICBkbyB7XG4gICAgICAgIC8vIGEgW3Byb2JhYmlsaXR5IG1hc3MgZnVuY3Rpb25dKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Byb2JhYmlsaXR5X21hc3NfZnVuY3Rpb24pXG4gICAgICAgIGNlbGxzW3hdID0gKE1hdGgucG93KE1hdGguRSwgLWxhbWJkYSkgKiBNYXRoLnBvdyhsYW1iZGEsIHgpKSAvIGZhY3RvcmlhbCh4KTtcbiAgICAgICAgY3VtdWxhdGl2ZVByb2JhYmlsaXR5ICs9IGNlbGxzW3hdO1xuICAgICAgICB4Kys7XG4gICAgLy8gd2hlbiB0aGUgY3VtdWxhdGl2ZVByb2JhYmlsaXR5IGlzIG5lYXJseSAxLCB3ZSd2ZSBjYWxjdWxhdGVkXG4gICAgLy8gdGhlIHVzZWZ1bCByYW5nZSBvZiB0aGlzIGRpc3RyaWJ1dGlvblxuICAgIH0gd2hpbGUgKGN1bXVsYXRpdmVQcm9iYWJpbGl0eSA8IDEgLSBlcHNpbG9uKTtcblxuICAgIHJldHVybiBjZWxscztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwb2lzc29uRGlzdHJpYnV0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXBzaWxvbiA9IHJlcXVpcmUoJy4vZXBzaWxvbicpO1xudmFyIGludmVyc2VFcnJvckZ1bmN0aW9uID0gcmVxdWlyZSgnLi9pbnZlcnNlX2Vycm9yX2Z1bmN0aW9uJyk7XG5cbi8qKlxuICogVGhlIFtQcm9iaXRdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUHJvYml0KVxuICogaXMgdGhlIGludmVyc2Ugb2YgY3VtdWxhdGl2ZVN0ZE5vcm1hbFByb2JhYmlsaXR5KCksXG4gKiBhbmQgaXMgYWxzbyBrbm93biBhcyB0aGUgbm9ybWFsIHF1YW50aWxlIGZ1bmN0aW9uLlxuICpcbiAqIEl0IHJldHVybnMgdGhlIG51bWJlciBvZiBzdGFuZGFyZCBkZXZpYXRpb25zIGZyb20gdGhlIG1lYW5cbiAqIHdoZXJlIHRoZSBwJ3RoIHF1YW50aWxlIG9mIHZhbHVlcyBjYW4gYmUgZm91bmQgaW4gYSBub3JtYWwgZGlzdHJpYnV0aW9uLlxuICogU28sIGZvciBleGFtcGxlLCBwcm9iaXQoMC41ICsgMC42ODI3LzIpIOKJiCAxIGJlY2F1c2UgNjguMjclIG9mIHZhbHVlcyBhcmVcbiAqIG5vcm1hbGx5IGZvdW5kIHdpdGhpbiAxIHN0YW5kYXJkIGRldmlhdGlvbiBhYm92ZSBvciBiZWxvdyB0aGUgbWVhbi5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gcFxuICogQHJldHVybnMge251bWJlcn0gcHJvYml0XG4gKi9cbmZ1bmN0aW9uIHByb2JpdChwKSB7XG4gICAgaWYgKHAgPT09IDApIHtcbiAgICAgICAgcCA9IGVwc2lsb247XG4gICAgfSBlbHNlIGlmIChwID49IDEpIHtcbiAgICAgICAgcCA9IDEgLSBlcHNpbG9uO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5zcXJ0KDIpICogaW52ZXJzZUVycm9yRnVuY3Rpb24oMiAqIHAgLSAxKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9iaXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBxdWFudGlsZVNvcnRlZCA9IHJlcXVpcmUoJy4vcXVhbnRpbGVfc29ydGVkJyk7XG52YXIgbnVtZXJpY1NvcnQgPSByZXF1aXJlKCcuL251bWVyaWNfc29ydCcpO1xuXG4vKipcbiAqIFRoZSBbcXVhbnRpbGVdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1F1YW50aWxlKTpcbiAqIHRoaXMgaXMgYSBwb3B1bGF0aW9uIHF1YW50aWxlLCBzaW5jZSB3ZSBhc3N1bWUgdG8ga25vdyB0aGUgZW50aXJlXG4gKiBkYXRhc2V0IGluIHRoaXMgbGlicmFyeS4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGVcbiAqIFtRdWFudGlsZXMgb2YgYSBQb3B1bGF0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1F1YW50aWxlI1F1YW50aWxlc19vZl9hX3BvcHVsYXRpb24pXG4gKiBhbGdvcml0aG0gZnJvbSB3aWtpcGVkaWEuXG4gKlxuICogU2FtcGxlIGlzIGEgb25lLWRpbWVuc2lvbmFsIGFycmF5IG9mIG51bWJlcnMsXG4gKiBhbmQgcCBpcyBlaXRoZXIgYSBkZWNpbWFsIG51bWJlciBmcm9tIDAgdG8gMSBvciBhbiBhcnJheSBvZiBkZWNpbWFsXG4gKiBudW1iZXJzIGZyb20gMCB0byAxLlxuICogSW4gdGVybXMgb2YgYSBrL3EgcXVhbnRpbGUsIHAgPSBrL3EgLSBpdCdzIGp1c3QgZGVhbGluZyB3aXRoIGZyYWN0aW9ucyBvciBkZWFsaW5nXG4gKiB3aXRoIGRlY2ltYWwgdmFsdWVzLlxuICogV2hlbiBwIGlzIGFuIGFycmF5LCB0aGUgcmVzdWx0IG9mIHRoZSBmdW5jdGlvbiBpcyBhbHNvIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGFwcHJvcHJpYXRlXG4gKiBxdWFudGlsZXMgaW4gaW5wdXQgb3JkZXJcbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHNhbXBsZSBhIHNhbXBsZSBmcm9tIHRoZSBwb3B1bGF0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gcCB0aGUgZGVzaXJlZCBxdWFudGlsZSwgYXMgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBxdWFudGlsZVxuICogQGV4YW1wbGVcbiAqIHZhciBkYXRhID0gWzMsIDYsIDcsIDgsIDgsIDksIDEwLCAxMywgMTUsIDE2LCAyMF07XG4gKiBxdWFudGlsZShkYXRhLCAxKTsgLy89IG1heChkYXRhKTtcbiAqIHF1YW50aWxlKGRhdGEsIDApOyAvLz0gbWluKGRhdGEpO1xuICogcXVhbnRpbGUoZGF0YSwgMC41KTsgLy89IDlcbiAqL1xuZnVuY3Rpb24gcXVhbnRpbGUoc2FtcGxlLCBwKSB7XG5cbiAgICAvLyBXZSBjYW4ndCBkZXJpdmUgcXVhbnRpbGVzIGZyb20gYW4gZW1wdHkgbGlzdFxuICAgIGlmIChzYW1wbGUubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICAvLyBTb3J0IGEgY29weSBvZiB0aGUgYXJyYXkuIFdlJ2xsIG5lZWQgYSBzb3J0ZWQgYXJyYXkgdG8gaW5kZXhcbiAgICAvLyB0aGUgdmFsdWVzIGluIHNvcnRlZCBvcmRlci5cbiAgICB2YXIgc29ydGVkID0gbnVtZXJpY1NvcnQoc2FtcGxlKTtcblxuICAgIGlmIChwLmxlbmd0aCkge1xuICAgICAgICAvLyBJbml0aWFsaXplIHRoZSByZXN1bHQgYXJyYXlcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgLy8gRm9yIGVhY2ggcmVxdWVzdGVkIHF1YW50aWxlXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0c1tpXSA9IHF1YW50aWxlU29ydGVkKHNvcnRlZCwgcFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHF1YW50aWxlU29ydGVkKHNvcnRlZCwgcCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHF1YW50aWxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIGludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIHF1YW50aWxlczogd2hlbiB5b3Uga25vd1xuICogdGhhdCB0aGUgb3JkZXIgaXMgc29ydGVkLCB5b3UgZG9uJ3QgbmVlZCB0byByZS1zb3J0IGl0LCBhbmQgdGhlIGNvbXB1dGF0aW9uc1xuICogYXJlIGZhc3Rlci5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHNhbXBsZSBpbnB1dCBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcCBkZXNpcmVkIHF1YW50aWxlOiBhIG51bWJlciBiZXR3ZWVuIDAgdG8gMSwgaW5jbHVzaXZlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBxdWFudGlsZSB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIHZhciBkYXRhID0gWzMsIDYsIDcsIDgsIDgsIDksIDEwLCAxMywgMTUsIDE2LCAyMF07XG4gKiBxdWFudGlsZVNvcnRlZChkYXRhLCAxKTsgLy89IG1heChkYXRhKTtcbiAqIHF1YW50aWxlU29ydGVkKGRhdGEsIDApOyAvLz0gbWluKGRhdGEpO1xuICogcXVhbnRpbGVTb3J0ZWQoZGF0YSwgMC41KTsgLy89IDlcbiAqL1xuZnVuY3Rpb24gcXVhbnRpbGVTb3J0ZWQoc2FtcGxlLCBwKSB7XG4gICAgdmFyIGlkeCA9IHNhbXBsZS5sZW5ndGggKiBwO1xuICAgIGlmIChwIDwgMCB8fCBwID4gMSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHAgPT09IDEpIHtcbiAgICAgICAgLy8gSWYgcCBpcyAxLCBkaXJlY3RseSByZXR1cm4gdGhlIGxhc3QgZWxlbWVudFxuICAgICAgICByZXR1cm4gc2FtcGxlW3NhbXBsZS5sZW5ndGggLSAxXTtcbiAgICB9IGVsc2UgaWYgKHAgPT09IDApIHtcbiAgICAgICAgLy8gSWYgcCBpcyAwLCBkaXJlY3RseSByZXR1cm4gdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIHNhbXBsZVswXTtcbiAgICB9IGVsc2UgaWYgKGlkeCAlIDEgIT09IDApIHtcbiAgICAgICAgLy8gSWYgcCBpcyBub3QgaW50ZWdlciwgcmV0dXJuIHRoZSBuZXh0IGVsZW1lbnQgaW4gYXJyYXlcbiAgICAgICAgcmV0dXJuIHNhbXBsZVtNYXRoLmNlaWwoaWR4KSAtIDFdO1xuICAgIH0gZWxzZSBpZiAoc2FtcGxlLmxlbmd0aCAlIDIgPT09IDApIHtcbiAgICAgICAgLy8gSWYgdGhlIGxpc3QgaGFzIGV2ZW4tbGVuZ3RoLCB3ZSdsbCB0YWtlIHRoZSBhdmVyYWdlIG9mIHRoaXMgbnVtYmVyXG4gICAgICAgIC8vIGFuZCB0aGUgbmV4dCB2YWx1ZSwgaWYgdGhlcmUgaXMgb25lXG4gICAgICAgIHJldHVybiAoc2FtcGxlW2lkeCAtIDFdICsgc2FtcGxlW2lkeF0pIC8gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGaW5hbGx5LCBpbiB0aGUgc2ltcGxlIGNhc2Ugb2YgYW4gaW50ZWdlciB2YWx1ZVxuICAgICAgICAvLyB3aXRoIGFuIG9kZC1sZW5ndGggbGlzdCwgcmV0dXJuIHRoZSBzYW1wbGUgdmFsdWUgYXQgdGhlIGluZGV4LlxuICAgICAgICByZXR1cm4gc2FtcGxlW2lkeF07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHF1YW50aWxlU29ydGVkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoZSBbUiBTcXVhcmVkXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvZWZmaWNpZW50X29mX2RldGVybWluYXRpb24pXG4gKiB2YWx1ZSBvZiBkYXRhIGNvbXBhcmVkIHdpdGggYSBmdW5jdGlvbiBgZmBcbiAqIGlzIHRoZSBzdW0gb2YgdGhlIHNxdWFyZWQgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgcHJlZGljdGlvblxuICogYW5kIHRoZSBhY3R1YWwgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtBcnJheTxBcnJheTxudW1iZXI+Pn0gZGF0YSBpbnB1dCBkYXRhOiB0aGlzIHNob3VsZCBiZSBkb3VibHktbmVzdGVkXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIGZ1bmN0aW9uIGNhbGxlZCBvbiBgW2ldWzBdYCB2YWx1ZXMgd2l0aGluIHRoZSBkYXRhc2V0XG4gKiBAcmV0dXJucyB7bnVtYmVyfSByLXNxdWFyZWQgdmFsdWVcbiAqIEBleGFtcGxlXG4gKiB2YXIgc2FtcGxlcyA9IFtbMCwgMF0sIFsxLCAxXV07XG4gKiB2YXIgcmVncmVzc2lvbkxpbmUgPSBsaW5lYXJSZWdyZXNzaW9uTGluZShsaW5lYXJSZWdyZXNzaW9uKHNhbXBsZXMpKTtcbiAqIHJTcXVhcmVkKHNhbXBsZXMsIHJlZ3Jlc3Npb25MaW5lKTsgLy89IDEgdGhpcyBsaW5lIGlzIGEgcGVyZmVjdCBmaXRcbiAqL1xuZnVuY3Rpb24gclNxdWFyZWQoZGF0YSwgZnVuYykge1xuICAgIGlmIChkYXRhLmxlbmd0aCA8IDIpIHsgcmV0dXJuIDE7IH1cblxuICAgIC8vIENvbXB1dGUgdGhlIGF2ZXJhZ2UgeSB2YWx1ZSBmb3IgdGhlIGFjdHVhbFxuICAgIC8vIGRhdGEgc2V0IGluIG9yZGVyIHRvIGNvbXB1dGUgdGhlXG4gICAgLy8gX3RvdGFsIHN1bSBvZiBzcXVhcmVzX1xuICAgIHZhciBzdW0gPSAwLCBhdmVyYWdlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBzdW0gKz0gZGF0YVtpXVsxXTtcbiAgICB9XG4gICAgYXZlcmFnZSA9IHN1bSAvIGRhdGEubGVuZ3RoO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgdG90YWwgc3VtIG9mIHNxdWFyZXMgLSB0aGVcbiAgICAvLyBzcXVhcmVkIGRpZmZlcmVuY2UgYmV0d2VlbiBlYWNoIHBvaW50XG4gICAgLy8gYW5kIHRoZSBhdmVyYWdlIG9mIGFsbCBwb2ludHMuXG4gICAgdmFyIHN1bU9mU3F1YXJlcyA9IDA7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBkYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHN1bU9mU3F1YXJlcyArPSBNYXRoLnBvdyhhdmVyYWdlIC0gZGF0YVtqXVsxXSwgMik7XG4gICAgfVxuXG4gICAgLy8gRmluYWxseSBlc3RpbWF0ZSB0aGUgZXJyb3I6IHRoZSBzcXVhcmVkXG4gICAgLy8gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBlc3RpbWF0ZSBhbmQgdGhlIGFjdHVhbCBkYXRhXG4gICAgLy8gdmFsdWUgYXQgZWFjaCBwb2ludC5cbiAgICB2YXIgZXJyID0gMDtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGRhdGEubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgZXJyICs9IE1hdGgucG93KGRhdGFba11bMV0gLSBmdW5jKGRhdGFba11bMF0pLCAyKTtcbiAgICB9XG5cbiAgICAvLyBBcyB0aGUgZXJyb3IgZ3Jvd3MgbGFyZ2VyLCBpdHMgcmF0aW8gdG8gdGhlXG4gICAgLy8gc3VtIG9mIHNxdWFyZXMgaW5jcmVhc2VzIGFuZCB0aGUgciBzcXVhcmVkXG4gICAgLy8gdmFsdWUgZ3Jvd3MgbG93ZXIuXG4gICAgcmV0dXJuIDEgLSBlcnIgLyBzdW1PZlNxdWFyZXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gclNxdWFyZWQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVGhlIFJvb3QgTWVhbiBTcXVhcmUgKFJNUykgaXNcbiAqIGEgbWVhbiBmdW5jdGlvbiB1c2VkIGFzIGEgbWVhc3VyZSBvZiB0aGUgbWFnbml0dWRlIG9mIGEgc2V0XG4gKiBvZiBudW1iZXJzLCByZWdhcmRsZXNzIG9mIHRoZWlyIHNpZ24uXG4gKiBUaGlzIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgbWVhbiBvZiB0aGUgc3F1YXJlcyBvZiB0aGVcbiAqIGlucHV0IG51bWJlcnMuXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gcm9vdCBtZWFuIHNxdWFyZVxuICogQGV4YW1wbGVcbiAqIHJvb3RNZWFuU3F1YXJlKFstMSwgMSwgLTEsIDFdKTsgLy89IDFcbiAqL1xuZnVuY3Rpb24gcm9vdE1lYW5TcXVhcmUoeCkge1xuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgdmFyIHN1bU9mU3F1YXJlcyA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bU9mU3F1YXJlcyArPSBNYXRoLnBvdyh4W2ldLCAyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bU9mU3F1YXJlcyAvIHgubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByb290TWVhblNxdWFyZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNodWZmbGUgPSByZXF1aXJlKCcuL3NodWZmbGUnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBbc2ltcGxlIHJhbmRvbSBzYW1wbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU2ltcGxlX3JhbmRvbV9zYW1wbGUpXG4gKiBmcm9tIGEgZ2l2ZW4gYXJyYXkgb2YgYG5gIGVsZW1lbnRzLlxuICpcbiAqIFRoZSBzYW1wbGVkIHZhbHVlcyB3aWxsIGJlIGluIGFueSBvcmRlciwgbm90IG5lY2Vzc2FyaWx5IHRoZSBvcmRlclxuICogdGhleSBhcHBlYXIgaW4gdGhlIGlucHV0LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IGlucHV0IGFycmF5LiBjYW4gY29udGFpbiBhbnkgdHlwZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gY291bnQgb2YgaG93IG1hbnkgZWxlbWVudHMgdG8gdGFrZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3JhbmRvbVNvdXJjZT1NYXRoLnJhbmRvbV0gYW4gb3B0aW9uYWwgc291cmNlIG9mIGVudHJvcHlcbiAqIGluc3RlYWQgb2YgTWF0aC5yYW5kb21cbiAqIEByZXR1cm4ge0FycmF5fSBzdWJzZXQgb2YgbiBlbGVtZW50cyBpbiBvcmlnaW5hbCBhcnJheVxuICogQGV4YW1wbGVcbiAqIHZhciB2YWx1ZXMgPSBbMSwgMiwgNCwgNSwgNiwgNywgOCwgOV07XG4gKiBzYW1wbGUodmFsdWVzLCAzKTsgLy8gcmV0dXJucyAzIHJhbmRvbSB2YWx1ZXMsIGxpa2UgWzIsIDUsIDhdO1xuICovXG5mdW5jdGlvbiBzYW1wbGUoYXJyYXksIG4sIHJhbmRvbVNvdXJjZSkge1xuICAgIC8vIHNodWZmbGUgdGhlIG9yaWdpbmFsIGFycmF5IHVzaW5nIGEgZmlzaGVyLXlhdGVzIHNodWZmbGVcbiAgICB2YXIgc2h1ZmZsZWQgPSBzaHVmZmxlKGFycmF5LCByYW5kb21Tb3VyY2UpO1xuXG4gICAgLy8gYW5kIHRoZW4gcmV0dXJuIGEgc3Vic2V0IG9mIGl0IC0gdGhlIGZpcnN0IGBuYCBlbGVtZW50cy5cbiAgICByZXR1cm4gc2h1ZmZsZWQuc2xpY2UoMCwgbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2FtcGxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2FtcGxlQ292YXJpYW5jZSA9IHJlcXVpcmUoJy4vc2FtcGxlX2NvdmFyaWFuY2UnKTtcbnZhciBzYW1wbGVTdGFuZGFyZERldmlhdGlvbiA9IHJlcXVpcmUoJy4vc2FtcGxlX3N0YW5kYXJkX2RldmlhdGlvbicpO1xuXG4vKipcbiAqIFRoZSBbY29ycmVsYXRpb25dKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29ycmVsYXRpb25fYW5kX2RlcGVuZGVuY2UpIGlzXG4gKiBhIG1lYXN1cmUgb2YgaG93IGNvcnJlbGF0ZWQgdHdvIGRhdGFzZXRzIGFyZSwgYmV0d2VlbiAtMSBhbmQgMVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBmaXJzdCBpbnB1dFxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB5IHNlY29uZCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gc2FtcGxlIGNvcnJlbGF0aW9uXG4gKiBAZXhhbXBsZVxuICogdmFyIGEgPSBbMSwgMiwgMywgNCwgNSwgNl07XG4gKiB2YXIgYiA9IFsyLCAyLCAzLCA0LCA1LCA2MF07XG4gKiBzYW1wbGVDb3JyZWxhdGlvbihhLCBiKTsgLy89IDAuNjkxXG4gKi9cbmZ1bmN0aW9uIHNhbXBsZUNvcnJlbGF0aW9uKHgsIHkpIHtcbiAgICB2YXIgY292ID0gc2FtcGxlQ292YXJpYW5jZSh4LCB5KSxcbiAgICAgICAgeHN0ZCA9IHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uKHgpLFxuICAgICAgICB5c3RkID0gc2FtcGxlU3RhbmRhcmREZXZpYXRpb24oeSk7XG5cbiAgICBpZiAoY292ID09PSBudWxsIHx8IHhzdGQgPT09IG51bGwgfHwgeXN0ZCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gY292IC8geHN0ZCAvIHlzdGQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2FtcGxlQ29ycmVsYXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBtZWFuID0gcmVxdWlyZSgnLi9tZWFuJyk7XG5cbi8qKlxuICogW1NhbXBsZSBjb3ZhcmlhbmNlXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TYW1wbGVfbWVhbl9hbmRfc2FtcGxlQ292YXJpYW5jZSkgb2YgdHdvIGRhdGFzZXRzOlxuICogaG93IG11Y2ggZG8gdGhlIHR3byBkYXRhc2V0cyBtb3ZlIHRvZ2V0aGVyP1xuICogeCBhbmQgeSBhcmUgdHdvIGRhdGFzZXRzLCByZXByZXNlbnRlZCBhcyBhcnJheXMgb2YgbnVtYmVycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggZmlyc3QgaW5wdXRcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geSBzZWNvbmQgaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHNhbXBsZSBjb3ZhcmlhbmNlXG4gKiBAZXhhbXBsZVxuICogdmFyIHggPSBbMSwgMiwgMywgNCwgNSwgNl07XG4gKiB2YXIgeSA9IFs2LCA1LCA0LCAzLCAyLCAxXTtcbiAqIHNhbXBsZUNvdmFyaWFuY2UoeCwgeSk7IC8vPSAtMy41XG4gKi9cbmZ1bmN0aW9uIHNhbXBsZUNvdmFyaWFuY2UoeCwgeSkge1xuXG4gICAgLy8gVGhlIHR3byBkYXRhc2V0cyBtdXN0IGhhdmUgdGhlIHNhbWUgbGVuZ3RoIHdoaWNoIG11c3QgYmUgbW9yZSB0aGFuIDFcbiAgICBpZiAoeC5sZW5ndGggPD0gMSB8fCB4Lmxlbmd0aCAhPT0geS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBtZWFuIG9mIGVhY2ggZGF0YXNldCBzbyB0aGF0IHdlIGNhbiBqdWRnZSBlYWNoXG4gICAgLy8gdmFsdWUgb2YgdGhlIGRhdGFzZXQgZmFpcmx5IGFzIHRoZSBkaWZmZXJlbmNlIGZyb20gdGhlIG1lYW4uIHRoaXNcbiAgICAvLyB3YXksIGlmIG9uZSBkYXRhc2V0IGlzIFsxLCAyLCAzXSBhbmQgWzIsIDMsIDRdLCB0aGVpciBjb3ZhcmlhbmNlXG4gICAgLy8gZG9lcyBub3Qgc3VmZmVyIGJlY2F1c2Ugb2YgdGhlIGRpZmZlcmVuY2UgaW4gYWJzb2x1dGUgdmFsdWVzXG4gICAgdmFyIHhtZWFuID0gbWVhbih4KSxcbiAgICAgICAgeW1lYW4gPSBtZWFuKHkpLFxuICAgICAgICBzdW0gPSAwO1xuXG4gICAgLy8gZm9yIGVhY2ggcGFpciBvZiB2YWx1ZXMsIHRoZSBjb3ZhcmlhbmNlIGluY3JlYXNlcyB3aGVuIHRoZWlyXG4gICAgLy8gZGlmZmVyZW5jZSBmcm9tIHRoZSBtZWFuIGlzIGFzc29jaWF0ZWQgLSBpZiBib3RoIGFyZSB3ZWxsIGFib3ZlXG4gICAgLy8gb3IgaWYgYm90aCBhcmUgd2VsbCBiZWxvd1xuICAgIC8vIHRoZSBtZWFuLCB0aGUgY292YXJpYW5jZSBpbmNyZWFzZXMgc2lnbmlmaWNhbnRseS5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3VtICs9ICh4W2ldIC0geG1lYW4pICogKHlbaV0gLSB5bWVhbik7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyBCZXNzZWxzJyBDb3JyZWN0aW9uOiBhbiBhZGp1c3RtZW50IG1hZGUgdG8gc2FtcGxlIHN0YXRpc3RpY3NcbiAgICAvLyB0aGF0IGFsbG93cyBmb3IgdGhlIHJlZHVjZWQgZGVncmVlIG9mIGZyZWVkb20gZW50YWlsZWQgaW4gY2FsY3VsYXRpbmdcbiAgICAvLyB2YWx1ZXMgZnJvbSBzYW1wbGVzIHJhdGhlciB0aGFuIGNvbXBsZXRlIHBvcHVsYXRpb25zLlxuICAgIHZhciBiZXNzZWxzQ29ycmVjdGlvbiA9IHgubGVuZ3RoIC0gMTtcblxuICAgIC8vIHRoZSBjb3ZhcmlhbmNlIGlzIHdlaWdodGVkIGJ5IHRoZSBsZW5ndGggb2YgdGhlIGRhdGFzZXRzLlxuICAgIHJldHVybiBzdW0gLyBiZXNzZWxzQ29ycmVjdGlvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW1wbGVDb3ZhcmlhbmNlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3VtTnRoUG93ZXJEZXZpYXRpb25zID0gcmVxdWlyZSgnLi9zdW1fbnRoX3Bvd2VyX2RldmlhdGlvbnMnKTtcbnZhciBzYW1wbGVTdGFuZGFyZERldmlhdGlvbiA9IHJlcXVpcmUoJy4vc2FtcGxlX3N0YW5kYXJkX2RldmlhdGlvbicpO1xuXG4vKipcbiAqIFtTa2V3bmVzc10oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ta2V3bmVzcykgaXNcbiAqIGEgbWVhc3VyZSBvZiB0aGUgZXh0ZW50IHRvIHdoaWNoIGEgcHJvYmFiaWxpdHkgZGlzdHJpYnV0aW9uIG9mIGFcbiAqIHJlYWwtdmFsdWVkIHJhbmRvbSB2YXJpYWJsZSBcImxlYW5zXCIgdG8gb25lIHNpZGUgb2YgdGhlIG1lYW4uXG4gKiBUaGUgc2tld25lc3MgdmFsdWUgY2FuIGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLCBvciBldmVuIHVuZGVmaW5lZC5cbiAqXG4gKiBJbXBsZW1lbnRhdGlvbiBpcyBiYXNlZCBvbiB0aGUgYWRqdXN0ZWQgRmlzaGVyLVBlYXJzb24gc3RhbmRhcmRpemVkXG4gKiBtb21lbnQgY29lZmZpY2llbnQsIHdoaWNoIGlzIHRoZSB2ZXJzaW9uIGZvdW5kIGluIEV4Y2VsIGFuZCBzZXZlcmFsXG4gKiBzdGF0aXN0aWNhbCBwYWNrYWdlcyBpbmNsdWRpbmcgTWluaXRhYiwgU0FTIGFuZCBTUFNTLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybnMge251bWJlcn0gc2FtcGxlIHNrZXduZXNzXG4gKiBAZXhhbXBsZVxuICogdmFyIGRhdGEgPSBbMiwgNCwgNiwgMywgMV07XG4gKiBzYW1wbGVTa2V3bmVzcyhkYXRhKTsgLy89IDAuNTkwMTI4NjU2NFxuICovXG5mdW5jdGlvbiBzYW1wbGVTa2V3bmVzcyh4KSB7XG4gICAgLy8gVGhlIHNrZXduZXNzIG9mIGxlc3MgdGhhbiB0aHJlZSBhcmd1bWVudHMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA8IDMpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHZhciBuID0geC5sZW5ndGgsXG4gICAgICAgIGN1YmVkUyA9IE1hdGgucG93KHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uKHgpLCAzKSxcbiAgICAgICAgc3VtQ3ViZWREZXZpYXRpb25zID0gc3VtTnRoUG93ZXJEZXZpYXRpb25zKHgsIDMpO1xuXG4gICAgcmV0dXJuIG4gKiBzdW1DdWJlZERldmlhdGlvbnMgLyAoKG4gLSAxKSAqIChuIC0gMikgKiBjdWJlZFMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNhbXBsZVNrZXduZXNzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2FtcGxlVmFyaWFuY2UgPSByZXF1aXJlKCcuL3NhbXBsZV92YXJpYW5jZScpO1xuXG4vKipcbiAqIFRoZSBbc3RhbmRhcmQgZGV2aWF0aW9uXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0YW5kYXJkX2RldmlhdGlvbilcbiAqIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFyaWFuY2UuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSB4IGlucHV0IGFycmF5XG4gKiBAcmV0dXJucyB7bnVtYmVyfSBzYW1wbGUgc3RhbmRhcmQgZGV2aWF0aW9uXG4gKiBAZXhhbXBsZVxuICogc3Muc2FtcGxlU3RhbmRhcmREZXZpYXRpb24oWzIsIDQsIDQsIDQsIDUsIDUsIDcsIDldKTtcbiAqIC8vPSAyLjEzOFxuICovXG5mdW5jdGlvbiBzYW1wbGVTdGFuZGFyZERldmlhdGlvbih4KSB7XG4gICAgLy8gVGhlIHN0YW5kYXJkIGRldmlhdGlvbiBvZiBubyBudW1iZXJzIGlzIG51bGxcbiAgICBpZiAoeC5sZW5ndGggPD0gMSkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgcmV0dXJuIE1hdGguc3FydChzYW1wbGVWYXJpYW5jZSh4KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2FtcGxlU3RhbmRhcmREZXZpYXRpb247XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzdW1OdGhQb3dlckRldmlhdGlvbnMgPSByZXF1aXJlKCcuL3N1bV9udGhfcG93ZXJfZGV2aWF0aW9ucycpO1xuXG4vKlxuICogVGhlIFtzYW1wbGUgdmFyaWFuY2VdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1ZhcmlhbmNlI1NhbXBsZV92YXJpYW5jZSlcbiAqIGlzIHRoZSBzdW0gb2Ygc3F1YXJlZCBkZXZpYXRpb25zIGZyb20gdGhlIG1lYW4uIFRoZSBzYW1wbGUgdmFyaWFuY2VcbiAqIGlzIGRpc3Rpbmd1aXNoZWQgZnJvbSB0aGUgdmFyaWFuY2UgYnkgdGhlIHVzYWdlIG9mIFtCZXNzZWwncyBDb3JyZWN0aW9uXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CZXNzZWwnc19jb3JyZWN0aW9uKTpcbiAqIGluc3RlYWQgb2YgZGl2aWRpbmcgdGhlIHN1bSBvZiBzcXVhcmVkIGRldmlhdGlvbnMgYnkgdGhlIGxlbmd0aCBvZiB0aGUgaW5wdXQsXG4gKiBpdCBpcyBkaXZpZGVkIGJ5IHRoZSBsZW5ndGggbWludXMgb25lLiBUaGlzIGNvcnJlY3RzIHRoZSBiaWFzIGluIGVzdGltYXRpbmdcbiAqIGEgdmFsdWUgZnJvbSBhIHNldCB0aGF0IHlvdSBkb24ndCBrbm93IGlmIGZ1bGwuXG4gKlxuICogUmVmZXJlbmNlczpcbiAqICogW1dvbGZyYW0gTWF0aFdvcmxkIG9uIFNhbXBsZSBWYXJpYW5jZV0oaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9TYW1wbGVWYXJpYW5jZS5odG1sKVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dCBhcnJheVxuICogQHJldHVybiB7bnVtYmVyfSBzYW1wbGUgdmFyaWFuY2VcbiAqIEBleGFtcGxlXG4gKiBzYW1wbGVWYXJpYW5jZShbMSwgMiwgMywgNCwgNV0pOyAvLz0gMi41XG4gKi9cbmZ1bmN0aW9uIHNhbXBsZVZhcmlhbmNlKHgpIHtcbiAgICAvLyBUaGUgdmFyaWFuY2Ugb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoIDw9IDEpIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHZhciBzdW1TcXVhcmVkRGV2aWF0aW9uc1ZhbHVlID0gc3VtTnRoUG93ZXJEZXZpYXRpb25zKHgsIDIpO1xuXG4gICAgLy8gdGhpcyBpcyBCZXNzZWxzJyBDb3JyZWN0aW9uOiBhbiBhZGp1c3RtZW50IG1hZGUgdG8gc2FtcGxlIHN0YXRpc3RpY3NcbiAgICAvLyB0aGF0IGFsbG93cyBmb3IgdGhlIHJlZHVjZWQgZGVncmVlIG9mIGZyZWVkb20gZW50YWlsZWQgaW4gY2FsY3VsYXRpbmdcbiAgICAvLyB2YWx1ZXMgZnJvbSBzYW1wbGVzIHJhdGhlciB0aGFuIGNvbXBsZXRlIHBvcHVsYXRpb25zLlxuICAgIHZhciBiZXNzZWxzQ29ycmVjdGlvbiA9IHgubGVuZ3RoIC0gMTtcblxuICAgIC8vIEZpbmQgdGhlIG1lYW4gdmFsdWUgb2YgdGhhdCBsaXN0XG4gICAgcmV0dXJuIHN1bVNxdWFyZWREZXZpYXRpb25zVmFsdWUgLyBiZXNzZWxzQ29ycmVjdGlvbjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzYW1wbGVWYXJpYW5jZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNodWZmbGVJblBsYWNlID0gcmVxdWlyZSgnLi9zaHVmZmxlX2luX3BsYWNlJyk7XG5cbi8qXG4gKiBBIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXIlRTIlODAlOTNZYXRlc19zaHVmZmxlKVxuICogaXMgYSBmYXN0IHdheSB0byBjcmVhdGUgYSByYW5kb20gcGVybXV0YXRpb24gb2YgYSBmaW5pdGUgc2V0LiBUaGlzIGlzXG4gKiBhIGZ1bmN0aW9uIGFyb3VuZCBgc2h1ZmZsZV9pbl9wbGFjZWAgdGhhdCBhZGRzIHRoZSBndWFyYW50ZWUgdGhhdFxuICogaXQgd2lsbCBub3QgbW9kaWZ5IGl0cyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzYW1wbGUgYW4gYXJyYXkgb2YgYW55IGtpbmQgb2YgZWxlbWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3JhbmRvbVNvdXJjZT1NYXRoLnJhbmRvbV0gYW4gb3B0aW9uYWwgZW50cm9weSBzb3VyY2VcbiAqIEByZXR1cm4ge0FycmF5fSBzaHVmZmxlZCB2ZXJzaW9uIG9mIGlucHV0XG4gKiBAZXhhbXBsZVxuICogdmFyIHNodWZmbGVkID0gc2h1ZmZsZShbMSwgMiwgMywgNF0pO1xuICogc2h1ZmZsZWQ7IC8vID0gWzIsIDMsIDEsIDRdIG9yIGFueSBvdGhlciByYW5kb20gcGVybXV0YXRpb25cbiAqL1xuZnVuY3Rpb24gc2h1ZmZsZShzYW1wbGUsIHJhbmRvbVNvdXJjZSkge1xuICAgIC8vIHNsaWNlIHRoZSBvcmlnaW5hbCBhcnJheSBzbyB0aGF0IGl0IGlzIG5vdCBtb2RpZmllZFxuICAgIHNhbXBsZSA9IHNhbXBsZS5zbGljZSgpO1xuXG4gICAgLy8gYW5kIHRoZW4gc2h1ZmZsZSB0aGF0IHNoYWxsb3ctY29waWVkIGFycmF5LCBpbiBwbGFjZVxuICAgIHJldHVybiBzaHVmZmxlSW5QbGFjZShzYW1wbGUuc2xpY2UoKSwgcmFuZG9tU291cmNlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaHVmZmxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICogQSBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVyJUUyJTgwJTkzWWF0ZXNfc2h1ZmZsZSlcbiAqIGluLXBsYWNlIC0gd2hpY2ggbWVhbnMgdGhhdCBpdCAqKndpbGwgY2hhbmdlIHRoZSBvcmRlciBvZiB0aGUgb3JpZ2luYWxcbiAqIGFycmF5IGJ5IHJlZmVyZW5jZSoqLlxuICpcbiAqIFRoaXMgaXMgYW4gYWxnb3JpdGhtIHRoYXQgZ2VuZXJhdGVzIGEgcmFuZG9tIFtwZXJtdXRhdGlvbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUGVybXV0YXRpb24pXG4gKiBvZiBhIHNldC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzYW1wbGUgaW5wdXQgYXJyYXlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtyYW5kb21Tb3VyY2U9TWF0aC5yYW5kb21dIGFuIG9wdGlvbmFsIHNvdXJjZSBvZiBlbnRyb3B5XG4gKiBAcmV0dXJucyB7QXJyYXl9IHNhbXBsZVxuICogQGV4YW1wbGVcbiAqIHZhciBzYW1wbGUgPSBbMSwgMiwgMywgNF07XG4gKiBzaHVmZmxlSW5QbGFjZShzYW1wbGUpO1xuICogLy8gc2FtcGxlIGlzIHNodWZmbGVkIHRvIGEgdmFsdWUgbGlrZSBbMiwgMSwgNCwgM11cbiAqL1xuZnVuY3Rpb24gc2h1ZmZsZUluUGxhY2Uoc2FtcGxlLCByYW5kb21Tb3VyY2UpIHtcblxuICAgIC8vIGEgY3VzdG9tIHJhbmRvbSBudW1iZXIgc291cmNlIGNhbiBiZSBwcm92aWRlZCBpZiB5b3Ugd2FudCB0byB1c2VcbiAgICAvLyBhIGZpeGVkIHNlZWQgb3IgYW5vdGhlciByYW5kb20gbnVtYmVyIGdlbmVyYXRvciwgbGlrZVxuICAgIC8vIFtyYW5kb20tanNdKGh0dHBzOi8vd3d3Lm5wbWpzLm9yZy9wYWNrYWdlL3JhbmRvbS1qcylcbiAgICByYW5kb21Tb3VyY2UgPSByYW5kb21Tb3VyY2UgfHwgTWF0aC5yYW5kb207XG5cbiAgICAvLyBzdG9yZSB0aGUgY3VycmVudCBsZW5ndGggb2YgdGhlIHNhbXBsZSB0byBkZXRlcm1pbmVcbiAgICAvLyB3aGVuIG5vIGVsZW1lbnRzIHJlbWFpbiB0byBzaHVmZmxlLlxuICAgIHZhciBsZW5ndGggPSBzYW1wbGUubGVuZ3RoO1xuXG4gICAgLy8gdGVtcG9yYXJ5IGlzIHVzZWQgdG8gaG9sZCBhbiBpdGVtIHdoZW4gaXQgaXMgYmVpbmdcbiAgICAvLyBzd2FwcGVkIGJldHdlZW4gaW5kaWNlcy5cbiAgICB2YXIgdGVtcG9yYXJ5O1xuXG4gICAgLy8gVGhlIGluZGV4IHRvIHN3YXAgYXQgZWFjaCBzdGFnZS5cbiAgICB2YXIgaW5kZXg7XG5cbiAgICAvLyBXaGlsZSB0aGVyZSBhcmUgc3RpbGwgaXRlbXMgdG8gc2h1ZmZsZVxuICAgIHdoaWxlIChsZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIGNob3NlIGEgcmFuZG9tIGluZGV4IHdpdGhpbiB0aGUgc3Vic2V0IG9mIHRoZSBhcnJheVxuICAgICAgICAvLyB0aGF0IGlzIG5vdCB5ZXQgc2h1ZmZsZWRcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKHJhbmRvbVNvdXJjZSgpICogbGVuZ3RoLS0pO1xuXG4gICAgICAgIC8vIHN0b3JlIHRoZSB2YWx1ZSB0aGF0IHdlJ2xsIG1vdmUgdGVtcG9yYXJpbHlcbiAgICAgICAgdGVtcG9yYXJ5ID0gc2FtcGxlW2xlbmd0aF07XG5cbiAgICAgICAgLy8gc3dhcCB0aGUgdmFsdWUgYXQgYHNhbXBsZVtsZW5ndGhdYCB3aXRoIGBzYW1wbGVbaW5kZXhdYFxuICAgICAgICBzYW1wbGVbbGVuZ3RoXSA9IHNhbXBsZVtpbmRleF07XG4gICAgICAgIHNhbXBsZVtpbmRleF0gPSB0ZW1wb3Jhcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNhbXBsZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaHVmZmxlSW5QbGFjZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBGb3IgYSBzb3J0ZWQgaW5wdXQsIGNvdW50aW5nIHRoZSBudW1iZXIgb2YgdW5pcXVlIHZhbHVlc1xuICogaXMgcG9zc2libGUgaW4gY29uc3RhbnQgdGltZSBhbmQgY29uc3RhbnQgbWVtb3J5LiBUaGlzIGlzXG4gKiBhIHNpbXBsZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgYWxnb3JpdGhtLlxuICpcbiAqIFZhbHVlcyBhcmUgY29tcGFyZWQgd2l0aCBgPT09YCwgc28gb2JqZWN0cyBhbmQgbm9uLXByaW1pdGl2ZSBvYmplY3RzXG4gKiBhcmUgbm90IGhhbmRsZWQgaW4gYW55IHNwZWNpYWwgd2F5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGlucHV0IGFuIGFycmF5IG9mIHByaW1pdGl2ZSB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBjb3VudCBvZiB1bmlxdWUgdmFsdWVzXG4gKiBAZXhhbXBsZVxuICogc29ydGVkVW5pcXVlQ291bnQoWzEsIDIsIDNdKTsgLy8gM1xuICogc29ydGVkVW5pcXVlQ291bnQoWzEsIDEsIDFdKTsgLy8gMVxuICovXG5mdW5jdGlvbiBzb3J0ZWRVbmlxdWVDb3VudChpbnB1dCkge1xuICAgIHZhciB1bmlxdWVWYWx1ZUNvdW50ID0gMCxcbiAgICAgICAgbGFzdFNlZW5WYWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlucHV0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpID09PSAwIHx8IGlucHV0W2ldICE9PSBsYXN0U2VlblZhbHVlKSB7XG4gICAgICAgICAgICBsYXN0U2VlblZhbHVlID0gaW5wdXRbaV07XG4gICAgICAgICAgICB1bmlxdWVWYWx1ZUNvdW50Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuaXF1ZVZhbHVlQ291bnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc29ydGVkVW5pcXVlQ291bnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB2YXJpYW5jZSA9IHJlcXVpcmUoJy4vdmFyaWFuY2UnKTtcblxuLyoqXG4gKiBUaGUgW3N0YW5kYXJkIGRldmlhdGlvbl0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdGFuZGFyZF9kZXZpYXRpb24pXG4gKiBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhcmlhbmNlLiBJdCdzIHVzZWZ1bCBmb3IgbWVhc3VyaW5nIHRoZSBhbW91bnRcbiAqIG9mIHZhcmlhdGlvbiBvciBkaXNwZXJzaW9uIGluIGEgc2V0IG9mIHZhbHVlcy5cbiAqXG4gKiBTdGFuZGFyZCBkZXZpYXRpb24gaXMgb25seSBhcHByb3ByaWF0ZSBmb3IgZnVsbC1wb3B1bGF0aW9uIGtub3dsZWRnZTogZm9yXG4gKiBzYW1wbGVzIG9mIGEgcG9wdWxhdGlvbiwge0BsaW5rIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9ufSBpc1xuICogbW9yZSBhcHByb3ByaWF0ZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggaW5wdXRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHN0YW5kYXJkIGRldmlhdGlvblxuICogQGV4YW1wbGVcbiAqIHZhciBzY29yZXMgPSBbMiwgNCwgNCwgNCwgNSwgNSwgNywgOV07XG4gKiB2YXJpYW5jZShzY29yZXMpOyAvLz0gNFxuICogc3RhbmRhcmREZXZpYXRpb24oc2NvcmVzKTsgLy89IDJcbiAqL1xuZnVuY3Rpb24gc3RhbmRhcmREZXZpYXRpb24oeCkge1xuICAgIC8vIFRoZSBzdGFuZGFyZCBkZXZpYXRpb24gb2Ygbm8gbnVtYmVycyBpcyBudWxsXG4gICAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG5cbiAgICByZXR1cm4gTWF0aC5zcXJ0KHZhcmlhbmNlKHgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFuZGFyZERldmlhdGlvbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNRUlRfMlBJID0gTWF0aC5zcXJ0KDIgKiBNYXRoLlBJKTtcblxuZnVuY3Rpb24gY3VtdWxhdGl2ZURpc3RyaWJ1dGlvbih6KSB7XG4gICAgdmFyIHN1bSA9IHosXG4gICAgICAgIHRtcCA9IHo7XG5cbiAgICAvLyAxNSBpdGVyYXRpb25zIGFyZSBlbm91Z2ggZm9yIDQtZGlnaXQgcHJlY2lzaW9uXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAxNTsgaSsrKSB7XG4gICAgICAgIHRtcCAqPSB6ICogeiAvICgyICogaSArIDEpO1xuICAgICAgICBzdW0gKz0gdG1wO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoMC41ICsgKHN1bSAvIFNRUlRfMlBJKSAqIE1hdGguZXhwKC16ICogeiAvIDIpKSAqIDFlNCkgLyAxZTQ7XG59XG5cbi8qKlxuICogQSBzdGFuZGFyZCBub3JtYWwgdGFibGUsIGFsc28gY2FsbGVkIHRoZSB1bml0IG5vcm1hbCB0YWJsZSBvciBaIHRhYmxlLFxuICogaXMgYSBtYXRoZW1hdGljYWwgdGFibGUgZm9yIHRoZSB2YWx1ZXMgb2YgzqYgKHBoaSksIHdoaWNoIGFyZSB0aGUgdmFsdWVzIG9mXG4gKiB0aGUgY3VtdWxhdGl2ZSBkaXN0cmlidXRpb24gZnVuY3Rpb24gb2YgdGhlIG5vcm1hbCBkaXN0cmlidXRpb24uXG4gKiBJdCBpcyB1c2VkIHRvIGZpbmQgdGhlIHByb2JhYmlsaXR5IHRoYXQgYSBzdGF0aXN0aWMgaXMgb2JzZXJ2ZWQgYmVsb3csXG4gKiBhYm92ZSwgb3IgYmV0d2VlbiB2YWx1ZXMgb24gdGhlIHN0YW5kYXJkIG5vcm1hbCBkaXN0cmlidXRpb24sIGFuZCBieVxuICogZXh0ZW5zaW9uLCBhbnkgbm9ybWFsIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBUaGUgcHJvYmFiaWxpdGllcyBhcmUgY2FsY3VsYXRlZCB1c2luZyB0aGVcbiAqIFtDdW11bGF0aXZlIGRpc3RyaWJ1dGlvbiBmdW5jdGlvbl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTm9ybWFsX2Rpc3RyaWJ1dGlvbiNDdW11bGF0aXZlX2Rpc3RyaWJ1dGlvbl9mdW5jdGlvbikuXG4gKiBUaGUgdGFibGUgdXNlZCBpcyB0aGUgY3VtdWxhdGl2ZSwgYW5kIG5vdCBjdW11bGF0aXZlIGZyb20gMCB0byBtZWFuXG4gKiAoZXZlbiB0aG91Z2ggdGhlIGxhdHRlciBoYXMgNSBkaWdpdHMgcHJlY2lzaW9uLCBpbnN0ZWFkIG9mIDQpLlxuICovXG52YXIgc3RhbmRhcmROb3JtYWxUYWJsZSA9IFtdO1xuXG5mb3IgKHZhciB6ID0gMDsgeiA8PSAzLjA5OyB6ICs9IDAuMDEpIHtcbiAgICBzdGFuZGFyZE5vcm1hbFRhYmxlLnB1c2goY3VtdWxhdGl2ZURpc3RyaWJ1dGlvbih6KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhbmRhcmROb3JtYWxUYWJsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgW3N1bV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3VtbWF0aW9uKSBvZiBhbiBhcnJheVxuICogaXMgdGhlIHJlc3VsdCBvZiBhZGRpbmcgYWxsIG51bWJlcnMgdG9nZXRoZXIsIHN0YXJ0aW5nIGZyb20gemVyby5cbiAqXG4gKiBUaGlzIHJ1bnMgb24gYE8obilgLCBsaW5lYXIgdGltZSBpbiByZXNwZWN0IHRvIHRoZSBhcnJheVxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geCBpbnB1dFxuICogQHJldHVybiB7bnVtYmVyfSBzdW0gb2YgYWxsIGlucHV0IG51bWJlcnNcbiAqIEBleGFtcGxlXG4gKiBjb25zb2xlLmxvZyhzdW0oWzEsIDIsIDNdKSk7IC8vIDZcbiAqL1xuZnVuY3Rpb24gc3VtKHgpIHtcbiAgICB2YXIgdmFsdWUgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSArPSB4W2ldO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3VtO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVhbiA9IHJlcXVpcmUoJy4vbWVhbicpO1xuXG4vKipcbiAqIFRoZSBzdW0gb2YgZGV2aWF0aW9ucyB0byB0aGUgTnRoIHBvd2VyLlxuICogV2hlbiBuPTIgaXQncyB0aGUgc3VtIG9mIHNxdWFyZWQgZGV2aWF0aW9ucy5cbiAqIFdoZW4gbj0zIGl0J3MgdGhlIHN1bSBvZiBjdWJlZCBkZXZpYXRpb25zLlxuICpcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0geFxuICogQHBhcmFtIHtudW1iZXJ9IG4gcG93ZXJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHN1bSBvZiBudGggcG93ZXIgZGV2aWF0aW9uc1xuICogQGV4YW1wbGVcbiAqIHZhciBpbnB1dCA9IFsxLCAyLCAzXTtcbiAqIC8vIHNpbmNlIHRoZSB2YXJpYW5jZSBvZiBhIHNldCBpcyB0aGUgbWVhbiBzcXVhcmVkXG4gKiAvLyBkZXZpYXRpb25zLCB3ZSBjYW4gY2FsY3VsYXRlIHRoYXQgd2l0aCBzdW1OdGhQb3dlckRldmlhdGlvbnM6XG4gKiB2YXIgdmFyaWFuY2UgPSBzdW1OdGhQb3dlckRldmlhdGlvbnMoaW5wdXQpIC8gaW5wdXQubGVuZ3RoO1xuICovXG5mdW5jdGlvbiBzdW1OdGhQb3dlckRldmlhdGlvbnMoeCwgbikge1xuICAgIHZhciBtZWFuVmFsdWUgPSBtZWFuKHgpLFxuICAgICAgICBzdW0gPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBNYXRoLnBvdyh4W2ldIC0gbWVhblZhbHVlLCBuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VtO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN1bU50aFBvd2VyRGV2aWF0aW9ucztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN0YW5kYXJkRGV2aWF0aW9uID0gcmVxdWlyZSgnLi9zdGFuZGFyZF9kZXZpYXRpb24nKTtcbnZhciBtZWFuID0gcmVxdWlyZSgnLi9tZWFuJyk7XG5cbi8qKlxuICogVGhpcyBpcyB0byBjb21wdXRlIFthIG9uZS1zYW1wbGUgdC10ZXN0XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TdHVkZW50JTI3c190LXRlc3QjT25lLXNhbXBsZV90LXRlc3QpLCBjb21wYXJpbmcgdGhlIG1lYW5cbiAqIG9mIGEgc2FtcGxlIHRvIGEga25vd24gdmFsdWUsIHguXG4gKlxuICogaW4gdGhpcyBjYXNlLCB3ZSdyZSB0cnlpbmcgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlXG4gKiBwb3B1bGF0aW9uIG1lYW4gaXMgZXF1YWwgdG8gdGhlIHZhbHVlIHRoYXQgd2Uga25vdywgd2hpY2ggaXMgYHhgXG4gKiBoZXJlLiB1c3VhbGx5IHRoZSByZXN1bHRzIGhlcmUgYXJlIHVzZWQgdG8gbG9vayB1cCBhXG4gKiBbcC12YWx1ZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9QLXZhbHVlKSwgd2hpY2gsIGZvclxuICogYSBjZXJ0YWluIGxldmVsIG9mIHNpZ25pZmljYW5jZSwgd2lsbCBsZXQgeW91IGRldGVybWluZSB0aGF0IHRoZVxuICogbnVsbCBoeXBvdGhlc2lzIGNhbiBvciBjYW5ub3QgYmUgcmVqZWN0ZWQuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBzYW1wbGUgYW4gYXJyYXkgb2YgbnVtYmVycyBhcyBpbnB1dFxuICogQHBhcmFtIHtudW1iZXJ9IHggZXhwZWN0ZWQgdmFsZSBvZiB0aGUgcG9wdWxhdGlvbiBtZWFuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB2YWx1ZVxuICogQGV4YW1wbGVcbiAqIHRUZXN0KFsxLCAyLCAzLCA0LCA1LCA2XSwgMy4zODUpOyAvLz0gMC4xNjQ5NDE1NFxuICovXG5mdW5jdGlvbiB0VGVzdChzYW1wbGUsIHgpIHtcbiAgICAvLyBUaGUgbWVhbiBvZiB0aGUgc2FtcGxlXG4gICAgdmFyIHNhbXBsZU1lYW4gPSBtZWFuKHNhbXBsZSk7XG5cbiAgICAvLyBUaGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIHRoZSBzYW1wbGVcbiAgICB2YXIgc2QgPSBzdGFuZGFyZERldmlhdGlvbihzYW1wbGUpO1xuXG4gICAgLy8gU3F1YXJlIHJvb3QgdGhlIGxlbmd0aCBvZiB0aGUgc2FtcGxlXG4gICAgdmFyIHJvb3ROID0gTWF0aC5zcXJ0KHNhbXBsZS5sZW5ndGgpO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUga25vd24gdmFsdWUgYWdhaW5zdCB0aGUgc2FtcGxlLFxuICAgIC8vIHJldHVybmluZyB0aGUgdCB2YWx1ZVxuICAgIHJldHVybiAoc2FtcGxlTWVhbiAtIHgpIC8gKHNkIC8gcm9vdE4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRUZXN0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWVhbiA9IHJlcXVpcmUoJy4vbWVhbicpO1xudmFyIHNhbXBsZVZhcmlhbmNlID0gcmVxdWlyZSgnLi9zYW1wbGVfdmFyaWFuY2UnKTtcblxuLyoqXG4gKiBUaGlzIGlzIHRvIGNvbXB1dGUgW3R3byBzYW1wbGUgdC10ZXN0XShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0dWRlbnQnc190LXRlc3QpLlxuICogVGVzdHMgd2hldGhlciBcIm1lYW4oWCktbWVhbihZKSA9IGRpZmZlcmVuY2VcIiwgKFxuICogaW4gdGhlIG1vc3QgY29tbW9uIGNhc2UsIHdlIG9mdGVuIGhhdmUgYGRpZmZlcmVuY2UgPT0gMGAgdG8gdGVzdCBpZiB0d28gc2FtcGxlc1xuICogYXJlIGxpa2VseSB0byBiZSB0YWtlbiBmcm9tIHBvcHVsYXRpb25zIHdpdGggdGhlIHNhbWUgbWVhbiB2YWx1ZSkgd2l0aFxuICogbm8gcHJpb3Iga25vd2xlZGdlIG9uIHN0YW5kYXJkIGRldmlhdGlvbnMgb2YgYm90aCBzYW1wbGVzXG4gKiBvdGhlciB0aGFuIHRoZSBmYWN0IHRoYXQgdGhleSBoYXZlIHRoZSBzYW1lIHN0YW5kYXJkIGRldmlhdGlvbi5cbiAqXG4gKiBVc3VhbGx5IHRoZSByZXN1bHRzIGhlcmUgYXJlIHVzZWQgdG8gbG9vayB1cCBhXG4gKiBbcC12YWx1ZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9QLXZhbHVlKSwgd2hpY2gsIGZvclxuICogYSBjZXJ0YWluIGxldmVsIG9mIHNpZ25pZmljYW5jZSwgd2lsbCBsZXQgeW91IGRldGVybWluZSB0aGF0IHRoZVxuICogbnVsbCBoeXBvdGhlc2lzIGNhbiBvciBjYW5ub3QgYmUgcmVqZWN0ZWQuXG4gKlxuICogYGRpZmZgIGNhbiBiZSBvbWl0dGVkIGlmIGl0IGVxdWFscyAwLlxuICpcbiAqIFtUaGlzIGlzIHVzZWQgdG8gY29uZmlybSBvciBkZW55XShodHRwOi8vd3d3Lm1vbmFyY2hsYWIub3JnL0xhYi9SZXNlYXJjaC9TdGF0cy8yU2FtcGxlVC5hc3B4KVxuICogYSBudWxsIGh5cG90aGVzaXMgdGhhdCB0aGUgdHdvIHBvcHVsYXRpb25zIHRoYXQgaGF2ZSBiZWVuIHNhbXBsZWQgaW50b1xuICogYHNhbXBsZVhgIGFuZCBgc2FtcGxlWWAgYXJlIGVxdWFsIHRvIGVhY2ggb3RoZXIuXG4gKlxuICogQHBhcmFtIHtBcnJheTxudW1iZXI+fSBzYW1wbGVYIGEgc2FtcGxlIGFzIGFuIGFycmF5IG9mIG51bWJlcnNcbiAqIEBwYXJhbSB7QXJyYXk8bnVtYmVyPn0gc2FtcGxlWSBhIHNhbXBsZSBhcyBhbiBhcnJheSBvZiBudW1iZXJzXG4gKiBAcGFyYW0ge251bWJlcn0gW2RpZmZlcmVuY2U9MF1cbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRlc3QgcmVzdWx0XG4gKiBAZXhhbXBsZVxuICogc3MudFRlc3RUd29TYW1wbGUoWzEsIDIsIDMsIDRdLCBbMywgNCwgNSwgNl0sIDApOyAvLz0gLTIuMTkwODkwMjMwMDIwNjY0M1xuICovXG5mdW5jdGlvbiB0VGVzdFR3b1NhbXBsZShzYW1wbGVYLCBzYW1wbGVZLCBkaWZmZXJlbmNlKSB7XG4gICAgdmFyIG4gPSBzYW1wbGVYLmxlbmd0aCxcbiAgICAgICAgbSA9IHNhbXBsZVkubGVuZ3RoO1xuXG4gICAgLy8gSWYgZWl0aGVyIHNhbXBsZSBkb2Vzbid0IGFjdHVhbGx5IGhhdmUgYW55IHZhbHVlcywgd2UgY2FuJ3RcbiAgICAvLyBjb21wdXRlIHRoaXMgYXQgYWxsLCBzbyB3ZSByZXR1cm4gYG51bGxgLlxuICAgIGlmICghbiB8fCAhbSkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gZGVmYXVsdCBkaWZmZXJlbmNlIChtdSkgaXMgemVyb1xuICAgIGlmICghZGlmZmVyZW5jZSkge1xuICAgICAgICBkaWZmZXJlbmNlID0gMDtcbiAgICB9XG5cbiAgICB2YXIgbWVhblggPSBtZWFuKHNhbXBsZVgpLFxuICAgICAgICBtZWFuWSA9IG1lYW4oc2FtcGxlWSk7XG5cbiAgICB2YXIgd2VpZ2h0ZWRWYXJpYW5jZSA9ICgobiAtIDEpICogc2FtcGxlVmFyaWFuY2Uoc2FtcGxlWCkgK1xuICAgICAgICAobSAtIDEpICogc2FtcGxlVmFyaWFuY2Uoc2FtcGxlWSkpIC8gKG4gKyBtIC0gMik7XG5cbiAgICByZXR1cm4gKG1lYW5YIC0gbWVhblkgLSBkaWZmZXJlbmNlKSAvXG4gICAgICAgIE1hdGguc3FydCh3ZWlnaHRlZFZhcmlhbmNlICogKDEgLyBuICsgMSAvIG0pKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0VGVzdFR3b1NhbXBsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHN1bU50aFBvd2VyRGV2aWF0aW9ucyA9IHJlcXVpcmUoJy4vc3VtX250aF9wb3dlcl9kZXZpYXRpb25zJyk7XG5cbi8qKlxuICogVGhlIFt2YXJpYW5jZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9WYXJpYW5jZSlcbiAqIGlzIHRoZSBzdW0gb2Ygc3F1YXJlZCBkZXZpYXRpb25zIGZyb20gdGhlIG1lYW4uXG4gKlxuICogVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB2YXJpYW5jZSwgbm90IHNhbXBsZSB2YXJpYW5jZTpcbiAqIHNlZSB0aGUgYHNhbXBsZVZhcmlhbmNlYCBtZXRob2QgaWYgeW91IHdhbnQgYSBzYW1wbGUgbWVhc3VyZS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PG51bWJlcj59IHggYSBwb3B1bGF0aW9uXG4gKiBAcmV0dXJucyB7bnVtYmVyfSB2YXJpYW5jZTogYSB2YWx1ZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gemVyby5cbiAqIHplcm8gaW5kaWNhdGVzIHRoYXQgYWxsIHZhbHVlcyBhcmUgaWRlbnRpY2FsLlxuICogQGV4YW1wbGVcbiAqIHNzLnZhcmlhbmNlKFsxLCAyLCAzLCA0LCA1LCA2XSk7IC8vPSAyLjkxN1xuICovXG5mdW5jdGlvbiB2YXJpYW5jZSh4KSB7XG4gICAgLy8gVGhlIHZhcmlhbmNlIG9mIG5vIG51bWJlcnMgaXMgbnVsbFxuICAgIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgLy8gRmluZCB0aGUgbWVhbiBvZiBzcXVhcmVkIGRldmlhdGlvbnMgYmV0d2VlbiB0aGVcbiAgICAvLyBtZWFuIHZhbHVlIGFuZCBlYWNoIHZhbHVlLlxuICAgIHJldHVybiBzdW1OdGhQb3dlckRldmlhdGlvbnMoeCwgMikgLyB4Lmxlbmd0aDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB2YXJpYW5jZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBUaGUgW1otU2NvcmUsIG9yIFN0YW5kYXJkIFNjb3JlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N0YW5kYXJkX3Njb3JlKS5cbiAqXG4gKiBUaGUgc3RhbmRhcmQgc2NvcmUgaXMgdGhlIG51bWJlciBvZiBzdGFuZGFyZCBkZXZpYXRpb25zIGFuIG9ic2VydmF0aW9uXG4gKiBvciBkYXR1bSBpcyBhYm92ZSBvciBiZWxvdyB0aGUgbWVhbi4gVGh1cywgYSBwb3NpdGl2ZSBzdGFuZGFyZCBzY29yZVxuICogcmVwcmVzZW50cyBhIGRhdHVtIGFib3ZlIHRoZSBtZWFuLCB3aGlsZSBhIG5lZ2F0aXZlIHN0YW5kYXJkIHNjb3JlXG4gKiByZXByZXNlbnRzIGEgZGF0dW0gYmVsb3cgdGhlIG1lYW4uIEl0IGlzIGEgZGltZW5zaW9ubGVzcyBxdWFudGl0eVxuICogb2J0YWluZWQgYnkgc3VidHJhY3RpbmcgdGhlIHBvcHVsYXRpb24gbWVhbiBmcm9tIGFuIGluZGl2aWR1YWwgcmF3XG4gKiBzY29yZSBhbmQgdGhlbiBkaXZpZGluZyB0aGUgZGlmZmVyZW5jZSBieSB0aGUgcG9wdWxhdGlvbiBzdGFuZGFyZFxuICogZGV2aWF0aW9uLlxuICpcbiAqIFRoZSB6LXNjb3JlIGlzIG9ubHkgZGVmaW5lZCBpZiBvbmUga25vd3MgdGhlIHBvcHVsYXRpb24gcGFyYW1ldGVycztcbiAqIGlmIG9uZSBvbmx5IGhhcyBhIHNhbXBsZSBzZXQsIHRoZW4gdGhlIGFuYWxvZ291cyBjb21wdXRhdGlvbiB3aXRoXG4gKiBzYW1wbGUgbWVhbiBhbmQgc2FtcGxlIHN0YW5kYXJkIGRldmlhdGlvbiB5aWVsZHMgdGhlXG4gKiBTdHVkZW50J3MgdC1zdGF0aXN0aWMuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEBwYXJhbSB7bnVtYmVyfSBtZWFuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhbmRhcmREZXZpYXRpb25cbiAqIEByZXR1cm4ge251bWJlcn0geiBzY29yZVxuICogQGV4YW1wbGVcbiAqIHNzLnpTY29yZSg3OCwgODAsIDUpOyAvLz0gLTAuNFxuICovXG5mdW5jdGlvbiB6U2NvcmUoeCwgbWVhbiwgc3RhbmRhcmREZXZpYXRpb24pIHtcbiAgICByZXR1cm4gKHggLSBtZWFuKSAvIHN0YW5kYXJkRGV2aWF0aW9uO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHpTY29yZTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG5cbi8vY2VsbC5qc1xuXG5jbGFzcyBDZWxsIHtcbiAgY29uc3RydWN0b3IobSwgciwgZywgYikge1xuICAgIHRoaXMubW9ydG9uID0gbTtcbiAgICB0aGlzLnIgPSByO1xuICAgIHRoaXMuZyA9IGc7XG4gICAgdGhpcy5iID0gYjtcbiAgICB0aGlzLmx1bWluYW5jZSA9ICggMC4yOTg5MTIgKiByICsgMC41ODY2MTEgKiBnICsgMC4xMTQ0NzggKiBiICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDZWxsO1xuIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8vY2VsbHMuanNcblxudmFyIENlbGwgPSByZXF1aXJlKCcuL2NlbGwnKTtcbnZhciBNb3J0b24gPSByZXF1aXJlKCcuL21vcnRvbicpO1xuXG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xudmFyIHJvdW5kID0gTWF0aC5yb3VuZDtcbnZhciBwb3cgPSBNYXRoLnBvdztcblxuY2xhc3MgQ2VsbHMge1xuICBjb25zdHJ1Y3RvcihkYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgaWYgKGRhdGEubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkYXRhIGxlbmd0aCBpbmNvcnJlY3QuJylcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gW107XG4gICAgdGhpcy5tZW0gPSB7fTtcbiAgICB0aGlzLnJlZ2lzdGVyKGRhdGEsIHdpZHRoLCBoZWlnaHQpO1xuICB9XG4gIHJlZ2lzdGVyKGRhdGEsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgeCA9IDA7XG4gICAgdmFyIHkgPSAwO1xuICAgIHZhciB1ID0gcG93KDIsIE1vcnRvbi5NQVhfTFZMKTtcbiAgICBjb25zb2xlLnRpbWUoJ3JlYWQgZGF0YScpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkgKz0gNCkge1xuICAgICAgbGV0IHIgPSBkYXRhW2ldO1xuICAgICAgbGV0IGcgPSBkYXRhW2kgKyAxXTtcbiAgICAgIGxldCBiID0gZGF0YVtpICsgMl07XG4gICAgICBsZXQgX3ggPSBmbG9vcih4IC8gd2lkdGggKiB1KTtcbiAgICAgIGxldCBfeSA9IGZsb29yKHkgLyBoZWlnaHQgKiB1KTtcbiAgICAgIGxldCBtb3J0b24gPSBNb3J0b24uY3JlYXRlKF94LCBfeSk7XG4gICAgICB0aGlzLmRhdGEucHVzaChuZXcgQ2VsbChtb3J0b24sIHIsIGcsIGIpKTtcblxuICAgICAgaWYgKCsreCA9PT0gd2lkdGgpIHtcbiAgICAgICAgeCA9IDA7XG4gICAgICAgIHkrKztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS50aW1lRW5kKCdyZWFkIGRhdGEnKTtcbiAgfVxuICBmaW5kKGx2bCwgbW9ydG9uKSB7XG4gICAgbGV0IGZpZWxkID0gdGhpcy5kYXRhO1xuICAgIGxldCByZXN1bHQ7XG4gICAgaWYgKHRoaXMubWVtW2x2bCAtIDFdICYmIHRoaXMubWVtW2x2bCAtIDFdW21vcnRvbiA+PiAyXSkge1xuICAgICAgZmllbGQgPSB0aGlzLm1lbVtsdmwgLSAxXVttb3J0b24gPj4gMl07XG4gICAgfVxuICAgIHJlc3VsdCA9IGZpZWxkLmZpbHRlcigoY2VsbCkgPT4ge1xuICAgICAgcmV0dXJuIE1vcnRvbi5iZWxvbmdzKGNlbGwubW9ydG9uLCBtb3J0b24sIGx2bCk7XG4gICAgfSk7XG4gICAgaWYgKCF0aGlzLm1lbVtsdmxdKSB7XG4gICAgICB0aGlzLm1lbVtsdmxdID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5tZW1bbHZsXVttb3J0b25dKSB7XG4gICAgICB0aGlzLm1lbVtsdmxdW21vcnRvbl0gPSByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDZWxscztcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgTnVsbE5vZGUgPSByZXF1aXJlKFwiLi9udWxsbm9kZVwiKTtcblxuLy8gTGluZXIgUXVhdGVybmFyeSBOb2RlXG5cbmNsYXNzIExRTm9kZSBleHRlbmRzIE51bGxOb2RlIHtcbiAgY29uc3RydWN0b3IociwgZywgYiwgcm8sIG1vcnRvbiwgbGV2ZWwpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5ybyA9IHJvO1xuICAgIHRoaXMuciA9IHI7XG4gICAgdGhpcy5nID0gZztcbiAgICB0aGlzLmIgPSBiO1xuICAgIHRoaXMubW9ydG9uID0gbW9ydG9uO1xuICAgIHRoaXMubGV2ZWwgPSBsZXZlbDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExRTm9kZTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBMaW5lciBRdWF0ZXJuYXJ5IFRyZWVcblxudmFyIExRTm9kZSA9IHJlcXVpcmUoXCIuL2xxbm9kZVwiKTtcbnZhciBOdWxsTm9kZSA9IHJlcXVpcmUoXCIuL251bGxub2RlXCIpO1xudmFyIE1vcnRvbiA9IHJlcXVpcmUoXCIuL21vcnRvblwiKTtcblxudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbnZhciBwb3cgPSBNYXRoLnBvdztcblxudmFyIG9mZnNldHMgPSBbXTtcblxuY2xhc3MgTFFUcmVlIHtcbiAgY29uc3RydWN0b3IoZmlsdGVyKSB7XG4gICAgaWYgKHR5cGVvZiBmaWx0ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbHRlciA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuXG4gICAgdGhpcy5tb3J0b24gPSAwO1xuICAgIHRoaXMucG9pbnRlciA9IDA7XG4gICAgdGhpcy5sZXZlbCA9IDA7XG4gICAgdGhpcy5tYXhQb2ludGVyID0gdGhpcy5nZXRPZmZzZXQoTW9ydG9uLk1BWF9MVkwgKyAxKTtcbiAgICB0aGlzLmRhdGEgPSBbXTtcbiAgfVxuICBpc1JlZ2lzdGVyZWRCcmFuY2goKSB7XG4gICAgbGV0IHBhcmVudERhdGEgPSB0aGlzLmdldFBhcmVudERhdGEoKTtcbiAgICByZXR1cm4gcGFyZW50RGF0YSA9PT0gbnVsbCB8fCBwYXJlbnREYXRhIGluc3RhbmNlb2YgTFFOb2RlO1xuICB9XG4gIGFkZChub2RlKSB7XG4gICAgdGhpcy5kYXRhW3RoaXMucG9pbnRlcl0gPSBub2RlO1xuXG4gICAgLy/mnIDlpKfjg6zjg5njg6vjgarjgonnmbvpjLJcbiAgICBpZiAodGhpcy5sZXZlbCA9PT0gTW9ydG9uLk1BWF9MVkwpIHtcbiAgICAgIHRoaXMuZGF0YVt0aGlzLnBvaW50ZXJdID0gbm9kZTtcbiAgICB9XG5cbiAgICB0aGlzLnBvaW50ZXIrKztcbiAgICAvLyDjg53jgqTjg7Pjgr/jgYzmrKHjga7jg6zjg5njg6vjga7jgqrjg5Xjgrvjg4Pjg4jjgavpgZTjgZfjgZ/jgonjg6zjg5njg6vjgpLkuIrjgZLjgotcbiAgICBpZiAodGhpcy5nZXRPZmZzZXQodGhpcy5sZXZlbCArIDEpID09PSB0aGlzLnBvaW50ZXIpIHtcbiAgICAgIHRoaXMubGV2ZWwrKztcbiAgICB9XG4gICAgdGhpcy5tb3J0b24gPSB0aGlzLnBvaW50ZXIgLSB0aGlzLmdldE9mZnNldCh0aGlzLmxldmVsKTtcbiAgfVxuICBnZXRQYXJlbnRNb3J0b24obW9ydG9uLCBsZXZlbCkge1xuICAgIG1vcnRvbiA9IHR5cGVvZiBtb3J0b24gPT09ICdudW1iZXInID8gbW9ydG9uIDogdGhpcy5tb3J0b247XG4gICAgbGV2ZWwgPSB0eXBlb2YgbGV2ZWwgPT09ICdudW1iZXInID8gbGV2ZWwgOiB0aGlzLmxldmVsO1xuICAgIHJldHVybiBtb3J0b24gPj4gMjtcbiAgfVxuICBnZXRQYXJlbnREYXRhKG1vcnRvbiwgbGV2ZWwpIHtcbiAgICBtb3J0b24gPSB0eXBlb2YgbW9ydG9uID09PSAnbnVtYmVyJyA/IG1vcnRvbiA6IHRoaXMubW9ydG9uO1xuICAgIGxldmVsID0gdHlwZW9mIGxldmVsID09PSAnbnVtYmVyJyA/IGxldmVsIDogdGhpcy5sZXZlbDtcblxuICAgIGlmIChsZXZlbCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG5ldyBOdWxsTm9kZSgpO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMucG9pbnRlciwgdGhpcy5nZXRNb3J0b24oKSwgdGhpcy5nZXRPZmZzZXQobGV2ZWwgLSAxKSArIChtb3J0b24gPj4gMikpO1xuICAgIHJldHVybiB0aGlzLmRhdGFbdGhpcy5nZXRPZmZzZXQobGV2ZWwgLSAxKSArIChtb3J0b24gPj4gMildO1xuICB9XG4gIGdldE9mZnNldChsdmwpIHtcbiAgICBpZiAoIW9mZnNldHNbbHZsXSkge1xuICAgICAgb2Zmc2V0c1tsdmxdID0gZmxvb3IoKHBvdyg0LCBsdmwpIC0gMSkgLyAoNCAtIDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldHNbbHZsXTtcbiAgfVxuICBpc1BvaW50ZXJNYXgoKSB7XG4gICAgcmV0dXJuICEodGhpcy5tYXhQb2ludGVyID4gdGhpcy5wb2ludGVyKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExRVHJlZTtcbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBtYWluLmpzXG5cbnJlcXVpcmUoXCJuYXRpdmUtcHJvbWlzZS1vbmx5XCIpO1xuXG52YXIgc3MgPSByZXF1aXJlKFwic2ltcGxlLXN0YXRpc3RpY3NcIik7XG52YXIgQ29sb3IgPSByZXF1aXJlKCdjb2xvcicpO1xuXG52YXIgQ2VsbHMgPSByZXF1aXJlKFwiLi9jZWxsc1wiKTtcbnZhciBNb3J0b24gPSByZXF1aXJlKFwiLi9tb3J0b25cIik7XG52YXIgTFFUcmVlID0gcmVxdWlyZShcIi4vbHF0cmVlXCIpO1xudmFyIExRTm9kZSA9IHJlcXVpcmUoXCIuL2xxbm9kZVwiKTtcbnZhciBOdWxsTm9kZSA9IHJlcXVpcmUoXCIuL251bGxub2RlXCIpO1xuXG52YXIgcm91bmQgPSBNYXRoLnJvdW5kO1xudmFyIHBvdyA9IE1hdGgucG93O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKGUpID0+IHtcbiAgY29uc29sZS5sb2coJ0VudHJ5IHBvaW50Jyk7XG4gIHZhciBpbWFnZURhdGEgPSBbXTtcblxuICB2YXIgbG9hZGVkID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHZhciBzcmMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3JjJyk7XG4gICAgc3JjLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZSkgPT4ge1xuICAgICAgcmVzb2x2ZShzcmMpO1xuICAgIH0pO1xuICB9KTtcblxuICBsb2FkZWQudGhlbigoc3JjKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ3NyYyBsb2FkZWQuJyk7XG4gICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgaW1hZ2Uuc3JjID0gc3JjLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG5cbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYWNlLWhvbGRlcicpO1xuICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG5cbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KTtcblxuICAgIHZhciBkYXRhQXJyID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwwLGltYWdlLndpZHRoLCBpbWFnZS5oZWlnaHQpLmRhdGE7XG5cbiAgICBpZiAoZGF0YUFyci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2RhdGEgbGVuZ3RoIGluY29ycmVjdC4nKVxuICAgIH1cblxuICAgIHZhciBjZWxscyA9IG5ldyBDZWxscyhkYXRhQXJyLCBpbWFnZS53aWR0aCwgaW1hZ2UuaGVpZ2h0KTtcblxuICAgIHZhciB0cmVlID0gbmV3IExRVHJlZSgobm9kZSkgPT4gbm9kZS5ybyA8IDE4KTtcbiAgICB2YXIgZmlsdGVyID0gKG5vZGUpID0+IG5vZGUucm8gPCAxODtcblxuICAgIGNvbnNvbGUudGltZSgncmVnaXN0ZXIgZGF0YScpO1xuICAgIHdoaWxlKCF0cmVlLmlzUG9pbnRlck1heCgpKSB7XG5cbiAgICAgIGlmICh0cmVlLmlzUmVnaXN0ZXJlZEJyYW5jaCgpKSB7XG4gICAgICAgIHRyZWUuYWRkKG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHRlbXAgPSBjZWxscy5maW5kKHRyZWUubGV2ZWwsIHRyZWUubW9ydG9uKTtcbiAgICAgICAgXG4gICAgICAgIC8vIHN0YW5kYXJkIGRldmlhdGlvbiBvZiBsdW1pbmFuY2VcbiAgICAgICAgdmFyIHJvID0gc3Muc3RhbmRhcmREZXZpYXRpb24odGVtcC5tYXAoKGNlbGwpID0+IGNlbGwubHVtaW5hbmNlKSk7XG5cbiAgICAgICAgaWYgKHJvIDwgMTggfHwgdHJlZS5sZXZlbCA9PT0gTW9ydG9uLk1BWF9MVkwpIHtcbiAgICAgICAgICBsZXQgbCA9IHRlbXAubGVuZ3RoO1xuXG4gICAgICAgICAgLy8gY29sb3IgYXZlcmFnZVxuICAgICAgICAgIGxldCByVG90YWwgPSAwO1xuICAgICAgICAgIGxldCBnVG90YWwgPSAwO1xuICAgICAgICAgIGxldCBiVG90YWwgPSAwO1xuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHJUb3RhbCArPSB0ZW1wW2ldLnI7XG4gICAgICAgICAgICBnVG90YWwgKz0gdGVtcFtpXS5nO1xuICAgICAgICAgICAgYlRvdGFsICs9IHRlbXBbaV0uYjtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdHJlZS5hZGQobmV3IExRTm9kZShyVG90YWwgLyBsLCBnVG90YWwgLyBsLCBiVG90YWwgLyBsLCBybywgdHJlZS5tb3J0b24sIHRyZWUubGV2ZWwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cmVlLmFkZChuZXcgTnVsbE5vZGUoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS50aW1lRW5kKCdyZWdpc3RlciBkYXRhJyk7XG5cbiAgICBjb25zb2xlLnRpbWUoJ2RyYXcgZGF0YSAxJyk7XG4gICAgdHJlZS5kYXRhLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgTFFOb2RlKSB7XG4gICAgICAgIGxldCBjb2xvciA9IENvbG9yKCkucmdiKFtub2RlLnIsIG5vZGUuZywgbm9kZS5iXSlcbiAgICAgICAgbGV0IHBvc2l0aXZlID0gYHJnYigke2NvbG9yLnNhdHVyYXRlKDAuNSkucmdiQXJyYXkoKS5qb2luKCcsJyl9KWA7XG4gICAgICAgIC8vbGV0IG5lZ2F0aXZlID0gYHJnYigke2NvbG9yLmNsb25lKCkubmVnYXRlKCkucmdiQXJyYXkoKS5qb2luKCcsJyl9KWA7XG4gICAgICAgIC8vbGV0IGdsb3cgPSBgcmdiYSgke2NvbG9yLmNsb25lKCkubGlnaHRlbigwLjUpLnJnYkFycmF5KCkuam9pbignLCcpfSwwLjIpYDtcbiAgICAgICAgLy9sZXQgdml2aWQgPSBgcmdiKCR7Y29sb3IuY2xvbmUoKS5zYXR1cmF0ZSgwLjUpLnJnYkFycmF5KCkuam9pbignLCcpfSwwLjIpYDtcbiAgICAgICAgbGV0IHcgPSBpbWFnZS53aWR0aCAvIHBvdygyLCBub2RlLmxldmVsKTtcbiAgICAgICAgbGV0IGggPSBpbWFnZS5oZWlnaHQgLyBwb3coMiwgbm9kZS5sZXZlbCk7XG4gICAgICAgIGxldCBtID0gTW9ydG9uLnJldmVyc2Uobm9kZS5tb3J0b24pO1xuICAgICAgICBsZXQgbWFnbmlmeSA9IDE7XG4gICAgICAgIGxldCBsZWZ0ID0gdyAqIG0ueCAqIG1hZ25pZnk7XG4gICAgICAgIGxldCByaWdodCA9IHcgKiBtLnggKiBtYWduaWZ5ICsgdyAqIG1hZ25pZnk7XG4gICAgICAgIGxldCB0b3AgPSBoICogbS55ICogbWFnbmlmeTtcbiAgICAgICAgbGV0IGJvdHRvbSA9IGggKiBtLnkgKiBtYWduaWZ5ICsgaCAqIG1hZ25pZnk7XG5cbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBwb3NpdGl2ZTtcbiAgICAgICAgY29udGV4dC5maWxsUmVjdChsZWZ0LCB0b3AsIHcgKiBtYWduaWZ5LCBoICogbWFnbmlmeSk7XG5cbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICcjRkZGJztcbiAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSAwLjI7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGxlZnQsIHRvcCk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHJpZ2h0LCBib3R0b20pO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhyaWdodCwgdG9wKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8obGVmdCwgYm90dG9tKTtcbiAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2RyYXcgZGF0YSAxJyk7XG5cbiAgICBjb25zb2xlLnRpbWUoJ2RyYXcgZGF0YSAyJyk7XG4gICAgdmFyIGZpbmlzaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2gnKTtcbiAgICBmaW5pc2gud2lkdGggPSBpbWFnZS53aWR0aCAqIDI7XG4gICAgZmluaXNoLmhlaWdodCA9IGltYWdlLmhlaWdodCAqIDI7XG5cbiAgICB2YXIgY3R4X2ZpbiA9IGZpbmlzaC5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRyZWUuZGF0YS5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIExRTm9kZSkge1xuICAgICAgICBsZXQgY29sb3IgPSBDb2xvcigpLnJnYihbbm9kZS5yLCBub2RlLmcsIG5vZGUuYl0pXG4gICAgICAgIGxldCBwb3NpdGl2ZSA9IGByZ2IoJHtjb2xvci5zYXR1cmF0ZSgwLjUpLnJnYkFycmF5KCkuam9pbignLCcpfSlgO1xuICAgICAgICAvL2xldCBuZWdhdGl2ZSA9IGByZ2IoJHtjb2xvci5jbG9uZSgpLm5lZ2F0ZSgpLnJnYkFycmF5KCkuam9pbignLCcpfSlgO1xuICAgICAgICAvL2xldCBnbG93ID0gYHJnYmEoJHtjb2xvci5jbG9uZSgpLmxpZ2h0ZW4oMC41KS5yZ2JBcnJheSgpLmpvaW4oJywnKX0sMC4yKWA7XG4gICAgICAgIC8vbGV0IHZpdmlkID0gYHJnYigke2NvbG9yLmNsb25lKCkuc2F0dXJhdGUoMC41KS5yZ2JBcnJheSgpLmpvaW4oJywnKX0sMC4yKWA7XG4gICAgICAgIGxldCB3ID0gaW1hZ2Uud2lkdGggLyBwb3coMiwgbm9kZS5sZXZlbCk7XG4gICAgICAgIGxldCBoID0gaW1hZ2UuaGVpZ2h0IC8gcG93KDIsIG5vZGUubGV2ZWwpO1xuICAgICAgICBsZXQgbSA9IE1vcnRvbi5yZXZlcnNlKG5vZGUubW9ydG9uKTtcbiAgICAgICAgbGV0IG1hZ25pZnkgPSAyO1xuICAgICAgICBsZXQgbGVmdCA9IHcgKiBtLnggKiBtYWduaWZ5O1xuICAgICAgICBsZXQgcmlnaHQgPSB3ICogbS54ICogbWFnbmlmeSArIHcgKiBtYWduaWZ5O1xuICAgICAgICBsZXQgdG9wID0gaCAqIG0ueSAqIG1hZ25pZnk7XG4gICAgICAgIGxldCBib3R0b20gPSBoICogbS55ICogbWFnbmlmeSArIGggKiBtYWduaWZ5O1xuXG4gICAgICAgIGN0eF9maW4uYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eF9maW4uZmlsbFN0eWxlID0gcG9zaXRpdmU7XG4gICAgICAgIGN0eF9maW4uZmlsbFJlY3QobGVmdCwgdG9wLCB3ICogbWFnbmlmeSwgaCAqIG1hZ25pZnkpO1xuXG4gICAgICAgIGN0eF9maW4uYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eF9maW4uc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjYpJztcbiAgICAgICAgY3R4X2Zpbi5saW5lV2lkdGggPSAwLjM7XG4gICAgICAgIGN0eF9maW4ubW92ZVRvKGxlZnQsIHRvcCk7XG4gICAgICAgIGN0eF9maW4ubGluZVRvKHJpZ2h0LCBib3R0b20pO1xuICAgICAgICBjdHhfZmluLm1vdmVUbyhyaWdodCwgdG9wKTtcbiAgICAgICAgY3R4X2Zpbi5saW5lVG8obGVmdCwgYm90dG9tKTtcbiAgICAgICAgY3R4X2Zpbi5jbG9zZVBhdGgoKTtcbiAgICAgICAgY3R4X2Zpbi5zdHJva2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLnRpbWVFbmQoJ2RyYXcgZGF0YSAyJyk7XG4gIH0pO1xufSwgZmFsc2UpO1xuXG5cbiIsIlxuJ3VzZSBzdHJpY3QnO1xuXG4vL21vcnRvbi5qc1xuLy9tb3J0b24gb3JkZXIgPD0+IHgsIHlcblxuLy9odHRwOi8vZC5oYXRlbmEubmUuanAvcmFubWFydTUwLzIwMTExMTA2LzEzMjA1NTk5NTVcbi8vaHR0cDovL21hcnVwZWtlMjk2LmNvbS9DT0xfMkRfTm84X1F1YWRUcmVlLmh0bWxcblxuLy8oNDUpLnRvU3RyaW5nKDIpIC8vIFwiMTAxMTAxXCJcbi8vIDEwID0+IDIgOiBwYXJlbnQgcGFyZW50IHNwYWNlXG4vLyAxMSA9PiAzIDogcGFyZW50IHNwYWNlXG4vLyAwMSA9PiAxIDogc2VsZiBzcGFjZVxuXG4vLyB5eFxuLy8gMTBcblxuLypcbnlcXHggMCAgMVxuICAtLS0tLS0tXG4wIHwwMHwwMXxcbiAgLS0tLS0tLVxuMSB8MTB8MTF8XG4gIC0tLS0tLS1cbiovXG5cbi8vIFwiMTAxMTAxXCIgQU5EIFwiMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDFcIlxuLy8gXCIwMDAxMDFcIlxuLy8gXCIwMTAxMTBcIiBBTkQgXCIwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMTAxMDEwMVwiXG4vLyBcIjAxMDEwMFwiXG5cbnZhciBzcGFjZUZpbHRlcnMgPSBbXTtcblxuY2xhc3MgTW9ydG9uIHtcbiAgc3RhdGljIGNyZWF0ZSh4LCB5KSB7XG4gICAgcmV0dXJuIE1vcnRvbi5iaXRTZXBlcmF0ZTMyKHgpIHwgKE1vcnRvbi5iaXRTZXBlcmF0ZTMyKHkpIDw8IDEpO1xuICB9XG4gIHN0YXRpYyByZXZlcnNlKG4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogTW9ydG9uLmJpdFBhY2szMihuICYgMHg1NTU1NTU1NSksXG4gICAgICB5OiBNb3J0b24uYml0UGFjazMyKChuICYgMHhBQUFBQUFBQSkgPj4gMSlcbiAgICB9XG4gIH1cbiAgc3RhdGljIGJpdFNlcGVyYXRlMzIobikge1xuICAgIG4gPSAobiB8IChuIDw8IDgpKSAmIDB4MDBmZjAwZmY7XG4gICAgbiA9IChuIHwgKG4gPDwgNCkpICYgMHgwZjBmMGYwZjtcbiAgICBuID0gKG4gfCAobiA8PCAyKSkgJiAweDMzMzMzMzMzO1xuICAgIHJldHVybiAobiB8IChuIDw8IDEpKSAmIDB4NTU1NTU1NTU7XG4gIH1cbiAgc3RhdGljIGJpdFBhY2szMihuKSB7XG4gICAgbiA9IChuICYgMHgzMzMzMzMzMykgfCAoKG4gJiAweDQ0NDQ0NDQ0KSA+PiAxKTtcbiAgICBuID0gKG4gJiAweDBmMGYwZjBmKSB8ICgobiAmIDB4MzAzMDMwMzApID4+IDIpO1xuICAgIG4gPSAobiAmIDB4MDBmZjAwZmYpIHwgKChuICYgMHgwZjAwMGYwMCkgPj4gNCk7XG4gICAgcmV0dXJuIChuICYgMHgwMDAwZmZmZikgfCAoKG4gJiAweDAwZmYwMDAwKSA+PiA4KTtcbiAgfVxuICBzdGF0aWMgYmVsb25ncyhhLCBiLCBsdmwsIG1heCA9IE1vcnRvbi5NQVhfTFZMKSB7XG4gICAgLy9sZXQgZiA9IE1hdGgucG93KDIsIGx2bCAqIDIpIC0gMSA8PCAobWF4IC0gbHZsKSAqIDI7XG4gICAgLy9yZXR1cm4gKChhICYgZikgPj4gKG1heCAtIGx2bCkgKiAyKSA9PT0gYjtcbiAgICByZXR1cm4gYSA+PiAobWF4IC0gbHZsKSAqIDIgPT09IGI7XG4gIH1cbn1cblxuTW9ydG9uLk1BWF9MVkwgPSA4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vcnRvbjtcblxuIiwiXG4ndXNlIHN0cmljdCc7XG5cbi8vIEVtcHR5IE5vZGVcblxuY2xhc3MgTnVsbE5vZGUge31cblxubW9kdWxlLmV4cG9ydHMgPSBOdWxsTm9kZTtcbiJdfQ==
