"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FloatOdometer = function () {
    function FloatOdometer(sizeRatio) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, FloatOdometer);

        this.odometerIntegers = new Odometer(sizeRatio, config);
        this.odometerDecimals = new Odometer(sizeRatio, config);

        this.container = document.createElement("div");
        this.container.className = "canvas-float-odometer";
        this.container.style.display = "flex";
        //this.container.style.justifyContent = "center";

        this.minus = document.createElement("div");
        this.minus.className = "canvas-odomoter-minus";
        this.minus.appendChild(document.createTextNode("-"));
        this.minus.style.fontSize = this.odometerDecimals.textHeight + "px";
        this.minus.style.color = this.odometerDecimals.textColour;
        this.container.appendChild(this.minus);

        this.odometerIntegers.appendTo(this.container);

        this.dot = document.createElement("div");
        this.dot.className = "canvas-odomoter-dot";
        this.dot.appendChild(document.createTextNode("."));
        this.dot.style.fontSize = this.odometerDecimals.textHeight + "px";
        this.dot.style.color = this.odometerDecimals.textColour;
        this.container.appendChild(this.dot);

        this.odometerDecimals.appendTo(this.container);

        this.exp = document.createElement("div");
        this.exp.className = "canvas-odomoter-exp";
        this.exp.appendChild(document.createTextNode(""));
        this.exp.style.fontSize = this.odometerDecimals.textHeight + "px";
        this.exp.style.color = this.odometerDecimals.textColour;
        this.container.appendChild(this.exp);

        this.lastNumber = 0.0;
    }

    _createClass(FloatOdometer, [{
        key: "set",
        value: function set(number) {
            var shouldGoUp = number > this.lastNumber;
            if (number < 0) shouldGoUp = !shouldGoUp;

            var numberStr = number.toString();
            var match = numberStr.match(/(-?)(\d*)(\.?)(\d*)(e[\-+]\d+)?/);
            if (!match) {
                console.log("Unable to parse the number string", numberStr);
                return;
            }

            var isNegative = !!match[1];
            var integerDigits = match[2];
            var hasDot = !!match[3];
            var decimalDigits = match[4];
            var exp = match[5];

            this.odometerIntegers.set(integerDigits, shouldGoUp);
            this.odometerDecimals.set(decimalDigits, shouldGoUp);

            this.minus.style.visibility = isNegative ? "visible" : "hidden";
            this.dot.style.visibility = hasDot ? "visible" : "hidden";
            this.exp.firstChild.data = exp ? exp : "";

            this.lastNumber = number;
        }
    }, {
        key: "appendTo",
        value: function appendTo(node) {
            node.appendChild(this.container);
        }
    }]);

    return FloatOdometer;
}();

