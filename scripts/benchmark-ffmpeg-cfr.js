const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const ffmpegPath = require('ffmpeg-static');
const { createPage, loadHtml, captureFrame, closePage, closeBrowser } = require('../mcp/lib/browser');

const fps = 30;
const width = 1280;
const height = 720;
const durations = [900, 19, 1800];
const frameCount = durations.reduce((sum, value) => sum + value, 0);

function run(args, captureStdout = false) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, {
      stdio: ['ignore', captureStdout ? 'pipe' : 'ignore', 'pipe'],
    });
    const stdout = [];
    let stderr = '';
    if (captureStdout) proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(stdout));
      else reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
    });
  });
}

function measureSsim(referencePath, candidatePath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      '-i', referencePath,
      '-i', candidatePath,
      '-lavfi', 'ssim',
      '-f', 'null', '-',
    ], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(stderr));
      const match = stderr.match(/All:([0-9.]+)/);
      resolve(match ? Number(match[1]) : null);
    });
  });
}

async function frameMd5(filePath) {
  const output = (await run([
    '-v', 'error', '-i', filePath, '-f', 'framemd5', 'pipe:1',
  ], true)).toString();
  const rows = output.split(/\r?\n/).filter((line) => line && !line.startsWith('#'));
  return {
    full: rows.join('\n'),
    hashes: rows.map((line) => line.split(',').pop().trim()).join('\n'),
    frames: rows.length,
  };
}

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-cfr-'));
  let page;
  try {
    page = await createPage(width, height);
    for (let i = 0; i < durations.length; i++) {
      await loadHtml(page, `<body style="margin:0;width:100vw;height:100vh;overflow:hidden;background:
        radial-gradient(circle at ${20 + i * 25}% ${30 + i * 15}%,rgba(255,255,255,.8),transparent 24%),
        linear-gradient(${35 + i * 40}deg,hsl(${i * 100} 80% 45%),#101827)">
        <div style="position:absolute;left:${80 + i * 170}px;top:${90 + i * 100}px;padding:40px 60px;
          border-radius:28px;background:rgba(10,15,30,.72);color:white;box-shadow:0 30px 80px rgba(0,0,0,.55);
          font:700 54px Arial,sans-serif">Renderer ${i + 1}<div style="font-size:24px;opacity:.7">quality benchmark</div></div>
      </body>`);
      const data = await captureFrame(page);
      fs.writeFileSync(path.join(dir, `f_${i}.jpg`), Buffer.from(data, 'base64'));
    }

    let concat = 'ffconcat version 1.0\n';
    durations.forEach((duration, index) => {
      concat += `file 'f_${index}.jpg'\noption framerate ${fps}\nduration ${(duration / fps).toFixed(9)}\n`;
    });
    concat += `file 'f_${durations.length - 1}.jpg'\noption framerate ${fps}\n`;
    const input = path.join(dir, 'input.txt');
    fs.writeFileSync(input, concat);

    const inputArgs = [
      '-y', '-f', 'concat', '-safe', '0', '-i', input,
    ];
    const variants = [
      {
        name: 'fps-filter',
        args: [
          '-vf', `fps=${fps},trim=end_frame=${frameCount},crop=trunc(iw/2)*2:trunc(ih/2)*2`,
        ],
        encoder: [
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
          '-preset', 'fast', '-crf', '18',
        ],
      },
      ...['veryfast', 'superfast', 'ultrafast'].map((preset) => ({
        name: `x264-${preset}`,
        args: [
          '-vf', `fps=${fps},trim=end_frame=${frameCount},crop=trunc(iw/2)*2:trunc(ih/2)*2`,
        ],
        encoder: [
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
          '-preset', preset, '-crf', '18',
        ],
      })),
      {
        name: 'output-r',
        args: [
          '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
          '-r', String(fps), '-frames:v', String(frameCount),
        ],
        encoder: [
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
          '-preset', 'fast', '-crf', '18',
        ],
      },
      {
        name: 'fps-mode-cfr',
        args: [
          '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
          '-fps_mode', 'cfr', '-r', String(fps), '-frames:v', String(frameCount),
        ],
        encoder: [
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
          '-preset', 'fast', '-crf', '18',
        ],
      },
    ];

    const results = [];
    let reference;
    let referencePath;
    for (const variant of variants) {
      const output = path.join(dir, `${variant.name}.mp4`);
      const started = performance.now();
      await run([...inputArgs, ...variant.args, ...variant.encoder, output]);
      const elapsedMs = performance.now() - started;
      const md5 = await frameMd5(output);
      if (!reference) {
        reference = md5;
        referencePath = output;
      }
      const ssim = variant.name === 'x264-veryfast' || variant.name === 'x264-ultrafast'
        ? await measureSsim(referencePath, output)
        : null;
      results.push({
        variant: variant.name,
        elapsedMs: Number(elapsedMs.toFixed(1)),
        exactDecodedMatch: md5.full === reference.full,
        exactPixelSequence: md5.hashes === reference.hashes,
        decodedFrames: md5.frames,
        ssim,
        fileSize: fs.statSync(output).size,
      });
    }
    console.log(JSON.stringify({ frameCount, resolution: `${width}x${height}`, results }));
  } finally {
    if (page) await closePage(page);
    await closeBrowser();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
