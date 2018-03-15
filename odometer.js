class Odometer {

    constructor(sizeRatio = 1.0) {
        this.background = "transparent";//#fff";
        this.borderColour = "grey";
        this.textColour = "red";
        this.textFont = "calibri";
        this.textWidth = 15 * sizeRatio;
        this.textHeight = 21 * sizeRatio;
        this.textLeftMargin = 2 * sizeRatio;
        this.textTopMargin = 6 * sizeRatio;

        this.digits = [];
        this.speed = 1.0;//0.45;

        this.container = document.createElement("div");
        this.container.className = "canvas-odometer";

        this.targetNumber = 0;

        this.buildDigitsCanvas();
    }

    buildDigitsCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.textWidth;
        canvas.height = 11*this.textHeight + this.textTopMargin;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = this.textColour;
        ctx.font = this.textHeight+"px "+this.textFont;
        ctx.fillText("9",this.textLeftMargin,this.textHeight);
        for (var i = 0; i < 10;++i) {
            ctx.fillStyle = this.textColour;
            ctx.fillText(i.toString(), this.textLeftMargin,(i+2)*this.textHeight);
            ctx.fillStyle = this.borderColour;
            ctx.fillRect(0,(i+1)*this.textHeight+this.textHeight*0.165, this.textWidth, 2);
        }
        ctx.fillRect(0,this.textHeight*0.165, this.textWidth, 2);
        ctx.fillRect(0,11*this.textHeight+this.textHeight*0.165, this.textWidth, 2);

        this.digitsCanvas = canvas;
    }

    appendTo(node) {
        node.appendChild(this.container);
    }

    newDigit() {
        const digit = new OdometerDigit(this);
        digit.appendTo(this.container);
        digit.stopCallback = this._digitStopCallback.bind(this, this.digits.length);
        this.digits.push(digit);
        digit.spin();
    }

    removeDigit() {
        const lastDigit = this.digits.pop();
        lastDigit.stop();
        lastDigit.remove();
    }

    _digitStopCallback(index) {
        //console.log("stop", index);
        if (index + 1 < this.digits.length) {
            const nextDigit = this.digits[index+1];
            nextDigit.stopOnDigit(parseInt(this.targetNumberStr[index+1]));
        }
    }

    set(number) {
        const shouldGoUp = number > this.targetNumber;
        const numberStr = number.toString();
        this.targetNumber = number;
        this.targetNumberStr = numberStr;
        //console.log(numberStr);



        const length = numberStr.length;

        while (this.digits.length < length) {
            this.newDigit();
        } 
        while (this.digits.length > length) {
            this.removeDigit();
        }

        let nbDifferents = 0;
        for (var i = 0, l = length; i < l; ++i) {
            let digit = this.digits[i];
            digit.directionIsUp = shouldGoUp;
            digit.speed = this.speed * (2.0 + Math.pow(2.0, nbDifferents));
            let stopDigit = parseInt(numberStr[i]);
            if (stopDigit === digit.targetDigit && nbDifferents === 0) {

            } else {
                if (nbDifferents === 0) {
                    nbDifferents = 1;
                    digit.stopOnDigit(stopDigit);
                } else {
                    ++nbDifferents;
                    digit.spin();
                }
            }
            //digit.stopOnDigit(parseInt(numberStr[i]));
        }

        /*if (firstDifferent) {
            this.digits[0].stopOnDigit(parseInt(numberStr[0]));
        }*/
    }
    
}

class OdometerDigit {
    constructor(odometer) {
        // beautiful circular reference
        this.odometer = odometer;

        this.directionIsUp = true;
        this.isSpinning = false;

        this.position = -this.odometer.textHeight-1;
        this.speed = 2.0;

        this.shouldStopOnDigit = false;

        this.buildCanvas();
    }

    buildCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.odometer.textWidth;
        canvas.height = this.odometer.textHeight+this.odometer.textTopMargin;
        const ctx = canvas.getContext("2d");

