/**
 *  Echo Sonar - Pure Sci-Fi Abyssal Exploration & Deepwater Stealth
 *  Platform: Yandex Games SDK v2 Integration
 *  Engine: Fixed-Timestep Physics, Continuous Collision, Intelligent A* NavGrid Pathfinding,
 *          Smooth Feeler Corner Steering (No Wall Ramming), Ultra-Optimized Zero-Allocation Hydrodynamics,
 *          24 Diverse Handcrafted Story Sectors & Infinite Procedural Abyss from Sector 25+,
 *          Dynamic Adaptive Procedural Cyberpunk Synth Music Engine,
 *          7 Distinctive Enemy Types (Patrol, Phantom, Smart Seeker, Behemoth, Jellyfish, Sonar Bat, Mine Layer),
 *          Energy Battery System, Kinetic Shields, Sonar Turrets, Laser Grids, Floating Mines,
 *          6 Deep Upgrade Trees, 3-Star Level Ratings, Decoy Mines & High-Retention Ad Loops.
 */

// ==========================================
// 1. GLOBAL VARIABLES, LOCALIZATION & SDK
// ==========================================
let ysdk = null;
let audioCtx = null;
let isAdShowing = false;
let lastInterstitialTime = 0;
let deathCount = 0;
let currentLang = 'ru';

const TRANSLATIONS = {
    ru: {
        gameTitle: "Echo Sonar",
        level: "СЕКТОР",
        sonar: "СОНАР",
        sonarActive: "СОНАР:",
        sec: "с",
        decoyAd: "ПРИМАНКА",
        decoyReady: "ПРИМАНКА ({n})",
        shieldAd: "ЩИТ",
        shieldActive: "ЩИТ ({n})",
        echo: "ЭХО",
        battery: "ЭНЕРГИЯ",
        energyLow: "НЕТ ЭНЕРГИИ!",
        stars: "ЗВЕЗДЫ",
        detected: "ОБНАРУЖЕНИЕ ДРОНОМ!",
        laserHit: "ПОРАЖЕНИЕ ЛАЗЕРОМ!",
        mineHit: "ВЗРЫВ МИНЫ!",
        jellyShock: "ЭЛЕКТРИЧЕСКИЙ УДАР!",
        shadowAbsorbed: "Зонд уничтожен в глубинах бездны...",
        respawnShield: "ВОЗРОДИТЬСЯ С ЩИТОМ",
        restart: "ЗАНОВО ➔",
        victory: "СЕКТОР ЗАЧИЩЕН!",
        victorySub: "Эхолокация помогла пробить путь через бездну.",
        nextLevel: "СЛЕДУЮЩИЙ СЕКТОР ➔",
        doubleReward: "УДВОИТЬ НАГРАДУ x2",
        upgradeMenuTitle: "МОДЕРНИЗАЦИЯ ЗОНДА",
        openUpgrades: "УЛУЧШЕНИЯ",
        closeUpgrades: "В БОЙ ➔",
        upgRange: "Дальность Эхо",
        upgSpeed: "Тяга Двигателя",
        upgStealth: "Стелс-Глушитель",
        upgShield: "Кинетический Щит",
        upgBattery: "Энерго-Реактор",
        upgMagnet: "Магнит Кристаллов",
        upgradeMax: "МАКС",
        cost: "Цена:",
        crystalsLabel: "Кристаллы:",
        crystalsSecGained: "Добыто: +{n} 💎 (Всего: {total})",
        starObj1: "Пройти сектор",
        starObj2: "Собрать все кристаллы",
        starObj3: "Без тревоги слухачей",
        // Handcrafted Sectors 1-24
        s1Title: "Первый Импульс", s1Hint: "Пробел или кнопка ЭХО — пуск волны. Энергия тратится на каждый пинг!",
        s2Title: "Акустический Сенсор", s2Hint: "Слухачи обходят стены на звук! Не пингуйте рядом со стеной укрытия",
        s3Title: "Двойной Дозор", s3Hint: "Используйте мины-ловушки, чтобы увести патрули в сторону",
        s4Title: "Риф Медуз", s4Hint: "Глубоководные медузы бьют током! Огибайте их или оглушайте EMP",
        s5Title: "Гидро-Турбина", s5Hint: "Водные потоки сносят зонд. Прокачайте двигатель для сопротивления!",
        s6Title: "Склад Мин", s6Hint: "Минеры сбрасывают плавучие мины. Подсвечивайте их эхолокатором!",
        s7Title: "Фантом-Перехватчик", s7Hint: "Скоростной фантом замаскирован во тьме и огибает препятствия на шум!",
        s8Title: "Сонарная Крепость", s8Hint: "Красные волны турели засекают зонд. Прячьтесь за защитными колоннами!",
        s9Title: "Спираль Ищейки", s9Hint: "Умный дрон сам пускает зеленые сонары и находит кратчайший путь!",
        s10Title: "Врата Бездны", s10Hint: "Финальный рубеж верхнего яруса. Ищейка, Фантом и турель!",
        s11Title: "Эхо-Пещеры", s11Hint: "Слепой эхо-хищник слышит пинги через всю карту! Двигайтесь тихо",
        s12Title: "Шлюз Джаггернаута", s12Hint: "Тяжелый бронированный дрон блокирует проходы и испускает грави-волны",
        s13Title: "Водоворот Медуз", s13Hint: "Водовороты затягивают зонд прямо на ядовитые щупальца",
        s14Title: "Лазерная Сетка", s14Hint: "Сочетание плавучих мин и динамических лазерных растяжек",
        s15Title: "Охотничьи Угодья", s15Hint: "Ищейка координирует атаку двух фантомов. Используйте мины-приманки!",
        s16Title: "Звукопоглощающий Ил", s16Hint: "Стены поглощают эхо. Сигнал угасает в два раза быстрее",
        s17Title: "Цитадель Шлюзов", s17Hint: "Два броненосца патрулируют синхронные движущиеся шлюзы",
        s18Title: "Гнездо Хищников", s18Hint: "Эхо-летуньи и фантомы в узких коридорах. Щит защитит от ошибки",
        s19Title: "Штормовой Разлом", s19Hint: "Мощнейшее встречное течение, минеры и умные охотники",
        s20Title: "Ядро Глубины", s20Hint: "Тройная турель и Джаггернаут охраняют главный энерго-генератор",
        s21Title: "Слепая Бездна", s21Hint: "Три эхо-летуньи сканируют темный лабиринт. Бесшумный ход — залог выживания",
        s22Title: "Лазерный Комплекс", s22Hint: "Сетка лазеров, стая медуз и скоростные фантомы",
        s23Title: "Титанический Водоворот", s23Hint: "Тяжелые броненосцы и ищейки при сильнейшем гидро-течении",
        s24Title: "Глаз Левиафана", s24Hint: "Сверх-турель сканирует сектор круговым лучом, пока фантомы рыщут во тьме"
    },
    en: {
        gameTitle: "Echo Sonar",
        level: "SECTOR",
        sonar: "SONAR",
        sonarActive: "SONAR:",
        sec: "s",
        decoyAd: "DECOY",
        decoyReady: "DECOY ({n})",
        shieldAd: "SHIELD",
        shieldActive: "SHIELD ({n})",
        echo: "ECHO",
        battery: "ENERGY",
        energyLow: "NO ENERGY!",
        stars: "STARS",
        detected: "DRONE DETECTED!",
        laserHit: "LASER GRID CONTACT!",
        mineHit: "MINE DETONATION!",
        jellyShock: "ELECTRO-SHOCK!",
        shadowAbsorbed: "Probe was destroyed in the deep abyss...",
        respawnShield: "RESPAWN WITH SHIELD",
        restart: "RESTART ➔",
        victory: "SECTOR CLEARED!",
        victorySub: "Echolocation guided your probe through the abyss.",
        nextLevel: "NEXT SECTOR ➔",
        doubleReward: "DOUBLE REWARD x2",
        upgradeMenuTitle: "PROBE UPGRADES",
        openUpgrades: "UPGRADES",
        closeUpgrades: "LAUNCH ➔",
        upgRange: "Echo Range",
        upgSpeed: "Thruster Speed",
        upgStealth: "Stealth Baffle",
        upgShield: "Kinetic Shield",
        upgBattery: "Energy Reactor",
        upgMagnet: "Crystal Magnet",
        upgradeMax: "MAX",
        cost: "Cost:",
        crystalsLabel: "Crystals:",
        crystalsSecGained: "Extracted: +{n} 💎 (Total: {total})",
        starObj1: "Clear sector",
        starObj2: "Collect all crystals",
        starObj3: "Zero drone alerts",
        s1Title: "First Impulse", s1Hint: "Space or ECHO button launches wave. Each ping consumes energy!",
        s2Title: "Acoustic Sensor", s2Hint: "Drones navigate around walls to sound! Don't ping near walls",
        s3Title: "Dual Patrol", s3Hint: "Use decoy mines to lure patrols away from chokepoints",
        s4Title: "Jellyfish Reef", s4Hint: "Bioluminescent jellyfish shock on contact! Bypass or EMP-stun them",
        s5Title: "Hydro Turbine", s5Hint: "Water currents push probe. Upgrade thrusters for resistance!",
        s6Title: "Mine Depot", s6Hint: "Miners drop proximity mines. Illuminate them with sonar!",
        s7Title: "Phantom Interceptor", s7Hint: "High-speed cloaked hunter navigates corridors towards sound!",
        s8Title: "Sonar Fortress", s8Hint: "Red turret waves detect probe. Hide behind barrier pillars!",
        s9Title: "Seeker Spiral", s9Hint: "Active hunter drone pings green sonar and calculates shortest path!",
        s10Title: "Abyss Gateway", s10Hint: "Final sector of upper tier. Seeker, Phantom, and Turret array!",
        s11Title: "Acoustic Caverns", s11Hint: "Blind apex predator hears across the entire map! Move silently",
        s12Title: "Juggernaut Lock", s12Hint: "Heavy armored drone blocks passages and emits gravity pulses",
        s13Title: "Jellyfish Vortex", s13Hint: "Whirlpools pull the probe into jellyfish clusters",
        s14Title: "Laser Grid", s14Hint: "Combination of floating contact mines and laser tripwires",
        s15Title: "Hunting Grounds", s15Hint: "Seeker coordinates two Phantoms. Decoy mines are crucial!",
        s16Title: "Sound-Dampening Silt", s16Hint: "Silt walls absorb echo. Signal fades twice as fast",
        s17Title: "Gate Citadel", s17Hint: "Two Behemoths guard synchronized moving gates",
        s18Title: "Predator Nest", s18Hint: "Sonar bats and Phantoms in tight halls. Shield prevents fatal errors",
        s19Title: "Storm Trench", s19Hint: "Extreme head currents mixed with miners and seekers",
        s20Title: "Deep Core", s20Hint: "Triple turret array and Behemoth defend the power conduit",
        s21Title: "Blind Abyss", s21Hint: "Three Sonar Bats sweep pitch black maze. Silent running is key",
        s22Title: "Laser Complex", s22Hint: "Laser grids, jellyfish swarms, and high-speed Phantoms",
        s23Title: "Titanic Maelstrom", s23Hint: "Heavy Behemoths and Seekers in turbulent hydrodynamic currents",
        s24Title: "Eye of Leviathan", s24Hint: "Super-turret sweeps 360 degrees while Phantoms stalk the dark"
    }
};

function detectLanguage(overrideLang) {
    let rawLang = overrideLang;
    if (!rawLang && ysdk && ysdk.environment && ysdk.environment.i18n) {
        rawLang = ysdk.environment.i18n.lang;
    }
    if (!rawLang) {
        rawLang = navigator.language || navigator.userLanguage || 'ru';
    }

    const langCode = rawLang.toLowerCase();
    if (langCode.startsWith('ru') || langCode.startsWith('be') || langCode.startsWith('uk') || langCode.startsWith('kk') || langCode.startsWith('uz')) {
        currentLang = 'ru';
    } else {
        currentLang = 'en';
    }
    document.title = t('gameTitle');
}

function t(key, params = {}) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['ru'];
    let str = dict[key] || key;
    for (let k in params) {
        str = str.replace(`{${k}}`, params[k]);
    }
    return str;
}

function initSDK() {
    if (typeof YaGames !== 'undefined') {
        YaGames.init()
            .then(_sdk => {
                ysdk = _sdk;
                try {
                    const lang = ysdk.environment.i18n.lang;
                    detectLanguage(lang);
                } catch(e) {
                    detectLanguage();
                }

                console.log('[Echo Sonar] SDK Ready. Lang:', currentLang);
                if (ysdk.features && ysdk.features.LoadingAPI && typeof ysdk.features.LoadingAPI.ready === 'function') {
                    ysdk.features.LoadingAPI.ready();
                }
            })
            .catch(err => {
                console.warn('[Echo Sonar] SDK init error:', err);
                setupFallbackSDK();
            });
    } else {
        setupFallbackSDK();
    }
}

function setupFallbackSDK() {
    ysdk = {
        environment: {
            i18n: {
                lang: (navigator.language || 'ru').substring(0, 2)
            }
        },
        adv: {
            showFullscreenAdv: (config) => {
                setTimeout(() => {
                    if (config && config.callbacks && config.callbacks.onClose) config.callbacks.onClose(true);
                }, 300);
            },
            showRewardedVideo: (config) => {
                setTimeout(() => {
                    if (config && config.callbacks && config.callbacks.onRewarded) config.callbacks.onRewarded();
                    if (config && config.callbacks && config.callbacks.onClose) config.callbacks.onClose();
                }, 300);
            }
        }
    };
    detectLanguage();
}

function showInterstitial(onCloseCallback) {
    const now = Date.now();
    if (now - lastInterstitialTime < 60000) {
        if (onCloseCallback) onCloseCallback(false);
        return;
    }

    isAdShowing = true;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();

    if (ysdk && ysdk.adv && typeof ysdk.adv.showFullscreenAdv === 'function') {
        ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: function(wasShown) {
                    lastInterstitialTime = Date.now();
                    isAdShowing = false;
                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                    if (onCloseCallback) onCloseCallback(wasShown);
                },
                onError: function(error) {
                    lastInterstitialTime = Date.now();
                    isAdShowing = false;
                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                    if (onCloseCallback) onCloseCallback(true);
                }
            }
        });
    } else {
        isAdShowing = false;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (onCloseCallback) onCloseCallback(true);
    }
}

