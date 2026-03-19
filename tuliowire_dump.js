tuliowire: () => {
            const wrap = h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', fontSize: '12px', fontFamily: 'Tahoma' } });

            const header = h('div', { style: { display: 'flex', alignItems: 'center', background: '#e4ecf7', padding: '8px', borderBottom: '1px solid #8ba0c5' } });
            header.innerHTML = `<span style="font-size:20px; margin-right:8px">≡ƒìï</span> <strong style="color: #1c4b9e">TulioWire Enterprise Edition</strong>`;

            const tabs = h('div', { style: { display: 'flex', gap: '4px', background: '#f5f5f5', padding: '4px 8px 0', borderBottom: '1px solid #ccc' } });
            tabs.innerHTML = `
                <div style="padding: 4px 12px; background: #fff; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; color: #333; cursor: default">Pesquisar</div>
                <div style="padding: 4px 12px; background: #e0e0e0; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; color: #666; cursor: default">Transfer├¬ncias</div>
                <div style="padding: 4px 12px; background: #e0e0e0; border: 1px solid #ccc; border-bottom: none; border-radius: 4px 4px 0 0; color: #666; cursor: default">Biblioteca</div>
            `;

            const tableWrap = h('div', { style: { flex: 1, padding: '10px', background: '#fff' } });

            // Fake Adware Popups trigger
            setTimeout(() => {
                const ads = [
                    { t: "PARAB├ëNS!", msg: "VOC├è ├ë O VISITANTE 1.000.000! CLIQUE PARA REIVINDICAR SEU IPOD NANO!", color: "#ff0000" },
                    { t: "ALERTA DE SEGURAN├çA", msg: "Promo├º├úo imperdivel, compre 6 e leve 3. ├⌐ por tempo limitado!", color: "#ffff00", tColor: "#000" },
                    { t: "Ganhe Dinheiro F├ícil!", msg: "Trabalhe de casa clicando em links. Renda garantida! Inscreva-se.", color: "#00ff00", tColor: "#000" }
                ];

                ads.forEach((ad, i) => {
                    const pop = document.createElement('div');
                    pop.style.position = 'absolute';
                    pop.style.top = (20 + (Math.random() * 40)) + '%';
                    pop.style.left = (10 + (Math.random() * 50)) + '%';
                    pop.style.width = '300px';
                    pop.style.backgroundColor = '#ece9d8';
                    pop.style.border = '2px solid #0055eb';
                    pop.style.boxShadow = '5px 5px 15px rgba(0,0,0,0.5)';
                    pop.style.zIndex = 10000 + i;
                    pop.style.fontFamily = 'Tahoma';

                    const titlebar = document.createElement('div');
                    titlebar.style.background = 'linear-gradient(180deg, #094af3, #001272)';
                    titlebar.style.color = '#fff';
                    titlebar.style.padding = '3px 6px';
                    titlebar.style.fontSize = '12px';
                    titlebar.style.fontWeight = 'bold';
                    titlebar.style.display = 'flex';
                    titlebar.style.justifyContent = 'space-between';

                    const titleTxt = document.createElement('span');
                    titleTxt.innerText = ad.t;

                    const closeBtn = document.createElement('button');
                    closeBtn.innerText = 'Γ£ò';
                    closeBtn.style.background = '#e95648';
                    closeBtn.style.color = '#fff';
                    closeBtn.style.border = '1px solid #fff';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.onclick = () => pop.remove();

                    titlebar.appendChild(titleTxt);
                    titlebar.appendChild(closeBtn);

                    const content = document.createElement('div');
                    content.style.padding = '15px';
                    content.style.textAlign = 'center';
                    content.style.background = ad.color;
                    content.style.color = ad.tColor || '#fff';
                    content.style.fontWeight = 'bold';
                    content.style.fontSize = '14px';
                    content.style.cursor = 'pointer';
                    content.innerText = ad.msg;
                    content.onclick = () => pop.remove();

                    pop.appendChild(titlebar);
                    pop.appendChild(content);
                    document.getElementById('xpDesktopArea').appendChild(pop);

                    // Simple shake for impact
                    let blink = setInterval(() => {
                        if (!pop.parentNode) { clearInterval(blink); return; }
                        pop.style.borderColor = pop.style.borderColor === 'red' ? '#0055eb' : 'red';
                    }, 500);
                });
            }, 1000);

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

