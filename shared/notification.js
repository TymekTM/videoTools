(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.NotificationCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function buildFramePlan(options, fps) {
    options = options || {};
    fps = Math.max(1, Number(fps) || 30);

    var notificationCount = Math.max(0, Number(options.notificationCount) ||
      (Array.isArray(options.notifications) ? options.notifications.length : 0));
    var animSpeed = Math.max(1, Number(options.animSpeed) || 800);
    var slideDuration = Math.max(1, Number(options.slideDuration) || 400);
    var tailMs = Math.max(0, Number(options.tailMs) || 2000);
    var totalMs = notificationCount * animSpeed + tailMs;
    var totalFrames = Math.max(1, Math.round(totalMs / 1000 * fps));
    var frames = [];

    for (var i = 0; i < totalFrames; i++) {
      var t = totalFrames === 1 ? 1 : i / (totalFrames - 1);
      var elapsed = t * totalMs;
      var visibleCount = Math.min(notificationCount, Math.floor(elapsed / animSpeed) + 1);
      var latestStart = Math.max(0, visibleCount - 1) * animSpeed;
      var isAnimating = visibleCount > 0 && elapsed - latestStart < slideDuration;
      var slideProgress = isAnimating
        ? Math.max(0, Math.min(1, (elapsed - latestStart) / slideDuration))
        : -1;
      var key = isAnimating ? 'frame:' + i : 'static:' + visibleCount;
      var last = frames[frames.length - 1];

      if (last && last.key === key) {
        last.duration++;
      } else {
        frames.push({
          key: key,
          t: t,
          duration: 1,
          visibleCount: visibleCount,
          slideProgress: slideProgress
        });
      }
    }

    return {
      frames: frames,
      totalFrames: totalFrames,
      totalMs: totalMs
    };
  }

  function buildOffscreenHtml(opts) {
    var notifsJson = JSON.stringify(opts.notifications);
    var slideFrom = opts.slideDirection === 'top' ? -120 : 120;
    var customState = JSON.stringify({
      customBg: opts.customBg,
      customBorder: opts.customBorder,
      customTitle: opts.customTitle,
      customText: opts.customText,
      customRadius: opts.customRadius
    });
    var bgColors = { white: '#FFFFFF', greenscreen: '#00FF00', green: '#00FF00', black: '#000000' };
    var bgColor = bgColors[opts.bgMode || 'greenscreen'] || bgColors.greenscreen;
    var Z = opts.height / 540;

    return '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:' + opts.width + 'px;height:' + opts.height + 'px;overflow:hidden;background:' + bgColor + '}#c{position:relative;overflow:hidden;width:100%;height:100%}</style>' +
      '</head><body>' +
      '<div id="c"></div>' +
      '<script>' +
      'var IC=' + JSON.stringify(opts.icons) + ';' +
      'var N=' + notifsJson + ';' +
      'var TH="' + opts.theme + '";' +
      'var SF=' + slideFrom + ';' +
      'var SP="' + opts.stackPosition + '";' +
      'var MV=' + opts.maxVisible + ';' +
      'var FD=' + Boolean(opts.fadeOut) + ';' +
      'var SD=' + opts.slideDuration + ';' +
      'var AS=' + opts.animSpeed + ';' +
      'var WW=' + opts.width + ';HH=' + opts.height + ';Z=' + Z.toFixed(6) + ';' +
      'var OV=' + (opts.stackOverlap || 0) + ';' +
      'var CS=' + customState + ';' +
      'function EO(t){var c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)}' +
      'function GW(w,h){var r=w/h;if(r<0.7)return Math.min(w*0.88,480*Z);if(r<1.1)return Math.min(w*0.7,460*Z);return Math.min(w*0.42,420*Z)}' +
      'function S(v){return Math.round(v*Z)}' +
      'function BH(n){' +
        'var nw=GW(WW,HH);var r=TH==="android"?S(24):S(16);' +
        'var bg,bdr,tc,txc,sh,bl,ac;' +
        'if(TH==="ios"){bg="rgba(255,255,255,0.92)";bdr="none";tc="#000";txc="#666";sh="0 "+S(8)+"px "+S(32)+"px rgba(0,0,0,0.18),0 2px "+S(8)+"px rgba(0,0,0,0.08)";bl="backdrop-filter:blur("+S(24)+"px);-webkit-backdrop-filter:blur("+S(24)+"px)";ac=n.accentColor}' +
        'else if(TH==="android"){bg="#f8f9fa";bdr="none";tc="#1a1a1a";txc="#5f6368";sh="0 2px "+S(8)+"px rgba(0,0,0,0.12),0 1px "+S(2)+"px rgba(0,0,0,0.08)";bl="";ac=n.accentColor}' +
        'else{bg=CS.customBg;bdr="1px solid "+CS.customBorder;tc=CS.customTitle;txc=CS.customText;sh="0 4px "+S(16)+"px rgba(0,0,0,0.12)";bl="";ac=n.accentColor;r=S(CS.customRadius)}' +
        'var ic=IC[n.appName]||IC["App"];' +
        'return"<div style=\\"width:"+nw+"px;background:"+bg+";border:"+bdr+";border-radius:"+r+"px;padding:"+S(14)+"px "+S(16)+"px;box-shadow:"+sh+";"+bl+"font-family:-apple-system,BlinkMacSystemFont,SF Pro Text,Helvetica Neue,system-ui,sans-serif;display:flex;flex-direction:column;gap:"+S(6)+"px\\"><div style=\\"display:flex;align-items:center;gap:"+S(8)+"px\\"><span style=\\"display:flex;align-items:center;justify-content:center;color:"+ac+";line-height:1;flex-shrink:0;width:"+S(18)+"px;height:"+S(18)+"px\\">"+ic+"</span><span style=\\"font-size:"+S(13)+"px;font-weight:600;color:"+ac+";letter-spacing:-0.01em\\">"+n.appName+"</span><span style=\\"margin-left:auto;font-size:"+S(11)+"px;color:"+txc+";opacity:0.6\\">"+n.time+"</span></div><div style=\\"font-size:"+S(14)+"px;font-weight:700;color:"+tc+";line-height:1.25;letter-spacing:-0.01em\\">"+n.title+"</div><div style=\\"font-size:"+S(13)+"px;color:"+txc+";line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap\\">"+n.message+"</div></div>"' +
      '}' +
      'window._uf=function(t){' +
        'var el=document.getElementById("c");el.innerHTML="";if(!N.length)return;' +
        'var tm=N.length*AS+2000;var elp=t*tm;var nw=GW(WW,HH);var vis=[];' +
        'for(var i=0;i<N.length;i++){var ns=i*AS;if(elp<ns)break;var lt=Math.min((elp-ns)/SD,1);vis.push({i:i,lt:lt})}' +
        'var ch=S(100);var g=S(10);var p=S(20);var st=ch+g-OV;' +
        'for(var v=vis.length-1;v>=0;v--){var it=vis[v];var ps=vis.length-1-v;var yo=p+(ps*st);if(it.lt<1)yo+=SF*(1-EO(it.lt))*Z;' +
        'var xo=p;if(SP==="right"){xo=WW-p-nw}else if(SP==="center"){xo=(WW-nw)/2}' +
        'var op=Math.min(it.lt*2.5,1);if(FD&&ps>=MV){var fi=ps-MV;op=Math.max(0,1-(fi+1)*0.35);if(op<=0)continue}' +
        'var d=document.createElement("div");d.style.cssText="position:absolute;left:"+xo+"px;top:"+yo+"px;opacity:"+op;d.innerHTML=BH(N[it.i]);el.appendChild(d)}}' +
      '<\/script>' +
      '</body></html>';
  }

  return {
    buildFramePlan: buildFramePlan,
    buildOffscreenHtml: buildOffscreenHtml
  };
});