var Odometer = function () {
    function Odometer() {
        var sizeRatio = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Odometer);

        this.background = config.background || "transparent";
        this.borderColour = config.borderColour || "grey";
        this.textColour = config.textColour || "red";
        this.textFont = config.textFont || "sans-serif";
        this.textWidth = (config.textWidth || 15) * sizeRatio;
        this.textHeight = (config.textHeight || 22) * sizeRatio;
        this.textLeftMargin = (config.textLeftMargin || 2) * sizeRatio;
        this.textTopMargin = (config.textTopMargin || 6) * sizeRatio;
        this.borderPositonRatio = config.borderPositonRatio || 0.13;

        this.digits = [];
        this.speed = config.speed || 1.0;

        this.container = document.createElement("div");
        this.container.className = "canvas-odometer";

        this.targetNumber = 0;

        this.buildDigitsCanvas();
    }

    _createClass(Odometer, [{
        key: "buildDigitsCanvas",
        value: function buildDigitsCanvas() {
            var canvas = document.createElement("canvas");
            canvas.width = this.textWidth;
            canvas.height = 11 * this.textHeight + this.textTopMargin;

            var ctx = canvas.getContext("2d");
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = this.textColour;
            ctx.font = this.textHeight + "px " + this.textFont;
            ctx.fillText("9", this.textLeftMargin, this.textHeight);
            for (var i = 0; i < 10; ++i) {
                ctx.fillStyle = this.textColour;
                ctx.fillText(i.toString(), this.textLeftMargin, (i + 2) * this.textHeight);
                ctx.fillStyle = this.borderColour;
                ctx.fillRect(0, (i + 1) * this.textHeight + this.textHeight * this.borderPositonRatio, this.textWidth, 2);
            }
            ctx.fillRect(0, this.textHeight * this.borderPositionRatio, this.textWidth, 2);
            ctx.fillRect(0, 11 * this.textHeight + this.textHeight * this.borderPositonRatio, this.textWidth, 2);

            this.digitsCanvas = canvas;
        }
    }, {
        key: "appendTo",
        value: function appendTo(node) {
            node.appendChild(this.container);
        }
    }, {
        key: "newDigit",
        value: function newDigit() {
            var digit = new OdometerDigit(this);
            digit.appendTo(this.container);
            digit.stopCallback = this._digitStopCallback.bind(this, this.digits.length);
            this.digits.push(digit);
            digit.spin();
        }
    }, {
        key: "removeDigit",
        value: function removeDigit() {
            var lastDigit = this.digits.pop();
            lastDigit.stop();
            lastDigit.remove();
        }
    }, {
        key: "_digitStopCallback",
        value: function _digitStopCallback(index) {
            if (index + 1 < this.digits.length) {
                var nextDigit = this.digits[index + 1];
                nextDigit.stopOnDigit(parseInt(this.targetNumberStr[index + 1]));
            }
        }
    }, {
        key: "set",
        value: function set(number, shouldGoUp) {
            if (shouldGoUp === undefined) {
                shouldGoUp = number > this.targetNumber;
            }

            var numberStr = number.toString();
            this.targetNumber = number;
            this.targetNumberStr = numberStr;

            var length = numberStr.length;

            while (this.digits.length < length) {
                this.newDigit();
            }
            while (this.digits.length > length) {
                this.removeDigit();
            }

            var nbDifferents = 0;
            for (var i = 0, l = length; i < l; ++i) {
                var digit = this.digits[i];
                digit.directionIsUp = shouldGoUp;
                digit.speed = this.speed * (2.0 + Math.pow(2.0, nbDifferents));
                var stopDigit = parseInt(numberStr[i]);
                if (stopDigit === digit.targetDigit && nbDifferents === 0) {} else {
                    if (nbDifferents === 0) {
                        nbDifferents = 1;
                        digit.stopOnDigit(stopDigit);
                    } else {
                        ++nbDifferents;
                        digit.spin();
                    }
                }
            }
        }
    }]);

    return Odometer;
}();