function showRewarded(onSuccess, onFail) {
    isAdShowing = true;
    if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
    let rewarded = false;

    if (ysdk && ysdk.adv && typeof ysdk.adv.showRewardedVideo === 'function') {
        ysdk.adv.showRewardedVideo({
            callbacks: {
                onRewarded: function() { rewarded = true; },
                onClose: function() {
                    isAdShowing = false;
                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                    if (rewarded) { if (onSuccess) onSuccess(); }
                    else { if (onFail) onFail(); }
                },
                onError: function(err) {
                    isAdShowing = false;
                    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
                    if (onSuccess) onSuccess();
                }
            }
        });
    } else {
        isAdShowing = false;
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (onSuccess) onSuccess();
    }
}

// ==========================================
// 2. ADAPTIVE PROCEDURAL CYBERPUNK MUSIC ENGINE
// ==========================================
class ProceduralMusicEngine {
    constructor() {
        this.isPlaying = false;
        this.isMuted = false;
        this.step = 0;
        this.tempo = 124; // 124 BPM driving cyberpunk tempo
        this.stepDuration = (60 / this.tempo) / 4; // 16th notes = ~0.121s
        this.timer = null;
        this.nextNoteTime = 0;
        this.dangerLevel = 0; // 0 (stealth) to 1 (high tension chase)

        // D Minor Dark Synthwave chords (Fundamental and harmonic overtones)
        this.chords = [
            [73.42, 146.83, 220.00, 349.23, 440.00, 587.33],
            [58.27, 116.54, 233.08, 349.23, 466.16, 587.33],
            [65.41, 130.81, 261.63, 329.63, 392.00, 523.25],
            [55.00, 110.00, 220.00, 329.63, 440.00, 659.25]
        ];

        this.melodyPatterns = [
            [0, 2, 4, 2, 1, 3, 5, 3, 0, 4, 3, 2, 5, 4, 2, 1],
            [4, 2, 0, 2, 5, 3, 1, 3, 4, 2, 5, 3, 2, 0, 1, 3],
            [0, 1, 2, 4, 3, 2, 1, 0, 5, 4, 3, 2, 1, 2, 3, 4]
        ];

        this.loadMuteState();
    }

    loadMuteState() {
        try {
            const m = localStorage.getItem('echo_sonar_muted');
            this.isMuted = (m === 'true');
        } catch (e) {}
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('echo_sonar_muted', this.isMuted ? 'true' : 'false');
        } catch (e) {}
        return this.isMuted;
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        if (audioCtx) this.nextNoteTime = audioCtx.currentTime + 0.1;
        this.scheduleLoop();
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    setDanger(level) {
        this.dangerLevel = Math.max(0, Math.min(1, level));
    }

    scheduleLoop() {
        if (!this.isPlaying) return;

        if (audioCtx && audioCtx.state === 'running' && !isAdShowing && !this.isMuted) {
            while (this.nextNoteTime < audioCtx.currentTime + 0.25) {
                this.playStep(this.nextNoteTime, this.step);
                this.nextNoteTime += this.stepDuration;
                this.step = (this.step + 1) % 64;
            }
        }

        this.timer = setTimeout(() => this.scheduleLoop(), 45);
    }

    playStep(time, stepIndex) {
        if (!audioCtx || this.isMuted || isAdShowing) return;

        const barIndex = Math.floor(stepIndex / 16) % this.chords.length;
        const stepInBar = stepIndex % 16;
        const chord = this.chords[barIndex];
        const danger = this.dangerLevel;

        if (stepInBar % 4 === 0 || (danger > 0.4 && stepInBar % 2 === 0)) {
            this.playKick(time, danger);
        }

        const hatVelocity = (stepInBar % 4 === 2) ? 0.08 : (stepInBar % 2 === 1 ? 0.04 : 0.06);
        this.playHiHat(time, hatVelocity * (1 + danger * 0.8));

        if (stepInBar === 4 || stepInBar === 12) {
            this.playSnare(time, danger);
        }

        const bassFreq = chord[0];
        const isBassTrigger = (stepInBar % 2 === 0) || (danger > 0.3);
        if (isBassTrigger) {
            const octaveMod = (stepInBar % 4 === 3 && danger > 0.5) ? 2 : 1;
            this.playBass(time, bassFreq * octaveMod, danger);
        }

        const pattern = this.melodyPatterns[barIndex % this.melodyPatterns.length];
        const noteIndex = pattern[stepInBar] % chord.length;
        const leadFreq = chord[noteIndex];
        this.playLead(time, leadFreq, danger, stepInBar);
    }

    playKick(time, danger) {
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(140 + danger * 30, time);
            osc.frequency.exponentialRampToValueAtTime(36, time + 0.08);

            const vol = 0.26 + danger * 0.12;
            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + 0.12);
        } catch (e) {}
    }

    playHiHat(time, volume) {
        try {
            const bufferSize = audioCtx.sampleRate * 0.03;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(6500, time);

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(volume * 0.35, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start(time);
            noise.stop(time + 0.03);
        } catch (e) {}
    }

    playSnare(time, danger) {
        try {
            const bufferSize = audioCtx.sampleRate * 0.1;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1800, time);

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.11 + danger * 0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start(time);
            noise.stop(time + 0.1);
        } catch (e) {}
    }

    playBass(time, freq, danger) {
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);

            filter.type = 'lowpass';
            const cutoff = 220 + danger * 600;
            filter.frequency.setValueAtTime(cutoff, time);
            filter.frequency.exponentialRampToValueAtTime(80, time + this.stepDuration * 0.9);

            gain.gain.setValueAtTime(0.16 + danger * 0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + this.stepDuration * 0.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(time);
            osc.stop(time + this.stepDuration * 0.9);
        } catch (e) {}
    }

    playLead(time, freq, danger, stepInBar) {
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            osc.type = (danger > 0.5) ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            filter.type = 'lowpass';
            const cutoff = 450 + danger * 1800 + (stepInBar % 4 === 0 ? 300 : 0);
            filter.frequency.setValueAtTime(cutoff, time);
            filter.Q.setValueAtTime(3.0 + danger * 4.0, time);

            const vol = 0.06 + danger * 0.07;
            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + this.stepDuration * 0.85);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(time);
            osc.stop(time + this.stepDuration * 0.85);
        } catch (e) {}
    }
}

const musicEngine = new ProceduralMusicEngine();

// ==========================================
// 3. SOUND SYNTHESIS FX
// ==========================================
function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    musicEngine.start();
}

function playPingSound(freq = 720, duration = 0.28) {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.35, audioCtx.currentTime + duration);

        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function playSeekerPingSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(920, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(460, audioCtx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
}

function playBatScreechSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, audioCtx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
}

function playDecoyChime() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
}

function playEMPSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.45, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
}

function playShieldHitSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
}

function playCrystalSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
}

function playAlertSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
}

function playWinSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            const t = audioCtx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.4);
        });
    } catch (e) {}
}

function playDeathSound() {
    if (!audioCtx || isAdShowing || musicEngine.isMuted) return;
    try {
        const bufferSize = audioCtx.sampleRate * 0.45;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, audioCtx.currentTime);
        filter.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.45);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        noise.start();
        noise.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
}

// ==========================================
// 4. ROBUST GEOMETRY & CONTINUOUS RAYCASTING
// ==========================================
function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function distSq(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

function getClosestPointOnSegment(px, py, x1, y1, x2, y2) {
    const l2 = distSq(x1, y1, x2, y2);
    if (l2 === 0) return { x: x1, y: y1, t: 0 };
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1),
        t: t
    };
}

function resolveContinuousCollision(circle, prevX, prevY, walls) {
    const radius = circle.radius;
    const rSq = radius * radius;

    for (let w of walls) {
        const closest = getClosestPointOnSegment(circle.x, circle.y, w.x1, w.y1, w.x2, w.y2);
        const dx = circle.x - closest.x;
        const dy = circle.y - closest.y;
        const dSq = dx * dx + dy * dy;

        if (dSq < rSq) {
            const d = Math.sqrt(dSq);
            if (d > 0.0001) {
                const overlap = radius - d;
                circle.x += (dx / d) * overlap;
                circle.y += (dy / d) * overlap;
            } else {
                circle.x = prevX;
                circle.y = prevY;
            }
        }
    }
}

function linesIntersect(a, b, c, d) {
    function ccw(p1, p2, p3) {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (ccw(a, c, d) !== ccw(b, c, d)) && (ccw(a, b, c) !== ccw(a, b, d));
}

function isLineOfSightClear(x1, y1, x2, y2, walls) {
    const p1 = { x: x1, y: y1 };
    const p2 = { x: x2, y: y2 };
    for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (linesIntersect(p1, p2, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 })) {
            return false;
        }
    }
    return true;
}

// ==========================================
// 5. INTELLIGENT A* NAVIGATION GRID & PATHFINDING
// ==========================================
class NavGrid {
    constructor(walls, cellSize = 25) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(840 / cellSize);
        this.rows = Math.ceil(560 / cellSize);
        this.grid = new Uint8Array(this.cols * this.rows);
        this.build(walls);
    }

    build(walls) {
        this.grid.fill(0);
        const clearance = 14;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cx = c * this.cellSize + this.cellSize / 2;
                const cy = r * this.cellSize + this.cellSize / 2;

                if (cx < 48 || cx > 792 || cy < 48 || cy > 512) {
                    this.grid[r * this.cols + c] = 1;
                    continue;
                }

                for (let w of walls) {
                    const closest = getClosestPointOnSegment(cx, cy, w.x1, w.y1, w.x2, w.y2);
                    if (distSq(cx, cy, closest.x, closest.y) < (clearance + this.cellSize * 0.35) * (clearance + this.cellSize * 0.35)) {
                        this.grid[r * this.cols + c] = 1;
                        break;
                    }
                }
            }
        }
    }

    getNodeIndex(x, y) {
        const c = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
        const r = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
        return { c, r, index: r * this.cols + c };
    }

    findPath(startX, startY, endX, endY) {
        const start = this.getNodeIndex(startX, startY);
        const end = this.getNodeIndex(endX, endY);

        if (start.c === end.c && start.r === end.r) {
            return [{ x: endX, y: endY }];
        }

        let targetC = end.c;
        let targetR = end.r;
        if (this.grid[targetR * this.cols + targetC] === 1) {
            let bestD = Infinity;
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    const nr = targetR + dr;
                    const nc = targetC + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr * this.cols + nc] === 0) {
                        const d = dr * dr + dc * dc;
                        if (d < bestD) {
                            bestD = d;
                            targetC = nc;
                            targetR = nr;
                        }
                    }
                }
            }
        }

        const openSet = [start.index];
        const cameFrom = new Int32Array(this.cols * this.rows).fill(-1);
        const gScore = new Float32Array(this.cols * this.rows).fill(Infinity);
        const fScore = new Float32Array(this.cols * this.rows).fill(Infinity);

        gScore[start.index] = 0;
        fScore[start.index] = Math.hypot(targetC - start.c, targetR - start.r);

        const dirs = [
            { dc: 1, dr: 0, cost: 1 },
            { dc: -1, dr: 0, cost: 1 },
            { dc: 0, dr: 1, cost: 1 },
            { dc: 0, dr: -1, cost: 1 },
            { dc: 1, dr: 1, cost: 1.414 },
            { dc: -1, dr: 1, cost: 1.414 },
            { dc: 1, dr: -1, cost: 1.414 },
            { dc: -1, dr: -1, cost: 1.414 }
        ];

        let iterations = 0;
        const maxIterations = 350;

        while (openSet.length > 0 && iterations++ < maxIterations) {
            let lowestIdx = 0;
            let lowestVal = fScore[openSet[0]];
            for (let i = 1; i < openSet.length; i++) {
                if (fScore[openSet[i]] < lowestVal) {
                    lowestVal = fScore[openSet[i]];
                    lowestIdx = i;
                }
            }

            const current = openSet.splice(lowestIdx, 1)[0];
            const currC = current % this.cols;
            const currR = Math.floor(current / this.cols);

            if (currC === targetC && currR === targetR) {
                const path = [{ x: endX, y: endY }];
                let curr = current;
                while (cameFrom[curr] !== -1) {
                    const c = curr % this.cols;
                    const r = Math.floor(curr / this.cols);
                    path.unshift({
                        x: c * this.cellSize + this.cellSize / 2,
                        y: r * this.cellSize + this.cellSize / 2
                    });
                    curr = cameFrom[curr];
                }
                return path;
            }

            for (let d of dirs) {
                const neighborC = currC + d.dc;
                const neighborR = currR + d.dr;
                if (neighborC < 0 || neighborC >= this.cols || neighborR < 0 || neighborR >= this.rows) continue;

                const neighborIdx = neighborR * this.cols + neighborC;
                if (this.grid[neighborIdx] === 1) continue;

                if (d.dc !== 0 && d.dr !== 0) {
                    if (this.grid[currR * this.cols + neighborC] === 1 || this.grid[neighborR * this.cols + currC] === 1) {
                        continue;
                    }
                }

                const tentativeG = gScore[current] + d.cost;
                if (tentativeG < gScore[neighborIdx]) {
                    cameFrom[neighborIdx] = current;
                    gScore[neighborIdx] = tentativeG;
                    fScore[neighborIdx] = tentativeG + Math.hypot(targetC - neighborC, targetR - neighborR);
                    if (!openSet.includes(neighborIdx)) {
                        openSet.push(neighborIdx);
                    }
                }
            }
        }

        return [{ x: endX, y: endY }];
    }
}

// ==========================================
// 6. GAME ENTITIES & MECHANICS
// ==========================================
class Wave {
    constructor(x, y, maxRadius = 320, color = '#00f3ff') {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.speed = 240;
        this.life = 1.0;
        this.color = color;
    }

    update(dt) {
        this.radius += this.speed * dt;
        this.life = Math.max(0, 1.0 - (this.radius / this.maxRadius));
        return this.radius < this.maxRadius;
    }

    draw(ctx, scale, offsetX, offsetY) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            this.x * scale + offsetX,
            this.y * scale + offsetY,
            this.radius * scale,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.life * 0.85;
        ctx.lineWidth = 3 * scale;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12 * scale;
        ctx.stroke();
        ctx.restore();
    }
}

class LitSegment {
    constructor(x1, y1, x2, y2, color = '#00f3ff') {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.life = 1.4;
        this.maxLife = 1.4;
        this.color = color;
    }

    update(dt) {
        this.life -= dt;
        return this.life > 0;
    }

    draw(ctx, scale, offsetX, offsetY) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x1 * scale + offsetX, this.y1 * scale + offsetY);
        ctx.lineTo(this.x2 * scale + offsetX, this.y2 * scale + offsetY);
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2.5 * scale;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10 * scale;
        ctx.stroke();
        ctx.restore();
    }
}

