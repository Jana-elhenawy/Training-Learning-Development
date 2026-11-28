window.TrainerUI = {
  init(activePage) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      const nav = [
        ['Dashboard','trainer-dashboard.html'], 
        ['Program Catalog','trainer-program-catalog.html'],
        ['My Training','trainer-my-training.html'], 
        ['My Sessions','trainer-my-sessions.html'],
        ['Notification','notification.html']
      ];
      const logo = `<div class="logo"><img src="assets/logo-white.png" alt="RMO" onerror="this.parentNode.innerHTML='<div><div class=wm>RMO</div><small>RIDGELINE MOUNTAIN OUTFITTERS</small></div>'"></div>`;
      sidebar.innerHTML = logo + `<div class="role">Trainer</div>` +
        nav.map(([label,url]) => `<a class="nav${label===activePage?' active':''}" href="${url}">${label}</a>`).join('') +
        `<div class="spacer"></div><a class="nav muted" href="change-password.html">Change password</a><a class="nav muted" href="index.html" id="logout">Log out</a>`;
      
      const logout = document.getElementById('logout');
      if (logout) logout.addEventListener('click', () => { try { sessionStorage.clear(); } catch(e){} });
    }
  },
  toast(msg) {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(window._tToast); window._tToast = setTimeout(() => el.classList.remove('show'), 2200);
  }
};