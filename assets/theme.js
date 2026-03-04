(() => {
  const KEY = 'site_theme_v1';
  const btn = document.getElementById('theme-toggle');
  function getTheme(){
    try{ return localStorage.getItem(KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }catch(e){return 'light'}
  }
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  }
  function toggle(){ const t = getTheme() === 'dark' ? 'light' : 'dark'; localStorage.setItem(KEY, t); applyTheme(t); }
  applyTheme(getTheme());
  if (btn) btn.addEventListener('click', toggle);
})();