class DecoyMine {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 9;
        this.life = 14.0;
        this.maxLife = 14.0;
        this.pulseTimer = 0;
        this.animTimer = 0;
        this.isDetonated = false;
    }

    update(dt, waves) {
        this.animTimer += dt * 5;
        this.pulseTimer += dt;

        if (this.pulseTimer >= 1.6) {
            this.pulseTimer = 0;
            waves.push(new Wave(this.x, this.y, 360, '#a855f7'));
            playDecoyChime();
        }

        this.life -= dt;
        return this.life > 0 && !this.isDetonated;
    }

    detonate(enemies, waves) {
        if (this.isDetonated) return;
        this.isDetonated = true;
        playEMPSound();
        waves.push(new Wave(this.x, this.y, 240, '#d946ef'));

        enemies.forEach(e => {
            if (dist(e.x, e.y, this.x, this.y) < 150) {
                const stunDuration = (e.type === 'behemoth') ? 2.8 : 6.0;
                e.stunTimer = stunDuration;
                e.state = 'STUNNED';
            }
        });
    }

    draw(ctx, scale, offsetX, offsetY) {
        const mx = this.x * scale + offsetX;
        const my = this.y * scale + offsetY;
        const pulse = (11 + Math.sin(this.animTimer) * 3) * scale;

        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, pulse * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, this.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 14 * scale;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, my, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2 * scale;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
            ctx.beginPath();
            ctx.moveTo(mx + Math.cos(a + this.animTimer * 0.3) * (this.radius * scale), my + Math.sin(a + this.animTimer * 0.3) * (this.radius * scale));
            ctx.lineTo(mx + Math.cos(a + this.animTimer * 0.3) * ((this.radius + 5) * scale), my + Math.sin(a + this.animTimer * 0.3) * ((this.radius + 5) * scale));
            ctx.stroke();
        }
        ctx.restore();
    }
}

