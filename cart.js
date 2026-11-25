(function () {
  const params = new URLSearchParams(window.location.search);
  const storeParam = params.get('store');
  let isClientView = Boolean(storeParam);
  let storeWhatsapp = '972525914007';

  fetch('approved.json?t=' + Date.now())
    .then(r => r.ok ? r.json() : {})
    .then(data => {
      const savedCode = (localStorage.getItem('cataforge_saved_code') || '').toUpperCase();
      for (const [code, info] of Object.entries(data)) {
        if ((storeParam && info.storeId === storeParam) || (!storeParam && code === savedCode)) {
          const clean = String(info.whatsapp || '').replace(/\D/g, '');
          if (clean) storeWhatsapp = clean;
          break;
        }
      }
    })
    .catch(() => {});

  const style = document.createElement('style');
  style.textContent =
    '.cf-float-cart{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:999px;padding:13px 24px;font-family:inherit;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 10px 28px rgba(16,185,129,0.45);z-index:95;display:flex;align-items:center;gap:10px;white-space:nowrap;}' +
    '.cf-float-cart.hidden{display:none!important;}' +
    '.cf-cart-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);}' +
    '.cf-qty-box{display:flex;align-items:center;gap:6px;}' +
    '.cf-qty-btn{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.1);color:#fff;font-weight:800;cursor:pointer;}' +
    '.cf-preview-exit{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#111827;border:none;border-radius:999px;padding:8px 18px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(245,158,11,0.4);z-index:98;}';
  document.head.appendChild(style);

  const bannerActions = document.querySelector('.banner-actions');
  const previewBtn = document.createElement('button');
  previewBtn.type = 'button';
  previewBtn.className = 'btn secondary small admin-only';
  previewBtn.textContent = '👀 תצוגת לקוח';
  if (bannerActions) bannerActions.prepend(previewBtn);

  const backAdminBtn = document.createElement('button');
  backAdminBtn.type = 'button';
  backAdminBtn.className = 'cf-preview-exit hidden';
  backAdminBtn.textContent = '🛠️ חזרה למצב ניהול';
  document.body.appendChild(backAdminBtn);

  const floatBtn = document.createElement('button');
  floatBtn.type = 'button';
  floatBtn.className = 'cf-float-cart hidden';
  document.body.appendChild(floatBtn);

  const modal = document.createElement('div');
  modal.className = 'modal hidden';
  const card = document.createElement('div');
  card.className = 'modal-card';

  const title = document.createElement('h2');
  title.style.marginTop = '0';
  title.textContent = '🛒 סל הקניות שלי';

  const listWrap = document.createElement('div');
  listWrap.style.cssText = 'max-height:240px;overflow-y:auto;margin-bottom:12px;';

  const totalRow = document.createElement('div');
  totalRow.style.cssText = 'display:flex;justify-content:space-between;font-size:18px;font-weight:800;padding:10px 0;border-top:1px solid rgba(255,255,255,0.15);';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'סה״כ לתשלום:';
  const totalVal = document.createElement('span');
  totalRow.append(totalLabel, totalVal);

  const formBox = document.createElement('div');
  formBox.className = 'form';
  formBox.style.marginTop = '10px';
  const nameInp = document.createElement('input');
  nameInp.type = 'text';
  nameInp.placeholder = 'השם שלך (אופציונלי)';
  const noteInp = document.createElement('input');
  noteInp.type = 'text';
  noteInp.placeholder = 'הערות להזמנה / כתובת למשלוח...';
  formBox.append(nameInp, noteInp);

  const actions = document.createElement('div');
  actions.className = 'modal-actions';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn secondary';
  closeBtn.textContent = 'המשך בקניות';
  const sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'btn wa-btn';
  sendBtn.textContent = '💬 שלח הזמנה לוואטסאפ';
  actions.append(closeBtn, sendBtn);

  card.append(title, listWrap, totalRow, formBox, actions);
  modal.appendChild(card);
  document.body.appendChild(modal);

  let cart = [];

  function notify(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'toast show good';
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  function updateBar() {
    if (!isClientView || !cart.length) {
      floatBtn.classList.add('hidden');
      return;
    }
    let qty = 0;
    let sum = 0;
    cart.forEach(item => {
      qty += item.qty;
      sum += item.price * item.qty;
    });
    floatBtn.textContent = '🛒 לסל הקניות (' + qty + ' פריטים · ' + sum.toLocaleString() + ' ₪)';
    totalVal.textContent = sum.toLocaleString() + ' ₪';
    floatBtn.classList.remove('hidden');
  }

  function renderList() {
    listWrap.innerHTML = '';
    cart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'cf-cart-row';

      const info = document.createElement('div');
      const b = document.createElement('b');
      b.textContent = item.name;
      const sub = document.createElement('div');
      sub.style.cssText = 'font-size:13px;opacity:0.8;';
      sub.textContent = item.price.toLocaleString() + ' ₪ ליח׳';
      info.append(b, sub);

      const ctrls = document.createElement('div');
      ctrls.className = 'cf-qty-box';
      const minus = document.createElement('button');
      minus.type = 'button';
      minus.className = 'cf-qty-btn';
      minus.textContent = '-';
      minus.onclick = () => {
        item.qty -= 1;
        if (item.qty <= 0) cart.splice(idx, 1);
        updateBar();
        if (!cart.length) modal.classList.add('hidden');
        else renderList();
      };

      const num = document.createElement('b');
      num.style.cssText = 'min-width:22px;text-align:center;';
      num.textContent = String(item.qty);

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.className = 'cf-qty-btn';
      plus.textContent = '+';
      plus.onclick = () => {
        item.qty += 1;
        updateBar();
        renderList();
      };

      ctrls.append(minus, num, plus);
      row.append(info, ctrls);
      listWrap.appendChild(row);
    });
  }

  floatBtn.onclick = () => {
    renderList();
    modal.classList.remove('hidden');
  };
  closeBtn.onclick = () => modal.classList.add('hidden');

    sendBtn.onclick = () => {
    if (!cart.length) return;
    const NL = String.fromCharCode(10);
    const storeName = (document.getElementById('activeStoreName')?.textContent || 'החנות').trim();
    const lines = ['🛒 *הזמנה חדשה מ-' + storeName + '*', '------------------'];
    let grand = 0;

    cart.forEach(item => {
      const sub = item.price * item.qty;
      grand += sub;
      const skuPart = item.sku ? ' [' + item.sku + ']' : '';
      lines.push('▪️ ' + item.qty + ' × *' + item.name + '*' + skuPart + ' — ' + sub.toLocaleString() + ' ₪');
    });

    lines.push('------------------');
    lines.push('💰 *סה״כ לתשלום: ' + grand.toLocaleString() + ' ₪*');
    if (nameInp.value.trim()) lines.push('👤 שם: ' + nameInp.value.trim());
    if (noteInp.value.trim()) lines.push('📝 הערות: ' + noteInp.value.trim());

    const phoneClean = String(storeWhatsapp || '972525914007').replace(/[^0-9]/g, '');
    const waPhone = phoneClean.startsWith('0') ? '972' + phoneClean.slice(1) : phoneClean;
   
        const SL = String.fromCharCode(47);
    const waUrl = 'https:' + SL + SL + 'wa.me' + SL + waPhone + '?text=' + encodeURIComponent(lines.join(NL));


    window.open(waUrl, '_blank', 'noopener');
  };

  function upgradeCards() {
    document.querySelectorAll('#productGrid .task').forEach(cardEl => {
      if (isClientView) {
        if (cardEl.classList.contains('out-of-stock')) {
          cardEl.style.display = 'none';
          return;
        }
        const btnsBox = cardEl.querySelector('.card-btns');
        if (!btnsBox || btnsBox.querySelector('.cf-add-cart')) return;

        const prodName = (cardEl.querySelector('h3')?.textContent || '').trim();
        const priceTxt = (cardEl.querySelector('.final-price')?.textContent || '0').replace(/[^\d.]/g, '');
        const price = parseFloat(priceTxt) || 0;
        const skuSpan = Array.from(cardEl.querySelectorAll('.task-foot span')).find(s => s.textContent.includes('מק״ט:'));
        const sku = skuSpan ? skuSpan.textContent.replace('מק״ט:', '').trim() : '';

        btnsBox.innerHTML = '';
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'order-wa-btn cf-add-cart';
        addBtn.textContent = '+ הוסף לסל 🛒';
        addBtn.onclick = () => {
          const found = cart.find(c => c.name === prodName && c.sku === sku);
          if (found) found.qty += 1;
          else cart.push({ name: prodName, price, sku, qty: 1 });
          updateBar();
          notify('נוסף לסל: ' + prodName + ' 🛒');
        };
        btnsBox.appendChild(addBtn);
      } else {
        cardEl.style.display = '';
      }
    });
  }

  function setPreviewMode(active) {
    isClientView = active;
    document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', active));
    backAdminBtn.classList.toggle('hidden', !active || Boolean(storeParam));
    updateBar();
    upgradeCards();
  }

  previewBtn.onclick = () => setPreviewMode(true);
  backAdminBtn.onclick = () => setPreviewMode(false);

  const grid = document.getElementById('productGrid');
  if (grid) {
    const obsConfig = Object.fromEntries([['childList', true]]);
    new MutationObserver(upgradeCards).observe(grid, obsConfig);
    if (isClientView) setPreviewMode(true);
    else upgradeCards();
  }
})();
