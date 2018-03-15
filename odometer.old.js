"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Odometer = function () {
    function Odometer() {
        var sizeRatio = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.0;

        _classCallCheck(this, Odometer);

        this.background = "transparent"; //#fff";
        this.borderColour = "grey";
        this.textColour = "red";
        this.textFont = "calibri";
        this.textWidth = 15 * sizeRatio;
        this.textHeight = 21 * sizeRatio;
        this.textLeftMargin = 2 * sizeRatio;
        this.textTopMargin = 6 * sizeRatio;

        this.digits = [];
        this.speed = 1.0; //0.45;

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
                ctx.fillRect(0, (i + 1) * this.textHeight + this.textHeight * 0.165, this.textWidth, 2);
            }
            ctx.fillRect(0, this.textHeight * 0.165, this.textWidth, 2);
            ctx.fillRect(0, 11 * this.textHeight + this.textHeight * 0.165, this.textWidth, 2);

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
            //console.log("stop", index);
            if (index + 1 < this.digits.length) {
                var nextDigit = this.digits[index + 1];
                nextDigit.stopOnDigit(parseInt(this.targetNumberStr[index + 1]));
            }
        }
    }, {
        key: "set",
        value: function set(number) {
            var shouldGoUp = number > this.targetNumber;
            var numberStr = number.toString();
            this.targetNumber = number;
            this.targetNumberStr = numberStr;
            //console.log(numberStr);


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
                //digit.stopOnDigit(parseInt(numberStr[i]));
            }

            /*if (firstDifferent) {
                this.digits[0].stopOnDigit(parseInt(numberStr[0]));
            }*/
        }
    }]);

    return Odometer;
}();

