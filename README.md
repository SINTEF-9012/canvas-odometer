

# ![Canvas Odometer](https://user-images.githubusercontent.com/45740/37472571-b13b0080-286c-11e8-8495-ef6aba591646.gif)

A HTML odometer using canvas.

[Online example](https://sintef-9012.github.io/canvas-odometer/).

# Example of Usage

```javascript
    const odometer = new FloatOdometer(4.0, {
        textColour: "#003c65",
        borderColour: "#a19589"
    });
    odometer.appendTo(document.body);
    
    odometer.set(454.1874);
```
