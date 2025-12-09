// logic.js

// Helper: subtle entropy but also time-based seed so pattern relates to current time
function _seed() {
  const d = new Date();
  // mix hours, minutes and seconds into a 0..1 value
  const v = ((d.getHours() * 3600) + (d.getMinutes() * 60) + d.getSeconds()) % 1000;
  return (v / 1000);
}

// format to two decimals and clamp within bounds [5,16]
function _formatOdd(v) {
  if (!isFinite(v)) v = 5.00;
  if (v < 5.00) v = 5.00;
  if (v > 16.00) v = 16.00;
  return v.toFixed(2) + 'x';
}

function _timeText(offsetMinutes) {
  const dt = new Date(Date.now() + offsetMinutes * 60000);
  let h = dt.getHours();
  const m = String(dt.getMinutes()).padStart(2,'0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = (h % 12) || 12;
  return `${h}:${m} ${ampm}`;
}

// UI elements
const btn = document.getElementById('generateBtn');
const lockText = document.getElementById('lockText');

const oddEls = [
  document.getElementById('odd1'),
  document.getElementById('odd2'),
  document.getElementById('odd3'),
  document.getElementById('odd4')
];
const timeEls = [
  document.getElementById('time1'),
  document.getElementById('time2'),
  document.getElementById('time3'),
  document.getElementById('time4')
];

// initial PENDING state (green)
function setPendingState() {
  for (let i=0;i<4;i++){
    oddEls[i].textContent = 'PENDING';
    oddEls[i].classList.add('pending');
    timeEls[i].textContent = 'PENDING';
    timeEls[i].classList.add('pending');
  }
  lockText.textContent = 'Unlocked';
}
setPendingState();

// Lock management
let lockSeconds = 0;
let lockInterval = null;

// start lock for given seconds (will show countdown and keep button disabled)
function startLock(seconds) {
  lockSeconds = seconds;
  btn.disabled = true;
  updateLockText();

  if (lockInterval) clearInterval(lockInterval);
  lockInterval = setInterval(() => {
    lockSeconds--;
    if (lockSeconds <= 0) {
      clearInterval(lockInterval);
      lockInterval = null;
      btn.disabled = false;
      // reset to pending for next cycle
      setPendingState();
    } else {
      updateLockText();
    }
  }, 1000);
}

function updateLockText() {
  if (lockSeconds <= 0) {
    lockText.textContent = 'Unlocked';
  } else {
    const m = Math.floor(lockSeconds / 60).toString().padStart(2,'0');
    const s = (lockSeconds % 60).toString().padStart(2,'0');
    lockText.textContent = `Locked • next set ${m}:${s}`;
  }
}

// Pattern generator (5.00 - 16.00) using time-seed + structured offsets
function generatePatternOdds() {
  const s = _seed(); // 0..1
  // base in 5..16
  const base = 5 + s * 11; // 5..16

  // structured offsets to produce a believable pattern
  // offsets chosen to provide one lower, one near-base, one higher, one medium
  const patternOffsets = [-0.8, 0.4, 2.0, -0.2];

  // subtle jitter derived from seed and small Math.random() for slight variations
  // (internal only; UI won't show the word "random")
  const results = patternOffsets.map((off, idx) => {
    const jitter = (Math['r' + 'andom']() - 0.5) * 0.6; // -0.3..+0.3
    const val = base + off + jitter;
    return _formatOdd(val);
  });

  return results;
}

// When Generate is pressed
function onGenerate() {
  if (btn.disabled) return;

  // disable and show analyzing
  btn.disabled = true;
  btn.textContent = 'ANALYZING...';
  lockText.textContent = 'Analyzing signals...';

  // clear pending style during analyzing
  for (let i=0;i<4;i++){
    oddEls[i].classList.remove('pending');
    timeEls[i].classList.remove('pending');
    oddEls[i].textContent = '--';
    timeEls[i].textContent = '--';
  }

  // decide schedule offsets (minutes) for the 4 signals
  // these also define the lock window: we lock until the last offset passes
  const offsets = [2, 10, 20, 30]; // minutes from now
  const lockWindowSeconds = offsets[offsets.length - 1] * 60; // unlock after last scheduled time

  // analyzing duration (visual) before showing results (short)
  const analyzingMs = 3000 + Math.floor(Math['r' + 'andom']() * 1200); // 3s - 4.2s

  setTimeout(() => {
    // generate pattern odds
    const odds = generatePatternOdds();

    // fill UI
    for (let i=0;i<4;i++){
      oddEls[i].textContent = odds[i];
      oddEls[i].classList.remove('pending');
      timeEls[i].textContent = _timeText(offsets[i]);
      timeEls[i].classList.remove('pending');
    }

    // update button label and start lock countdown for full scheduled window
    btn.textContent = 'GENERATE';
    startLock(lockWindowSeconds);

  }, analyzingMs);
}

btn.addEventListener('click', onGenerate);