var OdometerDigit = function () {
    function OdometerDigit(odometer) {
        _classCallCheck(this, OdometerDigit);

        this.odometer = odometer;

        this.directionIsUp = true;
        this.isSpinning = false;

        this.position = -this.odometer.textHeight - 1;
        this.speed = 2.0;

        this.shouldStopOnDigit = false;

        this.buildCanvas();
    }

    _createClass(OdometerDigit, [{
        key: "buildCanvas",
        value: function buildCanvas() {
            var canvas = document.createElement("canvas");
            canvas.width = this.odometer.textWidth;
            canvas.height = this.odometer.textHeight + this.odometer.textTopMargin;
            var ctx = canvas.getContext("2d");

            this.canvas = canvas;
            canvas.style.marginRight = "2px";
            this.ctx = ctx;
        }
    }, {
        key: "moveUp",
        value: function moveUp() {
            this.directionIsUp = true;
            this.spin();
        }
    }, {
        key: "moveDown",
        value: function moveDown() {
            this.directionIsUp = false;
            this.spin();
        }
    }, {
        key: "animate",
        value: function animate(time) {
            var textHeight = this.odometer.textHeight;
            var timeDiff = this.previousAnimateTime ? time - this.previousAnimateTime : 1.0;
            this.previousAnimateTime = time;
            var speed = timeDiff * textHeight * this.speed * 0.001;
            if (speed > textHeight * 1.5) {
                speed = textHeight * (0.5 + Math.random());
            }
            var p = this.position + speed * (this.directionIsUp ? -1 : 1) + Math.random();
            if (p < -textHeight * 10) {
                p = 0;
            } else if (p > 0) {
                p = -textHeight * 10;
            }

            if (this.shouldStopOnDigit && timeDiff !== 1.0) {
                var m = -textHeight * (this.targetDigit + 1 || 0);
                var margin = this.speed * 2 + textHeight / 30.0;
                if (p > m - margin && p < m + margin) {
                    this.isSpinning = false;
                    if (this.stopCallback) {
                        this.stopCallback();
                    }
                    p = m - 1;
                }
            }

            this.position = p;
            this.draw();

            if (this.isSpinning) {
                this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
            }
        }
    }, {
        key: "draw",
        value: function draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.odometer.digitsCanvas, 0, this.position);
        }
    }, {
        key: "spin",
        value: function spin() {
            if (!this.isSpinning) {
                this.shouldStopOnDigit = false;
                this.isSpinning = true;
                this.previousAnimateTime = 0.0;
                this.animate(0.0);
            }
        }
    }, {
        key: "stop",
        value: function stop() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.previousAnimateTime = 0.0;
            this.isSpinning = false;
        }
    }, {
        key: "stopOnDigit",
        value: function stopOnDigit(digit) {
            if (!this.isSpinning) {
                this.spin();
            }
            this.shouldStopOnDigit = true;
            this.targetDigit = digit;
        }
    }, {
        key: "appendTo",
        value: function appendTo(node) {
            node.appendChild(this.canvas);
        }
    }, {
        key: "remove",
        value: function remove() {
            if (this.canvas.parentElement) {
                this.canvas.parentElement.removeChild(this.canvas);
            }
        }
    }]);

    return OdometerDigit;
}();

var odo = new FloatOdometer(4.0);
odo.appendTo(document.body);
odo.set(123.456);

