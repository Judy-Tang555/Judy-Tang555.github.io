(function() {
  const KEY = 'daily_entries_v1';
  const $ = id => document.getElementById(id);

  const dateInput = $('entry-date');
  const titleInput = $('entry-title');
  const contentInput = $('entry-content');
  const saveBtn = $('save-btn');
  const cancelBtn = $('cancel-btn');
  const listEl = $('entries-list');
  const filterDate = $('filter-date');
  const filterBtn = $('filter-btn');
  const clearFilter = $('clear-filter');
  const exportBtn = $('export-btn');
  const clearAllBtn = $('clear-all');

  let entries = [];
  let editingId = null;

  function todayISO() {
    return new Date().toISOString().slice(0,10);
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      entries = raw ? JSON.parse(raw) : [];
    } catch (e) {
      entries = [];
    }
  }

  function saveStorage() {
    localStorage.setItem(KEY, JSON.stringify(entries));
  }

  function render(filter = null) {
    listEl.innerHTML = '';
    const shown = filter ? entries.filter(e => e.date === filter) : entries.slice().reverse();
    if (!shown.length) {
      listEl.innerHTML = '<div class="empty">暂无记录</div>';
      return;
    }
    for (const e of shown) {
      const li = document.createElement('li');
      li.innerHTML = `<div>
          <div><strong>${escapeHtml(e.title || '(无标题)')}</strong></div>
          <div class="meta">${e.date} · ${escapeHtml((e.content||'').slice(0,80))}</div>
        </div>
        <div class="entry-actions">
          <button class="muted" data-id="${e.id}" data-action="edit">编辑</button>
          <button class="danger" data-id="${e.id}" data-action="delete">删除</button>
        </div>`;
      listEl.appendChild(li);
    }
  }

  function escapeHtml(s){ return s.replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

  function addEntry() {
    const entry = {
      id: Date.now().toString(),
      date: dateInput.value || todayISO(),
      title: titleInput.value.trim(),
      content: contentInput.value.trim()
    };
    entries.push(entry);
    saveStorage();
    render(filterDate.value || null);
    clearForm();
  }

  function updateEntry() {
    const idx = entries.findIndex(x=>x.id===editingId);
    if (idx === -1) return;
    entries[idx].date = dateInput.value || todayISO();
    entries[idx].title = titleInput.value.trim();
    entries[idx].content = contentInput.value.trim();
    saveStorage();
    editingId = null;
    saveBtn.textContent = '保存';
    render(filterDate.value || null);
    clearForm();
  }

  function clearForm() {
    dateInput.value = todayISO();
    titleInput.value = '';
    contentInput.value = '';
  }

  function onListClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'edit') {
      const ent = entries.find(x=>x.id===id);
      if (!ent) return;
      editingId = id;
      dateInput.value = ent.date;
      titleInput.value = ent.title;
      contentInput.value = ent.content;
      saveBtn.textContent = '更新';
      window.scrollTo({top:0,behavior:'smooth'});
    } else if (action === 'delete') {
      if (!confirm('确认删除此记录？')) return;
      entries = entries.filter(x=>x.id!==id);
      saveStorage();
      render(filterDate.value || null);
    }
  }

  function exportJson() {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_entries.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    if (!confirm('确认清空所有记录？此操作不可撤销。')) return;
    entries = [];
    saveStorage();
    render();
  }

  saveBtn.addEventListener('click', () => {
    if (editingId) updateEntry(); else addEntry();
  });
  cancelBtn.addEventListener('click', () => { editingId=null; saveBtn.textContent='保存'; clearForm(); });
  listEl.addEventListener('click', onListClick);
  filterBtn.addEventListener('click', ()=>render(filterDate.value || null));
  clearFilter.addEventListener('click', ()=>{ filterDate.value=''; render(); });
  exportBtn.addEventListener('click', exportJson);
  clearAllBtn.addEventListener('click', clearAll);

  // init
  load();
  clearForm();
  render();
})();
