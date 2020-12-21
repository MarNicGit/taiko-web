export class PageEventController {
  allEvents: Map<any, any>;
  keyListeners: Map<any, any>;
  mouseListeners: Map<any, any>;
  blurListeners: Map<any, any>;
  lastKeyEvent: number;
  keyboard: any[];
  lastMouse: any;

  constructor () {
    this.allEvents = new Map();
    this.keyListeners = new Map();
    this.mouseListeners = new Map();
    this.blurListeners = new Map();
    this.lastKeyEvent = -Infinity;
    this.keyboard = [];

    this.add(window, 'keydown', this.keyEvent.bind(this));
    this.add(window, 'keyup', this.keyEvent.bind(this));
    this.add(window, 'mousemove', this.mouseEvent.bind(this));
    this.add(window, 'blur', this.blurEvent.bind(this));
  }

  addEvent (target: HTMLElement, types: string[], callback: { (event: Event): void; (event: TouchEvent): void; }) {
    // if (Array.isArray(type)) {
    //   type.forEach(type => this.addEvent(target, type, callback, symbol));
    //   return;
    // }

    types.forEach(type => {
      let symbol = `${target.id}_${type}`;
      this.removeEvent(target, type, symbol);
      let addedEvent = this.allEvents.get(symbol || target);
      if (!addedEvent) {
        addedEvent = new Map();
        this.allEvents.set(symbol || target, addedEvent);
      }
      addedEvent.set(types, callback);
      return target.addEventListener(type, callback);
    });
  }

  removeEvent (target : HTMLElement, type : string, symbol: string) {
    if (Array.isArray(type)) {
      type.forEach(type => this.removeEvent(target, type, symbol));
      return;
    }
    const addedEvent = this.allEvents.get(symbol || target);
    if (addedEvent) {
      const callback = addedEvent.get(type);
      if (callback) {
        target.removeEventListener(type, callback);
        addedEvent.delete(type);
        if (addedEvent.size == 0) {
          return this.allEvents.delete(symbol || target);
        }
      }
    }
  }

  once (target: HTMLElement, type: string) {
    return new Promise(resolve => {
      this.addEvent(target, type, event => {
        this.removeEvent(target, type);
        return resolve(event);
      });
    });
  }

  race () {
    const symbols = [];
    const target = arguments[0];
    return new Promise(resolve => {
      for (let i = 1; i < arguments.length; i++) {
        symbols[i] = Symbol();
        const type = arguments[i];
        this.add(target, type, event => {
          resolve({
            type: type,
            event: event
          });
        }, symbols[i]);
      }
    }).then(response => {
      for (let i = 1; i < arguments.length; i++) {
        this.removeEvent(target, arguments[i], symbols[i]);
      }
      return response;
    });
  }

  load (target) {
    return new Promise((resolve, reject) => {
      this.race(target, 'load', 'error', 'abort').then(response => {
        switch (response.type) {
          case 'load':
            return resolve(response.event);
          case 'error':
            return reject(['Loading error', target]);
          case 'abort':
            return reject('Loading aborted');
        }
      });
    });
  }

  keyEvent (event) {
    if (!('key' in event) || event.ctrlKey && (event.key === 'c' || event.key === 'x' || event.key === 'v')) {
      return;
    }
    if (this.keyboard.indexOf(event.key.toLowerCase()) !== -1) {
      this.lastKeyEvent = Date.now();
      event.preventDefault();
    }
    this.keyListeners.forEach(addedKeyCode => {
      this.checkListener(addedKeyCode.get('all'), event);
      this.checkListener(addedKeyCode.get(event.keyCode), event);
    });
  }

  checkListener (keyObj, event) {
    if (keyObj && (
      keyObj.type === 'both' ||
			keyObj.type === 'down' && event.type === 'keydown' ||
			keyObj.type === 'up' && event.type === 'up'
    )) {
      keyObj.callback(event);
    }
  }

  keyAdd (target, keyCode, type, callback) {
    // keyCode="all", type="both"
    let addedKeyCode = this.keyListeners.get(target);
    if (!addedKeyCode) {
      addedKeyCode = new Map();
      this.keyListeners.set(target, addedKeyCode);
    }
    addedKeyCode.set(keyCode, {
      type: type,
      callback: callback
    });
  }

  keyRemove (target, keyCode) {
    const addedKeyCode = this.keyListeners.get(target);
    if (addedKeyCode) {
      const keyObj = addedKeyCode.get(keyCode);
      if (keyObj) {
        addedKeyCode.delete(keyCode);
        if (addedKeyCode.size == 0) {
          return this.keyListeners.delete(target);
        }
      }
    }
  }

  keyOnce (target, keyCode, type) {
    return new Promise(resolve => {
      this.keyAdd(target, keyCode, type, event => {
        this.keyRemove(target, keyCode);
        return resolve(event);
      });
    });
  }

  mouseEvent (event) {
    this.lastMouse = event;
    this.mouseListeners.forEach(callback => callback(event));
  }

  mouseAdd (target, callback) {
    this.mouseListeners.set(target, callback);
  }

  mouseRemove (target) {
    this.mouseListeners.delete(target);
  }

  blurEvent (event) {
    this.blurListeners.forEach(callback => callback(event));
  }

  blurAdd (target, callback) {
    this.blurListeners.set(target, callback);
  }

  blurRemove (target) {
    this.blurListeners.delete(target);
  }

  getMouse () {
    return this.lastMouse;
  }

  send (name, detail) {
    dispatchEvent(new CustomEvent(name, { detail: detail }));
  }

  setKeyboard () {
    this.keyboard = [];
    const kbdSettings = settings.getItem('keyboardSettings');
    for (const name in kbdSettings) {
      const keys = kbdSettings[name];
      for (const i in keys) {
        this.keyboard.push(keys[i]);
      }
    }
  }
}
