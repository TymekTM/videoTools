const LOREM_HEADLINES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod',
  'Nulla facilisi morbi tempus iaculis urna id volutpat lacus',
  'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum',
  'Excepteur sint occaecat cupidatat non proident sunt in culpa qui',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames',
  'Cras tincidunt lobortis feugiat vivamus at augue eget arcu dictum',
  'Viverra accumsan in nisl nisi scelerisque eu ultrices vitae auctor',
  'Amet consectetur adipiscing elit pellentesque habitant morbi tristique',
  'Faucibus purus in massa tempor nec feugiat nisl pretium fusce',
  'Quis varius quam quisque id diam vel quam elementum pulvinar',
  'Tortor posuere ac ut consequat semper viverra nam libero justo',
  'Amet venenatis urna cursus eget nunc scelerisque viverra mauris',
  'Turpis egestas pretium aenean pharetra magna ac placerat vestibulum',
  'Nisi vitae suscipit tellus mauris a diam maecenas sed enim',
];

const LOREM_PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
  'Nulla facilisi morbi tempus iaculis urna id volutpat lacus. Viverra accumsan in nisl nisi. Scelerisque eu ultrices vitae auctor eu augue ut lectus arcu bibendum. Egestas maecenas pharetra convallis posuere morbi leo urna molestie. At elementum eu facilisis sed odio morbi quis commodo.',
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec sed odio dui aenean eu leo quam pellentesque.',
  'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed posuere consectetur est at lobortis. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod semper praesent commodo cursus magna.',
  'Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh ut fermentum massa justo sit amet risus.',
  'Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum nullam quis risus eget urna mollis ornare vel.',
  'Etiam porta sem malesuada magna mollis euismod. Cras justo odio, dapibus ut facilisis in, egestas eget quam. Nullam quis risus eget urna mollis ornare vel eu leo. Aenean eu leo quam pellentesque ornare sem lacinia quam venenatis vestibulum.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante etiam sit amet orci eget eros faucibus tincidunt. Duis mollis est non commodo luctus.',
  'Fusce nec tellus sed augue semper porta. Mauris massa vestibulum lacinia risus at ultrices mi tempus imperdiet. Nulla porttitor accumsan tincidunt. Mauris blandit aliquet elit eget tincidunt. Curabitur arcu erat accumsan id imperdiet et porttitor at sem.',
  'Pellentesque diam volutpat commodo sed egestas egestas. Quisque id diam vel quam elementum pulvinar. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui et ipsum sagittis posuere.',
  'Vitae ultricies leo integer malesuada nunc vel risus. Viverra maecenas accumsan lacus vel facilisis volutpat. Morbi tincidunt ornare massa eget egestas. Sed egestas egestas fringilla phasellus faucibus scelerisque eleifend.',
  'Proin sagittis nisl rhoncus mattis rhoncus urna. Neque ornare aenean euismod. Suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Ut enim blandit volutpat maecenas volutpat blandit aliquam etiam.',
  'Arcu cursus euismod quis viverra nibh cras pulvinar. Mattis enim ut tellus elementum sagittis vitae et leo. Diam vulputate ut pharetra sit amet aliquam id diam maecenas. Sed adipiscing diam donec adipiscing tristique risus nec feugiat.',
  'Tincidunt id aliquet risus feugiat in ante. Nunc sed blandit libero volutpat sed cras ornare. Egestas egestas fringilla phasellus faucibus scelerisque eleifend donec. Scelerisque in dictum non consectetur a erat nam.',
  'Amet consectetur adipiscing elit pellentesque habitant morbi. Tristique senectus et netus et malesuada fames. Nunc pulvinar elementum integer enim neque volutpat ac tincidunt vitae. Porttitor lacus luctus accumsan tortor posuere.',
];

const LOREM_AUTHORS = [
  'A. Kowalski', 'M. Nowak', 'J. Wiśniewski', 'K. Wójcik',
  'P. Kamiński', 'T. Lewandowski', 'B. Zieliński', 'R. Szymański',
  'Staff Reporter', 'Senior Editor', 'Special Correspondent',
];

function insertKeyword(text, keyword) {
  const words = text.split(/\s+/);
  const minIdx = Math.max(2, Math.floor(words.length * 0.15));
  const maxIdx = Math.min(words.length - 3, Math.floor(words.length * 0.85));
  const idx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx));
  words[idx] = `<span class="keyword-highlight">${keyword}</span>`;
  return words.join(' ');
}

