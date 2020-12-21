export class InputSlider {
    fixedPoint: any;
    mul: number;
    min: number;
    max: number;
    input: any;
    reset: any;
    plus: any;
    minus: any;
    value: any;
    defaultValue: any;
    callbacks: any[];
    touchEnd: any[];
    windowSymbol: symbol;

    constructor (public main: Main, sliderDiv, min, max, fixedPoint) {
      this.fixedPoint = fixedPoint;
      this.mul = Math.pow(10, fixedPoint);
      this.min = min * this.mul;
      this.max = max * this.mul;

      this.input = sliderDiv.getElementsByTagName('input')[0];
      this.reset = sliderDiv.getElementsByClassName('reset')[0];
      this.plus = sliderDiv.getElementsByClassName('plus')[0];
      this.minus = sliderDiv.getElementsByClassName('minus')[0];
      this.value = null;
      this.defaultValue = null;
      this.callbacks = [];
      this.touchEnd = [];
      this.windowSymbol = Symbol();
      main.pageEventController.add(this.input, ['touchstart', 'touchend'], event => {
        event.stopPropagation();
      });

      main.pageEventController.add(window, ['mouseup', 'touchstart', 'touchend', 'blur'], event => {
        if (event.type !== 'touchstart') {
          this.touchEnd.forEach(func => func(event));
        } else if (event.target !== this.input) {
          this.input.blur();
        }
      }, this.windowSymbol);

      this.addTouchRepeat(this.plus, this.add.bind(this));
      this.addTouchRepeat(this.minus, this.subtract.bind(this));
      this.addTouch(this.reset, this.resetValue.bind(this));
      main.pageEventController.add(this.input, 'change', this.manualSet.bind(this));
      main.pageEventController.add(this.input, 'keydown', this.captureKeys.bind(this));
    }

    update (noCallback, force) {
      const oldValue = this.input.value;
      if (this.value === null) {
        this.input.value = '';
        this.input.readOnly = true;
      } else {
        if (this.value > this.max) {
          this.value = this.max;
        }
        if (this.value < this.min) {
          this.value = this.min;
        }
        this.input.value = this.get().toFixed(this.fixedPoint);
        this.input.readOnly = false;
      }
      if (force || !noCallback && oldValue !== this.input.value) {
        this.callbacks.forEach(callback => {
          callback(this.get());
        });
      }
    }

    set (number) {
      this.value = Math.floor(number * this.mul);
      this.defaultValue = this.value;
      this.update(true);
    }

    setMinMax (min, max) {
      this.min = min;
      this.max = max;
      this.update();
    }

    get () {
      if (this.value === null) {
        return null;
      } else {
        return Math.floor(this.value) / this.mul;
      }
    }

    add (event) {
      if (this.value !== null) {
        const newValue = this.value + this.eventNumber(event);
        if (newValue <= this.max) {
          this.value = newValue;
          this.update();
        }
      }
    }

    subtract (event) {
      if (this.value !== null) {
        const newValue = this.value - this.eventNumber(event);
        if (newValue >= this.min) {
          this.value = newValue;
          this.update();
        }
      }
    }

    eventNumber (event) {
      return (event.ctrlKey ? 10 : 1) * (event.shiftKey ? 10 : 1) * (event.altKey ? 10 : 1) * 1;
    }

    resetValue () {
      this.value = this.defaultValue;
      this.update();
    }

    onchange (callback) {
      this.callbacks.push(callback);
    }

    manualSet () {
      const number = parseFloat(this.input.value) * this.mul;
      if (Number.isFinite(number) && this.min <= number && number <= this.max) {
        this.value = number;
      }
      this.update(false, true);
    }

    captureKeys (event) {
      event.stopPropagation();
    }

    addTouch (element, callback) {
      pageEvents.add(element, ['mousedown', 'touchstart'], event => {
        if (event.type === 'touchstart') {
          event.preventDefault();
        } else if (event.which !== 1) {
          return;
        }
        callback(event);
      });
    }

    addTouchRepeat (element, callback) {
      this.addTouch(element, event => {
        let active = true;
        var func = () => {
          active = false;
          this.touchEnd.splice(this.touchEnd.indexOf(func), 1);
        };
        this.touchEnd.push(func);
        var repeat = delay => {
          if (active && this.touchEnd) {
            callback(event);
            setTimeout(() => repeat(50), delay);
          }
        };
        repeat(400);
      });
    }

    removeTouch (element) {
      this.main.pageEventController.remove(element, ['mousedown', 'touchstart']);
    }

    clean () {
      this.removeTouch(this.plus);
      this.removeTouch(this.minus);
      this.removeTouch(this.reset);
      this.main.pageEventController.remove(this.input, ['touchstart', 'touchend']);
      this.main.pageEventController.remove(window, ['mouseup', 'touchstart', 'touchend', 'blur'], this.windowSymbol);
      this.main.pageEventController.remove(this.input, ['touchstart', 'change', 'keydown']);

      delete this.input;
      delete this.reset;
      delete this.plus;
      delete this.minus;
      delete this.windowSymbol;
      delete this.touchEnd;
    }
}
