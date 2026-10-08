# SLOOP 8-Track Web Workstation (`sloop-web-8trk`)

A hybrid 8-track groovebox and web sound workstation built for the **M-VAVE FM-1** running [SLOOP](https://github.com/isod89/sloop-fm1) firmware.

Deployed live on GitHub Pages at: [https://sloop.smhulme.click](https://sloop.smhulme.click)

---

## What is this?

The physical M-VAVE FM-1 hardware has a dedicated 4-track DSP engine (3 synth tracks + 1 drum machine). Because of physical DSP core limitations, running 8 tracks entirely on the FM-1 hardware causes voice dropouts.

**`sloop-web-8trk`** solves this by creating a hybrid 8-track workstation:
* **Tracks 1–4 (Hardware):** Communicates with the physical M-VAVE FM-1 over Web MIDI and SysEx, controlling its internal synthesis engines, presets, parameter locks, and drum kits.
* **Tracks 5–8 (Web Client):** Runs 4 auxiliary polyphonic and monophonic synthesizers directly inside the browser using **Tone.js** and Web Audio API:
  - **Track 5 (Purple):** Polyphonic Sawtooth Synth (Pads & Chords)
  - **Track 6 (Cyan):** Analog Sub/Acid Bass (Monophonic with resonance)
  - **Track 7 (Pink):** 2-Operator FM Bell & Lead
  - **Track 8 (Lime):** Percussive Pluck & Arp
* **Clock & Transport Synchronization:**
  - Synchronizes to the FM-1's hardware transport buttons (`PLAY`, `REC`) and real-time MIDI clock ticks (`0xF8`, `0xFA`, `0xFC`) over USB-MIDI.
  - Can also run standalone using the built-in browser transport (`PLAY / STOP` & tempo controls).
* **Unified 8-Channel Mixer:**
  - View and control levels, panning, and muting for all 8 tracks simultaneously on the `Tracks` mixing desk.

---

## Getting Started

1. Plug in your M-VAVE FM-1 to your computer via USB (using **Google Chrome** or **Microsoft Edge**).
2. Visit [https://sloop.smhulme.click](https://sloop.smhulme.click)
3. Click **CONNECT** in the sidebar and grant Web MIDI access.
4. Press **PLAY** on the FM-1: Tracks 1–4 play from the FM-1, while Tracks 5–8 play from your computer speakers in lockstep!

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**, preserving upstream licensing from [Felucca](https://github.com/hugelton/Felucca) and SLOOP.