//document.body.appendChild(odo.digitsCanvas);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBIiwiZmlsZSI6Im9kb21ldGVyLm9sZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEZsb2F0T2RvbWV0ZXIge1xyXG4gICAgY29uc3RydWN0b3Ioc2l6ZVJhdGlvLCBjb25maWcgPSB7fSkge1xyXG4gICAgICAgIHRoaXMub2RvbWV0ZXJJbnRlZ2VycyA9IG5ldyBPZG9tZXRlcihzaXplUmF0aW8sIGNvbmZpZyk7XHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckRlY2ltYWxzID0gbmV3IE9kb21ldGVyKHNpemVSYXRpbywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9IFwiY2FudmFzLWZsb2F0LW9kb21ldGVyXCI7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgIC8vdGhpcy5jb250YWluZXIuc3R5bGUuanVzdGlmeUNvbnRlbnQgPSBcImNlbnRlclwiO1xyXG5cclxuICAgICAgICB0aGlzLm1pbnVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICB0aGlzLm1pbnVzLmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21vdGVyLW1pbnVzXCI7XHJcbiAgICAgICAgdGhpcy5taW51cy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIi1cIikpO1xyXG4gICAgICAgIHRoaXMubWludXMuc3R5bGUuZm9udFNpemUgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dEhlaWdodCtcInB4XCI7XHJcbiAgICAgICAgdGhpcy5taW51cy5zdHlsZS5jb2xvciA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0Q29sb3VyO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMubWludXMpO1xyXG5cclxuICAgICAgICB0aGlzLm9kb21ldGVySW50ZWdlcnMuYXBwZW5kVG8odGhpcy5jb250YWluZXIpO1xyXG5cclxuICAgICAgICB0aGlzLmRvdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgdGhpcy5kb3QuY2xhc3NOYW1lID0gXCJjYW52YXMtb2RvbW90ZXItZG90XCI7XHJcbiAgICAgICAgdGhpcy5kb3QuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCIuXCIpKTtcclxuICAgICAgICB0aGlzLmRvdC5zdHlsZS5mb250U2l6ZSA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0SGVpZ2h0K1wicHhcIjtcclxuICAgICAgICB0aGlzLmRvdC5zdHlsZS5jb2xvciA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0Q29sb3VyO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZG90KTtcclxuXHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckRlY2ltYWxzLmFwcGVuZFRvKHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmV4cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgdGhpcy5leHAuY2xhc3NOYW1lID0gXCJjYW52YXMtb2RvbW90ZXItZXhwXCI7XHJcbiAgICAgICAgdGhpcy5leHAuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIikpO1xyXG4gICAgICAgIHRoaXMuZXhwLnN0eWxlLmZvbnRTaXplID0gdGhpcy5vZG9tZXRlckRlY2ltYWxzLnRleHRIZWlnaHQrXCJweFwiO1xyXG4gICAgICAgIHRoaXMuZXhwLnN0eWxlLmNvbG9yID0gdGhpcy5vZG9tZXRlckRlY2ltYWxzLnRleHRDb2xvdXI7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5leHApO1xyXG5cclxuICAgICAgICB0aGlzLmxhc3ROdW1iZXIgPSAwLjA7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldChudW1iZXIpIHtcclxuICAgICAgICBsZXQgc2hvdWxkR29VcCA9IG51bWJlciA+IHRoaXMubGFzdE51bWJlcjtcclxuICAgICAgICBpZiAobnVtYmVyIDwgMCkgc2hvdWxkR29VcCA9ICFzaG91bGRHb1VwO1xyXG5cclxuXHJcbiAgICAgICAgY29uc3QgbnVtYmVyU3RyID0gbnVtYmVyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBudW1iZXJTdHIubWF0Y2goLygtPykoXFxkKikoXFwuPykoXFxkKikoZVtcXC0rXVxcZCspPy8pO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbmFibGUgdG8gcGFyc2UgdGhlIG51bWJlciBzdHJpbmdcIiwgbnVtYmVyU3RyKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaXNOZWdhdGl2ZSA9ICEhbWF0Y2hbMV07XHJcbiAgICAgICAgY29uc3QgaW50ZWdlckRpZ2l0cyA9IG1hdGNoWzJdO1xyXG4gICAgICAgIGNvbnN0IGhhc0RvdCA9ICEhbWF0Y2hbM107XHJcbiAgICAgICAgY29uc3QgZGVjaW1hbERpZ2l0cyA9IG1hdGNoWzRdO1xyXG4gICAgICAgIGNvbnN0IGV4cCA9IG1hdGNoWzVdO1xyXG5cclxuICAgICAgICB0aGlzLm9kb21ldGVySW50ZWdlcnMuc2V0KGludGVnZXJEaWdpdHMsIHNob3VsZEdvVXApO1xyXG4gICAgICAgIHRoaXMub2RvbWV0ZXJEZWNpbWFscy5zZXQoZGVjaW1hbERpZ2l0cywgc2hvdWxkR29VcCk7XHJcblxyXG4gICAgICAgIHRoaXMubWludXMuc3R5bGUudmlzaWJpbGl0eSA9IGlzTmVnYXRpdmUgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCI7XHJcbiAgICAgICAgdGhpcy5kb3Quc3R5bGUudmlzaWJpbGl0eSA9IGhhc0RvdCA/IFwidmlzaWJsZVwiIDogXCJoaWRkZW5cIjtcclxuICAgICAgICB0aGlzLmV4cC5maXJzdENoaWxkLmRhdGEgPSBleHAgPyBleHAgOiBcIlwiO1xyXG5cclxuICAgICAgICB0aGlzLmxhc3ROdW1iZXIgPSBudW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kVG8obm9kZSkge1xyXG4gICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBPZG9tZXRlciB7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2l6ZVJhdGlvID0gMS4wLCBjb25maWcgPSB7fSkge1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IGNvbmZpZy5iYWNrZ3JvdW5kIHx8IFwidHJhbnNwYXJlbnRcIjtcclxuICAgICAgICB0aGlzLmJvcmRlckNvbG91ciA9IGNvbmZpZy5ib3JkZXJDb2xvdXIgfHwgXCJncmV5XCI7XHJcbiAgICAgICAgdGhpcy50ZXh0Q29sb3VyID0gY29uZmlnLnRleHRDb2xvdXIgfHwgXCJyZWRcIjtcclxuICAgICAgICB0aGlzLnRleHRGb250ID0gY29uZmlnLnRleHRGb250IHx8IFwic2Fucy1zZXJpZlwiO1xyXG4gICAgICAgIHRoaXMudGV4dFdpZHRoID0gKGNvbmZpZy50ZXh0V2lkdGggfHwgMTUpICogc2l6ZVJhdGlvO1xyXG4gICAgICAgIHRoaXMudGV4dEhlaWdodCA9IChjb25maWcudGV4dEhlaWdodCB8fCAyMikgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy50ZXh0TGVmdE1hcmdpbiA9IChjb25maWcudGV4dExlZnRNYXJnaW4gfHwgMikgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy50ZXh0VG9wTWFyZ2luID0gKGNvbmZpZy50ZXh0VG9wTWFyZ2luIHx8IDYpICogc2l6ZVJhdGlvO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyUG9zaXRvblJhdGlvID0gY29uZmlnLmJvcmRlclBvc2l0b25SYXRpbyB8fCAwLjEzO1xyXG5cclxuICAgICAgICB0aGlzLmRpZ2l0cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBjb25maWcuc3BlZWQgfHwgMS4wO1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gXCJjYW52YXMtb2RvbWV0ZXJcIjtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXROdW1iZXIgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkRGlnaXRzQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYnVpbGREaWdpdHNDYW52YXMoKSB7XHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSB0aGlzLnRleHRXaWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gMTEqdGhpcy50ZXh0SGVpZ2h0ICsgdGhpcy50ZXh0VG9wTWFyZ2luO1xyXG5cclxuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmJhY2tncm91bmQ7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnRleHRDb2xvdXI7XHJcbiAgICAgICAgY3R4LmZvbnQgPSB0aGlzLnRleHRIZWlnaHQrXCJweCBcIit0aGlzLnRleHRGb250O1xyXG4gICAgICAgIGN0eC5maWxsVGV4dChcIjlcIix0aGlzLnRleHRMZWZ0TWFyZ2luLHRoaXMudGV4dEhlaWdodCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDsrK2kpIHtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMudGV4dENvbG91cjtcclxuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KGkudG9TdHJpbmcoKSwgdGhpcy50ZXh0TGVmdE1hcmdpbiwoaSsyKSp0aGlzLnRleHRIZWlnaHQpO1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5ib3JkZXJDb2xvdXI7XHJcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLChpKzEpKnRoaXMudGV4dEhlaWdodCt0aGlzLnRleHRIZWlnaHQqdGhpcy5ib3JkZXJQb3NpdG9uUmF0aW8sIHRoaXMudGV4dFdpZHRoLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsdGhpcy50ZXh0SGVpZ2h0KnRoaXMuYm9yZGVyUG9zaXRpb25SYXRpbywgdGhpcy50ZXh0V2lkdGgsIDIpO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLDExKnRoaXMudGV4dEhlaWdodCt0aGlzLnRleHRIZWlnaHQqdGhpcy5ib3JkZXJQb3NpdG9uUmF0aW8sIHRoaXMudGV4dFdpZHRoLCAyKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaWdpdHNDYW52YXMgPSBjYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kVG8obm9kZSkge1xyXG4gICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG5ld0RpZ2l0KCkge1xyXG4gICAgICAgIGNvbnN0IGRpZ2l0ID0gbmV3IE9kb21ldGVyRGlnaXQodGhpcyk7XHJcbiAgICAgICAgZGlnaXQuYXBwZW5kVG8odGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIGRpZ2l0LnN0b3BDYWxsYmFjayA9IHRoaXMuX2RpZ2l0U3RvcENhbGxiYWNrLmJpbmQodGhpcywgdGhpcy5kaWdpdHMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLmRpZ2l0cy5wdXNoKGRpZ2l0KTtcclxuICAgICAgICBkaWdpdC5zcGluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRGlnaXQoKSB7XHJcbiAgICAgICAgY29uc3QgbGFzdERpZ2l0ID0gdGhpcy5kaWdpdHMucG9wKCk7XHJcbiAgICAgICAgbGFzdERpZ2l0LnN0b3AoKTtcclxuICAgICAgICBsYXN0RGlnaXQucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2RpZ2l0U3RvcENhbGxiYWNrKGluZGV4KSB7XHJcbiAgICAgICAgaWYgKGluZGV4ICsgMSA8IHRoaXMuZGlnaXRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBuZXh0RGlnaXQgPSB0aGlzLmRpZ2l0c1tpbmRleCsxXTtcclxuICAgICAgICAgICAgbmV4dERpZ2l0LnN0b3BPbkRpZ2l0KHBhcnNlSW50KHRoaXMudGFyZ2V0TnVtYmVyU3RyW2luZGV4KzFdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldChudW1iZXIsIHNob3VsZEdvVXApIHtcclxuICAgICAgICBpZiAoc2hvdWxkR29VcCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHNob3VsZEdvVXAgPSBudW1iZXIgPiB0aGlzLnRhcmdldE51bWJlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG51bWJlclN0ciA9IG51bWJlci50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyID0gbnVtYmVyO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyU3RyID0gbnVtYmVyU3RyO1xyXG5cclxuICAgICAgICBjb25zdCBsZW5ndGggPSBudW1iZXJTdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICB3aGlsZSAodGhpcy5kaWdpdHMubGVuZ3RoIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV3RGlnaXQoKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIHdoaWxlICh0aGlzLmRpZ2l0cy5sZW5ndGggPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVEaWdpdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5iRGlmZmVyZW50cyA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuICAgICAgICAgICAgbGV0IGRpZ2l0ID0gdGhpcy5kaWdpdHNbaV07XHJcbiAgICAgICAgICAgIGRpZ2l0LmRpcmVjdGlvbklzVXAgPSBzaG91bGRHb1VwO1xyXG4gICAgICAgICAgICBkaWdpdC5zcGVlZCA9IHRoaXMuc3BlZWQgKiAoMi4wICsgTWF0aC5wb3coMi4wLCBuYkRpZmZlcmVudHMpKTtcclxuICAgICAgICAgICAgbGV0IHN0b3BEaWdpdCA9IHBhcnNlSW50KG51bWJlclN0cltpXSk7XHJcbiAgICAgICAgICAgIGlmIChzdG9wRGlnaXQgPT09IGRpZ2l0LnRhcmdldERpZ2l0ICYmIG5iRGlmZmVyZW50cyA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChuYkRpZmZlcmVudHMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBuYkRpZmZlcmVudHMgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LnN0b3BPbkRpZ2l0KHN0b3BEaWdpdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICsrbmJEaWZmZXJlbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LnNwaW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBPZG9tZXRlckRpZ2l0IHtcclxuICAgIGNvbnN0cnVjdG9yKG9kb21ldGVyKSB7XHJcbiAgICAgICAgdGhpcy5vZG9tZXRlciA9IG9kb21ldGVyO1xyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbklzVXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNTcGlubmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gLXRoaXMub2RvbWV0ZXIudGV4dEhlaWdodC0xO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvdWxkU3RvcE9uRGlnaXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZENhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkQ2FudmFzKCkge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gdGhpcy5vZG9tZXRlci50ZXh0V2lkdGg7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHRoaXMub2RvbWV0ZXIudGV4dEhlaWdodCt0aGlzLm9kb21ldGVyLnRleHRUb3BNYXJnaW47XHJcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgICAgY2FudmFzLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCIycHhcIjtcclxuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb25Jc1VwID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNwaW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbklzVXAgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNwaW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBhbmltYXRlKHRpbWUpIHtcclxuICAgICAgICBjb25zdCB0ZXh0SGVpZ2h0ID0gdGhpcy5vZG9tZXRlci50ZXh0SGVpZ2h0O1xyXG4gICAgICAgIGxldCB0aW1lRGlmZiA9IHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA/ICh0aW1lIC0gdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lKSA6IDEuMDtcclxuICAgICAgICB0aGlzLnByZXZpb3VzQW5pbWF0ZVRpbWUgPSB0aW1lO1xyXG4gICAgICAgIGxldCBzcGVlZCA9ICh0aW1lRGlmZiAqIHRleHRIZWlnaHQpICogdGhpcy5zcGVlZCAqIDAuMDAxO1xyXG4gICAgICAgIGlmIChzcGVlZCA+IHRleHRIZWlnaHQqMS41KSB7XHJcbiAgICAgICAgICAgIHNwZWVkID0gdGV4dEhlaWdodCAqICgwLjUrTWF0aC5yYW5kb20oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBwID0gdGhpcy5wb3NpdGlvbiArIHNwZWVkICogKHRoaXMuZGlyZWN0aW9uSXNVcCA/IC0xIDogMSkgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIGlmIChwIDwgLXRleHRIZWlnaHQqMTApIHtcclxuICAgICAgICAgICAgcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwID4gMCkge1xyXG4gICAgICAgICAgICBwID0gLXRleHRIZWlnaHQqMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG91bGRTdG9wT25EaWdpdCAmJiB0aW1lRGlmZiAhPT0gMS4wKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG0gPSAtdGV4dEhlaWdodCAqICh0aGlzLnRhcmdldERpZ2l0KzEgfHwgMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IHRoaXMuc3BlZWQqMiArIHRleHRIZWlnaHQgLyAzMC4wO1xyXG4gICAgICAgICAgICBpZiAocCA+IG0tbWFyZ2luICYmIHAgPCBtK21hcmdpbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NwaW5uaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdG9wQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcCA9IG0tMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc1NwaW5uaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLm9kb21ldGVyLmRpZ2l0c0NhbnZhcywgMCwgdGhpcy5wb3NpdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgc3BpbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNTcGlubmluZykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3VsZFN0b3BPbkRpZ2l0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNTcGlubmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA9IDAuMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRlKDAuMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uRnJhbWVJZCkge1xyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZXZpb3VzQW5pbWF0ZVRpbWUgPSAwLjA7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uaW5nID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcE9uRGlnaXQoZGlnaXQpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaXNTcGlubmluZykge1xyXG4gICAgICAgICAgICB0aGlzLnNwaW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG91bGRTdG9wT25EaWdpdCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy50YXJnZXREaWdpdCA9IGRpZ2l0O1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGVuZFRvKG5vZGUpIHtcclxuICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FudmFzLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNhbnZhcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jb25zdCBvZG8gPSBuZXcgRmxvYXRPZG9tZXRlcig0LjApO1xyXG5vZG8uYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbm9kby5zZXQoMTIzLjQ1Nik7XHJcblxyXG4vL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob2RvLmRpZ2l0c0NhbnZhcyk7XHJcbi8vb2RvLmJ1aWxkRGlnaXRzQ2FudmFzKCk7XHJcbi8qY29uc3QgZGlnaXQgPSBuZXcgT2RvbWV0ZXJEaWdpdChvZG8pO1xyXG5kaWdpdC5idWlsZENhbnZhcygpO1xyXG5cclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvZG8uZGlnaXRzQ2FudmFzKTtcclxuLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpZ2l0LmNhbnZhcyk7XHJcbmRpZ2l0LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpOyovXHJcblxyXG4vL2Z1bmN0aW9uIGxvbCh0aW1lKSB7XHJcbi8vICAgIGRpZ2l0LnNwaW4oKTtcclxuLy8gICAgZGlnaXQuZHJhdygpO1xyXG4vLyAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9sKTtcclxuLy99XHJcblxyXG4vL2xvbCgpO1xyXG5cclxuLyp2YXIgc2l6ZVJhdGlvID0gNC4wO1xyXG52YXIgdGV4dFdpZHRoID0gMTUgKiBzaXplUmF0aW87XHJcbnZhciB0ZXh0SGVpZ2h0ID0gMjAgKiBzaXplUmF0aW87XHJcbnZhciB0ZXh0TGVmdE1hcmdpbiA9IDIgKiBzaXplUmF0aW87XHJcbnZhciB0ZXh0VG9wTWFyZ2luID0gNiAqIHNpemVSYXRpbztcclxuXHJcbnZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5jYW52YXMud2lkdGggPSB0ZXh0V2lkdGg7XHJcbmNhbnZhcy5oZWlnaHQgPSAxMSp0ZXh0SGVpZ2h0ICsgdGV4dFRvcE1hcmdpbjtcclxuXHJcbnZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuY3R4LmZpbGxTdHlsZSA9IFwiI2NmZDhkY1wiO1xyXG5jdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbmN0eC5maWxsU3R5bGUgPSBcIiM5YzI3YjBcIjtcclxuY3R4LmZvbnQgPSB0ZXh0SGVpZ2h0K1wicHggbW9ub3NwYWNlXCI7XHJcbmZvciAodmFyIGkgPSAwOyBpIDwgMTA7KytpKSB7XHJcbiAgICBjdHguZmlsbFRleHQoaS50b1N0cmluZygpLCB0ZXh0TGVmdE1hcmdpbiwoaSsyKSp0ZXh0SGVpZ2h0KTtcclxufVxyXG5jdHguZmlsbFRleHQoXCI5XCIsdGV4dExlZnRNYXJnaW4sdGV4dEhlaWdodCk7XHJcbi8vY3R4LmZpbGxUZXh0KFwiQVwiLCAyLDI0MCk7XHJcblxyXG52YXIgY2FudmFzTmIxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuY2FudmFzTmIxLndpZHRoID0gdGV4dFdpZHRoKjI7XHJcbmNhbnZhc05iMS5oZWlnaHQgPSB0ZXh0SGVpZ2h0K3RleHRUb3BNYXJnaW47XHJcblxyXG52YXIgY3R4MSA9IGNhbnZhc05iMS5nZXRDb250ZXh0KFwiMmRcIik7XHJcbmN0eDEuZmlsbFN0eWxlID0gXCJncmVlblwiO1xyXG5jdHgxLmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG52YXIgcCA9IDA7XHJcbnZhciBwMiA9IDA7XHJcbnZhciBwcmV2aW91c1RpbWUgPSAwO1xyXG5mdW5jdGlvbiBhbmltYXRlKHRpbWUpIHtcclxuICAgIHZhciB0aW1lRGlmZiA9IHRpbWUgLSBwcmV2aW91c1RpbWU7XHJcbiAgICBwcmV2aW91c1RpbWUgPSB0aW1lO1xyXG4gICAgdmFyIHNwZWVkID0gKHRpbWVEaWZmICogdGV4dEhlaWdodCkgLyAoNTAwLjApO1xyXG4gICAgcCAtPSBzcGVlZDtcclxuICAgIGlmIChwIDwgLXRleHRIZWlnaHQqMTApIHAgPSAwO1xyXG5cclxuICAgIGN0eDEuZHJhd0ltYWdlKGNhbnZhcywgMCwgcCk7XHJcblxyXG4gICAgcDIgKz0gc3BlZWQ7XHJcbiAgICBpZiAocDIgPiAwKSBwMiA9IC10ZXh0SGVpZ2h0KjEwO1xyXG4gICAgY3R4MS5kcmF3SW1hZ2UoY2FudmFzLCB0ZXh0V2lkdGgsIHAyKTtcclxuXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XHJcbn1cclxucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xyXG5cclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhc05iMSk7Ki8iXX0=