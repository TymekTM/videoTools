const RESOLUTIONS = {
  '16:9': { '720p': [1280, 720], '1080p': [1920, 1080], '4K': [3840, 2160] },
  '9:16': { '720p': [720, 1280], '1080p': [1080, 1920], '4K': [2160, 3840] },
  '1:1':  { '720p': [720, 720],  '1080p': [1080, 1080], '4K': [2160, 2160] }
};

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
  'Nisi vitae suscipit tellus mauris a diam maecenas sed enim'
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
  'Amet consectetur adipiscing elit pellentesque habitant morbi. Tristique senectus et netus et malesuada fames. Nunc pulvinar elementum integer enim neque volutpat ac tincidunt vitae. Porttitor lacus luctus accumsan tortor posuere.'
];

const LOREM_AUTHORS = [
  'A. Kowalski', 'M. Nowak', 'J. Wiśniewski', 'K. Wójcik',
  'P. Kamiński', 'T. Lewandowski', 'B. Zieliński', 'R. Szymański',
  'Staff Reporter', 'Senior Editor', 'Special Correspondent'
];

const TEMPLATES = [
  {
    id: 'nyt',
    name: 'New York Times',
    flag: '\u{1F1FA}\u{1F1F8}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(0);
      const p3 = this.text(2);
      const p4 = this.text(5);
      const p5 = this.text(7);
      const p6 = this.text(9);
      const p7 = this.text(11);
      const author = this.author();
      return `
        <div style="font-family:'Playfair Display',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#fff;border-bottom:1px solid #e2e2e2;padding:8px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div style="font-size:clamp(14px,2vw,22px);font-weight:900;letter-spacing:-0.02em;color:#121212">The New York Times</div>
            <div style="display:flex;gap:clamp(6px,1vw,14px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.9vw,11px);color:#666;font-weight:500">
              <span>U.S.</span><span>World</span><span>Business</span><span>Arts</span><span>Opinion</span>
            </div>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(12px,3vw,40px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:680px;width:100%">
              <div style="font-size:clamp(9px,1vw,13px);text-transform:uppercase;letter-spacing:0.08em;color:#666;font-family:'DM Sans',sans-serif;font-weight:600;margin-bottom:clamp(4px,0.8vw,10px)">World News</div>
              <h1 style="font-size:clamp(16px,3vw,36px);font-weight:900;line-height:1.12;letter-spacing:-0.02em;color:#121212;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1>
              <div style="font-size:clamp(7px,0.85vw,12px);color:#999;font-family:'DM Sans',sans-serif;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:1px solid #e2e2e2">By ${author} &middot; ${this.date()}</div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.7;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    flag: '\u{1F1EC}\u{1F1E7}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(3);
      const p3 = this.text(5);
      const p4 = this.text(8);
      const p5 = this.text(10);
      const p6 = this.text(12);
      const p7 = this.text(14);
      const author = this.author();
      return `
        <div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#052962;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(16px,2.5vw,32px);font-weight:900;color:#fff;letter-spacing:-0.01em">The Guardian</div>
            <div style="display:flex;gap:clamp(6px,1vw,14px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.7);font-weight:500;margin-top:clamp(2px,0.4vw,6px)">
              <span>Headlines</span><span>UK</span><span>World</span><span>Culture</span><span>Lifestyle</span>
            </div>
          </div>
          <div style="background:#fff;padding:clamp(2px,0.3vw,4px) clamp(12px,3vw,40px);font-family:'DM Sans',sans-serif;font-size:clamp(6px,0.7vw,10px);color:#052962;border-bottom:2px solid #052962;flex-shrink:0">
            <span style="font-weight:700">News</span> &nbsp; Opinion &nbsp; Sport &nbsp; Culture &nbsp; Lifestyle
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(12px,3vw,40px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:700px;width:100%">
              <h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.15;color:#121212;margin-bottom:clamp(8px,1.5vw,18px);font-style:italic">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#333;font-weight:500;border-left:3px solid #052962;padding-left:clamp(6px,1vw,12px);margin-bottom:clamp(10px,2vw,24px)">
                ${author}<br><span style="color:#666;font-weight:400">${this.date()}</span>
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.7;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'lemonde',
    name: 'Le Monde',
    flag: '\u{1F1EB}\u{1F1F7}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(1);
      const p3 = this.text(4);
      const p4 = this.text(7);
      const p5 = this.text(9);
      const p6 = this.text(11);
      const p7 = this.text(13);
      const author = this.author();
      return `
        <div style="font-family:'Cormorant Garamond',Georgia,serif;background:#f7f5f0;height:100%;display:flex;flex-direction:column">
          <div style="background:#fff;border-bottom:1px solid #d4d0c8;padding:clamp(8px,1.5vw,18px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div style="font-size:clamp(18px,3vw,38px);font-weight:900;color:#000;letter-spacing:-0.01em">Le Monde</div>
            <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500">
              <span>International</span><span>Politique</span><span>Culture</span><span>Idées</span>
            </div>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:650px;width:100%">
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,13px);text-transform:uppercase;letter-spacing:0.1em;color:#999;font-weight:600;margin-bottom:clamp(6px,1vw,14px)">International</div>
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:900;line-height:1.15;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:1px solid #d4d0c8">
                Par <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.75;color:#2a2a2a">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'spiegel',
    name: 'Der Spiegel',
    flag: '\u{1F1E9}\u{1F1EA}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(6);
      const p3 = this.text(0);
      const p4 = this.text(3);
      const p5 = this.text(5);
      const p6 = this.text(7);
      const p7 = this.text(9);
      const author = this.author();
      return `
        <div style="font-family:'Sora',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#E64415;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-size:clamp(18px,3vw,36px);font-weight:700;color:#fff;letter-spacing:0.04em;text-transform:uppercase">DER SPIEGEL</div>
          </div>
          <div style="background:#f2f2f2;border-bottom:1px solid #ddd;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'IBM Plex Mono',monospace;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0">
            <span style="color:#E64415;font-weight:700">Schlagzeilen</span>
            <span>Politik</span><span>Wirtschaft</span><span>Kultur</span><span>Netzwelt</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:680px;width:100%">
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:3px solid #E64415">
                Von <strong>${author}</strong> &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'verge',
    name: 'The Verge',
    flag: '\u{1F1FA}\u{1F1F8}',
    category: 'tech',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(7);
      const p3 = this.text(2);
      const p4 = this.text(5);
      const p5 = this.text(7);
      const p6 = this.text(9);
      const p7 = this.text(11);
      const author = this.author();
      return `
        <div style="font-family:'Outfit',system-ui,sans-serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#000;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-size:clamp(16px,2.5vw,30px);font-weight:900;color:#fff;letter-spacing:-0.02em">The Verge</div>
          </div>
          <div style="background:#f5f5f5;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-size:clamp(7px,0.85vw,12px);color:#555;font-weight:600;flex-shrink:0">
            <span style="color:#E5127D">Tech</span>
            <span>Science</span><span>Entertainment</span><span>AI</span><span>Reviews</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:700px;width:100%">
              <div style="font-size:clamp(8px,1vw,13px);text-transform:uppercase;letter-spacing:0.08em;color:#E5127D;font-weight:700;margin-bottom:clamp(6px,1vw,14px)">Technology</div>
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:900;line-height:1.15;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px);letter-spacing:-0.02em">${hl}</h1>
              <div style="font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);display:flex;align-items:center;gap:8px">
                <span style="font-weight:700;color:#1a1a1a">${author}</span>
                <span>&middot;</span>
                <span>${this.date()}</span>
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#3a3a3a">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'medium',
    name: 'Medium',
    flag: '\u{1F1FA}\u{1F1F8}',
    category: 'tech',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(4);
      const p3 = this.text(7);
      const p4 = this.text(10);
      const p5 = this.text(12);
      const p6 = this.text(14);
      const p7 = this.text(0);
      const author = this.author();
      return `
        <div style="font-family:'Source Serif 4',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#fff;border-bottom:1px solid #f0f0f0;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2vw,24px);font-weight:800;color:#000;letter-spacing:-0.02em">Medium</div>
            <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#757575;font-weight:500">
              <span>Our Story</span><span>Membership</span><span>Careers</span>
            </div>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(20px,5vw,70px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:680px;width:100%">
              <div style="display:flex;align-items:center;gap:clamp(6px,1vw,12px);margin-bottom:clamp(12px,2vw,28px)">
                <div style="width:clamp(24px,3vw,40px);height:clamp(24px,3vw,40px);border-radius:50%;background:#e0e0e0;flex-shrink:0"></div>
                <div>
                  <div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,13px);font-weight:700;color:#000">${author}</div>
                  <div style="font-family:'DM Sans',sans-serif;font-size:clamp(6px,0.7vw,10px);color:#757575">${this.date()}</div>
                </div>
              </div>
              <h1 style="font-size:clamp(18px,3.5vw,40px);font-weight:700;line-height:1.2;color:#1a1a1a;margin-bottom:clamp(12px,2vw,28px);letter-spacing:-0.02em">${hl}</h1>
              <div style="font-size:clamp(10px,1.5vw,18px);line-height:1.78;color:#242424">
                <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p1}</p>
                <p style="margin-bottom:clamp(8px,1.5vw,20px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'elpais',
    name: 'El País',
    flag: '\u{1F1EA}\u{1F1F8}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(5);
      const p3 = this.text(1);
      const p4 = this.text(4);
      const p5 = this.text(6);
      const p6 = this.text(8);
      const p7 = this.text(10);
      const author = this.author();
      return `
        <div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#004481;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-size:clamp(20px,3.2vw,38px);font-weight:900;color:#fff;letter-spacing:0.02em">EL PAÍS</div>
          </div>
          <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:600;flex-shrink:0">
            <span style="color:#004481;font-weight:700">Internacional</span>
            <span>Opinión</span><span>Economía</span><span>Cultura</span><span>Sociedad</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.5vw,16px);border-bottom:1px solid #e5e5e5">
                ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#2a2a2a">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    flag: '\u{1F30D}',
    category: 'tech',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(0);
      const p3 = this.text(3);
      const p4 = this.text(6);
      const p5 = this.text(8);
      const p6 = this.text(10);
      const p7 = this.text(12);
      return `
        <div style="font-family:'JetBrains Mono',Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#fff;border-bottom:1px solid #a7d7f9;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-family:'JetBrains Mono',serif;font-size:clamp(14px,2.2vw,26px);font-weight:normal;color:#000;font-style:italic">Wikipedia</div>
              <div style="font-family:sans-serif;font-size:clamp(6px,0.7vw,10px);color:#54595d;display:flex;gap:clamp(6px,1vw,14px)">
                <span>Discussion</span><span>Read</span><span>Edit</span><span>History</span>
              </div>
            </div>
          </div>
          <div style="flex:1;display:flex;overflow:hidden">
            <div style="width:clamp(100px,15vw,220px);background:#f8f9fa;border-right:1px solid #a7d7f9;padding:clamp(8px,1.5vw,20px) clamp(6px,1vw,14px);flex-shrink:0;font-family:sans-serif;font-size:clamp(6px,0.75vw,11px);color:#202122">
              <div style="font-weight:700;margin-bottom:clamp(4px,0.8vw,10px);font-size:clamp(7px,0.9vw,13px)">Contents</div>
              <div style="margin-bottom:4px;padding-left:8px;color:#0645ad">1 History</div>
              <div style="margin-bottom:4px;padding-left:8px;color:#0645ad">2 Geography</div>
              <div style="margin-bottom:4px;padding-left:8px;color:#0645ad">3 Demographics</div>
              <div style="margin-bottom:4px;padding-left:8px;color:#0645ad">4 Economy</div>
              <div style="margin-bottom:4px;padding-left:8px;color:#0645ad">5 Culture</div>
              <div style="margin-bottom:4px;padding-left:8px;color:#0645ad">6 See also</div>
            </div>
            <div style="flex:1;padding:clamp(14px,3vw,50px) clamp(16px,4vw,60px);overflow:hidden">
              <h1 style="font-size:clamp(16px,3vw,34px);font-weight:normal;color:#000;border-bottom:1px solid #a2a9b1;padding-bottom:clamp(4px,0.8vw,10px);margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
              <div style="font-size:clamp(9px,1.3vw,15px);line-height:1.7;color:#202122">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'washingtonpost',
    name: 'Washington Post',
    flag: '\u{1F1FA}\u{1F1F8}',
    category: 'us_uk',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(0);
      const p3 = this.text(5);
      const p4 = this.text(8);
      const p5 = this.text(10);
      const p6 = this.text(12);
      const p7 = this.text(14);
      const author = this.author();
      return `
        <div style="font-family:'Source Serif 4',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#000;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(10px,1.5vw,18px);font-weight:800;color:#fff;letter-spacing:0.15em;text-transform:uppercase">The Washington Post</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.6);display:flex;gap:clamp(6px,1vw,12px)">
              <span>Politics</span><span>Opinions</span><span>Style</span>
            </div>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:680px;width:100%">
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,12px);text-transform:uppercase;letter-spacing:0.08em;color:#666;font-weight:600;margin-bottom:clamp(6px,1vw,12px)">Analysis</div>
              <h1 style="font-size:clamp(16px,3vw,36px);font-weight:700;line-height:1.15;color:#111;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,11px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-top:2px solid #000;padding-top:clamp(8px,1.2vw,14px)">
                By <strong>${author}</strong> &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.7;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'telegraph',
    name: 'The Telegraph',
    flag: '\u{1F1EC}\u{1F1E7}',
    category: 'us_uk',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(3);
      const p3 = this.text(6);
      const p4 = this.text(9);
      const p5 = this.text(11);
      const p6 = this.text(13);
      const p7 = this.text(15);
      const author = this.author();
      return `
        <div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#1b1b1b;padding:clamp(6px,1.2vw,14px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2.2vw,26px);font-weight:800;color:#fff;letter-spacing:-0.01em">The Telegraph</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.5);display:flex;gap:clamp(6px,1vw,12px)">
              <span>News</span><span>Finance</span><span>Sport</span><span>Culture</span>
            </div>
          </div>
          <div style="border-bottom:3px solid #c8102e;flex-shrink:0"></div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.15;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,18px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-left:3px solid #c8102e;padding-left:clamp(6px,1vw,12px)">
                ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#2a2a2a">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'zeit',
    name: 'Die Zeit',
    flag: '\u{1F1E9}\u{1F1EA}',
    category: 'magazine',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(1);
      const p3 = this.text(7);
      const p4 = this.text(10);
      const p5 = this.text(12);
      const p6 = this.text(14);
      const p7 = this.text(0);
      const author = this.author();
      return `
        <div style="font-family:'Crimson Pro',Georgia,serif;background:#f5f2eb;height:100%;display:flex;flex-direction:column">
          <div style="background:#262626;padding:clamp(10px,1.8vw,22px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-size:clamp(22px,4vw,44px);font-weight:900;color:#fff;letter-spacing:0.02em;line-height:1">DIE ZEIT</div>
          </div>
          <div style="background:#c4b896;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#262626;font-weight:600;flex-shrink:0">
            <span>Politik</span><span>Wirtschaft</span><span>Kultur</span><span>Wissen</span><span>Leben</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:640px;width:100%">
              <h1 style="font-size:clamp(18px,3.2vw,36px);font-weight:900;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(12px,2vw,28px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#555;margin-bottom:clamp(10px,2vw,24px);border-bottom:1px solid #c4b896;padding-bottom:clamp(8px,1.2vw,14px)">
                Von <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.75;color:#2a2a2a">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'corriere',
    name: 'Corriere della Sera',
    flag: '\u{1F1EE}\u{1F1F9}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(4);
      const p3 = this.text(0);
      const p4 = this.text(3);
      const p5 = this.text(5);
      const p6 = this.text(7);
      const p7 = this.text(9);
      const author = this.author();
      return `
        <div style="font-family:'Cormorant Garamond','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#003366;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-size:clamp(16px,2.8vw,32px);font-weight:700;color:#fff;letter-spacing:0.01em">Corriere della Sera</div>
          </div>
          <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0">
            <span style="color:#003366;font-weight:700">Esteri</span>
            <span>Politica</span><span>Economia</span><span>Cultura</span><span>Sport</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">
                Di ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'gazeta',
    name: 'Gazeta Wyborcza',
    flag: '\u{1F1F5}\u{1F1F1}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(2);
      const p3 = this.text(4);
      const p4 = this.text(7);
      const p5 = this.text(9);
      const p6 = this.text(11);
      const p7 = this.text(13);
      const author = this.author();
      return `
        <div style="font-family:Georgia,'Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#006633;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2.5vw,28px);font-weight:900;color:#fff;letter-spacing:-0.01em">GAZETA WYBORCZA</div>
          </div>
          <div style="background:#fff;border-bottom:1px solid #e0e0e0;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0">
            <span style="color:#006633;font-weight:700">Świat</span>
            <span>Polityka</span><span>Gospodarka</span><span>Kultura</span><span>Sport</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:2px solid #006633">
                ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'nrc',
    name: 'NRC Handelsblad',
    flag: '\u{1F1F3}\u{1F1F1}',
    category: 'magazine',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(5);
      const p3 = this.text(1);
      const p4 = this.text(4);
      const p5 = this.text(6);
      const p6 = this.text(8);
      const p7 = this.text(10);
      const author = this.author();
      return `
        <div style="font-family:'Instrument Serif',Georgia,serif;background:#f8f6f0;height:100%;display:flex;flex-direction:column">
          <div style="background:#fff;border-bottom:1px solid #e0dcd0;padding:clamp(8px,1.5vw,18px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(20px,3.5vw,40px);font-weight:800;color:#000;letter-spacing:-0.02em">NRC</div>
            <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#888;font-weight:500;margin-top:clamp(2px,0.4vw,6px)">
              <span>Binnenland</span><span>Buitenland</span><span>Economie</span><span>Cultuur</span>
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
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'folha',
    name: 'Folha de S.Paulo',
    flag: '\u{1F1E7}\u{1F1F7}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(6);
      const p3 = this.text(3);
      const p4 = this.text(6);
      const p5 = this.text(8);
      const p6 = this.text(10);
      const p7 = this.text(12);
      const author = this.author();
      return `
        <div style="font-family:'Lora','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#00693e;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(14px,2.5vw,28px);font-weight:900;color:#fff;letter-spacing:-0.01em">Folha de S.Paulo</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.7);display:flex;gap:clamp(6px,1vw,12px)">
              <span>Poder</span><span>Mercado</span><span>Mundo</span><span>Cotidiano</span>
            </div>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(8px,1vw,12px);text-transform:uppercase;letter-spacing:0.08em;color:#00693e;font-weight:700;margin-bottom:clamp(6px,1vw,12px)">Internacional</div>
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-bottom:2px solid #00693e;padding-bottom:clamp(8px,1.2vw,14px)">
                ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'sueddeutsche',
    name: 'Süddeutsche Zeitung',
    flag: '\u{1F1E9}\u{1F1EA}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(7);
      const p3 = this.text(2);
      const p4 = this.text(5);
      const p5 = this.text(7);
      const p6 = this.text(9);
      const p7 = this.text(11);
      const author = this.author();
      return `
        <div style="font-family:'Lora',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#1a3667;padding:clamp(10px,1.8vw,20px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-size:clamp(14px,2.2vw,24px);font-weight:900;color:#fff;letter-spacing:0.03em">Süddeutsche Zeitung</div>
          </div>
          <div style="background:#f0ece4;padding:clamp(3px,0.5vw,6px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0">
            <span style="color:#1a3667;font-weight:700">Politik</span>
            <span>Wirtschaft</span><span>Feuilleton</span><span>Wissen</span><span>Sport</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden;background:#fff">
            <div style="max-width:640px;width:100%">
              <h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">
                Von ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'larepubblica',
    name: 'La Repubblica',
    flag: '\u{1F1EE}\u{1F1F9}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(0);
      const p3 = this.text(6);
      const p4 = this.text(9);
      const p5 = this.text(11);
      const p6 = this.text(13);
      const p7 = this.text(15);
      const author = this.author();
      return `
        <div style="font-family:'Crimson Pro','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#d4001e;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(18px,3vw,34px);font-weight:900;color:#fff;letter-spacing:-0.01em">la Repubblica</div>
          </div>
          <div style="background:#fff;border-bottom:1px solid #e5e5e5;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0">
            <span style="color:#d4001e;font-weight:700">Esteri</span>
            <span>Politica</span><span>Economia</span><span>Cultura</span><span>Tecnologia</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);padding-bottom:clamp(8px,1.2vw,14px);border-bottom:1px solid #e5e5e5">
                Di ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'globeandmail',
    name: 'The Globe and Mail',
    flag: '\u{1F1E8}\u{1F1E6}',
    category: 'us_uk',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(3);
      const p3 = this.text(7);
      const p4 = this.text(10);
      const p5 = this.text(12);
      const p6 = this.text(14);
      const p7 = this.text(0);
      const author = this.author();
      return `
        <div style="font-family:'IBM Plex Serif',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#1a1a1a;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);display:flex;justify-content:space-between;align-items:flex-end;flex-shrink:0">
            <div style="font-family:'IBM Plex Serif',serif;font-size:clamp(14px,2.2vw,24px);font-weight:700;color:#fff;letter-spacing:0.02em">The Globe and Mail</div>
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:rgba(255,255,255,0.5);display:flex;gap:clamp(6px,1vw,12px)">
              <span>Canada</span><span>World</span><span>Business</span><span>Opinion</span>
            </div>
          </div>
          <div style="border-bottom:3px solid #c41230;flex-shrink:0"></div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#888;margin-bottom:clamp(10px,2vw,24px);border-left:3px solid #c41230;padding-left:clamp(6px,1vw,12px)">
                ${author} &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'politiken',
    name: 'Politiken',
    flag: '\u{1F1E9}\u{1F1F0}',
    category: 'tabloid',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(4);
      const p3 = this.text(1);
      const p4 = this.text(4);
      const p5 = this.text(6);
      const p6 = this.text(8);
      const p7 = this.text(10);
      const author = this.author();
      return `
        <div style="font-family:'IBM Plex Serif','Times New Roman',serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#d32f2f;padding:clamp(8px,1.5vw,16px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-family:'DM Sans',sans-serif;font-size:clamp(18px,3vw,34px);font-weight:900;color:#fff;letter-spacing:-0.01em">Politiken</div>
          </div>
          <div style="background:#f5f3ee;padding:clamp(4px,0.8vw,10px) clamp(12px,3vw,40px);display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#555;font-weight:500;flex-shrink:0">
            <span style="color:#d32f2f;font-weight:700">Udland</span>
            <span>Indland</span><span>Økonomi</span><span>Kultur</span><span>Sport</span>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(14px,3vw,50px) clamp(16px,5vw,80px);overflow:hidden;background:#fff">
            <div style="max-width:660px;width:100%">
              <h1 style="font-size:clamp(16px,2.8vw,32px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(8px,1.5vw,20px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-bottom:1px solid #e5e5e5;padding-bottom:clamp(8px,1.2vw,14px)">
                Af <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  },
  {
    id: 'frankenpost',
    name: 'Frankfurter Allgemeine',
    flag: '\u{1F1E9}\u{1F1EA}',
    category: 'classic',
    render(keyword) {
      const hl = this.headline();
      const p1 = this.textWithKeyword(keyword);
      const p2 = this.text(2);
      const p3 = this.text(5);
      const p4 = this.text(8);
      const p5 = this.text(10);
      const p6 = this.text(12);
      const p7 = this.text(14);
      const author = this.author();
      return `
        <div style="font-family:'Fraunces',Georgia,serif;background:#fff;height:100%;display:flex;flex-direction:column">
          <div style="background:#fff;border-bottom:1px solid #d4d0c8;padding:clamp(10px,2vw,24px) clamp(12px,3vw,40px);flex-shrink:0">
            <div style="font-family:'Fraunces',serif;font-size:clamp(12px,2vw,20px);font-weight:400;color:#1a3667;font-style:italic;letter-spacing:0.01em">Frankfurter Allgemeine</div>
            <div style="display:flex;gap:clamp(8px,1.2vw,16px);font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.8vw,11px);color:#666;font-weight:500;margin-top:clamp(2px,0.4vw,6px)">
              <span style="color:#1a3667;font-weight:700">Politik</span>
              <span>Wirtschaft</span><span>Feuilleton</span><span>Wissenschaft</span>
            </div>
          </div>
          <div style="flex:1;display:flex;justify-content:center;padding:clamp(16px,4vw,60px) clamp(16px,5vw,80px);overflow:hidden">
            <div style="max-width:640px;width:100%">
              <h1 style="font-size:clamp(16px,3vw,34px);font-weight:700;line-height:1.18;color:#1a1a1a;margin-bottom:clamp(10px,2vw,24px)">${hl}</h1>
              <div style="font-family:'DM Sans',sans-serif;font-size:clamp(7px,0.85vw,12px);color:#666;margin-bottom:clamp(10px,2vw,24px);border-top:1px solid #d4d0c8;padding-top:clamp(8px,1.2vw,14px)">
                Von <strong style="color:#1a1a1a">${author}</strong> &middot; ${this.date()}
              </div>
              <div style="font-size:clamp(9px,1.3vw,16px);line-height:1.72;color:#333">
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p1}</p>
                <p style="margin-bottom:clamp(6px,1.2vw,16px)">${p2}</p>
                <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
              </div>
            </div>
          </div>
        </div>`;
    }
  }
];

function getTemplateHelpers() {
  let usedHeadlines = new Set();
  let usedParagraphs = {};

  return {
    headline() {
      if (state.customHeadline) return state.customHeadline;
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
      if (state.customLead) return insertKeyword(state.customLead, keyword);
      const idx = Math.floor(Math.random() * LOREM_PARAGRAPHS.length);
      return insertKeyword(LOREM_PARAGRAPHS[idx], keyword);
    },
    author() {
      return LOREM_AUTHORS[Math.floor(Math.random() * LOREM_AUTHORS.length)];
    },
    date() {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[Math.floor(Math.random()*12)]} ${Math.floor(Math.random()*28)+1}, ${2023 + Math.floor(Math.random()*3)}`;
    }
  };
}

