import { Main } from './main';
import { InputSlider } from './inputSlider';

export class DebugController {
  debugDiv: HTMLDivElement;
    titleDiv: Element;
    minimiseDiv: Element;
    offsetDiv: Element;
    measureNumDiv: Element;
    branchHideDiv: Element;
    branchSelectDiv: Element;
    branchSelect: any;
    branchResetBtn: any;
    volumeDiv: Element;
    lyricsHideDiv: Element;
    lyricsOffsetDiv: Element;
    restartLabel: Element;
    restartCheckbox: HTMLInputElement;
    autoplayLabel: Element;
    autoplayCheckbox: HTMLInputElement;
    restartBtn: Element;
    exitBtn: Element;
    moving: xyPos;
    windowSymbol: symbol;
    offsetSlider: InputSlider;
    measureNumSlider: InputSlider;
    volumeSlider: InputSlider;
    lyricsSlider: InputSlider;
    controller: any;
    defaultOffset: any;
    songHash: any;
    measureNum: number;

    constructor (public main:Main) {
      if (!main.config.debugEnabled) {
        return;
      }

      this.initialize();
    }

    initialize(){
      this.moving = new xyPos();

      this.debugDiv = document.createElement('div');
      this.debugDiv.id = 'debug';
      this.debugDiv.innerHTML = this.render();
      document.body.appendChild(this.debugDiv);

      this.titleDiv = this.byClass('title');
      this.minimiseDiv = this.byClass('minimise');
      this.offsetDiv = this.byClass('offset');
      this.measureNumDiv = this.byClass('measure-num');
      this.branchHideDiv = this.byClass('branch-hide');
      this.branchSelectDiv = this.byClass('branch-select');
      this.branchSelect = this.branchSelectDiv.getElementsByTagName('select')[0];
      this.branchResetBtn = this.branchSelectDiv.getElementsByClassName('reset')[0];
      this.volumeDiv = this.byClass('music-volume');
      this.lyricsHideDiv = this.byClass('lyrics-hide');
      this.lyricsOffsetDiv = this.byClass('lyrics-offset');
      this.restartLabel = this.byClass('change-restart-label');
      this.restartCheckbox = this.byClass('change-restart') as HTMLInputElement;
      this.autoplayLabel = this.byClass('autoplay-label');
      this.autoplayCheckbox = this.byClass('autoplay') as HTMLInputElement;
      this.restartBtn = this.byClass('restart-btn');
      this.exitBtn = this.byClass('exit-btn');

      this.moving.isMoving = false;
      this.windowSymbol = Symbol();
      main.pageEventController.add(window, ['mousedown', 'mouseup', 'touchstart', 'touchend', 'blur', 'resize'], this.stopMove.bind(this), this.windowSymbol);
      main.pageEventController.mouseAdd(this, this.onMove.bind(this));
      main.pageEventController.add(window, 'touchmove', this.onMove.bind(this));
      main.pageEventController.add(this.titleDiv, ['mousedown', 'touchstart'], this.startMove.bind(this));
      main.pageEventController.add(this.minimiseDiv, ['click', 'touchstart'], this.minimise.bind(this));
      main.pageEventController.add(this.restartBtn, ['click', 'touchstart'], this.restartSong.bind(this));
      main.pageEventController.add(this.exitBtn, ['click', 'touchstart'], this.clean.bind(this));
      main.pageEventController.add(this.restartLabel, 'touchstart', this.touchBox.bind(this));
      main.pageEventController.add(this.autoplayLabel, 'touchstart', this.touchBox.bind(this));
      main.pageEventController.add(this.autoplayCheckbox, 'change', this.toggleAutoplay.bind(this));
      main.pageEventController.add(this.branchSelect, 'change', this.branchChange.bind(this));
      main.pageEventController.add(this.branchResetBtn, ['click', 'touchstart'], this.branchReset.bind(this));

      this.offsetSlider = new InputSlider(this.offsetDiv, -60, 60, 3);
      this.offsetSlider.onchange(this.offsetChange.bind(this));

      this.measureNumSlider = new InputSlider(this.measureNumDiv, 0, 1000, 0);
      this.measureNumSlider.onchange(this.measureNumChange.bind(this));
      this.measureNumSlider.set(0);

      this.volumeSlider = new InputSlider(this.volumeDiv, 0, 3, 2);
      this.volumeSlider.onchange(this.volumeChange.bind(this));
      this.volumeSlider.set(1);

      this.lyricsSlider = new InputSlider(this.lyricsOffsetDiv, -60, 60, 3);
      this.lyricsSlider.onchange(this.lyricsChange.bind(this));

      this.moveTo(100, 100);
      this.restore();
      this.updateStatus();
      main.pageEventController.send('debug');
    }