function makeHelpers(customHeadline, customLead) {
  let usedHeadlines = new Set();
  return {
    headline() {
      if (customHeadline) return customHeadline;
      let idx;
      do { idx = Math.floor(Math.random() * LOREM_HEADLINES.length); }
      while (usedHeadlines.has(idx) && usedHeadlines.size < LOREM_HEADLINES.length);
      usedHeadlines.add(idx);
      if (usedHeadlines.size >= LOREM_HEADLINES.length) usedHeadlines.clear();
      return LOREM_HEADLINES[idx];
    },
    text(offset) {
      const idx = (offset + Math.floor(Math.random() * LOREM_PARAGRAPHS.length)) % LOREM_PARAGRAPHS.length;
      return LOREM_PARAGRAPHS[idx];
    },
    textWithKeyword(keyword) {
      if (customLead) return insertKeyword(customLead, keyword);
      const idx = Math.floor(Math.random() * LOREM_PARAGRAPHS.length);
      return insertKeyword(LOREM_PARAGRAPHS[idx], keyword);
    },
    author() {
      return LOREM_AUTHORS[Math.floor(Math.random() * LOREM_AUTHORS.length)];
    },
    date() {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[Math.floor(Math.random() * 12)]} ${Math.floor(Math.random() * 28) + 1}, ${2023 + Math.floor(Math.random() * 3)}`;
    },
  };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TEMPLATES = [
  { id: 'nyt', name: 'New York Times', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(0),p3=this.text(2),p4=this.text(5),p5=this.text(7),p6=this.text(9),p7=this.text(11),a=this.author(); return `<div style="font-family:'Playfair Display',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#fff;border-bottom:1px solid #e2e2e2;padding:8px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0"><div style="font-size:clamp(14px,2vw,22px);font-weight:900;letter-spacing:-0.02em;color:#121212">The New York Times</div><div style="display:flex;gap:clamp(6px,1vw,14px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.9vw,11px);color:#666;font-weight:500"><span>U.S.</span><span>World</span><span>Business</span><span>Arts</span><span>Opinion</span></div></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(12px,3vw,40px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:680px;width:100%"><div style="font-size:clamp(9px,1vw,13px);text-transform:uppercase;letter-spacing:0.08em;color:#666;font-family:'DM Sans',sans-serif;font-weight:600;margin-bottom:clamp(4px,0.8vw,10px)">World News</div><h1 style="font-size:clamp(16px,3vw,36px);font-weight:900;line-height:1.12;letter-spacing:-0.02em;color:#121212;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1><div style="font-size:clamp(7px,0.85vw,12px);color:#999;font-family:'DM Sans',sans-serif;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:1px solid #e2e2e2">By ${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.7;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'guardian', name: 'The Guardian', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(3),p3=this.text(5),p4=this.text(8),p5=this.text(10),p6=this.text(12),p7=this.text(14),a=this.author(); return `<div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#052962;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(16px,2.5vw,32px);font-weight:900;color:#fff;letter-spacing:-0.01em">The Guardian</div><div style="display:flex;gap:clamp(6px,1vw,14px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.7);font-weight:500;margin-top:clamp(2px,0.4vw,6px)"><span>Headlines</span><span>UK</span><span>World</span><span>Culture</span><span>Lifestyle</span></div></div><div style="background:#fff;padding:clamp(2px,0.3vw,4px) clamp(12px,3vw,40px);font-family:'DM Sans',sans-serif;font-size:clamp(6px,0.7vw,10px);color:#052962;border-bottom:2px solid #052962;flex-shrink:0"><span style="font-weight:700">News</span> &nbsp; Opinion &nbsp; Sport &nbsp; Culture &nbsp; Lifestyle</div><div style="flex:1;display:flex;justify-content:center;padding:clamp(12px,3vw,40px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:700px;width:100%"><h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.15;color:#121212;margin-bottom:clamp(8px,1.5vw,18px);font-style:italic">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#333;font-weight:500;border-left:3px solid #052962;padding-left:clamp(6px,1vw,12px);margin-bottom:clamp(10px,2vw,24px)">${a}<br><span style="color:#666;font-weight:400">${this.date()}</span></div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.7;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'lemonde', name: 'Le Monde', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(1),p3=this.text(4),p4=this.text(7),p5=this.text(9),p6=this.text(11),p7=this.text(13),a=this.author(); return `<div style="font-family:'Cormorant Garamond',Georgia,serif;background:#f7f5f0;height:100%;display:flex;flex-direction:column"><div style="background:#fff;border-bottom:1px solid #d4d0c8;padding:clamp(8px,1.5vw,18px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0"><div style="font-size:clamp(18px,3vw,38px);font-weight:900;color:#000;letter-spacing:-0.01em">Le Monde</div><div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500"><span>International</span><span>Politique</span><span>Culture</span><span>Idées</span></div></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:650px;width:100%"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,13px);text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;margin-bottom:clamp(6px,1vw,14px)">International</div><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:900;line-height:1.15;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:1px solid #d4d0c8">Par <strong style="color:#1a1a1a">${a}</strong> &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.75;color:#2a2a2a"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'spiegel', name: 'Der Spiegel', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(6),p3=this.text(0),p4=this.text(3),p5=this.text(5),p6=this.text(7),p7=this.text(9),a=this.author(); return `<div style="font-family:'Sora',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#E64415;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-size:clamp(18px,3vw,36px);font-weight:700;color:#fff;letter-spacing:0.04em;text-transform:uppercase">DER SPIEGEL</div></div><div style="background:#f2f2f2;border-bottom:1px solid #ddd;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'IBM Plex Mono',monospace;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0"><span style="color:#E64415;font-weight:700">Schlagzeilen</span><span>Politik</span><span>Wirtschaft</span><span>Kultur</span><span>Netzwelt</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:680px;width:100%"><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:3px solid #E64415">Von <strong>${a}</strong> &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'verge', name: 'The Verge', category: 'tech',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(7),p3=this.text(2),p4=this.text(5),p5=this.text(7),p6=this.text(9),p7=this.text(11),a=this.author(); return `<div style="font-family:'Outfit',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#000;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-size:clamp(16px,2.5vw,30px);font-weight:900;color:#fff;letter-spacing:-0.02em">The Verge</div></div><div style="background:#f5f5f5;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-size:clamp(7px,0.85vw,12px);color:#555;font-weight:600;flex-shrink:0"><span style="color:#E5127D">Tech</span><span>Science</span><span>Entertainment</span><span>AI</span><span>Reviews</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:700px;width:100%"><div style="font-size:clamp(8px,1vw,13px);text-transform:uppercase;letter-spacing:0.08em;color:#E5127D;font-weight:700;margin-bottom:clamp(6px,1vw,14px)">Technology</div><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:900;line-height:1.15;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px);letter-spacing:-0.02em">${hl}</h1><div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);display:flex;align-items:center;gap:8px"><span style="font-weight:700;color:#1a1a1a">${a}</span><span>&middot;</span><span>${this.date()}</span></div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#3a3a3a"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'medium', name: 'Medium', category: 'tech',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(4),p3=this.text(7),p4=this.text(10),p5=this.text(12),p6=this.text(14),p7=this.text(0),a=this.author(); return `<div style="font-family:'Source Serif 4',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#fff;border-bottom:1px solid #f0f0f0;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2vw,24px);font-weight:800;color:#000;letter-spacing:-0.02em">Medium</div><div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#757575;font-weight:500"><span>Our Story</span><span>Membership</span><span>Careers</span></div></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(20px,5vw,70px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:680px;width:100%"><div style="display:flex;align-items:center;gap:clamp(6px,1vw,12px);margin-bottom:clamp(12px,2vw,28px)"><div style="width:clamp(24px,3vw,40px);height:clamp(24px,3vw,40px);border-radius:50%;background:#e0e0e0;flex-shrink:0"></div><div><div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,13px);font-weight:700;color:#000">${a}</div><div style="font-family:'DM Sans',sans-serif;font-size:clamp(6px,0.7vw,10px);color:#757575">${this.date()}</div></div></div><h1 style="font-size:clamp(18px,3.5vw,40px);font-weight:700;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(12px,2vw,28px);letter-spacing:-0.02em">${hl}</h1><div style="font-size:clamp(10px,1.5vw,18px);line-height:1.78;color:#242424"><p style="margin-bottom:clamp(8px,1.5vw,20px)">${p1}</p><p style="margin-bottom:clamp(8px,1.5vw,20px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'wikipedia', name: 'Wikipedia', category: 'tech',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(0),p3=this.text(3),p4=this.text(6),p5=this.text(8),p6=this.text(10),p7=this.text(12); return `<div style="font-family:'JetBrains Mono',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#fff;border-bottom:1px solid #a7d7f9;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);flex-shrink:0"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-family:'JetBrains Mono',serif;font-size:clamp(14px,2.2vw,26px);font-weight:normal;color:#000;font-style:italic">Wikipedia</div><div style="font-family:sans-serif;font-size:clamp(6px,0.7vw,10px);color:#54595d;display:flex;gap:clamp(6px,1vw,14px)"><span>Discussion</span><span>Read</span><span>Edit</span><span>History</span></div></div></div><div style="flex:1;display:flex;overflow:hidden"><div style="width:clamp(100px,15vw,220px);background:#f8f9fa;border-right:1px solid #a7d7f9;padding:clamp(8px,1.5vw,20px) clamp(6px,1vw,14px);flex-shrink:0;font-family:sans-serif;font-size:clamp(6px,0.75vw,11px);color:#202122"><div style="font-weight:700;margin-bottom:clamp(4px,0.8vw,10px);font-size:clamp(7px,0.9vw,13px)">Contents</div><div style="margin-bottom:4px;padding-left:8px;color:#0645ad">1 History</div><div style="margin-bottom:4px;padding-left:8px;color:#0645ad">2 Geography</div><div style="margin-bottom:4px;padding-left:8px;color:#0645ad">3 Demographics</div><div style="margin-bottom:4px;padding-left:8px;color:#0645ad">4 Economy</div><div style="margin-bottom:4px;padding-left:8px;color:#0645ad">5 Culture</div><div style="margin-bottom:4px;padding-left:8px;color:#0645ad">6 See also</div></div><div style="flex:1;padding:clamp(14px,3vw,50px) clamp(16px,4vw,60px);overflow:hidden"><h1 style="font-size:clamp(16px,3vw,34px);font-weight:normal;color:#000;border-bottom:1px solid #a2a9b1;padding-bottom:clamp(4px,0.8vw,10px);margin-bottom:clamp(10px,2vw,24px)">${hl}</h1><div style="font-size:clamp(9px,1.3vw,15px);line-height:1.7;color:#202122"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'washingtonpost', name: 'Washington Post', category: 'us_uk',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(0),p3=this.text(5),p4=this.text(8),p5=this.text(10),p6=this.text(12),p7=this.text(14),a=this.author(); return `<div style="font-family:'Source Serif 4',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#000;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(10px,1.5vw,18px);font-weight:800;color:#fff;letter-spacing:0.15em;text-transform:uppercase">The Washington Post</div><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.6);display:flex;gap:clamp(6px,1vw,12px)"><span>Politics</span><span>Opinions</span><span>Style</span></div></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:680px;width:100%"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,12px);text-transform:uppercase;letter-spacing:0.08em;color:#666;font-weight:600;margin-bottom:clamp(6px,1vw,12px)">Analysis</div><h1 style="font-size:clamp(16px,3vw,36px);font-weight:700;line-height:1.15;color:#111;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,11px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-top:2px solid #000;padding-top:clamp(8px,1.2vw,14px)">By <strong>${a}</strong> &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.7;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'telegraph', name: 'The Telegraph', category: 'us_uk',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(3),p3=this.text(6),p4=this.text(9),p5=this.text(11),p6=this.text(13),p7=this.text(15),a=this.author(); return `<div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#1b1b1b;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2.2vw,26px);font-weight:800;color:#fff;letter-spacing:-0.01em">The Telegraph</div><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.5);display:flex;gap:clamp(6px,1vw,12px)"><span>News</span><span>Finance</span><span>Sport</span><span>Culture</span></div></div><div style="border-bottom:3px solid #c8102e;flex-shrink:0"></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.15;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-left:3px solid #c8102e;padding-left:clamp(6px,1vw,12px)">${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#2a2a2a"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'zeit', name: 'Die Zeit', category: 'magazine',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(1),p3=this.text(7),p4=this.text(10),p5=this.text(12),p6=this.text(14),p7=this.text(0),a=this.author(); return `<div style="font-family:'Crimson Pro',Georgia,serif;background:#f5f2eb;height:100%;display:flex;flex-direction:column"><div style="background:#262626;padding:clamp(10px,1.8vw,22px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-size:clamp(22px,4vw,44px);font-weight:900;color:#fff;letter-spacing:0.02em;line-height:1">DIE ZEIT</div></div><div style="background:#c4b896;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#262626;font-weight:600;flex-shrink:0"><span>Politik</span><span>Wirtschaft</span><span>Kultur</span><span>Wissen</span><span>Leben</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:640px;width:100%"><h1 style="font-size:clamp(18px,3.2vw,36px);font-weight:900;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(12px,2vw,28px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#555;margin-bottom:clamp(10px,2vw,24px);border-bottom:1px solid #c4b896;padding-bottom:clamp(8px,1.2vw,14px)">Von <strong style="color:#1a1a1a">${a}</strong> &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.75;color:#2a2a2a"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'elpais', name: 'El País', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(5),p3=this.text(1),p4=this.text(4),p5=this.text(6),p6=this.text(8),p7=this.text(10),a=this.author(); return `<div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#004481;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-size:clamp(20px,3.2vw,38px);font-weight:900;color:#fff;letter-spacing:0.02em">EL PAÍS</div></div><div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:600;flex-shrink:0"><span style="color:#004481;font-weight:700">Internacional</span><span>Opinión</span><span>Economía</span><span>Cultura</span><span>Sociedad</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:1px solid #e5e5e5">${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#2a2a2a"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'gazeta', name: 'Gazeta Wyborcza', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(2),p3=this.text(4),p4=this.text(7),p5=this.text(9),p6=this.text(11),p7=this.text(13),a=this.author(); return `<div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#006633;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2.5vw,28px);font-weight:900;color:#fff;letter-spacing:-0.01em">GAZETA WYBORCZA</div></div><div style="background:#fff;border-bottom:1px solid #e0e0e0;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0"><span style="color:#006633;font-weight:700">Świat</span><span>Polityka</span><span>Gospodarka</span><span>Kultura</span><span>Sport</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:2px solid #006633">${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'nrc', name: 'NRC Handelsblad', category: 'magazine',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(5),p3=this.text(1),p4=this.text(4),p5=this.text(6),p6=this.text(8),p7=this.text(10),a=this.author(); return `<div style="font-family:'Instrument Serif',Georgia,serif;background:#f8f6f0;height:100%;display:flex;flex-direction:column"><div style="background:#fff;border-bottom:1px solid #e0dcd0;padding:clamp(8px,1.5vw,18px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(20px,3.5vw,40px);font-weight:800;color:#000;letter-spacing:-0.02em">NRC</div><div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#888;font-weight:500;margin-top:clamp(2px,0.4vw,6px)"><span>Binnenland</span><span>Buitenland</span><span>Economie</span><span>Cultuur</span></div></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:640px;width:100%"><h1 style="font-size:clamp(18px,3.5vw,40px);font-weight:400;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(12px,2vw,28px);font-style:italic">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">Door <strong style="color:#1a1a1a">${a}</strong> &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.75;color:#2a2a2a"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'folha', name: 'Folha de S.Paulo', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(6),p3=this.text(3),p4=this.text(6),p5=this.text(8),p6=this.text(10),p7=this.text(12),a=this.author(); return `<div style="font-family:'Lora','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#00693e;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2.5vw,28px);font-weight:900;color:#fff;letter-spacing:-0.01em">Folha de S.Paulo</div><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.7);display:flex;gap:clamp(6px,1vw,12px)"><span>Poder</span><span>Mercado</span><span>Mundo</span><span>Cotidiano</span></div></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,12px);text-transform:uppercase;letter-spacing:0.08em;color:#00693e;font-weight:700;margin-bottom:clamp(6px,1vw,12px)">Internacional</div><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-bottom:2px solid #00693e;padding-bottom:clamp(8px,1.2vw,14px)">${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'sueddeutsche', name: 'Süddeutsche Zeitung', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(7),p3=this.text(2),p4=this.text(5),p5=this.text(7),p6=this.text(9),p7=this.text(11),a=this.author(); return `<div style="font-family:'Lora',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#1a3667;padding:clamp(10px,1.8vw,20px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-size:clamp(14px,2.2vw,24px);font-weight:900;color:#fff;letter-spacing:0.03em">Süddeutsche Zeitung</div></div><div style="background:#f0ece4;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0"><span style="color:#1a3667;font-weight:700">Politik</span><span>Wirtschaft</span><span>Feuilleton</span><span>Wissen</span><span>Sport</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden;background:#fff"><div style="max-width:640px;width:100%"><h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">Von ${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'larepubblica', name: 'La Repubblica', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(0),p3=this.text(6),p4=this.text(9),p5=this.text(11),p6=this.text(13),p7=this.text(15),a=this.author(); return `<div style="font-family:'Crimson Pro','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#d4001e;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-family:'DM Sans',sans-serif;font-size:clamp(18px,3vw,34px);font-weight:900;color:#fff;letter-spacing:-0.01em">la Repubblica</div></div><div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0"><span style="color:#d4001e;font-weight:700">Esteri</span><span>Politica</span><span>Economia</span><span>Cultura</span><span>Tecnologia</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">Di ${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'globeandmail', name: 'The Globe and Mail', category: 'us_uk',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(3),p3=this.text(7),p4=this.text(10),p5=this.text(12),p6=this.text(14),p7=this.text(0),a=this.author(); return `<div style="font-family:'IBM Plex Serif',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#1a1a1a;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:flex-end;flex-shrink:0"><div style="font-family:'IBM Plex Serif',serif;font-size:clamp(14px,2.2vw,24px);font-weight:700;color:#fff;letter-spacing:0.02em">The Globe and Mail</div><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.5);display:flex;gap:clamp(6px,1vw,12px)"><span>Canada</span><span>World</span><span>Business</span><span>Opinion</span></div></div><div style="border-bottom:3px solid #c41230;flex-shrink:0"></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-left:3px solid #c41230;padding-left:clamp(6px,1vw,12px)">${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  { id: 'corriere', name: 'Corriere della Sera', category: 'classic',
    render(k) { const hl=this.headline(),p1=this.textWithKeyword(k),p2=this.text(4),p3=this.text(0),p4=this.text(3),p5=this.text(5),p6=this.text(7),p7=this.text(9),a=this.author(); return `<div style="font-family:'Cormorant Garamond','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column"><div style="background:#003366;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0"><div style="font-size:clamp(16px,2.8vw,32px);font-weight:700;color:#fff;letter-spacing:0.01em">Corriere della Sera</div></div><div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0"><span style="color:#003366;font-weight:700">Esteri</span><span>Politica</span><span>Economia</span><span>Cultura</span><span>Sport</span></div><div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden"><div style="max-width:660px;width:100%"><h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1><div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">Di ${a} &middot; ${this.date()}</div><div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333"><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p><p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p><p>${p3}</p><p>${p4}</p><p>${p5}</p><p>${p6}</p><p>${p7}</p></div></div></div></div>`; } },
  {
    id: 'liberation',
    name: 'Libération',
    category: 'tabloid',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(3);
      const p3 = this.text(6);
      const p4 = this.text(9);
      const p5 = this.text(11);
      const p6 = this.text(13);
      const p7 = this.text(15);
      const author = this.author();
      return `
      <div style="font-family:'Fraunces',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#000;padding:clamp(10px,2vw,24px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(20px,3.5vw,40px);font-weight:900;color:#fff;letter-spacing:-0.03em">libération</div>
        </div>
        <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:600;flex-shrink:0">
          <span style="color:#000;font-weight:800">Monde</span>
          <span>Politique</span><span>Société</span><span>Culture</span><span>Économie</span>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(18px,3vw,34px);font-weight:900;line-height:1.18;color:#000;margin-bottom:clamp(8px,1.5vw,20px);letter-spacing:-0.02em">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:2px solid #000">
              Par <strong style="color:#000">${author}</strong> &middot; ${this.date()}
            </div>
            <div style="font-family:Georgia,serif;font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'abc',
    name: 'ABC',
    category: 'tabloid',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(1);
      const p3 = this.text(4);
      const p4 = this.text(7);
      const p5 = this.text(9);
      const p6 = this.text(11);
      const p7 = this.text(13);
      const author = this.author();
      return `
      <div style="font-family:'DM Serif Display','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#c41230;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
          <div style="font-family:'DM Serif Display',serif;font-size:clamp(22px,4vw,44px);font-weight:900;color:#fff">ABC</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.7);display:flex;gap:clamp(6px,1vw,12px)">
            <span>Internacional</span><span>Opinión</span><span>Economía</span>
          </div>
        </div>
        <div style="background:#00387e;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.8);font-weight:500;flex-shrink:0">
          <span>España</span><span>Mundo</span><span>Sociedad</span><span>Cultura</span><span>Deportes</span>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-bottom:1px solid #e5e5e5;padding-bottom:clamp(8px,1.2vw,14px)">
              ${author} &middot; ${this.date()}
            </div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'diewelt',
    name: 'Die Welt',
    category: 'classic',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(5);
      const p3 = this.text(2);
      const p4 = this.text(5);
      const p5 = this.text(7);
      const p6 = this.text(9);
      const p7 = this.text(11);
      const author = this.author();
      return `
      <div style="font-family:'Roboto Slab',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#fff;border-bottom:2px solid #003d7a;padding:clamp(10px,2vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(16px,2.8vw,30px);font-weight:900;color:#003d7a;letter-spacing:-0.01em">DIE WELT</div>
          <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#666;font-weight:500;margin-top:clamp(2px,0.4vw,6px)">
            <span style="color:#003d7a;font-weight:700">Politik</span>
            <span>Wirtschaft</span><span>Panorama</span><span>Sport</span>
          </div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-top:1px solid #003d7a;padding-top:clamp(8px,1.2vw,14px)">
              Von <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
            </div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'irishtimes',
    name: 'The Irish Times',
    category: 'us_uk',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(7);
      const p3 = this.text(0);
      const p4 = this.text(3);
      const p5 = this.text(5);
      const p6 = this.text(7);
      const p7 = this.text(9);
      const author = this.author();
      return `
      <div style="font-family:'Lora','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#1a5632;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
          <div style="font-family:'Lora',serif;font-size:clamp(14px,2.2vw,24px);font-weight:700;color:#fff;font-style:italic">The Irish Times</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.6);display:flex;gap:clamp(6px,1vw,12px)">
            <span>News</span><span>Politics</span><span>Business</span><span>Culture</span>
          </div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-left:3px solid #1a5632;padding-left:clamp(6px,1vw,12px)">
              ${author} &middot; ${this.date()}
            </div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'clarin',
    name: 'Clarín',
    category: 'tabloid',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(2);
      const p3 = this.text(5);
      const p4 = this.text(8);
      const p5 = this.text(10);
      const p6 = this.text(12);
      const p7 = this.text(14);
      const author = this.author();
      return `
      <div style="font-family:'DM Serif Display','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#0d47a1;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(18px,3.2vw,36px);font-weight:900;color:#fff;letter-spacing:-0.02em">Clarín</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.6);display:flex;gap:clamp(6px,1vw,12px)">
            <span>País</span><span>Economía</span><span>Sociedad</span><span>El Mundo</span>
          </div>
        </div>
        <div style="border-bottom:3px solid #d32f2f;flex-shrink:0"></div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">
              Por <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
            </div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'destandaard',
    name: 'De Standaard',
    category: 'magazine',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(4);
      const p3 = this.text(1);
      const p4 = this.text(4);
      const p5 = this.text(6);
      const p6 = this.text(8);
      const p7 = this.text(10);
      const author = this.author();
      return `
      <div style="font-family:'Instrument Serif',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#fff;border-bottom:1px solid #e0dcd0;padding:clamp(10px,2vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(18px,3vw,34px);font-weight:800;color:#1a1a1a;letter-spacing:-0.02em">De Standaard</div>
          <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#888;font-weight:500;margin-top:clamp(2px,0.4vw,6px)">
            <span style="color:#c41230;font-weight:700">Nieuws</span>
            <span>Binnenland</span><span>Buitenland</span><span>Cultuur</span>
          </div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:640px;width:100%">
            <h1 style="font-size:clamp(18px,3.5vw,40px);font-weight:400;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(12px,2vw,28px);font-style:italic">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">
              Door <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
            </div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.75;color:#2a2a2a">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'scmp',
    name: 'South China Morning Post',
    category: 'tech',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(0);
      const p3 = this.text(3);
      const p4 = this.text(6);
      const p5 = this.text(8);
      const p6 = this.text(10);
      const p7 = this.text(12);
      const author = this.author();
      return `
      <div style="font-family:'Cormorant Garamond',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(10px,1.5vw,18px);font-weight:800;color:#e85d26;letter-spacing:0.02em;text-transform:uppercase">South China Morning Post</div>
          <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#888;display:flex;gap:clamp(6px,1vw,12px)">
            <span>Hong Kong</span><span>China</span><span>Asia</span><span>World</span>
          </div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,12px);text-transform:uppercase;letter-spacing:0.08em;color:#e85d26;font-weight:700;margin-bottom:clamp(6px,1vw,12px)">China</div>
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-bottom:1px solid #e5e5e5;padding-bottom:clamp(8px,1.2vw,14px)">
              ${author} &middot; ${this.date()}
            </div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'dagensnyheter',
    name: 'Dagens Nyheter',
    category: 'magazine',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(6);
      const p3 = this.text(2);
      const p4 = this.text(5);
      const p5 = this.text(7);
      const p6 = this.text(9);
      const p7 = this.text(11);
      const author = this.author();
      return `
      <div style="font-family:'Outfit',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#1a1a2e;padding:clamp(10px,2vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(18px,3vw,34px);font-weight:900;color:#fff;letter-spacing:-0.02em">Dagens Nyheter</div>
          <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.5);font-weight:500;margin-top:clamp(2px,0.4vw,6px)">
            <span style="color:#fff;font-weight:700">Nyheter</span>
            <span>Ledare</span><span>Kultur</span><span>Sport</span>
          </div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,3vw,34px);font-weight:900;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px);letter-spacing:-0.02em">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-bottom:2px solid #1a1a2e;padding-bottom:clamp(8px,1.2vw,14px)">
              <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
            </div>
            <div style="font-family:Georgia,serif;font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    category: 'tech',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(1);
      const p3 = this.text(4);
      const p4 = this.text(7);
      const p5 = this.text(2);
      const p6 = this.text(9);
      const p7 = this.text(5);
      const author = this.author();
      return `
      <div style="font-family:'Work Sans',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#0a9e01;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(18px,3vw,34px);font-weight:800;color:#fff;letter-spacing:-0.02em">TechCrunch</div>
        </div>
        <div style="background:#f4f4f4;border-bottom:1px solid #ddd;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:600;flex-shrink:0">
          <span style="color:#0a9e01">Startups</span><span>AI</span><span>Venture</span><span>Apps</span><span>Crypto</span>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:800;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,18px);letter-spacing:-0.02em">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">${author} &middot; ${this.date()}</div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'wired',
    name: 'WIRED',
    category: 'tech',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(3);
      const p3 = this.text(6);
      const p4 = this.text(0);
      const p5 = this.text(9);
      const p6 = this.text(2);
      const p7 = this.text(11);
      const author = this.author();
      return `
      <div style="font-family:'Space Grotesk',system-ui,sans-serif;background:#000;height:100%;display:flex;flex-direction:column">
        <div style="background:#000;border-bottom:2px solid #fff;padding:clamp(10px,2vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(20px,3.5vw,40px);font-weight:700;color:#fff;letter-spacing:0.15em">WIRED</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#fff;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">By <strong style="color:#fff">${author}</strong> &middot; ${this.date()}</div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#ccc">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'arstechnica',
    name: 'Ars Technica',
    category: 'tech',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(5);
      const p3 = this.text(1);
      const p4 = this.text(8);
      const p5 = this.text(3);
      const p6 = this.text(10);
      const p7 = this.text(7);
      const author = this.author();
      return `
      <div style="font-family:'Libre Franklin',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#d44232;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(14px,2.2vw,24px);font-weight:900;color:#fff;letter-spacing:0.05em">ars TECHNICA</div>
        </div>
        <div style="background:#f5f5f5;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:600;flex-shrink:0">
          <span style="color:#d44232">Tech</span><span>Science</span><span>Policy</span><span>Cars</span>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:800;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">${author} &middot; ${this.date()}</div>
            <div style="font-family:Georgia,serif;font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'zeitmagazine',
    name: 'ZEIT Magazin',
    category: 'magazine',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(2);
      const p3 = this.text(6);
      const p4 = this.text(0);
      const p5 = this.text(10);
      const p6 = this.text(4);
      const p7 = this.text(8);
      const author = this.author();
      return `
      <div style="font-family:'EB Garamond',Georgia,serif;background:#fdfcf8;height:100%;display:flex;flex-direction:column">
        <div style="border-bottom:1px solid #ddd;padding:clamp(14px,3vw,40px) clamp(16px,5vw,80px);flex-shrink:0">
          <div style="font-size:clamp(10px,1.5vw,18px);font-weight:400;color:#333;letter-spacing:0.2em;text-transform:uppercase">ZEIT Magazin</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(20px,5vw,70px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:580px;width:100%">
            <h1 style="font-size:clamp(22px,4vw,46px);font-weight:400;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(14px,3vw,36px);font-style:italic">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">Von <strong style="color:#1a1a1a">${author}</strong></div>
            <div style="font-size:clamp(10px,1.4vw,18px);line-height:1.8;color:#2a2a2a">
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p1}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p2}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p3}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p4}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p5}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'newyorker',
    name: 'The New Yorker',
    category: 'magazine',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(4);
      const p3 = this.text(1);
      const p4 = this.text(7);
      const p5 = this.text(3);
      const p6 = this.text(9);
      const p7 = this.text(6);
      const author = this.author();
      return `
      <div style="font-family:'Libre Baskerville',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="padding:clamp(14px,3vw,40px) clamp(16px,5vw,80px);text-align:center;border-bottom:1px solid #e5e5e5;flex-shrink:0">
          <div style="font-size:clamp(14px,2.5vw,28px);font-style:italic;color:#111;letter-spacing:0.05em">The New Yorker</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(20px,5vw,70px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:580px;width:100%">
            <h1 style="font-size:clamp(18px,3.5vw,38px);font-weight:400;line-height:1.25;color:#111;margin-bottom:clamp(14px,3vw,36px);font-style:italic">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-top:1px solid #ccc;padding-top:clamp(8px,1.2vw,14px)">By ${author} &middot; ${this.date()}</div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.85;color:#333">
              <p style="margin-bottom:clamp(8px,1.5vw,20px);text-indent:2em">${p1}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px);text-indent:2em">${p2}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px);text-indent:2em">${p3}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px);text-indent:2em">${p4}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px);text-indent:2em">${p5}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px);text-indent:2em">${p6}</p>
              <p style="text-indent:2em">${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'econtwitter',
    name: 'Economist-style',
    category: 'magazine',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(3);
      const p3 = this.text(7);
      const p4 = this.text(0);
      const p5 = this.text(11);
      const p6 = this.text(5);
      const p7 = this.text(9);
      return `
      <div style="font-family:'Bitter',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#e3120b;padding:clamp(10px,2vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(14px,2.5vw,28px);font-weight:900;color:#fff;letter-spacing:0.02em">THE ECONOMIST</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:640px;width:100%">
            <h1 style="font-size:clamp(18px,3vw,34px);font-weight:900;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'buzzfeed',
    name: 'BuzzFeed News',
    category: 'tabloid',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(2);
      const p3 = this.text(5);
      const p4 = this.text(8);
      const p5 = this.text(1);
      const p6 = this.text(10);
      const p7 = this.text(4);
      const author = this.author();
      return `
      <div style="font-family:'DM Sans',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column">
        <div style="background:#ee3322;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(18px,3.2vw,36px);font-weight:900;color:#fff;letter-spacing:-0.01em">BuzzFeed News</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(18px,3vw,34px);font-weight:900;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px)">By <strong>${author}</strong> &middot; ${this.date()}</div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'brutalist',
    name: 'Brutalist Web',
    category: 'bold',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(3);
      const p3 = this.text(7);
      const p4 = this.text(0);
      const p5 = this.text(9);
      const p6 = this.text(5);
      const p7 = this.text(2);
      const author = this.author();
      return `
      <div style="font-family:'Oswald',Impact,sans-serif;background:#fff;border:4px solid #000;height:100%;display:flex;flex-direction:column">
        <div style="background:#000;padding:clamp(10px,2vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
          <div style="font-size:clamp(20px,4vw,48px);font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase">BRUTALIST</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(20px,4vw,44px);font-weight:700;line-height:1.1;color:#000;margin-bottom:clamp(10px,2vw,24px);text-transform:uppercase;letter-spacing:0.02em">${hl}</h1>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px)">${author} &middot; ${this.date()}</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#222">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'meridian',
    name: 'Meridian Bold',
    category: 'bold',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(1);
      const p3 = this.text(6);
      const p4 = this.text(4);
      const p5 = this.text(8);
      const p6 = this.text(11);
      const p7 = this.text(3);
      return `
      <div style="font-family:'Merriweather',Georgia,serif;background:#1a1a2e;height:100%;display:flex;flex-direction:column">
        <div style="padding:clamp(14px,3vw,40px) clamp(16px,5vw,80px);flex-shrink:0">
          <div style="font-size:clamp(12px,2vw,22px);font-weight:900;color:#e94560;letter-spacing:0.1em">MERIDIAN</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(10px,2vw,30px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:640px;width:100%">
            <h1 style="font-size:clamp(18px,3.5vw,40px);font-weight:900;line-height:1.2;color:#fff;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.8;color:#c4c4d4">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    category: 'tech',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(3);
      const p3 = this.text(7);
      const p4 = this.text(1);
      const p5 = this.text(9);
      const p6 = this.text(5);
      const p7 = this.text(11);
      const author = this.author();
      return `
      <div style="font-family:Verdana,Geneva,sans-serif;background:#f6f6ef;height:100%;display:flex;flex-direction:column">
        <div style="background:#ff6600;padding:clamp(4px,0.8vw,10px) clamp(10px,2vw,24px);flex-shrink:0">
          <div style="font-size:clamp(12px,1.8vw,20px);font-weight:700;color:#000">Y Hacker News</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <h1 style="font-size:clamp(14px,2.2vw,24px);font-weight:400;line-height:1.4;color:#000;margin-bottom:clamp(6px,1.2vw,14px)">${hl}</h1>
            <div style="font-size:clamp(7px,0.8vw,11px);color:#828282;margin-bottom:clamp(10px,2vw,24px)">${author} &middot; ${this.date()} &middot; 142 points</div>
            <div style="font-size:clamp(9px,1.1vw,14px);line-height:1.65;color:#333">
              <p style="margin-bottom:clamp(4px,1vw,14px)">${p1}</p>
              <p style="margin-bottom:clamp(4px,1vw,14px)">${p2}</p>
              <p style="margin-bottom:clamp(4px,1vw,14px)">${p3}</p>
              <p style="margin-bottom:clamp(4px,1vw,14px)">${p4}</p>
              <p style="margin-bottom:clamp(4px,1vw,14px)">${p5}</p>
              <p style="margin-bottom:clamp(4px,1vw,14px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'renaissance',
    name: 'Renaissance Press',
    category: 'bold',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(2);
      const p3 = this.text(6);
      const p4 = this.text(0);
      const p5 = this.text(10);
      const p6 = this.text(4);
      const p7 = this.text(8);
      return `
      <div style="font-family:'Fraunces',Georgia,serif;background:#faf8f0;height:100%;display:flex;flex-direction:column">
        <div style="text-align:center;padding:clamp(16px,3.5vw,50px) clamp(16px,5vw,80px) clamp(6px,1.2vw,16px);border-bottom:3px double #2a1810;flex-shrink:0">
          <div style="font-size:clamp(8px,1.2vw,14px);letter-spacing:0.3em;color:#8a7a6a;text-transform:uppercase">Est. MMXXIV</div>
          <div style="font-size:clamp(20px,4vw,48px);font-weight:900;color:#2a1810;line-height:1.1">Renaissance Press</div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:600px;width:100%">
            <h1 style="font-size:clamp(18px,3.2vw,36px);font-weight:900;line-height:1.15;color:#2a1810;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
            <div style="width:60px;height:2px;background:#c4a87c;margin-bottom:clamp(10px,2vw,24px)"></div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.8;color:#3a3020">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'terminal',
    name: 'Terminal / CLI',
    category: 'bold',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(4);
      const p3 = this.text(1);
      const p4 = this.text(7);
      const p5 = this.text(3);
      const p6 = this.text(9);
      const p7 = this.text(6);
      const author = this.author();
      return `
      <div style="font-family:'JetBrains Mono','Courier New',monospace;background:#0d1117;height:100%;display:flex;flex-direction:column">
        <div style="background:#161b22;border-bottom:1px solid #30363d;padding:clamp(6px,1vw,12px) clamp(12px,2.5vw,32px);flex-shrink:0">
          <div style="font-size:clamp(10px,1.4vw,16px);color:#58a6ff;font-weight:600">$ news --read latest <span style="color:#8b949e">|</span> <span style="color:#7ee787">head</span></div>
        </div>
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
          <div style="max-width:660px;width:100%">
            <div style="font-size:clamp(7px,0.85vw,12px);color:#8b949e;margin-bottom:clamp(6px,1vw,12px)">${this.date()} &mdash; ${author}</div>
            <h1 style="font-size:clamp(16px,2.6vw,28px);font-weight:700;line-height:1.3;color:#c9d1d9;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
            <div style="font-size:clamp(9px,1.2vw,15px);line-height:1.8;color:#8b949e">
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p3}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p4}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p5}</p>
              <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
  {
    id: 'paper',
    name: 'Paper Minimal',
    category: 'bold',
    render(k) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(k);
      const p2 = this.text(5);
      const p3 = this.text(2);
      const p4 = this.text(8);
      const p5 = this.text(0);
      const p6 = this.text(11);
      const p7 = this.text(4);
      const author = this.author();
      return `
      <div style="font-family:'Sora',system-ui,sans-serif;background:#fafafa;height:100%;display:flex;flex-direction:column">
        <div style="flex:1;display:flex;justify-content:center;padding:clamp(30px,6vw,90px) clamp(20px,6vw,100px);overflow:hidden">
          <div style="max-width:520px;width:100%">
            <div style="font-size:clamp(7px,0.8vw,10px);letter-spacing:0.15em;color:#aaa;text-transform:uppercase;margin-bottom:clamp(14px,3vw,40px)">${this.date()}</div>
            <h1 style="font-size:clamp(20px,4vw,44px);font-weight:800;line-height:1.15;color:#111;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
            <div style="font-size:clamp(7px,0.85vw,11px);color:#999;margin-bottom:clamp(14px,3vw,36px)">${author}</div>
            <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.85;color:#444">
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p1}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p2}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p3}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p4}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p5}</p>
              <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p6}</p>
              <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
  },
];

module.exports = { LOREM_HEADLINES, LOREM_PARAGRAPHS, LOREM_AUTHORS, TEMPLATES, makeHelpers, shuffleArray, insertKeyword };
