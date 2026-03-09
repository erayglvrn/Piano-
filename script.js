document.addEventListener('DOMContentLoaded', () => {
    // We defer audio context creation until the first user interaction 
    // to comply with browser autoplay policies.
    let audioCtx;

    // Frequencies for C4 scale
    const notes = {
        '1': { name: 'Do', freq: 261.63, element: document.getElementById('key-1') },
        '2': { name: 'Re', freq: 293.66, element: document.getElementById('key-2') },
        '3': { name: 'Mi', freq: 329.63, element: document.getElementById('key-3') },
        '4': { name: 'Fa', freq: 349.23, element: document.getElementById('key-4') },
        '5': { name: 'Sol', freq: 392.00, element: document.getElementById('key-5') },
        '6': { name: 'La', freq: 440.00, element: document.getElementById('key-6') },
        '7': { name: 'Si', freq: 493.88, element: document.getElementById('key-7') }
    };

    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    const playSound = (frequency) => {
        initAudio();

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        // A mix of triangle wave works well for a basic synthesizer piano
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        // Envelope shaping for piano-like sound (fast attack, steady decay)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.03); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5); // Smooth decay

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.5);
    };

    const triggerKey = (keyLabel) => {
        const note = notes[keyLabel];
        if (note && !note.element.classList.contains('active')) {
            playSound(note.freq);
            note.element.classList.add('active');
        }
    };

    const releaseKey = (keyLabel) => {
        const note = notes[keyLabel];
        if (note) {
            note.element.classList.remove('active');
        }
    };

    // --- Keyboard Event Listeners ---
    const pressedKeys = new Set();

    window.addEventListener('keydown', (e) => {
        const key = e.key;
        if (notes[key] && !pressedKeys.has(key)) {
            pressedKeys.add(key);
            triggerKey(key);
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key;
        if (notes[key]) {
            pressedKeys.delete(key);
            releaseKey(key);
        }
    });

    // --- Pointer / Mouse / Touch Event Listeners for White Keys ---
    Object.keys(notes).forEach(key => {
        const item = notes[key];

        item.element.addEventListener('mousedown', () => triggerKey(key));
        item.element.addEventListener('mouseup', () => releaseKey(key));
        item.element.addEventListener('mouseleave', () => releaseKey(key));

        item.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerKey(key);
        });
        item.element.addEventListener('touchend', (e) => {
            e.preventDefault();
            releaseKey(key);
        });
    });

    // --- Interaction Support for Black Keys ---
    document.querySelectorAll('.black-key').forEach(key => {
        const triggerBlackKey = () => {
            initAudio();
            const freq = parseFloat(key.dataset.freq);
            playSound(freq);
            key.classList.add('active');
        };

        const releaseBlackKey = () => {
            key.classList.remove('active');
        };

        key.addEventListener('mousedown', triggerBlackKey);
        key.addEventListener('mouseup', releaseBlackKey);
        key.addEventListener('mouseleave', releaseBlackKey);

        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerBlackKey();
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            releaseBlackKey();
        });
    });
});
