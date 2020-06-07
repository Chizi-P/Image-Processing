"use strict";
var img = new Image();
// img.crossOrigin = "Anonymous"; //解决资源跨域问题,元素的跨域资源请求不需要凭证标志设置。非本地資源
var canvas;
var ctx;
var inputFile;
var imgData;

/* 自定義調用函數 */
/**創造並添加一個 HTML元素到 對應 id的 HTML元素中 */
function creAddElemt(elementTag, addInToElementId) {
    var element = document.createElement(elementTag);
    document.getElementById(addInToElementId).appendChild(element);
    return element;
}
/**throw 用於參數位置 */
function throwError(msg) {
    throw msg;
}
/* 初始化設定 */
var setting = (() => {
    inputFile = document.getElementById('inputFile');
    inputFile.accept = ".png, .jpg";
    inputFile.multiple = 1; // 能否選擇多個文件
    canvas = document.getElementById('canvas');
})();

/* 檢查瀏覽器是否支持File API */
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // 完美支持
  } else {
    // 不能支持
    alert('The File APIs are not fully supported in this browser.');
    throw 'The File APIs are not fully supported in this browser.';
}

/* 拖入文件 */
function handleDragOver(evt) {
    evt.stopPropagation();  //停止繼續聆聽
    evt.preventDefault();   //停止默認行為
    evt.dataTransfer.dropEffect = 'copy';   //顯示視覺行為
}

/* 選擇圖片文件 */
function handleFileSelect(evt) {
    var files = evt.target.files;
    for (var i = 0, f; f = files[i]; i++) {
        if (!f.type.match('image.*')) { //只看image
            continue;
        }
        var reader = new FileReader();
        reader.onload = e => img.src = e.target.result;
        reader.readAsDataURL(files[0]);
    }
}

img.onload = function() {
    canvas.width = img.width;
    canvas.height = img.height;
    if(!canvas.getContext){ // 檢測畫布是否支持getContext
        alert("The canvas unsupported 2D rendering context.");
        return;
    }
    ctx = canvas.getContext('2d',{antialias: false}); // antialias抗锯齿
    ctx.drawImage(img, 0, 0);
    imgData = ctx.getImageData(0, 0, img.width, img.height);
}

inputFile.addEventListener('change', handleFileSelect, false);



/**尋找峰回傳峰的位置的陣列
 * @param {array} nums 
 */
var findPeakIndex = function(nums) {
    var endindex = nums.length - 1;
    var len = nums.length;
    var index = new Array(len);
    if (len-1 == 0) {
        return 0;
    }
    index[0] = nums[0] > nums[1] ? 1 : 0;
    index[endindex] = nums[endindex] > nums[endindex - 1] ? 1 : 0;
    for (let i = 1; i <= endindex - 1; i++) {
        index[i] = nums[i] > nums[i-1] && nums[i] > nums[i+1] ? 1 : 0;
    }
    return index;
};
//Otsu function from Wikipedia
function otsu(histogram, total) {
    var sum = 0;
    for (var i = 1; i < 256; ++i) {
        sum += i * histogram[i];
    }
    var sumB = 0;
    var wB = 0;
    var wF = 0;
    var mB;
    var mF;
    var max = 0.0;
    var between = 0.0;
    var threshold1 = 0.0;
    var threshold2 = 0.0;
    for (var i = 0; i < 256; ++i) {
        wB += histogram[i];
        if (wB == 0)
            continue;
        wF = total - wB;
        if (wF == 0)
            break;
        sumB += i * histogram[i];
        mB = sumB / wB;
        mF = (sum - sumB) / wF;
        between = wB * wF * (mB - mF) * (mB - mF);
        if ( between >= max ) {
            threshold1 = i;
            if ( between > max ) {
                threshold2 = i;
            }
            max = between;            
        }
    }
    return ( threshold1 + threshold2 ) / 2.0;
}



//


//

