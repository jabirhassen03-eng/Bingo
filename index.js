  // Game state
        let selectedBoards = new Set();
        let blockedBoards = new Set();
        let isPlaying = false;
        let calledNumbers = new Set();
        let remainingNumbers = [];
        let playInterval;
        let currentSpeed = 3300;
        let soundEnabled = true;
        let currentAmount = 10;
        let currentCalledNumber = 0;
        let gameHistory = [];
         let walletPkg = 1000;
        let gameCount = 0;
        let baseBoardColor = '#2e9608'; // Default green
        let bgcolor = '#000';
        // Define your local sound file names
        const soundFileNames = {
            startSound: "start.mp3",
            pauseSound: "pause.mp3",
            winSound: "win.mp3",
            errorSound: "error.mp3",
            checkSound: "check.mp3",
            loginSound: "login.mp3",
            noSound: "no.mp3",
            goodSound: "good.mp3",
            blockSound: "block.mp3"
        };

        // Preload sounds
        const audioCache = {};
        function preloadSounds() {
            for (const [name, file] of Object.entries(soundFileNames)) {
                try {
                    audioCache[name] = new Audio(file);
                    audioCache[name].preload = "auto";
                } catch (error) {
                    console.error(`Error preloading ${name}:`, error);
                }
            }
        }
        
        // Play sound if enabled
        function playSound(name) {
            if (!soundEnabled) return;
            
            const soundStatus = document.getElementById('soundStatus');
            soundStatus.textContent = `Playing: ${name}`;
            soundStatus.style.display = 'block';
            
            setTimeout(() => {
                soundStatus.style.display = 'none';
            }, 2000);
            
            try {
                if (audioCache[name]) {
                    // Clone the audio to allow multiple simultaneous plays
                    const clone = new Audio(audioCache[name].src);
                    clone.volume = 0.7;
                    clone.play().catch(error => {
                        console.error(`Error playing ${name}:`, error);
                    });
                } else {
                    console.warn(`Sound not found: ${name}`);
                }
            } catch (error) {
                console.error(`Error playing ${name}:`, error);
            }
        }
        
        // Array to store number sounds
        let numberSounds = new Array(76); // index 1 to 75

        // Function to load a number sound
        function loadNumberSound(number) {
            try {
                // Only load if not already loaded
                if (!numberSounds[number]) {
                    numberSounds[number] = new Audio(`${number}.mp3`);
                }
            } catch (error) {
                console.error(`Error loading sound for number ${number}:`, error);
            }
        }

        // Function to play number sound
        function playNumberSound(number) {
            if (!soundEnabled) return;
            
            try {
                // Load sound if not already loaded
                if (!numberSounds[number]) {
                    loadNumberSound(number);
                }
                
                // Play the sound
                if (numberSounds[number]) {
                    const clone = new Audio(numberSounds[number].src);
                    clone.volume = 0.7;
                    clone.play().catch(error => {
                        console.error(`Error playing sound for number ${number}:`, error);
                    });
                    
                    // Update sound status
                    const soundStatus = document.getElementById('soundStatus');
                    soundStatus.textContent = `Playing: Number ${number}`;
                    soundStatus.style.display = 'block';
                    
                    setTimeout(() => {
                        soundStatus.style.display = 'none';
                    }, 2000);
                }
            } catch (error) {
                console.error(`Error playing number sound:`, error);
            }
        }
        
        // Static boards data (1-100)
        const staticBoards = {
            1: [13,28,39,60,69,9,26,37,48,74,4,17,"FREE",59,68,3,16,45,47,70,2,21,40,58,65],
            2: [9,16,37,52,70,10,29,32,49,68,15,18,"FREE",55,61,2,30,33,58,69,1,20,42,54,62],
            3: [14,21,40,47,61,2,23,37,58,74,1,30,"FREE",49,67,4,22,35,48,65,10,27,41,46,63],
            4: [5,25,40,57,69,6,23,32,47,72,4,24,"FREE",60,63,8,30,33,56,62,9,18,34,53,73],
            5: [6,27,41,46,69,10,22,45,60,74,8,16,"FREE",59,63,14,17,40,50,62,3,26,33,52,65],
            6: [12,20,35,59,72,8,25,43,60,63,3,28,"FREE",53,64,7,24,38,55,67,13,29,32,46,68],
            7: [15,23,42,58,75,4,18,43,55,68,11,26,"FREE",52,66,14,16,33,49,61,6,29,41,56,63],
            8: [11,17,42,47,65,5,23,43,53,63,1,18,"FREE",57,73,2,20,39,50,68,3,16,31,55,75],
            9: [8,30,31,47,61,3,24,39,54,65,5,17,"FREE",55,74,15,28,43,52,71,14,18,32,50,75],
            10: [3,30,44,50,70,5,17,34,51,67,9,27,"FREE",56,75,1,16,43,47,66,8,25,33,58,65],
            11: [3,28,32,53,75,5,23,35,56,71,9,16,"FREE",48,67,6,18,37,57,73,10,22,39,47,68],
            12: [13,25,42,52,64,7,24,34,46,71,11,30,"FREE",56,63,4,16,33,57,68,8,19,40,59,72],
            13: [3,27,45,47,74,15,26,31,57,61,1,17,"FREE",59,71,2,30,43,55,69,12,18,32,46,75],
            14: [7,26,40,48,73,10,21,37,60,68,3,16,"FREE",55,66,15,25,39,57,64,14,27,34,50,72],
            15: [3,28,35,50,71,8,23,45,47,72,2,26,"FREE",56,73,4,24,32,54,63,9,27,38,46,75],
            16: [8,23,35,60,63,10,20,34,46,69,9,19,"FREE",54,61,4,26,42,49,64,15,18,32,53,65],
            17: [3,19,35,46,66,10,20,33,60,64,7,29,"FREE",57,73,13,26,41,51,74,1,22,43,58,67],
            18: [11,23,45,47,72,5,22,44,57,63,9,21,"FREE",58,71,14,28,32,51,65,7,20,38,55,66],
            19: [13,21,32,46,75,6,30,31,48,68,2,24,"FREE",50,65,10,26,35,55,62,5,27,39,49,66],
            20: [5,22,45,60,71,4,28,39,54,70,12,23,"FREE",50,69,1,30,34,53,62,14,17,40,52,64],
            21: [14,20,37,48,71,15,27,34,55,66,7,17,"FREE",54,69,3,28,41,46,72,6,16,33,50,64],
            22: [8,24,39,60,71,12,29,36,58,74,4,30,"FREE",50,70,14,22,34,59,62,9,16,32,47,68],
            23: [3,23,42,53,69,2,28,43,60,75,12,30,"FREE",49,65,1,21,31,59,63,14,20,40,46,61],
            24: [9,27,40,52,72,3,16,32,55,70,2,21,"FREE",54,67,11,29,45,58,64,14,30,42,60,61],
            25: [9,22,36,50,64,2,19,39,60,72,14,16,"FREE",56,73,13,28,37,47,61,6,26,34,58,71],
            26: [11,30,31,49,71,14,20,38,58,63,8,22,"FREE",51,74,15,16,36,57,70,5,25,40,52,72],
            27: [11,16,35,54,65,3,23,31,59,74,2,17,"FREE",47,63,10,24,34,56,66,6,25,39,53,61],
            28: [12,23,37,47,75,3,28,42,55,62,6,30,"FREE",57,63,7,22,32,48,71,15,17,44,59,65],
            29: [11,24,32,51,73,8,28,31,56,68,15,26,"FREE",55,62,13,27,33,60,67,6,20,38,58,71],
            30: [9,25,35,54,62,3,26,40,58,66,11,16,"FREE",57,63,8,29,33,55,73,12,21,42,46,70],
            31: [6,29,39,56,61,4,24,41,48,73,7,26,"FREE",47,72,10,17,40,59,62,15,19,37,60,63],
            32: [3,16,34,46,69,8,24,40,60,61,9,18,"FREE",47,63,4,30,41,51,75,7,23,32,52,74],
            33: [2,19,38,47,61,6,30,43,60,74,5,21,"FREE",57,75,9,25,36,46,67,7,28,42,48,63],
            34: [7,21,43,55,74,6,16,32,54,70,12,28,"FREE",56,63,15,24,38,51,68,1,30,35,53,72],
            35: [14,21,43,57,62,8,19,39,53,73,9,24,"FREE",49,64,7,29,32,59,74,6,22,36,46,75],
            36: [8,23,39,60,69,9,28,37,51,75,13,22,"FREE",48,65,1,25,31,56,74,10,29,32,58,68],
            37: [1,20,36,53,68,5,26,31,49,70,3,18,"FREE",55,62,8,28,45,51,74,7,22,38,60,61],
            38: [4,18,39,60,64,6,17,36,57,73,10,23,"FREE",48,75,13,16,44,47,67,12,25,33,54,74],
            39: [10,26,38,49,61,12,25,37,55,69,11,24,"FREE",51,66,2,28,36,54,71,6,18,33,56,73],
            40: [11,20,40,51,64,13,17,41,52,66,14,24,"FREE",54,70,10,29,33,60,73,5,21,34,49,75],
            41: [14,20,37,48,71,15,27,34,55,66,7,17,"FREE",54,69,3,28,41,46,72,6,16,33,50,64],
            42: [9,30,37,53,73,10,29,34,55,68,11,26,"FREE",52,67,6,24,41,49,61,4,21,36,47,66],
            43: [12,17,36,52,62,5,16,42,59,61,3,21,"FREE",50,63,1,26,31,60,75,15,19,35,57,64],
            44: [12,26,43,48,68,2,23,31,55,63,8,16,"FREE",49,67,14,20,38,51,75,11,18,36,53,62],
            45: [2,23,39,50,64,4,29,35,58,61,7,17,"FREE",59,71,1,30,40,53,73,8,28,45,57,62],
            46: [7,23,38,46,68,13,21,43,51,73,9,30,"FREE",60,66,5,26,34,59,70,3,19,41,50,67],
            47: [14,17,33,47,72,13,28,35,49,71,5,18,"FREE",52,68,6,29,42,60,66,2,23,45,59,64],
            48: [13,27,35,51,74,6,20,45,53,65,1,25,"FREE",59,62,5,19,44,58,69,7,18,40,54,72],
            49: [2,30,33,48,74,4,18,37,50,69,5,23,"FREE",47,71,8,16,42,49,66,14,20,38,54,73],
            50: [7,27,32,59,72,9,30,42,49,73,3,29,"FREE",54,69,14,26,35,50,74,4,17,34,47,68],
            51: [4,21,34,60,73,6,17,32,56,74,8,30,"FREE",57,70,2,27,40,53,64,11,22,41,47,61],
            52: [13,29,40,52,65,12,26,38,60,66,14,19,"FREE",54,64,1,25,32,47,68,8,20,31,53,73],
            53: [5,25,38,59,62,3,24,31,60,72,8,27,"FREE",47,70,11,26,37,51,73,9,18,43,49,75],
            54: [11,24,43,55,74,2,29,34,51,61,12,30,"FREE",59,67,14,27,41,49,72,15,21,39,60,64],
            55: [11,30,38,53,66,13,21,39,58,70,14,24,"FREE",60,65,2,25,45,59,75,3,22,32,56,68],
            56: [5,16,36,55,66,12,20,39,49,71,15,22,"FREE",48,70,2,29,45,53,72,3,25,38,59,62],
            57: [1,18,42,60,73,12,22,33,59,70,4,30,"FREE",51,74,3,27,38,53,66,5,25,40,56,71],
            58: [12,25,34,52,73,7,17,44,58,67,6,23,"FREE",51,62,2,16,41,46,74,10,24,40,59,75],
            59: [6,16,43,56,63,10,19,34,49,64,4,18,"FREE",59,61,5,24,38,55,72,7,21,41,57,68],
            60: [7,19,32,51,64,1,17,39,55,63,6,21,"FREE",57,75,9,16,45,56,65,12,25,34,48,67],
            61: [1,29,38,56,75,5,19,33,57,74,7,25,"FREE",50,61,13,16,35,48,73,3,17,39,54,65],
            62: [11,22,37,55,67,13,27,40,57,62,5,25,"FREE",52,68,1,24,38,47,65,7,23,43,49,74],
            63: [3,28,34,53,70,15,26,42,47,67,10,16,"FREE",50,62,14,23,40,55,71,13,27,45,57,61],
            64: [4,20,41,49,65,2,26,38,56,67,3,18,"FREE",60,71,6,23,40,46,64,11,27,34,50,66],
            65: [2,16,42,50,75,4,26,31,48,68,3,22,"FREE",54,73,1,30,33,60,63,11,28,44,55,65],
            66: [9,22,38,57,61,12,19,39,55,63,4,20,"FREE",47,65,8,26,33,59,70,14,21,31,48,73],
            67: [7,16,44,50,61,8,22,39,54,65,15,23,"FREE",53,66,14,26,32,60,64,5,30,31,46,67],
            68: [3,16,34,46,69,8,24,40,60,61,9,18,"FREE",47,63,4,30,41,51,75,7,23,32,52,74],
            69: [11,24,38,60,72,9,29,37,56,65,14,26,"FREE",59,61,13,23,31,58,69,3,22,36,49,63],
            70: [4,30,35,56,72,1,28,40,50,73,7,21,"FREE",58,67,11,17,41,59,62,13,16,37,52,75],
            71: [7,25,37,51,71,13,24,32,54,62,5,27,"FREE",47,69,2,26,43,48,61,11,21,42,58,66],
            72: [12,22,42,48,65,15,17,37,46,62,1,18,"FREE",47,70,10,28,45,58,72,9,23,38,57,69],
            73: [2,23,43,54,73,14,26,38,50,69,6,28,"FREE",59,62,10,19,42,55,74,3,22,34,51,63],
            74: [6,20,36,46,75,1,27,45,56,73,14,30,"FREE",47,64,15,29,42,50,69,2,16,34,55,72],
            75: [2,30,45,46,69,3,17,36,60,61,11,22,"FREE",59,67,13,19,35,56,66,14,18,44,50,70],
            76: [6,27,41,48,69,15,28,33,50,72,5,19,"FREE",56,73,13,21,31,52,65,11,25,43,60,64],
            77: [8,26,32,48,62,1,19,45,53,63,3,28,"FREE",55,69,15,18,37,58,72,11,16,41,56,64],
            78: [13,19,41,53,71,11,20,38,52,67,3,29,"FREE",54,72,12,22,39,56,73,9,30,40,47,65],
            79: [7,26,40,48,73,10,21,37,60,68,3,16,"FREE",55,66,15,25,39,57,64,14,27,34,50,72],
            80: [13,22,42,50,74,5,28,32,58,75,15,17,"FREE",53,72,1,24,39,48,61,8,21,38,47,73],
            81: [5,29,45,59,69,8,17,35,47,72,1,21,"FREE",55,74,3,27,36,46,68,11,20,42,54,73],
            82: [10,24,35,59,70,14,29,38,48,61,2,19,"FREE",46,67,11,23,33,53,71,5,18,32,52,72],
            83: [10,18,38,54,66,2,30,45,53,68,7,23,"FREE",56,73,15,22,32,47,64,1,28,44,48,67],
            84: [9,30,34,57,73,3,24,38,48,72,1,20,"FREE",51,74,6,17,33,54,69,4,18,42,53,61],
            85: [6,19,42,52,62,15,29,34,49,61,7,27,"FREE",54,69,5,28,41,60,67,2,25,40,55,64],
            86: [7,23,31,50,72,9,27,41,52,75,2,22,"FREE",51,74,13,28,35,54,64,11,21,44,56,67],
            87: [6,28,32,51,70,7,27,33,58,67,11,19,"FREE",53,61,9,26,44,52,73,3,22,42,57,74],
            88: [12,30,37,50,64,3,22,33,58,75,1,23,"FREE",53,63,6,28,45,51,65,11,16,41,49,70],
            89: [1,19,32,49,72,11,27,39,57,65,13,21,"FREE",55,64,15,25,34,56,69,3,22,40,50,67],
            90: [5,20,45,59,62,14,17,37,47,68,13,22,"FREE",54,65,8,30,40,57,67,3,19,43,55,70],
            91: [1,19,33,60,67,7,18,35,59,66,9,24,"FREE",56,73,10,26,36,51,72,15,17,32,54,68],
            92: [4,19,37,46,72,7,22,45,51,68,1,20,"FREE",59,70,12,24,32,54,67,3,17,42,47,69],
            93: [8,22,32,57,64,1,28,39,47,67,6,17,"FREE",50,68,7,30,35,59,75,12,21,31,58,65],
            94: [15,29,45,59,71,5,18,38,46,72,11,16,"FREE",49,67,8,20,34,51,61,13,26,36,53,73],
            95: [13,22,45,56,74,15,30,41,58,61,5,25,"FREE",47,73,10,27,37,52,75,9,16,33,48,70],
            96: [6,23,37,58,74,10,22,44,55,65,3,26,"FREE",52,62,2,30,42,53,63,11,28,45,54,75],
            97: [5,29,32,53,67,2,21,36,60,61,13,23,"FREE",48,66,10,28,45,50,71,14,19,40,58,72],
            98: [4,25,42,50,69,1,17,35,57,67,12,28,"FREE",58,63,7,22,31,51,75,14,30,38,59,74],
            99: [1,18,40,48,70,4,21,42,54,62,8,23,"FREE",59,65,7,16,36,56,64,12,25,35,58,73],
            100: [14,16,33,47,66,7,24,38,60,63,3,21,"FREE",51,74,10,25,35,46,67,13,19,39,50,61],
            101: [13,28,39,60,69,9,26,37,48,74,4,17,"FREE",59,68,3,16,45,47,70,2,21,40,58,65],
            102: [9,16,37,52,70,10,29,32,49,68,15,18,"FREE",55,61,2,30,33,58,69,1,20,42,54,62],
            103: [14,21,40,47,61,2,23,37,58,74,1,30,"FREE",49,67,4,22,35,48,65,10,27,41,46,63],
            104: [5,25,40,57,69,6,23,32,47,72,4,24,"FREE",60,63,8,30,33,56,62,9,18,34,53,73],
            105: [6,27,41,46,69,10,22,45,60,74,8,16,"FREE",59,63,14,17,40,50,62,3,26,33,52,65],
            106: [12,20,35,59,72,8,25,43,60,63,3,28,"FREE",53,64,7,24,38,55,67,13,29,32,46,68],
            107: [15,23,42,58,75,4,18,43,55,68,11,26,"FREE",52,66,14,16,33,49,61,6,29,41,56,63],
            108: [11,17,42,47,65,5,23,43,53,63,1,18,"FREE",57,73,2,20,39,50,68,3,16,31,55,75],
            109: [8,30,31,47,61,3,24,39,54,65,5,17,"FREE",55,74,15,28,43,52,71,14,18,32,50,75],
            110: [3,30,44,50,70,5,17,34,51,67,9,27,"FREE",56,75,1,16,43,47,66,8,25,33,58,65],
            111: [3,28,32,53,75,5,23,35,56,71,9,16,"FREE",48,67,6,18,37,57,73,10,22,39,47,68],
            112: [13,25,42,52,64,7,24,34,46,71,11,30,"FREE",56,63,4,16,33,57,68,8,19,40,59,72],
            113: [3,27,45,47,74,15,26,31,57,61,1,17,"FREE",59,71,2,30,43,55,69,12,18,32,46,75],
            114: [7,26,40,48,73,10,21,37,60,68,3,16,"FREE",55,66,15,25,39,57,64,14,27,34,50,72],
            115: [3,28,35,50,71,8,23,45,47,72,2,26,"FREE",56,73,4,24,32,54,63,9,27,38,46,75],
            116: [8,23,35,60,63,10,20,34,46,69,9,19,"FREE",54,61,4,26,42,49,64,15,18,32,53,65],
            117: [3,19,35,46,66,10,20,33,60,64,7,29,"FREE",57,73,13,26,41,51,74,1,22,43,58,67],
            118: [11,23,45,47,72,5,22,44,57,63,9,21,"FREE",58,71,14,28,32,51,65,7,20,38,55,66],
            19: [13,21,32,46,75,6,30,31,48,68,2,24,"FREE",50,65,10,26,35,55,62,5,27,39,49,66],
            120: [5,22,45,60,71,4,28,39,54,70,12,23,"FREE",50,69,1,30,34,53,62,14,17,40,52,64],
            121: [14,20,37,48,71,15,27,34,55,66,7,17,"FREE",54,69,3,28,41,46,72,6,16,33,50,64],
            122: [8,24,39,60,71,12,29,36,58,74,4,30,"FREE",50,70,14,22,34,59,62,9,16,32,47,68],
            123: [3,23,42,53,69,2,28,43,60,75,12,30,"FREE",49,65,1,21,31,59,63,14,20,40,46,61],
            124: [9,27,40,52,72,3,16,32,55,70,2,21,"FREE",54,67,11,29,45,58,64,14,30,42,60,61],
            125: [9,22,36,50,64,2,19,39,60,72,14,16,"FREE",56,73,13,28,37,47,61,6,26,34,58,71],
            126: [11,30,31,49,71,14,20,38,58,63,8,22,"FREE",51,74,15,16,36,57,70,5,25,40,52,72],
            127: [11,16,35,54,65,3,23,31,59,74,2,17,"FREE",47,63,10,24,34,56,66,6,25,39,53,61],
            128: [12,23,37,47,75,3,28,42,55,62,6,30,"FREE",57,63,7,22,32,48,71,15,17,44,59,65],
            129: [11,24,32,51,73,8,28,31,56,68,15,26,"FREE",55,62,13,27,33,60,67,6,20,38,58,71],
            130: [9,25,35,54,62,3,26,40,58,66,11,16,"FREE",57,63,8,29,33,55,73,12,21,42,46,70],
            131: [6,29,39,56,61,4,24,41,48,73,7,26,"FREE",47,72,10,17,40,59,62,15,19,37,60,63],
            132: [3,16,34,46,69,8,24,40,60,61,9,18,"FREE",47,63,4,30,41,51,75,7,23,32,52,74],
            133: [2,19,38,47,61,6,30,43,60,74,5,21,"FREE",57,75,9,25,36,46,67,7,28,42,48,63],
            134: [7,21,43,55,74,6,16,32,54,70,12,28,"FREE",56,63,15,24,38,51,68,1,30,35,53,72],
            135: [14,21,43,57,62,8,19,39,53,73,9,24,"FREE",49,64,7,29,32,59,74,6,22,36,46,75],
            136: [8,23,39,60,69,9,28,37,51,75,13,22,"FREE",48,65,1,25,31,56,74,10,29,32,58,68],
            137: [1,20,36,53,68,5,26,31,49,70,3,18,"FREE",55,62,8,28,45,51,74,7,22,38,60,61],
            138: [4,18,39,60,64,6,17,36,57,73,10,23,"FREE",48,75,13,16,44,47,67,12,25,33,54,74],
            139: [10,26,38,49,61,12,25,37,55,69,11,24,"FREE",51,66,2,28,36,54,71,6,18,33,56,73],
            140: [11,20,40,51,64,13,17,41,52,66,14,24,"FREE",54,70,10,29,33,60,73,5,21,34,49,75],
            141: [14,20,37,48,71,15,27,34,55,66,7,17,"FREE",54,69,3,28,41,46,72,6,16,33,50,64],
            142: [9,30,37,53,73,10,29,34,55,68,11,26,"FREE",52,67,6,24,41,49,61,4,21,36,47,66],
            143: [12,17,36,52,62,5,16,42,59,61,3,21,"FREE",50,63,1,26,31,60,75,15,19,35,57,64],
            144: [12,26,43,48,68,2,23,31,55,63,8,16,"FREE",49,67,14,20,38,51,75,11,18,36,53,62],
            145: [2,23,39,50,64,4,29,35,58,61,7,17,"FREE",59,71,1,30,40,53,73,8,28,45,57,62],
            146: [7,23,38,46,68,13,21,43,51,73,9,30,"FREE",60,66,5,26,34,59,70,3,19,41,50,67],
            147: [14,17,33,47,72,13,28,35,49,71,5,18,"FREE",52,68,6,29,42,60,66,2,23,45,59,64],
            148: [13,27,35,51,74,6,20,45,53,65,1,25,"FREE",59,62,5,19,44,58,69,7,18,40,54,72],
            149: [2,30,33,48,74,4,18,37,50,69,5,23,"FREE",47,71,8,16,42,49,66,14,20,38,54,73],
            150: [7,27,32,59,72,9,30,42,49,73,3,29,"FREE",54,69,14,26,35,50,74,4,17,34,47,68],
            151: [4,21,34,60,73,6,17,32,56,74,8,30,"FREE",57,70,2,27,40,53,64,11,22,41,47,61],
            152: [13,29,40,52,65,12,26,38,60,66,14,19,"FREE",54,64,1,25,32,47,68,8,20,31,53,73],
            153: [5,25,38,59,62,3,24,31,60,72,8,27,"FREE",47,70,11,26,37,51,73,9,18,43,49,75],
            154: [11,24,43,55,74,2,29,34,51,61,12,30,"FREE",59,67,14,27,41,49,72,15,21,39,60,64],
            155: [11,30,38,53,66,13,21,39,58,70,14,24,"FREE",60,65,2,25,45,59,75,3,22,32,56,68],
            156: [5,16,36,55,66,12,20,39,49,71,15,22,"FREE",48,70,2,29,45,53,72,3,25,38,59,62],
            157: [1,18,42,60,73,12,22,33,59,70,4,30,"FREE",51,74,3,27,38,53,66,5,25,40,56,71],
            158: [12,25,34,52,73,7,17,44,58,67,6,23,"FREE",51,62,2,16,41,46,74,10,24,40,59,75],
            159: [6,16,43,56,63,10,19,34,49,64,4,18,"FREE",59,61,5,24,38,55,72,7,21,41,57,68],
            160: [7,19,32,51,64,1,17,39,55,63,6,21,"FREE",57,75,9,16,45,56,65,12,25,34,48,67],
            161: [1,29,38,56,75,5,19,33,57,74,7,25,"FREE",50,61,13,16,35,48,73,3,17,39,54,65],
            162: [11,22,37,55,67,13,27,40,57,62,5,25,"FREE",52,68,1,24,38,47,65,7,23,43,49,74],
            163: [3,28,34,53,70,15,26,42,47,67,10,16,"FREE",50,62,14,23,40,55,71,13,27,45,57,61],
            164: [4,20,41,49,65,2,26,38,56,67,3,18,"FREE",60,71,6,23,40,46,64,11,27,34,50,66],
            165: [2,16,42,50,75,4,26,31,48,68,3,22,"FREE",54,73,1,30,33,60,63,11,28,44,55,65],
            166: [9,22,38,57,61,12,19,39,55,63,4,20,"FREE",47,65,8,26,33,59,70,14,21,31,48,73],
            167: [7,16,44,50,61,8,22,39,54,65,15,23,"FREE",53,66,14,26,32,60,64,5,30,31,46,67],
            168: [3,16,34,46,69,8,24,40,60,61,9,18,"FREE",47,63,4,30,41,51,75,7,23,32,52,74],
            169: [11,24,38,60,72,9,29,37,56,65,14,26,"FREE",59,61,13,23,31,58,69,3,22,36,49,63],
            170: [4,30,35,56,72,1,28,40,50,73,7,21,"FREE",58,67,11,17,41,59,62,13,16,37,52,75],
            171: [7,25,37,51,71,13,24,32,54,62,5,27,"FREE",47,69,2,26,43,48,61,11,21,42,58,66],
            172: [12,22,42,48,65,15,17,37,46,62,1,18,"FREE",47,70,10,28,45,58,72,9,23,38,57,69],
            173: [2,23,43,54,73,14,26,38,50,69,6,28,"FREE",59,62,10,19,42,55,74,3,22,34,51,63],
            174: [6,20,36,46,75,1,27,45,56,73,14,30,"FREE",47,64,15,29,42,50,69,2,16,34,55,72],
            175: [2,30,45,46,69,3,17,36,60,61,11,22,"FREE",59,67,13,19,35,56,66,14,18,44,50,70],
            176: [6,27,41,48,69,15,28,33,50,72,5,19,"FREE",56,73,13,21,31,52,65,11,25,43,60,64],
            177: [8,26,32,48,62,1,19,45,53,63,3,28,"FREE",55,69,15,18,37,58,72,11,16,41,56,64],
            178: [13,19,41,53,71,11,20,38,52,67,3,29,"FREE",54,72,12,22,39,56,73,9,30,40,47,65],
            179: [7,26,40,48,73,10,21,37,60,68,3,16,"FREE",55,66,15,25,39,57,64,14,27,34,50,72],
            180: [13,22,42,50,74,5,28,32,58,75,15,17,"FREE",53,72,1,24,39,48,61,8,21,38,47,73],
            181: [5,29,45,59,69,8,17,35,47,72,1,21,"FREE",55,74,3,27,36,46,68,11,20,42,54,73],
            182: [10,24,35,59,70,14,29,38,48,61,2,19,"FREE",46,67,11,23,33,53,71,5,18,32,52,72],
            183: [10,18,38,54,66,2,30,45,53,68,7,23,"FREE",56,73,15,22,32,47,64,1,28,44,48,67],
            184: [9,30,34,57,73,3,24,38,48,72,1,20,"FREE",51,74,6,17,33,54,69,4,18,42,53,61],
            185: [6,19,42,52,62,15,29,34,49,61,7,27,"FREE",54,69,5,28,41,60,67,2,25,40,55,64],
            186: [7,23,31,50,72,9,27,41,52,75,2,22,"FREE",51,74,13,28,35,54,64,11,21,44,56,67],
            187: [6,28,32,51,70,7,27,33,58,67,11,19,"FREE",53,61,9,26,44,52,73,3,22,42,57,74],
            188: [12,30,37,50,64,3,22,33,58,75,1,23,"FREE",53,63,6,28,45,51,65,11,16,41,49,70],
            189: [1,19,32,49,72,11,27,39,57,65,13,21,"FREE",55,64,15,25,34,56,69,3,22,40,50,67],
            190: [5,20,45,59,62,14,17,37,47,68,13,22,"FREE",54,65,8,30,40,57,67,3,19,43,55,70],
            191: [1,19,33,60,67,7,18,35,59,66,9,24,"FREE",56,73,10,26,36,51,72,15,17,32,54,68],
            192: [4,19,37,46,72,7,22,45,51,68,1,20,"FREE",59,70,12,24,32,54,67,3,17,42,47,69],
            193: [8,22,32,57,64,1,28,39,47,67,6,17,"FREE",50,68,7,30,35,59,75,12,21,31,58,65],
            194: [15,29,45,59,71,5,18,38,46,72,11,16,"FREE",49,67,8,20,34,51,61,13,26,36,53,73],
            195: [13,22,45,56,74,15,30,41,58,61,5,25,"FREE",47,73,10,27,37,52,75,9,16,33,48,70],
            196: [6,23,37,58,74,10,22,44,55,65,3,26,"FREE",52,62,2,30,42,53,63,11,28,45,54,75],
            197: [5,29,32,53,67,2,21,36,60,61,13,23,"FREE",48,66,10,28,45,50,71,14,19,40,58,72],
            198: [4,25,42,50,69,1,17,35,57,67,12,28,"FREE",58,63,7,22,31,51,75,14,30,38,59,74],
            199: [1,18,40,48,70,4,21,42,54,62,8,23,"FREE",59,65,7,16,36,56,64,12,25,35,58,73],
            200: [14,16,33,47,66,7,24,38,60,63,3,21,"FREE",51,74,10,25,35,46,67,13,19,39,50,61]
        };

        // Initialize the game
        document.addEventListener('DOMContentLoaded', () => {
            // Preload sounds
            preloadSounds();
            
            // Load game history from localStorage
            const storedHistory = localStorage.getItem('bingoGameHistory');
            if (storedHistory) {
                gameHistory = JSON.parse(storedHistory);
            }
            
            // Load game count
            const storedGameCount = localStorage.getItem('bingoGameCount');
            if (storedGameCount) {
                gameCount = parseInt(storedGameCount);
                document.getElementById('gameCount').textContent = gameCount;
            }
            
            // Setup login
            document.getElementById('loginBtn').addEventListener('click', () => {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const error = document.getElementById('loginError');
                
                if (username === '' && password === '') {
                    error.style.display = 'none';
                    document.getElementById('loginPage').classList.remove('active');
                    document.getElementById('selectionPage').classList.add('active');
                     document.getElementById('hhh').classList.add('active');
                    initBoards();
                    secBoards();
                } else {
                    error.style.display = 'block';
                }
            });
            
            // Setup sound toggle
            document.getElementById('toggleSoundBtn').addEventListener('click', () => {
                soundEnabled = !soundEnabled;
                const icon = document.querySelector('#toggleSoundBtn i');
                icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            });
            
            // Setup modal close button
            document.getElementById('modalCloseBtn').addEventListener('click', () => {
                document.getElementById('cartelaModal').style.display = 'none';
            });

          document.getElementById('good').addEventListener('click', () => {
            playSound('goodSound');
              document.getElementById('bonm').textContent = 'GOOD BINGO';
                
            });

            document.getElementById('no').addEventListener('click', () => {
                playSound('noSound');
            });
            
            // Amount control buttons
            document.getElementById('increaseAmount').addEventListener('click', () => {
                currentAmount += 10;
                document.getElementById('amountDisplay').textContent = currentAmount;
                updatePrizeAmount();
            });
            
            document.getElementById('decreaseAmount').addEventListener('click', () => {
                if (currentAmount > 10) {
                    currentAmount -= 10;
                    document.getElementById('amountDisplay').textContent = currentAmount;
                    updatePrizeAmount();
                }
            });
            
            // Eye button toggle
            document.getElementById('eyeButton').addEventListener('click', () => {
                const badge = document.getElementById('selectedBadge');
                badge.textContent = selectedBoards.size ;
            });
            document.getElementById('eyeButton').addEventListener('mouseout', () => {
                const badge = document.getElementById('selectedBadge');
                badge.textContent = '' ;
            });
            
            // Cart button - navigate to stats page
            document.getElementById('cartButton').addEventListener('click', () => {
                document.getElementById('selectionPage').classList.remove('active');
                document.getElementById('statsPage').classList.add('active');
                 document.getElementById('hhh').classList.remove('active');
                updateStatsPage();
            });
            
            // Back to selection from stats page
            document.getElementById('backToSelectionBtn').addEventListener('click', () => {
                document.getElementById('statsPage').classList.remove('active');
                document.getElementById('selectionPage').classList.add('active');
                 document.getElementById('hhh').classList.add('active');
            });
            
            // Confirmation buttons
            document.getElementById('confirmOk').addEventListener('click', () => {
                document.getElementById('confirmationModal').style.display = 'none';
                storeGameData();
                toz();
                gameCount++;
                document.getElementById('gameCount').textContent = gameCount;
                localStorage.setItem('bingoGameCount', gameCount);
                
                goBackToSelection();
            });
            
            document.getElementById('confirmCancel').addEventListener('click', () => {
                document.getElementById('confirmationModal').style.display = 'none';
            });
        });
        
       

        // Initialize boards after login
        function initBoards() {
            const boardsContainer = document.getElementById('boardsContainer');
            boardsContainer.innerHTML = '';
            
            // Create 100 boards
            for (let i = 1; i <= 100; i++) {
                const board = document.createElement('div');
                board.className = 'board';
                board.dataset.id = i;
                
                // Only show the number
                board.innerHTML = `<div>${i}</div>`;
                
                board.style.border = "none";
                
                board.addEventListener('click', () => {
                    toggleBoardSelection(i, board);
                });
                
                boardsContainer.appendChild(board);
            }
            
            // Create number grid
            createNumberGrid();

            // let boarder = document.createElement('div');
            //     boarder.className = 'butts';
            //     board.innerHTML = `<div>${101-200}</div>`;
                


            // Event listeners
            document.getElementById('startGameBtn').addEventListener('click', startGame);
            document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
            document.getElementById('shuffleBtn').addEventListener('click', shuffleNumbers);
            document.getElementById('speedSlider').addEventListener('input', updateSpeed);
            document.getElementById('callNextBtn').addEventListener('click', callNextNumber);
            document.getElementById('checkBoardBtn').addEventListener('click', checkSingleBoard);
            document.getElementById('backBtn').addEventListener('click', showConfirmation);
            document.getElementById('clearSelectionBtn').addEventListener('click', clearSelection);
        }
        const domess = document.getElementById('buttsss').textContent;
        const domes = document.getElementById('buttss').textContent;

        document.getElementById('buttsss').addEventListener('click', () => {
           document.getElementById('mmm').classList.add('non');
            
            document.getElementById('buttsss').textContent = '201-400';
            document.getElementById('selectionPage').classList.add('ren'); 

        });
        document.getElementById('buttss').addEventListener('click', () => {
            document.getElementById('mmm').classList.remove('non');
            document.getElementById('buttsss').textContent = '101-200';
            document.getElementById('selectionPage').classList.remove('ren');       
            

        });
         function secBoards() {
            const boardsContainer = document.getElementById('boardsContainers');
            boardsContainer.innerHTML = '';
            
            // Create 100 boards
            for (let i = 101; i <= 400; i++) {
                const board = document.createElement('div');
                board.className = 'board';
                board.dataset.id = i;
                
                // Only show the number
                board.innerHTML = `<div>${i}</div>`;
                
                board.style.border = "none";
                
                board.addEventListener('click', () => {
                    toggleBoardSelection(i, board);
                });
                
                boardsContainer.appendChild(board);
            }
            
            // Create number grid
            createNumberGrid();
        }

       
         document.getElementById('logOut').addEventListener('click', ()=>{
          document.getElementById('selectionPage').classList.remove('active');
          document.getElementById('loginPage').classList.add('active');
         });
        
        // Show confirmation modal
        function showConfirmation() {
            document.getElementById('confirmationModal').style.display = 'flex';
        }
        
        // Change board color
        function changeBoardColor(colorName) {
            // Map color names to values
            const colorMap = {
                'black': '#000',
                'green': '#2e9608',
                'blue': '#0000ff',
                'yellow': '#f1c40f'
            };
            
            const color = colorMap[colorName];
            baseBoardColor = color;
            
            // Update all non-selected boards
            document.querySelectorAll('.board:not(.selected)').forEach(board => {
                board.style.background = color;
                board.style.border = "none";
            });
            
            
        }
          
            
        
        // Update prize amount
        function updatePrizeAmount() {
            const prize = Math.floor(currentAmount * selectedBoards.size * 0.8);
            const fee = Math.floor(currentAmount * selectedBoards.size * 0.2); 
            document.getElementById('prizeAmount').textContent = `${prize}`;
            
           
        }
         function loloo(){
        let momo = document.getElementById('wallet').textContent;
          if(momo > 700){
            document.getElementById('sessionCounter').textContent = ' EXCELENT';
          }
         else if(mooo < 700 && momo > 500){
        
            document.getElementById('sessionCounter').textContent = ' GOOD';
            document.getElementById('sessionCounter').background = ' yellow';

           }
          else if(momo < 500){
            document.getElementById('sessionCounter').textContent = ' WARNNING';
            document.getElementById('sessionCounter').background = ' red';

           }
         }        
        // Store game data when going back
        function storeGameData() {
            if (calledNumbers.size > 0) {
                const amount = currentAmount;
                const prizes = Math.floor(currentAmount * selectedBoards.size);
                const fee = Math.floor(currentAmount * selectedBoards.size *0.2);
                walletPkg -= fee;
                document.getElementById('wallet').textContent = walletPkg;
                
                const prize = Math.floor(currentAmount * selectedBoards.size * 0.8);
                const gameData = {
                    date: new Date().toLocaleString(),
                    players: selectedBoards.size,
                    prize: prize,
                    prizes: prizes,
                    amount: amount,
                    fee: fee,
                   
                    
                };
                
                gameHistory.unshift(gameData); // Add to beginning
                localStorage.setItem('bingoGameHistory', JSON.stringify(gameHistory));
                
              
            }
        }
        
        // Update stats page
        function updateStatsPage() {
            // Calculate statistics
           
            let totalGames = gameHistory.length;
            let totalPrize = 0;
            
            

            
            gameHistory.forEach(game => {
                
                totalPrize += game.prize;
                

            });
            
            // Update stats display
            
            
            document.getElementById('totalGames').textContent = totalGames;
            document.getElementById('totalPrize').textContent = `${totalPrize}`;
            
           
            
            // Update game history
            const gameHistoryContainer = document.getElementById('gameHistory');
            gameHistoryContainer.innerHTML = '';
            
            gameHistory.forEach((game, index) => {
                const historyItem = document.createElement('div');
                
                

                historyItem.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-labelss">${index + 1}</span>
                         <div > ${game.players}</div>
                         <span class="stat-labelss">$${game.amount}</span>
                         <span class="stat-labelss">$${game.fee}</span>
                          <span class="stat-labelss">$${game.prizes}</span>
                        <span class="stat-labelss">$${game.prize}</span>
                    </div>
                   
                    
                `;
                gameHistoryContainer.appendChild(historyItem);
            });
        }

         document.getElementById('black').addEventListener('click', ()=>{
           bga = document.body.style.background = bgcolor;
        });
         document.getElementById('green').addEventListener('click', ()=>{
           bga = document.body.style.background = '#0cd80c';
        });
         document.getElementById('blue').addEventListener('click', ()=>{
           bga = document.body.style.background = 'blue';
        });
         document.getElementById('yellow').addEventListener('click', ()=>{
           bga = document.body.style.background = 'yellow';
        });

        
        // Create number grid for horizontal display
        function createNumberGrid() {
            const letters = ['B', 'I', 'N', 'G', 'O'];
            const ranges = [
                { start: 1, end: 15 },
                { start: 16, end: 30 },
                { start: 31, end: 45 },
                { start: 46, end: 60 },
                { start: 61, end: 75 }
            ];
            
            letters.forEach((letter, index) => {
                const container = document.getElementById(`${letter.toLowerCase()}Numbers`);
                container.innerHTML = '';
                const range = ranges[index];
                
                for (let num = range.start; num <= range.end; num++) {
                    const cell = document.createElement('div');
                    cell.className = 'number-cell';
                    cell.textContent = num;
                    cell.dataset.number = num;
                    container.appendChild(cell);
                }
            });
        }
        
        // Toggle board selection
        function toggleBoardSelection(boardId, element) {
            if (selectedBoards.has(boardId)) {
                selectedBoards.delete(boardId);
                element.classList.remove('selected');
                element.style.background = baseBoardColor;
                element.style.borderColor = baseBoardColor;
                element.classList.remove('blurred');
            } else {
                selectedBoards.add(boardId);
                element.classList.add('selected');
                element.style.background = '#ff0000';
                
            }
            
            // Update selected count
            document.getElementById('selectedCount').textContent = selectedBoards.size;
            document.getElementById('selectedBadge').textContent = selectedBoards.size;
            
            // Update prize amount
            updatePrizeAmount();
        }
        
        // Clear all selected boards
        function clearSelection() {
            selectedBoards.clear();
            document.querySelectorAll('.board.selected').forEach(board => {
                board.classList.remove('selected');
                board.style.background = baseBoardColor;
                board.style.borderColor = baseBoardColor;
                board.classList.remove('blurred');
            });
            document.getElementById('selectedCount').textContent = '';
            document.getElementById('selectedBadge').textContent = '';
            updatePrizeAmount();
        }
        let boom = 1;
        // Start game function
        function startGame() {
            toz();
             document.getElementById('selectionPage').classList.add('man');
            if (selectedBoards.size === 0) {
                alert('Please select at least one board to start the game');
                return;
            }
            blockedBoards.clear();
            // Initialize game state
            calledNumbers.clear();
            remainingNumbers = Array.from({length: 75}, (_, i) => i + 1);
           
            // Play start sound
           // playSound('startSound');
            
            // Call shuffle without animation
            shuffleNumbers(false);
            
            // Reset UI elements
            document.getElementById('currentLetter').textContent = '';
            document.getElementById('currentDigit').textContent = '';
            document.getElementById('calledNumbersList').innerHTML = '';
             document.getElementById('hhh').classList.remove('active');
            // Reset number grid
            document.querySelectorAll('.number-cell').forEach(cell => {
                cell.classList.remove('called');
                cell.classList.remove('blink');
            });
           
            // Hide all cartelas
            document.querySelectorAll('.board-cartela').forEach(cartela => {
                cartela.style.display = 'none';
            });
            
            // Hide error messages
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('notSelectedMessage').style.display = 'none';
            
            // Update prize amount
            updatePrizeAmount();
            
            // Switch to game page
            document.getElementById('selectionPage').classList.remove('active');
            document.getElementById('gamePage').classList.add('active');
            blockedBoards.clear();
        }
        
        
        // Check for winning patterns and highlight them
        function checkWinningPatterns(boardId, cartelaGrid, currentCalledNumber) {
            const boardData = staticBoards[boardId];
            const cells = cartelaGrid.querySelectorAll('.cartela-cell');
            let hasWin = false;
            
            // Define patterns
            const patterns = {
                rows: [
                    [0,1,2,3,4],
                    [5,6,7,8,9],
                    [10,11,12,13,14],
                    [15,16,17,18,19],
                    [20,21,22,23,24]
                ],
                cols: [
                    [0,5,10,15,20],
                    [1,6,11,16,21],
                    [2,7,12,17,22],
                    [3,8,13,18,23],
                    [4,9,14,19,24]
                ],
                diags: [
                    [0,6,12,18,24],
                    [4,8,12,16,20]
                ],
                corners: [0,4,20,24]
            };
            
            // Check rows
            patterns.rows.forEach(row => {
                let complete = true;
                row.forEach(index => {
                    const cell = cells[index];
                    const value = boardData[index];
                    
                    if (value === 'FREE') return; // Free space always counts
                    
                    if (!cell.classList.contains('called')) {
                        complete = false;
                    }
                });
                
                if (complete) {
                    hasWin = true;
                    row.forEach(index => {
                        cells[index].classList.add('win-row');

                        document.getElementById('bonm').textContent = 'GOOD BINGO';
                        
                
                      
                        for (let i = 0; i < cells.length; i++) {
                    if (parseInt(cells[i].textContent) === currentCalledNumber) {
                        cells[i].classList.add('moom');
                        break;
                    }

                }
            
               

                    });

                    }

                    });
            
            // Check columns
            patterns.cols.forEach(col => {
                let complete = true;
                col.forEach(index => {
                    const cell = cells[index];
                    const value = boardData[index];
                    
                    if (value === 'FREE') return;
                    
                    if (!cell.classList.contains('called')) {
                        complete = false;
                    }
                });
                
                if (complete) {
                    hasWin = true;
                    col.forEach(index => {
                        cells[index].classList.add('win-col');
                        document.getElementById('bonm').textContent = 'GOOD BINGO';

                        
                        for (let i = 0; i < cells.length; i++) {
                    if (parseInt(cells[i].textContent) === currentCalledNumber) {
                        cells[i].classList.add('mome');
                        break;
                    }
                }
            
                        
                        
                    });
                    
                   
                }
            });
            
            // Check diagonals
            patterns.diags.forEach(diag => {
                let complete = true;
                diag.forEach(index => {
                    const cell = cells[index];
                    const value = boardData[index];
                    
                    if (value === 'FREE') return;
                    
                    if (!cell.classList.contains('called')) {
                        complete = false;
                    }
                });
                
                if (complete) {
                    hasWin = true;
                    diag.forEach(index => {
                        cells[index].classList.add('win-diag');
                        // const value = boardData[index];
                        document.getElementById('bonm').textContent = 'GOOD BINGO';

                         if (complete) {
                      const cells = cartelaGrid.querySelectorAll('.cartela-cell');
                        for (let i = 0; i < cells.length; i++) {
                    if (parseInt(cells[i].textContent) === currentCalledNumber) {
                        cells[i].classList.add('mome');
                        
                    }
                }
            }
                        
                    
                    });
                    
                }
            });
            
            // Check four corners
            let cornersComplete = true;
            patterns.corners.forEach(index => {
                const cell = cells[index];
                const value = boardData[index];
                
                if (value === 'FREE') return;
                
                if (!cell.classList.contains('called')) {
                    cornersComplete = false;
                }
            });
            
            if (cornersComplete) {
                hasWin = true;
                patterns.corners.forEach(index => {
                    cells[index].classList.add('win-corners');
                    document.getElementById('bonm').textContent = 'GOOD BINGO';

                    if (cornersComplete) {
                      const cells = cartelaGrid.querySelectorAll('.cartela-cell');
                        for (let i = 0; i < cells.length; i++) {
                    if (parseInt(cells[i].textContent) === currentCalledNumber) {
                        cells[i].classList.add('moom');
                        break;
                    }
                }
            }
                    
                });
               
                
            }
            
            
            return hasWin;
        }
        
        // Toggle play/pause
        function togglePlayPause() {
            isPlaying = !isPlaying;
            const button = document.getElementById('playPauseBtn');
            
            if (isPlaying) {
                button.innerHTML = '<i class="fas fa-pause"></i> Pause';
                playInterval = setInterval(callNextNumber, currentSpeed);
                
                // Play start sound
                playSound('startSound');
                
            } else {
                button.innerHTML = '<i class="fas fa-play"></i> Play';
                clearInterval(playInterval);
                
                  // Play pause sound
                playSound('pauseSound');
                
            }
        }
        
        // Call next number
        function callNextNumber() {
            if (remainingNumbers.length === 0) {
                clearInterval(playInterval);
                isPlaying = false;
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i> Play';
                alert('All numbers have been called!');
                return;
            }
            
            const number = remainingNumbers.pop();
            calledNumbers.add(number);
            currentCalledNumber = number;
            
             // Play specific number sound
            playNumberSound(number);
            
            // Determine letter for the number
            let letter = '';
            if (number <= 15) letter = 'B';
            else if (number <= 30) letter = 'I';
            else if (number <= 45) letter = 'N';
            else if (number <= 60) letter = 'G';
            else letter = 'O';
            
            // Update UI with letter and number
            document.getElementById('currentLetter').textContent = letter;
            document.getElementById('currentDigit').textContent = number;
                        
            // Add to called numbers list
            const calledNumbersList = document.getElementById('calledNumbersList');
            const calledNumber = document.createElement('div');
            calledNumber.className = 'called-number';
            calledNumber.textContent = `${letter}${number}`;
            
            // Add new number to the beginning
            calledNumbersList.prepend(calledNumber);
            
            // Remove oldest if more than 5
            if (calledNumbersList.children.length > 5) {
                calledNumbersList.removeChild(calledNumbersList.lastChild);
            }
            countc();
            // Update number grid - remove blink from previous number
            document.querySelectorAll('.number-cell').forEach(cell => {
                cell.classList.remove('blink');
            });

            
          
            
            // Add blink to current number
            const numberCell = document.querySelector(`.number-cell[data-number="${number}"]`);
            let mino = document.body.style.background;
            if (numberCell) {
                numberCell.classList.add('called');
                numberCell.classList.add('blink');
                
            }
     }
           // for call counter
        function toz(){
            
            document.getElementById('count').textContent = 0;
            boom = 1;
        }
          
        function countc(){
            let bbbm = document.getElementById('count').textContent = boom;
            let bmbm = boom += 1;
            boom = bmbm;
        }
        // Shuffle numbers with extended animation
        function shuffleNumbers(animate = true) {
            // Fisher-Yates shuffle algorithm
            for (let i = remainingNumbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remainingNumbers[i], remainingNumbers[j]] = [remainingNumbers[j], remainingNumbers[i]];
            }
            
            // Apply animations if requested
            if (animate) {
                const numberGrids = document.querySelectorAll('.number-grid');
                const numberCells = document.querySelectorAll('.number-cell');
                
                // Apply shake and blink animations
                numberGrids.forEach(grid => {
                    grid.classList.add('shake');
                });
                
                numberCells.forEach(cell => {
                    cell.classList.add('blink');
                });
                
                // After 7 seconds, remove animations
                setTimeout(() => {
                    numberGrids.forEach(grid => {
                        grid.classList.remove('shake');
                    });
                    
                    numberCells.forEach(cell => {
                        cell.classList.remove('blink');
                    });
                }, 5000);
            }
            
            // If playing, restart the interval
            if (isPlaying) {
                clearInterval(playInterval);
                playInterval = setInterval(callNextNumber, currentSpeed);
            }
        }
        
        // Update speed
        function updateSpeed() {
            const slider = document.getElementById('speedSlider');
            const value = parseInt(slider.value);
            currentSpeed = value;
            
            // Update display value
            document.getElementById('speedValue').textContent = (value / 1000).toFixed(1) + 's';
            
            // If playing, restart the interval
            if (isPlaying) {
                clearInterval(playInterval);
                playInterval = setInterval(callNextNumber, currentSpeed);
            }
        }
        
        // Check single board
        function checkSingleBoard() {
            
            const boardId = parseInt(document.getElementById('boardNumberInput').value);
            

            // Validate input
            if (isNaN(boardId) || boardId < 1 || boardId > 400) {
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('notSelectedMessage').style.display = 'none';
                return;
            }
            
            if (!selectedBoards.has(boardId)) {
                document.getElementById('errorMessage').style.display = 'none';
                document.getElementById('notSelectedMessage').style.display = 'block';
                return;
            }
            
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('notSelectedMessage').style.display = 'none';
            
            const boardData = staticBoards[boardId];
            const modalContent = document.getElementById('modalCartelaContent');
            modalContent.innerHTML = '';
            
             // Check if board is blocked
    if (blockedBoards.has(boardId)) {
    //    alert(`Board ${boardId} is blocked`);
        return;
    }
    
    
    
    // Add Block button to the modal
    const blockButton = document.createElement('button');
    blockButton.textContent = 'Block';
    blockButton.className = 'btn block-btn';
    blockButton.style.background = '#ff0000';
    blockButton.style.border = '#ff0000';
    blockButton.style.position = 'fixed';
    blockButton.style.right = '400px';
    blockButton.style.bottom = '100px'; 
    blockButton.onclick = function() {
    playSound('blockSound');
    blockedBoards.add(boardId);
    document.getElementById('cartelaModal').style.display = 'none';
       // alert(`Board ${boardId} has been blocked for the rest of this game.`);
        
        // Update UI to show blocked status
        updateBoardStatus(boardId, 'blocked');
    };
    modalContent.appendChild(blockButton);

            // Add column headers
             document.getElementById('bbb').textContent = `Cartela number  ${boardId}`
            const headerRow = document.createElement('div');
            headerRow.className = 'board-header-row';
            ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
                const headerCell = document.createElement('div');
                headerCell.className = 'board-header-cell';
                headerCell.textContent = letter;
                headerRow.appendChild(headerCell);
            });
            modalContent.appendChild(headerRow);
            
             
            // Create cartela grid
            const cartelaGrid = document.createElement('div');
            cartelaGrid.className = 'cartela-grid';
            
            for (let i = 0; i < boardData.length; i++) {
                const cell = document.createElement('div');
                cell.className = 'cartela-cell';
                
                if (boardData[i] === 'FREE') {
                    cell.textContent = 'FREE';
                    cell.classList.add('free');
                } else {
                    cell.textContent = boardData[i];
                    
                    if (calledNumbers.has(boardData[i])) {
                        cell.classList.add('called');
                    }
                }
                
                cartelaGrid.appendChild(cell);
            }
            
            modalContent.appendChild(cartelaGrid);
            


            // Check for winning patterns
            const hasWin = checkWinningPatterns(boardId, cartelaGrid, currentCalledNumber);
            
            // If there's a win, blink the current called number in the modal
          

            if (currentCalledNumber) {
                const cells = cartelaGrid.querySelectorAll('.cartela-cell');
                for (let i = 0; i < cells.length; i++) {
                    if (parseInt(cells[i].textContent) === currentCalledNumber) {
                        cells[i].classList.add('winning-blink');
                        break;
                    }
                }
            }

            
            
            // Show the modal
            document.getElementById('cartelaModal').style.display = 'flex';

             
            // Show the modal
            document.getElementById('cartelaModal').style.display = 'flex';
       
    
                    
         const numberCell = document.querySelector(`.number-cell[data-number="${number}"]`);
            if (numberCell) {
                numberCell.classList.add('called');
                numberCell.classList.add('blinks');
                
            }

        }
        
        // Helper function to update board status display
    function updateBoardStatus(boardId, status) {
    const boardElement = document.querySelector(`.board-cartela[data-id="${boardId}"]`);
    if (boardElement) {
        const statusElement = boardElement.querySelector('.status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = 'status';
            if (status === 'blocked') {
                statusElement.classList.add('blocked');
            }
        }
    }
}
   
        // Go back to selection page
        function goBackToSelection() {
            // Stop game if playing
            
            blockedBoards.clear();
            if (isPlaying) {
                clearInterval(playInterval);
                isPlaying = false;
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i> Play';
            }
            
            // Switch back to selection page
            
            document.getElementById('gamePage').classList.remove('active');
            document.getElementById('selectionPage').classList.add('active');
            document.getElementById('hhh').classList.add('active');
            
            loloo();
        }