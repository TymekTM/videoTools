(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CharacterCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  var FONT_LINK = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&family=Oswald:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;700;900&family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap';

  var BG_PRESETS = {
    'noir': 'radial-gradient(circle at 50% 42%, #16171c 0%, #090a0d 68%, #050608 100%)',
    'stage': 'radial-gradient(ellipse 70% 55% at 50% 36%, rgba(255,255,255,0.07), transparent 60%), radial-gradient(circle at 50% 52%, #1b1c22 0%, #070709 75%)',
    'cobalt': 'linear-gradient(165deg, #0a1830 0%, #0d2447 55%, #06122a 100%)',
    'oxblood': 'linear-gradient(165deg, #1f0a12 0%, #34121f 55%, #150509 100%)',
    'forest': 'linear-gradient(165deg, #0c1a12 0%, #143020 55%, #07110b 100%)',
    'mono-dark': 'radial-gradient(at 50% 24%, rgba(255,255,255,0.05), transparent 60%), linear-gradient(180deg, #0a0a0d, #141419)',
    'ink-grid': 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px) 0 0/26px 26px, linear-gradient(180deg, #08090d, #0d0f14)',
    'mono-light': 'radial-gradient(at 50% 22%, rgba(0,0,0,0.04), transparent 60%), linear-gradient(180deg, #f6f6f9, #e8e8ed)',
    'paper': 'radial-gradient(at 30% 18%, rgba(0,0,0,0.035), transparent 60%), linear-gradient(180deg, #f2efe9, #e5e0d4)'
  };

  var LIGHT_PRESETS = ['mono-light', 'paper'];

  var SOLID = {
    green: '#00FF00',
    blue: '#0000FF',
    white: '#FFFFFF',
    black: '#000000'
  };

  function isDarkBg(bgMode, bgPreset) {
    if (bgMode === 'white') return false;
    if (bgMode === 'green' || bgMode === 'blue' || bgMode === 'black') return true;
    return LIGHT_PRESETS.indexOf(bgPreset) === -1;
  }

  function resolveBackground(bgMode, bgPreset) {
    if (bgMode === 'preset') return BG_PRESETS[bgPreset] || BG_PRESETS['noir'];
    return SOLID[bgMode] || SOLID['green'];
  }

  function buildFramePlan(options, fps) {
    options = options || {};
    fps = Math.max(1, Number(fps) || 30);
    var introMs = Math.max(1, Number(options.introDuration) || 800);
    var holdMs = Math.max(0, Number(options.holdDuration) || 2500);
    var totalMs = introMs + holdMs;
    var totalFrames = Math.max(1, Math.round(totalMs / 1000 * fps));
    var frames = [];
    for (var i = 0; i < totalFrames; i++) {
      var t = totalFrames === 1 ? 1 : i / (totalFrames - 1);
      var elapsed = t * totalMs;
      var animating = elapsed < introMs;
      var key = animating ? 'frame:' + i : 'hold';
      var last = frames[frames.length - 1];
      if (last && last.key === key) {
        last.duration++;
      } else {
        frames.push({ key: key, t: t, duration: 1 });
      }
    }
    return { frames: frames, totalFrames: totalFrames, totalMs: totalMs };
  }

  function buildCardHtml(o) {
    function S(v) { return Math.round(v); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function eob(p) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
    function eoc(p) { return 1 - Math.pow(1 - p, 3); }
    function esc(s) { s = (s == null ? '' : String(s)); return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
    function initials(s) { var parts = String(s || '?').trim().split(/\s+/); var a = (parts[0] ? parts[0][0] : ''); var b = (parts[1] ? parts[1][0] : ''); return (a + b).toUpperCase() || '?'; }

    var p = clamp(Number(o.progress), 0, 1);
    var ch = o.ch || {};
    var style = o.style || 'hero';
    var accent = o.accent || '#6366f1';
    var W = o.W, H = o.H;
    var L = o.labels || {};
    var dark = o.dark !== false;
    var name = ch.name || '', nick = ch.nickname || '', role = ch.role || '', bio = ch.bio || '';
    var photo = ch.photo || '', shape = ch.photoShape || 'circle';
    var customs = Array.isArray(ch.customs) ? ch.customs : [];
    var ageRow = null;
    if (ch.ageMode === 'age' && ch.ageValue) ageRow = { label: L.age || 'WIEK', value: ch.ageValue };
    else if (ch.ageMode === 'date' && ch.ageValue) ageRow = { label: L.dob || 'UR.', value: ch.ageValue };

    var ink = dark ? '#f4f4f6' : '#131318';
    var inkSoft = dark ? 'rgba(244,244,246,0.70)' : 'rgba(19,19,24,0.68)';
    var inkFaint = dark ? 'rgba(244,244,246,0.44)' : 'rgba(19,19,24,0.42)';
    var inkLine = dark ? 'rgba(244,244,246,0.18)' : 'rgba(19,19,24,0.14)';

    function radius(sh) { return sh === 'circle' ? '50%' : (sh === 'rounded' ? S(18) + 'px' : '0px'); }
    function photoEl(w, h, o2) {
      o2 = o2 || {};
      var br = o2.radius != null ? o2.radius : radius(shape);
      var box = 'width:' + S(w) + 'px;height:' + S(h) + 'px;border-radius:' + br + ';background-size:cover;background-position:center center;background-repeat:no-repeat;flex-shrink:0;' + (o2.frame || '');
      if (photo) {
        return '<div style="' + box + 'background-image:url(\'' + photo + '\');' + (o2.tint || '') + '"></div>';
      }
      var g = 'linear-gradient(135deg,' + accent + ' 0%,#1b1b24 100%)';
      return '<div style="' + box + 'background:' + g + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:' + S(Math.min(w, h) * 0.34) + 'px;font-family:\'Sora\',sans-serif;letter-spacing:0.02em">' + esc(initials(name || nick)) + '</div>';
    }

    function statStrip(items) {
      var h = '';
      var n = 0;
      for (var i = 0; i < items.length && n < 4; i++) {
        var it = items[i];
        if (!it || !it.value) continue;
        if (n > 0) h += '<span style="width:' + S(1) + 'px;align-self:stretch;background:' + inkLine + ';margin:0 ' + S(14) + 'px"></span>';
        h += '<span style="display:flex;flex-direction:column;gap:' + S(1) + 'px">';
        h += '<span style="font-family:\'Sora\',sans-serif;font-weight:700;color:' + ink + ';font-size:' + S(16) + 'px;letter-spacing:-0.01em;line-height:1.05">' + esc(it.value) + '</span>';
        h += '<span style="font-family:\'IBM Plex Mono\',monospace;color:' + inkFaint + ';font-size:' + S(9) + 'px;text-transform:uppercase;letter-spacing:0.18em">' + esc(it.label) + '</span>';
        h += '</span>';
        n++;
      }
      return h;
    }

    var inner = '';
    var cardOuterStyle = '';
    var op = clamp(p * 2.2, 0, 1);

    /* ════════ HERO — kinetic editorial title ════════ */
    if (style === 'hero') {
      var stripH = Math.min(H * 0.74, H - 90);
      var stripW = Math.max(S(150), Math.round(stripH * 0.72));
      var contentMaxW = Math.min(W * 0.58, S(640));
      var nameSize = clamp(H * 0.13, 44, 78);
      var stripOp = clamp((p - 0.05) / 0.5, 0, 1);
      var stripScale = 1.07 - 0.07 * eoc(stripOp);

      if (photo) {
        inner += '<div style="position:absolute;right:' + S(W * 0.05) + 'px;top:50%;transform:translateY(-50%) scale(' + stripScale.toFixed(3) + ');width:' + S(stripW) + 'px;height:' + S(stripH) + 'px;opacity:' + stripOp.toFixed(3) + ';border-radius:' + S(6) + 'px;overflow:hidden;-webkit-mask-image:linear-gradient(to right, transparent 0%, #000 28%);mask-image:linear-gradient(to right, transparent 0%, #000 28%);box-shadow:0 ' + S(34) + 'px ' + S(90) + 'px rgba(0,0,0,0.55)">' + photoEl(stripW, stripH, { tint: 'filter:contrast(1.05) saturate(0.95)', radius: S(6) + 'px' }) + '</div>';
      }

      var words = (name || L.namePlaceholder || '').trim().split(/\s+/);
      var nameHtml = '';
      for (var wi = 0; wi < words.length; wi++) {
        var wp = eoc(clamp((p - wi * 0.07) / 0.5, 0, 1));
        var tyw = (1 - wp) * 118;
        nameHtml += '<span style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.14em;margin-bottom:-0.14em"><span style="display:inline-block;transform:translateY(' + tyw.toFixed(1) + '%)">' + esc(words[wi] || '\u00a0') + '</span></span>' + (wi < words.length - 1 ? '<span style="display:inline-block;width:0.26em">&nbsp;</span>' : '');
      }

      inner += '<div style="position:absolute;left:' + S(W * 0.06) + 'px;top:50%;transform:translateY(-50%);max-width:' + S(contentMaxW) + 'px;display:flex;flex-direction:column;gap:' + S(13) + 'px;text-align:left">';

      if (role) {
        inner += '<div style="display:flex;align-items:center;gap:' + S(11) + 'px;overflow:hidden">';
        inner += '<span style="height:' + S(1) + 'px;width:' + S(eoc(clamp(p / 0.4, 0, 1)) * 42) + 'px;background:' + accent + ';flex-shrink:0"></span>';
        inner += '<span style="font-family:\'IBM Plex Mono\',monospace;color:' + accent + ';font-size:' + S(11) + 'px;font-weight:600;text-transform:uppercase;letter-spacing:0.3em">' + esc(role) + '</span>';
        inner += '</div>';
      }

      inner += '<div style="font-family:\'Space Grotesk\',sans-serif;font-weight:700;color:' + ink + ';font-size:' + S(nameSize) + 'px;line-height:0.98;letter-spacing:-0.035em;text-shadow:0 ' + S(2) + 'px ' + S(30) + 'px rgba(0,0,0,' + (dark ? 0.42 : 0.16) + ')">' + nameHtml + '</div>';

      if (nick) {
        var nickOp = clamp((p - 0.5) / 0.4, 0, 1);
        inner += '<div style="font-family:\'Sora\',sans-serif;color:' + accent + ';font-weight:600;font-size:' + S(nameSize * 0.3) + 'px;letter-spacing:-0.01em;opacity:' + nickOp.toFixed(3) + '">// ' + esc(nick) + '</div>';
      }
      if (bio) {
        var bioOp = clamp((p - 0.55) / 0.4, 0, 1);
        inner += '<div style="font-family:\'Sora\',sans-serif;color:' + inkSoft + ';font-size:' + S(15) + 'px;line-height:1.55;max-width:' + S(440) + 'px;opacity:' + bioOp.toFixed(3) + '">' + esc(bio) + '</div>';
      }

      var statsItems = [];
      if (ageRow) statsItems.push(ageRow);
      for (var k = 0; k < customs.length; k++) statsItems.push(customs[k]);
      if (statsItems.length) {
        var stOp = clamp((p - 0.62) / 0.35, 0, 1);
        inner += '<div style="display:flex;align-items:center;margin-top:' + S(3) + 'px;opacity:' + stOp.toFixed(3) + '">' + statStrip(statsItems) + '</div>';
      }
      inner += '</div>';

      cardOuterStyle = 'inset:0';
    }

    /* ════════ LOWER-THIRD — broadcast strap ════════ */
    else if (style === 'lower-third') {
      var wipe = eoc(clamp(p / 0.6, 0, 1));
      var wipeSub = eoc(clamp((p - 0.2) / 0.5, 0, 1));
      var barW = Math.min(W * 0.6, S(720));
      var name2Size = clamp(H * 0.057, 22, 34);
      var photoSize2 = Math.min(H * 0.16, 92);
      var textOp = clamp((p - 0.28) / 0.42, 0, 1);
      var ruleW2 = (eoc(clamp((p - 0.08) / 0.5, 0, 1)) * 100).toFixed(1);

      var subItems = [];
      if (ageRow) subItems.push(ageRow);
      for (var k2 = 0; k2 < customs.length; k2++) subItems.push(customs[k2]);
      var sub = subItems.map(function (r) { return r && r.value ? esc(r.label) + ' ' + esc(r.value) : ''; }).filter(Boolean).join('&nbsp;&nbsp;·&nbsp;&nbsp;');

      inner += '<div style="width:' + S(barW) + 'px;position:relative">';
      inner += '<div style="height:' + S(3) + 'px;width:' + ruleW2 + '%;background:' + accent + ';box-shadow:0 ' + S(1) + 'px ' + S(4) + 'px ' + accent + '"></div>';

      inner += '<div style="background:#0e0f14;padding:' + S(15) + 'px ' + S(22) + 'px ' + S(13) + 'px ' + S(78) + 'px;position:relative;clip-path:inset(0 ' + ((1 - wipe) * 100).toFixed(2) + '% 0 0)">';
      inner += '<div style="position:absolute;left:' + S(19) + 'px;top:50%;transform:translateY(-50%);opacity:' + textOp.toFixed(3) + '">' + photoEl(photoSize2, photoSize2, { frame: 'box-shadow:0 0 0 ' + S(3) + 'px ' + accent + ',0 ' + S(8) + 'px ' + S(20) + 'px rgba(0,0,0,0.55)', radius: '50%' }) + '</div>';
      if (role) inner += '<div style="font-family:\'IBM Plex Mono\',monospace;color:' + accent + ';font-size:' + S(10) + 'px;text-transform:uppercase;letter-spacing:0.26em;font-weight:600;opacity:' + textOp.toFixed(3) + '">' + esc(role) + '</div>';
      inner += '<div style="display:flex;align-items:baseline;gap:' + S(11) + 'px;margin-top:' + S(3) + 'px;opacity:' + textOp.toFixed(3) + '">';
      inner += '<span style="font-family:\'Oswald\',sans-serif;font-weight:700;color:#fff;font-size:' + S(name2Size) + 'px;letter-spacing:0.012em;text-transform:uppercase;line-height:1">' + esc(name || '') + '</span>';
      if (nick) inner += '<span style="font-family:\'Sora\',sans-serif;color:' + accent + ';font-weight:500;font-size:' + S(14) + 'px">// ' + esc(nick) + '</span>';
      inner += '</div>';
      inner += '</div>';

      if (sub) {
        inner += '<div style="background:#17181f;padding:' + S(7) + 'px ' + S(22) + 'px ' + S(7) + 'px ' + S(78) + 'px;clip-path:inset(0 ' + ((1 - wipeSub) * 100).toFixed(2) + '% 0 0)"><span style="font-family:\'IBM Plex Mono\',monospace;color:rgba(255,255,255,0.62);font-size:' + S(11) + 'px;letter-spacing:0.05em">' + sub + '</span></div>';
      }
      inner += '</div>';

      cardOuterStyle = 'left:' + S(W * 0.05) + 'px;bottom:' + S(H * 0.1) + 'px;transform:translateZ(0)';
    }

    /* ════════ WANTED — letterpress wood-type poster ════════ */
    else if (style === 'wanted') {
      var drop = eob(clamp(p / 0.7, 0, 1));
      var rot = (-5 + 4 * drop);
      var dropY = S(-46) * (1 - drop);
      var stampP = clamp((p - 0.6) / 0.35, 0, 1);
      var stampOp = eoc(stampP);
      var stampScale = 1.7 - 0.7 * eoc(stampP);
      var cardW = Math.min(W * 0.42, S(390));
      var photoW = cardW - S(52);
      var photoH = Math.round(photoW * 1.04);

      var rows3 = [];
      if (ageRow) rows3.push(ageRow);
      if (role) rows3.push({ label: L.role || 'ZAWÓD', value: role });
      for (var k3 = 0; k3 < customs.length; k3++) rows3.push(customs[k3]);

      inner += '<div style="width:' + S(cardW) + 'px;position:relative;font-family:\'IBM Plex Mono\',monospace;background:linear-gradient(135deg,#ece2cc 0%,#dccdb0 60%,#c8b593 100%);box-shadow:0 ' + S(30) + 'px ' + S(72) + 'px rgba(0,0,0,0.55);padding:' + S(3) + 'px">';
      inner += '<div style="border:' + S(2) + 'px solid #5a4022;padding:' + S(17) + 'px ' + S(20) + 'px ' + S(15) + 'px;box-shadow:inset 0 0 0 ' + S(5) + 'px rgba(90,64,34,0.10)">';

      inner += '<div style="text-align:center;font-family:\'Oswald\',sans-serif;font-weight:700;font-size:' + S(34) + 'px;color:#2c1d0c;letter-spacing:0.32em;text-shadow:1px 1px 0 rgba(0,0,0,0.12),0 0 1px rgba(0,0,0,0.3)">WANTED</div>';
      inner += '<div style="display:flex;align-items:center;gap:' + S(8) + 'px;margin:' + S(5) + 'px 0 ' + S(11) + 'px"><span style="flex:1;height:' + S(1) + 'px;background:#5a4022"></span><span style="font-family:\'Oswald\',sans-serif;font-size:' + S(9) + 'px;color:#5a4022;letter-spacing:0.3em">' + esc(L.deadOrAlive || 'DEAD OR ALIVE') + '</span><span style="flex:1;height:' + S(1) + 'px;background:#5a4022"></span></div>';

      inner += '<div style="position:relative;width:' + S(photoW) + 'px;margin:0 auto ' + S(13) + 'px;padding:' + S(5) + 'px;background:#cdbf9f;box-shadow:inset 0 0 0 ' + S(1) + 'px #5a4022">' + photoEl(photoW, photoH, { tint: 'filter:sepia(0.6) contrast(0.95) brightness(0.97) saturate(0.7)', radius: '0' });
      inner += '<span style="position:absolute;top:-' + S(2) + 'px;left:-' + S(2) + 'px;width:' + S(11) + 'px;height:' + S(11) + 'px;border-top:' + S(2) + 'px solid #2c1d0c;border-left:' + S(2) + 'px solid #2c1d0c"></span>';
      inner += '<span style="position:absolute;top:-' + S(2) + 'px;right:-' + S(2) + 'px;width:' + S(11) + 'px;height:' + S(11) + 'px;border-top:' + S(2) + 'px solid #2c1d0c;border-right:' + S(2) + 'px solid #2c1d0c"></span>';
      inner += '<span style="position:absolute;bottom:-' + S(2) + 'px;left:-' + S(2) + 'px;width:' + S(11) + 'px;height:' + S(11) + 'px;border-bottom:' + S(2) + 'px solid #2c1d0c;border-left:' + S(2) + 'px solid #2c1d0c"></span>';
      inner += '<span style="position:absolute;bottom:-' + S(2) + 'px;right:-' + S(2) + 'px;width:' + S(11) + 'px;height:' + S(11) + 'px;border-bottom:' + S(2) + 'px solid #2c1d0c;border-right:' + S(2) + 'px solid #2c1d0c"></span>';
      inner += '</div>';

      inner += '<div style="text-align:center;font-family:\'DM Serif Display\',serif;color:#2c1d0c;font-size:' + S(28) + 'px;line-height:1.02;letter-spacing:0.005em">' + esc(name || L.namePlaceholder || '') + '</div>';
      if (nick) inner += '<div style="text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:' + S(11) + 'px;color:#5a4022;margin-top:' + S(4) + 'px;letter-spacing:0.06em">— a.k.a. ' + esc(nick) + ' —</div>';

      if (rows3.length) {
        inner += '<div style="margin-top:' + S(13) + 'px;border-top:' + S(1) + 'px dashed #6e5630;padding-top:' + S(10) + 'px;display:flex;flex-direction:column;gap:' + S(5) + 'px">';
        for (var r = 0; r < rows3.length && r < 5; r++) {
          var rr = rows3[r];
          if (!rr || !rr.value) continue;
          inner += '<div style="display:flex;align-items:baseline;font-size:' + S(11) + 'px;color:#3a2810">';
          inner += '<span style="text-transform:uppercase;letter-spacing:0.12em">' + esc(rr.label) + '</span>';
          inner += '<span style="flex:1;border-bottom:' + S(1) + 'px dotted #6e5630;margin:0 ' + S(7) + 'px;align-self:flex-end;height:0"></span>';
          inner += '<span style="font-weight:700">' + esc(rr.value) + '</span>';
          inner += '</div>';
        }
        inner += '</div>';
      }

      inner += '<div style="margin-top:' + S(13) + 'px;border:' + S(2) + 'px solid #2c1d0c;display:flex;align-items:center;justify-content:center;gap:' + S(9) + 'px;padding:' + S(5) + 'px ' + S(8) + 'px">';
      inner += '<span style="font-family:\'Oswald\',sans-serif;font-size:' + S(10) + 'px;color:#2c1d0c;letter-spacing:0.26em">' + esc(L.reward || 'REWARD') + '</span>';
      inner += '<span style="font-family:\'Oswald\',sans-serif;font-weight:700;font-size:' + S(18) + 'px;color:#2c1d0c">$' + esc(ch.reward || '5,000') + '</span>';
      inner += '</div>';

      inner += '</div></div>';

      inner += '<div style="position:absolute;top:' + S(30) + 'px;right:-' + S(8) + 'px;border:' + S(2.5) + 'px solid #a83a23;color:#a83a23;padding:' + S(4) + 'px ' + S(9) + 'px;transform:rotate(13deg) scale(' + stampScale.toFixed(3) + ');font-family:\'Oswald\',sans-serif;font-weight:700;letter-spacing:0.14em;font-size:' + S(13) + 'px;opacity:' + (stampOp * 0.82).toFixed(3) + ';background:rgba(255,250,245,0.32);box-shadow:0 0 0 ' + S(1) + 'px rgba(168,58,35,0.3)">' + esc(L.stamp || 'WANTED') + '</div>';

      cardOuterStyle = 'left:50%;top:50%;transform:translate(-50%,-50%) translateY(' + dropY + 'px) rotate(' + rot.toFixed(2) + 'deg)';
    }

    /* ════════ POLAROID — SX-70 analog ════════ */
    else {
      var swing = eob(clamp(p / 0.75, 0, 1));
      var prot = (11 - 14 * swing);
      var pdropY = S(-50) * (1 - eoc(clamp(p / 0.7, 0, 1)));
      var sh = (0.25 + 0.75 * eoc(clamp(p / 0.8, 0, 1)));
      var pw = Math.min(W * 0.34, S(300));
      var pphoto = pw;
      var pphotoH = Math.round(pphoto * 0.96);
      var capOp = clamp((p - 0.5) / 0.4, 0, 1);

      var detVals = [];
      if (role) detVals.push(esc(role));
      if (ageRow) detVals.push(esc(ageRow.value));
      for (var k4 = 0; k4 < customs.length && detVals.length < 3; k4++) {
        var cv = customs[k4];
        if (cv && cv.value) detVals.push(esc(cv.value));
      }
      var detailText = detVals.join('<br>');

      inner += '<div style="width:' + S(pw) + 'px;background:#f1eee6;padding:' + S(14) + 'px ' + S(14) + 'px ' + S(48) + 'px;box-shadow:0 ' + S(28 * sh) + 'px ' + S(66 * sh) + 'px rgba(0,0,0,0.5),0 ' + S(5 * sh) + 'px ' + S(14 * sh) + 'px rgba(0,0,0,0.3);position:relative">';
      inner += '<div style="position:absolute;top:-' + S(14) + 'px;left:50%;transform:translateX(-50%) rotate(' + (-prot * 0.6).toFixed(1) + 'deg);width:' + S(96) + 'px;height:' + S(28) + 'px;background:linear-gradient(180deg,rgba(226,221,202,0.6),rgba(226,221,202,0.42));box-shadow:0 ' + S(1) + 'px ' + S(3) + 'px rgba(0,0,0,0.18)"></div>';

      inner += '<div style="width:' + S(pphoto) + 'px;height:' + S(pphotoH) + 'px;overflow:hidden;position:relative;border-radius:' + S(1) + 'px">' + photoEl(pphoto, pphotoH, { tint: 'filter:contrast(1.04) saturate(0.85) brightness(1.02) sepia(0.12)', radius: S(1) + 'px' }) + '<div style="position:absolute;inset:0;box-shadow:inset 0 0 ' + S(42) + 'px rgba(0,0,0,0.38);pointer-events:none"></div></div>';

      inner += '<div style="position:absolute;left:' + S(14) + 'px;right:' + S(14) + 'px;bottom:' + S(9) + 'px;display:flex;align-items:flex-end;justify-content:space-between;gap:' + S(8) + 'px;opacity:' + capOp.toFixed(3) + '">';
      inner += '<div style="min-width:0">';
      inner += '<div style="font-family:\'IBM Plex Mono\',monospace;font-weight:700;color:#23211c;font-size:' + S(15) + 'px;text-transform:uppercase;letter-spacing:0.04em;line-height:1.02;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(name || L.namePlaceholder || '') + '</div>';
      if (nick) inner += '<div style="font-family:\'IBM Plex Mono\',monospace;color:' + accent + ';font-size:' + S(10) + 'px;letter-spacing:0.08em;margin-top:' + S(2) + '">aka ' + esc(nick) + '</div>';
      inner += '</div>';
      if (detailText) inner += '<div style="text-align:right;font-family:\'IBM Plex Mono\',monospace;color:' + accent + ';font-size:' + S(9) + 'px;letter-spacing:0.1em;line-height:1.45;font-weight:600">' + detailText + '</div>';
      inner += '</div>';

      inner += '</div>';

      cardOuterStyle = 'left:50%;top:50%;transform:translate(-50%,-50%) translateY(' + pdropY + 'px) rotate(' + prot.toFixed(2) + 'deg)';
    }

    return '<div style="position:absolute;' + cardOuterStyle + ';opacity:' + op.toFixed(3) + '">' + inner + '</div>';
  }

  function buildOffscreenHtml(opts) {
    var bgCss = resolveBackground(opts.bgMode, opts.bgPreset);
    var Z = opts.height / 540;
    var DW = Math.round(opts.width * 540 / opts.height);
    var labels = opts.labels || {};
    var dark = isDarkBg(opts.bgMode, opts.bgPreset);

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="' + FONT_LINK + '" rel="stylesheet">' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:' + opts.width + 'px;height:' + opts.height + 'px;overflow:hidden;background:' + bgCss + '}#c{position:relative;overflow:hidden;width:100%;height:100%;background:' + bgCss + '}</style>' +
      '</head><body>' +
      '<div id="c"></div>' +
      '<script>' +
      'var CH=' + JSON.stringify(opts.character || {}) + ';' +
      'var ST="' + (opts.style || 'hero') + '";' +
      'var AC=' + JSON.stringify(opts.accent || '#6366f1') + ';' +
      'var DW=' + DW + ',Z=' + Z.toFixed(6) + ';' +
      'var INTRO=' + (opts.introDuration || 800) + ',HOLD=' + (opts.holdDuration || 2500) + ';' +
      'var LBL=' + JSON.stringify(labels) + ';' +
      'var DK=' + (dark ? 'true' : 'false') + ';' +
      'var BCH=' + buildCardHtml.toString() + ';' +
      'window._uf=function(t){var el=document.getElementById("c");var prog=Math.max(0,Math.min(1,t*(INTRO+HOLD)/INTRO));var card=BCH({ch:CH,style:ST,accent:AC,W:DW,H:540,progress:prog,labels:LBL,dark:DK});el.innerHTML="<div style=\\"transform:scale("+Z+");transform-origin:top left;width:"+DW+"px;height:540px\\">"+card+"</div>"}' +
      '<\/script>' +
      '</body></html>';
  }

  return {
    buildFramePlan: buildFramePlan,
    buildOffscreenHtml: buildOffscreenHtml,
    buildCardHtml: buildCardHtml,
    resolveBackground: resolveBackground,
    isDarkBg: isDarkBg,
    BG_PRESETS: BG_PRESETS,
    SOLID: SOLID,
    FONT_LINK: FONT_LINK
  };
});
