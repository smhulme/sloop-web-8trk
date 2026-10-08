// SLOOP 8-Track Web Audio Engine (Tracks 5-8) powered by Tone.js
// Synchronized to FM-1 Hardware Transport and MIDI Clock

(function() {
  // Initialize Web Tracks State
  window.webTracks = [
    {
      id: 5,
      name: "POLY KEYS",
      type: "poly",
      synth: null,
      filter: null,
      panner: null,
      volume: null,
      dlySend: null,
      revSend: null,
      level: 100,
      pan: 0,
      mute: false,
      cutoff: 3000,
      res: 2,
      atk: 0.05,
      rel: 1.2,
      dly: 20,
      rev: 30,
      steps: [
        { on: true, note: "C4" }, { on: false, note: "C4" }, { on: false, note: "C4" }, { on: false, note: "C4" },
        { on: true, note: "Eb4" }, { on: false, note: "Eb4" }, { on: false, note: "Eb4" }, { on: false, note: "Eb4" },
        { on: true, note: "G4" }, { on: false, note: "G4" }, { on: false, note: "G4" }, { on: false, note: "G4" },
        { on: true, note: "Bb4" }, { on: false, note: "Bb4" }, { on: false, note: "Bb4" }, { on: false, note: "Bb4" }
      ]
    },
    {
      id: 6,
      name: "ANALOG BASS",
      type: "mono",
      synth: null,
      filter: null,
      panner: null,
      volume: null,
      dlySend: null,
      revSend: null,
      level: 105,
      pan: 0,
      mute: false,
      cutoff: 1200,
      res: 4,
      atk: 0.01,
      rel: 0.4,
      dly: 0,
      rev: 10,
      steps: [
        { on: true, note: "C2" }, { on: false, note: "C2" }, { on: true, note: "C2" }, { on: false, note: "C2" },
        { on: false, note: "C2" }, { on: true, note: "Eb2" }, { on: false, note: "Eb2" }, { on: false, note: "Eb2" },
        { on: true, note: "F2" }, { on: false, note: "F2" }, { on: true, note: "F#2" }, { on: false, note: "F#2" },
        { on: true, note: "G2" }, { on: false, note: "G2" }, { on: false, note: "G2" }, { on: true, note: "Bb2" }
      ]
    },
    {
      id: 7,
      name: "FM BELL/LEAD",
      type: "fm",
      synth: null,
      filter: null,
      panner: null,
      volume: null,
      dlySend: null,
      revSend: null,
      level: 95,
      pan: -20,
      mute: false,
      cutoff: 4500,
      res: 1,
      atk: 0.02,
      rel: 1.5,
      dly: 35,
      rev: 40,
      steps: [
        { on: false, note: "G4" }, { on: false, note: "G4" }, { on: true, note: "C5" }, { on: false, note: "C5" },
        { on: false, note: "G4" }, { on: false, note: "G4" }, { on: true, note: "D5" }, { on: false, note: "D5" },
        { on: false, note: "G4" }, { on: false, note: "G4" }, { on: true, note: "Eb5" }, { on: false, note: "Eb5" },
        { on: true, note: "G5" }, { on: false, note: "G5" }, { on: true, note: "F5" }, { on: false, note: "Eb5" }
      ]
    },
    {
      id: 8,
      name: "PERC / ARP",
      type: "pluck",
      synth: null,
      filter: null,
      panner: null,
      volume: null,
      dlySend: null,
      revSend: null,
      level: 90,
      pan: 25,
      mute: false,
      cutoff: 2800,
      res: 3,
      atk: 0.005,
      rel: 0.25,
      dly: 25,
      rev: 20,
      steps: [
        { on: true, note: "C5" }, { on: true, note: "Eb5" }, { on: true, note: "G5" }, { on: true, note: "Bb5" },
        { on: true, note: "C5" }, { on: true, note: "Eb5" }, { on: true, note: "G5" }, { on: true, note: "Bb5" },
        { on: true, note: "C5" }, { on: true, note: "Eb5" }, { on: true, note: "G5" }, { on: true, note: "Bb5" },
        { on: true, note: "C5" }, { on: true, note: "Eb5" }, { on: true, note: "G5" }, { on: true, note: "Bb5" }
      ]
    }
  ];

  let audioInitialized = false;
  let masterReverb = null;
  let masterDelay = null;
  let currentStep = 0;
  let isPlaying = false;
  let midiClockCount = 0;
  let lastClockTime = 0;
  let clockIntervals = [];

  // Initialize Tone.js audio graph on first interaction
  async function initWebAudio() {
    if (audioInitialized) return;
    try {
      if (window.Tone) {
        await Tone.start();
        masterReverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.01, wet: 0.5 }).toDestination();
        await masterReverb.generate();
        masterDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.35, wet: 0.5 }).toDestination();

        window.webTracks.forEach((t) => {
          t.filter = new Tone.Filter(t.cutoff, "lowpass");
          t.filter.Q.value = t.res;
          t.panner = new Tone.Panner(t.pan / 64);
          t.volume = new Tone.Volume(Tone.gainToDb(t.level / 127));

          t.filter.connect(t.panner);
          t.panner.connect(t.volume);
          t.volume.toDestination();

          // Auxiliary sends
          t.dlySend = new Tone.Gain(t.dly / 100);
          t.volume.connect(t.dlySend);
          t.dlySend.connect(masterDelay);

          t.revSend = new Tone.Gain(t.rev / 100);
          t.volume.connect(t.revSend);
          t.revSend.connect(masterReverb);

          createSynthForTrack(t);
        });

        // Setup 16th note sequence schedule
        Tone.Transport.scheduleRepeat((time) => {
          stepTick(time);
        }, "16n");

        Tone.Transport.bpm.value = 120;
        audioInitialized = true;
        console.log("SLOOP 8-Track Web Audio Engine ready");
      }
    } catch (err) {
      console.warn("Tone audio init pending interaction:", err);
    }
  }

  function createSynthForTrack(t) {
    if (t.synth) t.synth.dispose();
    if (t.type === "poly") {
      t.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: t.atk, decay: 0.3, sustain: 0.5, release: t.rel }
      }).connect(t.filter);
    } else if (t.type === "mono") {
      t.synth = new Tone.MonoSynth({
        oscillator: { type: "square" },
        filter: { Q: 2, type: "lowpass", rolloff: -12 },
        envelope: { attack: t.atk, decay: 0.2, sustain: 0.4, release: t.rel },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2, baseFrequency: 200, octaves: 3 }
      }).connect(t.filter);
    } else if (t.type === "fm") {
      t.synth = new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 5,
        oscillator: { type: "sine" },
        envelope: { attack: t.atk, decay: 0.2, sustain: 0.2, release: t.rel },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.5 }
      }).connect(t.filter);
    } else if (t.type === "pluck") {
      t.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0.0, release: t.rel }
      }).connect(t.filter);
    }
  }

  function stepTick(time) {
    window.webTracks.forEach((t) => {
      if (t.mute || !t.synth) return;
      const step = t.steps[currentStep];
      if (step && step.on) {
        const vel = (t.level / 127) * 0.9;
        t.synth.triggerAttackRelease(step.note, "16n", time, vel);
      }
    });

    // Visual step indicator
    requestAnimationFrame(() => {
      const grid = document.getElementById("webstepgrid");
      if (grid) {
        const btns = grid.querySelectorAll(".web-step");
        btns.forEach((b, idx) => {
          b.classList.toggle("active", idx === currentStep);
        });
      }
    });

    currentStep = (currentStep + 1) % 16;
  }

  // Handle MIDI Real-time Messages coming from M-VAVE FM-1
  window.handleMidiRealtime = function(data) {
    if (!data || !data.length) return;
    const b = data[0];

    if (b === 0xFA) { // MIDI Start
      startTransport(true);
    } else if (b === 0xFC) { // MIDI Stop
      stopTransport(true);
    } else if (b === 0xFB) { // MIDI Continue
      startTransport(true);
    } else if (b === 0xF8) { // Clock tick (24 ppqn)
      const now = performance.now();
      if (lastClockTime > 0) {
        const delta = now - lastClockTime;
        if (delta > 5 && delta < 100) {
          clockIntervals.push(delta);
          if (clockIntervals.length > 24) clockIntervals.shift();
          const avgDelta = clockIntervals.reduce((a, c) => a + c, 0) / clockIntervals.length;
          const bpm = Math.round(60000 / (avgDelta * 24));
          if (bpm >= 40 && bpm <= 240 && window.Tone && Tone.Transport) {
            Tone.Transport.bpm.value = bpm;
            const bEl = document.getElementById("webbpm");
            if (bEl) bEl.textContent = bpm + " BPM";
            const sEl = document.getElementById("websyncbadge");
            if (sEl) {
              sEl.textContent = "MIDI SYNC";
              sEl.style.background = "#005f73";
              sEl.style.color = "#94d2bd";
            }
          }
        }
      }
      lastClockTime = now;
      midiClockCount = (midiClockCount + 1) % 6; // 6 ticks = 1/16 note
    }
  };

  async function startTransport(fromMidi) {
    await initWebAudio();
    if (!window.Tone) return;
    if (!fromMidi) currentStep = 0;
    Tone.Transport.start();
    isPlaying = true;
    const btn = document.getElementById("webplaybtn");
    if (btn) {
      btn.textContent = "■ STOP";
      btn.style.background = "var(--red)";
      btn.style.color = "#fff";
    }
  }

  function stopTransport(fromMidi) {
    if (window.Tone) Tone.Transport.stop();
    currentStep = 0;
    isPlaying = false;
    const btn = document.getElementById("webplaybtn");
    if (btn) {
      btn.textContent = "▶ PLAY";
      btn.style.background = "var(--s2)";
      btn.style.color = "var(--fg)";
    }
    const grid = document.getElementById("webstepgrid");
    if (grid) {
      grid.querySelectorAll(".web-step").forEach((b) => b.classList.remove("active"));
    }
  }

  // Parameter Setters
  window.setWebTrackParam = function(trackIdx, param, val) {
    const t = window.webTracks[trackIdx];
    if (!t) return;
    t[param] = val;

    if (param === "level" && t.volume) {
      t.volume.volume.rampTo(Tone.gainToDb(t.level / 127), 0.05);
    } else if (param === "pan" && t.panner) {
      t.panner.pan.rampTo(t.pan / 64, 0.05);
    } else if (param === "cutoff" && t.filter) {
      t.filter.frequency.rampTo(t.cutoff, 0.05);
    } else if (param === "res" && t.filter) {
      t.filter.Q.rampTo(t.res, 0.05);
    } else if (param === "dly" && t.dlySend) {
      t.dlySend.gain.rampTo(t.dly / 100, 0.05);
    } else if (param === "rev" && t.revSend) {
      t.revSend.gain.rampTo(t.rev / 100, 0.05);
    } else if (param === "type") {
      createSynthForTrack(t);
    }
  };

  window.toggleWebTrackMute = function(trackIdx) {
    const t = window.webTracks[trackIdx];
    if (!t) return;
    t.mute = !t.mute;
    if (t.volume) t.volume.mute = t.mute;
  };

  // Render Web Track Edit UI
  window.renderWebTrackUI = function(trackIdx) {
    const t = window.webTracks[trackIdx];
    if (!t) return;

    const titleEl = document.getElementById("webtitle");
    if (titleEl) titleEl.textContent = `TRACK ${t.id}: ${t.name}`;

    const presetSel = document.getElementById("webpreset");
    if (presetSel) {
      presetSel.innerHTML = `
        <option value="poly">Polyphonic Keys</option>
        <option value="mono">Sub/Acid Bass</option>
        <option value="fm">FM Bell/Lead</option>
        <option value="pluck">Percussive Arp</option>
      `;
      presetSel.value = t.type;
      presetSel.onchange = () => {
        window.setWebTrackParam(trackIdx, "type", presetSel.value);
      };
    }

    const bindInput = (id, param, isFloat) => {
      const el = document.getElementById(id);
      if (el) {
        el.value = t[param];
        el.oninput = () => {
          window.setWebTrackParam(trackIdx, param, isFloat ? parseFloat(el.value) : parseInt(el.value, 10));
        };
      }
    };

    bindInput("webcutoff", "cutoff", false);
    bindInput("webres", "res", true);
    bindInput("webatk", "atk", true);
    bindInput("webrel", "rel", true);
    bindInput("weblevel", "level", false);
    bindInput("webpan", "pan", false);
    bindInput("webdly", "dly", false);
    bindInput("webrev", "rev", false);

    const muteBtn = document.getElementById("webmutetog");
    if (muteBtn) {
      muteBtn.textContent = t.mute ? "MUTE: ON" : "MUTE: OFF";
      muteBtn.style.background = t.mute ? "var(--red)" : "var(--s2)";
      muteBtn.onclick = () => {
        window.toggleWebTrackMute(trackIdx);
        muteBtn.textContent = t.mute ? "MUTE: ON" : "MUTE: OFF";
        muteBtn.style.background = t.mute ? "var(--red)" : "var(--s2)";
        if (typeof renderMixer === "function") renderMixer();
      };
    }

    // Step sequencer grid
    const grid = document.getElementById("webstepgrid");
    if (grid) {
      grid.innerHTML = "";
      t.steps.forEach((st, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "web-step" + (st.on ? " on" : "");
        btn.innerHTML = `<span style="font-weight:bold;">${idx + 1}</span><span style="font-size:9px;">${st.note}</span>`;
        btn.onclick = (e) => {
          initWebAudio();
          st.on = !st.on;
          btn.className = "web-step" + (st.on ? " on" : "");
        };
        grid.appendChild(btn);
      });
    }

    // Sequencer action buttons
    const clearBtn = document.getElementById("webclearseq");
    if (clearBtn) {
      clearBtn.onclick = () => {
        t.steps.forEach((s) => (s.on = false));
        window.renderWebTrackUI(trackIdx);
      };
    }
    const randBtn = document.getElementById("webrandomseq");
    if (randBtn) {
      randBtn.onclick = () => {
        const scale = ["C", "Eb", "F", "G", "Bb"];
        const oct = t.type === "mono" ? [2, 3] : [4, 5];
        t.steps.forEach((s) => {
          s.on = Math.random() > 0.45;
          const n = scale[Math.floor(Math.random() * scale.length)];
          const o = oct[Math.floor(Math.random() * oct.length)];
          s.note = n + o;
        });
        window.renderWebTrackUI(trackIdx);
      };
    }
  };

  // Wire header PLAY button
  document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("webplaybtn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        initWebAudio();
        if (isPlaying) stopTransport(false);
        else startTransport(false);
      });
    }
  });

  // User click anywhere unlocks Web Audio if not yet unlocked
  window.addEventListener("pointerdown", () => {
    if (!audioInitialized) initWebAudio();
  }, { once: true });

})();