class FloatingMine {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 7;
        this.isDetonated = false;
        this.animTimer = Math.random() * Math.PI;
    }

    update(dt) {
        this.animTimer += dt * 4;
    }

    draw(ctx, scale, offsetX, offsetY, illuminated) {
        if (this.isDetonated) return;
        const mx = this.x * scale + offsetX;
        const my = this.y * scale + offsetY;
        const pulse = (7 + Math.sin(this.animTimer) * 1.5) * scale;

        ctx.save();
        ctx.globalAlpha = illuminated ? 0.95 : 0.2;
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = illuminated ? 10 * scale : 2 * scale;
        ctx.beginPath();
        ctx.arc(mx, my, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, my, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class EnergyCrystal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 7;
        this.collected = false;
        this.animTimer = Math.random() * Math.PI;
    }

    update(dt) {
        this.animTimer += dt * 4;
    }

    draw(ctx, scale, offsetX, offsetY, visible) {
        if (this.collected) return;
        const cx = this.x * scale + offsetX;
        const cy = this.y * scale + offsetY;
        const pulse = (7 + Math.sin(this.animTimer) * 2) * scale;

        ctx.save();
        ctx.globalAlpha = visible ? 1.0 : 0.15;
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, pulse * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class LaserTripwire {
    constructor(x1, y1, x2, y2, isOscillating = false, cycleTime = 3.0) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.isOscillating = isOscillating;
        this.cycleTime = cycleTime;
        this.timer = Math.random() * cycleTime;
        this.isActive = true;
    }

    update(dt) {
        if (this.isOscillating) {
            this.timer = (this.timer + dt) % this.cycleTime;
            this.isActive = this.timer < (this.cycleTime * 0.6);
        }
    }

    checkHit(px, py, radius) {
        if (!this.isActive) return false;
        const closest = getClosestPointOnSegment(px, py, this.x1, this.y1, this.x2, this.y2);
        return dist(px, py, closest.x, closest.y) < (radius + 4);
    }

    draw(ctx, scale, offsetX, offsetY, illuminated) {
        if (!this.isActive) return;
        ctx.save();
        ctx.globalAlpha = illuminated ? 0.95 : 0.25;
        ctx.beginPath();
        ctx.moveTo(this.x1 * scale + offsetX, this.y1 * scale + offsetY);
        ctx.lineTo(this.x2 * scale + offsetX, this.y2 * scale + offsetY);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5 * scale;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = illuminated ? 12 * scale : 4 * scale;
        ctx.stroke();

        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(this.x1 * scale + offsetX, this.y1 * scale + offsetY, 4 * scale, 0, Math.PI * 2);
        ctx.arc(this.x2 * scale + offsetX, this.y2 * scale + offsetY, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class SonarTurret {
    constructor(x, y, period = 3.0, range = 260) {
        this.x = x;
        this.y = y;
        this.period = period;
        this.range = range;
        this.timer = Math.random() * period;
        this.radius = 12;
    }

    update(dt, waves) {
        this.timer += dt;
        if (this.timer >= this.period) {
            this.timer = 0;
            waves.push(new Wave(this.x, this.y, this.range, '#ef4444'));
            playAlertSound();
        }
    }

    draw(ctx, scale, offsetX, offsetY, visible) {
        const tx = this.x * scale + offsetX;
        const ty = this.y * scale + offsetY;

        ctx.save();
        ctx.globalAlpha = visible ? 1.0 : 0.3;
        ctx.beginPath();
        ctx.arc(tx, ty, this.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 * scale;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10 * scale;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tx, ty, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class MovingGate {
    constructor(x1, y1, x2, y2, speed = 1.0, travelDist = 120, axis = 'y') {
        this.origX1 = x1;
        this.origY1 = y1;
        this.origX2 = x2;
        this.origY2 = y2;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.speed = speed;
        this.travelDist = travelDist;
        this.axis = axis;
        this.time = Math.random() * Math.PI;
    }

    update(dt) {
        this.time += dt * this.speed;
        const offset = Math.sin(this.time) * this.travelDist;
        if (this.axis === 'y') {
            this.y1 = this.origY1 + offset;
            this.y2 = this.origY2 + offset;
        } else {
            this.x1 = this.origX1 + offset;
            this.x2 = this.origX2 + offset;
        }
    }

    draw(ctx, scale, offsetX, offsetY, visible) {
        ctx.save();
        ctx.globalAlpha = visible ? 0.9 : 0.2;
        ctx.beginPath();
        ctx.moveTo(this.x1 * scale + offsetX, this.y1 * scale + offsetY);
        ctx.lineTo(this.x2 * scale + offsetX, this.y2 * scale + offsetY);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5 * scale;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10 * scale;
        ctx.stroke();
        ctx.restore();
    }
}

// Optimized Zero-Allocation Hydrodynamics Zone
class WaterCurrentZone {
    constructor(x, y, w, h, forceX, forceY) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.forceX = forceX;
        this.forceY = forceY;
        this.streamOffset = 0;
    }

    contains(px, py) {
        return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
    }

    update(dt) {
        this.streamOffset = (this.streamOffset + dt * 45) % 30;
    }

    draw(ctx, scale, offsetX, offsetY) {
        const cx = this.x * scale + offsetX;
        const cy = this.y * scale + offsetY;
        const cw = this.w * scale;
        const ch = this.h * scale;

        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(cx, cy, cw, ch);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();

        const isVertical = Math.abs(this.forceY) >= Math.abs(this.forceX);
        if (isVertical) {
            const dir = this.forceY > 0 ? 1 : -1;
            const laneCount = Math.max(2, Math.floor(this.w / 35));
            for (let i = 1; i <= laneCount; i++) {
                const lx = cx + (cw / (laneCount + 1)) * i;
                for (let y = 0; y < ch; y += 30) {
                    const ly = cy + ((y + this.streamOffset * dir + ch) % ch);
                    ctx.moveTo(lx, ly);
                    ctx.lineTo(lx, ly + 14 * scale * dir);
                }
            }
        } else {
            const dir = this.forceX > 0 ? 1 : -1;
            const laneCount = Math.max(2, Math.floor(this.h / 35));
            for (let i = 1; i <= laneCount; i++) {
                const ly = cy + (ch / (laneCount + 1)) * i;
                for (let x = 0; x < cw; x += 30) {
                    const lx = cx + ((x + this.streamOffset * dir + cw) % cw);
                    ctx.moveTo(lx, ly);
                    ctx.lineTo(lx + 14 * scale * dir, ly);
                }
            }
        }
        ctx.stroke();
        ctx.restore();
    }
}

class Player {
    constructor(x, y, upgrades) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.radius = 8;
        
        const spdLvl = upgrades.speed || 0;
        this.speed = 150 * (1 + spdLvl * 0.15);
        this.currentResistance = 1 - (spdLvl * 0.12);

        this.pingCooldown = 0;
        const rngLvl = upgrades.range || 0;
        this.sonarRange = 280 * (1 + rngLvl * 0.2);

        const stlLvl = upgrades.stealth || 0;
        this.stealthFactor = Math.max(0.2, 1 - stlLvl * 0.18);

        const batLvl = upgrades.battery || 0;
        this.maxBattery = 100 + batLvl * 25;
        this.battery = this.maxBattery;
        this.batteryRegen = 12 + batLvl * 4;

        const shdLvl = upgrades.shield || 0;
        this.shields = shdLvl;
        this.maxShields = shdLvl;

        const magLvl = upgrades.magnet || 0;
        this.magnetRadius = magLvl > 0 ? (60 + magLvl * 35) : 0;

        this.trail = [];
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.pingCooldown = 0;
        this.battery = this.maxBattery;
        this.shields = this.maxShields;
        this.trail = [];
    }

    update(dt, inputDir, allWalls, currents, crystals) {
        if (this.pingCooldown > 0) this.pingCooldown -= dt;

        if (this.battery < this.maxBattery) {
            this.battery = Math.min(this.maxBattery, this.battery + this.batteryRegen * dt);
        }

        const prevX = this.x;
        const prevY = this.y;

        let vx = 0;
        let vy = 0;
        if (inputDir.x !== 0 || inputDir.y !== 0) {
            const moveLen = Math.hypot(inputDir.x, inputDir.y);
            vx = (inputDir.x / moveLen) * this.speed;
            vy = (inputDir.y / moveLen) * this.speed;
        }

        if (currents) {
            for (let c of currents) {
                if (c.contains(this.x, this.y)) {
                    vx += c.forceX * this.currentResistance;
                    vy += c.forceY * this.currentResistance;
                }
            }
        }

        const steps = 3;
        const subDt = dt / steps;
        for (let s = 0; s < steps; s++) {
            this.x += vx * subDt;
            resolveContinuousCollision(this, prevX, prevY, allWalls);

            this.y += vy * subDt;
            resolveContinuousCollision(this, prevX, prevY, allWalls);
        }

        if (this.magnetRadius > 0 && crystals) {
            for (let c of crystals) {
                if (!c.collected) {
                    const d = dist(this.x, this.y, c.x, c.y);
                    if (d < this.magnetRadius) {
                        c.x += ((this.x - c.x) / d) * 160 * dt;
                        c.y += ((this.y - c.y) / d) * 160 * dt;
                    }
                }
            }
        }

        this.trail.push({ x: this.x, y: this.y, life: 0.3 });
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= dt;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }
    }

    draw(ctx, scale, offsetX, offsetY) {
        const px = this.x * scale + offsetX;
        const py = this.y * scale + offsetY;

        ctx.save();
        this.trail.forEach(t => {
            ctx.beginPath();
            ctx.arc(t.x * scale + offsetX, t.y * scale + offsetY, 4 * scale * (t.life / 0.3), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 243, 255, ${t.life})`;
            ctx.fill();
        });

        const gradient = ctx.createRadialGradient(px, py, 2 * scale, px, py, 28 * scale);
        gradient.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 28 * scale, 0, Math.PI * 2);
        ctx.fill();

        if (this.shields > 0) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5 * scale;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10 * scale;
            ctx.beginPath();
            ctx.arc(px, py, (this.radius + 6) * scale, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, py, this.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 14 * scale;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, this.radius * 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ==========================================
// 7. ENEMY ENTITY ROSTER & INTELLIGENT AI
// ==========================================
class Enemy {
    constructor(cfg, sectorNum = 1) {
        this.type = cfg.type || 'patrol';
        this.path = cfg.path || [{ x: cfg.x || 100, y: cfg.y || 100 }];
        this.x = this.path[0].x;
        this.y = this.path[0].y;
        this.targetIndex = 0;
        this.state = 'PATROL';
        this.alertTarget = null;
        this.alertTimer = 0;
        this.stunTimer = 0;
        this.scanPulse = 0;
        this.heading = 0;

        // Pathfinding cache
        this.currentNavPath = null;
        this.navPathTimer = 0;
        this.lastNavTarget = { x: 0, y: 0 };

        // Progressive Difficulty Scaling based on Sector Depth
        const diffScale = 1.0 + Math.min(0.65, (sectorNum - 1) * 0.022);
        this.hearingSensitivity = 1.0 + Math.min(0.5, (sectorNum - 1) * 0.018);

        if (this.type === 'phantom') {
            this.speed = (cfg.speed || 135) * diffScale;
            this.radius = 8;
        } else if (this.type === 'seeker') {
            this.speed = (cfg.speed || 85) * diffScale;
            this.radius = 9;
            this.pingTimer = 0;
        } else if (this.type === 'behemoth') {
            this.speed = (cfg.speed || 55) * diffScale;
            this.radius = 15;
            this.gravityPulseTimer = 0;
        } else if (this.type === 'jellyfish') {
            this.speed = (cfg.speed || 40);
            this.radius = 12;
            this.tentacleAnim = Math.random() * Math.PI;
        } else if (this.type === 'sonar_bat') {
            this.speed = (cfg.speed || 120) * diffScale;
            this.radius = 9;
            this.hearingRange = 450 * this.hearingSensitivity;
        } else if (this.type === 'miner') {
            this.speed = (cfg.speed || 75) * diffScale;
            this.radius = 10;
            this.mineDropTimer = 0;
        } else {
            this.speed = (cfg.speed || 80) * diffScale;
            this.radius = 9;
        }
    }

    reset() {
        this.x = this.path[0].x;
        this.y = this.path[0].y;
        this.targetIndex = 0;
        this.state = 'PATROL';
        this.alertTarget = null;
        this.alertTimer = 0;
        this.stunTimer = 0;
        this.currentNavPath = null;
        this.navPathTimer = 0;
    }

    update(dt, player, walls, waves, decoys, floatingMines, onAlertCallback, navGrid) {
        this.scanPulse = (this.scanPulse + dt * 3.5) % (Math.PI * 2);
        if (this.navPathTimer > 0) this.navPathTimer -= dt;

        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            this.state = 'STUNNED';
            if (this.stunTimer <= 0) {
                this.state = 'PATROL';
                this.alertTarget = null;
                this.currentNavPath = null;
            }
            return;
        }

        const distToPlayer = dist(this.x, this.y, player.x, player.y);
        const hasLOS = (this.type !== 'sonar_bat') ? isLineOfSightClear(this.x, this.y, player.x, player.y, walls) : false;

        // 1. Vision Trigger
        if (distToPlayer < 155 && hasLOS && this.type !== 'jellyfish') {
            if (this.state !== 'CHASE') {
                playAlertSound();
                if (onAlertCallback) onAlertCallback();
            }
            this.state = 'CHASE';
        } else if (this.state === 'CHASE') {
            this.state = 'ALERT';
            this.alertTarget = { x: player.x, y: player.y };
            this.alertTimer = 2.6;
        }

        // 2. Acoustic Soundwave Listener Trigger
        if (this.type !== 'jellyfish') {
            const baseHearing = (this.type === 'sonar_bat') ? 48 : 30;
            const hearingThreshold = baseHearing * player.stealthFactor * this.hearingSensitivity;
            for (let wave of waves) {
                if (wave.color === '#00f3ff') {
                    const dToWave = dist(this.x, this.y, wave.x, wave.y);
                    if (Math.abs(dToWave - wave.radius) < hearingThreshold && this.state !== 'CHASE') {
                        if (this.state === 'PATROL') {
                            if (this.type === 'sonar_bat') playBatScreechSound();
                            else playAlertSound();
                            if (onAlertCallback) onAlertCallback();
                        }
                        this.state = 'ALERT';
                        this.alertTarget = { x: wave.x, y: wave.y };
                        this.alertTimer = (this.type === 'phantom') ? 3.8 : 2.8;
                        this.currentNavPath = null;
                    }
                }
            }
        }

        // 3. Smart Seeker Active Ping Ability
        if (this.type === 'seeker') {
            this.pingTimer += dt;
            if (this.pingTimer >= 2.5) {
                this.pingTimer = 0;
                waves.push(new Wave(this.x, this.y, 220, '#10b981'));
                playSeekerPingSound();
            }
        }

        // 4. Mine Layer Proximity Mine Drop
        if (this.type === 'miner' && floatingMines) {
            this.mineDropTimer += dt;
            if (this.mineDropTimer >= 4.0 && floatingMines.length < 15) {
                this.mineDropTimer = 0;
                floatingMines.push(new FloatingMine(this.x, this.y));
            }
        }

        // 5. Behemoth Gravity Shockwave
        if (this.type === 'behemoth') {
            this.gravityPulseTimer += dt;
            if (this.gravityPulseTimer >= 4.5) {
                this.gravityPulseTimer = 0;
                waves.push(new Wave(this.x, this.y, 180, '#f97316'));
                if (distToPlayer < 90) {
                    player.battery = Math.max(0, player.battery - 25);
                }
            }
        }

        // 6. Decoy Lure Trigger
        let activeDecoyTarget = null;
        if (decoys && decoys.length > 0 && this.type !== 'jellyfish') {
            let closestDecoy = null;
            let minD = 340;
            for (let d of decoys) {
                const distToDecoy = dist(this.x, this.y, d.x, d.y);
                if (distToDecoy < minD) {
                    minD = distToDecoy;
                    closestDecoy = d;
                }
            }

            if (closestDecoy) {
                activeDecoyTarget = closestDecoy;
                if (minD < 22) {
                    closestDecoy.detonate([this], waves);
                    return;
                }
            }
        }

        // 7. Intelligent Target Resolution
        let rawTarget = null;
        let moveSpeed = this.speed;

        if (activeDecoyTarget) {
            rawTarget = { x: activeDecoyTarget.x, y: activeDecoyTarget.y };
            moveSpeed = this.speed * 1.35;
        } else if (this.state === 'CHASE') {
            rawTarget = { x: player.x, y: player.y };
            moveSpeed = this.speed * (this.type === 'phantom' ? 1.65 : 1.45);
        } else if (this.state === 'ALERT') {
            rawTarget = this.alertTarget;
            moveSpeed = this.speed * 1.3;

            if (rawTarget && dist(this.x, this.y, rawTarget.x, rawTarget.y) < 16) {
                this.alertTimer -= dt;
                if (this.alertTimer <= 0) {
                    this.state = 'PATROL';
                    this.alertTarget = null;
                    this.currentNavPath = null;
                }
            }
        } else {
            rawTarget = this.path[this.targetIndex];
            moveSpeed = this.speed;

            if (dist(this.x, this.y, rawTarget.x, rawTarget.y) < 10) {
                this.targetIndex = (this.targetIndex + 1) % this.path.length;
                rawTarget = this.path[this.targetIndex];
            }
        }

        if (!rawTarget) return;

        // 8. Smart Obstacle Avoidance & Pathfinding
        let steerTarget = rawTarget;
        const directLOS = isLineOfSightClear(this.x, this.y, rawTarget.x, rawTarget.y, walls);

        if (!directLOS && navGrid && this.type !== 'jellyfish') {
            const needRecompute = !this.currentNavPath || this.currentNavPath.length === 0 ||
                this.navPathTimer <= 0 ||
                distSq(rawTarget.x, rawTarget.y, this.lastNavTarget.x, this.lastNavTarget.y) > 45 * 45;

            if (needRecompute) {
                this.currentNavPath = navGrid.findPath(this.x, this.y, rawTarget.x, rawTarget.y);
                this.lastNavTarget = { x: rawTarget.x, y: rawTarget.y };
                this.navPathTimer = 0.45;
            }

            if (this.currentNavPath && this.currentNavPath.length > 0) {
                if (dist(this.x, this.y, this.currentNavPath[0].x, this.currentNavPath[0].y) < 22) {
                    this.currentNavPath.shift();
                }
                if (this.currentNavPath.length > 0) {
                    steerTarget = this.currentNavPath[0];
                }
            }
        } else {
            this.currentNavPath = null;
        }

        // 9. Whisker / Feeler Steering (Never Ram Walls!)
        const desiredAngle = Math.atan2(steerTarget.y - this.y, steerTarget.x - this.x);
        let steerAngle = desiredAngle;

        // Feeler whiskers
        const feelerDist = 20;
        let leftFeelerHit = false;
        let rightFeelerHit = false;

        const leftFx = this.x + Math.cos(desiredAngle - 0.45) * feelerDist;
        const leftFy = this.y + Math.sin(desiredAngle - 0.45) * feelerDist;
        const rightFx = this.x + Math.cos(desiredAngle + 0.45) * feelerDist;
        const rightFy = this.y + Math.sin(desiredAngle + 0.45) * feelerDist;

        for (let w of walls) {
            if (!leftFeelerHit) {
                const cp = getClosestPointOnSegment(leftFx, leftFy, w.x1, w.y1, w.x2, w.y2);
                if (distSq(leftFx, leftFy, cp.x, cp.y) < 100) leftFeelerHit = true;
            }
            if (!rightFeelerHit) {
                const cp = getClosestPointOnSegment(rightFx, rightFy, w.x1, w.y1, w.x2, w.y2);
                if (distSq(rightFx, rightFy, cp.x, cp.y) < 100) rightFeelerHit = true;
            }
        }

        if (leftFeelerHit && !rightFeelerHit) {
            steerAngle += 0.55;
        } else if (rightFeelerHit && !leftFeelerHit) {
            steerAngle -= 0.55;
        }

        let diff = steerAngle - this.heading;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.heading += diff * Math.min(1.0, dt * 12);

        const prevX = this.x;
        const prevY = this.y;
        this.x += Math.cos(this.heading) * moveSpeed * dt;
        this.y += Math.sin(this.heading) * moveSpeed * dt;
        resolveContinuousCollision(this, prevX, prevY, walls);
    }

    draw(ctx, scale, offsetX, offsetY, forceVisible) {
        const ex = this.x * scale + offsetX;
        const ey = this.y * scale + offsetY;

        ctx.save();
        const pulseR = (this.radius + 6 + Math.sin(this.scanPulse) * 4) * scale;

        if (this.type === 'phantom') {
            ctx.beginPath();
            ctx.arc(ex, ey, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = this.state === 'STUNNED' ? 'rgba(168, 85, 247, 0.3)' : (this.state === 'CHASE' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(192, 132, 252, 0.2)');
            ctx.fill();

            ctx.fillStyle = this.state === 'CHASE' ? '#ef4444' : '#c084fc';
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 12 * scale;
            ctx.beginPath();
            ctx.moveTo(ex, ey - this.radius * scale);
            ctx.lineTo(ex + this.radius * scale, ey + this.radius * scale);
            ctx.lineTo(ex - this.radius * scale, ey + this.radius * scale);
            ctx.closePath();
            ctx.fill();

        } else if (this.type === 'seeker') {
            ctx.beginPath();
            ctx.arc(ex, ey, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = this.state === 'CHASE' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.2)';
            ctx.fill();

            ctx.fillStyle = this.state === 'CHASE' ? '#ef4444' : '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 12 * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, (this.radius + 3) * scale, this.scanPulse, this.scanPulse + 1.2);
            ctx.stroke();

        } else if (this.type === 'behemoth') {
            ctx.beginPath();
            ctx.arc(ex, ey, pulseR * 1.3, 0, Math.PI * 2);
            ctx.fillStyle = this.state === 'STUNNED' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(249, 115, 22, 0.25)';
            ctx.fill();

            ctx.fillStyle = '#f97316';
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 14 * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex, ey, 4 * scale, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'jellyfish') {
            this.tentacleAnim = (this.tentacleAnim || 0) + 0.05;
            ctx.beginPath();
            ctx.arc(ex, ey, (this.radius + 6) * scale, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fill();

            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12 * scale;
            ctx.beginPath();
            ctx.arc(ex, ey - 2 * scale, this.radius * scale, Math.PI, 0);
            ctx.fill();

            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 1.5 * scale;
            for (let i = -8; i <= 8; i += 4) {
                ctx.beginPath();
                ctx.moveTo(ex + i * scale, ey);
                ctx.quadraticCurveTo(ex + (i + Math.sin(this.tentacleAnim + i) * 5) * scale, ey + 10 * scale, ex + (i - Math.cos(this.tentacleAnim) * 3) * scale, ey + 16 * scale);
                ctx.stroke();
            }

        } else if (this.type === 'sonar_bat') {
            ctx.beginPath();
            ctx.arc(ex, ey, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(217, 70, 239, 0.25)';
            ctx.fill();

            ctx.fillStyle = '#d946ef';
            ctx.shadowColor = '#d946ef';
            ctx.shadowBlur = 12 * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#f0abfc';
            ctx.lineWidth = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(ex - 12 * scale, ey);
            ctx.lineTo(ex - 5 * scale, ey - 6 * scale);
            ctx.moveTo(ex + 12 * scale, ey);
            ctx.lineTo(ex + 5 * scale, ey - 6 * scale);
            ctx.stroke();

        } else if (this.type === 'miner') {
            ctx.beginPath();
            ctx.arc(ex, ey, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
            ctx.fill();

            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 10 * scale;
            ctx.fillRect(ex - 8 * scale, ey - 8 * scale, 16 * scale, 16 * scale);

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex, ey, 3 * scale, 0, Math.PI * 2);
            ctx.fill();

        } else {
            ctx.beginPath();
            ctx.arc(ex, ey, pulseR, 0, Math.PI * 2);
            ctx.fillStyle = this.state === 'STUNNED' ? 'rgba(168, 85, 247, 0.3)' : (this.state === 'CHASE' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(239, 68, 68, 0.2)');
            ctx.fill();

            ctx.beginPath();
            ctx.arc(ex, ey, this.radius * scale, 0, Math.PI * 2);
            ctx.fillStyle = this.state === 'STUNNED' ? '#a855f7' : (this.state === 'CHASE' ? '#ef4444' : (this.state === 'ALERT' ? '#f97316' : '#dc2626'));
            ctx.shadowColor = this.state === 'STUNNED' ? '#a855f7' : '#ef4444';
            ctx.shadowBlur = 12 * scale;
            ctx.fill();
        }

        if (this.state === 'STUNNED') {
            ctx.fillStyle = '#c084fc';
            ctx.font = `bold ${Math.round(14 * scale)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('⚡', ex, ey - 14 * scale);
        } else if (this.state === 'ALERT') {
            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold ${Math.round(15 * scale)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('!', ex, ey - 14 * scale);
        } else if (this.state === 'CHASE') {
            ctx.fillStyle = '#ef4444';
            ctx.font = `bold ${Math.round(15 * scale)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('!!', ex, ey - 14 * scale);
        }
        ctx.restore();
    }
}

// ==========================================
// 8. PROCEDURAL LEVEL GENERATOR (SECTOR 25+)
// ==========================================
function generateProceduralLevel(sectorNumber) {
    let seed = sectorNumber * 1337 + 42;
    const rnd = () => {
        seed++;
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const depth = sectorNumber * 160;
    const titleKey = `procTitle_${sectorNumber}`;
    const hintKey = `procHint_${sectorNumber}`;

    TRANSLATIONS.ru[titleKey] = `Аномалия Бездны (Глубина ${depth}м) 🌌`;
    TRANSLATIONS.ru[hintKey] = `Сектор #${sectorNumber}: процедурная глубоководная зона!`;
    TRANSLATIONS.en[titleKey] = `Abyss Anomaly (Depth ${depth}m) 🌌`;
    TRANSLATIONS.en[hintKey] = `Sector #${sectorNumber}: Procedurally generated abyssal trench!`;

    const startTop = rnd() > 0.5;
    const playerStart = { x: 80, y: startTop ? 80 : 470 };
    const exit = { x: 740, y: startTop ? 470 : 80, radius: 18 };

    const walls = [
        { x1: 40, y1: 40, x2: 800, y2: 40 },
        { x1: 800, y1: 40, x2: 800, y2: 520 },
        { x1: 800, y1: 520, x2: 40, y2: 520 },
        { x1: 40, y1: 520, x2: 40, y2: 40 }
    ];

    // Architectural Template Variation
    const templateType = sectorNumber % 5;

    if (templateType === 0) {
        // Multi-Room Compartment
        walls.push({ x1: 280, y1: 40, x2: 280, y2: 230 });
        walls.push({ x1: 280, y1: 330, x2: 280, y2: 520 });
        walls.push({ x1: 540, y1: 40, x2: 540, y2: 230 });
        walls.push({ x1: 540, y1: 330, x2: 540, y2: 520 });
        walls.push({ x1: 280, y1: 280, x2: 540, y2: 280 });
    } else if (templateType === 1) {
        // Crosshair Nexus
        walls.push({ x1: 180, y1: 180, x2: 660, y2: 180 });
        walls.push({ x1: 180, y1: 380, x2: 660, y2: 380 });
        walls.push({ x1: 420, y1: 40, x2: 420, y2: 180 });
        walls.push({ x1: 420, y1: 380, x2: 420, y2: 520 });
    } else if (templateType === 2) {
        // Serpentine S-Channels
        walls.push({ x1: 200, y1: 40, x2: 200, y2: 380 });
        walls.push({ x1: 420, y1: 180, x2: 420, y2: 520 });
        walls.push({ x1: 620, y1: 40, x2: 620, y2: 380 });
    } else if (templateType === 3) {
        // Fortress Pillars
        walls.push({ x1: 220, y1: 140, x2: 320, y2: 140 });
        walls.push({ x1: 220, y1: 420, x2: 320, y2: 420 });
        walls.push({ x1: 520, y1: 140, x2: 620, y2: 140 });
        walls.push({ x1: 520, y1: 420, x2: 620, y2: 420 });
        walls.push({ x1: 370, y1: 240, x2: 470, y2: 240 });
        walls.push({ x1: 370, y1: 320, x2: 470, y2: 320 });
    } else {
        // Partitioned Corridors
        const numPartitions = 3 + Math.floor(rnd() * 2);
        for (let p = 0; p < numPartitions; p++) {
            const px = 180 + p * 150 + Math.floor(rnd() * 30 - 15);
            const gapY = 120 + Math.floor(rnd() * 280);
            walls.push({ x1: px, y1: 40, x2: px, y2: Math.max(50, gapY - 55) });
            walls.push({ x1: px, y1: Math.min(510, gapY + 55), x2: px, y2: 520 });
        }
    }

    const allEnemyTypes = ['patrol', 'phantom', 'seeker', 'behemoth', 'jellyfish', 'sonar_bat', 'miner'];
    const enemyCount = Math.min(8, 4 + Math.floor((sectorNumber - 25) / 2));
    const enemies = [];

    for (let e = 0; e < enemyCount; e++) {
        const typeIndex = Math.floor(rnd() * allEnemyTypes.length);
        const type = allEnemyTypes[typeIndex];
        const ex = 160 + Math.floor(rnd() * 560);
        const ey1 = 80 + Math.floor(rnd() * 120);
        const ey2 = 360 + Math.floor(rnd() * 120);
        const speed = (type === 'phantom') ? 140 : ((type === 'behemoth') ? 55 : ((type === 'jellyfish') ? 45 : 95));

        enemies.push({
            type,
            path: [{ x: ex, y: ey1 }, { x: ex, y: ey2 }],
            speed: speed + Math.min(30, (sectorNumber - 25) * 2)
        });
    }

    const crystals = [];
    const crystalCount = 3 + Math.floor(rnd() * 3);
    for (let c = 0; c < crystalCount; c++) {
        crystals.push({
            x: 120 + Math.floor(rnd() * 600),
            y: 80 + Math.floor(rnd() * 400)
        });
    }

    const movingGates = [];
    if (rnd() > 0.3) {
        const gx = 250 + Math.floor(rnd() * 350);
        movingGates.push(new MovingGate(gx, 100, gx, 220, 1.2 + rnd() * 0.6, 60 + rnd() * 40, 'y'));
    }

    const tripwires = [];
    const numLasers = 1 + Math.floor(rnd() * 3);
    for (let l = 0; l < numLasers; l++) {
        const lx1 = 100 + Math.floor(rnd() * 600);
        const ly = 120 + Math.floor(rnd() * 300);
        tripwires.push(new LaserTripwire(lx1, ly, Math.min(760, lx1 + 140), ly, true, 2.5 + rnd() * 1.5));
    }

    const turrets = [];
    if (rnd() > 0.4) {
        turrets.push(new SonarTurret(250 + Math.floor(rnd() * 350), 100 + Math.floor(rnd() * 350), 2.5 + rnd() * 1.0, 280));
    }

    const currents = [];
    if (rnd() > 0.4) {
        currents.push(new WaterCurrentZone(200 + Math.floor(rnd() * 300), 40, 140, 480, 0, (rnd() > 0.5 ? 80 : -80)));
    }

    return {
        id: sectorNumber,
        titleKey,
        hintKey,
        playerStart,
        exit,
        walls,
        enemies,
        crystals,
        tripwires,
        turrets,
        movingGates,
        currents,
        isProcedural: true
    };
}

// Handcrafted 1-24 Sectors
function generateHandcraftedLevels() {
    const levels = [];

    // Sector 1: First Impulse (Training)
    levels.push({
        id: 1, titleKey: "s1Title", hintKey: "s1Hint",
        playerStart: { x: 80, y: 100 }, exit: { x: 730, y: 450, radius: 18 },
        walls: [
            { x1: 50, y1: 50, x2: 800, y2: 50 }, { x1: 800, y1: 50, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 50, y2: 520 }, { x1: 50, y1: 520, x2: 50, y2: 50 },
            { x1: 50, y1: 170, x2: 650, y2: 170 }, { x1: 200, y1: 290, x2: 800, y2: 290 }, { x1: 50, y1: 410, x2: 650, y2: 410 }
        ],
        crystals: [{ x: 600, y: 110 }, { x: 250, y: 230 }, { x: 700, y: 350 }],
        enemies: [], movingGates: [], currents: [], tripwires: [], turrets: []
    });

    // Sector 2: Acoustic Sensor (S-Curve Obstacle Evasion)
    levels.push({
        id: 2, titleKey: "s2Title", hintKey: "s2Hint",
        playerStart: { x: 90, y: 90 }, exit: { x: 740, y: 470, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 240, y1: 40, x2: 240, y2: 380 }, { x1: 450, y1: 180, x2: 450, y2: 520 }, { x1: 620, y1: 40, x2: 620, y2: 380 }
        ],
        crystals: [{ x: 340, y: 120 }, { x: 530, y: 460 }],
        enemies: [{ type: 'patrol', path: [{ x: 530, y: 120 }, { x: 530, y: 440 }], speed: 80 }],
        movingGates: [], currents: [], tripwires: [], turrets: []
    });

    // Sector 3: Dual Patrol (Central Pillar Layout)
    levels.push({
        id: 3, titleKey: "s3Title", hintKey: "s3Hint",
        playerStart: { x: 90, y: 90 }, exit: { x: 730, y: 90, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 200, y1: 40, x2: 200, y2: 360 }, { x1: 380, y1: 180, x2: 380, y2: 520 },
            { x1: 560, y1: 40, x2: 560, y2: 360 }, { x1: 200, y1: 440, x2: 560, y2: 440 }
        ],
        crystals: [{ x: 290, y: 480 }, { x: 470, y: 80 }, { x: 670, y: 300 }],
        enemies: [
            { type: 'patrol', path: [{ x: 290, y: 100 }, { x: 290, y: 400 }], speed: 80 },
            { type: 'patrol', path: [{ x: 470, y: 400 }, { x: 470, y: 100 }], speed: 80 }
        ],
        movingGates: [], currents: [], tripwires: [], turrets: []
    });

    // Sector 4: Jellyfish Reef
    levels.push({
        id: 4, titleKey: "s4Title", hintKey: "s4Hint",
        playerStart: { x: 80, y: 80 }, exit: { x: 740, y: 470, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 160, y1: 40, x2: 160, y2: 400 }, { x1: 280, y1: 160, x2: 280, y2: 520 },
            { x1: 400, y1: 40, x2: 400, y2: 400 }, { x1: 520, y1: 160, x2: 520, y2: 520 }, { x1: 640, y1: 40, x2: 640, y2: 400 }
        ],
        crystals: [{ x: 220, y: 460 }, { x: 460, y: 90 }, { x: 700, y: 100 }],
        enemies: [
            { type: 'jellyfish', path: [{ x: 220, y: 200 }, { x: 220, y: 360 }], speed: 45 },
            { type: 'jellyfish', path: [{ x: 340, y: 360 }, { x: 340, y: 200 }], speed: 45 },
            { type: 'patrol', path: [{ x: 580, y: 100 }, { x: 580, y: 440 }], speed: 85 }
        ],
        movingGates: [], currents: [], tripwires: [], turrets: []
    });

    // Sector 5: Hydro-Turbine
    levels.push({
        id: 5, titleKey: "s5Title", hintKey: "s5Hint",
        playerStart: { x: 80, y: 80 }, exit: { x: 730, y: 470, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 250, y1: 40, x2: 250, y2: 360 }, { x1: 500, y1: 200, x2: 500, y2: 520 }
        ],
        crystals: [{ x: 380, y: 150 }, { x: 380, y: 400 }],
        enemies: [
            { type: 'jellyfish', path: [{ x: 380, y: 150 }, { x: 380, y: 350 }], speed: 50 },
            { type: 'patrol', path: [{ x: 620, y: 100 }, { x: 620, y: 450 }], speed: 90 }
        ],
        movingGates: [], currents: [new WaterCurrentZone(260, 40, 230, 480, 0, 80)],
        tripwires: [], turrets: []
    });

    // Sector 6: Mine Depot
    levels.push({
        id: 6, titleKey: "s6Title", hintKey: "s6Hint",
        playerStart: { x: 90, y: 90 }, exit: { x: 730, y: 450, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 300, y1: 40, x2: 300, y2: 200 }, { x1: 300, y1: 360, x2: 300, y2: 520 },
            { x1: 550, y1: 40, x2: 550, y2: 200 }, { x1: 550, y1: 360, x2: 550, y2: 520 }
        ],
        crystals: [{ x: 420, y: 280 }, { x: 680, y: 120 }],
        enemies: [{ type: 'miner', path: [{ x: 420, y: 100 }, { x: 420, y: 450 }], speed: 80 }],
        movingGates: [
            new MovingGate(300, 200, 300, 360, 1.2, 80, 'y'),
            new MovingGate(550, 200, 550, 360, 1.4, 80, 'y')
        ],
        currents: [], tripwires: [], turrets: []
    });

    // Sector 7: Phantom Interceptor
    levels.push({
        id: 7, titleKey: "s7Title", hintKey: "s7Hint",
        playerStart: { x: 80, y: 470 }, exit: { x: 740, y: 80, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 220, y1: 180, x2: 640, y2: 180 }, { x1: 220, y1: 360, x2: 640, y2: 360 }
        ],
        crystals: [{ x: 420, y: 270 }, { x: 720, y: 470 }],
        enemies: [
            { type: 'phantom', path: [{ x: 250, y: 100 }, { x: 600, y: 100 }], speed: 130 },
            { type: 'patrol', path: [{ x: 600, y: 450 }, { x: 250, y: 450 }], speed: 90 }
        ],
        tripwires: [
            new LaserTripwire(40, 270, 220, 270, true, 3.5),
            new LaserTripwire(640, 270, 800, 270, true, 3.5)
        ],
        movingGates: [], currents: [], turrets: []
    });

    // Sector 8: Sonar Fortress
    levels.push({
        id: 8, titleKey: "s8Title", hintKey: "s8Hint",
        playerStart: { x: 80, y: 80 }, exit: { x: 740, y: 480, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 380, y1: 40, x2: 380, y2: 300 }, { x1: 460, y1: 260, x2: 460, y2: 520 }
        ],
        crystals: [{ x: 200, y: 420 }, { x: 600, y: 120 }],
        enemies: [{ type: 'phantom', path: [{ x: 620, y: 200 }, { x: 620, y: 450 }], speed: 125 }],
        turrets: [new SonarTurret(420, 150, 3.2, 280)],
        movingGates: [], currents: [], tripwires: []
    });

    // Sector 9: Seeker Spiral
    levels.push({
        id: 9, titleKey: "s9Title", hintKey: "s9Hint",
        playerStart: { x: 80, y: 80 }, exit: { x: 740, y: 470, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 200, y1: 40, x2: 200, y2: 380 }, { x1: 400, y1: 160, x2: 400, y2: 520 }, { x1: 600, y1: 40, x2: 600, y2: 380 }
        ],
        crystals: [{ x: 300, y: 280 }, { x: 500, y: 280 }, { x: 120, y: 440 }],
        enemies: [
            { type: 'seeker', path: [{ x: 300, y: 100 }, { x: 300, y: 440 }], speed: 85 },
            { type: 'phantom', path: [{ x: 500, y: 440 }, { x: 500, y: 100 }], speed: 120 }
        ],
        movingGates: [new MovingGate(200, 380, 200, 520, 1.5, 60, 'y')],
        currents: [], tripwires: [], turrets: []
    });

    // Sector 10: Abyss Gateway Tier 1 Boss
    levels.push({
        id: 10, titleKey: "s10Title", hintKey: "s10Hint",
        playerStart: { x: 80, y: 80 }, exit: { x: 740, y: 470, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 160, y1: 140, x2: 320, y2: 140 }, { x1: 320, y1: 140, x2: 320, y2: 280 }, { x1: 160, y1: 280, x2: 320, y2: 280 },
            { x1: 500, y1: 140, x2: 680, y2: 140 }, { x1: 500, y1: 140, x2: 500, y2: 280 }, { x1: 500, y1: 280, x2: 680, y2: 280 },
            { x1: 260, y1: 380, x2: 580, y2: 380 }
        ],
        crystals: [{ x: 420, y: 100 }, { x: 420, y: 460 }, { x: 720, y: 100 }],
        enemies: [
            { type: 'seeker', path: [{ x: 100, y: 200 }, { x: 400, y: 200 }, { x: 400, y: 450 }], speed: 90 },
            { type: 'phantom', path: [{ x: 720, y: 200 }, { x: 440, y: 200 }, { x: 720, y: 350 }], speed: 125 },
            { type: 'miner', path: [{ x: 200, y: 460 }, { x: 650, y: 460 }], speed: 90 }
        ],
        tripwires: [new LaserTripwire(320, 280, 500, 280, true, 4.0)],
        turrets: [new SonarTurret(420, 210, 3.5, 260)],
        movingGates: [], currents: []
    });

    // Sector 11: Acoustic Caverns (Sonar Bat)
    levels.push({
        id: 11, titleKey: "s11Title", hintKey: "s11Hint",
        playerStart: { x: 80, y: 470 }, exit: { x: 740, y: 80, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 200, y1: 120, x2: 600, y2: 120 }, { x1: 200, y1: 400, x2: 600, y2: 400 }
        ],
        crystals: [{ x: 400, y: 260 }, { x: 700, y: 460 }],
        enemies: [
            { type: 'sonar_bat', path: [{ x: 300, y: 260 }, { x: 500, y: 260 }], speed: 120 },
            { type: 'jellyfish', path: [{ x: 200, y: 260 }, { x: 200, y: 150 }], speed: 45 }
        ],
        movingGates: [], currents: [], tripwires: [], turrets: []
    });

    // Sector 12: Juggernaut Lock
    levels.push({
        id: 12, titleKey: "s12Title", hintKey: "s12Hint",
        playerStart: { x: 80, y: 80 }, exit: { x: 740, y: 470, radius: 18 },
        walls: [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 380, y1: 40, x2: 380, y2: 320 }, { x1: 460, y1: 240, x2: 460, y2: 520 }
        ],
        crystals: [{ x: 220, y: 450 }, { x: 600, y: 100 }],
        enemies: [
            { type: 'behemoth', path: [{ x: 420, y: 100 }, { x: 420, y: 450 }], speed: 55 },
            { type: 'phantom', path: [{ x: 600, y: 440 }, { x: 600, y: 120 }], speed: 130 }
        ],
        turrets: [new SonarTurret(420, 50, 3.2, 260)],
        tripwires: [new LaserTripwire(40, 260, 200, 260, true, 3.0)],
        movingGates: [], currents: []
    });

    // Sectors 13 to 24 (Handcrafted Advanced Abyss Mixes)
    const enemyTypesSeq = [
        ['jellyfish', 'phantom', 'sonar_bat'],
        ['behemoth', 'miner', 'seeker'],
        ['seeker', 'phantom', 'sonar_bat'],
        ['phantom', 'phantom', 'jellyfish'],
        ['behemoth', 'behemoth', 'miner'],
        ['sonar_bat', 'sonar_bat', 'phantom'],
        ['miner', 'seeker', 'jellyfish'],
        ['behemoth', 'seeker', 'sonar_bat'],
        ['sonar_bat', 'sonar_bat', 'sonar_bat'],
        ['phantom', 'jellyfish', 'miner', 'seeker'],
        ['behemoth', 'seeker', 'phantom'],
        ['phantom', 'sonar_bat', 'miner']
    ];

    for (let i = 13; i <= 24; i++) {
        const titleKey = `s${i}Title`;
        const hintKey = `s${i}Hint`;
        const startX = 80;
        const startY = (i % 2 === 0) ? 80 : 470;
        const exitX = 740;
        const exitY = (i % 2 === 0) ? 470 : 80;

        const walls = [
            { x1: 40, y1: 40, x2: 800, y2: 40 }, { x1: 800, y1: 40, x2: 800, y2: 520 },
            { x1: 800, y1: 520, x2: 40, y2: 520 }, { x1: 40, y1: 520, x2: 40, y2: 40 },
            { x1: 180 + (i % 3) * 30, y1: 40, x2: 180 + (i % 3) * 30, y2: 360 },
            { x1: 380, y1: 160, x2: 380, y2: 520 },
            { x1: 580 - (i % 3) * 20, y1: 40, x2: 580 - (i % 3) * 20, y2: 360 }
        ];

        const assignedTypes = enemyTypesSeq[(i - 13) % enemyTypesSeq.length];
        const enemies = assignedTypes.map((t, idx) => {
            const px = 220 + idx * 200;
            return {
                type: t,
                path: [{ x: px, y: 100 }, { x: px, y: 440 }],
                speed: (t === 'phantom') ? 135 : ((t === 'behemoth') ? 55 : ((t === 'jellyfish') ? 45 : 90))
            };
        });

        const crystals = [
            { x: 120, y: 280 },
            { x: 380, y: 80 },
            { x: 580, y: 460 },
            { x: 720, y: 260 }
        ];

        const tripwires = [];
        if (i >= 14) tripwires.push(new LaserTripwire(40, 260, 180, 260, true, 3.0));
        if (i >= 16) tripwires.push(new LaserTripwire(580, 260, 800, 260, true, 3.0));

        const turrets = [];
        if (i >= 15) turrets.push(new SonarTurret(380, 90, 3.0, 300));
        if (i >= 20) turrets.push(new SonarTurret(480, 300, 2.5, 300));

        const movingGates = [];
        if (i >= 14) movingGates.push(new MovingGate(380, 40, 380, 160, 1.3, 60, 'y'));

        const currents = [];
        if (i % 2 === 1) currents.push(new WaterCurrentZone(220, 40, 140, 480, 0, 75));

        levels.push({
            id: i,
            titleKey,
            hintKey,
            playerStart: { x: startX, y: startY },
            exit: { x: exitX, y: exitY, radius: 18 },
            walls,
            enemies,
            crystals,
            tripwires,
            turrets,
            movingGates,
            currents
        });
    }

    return levels;
}

