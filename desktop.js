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
            'Doom',
            'Tony Hawk Underground',
            'GTA San Andreas',
            'Tibia', 'The Sims 2', 'Half-Life 2',
            'Rollercoaster Tycoon', 'Counter-Strike 1.6',
            'Need for Speed Underground 2', 'M.U.G.E.N.',
            'Grand Chase',
            'Star Wars: Knights of the Old Republic',
            'Sim City 2000',
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
        { id: 'ie', icon: '🌐', label: 'TC Explorer' },
        { id: 'winamp', icon: '🎧', label: 'Tulioamp' },
        { id: 'paint', icon: '🎨', label: 'Tulio Paint' },
        { id: 'earth', icon: '🌎', label: 'Tulio Earth' },
        { id: 'burningrom', icon: '💿', label: 'Tulio Burning ROM' },
        { id: 'messenger', icon: '💬', label: 'Tulio Messenger' },
        { id: 'wordpad', icon: '📝', label: 'TulioPad' },
        { id: 'mediaplayer', icon: '🎬', label: 'Tulio Media Player' },
        { id: 'imageviewer', icon: '🖼️', label: 'Imagens' },
        { id: 'calculator', icon: '📟', label: 'Calculadora' },
        { id: 'minesweeper', icon: '💣', label: 'Campo Minado' },
        { id: 'tulionet', icon: '☎️', label: 'TulioNet 56K' },
        { id: 'accelerator', icon: '🚀', label: 'Internet_Acelerator.exe' },
        { id: 'doom', icon: 'jogosicon/doom.png', label: 'doom.exe' },
        { id: 'terminal', icon: '⬛', label: 'terminal.exe' },
        { id: 'readme', icon: '📄', label: 'README.txt' },
        { id: 'gta_cheats', icon: '📄', label: 'GTA_Cheats.txt' },
        { id: 'bsod', icon: '💽', label: 'Limpar_Cache_Rapido.exe' },
        { id: 'trash', icon: '🗑️', label: 'Lixeira' },
    ];

    // ── STATE ─────────────────────────────────────────
    let zTop = 100;
    let mounted = false;
    let shuttingDown = false;
    let clockTimer = null;
    let isOnline = false;
    let actionCount = 0;
    let secretsRevealed = false;
    const openWindows = {}; // id → window el

    // ── AUDIO EFFECTS ─────────────────────────────────
    const SFX = {
        startup: new Audio('sons/startup.mp3'),
        shutdown: new Audio('sons/shutdown.mp3'),
        error: new Audio('sons/error.mp3'),
        click: new Audio('sons/click.mp3'),
        stop: new Audio('sons/critical_stop.mp3')
    };

    const playSfx = (name) => {
        try {
            SFX[name].currentTime = 0;
            SFX[name].play().catch(() => { });
        } catch (e) { }
    };

    // ── YOUTUBE API LOADER ───────────────────────────
    let ytAPILoading = false;
    const ytCallbacks = [];
    window.onYouTubeIframeAPIReady = () => {
        while (ytCallbacks.length) ytCallbacks.shift()();
    };

    const ensureYT = (cb) => {
        if (window.YT && window.YT.Player) return cb();
        ytCallbacks.push(cb);
        if (!document.getElementById('yt-iframe-api')) {
            const script = document.createElement('script');
            script.id = 'yt-iframe-api';
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);
        }
    };

    let ytCounter = 0;
    const getUniqueYtId = (prefix) => prefix + '-' + (++ytCounter) + '-' + Date.now();

    const clippySpeak = (msg, persistent = false) => {
        const clippy = document.getElementById('xpClippy');
        const bubble = document.querySelector('.clippy-bubble');
        if (!clippy || !bubble) return;
        clippy.style.display = 'flex';
        bubble.innerText = msg;
        bubble.classList.add('speaking');
        if (!persistent) {
            setTimeout(() => {
                bubble.classList.remove('speaking');
                setTimeout(() => { if (!bubble.classList.contains('speaking')) clippy.style.display = 'none'; }, 500);
            }, 6000);
        }
    };

    const clippyHide = () => {
        const clippy = document.getElementById('xpClippy');
        const bubble = document.querySelector('.clippy-bubble');
        if (!clippy || !bubble) return;
        bubble.classList.remove('speaking');
        setTimeout(() => { if (!bubble.classList.contains('speaking')) clippy.style.display = 'none'; }, 500);
    };

    const revealSecretFolder = () => {
        if (secretsRevealed) return;
        secretsRevealed = true;
        const secretIcon = { id: 'mysterious_folder', icon: '📂', label: 'mysterious_folder' };
        ICONS.push(secretIcon);

        const grid = document.querySelector('.xp-icons-grid');
        if (grid) {
            const iconEl = h('div', {
                class: 'xp-desk-icon xp-icon--secret',
                style: { opacity: '0', transition: 'opacity 1s ease' },
                ondblclick: () => openWin('mysterious_folder'),
                onclick: e => {
                    document.querySelectorAll('.xp-desk-icon').forEach(i => i.classList.remove('xp-icon--selected'));
                    e.currentTarget.classList.add('xp-icon--selected');
                },
            },
                h('div', { class: 'xp-di-img' }, '📂'),
                h('div', { class: 'xp-di-label' }, 'mysterious_folder'),
            );
            grid.appendChild(iconEl);
            setTimeout(() => iconEl.style.opacity = '1', 100);
            clippySpeak("Você encontrou algo que não deveria...");
        }
    };

    // ── HELPERS ───────────────────────────────────────
    const h = (tag, attrs = {}, ...children) => {
        const el = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => {
            if (k === 'class') el.className = v;
            else if (k === 'html') el.innerHTML = v;
            else if (k === 'style') {
                if (typeof v === 'string') el.style.cssText = v;
                else Object.assign(el.style, v);
            }
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

        handle.addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;
            if (e.button === 0) { focusWin(win); start(e.clientX, e.clientY); e.preventDefault(); }
        });
        window.addEventListener('mousemove', e => move(e.clientX, e.clientY));
        window.addEventListener('mouseup', stop);
        handle.addEventListener('touchstart', e => {
            if (e.target.closest('button')) return;
            focusWin(win); start(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
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
            { id: 'c', icon: '💾', name: 'Disco Local (C:)', detail: '80 GB' },
            { id: 'd', icon: '📀', name: 'CD-ROM (D:)', detail: 'Lista de Músicas' },
            { id: 'p', icon: '🖨️', name: 'Impressora HP', detail: 'Online' },
            { id: 'm', icon: '🖥️', name: 'Monitor LG', detail: '1024×768' },
        ].map(f => h('div', {
            class: 'xp-file-item',
            ondblclick: () => {
                if (f.id === 'd') openWin('music');
            },
            ontouchstart: function (e) {
                const now = Date.now();
                const last = this.dataset.lastTap || 0;
                if (now - last < 300) {
                    if (f.id === 'd') openWin('music');
                    e.preventDefault();
                }
                this.dataset.lastTap = now;
            }
        },
            h('span', { class: 'xp-fi-icon' }, f.icon),
            h('span', { class: 'xp-fi-name' }, f.name),
            h('span', { class: 'xp-fi-detail' }, f.detail),
        ))),

        games: () => h('div', { class: 'xp-file-view' }, ...DATA.games.map(g =>
            h('div', {
                class: 'xp-file-item',
                ondblclick: () => {
                    if (g === 'Doom') openWin('doom');
                    else if (g === 'Tony Hawk Underground') openWin('Tony Hawk Underground.exe');
                    else if (g === 'Tibia') openWin('Tibia.exe');
                    else if (g === 'M.U.G.E.N.') openWin('M.U.G.E.N..exe');
                    else if (g === 'GTA San Andreas') openWin('GTA San Andreas.exe');
                    else if (g === 'Grand Chase') openWin('Grand Chase.exe');
                    else {
                        playSfx('error');
                        alert(`Erro: CD-ROM não encontrado para ${g}.\\nPor favor, insira o Disco 1 na unidade de CD-ROM e tente novamente.`);
                    }
                },
                ontouchstart: function (e) {
                    const now = Date.now();
                    const last = this.dataset.lastTap || 0;
                    if (now - last < 300) {
                        if (g === 'Doom') openWin('doom');
                        else if (g === 'Tony Hawk Underground') openWin('Tony Hawk Underground.exe');
                        else if (g === 'Tibia') openWin('Tibia.exe');
                        else if (g === 'M.U.G.E.N.') openWin('M.U.G.E.N..exe');
                        else if (g === 'GTA San Andreas') openWin('GTA San Andreas.exe');
                        else if (g === 'Grand Chase') openWin('Grand Chase.exe');
                        else {
                            playSfx('error');
                            alert(`Erro: CD-ROM não encontrado para ${g}.\\nPor favor, insira o Disco 1 na unidade de CD-ROM e tente novamente.`);
                        }
                        e.preventDefault();
                    }
                    this.dataset.lastTap = now;
                }
            },
                h('span', { class: 'xp-fi-icon' }, '🎮'),
                h('span', { class: 'xp-fi-name' }, g),
            )
        )),

        'Tony Hawk Underground.exe': () => {
            const vid = document.createElement('video');
            vid.src = 'videosjogos/tony%20hawk%20underground.mp4';
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'contain';

            return h('div', { style: { width: '100%', height: '100%', minHeight: '300px', background: '#000', display: 'flex', flexDirection: 'column' } }, vid);
        },

        'Tibia.exe': () => {
            const vid = document.createElement('video');
            vid.src = 'videosjogos/tibia.mp4';
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'contain';

            return h('div', { style: { width: '100%', height: '100%', minHeight: '300px', background: '#000', display: 'flex', flexDirection: 'column' } }, vid);
        },

        'M.U.G.E.N..exe': () => {
            const vid = document.createElement('video');
            vid.src = 'videosjogos/mugen.mp4';
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'contain';

            return h('div', { style: { width: '100%', height: '100%', minHeight: '300px', background: '#000', display: 'flex', flexDirection: 'column' } }, vid);
        },

        'GTA San Andreas.exe': () => {
            const vid = document.createElement('video');
            vid.src = 'videosjogos/gta%20san%20andreas.mp4';
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'contain';

            return h('div', { style: { width: '100%', height: '100%', minHeight: '300px', background: '#000', display: 'flex', flexDirection: 'column' } }, vid);
        },

        'Grand Chase.exe': () => {
            const vid = document.createElement('video');
            vid.src = 'videosjogos/grand%20chase.mp4';
            vid.autoplay = true;
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.style.width = '100%';
            vid.style.height = '100%';
            vid.style.objectFit = 'contain';

            return h('div', { style: { width: '100%', height: '100%', minHeight: '300px', background: '#000', display: 'flex', flexDirection: 'column' } }, vid);
        },

        music: () => h('div', { class: 'xp-file-view' }, ...DATA.music.map(m =>
            h('div', { class: 'xp-file-item' },
                h('span', { class: 'xp-fi-icon' }, '🎵'),
                h('span', { class: 'xp-fi-name' }, m),
            )
        )),



        ie: () => {
            const TABS = [
                { name: 'Tony Hawk Underground', url: 'http://www.tonyhawkundegroundgame.com', wayback: 'https://web.archive.org/web/20031206081727/http://www.activision.com/microsite/thug/thug.html' },
                { name: 'YouTube (2007)', url: 'http://www.youtube.com', type: 'mockup', id: 'youtube' },
                { name: 'Orkut', url: 'http://www.orkut.com.br', type: 'mockup', id: 'orkut' },
                { name: 'Jogos Online', url: 'http://www.jogosonline.com.br', type: 'mockup', id: 'jogosonline' },
                { name: 'NFS Underground 2', url: 'http://www.needforspeedunderground2.com', wayback: 'https://web.archive.org/web/20040803011553/http://www.eagames.com/official/nfs/underground2/us/home.jsp?ncc=1' },
                { name: 'Cartoon Network', url: 'http://www.cartoonnetwork.com.br', wayback: 'https://web.archive.org/web/20041229085952/http://cartoonnetwork.com.br/' }
            ];

            let activeIdx = 0;
            const browserWrap = h('div', { class: 'xp-browser xp-browser--tabbed' });
            const toolbar = h('div', { class: 'xp-ie-toolbar', html: '<span>Arquivo</span><span>Editar</span><span>Exibir</span><span>Favoritos</span><span>Ferramentas</span><span>Ajuda</span>' });
            const tabBar = h('div', { class: 'xp-tab-bar' });
            const addrBar = h('div', { class: 'xp-browser-bar' }, h('span', { class: 'xp-browser-label' }, '🌐'));
            const addrUrl = h('div', { class: 'xp-browser-url' });
            addrBar.appendChild(addrUrl);
            const browserBody = h('div', { class: 'xp-browser-body xp-browser-scroll', style: { position: 'relative', display: 'flex', flexDirection: 'column', flex: '1', minHeight: '0' } });
            const status = h('div', { class: 'xp-ie-status' });

            // ── Mockup Content Builders ──────────────────
            const renderOrkut = () => {
                const wrapOuter = h('div', { style: { width: '100%', height: '100%', overflowY: 'auto', background: '#d4dded', fontSize: '12px', fontFamily: 'Arial, sans-serif', padding: '10px 0' } });
                const wrap = h('div', { style: { maxWidth: '780px', margin: '0 auto', background: '#fff', minHeight: '100%', boxShadow: '0 0 5px rgba(0,0,0,0.1)' } });
                wrapOuter.appendChild(wrap);

                const infoRows = [
                    { label: 'relacionamento:', val: 'compromissado' },
                    { label: 'aniversário:', val: '23 de abril' },
                    { label: 'idade:', val: '28' },
                    { label: 'interesses no orkut:', val: 'amigos' },
                    { label: 'quem sou eu:', val: 'tecnicamente impressionante, esteticamente horrivel O_o' },
                    { label: 'etnia:', val: 'caucasiano (branco)' },
                    { label: 'cidade natal:', val: 'BH' },
                    { label: 'página web:', val: h('a', { href: '#', style: { color: '#0033cc' } }, 'tuliocareli.com') }
                ];

                const getScraps = () => JSON.parse(localStorage.getItem('orkut_scraps') || '[]');

                function showProfile() {
                    wrap.innerHTML = '';
                    wrapOuter.style.background = '#e8eef7'; // Classic light blue background

                    const userName = "tuliocareli";
                    const email = "tulio@email.com";

                    // TOP HEADER
                    const header = h('header', { style: { background: '#688cb8', padding: '0 15px', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', height: '35px', justifyContent: 'space-between' } },
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '15px' } },
                            h('div', { style: { fontWeight: 'bold', fontSize: '20px', letterSpacing: '-1px', color: '#d40078', background: '#fff', padding: '0 5px', borderRadius: '4px' } }, 'orkut', h('span', { style: { fontSize: '9px', color: '#ccc', verticalAlign: 'top' } }, 'BETA')),
                            h('span', { style: { cursor: 'pointer', background: '#e8eef7', color: '#688cb8', padding: '2px 5px', borderRadius: '3px' } }, 'Início'),
                            h('span', { style: { cursor: 'pointer' } }, 'Página de recados'),
                            h('span', { style: { cursor: 'pointer' } }, 'Amigos'),
                            h('span', { style: { cursor: 'pointer' } }, 'Comunidades')
                        ),
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                            h('span', { style: { fontWeight: 'bold' } }, email),
                            h('span', { style: { cursor: 'pointer', textDecoration: 'underline' } }, 'Sair'),
                            h('div', { style: { display: 'flex' } },
                                h('input', { type: 'text', value: 'pesquisa do orkut', style: { padding: '1px 5px', fontSize: '11px', border: 'none', color: '#888' } }),
                                h('div', { style: { background: '#3b5998', padding: '1px 5px', cursor: 'pointer' } }, '🔍')
                            )
                        )
                    );

                    // COLUMNS CONTAINER
                    const colsWrap = h('div', { style: { display: 'flex', padding: '10px', gap: '10px', alignItems: 'flex-start' } });

                    // ── LEFT COLUMN ──
                    const leftCol = h('div', { style: { width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' } });

                    leftCol.appendChild(h('img', { src: 'imagens/orkut_amigo_9.png', style: { width: '100%', border: '1px solid #c4d4e9', padding: '2px', background: '#fff' } }));

                    leftCol.appendChild(h('div', { style: { fontSize: '11px', lineHeight: '1.4' } },
                        h('div', { style: { color: '#0033cc', fontWeight: 'bold' } }, userName),
                        h('div', { style: { color: '#666' } }, 'masculino, compromissado', h('br'), 'BH, Brasil')
                    ));

                    leftCol.appendChild(h('div', { style: { color: '#0033cc', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' } },
                        h('span', { style: { border: '1px solid #0033cc', padding: '0 2px', borderRadius: '2px' } }, '+'), 'amigo',
                        h('div', { style: { marginLeft: 'auto', fontSize: '10px' } }, 'mais »')
                    ));

                    // Nav menu "perfil", "recados", etc
                    const navMenu = h('div', { style: { border: '1px solid #bfd0e6', background: '#fff', borderRadius: '4px', overflow: 'hidden' } });
                    const makeNav = (label, icon, act = false) => h('div', { style: { padding: '4px 8px', fontSize: '12px', background: act ? '#e4f0f8' : '#fff', color: '#0033cc', borderBottom: '1px solid #e4f0f8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' } }, h('span', { style: { width: '12px', textAlign: 'center' } }, icon), label);
                    navMenu.append(
                        makeNav('perfil', '👤', true),
                        makeNav('recados', '📝'),
                        makeNav('fotos', '📷'),
                        makeNav('vídeos', '📹'),
                        makeNav('depoimentos', '🌼')
                    );
                    leftCol.appendChild(navMenu);

                    // Apps menu (for buddy poke)
                    const appsMenu = h('div', { style: { border: '1px solid #bfd0e6', background: '#fff', borderRadius: '4px', overflow: 'hidden', marginTop: '5px' } });
                    appsMenu.appendChild(h('div', { style: { background: '#e4f0f8', padding: '2px 8px', color: '#0033cc', fontWeight: 'bold', fontSize: '11px' } }, 'apps'));
                    const buddyPokeRow = h('div', { style: { padding: '5px', textAlign: 'center', cursor: 'pointer' }, onclick: playBuddyPoke },
                        h('div', { style: { width: '100%', height: '40px', background: '#bfd0e6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', borderRadius: '2px' } }, 'BuddyPoke')
                    );
                    appsMenu.appendChild(buddyPokeRow);
                    leftCol.appendChild(appsMenu);

                    // ── MIDDLE COLUMN ──
                    const midCol = h('div', { style: { flex: 1, minWidth: '350px', background: '#fff', border: '1px solid #bfd0e6', borderRadius: '8px', overflow: 'hidden' } });

                    const midHeader = h('div', { style: { padding: '15px 20px 5px', borderBottom: '1px solid #bfd0e6' } });
                    midHeader.appendChild(h('h1', { style: { margin: '0 0 10px', fontSize: '24px', fontWeight: 'normal', color: '#000', fontFamily: 'Arial, sans-serif' } }, userName));

                    const badgesRow = h('div', { style: { display: 'flex', gap: '15px', fontSize: '11px', color: '#666', alignItems: 'center', flexWrap: 'wrap' } });
                    const bVal = (icon, lbl, v) => h('span', { style: { display: 'flex', gap: '3px', alignItems: 'center' } }, h('span', {}, lbl), h('span', {}, icon), h('span', { style: { color: '#0033cc' } }, v));
                    badgesRow.append(
                        bVal('📝', 'recados', '114'), bVal('📷', 'fotos', '0'), bVal('📹', 'vídeos', '5'), bVal('⭐', 'fãs', '15'),
                        h('span', { style: { color: '#eada00' } }, 'confiável 😃😃😃'),
                        h('span', { style: { color: '#89aedd' } }, 'legal 🧊🧊🧊'),
                        h('span', { style: { color: '#d40078' } }, 'sexy 🔥🔥🔥')
                    );
                    midHeader.appendChild(badgesRow);

                    // Tab social
                    const tTab = h('div', { style: { display: 'flex', padding: '10px 10px 0' } });
                    tTab.appendChild(h('div', { style: { background: '#89aedd', color: '#fff', fontWeight: 'bold', padding: '3px 10px', borderRadius: '6px 6px 0 0', fontSize: '11px' } }, 'social'));
                    midHeader.appendChild(tTab);
                    midCol.appendChild(midHeader);

                    const rowsCont = h('div', { style: { padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px' } });
                    infoRows.forEach((r, i) => {
                        const bg = i % 2 === 0 ? '#e4f0f8' : '#fff';
                        rowsCont.appendChild(h('div', { style: { display: 'flex', background: bg, padding: '4px', fontSize: '11px', lineHeight: '1.3' } },
                            h('div', { style: { width: '130px', textAlign: 'right', paddingRight: '10px', color: '#688cb8' } }, r.label),
                            h('div', { style: { flex: 1, color: '#333' } }, typeof r.val === 'string' ? r.val : r.val)
                        ));
                    });
                    midCol.appendChild(rowsCont);

                    // Scraps Box (keep it here inside midCol as usual)
                    const scrapsWrap = h('div', { style: { borderTop: '1px solid #bfd0e6', padding: '15px' } });
                    scrapsWrap.innerHTML = '<div style="font-weight:bold; color:#0033cc; font-size:12px; margin-bottom:10px">página de recados (scraps)</div>';
                    scrapsWrap.appendChild(h('textarea', { id: 'orkut_scrap_input', style: { width: '100%', height: '50px', marginBottom: '5px', border: '1px solid #bfd0e6' } }));
                    scrapsWrap.appendChild(h('button', {
                        style: { background: '#bfd0e6', border: 'none', padding: '3px 10px', cursor: 'pointer', fontSize: '11px', color: '#0033cc' }, onclick: () => {
                            const t = document.getElementById('orkut_scrap_input').value;
                            if (t.trim()) {
                                const sc = getScraps();
                                sc.unshift({ text: t, date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() });
                                localStorage.setItem('orkut_scraps', JSON.stringify(sc));
                                showProfile();
                            }
                        }
                    }, 'Deixar Recado'));

                    const scrapsList = h('div', { style: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' } });
                    getScraps().forEach(s => {
                        scrapsList.appendChild(h('div', { style: { background: '#f5f7fa', padding: '8px', border: '1px solid #bfd0e6', fontSize: '11px' } },
                            h('div', { style: { color: '#0033cc', fontWeight: 'bold', marginBottom: '4px' } }, 'Anônimo ', h('span', { style: { fontWeight: 'normal', color: '#666', fontSize: '9px' } }, s.date)),
                            h('div', { style: { whiteSpace: 'pre-wrap', color: '#333' } }, s.text)
                        ));
                    });
                    scrapsWrap.appendChild(scrapsList);
                    midCol.appendChild(scrapsWrap);


                    // ── RIGHT COLUMN ──
                    const rightCol = h('div', { style: { width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' } });

                    const makeBox = (title, count, isComm) => {
                        const box = h('div', { style: { background: '#fff', border: '1px solid #bfd0e6', borderRadius: '4px', overflow: 'hidden' } });
                        box.appendChild(h('div', { style: { background: '#e4f0f8', padding: '4px 8px', color: '#0033cc', fontSize: '12px', borderBottom: '1px solid #bfd0e6' } },
                            h('b', {}, title), h('span', { style: { color: '#688cb8' } }, ' (', count, ')')
                        ));
                        const items = h('div', { style: { display: 'flex', flexWrap: 'wrap', padding: '10px', gap: '5px', justifyContent: 'center' } });

                        const amgData = [
                            { s: 'imagens/orkut_amigo_1.png', n: '×_× LëoNåRdø ×_×' },
                            { s: 'imagens/orkut_amigo_2.png', n: '•°o.O MåyåRå O.o°•' },
                            { s: 'imagens/orkut_amigo_3.png', n: '*°•.☆ Gabi ☆.•°*' },
                            { s: 'imagens/orkut_amigo_7.png', n: '~(¯`·. FëLiPë .·´¯)~' },
                            { s: 'imagens/orkut_amigo_4.png', n: '¤ۣۜ๘ CåSåNoVå ¤ۣۜ๘' },
                            { s: 'imagens/orkut_amigo_5.png', n: 'ॐ MåR¢ëLø ॐ' }
                        ];

                        const commData = [
                            { s: 'imagens/orkut_communities.png', n: 'Eu já acessei a internet' },
                            { s: 'imagens/NIBXVEi.png', n: 'Queria sorvete mas era feijão' },
                            { s: 'imagens/v2XKEcN.png', n: 'Não fui eu, foi meu eu lírico' }
                        ];

                        const itemsData = isComm ? commData : amgData;

                        itemsData.forEach((item) => {
                            const it = h('div', { style: { width: '55px', textAlign: 'center' }, title: item.n });
                            it.appendChild(h('img', { src: item.s, style: { width: '100%', height: '55px', objectFit: 'cover', border: '1px solid #ccc' } }));
                            if (!isComm) {
                                it.appendChild(h('div', { style: { fontSize: '9px', color: '#0033cc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, item.n));
                            }
                            items.appendChild(it);
                        });
                        box.appendChild(items);
                        if (!isComm) {
                            box.appendChild(h('div', { style: { padding: '5px 8px', fontSize: '10px', color: '#0033cc', textDecoration: 'underline', cursor: 'pointer', background: '#f5f7fa', borderTop: '1px solid #bfd0e6' } }, 'ver todos'));
                        }
                        return box;
                    };

                    rightCol.append(makeBox('amigos', '51', false), makeBox('comunidades', '313', true));

                    colsWrap.append(leftCol, midCol, rightCol);
                    wrap.append(header, colsWrap);
                }

                function playBuddyPoke() {
                    wrap.innerHTML = '';
                    const inner = h('div', { class: 'xp-orkut-wrap', style: { paddingBottom: '30px', background: '#e8eef7' } },
                        h('header', { style: { background: '#688cb8', padding: '5px 20px', color: '#fff', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                            h('div', { style: { display: 'flex', alignItems: 'center', gap: '5px' } }, h('span', { style: { color: '#fff' } }, 'orkut'), h('span', { style: { color: '#d4dded', fontSize: '14px' } }, 'apps')),
                            h('span', { style: { fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }, onclick: showProfile }, 'voltar ao perfil')
                        ),
                        h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '500px', padding: '20px' } },
                            h('div', { id: 'buddy-poke-container', style: { width: '800px', height: '600px', background: '#000', border: '1px solid #bfd0e6', boxShadow: '0 0 10px rgba(0,0,0,0.2)' } }),
                            h('div', { style: { marginTop: '15px', color: '#688cb8', fontSize: '11px', textAlign: 'center', maxWidth: '600px', background: '#d4dded', padding: '10px', borderRadius: '4px', border: '1px dashed #688cb8' } },
                                h('b', {}, '⚠️ INFO DO LABORATÓRIO: '),
                                'Como os servidores originais do Orkut viraram poeira estelar há mais de uma década e o WebAssembly do emulador Ruffle não renderiza texturas e shaders ActionScript 3, seu BuddyPoke abraçou seu modo "Fantasma" e não carrega a roupinha original. Funcional, porém pálido! 👻',
                                h('br'), h('br'),
                                h('span', { style: { fontSize: '9px' } }, 'BuddyPoke criado por Dave Westwood and Randall Ho, está aqui por razões de documentação pura. Todos os direitos reservados aos geniais criadores originais.')
                            )
                        )
                    );
                    wrap.appendChild(inner);

                    // Defer ruffle instantiation so `#buddy-poke-container` is in DOM
                    setTimeout(() => {
                        const container = document.getElementById('buddy-poke-container');
                        if (container && window.RufflePlayer) {
                            const ruffle = window.RufflePlayer.newest();
                            const player = ruffle.createPlayer();
                            player.style.width = '100%';
                            player.style.height = '100%';
                            container.appendChild(player);
                            player.load({ url: 'jogoflash/BuddyPokeOrkut.swf' });
                        } else if (container) {
                            container.innerHTML = '<div style="padding:20px;text-align:center;color:#fff">Ruffle Player não carregado. Verifique os scripts.</div>';
                        }
                    }, 50);
                }

                const showLogin = () => {
                    wrap.innerHTML = '';
                    const topBar = h('div', { style: { background: '#c4d4e9', padding: '5px 15px', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #999', flexWrap: 'wrap' } });
                    topBar.innerHTML = '<div style="font-weight:bold; margin-bottom:5px; font-size:11px">Início | Participar do orkut | Ajuda</div><div style="color:#d40078; font-size:24px; font-weight:bold; letter-spacing:-2px; font-family:tahoma,sans-serif">orkut</div>';

                    const loginBody = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '30px', padding: '30px 20px 50px' } });

                    const leftCol = h('div', { style: { flex: 1, minWidth: '300px', textAlign: 'center' } });
                    leftCol.innerHTML = '<div style="font-size:24px; font-family:tahoma,sans-serif; letter-spacing:-1px; margin-bottom:15px"><span style="color:#d40078;font-weight:bold">o orkut</span><span style="font-size:14px; color:#333; font-weight:normal; letter-spacing:0"> é uma comunidade on-line que conecta pessoas<br>através de uma rede de amigos confiáveis.</span></div><p style="font-size:12px; margin-bottom:20px; text-align:justify; padding: 0 10%; color:#555">Proporcionamos um ponto de encontro on-line com um ambiente de confraternização, onde é possível fazer novos amigos e conhecer pessoas que têm os mesmos interesses. Participe do orkut para estabelecer seu circulo social e se conectar a ele.</p>';

                    const grid = h('div', { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' } });
                    ['imagens/orkut_amigo_1.png', 'imagens/orkut_amigo_2.png', 'imagens/orkut_amigo_3.png', 'imagens/orkut_amigo_7.png', 'imagens/orkut_amigo_4.png', 'imagens/orkut_amigo_8.png'].forEach(src => {
                        grid.appendChild(h('img', { src, style: { width: '80px', height: '100px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '1px 1px 3px rgba(0,0,0,0.3)', transform: `rotate(${Math.random() * 8 - 4}deg)` } }));
                    });
                    leftCol.appendChild(grid);
                    leftCol.innerHTML += '<br><div style="color:#0033cc; text-decoration:underline; font-size:12px; font-weight:bold; margin-top:25px; cursor:pointer">Leia mais sobre como manter o orkut bonito</div>';

                    const rightColWrap = h('div', { style: { width: '100%', maxWidth: '280px', alignSelf: 'flex-start' } });
                    const rightCol = h('div', { style: { border: '1px solid #c4d4e9', background: '#f5f7fa', padding: '15px' } });
                    rightColWrap.appendChild(rightCol);

                    rightCol.innerHTML = '<div style="font-weight:bold; text-align:center; font-size:12px; margin-bottom:10px; color:#000">login</div><div style="text-align:center; margin-bottom:15px; font-size:12px">Acesse o orkut com a sua<br><span style="font-size:17px; font-weight:bold; color:#0033cc; font-family:serif">conta do <span style="color:#d40078">G</span><span style="color:#eada00">o</span><span style="color:#eada00">o</span><span style="color:#0033cc">g</span><span style="color:#0a0">l</span><span style="color:#d40078">e</span></span></div>';

                    const eRow = h('div', { style: { marginBottom: '10px', display: 'flex', alignItems: 'center', fontSize: '11px' } }, h('span', { style: { width: '60px', textAlign: 'right', paddingRight: '5px', color: '#000' } }, 'E-mail:'), h('input', { type: 'text', value: 'tulio@email.com', style: { flex: 1, padding: '1px', border: '1px solid #7f9db9' } }));
                    const pRow = h('div', { style: { marginBottom: '10px', display: 'flex', alignItems: 'center', fontSize: '11px' } }, h('span', { style: { width: '60px', textAlign: 'right', paddingRight: '5px', color: '#000' } }, 'Senha:'), h('input', { type: 'password', value: '*******', style: { flex: 1, padding: '1px', border: '1px solid #7f9db9' } }));

                    const subRow = h('div', { style: { textAlign: 'center', marginLeft: '65px', marginTop: '5px' } });
                    const cbWrap = h('div', { style: { marginBottom: '10px', fontSize: '10px', color: '#333', display: 'flex', alignItems: 'flex-start', textAlign: 'left' } });
                    cbWrap.appendChild(h('input', { type: 'checkbox', checked: true, style: { margin: '2px 5px 0 0' } }));
                    cbWrap.appendChild(document.createTextNode('Salvar as minhas informações neste computador.'));

                    const btn = h('button', { style: { padding: '2px 12px', cursor: 'pointer', background: '#e0e0e0', border: '1px solid #999', color: '#000', fontSize: '11px' }, onclick: showProfile }, 'Login');

                    subRow.append(cbWrap, h('div', { style: { textAlign: 'left' } }, btn));

                    rightCol.append(eRow, pRow, subRow);
                    const forgotLink = h('div', { style: { textAlign: 'center', marginTop: '20px', fontSize: '11px' } }, h('a', { href: '#', style: { color: '#0033cc' } }, 'Esqueceu a sua senha?'));
                    rightCol.appendChild(forgotLink);

                    const bottomJoin = h('div', { style: { borderTop: '1px solid #c4d4e9', marginTop: '20px', paddingTop: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px' } }, 'Ainda não é membro? ', h('span', { style: { color: '#0033cc', textDecoration: 'underline', cursor: 'pointer' } }, 'ENTRE JÁ'));
                    rightCol.appendChild(bottomJoin);

                    loginBody.append(leftCol, rightColWrap);
                    wrap.append(topBar, loginBody);
                };



                showLogin();
                return wrapOuter;
            };

            const renderJogosOnline = () => {
                const wrap = h('div', { style: { background: '#fff', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowY: 'auto', fontFamily: 'Arial, sans-serif' } });
                const games = [
                    { id: 'motocross', name: 'TG Motocross 2', swf: 'jogoflash/TG_Motocross_2.swf', thumb: 'imagens/jogos_motocross.png', category: 'Esportes' },
                    { id: 'bmx', name: 'BMX Stunts', swf: 'jogoflash/bmx.swf', thumb: 'imagens/jogos_bmx.png', category: 'Ação' },
                    { id: 'ride', name: 'Create a Ride', swf: 'jogoflash/createaride.swf', thumb: 'imagens/jogos_ride.png', category: 'Corrida' }
                ];

                const showHome = () => {
                    wrap.innerHTML = '';
                    const header = h('div', { style: { background: 'linear-gradient(to right, #ffffff, #dbeefd)', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #004a99' } },
                        h('div', { style: { display: 'flex', alignItems: 'center', gap: '15px' } },
                            h('img', { src: 'imagens/jogos_logo.png', style: { height: '50px' } }),
                            h('div', { style: { color: '#004a99', fontSize: '14px', fontWeight: 'bold' } }, 'Os melhores jogos da internet!')
                        )
                    );
                    const grid = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px', background: '#f0f8ff', flex: 1, minWidth: '0', alignContent: 'flex-start' } });
                    games.forEach(g => {
                        const item = h('div', { style: { width: '130px', background: '#fff', padding: '8px', border: '1px solid #ccc', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s', boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }, onclick: () => play(g), onmouseover: (e) => e.currentTarget.style.transform = 'scale(1.03)', onmouseout: (e) => e.currentTarget.style.transform = 'scale(1)' },
                            h('img', { src: g.thumb, style: { width: '100%', height: '80px', objectFit: 'cover', background: '#ddd' } }),
                            h('div', { style: { fontWeight: 'bold', marginTop: '5px', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, g.name)
                        );
                        grid.appendChild(item);
                    });
                    const sidebar = h('div', { style: { width: '180px', flexShrink: '0', padding: '15px', background: '#f0f8ff', borderLeft: '1px solid #ccc', fontSize: '12px' } },
                        h('div', { style: { background: '#ff9900', color: '#fff', padding: '10px', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px', borderRadius: '4px' } }, 'CURTA NO ORKUT!'),
                        h('div', { style: { background: '#fff', border: '1px solid #ccc', padding: '10px' } },
                            h('h4', { style: { margin: '0 0 10px', color: '#004a99' } }, 'Ranking Viral'),
                            ['TG Motocross 2', 'BMX Stunts', 'Create a Ride'].map((n, i) => h('div', { style: { marginBottom: '5px', display: 'flex', gap: '5px' } },
                                h('span', { style: { fontWeight: 'bold', color: '#ff9900' } }, i + 1 + '.'),
                                h('span', {}, n)
                            ))
                        )
                    );
                    const main = h('div', { style: { display: 'flex', flex: 1, minHeight: '0' } }, grid, sidebar);
                    wrap.appendChild(header);
                    wrap.appendChild(main);
                };

                const play = (game) => {
                    wrap.innerHTML = '';
                    const head = h('div', { style: { background: '#004a99', padding: '10px', color: '#fff', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }, onclick: showHome }, 'Voltar');
                    const gameCont = h('div', { style: { flex: 1, background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' } });
                    wrap.appendChild(head); wrap.appendChild(gameCont);
                    wrap.appendChild(h('div', { style: { padding: '10px', textAlign: 'center', fontSize: '10px' } }, 'Direito de criação dos jogos para seus respectivos criadores.'));

                    setTimeout(() => {
                        if (window.RufflePlayer) {
                            const ruffle = window.RufflePlayer.newest();
                            const player = ruffle.createPlayer();
                            gameCont.appendChild(player);
                            player.style.width = '640px'; player.style.height = '480px';
                            player.load({ url: game.swf });
                        } else {
                            gameCont.innerHTML = '<div style="color:#fff; padding:20px;">Ruffle Engine não carregada.</div>';
                        }
                    }, 50);
                };
                showHome();
                return wrap;
            };

            const renderYoutube = () => {
                const wrapOuter = h('div', {
                    class: 'yt-legacy-view-outer',
                    style: { background: '#e5e5e5', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: 1, overflowY: 'auto', overflowX: 'hidden', alignItems: 'center' }
                });
                const wrap = h('div', {
                    class: 'yt-legacy-view',
                    style: { background: '#fff', width: '100%', maxWidth: '1006px', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', fontSize: '12px', minHeight: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }
                });
                wrapOuter.appendChild(wrap);

                // TOP GLOBAL HEADER
                const topNav = h('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '5px 15px', fontSize: '11px', color: '#0033cc' } });
                topNav.innerHTML = '<div style="color:#333">Worldwide (All) | <span style="text-decoration:underline;cursor:pointer">English</span></div><div><span style="font-weight:bold;text-decoration:underline;cursor:pointer;color:#0033cc">Sign Up</span> | <span style="text-decoration:underline;cursor:pointer">QuickList (0)</span> | <span style="text-decoration:underline;cursor:pointer">Help</span> | <span style="text-decoration:underline;cursor:pointer">Sign In</span></div>';

                // LOGO & TABS AREA
                const masthead = h('div', { style: { display: 'flex', alignItems: 'flex-end', padding: '10px 15px 0', gap: '15px' } });
                const logoBox = h('div', { style: { width: '130px', textAlign: 'center', marginBottom: '5px', cursor: 'pointer' } });
                logoBox.innerHTML = '<div style="font-family:\'Arial Black\', Impact, sans-serif; font-size:26px; font-weight:bold; letter-spacing:-1px; color:#333; margin-bottom:0; line-height:1">You<span style="background:#cc0000; color:#fff; padding:0 3px; border-radius:5px; margin-left:2px">Tube</span></div><div style="font-size:10px; color:#666; margin-top:2px">Broadcast Yourself™</div>';

                const tabsWrap = h('div', { style: { flex: 1, display: 'flex', gap: '5px' } });
                ['Home', 'Videos', 'Channels', 'Community'].forEach(tab => {
                    const t = h('div', { style: { padding: '5px 15px', background: '#e2ebf6', borderRadius: '4px 4px 0 0', fontWeight: 'bold', fontSize: '13px', color: '#0033cc', cursor: 'pointer', border: '1px solid #c8d8ec', borderBottom: 'none' } }, tab);
                    tabsWrap.appendChild(t);
                });

                masthead.append(logoBox, tabsWrap);

                // SEARCH BAR & UPLOAD
                const searchArea = h('div', { style: { background: '#eeeeee', borderTop: '1px solid #ccc', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px' } });
                searchArea.innerHTML = '<input type="text" style="flex:1; max-width:350px; border:1px solid #999; padding:4px"><select style="padding:3px; border:1px solid #999; font-size:11px"><option>Videos</option></select><button style="padding:3px 15px; border:1px solid #999; background:#fff; cursor:pointer">Search</button><span style="color:#0033cc;text-decoration:underline;font-size:11px;cursor:pointer">advanced</span><div style="flex:1"></div><button style="padding:4px 20px; background:#ffe000; border:1px solid #e0c000; font-weight:bold; font-size:11px; cursor:pointer; color:#000; border-radius:3px">Upload</button>';

                const innerWrap = h('div', { style: { width: '100%', maxWidth: '1000px', margin: '0 auto', background: '#fff' } });

                const header = h('div', { style: { width: '100%', fontFamily: 'Arial' } }, topNav, masthead, searchArea);

                const mainCont = h('div', { style: { display: 'flex', flexWrap: 'wrap', padding: '20px 15px', gap: '20px', background: '#fff', width: '100%' } });

                // LEFT COLUMN
                const leftCol = h('div', { style: { flex: '1 1 480px', minWidth: '0' } });

                const title = h('h1', { style: { fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px', color: '#000' } }, 'GTA San Andreas Bigfoot + UFO');

                // PLAYER CONTAINER
                const playerBg = h('div', { style: { background: '#f5f5f5', border: '1px solid #ccc', padding: '10px' } });
                const videoCont = h('div', { style: { background: '#000', height: '360px', position: 'relative' } });

                const ytDivId = getUniqueYtId('ytplayer-video');
                const ytDiv = h('div', { id: ytDivId, style: { width: '100%', height: '100%' } });
                videoCont.appendChild(ytDiv);

                // --- 2007 PLAYER CONTROLS BARRINHA ---
                const controlsBar = h('div', {
                    style: {
                        background: 'linear-gradient(to bottom, #eeeeee 0%, #cccccc 100%)',
                        border: '1px solid #aaaaaa',
                        borderTopColor: '#dfdfdf',
                        borderRadius: '4px',
                        height: '24px',
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0 6px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }
                });

                // Play/Pause and Audio
                const btnStyle = {
                    width: '20px', height: '18px', background: 'linear-gradient(to bottom, #fafafa 0%, #d0d0d0 100%)',
                    border: '1px solid #999', borderRadius: '3px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#333'
                };

                const btnPause = h('button', { style: btnStyle }, '⏸');
                const btnPrev = h('button', { style: btnStyle }, '⏮');

                // Progress Bar
                const progWrap = h('div', { style: { display: 'flex', alignItems: 'center', flex: 1, position: 'relative', height: '100%', cursor: 'pointer' } });

                const playHead = h('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: 'radial-gradient(circle at center, #fff, #999)', border: '1px solid #666', zIndex: 2, position: 'absolute', pointerEvents: 'none' } });

                const progBg = h('div', { style: { position: 'absolute', left: '12px', right: '0', height: '6px', background: '#fff', border: '1px solid #999', borderRadius: '3px', overflow: 'hidden' } });
                const progFill = h('div', { style: { width: '0%', height: '100%', background: '#cc0000', borderRight: '1px solid #900' } });
                progBg.appendChild(progFill);

                progWrap.appendChild(playHead);
                progWrap.appendChild(progBg);

                // Time Display
                const timeBox = h('div', {
                    style: {
                        background: 'linear-gradient(to bottom, #111 0%, #222 100%)',
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        padding: '2px 5px',
                        border: '1px solid #000',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap'
                    }
                });
                timeBox.innerHTML = '<span style="color:#aaa">00:00</span> / <span style="color:#c00">0:00</span>';

                // --- NEW VOLUME SLIDER ---
                const volWrap = h('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '5px' } });

                // Track do slider cinza escura
                const volTrack = h('div', { style: { width: '35px', height: '4px', background: '#444', borderTop: '1px solid #222', borderBottom: '1px solid #aaa', position: 'relative', cursor: 'pointer' } });
                // Grabber (pequeno puxador do volume) branco/prateado
                const volThumb = h('div', { style: { width: '8px', height: '12px', background: 'linear-gradient(to bottom, #f0f0f0, #aaa)', border: '1px solid #666', position: 'absolute', top: '-4px', left: '15px', borderRadius: '2px', pointerEvents: 'none' } });
                volTrack.appendChild(volThumb);

                const volIcon = h('div', { style: { fontSize: '13px', cursor: 'pointer', color: '#555' }, title: 'Mute' }, '🔊');

                volWrap.appendChild(volTrack);
                volWrap.appendChild(volIcon);
                // ------------------------------

                const btnFull = h('button', { style: btnStyle }, '⛶');
                const btnPop = h('button', { style: btnStyle }, '⧉');

                controlsBar.append(btnPause, btnPrev, progWrap, timeBox, volWrap, btnFull, btnPop);

                playerBg.append(videoCont, controlsBar);

                // Bottom Actions
                const actionBox = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', border: '1px dotted #ccc', marginTop: '10px', padding: '10px', fontSize: '11px', background: '#fafafa' } });
                actionBox.innerHTML = '<div style="text-align:center; min-width: 100px;"><div style="color:#0033cc;text-decoration:underline;cursor:pointer">Sign in to rate</div><div style="color:#c00;font-size:14px">★★★★★</div><div style="margin-top:5px;color:#333;font-size:10px">Views: 1,235,901 | Comments: 1,862</div></div><div style="color:#0033cc;text-decoration:underline;cursor:pointer;padding-top:10px">Save to Favorites</div><div style="color:#0033cc;text-decoration:underline;cursor:pointer;padding-top:10px">Add to Groups</div><div style="text-align:right"><div style="color:#0033cc;text-decoration:underline;cursor:pointer;margin-bottom:3px">Share Video</div><div style="color:#0033cc;text-decoration:underline;cursor:pointer;margin-bottom:3px">Post Video</div><div style="color:#c00;text-decoration:underline;cursor:pointer">Flag as Inappropriate</div></div>';

                leftCol.append(title, playerBg, actionBox);

                // RIGHT COLUMN (Related + Info)
                const rightCol = h('div', { style: { flex: '1 1 280px', minWidth: '0', maxWidth: '100%' } });
                const mainInfo = h('div', { style: { border: '1px solid #e2e2e2', padding: '10px', marginBottom: '15px' } });
                mainInfo.innerHTML = '<div style="background:#ffffee; border:1px solid #eade83; padding:5px; text-align:center; font-weight:bold; color:#773300; margin-bottom:10px; cursor:pointer; font-size:11px">TRY OUT THE NEW BETA!</div><div style="display:flex; justify-content:space-between"><div style="line-height:1.4"><div>Added: June 28, 2007</div><div>From: <a href="#" style="color:#0033cc;text-decoration:none">ScapeTheGoat</a></div><div style="margin:5px 0">História pura do YouTube!</div><div>Category: <a href="#" style="color:#0033cc;text-decoration:none">Entertainment</a></div><div>Tags: <a href="#" style="color:#0033cc;text-decoration:none">old</a> <a href="#" style="color:#0033cc;text-decoration:none">nostalgia</a></div></div><button style="background:#ff9900; color:#fff; border:1px solid #cc6600; padding:2px 5px; font-weight:bold; font-size:10px; height:max-content; cursor:pointer; border-radius:2px">Subscribe</button></div>';

                const relatedInfo = h('div', { style: { border: '1px solid #ccc', background: '#f5f5f5' } });
                const relatedTitle = h('div', { style: { fontWeight: 'bold', padding: '5px 10px', borderBottom: '1px solid #ccc', fontSize: '11px' } }, 'Related Videos');

                const relatedList = h('div', { style: { maxHeight: '380px', overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' } });

                const videos = [
                    { id: 'yU5KXTDCf-0', min: '3:51', t: 'GTA San Andreas Bigfoot + UFO', f: 'ScapeTheGoat', v: '1,235,901' },
                    { id: 'OiT1RyTZgcg', min: '1:24', t: 'Mario na fase do cogumelo do sol Tunadíssimo.', f: 'zegracagames', v: '5,407,110' },
                    { id: '02vyPaYPdl8', min: '4:11', t: 'Erros Bizonhos 1', f: 'ZgracaRetro', v: '2,901,344' },
                    { id: 'Nffd0NZERKQ', min: '6:02', t: 'BRKs_EDU - Team Deathmatch - Modern Warfare', f: 'BRKsEDU', v: '5,012,778' },
                    { id: 'oHg5SJYRHA0', min: '3:32', t: 'RickRoll\'D', f: 'cotter548', v: '91,330,210' },
                    { id: 'y8Kyi0WNg40', min: '0:05', t: 'Dramatic Look', f: 'Sleepingplanet', v: '49,155,301' },
                    { id: '6zlViU5PBPY', min: '10:04', t: 'Night at the roxbury-What is love? original gif', f: 'funnyhoney', v: '18,540,110' },
                    { id: 'ZN5PoW7_kdA', min: '1:36', t: 'The Annoying Orange', f: 'Annoying Orange', v: '230,901,344' },
                    { id: 's8MDNFaGfT4', min: '1:45', t: 'It\'s Peanut Butter Jelly Time!!!', f: 'RyanEtrata', v: '48,111,002' },
                    { id: 'HPPj6viIBmU', min: '1:44', t: 'Star Wars Kid', f: 'Jimi Love', v: '38,111,002' }
                ];

                videos.forEach((v, i) => {
                    const vEl = h('div', {});
                    vEl.innerHTML = '<div style="display:flex; gap:10px; padding:5px; cursor:pointer; background:' + (i === 0 ? '#ffffee' : 'none') + '; border:' + (i === 0 ? '1px dotted #cc9900' : 'none') + '" title="' + v.t + '"><div style="position:relative; width:90px; height:68px; background:#000; flex-shrink:0; border:1px solid #999; padding:2px; box-sizing:border-box; background:#fff"><div style="width:100%; height:100%; overflow:hidden; position:relative"><img src="https://img.youtube.com/vi/' + v.id + '/default.jpg" style="width:100%; height:140%; object-fit:cover; margin-top:-15%; opacity:' + (i === 0 ? 1 : 0.8) + '"><div style="position:absolute; bottom:2px; right:2px; background:rgba(0,0,0,0.7); color:#fff; font-size:9px; padding:1px 3px">' + v.min + '</div></div></div><div style="font-size:11px; display:flex; flex-direction:column; gap:3px"><div style="color:#0033cc; font-weight:bold">' + v.t + '</div><div style="color:#666">From: ' + v.f + '</div><div style="color:#333">Views: ' + v.v + '</div></div></div>';
                    vEl.onclick = () => {
                        if (ytPlayer && ytPlayer.loadVideoById) {
                            ytPlayer.loadVideoById(v.id);
                            title.textContent = v.t;
                        }
                    };
                    relatedList.appendChild(vEl);
                });

                relatedInfo.append(relatedTitle, relatedList);
                rightCol.append(mainInfo, relatedInfo);

                mainCont.append(leftCol, rightCol);
                innerWrap.append(header, mainCont);
                wrap.append(innerWrap);

                // --- Interaction and Sync ---
                let ytPlayer;
                const updatePlayBtn = (state) => {
                    btnPause.textContent = (state === window.YT.PlayerState.PLAYING) ? '⏸' : '▶';
                };

                ensureYT(() => {
                    const checkDom = setInterval(() => {
                        if (!document.getElementById(ytDivId)) return;
                        clearInterval(checkDom);

                        ytPlayer = new window.YT.Player(ytDivId, {
                            height: '100%', width: '100%', videoId: 'yU5KXTDCf-0',
                            playerVars: { autoplay: 1, controls: 0, rel: 0, modestybranding: 1, disablekb: 1 },
                            events: {
                                onReady: () => {
                                    ytPlayer.setVolume(50);
                                    updatePlayBtn(ytPlayer.getPlayerState());
                                },
                                onStateChange: (e) => updatePlayBtn(e.data)
                            }
                        });

                        setInterval(() => {
                            if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
                                const t = ytPlayer.getCurrentTime();
                                const d = ytPlayer.getDuration() || 0;
                                const fTime = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
                                timeBox.innerHTML = '<span style="color:#aaa">' + fTime(t) + '</span> / <span style="color:#c00">' + fTime(d) + '</span>';
                                if (d > 0) {
                                    const pct = t / d;
                                    progFill.style.width = (pct * 100) + '%';
                                    const pw = progBg.offsetWidth;
                                    playHead.style.left = (12 + pct * pw - 6) + 'px';
                                }
                            }
                        }, 200);
                    }, 100);
                });

                btnPause.onclick = () => {
                    if (!ytPlayer) return;
                    if (ytPlayer.getPlayerState() === window.YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
                    else ytPlayer.playVideo();
                };

                // Volume slider interactivity
                let isDraggingVol = false;

                const updateVol = (e) => {
                    const rect = volTrack.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    if (x < 0) x = 0; if (x > rect.width) x = rect.width;
                    const pct = x / rect.width;
                    volThumb.style.left = (x - 4) + 'px'; // Center thumb
                    if (ytPlayer && ytPlayer.setVolume) {
                        ytPlayer.setVolume(pct * 100);
                        if (pct > 0) ytPlayer.unMute();
                    }
                };

                volWrap.onmousedown = (e) => {
                    isDraggingVol = true;
                    updateVol(e);
                };

                window.addEventListener('mousemove', (e) => {
                    if (isDraggingVol) updateVol(e);
                });

                window.addEventListener('mouseup', () => {
                    isDraggingVol = false;
                });

                // Set initial volume visually
                volThumb.style.left = ((35 * 0.5) - 4) + 'px';

                // Seek interactivity
                progWrap.onclick = (e) => {
                    if (!ytPlayer || ytPlayer.getDuration() === 0) return;
                    const rect = progBg.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    if (x < 0) x = 0; if (x > rect.width) x = rect.width;
                    let pct = x / rect.width;
                    ytPlayer.seekTo(pct * ytPlayer.getDuration(), true);
                };

                let muted = false;
                volIcon.onclick = () => {
                    if (!ytPlayer) return;
                    muted = !muted;
                    if (muted) {
                        ytPlayer.mute();
                        volIcon.innerHTML = '🔇';
                    } else {
                        ytPlayer.unMute();
                        volIcon.innerHTML = '🔊';
                    }
                };

                wrapOuter.onClose = () => {
                    if (ytPlayer && ytPlayer.destroy) ytPlayer.destroy();
                };

                return wrapOuter;
            };



            const tabEls = TABS.map((tab, i) => {
                const el = h('div', { class: 'xp-tab' + (i === activeIdx ? ' xp-tab--active' : ''), onclick: () => switchTab(i) }, tab.name);
                tabBar.appendChild(el);
                return el;
            });

            function switchTab(idx) {
                if (browserWrap._currentCleanup) { browserWrap._currentCleanup(); browserWrap._currentCleanup = null; }
                activeIdx = idx;
                const tab = TABS[idx];
                tabEls.forEach((el, i) => el.classList.toggle('xp-tab--active', i === idx));
                addrUrl.textContent = tab.url;
                browserBody.innerHTML = '';
                if (tab.type === 'mockup') {
                    if (tab.id === 'youtube') {
                        const yt = renderYoutube();
                        browserBody.appendChild(yt);
                        if (yt.onClose) browserWrap._currentCleanup = yt.onClose;
                    }
                    else if (tab.id === 'orkut') browserBody.appendChild(renderOrkut());
                    else if (tab.id === 'jogosonline') browserBody.appendChild(renderJogosOnline());
                } else if (tab.wayback) {
                    if (tab.name === 'Tony Hawk Underground') {
                        const ifrWrap = h('div', { style: { width: '100%', height: '100%', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center' } });
                        const ifrCenter = h('div', { style: { width: '800px', height: '100%', flexShrink: 0, transform: 'scale(1.05)', transformOrigin: 'top center' } });
                        const ifr = h('iframe', { src: tab.wayback, style: { width: '100%', height: '100%', border: 'none' } });
                        ifrCenter.appendChild(ifr);
                        ifrWrap.appendChild(ifrCenter);
                        browserBody.appendChild(ifrWrap);
                    } else {
                        const ifr = h('iframe', { src: tab.wayback, style: { width: '100%', height: '100%', border: 'none' } });
                        browserBody.appendChild(ifr);
                    }
                } else if (tab.img) {
                    const img = h('img', { src: tab.img, style: { width: '100%', height: '100%', objectFit: 'contain' } });
                    browserBody.appendChild(img);
                } else {
                    // Default iframe for external sites
                    const iframe = h('iframe', { src: tab.url, style: { width: '100%', height: '100%', border: 'none' } });
                    browserBody.appendChild(iframe);
                }
            }

            switchTab(activeIdx);
            browserWrap.appendChild(toolbar); browserWrap.appendChild(tabBar);
            browserWrap.appendChild(addrBar); browserWrap.appendChild(browserBody);
            browserWrap.appendChild(status);
            return browserWrap;
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
                '01 - Digital Love - The Pixels.mp3',
                '02 - Shadow Dancing - Midnight Vultures.mp3',
                '03 - Gasoline Hearts - Broken Radiators.mp3',
                '04 - Concrete Jungle - Urban Tribes.mp3',
                '05 - Static Rain - Frequency Zero.mp3',
                '06 - Last Train to Mars - Planet 9.mp3',
                '07 - Binary Soul - Modulator.mp3',
                '08 - The Slow Fade - Monochrome.mp3',
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
                'iuJDhFRDx9M', // 1°
                'Gdp4k77RZGA', // 2°
                'gSQjk4YSDDs', // 3° (CS Source Phantasy)
                'YtpATpMKDkg', // 4° (Naruto AMV)
                'FgyF70uWNRw',
                'LCDaw0QmQQc',
                'oHg5SJYRHA0',
                'z9XkY84MUls',
                'VgDgWzBL7s4',
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
                return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} `;
            };

            // Criar ID unico pro iframe para a API do Google mapear corretamente
            const playerDivId = getUniqueYtId('yt-player');
            playerContainer.id = playerDivId;

            ensureYT(() => {
                const waitDom = setInterval(() => {
                    if (!document.getElementById(playerDivId)) return;
                    clearInterval(waitDom);

                    ytPlayer = new window.YT.Player(playerDivId, {
                        height: '100%',
                        width: '100%',
                        videoId: VIDS[currentIdx],
                        playerVars: {
                            'playsinline': 1,
                            'controls': 0,
                            'disablekb': 1,
                            'fs': 0,
                            'modestbranding': 1,
                            'rel': 0,
                            'origin': window.location.origin
                        },
                        events: {
                            'onReady': () => {
                                ytReady = true;
                                blocker.onclick = () => {
                                    const state = ytPlayer.getPlayerState();
                                    if (state === window.YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
                                    else ytPlayer.playVideo();
                                };
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
                }, 50);
            });

            wrap.onClose = () => {
                if (checkInterval) clearInterval(checkInterval);
                if (ytPlayer && ytPlayer.destroy) ytPlayer.destroy();
            };

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
            const MUSIC_DATA = [
                { id: 'jT_2WIzOs5w', title: 'Linkin Park - Faint' },
                { id: 'A9wLowpiWWs', title: 'Evanescence - Going Under' },
                { id: 'GrD3dDUKxYY', title: 'Three Days Grace - I Hate Everything About You' },
                { id: 'w4RXGsLyfXU', title: 'Akon - Lonely' },
                { id: 'NWi4eavotFk', title: 'Soulja Boy - Crank Dat' },
                { id: 'H3axP4norfk', title: '50 Cent - In Da Club' },
                { id: '51XzW98wEDg', title: 'Green Day - Boulevard of Broken Dreams' },
                { id: 'VyZeqzWvR7w', title: 'Bon Jovi - It\'s My Life' },
                { id: 'y9Kqb2z9Lzs', title: 'Edward Maya & Vika Jigulina - Stereo Love' },
                { id: 'g_osW9OINIA', title: 'Cascada - Everytime We Touch' },
                { id: 'n4S5-nRUWbE', title: 'Sean Kingston, Justin Bieber - Eenie Meenie' },
                { id: 'VXPvpK2ct4M', title: 'Nelly Furtado - Promiscuous' },
                { id: 'rQ2bIzanCEU', title: 'Kasino - Can\'t Get Over' },
                { id: 'iCL04cxeMOE', title: 'Usher - Yeah!' }
            ];

            const wrap = h('div', { class: 'winamp-player-wrap', style: { width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0a' } });

            // Titlebar
            const titlebar = h('div', { class: 'winamp-titlebar' },
                h('span', { class: 'winamp-logo' }, '⚡ TULIOAMP'),
                h('div', { class: 'winamp-tb-buttons' },
                    h('span', { class: 'winamp-tb-btn' }, '_'),
                    h('span', { class: 'winamp-tb-btn' }, '□'),
                    h('span', { class: 'winamp-tb-btn' }, '✕')
                )
            );

            // Display
            const viz = h('div', { class: 'winamp-visualizer', style: { display: 'flex', gap: '2px', alignItems: 'flex-end', height: '40px', padding: '5px' } });
            for (let i = 0; i < 12; i++) {
                viz.appendChild(h('div', { style: { flex: 1, background: '#0f0', borderTop: '1px solid #fff', height: '10%', transition: 'height 0.1s' } }));
            }

            const trackNameLabel = h('div', { class: 'winamp-track-name', style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10px' } }, MUSIC_DATA[0].title);
            const timeLabel = h('div', { class: 'winamp-time', style: { fontSize: '20px' } }, '0:00');

            const infoPanel = h('div', { class: 'winamp-info-panel', style: { minWidth: 0, overflow: 'hidden', padding: '5px' } },
                trackNameLabel,
                h('div', { class: 'winamp-meta-row', style: { display: 'flex', gap: '4px', fontSize: '9px', margin: '4px 0' } },
                    h('span', { class: 'winamp-meta-tag' }, 'BITRATE'), h('span', { class: 'winamp-meta-val', style: { color: '#0f0' } }, '128'), h('span', { class: 'winamp-meta-tag' }, 'kbps'),
                    h('span', { class: 'winamp-meta-tag' }, 'SRATE'), h('span', { class: 'winamp-meta-val', style: { color: '#0f0' } }, '44'), h('span', { class: 'winamp-meta-tag' }, 'kHz')
                ),
                h('div', { class: 'winamp-meta-row', style: { display: 'flex', gap: '4px', fontSize: '9px', marginBottom: '4px' } },
                    h('span', { class: 'winamp-meta-tag' }, 'MONO'), h('span', { class: 'winamp-meta-val stereo', style: { color: '#fff', fontWeight: 'bold' } }, 'STEREO')
                ),
                timeLabel
            );

            const display = h('div', { class: 'winamp-display', style: { display: 'flex', flexDirection: 'column' } }, viz, infoPanel);

            // Progress Bar
            const progContainer = h('div', {
                style: { width: '80%', height: '8px', background: '#111', border: '1px solid #333', margin: '5px auto 0 auto', cursor: 'pointer', position: 'relative' },
                onclick: (e) => {
                    if (!ytReady || !ytPlayer || !ytPlayer.getDuration) return;
                    const rect = e.target.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    const dur = ytPlayer.getDuration();
                    if (dur) ytPlayer.seekTo(dur * percent, true);
                }
            });
            const progFill = h('div', { style: { width: '0%', height: '100%', background: '#0f0', transition: 'width 0.1s linear', pointerEvents: 'none' } });
            progContainer.appendChild(progFill);

            // Controls
            const btnPrev = h('button', { class: 'wbtn', title: 'Anterior' }, '⏮');
            const btnPlay = h('button', { class: 'wbtn play', title: 'Play' }, '▶');
            const btnPause = h('button', { class: 'wbtn', title: 'Pause' }, '⏸');
            const btnNext = h('button', { class: 'wbtn', title: 'Próximo' }, '⏭');

            const controlsWrap = h('div', { style: { display: 'flex', flexDirection: 'column' } },
                progContainer,
                h('div', { class: 'winamp-controls', style: { paddingTop: '8px' } },
                    btnPrev, btnPlay, btnPause, h('button', { class: 'wbtn' }, '⏹'), btnNext,
                    h('button', { class: 'wbtn shuffle' }, '⇀⇁'), h('button', { class: 'wbtn' }, '↻')
                )
            );

            // Playlist
            const plList = h('ul', { class: 'winamp-pl-list', style: { flexGrow: '1', minHeight: '0', overflowY: 'auto', listStyle: 'none', padding: '0', margin: '0', background: '#0a0a0a', color: '#888', fontSize: '10px' } });

            const updatePlaylistUI = () => {
                plList.innerHTML = '';
                MUSIC_DATA.forEach((m, idx) => {
                    const li = h('li', {
                        style: {
                            color: idx === currentIdx ? '#0f0' : '#888',
                            backgroundColor: idx === currentIdx ? '#1c1c1c' : 'transparent',
                            cursor: 'pointer',
                            padding: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        },
                        onclick: () => {
                            if (!ytReady) return;
                            currentIdx = idx;
                            ytPlayer.loadVideoById(MUSIC_DATA[currentIdx].id);
                            updateTrackInfo();
                        }
                    }, `${String(idx + 1).padStart(2, '0')}. ${m.title}`);
                    plList.appendChild(li);
                });
            };

            const plSection = h('div', { class: 'winamp-playlist-section', style: { display: 'flex', flexDirection: 'column', flexGrow: '1', minHeight: '0px' } },
                h('div', { class: 'winamp-eq-titlebar' },
                    h('span', { class: 'winamp-logo' }, '📋 PLAYLIST'),
                    h('span', { style: { color: '#aaa', fontSize: '10px' } }, `${MUSIC_DATA.length} FILES`)
                ),
                plList
            );

            const ytFooter = h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', background: '#1c1c1c', borderTop: '2px solid #555' } },
                h('span', { style: { color: '#888', fontSize: '9px', paddingLeft: '5px' } }, 'Powered by YouTube')
            );

            // Mini YouTube iframe wrapper - Visible to prevent API invisible embed blocks
            const iframeId = getUniqueYtId('yt-winamp');
            const playerContainer = h('div', {
                style: { width: '120px', height: '68px', border: '1px solid #333', background: '#000', overflow: 'hidden' }
            });
            const innerDiv = h('div', { id: iframeId });
            playerContainer.appendChild(innerDiv);

            ytFooter.appendChild(playerContainer);

            // Psychedelic Canvas Visualizer
            const canvasContainer = h('div', {
                style: { height: '150px', background: '#000', borderTop: '2px solid #555', overflow: 'hidden', position: 'relative' }
            });
            const canvas = h('canvas', { style: { display: 'block', width: '100%', height: '100%' } });
            canvasContainer.appendChild(canvas);

            let ctx = null;
            let vizTime = 0;
            let vizActive = false;
            let animId = null;

            const drawViz = () => {
                if (!ctx) {
                    canvas.width = canvasContainer.clientWidth || 280;
                    canvas.height = canvasContainer.clientHeight || 150;
                    ctx = canvas.getContext('2d');
                }
                const width = canvas.width;
                const height = canvas.height;

                // Fading effect for trailing lines
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(0, 0, width, height);

                if (vizActive) {
                    vizTime += 0.05;
                    ctx.save();
                    ctx.translate(width / 2, height / 2);

                    const numLines = 5;
                    for (let i = 0; i < numLines; i++) {
                        ctx.beginPath();
                        const phase = vizTime + (i * Math.PI * 2 / numLines);

                        for (let a = 0; a < Math.PI * 2; a += 0.05) {
                            const r = (30 + 15 * Math.sin(a * 4 + phase * 2)) * (1 + 0.3 * Math.sin(vizTime * 3));
                            const x = Math.cos(a + phase) * r * 2;
                            const y = Math.sin(a * 2 + phase) * r * 1.5;

                            if (a === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.strokeStyle = `hsl(${(phase * 50) % 360}, 100%, 60%)`;
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                animId = requestAnimationFrame(drawViz);
            };

            // Start animation loop
            requestAnimationFrame(() => drawViz());

            wrap.appendChild(titlebar);
            wrap.appendChild(display);
            wrap.appendChild(controlsWrap);
            wrap.appendChild(plSection);
            wrap.appendChild(canvasContainer);
            wrap.appendChild(ytFooter);

            let ytPlayer;
            let ytReady = false;
            let currentIdx = 0;
            let checkInterval;

            const updateTrackInfo = (err) => {
                if (err) {
                    trackNameLabel.style.color = 'red';
                    trackNameLabel.textContent = "ERRO: Faixa Bloqueada (Copyright)";
                } else {
                    trackNameLabel.style.color = '';
                    trackNameLabel.textContent = MUSIC_DATA[currentIdx].title;
                }
                updatePlaylistUI();
                viz.childNodes.forEach(b => b.style.height = '10%');
            };

            const formatTime = (secs) => {
                if (!secs) return '0:00';
                secs = Math.floor(secs);
                const m = Math.floor(secs / 60);
                const s = String(secs % 60).padStart(2, '0');
                return `${m}:${s}`;
            };

            ensureYT(() => {
                const waitDom = setInterval(() => {
                    if (!document.getElementById(iframeId)) return;
                    clearInterval(waitDom);

                    ytPlayer = new window.YT.Player(iframeId, {
                        height: '68',
                        width: '120',
                        videoId: MUSIC_DATA[currentIdx].id,
                        playerVars: {
                            'autoplay': 1,
                            'controls': 0,
                            'disablekb': 1,
                            'modestbranding': 1,
                            'rel': 0,
                            'playsinline': 1,
                            'origin': window.location.origin
                        },
                        events: {
                            'onReady': () => {
                                ytReady = true;
                                updateTrackInfo();
                                timeLabel.textContent = "0:00";

                                checkInterval = setInterval(() => {
                                    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
                                        const t = ytPlayer.getCurrentTime();
                                        const dur = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
                                        const state = ytPlayer.getPlayerState();
                                        timeLabel.textContent = formatTime(t);

                                        if (dur > 0) {
                                            progFill.style.width = `${(t / dur) * 100}%`;
                                        }

                                        // Visualizer animation
                                        if (state === window.YT.PlayerState.PLAYING) {
                                            vizActive = true;
                                            viz.childNodes.forEach(b => b.style.height = (Math.random() * 80 + 20) + '%');
                                        } else {
                                            vizActive = false;
                                            viz.childNodes.forEach(b => b.style.height = '10%');
                                        }
                                    }
                                }, 150);
                            },
                            'onStateChange': (e) => {
                                if (e.data === window.YT.PlayerState.ENDED) {
                                    currentIdx = (currentIdx + 1) % MUSIC_DATA.length;
                                    ytPlayer.loadVideoById(MUSIC_DATA[currentIdx].id);
                                }
                            }
                        }
                    });
                }, 50);
            });

            btnPlay.onclick = () => { if (ytReady) ytPlayer.playVideo(); };
            btnPause.onclick = () => { if (ytReady) ytPlayer.pauseVideo(); };
            btnPrev.onclick = () => {
                if (!ytReady) return;
                currentIdx = (currentIdx - 1 + MUSIC_DATA.length) % MUSIC_DATA.length;
                ytPlayer.loadVideoById(MUSIC_DATA[currentIdx].id);
                updateTrackInfo();
            };
            btnNext.onclick = () => {
                if (!ytReady) return;
                currentIdx = (currentIdx + 1) % MUSIC_DATA.length;
                ytPlayer.loadVideoById(MUSIC_DATA[currentIdx].id);
                updateTrackInfo();
            };

            wrap.onClose = () => {
                if (checkInterval) clearInterval(checkInterval);
                if (animId) cancelAnimationFrame(animId);
                if (ytPlayer && ytPlayer.destroy) ytPlayer.destroy();
            };

            updatePlaylistUI();

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

                const chatBox = h('div', { style: { flex: 1, padding: '10px', background: '#fff', overflowY: 'auto', borderBottom: '1px solid #ccc', scrollBehavior: 'smooth' } });

                // Add shake style globally if not present
                if (!document.getElementById('msn-shake-style')) {
                    const style = document.createElement('style');
                    style.id = 'msn-shake-style';
                    style.textContent = `
                        @keyframes msn-shake {
                            0% { transform: translate(1px, 1px) rotate(0deg); }
                            10% { transform: translate(-1px, -2px) rotate(-1deg); }
                            20% { transform: translate(-3px, 0px) rotate(1deg); }
                            30% { transform: translate(3px, 2px) rotate(0deg); }
                            40% { transform: translate(1px, -1px) rotate(1deg); }
                            50% { transform: translate(-1px, 2px) rotate(-1deg); }
                            60% { transform: translate(-3px, 1px) rotate(0deg); }
                            70% { transform: translate(3px, 1px) rotate(-1deg); }
                            80% { transform: translate(-1px, -1px) rotate(1deg); }
                            90% { transform: translate(1px, 2px) rotate(0deg); }
                            100% { transform: translate(1px, -2px) rotate(-1deg); }
                        }
                        .shaking {
                            animation: msn-shake 0.1s;
                            animation-iteration-count: 4;
                        }
                    `;
                    document.head.appendChild(style);
                }

                // Storage key for this contact
                const storageKey = `tulio_msn_hist_${contactName}`;
                let history = [];
                try {
                    const stored = localStorage.getItem(storageKey);
                    if (stored) history = JSON.parse(stored);
                } catch (e) { }

                const saveHistory = () => {
                    localStorage.setItem(storageKey, JSON.stringify(history));
                };

                const escHTML = (str) => String(str).replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t]));


                const renderHistory = () => {
                    chatBox.innerHTML = `<div style="color: #888; text-align: center; font-size: 10px; margin-bottom: 10px">--- ${contactName} acabou de entrar ---</div>`;

                    if (history.length === 0) {
                        // Default first message if no history
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
                    } else {
                        // Render stored history
                        history.forEach(msg => {
                            if (msg.type === 'system') {
                                appendSystemMessage(msg.text, msg.color, false);
                            } else if (msg.sender === 'Você') {
                                const msgWrap = document.createElement('div');
                                msgWrap.innerHTML = `<div style="margin-bottom: 5px; margin-top: 10px"><strong style="color: #000">Você diz:</strong></div><div style="padding-left: 10px">${escHTML(msg.text)}</div>`;
                                chatBox.appendChild(msgWrap);
                            } else {
                                const botWrap = document.createElement('div');
                                botWrap.innerHTML = `<div style="margin-bottom: 5px; margin-top: 10px"><strong style="color: #004d9b">${contactName} diz:</strong></div><div style="padding-left: 10px">${escHTML(msg.text)}</div>`;
                                chatBox.appendChild(botWrap);
                            }
                        });
                    }
                    setTimeout(() => { chatBox.scrollTop = chatBox.scrollHeight; }, 10);
                };

                const playReceiveMsgSound = () => {
                    try {
                        const C = window.AudioContext || window.webkitAudioContext;
                        if (C) {
                            const c = new C();
                            const playBeep = (freq, start, dur) => {
                                const o = c.createOscillator(), g = c.createGain();
                                o.type = 'sine'; o.frequency.setValueAtTime(freq, start);
                                g.gain.setValueAtTime(0, start);
                                g.gain.linearRampToValueAtTime(0.3, start + 0.02);
                                g.gain.exponentialRampToValueAtTime(0.01, start + dur);
                                o.connect(g); g.connect(c.destination);
                                o.start(start); o.stop(start + dur);
                            };
                            playBeep(600, c.currentTime, 0.15);
                            playBeep(800, c.currentTime + 0.15, 0.2);
                        }
                    } catch (e) { }
                };

                const inputBox = h('div', { style: { height: '80px', padding: '5px', background: '#ece9d8', display: 'flex', flexDirection: 'column' } });

                const toolBar = h('div', { style: { display: 'flex', gap: '8px', marginBottom: '4px', fontSize: '13px' } });

                // Emoticons Button
                const btnEmoji = h('span', { style: { cursor: 'pointer', position: 'relative' }, title: 'Emoticons' }, '😊');

                // Emoji Panel
                const emojiPanel = h('div', {
                    style: {
                        display: 'none', position: 'absolute', bottom: '25px', left: '0',
                        background: '#f9fbfd', border: '1px solid #7f9db9', padding: '5px',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', width: '380px',
                        gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', zIndex: 100
                    }
                });

                const emoticons = [
                    { e: '🙂', t: ':)' }, { e: '😀', t: ':D' }, { e: '😉', t: ';)' }, { e: '😲', t: ':-O' }, { e: '😛', t: ':P' }, { e: '😎', t: '(H)' }, { e: '😡', t: ':@' }, { e: '😕', t: ':S' }, { e: '😳', t: ':$' }, { e: '🙁', t: ':(' },
                    { e: '😢', t: ':\\\'(' }, { e: '😐', t: ':|' }, { e: '😇', t: '(A)' }, { e: '😬', t: '8o|' }, { e: '🤓', t: '8-|' }, { e: '🤢', t: '+o(' }, { e: '🥳', t: '<:o)' }, { e: '😴', t: '|-)' }, { e: '🤔', t: '*-)' }, { e: '🤐', t: ':-#' },
                    { e: '😙', t: ':-*' }, { e: '🤨', t: '^o)' }, { e: '🙄', t: '8-)' }, { e: '❤️', t: '(L)' }, { e: '💔', t: '(U)' }, { e: '👤', t: '(M)' }, { e: '🐱', t: '(@)' }, { e: '🐶', t: '(&)' }, { e: '🐌', t: '(sn)' }, { e: '🐑', t: '(bah)' },
                    { e: '🌙', t: '(S)' }, { e: '⭐', t: '(*)' }, { e: '☀️', t: '(#)' }, { e: '🌈', t: '(R)' }, { e: '🫂', t: '({})' }, { e: '🫂', t: '(})' }, { e: '💋', t: '(K)' }, { e: '🌹', t: '(F)' }, { e: '🥀', t: '(W)' }, { e: '⌚', t: '(O)' }
                ];

                emoticons.forEach(emo => {
                    const wrapEmo = h('div', {
                        style: {
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            height: '36px', cursor: 'pointer', border: '1px solid transparent', backgroundColor: 'transparent'
                        }
                    });
                    wrapEmo.innerHTML = `<div style="font-size:16px; line-height:1.2; text-shadow:0px 0px 1px rgba(0,0,0,0.2)">${emo.e}</div><div style="font-size:9px; color:#333; font-family:Tahoma">${emo.t}</div>`;

                    wrapEmo.onclick = (e) => {
                        e.stopPropagation();
                        input.value += (input.value ? ' ' : '') + emo.t;
                        emojiPanel.style.display = 'none';
                        input.focus();
                    };
                    wrapEmo.onmouseover = () => { wrapEmo.style.borderColor = '#316ac5'; wrapEmo.style.backgroundColor = '#c1d2ee'; };
                    wrapEmo.onmouseout = () => { wrapEmo.style.borderColor = 'transparent'; wrapEmo.style.backgroundColor = 'transparent'; };

                    emojiPanel.appendChild(wrapEmo);
                });

                btnEmoji.appendChild(emojiPanel);
                btnEmoji.onclick = () => {
                    emojiPanel.style.display = emojiPanel.style.display === 'none' ? 'grid' : 'none';
                };

                // Close panel if clicked outside
                viewContainer.addEventListener('click', (e) => {
                    if (e.target !== btnEmoji && !emojiPanel.contains(e.target)) {
                        emojiPanel.style.display = 'none';
                    }
                });

                // Nudge Button
                const btnNudge = h('span', { style: { cursor: 'pointer' }, title: 'Chamar a atenção' }, '🔔');
                btnNudge.onclick = () => {
                    appendSystemMessage('Você enviou um chamar a atenção!', '#000000');
                    playNudgeSound();

                    // Encontrar a janela raiz .xp-window relativa ao viewContainer
                    let win = wrap.closest('.xp-window');
                    if (win) {
                        win.classList.remove('shaking');
                        void win.offsetWidth; // trigger reflow
                        win.classList.add('shaking');
                    }
                };

                toolBar.appendChild(h('span', { style: { cursor: 'pointer' }, title: 'Fonte' }, '🅰️'));
                toolBar.appendChild(btnEmoji);
                toolBar.appendChild(btnNudge);

                const form = h('form', { style: { display: 'flex', gap: '5px', flex: 1 } });
                const input = h('input', { type: 'text', style: { flex: 1, border: '1px solid #7f9db9', padding: '4px' }, placeholder: 'Escreva uma mensagem...' });
                const btn = h('button', { type: 'submit', style: { padding: '0 15px', fontFamily: 'Tahoma' } }, 'Enviar');

                form.appendChild(input);
                form.appendChild(btn);
                inputBox.appendChild(toolBar);
                inputBox.appendChild(form);

                let sessionMsgCount = 0;
                const SESSION_MSG_LIMIT = 15;
                let isWaitingReply = false;

                const appendBotMessage = (resp) => {
                    const botWrap = document.createElement('div');
                    botWrap.innerHTML = `<div style="margin-bottom: 5px; margin-top: 10px"><strong style="color: #004d9b">${contactName} diz:</strong></div><div style="padding-left: 10px">${escHTML(resp)}</div>`;
                    chatBox.appendChild(botWrap);
                    chatBox.scrollTop = chatBox.scrollHeight;
                    history.push({ sender: contactName, text: resp });
                    saveHistory();
                    playReceiveMsgSound();
                };

                const appendSystemMessage = (text, color = '#666', shouldSave = true) => {
                    const sysWrap = document.createElement('div');
                    sysWrap.style.cssText = `color:${color}; font-size:11px; text-align:center; margin:10px 0; font-style:italic`;
                    sysWrap.innerText = text;
                    chatBox.appendChild(sysWrap);
                    chatBox.scrollTop = chatBox.scrollHeight;
                    if (shouldSave) {
                        history.push({ type: 'system', text: text, color: color });
                        saveHistory();
                    }
                };

                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const rawMsg = input.value.trim();
                    if (!rawMsg || isWaitingReply) return;

                    if (sessionMsgCount >= SESSION_MSG_LIMIT) {
                        appendSystemMessage('Limite de mensagens atingido para esta sessão.', '#c0392b');
                        input.disabled = true; btn.disabled = true;
                        return;
                    }

                    // Render User Message
                    const msgWrap = document.createElement('div');
                    msgWrap.innerHTML = `<div style="margin-bottom: 5px; margin-top: 10px"><strong style="color: #000">Você diz:</strong></div><div style="padding-left: 10px">${escHTML(rawMsg)}</div>`;
                    chatBox.appendChild(msgWrap);
                    history.push({ sender: 'Você', text: rawMsg });
                    saveHistory();

                    input.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // Update State
                    sessionMsgCount++;
                    isWaitingReply = true;
                    btn.disabled = true;

                    // Typing indicator
                    const typingEl = document.createElement('div');
                    typingEl.style.cssText = 'color:#888; font-style:italic; padding-left:10px; margin-top:8px; font-size:11px;';
                    typingEl.innerText = `${contactName} está digitando...`;
                    chatBox.appendChild(typingEl);
                    chatBox.scrollTop = chatBox.scrollHeight;

                    try {
                        const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: rawMsg })
                        });

                        typingEl.remove();

                        if (!response.ok) {
                            appendBotMessage('Opa, tive um probleminha aqui. Tenta de novo já já!');
                        } else {
                            const data = await response.json();
                            appendBotMessage(data.reply || '... (sem palavras)');
                        }
                    } catch (err) {
                        typingEl.remove();
                        appendBotMessage('Conexão instável. Tenta de novo?');
                    } finally {
                        isWaitingReply = false;
                        btn.disabled = false;
                        input.focus();
                    }
                };

                renderHistory();

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

        readme: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' } });

            // Menu bar (Notepad style)
            const menu = h('div', { style: { display: 'flex', gap: '10px', padding: '2px 8px', background: '#ece9d8', borderBottom: '1px solid #aca899', fontSize: '11px', fontFamily: 'Tahoma' } });
            ['Arquivo', 'Editar', 'Formatar', 'Exibir', 'Ajuda'].forEach(m => {
                menu.appendChild(h('span', { style: { cursor: 'pointer' } }, m));
            });

            const text = `Bem vindo ao TúlioOS.

Esse sistema foi construído para ser o lar das minhas idéias estranhas, experimentos pequenos e interfaces não finalizadas (e nostálgicas.)

Algumas coisas funcionam e outras se quebram, e é intencional.

Inspiração máxima no portfólio do Ryo Lu.`;

            const textarea = h('textarea', {
                readonly: true,
                spellcheck: 'false',
                style: {
                    flex: '1', width: '100%', resize: 'none', border: 'none', padding: '12px',
                    fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', lineHeight: '1.2',
                    outline: 'none', color: '#000', background: '#fff', overflow: 'hidden'
                }
            }, text);

            wrap.appendChild(menu);
            wrap.appendChild(textarea);
            return wrap;
        },

        terminal: () => {
            const wrap = h('div', { id: 'termWrap', style: { height: '100%', background: '#000', color: '#0f0', fontFamily: 'monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', padding: '10px', boxSizing: 'border-box' } });
            const output = h('div', { id: 'termOut', style: { flex: 1, overflowY: 'auto', marginBottom: '10px', whiteSpace: 'pre-wrap', scrollbarWidth: 'none' } });
            output.innerText = 'TulioOS Terminal [Versão 1.0.2024]\n(c) 2004 Tulio Corp. Todos os direitos reservados.\n\nDigite "help" para começar.\n\n';

            const line = h('div', { style: { display: 'flex', gap: '8px' } });
            line.appendChild(h('span', { style: { color: '#0f0', whiteSpace: 'nowrap' } }, 'tulio@lab:~$'));

            const input = h('input', {
                type: 'text',
                spellcheck: 'false',
                style: {
                    background: 'transparent', border: 'none', color: '#fff', outline: 'none',
                    flex: 1, fontFamily: 'monospace', fontSize: '13px', padding: 0
                }
            });
            line.appendChild(input);

            const exec = (cmd) => {
                const echo = h('div', { style: { color: '#fff', marginBottom: '4px' } });
                echo.innerHTML = `<span style="color:#0f0">tulio@lab:~$</span> ${cmd}`;
                output.appendChild(echo);

                const c = cmd.trim().toLowerCase();
                let res = '';

                if (c === 'help') {
                    res = 'Available commands:\n  ls                - List files\n  open experiments  - ???\n  about             - System info\n  whoami            - Current user\n  domain            - Trigger command\n  exit              - Close terminal';
                } else if (c === 'ls') {
                    res = 'experiments/  src/  secrets.txt  readme.txt  gta_cheats.txt  winamp.exe';
                } else if (c === 'whoami') {
                    res = 'visitor@tulio_os';
                } else if (c === 'about') {
                    res = 'TulioOS Experimental Kernel v1.0.42\nMemory focus initialized.';
                } else if (c === 'domain') {
                    res = 'Expansão de Domínio: VAZIO ILIMITADO.\n(O Seis Olhos observa através do vazio...)';

                    const overlay = h('div', { class: 'xp-void-overlay' });
                    document.body.appendChild(overlay);
                    setTimeout(() => overlay.remove(), 10000);

                    // Rikugan ASCII Animation
                    const rikugan = h('div', {
                        style: {
                            textAlign: 'center', margin: '20px 0', color: '#00ffff',
                            fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 15px #00ffff',
                            fontFamily: 'monospace', lineHeight: '1'
                        }
                    });
                    output.appendChild(rikugan);

                    const frames = [
                        "(  ◎  )   (  ◎  )", // Open
                        "(  -  )   (  -  )", // Blink
                        "(  ◎  )   (  ◎  )", // Open
                        "(  ◎  )   (  ◎  )",
                        "(  -  )   (  -  )", // Blink
                    ];

                    let f = 0;
                    const animInterval = setInterval(() => {
                        if (f >= frames.length * 3) { // Let it repeat a bit
                            clearInterval(animInterval);
                            return;
                        }
                        rikugan.innerText = frames[f % frames.length];
                        f++;
                    }, 600);

                    setTimeout(() => clippySpeak("Expansão de Domínio inicializada."), 500);
                } else if (c === 'open experiments') {
                    res = 'Access Denied. You need Level 4 Clearance.';
                } else if (c === 'exit') {
                    closeWin('terminal');
                    return;
                } else if (c !== '') {
                    res = `Command not found: ${c}`;
                }

                if (res) {
                    const rDiv = h('div', { style: { color: '#0c0', marginBottom: '10px' } }, res);
                    output.appendChild(rDiv);
                }
                output.scrollTop = output.scrollHeight;
            };

            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    exec(input.value);
                    input.value = '';
                }
            };

            wrap.appendChild(output);
            wrap.appendChild(line);

            // Auto-focus logic
            wrap.onclick = () => input.focus();
            setTimeout(() => input.focus(), 200);

            return wrap;
        },

        mysterious_folder: () => {
            return h('div', { class: 'xp-folder-view', style: { padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' } },
                h('div', {
                    class: 'xp-desk-icon',
                    ondblclick: () => openWin('secret_readme'),
                    onclick: e => {
                        document.querySelectorAll('.xp-desk-icon').forEach(i => i.classList.remove('xp-icon--selected'));
                        e.currentTarget.classList.add('xp-icon--selected');
                    },
                },
                    h('div', { class: 'xp-di-img' }, '📄'),
                    h('div', { class: 'xp-di-label' }, 'README.txt')
                )
            );
        },
        secret_readme: () => {
            const text = `Bem-vindo à camada oculta.

Se você encontrou isto, você é curioso o suficiente.

A maioria das pessoas nunca chega a esta pasta.

A internet foi construída por pessoas como você.`;
            const wrap = h('div', { style: { height: '100%', background: '#fff', padding: '15px', fontFamily: '"Courier New", Courier, monospace', fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-wrap' } });
            wrap.innerText = text;
            setTimeout(() => clippySpeak("Eu disse para não abrir isso..."), 1000);
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

        doom: () => {
            const wrap = h('div', { class: 'xp-doom-container', style: { width: '100%', height: '100%', background: '#000', color: '#0f0', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', textAlign: 'center', padding: '20px' } });
            const loader = h('div', { id: 'doom-loader', style: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' } }, 'INICIANDO PROTOCOLO DOS...');
            
            // Barra de progresso visual
            const progBarWrap = h('div', { style: { width: '200px', height: '10px', border: '1px solid #0f0', position: 'relative', marginBottom: '10px' } });
            const progBarFill = h('div', { style: { width: '0%', height: '100%', background: '#0f0', transition: 'width 0.1s' } });
            progBarWrap.appendChild(progBarFill);
            
            const progress = h('div', { id: 'doom-status', style: { fontSize: '12px', color: '#0a0' } }, 'Aguardando motor...');
            wrap.appendChild(loader);
            wrap.appendChild(progBarWrap);
            wrap.appendChild(progress);

            const canvas = h('canvas', { id: 'jsdos-canvas', style: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' } });
            wrap.appendChild(canvas);

            const loadJsDos = () => {
                if (window.Dos) return Promise.resolve();
                return new Promise((resolve) => {
                    progress.textContent = 'Baixando bibliotecas JS-DOS...';
                    const script = document.createElement('script');
                    script.src = "https://cdn.jsdelivr.net/npm/js-dos@7.5.0/dist/js-dos.js";
                    script.onload = () => {
                        const style = document.createElement('link');
                        style.rel = "stylesheet";
                        style.href = "https://cdn.jsdelivr.net/npm/js-dos@7.5.0/dist/js-dos.css";
                        document.head.appendChild(style);
                        resolve();
                    };
                    script.onerror = () => {
                        loader.textContent = 'FALHA NA REDE';
                        progress.textContent = 'Não foi possível carregar as bibliotecas do JS-DOS.';
                    };
                    document.head.appendChild(script);
                });
            };

            setTimeout(() => {
                loadJsDos().then(() => {
                    progress.textContent = 'Conectando ao CDN de Maryland...';
                    
                    if (typeof Dos === 'undefined') {
                        loader.textContent = 'ERRO CRÍTICO';
                        progress.textContent = 'Objeto Dos não encontrado.';
                        return;
                    }

                    // Trocado para CDN do dos.zone que é mais robusto para WADs
                    const bundleUrl = "https://cdn.dos.zone/custom/dos/doom.jsdos";

                    Dos(canvas, {
                        style: "unset",
                    }).run(bundleUrl, {
                        onProgress: (stage, total, loaded) => {
                            const p = Math.floor((loaded / total) * 100) || 0;
                            loader.textContent = `CARREGANDO: ${p}%`;
                            progBarFill.style.width = p + '%';
                            progress.textContent = `Fase: ${stage} (${(loaded / 1024 / 1024).toFixed(1)}MB / ${(total / 1024 / 1024).toFixed(1)}MB)`;
                        }
                    }).then((ci) => {
                        loader.textContent = 'PRONTO';
                        progBarFill.style.width = '100%';
                        progress.textContent = 'Enviando sinal de vídeo...';
                        
                        setTimeout(() => {
                            wrap.querySelectorAll('div').forEach(d => {
                                if (d.id !== 'jsdos-canvas') d.style.display = 'none';
                            });
                            canvas.style.opacity = '1';
                            canvas.style.pointerEvents = 'all';
                            canvas.style.imageRendering = 'pixelated';
                            // Focar no canvas para capturar teclado imediatamente
                            canvas.focus();
                        }, 800);
                    }).catch((err) => {
                        console.error("Doom error:", err);
                        loader.style.color = 'red';
                        loader.textContent = 'FALHA NO BOOT';
                        progress.textContent = 'Erro ao baixar ou extrair o jogo.';
                    });
                });
            }, 500);

            return wrap;
        },
    };


    // ── OPEN / CLOSE WINDOW ───────────────────────────
    function openWin(id) {
        if (id === 'ie' && !isOnline) {
            playSfx('error');
            alert('⚠️ ERRO DE REDE: Não foi possível localizar o servidor.\\n\\nVocê precisa abrir o discador (TulioNet 56K) e se conectar para acessar a Internet!');
            return;
        }

        if (id === 'bsod') {
            triggerBSOD();
            return;
        }

        if (openWindows[id]) {
            // Já existe: só traz pro foco ou desfaz minimizar
            const w = openWindows[id];
            w.classList.remove('xp-win--minimized');
            focusWin(w);
            return;
        }

        actionCount++;
        if (actionCount === 5 && !secretsRevealed) {
            revealSecretFolder();
        }

        playSfx('click');

        const icon = ICONS.find(i => i.id === id);
        const title = icon ? icon.label : id;
        const fallbackIcon = id.includes('.exe') ? '🎮' : '📁';

        const titleIcon = (icon?.icon && icon.icon.includes('.')) 
            ? h('img', { src: icon.icon, style: { width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'middle' } })
            : (icon?.icon || fallbackIcon);

        // Posição em cascata
        const offset = (Object.keys(openWindows).length % 6) * 24;

        const titlebar = h('div', { class: 'xp-win-titlebar' },
            h('div', { class: 'xp-win-title' }, titleIcon, ' ', title),
            h('div', { class: 'xp-win-btns' },
                h('button', { class: 'xp-btn xp-btn--min', onclick: () => minimizeWin(id) }, '─'),
                h('button', { class: 'xp-btn xp-btn--max', onclick: () => maximizeWin(id) }, '□'),
                h('button', { class: 'xp-btn xp-btn--close', onclick: () => closeWin(id) }, '✕'),
            )
        );

        // Barra de endereço mockada (apenas para o browser ou pastas do sistema)
        // O browser 'ie' já tem sua própria barra interna, então removemos a genérica dele
        const showAddr = ['mycomputer', 'games', 'trash', 'mysterious_folder'].includes(id);
        const addrbar = showAddr ? h('div', { class: 'xp-win-addrbar' },
            h('span', { class: 'xp-addr-label' }, 'Endereço:'),
            h('div', { class: 'xp-addr-val' }, `C:\\TULIO\\${title.toUpperCase().replace(' ', '_')}`),
        ) : null;

        const body = h('div', { class: 'xp-win-body', style: id === 'doom' ? { overflow: 'hidden', background: '#000' } : {} }, (CONTENT[id] || CONTENT.mycomputer)());

        const WIN_SIZES = {
            ie: { w: '820px', h: '560px' },
            paint: { w: '500px', h: '420px' },
            earth: { w: '600px', h: '380px' },
            calculator: { w: '260px', h: '340px' },
            minesweeper: { w: '300px', h: '360px' },
            burningrom: { w: '480px', h: '420px' },
            messenger: { w: '480px', h: '380px' },
            winamp: { w: '280px', h: '580px' },
            wordpad: { w: '440px', h: '400px' },
            readme: { w: '440px', h: '340px' },
            terminal: { w: '500px', h: '320px' },
            gta_cheats: { w: '440px', h: '400px' },
            tulionet: { w: '380px', h: '360px' },
            accelerator: { w: '350px', h: '300px' },
            'Tibia.exe': { w: '640px', h: '480px' },
            'M.U.G.E.N..exe': { w: '640px', h: '480px' },
            'GTA San Andreas.exe': { w: '640px', h: '480px' },
            'Grand Chase.exe': { w: '640px', h: '480px' },
            mysterious_folder: { w: '400px', h: '300px' },
            secret_readme: { w: '440px', h: '340px' },
            doom: { w: '640px', h: '400px' },
        };
        const sz = WIN_SIZES[id] || {};
        const winW = sz.w || '440px';
        const winH = sz.h || null;

        let startLeft = 80 + offset;
        let startTop = 60 + offset;

        const deskArea = document.getElementById('xpDesktopArea');

        // Center README on first open
        if (id === 'readme' && deskArea) {
            const wVal = parseInt(winW);
            const hVal = winH ? parseInt(winH) : 400;
            startLeft = (deskArea.clientWidth - wVal) / 2;
            startTop = (deskArea.clientHeight - hVal) / 2;
        } else if (deskArea && deskArea.clientWidth < 600) {
            // Mobile layout clamp limit
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

        // Executa limpeza se o app definiu onClose
        const appBody = w.querySelector('.xp-win-body > *');
        if (appBody && typeof appBody.onClose === 'function') {
            appBody.onClose();
        }

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
            });

            const tbIcon = (icon?.icon && icon.icon.includes('.')) 
                ? h('img', { src: icon.icon, style: { width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' } })
                : (icon?.icon || '🗂️');

            btn.appendChild(h('span', {}, tbIcon, ' ', (icon?.label || id)));
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
        const list = h('div', { class: 'xp-sm-list' }, ...items.map(it => {
            const smIcon = (typeof it.icon === 'string' && it.icon.includes('.'))
                ? h('img', { src: it.icon, style: { width: '24px', height: '24px' } })
                : h('span', { class: 'xp-sm-icon' }, it.icon);

            return h('button', { class: 'xp-sm-item', onclick: it.action },
                smIcon,
                h('span', {}, it.label),
            );
        }));
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
            h('div', { class: 'xp-icons-grid' }, ...ICONS.map(ic => {
                const el = h('div', {
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
                });

                const deskIcon = (ic.icon && ic.icon.includes('.'))
                    ? h('img', { src: ic.icon, style: { width: '32px', height: '32px' } })
                    : ic.icon;

                el.appendChild(h('div', { class: 'xp-di-img' }, deskIcon));
                el.appendChild(h('div', { class: 'xp-di-label' }, ic.label));

                if (ic.id === 'readme') {
                    el.classList.add('xp-icon--readme');
                }

                return el;
            }))
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

        // CLIPPY
        const clippy = h('div', { id: 'xpClippy' },
            h('div', { class: 'clippy-bubble' }, ''),
            h('div', { class: 'clippy-icon' }, '📎')
        );
        desk.appendChild(clippy);

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
                    playSfx('startup');

                    setTimeout(() => {
                        welcome.remove();
                        area.style.opacity = '1'; // Show actual desktop

                        // Auto-open README
                        setTimeout(() => openWin('readme'), 300);
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

        playSfx('shutdown');

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
    window.tcDesktop = { open: buildDesktop, close: closeDesktop, bsod: triggerBSOD };

    function triggerBSOD() {
        playSfx('stop');
        const bsod = document.createElement('div');
        bsod.style.position = 'fixed';
        bsod.style.top = '0';
        bsod.style.left = '0';
        bsod.style.width = '100vw';
        bsod.style.height = '100vh';
        bsod.style.backgroundColor = '#0000aa';
        bsod.style.color = '#fff';
        bsod.style.fontFamily = '"Courier New", Courier, monospace';
        bsod.style.fontSize = '18px';
        bsod.style.padding = '40px';
        bsod.style.zIndex = '999999';
        bsod.style.cursor = 'none';
        bsod.innerHTML = `
            <p>Foi detectado um problema e o Tulio OS foi desligado para evitar danos ao computador.</p>
            <br>
            <p>Se esta for a primeira vez que você vê esta tela de erro de parada, reinicie o computador. Se a tela for exibida novamente, siga estas etapas:</p>
            <br>
            <p>Certifique-se de que há memória RAM suficiente disponível. Se um script for identificado na mensagem de parada, desative o script ou verifique atualizações.</p>
            <br>
            <p>Informações técnicas:</p>
            <p>*** STOP: 0x000000FE (0x00000008, 0x00000006, 0x00000009, 0x847075CC)</p>
            <br>
            <p>Iniciando despejo de memória física...</p>
            <p id="bsodPercent">Despejo de memória física concluído: 1%</p>
        `;

        document.body.appendChild(bsod);

        let p = 1;
        const bsodInt = setInterval(() => {
            p += Math.floor(Math.random() * 25) + 15; // Mais rápido
            if (p >= 100) {
                p = 100;
                clearInterval(bsodInt);

                setTimeout(() => {
                    bsod.remove();
                    // Hard reset of OS state
                    const curDesk = document.getElementById('xpDesktop');
                    if (curDesk) curDesk.remove();
                    mounted = false;
                    shuttingDown = false;
                    isOnline = false;
                    for (let key in openWindows) delete openWindows[key];

                    // Trigger Boot again
                    buildDesktop();
                }, 800);
            }
            const pEl = document.getElementById('bsodPercent');
            if (pEl) pEl.innerText = `Despejo de memória física concluído: ${p}%`;
        }, 200);
    }

    // ── INIT: wire up Start buttons (footer + header) ──
    document.addEventListener('DOMContentLoaded', () => {
        ['footerStartBtn', 'headerStartBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', buildDesktop);
        });
    });

})();
