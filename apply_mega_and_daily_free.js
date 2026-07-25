const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS styles for the Mega Pack slots to the style tag
const megaCss = `
        /* Mega Pack unboxing grid */
        .mega-prize-grid {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-top: 15px;
            flex-wrap: wrap;
            max-width: 310px;
        }
        .mega-prize-slot {
            width: 54px;
            height: 75px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transform: scale(0.5);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-sizing: border-box;
        }
        .mega-prize-slot.revealed {
            opacity: 1;
            transform: scale(1);
            background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(139, 92, 246, 0.05));
            border-color: #a78bfa;
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
        }
`;

html = html.replace('<style>', '<style>' + megaCss);

// 2. Add Mega Pack Box HTML card under VIP Box inside #cat-boxes
const vipBoxCardOld = `<!-- VIP Box (Horizontal) -->
                        <div class="loot-card" style="display: flex; flex-direction: row; align-items: center; padding: 15px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.04), rgba(245, 158, 11, 0.02)); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 20px; relative; overflow: hidden; gap: 15px;">
                            <img src="box/vip.png" style="width: 80px; height: 80px; object-fit: contain; filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.4)); transition: transform 0.3s; flex-shrink: 0;" class="shop-box-img">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                <div style="font-size: 16px; font-weight: 800; color: #fde68a; text-shadow: 0 0 10px rgba(251,191,36,0.3); margin: 0;">VIP Box</div>
                                <div style="font-size: 11px; color: rgba(253,230,138,0.8); margin-bottom: 2px;">Botok, Skinek, Minden!</div>
                                <button id="buyVipBoxBtn" class="buy-tag" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border: none; font-size: 12px; font-weight: 900; padding: 8px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25); width: fit-content;" onclick="buyVipBox()"><span id="vipBoxPrice">550 <span class="gem-img" style="width:14px; height:14px;"></span> Buy</span></button>
                            </div>
                        </div>`;

const megaBoxCard = `<!-- VIP Box (Horizontal) -->
                        <div class="loot-card" style="display: flex; flex-direction: row; align-items: center; padding: 15px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.04), rgba(245, 158, 11, 0.02)); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 20px; relative; overflow: hidden; gap: 15px;">
                            <img src="box/vip.png" style="width: 80px; height: 80px; object-fit: contain; filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.4)); transition: transform 0.3s; flex-shrink: 0;" class="shop-box-img">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                <div style="font-size: 16px; font-weight: 800; color: #fde68a; text-shadow: 0 0 10px rgba(251,191,36,0.3); margin: 0;">VIP Box</div>
                                <div style="font-size: 11px; color: rgba(253,230,138,0.8); margin-bottom: 2px;">Botok, Skinek, Minden!</div>
                                <button id="buyVipBoxBtn" class="buy-tag" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border: none; font-size: 12px; font-weight: 900; padding: 8px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25); width: fit-content;" onclick="buyVipBox()"><span id="vipBoxPrice">550 <span class="gem-img" style="width:14px; height:14px;"></span> Buy</span></button>
                            </div>
                        </div>

                        <!-- Mega Pack Box (Horizontal) -->
                        <div class="loot-card" style="display: flex; flex-direction: row; align-items: center; padding: 15px; background: linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(124, 58, 237, 0.04)); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 20px; relative; overflow: hidden; gap: 15px;">
                            <img src="box/mega.png" style="width: 80px; height: 80px; object-fit: contain; filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.5)); transition: transform 0.3s; flex-shrink: 0;" class="shop-box-img">
                            <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                <div style="font-size: 16px; font-weight: 800; color: #c084fc; text-shadow: 0 0 10px rgba(167, 139, 250, 0.3); margin: 0;">Mega Pack Box</div>
                                <div style="font-size: 11px; color: rgba(216, 180, 254, 0.8); margin-bottom: 2px;">5x Nyeremény egyszerre! Skinek, Gemek és Matricák!</div>
                                <button id="buyMegaBoxBtn" class="buy-tag" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: #fff; border: none; font-size: 12px; font-weight: 900; padding: 8px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25); width: fit-content;" onclick="buyMegaBox()"><span id="megaBoxPrice">999 <span class="gem-img" style="width:14px; height:14px;"></span> Buy</span></button>
                            </div>
                        </div>`;