/**
 * 2維數組方式的RGBA
 * to - 會改變本體，return this
 * get - 不會改變本體，return get的東西
 * 備用
*/
class RGBA2D {
    constructor() {
        this.r = [];
        this.g = [];
        this.b = [];
        this.a = [];
        this.width = 0;
        this.height = 0;
        this.pixelNumber = 0;
        this.isGrayscale = false;
        this.isBinarization = false;
    }
    static createByRGBAobject(otherRGBAObject) {
        var temp = new RGBA2D();
        for (let i = 0; i <  otherRGBAObject.height; i++) {
            temp.r[i] = Object.assign({}, otherRGBAObject.r[i]);
            temp.g[i] = Object.assign({}, otherRGBAObject.r[i]);
            temp.b[i] = Object.assign({}, otherRGBAObject.r[i]);
            temp.a[i] = Object.assign({}, otherRGBAObject.r[i]);
        }
        temp.width = otherRGBAObject.width;
        temp.height = otherRGBAObject.height;
        temp.pixelNumber = otherRGBAObject.pixelNumber;
        temp.isGrayscale = otherRGBAObject.isGrayscale;
        temp.isBinarization = otherRGBAObject.isBinarization;
        return temp;
    }
    static createByImageData(imageData = throwError("沒傳入圖像")) { //沒必要 有錯
        var result = new RGBA2D();
        var w = imageData.width;
        var h = imageData.height;
        result.r = new Array(h);
        result.g = new Array(h);
        result.b = new Array(h);
        result.a = new Array(h);
        for (let i = 0; i < h; i++){
            result.r[i] = new Array(w);
            result.g[i] = new Array(w);
            result.b[i] = new Array(w);
            result.a[i] = new Array(w);
            for (let j = 0; j < w; j++) {
                result.r[i][j] = imageData.data[(w * i + j) * 4];
                result.g[i][j] = imageData.data[(w * i + j) * 4 + 1];
                result.b[i][j] = imageData.data[(w * i + j) * 4 + 2];
                result.a[i][j] = imageData.data[(w * i + j) * 4 + 3];
            }
        }
        result.width = w;
        result.height = h;
        result.pixelNumber = imgData.data.length / 4;
        result.isGrayscale = false;
        result.isBinarization = false;
        return result;
    }
    static createByRGBAArray(r ,g ,b ,a , w, h) {
        if (a === 255) {
            a = createArray(w * h, 255);
        }
        var result = new RGBA2D();
        result.r = new Array(h);
        result.g = new Array(h);
        result.b = new Array(h);
        result.a = new Array(h);
        for (let i = 0; i < h; i++){
            result.r[i] = new Array(w);
            result.g[i] = new Array(w);
            result.b[i] = new Array(w);
            result.a[i] = new Array(w);
            for (let j = 0; j < w; j++) {
                result.r[i][j] = r[w * i + j];
                result.g[i][j] = g[w * i + j];
                result.b[i][j] = b[w * i + j];
                result.a[i][j] = a[w * i + j];
            }
        }
        result.width = w;
        result.height = h;
        result.pixelNumber = w * h;
        result.isGrayscale = false;
        result.isBinarization = false;
        return result;

    }
    static createByRGBAMatrix(r, g, b, a, w, h) {
        if (a === 255) {
            a = createMatrix(w, h, 255);
        }
        var result = new RGBA2D();
        result.r = new Array(h);
        result.g = new Array(h);
        result.b = new Array(h);
        result.a = new Array(h);
        for (let i = 0; i < h; i++) {
            result.r[i] = new Array(w);
            result.g[i] = new Array(w);
            result.b[i] = new Array(w);
            result.a[i] = new Array(w);
            for (let j = 0; j < w; j++) {
                result.r[i][j] = r[i][j];
                result.g[i][j] = g[i][j];
                result.b[i][j] = b[i][j];
                result.a[i][j] = a[i][j];
            }
        }
        result.width = w;
        result.height = h;
        result.pixelNumber = w * h;
        result.isGrayscale = false;
        result.isBinarization = false;
        return result;
    }
    getImageData(){
        var temp = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++){
                temp.push(this.r[i][j]);
                temp.push(this.g[i][j]);
                temp.push(this.b[i][j]);
                temp.push(this.a[i][j]);
            }
        }
        return new ImageData(new Uint8ClampedArray(temp), this.width, this.height);
    }
    getBitmap() { // 用了data1
        var temp = RGBA2D.createByRGBAobject(this);
        if (this.isGrayscale == false) {
            temp.AvgGrayscale();
        }
        if (temp.isBinarization == false) {
            temp.toBinarization();
        }
        return new Bitmap(temp.width, temp.height).data1(temp.r);
    }
    drawOn(canvasContext, x = 0, y = 0) {
        canvasContext.putImageData(this.getImageData(), x, y);
    }
    toColorInvert() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.r[i][j] = 255 - this.r[i][j];
                this.g[i][j] = 255 - this.g[i][j];
                this.b[i][j] = 255 - this.b[i][j];
            }
        }
        return this;
    }
    Grayscale() {
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                var grayColor = Math.floor(this.r[i][j]*0.299 + this.g[i][j]*0.587 + this.b[i][j]*0.114);
                this.r[i][j] = grayColor;
                this.g[i][j] = grayColor;
                this.b[i][j] = grayColor;
            }
        this.isGrayscale = true;
        return this;
        }
    }
    AvgGrayscale() {
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                var grayColor = Math.floor((this.r[i][j] + this.g[i][j] + this.b[i][j] / 3));
                this.r[i][j] = grayColor;
                this.g[i][j] = grayColor;
                this.b[i][j] = grayColor;
            }
        }
        this.isGrayscale = true;
        return this;
    }
    getStatsGraysacle() {
        var temp = RGBA2D.createByRGBAobject(this);
        if(temp.isGrayscale == false) {
            temp.AvgGrayscale();
        }
        var stats = new Array(256);
        for (let j = 0; j < 256; j++) {    //初始化stats = 0
            stats[j] = 0;
        }
        for (let i = 0; i < temp.height; i++) {
            for (let j = 0; j < temp.width; j++) {
                stats[temp.r[i][j]] += 1;
            }
        }
        return stats;
    }
    toBinarization(threshold) {
        if (threshold == undefined) {
            // threshold = findThreshold(this.AvgGrayscale().getStatsGraysacle()); // 我的方法找閥值
            threshold = otsu(this.AvgGrayscale().getStatsGraysacle(), this.pixelNumber);
        }
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                this.r[i][j] = (this.r[i][j] > threshold) ? 255 : 0;
                this.g[i][j] = (this.g[i][j] > threshold) ? 255 : 0;
                this.b[i][j] = (this.b[i][j] > threshold) ? 255 : 0;
            }
        }
        return this;
    }
    toOpacity(value) {
        if (value < 0) {
            console.log("數值要在0到255之間");
            console.log("設置value = 0");
            value = 0;
        }
        if (value > 255) {
            console.log("數值要在0到255之間。");
            console.log("設置value = 255");
        }
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.a[i][j] = value;
            }
        }
        return this;
    }
    brightness(value) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.r[i][j] += value;
                this.g[i][j] += value;
                this.b[i][j] += value;
            }
        }
        return this;
    }
    avgColor() {
        var avgR = sumMatrix(this.r, this.width, this.height) / this.pixelNumber;
        var avgG = sumMatrix(this.g, this.width, this.height) / this.pixelNumber;
        var avgB = sumMatrix(this.b, this.width, this.height) / this.pixelNumber;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.r[i][j] = avgR;
                this.g[i][j] = avgG;
                this.b[i][j] = avgB;
            }
        }
        return this;
    }
    reverseAlongYAxis() {
        for (let i = 0; i < this.height; i++) {
                this.r[i] = this.r[i].reverse();
                this.g[i] = this.g[i].reverse();
                this.b[i] = this.b[i].reverse();
                this.a[i] = this.a[i].reverse();
        }
        return this;
    }
    reverseAlongXAxis() {
            this.r = this.r.reverse();
            this.g = this.g.reverse();
            this.b = this.b.reverse();
            this.a = this.a.reverse();
        return this;
    }
    calcAnisotropy(k, lambda, color) {      //有問題
        var NI, SI, EI, WI, cN, cS, cE, cW;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (!(color[i - 1][j] == undefined)) {
                    NI = color[i - 1][j] - color[i][j];
                    cN = Math.exp(-(NI * NI)/(k * k));
                } else {
                    NI = cN = 0;
                }
                if (!(color[i + 1][j] == undefined)) {
                    SI = color[i+1][j] - color[i][j];
                    cS = Math.exp(-(SI * SI)/(k * k));
                } else {
                    SI = cS = 0;
                }
                if (!(color[i][j + 1] == undefined)) {
                    EI = color[i][j + 1] - color[i][j];
                    cE = Math.exp(-(EI * EI)/(k * k));
                } else {
                    EI = cE = 0;
                }
                if (!(color[i][j - 1] == undefined)) {
                    WI = color[i][j - 1] - color[i][j];
                    cW = Math.exp(-(WI * WI)/(k * k));
                } else {
                    WI = cW = 0;
                }
                color[i][j] += lambda * (cN * NI + cS * SI + cE * EI + cW * WI);
            }
        }
    }
    filterAnisotropy(k, lambda, N) {
        for (let n = 0; n < N; n++) {
            this.calcAnisotropy(k, lambda, this.r);
            this.calcAnisotropy(k, lambda, this.g);
            this.calcAnisotropy(k, lambda, this.b);
        }
        return this;
    }
}





