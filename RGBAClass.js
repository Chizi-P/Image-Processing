class RGBA {
    constructor (){
        this.r = [];
        this.g = [];
        this.b = [];
        this.a = [];
        this.width = 0;
        this.height = 0;
        this.pixelNumber = 0;
        this.len = 0;
        this.isGrayscale = false;
        this.isBinarization = false;
    }
    static createByRGBAobject(otherRGBAObject) { //class.static Method
        var temp = new RGBA();
        temp.r = Object.assign({}, otherRGBAObject.r)
        temp.g = Object.assign({}, otherRGBAObject.g)
        temp.b = Object.assign({}, otherRGBAObject.b)
        temp.a = Object.assign({}, otherRGBAObject.a)
        temp.width = otherRGBAObject.width;
        temp.height = otherRGBAObject.height;
        temp.pixelNumber = otherRGBAObject.pixelNumber;
        temp.len = otherRGBAObject.len;
        temp.isGrayscale = otherRGBAObject.isGrayscale;
        temp.isBinarization = otherRGBAObject.isBinarization;
        return temp;
    }
    static createByRGBA(r, g, b, a, width, height) { //沒用到
        // if (!(r.length == g.length == b.length == a.length)) {
        //     throw 'r, g, b, a the length to must be consistent.';
        // }
        var temp = new RGBA();
        temp.r = r;
        temp.g = g;
        temp.b = b;
        temp.a = a;
        temp.pixelNumber = r.length;
        temp.len = r.length * 4;
        temp.width = width;
        temp.height = height;
        return temp;
    }
    static createByImageData(imageData = throwError("沒傳入圖像")) {
        var temp = new RGBA();
        for (let i = 0, j = 0, len = imageData.data.length; i < len; i += 4, j++) {
            temp.r[j] = imageData.data[i];
            temp.g[j] = imageData.data[i + 1];
            temp.b[j] = imageData.data[i + 2];
            temp.a[j] = imageData.data[i + 3];
        }
        temp.width = imageData.width;
        temp.height = imageData.height;
        temp.pixelNumber = imageData.data.length/4;
        temp.len = imageData.data.length;
        return temp;
    }
    getImageData(){
        var temp = [];
        for (var i = 0; i < this.pixelNumber; i++) {
            temp.push(this.r[i]);
            temp.push(this.g[i]);
            temp.push(this.b[i]);
            temp.push(this.a[i]);
        }
        return new ImageData(new Uint8ClampedArray(temp), this.width, this.height);
    }
    drawOn(canvasContext, x = 0, y = 0){
        canvasContext.putImageData(this.getImageData(), x, y);
        return this;
    }
    toColorInvert() {
        for (let i = 0; i < this.pixelNumber; i++) {
            this.r[i] = 255 - this.r[i];
            this.g[i] = 255 - this.g[i];
            this.b[i] = 255 - this.b[i];
        }
        return this;
    }
    /**灰度
     * 符合人眼對色彩的靈敏度加權係數
     * rc=0.2989,gc=0.5870,bc=0.1140
     */
    Grayscale() {
        for (let i = 0; i < this.pixelNumber; i++){
            var grayColor = Math.floor(this.r[i]*0.299 + this.g[i]*0.587 + this.b[i]*0.114);
            this.r[i] = grayColor;
            this.g[i] = grayColor;
            this.b[i] = grayColor;
        }
        this.isGrayscale = true;
        return this;
    }
    /* 平均灰度 */
    AvgGrayscale() {
        for (let i = 0; i < this.pixelNumber; i++){
            var grayColor = Math.floor((this.r[i] + this.g[i] + this.b[i]) / 3);
            this.r[i] = grayColor;
            this.g[i] = grayColor;
            this.b[i] = grayColor;
        }
        this.isGrayscale = true;
        return this;
    }
    /**統計灰度*/
    getStatsGraysacle() {
        var temp = RGBA.createByRGBAobject(this);
        if(temp.isGrayscale == false) {
            temp.AvgGrayscale();
        }
        var stats = new Array(256);
        for (let j = 0; j < 256; j++) {    //初始化stats = 0
            stats[j] = 0;
        }
        for (let i = 0; i < temp.pixelNumber; i++) {
            stats[temp.r[i]] += 1;
        }
        return stats;
    }
    //Otsu function from Wikipedia
    otsu(histogram, total) {
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
    /**圖像二值化
     * @param {number} value - 閥值 不輸入會以OTSU尋找閥值 
     */
    toBinarization(value) {
        if (value == undefined) {
            var threshold = this.otsu(this.AvgGrayscale().getStatsGraysacle(), this.pixelNumber);
            value = threshold;
        }
        for (let i = 0; i < this.pixelNumber; i++){
            this.r[i] = (this.r[i] > value) ? 255 : 0;
            this.g[i] = (this.g[i] > value) ? 255 : 0;
            this.b[i] = (this.b[i] > value) ? 255 : 0;
        }
        return this;
    }
    /**回傳Bitmap */
    getBitmap() {
        var temp = RGBA.createByRGBAobject(this);
        if (this.isGrayscale == false) {
            temp.AvgGrayscale();
        }
        if (temp.isBinarization == false) {
            temp.toBinarization();
        }
        return new Bitmap(temp.width, temp.height).data(temp.r);
    }
    /* 有損不透明度 */
    toOpacity(value) {
        if (!(value >= 0 && value <= 255)) {
            console.log("數值要在0到255之間。");
            return;
        }
        for (let i = 0; i < this.pixelNumber; i++) {
            this.a[i] = value;
        }
        return this;
    }
    /* 無損不透明度 */ // 未完成
    toLosslessOpacity(value) {
        var max = Math.max(...this.a); //Maximum call stack size exceeded 超出最大呼叫堆栈大小
        var min = Math.min(...this.a); //
        if (value == 'max') {
            value = 255 - max;
        }
        if (value == 'min') {
            value = (-min);
        }
        if (value < min || value > max) {
            console.log('輸入的數值會導致透明度有損');
        } else {
            for (let i = 0; i < this.pixelNumber; i++) {
                this.a[i + 3] += value;
            }
        }
        return this;
    }
    /* 亮度 */
    brightness(value) {
        for (let i = 0; i < this.pixelNumber; i++) {
            this.r[i] += value;
            this.g[i] += value;
            this.b[i] += value;
        }
        return this;
    }
    avgColor() {
        const reducer = (a, b) => a + b;
        const avgR = this.r.reduce(reducer)/this.pixelNumber;
        const avgG = this.g.reduce(reducer)/this.pixelNumber;
        const avgB = this.g.reduce(reducer)/this.pixelNumber;
        for (let i = 0; i < this.pixelNumber; i++){
            this.r[i] = avgR;
            this.g[i] = avgG;
            this.b[i] = avgB;
        }
        return this;
    }
    /* 馬賽克 */ // 未完成
    pixelate(density, x = 0, y = 0, w = this.width, h = this.height, shape = 'rectangle') {
        return this;
    }
    blur(value) { // 未完成
        for (let i = 0; i < this.pixelNumber; i++) {
        }
        return this
    }
    toReverse(){
        this.r.reverse();
        this.g.reverse();
        this.b.reverse();
        this.a.reverse();
    }
    /** along x-axis to reverse. */
    reverseAlongXAxis() {
        for (let i = 0; i < this.height; i++) {
            var begin = this.width * i;
            var end = this.width * (i + 1);
            var tempR = this.r.slice(begin, end).reverse();
            var tempG = this.g.slice(begin, end).reverse();
            var tempB = this.b.slice(begin, end).reverse();
            var tempA = this.a.slice(begin, end).reverse();
            for (let j = 0; j < this.width; j++) {
                this.r[begin + j] = tempR[j];
                this.g[begin + j] = tempG[j];
                this.b[begin + j] = tempB[j];
                this.a[begin + j] = tempA[j];
            }
        }
        return this;
    }
    /** along y-axis to reverse. */
    reverseAlongYAxis() {
        for (let i = 0; i < this.width; i++) {
            var tempR = [];
            var tempG = [];
            var tempB = [];
            var tempA = [];
            for (let j = 0; j < this.height; j++) {
                var begin = this.width * j;
                tempR[j] = this.r[this.width * j + i];
                tempG[j] = this.g[this.width * j + i];
                tempB[j] = this.b[this.width * j + i];
                tempA[j] = this.a[this.width * j + i];
            }
            tempR.reverse();
            tempG.reverse();
            tempB.reverse();
            tempA.reverse();
            for (let j = 0; j < this.height; j++) {
                this.r[this.width * j + i] = tempR[j];
                this.g[this.width * j + i] = tempG[j];
                this.b[this.width * j + i] = tempB[j];
                this.a[this.width * j + i] = tempA[j];
            }
        }
        return this;
    }
    /**各向異性擴散的一次計算 */
    calcAnisotropy(k, lambda, color) {
        var NI, SI, EI, WI, cN, cS, cE, cW;
        var w = this.width;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < w; j++) {
                if (!(color[w * (i - 1) + j] == undefined)) {
                    NI = color[w * (i - 1) + j] - color[w * i + j];
                    cN = Math.exp(-(NI*NI)/(k*k));
                } else {
                    NI = cN = 0;
                }
                if (!(color[w * (i + 1) + j] == undefined)) {
                    SI = color[w * (i + 1) + j] - color[w * i + j];
                    cS = Math.exp(-(SI*SI)/(k*k));
                } else {
                    SI = cS = 0;
                }
                if (!(color[w * i + j + 1] == undefined)) {
                    EI = color[w * i + j + 1] - color[w * i + j];
                    cE = Math.exp(-(EI*EI)/(k*k));
                } else {
                    EI = cE = 0;
                }
                if (!(color[w * i + j - 1] == undefined)) {
                    WI = color[w * i + j - 1] - color[w * i + j];
                    cW = Math.exp(-(WI*WI)/(k*k));
                } else {
                    WI = cW = 0;
                }
                color[w * i + j] += lambda * (cN * NI + cS * SI + cE * EI + cW * WI);
            }
        }
    }
    /** 各向異性擴散
     * 迭代方程
     * I(t+1)=I(t)+λ(cN_{x,y}▽_N(I_t)+cS_{x,y}▽_s(I_t)+cE_{x,y}▽_E(I_t)+cW_{x,y}▽_w(I_t))
     * E:東, S:南, W:西, N:北;
     * 各方向求導
     * ▽_N(I_{x,y})=I_{x,y-1}-I_{x,y}
     * ▽_S(I_{x,y})=I_{x,y+1}-I_{x,y}
     * ▽_E(I_{x,y})=I_{x-1,y}-I_{x,y}
     * ▽_W(I_{x,y})=I_{x+1,y}-I_{x,y}
     * 導熱係數
     * cN_{x,y} = exp(-||▽_N(I)||^2/k^2)
     * cS_{x,y} = exp(-||▽_S(I)||^2/k^2)
     * cE_{x,y} = exp(-||▽_E(I)||^2/k^2)
     * cW_{x,y} = exp(-||▽_W(I)||^2/k^2)
     * 使用函數
     * f(x) = exp(-x^2)
     * 一階導數
     * f(x) = 2x*exp(-x^2)
     * x很大時，f(x)會收斂到0，因此邊界會被保留
     * @param {number} k - 導熱係數，模糊程度
     * @param {number} lambda - 控制平滑，0-1
     * @param {number} N - 迭代次數，正整數
     */
    filterAnisotropy(k, lambda, N) {
        for (let n = 0; n < N; n++) {
            this.calcAnisotropy(k, lambda, this.r);
            this.calcAnisotropy(k, lambda, this.g);
            this.calcAnisotropy(k, lambda, this.b);
        }
        return this;
    }
}