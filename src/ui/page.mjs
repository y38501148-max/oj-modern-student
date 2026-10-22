export function readPage(document, href) {
  const url = new URL(href);
  const nav = document.querySelector('#navbar') || document.querySelector('[ng-view]>nav');
  const anchors = [...(nav?.querySelectorAll('a') || [])].filter(a => a.getAttribute('href')?.startsWith('/'));
  const account = anchors.find(a => a.closest('.navbar-right') && /^\/user\/\d+\/index/.test(a.getAttribute('href'))) || anchors.find(a => /^\/user\/\d+\/index/.test(a.getAttribute('href')));
  const links = anchors.filter(a => !a.classList.contains('navbar-brand') && !a.closest('.navbar-right')).map(a => ({ href: a.getAttribute('href'), label: a.textContent.trim() }));
  const titles = { '/': '首页', '/index': '首页', group: '课程', problem: '题库', contest: '比赛', 'contest-ng': '比赛', rank: '排行榜', user: '个人信息', submission: '提交记录', feedback: '反馈', game: '休息一下', recommend: '好书推荐' };
  const section = url.pathname.split('/')[1];
  const home = url.pathname === '/' || url.pathname === '/index';
  const page = document.querySelector('#page');
  const toLink = a => ({ href: a.getAttribute('href'), title: a.textContent.trim() });
  const solutions = [...(page?.querySelectorAll('a[href*="/createSolution"]') || [])].map(a => {
    const match = a.textContent.trim().match(/^(\d+)\s*--\s*(.*)$/s);
    return { ...toLink(a), id: match?.[1] || '', title: match?.[2] || a.textContent.trim() };
  });
  const recommendations = [...(page?.querySelectorAll('a[href]') || [])].filter(a => /^\/problem\/\d+\/index$/.test(a.getAttribute('href'))).map(toLink);
  const table = page?.querySelector('.containing table');
  const champions = [...(table?.rows || [])].slice(1).filter(row => row.cells.length >= 4).map((row, index) => ({
    key: index, month: row.cells[0].textContent.trim(), student: row.cells[1].textContent.trim(), name: row.cells[2].textContent.trim(), count: row.cells[3].textContent.trim(),
  })).reverse();
  const guides = [...(page?.querySelectorAll('a[href*="Statistics"]') || [])].map(toLink);
  const notices = [...(page?.querySelectorAll('.containing p') || [])].map(p => p.textContent.trim()).filter(text => /注销|暂时关闭注册/.test(text));
  return {
    home, section: home ? 'home' : section, title: home ? '首页' : titles[section] || '学习空间',
    links, account: account ? { name: account.textContent.trim().replace(/^欢迎[，,]\s*/, ''), href: account.getAttribute('href') } : null,
    logout: anchors.find(a => a.getAttribute('href') === '/user/logout')?.getAttribute('href'),
    solutions, recommendations, champions, guides, notices,
    terms: document.querySelector('#footer a')?.getAttribute('href') || '',
  };
}
