import assert from 'node:assert/strict';
import {VisibleClock,durationText} from '../assets/attempt-timer.js';
const c=new VisibleClock(null,0,true);
assert.equal(c.checkpoint(10000),0); // Merely opening the page does not start it.
c.start(10000);assert.equal(c.checkpoint(15000),5);
c.visibility(false,15000);assert.equal(c.checkpoint(55000),5);
c.visibility(true,55000);assert.equal(c.checkpoint(58000),8);
const reloaded=new VisibleClock(c.snapshot(),900000,true); // Reload/offline gap excluded.
assert.equal(reloaded.checkpoint(902000),10);
assert.equal(reloaded.stop(904000),12);assert.equal(reloaded.checkpoint(999999),12);
const fresh=new VisibleClock(null,0,true);fresh.start(0);assert.equal(fresh.stop(4000000),3600);
const invalid=new VisibleClock({ms:-4},0,true);assert.equal(invalid.seconds,0);
assert.equal(durationText(252),'4:12');assert.equal(durationText(undefined),'');assert.equal(durationText(null),'');
console.log('PASS timer: first interaction, visible/hidden, reload gap, stop, new attempt, 60-minute cap, formatting.');
