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
  classic: { label: t('catClassic'), icon: '\u{1F4F0}' },
  us_uk: { label: t('catUsUk'), icon: '\u{1F1EC}\u{1F1E7}' },
  magazine: { label: t('catMagazine'), icon: '\u{1F4D6}' },
  tech: { label: t('catTech'), icon: '\u{1F4BB}' },
  tabloid: { label: t('catTabloid'), icon: '\u{1F4C4}' },
  bold: { label: t('catBold'), icon: '\u{26A1}' }
};