    byClass (name: string) {
      return this.debugDiv.getElementsByClassName(name)[0];
    }

    startMove (event : TouchEvent) {
      if (event.type === 'touchstart') {
        event.stopPropagation();
        const divPos = this.debugDiv.getBoundingClientRect();
        const click : Touch = event.changedTouches[0];

        const x = click.pageX - divPos.left;
        const y = click.pageY - divPos.top;

        this.moving.set(x, y);
      }
    }

    onMove (event : TouchEvent) {
      if (this.moving.isMoving) {
        const click : Touch = event.changedTouches[0];

        const x = click.clientX - this.moving.x;
        const y = click.clientY - this.moving.y;

        this.moveTo(x, y);
      }
    }

    stopMove (event?: Event | TouchEvent) {
      if (this.debugDiv.style.display === 'none') {
        return;
      }
      if (!event || event.type === 'resize') {
        const divPos = this.debugDiv.getBoundingClientRect();
        var x = divPos.left;
        var y = divPos.top;
      } else if ((event as TouchEvent).changedTouches){
        const touch = (event as TouchEvent).changedTouches[0];
        if (event.type == 'blur') {
          var x = this.moving.x;
          var y = this.moving.y;
        } else {
          var x = touch.clientX - this.moving.x;
          var y = touch.clientY - this.moving.y;
        }
      }
      const w = this.debugDiv.offsetWidth;
      const h = this.debugDiv.offsetHeight;
      if (x + w > innerWidth) {
        x = innerWidth - w;
      }
      if (y + h > lastHeight) {
        y = lastHeight - h;
      }
      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      this.moveTo(x, y);
      this.moving.isMoving = false;
    }

    moveTo (x: number, y: number) {
      this.debugDiv.style.transform = `translate(${x}px, ${y}px)`;
    }

    restore () {
      debugObj.state = 'open';
      this.debugDiv.style.display = '';
      this.stopMove();
    }

    minimise () {
      debugObj.state = 'minimised';
      this.debugDiv.style.display = 'none';
    }

    updateStatus () {
      if (debugObj.controller && !this.controller) {
        this.controller = debugObj.controller;

        this.restartBtn.style.display = 'block';
        this.autoplayLabel.style.display = 'block';
        if (this.controller.parsedSongData.branches) {
          this.branchHideDiv.style.display = 'block';
        }
        if (this.controller.lyrics) {
          this.lyricsHideDiv.style.display = 'block';
        }

        const selectedSong = this.controller.selectedSong;
        this.defaultOffset = selectedSong.offset || 0;
        if (this.songHash === selectedSong.hash) {
          this.offsetChange(this.offsetSlider.get(), true);
          this.branchChange(true);
          this.volumeChange(this.volumeSlider.get(), true);
          this.lyricsChange(this.lyricsSlider.get(), true);
        } else {
          this.songHash = selectedSong.hash;
          this.offsetSlider.set(this.defaultOffset);
          this.branchReset(true);
          this.volumeSlider.set(this.controller.volume);
          this.lyricsSlider.set(this.controller.lyrics ? this.controller.lyrics.vttOffset / 1000 : 0);
        }

        const measures = this.controller.parsedSongData.measures.filter((measure, i, array) => {
          return i === 0 || Math.abs(measure.ms - array[i - 1].ms) > 0.01;
        });
        this.measureNumSlider.setMinMax(0, measures.length - 1);
        if (this.measureNum > 0 && measures.length >= this.measureNum) {
          const measureMS = measures[this.measureNum - 1].ms;
          const game = this.controller.game;
          game.started = true;
          const timestamp = Date.now();
          const currentDate = timestamp - measureMS;
          game.startDate = currentDate;
          game.sndTime = timestamp - snd.buffer.getTime() * 1000;
          const circles = game.songData.circles;
          for (const i in circles) {
            game.currentCircle = i;
            if (circles[i].endTime >= measureMS) {
              break;
            }
            game.skipNote(circles[i]);
          }
          if (game.mainMusicPlaying) {
            game.mainMusicPlaying = false;
            game.mainAsset.stop();
          }
        }
        this.autoplayCheckbox.checked = this.controller.autoPlayEnabled;
      }
      if (this.controller && !debugObj.controller) {
        this.restartBtn.style.display = '';
        this.autoplayLabel.style.display = '';
        this.branchHideDiv.style.display = '';
        this.lyricsHideDiv.style.display = '';
        this.controller = null;
      }
      this.stopMove();
    }