        this.canvas = canvas;
        canvas.style.marginRight = "2px";
        this.ctx = ctx;
    }

    moveUp() {
        this.directionIsUp = true;
        this.spin();
    }

    moveDown() {
        this.directionIsUp = false;
        this.spin();
    }

    animate(time) {
        const textHeight = this.odometer.textHeight;
        let timeDiff = this.previousAnimateTime ? (time - this.previousAnimateTime) : 1.0;
        this.previousAnimateTime = time;
        let speed = (timeDiff * textHeight) * this.speed * 0.001;
        if (speed > textHeight*1.5) {
            speed = textHeight * (0.5+Math.random());
        }
        let p = this.position + speed * (this.directionIsUp ? -1 : 1) + Math.random();
        if (p < -textHeight*10) {
            p = 0;
        } else if (p > 0) {
            p = -textHeight*10;
        }

        if (this.shouldStopOnDigit && timeDiff !== 1.0) {
            const m = -textHeight * (this.targetDigit+1 || 0);
            const margin = this.speed*2 + textHeight / 30.0;
            if (p > m-margin && p < m+margin) {
                this.isSpinning = false;
                if (this.stopCallback) {
                    this.stopCallback();
                }
                p = m-1;
            }

        }

        this.position = p;
        this.draw();

        if (this.isSpinning) {
            this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.odometer.digitsCanvas, 0, this.position);
    }

    spin() {
        if (!this.isSpinning) {
            this.shouldStopOnDigit = false;
            this.isSpinning = true;
            this.previousAnimateTime = 0.0;
            this.animate(0.0);
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.previousAnimateTime = 0.0;
        this.isSpinning = false;
    }

    stopOnDigit(digit) {
        if (!this.isSpinning) {
            this.spin();
        }
        this.shouldStopOnDigit = true;
        this.targetDigit = digit;
    }

    appendTo(node) {
        node.appendChild(this.canvas);
    }

    remove() {
        if (this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
    }
}

const odo = new Odometer(5.0);
odo.appendTo(document.body);
odo.set(126789091);

document.body.appendChild(odo.digitsCanvas);
//odo.buildDigitsCanvas();
/*const digit = new OdometerDigit(odo);
digit.buildCanvas();

document.body.appendChild(odo.digitsCanvas);
//document.body.appendChild(digit.canvas);
digit.appendTo(document.body);*/

//function lol(time) {
//    digit.spin();
//    digit.draw();
//    requestAnimationFrame(lol);
//}

//lol();

/*var sizeRatio = 4.0;
var textWidth = 15 * sizeRatio;
var textHeight = 20 * sizeRatio;
var textLeftMargin = 2 * sizeRatio;
var textTopMargin = 6 * sizeRatio;

var canvas = document.createElement("canvas");
canvas.width = textWidth;
canvas.height = 11*textHeight + textTopMargin;

var ctx = canvas.getContext("2d");

ctx.fillStyle = "#cfd8dc";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#9c27b0";
ctx.font = textHeight+"px monospace";
for (var i = 0; i < 10;++i) {
    ctx.fillText(i.toString(), textLeftMargin,(i+2)*textHeight);
}
ctx.fillText("9",textLeftMargin,textHeight);
//ctx.fillText("A", 2,240);

var canvasNb1 = document.createElement("canvas");
canvasNb1.width = textWidth*2;
canvasNb1.height = textHeight+textTopMargin;

var ctx1 = canvasNb1.getContext("2d");
ctx1.fillStyle = "green";
ctx1.fillRect(0, 0, canvas.width, canvas.height);

var p = 0;
var p2 = 0;
var previousTime = 0;
function animate(time) {
    var timeDiff = time - previousTime;
    previousTime = time;
    var speed = (timeDiff * textHeight) / (500.0);
    p -= speed;
    if (p < -textHeight*10) p = 0;

    ctx1.drawImage(canvas, 0, p);

    p2 += speed;
    if (p2 > 0) p2 = -textHeight*10;
    ctx1.drawImage(canvas, textWidth, p2);

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

document.body.appendChild(canvas);
document.body.appendChild(canvasNb1);*/