const HANDCRAFTED_LEVELS = generateHandcraftedLevels();

// ==========================================
// 9. MAIN GAME ENGINE & MONETIZATION
// ==========================================
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.currentLevelIndex = 0;
        this.crystalsBank = 0;
        this.levelStars = {};
        this.upgrades = {
            range: 0,
            speed: 0,
            stealth: 0,
            shield: 0,
            battery: 0,
            magnet: 0
        };
        this.loadSaveData();

        this.level = null;
        this.player = null;
        this.enemies = [];
        this.waves = [];
        this.litSegments = [];
        this.crystals = [];
        this.movingGates = [];
        this.currents = [];
        this.tripwires = [];
        this.turrets = [];
        this.decoys = [];
        this.floatingMines = [];
        this.navGrid = null;

        this.hadAlertThisSector = false;
        this.sectorCoinsEarned = 0;

        this.gameState = 'PLAYING';
        this.sonarTimer = 0;
        this.decoyCharges = 0;
        this.rewardedRespawnUsedThisLevel = false;

        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.keys = {};
        this.touchJoystick = { active: false, startX: 0, startY: 0, currX: 0, currY: 0 };
        
        this.echoButtonBounds = { x: 0, y: 0, radius: 38 };
        this.sonarButtonBounds = { x: 0, y: 0, w: 120, h: 36 };
        this.decoyButtonBounds = { x: 0, y: 0, w: 120, h: 36 };
        this.shieldButtonBounds = { x: 0, y: 0, w: 120, h: 36 };
        this.upgradeMenuButtonBounds = { x: 0, y: 0, w: 125, h: 30 };
        this.muteButtonBounds = { x: 0, y: 0, w: 34, h: 30 };

        this.respawnButtonBounds = { x: 0, y: 0, w: 220, h: 48 };
        this.restartButtonBounds = { x: 0, y: 0, w: 160, h: 48 };
        this.nextLevelButtonBounds = { x: 0, y: 0, w: 220, h: 48 };
        this.doubleRewardButtonBounds = { x: 0, y: 0, w: 240, h: 48 };
        this.closeUpgradesButtonBounds = { x: 0, y: 0, w: 200, h: 46 };

        this.exitPulse = 0;
        this.lastTime = performance.now();

        this.bindEvents();
        this.resize();
        this.loadLevel(this.currentLevelIndex);
    }

    loadSaveData() {
        try {
            const raw = localStorage.getItem('echo_sonar_save_v4');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.crystalsBank) this.crystalsBank = data.crystalsBank;
                if (data.levelStars) this.levelStars = data.levelStars;
                if (data.upgrades) this.upgrades = Object.assign(this.upgrades, data.upgrades);
                if (data.currentLevelIndex !== undefined) this.currentLevelIndex = data.currentLevelIndex;
            }
        } catch (e) {}
    }

    saveGameData() {
        try {
            const data = {
                crystalsBank: this.crystalsBank,
                levelStars: this.levelStars,
                upgrades: this.upgrades,
                currentLevelIndex: this.currentLevelIndex
            };
            localStorage.setItem('echo_sonar_save_v4', JSON.stringify(data));
        } catch (e) {}
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;

        const vWidth = 840;
        const vHeight = 560;

        const scaleX = this.canvas.width / vWidth;
        const scaleY = this.canvas.height / vHeight;
        this.scale = Math.min(scaleX, scaleY) * 0.94;

        this.offsetX = (this.canvas.width - vWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - vHeight * this.scale) / 2;

        const W = this.canvas.width;
        const H = this.canvas.height;

        // Echo floating ping button at bottom right
        this.echoButtonBounds = {
            x: W - 58 * dpr,
            y: H - 58 * dpr,
            radius: 34 * dpr
        };

        // Header controls (top right)
        this.muteButtonBounds = {
            x: W - 38 * dpr,
            y: 7 * dpr,
            w: 30 * dpr,
            h: 30 * dpr
        };

        this.upgradeMenuButtonBounds = {
            x: W - 74 * dpr,
            y: 7 * dpr,
            w: 32 * dpr,
            h: 30 * dpr
        };

        // Ability buttons layout (responsive)
        if (W >= 660 * dpr) {
            // Wide screens: Place on top bar
            const btnH = 30 * dpr;
            this.sonarButtonBounds = {
                x: W - 170 * dpr,
                y: 7 * dpr,
                w: 88 * dpr,
                h: btnH
            };
            this.decoyButtonBounds = {
                x: W - 276 * dpr,
                y: 7 * dpr,
                w: 100 * dpr,
                h: btnH
            };
            this.shieldButtonBounds = {
                x: W - 364 * dpr,
                y: 7 * dpr,
                w: 82 * dpr,
                h: btnH
            };
        } else {
            // Narrow screens / iframes / mobile: Dock at bottom left, safely separated from echo button!
            const actY = H - 46 * dpr;
            const actH = 34 * dpr;
            const availableW = Math.max(200 * dpr, W - 110 * dpr);
            const btnW = Math.min(96 * dpr, Math.floor((availableW - 16 * dpr) / 3));

            this.shieldButtonBounds = {
                x: 12 * dpr,
                y: actY,
                w: btnW,
                h: actH
            };
            this.decoyButtonBounds = {
                x: 12 * dpr + btnW + 6 * dpr,
                y: actY,
                w: btnW,
                h: actH
            };
            this.sonarButtonBounds = {
                x: 12 * dpr + (btnW + 6 * dpr) * 2,
                y: actY,
                w: btnW,
                h: actH
            };
        }
    }

    loadLevel(index) {
        this.currentLevelIndex = index;
        const sectorNum = this.currentLevelIndex + 1;

        if (this.currentLevelIndex < HANDCRAFTED_LEVELS.length) {
            this.level = HANDCRAFTED_LEVELS[this.currentLevelIndex];
        } else {
            this.level = generateProceduralLevel(sectorNum);
        }

        const allWalls = [
            ...this.level.walls,
            ...(this.level.movingGates || []).map(g => ({ x1: g.origX1, y1: g.origY1, x2: g.origX2, y2: g.origY2 }))
        ];
        this.navGrid = new NavGrid(allWalls);

        this.player = new Player(this.level.playerStart.x, this.level.playerStart.y, this.upgrades);
        this.enemies = this.level.enemies.map(eCfg => new Enemy(eCfg, sectorNum));
        this.crystals = (this.level.crystals || []).map(c => new EnergyCrystal(c.x, c.y));
        this.movingGates = (this.level.movingGates || []).map(g => new MovingGate(g.origX1, g.origY1, g.origX2, g.origY2, g.speed, g.travelDist, g.axis));
        this.currents = (this.level.currents || []).map(c => new WaterCurrentZone(c.x, c.y, c.w, c.h, c.forceX, c.forceY));
        this.tripwires = (this.level.tripwires || []).map(t => new LaserTripwire(t.x1, t.y1, t.x2, t.y2, t.isOscillating, t.cycleTime));
        this.turrets = (this.level.turrets || []).map(tu => new SonarTurret(tu.x, tu.y, tu.period, tu.range));
        this.decoys = [];
        this.floatingMines = [];

        this.waves = [];
        this.litSegments = [];
        this.sonarTimer = 0;
        this.rewardedRespawnUsedThisLevel = false;
        this.hadAlertThisSector = false;
        this.sectorCoinsEarned = 0;
        this.gameState = 'PLAYING';
        this.saveGameData();
    }

    spawnPing() {
        if (!this.player || this.player.pingCooldown > 0 || this.gameState !== 'PLAYING') return;

        if (this.player.battery < 18) {
            playAlertSound();
            return;
        }

        initAudio();
        this.player.battery -= 18;
        this.player.pingCooldown = 0.45;
        const wave = new Wave(this.player.x, this.player.y, this.player.sonarRange, '#00f3ff');
        this.waves.push(wave);
        playPingSound();
    }

    deployDecoy() {
        if (!this.player || this.gameState !== 'PLAYING') return;
        initAudio();

        if (this.decoyCharges > 0) {
            this.decoyCharges--;
        } else {
            this.decoyCharges = 2;
        }
        const mine = new DecoyMine(this.player.x, this.player.y);
        this.decoys.push(mine);
        playDecoyChime();
    }

    activateShield() {
        if (!this.player || this.gameState !== 'PLAYING') return;
        initAudio();
        this.player.shields = Math.min(3, (this.player.shields || 0) + 1);
        playShieldHitSound();
    }

    activateShieldAd() {
        this.activateShield();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('keydown', (e) => {
            initAudio();
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.spawnPing();
            } else if (e.code === 'KeyF' || e.code === 'KeyE') {
                e.preventDefault();
                this.deployDecoy();
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                musicEngine.toggleMute();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('pointerdown', (e) => {
            initAudio();
            const rect = this.canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const mx = (e.clientX - rect.left) * dpr;
            const my = (e.clientY - rect.top) * dpr;

            if (this.handleUIClicks(mx, my)) return;

            if (this.gameState === 'PLAYING') {
                this.spawnPing();
            }
        });

        this.canvas.addEventListener('touchstart', (e) => {
            initAudio();
            const rect = this.canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const tx = (touch.clientX - rect.left) * dpr;
                const ty = (touch.clientY - rect.top) * dpr;

                if (this.handleUIClicks(tx, ty)) continue;

                const dToEcho = Math.hypot(tx - this.echoButtonBounds.x, ty - this.echoButtonBounds.y);
                if (dToEcho <= this.echoButtonBounds.radius * 1.4) {
                    this.spawnPing();
                    continue;
                }

                if (tx < this.canvas.width * 0.6 && !this.touchJoystick.active) {
                    this.touchJoystick.active = true;
                    this.touchJoystick.id = touch.identifier;
                    this.touchJoystick.startX = tx;
                    this.touchJoystick.startY = ty;
                    this.touchJoystick.currX = tx;
                    this.touchJoystick.currY = ty;
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (this.touchJoystick.active && touch.identifier === this.touchJoystick.id) {
                    this.touchJoystick.currX = (touch.clientX - rect.left) * dpr;
                    this.touchJoystick.currY = (touch.clientY - rect.top) * dpr;
                }
            }
        }, { passive: false });

        const endTouchHandler = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (this.touchJoystick.active && e.changedTouches[i].identifier === this.touchJoystick.id) {
                    this.touchJoystick.active = false;
                }
            }
        };
        this.canvas.addEventListener('touchend', endTouchHandler);
        this.canvas.addEventListener('touchcancel', endTouchHandler);
    }

    handleUIClicks(mx, my) {
        if (this.gameState === 'PLAYING') {
            if (mx >= this.sonarButtonBounds.x && mx <= this.sonarButtonBounds.x + this.sonarButtonBounds.w &&
                my >= this.sonarButtonBounds.y && my <= this.sonarButtonBounds.y + this.sonarButtonBounds.h) {
                initAudio();
                this.sonarTimer = 10.0;
                playPingSound(950, 0.4);
                return true;
            }

            if (mx >= this.decoyButtonBounds.x && mx <= this.decoyButtonBounds.x + this.decoyButtonBounds.w &&
                my >= this.decoyButtonBounds.y && my <= this.decoyButtonBounds.y + this.decoyButtonBounds.h) {
                this.deployDecoy();
                return true;
            }

            if (mx >= this.shieldButtonBounds.x && mx <= this.shieldButtonBounds.x + this.shieldButtonBounds.w &&
                my >= this.shieldButtonBounds.y && my <= this.shieldButtonBounds.y + this.shieldButtonBounds.h) {
                this.activateShield();
                return true;
            }

            if (mx >= this.upgradeMenuButtonBounds.x && mx <= this.upgradeMenuButtonBounds.x + this.upgradeMenuButtonBounds.w &&
                my >= this.upgradeMenuButtonBounds.y && my <= this.upgradeMenuButtonBounds.y + this.upgradeMenuButtonBounds.h) {
                this.gameState = 'UPGRADES';
                return true;
            }

            if (mx >= this.muteButtonBounds.x && mx <= this.muteButtonBounds.x + this.muteButtonBounds.w &&
                my >= this.muteButtonBounds.y && my <= this.muteButtonBounds.y + this.muteButtonBounds.h) {
                musicEngine.toggleMute();
                return true;
            }
        }

        if (this.gameState === 'UPGRADES') {
            const upgKeys = ['range', 'speed', 'stealth', 'shield', 'battery', 'magnet'];
            for (let k of upgKeys) {
                const b = this[`upgBounds_${k}`];
                if (b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
                    const cost = 2 + (this.upgrades[k] || 0) * 2;
                    this.buyUpgrade(k, cost);
                    return true;
                }
            }

            if (mx >= this.closeUpgradesButtonBounds.x && mx <= this.closeUpgradesButtonBounds.x + this.closeUpgradesButtonBounds.w &&
                my >= this.closeUpgradesButtonBounds.y && my <= this.closeUpgradesButtonBounds.y + this.closeUpgradesButtonBounds.h) {
                this.gameState = 'PLAYING';
                return true;
            }
        }

        if (this.gameState === 'GAMEOVER') {
            if (!this.rewardedRespawnUsedThisLevel &&
                mx >= this.respawnButtonBounds.x && mx <= this.respawnButtonBounds.x + this.respawnButtonBounds.w &&
                my >= this.respawnButtonBounds.y && my <= this.respawnButtonBounds.y + this.respawnButtonBounds.h) {
                this.rewardedRespawnUsedThisLevel = true;
                this.player.shields = 2;
                this.player.battery = this.player.maxBattery;
                this.player.dead = false;
                this.player.reset();
                this.enemies.forEach(e => e.reset());
                this.gameState = 'PLAYING';
                playWinSound();
                return true;
            }

            if (mx >= this.restartButtonBounds.x && mx <= this.restartButtonBounds.x + this.restartButtonBounds.w &&
                my >= this.restartButtonBounds.y && my <= this.restartButtonBounds.y + this.restartButtonBounds.h) {
                this.loadLevel(this.currentLevelIndex);
                return true;
            }
        }

        if (this.gameState === 'VICTORY') {
            if (!this.hasDoubledReward && mx >= this.doubleRewardButtonBounds.x && mx <= this.doubleRewardButtonBounds.x + this.doubleRewardButtonBounds.w &&
                my >= this.doubleRewardButtonBounds.y && my <= this.doubleRewardButtonBounds.y + this.doubleRewardButtonBounds.h) {
                this.hasDoubledReward = true;
                const bonus = Math.max(2, this.sectorCoinsEarned);
                this.crystalsBank += bonus;
                this.saveGameData();
                playCrystalSound();
                return true;
            }

            if (mx >= this.nextLevelButtonBounds.x && mx <= this.nextLevelButtonBounds.x + this.nextLevelButtonBounds.w &&
                my >= this.nextLevelButtonBounds.y && my <= this.nextLevelButtonBounds.y + this.nextLevelButtonBounds.h) {
                this.hasDoubledReward = false;
                this.loadLevel(this.currentLevelIndex + 1);
                return true;
            }
        }

        return false;
    }

    buyUpgrade(type, cost) {
        if (this.crystalsBank >= cost && (this.upgrades[type] || 0) < 5) {
            this.crystalsBank -= cost;
            this.upgrades[type] = (this.upgrades[type] || 0) + 1;
            this.saveGameData();
            playCrystalSound();
        }
    }

    update(dt) {
        if (isAdShowing) return;

        this.exitPulse = (this.exitPulse + dt * 4) % (Math.PI * 2);
        if (this.sonarTimer > 0) this.sonarTimer -= dt;

        this.movingGates.forEach(g => g.update(dt));
        this.currents.forEach(c => c.update(dt));
        this.crystals.forEach(c => c.update(dt));
        this.tripwires.forEach(tw => tw.update(dt));
        this.turrets.forEach(tu => tu.update(dt, this.waves));
        this.floatingMines.forEach(fm => fm.update(dt));

        for (let i = this.decoys.length - 1; i >= 0; i--) {
            if (!this.decoys[i].update(dt, this.waves)) {
                this.decoys.splice(i, 1);
            }
        }

        if (this.gameState !== 'PLAYING') {
            musicEngine.setDanger(0);
            return;
        }

        // Calculate dynamic danger level for adaptive music tension
        let danger = 0;
        if (this.enemies.some(e => e.state === 'CHASE')) {
            danger = 1.0;
        } else if (this.enemies.some(e => e.state === 'ALERT')) {
            danger = 0.65;
        } else if (this.turrets.some(t => t.timer > t.period - 0.8)) {
            danger = 0.35;
        }
        musicEngine.setDanger(danger);

        let inputDir = { x: 0, y: 0 };
        if (this.keys['KeyW'] || this.keys['ArrowUp']) inputDir.y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) inputDir.y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputDir.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) inputDir.x += 1;

        if (this.touchJoystick.active) {
            const jdx = this.touchJoystick.currX - this.touchJoystick.startX;
            const jdy = this.touchJoystick.currY - this.touchJoystick.startY;
            const jdist = Math.hypot(jdx, jdy);
            if (jdist > 10) {
                inputDir.x = jdx / jdist;
                inputDir.y = jdy / jdist;
            }
        }

        const allCollisionWalls = [
            ...this.level.walls,
            ...this.movingGates.map(g => ({ x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2 }))
        ];

        this.player.update(dt, inputDir, allCollisionWalls, this.currents, this.crystals);

        // Check Crystals (Track in current sector buffer)
        this.crystals.forEach(c => {
            if (!c.collected && dist(this.player.x, this.player.y, c.x, c.y) < (this.player.radius + c.radius + 4)) {
                c.collected = true;
                this.sectorCoinsEarned++;
                playCrystalSound();
            }
        });

        // Check Laser Tripwires
        this.tripwires.forEach(tw => {
            if (tw.checkHit(this.player.x, this.player.y, this.player.radius)) {
                if (this.player.shields > 0) {
                    this.player.shields--;
                    playShieldHitSound();
                } else {
                    this.gameState = 'GAMEOVER';
                    playDeathSound();
                }
            }
        });

        // Check Floating Contact Mines
        for (let i = this.floatingMines.length - 1; i >= 0; i--) {
            const fm = this.floatingMines[i];
            if (!fm.isDetonated && dist(this.player.x, this.player.y, fm.x, fm.y) < (this.player.radius + fm.radius)) {
                fm.isDetonated = true;
                playEMPSound();
                if (this.player.shields > 0) {
                    this.player.shields--;
                    playShieldHitSound();
                } else {
                    this.gameState = 'GAMEOVER';
                    playDeathSound();
                }
            }
        }

        // Update Waves & illuminate walls
        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];
            const prevR = wave.radius;
            const alive = wave.update(dt);
            const currR = wave.radius;

            for (let w of allCollisionWalls) {
                const wallLen = dist(w.x1, w.y1, w.x2, w.y2);
                const sampleSteps = Math.max(2, Math.ceil(wallLen / 12));
                for (let s = 0; s < sampleSteps; s++) {
                    const t1 = s / sampleSteps;
                    const px = w.x1 + t1 * (w.x2 - w.x1);
                    const py = w.y1 + t1 * (w.y2 - w.y1);
                    const dToWave = dist(px, py, wave.x, wave.y);

                    if (dToWave >= prevR && dToWave <= currR) {
                        const t2 = (s + 1) / sampleSteps;
                        this.litSegments.push(new LitSegment(
                            w.x1 + t1 * (w.x2 - w.x1),
                            w.y1 + t1 * (w.y2 - w.y1),
                            w.x1 + t2 * (w.x2 - w.x1),
                            w.y1 + t2 * (w.y2 - w.y1),
                            wave.color
                        ));
                    }
                }
            }

            if (!alive) this.waves.splice(i, 1);
        }

        for (let i = this.litSegments.length - 1; i >= 0; i--) {
            if (!this.litSegments[i].update(dt)) this.litSegments.splice(i, 1);
        }

        // Update enemies with A* NavGrid & Whisker Wall Avoidance
        for (let enemy of this.enemies) {
            enemy.update(dt, this.player, allCollisionWalls, this.waves, this.decoys, this.floatingMines, () => {
                this.hadAlertThisSector = true;
            }, this.navGrid);

            if (enemy.state !== 'STUNNED' && dist(enemy.x, enemy.y, this.player.x, this.player.y) < (enemy.radius + this.player.radius - 2)) {
                if (this.player.shields > 0) {
                    this.player.shields--;
                    enemy.stunTimer = 2.0;
                    playShieldHitSound();
                } else {
                    this.gameState = 'GAMEOVER';
                    playDeathSound();
                }
            }
        }

        // Check Exit Reach & Star Calculation
        if (dist(this.player.x, this.player.y, this.level.exit.x, this.level.exit.y) < (this.level.exit.radius + this.player.radius)) {
            this.gameState = 'VICTORY';
            playWinSound();

            // Securely credit collected crystals upon completing the sector!
            this.crystalsBank += this.sectorCoinsEarned;

            let stars = 1;
            const allCrystals = this.crystals.every(c => c.collected);
            if (allCrystals) stars++;
            if (!this.hadAlertThisSector) stars++;

            const lvlId = this.level.id;
            this.levelStars[lvlId] = Math.max(this.levelStars[lvlId] || 0, stars);
            this.saveGameData();
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const scale = this.scale;
        const offsetX = this.offsetX;
        const offsetY = this.offsetY;

        this.currents.forEach(c => c.draw(ctx, scale, offsetX, offsetY));

        // Render Walls (Sonar vs Blind Echo)
        if (this.sonarTimer > 0) {
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 3 * scale;
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 10 * scale;
            for (let w of this.level.walls) {
                ctx.beginPath();
                ctx.moveTo(w.x1 * scale + offsetX, w.y1 * scale + offsetY);
                ctx.lineTo(w.x2 * scale + offsetX, w.y2 * scale + offsetY);
                ctx.stroke();
            }
            this.movingGates.forEach(g => g.draw(ctx, scale, offsetX, offsetY, true));
        } else {
            for (let seg of this.litSegments) {
                seg.draw(ctx, scale, offsetX, offsetY);
            }
            this.movingGates.forEach(g => g.draw(ctx, scale, offsetX, offsetY, false));
        }

        // Render Laser Tripwires & Turrets
        this.tripwires.forEach(tw => {
            let illuminated = this.sonarTimer > 0;
            if (!illuminated) {
                for (let w of this.waves) {
                    const closest = getClosestPointOnSegment(w.x, w.y, tw.x1, tw.y1, tw.x2, tw.y2);
                    if (dist(w.x, w.y, closest.x, closest.y) <= w.radius + 20) illuminated = true;
                }
                if (dist(this.player.x, this.player.y, tw.x1, tw.y1) < 80 || dist(this.player.x, this.player.y, tw.x2, tw.y2) < 80) illuminated = true;
            }
            tw.draw(ctx, scale, offsetX, offsetY, illuminated);
        });

        this.turrets.forEach(tu => {
            let visible = this.sonarTimer > 0 || dist(this.player.x, this.player.y, tu.x, tu.y) < 90;
            tu.draw(ctx, scale, offsetX, offsetY, visible);
        });

        // Floating Mines
        this.floatingMines.forEach(fm => {
            let illuminated = this.sonarTimer > 0;
            if (!illuminated) {
                for (let w of this.waves) {
                    if (dist(fm.x, fm.y, w.x, w.y) <= w.radius + 15) illuminated = true;
                }
                if (dist(this.player.x, this.player.y, fm.x, fm.y) < 70) illuminated = true;
            }
            fm.draw(ctx, scale, offsetX, offsetY, illuminated);
        });

        for (let wave of this.waves) {
            wave.draw(ctx, scale, offsetX, offsetY);
        }

        this.decoys.forEach(d => d.draw(ctx, scale, offsetX, offsetY));

        this.crystals.forEach(c => {
            let visible = this.sonarTimer > 0;
            if (!visible) {
                for (let w of this.waves) {
                    if (dist(c.x, c.y, w.x, w.y) <= w.radius + 15) visible = true;
                }
                if (dist(c.x, c.y, this.player.x, this.player.y) <= 80) visible = true;
            }
            c.draw(ctx, scale, offsetX, offsetY, visible);
        });

        // Exit Portal
        const ex = this.level.exit.x * scale + offsetX;
        const ey = this.level.exit.y * scale + offsetY;
        const exitR = (this.level.exit.radius + Math.sin(this.exitPulse) * 3) * scale;

        ctx.save();
        const exitGrad = ctx.createRadialGradient(ex, ey, 3 * scale, ex, ey, exitR * 1.6);
        exitGrad.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
        exitGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = exitGrad;
        ctx.beginPath();
        ctx.arc(ex, ey, exitR * 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex, ey, exitR, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 16 * scale;
        ctx.fill();
        ctx.restore();

        // Enemies
        for (let enemy of this.enemies) {
            let visible = this.sonarTimer > 0;
            if (!visible) {
                for (let w of this.waves) {
                    if (dist(enemy.x, enemy.y, w.x, w.y) <= w.radius + 15) visible = true;
                }
                if (dist(enemy.x, enemy.y, this.player.x, this.player.y) <= 80) visible = true;
            }

            if (visible || enemy.state === 'CHASE' || enemy.state === 'STUNNED') {
                enemy.draw(ctx, scale, offsetX, offsetY, visible);
            }
        }

        if (this.player) this.player.draw(ctx, scale, offsetX, offsetY);

        this.renderUI(ctx);
        ctx.restore();
    }

    renderUI(ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.save();

        if (this.gameState === 'PLAYING') {
            const W = this.canvas.width;
            const barH = 44 * dpr;

            // 1. Sleek Glass Top Status Bar
            ctx.fillStyle = 'rgba(7, 12, 24, 0.85)';
            ctx.fillRect(0, 0, W, barH);
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(0, barH);
            ctx.lineTo(W, barH);
            ctx.stroke();

            // 2. Left Side: Sector indicator & Inventory
            ctx.fillStyle = '#00f3ff';
            ctx.font = `bold ${Math.round(13 * dpr)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${t('level')} ${this.level.id}`, 16 * dpr, barH / 2);

            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold ${Math.round(11 * dpr)}px "Orbitron", sans-serif`;
            const statsText = `💎 ${this.crystalsBank}` + (this.sectorCoinsEarned > 0 ? ` (+${this.sectorCoinsEarned})` : '') + `   🛡️ ${this.player.shields || 0}`;
            ctx.fillText(statsText, 105 * dpr, barH / 2);

            // 3. Center: Battery & Energy Gauge
            if (W >= 560 * dpr) {
                const batW = Math.min(130 * dpr, W * 0.18);
                const batH = 8 * dpr;
                const batX = (W - batW) / 2;
                const batY = (barH - batH) / 2;
                const batPct = Math.max(0, Math.min(1, this.player.battery / this.player.maxBattery));

                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.fillRect(batX, batY, batW, batH);
                ctx.fillStyle = batPct > 0.25 ? '#00f3ff' : '#ef4444';
                ctx.fillRect(batX, batY, batW * batPct, batH);
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
                ctx.strokeRect(batX, batY, batW, batH);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = `600 ${Math.round(8.5 * dpr)}px "Orbitron", sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(`${Math.round(batPct * 100)}%`, W / 2, batY - 5 * dpr);
            }

            // 4. Header buttons: Mute and Upgrades
            const mb = this.muteButtonBounds;
            ctx.fillStyle = musicEngine.isMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 243, 255, 0.12)';
            ctx.strokeStyle = musicEngine.isMuted ? '#ef4444' : 'rgba(0, 243, 255, 0.5)';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(mb.x, mb.y, mb.w, mb.h, 6 * dpr) : ctx.rect(mb.x, mb.y, mb.w, mb.h);
            ctx.fill();
            ctx.stroke();
            ctx.font = `${Math.round(13 * dpr)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(musicEngine.isMuted ? '🔇' : '🔊', mb.x + mb.w / 2, mb.y + mb.h / 2);

            const ub = this.upgradeMenuButtonBounds;
            ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(ub.x, ub.y, ub.w, ub.h, 6 * dpr) : ctx.rect(ub.x, ub.y, ub.w, ub.h);
            ctx.fill();
            ctx.stroke();
            ctx.font = `${Math.round(12 * dpr)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚙️', ub.x + ub.w / 2, ub.y + ub.h / 2);

            // 5. Tactical Ability Buttons (Sonar, Decoy, Shield)
            const sb = this.sonarButtonBounds;
            ctx.fillStyle = this.sonarTimer > 0 ? 'rgba(0, 243, 255, 0.35)' : 'rgba(0, 243, 255, 0.12)';
            ctx.strokeStyle = this.sonarTimer > 0 ? '#00f3ff' : 'rgba(0, 243, 255, 0.4)';
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(sb.x, sb.y, sb.w, sb.h, 6 * dpr) : ctx.rect(sb.x, sb.y, sb.w, sb.h);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#00f3ff';
            ctx.font = `bold ${Math.round(10 * dpr)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const sonarText = this.sonarTimer > 0 ? `${t('sonarActive')} ${Math.ceil(this.sonarTimer)}s` : t('sonar');
            ctx.fillText(sonarText, sb.x + sb.w / 2, sb.y + sb.h / 2);

            const db = this.decoyButtonBounds;
            const hasCharges = this.decoyCharges > 0;
            ctx.fillStyle = hasCharges ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.12)';
            ctx.strokeStyle = hasCharges ? '#a855f7' : 'rgba(168, 85, 247, 0.4)';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(db.x, db.y, db.w, db.h, 6 * dpr) : ctx.rect(db.x, db.y, db.w, db.h);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#c084fc';
            ctx.font = `bold ${Math.round(10 * dpr)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const decoyText = hasCharges ? t('decoyReady', { n: this.decoyCharges }) : t('decoyAd');
            ctx.fillText(decoyText, db.x + db.w / 2, db.y + db.h / 2);

            const shb = this.shieldButtonBounds;
            const hasShield = (this.player.shields || 0) > 0;
            ctx.fillStyle = hasShield ? 'rgba(56, 189, 248, 0.3)' : 'rgba(56, 189, 248, 0.12)';
            ctx.strokeStyle = hasShield ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(shb.x, shb.y, shb.w, shb.h, 6 * dpr) : ctx.rect(shb.x, shb.y, shb.w, shb.h);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.font = `bold ${Math.round(10 * dpr)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const shieldText = hasShield ? t('shieldActive', { n: this.player.shields }) : t('shieldAd');
            ctx.fillText(shieldText, shb.x + shb.w / 2, shb.y + shb.h / 2);

            // 6. Mission Transmission / Level Hint (Clean Holographic Pill)
            if (this.level.hintKey) {
                const hintText = t(this.level.hintKey);
                ctx.font = `500 ${Math.round(11 * dpr)}px "Montserrat", sans-serif`;
                const textMetrics = ctx.measureText(hintText);
                const pillW = Math.min(W - 32 * dpr, textMetrics.width + 24 * dpr);
                const pillH = 26 * dpr;
                const pillX = 16 * dpr;
                const pillY = barH + 10 * dpr;

                ctx.fillStyle = 'rgba(7, 12, 24, 0.75)';
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
                ctx.lineWidth = 1 * dpr;
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(pillX, pillY, pillW, pillH, 6 * dpr) : ctx.rect(pillX, pillY, pillW, pillH);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = 'rgba(0, 243, 255, 0.9)';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(hintText, pillX + 10 * dpr, pillY + pillH / 2);
            }

            // 7. Touch Joystick
            if (this.touchJoystick.active) {
                const tj = this.touchJoystick;
                ctx.beginPath();
                ctx.arc(tj.startX, tj.startY, 48 * dpr, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 243, 255, 0.08)';
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
                ctx.lineWidth = 2 * dpr;
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(tj.currX, tj.currY, 22 * dpr, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
                ctx.fill();
            }

            // 8. Mobile ECHO Button
            const eb = this.echoButtonBounds;
            const cooldownRatio = this.player ? Math.max(0, this.player.pingCooldown / 0.45) : 0;
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
            ctx.fillStyle = cooldownRatio > 0 || this.player.battery < 18 ? 'rgba(0, 243, 255, 0.08)' : 'rgba(0, 243, 255, 0.22)';
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2.5 * dpr;
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 8 * dpr;
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#00f3ff';
            ctx.font = `bold ${Math.round(13 * dpr)}px "Orbitron", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(t('echo'), eb.x, eb.y);
        }

        if (this.gameState === 'UPGRADES') this.renderUpgradesScreen(ctx, dpr);
        if (this.gameState === 'GAMEOVER') this.renderGameOverScreen(ctx, dpr);
        if (this.gameState === 'VICTORY') this.renderVictoryScreen(ctx, dpr);

        ctx.restore();
    }

    renderUpgradesScreen(ctx, dpr) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.95)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        ctx.fillStyle = '#00f3ff';
        ctx.font = `bold ${Math.round(24 * dpr)}px "Orbitron", sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 14 * dpr;
        ctx.fillText(t('upgradeMenuTitle'), cx, cy - 180 * dpr);

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(16 * dpr)}px "Orbitron", sans-serif`;
        ctx.shadowBlur = 0;
        ctx.fillText(`💎 ${this.crystalsBank}`, cx, cy - 148 * dpr);

        const upgList = [
            { key: 'range', name: t('upgRange') },
            { key: 'speed', name: t('upgSpeed') },
            { key: 'stealth', name: t('upgStealth') },
            { key: 'shield', name: t('upgShield') },
            { key: 'battery', name: t('upgBattery') },
            { key: 'magnet', name: t('upgMagnet') }
        ];

        const panelW = Math.min(420 * dpr, this.canvas.width * 0.9);
        let startY = cy - 120 * dpr;

        upgList.forEach((upg) => {
            const currentLvl = this.upgrades[upg.key] || 0;
            const cost = 2 + currentLvl * 2;
            const isMax = currentLvl >= 5;

            const b = { x: cx - panelW / 2, y: startY, w: panelW, h: 32 * dpr };
            this[`upgBounds_${upg.key}`] = b;

            ctx.fillStyle = isMax ? 'rgba(255, 255, 255, 0.05)' : (this.crystalsBank >= cost ? 'rgba(0, 243, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)');
            ctx.strokeStyle = isMax ? '#9ca3af' : '#00f3ff';
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(b.x, b.y, b.w, b.h, 8 * dpr) : ctx.rect(b.x, b.y, b.w, b.h);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = `600 ${Math.round(12 * dpr)}px "Montserrat", sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText(`${upg.name} [${currentLvl}/5]`, b.x + 12 * dpr, b.y + 20 * dpr);

            ctx.textAlign = 'right';
            ctx.fillStyle = isMax ? '#9ca3af' : (this.crystalsBank >= cost ? '#fbbf24' : '#ef4444');
            ctx.font = `bold ${Math.round(11.5 * dpr)}px "Orbitron", sans-serif`;
            ctx.fillText(isMax ? t('upgradeMax') : `${t('cost')} ${cost} 💎`, b.x + b.w - 12 * dpr, b.y + 20 * dpr);

            startY += 38 * dpr;
        });

        this.closeUpgradesButtonBounds = { x: cx - 100 * dpr, y: startY + 15 * dpr, w: 200 * dpr, h: 44 * dpr };
        const cb = this.closeUpgradesButtonBounds;
        ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(cb.x, cb.y, cb.w, cb.h, 12 * dpr) : ctx.rect(cb.x, cb.y, cb.w, cb.h);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00f3ff';
        ctx.font = `bold ${Math.round(14 * dpr)}px "Orbitron", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(t('closeUpgrades'), cx, cb.y + 27 * dpr);
    }

    renderGameOverScreen(ctx, dpr) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.92)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        ctx.fillStyle = '#ef4444';
        ctx.font = `bold ${Math.round(30 * dpr)}px "Orbitron", sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 16 * dpr;
        ctx.fillText(t('detected'), cx, cy - 80 * dpr);

        ctx.fillStyle = '#9ca3af';
        ctx.font = `600 ${Math.round(14 * dpr)}px "Montserrat", sans-serif`;
        ctx.shadowBlur = 0;
        ctx.fillText(t('shadowAbsorbed'), cx, cy - 40 * dpr);

        let btnY = cy + 10 * dpr;
        if (!this.rewardedRespawnUsedThisLevel) {
            this.respawnButtonBounds = { x: cx - 130 * dpr, y: btnY, w: 260 * dpr, h: 46 * dpr };
            const rb = this.respawnButtonBounds;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2 * dpr;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(rb.x, rb.y, rb.w, rb.h, 12 * dpr) : ctx.rect(rb.x, rb.y, rb.w, rb.h);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = `bold ${Math.round(13 * dpr)}px "Orbitron", sans-serif`;
            ctx.fillText(t('respawnShield'), cx, rb.y + 28 * dpr);
            btnY += 60 * dpr;
        }

        this.restartButtonBounds = { x: cx - 90 * dpr, y: btnY, w: 180 * dpr, h: 44 * dpr };
        const rst = this.restartButtonBounds;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(rst.x, rst.y, rst.w, rst.h, 12 * dpr) : ctx.rect(rst.x, rst.y, rst.w, rst.h);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(13 * dpr)}px "Orbitron", sans-serif`;
        ctx.fillText(t('restart'), cx, rst.y + 27 * dpr);
    }

    renderVictoryScreen(ctx, dpr) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.94)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(30 * dpr)}px "Orbitron", sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 16 * scaleSafe(dpr);
        ctx.fillText(t('victory'), cx, cy - 130 * dpr);

        const stars = this.levelStars[this.level.id] || 1;
        let starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        ctx.font = `${Math.round(28 * dpr)}px sans-serif`;
        ctx.shadowBlur = 0;
        ctx.fillText(starStr, cx, cy - 85 * dpr);

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(13 * dpr)}px "Orbitron", sans-serif`;
        ctx.fillText(t('crystalsSecGained', { n: this.sectorCoinsEarned, total: this.crystalsBank }), cx, cy - 50 * dpr);

        this.doubleRewardButtonBounds = { x: cx - 125 * dpr, y: cy - 20 * dpr, w: 250 * dpr, h: 44 * dpr };
        const drb = this.doubleRewardButtonBounds;
        ctx.fillStyle = this.hasDoubledReward ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 191, 36, 0.25)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(drb.x, drb.y, drb.w, drb.h, 12 * dpr) : ctx.rect(drb.x, drb.y, drb.w, drb.h);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(12 * dpr)}px "Orbitron", sans-serif`;
        ctx.fillText(this.hasDoubledReward ? '💎 УДВОЕНО!' : t('doubleReward'), cx, drb.y + 27 * dpr);

        this.nextLevelButtonBounds = { x: cx - 110 * dpr, y: cy + 40 * dpr, w: 220 * dpr, h: 46 * dpr };
        const nb = this.nextLevelButtonBounds;
        ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(nb.x, nb.y, nb.w, nb.h, 12 * dpr) : ctx.rect(nb.x, nb.y, nb.w, nb.h);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00f3ff';
        ctx.font = `bold ${Math.round(13 * dpr)}px "Orbitron", sans-serif`;
        ctx.fillText(t('nextLevel'), cx, nb.y + 28 * dpr);
    }

    start() {
        const loop = (timestamp) => {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            this.update(dt);
            this.render();

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

function scaleSafe(dpr) {
    return Math.max(1, dpr || 1);
}

// ==========================================
// 10. GAME LAUNCH ON WINDOW LOAD
// ==========================================
window.addEventListener('load', () => {
    initSDK();
    const game = new GameEngine();
    game.start();
});