    offsetChange (value: number, noRestart: boolean) {
      if (this.controller) {
        const offset = (this.defaultOffset - value) * 1000;
        const songData = this.controller.parsedSongData;
        songData.circles.forEach(circle => {
          circle.ms = circle.originalMS + offset;
          circle.endTime = circle.originalEndTime + offset;
        });
        songData.measures.forEach(measure => {
          measure.ms = measure.originalMS + offset;
        });
        if (songData.branches) {
          songData.branches.forEach(branch => {
            branch.ms = branch.originalMS + offset;
          });
        }
        if (this.controller.lyrics) {
          this.controller.lyrics.offsetChange(value * 1000);
        }
        if (this.restartCheckbox.checked && !noRestart) {
          this.restartSong();
        }
      }
    }

    measureNumChange (value: number) {
      this.measureNum = value;
      if (this.restartCheckbox.checked) {
        this.restartSong();
      }
    }

    volumeChange (value: number, noRestart: boolean) {
      if (this.controller) {
        snd.musicGain.setVolumeMul(value);
      }
      if (this.restartCheckbox.checked && !noRestart) {
        this.restartSong();
      }
    }

    lyricsChange (value: number, noRestart: boolean) {
      if (this.controller && this.controller.lyrics) {
        this.controller.lyrics.offsetChange(undefined, value * 1000);
      }
      if (this.restartCheckbox.checked && !noRestart) {
        this.restartSong();
      }
    }

    restartSong () {
      if (this.controller) {
        this.controller.restartSong();
      }
    }

    toggleAutoplay () {
      if (this.controller) {
        this.controller.autoPlayEnabled = this.autoplayCheckbox.checked;
        if (this.controller.autoPlayEnabled) {
          this.controller.saveScore = false;
        } else {
          const keyboard = debugObj.controller.keyboard;
          keyboard.setKey(false, 'don_l');
          keyboard.setKey(false, 'don_r');
          keyboard.setKey(false, 'ka_l');
          keyboard.setKey(false, 'ka_r');
        }
      }
    }

    branchChange (noRestart : boolean) {
      if (this.controller) {
        const game = this.controller.game;
        const name = this.branchSelect.value;
        game.branch = name === 'auto' ? false : name;
        game.branchSet = name === 'auto';
        if (noRestart) {
          game.branchStatic = true;
        }
        const selectedOption = this.branchSelect.selectedOptions[0];
        this.branchSelect.style.background = selectedOption.style.background;
        if (this.restartCheckbox.checked && !noRestart) {
          this.restartSong();
        }
      }
    }

    branchReset (noRestart : boolean) {
      this.branchSelect.value = 'auto';
      this.branchChange(noRestart);
    }

    touchBox (event) {
      event.currentTarget.click();
    }