var OdometerDigit = function () {
    function OdometerDigit(odometer) {
        _classCallCheck(this, OdometerDigit);

        // beautiful circular reference
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

var odo = new Odometer(5.0);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9kb21ldGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFNLFE7QUFFRix3QkFBNkI7QUFBQSxZQUFqQixTQUFpQix1RUFBTCxHQUFLOztBQUFBOztBQUN6QixhQUFLLFVBQUwsR0FBa0IsYUFBbEIsQ0FEeUIsQ0FDTztBQUNoQyxhQUFLLFlBQUwsR0FBb0IsTUFBcEI7QUFDQSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsU0FBaEI7QUFDQSxhQUFLLFNBQUwsR0FBaUIsS0FBSyxTQUF0QjtBQUNBLGFBQUssVUFBTCxHQUFrQixLQUFLLFNBQXZCO0FBQ0EsYUFBSyxjQUFMLEdBQXNCLElBQUksU0FBMUI7QUFDQSxhQUFLLGFBQUwsR0FBcUIsSUFBSSxTQUF6Qjs7QUFFQSxhQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0EsYUFBSyxLQUFMLEdBQWEsR0FBYixDQVh5QixDQVdSOztBQUVqQixhQUFLLFNBQUwsR0FBaUIsU0FBUyxhQUFULENBQXVCLEtBQXZCLENBQWpCO0FBQ0EsYUFBSyxTQUFMLENBQWUsU0FBZixHQUEyQixpQkFBM0I7O0FBRUEsYUFBSyxZQUFMLEdBQW9CLENBQXBCOztBQUVBLGFBQUssaUJBQUw7QUFDSDs7Ozs0Q0FFbUI7QUFDaEIsZ0JBQU0sU0FBUyxTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBZjtBQUNBLG1CQUFPLEtBQVAsR0FBZSxLQUFLLFNBQXBCO0FBQ0EsbUJBQU8sTUFBUCxHQUFnQixLQUFHLEtBQUssVUFBUixHQUFxQixLQUFLLGFBQTFDOztBQUVBLGdCQUFNLE1BQU0sT0FBTyxVQUFQLENBQWtCLElBQWxCLENBQVo7QUFDQSxnQkFBSSxTQUFKLEdBQWdCLEtBQUssVUFBckI7QUFDQSxnQkFBSSxRQUFKLENBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixPQUFPLEtBQTFCLEVBQWlDLE9BQU8sTUFBeEM7O0FBRUEsZ0JBQUksU0FBSixHQUFnQixLQUFLLFVBQXJCO0FBQ0EsZ0JBQUksSUFBSixHQUFXLEtBQUssVUFBTCxHQUFnQixLQUFoQixHQUFzQixLQUFLLFFBQXRDO0FBQ0EsZ0JBQUksUUFBSixDQUFhLEdBQWIsRUFBaUIsS0FBSyxjQUF0QixFQUFxQyxLQUFLLFVBQTFDO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxFQUFwQixFQUF1QixFQUFFLENBQXpCLEVBQTRCO0FBQ3hCLG9CQUFJLFNBQUosR0FBZ0IsS0FBSyxVQUFyQjtBQUNBLG9CQUFJLFFBQUosQ0FBYSxFQUFFLFFBQUYsRUFBYixFQUEyQixLQUFLLGNBQWhDLEVBQStDLENBQUMsSUFBRSxDQUFILElBQU0sS0FBSyxVQUExRDtBQUNBLG9CQUFJLFNBQUosR0FBZ0IsS0FBSyxZQUFyQjtBQUNBLG9CQUFJLFFBQUosQ0FBYSxDQUFiLEVBQWUsQ0FBQyxJQUFFLENBQUgsSUFBTSxLQUFLLFVBQVgsR0FBc0IsS0FBSyxVQUFMLEdBQWdCLEtBQXJELEVBQTRELEtBQUssU0FBakUsRUFBNEUsQ0FBNUU7QUFDSDtBQUNELGdCQUFJLFFBQUosQ0FBYSxDQUFiLEVBQWUsS0FBSyxVQUFMLEdBQWdCLEtBQS9CLEVBQXNDLEtBQUssU0FBM0MsRUFBc0QsQ0FBdEQ7QUFDQSxnQkFBSSxRQUFKLENBQWEsQ0FBYixFQUFlLEtBQUcsS0FBSyxVQUFSLEdBQW1CLEtBQUssVUFBTCxHQUFnQixLQUFsRCxFQUF5RCxLQUFLLFNBQTlELEVBQXlFLENBQXpFOztBQUVBLGlCQUFLLFlBQUwsR0FBb0IsTUFBcEI7QUFDSDs7O2lDQUVRLEksRUFBTTtBQUNYLGlCQUFLLFdBQUwsQ0FBaUIsS0FBSyxTQUF0QjtBQUNIOzs7bUNBRVU7QUFDUCxnQkFBTSxRQUFRLElBQUksYUFBSixDQUFrQixJQUFsQixDQUFkO0FBQ0Esa0JBQU0sUUFBTixDQUFlLEtBQUssU0FBcEI7QUFDQSxrQkFBTSxZQUFOLEdBQXFCLEtBQUssa0JBQUwsQ0FBd0IsSUFBeEIsQ0FBNkIsSUFBN0IsRUFBbUMsS0FBSyxNQUFMLENBQVksTUFBL0MsQ0FBckI7QUFDQSxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFqQjtBQUNBLGtCQUFNLElBQU47QUFDSDs7O3NDQUVhO0FBQ1YsZ0JBQU0sWUFBWSxLQUFLLE1BQUwsQ0FBWSxHQUFaLEVBQWxCO0FBQ0Esc0JBQVUsSUFBVjtBQUNBLHNCQUFVLE1BQVY7QUFDSDs7OzJDQUVrQixLLEVBQU87QUFDdEI7QUFDQSxnQkFBSSxRQUFRLENBQVIsR0FBWSxLQUFLLE1BQUwsQ0FBWSxNQUE1QixFQUFvQztBQUNoQyxvQkFBTSxZQUFZLEtBQUssTUFBTCxDQUFZLFFBQU0sQ0FBbEIsQ0FBbEI7QUFDQSwwQkFBVSxXQUFWLENBQXNCLFNBQVMsS0FBSyxlQUFMLENBQXFCLFFBQU0sQ0FBM0IsQ0FBVCxDQUF0QjtBQUNIO0FBQ0o7Ozs0QkFFRyxNLEVBQVE7QUFDUixnQkFBTSxhQUFhLFNBQVMsS0FBSyxZQUFqQztBQUNBLGdCQUFNLFlBQVksT0FBTyxRQUFQLEVBQWxCO0FBQ0EsaUJBQUssWUFBTCxHQUFvQixNQUFwQjtBQUNBLGlCQUFLLGVBQUwsR0FBdUIsU0FBdkI7QUFDQTs7O0FBSUEsZ0JBQU0sU0FBUyxVQUFVLE1BQXpCOztBQUVBLG1CQUFPLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsTUFBNUIsRUFBb0M7QUFDaEMscUJBQUssUUFBTDtBQUNIO0FBQ0QsbUJBQU8sS0FBSyxNQUFMLENBQVksTUFBWixHQUFxQixNQUE1QixFQUFvQztBQUNoQyxxQkFBSyxXQUFMO0FBQ0g7O0FBRUQsZ0JBQUksZUFBZSxDQUFuQjtBQUNBLGlCQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxNQUFwQixFQUE0QixJQUFJLENBQWhDLEVBQW1DLEVBQUUsQ0FBckMsRUFBd0M7QUFDcEMsb0JBQUksUUFBUSxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVo7QUFDQSxzQkFBTSxhQUFOLEdBQXNCLFVBQXRCO0FBQ0Esc0JBQU0sS0FBTixHQUFjLEtBQUssS0FBTCxJQUFjLE1BQU0sS0FBSyxHQUFMLENBQVMsR0FBVCxFQUFjLFlBQWQsQ0FBcEIsQ0FBZDtBQUNBLG9CQUFJLFlBQVksU0FBUyxVQUFVLENBQVYsQ0FBVCxDQUFoQjtBQUNBLG9CQUFJLGNBQWMsTUFBTSxXQUFwQixJQUFtQyxpQkFBaUIsQ0FBeEQsRUFBMkQsQ0FFMUQsQ0FGRCxNQUVPO0FBQ0gsd0JBQUksaUJBQWlCLENBQXJCLEVBQXdCO0FBQ3BCLHVDQUFlLENBQWY7QUFDQSw4QkFBTSxXQUFOLENBQWtCLFNBQWxCO0FBQ0gscUJBSEQsTUFHTztBQUNILDBCQUFFLFlBQUY7QUFDQSw4QkFBTSxJQUFOO0FBQ0g7QUFDSjtBQUNEO0FBQ0g7O0FBRUQ7OztBQUdIOzs7Ozs7SUFJQyxhO0FBQ0YsMkJBQVksUUFBWixFQUFzQjtBQUFBOztBQUNsQjtBQUNBLGFBQUssUUFBTCxHQUFnQixRQUFoQjs7QUFFQSxhQUFLLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7O0FBRUEsYUFBSyxRQUFMLEdBQWdCLENBQUMsS0FBSyxRQUFMLENBQWMsVUFBZixHQUEwQixDQUExQztBQUNBLGFBQUssS0FBTCxHQUFhLEdBQWI7O0FBRUEsYUFBSyxpQkFBTCxHQUF5QixLQUF6Qjs7QUFFQSxhQUFLLFdBQUw7QUFDSDs7OztzQ0FFYTtBQUNWLGdCQUFNLFNBQVMsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQWY7QUFDQSxtQkFBTyxLQUFQLEdBQWUsS0FBSyxRQUFMLENBQWMsU0FBN0I7QUFDQSxtQkFBTyxNQUFQLEdBQWdCLEtBQUssUUFBTCxDQUFjLFVBQWQsR0FBeUIsS0FBSyxRQUFMLENBQWMsYUFBdkQ7QUFDQSxnQkFBTSxNQUFNLE9BQU8sVUFBUCxDQUFrQixJQUFsQixDQUFaOztBQUVBLGlCQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsbUJBQU8sS0FBUCxDQUFhLFdBQWIsR0FBMkIsS0FBM0I7QUFDQSxpQkFBSyxHQUFMLEdBQVcsR0FBWDtBQUNIOzs7aUNBRVE7QUFDTCxpQkFBSyxhQUFMLEdBQXFCLElBQXJCO0FBQ0EsaUJBQUssSUFBTDtBQUNIOzs7bUNBRVU7QUFDUCxpQkFBSyxhQUFMLEdBQXFCLEtBQXJCO0FBQ0EsaUJBQUssSUFBTDtBQUNIOzs7Z0NBRU8sSSxFQUFNO0FBQ1YsZ0JBQU0sYUFBYSxLQUFLLFFBQUwsQ0FBYyxVQUFqQztBQUNBLGdCQUFJLFdBQVcsS0FBSyxtQkFBTCxHQUE0QixPQUFPLEtBQUssbUJBQXhDLEdBQStELEdBQTlFO0FBQ0EsaUJBQUssbUJBQUwsR0FBMkIsSUFBM0I7QUFDQSxnQkFBSSxRQUFTLFdBQVcsVUFBWixHQUEwQixLQUFLLEtBQS9CLEdBQXVDLEtBQW5EO0FBQ0EsZ0JBQUksUUFBUSxhQUFXLEdBQXZCLEVBQTRCO0FBQ3hCLHdCQUFRLGNBQWMsTUFBSSxLQUFLLE1BQUwsRUFBbEIsQ0FBUjtBQUNIO0FBQ0QsZ0JBQUksSUFBSSxLQUFLLFFBQUwsR0FBZ0IsU0FBUyxLQUFLLGFBQUwsR0FBcUIsQ0FBQyxDQUF0QixHQUEwQixDQUFuQyxDQUFoQixHQUF3RCxLQUFLLE1BQUwsRUFBaEU7QUFDQSxnQkFBSSxJQUFJLENBQUMsVUFBRCxHQUFZLEVBQXBCLEVBQXdCO0FBQ3BCLG9CQUFJLENBQUo7QUFDSCxhQUZELE1BRU8sSUFBSSxJQUFJLENBQVIsRUFBVztBQUNkLG9CQUFJLENBQUMsVUFBRCxHQUFZLEVBQWhCO0FBQ0g7O0FBRUQsZ0JBQUksS0FBSyxpQkFBTCxJQUEwQixhQUFhLEdBQTNDLEVBQWdEO0FBQzVDLG9CQUFNLElBQUksQ0FBQyxVQUFELElBQWUsS0FBSyxXQUFMLEdBQWlCLENBQWpCLElBQXNCLENBQXJDLENBQVY7QUFDQSxvQkFBTSxTQUFTLEtBQUssS0FBTCxHQUFXLENBQVgsR0FBZSxhQUFhLElBQTNDO0FBQ0Esb0JBQUksSUFBSSxJQUFFLE1BQU4sSUFBZ0IsSUFBSSxJQUFFLE1BQTFCLEVBQWtDO0FBQzlCLHlCQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSx3QkFBSSxLQUFLLFlBQVQsRUFBdUI7QUFDbkIsNkJBQUssWUFBTDtBQUNIO0FBQ0Qsd0JBQUksSUFBRSxDQUFOO0FBQ0g7QUFFSjs7QUFFRCxpQkFBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsaUJBQUssSUFBTDs7QUFFQSxnQkFBSSxLQUFLLFVBQVQsRUFBcUI7QUFDakIscUJBQUssZ0JBQUwsR0FBd0Isc0JBQXNCLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBdEIsQ0FBeEI7QUFDSDtBQUNKOzs7K0JBRU07QUFDSCxpQkFBSyxHQUFMLENBQVMsU0FBVCxDQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixLQUFLLE1BQUwsQ0FBWSxLQUFyQyxFQUE0QyxLQUFLLE1BQUwsQ0FBWSxNQUF4RDtBQUNBLGlCQUFLLEdBQUwsQ0FBUyxTQUFULENBQW1CLEtBQUssUUFBTCxDQUFjLFlBQWpDLEVBQStDLENBQS9DLEVBQWtELEtBQUssUUFBdkQ7QUFDSDs7OytCQUVNO0FBQ0gsZ0JBQUksQ0FBQyxLQUFLLFVBQVYsRUFBc0I7QUFDbEIscUJBQUssaUJBQUwsR0FBeUIsS0FBekI7QUFDQSxxQkFBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0EscUJBQUssbUJBQUwsR0FBMkIsR0FBM0I7QUFDQSxxQkFBSyxPQUFMLENBQWEsR0FBYjtBQUNIO0FBQ0o7OzsrQkFFTTtBQUNILGdCQUFJLEtBQUssZ0JBQVQsRUFBMkI7QUFDdkIscUNBQXFCLEtBQUssZ0JBQTFCO0FBQ0g7QUFDRCxpQkFBSyxtQkFBTCxHQUEyQixHQUEzQjtBQUNBLGlCQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDSDs7O29DQUVXLEssRUFBTztBQUNmLGdCQUFJLENBQUMsS0FBSyxVQUFWLEVBQXNCO0FBQ2xCLHFCQUFLLElBQUw7QUFDSDtBQUNELGlCQUFLLGlCQUFMLEdBQXlCLElBQXpCO0FBQ0EsaUJBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNIOzs7aUNBRVEsSSxFQUFNO0FBQ1gsaUJBQUssV0FBTCxDQUFpQixLQUFLLE1BQXRCO0FBQ0g7OztpQ0FFUTtBQUNMLGdCQUFJLEtBQUssTUFBTCxDQUFZLGFBQWhCLEVBQStCO0FBQzNCLHFCQUFLLE1BQUwsQ0FBWSxhQUFaLENBQTBCLFdBQTFCLENBQXNDLEtBQUssTUFBM0M7QUFDSDtBQUNKOzs7Ozs7QUFHTCxJQUFNLE1BQU0sSUFBSSxRQUFKLENBQWEsR0FBYixDQUFaO0FBQ0EsSUFBSSxRQUFKLENBQWEsU0FBUyxJQUF0QjtBQUNBLElBQUksR0FBSixDQUFRLFNBQVI7O0FBRUEsU0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixJQUFJLFlBQTlCO0FBQ0E7QUFDQTs7Ozs7OztBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEiLCJmaWxlIjoib2RvbWV0ZXIub2xkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgT2RvbWV0ZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNpemVSYXRpbyA9IDEuMCkge1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IFwidHJhbnNwYXJlbnRcIjsvLyNmZmZcIjtcclxuICAgICAgICB0aGlzLmJvcmRlckNvbG91ciA9IFwiZ3JleVwiO1xyXG4gICAgICAgIHRoaXMudGV4dENvbG91ciA9IFwicmVkXCI7XHJcbiAgICAgICAgdGhpcy50ZXh0Rm9udCA9IFwiY2FsaWJyaVwiO1xyXG4gICAgICAgIHRoaXMudGV4dFdpZHRoID0gMTUgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy50ZXh0SGVpZ2h0ID0gMjEgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy50ZXh0TGVmdE1hcmdpbiA9IDIgKiBzaXplUmF0aW87XHJcbiAgICAgICAgdGhpcy50ZXh0VG9wTWFyZ2luID0gNiAqIHNpemVSYXRpbztcclxuXHJcbiAgICAgICAgdGhpcy5kaWdpdHMgPSBbXTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gMS4wOy8vMC40NTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9IFwiY2FudmFzLW9kb21ldGVyXCI7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZERpZ2l0c0NhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRGlnaXRzQ2FudmFzKCkge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gdGhpcy50ZXh0V2lkdGg7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IDExKnRoaXMudGV4dEhlaWdodCArIHRoaXMudGV4dFRvcE1hcmdpbjtcclxuXHJcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5iYWNrZ3JvdW5kO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG5cclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy50ZXh0Q29sb3VyO1xyXG4gICAgICAgIGN0eC5mb250ID0gdGhpcy50ZXh0SGVpZ2h0K1wicHggXCIrdGhpcy50ZXh0Rm9udDtcclxuICAgICAgICBjdHguZmlsbFRleHQoXCI5XCIsdGhpcy50ZXh0TGVmdE1hcmdpbix0aGlzLnRleHRIZWlnaHQpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTA7KytpKSB7XHJcbiAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnRleHRDb2xvdXI7XHJcbiAgICAgICAgICAgIGN0eC5maWxsVGV4dChpLnRvU3RyaW5nKCksIHRoaXMudGV4dExlZnRNYXJnaW4sKGkrMikqdGhpcy50ZXh0SGVpZ2h0KTtcclxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuYm9yZGVyQ29sb3VyO1xyXG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwoaSsxKSp0aGlzLnRleHRIZWlnaHQrdGhpcy50ZXh0SGVpZ2h0KjAuMTY1LCB0aGlzLnRleHRXaWR0aCwgMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLHRoaXMudGV4dEhlaWdodCowLjE2NSwgdGhpcy50ZXh0V2lkdGgsIDIpO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCgwLDExKnRoaXMudGV4dEhlaWdodCt0aGlzLnRleHRIZWlnaHQqMC4xNjUsIHRoaXMudGV4dFdpZHRoLCAyKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaWdpdHNDYW52YXMgPSBjYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kVG8obm9kZSkge1xyXG4gICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIG5ld0RpZ2l0KCkge1xyXG4gICAgICAgIGNvbnN0IGRpZ2l0ID0gbmV3IE9kb21ldGVyRGlnaXQodGhpcyk7XHJcbiAgICAgICAgZGlnaXQuYXBwZW5kVG8odGhpcy5jb250YWluZXIpO1xyXG4gICAgICAgIGRpZ2l0LnN0b3BDYWxsYmFjayA9IHRoaXMuX2RpZ2l0U3RvcENhbGxiYWNrLmJpbmQodGhpcywgdGhpcy5kaWdpdHMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLmRpZ2l0cy5wdXNoKGRpZ2l0KTtcclxuICAgICAgICBkaWdpdC5zcGluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlRGlnaXQoKSB7XHJcbiAgICAgICAgY29uc3QgbGFzdERpZ2l0ID0gdGhpcy5kaWdpdHMucG9wKCk7XHJcbiAgICAgICAgbGFzdERpZ2l0LnN0b3AoKTtcclxuICAgICAgICBsYXN0RGlnaXQucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgX2RpZ2l0U3RvcENhbGxiYWNrKGluZGV4KSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInN0b3BcIiwgaW5kZXgpO1xyXG4gICAgICAgIGlmIChpbmRleCArIDEgPCB0aGlzLmRpZ2l0cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dERpZ2l0ID0gdGhpcy5kaWdpdHNbaW5kZXgrMV07XHJcbiAgICAgICAgICAgIG5leHREaWdpdC5zdG9wT25EaWdpdChwYXJzZUludCh0aGlzLnRhcmdldE51bWJlclN0cltpbmRleCsxXSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQobnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdWxkR29VcCA9IG51bWJlciA+IHRoaXMudGFyZ2V0TnVtYmVyO1xyXG4gICAgICAgIGNvbnN0IG51bWJlclN0ciA9IG51bWJlci50b1N0cmluZygpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyID0gbnVtYmVyO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0TnVtYmVyU3RyID0gbnVtYmVyU3RyO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2cobnVtYmVyU3RyKTtcclxuXHJcblxyXG5cclxuICAgICAgICBjb25zdCBsZW5ndGggPSBudW1iZXJTdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICB3aGlsZSAodGhpcy5kaWdpdHMubGVuZ3RoIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmV3RGlnaXQoKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIHdoaWxlICh0aGlzLmRpZ2l0cy5sZW5ndGggPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVEaWdpdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5iRGlmZmVyZW50cyA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuICAgICAgICAgICAgbGV0IGRpZ2l0ID0gdGhpcy5kaWdpdHNbaV07XHJcbiAgICAgICAgICAgIGRpZ2l0LmRpcmVjdGlvbklzVXAgPSBzaG91bGRHb1VwO1xyXG4gICAgICAgICAgICBkaWdpdC5zcGVlZCA9IHRoaXMuc3BlZWQgKiAoMi4wICsgTWF0aC5wb3coMi4wLCBuYkRpZmZlcmVudHMpKTtcclxuICAgICAgICAgICAgbGV0IHN0b3BEaWdpdCA9IHBhcnNlSW50KG51bWJlclN0cltpXSk7XHJcbiAgICAgICAgICAgIGlmIChzdG9wRGlnaXQgPT09IGRpZ2l0LnRhcmdldERpZ2l0ICYmIG5iRGlmZmVyZW50cyA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChuYkRpZmZlcmVudHMgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBuYkRpZmZlcmVudHMgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LnN0b3BPbkRpZ2l0KHN0b3BEaWdpdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICsrbmJEaWZmZXJlbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpZ2l0LnNwaW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2RpZ2l0LnN0b3BPbkRpZ2l0KHBhcnNlSW50KG51bWJlclN0cltpXSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyppZiAoZmlyc3REaWZmZXJlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5kaWdpdHNbMF0uc3RvcE9uRGlnaXQocGFyc2VJbnQobnVtYmVyU3RyWzBdKSk7XHJcbiAgICAgICAgfSovXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuY2xhc3MgT2RvbWV0ZXJEaWdpdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihvZG9tZXRlcikge1xyXG4gICAgICAgIC8vIGJlYXV0aWZ1bCBjaXJjdWxhciByZWZlcmVuY2VcclxuICAgICAgICB0aGlzLm9kb21ldGVyID0gb2RvbWV0ZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uSXNVcCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc1NwaW5uaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSAtdGhpcy5vZG9tZXRlci50ZXh0SGVpZ2h0LTE7XHJcbiAgICAgICAgdGhpcy5zcGVlZCA9IDIuMDtcclxuXHJcbiAgICAgICAgdGhpcy5zaG91bGRTdG9wT25EaWdpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkQ2FudmFzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYnVpbGRDYW52YXMoKSB7XHJcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgICAgICBjYW52YXMud2lkdGggPSB0aGlzLm9kb21ldGVyLnRleHRXaWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5vZG9tZXRlci50ZXh0SGVpZ2h0K3RoaXMub2RvbWV0ZXIudGV4dFRvcE1hcmdpbjtcclxuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICBjYW52YXMuc3R5bGUubWFyZ2luUmlnaHQgPSBcIjJweFwiO1xyXG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbklzVXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuc3BpbigpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uSXNVcCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3BpbigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFuaW1hdGUodGltZSkge1xyXG4gICAgICAgIGNvbnN0IHRleHRIZWlnaHQgPSB0aGlzLm9kb21ldGVyLnRleHRIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHRpbWVEaWZmID0gdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lID8gKHRpbWUgLSB0aGlzLnByZXZpb3VzQW5pbWF0ZVRpbWUpIDogMS4wO1xyXG4gICAgICAgIHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA9IHRpbWU7XHJcbiAgICAgICAgbGV0IHNwZWVkID0gKHRpbWVEaWZmICogdGV4dEhlaWdodCkgKiB0aGlzLnNwZWVkICogMC4wMDE7XHJcbiAgICAgICAgaWYgKHNwZWVkID4gdGV4dEhlaWdodCoxLjUpIHtcclxuICAgICAgICAgICAgc3BlZWQgPSB0ZXh0SGVpZ2h0ICogKDAuNStNYXRoLnJhbmRvbSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHAgPSB0aGlzLnBvc2l0aW9uICsgc3BlZWQgKiAodGhpcy5kaXJlY3Rpb25Jc1VwID8gLTEgOiAxKSArIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgaWYgKHAgPCAtdGV4dEhlaWdodCoxMCkge1xyXG4gICAgICAgICAgICBwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKHAgPiAwKSB7XHJcbiAgICAgICAgICAgIHAgPSAtdGV4dEhlaWdodCoxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3VsZFN0b3BPbkRpZ2l0ICYmIHRpbWVEaWZmICE9PSAxLjApIHtcclxuICAgICAgICAgICAgY29uc3QgbSA9IC10ZXh0SGVpZ2h0ICogKHRoaXMudGFyZ2V0RGlnaXQrMSB8fCAwKTtcclxuICAgICAgICAgICAgY29uc3QgbWFyZ2luID0gdGhpcy5zcGVlZCoyICsgdGV4dEhlaWdodCAvIDMwLjA7XHJcbiAgICAgICAgICAgIGlmIChwID4gbS1tYXJnaW4gJiYgcCA8IG0rbWFyZ2luKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU3Bpbm5pbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0b3BDYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcENhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwID0gbS0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHA7XHJcbiAgICAgICAgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzU3Bpbm5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25GcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0ZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMub2RvbWV0ZXIuZGlnaXRzQ2FudmFzLCAwLCB0aGlzLnBvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBzcGluKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1NwaW5uaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdWxkU3RvcE9uRGlnaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc1NwaW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0FuaW1hdGVUaW1lID0gMC4wO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUoMC4wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25GcmFtZUlkKSB7XHJcbiAgICAgICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucHJldmlvdXNBbmltYXRlVGltZSA9IDAuMDtcclxuICAgICAgICB0aGlzLmlzU3Bpbm5pbmcgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9wT25EaWdpdChkaWdpdCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc1NwaW5uaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3BpbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3VsZFN0b3BPbkRpZ2l0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnRhcmdldERpZ2l0ID0gZGlnaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kVG8obm9kZSkge1xyXG4gICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5jYW52YXMucGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNvbnN0IG9kbyA9IG5ldyBPZG9tZXRlcig1LjApO1xyXG5vZG8uYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XHJcbm9kby5zZXQoMTI2Nzg5MDkxKTtcclxuXHJcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQob2RvLmRpZ2l0c0NhbnZhcyk7XHJcbi8vb2RvLmJ1aWxkRGlnaXRzQ2FudmFzKCk7XHJcbi8qY29uc3QgZGlnaXQgPSBuZXcgT2RvbWV0ZXJEaWdpdChvZG8pO1xyXG5kaWdpdC5idWlsZENhbnZhcygpO1xyXG5cclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvZG8uZGlnaXRzQ2FudmFzKTtcclxuLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpZ2l0LmNhbnZhcyk7XHJcbmRpZ2l0LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpOyovXHJcblxyXG4vL2Z1bmN0aW9uIGxvbCh0aW1lKSB7XHJcbi8vICAgIGRpZ2l0LnNwaW4oKTtcclxuLy8gICAgZGlnaXQuZHJhdygpO1xyXG4vLyAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUobG9sKTtcclxuLy99XHJcblxyXG4vL2xvbCgpO1xyXG5cclxuLyp2YXIgc2l6ZVJhdGlvID0gNC4wO1xyXG52YXIgdGV4dFdpZHRoID0gMTUgKiBzaXplUmF0aW87XHJcbnZhciB0ZXh0SGVpZ2h0ID0gMjAgKiBzaXplUmF0aW87XHJcbnZhciB0ZXh0TGVmdE1hcmdpbiA9IDIgKiBzaXplUmF0aW87XHJcbnZhciB0ZXh0VG9wTWFyZ2luID0gNiAqIHNpemVSYXRpbztcclxuXHJcbnZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xyXG5jYW52YXMud2lkdGggPSB0ZXh0V2lkdGg7XHJcbmNhbnZhcy5oZWlnaHQgPSAxMSp0ZXh0SGVpZ2h0ICsgdGV4dFRvcE1hcmdpbjtcclxuXHJcbnZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuY3R4LmZpbGxTdHlsZSA9IFwiI2NmZDhkY1wiO1xyXG5jdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbmN0eC5maWxsU3R5bGUgPSBcIiM5YzI3YjBcIjtcclxuY3R4LmZvbnQgPSB0ZXh0SGVpZ2h0K1wicHggbW9ub3NwYWNlXCI7XHJcbmZvciAodmFyIGkgPSAwOyBpIDwgMTA7KytpKSB7XHJcbiAgICBjdHguZmlsbFRleHQoaS50b1N0cmluZygpLCB0ZXh0TGVmdE1hcmdpbiwoaSsyKSp0ZXh0SGVpZ2h0KTtcclxufVxyXG5jdHguZmlsbFRleHQoXCI5XCIsdGV4dExlZnRNYXJnaW4sdGV4dEhlaWdodCk7XHJcbi8vY3R4LmZpbGxUZXh0KFwiQVwiLCAyLDI0MCk7XHJcblxyXG52YXIgY2FudmFzTmIxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuY2FudmFzTmIxLndpZHRoID0gdGV4dFdpZHRoKjI7XHJcbmNhbnZhc05iMS5oZWlnaHQgPSB0ZXh0SGVpZ2h0K3RleHRUb3BNYXJnaW47XHJcblxyXG52YXIgY3R4MSA9IGNhbnZhc05iMS5nZXRDb250ZXh0KFwiMmRcIik7XHJcbmN0eDEuZmlsbFN0eWxlID0gXCJncmVlblwiO1xyXG5jdHgxLmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG52YXIgcCA9IDA7XHJcbnZhciBwMiA9IDA7XHJcbnZhciBwcmV2aW91c1RpbWUgPSAwO1xyXG5mdW5jdGlvbiBhbmltYXRlKHRpbWUpIHtcclxuICAgIHZhciB0aW1lRGlmZiA9IHRpbWUgLSBwcmV2aW91c1RpbWU7XHJcbiAgICBwcmV2aW91c1RpbWUgPSB0aW1lO1xyXG4gICAgdmFyIHNwZWVkID0gKHRpbWVEaWZmICogdGV4dEhlaWdodCkgLyAoNTAwLjApO1xyXG4gICAgcCAtPSBzcGVlZDtcclxuICAgIGlmIChwIDwgLXRleHRIZWlnaHQqMTApIHAgPSAwO1xyXG5cclxuICAgIGN0eDEuZHJhd0ltYWdlKGNhbnZhcywgMCwgcCk7XHJcblxyXG4gICAgcDIgKz0gc3BlZWQ7XHJcbiAgICBpZiAocDIgPiAwKSBwMiA9IC10ZXh0SGVpZ2h0KjEwO1xyXG4gICAgY3R4MS5kcmF3SW1hZ2UoY2FudmFzLCB0ZXh0V2lkdGgsIHAyKTtcclxuXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XHJcbn1cclxucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xyXG5cclxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhc05iMSk7Ki8iXX0=