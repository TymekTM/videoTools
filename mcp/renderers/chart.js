const { createPage, loadHtml, waitForFonts, evalAndCapture, closePage } = require('../lib/browser');
const { encode, countFrames } = require('../lib/encoder');
const { getResolution } = require('../registry');
const AnimationCore = require('../../shared/animation');

function buildChartHtml(opts) {
  const PALETTES = {
    vivid: ['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#06b6d4', '#a855f7', '#ec4899', '#14b8a6'],
    warm: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'],
    cool: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#06b6d4'],
    pastel: ['#93c5fd', '#c4b5fd', '#f9a8d4', '#fbbf24', '#86efac', '#67e8f9', '#fca5a5', '#d8b4fe'],
    mono: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
  };

  const st = JSON.stringify({
    chartType: opts.chartType, data: opts.data,
    counterFrom: opts.counterFrom || 0, counterTo: opts.counterTo || 1000000,
    counterPrefix: opts.counterPrefix || '', counterSuffix: opts.counterSuffix || '',
    counterDecimals: opts.counterDecimals || 0,
    gaugeValue: opts.gaugeValue || 72, gaugeLabel: opts.gaugeLabel || 'Performance',
    title: opts.title || '', subtitle: opts.subtitle || '',
    palette: opts.palette || 'vivid',
    customColors: opts.customColors || PALETTES.vivid,
    useCustomColors: opts.useCustomColors || false,
    bgColor: opts.bgColor || '#1a1a2e', textColor: opts.textColor || '#e4e4e7',
    gridColor: 'rgba(255,255,255,0.08)',
    barRadius: opts.barRadius || 6, lineWidth: opts.lineWidth || 3,
    lineSmooth: opts.lineSmooth !== false, donutHole: opts.donutHole || 0.6,
    showLabels: opts.showLabels !== false, showValues: opts.showValues !== false,
    showGrid: opts.showGrid !== false, showLegend: opts.showLegend !== false,
    fontSize: opts.fontSize || 32,
    stagger: opts.stagger || 0.08,
    easing: opts.easing || 'easeOut',
  });

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}</style>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head><body>
<canvas id="c" width="${opts.width}" height="${opts.height}" style="width:100%;height:100%"></canvas>
<script>
var PALETTES=${JSON.stringify(PALETTES)};
var st=${st};
var EASING_FNS={linear:function(t){return t},easeInOut:function(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2},easeOut:function(t){return 1-Math.pow(1-t,3)},easeIn:function(t){return t*t*t},bounce:function(t){var n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+0.75;if(t<2.5/d)return n*(t-=2.25/d)*t+0.9375;return n*(t-=2.625/d)*t+0.984375},spring:function(t){return 1-Math.cos(t*4.5*Math.PI)*Math.exp(-t*6)}};
function hexToRgb(h){var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return{r:r,g:g,b:b}}
function getColor(i){if(st.useCustomColors)return st.customColors[i%st.customColors.length];return PALETTES[st.palette][i%PALETTES[st.palette].length]}
function ease(t){return(EASING_FNS[st.easing]||EASING_FNS.easeOut)(Math.max(0,Math.min(1,t)))}
function staggerProgress(gT,idx,total){var sT=st.stagger*total,dur=1-sT;if(dur<=0)dur=0.01;var s=st.stagger*idx;return ease(Math.max(0,Math.min(1,(gT-s)/dur)))}
function formatNumber(v,p,suf,dec){p=p||"";suf=suf||"";dec=dec||0;var str=Math.abs(v).toFixed(dec);var parts=str.split(".");parts[0]=parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g," ");return(v<0?"-":"")+p+parts.join(".")+suf}
function drawBar(ctx,w,h,progress){var data=st.data;if(!data.length)return;var pad={top:st.title?h*0.12:h*0.06,bottom:h*0.12,left:w*0.1,right:w*0.06};var chartW=w-pad.left-pad.right,chartH=h-pad.top-pad.bottom;var maxVal=Math.max.apply(null,data.map(function(d){return d.value}));if(maxVal<=0)maxVal=1;var barCount=data.length,gap=Math.max(chartW*0.02,4),barW=(chartW-gap*(barCount+1))/barCount;if(barW<2)barW=2;ctx.save();if(st.showGrid){for(var g=0;g<=5;g++){var gy=pad.top+chartH-(g/5)*chartH;ctx.strokeStyle=st.gridColor;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.left,gy);ctx.lineTo(pad.left+chartW,gy);ctx.stroke();ctx.fillStyle=st.textColor;ctx.globalAlpha=0.4;ctx.font=(600)+' '+Math.max(st.fontSize*0.8,9)+'px "Manrope",sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(formatNumber(Math.round(g/5*maxVal)),pad.left-8,gy);ctx.globalAlpha=1}}data.forEach(function(d,i){var p=staggerProgress(progress,i,barCount);var barH=(d.value/maxVal)*chartH*p;var x=pad.left+gap+i*(barW+gap);var y=pad.top+chartH-barH;var r=Math.min(st.barRadius,barW/2,barH/2);if(r<0)r=0;var color=getColor(i);var rgb=hexToRgb(color);var grad=ctx.createLinearGradient(x,y,x,pad.top+chartH);grad.addColorStop(0,color);grad.addColorStop(1,'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.4)');ctx.fillStyle=grad;ctx.beginPath();if(r>0&&barH>0){ctx.moveTo(x,pad.top+chartH);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.lineTo(x+barW-r,y);ctx.arcTo(x+barW,y,x+barW,y+r,r);ctx.lineTo(x+barW,pad.top+chartH)}else{ctx.rect(x,y,barW,barH)}ctx.closePath();ctx.fill();if(st.showValues&&p>0.1){ctx.fillStyle=st.textColor;ctx.globalAlpha=Math.min(1,p*2);ctx.font=(700)+' '+Math.max(st.fontSize*0.75,9)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(formatNumber(d.value),x+barW/2,y-6);ctx.globalAlpha=1}if(st.showLabels){ctx.fillStyle=st.textColor;ctx.globalAlpha=0.6;ctx.font=(500)+' '+Math.max(st.fontSize*0.7,9)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(d.label,x+barW/2,pad.top+chartH+8);ctx.globalAlpha=1}});ctx.restore()}
function drawLine(ctx,w,h,progress){var data=st.data;if(data.length<2)return;var pad={top:st.title?h*0.12:h*0.06,bottom:h*0.12,left:w*0.1,right:w*0.06};var chartW=w-pad.left-pad.right,chartH=h-pad.top-pad.bottom;var maxVal=Math.max.apply(null,data.map(function(d){return d.value}));if(maxVal<=0)maxVal=1;var baseline=pad.top+chartH;var ep=ease(progress);var points=data.map(function(d,i){var x=pad.left+(i/(data.length-1||1))*chartW;var targetY=baseline-(d.value/maxVal)*chartH;var y=baseline+(targetY-baseline)*ep;return{x:x,y:y,targetY:targetY,d:d,i:i}});var color=getColor(0);var rgb=hexToRgb(color);var fillGrad=ctx.createLinearGradient(0,pad.top,0,baseline);fillGrad.addColorStop(0,'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.25)');fillGrad.addColorStop(1,'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.02)');ctx.beginPath();ctx.moveTo(points[0].x,baseline);ctx.lineTo(points[0].x,points[0].y);for(var fi=1;fi<points.length;fi++){if(st.lineSmooth){var fmx=(points[fi-1].x+points[fi].x)/2;ctx.bezierCurveTo(fmx,points[fi-1].y,fmx,points[fi].y,points[fi].x,points[fi].y)}else{ctx.lineTo(points[fi].x,points[fi].y)}}ctx.lineTo(points[points.length-1].x,baseline);ctx.closePath();ctx.fillStyle=fillGrad;ctx.fill();ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(var ci=1;ci<points.length;ci++){if(st.lineSmooth){var cmx=(points[ci-1].x+points[ci].x)/2;ctx.bezierCurveTo(cmx,points[ci-1].y,cmx,points[ci].y,points[ci].x,points[ci].y)}else{ctx.lineTo(points[ci].x,points[ci].y)}}ctx.strokeStyle=color;ctx.lineWidth=st.lineWidth;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();points.forEach(function(pt){if(ep<0.05)return;ctx.globalAlpha=Math.min(1,ep*1.5);ctx.beginPath();ctx.arc(pt.x,pt.y,Math.max(4,st.lineWidth*1.5),0,Math.PI*2);ctx.fillStyle=st.bgColor;ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=st.lineWidth;ctx.stroke();ctx.globalAlpha=1;if(st.showValues&&ep>0.3){ctx.fillStyle=st.textColor;ctx.globalAlpha=Math.min(1,ep*2);ctx.font=(700)+' '+Math.max(st.fontSize*0.7,9)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(formatNumber(pt.d.value),pt.x,pt.y-10);ctx.globalAlpha=1}if(st.showLabels){ctx.fillStyle=st.textColor;ctx.globalAlpha=0.6;ctx.font=(500)+' '+Math.max(st.fontSize*0.7,9)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(pt.d.label,pt.x,baseline+8);ctx.globalAlpha=1}})}
function drawPie(ctx,w,h,progress){var data=st.data;if(!data.length)return;var cx=w*0.38,cy=h*0.54,radius=Math.min(w*0.32,h*0.36);var innerRadius=radius*st.donutHole;var total=data.reduce(function(s,d){return s+d.value},0);if(total<=0)total=1;var startAngle=-Math.PI/2;data.forEach(function(d,i){var p=staggerProgress(progress,i,data.length);var sliceAngle=(d.value/total)*Math.PI*2*p;var color=getColor(i);ctx.beginPath();ctx.moveTo(cx+Math.cos(startAngle)*innerRadius,cy+Math.sin(startAngle)*innerRadius);ctx.arc(cx,cy,radius,startAngle,startAngle+sliceAngle);ctx.lineTo(cx+Math.cos(startAngle+sliceAngle)*innerRadius,cy+Math.sin(startAngle+sliceAngle)*innerRadius);ctx.arc(cx,cy,innerRadius,startAngle+sliceAngle,startAngle,true);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(st.showValues&&p>0.3&&sliceAngle>0.15){var midAngle=startAngle+sliceAngle/2;var labelR=(radius+innerRadius)/2;ctx.fillStyle='#fff';ctx.globalAlpha=Math.min(1,p*2);ctx.font=(700)+' '+Math.max(st.fontSize*0.75,9)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(Math.round(d.value/total*100)+'%',cx+Math.cos(midAngle)*labelR,cy+Math.sin(midAngle)*labelR);ctx.globalAlpha=1}startAngle+=sliceAngle});if(innerRadius>10){ctx.fillStyle=st.textColor;ctx.globalAlpha=0.3;ctx.font=(500)+' '+Math.max(st.fontSize*0.6,9)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TOTAL',cx,cy-st.fontSize*0.5);ctx.globalAlpha=1;ctx.fillStyle=st.textColor;ctx.font=(800)+' '+Math.max(st.fontSize*1.2,9)+'px "Manrope",sans-serif';ctx.fillText(formatNumber(total),cx,cy+st.fontSize*0.5)}}
function drawCounter(ctx,w,h,progress){var p=ease(progress);var val=st.counterFrom+(st.counterTo-st.counterFrom)*p;var str=formatNumber(val,st.counterPrefix,st.counterSuffix,st.counterDecimals);ctx.fillStyle=st.textColor;ctx.font=(800)+' '+Math.min(w*0.12,h*0.2,120)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(str,w/2,h/2);if(st.title){ctx.fillStyle=st.textColor;ctx.globalAlpha=0.5;ctx.font=(600)+' '+st.fontSize+'px "Manrope",sans-serif';ctx.fillText(st.title,w/2,h*0.35);ctx.globalAlpha=1}}
function drawGauge(ctx,w,h,progress){var p=ease(progress);var val=st.gaugeValue*p;var cx=w/2,cy=h*0.55,radius=Math.min(w,h)*0.3,lineWidth=Math.max(radius*0.15,8);var startAngle=Math.PI*0.75,endAngle=Math.PI*2.25;var totalAngle=endAngle-startAngle;ctx.beginPath();ctx.arc(cx,cy,radius,startAngle,endAngle);ctx.strokeStyle=st.gridColor;ctx.lineWidth=lineWidth;ctx.lineCap='round';ctx.stroke();var valAngle=startAngle+(val/100)*totalAngle;var color=getColor(0);var rgb=hexToRgb(color);var grad=ctx.createLinearGradient(cx-radius,cy,cx+radius,cy);grad.addColorStop(0,color);grad.addColorStop(1,'rgba('+rgb.r+','+rgb.g+','+rgb.b+',0.6)');ctx.beginPath();ctx.arc(cx,cy,radius,startAngle,valAngle);ctx.strokeStyle=grad;ctx.lineWidth=lineWidth;ctx.lineCap='round';ctx.stroke();ctx.fillStyle=st.textColor;ctx.font=(800)+' '+Math.min(radius*0.6,80)+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(Math.round(val)+'%',cx,cy);if(st.gaugeLabel){ctx.fillStyle=st.textColor;ctx.globalAlpha=0.5;ctx.font=(600)+' '+st.fontSize+'px "Manrope",sans-serif';ctx.fillText(st.gaugeLabel,cx,cy+radius*0.5);ctx.globalAlpha=1}}
function drawChart(ctx,w,h,progress){ctx.clearRect(0,0,w,h);ctx.fillStyle=st.bgColor;ctx.fillRect(0,0,w,h);if(st.title&&st.chartType!=='counter'){ctx.fillStyle=st.textColor;ctx.font=(800)+' '+st.fontSize*1.4+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(st.title,w/2,h*0.03)}if(st.subtitle&&st.chartType!=='counter'){ctx.fillStyle=st.textColor;ctx.globalAlpha=0.4;ctx.font=(500)+' '+st.fontSize*0.8+'px "Manrope",sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(st.subtitle,w/2,h*0.03+st.fontSize*2);ctx.globalAlpha=1}switch(st.chartType){case'bar':drawBar(ctx,w,h,progress);break;case'line':drawLine(ctx,w,h,progress);break;case'pie':drawPie(ctx,w,h,progress);break;case'counter':drawCounter(ctx,w,h,progress);break;case'gauge':drawGauge(ctx,w,h,progress);break}}
var _c=document.getElementById("c");var _ctx=_c.getContext("2d");
window._updateFrame=function(t){drawChart(_ctx,${opts.width},${opts.height},t)};
<\/script></body></html>`;
}

async function generate(params, outputPath, format) {
  const p = {
    chartType: 'bar', format: '16:9', resolution: '1080p', fps: 30,
    data: [{ label: 'Warszawa', value: 1790 }, { label: 'Kraków', value: 1420 }, { label: 'Wrocław', value: 1280 }, { label: 'Gdańsk', value: 980 }, { label: 'Poznań', value: 860 }],
    title: '', subtitle: '', palette: 'vivid', bgColor: '#1a1a2e', textColor: '#e4e4e7',
    fontSize: 32, animDuration: 3, stagger: 0.08, easing: 'easeOut',
    barRadius: 6, lineWidth: 3, lineSmooth: true, donutHole: 0.6,
    showLabels: true, showValues: true, showGrid: true, showLegend: true,
    counterFrom: 0, counterTo: 1000000, counterPrefix: '', counterSuffix: '', counterDecimals: 0,
    gaugeValue: 72, gaugeLabel: 'Performance',
    ...params,
  };

  const [width, height] = getResolution(p.format, p.resolution);
  const fps = p.fps;
  const framePlan = AnimationCore.buildFramePlan({
    durationSeconds: p.animDuration,
    holdSeconds: 1.5,
  }, fps);

  const html = buildChartHtml({
    width, height,
    chartType: p.chartType, data: p.data,
    title: p.title, subtitle: p.subtitle, palette: p.palette,
    bgColor: p.bgColor, textColor: p.textColor, fontSize: p.fontSize,
    stagger: p.stagger, easing: p.easing,
    barRadius: p.barRadius, lineWidth: p.lineWidth, lineSmooth: p.lineSmooth,
    donutHole: p.donutHole,
    showLabels: p.showLabels, showValues: p.showValues,
    showGrid: p.showGrid, showLegend: p.showLegend,
    counterFrom: p.counterFrom, counterTo: p.counterTo,
    counterPrefix: p.counterPrefix, counterSuffix: p.counterSuffix,
    counterDecimals: p.counterDecimals,
    gaugeValue: p.gaugeValue, gaugeLabel: p.gaugeLabel,
  });

  const page = await createPage(width, height);
  await loadHtml(page, html);
  await waitForFonts(page);

  const frames = [];
  for (const spec of framePlan.frames) {
    const d = await evalAndCapture(page, `window._updateFrame(${spec.progress})`);
    frames.push({ data: d, duration: spec.duration });
  }

  await closePage(page);
  await encode(frames, outputPath, fps, width, height, format || 'mp4');

  const fs = require('fs');
  const stat = fs.statSync(outputPath);
  const frameCount = countFrames(frames);
  return {
    success: true,
    filePath: outputPath,
    fileSize: stat.size,
    duration: frameCount / fps,
    frames: frameCount,
  };
}

module.exports = { generate, buildFramePlan: AnimationCore.buildFramePlan };