    clean () {
      this.offsetSlider.clean();
      this.measureNumSlider.clean();
      this.volumeSlider.clean();
      this.lyricsSlider.clean();

      this.main.pageEventController.removeEvent(window, ['mousedown', 'mouseup', 'touchstart', 'touchend', 'blur', 'resize'], this.windowSymbol);
      this.main.pageEventController.mouseRemove(this);
      this.main.pageEventController.removeEvent(window, 'touchmove');
      this.main.pageEventController.removeEvent(this.titleDiv, ['mousedown', 'touchstart']);
      this.main.pageEventController.removeEvent(this.minimiseDiv, ['click', 'touchstart']);
      this.main.pageEventController.removeEvent(this.restartBtn, ['click', 'touchstart']);
      this.main.pageEventController.removeEvent(this.exitBtn, ['click', 'touchstart']);
      this.main.pageEventController.removeEvent(this.restartLabel, 'touchstart');
      this.main.pageEventController.removeEvent(this.autoplayLabel, 'touchstart');
      this.main.pageEventController.removeEvent(this.autoplayCheckbox, 'change');
      this.main.pageEventController.removeEvent(this.branchSelect, 'change');
      this.main.pageEventController.removeEvent(this.branchResetBtn, ['click', 'touchstart']);

      delete this.offsetSlider;
      delete this.measureNumSlider;
      delete this.volumeSlider;
      delete this.titleDiv;
      delete this.minimiseDiv;
      delete this.offsetDiv;
      delete this.measureNumDiv;
      delete this.branchHideDiv;
      delete this.branchSelectDiv;
      delete this.branchSelect;
      delete this.branchResetBtn;
      delete this.volumeDiv;
      delete this.lyricsHideDiv;
      delete this.lyricsOffsetDiv;
      delete this.restartCheckbox;
      delete this.autoplayLabel;
      delete this.autoplayCheckbox;
      delete this.restartBtn;
      delete this.exitBtn;
      delete this.controller;
      delete this.windowSymbol;

      this.main.debugObj.state = 'closed';
      this.main.debugObj.debug = null;

      document.body.removeChild(this.debugDiv);

      delete this.debugDiv;
    }

    render():string{
      return /*html*/ `
      <div class="title stroke-sub" alt="Debug">Debug</div>
        <div class="minimise"></div>
        <div class="content">
          <div>Song offset:</div>
          <div class="offset input-slider">
            <span class="reset">x</span><input type="text" value="" readonly><span class="minus">-</span><span class="plus">+</span>
          </div>
          <div>Starting measure:</div>
          <div class="measure-num input-slider">
            <span class="reset">x</span><input type="text" value="" readonly><span class="minus">-</span><span class="plus">+</span>
          </div>
          <div class="branch-hide">
            <div>Branch:</div>
            <div class="branch-select select">
              <span class="reset">x</span><select>
                <option value="auto" selected style="background:#fff">Auto</option>
                <option value="normal" style="background:#ccc">Normal</option>
                <option value="advanced" style="background:#bdf">Professional</option>
                <option value="master" style="background:#ebf">Master</option>
              </select>
            </div>
          </div>
          <div>Music volume:</div>
          <div class="music-volume input-slider">
            <span class="reset">x</span><input type="text" value="" readonly><span class="minus">-</span><span class="plus">+</span>
          </div>
          <div class="lyrics-hide">
            <div>Lyrics offset:</div>
            <div class="lyrics-offset input-slider">
              <span class="reset">x</span><input type="text" value="" readonly><span class="minus">-</span><span class="plus">+</span>
            </div>
          </div>
          <label class="change-restart-label"><input class="change-restart" type="checkbox">Restart on change</label>
          <label class="autoplay-label"><input class="autoplay" type="checkbox">Auto play</label>
          <div class="bottom-btns">
            <div class="restart-btn">Restart song</div>
            <div class="exit-btn">Exit debug</div>
          </div>
        </div>
      `;
    }
}

export class xyPos{
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  isMoving: boolean;
  x: number;
  y: number;
}