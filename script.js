/* ═══════════════════════════════════════════════════
   script.js — TC UNDERGROUND // Domain Interface v1.0
   ═══════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

    // ════════════════════════════════════════
    // 1. DOMAIN EXPANSION INTRO
    // ════════════════════════════════════════
    const intro = document.getElementById("domainIntro");
    const skipBtn = document.getElementById("domainSkip");
    const barInner = document.getElementById("domainBarInner");
    const statusEl = document.getElementById("domainStatus");
    const titleEl = document.getElementById("domainTitle");

    const introCanvas = document.getElementById("introCanvas");
    const introCtx = introCanvas ? introCanvas.getContext("2d") : null;

    const statusMessages = [
        "LOADING SYSTEM...",
        "CHECKING MODULES... OK",
        "ACCESSING DATABASE...",
        "DECRYPTING FILES...",
        "CARELI.EXE LOADED.",
        "DOMAIN EXPANSION: READY."
    ];

    // ── CANVAS INTRO: Starfield + Matrix columns (estilo 2000s) ──
    if (introCanvas && introCtx) {
        introCanvas.width = window.innerWidth;
        introCanvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            introCanvas.width = window.innerWidth;
            introCanvas.height = window.innerHeight;
        });

        const W = () => introCanvas.width;
        const H = () => introCanvas.height;

        /* ── 1. STARFIELD (perspectiva, estilo screensaver do Win98) ── */
        const STAR_COUNT = 200;
        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: (Math.random() - 0.5) * 2000,
            y: (Math.random() - 0.5) * 2000,
            z: Math.random() * 1000,
        }));

        /* ── 2. MATRIX COLUMNS (colunas de char verde caindo) ── */
        const COL_W = 14;
        const matrixChars = "01アカサタCАРЕЛИ<>{}[]!?01010111";
        let matrixCols = [];
        const initMatrixCols = () => {
            const count = Math.ceil(W() / COL_W);
            matrixCols = Array.from({ length: count }, () => ({
                y: -Math.random() * H(),
                speed: Math.random() * 1.5 + 0.5,
                char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
            }));
        };
        initMatrixCols();
        window.addEventListener('resize', initMatrixCols);

        let introRafId;
        const drawIntroCanvas = () => {
            const w = W(), h = H();
            const cx = w / 2, cy = h / 2;

            // fundo preto semi-transparente (deixa rastro nas estrelas)
            introCtx.fillStyle = "rgba(0,0,0,0.18)";
            introCtx.fillRect(0, 0, w, h);

            // — Matrix columns —
            introCtx.font = `${COL_W - 2}px monospace`;
            matrixCols.forEach((col, i) => {
                // brilho máximo na cabeça, fade nos anteriores já feito pelo fillRect
                introCtx.fillStyle = `rgba(0,255,65,0.55)`;
                introCtx.fillText(col.char, i * COL_W, col.y);
                col.y += col.speed;
                if (col.y > h + COL_W) {
                    col.y = -COL_W;
                    col.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }
                // troca char aleatoriamente para dar efeito glitch
                if (Math.random() < 0.04) {
                    col.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }
            });

            // — Starfield —
            stars.forEach(star => {
                star.z -= 3.5; // velocidade de "zoom"
                if (star.z <= 0) star.z = 1000;

                const sx = (star.x / star.z) * 300 + cx;
                const sy = (star.y / star.z) * 300 + cy;
                const size = Math.max(0.3, (1 - star.z / 1000) * 3);
                const alpha = (1 - star.z / 1000) * 0.7;

                introCtx.fillStyle = `rgba(180,255,200,${alpha})`;
                introCtx.fillRect(sx, sy, size, size);
            });

            introRafId = requestAnimationFrame(drawIntroCanvas);
        };
        drawIntroCanvas();
        window._introRaf = () => cancelAnimationFrame(introRafId);
    }

    // Barra de progresso e status — avanço em "degraus" (blocky, não suave)
    let barProgress = 0;
    let statusIdx = 0;
    const TOTAL_DURATION = 3500;
    const STEP = 2; // avança em blocos para parecer mais "digital"
    const barInterval = setInterval(() => {
        barProgress = Math.min(barProgress + STEP, 100);
        if (barInner) barInner.style.width = barProgress + "%";

        const msgAt = Math.floor((barProgress / 100) * statusMessages.length);
        if (statusEl && msgAt !== statusIdx && msgAt < statusMessages.length) {
            statusIdx = msgAt;
            statusEl.textContent = statusMessages[statusIdx];
        }
    }, TOTAL_DURATION / (100 / STEP));

    const closeIntro = () => {
        clearInterval(barInterval);
        if (window._introRaf) window._introRaf();
        if (!intro) return;
        if (intro.classList.contains("is-leaving")) return;
        intro.classList.add("is-leaving");
        setTimeout(() => intro.remove(), 400);
    };

    const autoClose = setTimeout(closeIntro, TOTAL_DURATION);

    skipBtn?.addEventListener("click", (e) => {
        e.preventDefault(); // garante que não segue links
        clearTimeout(autoClose);
        closeIntro();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { clearTimeout(autoClose); closeIntro(); }
    });


    // ════════════════════════════════════════
    // 2. HEADER CANVAS — CÓDIGO FLUINDO
    // ════════════════════════════════════════
    const headerCanvas = document.getElementById("headerCanvas");
    const hCtx = headerCanvas ? headerCanvas.getContext("2d") : null;

    if (headerCanvas && hCtx) {
        const setHeaderSize = () => {
            headerCanvas.width = headerCanvas.offsetWidth;
            headerCanvas.height = headerCanvas.offsetHeight;
        };
        setHeaderSize();
        window.addEventListener("resize", setHeaderSize);

        const hChars = "01101001CARELI<>{}[]TC UNDERGROUND//01010111";
        const columns = Math.ceil(headerCanvas.width / 10);
        const drops = Array.from({ length: columns }, () => Math.random() * -60);

        const drawHeader = () => {
            hCtx.fillStyle = "rgba(0,0,0,0.15)";
            hCtx.fillRect(0, 0, headerCanvas.width, headerCanvas.height);

            hCtx.font = "9px monospace";
            drops.forEach((y, i) => {
                const char = hChars[Math.floor(Math.random() * hChars.length)];
                hCtx.fillStyle = "rgba(0,200,80,0.7)";
                hCtx.fillText(char, i * 10, y * 10);

                if (y * 10 > headerCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 0.5;
            });

            requestAnimationFrame(drawHeader);
        };
        drawHeader();
    }

    // ════════════════════════════════════════
    // 3. HEADER TERMINAL TYPEWRITER
    // ════════════════════════════════════════
    const terminal = document.getElementById("headerTerminal");
    const lines = [
        "SYSTEM ONLINE :: TC UNDERGROUND",
        "MÓDULO: LAB & EXPERIMENTS",
        "STATUS: EXPANSION ATIVA",
        "USER: CARELI // ADMINISTRATOR",
        "> dominio.expansion --init --verbose",
    ];
    let lineIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    const typeOut = () => {
        if (!terminal) return;
        const current = lines[lineIdx];

        if (!isDeleting) {
            terminal.textContent = current.substr(0, charIdx + 1) + "█";
            charIdx++;
            if (charIdx === current.length) {
                isDeleting = true;
                setTimeout(typeOut, 1800);
                return;
            }
        } else {
            terminal.textContent = current.substr(0, charIdx - 1) + "█";
            charIdx--;
            if (charIdx === 0) {
                isDeleting = false;
                lineIdx = (lineIdx + 1) % lines.length;
            }
        }

        const speed = isDeleting ? 30 : 55;
        setTimeout(typeOut, speed);
    };

    setTimeout(typeOut, 3800); // Começa após intro

    // ════════════════════════════════════════
    // 4. WINAMP VISUALIZER (SIMULADO)
    // ════════════════════════════════════════
    const buildViz = (containerId, barCount = 12) => {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const bars = [];
        for (let i = 0; i < barCount; i++) {
            const b = document.createElement("div");
            b.className = "winamp-viz-bar";
            b.style.height = "10px";
            container.appendChild(b);
            bars.push(b);
        }

        return bars;
    };

    const leftBars = buildViz("leftViz");
    const rightBars = buildViz("rightViz");

    const animViz = (bars, active) => {
        if (!bars) return;
        bars.forEach(b => {
            const h = active ? Math.floor(Math.random() * 55) + 5 : 5;
            b.style.height = h + "px";
        });
    };

    // State dos players
    const playerState = {
        left: { playing: false, paused: false, trackIdx: 0, elapsed: 0, timer: null },
        right: { playing: false, paused: false, elapsed: 0, timer: null },
    };

    let vizInterval;
    const startViz = () => {
        if (vizInterval) return;
        vizInterval = setInterval(() => {
            animViz(leftBars, playerState.left.playing);
            animViz(rightBars, playerState.right.playing);
        }, 100);
    };
    startViz();

    // ════════════════════════════════════════
    // 5. WINAMP PLAYLIST LEFT
    // ════════════════════════════════════════
    const playlist = [
        { title: "505", artist: "Arctic Monkeys", dur: "4:14", secs: 254 },
        { title: "Face", artist: "Brockhampton", dur: "4:19", secs: 259 },
        { title: "Ceremony", artist: "New Order", dur: "4:39", secs: 279 },
        { title: "Preciso me Encontrar", artist: "Cartola", dur: "2:59", secs: 179 },
        { title: "Headup", artist: "Deftones", dur: "6:13", secs: 373 },
        { title: "Rotten Apple", artist: "Alice in Chains", dur: "6:53", secs: 413 },
        { title: "Jesus Chorou", artist: "Racionais", dur: "7:51", secs: 471 },
        { title: "Feel", artist: "Robbie Williams", dur: "4:23", secs: 263 },
        { title: "Unretrofied", artist: "The Dillinger Escape Plan", dur: "5:38", secs: 338 },
        { title: "Até que Durou", artist: "Péricles", dur: "5:13", secs: 313 },
        { title: "Lying from You", artist: "Linkin Park", dur: "2:55", secs: 175 },
    ];

    const plContainer = document.getElementById("leftPlaylist");
    const buildPlaylist = () => {
        if (!plContainer) return;
        plContainer.innerHTML = "";
        playlist.forEach((t, i) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="pl-num">${String(i + 1).padStart(2, "0")}.</span>
                <span class="pl-song">${t.artist} - ${t.title}</span>
                <span class="pl-time">${t.dur}</span>
            `;
            li.dataset.idx = i;
            li.addEventListener("click", () => {
                playerState.left.trackIdx = i;
                playerState.left.elapsed = 0;
                highlightTrack(i);
                updateLeftDisplay();
                if (!playerState.left.playing) {
                    playLeft();
                }
            });
            plContainer.appendChild(li);
        });
    };

    const highlightTrack = (idx) => {
        document.querySelectorAll("#leftPlaylist li").forEach((li, i) => {
            li.classList.toggle("active", i === idx);
        });
    };

    const updateLeftDisplay = () => {
        const t = playlist[playerState.left.trackIdx];
        const nameEl = document.getElementById("leftTrackName");
        if (nameEl) nameEl.textContent = `${t.artist.toUpperCase()} - ${t.title.toUpperCase()}`;
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const playLeft = () => {
        if (playerState.left.timer) clearInterval(playerState.left.timer);
        playerState.left.playing = true;
        playerState.left.paused = false;

        const timeEl = document.getElementById("leftTime");
        const total = playlist[playerState.left.trackIdx].secs;

        playerState.left.timer = setInterval(() => {
            playerState.left.elapsed++;
            if (timeEl) timeEl.textContent = formatTime(playerState.left.elapsed);

            if (playerState.left.elapsed >= total) {
                // Avança p/ próxima faixa
                playerState.left.trackIdx = (playerState.left.trackIdx + 1) % playlist.length;
                playerState.left.elapsed = 0;
                highlightTrack(playerState.left.trackIdx);
                updateLeftDisplay();
            }
        }, 1000);

        setBtnActive("lBtnPlay", true);
    };

    const pauseLeft = () => {
        clearInterval(playerState.left.timer);
        playerState.left.playing = false;
        playerState.left.paused = true;
        setBtnActive("lBtnPlay", false);
    };

    const stopLeft = () => {
        clearInterval(playerState.left.timer);
        playerState.left.playing = false;
        playerState.left.paused = false;
        playerState.left.elapsed = 0;
        const timeEl = document.getElementById("leftTime");
        if (timeEl) timeEl.textContent = "0:00";
        setBtnActive("lBtnPlay", false);
    };

    const setBtnActive = (id, active) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.toggle("active", active);
    };

    // Wiring controles LEFT
    document.getElementById("lBtnPlay")?.addEventListener("click", () => {
        if (playerState.left.playing) { pauseLeft(); }
        else { playLeft(); }
    });
    document.getElementById("lBtnPause")?.addEventListener("click", pauseLeft);
    document.getElementById("lBtnStop")?.addEventListener("click", stopLeft);
    document.getElementById("lBtnNext")?.addEventListener("click", () => {
        playerState.left.trackIdx = (playerState.left.trackIdx + 1) % playlist.length;
        playerState.left.elapsed = 0;
        highlightTrack(playerState.left.trackIdx);
        updateLeftDisplay();
        if (playerState.left.playing) { clearInterval(playerState.left.timer); playLeft(); }
    });
    document.getElementById("lBtnPrev")?.addEventListener("click", () => {
        playerState.left.trackIdx = (playerState.left.trackIdx - 1 + playlist.length) % playlist.length;
        playerState.left.elapsed = 0;
        highlightTrack(playerState.left.trackIdx);
        updateLeftDisplay();
        if (playerState.left.playing) { clearInterval(playerState.left.timer); playLeft(); }
    });
    document.getElementById("lBtnShuffle")?.addEventListener("click", function () {
        playerState.left.trackIdx = Math.floor(Math.random() * playlist.length);
        playerState.left.elapsed = 0;
        highlightTrack(playerState.left.trackIdx);
        updateLeftDisplay();
        if (playerState.left.playing) { clearInterval(playerState.left.timer); playLeft(); }
    });

    // Botão ↻ — reseta o timer da música atual e recomeça
    document.getElementById("lBtnRepeat")?.addEventListener("click", () => {
        playerState.left.elapsed = 0;
        const timeEl = document.getElementById("leftTime");
        if (timeEl) timeEl.textContent = "0:00";
        if (playerState.left.playing) {
            clearInterval(playerState.left.timer);
            playLeft();
        }
    });

    buildPlaylist();
    updateLeftDisplay();
    highlightTrack(0);

    // Auto-play ao carregar: Tulioamp já inicia "tocando"
    // Inicia um tempo aleatório na faixa para parecer que já estava tocando
    playerState.left.elapsed = Math.floor(Math.random() * 60); // começa alguns segundos dentro
    playLeft();


    // ════════════════════════════════════════
    // 6. WINAMP PLAYER DIREITO (FAINT)
    // ════════════════════════════════════════
    const rightTrack = { title: "FAINT", artist: "LINKIN PARK", secs: 162 };

    const playRight = () => {
        if (playerState.right.timer) clearInterval(playerState.right.timer);
        playerState.right.playing = true;
        const timeEl = document.getElementById("rightTime");

        playerState.right.timer = setInterval(() => {
            playerState.right.elapsed++;
            if (timeEl) timeEl.textContent = formatTime(playerState.right.elapsed);
            if (playerState.right.elapsed >= rightTrack.secs) {
                playerState.right.elapsed = 0;
            }
        }, 1000);
        setBtnActive("rBtnPlay", true);
    };

    const pauseRight = () => {
        clearInterval(playerState.right.timer);
        playerState.right.playing = false;
        setBtnActive("rBtnPlay", false);
    };

    const stopRight = () => {
        clearInterval(playerState.right.timer);
        playerState.right.playing = false;
        playerState.right.elapsed = 0;
        const timeEl = document.getElementById("rightTime");
        if (timeEl) timeEl.textContent = "0:00";
        setBtnActive("rBtnPlay", false);
    };

    document.getElementById("rBtnPlay")?.addEventListener("click", () => {
        if (playerState.right.playing) { pauseRight(); } else { playRight(); }
    });
    document.getElementById("rBtnPause")?.addEventListener("click", pauseRight);
    document.getElementById("rBtnStop")?.addEventListener("click", stopRight);

    // Auto-play Tulioamp direito — já inicia tocando
    playerState.right.elapsed = Math.floor(Math.random() * 40);
    playRight();

    // Botão ↻ direito — reseta o timer e recomeça
    document.getElementById("rBtnRepeat")?.addEventListener("click", () => {
        playerState.right.elapsed = 0;
        const timeEl = document.getElementById("rightTime");
        if (timeEl) timeEl.textContent = "0:00";
        if (playerState.right.playing) {
            clearInterval(playerState.right.timer);
            playRight();
        }
    });

    // ════════════════════════════════════════
    // 7. WINAMP EQUALIZER — FADERS INTERATIVOS
    // ════════════════════════════════════════
    const eqBands = document.getElementById("eqBands");
    const eqFreqs = ["60", "170", "310", "600", "1K", "3K", "6K", "12K", "16K"];
    const eqValues = [2, -1, 3, 5, 2, -3, 1, 4, -1]; // dB iniciais (-12 a +12)
    const EQ_MIN = -12;
    const EQ_MAX = 12;
    const FADER_H = 60; // px — altura do trilho (deve bater com .eq-fader height no CSS)

    // Converte valor dB → posição top% do thumb (0% = topo = max boost, 100% = fundo = max cut)
    const dbToTop = (db) => ((EQ_MAX - db) / (EQ_MAX - EQ_MIN)) * 100;
    // Converte posição Y relativa (px dentro do trilho) → valor dB
    const pxToDb = (py) => {
        const ratio = Math.max(0, Math.min(1, py / FADER_H));
        return Math.round((EQ_MAX - ratio * (EQ_MAX - EQ_MIN)) * 2) / 2; // passo de 0.5 dB
    };

    const updateFaderVisual = (thumb, barVisual, db) => {
        thumb.style.top = `${dbToTop(db)}%`;
        const h = Math.abs(db) * (FADER_H / 2 / EQ_MAX);
        barVisual.style.height = `${h}px`;
        barVisual.style.background = db >= 0 ? 'rgba(0,200,80,0.7)' : 'rgba(220,60,0,0.7)';
        if (db >= 0) {
            barVisual.style.top = 'auto';
            barVisual.style.bottom = '50%';
        } else {
            barVisual.style.bottom = 'auto';
            barVisual.style.top = '50%';
        }
    };

    const makeFaderInteractive = (faderEl, thumb, barVisual, bandIdx) => {
        let dragStartY = null;
        let dragStartDb = null;

        const startDrag = (clientY) => {
            dragStartY = clientY;
            dragStartDb = eqValues[bandIdx];
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'ns-resize';
        };

        const onMove = (clientY) => {
            if (dragStartY === null) return;
            const dy = clientY - dragStartY;
            // 1px de movimento = ~(24/FADER_H) dB de mudança (range 24dB num trilho de 60px)
            const deltaDb = -(dy / FADER_H) * (EQ_MAX - EQ_MIN);
            let newDb = Math.max(EQ_MIN, Math.min(EQ_MAX, dragStartDb + deltaDb));
            newDb = Math.round(newDb * 2) / 2;
            eqValues[bandIdx] = newDb;
            updateFaderVisual(thumb, barVisual, newDb);
        };

        const stopDrag = () => {
            dragStartY = null;
            dragStartDb = null;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        // Mouse
        faderEl.addEventListener('mousedown', (e) => { e.preventDefault(); startDrag(e.clientY); });
        window.addEventListener('mousemove', (e) => { if (dragStartY !== null) onMove(e.clientY); });
        window.addEventListener('mouseup', stopDrag);

        // Touch
        faderEl.addEventListener('touchstart', (e) => { e.preventDefault(); startDrag(e.touches[0].clientY); }, { passive: false });
        faderEl.addEventListener('touchmove', (e) => { e.preventDefault(); onMove(e.touches[0].clientY); }, { passive: false });
        faderEl.addEventListener('touchend', stopDrag);

        // Double-click: resetar para 0
        faderEl.addEventListener('dblclick', () => {
            eqValues[bandIdx] = 0;
            updateFaderVisual(thumb, barVisual, 0);
        });
    };

    if (eqBands) {
        eqFreqs.forEach((freq, i) => {
            const col = document.createElement("div");
            col.className = "eq-band-col";

            // Cria o fader e seus filhos manualmente para ter referências diretas
            const band = document.createElement("div");
            band.className = "eq-band";

            const faderEl = document.createElement("div");
            faderEl.className = "eq-fader";
            faderEl.dataset.band = i;
            faderEl.style.position = "relative";
            faderEl.style.cursor = "ns-resize";

            const thumb = document.createElement("div");
            thumb.className = "eq-thumb";

            const barVisual = document.createElement("div");
            barVisual.className = "eq-bar-visual";

            faderEl.appendChild(barVisual);
            faderEl.appendChild(thumb);
            band.appendChild(faderEl);

            const label = document.createElement("div");
            label.className = "eq-band-label";
            label.textContent = freq;

            col.appendChild(band);
            col.appendChild(label);
            eqBands.appendChild(col);

            // Posição inicial
            updateFaderVisual(thumb, barVisual, eqValues[i]);
            // Torna interativo
            makeFaderInteractive(faderEl, thumb, barVisual, i);
        });
    }

    // Toggles EQ
    document.getElementById("eqOnBtn")?.addEventListener("click", function () {
        this.classList.toggle("active");
    });
    document.getElementById("eqAutoBtn")?.addEventListener("click", function () {
        this.classList.toggle("active");
    });


    // ════════════════════════════════════════
    // 8. PAINEL "O QUE ESTOU ASSISTINDO"
    // ════════════════════════════════════════
    const watchItems = [
        { file: 'imagens do que estou vendo no momento/Jujutsu_Kaisen_key_visual.png', title: 'Jujutsu Kaisen' },
        { file: 'imagens do que estou vendo no momento/demon slayer.jpg', title: 'Demon Slayer' },
        { file: 'imagens do que estou vendo no momento/dark.jpg', title: 'Dark' },
        { file: 'imagens do que estou vendo no momento/high fidelity.jpg', title: 'High Fidelity' },
        { file: 'imagens do que estou vendo no momento/1344x538-Q75_bbf86ebf4d3f84c511f1bdcf8cc3ac55.jpg', title: 'Em breve' },
    ];

    const watchGrid = document.getElementById("watchingGrid");
    if (watchGrid) {
        watchItems.forEach(item => {
            const el = document.createElement("div");
            el.className = "media-item";
            el.style.backgroundImage = `url('${item.file}')`;
            el.title = item.title;

            const titleDiv = document.createElement("div");
            titleDiv.className = "media-item-title";
            titleDiv.textContent = item.title;

            el.appendChild(titleDiv);
            watchGrid.appendChild(el);
        });
    }

    // ════════════════════════════════════════
    // 9. PAINEL "O QUE ESTOU LENDO"
    // ════════════════════════════════════════
    const readItems = [
        { file: 'o que estou lendo/1.png', title: 'Sprint — Jake Knapp' },
        { file: 'o que estou lendo/2.png', title: 'Estratégia de UX — Jaime Levy' },
        { file: 'o que estou lendo/71YL9YiqeuL.jpg', title: 'A Startup Enxuta — Eric Ries' },
        { file: 'o que estou lendo/81aDIHwv79L._UF1000,1000_QL80_.jpg', title: 'SCRUM — Jeff Sutherland' },
        { file: 'o que estou lendo/3.png', title: 'Lean UX — Jeff Gothelf' },
        { file: 'o que estou lendo/4.png', title: 'Redação Estratégica para UX' },
        { file: 'o que estou lendo/5.png', title: 'Demon Slayer Vol. 8' },
    ];

    const readGrid = document.getElementById("readingGrid");
    if (readGrid) {
        readItems.forEach(item => {
            const el = document.createElement("div");
            el.className = "media-item";
            el.style.backgroundImage = `url('${item.file}')`;
            el.style.backgroundSize = "contain";
            el.style.backgroundRepeat = "no-repeat";
            el.style.backgroundColor = "#000";
            el.title = item.title;

            const titleDiv = document.createElement("div");
            titleDiv.className = "media-item-title";
            titleDiv.textContent = item.title;

            el.appendChild(titleDiv);
            readGrid.appendChild(el);
        });
    }

    // ════════════════════════════════════════
    // 10. FOOTER CLOCK
    // ════════════════════════════════════════
    const clockEl = document.getElementById("footerClock");
    const updateClock = () => {
        if (!clockEl) return;
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");
        clockEl.textContent = `${hh}:${mm}:${ss}`;
    };
    updateClock();
    setInterval(updateClock, 1000);

    // ════════════════════════════════════════
    // 11. SPOTIFY WIDGET — MOCK ANIMADO
    // ════════════════════════════════════════
    const spotifyTracks = [
        { track: "505", artist: "Arctic Monkeys" },
        { track: "Ceremony", artist: "New Order" },
        { track: "Headup", artist: "Deftones" },
        { track: "Jesus Chorou", artist: "Racionais MC's" },
        { track: "Rotten Apple", artist: "Alice in Chains" },
    ];
    let spotifyIdx = 0;

    const rotateSpotify = () => {
        spotifyIdx = (spotifyIdx + 1) % spotifyTracks.length;
        const t = spotifyTracks[spotifyIdx];
        const trackEl = document.getElementById("spotifyTrack");
        const artistEl = document.getElementById("spotifyArtist");
        if (trackEl) trackEl.textContent = t.track;
        if (artistEl) artistEl.textContent = t.artist;
    };

    setInterval(rotateSpotify, 15000);
    // Inicializa Spotify display
    (() => {
        const t = spotifyTracks[0];
        const trackEl = document.getElementById("spotifyTrack");
        const artistEl = document.getElementById("spotifyArtist");
        if (trackEl) trackEl.textContent = t.track;
        if (artistEl) artistEl.textContent = t.artist;
    })();

    // ════════════════════════════════════════
    // THPS SCORE WIDGET — Score flutuante
    // ════════════════════════════════════════
    const scoreEl = document.getElementById("thpsScore");
    const multiplierEl = document.getElementById("thpsMultiplier");
    const trickEl = document.getElementById("thpsTrick");

    if (scoreEl) {
        const tricks = [
            "KICKFLIP", "HEELFLIP", "360 FLIP", "NOSEGRIND",
            "TAILSLIDE", "BLUNTSLIDE", "HARDFLIP", "INDY 900",
            "MCTWIST", "KICKFLIP BS 180", "SWITCH FLIP",
            "VARIAL HEEL", "CASPER SLIDE", "NOSEBLUNT",
        ];

        let currentScore = 47350;
        const MIN_SCORE = 3000;
        const MAX_SCORE = 100000;
        let direction = 1; // 1 = subindo, -1 = caindo

        const fmtScore = (n) => Math.round(n).toString().padStart(6, "0");

        const tickScore = () => {
            const big = Math.random() < 0.12;
            const delta = big
                ? (Math.random() * 8000 + 2000) * direction
                : (Math.random() * 800 + 50) * direction;

            currentScore += delta;

            if (currentScore >= MAX_SCORE) { currentScore = MAX_SCORE; direction = -1; }
            if (currentScore <= MIN_SCORE) { currentScore = MIN_SCORE; direction = 1; }

            scoreEl.textContent = fmtScore(currentScore);

            if (big) {
                scoreEl.style.transform = "scale(1.08)";
                setTimeout(() => { scoreEl.style.transform = ""; }, 150);
                if (trickEl) trickEl.textContent = tricks[Math.floor(Math.random() * tricks.length)];
                if (multiplierEl) multiplierEl.textContent = Math.floor(Math.random() * 5) + 2;
            }

            setTimeout(tickScore, Math.random() * 1500 + 300);
        };

        if (trickEl) trickEl.textContent = tricks[Math.floor(Math.random() * tricks.length)];
        if (multiplierEl) multiplierEl.textContent = 3;
        scoreEl.textContent = fmtScore(currentScore);
        setTimeout(tickScore, 800);
    }

});
