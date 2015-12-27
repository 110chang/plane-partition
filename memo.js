//まず、すべて登録する

    var 画像データ;
    var 最大レベル = 3;
    var 線形4分木 = [];
    var レベル = 0;
    var 開始ポインタ = 0;
    var 要素数 = 0;
    var 格子サイズ = 0;
    var モートン番号 = 0;
    var i, p, x, y, w, h;
    var imgX, imgY, imgW, imgH;
    var 合計, 平均, 分散, 標準偏差, 輝度;

    var 一時保存木 = [];

    while (最大レベル > レベル) {// && 登録すべき子がある) {
      開始ポインタ = Math.floor((Math.pow(4, レベル) - 1) / (4 - 1));
      要素数 = Math.floor((Math.pow(4, (レベル + 1)) - 1) / (4 - 1)) - 開始ポインタ;
      格子サイズ = Math.sqrt(要素数);
      x = 0;
      y = 0;
      console.log(開始ポインタ, 要素数, 格子サイズ);

      一時保存木 = [];

      for (i = 0; i < 要素数; i++) {
        imgW = image.width / 格子サイズ;
        imgH = image.height / 格子サイズ;
        imgX = x * imgW;
        imgY = y * imgH;
        画像データ = context.getImageData(imgX, imgY, imgW, imgH).data;
        console.log(画像データ.length / 4);
        if (画像データ.length % 4 !== 0) {
          throw new Error('data length incorrect.')
        }
        console.time('read data');
        輝度 = 0;
        for (p = 0; p < 画像データ.length / 4; p++) {
          
        }
        console.timeEnd('read data');

        //モートン番号 = morton(x, y);
        //一時保存木.push(モートン番号);
        //線形4分木[開始ポインタ + モートン番号] = new Cell();

        if ((x + 1) % 格子サイズ === 0) {
          x = 0;
          y++;
        } else {
          x++;
        }
      }
      console.log(一時保存木.join(','));
      レベル++;
    }
    console.timeEnd('read data');

class Cell {
  constructor() {
    this.level = 0;
    this.x = 0;
    this.y = 0;
    this.morton = 0;
    this.w = 0;
    this.h = 0;
    this.color = 0x000000
  }
}

//http://marupeke296.com/COL_2D_No8_QuadTree.html
//http://marupeke296.com/COL_2D_No9_QuadTree_Imp.html

//輝度
luminance = ( 0.298912 * r + 0.586611 * g + 0.114478 * b );