class Bitmap {
    constructor(width, height) {
        this.bitmap = new Array(height);
        this.width = width;
        this.height = height;
        for (let i = 0; i < height; i++) {
            this.bitmap[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                this.bitmap[i][j] = new Boolean(0);
            }
        }
        // this.status // 狀態
    }
    data(data) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.bitmap[i][j] = data[i * this.width + j] == 255 ? 1 : 0;
            }
        }
        return this;
    }
    data1(data) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.bitmap[i][j] = data[i][j] == 255 ? 1 : 0;
            }
        }
        return this;
    }
    static createByBitmap(bitmap) {
        var newbitmap = new Bitmap(bitmap.width, bitmap.height);
        for (let i = 0; i < newbitmap.height; i++) {
            for (let j = 0; j < newbitmap.width; j++) {
                newbitmap.bitmap[i] = Object.assign({}, bitmap.bitmap[i]);
            }
        }
        return newbitmap;
    }
    getRGBA() {
        var rgba = new RGBA();
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                rgba.r[this.width * i + j] = this.bitmap[i][j] == 0 ? 0 : 255;
            }
        }
        rgba.g = Object.assign({}, rgba.r);
        rgba.b = Object.assign({}, rgba.r);
        rgba.a = Object.assign({}, rgba.r);
        rgba.width = this.width;
        rgba.height = this.height;
        rgba.pixelNumber = this.width * this.height;
        return rgba;
    }
    toImageData() {
        var temp = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                var value = this.bitmap[i][j] == 0 ? 0 : 255;
                temp.push(value, value, value);
                temp.push(255);
            }
        }
        return new ImageData(new Uint8ClampedArray(temp), this.width, this.height);
    }
    drawOn(canvasContext, x = 0, y = 0) {
        canvasContext.putImageData(this.toImageData(), x, y);
        return this;
    }
    /**梯度 */ //未完成
    gradient(){

    }
    // 形態學 morphology
    /**簡單 膨脹 */
    expend() {  //用時很長，需要優化 圖像邊緣沒有處理
        debugger;
        var temp = Bitmap.createByBitmap(this);
        for (let i = 1; i < temp.height - 1; i++) {
            for (let j = 1; j < temp.width - 1; j++) {
                temp.bitmap[i][j] = 
                this.bitmap[i+1][j] == 0 || 
                this.bitmap[i+1][j+1] == 0 ||
                this.bitmap[i][j+1] == 0 ||
                this.bitmap[i-1][j+1] == 0 ||
                this.bitmap[i-1][j] == 0 ||
                this.bitmap[i-1][j-1] == 0||
                this.bitmap[i][j-1] == 0 ||
                this.bitmap[i-1][j-1] == 0 ? 0 : 1;
            }
        }
        this.bitmap = temp.bitmap;
        return this;
    }
    /**簡單 侵蝕 */
    corrode() {
        var temp = Bitmap.createByBitmap(this);
        for (let i = 1; i < temp.height - 1; i++) {
            for (let j = 1; j < temp.width - 1; j++) {
                temp.bitmap[i][j] = 
                this.bitmap[i+1][j] == 1 ||
                this.bitmap[i+1][j+1] == 1 ||
                this.bitmap[i][j+1] == 1 ||
                this.bitmap[i-1][j+1] == 1||
                this.bitmap[i-1][j] == 1 ||
                this.bitmap[i-1][j-1] == 1 ||
                this.bitmap[i][j-1] == 1 ||
                this.bitmap[i-1][j-1] == 1 ? 1 : 0;
            }
        }
        this.bitmap = temp.bitmap;
        return this;
    }
    /**開運算
     * 先侵蝕後膨脹
     */
    opening() {
        this.corrode().expend();
        return this;
    }
    /**閉運算
     * 先膨脹後侵蝕
     */
    closing() {
        this.expend().corrode();
    }
    /**型態梯度 */
    morphologicalGradient(){  //get
        var gradient = createMatrix(this.width, this.height, 0);
        var exp = Bitmap.createByBitmap(this);
        var cor = Bitmap.createByBitmap(this);
        exp.expend();
        cor.corrode();
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                gradient[i][j] = exp.bitmap[i][j] - cor.bitmap[i][j];
            }
        }
        return gradient;
    }
    /**頂帽 */
    topHat() {  //get
        var openingResult = Bitmap.createByBitmap(this).opening();
        var result = createMatrix(this.width, this.height, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                result[i][j] = this.Bitmap[i][j] - openingResult[i][j];
            }
        }
        return result;
    }
    /**黑帽 */
    blackHat() { //get
        var closingResult = Bitmap.createByBitmap(this).closing();
        var result = createMatrix(this.width, this.height, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                result[i][j] = closingResult[i][j] - this.Bitmap[i][j];
            }
        }
        return result;
    }
    //問題:
    //膨脹和侵蝕的邊緣不能undefined, 所以要有數值
}

/**
 * RGBA 膨脹 用RGBA畫
 * var y = RGBA.createByImageData(imgData).getBitmap().expend().getRGBA().drawOn(ctx);
 * 用Bitmap畫
 * var y = RGBA.createByImageData(imgData).getBitmap().expend().drawOn(ctx);
 * 
*/

