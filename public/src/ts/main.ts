import { DebugController } from './debugController';
import { Config } from './models/config';
import { PageEventController } from './pageEventController';

export class Main {
  public root: HTMLElement;

  public fullScreenSupported: boolean;

  public pageEventController: PageEventController;
  public debugController: DebugController;

  public config: Config;

  constructor () {
    this.config = new Config();
    this.debugController = new DebugController(this);
    this.registerListeners();

    // check if we're on a mobile apple device
    if ((/iPhone|iPad/).test(navigator.userAgent)) {
      this.fullScreenSupported = false;
    } else {
      this.fullScreenSupported =
        'requestFullscreen' in this.root ||
        'webkitRequestFullscreen' in this.root ||
        'mozRequestFullScreen' in this.root;
    }

    this.resizeRoot();
    setInterval(this.resizeRoot, 100);

    // init the loader
    const loader = new Loader((songId:number) => {
      new Titlescreen(songId);
    });
  }

  /**
   * Register event listeners
   */
  registerListeners () {
    addEventListener('error', (err) => {
      const stack =
        `${err.message}
    at ${err.filename}:${err.lineno}:${err.colno}`;
      this.errorMessage(stack);
    });

    this.pageEventController.keyAdd(debugObj, 'all', 'down', (event: KeyboardEvent) => {
      if (
        event.key === ';' &&
        event.ctrlKey &&
        (event.shiftKey || event.altKey)
      ) {
        // Semicolon
        if (debugObj.state === 'open') {
          debugObj.debug.minimise();
        } else if (debugObj.state === 'minimised') {
          debugObj.debug.restore();
        } else {
          try {
            debugObj.debug = new Debug();
          } catch (e) {}
        }
      }
      if (event.key === 'r' && this.config.debugEnabled) {
        // R
        this.debugController.restartSong();
      }
    });

    this.pageEventController.addEvent(versionDiv, ['click', 'touchend'], (event : Event) => {
      if (event.target === versionDiv) {
        versionLink.click();
        pageEvents.send('version-link');
      }
    });

    this.pageEventController.addEvent(root, ['touchstart', 'touchmove', 'touchend'], (event : TouchEvent) => {
      if (
        event.cancelable &&
        cancelTouch &&
        (event.target as HTMLElement).tagName !== 'SELECT'
      ) {
        event.preventDefault();
      }
    });
  }

  /**
   * Store the given error in localStorage
   * @param stack Stacktrace of error
   */
  errorMessage (stack: string) {
    localStorage.lastError = JSON.stringify({
      timestamp: Date.now(),
      stack: stack
    });
  }

  /**
   * toggle full screen with added vendor checks for old ass browsers
   */
  toggleFullscreen () {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  public lastHeight: number;

  resizeRoot () {
    if (this.lastHeight !== innerHeight) {
      this.lastHeight = innerHeight;
      this.root.style.height = `${innerHeight}px`;
    }
  }

  openDebug () {
    if (debugObj.state === 'open') {
      debugObj.debug.clean();
      return 'Debug closed';
    } else if (debugObj.state === 'minimised') {
      debugObj.debug.restore();
      return 'Debug restored';
    } else {
      debugObj.debug = new Debug();
      return 'Debug opened';
    }
  }

  public strings: string[];
  public pageEvents = new PageEvents();

  // var snd = {}
  // var p2
  // var disableBlur = false
  // var cancelTouch = true
  // var debugObj = {
  //     state: "closed",
  //     debug: null
  // }
  // var perf = {
  //     blur: 0,
  //     allImg: 0,
  //     load: 0
  // }
  // var defaultDon = {
  //     body_fill: "#5fb7c1",
  //     face_fill: "#ff5724"
  // }
  // var vectors
  // var settings
  // var scoreStorage
  // var account = {}
  // var gpicker

  // var versionDiv = document.getElementById("version")
  // var versionLink = document.getElementById("version-link")
  // versionLink.tabIndex = -1
}