const TEMPLATES_EXTRA = [
{
  id: 'liberation',
  name: 'Libération',
  flag: '\u{1F1EB}\u{1F1F7}',
    category: 'tabloid',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1EA}\u{1F1F8}',
    category: 'tabloid',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1E9}\u{1F1EA}',
  category: 'classic',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1EE}\u{1F1EA}',
    category: 'us_uk',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1E6}\u{1F1F7}',
    category: 'tabloid',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1E7}\u{1F1EA}',
    category: 'magazine',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1ED}\u{1F1F0}',
    category: 'tech',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
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
  flag: '\u{1F1F8}\u{1F1EA}',
    category: 'magazine',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
              <p>${p3}</p>
                <p>${p4}</p>
                <p>${p5}</p>
                <p>${p6}</p>
                <p>${p7}</p>
            </div>
          </div>
        </div>
      </div>`;
  }
}
];

const TEMPLATES_NEW = [
{
  id: 'techcrunch',
  name: 'TechCrunch',
  flag: '\u{1F1FA}\u{1F1F8}',
  category: 'tech',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F1FA}\u{1F1F8}',
  category: 'tech',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F1FA}\u{1F1F8}',
  category: 'tech',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F1E9}\u{1F1EA}',
  category: 'magazine',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F1FA}\u{1F1F8}',
  category: 'magazine',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F1EC}\u{1F1E7}',
  category: 'magazine',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F1FA}\u{1F1F8}',
  category: 'tabloid',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F310}',
  category: 'bold',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F310}',
  category: 'bold',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
}
];

const TEMPLATES_MORE = [
{
  id: 'hackernews',
  name: 'Hacker News',
  flag: '\u{1F1FA}\u{1F1F8}',
  category: 'tech',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F3DB}',
  category: 'bold',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F4BB}',
  category: 'bold',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
  flag: '\u{1F4C3}',
  category: 'bold',
  render(keyword) {
    const hl = this.headline();
    const p1 = this.textWithKeyword(keyword);
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
}
];

TEMPLATES.push(...TEMPLATES_EXTRA, ...TEMPLATES_NEW, ...TEMPLATES_MORE);

const CATEGORIES = {
  classic: { label: 'Klasyczne gazety', icon: '\u{1F4F0}' },
  us_uk: { label: 'US / UK', icon: '\u{1F1EC}\u{1F1E7}' },
  magazine: { label: 'Magazyny', icon: '\u{1F4D6}' },
  tech: { label: 'Tech', icon: '\u{1F4BB}' },
  tabloid: { label: 'Tabloidy', icon: '\u{1F4C4}' },
  bold: { label: 'Bold / Eksperymentalne', icon: '\u{26A1}' }
};

function insertKeyword(text, keyword) {
  const words = text.split(/\s+/);
  const minIdx = Math.max(2, Math.floor(words.length * 0.15));
  const maxIdx = Math.min(words.length - 3, Math.floor(words.length * 0.85));
  const idx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx));
  words[idx] = `<span class="keyword-highlight">${keyword}</span>`;
  return words.join(' ');
}

const state = {
  keyword: 'SZTUKA',
  speed: 800,
  format: '16:9',
  resolution: '1080p',
  playing: false,
  currentIndex: 0,
  enabledTemplates: new Set(TEMPLATES.map(t => t.id)),
  timer: null,
  queue: [],
  helpers: getTemplateHelpers(),
  customHeadline: '',
  customLead: '',
  zoomLevel: 1.8,
  zoomOffsetX: 0,
  zoomOffsetY: 0,
  fontSizeScale: 100,
  lineH: 1.72,
  colorBg: '',
  colorText: '',
  colorAccent: '#facc15',
  vignetteOpacity: 55,
  transitionMs: 120
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function getResolution() {
  return RESOLUTIONS[state.format][state.resolution];
}

function updateVignette() {
  const o = state.vignetteOpacity / 100;
  const v = $('#vignette');
  if (o <= 0) { v.style.background = 'none'; return; }
  const steps = [
    [0.25, 0],
    [0.40, o * 0.22],
    [0.55, o * 0.45],
    [0.70, o * 0.65],
    [0.85, o * 0.82],
    [1.00, o]
  ];
  const stops = steps.map(([s, a]) => `rgba(0,0,0,${a.toFixed(2)}) ${Math.round(s*100)}%`).join(',');
  v.style.background = `radial-gradient(ellipse 50% 45% at 50% 50%, transparent 0%, ${stops})`;
}

function applyAccent() {
  let el = $('#accentStyle');
  if (!el) { el = document.createElement('style'); el.id = 'accentStyle'; document.head.appendChild(el); }
  const c = state.colorAccent;
  el.textContent = `.keyword-highlight{background:linear-gradient(120deg,${c}ee,${c})!important;box-shadow:0 0 20px ${c}66,0 0 60px ${c}26!important;animation:keywordPulse .8s ease-in-out infinite}.playing .keyword-highlight{animation:keywordPulse .5s ease-in-out infinite}`;
  const preview = $('#accentPreview');
  if (preview) {
    preview.style.background = `linear-gradient(120deg, ${c}ee, ${c})`;
    preview.style.boxShadow = `0 0 12px ${c}66`;
    preview.textContent = state.keyword;
  }
}

function buildQueue() {
  const enabled = TEMPLATES.filter(t => state.enabledTemplates.has(t.id));
  state.queue = shuffleArray([...enabled]);
  state.currentIndex = 0;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updatePreviewSize() {
  const [w, h] = getResolution();
  const area = $('[data-tool="newspaper"] .preview-area');
  if (!area) return;
  const areaW = area.clientWidth - 60;
  const areaH = area.clientHeight - 60;
  const scale = Math.min(areaW / w, areaH / h, 1);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const wrapper = $('#previewWrapper');
  wrapper.style.width = displayW + 'px';
  wrapper.style.height = displayH + 'px';
  wrapper.style.transform = `scale(1)`;
  wrapper.dataset.baseWidth = w;
  wrapper.dataset.baseHeight = h;

  const canvas = $('#previewCanvas');
  canvas.style.fontSize = Math.round(scale * 16) + 'px';

  $('#resolutionInfo').textContent = `${w} \u00d7 ${h}`;
}

function renderSlide(template) {
  state.helpers = getTemplateHelpers();
  const html = template.render.call(state.helpers, state.keyword);
  return html;
}

function showSlide(template, direction = 'next') {
  const canvas = $('#previewCanvas');
  const existing = canvas.querySelector('.article-slide.active');
  const slide = document.createElement('div');
  slide.className = 'article-slide';
  slide.style.transition = `opacity ${state.transitionMs}ms ease`;

  const helpers = getTemplateHelpers();
  const html = template.render.call(helpers, state.keyword);

  const bgMatch = html.match(/background:\s*(#[0-9a-fA-F]{3,8})/);
  if (bgMatch) slide.style.background = bgMatch[1];

  const overrides = [];
  if (state.colorBg) overrides.push(`background:${state.colorBg}!important`);
  if (state.colorText) overrides.push(`color:${state.colorText}!important`);
  if (state.fontSizeScale !== 100) overrides.push(`font-size:${state.fontSizeScale}%!important`);
  if (state.lineH !== 1.72) overrides.push(`line-height:${state.lineH}!important`);
  const overrideStyle = overrides.length ? `<style>.so *{${overrides.join(';')}}</style>` : '';

  slide.innerHTML = `
    ${overrideStyle}
    <div class="zoom-scroll" style="position:absolute;inset:0;overflow:hidden;">
      <div class="article-inner so" style="
        width:100%;
        height:100%;
        overflow:hidden;
        display:flex;
        flex-direction:column;
        transform:scale(${state.zoomLevel});
        transform-origin:0 0;
      ">${html}</div>
    </div>`;

  canvas.appendChild(slide);

  requestAnimationFrame(() => {
    const kwEl = slide.querySelector('.keyword-highlight');
    const scroller = slide.querySelector('.zoom-scroll');
    if (kwEl && scroller) {
      const sRect = scroller.getBoundingClientRect();
      const kRect = kwEl.getBoundingClientRect();
      const kCX = kRect.left + kRect.width / 2 - sRect.left;
      const kCY = kRect.top + kRect.height / 2 - sRect.top;
      const offX = sRect.width / 2 - kCX + state.zoomOffsetX;
      const offY = sRect.height / 2 - kCY + state.zoomOffsetY;
      const inner = slide.querySelector('.article-inner');
      inner.style.transform = `translate(${offX}px, ${offY}px) scale(${state.zoomLevel})`;
      inner.style.transformOrigin = '0 0';
    }
    slide.classList.add('active');
    if (existing) {
      existing.classList.remove('active');
      setTimeout(() => existing.remove(), state.transitionMs + 30);
    }
  });

  updateCounter();
}

function updateCounter() {
  const counter = $('#slideCounter');
  const total = state.queue.length;
  const current = total > 0 ? state.currentIndex + 1 : 0;
  counter.textContent = `${current} / ${total}`;
  counter.classList.toggle('playing', state.playing);
}

function nextSlide() {
  if (state.queue.length === 0) return;
  const template = state.queue[state.currentIndex];
  showSlide(template);
  state.currentIndex++;
  if (state.currentIndex >= state.queue.length) {
    buildQueue();
  }
}

function play() {
  if (state.playing) return;
  if (state.queue.length === 0) buildQueue();
  state.playing = true;
  $('#previewCanvas').classList.add('playing');
  nextSlide();
  state.timer = setInterval(nextSlide, state.speed);
  updatePlayButton();
}

function stop() {
  state.playing = false;
  clearInterval(state.timer);
  state.timer = null;
  state.currentIndex = 0;
  $('#previewCanvas').classList.remove('playing');
  const canvas = $('#previewCanvas');
  canvas.innerHTML = '';
  updateCounter();
  updatePlayButton();
}

function shuffle() {
  stop();
  buildQueue();
  nextSlide();
}

function updatePlayButton() {
  const btn = $('#btnPlay');
  if (state.playing) {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor"/></svg><span>Pause</span>`;
  } else {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="2,0 14,7 2,14" fill="currentColor"/></svg><span>Play</span>`;
  }
}

function buildTemplateToggles() {
  const container = $('#templateToggles');
  const grouped = {};
  for (const t of TEMPLATES) {
    const cat = t.category || 'classic';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }

  const catOrder = Object.keys(CATEGORIES);
  container.innerHTML = catOrder
    .filter(c => grouped[c])
    .map(catKey => {
      const cat = CATEGORIES[catKey];
      const templates = grouped[catKey];
      const checkedCount = templates.filter(t => state.enabledTemplates.has(t.id)).length;
      const allOn = checkedCount === templates.length;
      const items = templates.map(t => `
        <label class="template-toggle" data-cat="${catKey}">
          <input type="checkbox" value="${t.id}" ${state.enabledTemplates.has(t.id) ? 'checked' : ''}>
          <span class="template-toggle-label">
            <span class="template-toggle-flag">${t.flag}</span>
            ${t.name}
          </span>
        </label>
      `).join('');

      return `
        <div class="template-category collapsed" data-category="${catKey}">
          <div class="template-category-header">
            <span class="template-category-arrow">\u25BC</span>
            <span class="template-category-icon">${cat.icon}</span>
            <span class="template-category-title">${cat.label}</span>
            <input type="checkbox" class="template-category-toggle" data-cat-toggle="${catKey}" ${allOn ? 'checked' : ''}>
            <span class="template-category-count">${checkedCount}/${templates.length}</span>
          </div>
          <div class="template-category-items">${items}</div>
        </div>
      `;
    }).join('');

  container.querySelectorAll('.template-category-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.template-category-toggle')) return;
      header.parentElement.classList.toggle('collapsed');
    });
  });

  container.querySelectorAll('.template-category-toggle').forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const catKey = cb.dataset.catToggle;
      const category = container.querySelector(`.template-category[data-category="${catKey}"]`);
      const checkboxes = category.querySelectorAll('.template-category-items input[type="checkbox"]');
      checkboxes.forEach(c => {
        c.checked = cb.checked;
        if (c.checked) state.enabledTemplates.add(c.value);
        else state.enabledTemplates.delete(c.value);
      });
      refreshCategoryCounts();
      if (state.playing) { stop(); buildQueue(); }
    });
  });

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.enabledTemplates.add(cb.value);
      else state.enabledTemplates.delete(cb.value);
      refreshCategoryCounts();
      if (state.playing) { stop(); buildQueue(); }
    });
  });
}

function refreshCategoryCounts() {
  const container = $('#templateToggles');
  container.querySelectorAll('.template-category').forEach(cat => {
    const checkboxes = cat.querySelectorAll('.template-category-items input[type="checkbox"]');
    const checkedCount = [...checkboxes].filter(cb => cb.checked).length;
    const allOn = checkedCount === checkboxes.length;
    cat.querySelector('.template-category-count').textContent = `${checkedCount}/${checkboxes.length}`;
    cat.querySelector('.template-category-toggle').checked = allOn;
  });
}

let activeTool = 'newspaper';

function switchTool(toolId) {
  activeTool = toolId;
  $$('.tool-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === toolId));
  $$('.tool-panel').forEach(p => p.classList.toggle('active', p.dataset.tool === toolId));
  if (toolId === 'newspaper') {
    updatePreviewSize();
  } else if (toolId === 'chat') {
    chatUpdatePreviewSize();
    chatRenderPreview();
  }
}

function initToolNav() {
  $$('.tool-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTool(btn.dataset.tool));
  });
}

function initNewspaper() {
  buildTemplateToggles();
  buildQueue();
  updatePreviewSize();
  updateVignette();
  applyAccent();
  showSlide(state.queue[state.currentIndex]);
  state.currentIndex++;

  const [nw, nh] = getResolution();
  $('#globalResInfo').textContent = `${nw}x${nh}`;

  $('#keywordInput').addEventListener('input', (e) => {
    state.keyword = e.target.value || 'KEYWORD';
    applyAccent();
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#speedRange').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value);
    $('#speedValue').textContent = (state.speed / 1000).toFixed(1) + 's';
    if (state.playing) {
      clearInterval(state.timer);
      state.timer = setInterval(nextSlide, state.speed);
    }
  });

  $$('#formatGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#formatGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.format = btn.dataset.format;
      updatePreviewSize();
    });
  });

  $('#resolutionSelect').addEventListener('change', (e) => {
    state.resolution = e.target.value;
    updatePreviewSize();
    const [w, h] = getResolution();
    $('#globalResInfo').textContent = `${w}x${h}`;
  });

  $('#btnPlay').addEventListener('click', () => {
    if (state.playing) stop();
    else play();
  });

  $('#btnStop').addEventListener('click', stop);
  $('#btnShuffle').addEventListener('click', shuffle);

  $('#customToggle').addEventListener('click', () => {
    document.querySelector('[data-tool="newspaper"] .custom-section').classList.toggle('collapsed');
  });

  $('#customHeadline').addEventListener('input', (e) => {
    state.customHeadline = e.target.value;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#customLead').addEventListener('input', (e) => {
    state.customLead = e.target.value;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#zoomRange').addEventListener('input', (e) => {
    state.zoomLevel = parseFloat(e.target.value);
    $('#zoomVal').textContent = state.zoomLevel.toFixed(1) + 'x';
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#offXRange').addEventListener('input', (e) => {
    state.zoomOffsetX = parseInt(e.target.value);
    $('#offXVal').textContent = state.zoomOffsetX;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#offYRange').addEventListener('input', (e) => {
    state.zoomOffsetY = parseInt(e.target.value);
    $('#offYVal').textContent = state.zoomOffsetY;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#fontScaleRange').addEventListener('input', (e) => {
    state.fontSizeScale = parseInt(e.target.value);
    $('#fontScaleVal').textContent = state.fontSizeScale + '%';
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#lineHRange').addEventListener('input', (e) => {
    state.lineH = parseFloat(e.target.value);
    $('#lineHVal').textContent = state.lineH.toFixed(2);
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#colorBg').addEventListener('input', (e) => {
    state.colorBg = e.target.value === '#ffffff' ? '' : e.target.value;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#colorText').addEventListener('input', (e) => {
    state.colorText = e.target.value === '#333333' ? '' : e.target.value;
    if (!state.playing) {
      const idx = Math.max(0, state.currentIndex - 1) % state.queue.length;
      showSlide(state.queue[idx]);
    }
  });

  $('#colorAccent').addEventListener('input', (e) => {
    state.colorAccent = e.target.value;
    applyAccent();
  });

  $('#vignetteRange').addEventListener('input', (e) => {
    state.vignetteOpacity = parseInt(e.target.value);
    $('#vignetteVal').textContent = state.vignetteOpacity + '%';
    updateVignette();
  });

  $('#transitionRange').addEventListener('input', (e) => {
    state.transitionMs = parseInt(e.target.value);
    $('#transitionVal').textContent = state.transitionMs + 'ms';
  });

  const ro = new ResizeObserver(() => {
    if (activeTool === 'newspaper') updatePreviewSize();
    else chatUpdatePreviewSize();
  });
  ro.observe($('[data-tool="newspaper"] .preview-area'));

  window.addEventListener('resize', () => {
    if (activeTool === 'newspaper') updatePreviewSize();
    else chatUpdatePreviewSize();
  });
}

/* ═══════════════════════════════════════
   CHAT TOOL
   ═══════════════════════════════════════ */

const chatState = {
  platform: 'imessage',
  format: '16:9',
  resolution: '1080p',
  contacts: [
    { name: 'Jan', color: '#007AFF' },
    { name: 'Anna', color: '#34C759' }
  ],
  messages: [
    { sender: 0, text: 'Hej, widziałeś to?' },
    { sender: 1, text: 'Co dokładnie?' },
    { sender: 0, text: 'Ten nowy film dokumentalny o sztuce' },
    { sender: 1, text: 'O tak, słyszałam o nim! Podobno świetny' },
    { sender: 0, text: 'Dokładnie, musimy go obejrzeć' }
  ]
};

function chatGetResolution() {
  return RESOLUTIONS[chatState.format][chatState.resolution];
}

function chatUpdatePreviewSize() {
  const [w, h] = chatGetResolution();
  const area = $('#chatPreviewArea');
  if (!area) return;
  const areaW = area.clientWidth - 60;
  const areaH = area.clientHeight - 60;
  const scale = Math.min(areaW / w, areaH / h, 1);
  const displayW = Math.round(w * scale);
  const displayH = Math.round(h * scale);

  const wrapper = $('#chatPreviewWrapper');
  wrapper.style.width = displayW + 'px';
  wrapper.style.height = displayH + 'px';

  const canvas = $('#chatPreviewCanvas');
  canvas.style.fontSize = Math.round(scale * 16) + 'px';

  const [fullW, fullH] = chatGetResolution();
  $('#globalResInfo').textContent = `${fullW}x${fullH}`;
}

function chatRenderPreview() {
  const canvas = $('#chatPreviewCanvas');
  const p = chatState.platform;
  const contact1 = chatState.contacts[0];
  const contact2 = chatState.contacts[1];
  const headerContact = contact2;

  const initial = headerContact.name.charAt(0).toUpperCase();

  let headerBg = '';
  let headerExtra = '';
  if (p === 'whatsapp') headerBg = `style="background:#1f2c34"`;
  if (p === 'telegram') headerBg = `style="background:#517da2"`;
  if (p === 'discord') headerBg = `style="background:#2b2d31"`;

  let bodyExtra = '';
  if (p === 'whatsapp') bodyExtra = `style="background:#0b141a"`;
  if (p === 'telegram') bodyExtra = `style="background:#9ccde7"`;
  if (p === 'discord') bodyExtra = `style="background:#313338"`;

  let headerHTML = '';
  if (p === 'discord') {
    headerHTML = `
      <div class="chat-render-header" ${headerBg}>
        <div class="chat-render-avatar" style="background:${headerContact.color}">${initial}</div>
        <div>
          <div class="chat-render-name">${headerContact.name}</div>
          <div class="chat-render-status">${chatState.messages.length} wiadomości</div>
        </div>
      </div>`;
  } else {
    headerHTML = `
      <div class="chat-render-header" ${headerBg}>
        <div class="chat-render-avatar" style="background:${headerContact.color}">${initial}</div>
        <div>
          <div class="chat-render-name">${headerContact.name}</div>
          <div class="chat-render-status">${p === 'imessage' ? 'iMessage' : p === 'whatsapp' ? 'online' : p === 'telegram' ? 'last seen recently' : 'online'}</div>
        </div>
      </div>`;
  }

  let messagesHTML = chatState.messages.map((msg, i) => {
    const contact = chatState.contacts[msg.sender];
    const isRight = msg.sender === 0;
    const time = `${14 + Math.floor(i / 3)}:${String(i * 7 % 60).padStart(2, '0')}`;

    if (p === 'discord') {
      const discInitial = contact.name.charAt(0).toUpperCase();
      return `
        <div class="chat-bubble ${isRight ? 'chat-bubble-right' : 'chat-bubble-left'}">
          <div class="chat-render-avatar" style="background:${contact.color}">${discInitial}</div>
          <div class="chat-bubble-content">
            <div class="chat-bubble-author" style="color:${contact.color}">${contact.name}</div>
            <div class="chat-bubble-text">${msg.text}</div>
            <div class="chat-bubble-time">${time}</div>
          </div>
        </div>`;
    }

    return `
      <div class="chat-bubble ${isRight ? 'chat-bubble-right' : 'chat-bubble-left'}">
        ${msg.text}
        <div class="chat-bubble-time">${time}</div>
      </div>`;
  }).join('');

  canvas.innerHTML = `
    <div class="chat-render chat-platform-${p}">
      ${headerHTML}
      <div class="chat-render-body" ${bodyExtra}>
        ${messagesHTML}
      </div>
    </div>`;
}

function chatRenderMessageList() {
  const list = $('#chatMessagesList');
  list.innerHTML = chatState.messages.map((msg, i) => {
    const contact = chatState.contacts[msg.sender];
    return `
      <div class="chat-msg-item" data-idx="${i}">
        <span class="chat-msg-dot" style="background:${contact.color}"></span>
        <span class="chat-msg-text">${contact.name}: ${msg.text}</span>
        <button class="chat-msg-delete" data-idx="${i}" title="Usuń">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l8 8M11 3l-8 8"/></svg>
        </button>
      </div>`;
  }).join('');

  list.querySelectorAll('.chat-msg-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      chatState.messages.splice(parseInt(btn.dataset.idx), 1);
      chatRenderMessageList();
      chatRenderPreview();
    });
  });
}

function chatUpdateSenderDropdown() {
  const sel = $('#chatAddSender');
  sel.innerHTML = chatState.contacts.map((c, i) =>
    `<option value="${i}">${c.name}</option>`
  ).join('');
}

function initChat() {
  chatRenderPreview();
  chatRenderMessageList();

  $$('#chatPlatformGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#chatPlatformGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatState.platform = btn.dataset.platform;
      chatRenderPreview();
    });
  });

  $$('#chatFormatGroup .control-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#chatFormatGroup .control-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatState.format = btn.dataset.format;
      chatUpdatePreviewSize();
      chatRenderPreview();
    });
  });

  $('#chatResolutionSelect').addEventListener('change', (e) => {
    chatState.resolution = e.target.value;
    chatUpdatePreviewSize();
  });

  const addMsg = () => {
    const text = $('#chatAddText').value.trim();
    if (!text) return;
    const sender = parseInt($('#chatAddSender').value);
    chatState.messages.push({ sender, text });
    $('#chatAddText').value = '';
    chatRenderMessageList();
    chatRenderPreview();
    const list = $('#chatMessagesList');
    list.scrollTop = list.scrollHeight;
  };

  $('#chatAddBtn').addEventListener('click', addMsg);
  $('#chatAddText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addMsg();
  });

  $('#chatClearBtn').addEventListener('click', () => {
    chatState.messages = [];
    chatRenderMessageList();
    chatRenderPreview();
  });

  const updateContact = (idx) => {
    const nameInput = $(`#chatContact${idx + 1}Name`);
    const colorInput = $(`#chatContact${idx + 1}Color`);
    const dot = $(`#chatContact${idx + 1}Dot`);

    nameInput.addEventListener('input', () => {
      chatState.contacts[idx].name = nameInput.value || `Osoba ${idx + 1}`;
      dot.textContent = '';
      chatUpdateSenderDropdown();
      chatRenderMessageList();
      chatRenderPreview();
    });

    colorInput.addEventListener('input', () => {
      chatState.contacts[idx].color = colorInput.value;
      dot.style.background = colorInput.value;
      chatRenderMessageList();
      chatRenderPreview();
    });
  };

  updateContact(0);
  updateContact(1);

  $('#chatExportBtn').addEventListener('click', () => {
    const canvas = $('#chatPreviewCanvas');
    const [w, h] = chatGetResolution();
    const scale = 2;
    const c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);

    const svgEl = canvas.querySelector('.chat-render');
    if (!svgEl) return;

    const data = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      const link = document.createElement('a');
      link.download = `chat-${chatState.platform}-${Date.now()}.png`;
      link.href = c.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  });
}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

function init() {
  initToolNav();
  initNewspaper();
  initChat();
}

document.addEventListener('DOMContentLoaded', init);
