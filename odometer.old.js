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
        this.minus.style.fontFamily = this.odometerDecimals.textFont;
        this.minus.style.fontSize = this.odometerDecimals.textHeight + "px";
        this.minus.style.color = this.odometerDecimals.textColour;
        this.container.appendChild(this.minus);

        this.odometerIntegers.appendTo(this.container);

        this.dot = document.createElement("div");
        this.dot.className = "canvas-odomoter-dot";
        this.dot.appendChild(document.createTextNode("."));
        this.dot.style.fontFamily = this.odometerDecimals.textFont;
        this.dot.style.fontSize = this.odometerDecimals.textHeight + "px";
        this.dot.style.color = this.odometerDecimals.textColour;
        this.container.appendChild(this.dot);

        this.odometerDecimals.appendTo(this.container);

        this.exp = document.createElement("div");
        this.exp.className = "canvas-odomoter-exp";
        this.exp.appendChild(document.createTextNode(""));
        this.exp.style.fontFamily = this.odometerDecimals.textFont;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TCxHQUFtQixDQUFuQjtBQUNIOzs7aUNBRVEsSSxFQUFNO0FBQ1gsaUJBQUssV0FBTCxDQUFpQixLQUFLLE1BQXRCO0FBQ0g7OztpQ0FFUTtBQUNMLGdCQUFJLEtBQUssTUFBTCxDQUFZLGFBQWhCLEVBQStCO0FBQzNCLHFCQUFLLE1BQUwsQ0FBWSxhQUFaLENBQTBCLFdBQTFCLENBQXNDLEtBQUssTUFBM0M7QUFDSDtBQUNKIiwiZmlsZSI6Im9kb21ldGVyLm9sZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEZsb2F0T2RvbWV0ZXIge1xyXG4gICAgY29uc3RydWN0b3Ioc2l6ZVJhdGlvLCBjb25maWcgPSB7fSkge1xyXG4gICAgICAgIHRoaXMub2RvbWV0ZXJJbnRlZ2VycyA9IG5ldyBPZG9tZXRlcihzaXplUmF0aW8sIGNvbmZpZyk7XHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckRlY2ltYWxzID0gbmV3IE9kb21ldGVyKHNpemVSYXRpbywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9IFwiY2FudmFzLWZsb2F0LW9kb21ldGVyXCI7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgIC8vdGhpcy5jb250YWluZXIuc3R5bGUuanVzdGlmeUNvbnRlbnQgPSBcImNlbnRlclwiO1xyXG5cclxuICAgICAgICB0aGlzLm1pbnVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICB0aGlzLm1pbnVzLmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21vdGVyLW1pbnVzXCI7XHJcbiAgICAgICAgdGhpcy5taW51cy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIi1cIikpO1xyXG4gICAgICAgIHRoaXMubWludXMuc3R5bGUuZm9udEZhbWlseSA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0Rm9udDtcclxuICAgICAgICB0aGlzLm1pbnVzLnN0eWxlLmZvbnRTaXplID0gdGhpcy5vZG9tZXRlckRlY2ltYWxzLnRleHRIZWlnaHQrXCJweFwiO1xyXG4gICAgICAgIHRoaXMubWludXMuc3R5bGUuY29sb3IgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dENvbG91cjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLm1pbnVzKTtcclxuXHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckludGVnZXJzLmFwcGVuZFRvKHRoaXMuY29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5kb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuZG90LmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21vdGVyLWRvdFwiO1xyXG4gICAgICAgIHRoaXMuZG90LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiLlwiKSk7XHJcbiAgICAgICAgdGhpcy5kb3Quc3R5bGUuZm9udEZhbWlseSA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0Rm9udDtcclxuICAgICAgICB0aGlzLmRvdC5zdHlsZS5mb250U2l6ZSA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0SGVpZ2h0K1wicHhcIjtcclxuICAgICAgICB0aGlzLmRvdC5zdHlsZS5jb2xvciA9IHRoaXMub2RvbWV0ZXJEZWNpbWFscy50ZXh0Q29sb3VyO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuZG90KTtcclxuXHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckRlY2ltYWxzLmFwcGVuZFRvKHRoaXMuY29udGFpbmVyKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmV4cCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgdGhpcy5leHAuY2xhc3NOYW1lID0gXCJjYW52YXMtb2RvbW90ZXItZXhwXCI7XHJcbiAgICAgICAgdGhpcy5leHAuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIikpO1xyXG4gICAgICAgIHRoaXMuZXhwLnN0eWxlLmZvbnRGYW1pbHkgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dEZvbnQ7XHJcbiAgICAgICAgdGhpcy5leHAuc3R5bGUuZm9udFNpemUgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dEhlaWdodCtcInB4XCI7XHJcbiAgICAgICAgdGhpcy5leHAuc3R5bGUuY29sb3IgPSB0aGlzLm9kb21ldGVyRGVjaW1hbHMudGV4dENvbG91cjtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmV4cCk7XHJcblxyXG4gICAgICAgIHRoaXMubGFzdE51bWJlciA9IDAuMDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc2V0KG51bWJlcikge1xyXG4gICAgICAgIGxldCBzaG91bGRHb1VwID0gbnVtYmVyID4gdGhpcy5sYXN0TnVtYmVyO1xyXG4gICAgICAgIGlmIChudW1iZXIgPCAwKSBzaG91bGRHb1VwID0gIXNob3VsZEdvVXA7XHJcblxyXG5cclxuICAgICAgICBjb25zdCBudW1iZXJTdHIgPSBudW1iZXIudG9TdHJpbmcoKTtcclxuICAgICAgICBjb25zdCBtYXRjaCA9IG51bWJlclN0ci5tYXRjaCgvKC0/KShcXGQqKShcXC4/KShcXGQqKShlW1xcLStdXFxkKyk/Lyk7XHJcbiAgICAgICAgaWYgKCFtYXRjaCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuYWJsZSB0byBwYXJzZSB0aGUgbnVtYmVyIHN0cmluZ1wiLCBudW1iZXJTdHIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBpc05lZ2F0aXZlID0gISFtYXRjaFsxXTtcclxuICAgICAgICBjb25zdCBpbnRlZ2VyRGlnaXRzID0gbWF0Y2hbMl07XHJcbiAgICAgICAgY29uc3QgaGFzRG90ID0gISFtYXRjaFszXTtcclxuICAgICAgICBjb25zdCBkZWNpbWFsRGlnaXRzID0gbWF0Y2hbNF07XHJcbiAgICAgICAgY29uc3QgZXhwID0gbWF0Y2hbNV07XHJcblxyXG4gICAgICAgIHRoaXMub2RvbWV0ZXJJbnRlZ2Vycy5zZXQoaW50ZWdlckRpZ2l0cywgc2hvdWxkR29VcCk7XHJcbiAgICAgICAgdGhpcy5vZG9tZXRlckRlY2ltYWxzLnNldChkZWNpbWFsRGlnaXRzLCBzaG91bGRHb1VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5taW51cy5zdHlsZS52aXNpYmlsaXR5ID0gaXNOZWdhdGl2ZSA/IFwidmlzaWJsZVwiIDogXCJoaWRkZW5cIjtcclxuICAgICAgICB0aGlzLmRvdC5zdHlsZS52aXNpYmlsaXR5ID0gaGFzRG90ID8gXCJ2aXNpYmxlXCIgOiBcImhpZGRlblwiO1xyXG4gICAgICAgIHRoaXMuZXhwLmZpcnN0Q2hpbGQuZGF0YSA9IGV4cCA/IGV4cCA6IFwiXCI7XHJcblxyXG4gICAgICAgIHRoaXMubGFzdE51bWJlciA9IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICBhcHBlbmRUbyhub2RlKSB7XHJcbiAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE9kb21ldGVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzaXplUmF0aW8gPSAxLjAsIGNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gY29uZmlnLmJhY2tncm91bmQgfHwgXCJ0cmFuc3BhcmVudFwiO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyQ29sb3VyID0gY29uZmlnLmJvcmRlckNvbG91ciB8fCBcImdyZXlcIjtcclxuICAgICAgICB0aGlzLnRleHRDb2xvdXIgPSBjb25maWcudGV4dENvbG91ciB8fCBcInJlZFwiO1xyXG4gICAgICAgIHRoaXMudGV4dEZvbnQgPSBjb25maWcudGV4dEZvbnQgfHwgXCJzYW5zLXNlcmlmXCI7XHJcbiAgICAgICAgdGhpcy50ZXh0V2lkdGggPSAoY29uZmlnLnRleHRXaWR0aCB8fCAxNSkgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy50ZXh0SGVpZ2h0ID0gKGNvbmZpZy50ZXh0SGVpZ2h0IHx8IDIyKSAqIHNpemVSYXRpbztcclxuICAgICAgICB0aGlzLnRleHRMZWZ0TWFyZ2luID0gKGNvbmZpZy50ZXh0TGVmdE1hcmdpbiB8fCAyKSAqIHNpemVSYXRpbztcclxuICAgICAgICB0aGlzLnRleHRUb3BNYXJnaW4gPSAoY29uZmlnLnRleHRUb3BNYXJnaW4gfHwgNikgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy5ib3JkZXJQb3NpdG9uUmF0aW8gPSBjb25maWcuYm9yZGVyUG9zaXRvblJhdGlvIHx8IDAuMTM7XHJcblxyXG4gICAgICAgIHRoaXMuZGlnaXRzID0gW107XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IGNvbmZpZy5zcGVlZCB8fCAxLjA7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgPSBcImNhbnZhcy1vZG9tZXRlclwiO1xyXG5cclxuICAgICAgICB0aGlzLnRhcmdldE51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGREaWdpdHNDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBidWlsZERpZ2l0c0NhbnZhcygpIHtcclxuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHRoaXMudGV4dFdpZHRoO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSAxMSp0aGlzLnRleHRIZWlnaHQgKyB0aGlzLnRleHRUb3BNYXJnaW47XHJcblxyXG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuYmFja2dyb3VuZDtcclxuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMudGV4dENvbG91cjtcclxuICAgICAgICBjdHguZm9udCA9IHRoaXMudGV4dEhlaWdodCtcInB4IFwiK3RoaXMudGV4dEZvbnQ7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KFwiOVwiLHRoaXMudGV4dExlZnRNYXJnaW4sdGhpcy50ZXh0SGVpZ2h0KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOysraSkge1xyXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy50ZXh0Q29sb3VyO1xyXG4gICAgICAgICAgICBjdHguZmlsbFRleHQoaS50b1N0cmluZygpLCB0aGlzLnRleHRMZWZ0TWFyZ2luLChpKzIpKnRoaXMudGV4dEhlaWdodCk7XHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmJvcmRlckNvbG91cjtcclxuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsKGkrMSkqdGhpcy50ZXh0SGVpZ2h0K3RoaXMudGV4dEhlaWdodCp0aGlzLmJvcmRlclBvc2l0b25SYXRpbywgdGhpcy50ZXh0V2lkdGgsIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdHguZmlsbFJlY3QoMCx0aGlzLnRleHRIZWlnaHQqdGhpcy5ib3JkZXJQb3NpdGlvblJhdGlvLCB0aGlzLnRleHRXaWR0aCwgMik7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsMTEqdGhpcy50ZXh0SGVpZ2h0K3RoaXMudGV4dEhlaWdodCp0aGlzLmJvcmRlclBvc2l0b25SYXRpbywgdGhpcy50ZXh0V2lkdGgsIDIpO1xyXG5cclxuICAgICAgICB0aGlzLmRpZ2l0c0NhbnZhcyA9IGNhbnZhcztcclxuICAgIH1cclxuXHJcbiAgICBhcHBlbmRUbyhub2RlKSB7XHJcbiAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgbmV3RGlnaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZGlnaXQgPSBuZXcgT2RvbWV0ZXJEaWdpdCh0aGlzKTtcclxuICAgICAgICBkaWdpdC5hcHBlbmRUbyh0aGlzLmNvbnRhaW5lcik7XHJcbiAgICAgICAgZGlnaXQuc3RvcENhbGxiYWNrID0gdGhpcy5fZGlnaXRTdG9wQ2FsbGJhY2suYmluZCh0aGlzLCB0aGlzLmRpZ2l0cy5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuZGlnaXRzLnB1c2goZGlnaXQpO1xyXG4gICAgICAgIGRpZ2l0LnNwaW4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVEaWdpdCgpIHtcclxuICAgICAgICBjb25zdCBsYXN0RGlnaXQgPSB0aGlzLmRpZ2l0cy5wb3AoKTtcclxuICAgICAgICBsYXN0RGlnaXQuc3RvcCgpO1xyXG4gICAgICAgIGxhc3REaWdpdC5yZW1vdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBfZGlnaXRTdG9wQ2FsbGJhY2soaW5kZXgpIHtcclxuICAgICAgICBpZiAoaW5kZXggKyAxIDwgdGhpcy5kaWdpdHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5leHREaWdpdCA9IHRoaXMuZGlnaXRzW2luZGV4KzFdO1xyXG4gICAgICAgICAgICBuZXh0RGlnaXQuc3RvcE9uRGlnaXQocGFyc2VJbnQodGhpcy50YXJnZXROdW1iZXJTdHJbaW5kZXgrMV0pKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KG51bWJlciwgc2hvdWxkR29VcCkge1xyXG4gICAgICAgIGlmIChzaG91bGRHb1VwID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgc2hvdWxkR29VcCA9IG51bWJlciA+IHRoaXMudGFyZ2V0TnVtYmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbnVtYmVyU3RyID0gbnVtYmVyLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXROdW1iZXIgPSBudW1iZXI7XHJcbiAgICAgICAgdGhpcy50YXJnZXROdW1iZXJTdHIgPSBudW1iZXJTdHI7XHJcblxyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IG51bWJlclN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIHdoaWxlICh0aGlzLmRpZ2l0cy5sZW5ndGggPCBsZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5uZXdEaWdpdCgpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgd2hpbGUgKHRoaXMuZGlnaXRzLmxlbmd0aCA+IGxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZURpZ2l0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmJEaWZmZXJlbnRzID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG4gICAgICAgICAgICBsZXQgZGlnaXQgPSB0aGlzLmRpZ2l0c1tpXTtcclxuICAgICAgICAgICAgZGlnaXQuZGlyZWN0aW9uSXNVcCA9IHNob3VsZEdvVXA7XHJcbiAgICAgICAgICAgIGRpZ2l0LnNwZWVkID0gdGhpcy5zcGVlZCAqICgyLjAgKyBNYXRoLnBvdygyLjAsIG5iRGlmZmVyZW50cykpO1xyXG4gICAgICAgICAgICBsZXQgc3RvcERpZ2l0ID0gcGFyc2VJbnQobnVtYmVyU3RyW2ldKTtcclxuICAgICAgICAgICAgaWYgKHN0b3BEaWdpdCA9PT0gZGlnaXQudGFyZ2V0RGlnaXQgJiYgbmJEaWZmZXJlbnRzID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5iRGlmZmVyZW50cyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5iRGlmZmVyZW50cyA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlnaXQuc3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LnN0b3BPbkRpZ2l0KHN0b3BEaWdpdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICsrbmJEaWZmZXJlbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LmRvbnRTdG9wT25EaWdpdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LnNwaW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5jbGFzcyBPZG9tZXRlckRpZ2l0IHtcclxuICAgIGNvbnN0cnVjdG9yKG9kb21ldGVyKSB7XHJcbiAgICAgICAgdGhpcy5vZG9tZXRlciA9IG9kb21ldGVyO1xyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbklzVXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaXNTcGlubmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gLXRoaXMub2RvbWV0ZXIudGV4dEhlaWdodC0xO1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSAyLjA7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvdWxkU3RvcE9uRGlnaXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZENhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkQ2FudmFzKCkge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gdGhpcy5vZG9tZXRlci50ZXh0V2lkdGg7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHRoaXMub2RvbWV0ZXIudGV4dEhlaWdodCt0aGlzLm9kb21ldGVyLnRleHRUb3BNYXJnaW47XHJcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgICAgY2FudmFzLnN0eWxlLm1hcmdpblJpZ2h0ID0gXCIycHhcIjtcclxuICAgICAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb25Jc1VwID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNwaW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbklzVXAgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNwaW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBhbmltYXRlKHRpbWUpIHtcclxuICAgICAgICBjb25zdCB0ZXh0SGVpZ2h0ID0gdGhpcy5vZG9tZXRlci50ZXh0SGVpZ2h0O1xyXG4gICAgICAgIGxldCB0aW1lRGlmZiA9IHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA/ICh0aW1lIC0gdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lKSA6IDEuMDtcclxuICAgICAgICB0aGlzLnByZXZpb3VzQW5pbWF0ZVRpbWUgPSB0aW1lO1xyXG4gICAgICAgIGxldCBzcGVlZCA9ICh0aW1lRGlmZiAqIHRleHRIZWlnaHQpICogdGhpcy5zcGVlZCAqIDAuMDAxO1xyXG4gICAgICAgIGlmIChzcGVlZCA+IHRleHRIZWlnaHQqMS41KSB7XHJcbiAgICAgICAgICAgIHNwZWVkID0gdGV4dEhlaWdodCAqICgwLjUrTWF0aC5yYW5kb20oKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBwID0gdGhpcy5wb3NpdGlvbiArIHNwZWVkICogKHRoaXMuZGlyZWN0aW9uSXNVcCA/IC0xIDogMSkgKyBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIGlmIChwIDwgLXRleHRIZWlnaHQqMTApIHtcclxuICAgICAgICAgICAgcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwID4gMCkge1xyXG4gICAgICAgICAgICBwID0gLXRleHRIZWlnaHQqMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG91bGRTdG9wT25EaWdpdCAmJiB0aW1lRGlmZiAhPT0gMS4wKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG0gPSAtdGV4dEhlaWdodCAqICh0aGlzLnRhcmdldERpZ2l0KzEgfHwgMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbiA9IDErdGhpcy5zcGVlZCoyICsgdGV4dEhlaWdodCAvIDUwLjA7XHJcbiAgICAgICAgICAgIGlmIChwID4gbS1tYXJnaW4gJiYgcCA8IG0rbWFyZ2luKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5pbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0b3BDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwID0gbS0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHA7XHJcbiAgICAgICAgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzU3Bpbm5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMub2RvbWV0ZXIuZGlnaXRzQ2FudmFzLCAwLCB0aGlzLnBvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBzcGluKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1NwaW5uaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdWxkU3RvcE9uRGlnaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lID0gMC4wO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoMC4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25GcmFtZUlkKSB7XHJcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA9IDAuMDtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5pbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9wT25EaWdpdChkaWdpdCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1NwaW5uaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3BpbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3VsZFN0b3BPbkRpZ2l0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnRhcmdldERpZ2l0ID0gZGlnaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgZG9udFN0b3BPbkRpZ2l0KCkge1xyXG4gICAgICAgIHRoaXMuc2hvdWxkU3RvcE9uRGlnaXQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRhcmdldERpZ2l0ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBhcHBlbmRUbyhub2RlKSB7XHJcbiAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbnZhcy5wYXJlbnRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIl19