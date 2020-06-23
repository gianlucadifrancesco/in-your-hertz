import { Component, OnInit, Inject } from '@angular/core';
import { isSupported } from 'angular-audio-context';

(window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})

export class PlayerComponent implements OnInit {
  ngOnInit() {}
  constructor(@Inject(isSupported) public isSupported) { }
  playing = false;
  audioCtx = new AudioContext();
  gainNode = this.audioCtx.createGain();
  osc = this.audioCtx.createOscillator();
  stopTimer = null;
  silderValue = 10000;
  hz = 440;
  volume = 50;
  type: OscillatorType = 'sine';

  play() {
      this.osc = this.audioCtx.createOscillator();
      this.osc.type = this.type;
      this.osc.frequency.value = this.hz;
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.osc.connect(this.gainNode);
      this.osc.start();
      this.gainNode.connect(this.audioCtx.destination);
      this.gainNode.gain.setTargetAtTime(this.volume/400, this.audioCtx.currentTime, 0.1);
      this.playing = true;
  }

  stop() {
    this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.1);
    this.stopTimer = setTimeout(() => { this.osc.stop(); }, 100);
    this.playing = false;
  }

  switchHzFromSlider(hz) {
    if(+hz >= 1 && +hz <= 20000) {
      this.silderValue = hz;
      if(hz <= 10000) this.hz = Math.ceil(hz / 10000 * 440);
      else if(hz <= 16000) this.hz = Math.ceil(440 + (hz-10000)/6000*4560); // if(n <= max) { before + (n-min)/(max-min)*(after-before); }
      else if(hz <= 18000) this.hz = Math.ceil(5000 + (hz-16000)/2000*5000);
      else this.hz = Math.ceil(10000 + (hz-18000)/2000*10000);
      if(this.playing)
        this.osc.frequency.setTargetAtTime(this.hz, this.audioCtx.currentTime, 0.05);
    }
  }

  switchHzFromText(hz) {
    if(+hz >= 1 && +hz <= 20000) {
      this.hz = hz;
      if(hz <= 440) this.silderValue = Math.floor(hz / 440 * 10000);
      else if(hz <= 5000) this.silderValue = (hz-440) / 4560 * 6000 + 10000; // if(n <= max) { (n-before) / (after-before) * (max-min) + min; }
      else if(hz <= 10000) this.silderValue = (hz-5000) / 5000 * 2000 + 16000;
      else this.silderValue = (hz-10000) / 10000 * 2000 + 18000;
      if(this.playing)
        this.osc.frequency.setTargetAtTime(this.hz, this.audioCtx.currentTime, 0.05);
    }
  }

  switchVolume(volume) {
    if(+volume >= 0 && +volume <= 100)
      this.volume = Math.floor(volume);
    if(this.playing)
      this.gainNode.gain.setTargetAtTime(this.volume/400, this.audioCtx.currentTime, 0.1);
    
  }

  switchType(type) {
    this.type = type;
    this.osc.type = type;
  }

}