html = html.replace(vipBoxCardOld, megaBoxCard);

// 3. Update switchShopCategory script to include buyMegaBox and updateOriginalUI
// Let's replace window.buyOriginalBox and window.buyVipBox and doNyitas with our updated logic

const scriptTargetStart = 'window.switchShopCategory = function(catId) {';
const scriptTargetEnd = '})();\n    </script>\n</html>';

const newScriptBlock = `window.switchShopCategory = function(catId) {
            const categories = ['boxes', 'gems', 'skins', 'support'];
            categories.forEach(c => {
                const el = document.getElementById('cat-' + c);
                if (el) el.style.display = 'none';
            });
            
            const targetEl = document.getElementById('cat-' + catId);
            if (targetEl) targetEl.style.display = 'block';
            
            const btns = document.querySelectorAll('.shop-sidebar-btn');
            btns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.target === catId) {
                    btn.classList.add('active');
                }
            });
        };

        window.showLootToast = function(title, body, imgPathOrIcon) {
            const activeToasts = document.querySelectorAll('.loot-toast');
            activeToasts.forEach(t => t.remove());

            const toast = document.createElement('div');
            toast.className = 'loot-toast';
            
            let imgHtml = '';
            if (imgPathOrIcon) {
                if (imgPathOrIcon.includes('.png') || imgPathOrIcon.includes('.jpeg') || imgPathOrIcon.includes('.jpg')) {
                    imgHtml = \`<img src="\${imgPathOrIcon}" style="width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));">\`;
                } else {
                    imgHtml = \`<div style="font-size: 40px; line-height: 1;">\${imgPathOrIcon}</div>\`;
                }
            }
            
            toast.innerHTML = \`
                \${imgHtml}
                <div>
                    <h4 class="loot-toast-title">\${title}</h4>
                    <p class="loot-toast-body">\${body}</p>
                </div>
            \`;
            
            document.body.appendChild(toast);
            void toast.offsetWidth;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            }, 3500);
        };

        window.updateOriginalUI = function() {
            const origPriceSpan = document.getElementById('origBoxPrice');
            if (!origPriceSpan) return;
            const today = new Date().toDateString();
            const hasFree = localStorage.getItem('nu_orig_free_received_today') !== today;
            if (hasFree) {
                origPriceSpan.innerHTML = 'Ingyenes (Ma)';
            } else {
                origPriceSpan.innerHTML = '250 <span class="gem-img" style="width:16px; height:16px;"></span> Buy';
            }
        };
        updateOriginalUI();

        function getStickerEmoji(id) {
            const map = {
                'sticker-hello': '👋',
                'sticker-szia': '🇭🇺',
                'sticker-hey': '🤙',
                'sticker-sup': '👊',
                'sticker-yoo': '🤟',
                'sticker-wave': '🙋‍♂️',
                'sticker-matrix': '👽',
                'sticker-cyber': '🤖',
                'sticker-quantum': '🌀',
                'sticker-hacker': '💻'
            };
            return map[id] || '🎁';
        }

        function doNyitas(type) {
            const overlay = document.createElement('div');
            overlay.className = 'loot-unboxing-overlay';
            // Start with shaking box
            let boxImg = 'box/normal.png';
            let glowColor = '#10b981';
            if (type === 'vip') {
                boxImg = 'box/vip.png';
                glowColor = '#f59e0b';
            } else if (type === 'mega') {
                boxImg = 'box/mega.png';
                glowColor = '#8b5cf6';


            overlay.innerHTML = \`<div class="loot-unboxing-box" style="filter: drop-shadow(0 0 30px \${glowColor});"><img src="\${boxImg}" style="width: 150px; height: 150px; object-fit: contain;"></div>\`;
            document.body.appendChild(overlay);

            setTimeout(() => {
                if (type === 'mega') {
                    // Roll 5 prizes
                    const prizes = [];
                    for(let i=0; i<5; i++) {
                        const r = Math.random();
                        if (r < 0.25) {
                            // Skins/Bots
                            const skinsList = ['szilard', 'boti', 'szofia', 'bende', 'szasz', 'nemeth', 'barnabas', 'zerend', 'viki', 'dorina', 'lazar', 'benji', 'zsofi', 'milan', 'tech-szilard', 'tech-boti', 'summer-szilard', 'summer-boti'];
                            const reward = skinsList[Math.floor(Math.random() * skinsList.length)];
                            
                            let owned = [];
                            try { owned = JSON.parse(localStorage.getItem('nu_owned') || '[]'); } catch(e){}
                            if (!owned.includes(reward)) {
                                owned.push(reward);
                                localStorage.setItem('nu_owned', JSON.stringify(owned));
                            }
                            prizes.push({ title: 'Skin', name: reward, isSkin: true, skinId: reward });
                        } else if (r < 0.5) {
                            // Stickers
                            const stickers = ['sticker-hello', 'sticker-szia', 'sticker-hey', 'sticker-sup', 'sticker-yoo', 'sticker-wave', 'sticker-matrix', 'sticker-cyber', 'sticker-quantum', 'sticker-hacker'];
                            const reward = stickers[Math.floor(Math.random() * stickers.length)];
                            
                            let owned = [];
                            try { owned = JSON.parse(localStorage.getItem('nu_stickers') || '[]'); } catch(e){}
                            if (!owned.includes(reward)) {
                                owned.push(reward);
                                localStorage.setItem('nu_stickers', JSON.stringify(owned));
                            }
                            prizes.push({ title: 'Matrica', name: reward, isSticker: true });
                        } else {
                            // Gems
                            const gemReward = Math.floor(Math.random() * 200) + 100; // 100-300
                            let currentGems = parseInt(localStorage.getItem('nu_gems') || '0', 10);
                            localStorage.setItem('nu_gems', String(currentGems + gemReward));
                            prizes.push({ title: 'Gemek', name: gemReward + ' Gem', isGems: true });
                        }
                    }

                    if (typeof renderShop === 'function') renderShop();
                    if (typeof renderStickers === 'function') renderStickers();
                    if (typeof updateGemUI === 'function') updateGemUI();

                    // Display grid of 5 slots
                    let slotsHtml = '';
                    prizes.forEach((p, idx) => {
                        let rewardInnerHtml = '';
                        if (p.isGems) {
                            rewardInnerHtml = \`<div style="font-size: 24px;">💎</div>\`;
                        } else if (p.isSkin) {
                            if (typeof window.buildMiniRobotHtml === 'function') {
                                rewardInnerHtml = \`<div style="transform: scale(0.6); width:50px; height:50px; display:flex; justify-content:center; align-items:center;">\${window.buildMiniRobotHtml(p.skinId, false)}</div>\`;
                            } else {
                                rewardInnerHtml = \`<div style="font-size: 24px;">🤖</div>\`;
                            }
                        } else if (p.isSticker) {
                            rewardInnerHtml = \`<div style="font-size: 24px;">\${getStickerEmoji(p.name)}</div>\`;
                        }
                        
                        slotsHtml += \`
                            <div class="mega-prize-slot" id="mega-slot-\${idx}">
                                \${rewardInnerHtml}
                                <div style="font-size: 8px; font-weight:900; color: #fff; margin-top: 4px; text-align:center; max-width:50px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">\${p.name}</div>
                            </div>
                        \`;
                    });

                    overlay.innerHTML = \`
                        <div style="text-align: center; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <h2 style="font-size: 28px; font-weight: 900; color: #c084fc; text-shadow: 0 0 20px rgba(167, 139, 250, 0.6); margin: 0 0 10px 0; animation: prizePop 0.4s ease-out;">Mega Pack!</h2>
                            <div class="mega-prize-grid">
                                \${slotsHtml}
                            </div>
                        </div>
                    \`;

                    // Reveal slots sequentially
                    prizes.forEach((p, idx) => {
                        setTimeout(() => {
                            const slot = document.getElementById('mega-slot-' + idx);
                            if (slot) {
                                slot.classList.add('revealed');
                                try {
                                    if (p.isSkin) playSfx('zynox');
                                    else if (p.isGems) playSfx('gem-claim');
                                    else playSfx('skin-equip');
                                } catch(e){}
                            }
                        }, 300 + idx * 500);
                    });

                    // Auto remove after all revealed
                    setTimeout(() => {
                        overlay.classList.add('fade-out');
                        setTimeout(() => overlay.remove(), 500);
                    }, 3500 + 5 * 500);

                    return;
                }

                // Determine prize for single boxes (orig, vip)
                let prize = {};
                if (type === 'orig') {
                    if (Math.random() < 0.2) {
                        const stickers = ['sticker-hello', 'sticker-szia', 'sticker-hey', 'sticker-sup', 'sticker-yoo', 'sticker-wave'];
                        const reward = stickers[Math.floor(Math.random() * stickers.length)];
                        
                        let owned = [];
                        try { owned = JSON.parse(localStorage.getItem('nu_stickers') || '[]'); } catch(e){}
                        if (!owned.includes(reward)) {
                            owned.push(reward);
                            localStorage.setItem('nu_stickers', JSON.stringify(owned));
                        }
                        if (typeof renderStickers === 'function') renderStickers();
                        
                        prize = { title: 'Új Matrica!', name: reward, isSticker: true };
                    } else {
                        const gemReward = Math.floor(Math.random() * 100) + 50;
                        let currentGems = parseInt(localStorage.getItem('nu_gems') || '0', 10);
                        localStorage.setItem('nu_gems', String(currentGems + gemReward));
                        if (typeof updateGemUI === 'function') updateGemUI();
                        
                        prize = { title: 'Gemek!', name: gemReward + ' Gem', isGems: true };
                    }
                } else if (type === 'vip') {
                    const r = Math.random();
                    if (r < 0.3) {
                        const skinsList = ['szilard', 'boti', 'szofia', 'bende', 'szasz', 'nemeth', 'barnabas', 'zerend', 'viki', 'dorina', 'lazar', 'benji', 'zsofi', 'milan', 'tech-szilard', 'tech-boti', 'summer-szilard', 'summer-boti'];
                        const reward = skinsList[Math.floor(Math.random() * skinsList.length)];
                        
                        let owned = [];
                        try { owned = JSON.parse(localStorage.getItem('nu_owned') || '[]'); } catch(e){}
                        if (!owned.includes(reward)) {
                            owned.push(reward);
                            localStorage.setItem('nu_owned', JSON.stringify(owned));
                        }
                        if (typeof renderShop === 'function') renderShop();
                        
                        prize = { title: 'Új Bot / Skin!', name: reward, isSkin: true, skinId: reward };
                    } else if (r < 0.5) {
                        const stickers = ['sticker-matrix', 'sticker-cyber', 'sticker-quantum', 'sticker-hacker'];
                        const reward = stickers[Math.floor(Math.random() * stickers.length)];
                        
                        let owned = [];
                        try { owned = JSON.parse(localStorage.getItem('nu_stickers') || '[]'); } catch(e){}
                        if (!owned.includes(reward)) {
                            owned.push(reward);
                            localStorage.setItem('nu_stickers', JSON.stringify(owned));
                        }
                        if (typeof renderStickers === 'function') renderStickers();
                        
                        prize = { title: 'VIP Matrica!', name: reward, isSticker: true };
                    } else {
                        const gemReward = Math.floor(Math.random() * 500) + 300;
                        let currentGems = parseInt(localStorage.getItem('nu_gems') || '0', 10);
                        localStorage.setItem('nu_gems', String(currentGems + gemReward));
                        if (typeof updateGemUI === 'function') updateGemUI();
                        
                        prize = { title: 'Hatalmas Gem!', name: gemReward + ' Gem', isGems: true };
                    }


                // Show what we got inside the overlay with a beautiful entry animation
                let rewardHtml = '';
                if (prize.isGems) {
                    rewardHtml = \`<div style="font-size: 100px; text-shadow: 0 0 40px rgba(56, 189, 248, 0.8); animation: prizePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">💎</div>\`;
                } else if (prize.isSkin) {
                    if (typeof window.buildMiniRobotHtml === 'function') {
                        rewardHtml = \`<div style="transform: scale(2.0); margin: 50px 0; height: 120px; display: flex; justify-content: center; align-items: center; animation: prizePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">\${window.buildMiniRobotHtml(prize.skinId, false)}</div>\`;
                    } else {
                        rewardHtml = \`<div style="font-size: 100px; animation: prizePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">🤖</div>\`;
                    }
                } else if (prize.isSticker) {
                    rewardHtml = \`<div style="font-size: 100px; text-shadow: 0 0 40px rgba(167, 139, 250, 0.8); animation: prizePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">\${getStickerEmoji(prize.name)}</div>\`;
                }

                overlay.innerHTML = \`
                    <div style="text-align: center; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <h2 style="font-size: 32px; font-weight: 900; color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.6); margin: 0 0 10px 0; animation: prizePop 0.4s ease-out;">\${prize.title}</h2>
                        <div style="margin: 20px 0;">
                            \${rewardHtml}
                        </div>
                        <p style="font-size: 24px; font-weight: 900; color: #fff; margin: 10px 0 5px 0; text-transform: uppercase; animation: prizePop 0.5s ease-out;">\${prize.name}</p>
                    </div>
                \`;

                // Play win sound
                try {
                    if (prize.isSkin) {
                        playSfx('zynox');
                    } else if (prize.isGems) {
                        playSfx('gem-claim');
                    } else {
                        playSfx('skin-equip');
                    }
                } catch(e){}

                // Auto remove overlay after 3.8 seconds
                setTimeout(() => {
                    overlay.classList.add('fade-out');
                    setTimeout(() => overlay.remove(), 500);
                }, 3800);

            }, 1500);
        }

        window.buyOriginalBox = function() {
            const today = new Date().toDateString();
            const hasFree = localStorage.getItem('nu_orig_free_received_today') !== today;
            
            if (!hasFree) {
                let currentGems = parseInt(localStorage.getItem('nu_gems') || '0', 10);
                if (currentGems < 250) {
                    showLootToast('Hiba!', 'Nincs elég Gemed az Original Boxhoz! (250 gem kell)', '❌');
                    if(typeof playSfx === 'function') playSfx('error');
                    return;
                }
                localStorage.setItem('nu_gems', String(currentGems - 250));
                if (typeof updateGemUI === 'function') updateGemUI();
            } else {
                localStorage.setItem('nu_orig_free_received_today', today);
                updateOriginalUI();
            }
            if(typeof playSfx === 'function') playSfx('buy');
            
            doNyitas('orig');
        };

        window.buyVipBox = function() {
            const hasFree = localStorage.getItem('nu_free_vip_received') !== 'true';
            
            if (!hasFree) {
                let currentGems = parseInt(localStorage.getItem('nu_gems') || '0', 10);
                if (currentGems < 550) {
                    showLootToast('Hiba!', 'Nincs elég Gemed a VIP Boxhoz! (550 gem kell)', '❌');
                    if(typeof playSfx === 'function') playSfx('error');
                    return;
                }
                localStorage.setItem('nu_gems', String(currentGems - 550));
                if (typeof updateGemUI === 'function') updateGemUI();
            } else {
                localStorage.setItem('nu_free_vip_received', 'true');
                updateVipUI();
            }
            
            if(typeof playSfx === 'function') playSfx('buy');
            
            doNyitas('vip');
        };

        window.buyMegaBox = function() {
            let currentGems = parseInt(localStorage.getItem('nu_gems') || '0', 10);
            if (currentGems < 999) {
                showLootToast('Hiba!', 'Nincs elég Gemed a Mega Pack Boxhoz! (999 gem kell)', '❌');
                if(typeof playSfx === 'function') playSfx('error');
                return;
            }
            localStorage.setItem('nu_gems', String(currentGems - 999));
            if (typeof updateGemUI === 'function') updateGemUI();
            if(typeof playSfx === 'function') playSfx('buy');
            
            doNyitas('mega');
        };
`;

const startIdx = html.indexOf(scriptTargetStart);
const endIdx = html.indexOf(scriptTargetEnd);

if (startIdx === -1 || endIdx === -1) {
    console.error('Failed to locate script block replace range.');
    process.exit(1);
}

const beforeScript = html.slice(0, startIdx);
const afterScript = html.slice(endIdx);

html = beforeScript + newScriptBlock + '\n    })();\n    </script>\n</html>';

fs.writeFileSync('index.html', html);
console.log('Mega Pack Box and daily free Original Box successfully added.');
