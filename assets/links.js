(function(){
  const KEY = 'quick_links_v1';
  const $ = id => document.getElementById(id);
  const container = $('links-container');
  const addBtn = $('add-btn');
  const modal = $('form-modal');
  const inputGroup = $('input-group');
  const inputLabel = $('input-label');
  const inputUrl = $('input-url');
  const saveBtn = $('save-link');
  const cancelBtn = $('cancel-link');
  const exportBtn = $('export-links');
  const clearBtn = $('clear-links');

  const groupTpl = document.getElementById('group-template');
  const itemTpl = document.getElementById('link-item-template');

  let data = {};
  let editing = null;

  function load(){
    try{ data = JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ data = {}; }
  }

  function save(){ localStorage.setItem(KEY, JSON.stringify(data)); }

  function render(){
    container.innerHTML = '';
    const groups = Object.keys(data);
    if (!groups.length) {
      container.innerHTML = '<div class="group"><p class="small">目前没有链接，点击“＋ 添加链接”开始添加。</p></div>';
      return;
    }
    for (const g of groups){
      const node = groupTpl.content.cloneNode(true);
      node.querySelector('.group-title').textContent = g;
      const ul = node.querySelector('.links-list');
      for (const it of data[g]){
        const li = itemTpl.content.cloneNode(true);
        const a = li.querySelector('.link-url');
        a.textContent = it.label;
        a.href = it.url;
        li.querySelector('.btn-delete').addEventListener('click', ()=>{ removeLink(g, it.id); });
        li.querySelector('.btn-edit').addEventListener('click', ()=>{ openModal(g, it); });
        ul.appendChild(li);
      }
      container.appendChild(node);
    }
  }

  function openModal(group, item){
    modal.setAttribute('aria-hidden','false');
    inputGroup.value = group || '';
    inputLabel.value = item ? item.label : '';
    inputUrl.value = item ? item.url : '';
    editing = item ? {group, id:item.id} : null;
    inputLabel.focus();
  }

  function closeModal(){ modal.setAttribute('aria-hidden','true'); editing = null; inputGroup.value=''; inputLabel.value=''; inputUrl.value=''; }

  function addOrUpdate(){
    const g = inputGroup.value.trim() || '未分类';
    const label = inputLabel.value.trim();
    let url = inputUrl.value.trim();
    if (!label || !url) { alert('请填写标签和 URL'); return; }
    if (!/^https?:\/\//.test(url)) url = 'https://' + url;
    if (!data[g]) data[g]=[];
    if (editing){
      const list = data[editing.group] || [];
      const idx = list.findIndex(x=>x.id===editing.id);
      if (idx>-1){
        list[idx].label = label; list[idx].url = url;
        // 如果分组改变
        if (editing.group !== g){
          const moved = list.splice(idx,1)[0];
          moved.id = Date.now().toString();
          if (!data[g]) data[g]=[];
          data[g].push(moved);
        }
      }
    } else {
      data[g].push({ id: Date.now().toString(), label, url });
    }
    // 清理空组
    for (const k of Object.keys(data)){ if (!data[k] || !data[k].length) delete data[k]; }
    save(); render(); closeModal();
  }

  function removeLink(group, id){
    if (!confirm('确认删除该链接？')) return;
    data[group] = (data[group]||[]).filter(x=>x.id!==id);
    if (!data[group].length) delete data[group];
    save(); render();
  }

  function exportJson(){
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'links.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function clearAll(){ if (!confirm('确认清空所有链接？')) return; data={}; save(); render(); }

  // events
  addBtn.addEventListener('click', ()=>openModal(''));
  cancelBtn.addEventListener('click', ()=>closeModal());
  saveBtn.addEventListener('click', ()=>addOrUpdate());
  exportBtn.addEventListener('click', ()=>exportJson());
  clearBtn.addEventListener('click', ()=>clearAll());

  // init with some defaults if empty
  load();
  if (Object.keys(data).length===0){
    data = {
      '开发':[ {id:Date.now().toString(),label:'GitHub',url:'https://github.com'} ],
      '工具':[ {id:(Date.now()+1).toString(),label:'Figma',url:'https://www.figma.com'} ]
    };
    save();
  }
  render();

  // close modal on outside click
  modal.addEventListener('click', (e)=>{ if (e.target===modal) closeModal(); });

})();
