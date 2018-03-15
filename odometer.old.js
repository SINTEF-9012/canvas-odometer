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
                        digit.stop();
                        digit.stopOnDigit(stopDigit);
                    } else {
                        ++nbDifferents;
                        digit.dontStopOnDigit();
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
                var margin = 1 + this.speed * 2 + textHeight / 50.0;
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
        key: "dontStopOnDigit",
        value: function dontStopOnDigit() {
            this.shouldStopOnDigit = false;
            this.targetDigit = 0;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZG9tZXRlci5vbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBGbG9hdE9kb21ldGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHNpemVSYXRpbywgY29uZmlnID0ge30pIHtcclxuICAgICAgICB0aGlzLm9kb21ldGVySW50ZWdlcnMgPSBuZXcgT2RvbWV0ZXIoc2l6ZVJhdGlvLCBjb25maWcpO1xyXG4gICAgICAgIHRoaXMub2RvbWV0ZXJEZWNpbWFscyA9IG5ldyBPZG9tZXRlcihzaXplUmF0aW8sIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgPSBcImNhbnZhcy1mbG9hdC1vZG9tZXRlclwiO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAvL3RoaXMuY29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gXCJjZW50ZXJcIjtcclxuXHJcbiAgICAgICAgdGhpcy5taW51cyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgdGhpcy5taW51cy5jbGFzc05hbWUgPSBcImNhbnZhcy1vZG9tb3Rlci1taW51c1wiO1xyXG4gICAgICAgIHRoaXMubWludXMuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCItXCIpKTtcclxuICAgICAgICB0aGlzLm1pbnVzLnN0eWxlLmZvbnRTaXplID0gdGhpcy5vZG9tZXRlckRlY2ltYWxzLnRleHRIZWlnaHQrXCJweFwiO1xyXG4gICAgICAgIHRoaXMubWludXMuc3R5bGUuY29sb3IgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dENvbG91cjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLm1pbnVzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckludGVnZXJzLmFwcGVuZFRvKHRoaXMuY29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuZG90LmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21vdGVyLWRvdFwiO1xyXG4gICAgICAgIHRoaXMuZG90LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiLlwiKSk7XHJcbiAgICAgICAgdGhpcy5kb3Quc3R5bGUuZm9udFNpemUgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dEhlaWdodCtcInB4XCI7XHJcbiAgICAgICAgdGhpcy5kb3Quc3R5bGUuY29sb3IgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dENvbG91cjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmRvdCk7XHJcblxyXG4gICAgICAgIHRoaXMub2RvbWV0ZXJEZWNpbWFscy5hcHBlbmRUbyh0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5leHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuZXhwLmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21vdGVyLWV4cFwiO1xyXG4gICAgICAgIHRoaXMuZXhwLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpKTtcclxuICAgICAgICB0aGlzLmV4cC5zdHlsZS5mb250U2l6ZSA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0SGVpZ2h0K1wicHhcIjtcclxuICAgICAgICB0aGlzLmV4cC5zdHlsZS5jb2xvciA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0Q29sb3VyO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZXhwKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0TnVtYmVyID0gMC4wO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzZXQobnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHNob3VsZEdvVXAgPSBudW1iZXIgPiB0aGlzLmxhc3ROdW1iZXI7XHJcbiAgICAgICAgaWYgKG51bWJlciA8IDApIHNob3VsZEdvVXAgPSAhc2hvdWxkR29VcDtcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IG51bWJlclN0ciA9IG51bWJlci50b1N0cmluZygpO1xyXG4gICAgICAgIGNvbnN0IG1hdGNoID0gbnVtYmVyU3RyLm1hdGNoKC8oLT8pKFxcZCopKFxcLj8pKFxcZCopKGVbXFwtK11cXGQrKT8vKTtcclxuICAgICAgICBpZiAoIW1hdGNoKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5hYmxlIHRvIHBhcnNlIHRoZSBudW1iZXIgc3RyaW5nXCIsIG51bWJlclN0cik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlzTmVnYXRpdmUgPSAhIW1hdGNoWzFdO1xyXG4gICAgICAgIGNvbnN0IGludGVnZXJEaWdpdHMgPSBtYXRjaFsyXTtcclxuICAgICAgICBjb25zdCBoYXNEb3QgPSAhIW1hdGNoWzNdO1xyXG4gICAgICAgIGNvbnN0IGRlY2ltYWxEaWdpdHMgPSBtYXRjaFs0XTtcclxuICAgICAgICBjb25zdCBleHAgPSBtYXRjaFs1XTtcclxuXHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckludGVnZXJzLnNldChpbnRlZ2VyRGlnaXRzLCBzaG91bGRHb1VwKTtcclxuICAgICAgICB0aGlzLm9kb21ldGVyRGVjaW1hbHMuc2V0KGRlY2ltYWxEaWdpdHMsIHNob3VsZEdvVXApO1xyXG5cclxuICAgICAgICB0aGlzLm1pbnVzLnN0eWxlLnZpc2liaWxpdHkgPSBpc05lZ2F0aXZlID8gXCJ2aXNpYmxlXCIgOiBcImhpZGRlblwiO1xyXG4gICAgICAgIHRoaXMuZG90LnN0eWxlLnZpc2liaWxpdHkgPSBoYXNEb3QgPyBcInZpc2libGVcIiA6IFwiaGlkZGVuXCI7XHJcbiAgICAgICAgdGhpcy5leHAuZmlyc3RDaGlsZC5kYXRhID0gZXhwID8gZXhwIDogXCJcIjtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0TnVtYmVyID0gbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGVuZFRvKG5vZGUpIHtcclxuICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgT2RvbWV0ZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNpemVSYXRpbyA9IDEuMCwgY29uZmlnID0ge30pIHtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBjb25maWcuYmFja2dyb3VuZCB8fCBcInRyYW5zcGFyZW50XCI7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJDb2xvdXIgPSBjb25maWcuYm9yZGVyQ29sb3VyIHx8IFwiZ3JleVwiO1xyXG4gICAgICAgIHRoaXMudGV4dENvbG91ciA9IGNvbmZpZy50ZXh0Q29sb3VyIHx8IFwicmVkXCI7XHJcbiAgICAgICAgdGhpcy50ZXh0Rm9udCA9IGNvbmZpZy50ZXh0Rm9udCB8fCBcInNhbnMtc2VyaWZcIjtcclxuICAgICAgICB0aGlzLnRleHRXaWR0aCA9IChjb25maWcudGV4dFdpZHRoIHx8IDE1KSAqIHNpemVSYXRpbztcclxuICAgICAgICB0aGlzLnRleHRIZWlnaHQgPSAoY29uZmlnLnRleHRIZWlnaHQgfHwgMjIpICogc2l6ZVJhdGlvO1xyXG4gICAgICAgIHRoaXMudGV4dExlZnRNYXJnaW4gPSAoY29uZmlnLnRleHRMZWZ0TWFyZ2luIHx8IDIpICogc2l6ZVJhdGlvO1xyXG4gICAgICAgIHRoaXMudGV4dFRvcE1hcmdpbiA9IChjb25maWcudGV4dFRvcE1hcmdpbiB8fCA2KSAqIHNpemVSYXRpbztcclxuICAgICAgICB0aGlzLmJvcmRlclBvc2l0b25SYXRpbyA9IGNvbmZpZy5ib3JkZXJQb3NpdG9uUmF0aW8gfHwgMC4xMztcclxuXHJcbiAgICAgICAgdGhpcy5kaWdpdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gY29uZmlnLnNwZWVkIHx8IDEuMDtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21ldGVyXCI7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZERpZ2l0c0NhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRGlnaXRzQ2FudmFzKCkge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gdGhpcy50ZXh0V2lkdGg7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IDExKnRoaXMudGV4dEhlaWdodCArIHRoaXMudGV4dFRvcE1hcmdpbjtcclxuXHJcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy50ZXh0Q29sb3VyO1xyXG4gICAgICAgIGN0eC5mb250ID0gdGhpcy50ZXh0SGVpZ2h0K1wicHggXCIrdGhpcy50ZXh0Rm9udDtcclxuICAgICAgICBjdHguZmlsbFRleHQoXCI5XCIsdGhpcy50ZXh0TGVmdE1hcmdpbix0aGlzLnRleHRIZWlnaHQpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7KytpKSB7XHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnRleHRDb2xvdXI7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChpLnRvU3RyaW5nKCksIHRoaXMudGV4dExlZnRNYXJnaW4sKGkrMikqdGhpcy50ZXh0SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuYm9yZGVyQ29sb3VyO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwoaSsxKSp0aGlzLnRleHRIZWlnaHQrdGhpcy50ZXh0SGVpZ2h0KnRoaXMuYm9yZGVyUG9zaXRvblJhdGlvLCB0aGlzLnRleHRXaWR0aCwgMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLHRoaXMudGV4dEhlaWdodCp0aGlzLmJvcmRlclBvc2l0aW9uUmF0aW8sIHRoaXMudGV4dFdpZHRoLCAyKTtcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwxMSp0aGlzLnRleHRIZWlnaHQrdGhpcy50ZXh0SGVpZ2h0KnRoaXMuYm9yZGVyUG9zaXRvblJhdGlvLCB0aGlzLnRleHRXaWR0aCwgMik7XHJcblxyXG4gICAgICAgIHRoaXMuZGlnaXRzQ2FudmFzID0gY2FudmFzO1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGVuZFRvKG5vZGUpIHtcclxuICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICBuZXdEaWdpdCgpIHtcclxuICAgICAgICBjb25zdCBkaWdpdCA9IG5ldyBPZG9tZXRlckRpZ2l0KHRoaXMpO1xyXG4gICAgICAgIGRpZ2l0LmFwcGVuZFRvKHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBkaWdpdC5zdG9wQ2FsbGJhY2sgPSB0aGlzLl9kaWdpdFN0b3BDYWxsYmFjay5iaW5kKHRoaXMsIHRoaXMuZGlnaXRzLmxlbmd0aCk7XHJcbiAgICAgICAgdGhpcy5kaWdpdHMucHVzaChkaWdpdCk7XHJcbiAgICAgICAgZGlnaXQuc3BpbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZURpZ2l0KCkge1xyXG4gICAgICAgIGNvbnN0IGxhc3REaWdpdCA9IHRoaXMuZGlnaXRzLnBvcCgpO1xyXG4gICAgICAgIGxhc3REaWdpdC5zdG9wKCk7XHJcbiAgICAgICAgbGFzdERpZ2l0LnJlbW92ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIF9kaWdpdFN0b3BDYWxsYmFjayhpbmRleCkge1xyXG4gICAgICAgIGlmIChpbmRleCArIDEgPCB0aGlzLmRpZ2l0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dERpZ2l0ID0gdGhpcy5kaWdpdHNbaW5kZXgrMV07XHJcbiAgICAgICAgICAgIG5leHREaWdpdC5zdG9wT25EaWdpdChwYXJzZUludCh0aGlzLnRhcmdldE51bWJlclN0cltpbmRleCsxXSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQobnVtYmVyLCBzaG91bGRHb1VwKSB7XHJcbiAgICAgICAgaWYgKHNob3VsZEdvVXAgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBzaG91bGRHb1VwID0gbnVtYmVyID4gdGhpcy50YXJnZXROdW1iZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBudW1iZXJTdHIgPSBudW1iZXIudG9TdHJpbmcoKTtcclxuICAgICAgICB0aGlzLnRhcmdldE51bWJlciA9IG51bWJlcjtcclxuICAgICAgICB0aGlzLnRhcmdldE51bWJlclN0ciA9IG51bWJlclN0cjtcclxuXHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbnVtYmVyU3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZGlnaXRzLmxlbmd0aCA8IGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLm5ld0RpZ2l0KCk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICB3aGlsZSAodGhpcy5kaWdpdHMubGVuZ3RoID4gbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRGlnaXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuYkRpZmZlcmVudHMgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcbiAgICAgICAgICAgIGxldCBkaWdpdCA9IHRoaXMuZGlnaXRzW2ldO1xyXG4gICAgICAgICAgICBkaWdpdC5kaXJlY3Rpb25Jc1VwID0gc2hvdWxkR29VcDtcclxuICAgICAgICAgICAgZGlnaXQuc3BlZWQgPSB0aGlzLnNwZWVkICogKDIuMCArIE1hdGgucG93KDIuMCwgbmJEaWZmZXJlbnRzKSk7XHJcbiAgICAgICAgICAgIGxldCBzdG9wRGlnaXQgPSBwYXJzZUludChudW1iZXJTdHJbaV0pO1xyXG4gICAgICAgICAgICBpZiAoc3RvcERpZ2l0ID09PSBkaWdpdC50YXJnZXREaWdpdCAmJiBuYkRpZmZlcmVudHMgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmJEaWZmZXJlbnRzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmJEaWZmZXJlbnRzID0gMTtcclxuICAgICAgICAgICAgICAgICAgICBkaWdpdC5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlnaXQuc3RvcE9uRGlnaXQoc3RvcERpZ2l0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgKytuYkRpZmZlcmVudHM7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlnaXQuZG9udFN0b3BPbkRpZ2l0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlnaXQuc3BpbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbmNsYXNzIE9kb21ldGVyRGlnaXQge1xyXG4gICAgY29uc3RydWN0b3Iob2RvbWV0ZXIpIHtcclxuICAgICAgICB0aGlzLm9kb21ldGVyID0gb2RvbWV0ZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uSXNVcCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSAtdGhpcy5vZG9tZXRlci50ZXh0SGVpZ2h0LTE7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDIuMDtcclxuXHJcbiAgICAgICAgdGhpcy5zaG91bGRTdG9wT25EaWdpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYnVpbGRDYW52YXMoKSB7XHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSB0aGlzLm9kb21ldGVyLnRleHRXaWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5vZG9tZXRlci50ZXh0SGVpZ2h0K3RoaXMub2RvbWV0ZXIudGV4dFRvcE1hcmdpbjtcclxuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICBjYW52YXMuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjJweFwiO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbklzVXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc3BpbigpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uSXNVcCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3BpbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFuaW1hdGUodGltZSkge1xyXG4gICAgICAgIGNvbnN0IHRleHRIZWlnaHQgPSB0aGlzLm9kb21ldGVyLnRleHRIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHRpbWVEaWZmID0gdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lID8gKHRpbWUgLSB0aGlzLnByZXZpb3VzQW5pbWF0ZVRpbWUpIDogMS4wO1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA9IHRpbWU7XHJcbiAgICAgICAgbGV0IHNwZWVkID0gKHRpbWVEaWZmICogdGV4dEhlaWdodCkgKiB0aGlzLnNwZWVkICogMC4wMDE7XHJcbiAgICAgICAgaWYgKHNwZWVkID4gdGV4dEhlaWdodCoxLjUpIHtcclxuICAgICAgICAgICAgc3BlZWQgPSB0ZXh0SGVpZ2h0ICogKDAuNStNYXRoLnJhbmRvbSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBvc2l0aW9uICsgc3BlZWQgKiAodGhpcy5kaXJlY3Rpb25Jc1VwID8gLTEgOiAxKSArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgaWYgKHAgPCAtdGV4dEhlaWdodCoxMCkge1xyXG4gICAgICAgICAgICBwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKHAgPiAwKSB7XHJcbiAgICAgICAgICAgIHAgPSAtdGV4dEhlaWdodCoxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3VsZFN0b3BPbkRpZ2l0ICYmIHRpbWVEaWZmICE9PSAxLjApIHtcclxuICAgICAgICAgICAgY29uc3QgbSA9IC10ZXh0SGVpZ2h0ICogKHRoaXMudGFyZ2V0RGlnaXQrMSB8fCAwKTtcclxuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gMSt0aGlzLnNwZWVkKjIgKyB0ZXh0SGVpZ2h0IC8gNTAuMDtcclxuICAgICAgICAgICAgaWYgKHAgPiBtLW1hcmdpbiAmJiBwIDwgbSttYXJnaW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTcGlubmluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcENhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9wQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHAgPSBtLTE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcDtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNTcGlubmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmN0eC5kcmF3SW1hZ2UodGhpcy5vZG9tZXRlci5kaWdpdHNDYW52YXMsIDAsIHRoaXMucG9zaXRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHNwaW4oKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzU3Bpbm5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG91bGRTdG9wT25EaWdpdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzU3Bpbm5pbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzQW5pbWF0ZVRpbWUgPSAwLjA7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSgwLjApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbkZyYW1lSWQpIHtcclxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZUlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lID0gMC4wO1xyXG4gICAgICAgIHRoaXMuaXNTcGlubmluZyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3BPbkRpZ2l0KGRpZ2l0KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzU3Bpbm5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5zcGluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hvdWxkU3RvcE9uRGlnaXQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0RGlnaXQgPSBkaWdpdDtcclxuICAgIH1cclxuXHJcbiAgICBkb250U3RvcE9uRGlnaXQoKSB7XHJcbiAgICAgICAgdGhpcy5zaG91bGRTdG9wT25EaWdpdCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0RGlnaXQgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGFwcGVuZFRvKG5vZGUpIHtcclxuICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FudmFzLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNhbnZhcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iXX0=