/* ═══════════════════════════════════════════════════
   desktop.js — TC UNDERGROUND OS INTERFACE v1.0
   Windows XP-inspired interactive desktop mockup
   Lazy-mounted: only renders when Start is clicked.
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── DATA ─────────────────────────────────────────
    const DATA = {
        games: [
            'Tony Hawk Pro Skater 2', 'Tony Hawk Pro Skater 3',
            'Tony Hawk Underground',
            'GTA San Andreas', 'GTA Vice City',
            'Tibia', 'The Sims 2', 'Half-Life 2',
            'Rollercoaster Tycoon', 'Counter-Strike 1.6',
            'Need for Speed Underground 2', 'M.U.G.E.N.',
            'Mafia 1', 'Fallout 2',
            'Grand Chase', 'MapleStory', 'RPG Maker',
            'Max Payne', 'Star Wars: Knights of the Old Republic',
            'Sim City 2000',
        ],
        books: [
            'SPRINT – Jake Knapp',
            'Estratégia de UX – Eric Goodman',
            'Lean UX – Jeff Gothelf',
            'Redação Estratégica para UX',
            'Não Me Faça Pensar – Steve Krug',
            'Leis da Psicologia Aplicadas a UX',
            'Design para a Internet – Felipe Memória',
            'Cultura da Interface – Steven Johnson',
        ],
        music: [
            '505 – Arctic Monkeys (4:14)',
            'Face – Brockhampton (4:19)',
            'Ceremony – New Order (4:39)',
            'Preciso me Encontrar – Cartola (2:59)',
            'Headup – Deftones (6:13)',
            'Rotten Apple – Alice in Chains (6:53)',
            'Jesus Chorou – Racionais (7:51)',
            'Feel – Robbie Williams (4:23)',
            'Unretrofied – Dillinger Escape Plan (5:38)',
            'Até que Durou – Péricles (5:13)',
            'Lying from You – Linkin Park (2:55)',
        ],
        trash: [],
    };

    // ── ICON DEFINITIONS ─────────────────────────────
    const ICONS = [
        { id: 'mycomputer', icon: '🖥️', label: 'Meu Computador' },
        { id: 'games', icon: '🎮', label: 'Meus Games' },
        { id: 'books', icon: '📚', label: 'Livros' },
        { id: 'music', icon: '🎵', label: 'Músicas' },
        { id: 'ie', icon: '🌐', label: 'TC Explorer' },
        { id: 'winamp', icon: '🎧', label: 'Tulioamp' },
        { id: 'paint', icon: '🎨', label: 'Tulio Paint' },
        { id: 'earth', icon: '🌎', label: 'Tulio Earth' },
        { id: 'burningrom', icon: '💿', label: 'Tulio Burning ROM' },
        { id: 'messenger', icon: '💬', label: 'Tulio Messenger' },
        { id: 'wordpad', icon: '📝', label: 'TulioPad' },
        { id: 'mediaplayer', icon: '🎬', label: 'Tulio Media Player' },
        { id: 'imageviewer', icon: '🖼️', label: 'Imagens' },
        { id: 'calculator', icon: '🖩', label: 'Calculadora' },
        { id: 'minesweeper', icon: '💣', label: 'Campo Minado' },
        { id: 'tulionet', icon: '☎️', label: 'TulioNet 56K' },
        { id: 'accelerator', icon: '🚀', label: 'Internet_Acelerator.exe' },
        { id: 'tuliowire', icon: '🍋', label: 'TulioWire' },
        { id: 'gta_cheats', icon: '📄', label: 'GTA_Cheats.txt' },
        { id: 'trash', icon: '🗑️', label: 'Lixeira' },
    ];

    // ── STATE ─────────────────────────────────────────
    let zTop = 100;
    let mounted = false;
    let shuttingDown = false;
    let clockTimer = null;
    let isOnline = false;
    const openWindows = {}; // id → window el

    // ── HELPERS ───────────────────────────────────────
    const h = (tag, attrs = {}, ...children) => {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => {
            if (k === 'class') el.className = v;
            else if (k === 'html') el.innerHTML = v;
            else if (k === 'style') Object.assign(el.style, v);
            else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
            else el.setAttribute(k, v);
        });
        children.flat().forEach(c => {
            if (c == null) return;
            el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return el;
    };

    const fmt2 = n => String(n).padStart(2, '0');
    const nowStr = () => {
        const d = new Date();
        return `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}:${fmt2(d.getSeconds())}`;
    };

    // ── DRAG ─────────────────────────────────────────
    function makeDraggable(win, handle) {
        let ox = 0, oy = 0, startX = 0, startY = 0, dragging = false;

        const start = (cx, cy) => {
            startX = cx;
            startY = cy;
            ox = parseInt(win.style.left) || 0;
            oy = parseInt(win.style.top) || 0;
            dragging = true;
            win.style.transition = 'none';
            document.body.style.userSelect = 'none';
        };

        const move = (cx, cy) => {
            if (!dragging) return;
            const dx = cx - startX;
            const dy = cy - startY;
            const desk = document.getElementById('xpDesktopArea');
            if (!desk) return;

            // Solitaire Win / IE Crash effect (Window trails)
            if (win.classList.contains('xp-win--frozen')) {
                const now = Date.now();
                if (now - (win.dataset.lastClone || 0) > 20) {
                    const clone = win.cloneNode(true);
                    clone.classList.remove('xp-win--active', 'xp-win--frozen');
                    clone.classList.add('xp-accel-clone');
                    clone.style.pointerEvents = 'none'; // Clones you can't click
                    clone.style.zIndex = zTop - 1;
                    desk.appendChild(clone);
                    win.dataset.lastClone = now;
                }
            }

            const maxX = desk.clientWidth - win.offsetWidth;
            const maxY = desk.clientHeight - win.offsetHeight;
            win.style.left = Math.max(0, Math.min(maxX, ox + dx)) + 'px';
            win.style.top = Math.max(0, Math.min(maxY, oy + dy)) + 'px';
        };

        const stop = () => {
            dragging = false;
            document.body.style.userSelect = '';
        };

        handle.addEventListener('mousedown', e => { if (e.button === 0) { focusWin(win); start(e.clientX, e.clientY); e.preventDefault(); } });
        window.addEventListener('mousemove', e => move(e.clientX, e.clientY));
        window.addEventListener('mouseup', stop);
        handle.addEventListener('touchstart', e => { focusWin(win); start(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
        window.addEventListener('touchmove', e => { if (dragging) { move(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); } }, { passive: false });
        window.addEventListener('touchend', stop);
    }

    // ── FOCUS WINDOW ─────────────────────────────────
    function focusWin(win) {
        zTop++;
        win.style.zIndex = zTop;
        Object.values(openWindows).forEach(w => w && w.classList.remove('xp-win--active'));
        win.classList.add('xp-win--active');
        updateTaskbar();
    }

    // ── WINDOW CONTENT BUILDERS ──────────────────────
    const CONTENT = {
        mycomputer: () => h('div', { class: 'xp-file-view' }, ...[
            { icon: '💾', name: 'Disco Local (C:)', detail: '80 GB' },
            { icon: '📀', name: 'CD-ROM (D:)', detail: 'Vazio' },
            { icon: '🖨️', name: 'Impressora HP', detail: 'Online' },
            { icon: '🖥️', name: 'Monitor LG', detail: '1024×768' },
        ].map(f => h('div', { class: 'xp-file-item' },
            h('span', { class: 'xp-fi-icon' }, f.icon),
            h('span', { class: 'xp-fi-name' }, f.name),
            h('span', { class: 'xp-fi-detail' }, f.detail),
        ))),

        games: () => h('div', { class: 'xp-file-view' }, ...DATA.games.map(g =>
            h('div', { class: 'xp-file-item' },
                h('span', { class: 'xp-fi-icon' }, '🎮'),
                h('span', { class: 'xp-fi-name' }, g),
            )
        )),

        books: () => h('div', { class: 'xp-file-view' }, ...DATA.books.map(b =>
            h('div', { class: 'xp-file-item' },
                h('span', { class: 'xp-fi-icon' }, '📖'),
                h('span', { class: 'xp-fi-name' }, b),
            )
        )),

        music: () => h('div', { class: 'xp-file-view' }, ...DATA.music.map(m =>
            h('div', { class: 'xp-file-item' },
                h('span', { class: 'xp-fi-icon' }, '🎵'),
                h('span', { class: 'xp-fi-name' }, m),
            )
        )),

        ie: () => {
            // ── TABS DATA — extraído dos nomes de arquivo ─────
            const TABS = [
                { name: 'Tony Hawk Underground', url: 'http://www.tonyhawkundegroundgame.com', img: 'telas pro tulio explorer/tonyhawkundegroundgame.com.png' },
                { name: 'Xbox.com', url: 'http://www.xbox.com', img: 'telas pro tulio explorer/xbox.com.png' },
                { name: 'NFS Underground', url: 'http://www.needforspeedunderground.com', img: 'telas pro tulio explorer/needforspeedunderground.com.png' },
                { name: 'NFS Underground 2', url: 'http://www.needforspeedunderground2.com', img: 'telas pro tulio explorer/needforspeedunderground2.com.png' },
                { name: 'Cartoon Network', url: 'http://www.cartoonnetwork.com', img: 'telas pro tulio explorer/cartoonnetwork.com.png' },
                { name: 'Submarino', url: 'http://www.submarino.com.br', img: 'telas pro tulio explorer/submarino.com.br.png' },
                { name: 'Naruto Project', url: 'http://www.narutoproject.com.br', img: 'telas pro tulio explorer/narutoproject.com.br.jpg' },
                { name: 'Magazine Luiza', url: 'http://www.magazineluiza.com.br', img: 'telas pro tulio explorer/magazineluiza.com.br.png' },
                { name: 'MySpace', url: 'http://www.myspace.com', img: 'telas pro tulio explorer/myspace.com.jpg' },
                { name: 'Orkut', url: 'http://www.orkut.com.br', img: 'telas pro tulio explorer/orkut.com.br.jpeg' },
            ];

            let activeIdx = 0; // Tony Hawk abre como aba ativa

            const wrap = h('div', { class: 'xp-browser xp-browser--tabbed' });
            const toolbar = h('div', {
                class: 'xp-ie-toolbar', html:
                    '<span>Arquivo</span><span>Editar</span><span>Exibir</span>' +
                    '<span>Favoritos</span><span>Ferramentas</span><span>Ajuda</span>'
            });
            const tabBar = h('div', { class: 'xp-tab-bar' });
            const addrBar = h('div', { class: 'xp-browser-bar' },
                h('span', { class: 'xp-browser-label' }, '🌐'),
            );
            const addrUrl = h('div', { class: 'xp-browser-url' });
            addrBar.appendChild(addrUrl);

            const body = h('div', { class: 'xp-browser-body xp-browser-scroll' });
            const siteImg = h('img', { class: 'xp-browser-site-img', alt: '' });
            body.appendChild(siteImg);

            const status = h('div', { class: 'xp-ie-status' });

            // Render tabs
            const tabEls = TABS.map((tab, i) => {
                const el = h('div', {
                    class: 'xp-tab' + (i === activeIdx ? ' xp-tab--active' : ''),
                    onclick: () => switchTab(i),
                }, tab.name);
                tabBar.appendChild(el);
                return el;
            });

            function switchTab(idx) {
                activeIdx = idx;
                const tab = TABS[idx];
                tabEls.forEach((el, i) => el.classList.toggle('xp-tab--active', i === idx));
                siteImg.src = tab.img;
                siteImg.alt = tab.name;
                addrUrl.textContent = tab.url;
                status.textContent = '✔ Concluído — ' + tab.url;
            }

            // Inicializa aba ativa
            switchTab(activeIdx);

            wrap.appendChild(toolbar);
            wrap.appendChild(tabBar);
            wrap.appendChild(addrBar);
            wrap.appendChild(body);
            wrap.appendChild(status);
            return wrap;
        },

        winamp: () => h('div', { class: 'xp-winamp' },
            h('div', { class: 'xp-wa-display' },
                h('div', { class: 'xp-wa-title' }, '⚡ TULIOAMP — Now Spinning'),
                h('div', { class: 'xp-wa-track' }, DATA.music[0]),
                h('div', { class: 'xp-wa-viz' }, ...Array.from({ length: 20 }, () =>
                    h('div', { class: 'xp-wa-bar' })
                )),
            ),
        ),

        // ── TULIO PAINT ─────────────────────────
        paint: () => {
            const PALETTE = [
                '#000', '#fff', '#808080', '#c0c0c0', '#800000', '#ff0000', '#ff6600',
                '#ffff00', '#808000', '#00ff00', '#008000', '#00ffff', '#008080',
                '#0000ff', '#000080', '#ff00ff', '#800080', '#ff69b4', '#8b4513', '#a0522d'
            ];
            let color = '#000000';
            let brushSize = 3;
            let drawing = false;

            const wrap = h('div', { class: 'xp-paint' });
            const toolbar = h('div', { class: 'xp-paint-toolbar' });
            const canvas = h('canvas', { class: 'xp-paint-canvas', width: 560, height: 320 });
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 560, 320);

            // Toolbar tools
            const tools = [{ id: 'pencil', icon: '✏️' }, { id: 'eraser', icon: '🧹' }, { id: 'fill', icon: '🪣' }];
            let activeTool = 'pencil';
            const toolBtns = {};
            tools.forEach(t => {
                const btn = h('button', {
                    class: 'xp-paint-tool' + (t.id === activeTool ? ' active' : ''),
                    title: t.id,
                    onclick: () => {
                        activeTool = t.id;
                        Object.values(toolBtns).forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                }, t.icon);
                toolBtns[t.id] = btn;
                toolbar.appendChild(btn);
            });

            // Brush size
            const sizeLabel = h('span', { class: 'xp-paint-label' }, 'Tam:');
            const sizeInput = h('input', { type: 'range', min: 1, max: 20, value: 3, class: 'xp-paint-range' });
            sizeInput.addEventListener('input', () => { brushSize = +sizeInput.value; });
            toolbar.appendChild(sizeLabel);
            toolbar.appendChild(sizeInput);

            // Clear
            const clearBtn = h('button', {
                class: 'xp-paint-tool', onclick: () => {
                    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }, '🗑️');
            toolbar.appendChild(clearBtn);

            // Palette
            const palette = h('div', { class: 'xp-paint-palette' });
            let colorSwatch;
            PALETTE.forEach(c => {
                const sw = h('div', {
                    class: 'xp-paint-swatch', style: { background: c }, onclick: () => {
                        color = c;
                        if (colorSwatch) colorSwatch.style.outline = '';
                        sw.style.outline = '2px solid #000';
                        colorSwatch = sw;
                    }
                });
                palette.appendChild(sw);
            });

            // ── Flood fill ──────────────────────────────────
            function hexToRgb(hex) {
                const h = hex.replace('#', '');
                return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
            }
            function floodFill(startX, startY, fillHex) {
                const [fr, fg, fb] = hexToRgb(fillHex);
                const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = img.data;
                const w = canvas.width;
                const h = canvas.height;
                const idx = (startY * w + startX) * 4;
                const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2];
                if (tr === fr && tg === fg && tb === fb) return;
                const tolerance = 30;
                const matches = (i) => Math.abs(data[i] - tr) <= tolerance && Math.abs(data[i + 1] - tg) <= tolerance && Math.abs(data[i + 2] - tb) <= tolerance;
                const stack = [startX + startY * w];
                const visited = new Uint8Array(w * h);
                while (stack.length) {
                    const pos = stack.pop();
                    if (visited[pos]) continue;
                    visited[pos] = 1;
                    const pi = pos * 4;
                    if (!matches(pi)) continue;
                    data[pi] = fr; data[pi + 1] = fg; data[pi + 2] = fb; data[pi + 3] = 255;
                    const x = pos % w, y = (pos / w) | 0;
                    if (x > 0) stack.push(pos - 1);
                    if (x < w - 1) stack.push(pos + 1);
                    if (y > 0) stack.push(pos - w);
                    if (y < h - 1) stack.push(pos + w);
                }
                ctx.putImageData(img, 0, 0);
            }

            // ── Draw events ─────────────────────────────────
            const getPos = (e) => {
                const r = canvas.getBoundingClientRect();
                const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
                const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
                return { x: cx * (canvas.width / r.width), y: cy * (canvas.height / r.height) };
            };

            canvas.addEventListener('mousedown', e => {
                const p = getPos(e);
                if (activeTool === 'fill') {
                    floodFill(Math.round(p.x), Math.round(p.y), color);
                    return;
                }
                drawing = true;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                if (activeTool === 'eraser') {
                    ctx.fillStyle = '#fff';
                    ctx.arc(p.x, p.y, brushSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath(); ctx.moveTo(p.x, p.y);
                }
            });
            canvas.addEventListener('mousemove', e => {
                if (!drawing) return;
                const p = getPos(e);
                if (activeTool === 'eraser') {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, brushSize, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = brushSize;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            });
            canvas.addEventListener('mouseup', () => drawing = false);
            canvas.addEventListener('mouseleave', () => drawing = false);

            wrap.appendChild(toolbar);
            wrap.appendChild(canvas);
            wrap.appendChild(palette);
            return wrap;
        },

        // ── TULIO EARTH ──────────────────────
        earth: () => {
            const wrap = h('div', { class: 'xp-earth' });
            const sidebar = h('div', { class: 'xp-earth-sidebar' },
                h('div', { class: 'xp-earth-title' }, '\ud83c\udf0e TULIO EARTH v1.0'),
                h('div', { class: 'xp-earth-search-label' }, 'Buscar local:'),
                h('input', { type: 'text', class: 'xp-earth-search', placeholder: 'ex: S\u00e3o Paulo, BR...' }),
                h('button', { class: 'xp-earth-btn' }, '\ud83d\udd0d Ir'),
                h('hr', {}),
                h('div', { class: 'xp-earth-coords', html: '\ud83d\udccd Lat: -23.5505\u00b0<br>\ud83d\udccd Lng: -46.6333\u00b0<br>\ud83d\udcc8 Alt: 800 km' }),
                h('div', { class: 'xp-earth-zoom' },
                    h('button', { class: 'xp-earth-btn' }, '+ Zoom'),
                    h('button', { class: 'xp-earth-btn' }, '\u2212 Zoom'),
                ),
                h('div', { class: 'xp-earth-layers' },
                    h('div', {}, '\ud83d\udda8 Camadas:'),
                    ...['Sat\u00e9lite', 'Fronteiras', 'Relevo', 'Nuvens'].map(l =>
                        h('label', { class: 'xp-earth-chk' },
                            h('input', { type: 'checkbox', checked: true }),
                            ' ' + l
                        )
                    )
                ),
            );
            const globe = h('div', { class: 'xp-earth-globe-wrap' },
                h('div', { class: 'xp-earth-globe' },
                    h('div', { class: 'xp-earth-globe-inner' }),
                    h('div', { class: 'xp-earth-grid' }),
                    h('div', { class: 'xp-earth-clouds' }),
                )
            );
            wrap.appendChild(sidebar);
            wrap.appendChild(globe);
            return wrap;
        },


        // ── TULIO BURNING ROM ─────────────
        burningrom: () => {
            const TRACKS = [
                '01 - 505 - Arctic Monkeys.mp3',
                '02 - Ceremony - New Order.mp3',
                '03 - Headup - Deftones.mp3',
                '04 - Jesus Chorou - Racionais.mp3',
                '05 - Feel - Robbie Williams.mp3',
                '06 - Lying from You - Linkin Park.mp3',
                '07 - Rotten Apple - Alice in Chains.mp3',
                '08 - Preciso me Encontrar - Cartola.mp3',
            ];

            let burning = false;
            const wrap = h('div', { class: 'xp-burn' });

            const header = h('div', { class: 'xp-burn-header' },
                h('span', { class: 'xp-burn-logo' }, '💿 TULIO BURNING ROM 2005'),
            );

            const config = h('div', { class: 'xp-burn-config' },
                h('label', {}, 'Tipo: '),
                h('select', { class: 'xp-burn-select' },
                    h('option', {}, 'CD de Áudio'),
                    h('option', {}, 'CD de Dados'),
                    h('option', {}, 'DVD-R'),
                ),
                h('label', {}, '  Velocidade: '),
                h('select', { class: 'xp-burn-select' },
                    h('option', {}, '52x'),
                    h('option', {}, '32x'),
                    h('option', {}, '16x'),
                    h('option', {}, '1x'),
                ),
            );

            const trackList = h('div', { class: 'xp-burn-tracklist' }, ...TRACKS.map((t, i) =>
                h('div', { class: 'xp-burn-track' },
                    h('span', { class: 'xp-burn-tracknum' }, String(i + 1).padStart(2, '0')),
                    h('span', { class: 'xp-burn-trackname' }, t),
                    h('span', { class: 'xp-burn-tracksize' }, (2.8 + Math.random() * 5).toFixed(1) + ' MB'),
                )
            ));

            const totalBar = h('div', { class: 'xp-burn-total' },
                h('span', {}, '🔵 Usado: 42.8 MB / 703 MB'),
                h('div', { class: 'xp-burn-usage-bar' },
                    h('div', { class: 'xp-burn-usage-fill', style: { width: '6%' } })
                ),
            );

            const progressLabel = h('div', { class: 'xp-burn-progress-label' }, 'Pronto para gravar.');
            const progressBar = h('div', { class: 'xp-burn-prog-bar' },
                h('div', { class: 'xp-burn-prog-fill', id: 'burnFill', style: { width: '0%' } }));

            const burnBtn = h('button', {
                class: 'xp-burn-btn', onclick: () => {
                    if (burning) return;
                    burning = true;
                    burnBtn.disabled = true;
                    progressLabel.textContent = '🔴 Gravando...';
                    const fill = wrap.querySelector('.xp-burn-prog-fill');
                    let pct = 0;
                    const iv = setInterval(() => {
                        pct = Math.min(100, pct + (Math.random() * 4 + 0.5));
                        fill.style.width = pct + '%';
                        progressLabel.textContent = '🔴 Gravando... ' + Math.round(pct) + '%';
                        if (pct >= 100) {
                            clearInterval(iv);
                            progressLabel.textContent = '✅ Gravação concluída!';
                            burning = false;
                            burnBtn.disabled = false;
                        }
                    }, 120);
                }
            }, '🔥 QUEIMAR CD');

            wrap.appendChild(header);
            wrap.appendChild(config);
            wrap.appendChild(trackList);
            wrap.appendChild(totalBar);
            wrap.appendChild(progressLabel);
            wrap.appendChild(progressBar);
            wrap.appendChild(burnBtn);
            return wrap;
        },

        // ── TULIO MESSENGER ─────────────
        messenger: () => {
            const TULIO_REPLIES = [
                'que bom cara, valeu por aparecer',
                'tudo certo por aí?',
                'com certeza, qualquer coisa é só falar',
                'muito obrigado mesmo, fico feliz',
                'show de bola, fico contente em saber',
                'é isso, abraço pra você',
                'boa, espero que goste',
                'valeu demais pelo apoio',
                'de nada, sempre que quiser',
                'boa pergunta, vou pensar nisso',
                'cara é um prazer conversar contigo',
                'seguimos em frente, obrigado',
            ];
            let replyIdx = 0;

            const wrap = h('div', { class: 'xp-msn' });

            // Contact list panel
            const contacts = h('div', { class: 'xp-msn-contacts' },
                h('div', { class: 'xp-msn-my-status' },
                    h('span', { class: 'xp-msn-dot online' }),
                    h('span', { class: 'xp-msn-me' }, 'Você'),
                    h('span', { class: 'xp-msn-status-label' }, 'Disponível'),
                ),
                h('div', { class: 'xp-msn-group-label' }, '👥 Online (1)'),
                h('div', {
                    class: 'xp-msn-contact',
                    onclick: () => chatPanel.style.display = 'flex',
                },
                    h('span', { class: 'xp-msn-dot online' }),
                    h('img', { src: 'TC UNDERGROUND.png', class: 'xp-msn-avatar', alt: 'Tulio' }),
                    h('div', { class: 'xp-msn-contact-info' },
                        h('div', { class: 'xp-msn-contact-name' }, 'Tulio Careli'),
                        h('div', { class: 'xp-msn-contact-status' }, 'já é \o/'),
                    ),
                ),
                h('div', { class: 'xp-msn-group-label' }, '👤 Offline (3)'),
                ...['Beto_Doido', 'xXx_Gamer_xXx', 'Zed_THPS'].map(n =>
                    h('div', { class: 'xp-msn-contact offline' },
                        h('span', { class: 'xp-msn-dot' }),
                        h('span', { class: 'xp-msn-contact-name offline' }, n),
                    )
                ),
            );

            const messages = [];

            const chatPanel = h('div', { class: 'xp-msn-chat', style: { display: 'none' } });
            const chatHeader = h('div', { class: 'xp-msn-chat-header' },
                h('span', {}, '💬 Chat com Tulio Careli'),
                h('button', { class: 'xp-msn-close-chat', onclick: () => chatPanel.style.display = 'none' }, '×'),
            );
            const msgArea = h('div', { class: 'xp-msn-messages' });
            const inputArea = h('div', { class: 'xp-msn-input-area' });
            const input = h('input', { type: 'text', class: 'xp-msn-input', placeholder: 'Digite uma mensagem...' });
            const sendBtn = h('button', { class: 'xp-msn-send', onclick: sendMsg }, 'Enviar');
            input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });

            function addMsg(text, from) {
                const row = h('div', { class: 'xp-msn-msg xp-msn-msg--' + from },
                    h('span', { class: 'xp-msn-msg-author' }, from === 'me' ? 'Eu' : 'Tulio'),
                    h('span', { class: 'xp-msn-msg-text' }, text),
                );
                msgArea.appendChild(row);
                msgArea.scrollTop = msgArea.scrollHeight;
            }

            function sendMsg() {
                const txt = input.value.trim();
                if (!txt) return;
                addMsg(txt, 'me');
                input.value = '';
                // Auto-reply do Tulio com delay
                const reply = TULIO_REPLIES[replyIdx % TULIO_REPLIES.length];
                replyIdx++;
                setTimeout(() => addMsg(reply, 'tulio'), 1200 + Math.random() * 800);
            }

            // Mensagem inicial do Tulio
            setTimeout(() => addMsg('e aí, tudo bem? que bom ver você por aqui', 'tulio'), 800);

            inputArea.appendChild(input);
            inputArea.appendChild(sendBtn);
            chatPanel.appendChild(chatHeader);
            chatPanel.appendChild(msgArea);
            chatPanel.appendChild(inputArea);

            wrap.appendChild(contacts);
            wrap.appendChild(chatPanel);
            return wrap;
        },

        trash: () => h('div', { class: 'xp-file-view xp-empty' },
            h('div', { class: 'xp-empty-msg' }, '🗑️ A Lixeira está vazia.'),
        ),

        // ── WORDPAD ─────────────────────────────────────
        wordpad: () => {
            const wrap = h('div', { class: 'xp-wordpad' });

            const toolbar = h('div', {
                class: 'xp-ie-toolbar', html:
                    '<span>Arquivo</span><span>Editar</span><span>Exibir</span>' +
                    '<span>Inserir</span><span>Formatar</span><span>Ajuda</span>'
            });

            // Elementos interativos
            const fontSelect = h('select', { class: 'xp-wp-select' },
                h('option', { value: 'Arial' }, 'Arial'),
                h('option', { value: 'Times New Roman', selected: true }, 'Times New Roman'),
                h('option', { value: 'Tahoma' }, 'Tahoma'),
                h('option', { value: 'Comic Sans MS' }, 'Comic Sans MS')
            );

            // Tamanhos simulados do Word (mapeados para px na interface web para ficar legível)
            const sizeSelect = h('select', { class: 'xp-wp-select xp-wp-select-size' },
                h('option', { value: '12px' }, '10'),
                h('option', { value: '16px', selected: true }, '12'),
                h('option', { value: '20px' }, '14'),
                h('option', { value: '26px' }, '18'),
                h('option', { value: '34px' }, '24')
            );

            const btnB = h('button', { class: 'xp-wp-btn', title: 'Negrito' }, h('b', {}, 'N'));
            const btnI = h('button', { class: 'xp-wp-btn', title: 'Itálico' }, h('i', {}, 'I'));
            const btnU = h('button', { class: 'xp-wp-btn', title: 'Sublinhado' }, h('u', {}, 'S'));

            const formatBar = h('div', { class: 'xp-wp-formatbar' },
                fontSelect, sizeSelect, btnB, btnI, btnU
            );

            const ruler = h('div', { class: 'xp-wp-ruler' });

            const textArea = h('textarea', { class: 'xp-wp-textarea', spellcheck: false, placeholder: 'Comece a digitar o seu texto aqui...' });

            const editorArea = h('div', { class: 'xp-wp-editor' }, textArea);

            // ── LÓGICA DE FORMATAÇÃO ──
            fontSelect.addEventListener('change', e => { textArea.style.fontFamily = e.target.value; });
            sizeSelect.addEventListener('change', e => { textArea.style.fontSize = e.target.value; });

            let isBold = false, isItalic = false, isUnderline = false;

            const toggleBtnStyle = (btn, active) => {
                btn.style.borderColor = active ? '#888 #fff #fff #888' : '';
                btn.style.background = active ? '#b8c8e8' : '';
                btn.style.padding = active ? '1px 0 0 1px' : '';
            };

            btnB.addEventListener('click', () => {
                isBold = !isBold;
                textArea.style.fontWeight = isBold ? 'bold' : 'normal';
                toggleBtnStyle(btnB, isBold);
            });
            btnI.addEventListener('click', () => {
                isItalic = !isItalic;
                textArea.style.fontStyle = isItalic ? 'italic' : 'normal';
                toggleBtnStyle(btnI, isItalic);
            });
            btnU.addEventListener('click', () => {
                isUnderline = !isUnderline;
                textArea.style.textDecoration = isUnderline ? 'underline' : 'none';
                toggleBtnStyle(btnU, isUnderline);
            });

            wrap.appendChild(toolbar);
            wrap.appendChild(formatBar);
            wrap.appendChild(ruler);
            wrap.appendChild(editorArea);

            return wrap;
        },

        // ── MEDIA PLAYER ─────────────────────────────────────
        mediaplayer: () => {
            const wrap = h('div', { class: 'xp-wmp' });

            const VIDS = [
                'iuJDhFRDx9M', // 1° solicitado anteriormente
                'Gdp4k77RZGA', // 2° solicitado agora
                'oHg5SJYRHA0', // Novo solicitado
                'z9XkY84MUls',
                'VgDgWzBL7s4',
                'Ro7yHf_pU14',
                'qnexXNl24cE',
                'psLGf9eKOAQ',
                'k85mRPqvMbE',
                'pFlcqWQVVuU'
            ];
            let currentIdx = 0;
            let ytPlayer;
            let checkInterval;
            let ytReady = false;

            const toolbar = h('div', {
                class: 'xp-ie-toolbar xp-wmp-toolbar', html:
                    '<span>Arquivo</span><span>Exibir</span><span>Tocar</span><span>Ferramentas</span><span>Ajuda</span>'
            });

            const videoWrapper = h('div', { class: 'xp-wmp-screen-wrap' });
            // Um escudo (overlay bloqueador) por cima do iframe para impedir pausar clicando no botão do YT
            const blocker = h('div', { class: 'xp-wmp-blocker' });
            const playerContainer = h('div', { class: 'xp-wmp-yt-container' });

            videoWrapper.appendChild(playerContainer);
            videoWrapper.appendChild(blocker);

            const controlsWrap = h('div', { class: 'xp-wmp-controls' });
            const progressBar = h('input', { type: 'range', class: 'xp-wmp-seek', min: 0, max: 100, value: 0 });

            const btnWrap = h('div', { class: 'xp-wmp-btns' });
            const btnPrev = h('button', { class: 'xp-wmp-btn', title: 'Anterior' }, '⏮');
            const btnPlay = h('button', { class: 'xp-wmp-btn xp-wmp-play', title: 'Reproduzir/Pausar' }, '▶');
            const btnNext = h('button', { class: 'xp-wmp-btn', title: 'Próximo' }, '⏭');
            const timeLabel = h('div', { class: 'xp-wmp-time' }, '00:00 / 00:00');

            btnWrap.appendChild(btnPrev);
            btnWrap.appendChild(btnPlay);
            btnWrap.appendChild(btnNext);
            btnWrap.appendChild(timeLabel);

            controlsWrap.appendChild(progressBar);
            controlsWrap.appendChild(btnWrap);

            wrap.appendChild(toolbar);
            wrap.appendChild(videoWrapper);
            wrap.appendChild(controlsWrap);

            const formatTime = (secs) => {
                if (!secs) return '00:00';
                secs = Math.floor(secs);
                const m = Math.floor(secs / 60);
                const s = secs % 60;
                return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            };

            const ensureAPIReady = (callback) => {
                if (window.YT && window.YT.Player) {
                    callback();
                } else {
                    if (!document.getElementById('yt-iframe-api')) {
                        const script = document.createElement('script');
                        script.id = 'yt-iframe-api';
                        script.src = 'https://www.youtube.com/iframe_api';
                        document.head.appendChild(script);
                    }
                    const checkYT = setInterval(() => {
                        if (window.YT && window.YT.Player) {
                            clearInterval(checkYT);
                            callback();
                        }
                    }, 100);
                }
            };

            // Criar ID unico pro iframe para a API do Google mapear corretamente
            const playerDivId = 'yt-player-' + Date.now();
            playerContainer.id = playerDivId;

            ensureAPIReady(() => {
                ytPlayer = new window.YT.Player(playerDivId, {
                    height: '100%',
                    width: '100%',
                    videoId: VIDS[currentIdx],
                    playerVars: {
                        'playsinline': 1,
                        'controls': 0, // Esconde os controles nativos
                        'disablekb': 1,
                        'fs': 0, // Desativa botão fullscreen
                        'modestbranding': 1,
                        'rel': 0
                    },
                    events: {
                        'onReady': () => {
                            ytReady = true;

                            // Clique no bloqueador (em cima do video) faz play/pause
                            blocker.onclick = () => {
                                const state = ytPlayer.getPlayerState();
                                if (state === window.YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
                                else ytPlayer.playVideo();
                            };

                            // Atualização da barrinha de tempo
                            checkInterval = setInterval(() => {
                                if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
                                const c = ytPlayer.getCurrentTime();
                                const d = ytPlayer.getDuration();
                                if (d > 0) {
                                    progressBar.value = (c / d) * 100;
                                    timeLabel.textContent = `${formatTime(c)} / ${formatTime(d)}`;
                                }
                            }, 300);
                        },
                        'onStateChange': (e) => {
                            if (e.data === window.YT.PlayerState.PLAYING) {
                                btnPlay.textContent = '⏸';
                            } else {
                                btnPlay.textContent = '▶';
                            }
                        }
                    }
                });
            });

            // Botões do Player
            btnPlay.onclick = () => {
                if (!ytReady) return;
                const state = ytPlayer.getPlayerState();
                if (state === window.YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
                else ytPlayer.playVideo();
            };

            btnNext.onclick = () => {
                if (!ytReady) return;
                currentIdx = (currentIdx + 1) % VIDS.length;
                ytPlayer.loadVideoById(VIDS[currentIdx]);
            };

            btnPrev.onclick = () => {
                if (!ytReady) return;
                currentIdx = (currentIdx - 1 + VIDS.length) % VIDS.length;
                ytPlayer.loadVideoById(VIDS[currentIdx]);
            };

            progressBar.addEventListener('input', (e) => {
                if (!ytReady) return;
                const d = ytPlayer.getDuration();
                const seekTo = (e.target.value / 100) * d;
                ytPlayer.seekTo(seekTo, true);
            });

            // Limpeza caso a janela seja fechada no desktop
            const cleanupInterval = setInterval(() => {
                if (!document.body.contains(wrap)) {
                    clearInterval(checkInterval);
                    clearInterval(cleanupInterval);
                    if (ytPlayer && typeof ytPlayer.destroy === 'function') ytPlayer.destroy();
                }
            }, 1000);

            return wrap;
        },

        // ── VISUALIZADOR DE IMAGENS ─────────────────────────────────────
        imageviewer: () => {
            const wrap = h('div', { class: 'xp-img-viewer' });

            const IMAGES = [
                'imagens/2-fast-2-furious-paul-walker-brian-oconner-car-wallpaper-thumb.jpg',
                'imagens/5580714839_0bd41901d5_b.jpg',
                'imagens/A03sDh.jpg',
                'imagens/HD-wallpaper-2-fast-2-furious-hot-cars-tyrese-gibson-thumbnail.jpg',
                'imagens/NIBXVEi.png',
                'imagens/THUG_11.jpg',
                'imagens/Toa_inika.jpg',
                'imagens/XwK--yGuGfhX5pE6OB6XGdmfyD0qLgcT2RiVGHXZJmU.jpg',
                'imagens/slipknot-nu-metal-moda-gq.avif',
                'imagens/thug_wp_02_1024x786.jpg',
                'imagens/thug_wp_03_1024x768.jpg',
                'imagens/v2XKEcN.png'
            ];

            let curIdx = 0;
            let currentRotation = 0;

            const displayWrap = h('div', { class: 'xp-img-display' });
            const imgElement = h('img', { src: IMAGES[curIdx], alt: 'Imagem do visualizador' });
            displayWrap.appendChild(imgElement);

            const toolbar = h('div', { class: 'xp-img-toolbar' });

            // Botões Clássicos do Visualizador do XP
            const btnPrev = h('button', { class: 'xp-img-btn', title: 'Imagem Anterior (Seta Esquerda)' }, '⬅️');
            const btnNext = h('button', { class: 'xp-img-btn', title: 'Próxima Imagem (Seta Direita)' }, '➡️');
            const btnRotateL = h('button', { class: 'xp-img-btn', title: 'Girar no Sentido Anti-horário' }, '↺');
            const btnRotateR = h('button', { class: 'xp-img-btn', title: 'Girar no Sentido Horário' }, '↻');

            // Navegação
            const updateImage = () => {
                imgElement.src = IMAGES[curIdx];
                currentRotation = 0; // zera pro padrão da nova foto
                imgElement.style.transform = `rotate(0deg)`;
            };

            btnPrev.onclick = () => {
                curIdx = (curIdx - 1 + IMAGES.length) % IMAGES.length;
                updateImage();
            };

            btnNext.onclick = () => {
                curIdx = (curIdx + 1) % IMAGES.length;
                updateImage();
            };

            // Rotação Mock
            btnRotateL.onclick = () => {
                currentRotation -= 90;
                imgElement.style.transform = `rotate(${currentRotation}deg)`;
            };

            btnRotateR.onclick = () => {
                currentRotation += 90;
                imgElement.style.transform = `rotate(${currentRotation}deg)`;
            };

            toolbar.appendChild(btnPrev);
            toolbar.appendChild(btnNext);
            toolbar.appendChild(btnRotateL);
            toolbar.appendChild(btnRotateR);

            wrap.appendChild(displayWrap);
            wrap.appendChild(toolbar);

            return wrap;
        },

        calculator: () => {
            const wrap = h('div', { class: 'xp-calc' });
            const display = h('div', { class: 'xp-calc-display' }, '0');
            const grid = h('div', { class: 'xp-calc-grid' });

            let current = '0';
            let stored = null;
            let op = null;

            const update = () => {
                // Limita para caber no display
                display.textContent = current.length > 12 ? current.substring(0, 12) : current;
            };

            const btn = (label, action, cls = '') => h('button', {
                class: 'xp-calc-btn ' + cls,
                onclick: () => { action(); update(); }
            }, label);

            const num = (n) => btn(n, () => {
                if (current === '0' || current === 'Error') current = n;
                else current += n;
            });

            const operate = (newOp) => btn(newOp, () => {
                if (stored !== null && op) {
                    try { current = String(eval(stored + op + current)); }
                    catch (e) { current = 'Error'; }
                }
                stored = current;
                current = '0';
                op = newOp === 'x' ? '*' : newOp;
            }, 'op');

            const eq = btn('=', () => {
                if (stored !== null && op) {
                    try { current = String(eval(stored + op + current)); }
                    catch (e) { current = 'Error'; }
                    stored = null;
                    op = null;
                }
            }, 'eq');

            const c = btn('C', () => { current = '0'; stored = null; op = null; }, 'clear');

            const buttons = [
                '7', '8', '9', '/',
                '4', '5', '6', '*',
                '1', '2', '3', '-',
                'C', '0', '=', '+'
            ];

            buttons.forEach(b => {
                if (/\d/.test(b)) grid.appendChild(num(b));
                else if (b === 'C') grid.appendChild(c);
                else if (b === '=') grid.appendChild(eq);
                else grid.appendChild(operate(b));
            });

            wrap.appendChild(display);
            wrap.appendChild(grid);
            return wrap;
        },

        minesweeper: () => {
            const wrap = h('div', { class: 'xp-minesweeper' });
            const header = h('div', { class: 'xp-ms-header' });
            const p1 = h('div', { class: 'xp-ms-counter' }, '010');
            const face = h('button', { class: 'xp-ms-face' }, '🙂');
            const p2 = h('div', { class: 'xp-ms-counter' }, '000');
            header.appendChild(p1); header.appendChild(face); header.appendChild(p2);

            const grid = h('div', { class: 'xp-ms-grid' });
            let gameOver = false;

            const cells = [];
            for (let i = 0; i < 64; i++) {
                const cell = h('button', { class: 'xp-ms-cell' });
                cell.onclick = () => {
                    if (gameOver) return;
                    gameOver = true;
                    face.textContent = '😵';
                    cell.style.backgroundColor = 'red';
                    // Reveal all troll
                    cells.forEach(c => {
                        c.classList.add('xp-ms-revealed');
                        c.textContent = Math.random() > 0.7 ? '💣' : (Math.floor(Math.random() * 3) || '');
                    });
                    cell.textContent = '💣';
                    setTimeout(() => alert('ERRO FATAL. VOCÊ PISOU NA MINA! KABOOM!'), 100);
                };
                cells.push(cell);
                grid.appendChild(cell);
            }

            face.onclick = () => {
                gameOver = false;
                face.textContent = '🙂';
                cells.forEach(c => {
                    c.classList.remove('xp-ms-revealed');
                    c.textContent = '';
                    c.style.backgroundColor = '';
                });
            };

            wrap.appendChild(header);
            wrap.appendChild(grid);
            return wrap;
        },

        paint: () => {
            const wrap = h('div', { class: 'xp-paint' });
            const toolbar = h('div', { class: 'xp-paint-toolbar' });
            const drawBtn = h('button', { class: 'xp-paint-btn xp-pb-active', title: 'Lápis' }, '✏️');
            const eraseBtn = h('button', { class: 'xp-paint-btn', title: 'Borracha' }, '🧽');
            const fillBtn = h('button', { class: 'xp-paint-btn', title: 'Balde de Tinta' }, '🪣');
            const clearBtn = h('button', { class: 'xp-paint-btn', title: 'Limpar Tela' }, '🗑️');

            let mode = 'draw'; // draw, erase, fill
            let currentColor = '#000000';

            const setMode = (m) => {
                mode = m;
                [drawBtn, eraseBtn, fillBtn].forEach(b => b.classList.remove('xp-pb-active'));
                if (m === 'draw') drawBtn.classList.add('xp-pb-active');
                if (m === 'erase') eraseBtn.classList.add('xp-pb-active');
                if (m === 'fill') fillBtn.classList.add('xp-pb-active');
            };
            drawBtn.onclick = () => setMode('draw');
            eraseBtn.onclick = () => setMode('erase');
            fillBtn.onclick = () => setMode('fill');

            toolbar.appendChild(drawBtn);
            toolbar.appendChild(eraseBtn);
            toolbar.appendChild(fillBtn);
            toolbar.appendChild(clearBtn);

            const canvasWrap = h('div', { class: 'xp-paint-canvas-wrap' });
            // Paint canvas default dimensions
            const canvas = h('canvas', { width: 440, height: 320, class: 'xp-paint-canvas' });
            canvasWrap.appendChild(canvas);

            // Palette
            const colors = [
                '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
                '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
            ];
            const paletteWrap = h('div', { style: { display: 'flex', gap: '2px', padding: '4px', flexWrap: 'wrap', backgroundColor: '#ece9d8', borderTop: '1px solid #888' } });

            let activeColorSpan = h('div', { style: { width: '34px', height: '34px', border: '1px inset #888', marginRight: '10px', backgroundColor: currentColor } });
            paletteWrap.appendChild(activeColorSpan);

            const gridC = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px' } });
            colors.forEach(c => {
                const cBtn = h('button', { style: { width: '16px', height: '16px', backgroundColor: c, border: '1px outset #fff', cursor: 'pointer', padding: '0' } });
                cBtn.onclick = () => { currentColor = c; activeColorSpan.style.backgroundColor = c; };
                gridC.appendChild(cBtn);
            });
            paletteWrap.appendChild(gridC);

            wrap.appendChild(toolbar);
            wrap.appendChild(canvasWrap);
            wrap.appendChild(paletteWrap);

            // Setup canvas drawing context
            setTimeout(() => {
                if (!canvas.getContext) return;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                let painting = false;

                const getPos = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                    return {
                        x: (clientX - rect.left) * (canvas.width / rect.width),
                        y: (clientY - rect.top) * (canvas.height / rect.height)
                    };
                };

                // FloodFill Algorithm without recursive memory leaks
                const floodFill = (x, y, fillHex) => {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const w = canvas.width;
                    const h = canvas.height;

                    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fillHex);
                    if (!res) return;
                    const r = parseInt(res[1], 16), g = parseInt(res[2], 16), b = parseInt(res[3], 16), a = 255;

                    x = Math.floor(x); y = Math.floor(y);
                    if (x < 0 || y < 0 || x >= w || y >= h) return;

                    const px = (y * w + x) * 4;
                    const startR = data[px], startG = data[px + 1], startB = data[px + 2], startA = data[px + 3];

                    if (startR === r && startG === g && startB === b && startA === a) return;

                    const stack = [[x, y]];
                    while (stack.length) {
                        const [cx, cy] = stack.pop();
                        let currPx = (cy * w + cx) * 4;
                        let lx = cx;

                        while (lx >= 0 && data[currPx] === startR && data[currPx + 1] === startG && data[currPx + 2] === startB && data[currPx + 3] === startA) {
                            lx--;
                            currPx -= 4;
                        }
                        lx++;
                        currPx += 4;

                        let spanAbove = false;
                        let spanBelow = false;

                        while (lx < w && data[currPx] === startR && data[currPx + 1] === startG && data[currPx + 2] === startB && data[currPx + 3] === startA) {
                            data[currPx] = r; data[currPx + 1] = g; data[currPx + 2] = b; data[currPx + 3] = a;

                            if (cy > 0) {
                                const up = currPx - w * 4;
                                const match = data[up] === startR && data[up + 1] === startG && data[up + 2] === startB && data[up + 3] === startA;
                                if (!spanAbove && match) {
                                    stack.push([lx, cy - 1]);
                                    spanAbove = true;
                                } else if (spanAbove && !match) {
                                    spanAbove = false;
                                }
                            }
                            if (cy < h - 1) {
                                const dn = currPx + w * 4;
                                const match = data[dn] === startR && data[dn + 1] === startG && data[dn + 2] === startB && data[dn + 3] === startA;
                                if (!spanBelow && match) {
                                    stack.push([lx, cy + 1]);
                                    spanBelow = true;
                                } else if (spanBelow && !match) {
                                    spanBelow = false;
                                }
                            }
                            lx++;
                            currPx += 4;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                };

                const startFormat = (e) => {
                    const p = getPos(e);
                    if (mode === 'fill') {
                        floodFill(p.x, p.y, currentColor);
                        if (e.cancelable) e.preventDefault();
                        return;
                    }
                    painting = true;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    if (e.cancelable) e.preventDefault();
                };

                const draw = (e) => {
                    if (!painting || mode === 'fill') return;
                    if (e.cancelable) e.preventDefault();
                    const p = getPos(e);
                    ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = mode === 'erase' ? '#ffffff' : currentColor;
                    ctx.lineWidth = mode === 'erase' ? 20 : 2;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                };

                const stopFormat = () => {
                    painting = false;
                    ctx.closePath();
                };

                canvas.addEventListener('mousedown', startFormat);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', stopFormat);
                canvas.addEventListener('mouseleave', stopFormat);

                // Mobile
                canvas.addEventListener('touchstart', startFormat, { passive: false });
                canvas.addEventListener('touchmove', draw, { passive: false });
                canvas.addEventListener('touchend', stopFormat, { passive: false });

                clearBtn.onclick = () => {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                };
            }, 50); // delay allows UI to mount

            return wrap;
        },

        winamp: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#1c1c1c', border: '2px solid #333', color: '#00ff00', fontFamily: 'Courier New' } });

            // Layout bem old-school
            const head = h('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: '#0a0a0a', borderBottom: '1px solid #333', fontSize: '10px' } });
            head.innerHTML = `<span>TULIOAMP</span> <span>kbps: 128 kHz: 44</span>`;

            const display = h('div', { style: { padding: '10px', textAlign: 'center', fontSize: '14px', flex: '1', borderBottom: '1px solid #333' } });
            display.textContent = '01. Cant get over you, tell me you will come back baby.mp3';

            const spectrum = h('div', { style: { display: 'flex', height: '30px', margin: '5px auto', width: '80%', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', opacity: 0.5 } });

            // Barrinhas do spectro
            const bars = [];
            for (let i = 0; i < 15; i++) {
                const b = h('div', { style: { width: '8px', background: '#00ff00', height: (Math.random() * 80 + 20) + '%' } });
                bars.push(b);
                spectrum.appendChild(b);
            }
            display.appendChild(spectrum);

            const controls = h('div', { style: { display: 'flex', gap: '5px', padding: '10px', justifyContent: 'center', background: '#111' } });
            const playBtn = h('button', { style: { background: '#333', color: '#00ff00', border: '1px outset #555', cursor: 'pointer', padding: '4px 12px', fontWeight: 'bold' } }, '▶ PLAY');
            const stopBtn = h('button', { style: { background: '#333', color: '#00ff00', border: '1px outset #555', cursor: 'pointer', padding: '4px 12px', fontWeight: 'bold' } }, '◼ STOP');

            let animInterval = null;

            playBtn.onclick = () => {
                spectrum.style.opacity = 1;
                clearInterval(animInterval);
                animInterval = setInterval(() => {
                    bars.forEach(b => b.style.height = (Math.random() * 90 + 10) + '%');
                }, 150);

                // "Winamp, it really whips the llama's ass!" via TTS
                if ('speechSynthesis' in window) {
                    const u = new SpeechSynthesisUtterance("Tulioamp. It really whips the llama's ass.");
                    u.lang = 'en-US';
                    u.pitch = 0.5; // voz mais grave/comprimida
                    u.rate = 1.2;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(u);
                }
            };

            stopBtn.onclick = () => {
                spectrum.style.opacity = 0.5;
                clearInterval(animInterval);
                bars.forEach(b => b.style.height = '10%');
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };

            controls.appendChild(playBtn);
            controls.appendChild(stopBtn);

            wrap.appendChild(head);
            wrap.appendChild(display);
            wrap.appendChild(controls);

            return wrap;
        },

        messenger: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f5f5', fontFamily: 'Tahoma' } });

            const viewContainer = h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } });
            wrap.appendChild(viewContainer);

            const playNudgeSound = () => {
                try {
                    const C = window.AudioContext || window.webkitAudioContext;
                    if (C) {
                        const c = new C();
                        const g = c.createGain();
                        const o = c.createOscillator();
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(150, c.currentTime);
                        o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.3);
                        g.gain.setValueAtTime(1, c.currentTime);
                        g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.3);
                        o.connect(g);
                        g.connect(c.destination);
                        o.start();
                        o.stop(c.currentTime + 0.4);
                    }
                } catch (err) { }
            };

            const renderChat = (contactName, subtitle, isLets) => {
                viewContainer.innerHTML = '';

                const header = h('div', { style: { padding: '8px', background: '#fff', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', gap: '8px' } });

                const backBtn = h('button', { style: { padding: '2px 5px', fontSize: '10px', cursor: 'pointer' }, onclick: renderContacts }, '◀ Voltar');
                header.appendChild(backBtn);

                const titleInfo = h('div', { html: `<h3 style="margin:0; font-size:12px; color:#1c4b9e">${contactName}</h3><p style="margin:0; font-size:10px; color:#666">${subtitle}</p>` });

                const iconWrap = h('span', { style: { fontSize: '20px' } }, '💬');
                header.appendChild(iconWrap);
                header.appendChild(titleInfo);

                const chatBox = h('div', { style: { flex: 1, padding: '10px', background: '#fff', overflowY: 'auto', borderBottom: '1px solid #ccc' } });
                chatBox.innerHTML = `<div style="color: #888; text-align: center; font-size: 10px; margin-bottom: 10px">--- ${contactName} acabou de entrar ---</div>`;

                if (isLets) {
                    chatBox.innerHTML += `
                        <div style="margin-bottom: 5px"><strong style="color: #666">${contactName} diz:</strong></div>
                        <div style="margin-bottom: 10px; padding-left: 10px; font-family: 'Comic Sans MS'; color: #000080">oioioioi</div>
                    `;
                } else {
                    chatBox.innerHTML += `
                        <div style="margin-bottom: 5px"><strong style="color: #666">${contactName} diz:</strong></div>
                        <div style="margin-bottom: 10px; padding-left: 10px; color: #000080">Olá, tudo bem por ai?</div>
                    `;
                }

                const inputBox = h('div', { style: { height: '80px', padding: '5px', background: '#ece9d8', display: 'flex', flexDirection: 'column' } });

                const toolBar = h('div', { style: { display: 'flex', gap: '4px', marginBottom: '4px' } });
                toolBar.innerHTML = `<span style="cursor:pointer">🅰️</span><span style="cursor:pointer">😊</span><span style="cursor:pointer">🎵</span>`;

                const form = h('form', { style: { display: 'flex', gap: '5px', flex: 1 } });
                const input = h('input', { type: 'text', style: { flex: 1, border: '1px solid #7f9db9', padding: '4px' }, placeholder: 'Escreva uma mensagem...' });
                const btn = h('button', { type: 'submit', style: { padding: '0 15px', fontFamily: 'Tahoma' } }, 'Enviar');

                form.appendChild(input);
                form.appendChild(btn);
                inputBox.appendChild(toolBar);
                inputBox.appendChild(form);

                let letsNudgeSent = false;

                form.onsubmit = (e) => {
                    e.preventDefault();
                    if (!input.value.trim()) return;

                    const msg = input.value;
                    const msgWrap = document.createElement('div');
                    msgWrap.innerHTML = `<div style="margin-bottom: 5px; margin-top: 10px"><strong style="color: #000">Você diz:</strong></div><div style="padding-left: 10px">${msg}</div>`;
                    chatBox.appendChild(msgWrap);
                    input.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // AI response logic
                    if (isLets && !letsNudgeSent) {
                        letsNudgeSent = true;
                        setTimeout(() => {
                            const notice = document.createElement('div');
                            notice.style.color = 'red';
                            notice.style.fontWeight = 'bold';
                            notice.style.textAlign = 'center';
                            notice.style.margin = '10px 0';
                            notice.innerText = "Lets acaba de enviar um chamar a atenção!";
                            chatBox.appendChild(notice);
                            chatBox.scrollTop = chatBox.scrollHeight;

                            const desk = document.getElementById('xpDesktop');
                            if (desk) {
                                desk.classList.add('xp-nudge-shake');
                                setTimeout(() => desk.classList.remove('xp-nudge-shake'), 400);
                            }
                            playNudgeSound();
                        }, 1500);
                    } else if (!isLets) {
                        // Tulio bot response
                        setTimeout(() => {
                            const responses = [
                                "Poxa, que legal ouvir isso!",
                                "Lembra daquelas tardes jogando no fliperama? Bons tempos.",
                                "Fico muito feliz em saber disso, meu amigo.",
                                "Com certeza! Sempre que precisar, estou por aqui.",
                                "Nossa, faz tanto tempo que não nos falamos né? Saudade!",
                                "Claro, claro. Faz todo o sentido, muito legal da sua parte."
                            ];
                            const resp = msg.toLowerCase().includes('?') ? "Hmm, ótima pergunta. Vou ter que pensar um pouco sobre isso, meu caro." : responses[Math.floor(Math.random() * responses.length)];

                            const botWrap = document.createElement('div');
                            botWrap.innerHTML = `<div style="margin-bottom: 5px; margin-top: 10px"><strong style="color: #666">${contactName} diz:</strong></div><div style="padding-left: 10px; color: #000080">${resp}</div>`;
                            chatBox.appendChild(botWrap);
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }, 1000 + Math.random() * 1000);
                    }
                };

                viewContainer.appendChild(header);
                viewContainer.appendChild(chatBox);
                viewContainer.appendChild(inputBox);
            };

            const renderContacts = () => {
                viewContainer.innerHTML = '';

                // Contact List UI
                const topBar = h('div', { style: { background: 'linear-gradient(180deg, #fff, #e4ede6)', borderBottom: '1px solid #7f9db9', padding: '10px', display: 'flex', gap: '10px', alignItems: 'center' } });
                topBar.innerHTML = `<div style="width:40px; height:40px; border:1px solid #aaa; border-radius:3px; background:#fff; display:flex; align-items:center; justify-content:center; font-size:20px">👤</div>
                                    <div><strong style="color:#000; font-size:12px; font-weight:bold;">Você (Online) <span style="font-size:10px;color:#008000">▼</span></strong><br><span style="color:#666; font-size:10px">&lt;Digite uma mensagem pessoal&gt;</span></div>`;

                const listWrap = h('div', { style: { flex: 1, background: '#fff', overflowY: 'auto', padding: '10px 0' } });

                // Online Group
                const grpOnline = h('div', { style: {} });
                grpOnline.innerHTML = `<div style="padding: 2px 10px; font-weight:bold; color:#1c4b9e; border-bottom: 1px solid #eee; margin-bottom:5px; font-size:11px">Amigos e Família (2/5)</div>`;

                const btnTulio = h('div', { style: { padding: '5px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' } });
                btnTulio.innerHTML = `<div style="width:10px; height:10px; background:#0c0; border-radius:50%; box-shadow:inset -2px -2px 4px rgba(0,0,0,0.3)"></div> <div><strong style="color:#000">Túlio</strong> <span style="color:#888">- "Bora CS?"</span></div>`;
                btnTulio.onmouseover = () => btnTulio.style.background = '#eef3fc';
                btnTulio.onmouseout = () => btnTulio.style.background = 'transparent';
                btnTulio.onclick = () => renderChat('Túlio', '"Bora CS?"', false);

                const btnLets = h('div', { style: { padding: '5px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' } });
                btnLets.innerHTML = `<div style="width:10px; height:10px; background:#0c0; border-radius:50%; box-shadow:inset -2px -2px 4px rgba(0,0,0,0.3)"></div> <div><strong style="color:#000">Lets</strong> <span style="color:#888">- "Naquelas longas noites em claro..."</span></div>`;
                btnLets.onmouseover = () => btnLets.style.background = '#eef3fc';
                btnLets.onmouseout = () => btnLets.style.background = 'transparent';
                btnLets.onclick = () => renderChat('Lets', '"Naquelas longas noites em claro..."', true);

                grpOnline.appendChild(btnTulio);
                grpOnline.appendChild(btnLets);

                // Offline Group
                const grpOffline = h('div', { style: { marginTop: '10px' } });
                grpOffline.innerHTML = `<div style="padding: 2px 10px; font-weight:bold; color:#888; border-bottom: 1px solid #eee; margin-bottom:5px; font-size:11px">Offline (3)</div>`;

                ['Calazdroid', 'JubaJubs86', 'ZedTHPS'].forEach(name => {
                    const offC = h('div', { style: { padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '11px' } });
                    offC.innerHTML = `<div style="width:10px; height:10px; background:#ccc; border-radius:50%"></div> <span>${name}</span>`;
                    grpOffline.appendChild(offC);
                });

                listWrap.appendChild(grpOnline);
                listWrap.appendChild(grpOffline);

                const botBar = h('div', { style: { background: '#ece9d8', borderTop: '1px solid #c0c0c0', padding: '5px', textAlign: 'center', fontSize: '10px', color: '#1c4b9e', cursor: 'pointer' } });
                botBar.textContent = "CHAT Today -> Descubra seu horóscopo!";

                viewContainer.appendChild(topBar);
                viewContainer.appendChild(listWrap);
                viewContainer.appendChild(botBar);
            };

            // Start up with Contacts View
            renderContacts();

            return wrap;
        },

        wordpad: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column' } });

            // Menu bar simplificada
            const menu = h('div', { style: { display: 'flex', gap: '10px', padding: '2px 8px', background: '#ece9d8', borderBottom: '1px solid #aca899', fontSize: '11px', fontFamily: 'Tahoma' } });
            ['Arquivo', 'Editar', 'Formatar', 'Exibir', 'Ajuda'].forEach(m => {
                menu.appendChild(h('span', { style: { cursor: 'pointer' } }, m));
            });

            // Toolbar com controle de texto real
            const toolbar = h('div', { style: { display: 'flex', gap: '4px', padding: '4px 8px', background: '#ece9d8', borderBottom: '1px solid #aca899', alignItems: 'center' } });

            const fontSelect = h('select', { style: { fontFamily: 'Tahoma', fontSize: '11px' } });
            ['Courier New', 'Tahoma', 'Comic Sans MS', 'Times New Roman', 'Arial'].forEach(f => {
                const opt = h('option', { value: f }, f);
                fontSelect.appendChild(opt);
            });

            const boldBtn = h('button', { style: { fontWeight: 'bold', width: '24px', height: '22px', fontSize: '12px', background: '#ece9d8', border: '1px outset #fff', cursor: 'pointer' } }, 'B');
            const italBtn = h('button', { style: { fontStyle: 'italic', width: '24px', height: '22px', fontSize: '12px', background: '#ece9d8', border: '1px outset #fff', cursor: 'pointer' } }, 'I');
            const strkBtn = h('button', { style: { textDecoration: 'line-through', width: '24px', height: '22px', fontSize: '12px', background: '#ece9d8', border: '1px outset #fff', cursor: 'pointer' } }, 'S');

            const textarea = h('textarea', {
                spellcheck: 'false',
                style: {
                    flex: '1', width: '100%', resize: 'none', border: 'none', padding: '10px', outline: 'none',
                    fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', lineHeight: '1.4',
                    background: '#fff', color: '#000'
                }
            });

            fontSelect.onchange = (e) => textarea.style.fontFamily = e.target.value;

            let isBold = false, isItal = false, isStrk = false;
            boldBtn.onclick = () => { isBold = !isBold; textarea.style.fontWeight = isBold ? 'bold' : 'normal'; boldBtn.style.borderStyle = isBold ? 'inset' : 'outset'; };
            italBtn.onclick = () => { isItal = !isItal; textarea.style.fontStyle = isItal ? 'italic' : 'normal'; italBtn.style.borderStyle = isItal ? 'inset' : 'outset'; };
            strkBtn.onclick = () => { isStrk = !isStrk; textarea.style.textDecoration = isStrk ? 'line-through' : 'none'; strkBtn.style.borderStyle = isStrk ? 'inset' : 'outset'; };

            toolbar.appendChild(fontSelect);
            toolbar.appendChild(boldBtn);
            toolbar.appendChild(italBtn);
            toolbar.appendChild(strkBtn);

            wrap.appendChild(menu);
            wrap.appendChild(toolbar);
            wrap.appendChild(textarea);
            return wrap;
        },

        gta_cheats: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column' } });

            // Menu bar simplificada
            const menu = h('div', { style: { display: 'flex', gap: '10px', padding: '2px 8px', background: '#ece9d8', borderBottom: '1px solid #aca899', fontSize: '11px', fontFamily: 'Tahoma' } });
            ['Arquivo', 'Editar', 'Formatar', 'Exibir', 'Ajuda'].forEach(m => {
                menu.appendChild(h('span', { style: { cursor: 'pointer' } }, m));
            });

            const textarea = h('textarea', {
                spellcheck: 'false',
                style: {
                    flex: '1', width: '100%', resize: 'none', border: 'none', padding: '10px', outline: 'none',
                    fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', lineHeight: '1.4',
                    background: '#fff', color: '#000'
                }
            });

            textarea.value = `GTA_Cheats.txt - Bloco de Notas
--------------------------------
GTA San Andreas Dicas Clássicas:
HESOYAM  - Saúde, Colete e $250k
AEZAKMI  - Policia nunca te procura
UZUMYMW  - Pacote de Armas 3
CHITTYCHITTYBANGBANG - Carros Voadores
JUMPJET  - Hydra
BAGUVIX  - Modo Deus (Vida infinita)
RIPAZHA  - Carros voam

GTA Vice City:
PANZER   - Traz o Rhyno (Tanque)
LEAVEMEALONE - Reduz Nível de Procurado
NUTTERTOOLS - Armas Pesadas

...salve em disquete para não perder!`;

            wrap.appendChild(menu);
            wrap.appendChild(textarea);
            return wrap;
        },

        tuliowire: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', fontSize: '12px', fontFamily: 'Tahoma' } });

            const header = h('div', { style: { display: 'flex', alignItems: 'center', background: '#e4ecf7', padding: '8px', borderBottom: '1px solid #8ba0c5' } });
            header.innerHTML = `<span style="font-size:20px; margin-right:8px">🍋</span> <strong style="color: #1c4b9e">TulioWire Enterprise Edition</strong>`;

            const tabs = h('div', { style: { display: 'flex', gap: '4px', background: '#f5f5f5', padding: '4px 8px 0', borderBottom: '1px solid #ccc' } });
            tabs.innerHTML = `
                <div style="padding: 4px 12px; background: #fff; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; color: #333; cursor: default">Pesquisar</div>
                <div style="padding: 4px 12px; background: #e0e0e0; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; color: #666; cursor: default">Transferências</div>
                <div style="padding: 4px 12px; background: #e0e0e0; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; color: #666; cursor: default">Biblioteca</div>
            `;

            const tableWrap = h('div', { style: { flex: 1, padding: '10px', background: '#fff' } });

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.textAlign = 'left';

            table.innerHTML = `
                <thead>
                    <tr style="background:#f0f0f0; border-bottom:1px solid #ccc;">
                        <th style="padding:4px">Nome do Arquivo</th>
                        <th style="padding:4px">Tamanho</th>
                        <th style="padding:4px">Progresso</th>
                        <th style="padding:4px">Velocidade</th>
                        <th style="padding:4px">Tempo Rest.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid #eee">
                        <td style="padding:4px; color:#333">Linkin_Park_Numb_Oficial.mp3.exe</td>
                        <td style="padding:4px; color:#666">32 KB</td>
                        <td style="padding:4px;"><div style="width:100%;background:#ddd;height:12px;border:1px solid #aaa"><div style="width:99%;background:#0c0;height:100%"></div></div></td>
                        <td style="padding:4px; color:#666">0.2 kb/s</td>
                        <td style="padding:4px; color:#666">Estagnado</td>
                    </tr>
                    <tr style="border-bottom:1px solid #eee">
                        <td style="padding:4px; color:#333">Dragon_Ball_AF_Ep_01.rmvb</td>
                        <td style="padding:4px; color:#666">45.2 MB</td>
                        <td style="padding:4px;"><div style="width:100%;background:#ddd;height:12px;border:1px solid #aaa"><div style="width:14%;background:#0c0;height:100%"></div></div></td>
                        <td style="padding:4px; color:#666">1.5 kb/s</td>
                        <td style="padding:4px; color:#666">8 anos</td>
                    </tr>
                    <tr style="border-bottom:1px solid #eee">
                        <td style="padding:4px; color:#333">Keygen_Phototulio_CS23.zip</td>
                        <td style="padding:4px; color:#666">1.1 MB</td>
                        <td style="padding:4px;"><div style="width:100%;background:#ddd;height:12px;border:1px solid #aaa"><div style="width:98%;background:#0c0;height:100%"></div></div></td>
                        <td style="padding:4px; color:#666">0.0 kb/s</td>
                        <td style="padding:4px; color:#666">Infinito</td>
                    </tr>
                    <tr style="border-bottom:1px solid #eee">
                        <td style="padding:4px; color:#333">needforspeedug2NOMUSICRIP.rar</td>
                        <td style="padding:4px; color:#666">2.1 GB</td>
                        <td style="padding:4px;"><div style="width:100%;background:#ddd;height:12px;border:1px solid #aaa"><div style="width:1%;background:#0c0;height:100%"></div></div></td>
                        <td style="padding:4px; color:#666">0.1 kb/s</td>
                        <td style="padding:4px; color:#666">32 meses</td>
                    </tr>
                </tbody>
            `;

            tableWrap.appendChild(table);

            const status = h('div', { style: { padding: '4px', background: '#ece9d8', borderTop: '1px solid #ccc', color: '#555' } });
            status.textContent = 'Conectado a 1.204 hosts. Compartilhando 6 arquivos.';

            wrap.appendChild(header);
            wrap.appendChild(tabs);
            wrap.appendChild(tableWrap);
            wrap.appendChild(status);

            wrap.appendChild(status);

            return wrap;
        },

        tulionet: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#ece9d8', fontFamily: 'Tahoma', fontSize: '11px' } });

            if (isOnline) {
                wrap.innerHTML = `
                    <div style="padding: 20px; text-align: center; background: #fff; flex: 1; border-bottom: 1px solid #aca899;">
                        <div style="font-size: 40px; margin-bottom: 10px;">🌍</div>
                        <h3 style="margin: 0 0 10px 0; color: #1c4b9e; font-size: 16px;">TulioNet 56K</h3>
                        <p style="color: green; font-weight: bold; margin: 5px 0;">Status: Conectado</p>
                        <p style="margin: 5px 0;">Velocidade: 48,0 Kbps</p>
                        <p style="margin: 5px 0;">Duração: 00:02:14</p>
                    </div>
                    <div style="padding: 10px; background: #f5f5f5; text-align: right;">
                        <button id="tnDiscBtn" style="padding: 4px 15px; font-family: Tahoma; text-shadow: none">Desconectar</button>
                    </div>
                `;
                setTimeout(() => {
                    const dBtn = wrap.querySelector('#tnDiscBtn');
                    if (dBtn) dBtn.onclick = () => {
                        isOnline = false;
                        closeWin('tulionet');
                    };
                }, 50);
                return wrap;
            }

            const topHalf = h('div', { style: { padding: '15px', background: '#fff', flex: 1 } });
            topHalf.innerHTML = `
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <div style="font-size: 36px;">☎️</div>
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 14px;">Conectar a TulioNet</h3>
                        <p style="margin: 0; color: #666;">Provedor de Acesso à Internet</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center; margin-bottom: 15px;">
                    <label>Usuário:</label>
                    <input type="text" value="tulio_underground" disabled style="background:#fff; border:1px solid #7f9db9; padding:2px 4px; color:#555">
                    <label>Senha:</label>
                    <input type="password" value="********" disabled style="background:#fff; border:1px solid #7f9db9; padding:2px 4px; color:#555">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-left: 88px">
                    <input type="checkbox" checked disabled id="tnSave">
                    <label for="tnSave">Salvar senha</label>
                </div>
                <div style="display: grid; grid-template-columns: 80px 1fr; gap: 8px; align-items: center;">
                    <label>Discar para:</label>
                    <input type="text" value="1466-9912" disabled style="background:#fff; border:1px solid #7f9db9; padding:2px 4px; color:#555">
                </div>
            `;

            const statusArea = h('div', { style: { display: 'none', padding: '15px', borderTop: '1px solid #aca899', background: '#ece9d8' } });
            statusArea.innerHTML = `
                <p id="tnStatusText" style="margin: 0 0 10px 0; font-weight: bold;">Ligando para 1466-9912...</p>
                <div style="width: 100%; border: 1px solid #888; height: 14px; background: #fff; position: relative;">
                    <div id="tnProg" style="width: 0%; height: 100%; background: #0c0;"></div>
                </div>
            `;

            const btnArea = h('div', { style: { padding: '10px 15px', background: '#f5f5f5', borderTop: '1px solid #aca899', display: 'flex', justifyContent: 'flex-end', gap: '8px' } });
            const connBtn = h('button', { style: { padding: '4px 15px', fontFamily: 'Tahoma', fontWeight: 'bold' } }, 'Conectar');
            const cancelBtn = h('button', { style: { padding: '4px 15px', fontFamily: 'Tahoma' } }, 'Cancelar');

            cancelBtn.onclick = () => closeWin('tulionet');

            connBtn.onclick = () => {
                connBtn.disabled = true;
                cancelBtn.disabled = true;
                topHalf.style.opacity = '0.5';
                statusArea.style.display = 'block';

                const sTxt = statusArea.querySelector('#tnStatusText');
                const prog = statusArea.querySelector('#tnProg');

                prog.style.width = '10%';

                // Beep Boop Sintético de Conexão + Chieira
                try {
                    const C = window.AudioContext || window.webkitAudioContext;
                    if (C) {
                        const c = new C();
                        let t = c.currentTime + 0.1;
                        '14669912'.split('').forEach(d => {
                            const f = { '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], '4': [770, 1209], '5': [770, 1336], '6': [770, 1477], '7': [852, 1209], '8': [852, 1336], '9': [852, 1477], '0': [941, 1336] }[d] || [852, 1209];
                            const o1 = c.createOscillator(); const o2 = c.createOscillator();
                            const g = c.createGain();
                            o1.type = 'square'; o1.frequency.value = f[0];
                            o2.type = 'square'; o2.frequency.value = f[1];
                            o1.connect(g); o2.connect(g); g.connect(c.destination);
                            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.01); g.gain.linearRampToValueAtTime(0, t + 0.1);
                            o1.start(t); o1.stop(t + 0.1); o2.start(t); o2.stop(t + 0.1);
                            t += 0.15;
                        });
                        const bSize = c.sampleRate * 2.5;
                        const b = c.createBuffer(1, bSize, c.sampleRate);
                        const data = b.getChannelData(0);
                        for (let i = 0; i < bSize; i++) data[i] = (Math.random() * 2 - 1) * 0.03;
                        const n = c.createBufferSource(); n.buffer = b; n.connect(c.destination);
                        n.start(t + 0.3); // Chieira (Handshake noise)
                    }
                } catch (e) { }

                setTimeout(() => {
                    sTxt.textContent = "Verificando nome de usuário e senha...";
                    prog.style.width = '40%';

                    setTimeout(() => {
                        prog.style.width = '60%';
                    }, 1500);

                    setTimeout(() => {
                        sTxt.textContent = "Registrando seu computador na rede...";
                        prog.style.width = '80%';

                        setTimeout(() => {
                            prog.style.width = '100%';

                            setTimeout(() => {
                                isOnline = true;
                                closeWin('tulionet');
                                setTimeout(() => openWin('tulionet'), 100);
                            }, 800);
                        }, 1500);
                    }, 3000);
                }, 2000);
            };

            btnArea.appendChild(connBtn);
            btnArea.appendChild(cancelBtn);

            wrap.appendChild(topHalf);
            wrap.appendChild(statusArea);
            wrap.appendChild(btnArea);

            return wrap;
        },

        accelerator: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#ece9d8', padding: '20px', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tahoma', fontSize: '12px' } });

            wrap.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
                <h3 style="margin: 0 0 10px; font-weight: bold; color: #1c4b9e; font-size: 16px;">Internet Acelerator 2004</h3>
                <p style="text-align: center; color: #333; margin-bottom: 25px; line-height: 1.4;">Clique no botão abaixo para injetar pacotes TCP/IP otimizados e navegar até <b>10x mais rápido!</b></p>
                <button id="accelBtn" style="padding: 6px 25px; font-family: Tahoma; font-weight: bold; font-size: 14px; cursor: pointer;">Acelerar Internet!</button>
                <div id="accelProg" style="width: 80%; height: 15px; border: 1px inset #fff; background: #fff; margin-top: 25px; display: none;">
                    <div style="width: 25%; height: 100%; background: #0c0;"></div>
                </div>
            `;

            setTimeout(() => {
                const btn = wrap.querySelector('#accelBtn');
                const prog = wrap.querySelector('#accelProg');
                if (btn) {
                    btn.onclick = () => {
                        prog.style.display = 'block';
                        btn.disabled = true;

                        // Fake Freeze after a bit
                        setTimeout(() => {
                            const win = wrap.closest('.xp-win');
                            if (win) {
                                win.classList.add('xp-win--frozen');
                                // update title
                                const title = win.querySelector('.xp-win-title');
                                if (title) title.innerText = title.innerText + ' (Não Respondendo)';
                                // freeze cursor
                                win.style.cursor = 'wait';
                                Array.from(win.querySelectorAll('*')).forEach(el => {
                                    el.style.cursor = 'wait';
                                    el.style.pointerEvents = 'none'; // disable interaction
                                });
                                // Keep titlebar active for dragging
                                const titlebar = win.querySelector('.xp-win-titlebar');
                                if (titlebar) {
                                    titlebar.style.pointerEvents = 'all';
                                    titlebar.style.cursor = 'wait';
                                }
                                // Auto close gracefully after 8 seconds
                                setTimeout(() => {
                                    closeWin('accelerator');
                                    document.querySelectorAll('.xp-accel-clone').forEach(c => c.remove());
                                    const pop = document.getElementById('xpAccelClosePopup');
                                    if (pop) pop.remove();
                                }, 8000);
                            }
                        }, 1200);
                    };
                }
            }, 50);

            return wrap;
        },
    };


    // ── OPEN / CLOSE WINDOW ───────────────────────────
    function openWin(id) {
        if (id === 'ie' && !isOnline) {
            alert('⚠️ ERRO DE REDE: Não foi possível localizar o servidor.\\n\\nVocê precisa abrir o discador (TulioNet 56K) e se conectar para acessar a Internet!');
            return;
        }

        if (openWindows[id]) {
            // Já existe: só traz pro foco ou desfaz minimizar
            const w = openWindows[id];
            w.classList.remove('xp-win--minimized');
            focusWin(w);
            return;
        }

        const icon = ICONS.find(i => i.id === id);
        const title = icon ? icon.label : id;

        // Posição em cascata
        const offset = (Object.keys(openWindows).length % 6) * 24;

        const titlebar = h('div', { class: 'xp-win-titlebar' },
            h('div', { class: 'xp-win-title' }, icon?.icon + ' ' + title),
            h('div', { class: 'xp-win-btns' },
                h('button', { class: 'xp-btn xp-btn--min', onclick: () => minimizeWin(id) }, '─'),
                h('button', { class: 'xp-btn xp-btn--max', onclick: () => maximizeWin(id) }, '□'),
                h('button', { class: 'xp-btn xp-btn--close', onclick: () => closeWin(id) }, '✕'),
            )
        );

        // Barra de endereço mockada
        const addrbar = h('div', { class: 'xp-win-addrbar' },
            h('span', { class: 'xp-addr-label' }, 'Endereço:'),
            h('div', { class: 'xp-addr-val' }, `C:\\TULIO\\${title.toUpperCase().replace(' ', '_')}`),
        );

        const body = h('div', { class: 'xp-win-body' }, (CONTENT[id] || CONTENT.mycomputer)());

        const WIN_SIZES = {
            ie: { w: '620px', h: '440px' },
            paint: { w: '500px', h: '420px' },
            earth: { w: '600px', h: '380px' },
            calculator: { w: '260px', h: '340px' },
            minesweeper: { w: '300px', h: '360px' },
            burningrom: { w: '480px', h: '420px' },
            messenger: { w: '480px', h: '380px' },
            winamp: { w: '280px', h: '160px' },
            wordpad: { w: '440px', h: '400px' },
            gta_cheats: { w: '440px', h: '400px' },
            tuliowire: { w: '540px', h: '340px' },
            tulionet: { w: '380px', h: '360px' },
            accelerator: { w: '350px', h: '300px' },
        };
        const sz = WIN_SIZES[id] || {};
        const winW = sz.w || '440px';
        const winH = sz.h || null;

        let startLeft = 80 + offset;
        let startTop = 60 + offset;

        // Mobile layout clamp limit
        const deskArea = document.getElementById('xpDesktopArea');
        if (deskArea && deskArea.clientWidth < 600) {
            startLeft = Math.max(10, (deskArea.clientWidth - parseInt(winW)) / 2 + (offset % 10)); // centralized ish + small offset
            startTop = 20 + offset % 20;
        }

        const sizeStyle = { left: startLeft + 'px', top: startTop + 'px', zIndex: ++zTop, width: winW };
        if (winH) sizeStyle.height = winH;

        const win = h('div', {
            class: 'xp-win xp-win--active',
            style: sizeStyle,
            'data-id': id,
            onclick: () => focusWin(win),
        }, titlebar, addrbar, body);


        document.getElementById('xpDesktopArea').appendChild(win);
        openWindows[id] = win;
        makeDraggable(win, titlebar);
        focusWin(win);
        updateTaskbar();

        // Animação de abertura
        requestAnimationFrame(() => win.classList.add('xp-win--open'));
    }

    function closeWin(id) {
        const w = openWindows[id];
        if (!w) return;
        w.classList.remove('xp-win--open');
        w.style.opacity = '0';
        w.style.transform = 'scale(0.9)';
        setTimeout(() => { w.remove(); delete openWindows[id]; updateTaskbar(); }, 150);
    }

    function minimizeWin(id) {
        const w = openWindows[id];
        if (w) w.classList.toggle('xp-win--minimized');
        updateTaskbar();
    }

    let maximized = {};
    function maximizeWin(id) {
        const w = openWindows[id];
        if (!w) return;
        if (maximized[id]) {
            Object.assign(w.style, maximized[id]);
            delete maximized[id];
        } else {
            maximized[id] = { left: w.style.left, top: w.style.top, width: w.style.width, height: w.style.height };
            Object.assign(w.style, { left: '0px', top: '0px', width: '100%', height: 'calc(100% - 40px)' });
        }
    }

    // ── TASKBAR ───────────────────────────────────────
    function updateTaskbar() {
        const bar = document.getElementById('xpTaskbarWindows');
        if (!bar) return;
        bar.innerHTML = '';
        Object.entries(openWindows).forEach(([id, w]) => {
            const icon = ICONS.find(i => i.id === id);
            const btn = h('button', {
                class: 'xp-taskbar-app' + (w.classList.contains('xp-win--active') && !w.classList.contains('xp-win--minimized') ? ' xp-tb--active' : ''),
                onclick: (e) => {
                    if (id === 'accelerator' && w.classList.contains('xp-win--frozen')) {
                        e.stopPropagation();
                        let pop = document.getElementById('xpAccelClosePopup');
                        if (pop) { pop.remove(); return; }
                        pop = h('div', {
                            id: 'xpAccelClosePopup',
                            style: { position: 'absolute', bottom: '45px', left: e.clientX + 'px', background: '#ece9d8', border: '1px solid #7f9db9', padding: '6px', zIndex: 10005, boxShadow: '2px 2px 5px rgba(0,0,0,0.5)', fontFamily: 'Tahoma', fontSize: '11px', cursor: 'pointer' },
                            onclick: () => {
                                closeWin('accelerator');
                                document.querySelectorAll('.xp-accel-clone').forEach(c => c.remove());
                                pop.remove();
                            }
                        }, '✕ Forçar Fechamento (Não Respondendo)');
                        document.body.appendChild(pop);
                        setTimeout(() => document.body.addEventListener('click', () => { const p = document.getElementById('xpAccelClosePopup'); if (p) p.remove(); }, { once: true }), 50);
                        return;
                    }

                    if (w.classList.contains('xp-win--minimized')) {
                        w.classList.remove('xp-win--minimized');
                        focusWin(w);
                    } else if (w.classList.contains('xp-win--active')) {
                        w.classList.add('xp-win--minimized');
                    } else {
                        focusWin(w);
                    }
                },
            }, (icon?.icon || '🗂️') + ' ' + (icon?.label || id));
            bar.appendChild(btn);
        });
    }

    // ── START MENU ────────────────────────────────────
    function buildStartMenu() {
        const menu = document.getElementById('xpStartMenu');
        if (!menu) return;
        const items = [
            ...ICONS.map(ic => ({
                icon: ic.icon,
                label: ic.label,
                action: () => { toggleStart(); openWin(ic.id); }
            })),
            { icon: '🔒', label: 'Desligar OS', action: closeDesktop },
        ];

        menu.innerHTML = '';
        menu.appendChild(h('div', { class: 'xp-sm-header' },
            h('span', { class: 'xp-sm-user' }, '👤 TULIO CARELI'),
        ));
        const list = h('div', { class: 'xp-sm-list' }, ...items.map(it =>
            h('button', { class: 'xp-sm-item', onclick: it.action },
                h('span', { class: 'xp-sm-icon' }, it.icon),
                h('span', {}, it.label),
            )
        ));
        menu.appendChild(list);
    }

    function toggleStart() {
        const menu = document.getElementById('xpStartMenu');
        if (menu) menu.classList.toggle('xp-sm--open');
    }

    // ── CLOCK & CALENDAR ──────────────────────────────
    function toggleCalendar() {
        const cal = document.getElementById('xpCalendar');
        if (cal) cal.classList.toggle('xp-cal--open');
        const menu = document.getElementById('xpStartMenu');
        if (menu) menu.classList.remove('xp-sm--open');
    }

    function buildCalendarPopup() {
        // mock a fixed 2005 calendar specifically for right now 
        const now = new Date();
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const daysInMonth = new Date(2005, now.getMonth() + 1, 0).getDate();

        let daysHtml = '';
        ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(d => {
            daysHtml += `<div class="xp-cal-day-name">${d}</div>`;
        });

        const firstDay = new Date(2005, now.getMonth(), 1).getDay();
        for (let i = 0; i < firstDay; i++) {
            daysHtml += `<div class="xp-cal-day" style="background:transparent;border:none"></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === Math.min(now.getDate(), daysInMonth);
            daysHtml += `<div class="xp-cal-day ${isToday ? 'xp-cal-today' : ''}">${i}</div>`;
        }

        const wrap = h('div', { id: 'xpCalendar' },
            h('div', { class: 'xp-cal-title' }, "Propriedades de Data e Hora"),
            h('div', { class: 'xp-cal-body' },
                h('div', { class: 'xp-cal-header' },
                    h('button', { style: { fontFamily: 'Tahoma' } }, '<'),
                    h('span', {}, `${monthNames[now.getMonth()]} de 2005`),
                    h('button', { style: { fontFamily: 'Tahoma' } }, '>')
                ),
                h('div', { class: 'xp-cal-grid', html: daysHtml })
            ),
            h('div', { class: 'xp-cal-time' }, nowStr())
        );

        return wrap;
    }

    function startClock() {
        const el = document.getElementById('xpClock');
        if (!el) return;
        clearInterval(clockTimer); // evita clocks duplicados ao reabrir
        el.textContent = nowStr();
        clockTimer = setInterval(() => {
            const c = document.getElementById('xpClock');
            if (c) c.textContent = nowStr();
            else clearInterval(clockTimer);
            const calTime = document.querySelector('.xp-cal-time');
            if (calTime) calTime.textContent = nowStr();
        }, 1000);
    }

    // ── DESKTOP MOUNT ─────────────────────────────────
    function buildDesktop() {
        if (mounted) {
            // Fecha qualquer janela aberta antes de reexibir
            Object.keys(openWindows).forEach(id => closeWin(id));
            const desk = document.getElementById('xpDesktop');
            desk.classList.add('xp-desk--open');
            buildStartMenu(); // atualiza menu iniciar
            startClock();
            return;
        }
        mounted = true;

        // DESKTOP ROOT
        const desk = h('div', {
            id: 'xpDesktop', class: 'xp-desk--open',
            onclick: e => {
                const target = e.target;
                if (!target.closest('#xpStartMenu') && target.id !== 'xpStartBtn') {
                    document.getElementById('xpStartMenu')?.classList.remove('xp-sm--open');
                }
                if (!target.closest('#xpCalendar') && target.id !== 'xpClock') {
                    document.getElementById('xpCalendar')?.classList.remove('xp-cal--open');
                }
            }
        });

        // WELCOME SCREEN
        const welcome = h('div', { id: 'xpWelcome' },
            h('div', { class: 'xp-shutdown-logo' }, '⊞'),
            h('div', { class: 'xp-welcome-text' }, 'Bem-vindo')
        );
        desk.appendChild(welcome);

        // BOOT SCREEN (briefly shown)
        const boot = h('div', { id: 'xpBoot' },
            h('div', { class: 'xp-boot-wordmark' },
                h('div', { class: 'xp-boot-os' },
                    'Tulio',
                    h('sup', { style: { fontSize: '10px', verticalAlign: 'super', marginLeft: '2px', fontStyle: 'normal' } }, '®'),
                    ' Underground ',
                    h('span', { class: 'xp-colored' }, 'OS')
                ),
                h('div', { class: 'xp-boot-version' }, 'Bem vindo a 2004')
            ),
            h('div', { class: 'xp-boot-bar' },
                h('div', { class: 'xp-boot-fill' })
            )
        );
        desk.appendChild(boot);

        // WALLPAPER AREA
        const area = h('div', { id: 'xpDesktopArea' },
            // ICONS GRID
            h('div', { class: 'xp-icons-grid' }, ...ICONS.map(ic =>
                h('div', {
                    class: 'xp-desk-icon',
                    ondblclick: () => openWin(ic.id),
                    ontouchstart: function (e) {
                        const now = Date.now();
                        const last = this.dataset.lastTap || 0;
                        if (now - last < 300) {
                            openWin(ic.id);
                            e.preventDefault();
                        }
                        this.dataset.lastTap = now;
                    },
                    onclick: e => {
                        document.querySelectorAll('.xp-desk-icon').forEach(i => i.classList.remove('xp-icon--selected'));
                        e.currentTarget.classList.add('xp-icon--selected');
                    },
                },
                    h('div', { class: 'xp-di-img' }, ic.icon),
                    h('div', { class: 'xp-di-label' }, ic.label),
                )
            ))
        );
        desk.appendChild(area);

        // TASKBAR
        const taskbar = h('div', { id: 'xpTaskbar' },
            h('button', { id: 'xpStartBtn', onclick: toggleStart },
                h('span', { class: 'xp-start-orb' }),
                'INICIAR'
            ),
            h('div', { id: 'xpTaskbarWindows' }),
            h('div', { id: 'xpSysTray' },
                h('div', { id: 'xpClock', onclick: toggleCalendar, style: { cursor: 'pointer' }, title: 'Mostrar calendário' }, nowStr()),
                h('button', { id: 'xpCloseDesk', onclick: closeDesktop, title: 'Fechar Desktop' }, '✕'),
            )
        );
        desk.appendChild(taskbar);

        // START MENU (hidden by default)
        const startMenu = h('div', { id: 'xpStartMenu' });
        desk.appendChild(startMenu);

        // CALENDAR POPUP
        const calendar = buildCalendarPopup();
        desk.appendChild(calendar);

        document.body.appendChild(desk);
        buildStartMenu();
        startClock();

        // Boot animation flow: Boot -> Welcome -> Desktop
        setTimeout(() => {
            boot.style.opacity = '0'; // Hide black boot screen

            setTimeout(() => {
                boot.remove(); // Remove boot, Welcome connects

                // Show Welcome screen for 1.5s
                setTimeout(() => {
                    welcome.style.opacity = '0'; // Hide welcome screen

                    setTimeout(() => {
                        welcome.remove();
                        area.style.opacity = '1'; // Show actual desktop
                    }, 400); // 400ms transition
                }, 1500); // 1.5s welcome duration

            }, 400); // 400ms boot transition
        }, 1800); // 1.8s boot duration
    }

    // ── CLOSE DESKTOP ─────────────────────────────────────────────────────
    function closeDesktop() {
        const desk = document.getElementById('xpDesktop');
        if (!desk || shuttingDown) return;
        shuttingDown = true;

        // Fecha menu iniciar se aberto
        document.getElementById('xpStartMenu')?.classList.remove('xp-sm--open');

        // Cria a tela de desligamento (Shutdown azul do OS)
        const shutdown = h('div', { id: 'xpShutdown' },
            h('div', { class: 'xp-shutdown-logo' }, '⊞'),
            h('div', { class: 'xp-shutdown-text' }, 'Tulio OS está desligando...')
        );
        desk.appendChild(shutdown);

        // Dispara transição (fade in)
        // Usamos requestAnimationFrame duplo para o navegador registrar a classe e dar tempo ao CSS de transicionar init -> ativa
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                shutdown.classList.add('xp-sd--active');
            });
        });

        // Aguarda a tela ficar exposta (ex. 2.5s)
        setTimeout(() => {
            // Remove janelas de forma síncrona
            Object.keys(openWindows).forEach(id => {
                const w = openWindows[id];
                if (w) w.remove();
                delete openWindows[id];
            });

            // Reseta estados de maximização e online
            Object.keys(maximized).forEach(k => delete maximized[k]);
            isOnline = false;

            desk.classList.remove('xp-desk--open');
            clearInterval(clockTimer);
            clockTimer = null;
            updateTaskbar();

            // Remove a tela de desligamento logo depois do OS ter sumido transparente
            setTimeout(() => {
                shutdown.remove();
                desk.remove();
                mounted = false;
                shuttingDown = false;
            }, 300);

        }, 2200); // 2.2s visualizando o "Tulio OS está desligando..."
    }

    // ── PUBLIC API ────────────────────────────────────
    window.tcDesktop = { open: buildDesktop, close: closeDesktop };

    // ── INIT: wire up Start buttons (footer + header) ──
    document.addEventListener('DOMContentLoaded', () => {
        ['footerStartBtn', 'headerStartBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', buildDesktop);
        });
    });

})();
