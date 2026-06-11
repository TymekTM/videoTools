const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function encodeMp4(frames, savePath, fps, width, height) {
  const tmpDir = path.join(os.tmpdir(), `mcp-vt-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  let idx = 0;
  for (const frame of frames) {
    const buf = Buffer.from(frame.data, 'base64');
    const fname = `f_${String(idx).padStart(6, '0')}.jpg`;
    fs.writeFileSync(path.join(tmpDir, fname), buf);
    idx++;
  }

  let concat = '';
  for (let i = 0; i < frames.length; i++) {
    for (let d = 0; d < frames[i].duration; d++) {
      concat += `file 'f_${String(i).padStart(6, '0')}.jpg'\n`;
    }
  }
  fs.writeFileSync(path.join(tmpDir, 'concat.txt'), concat);

  return new Promise((resolve, reject) => {
    const args = [
      '-y', '-f', 'concat', '-safe', '0',
      '-r', String(fps),
      '-i', path.join(tmpDir, 'concat.txt'),
      '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-preset', 'fast', '-crf', '18', '-movflags', '+faststart',
      savePath,
    ];
    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      if (code === 0) resolve(savePath);
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
  });
}

function* encodedFrameBuffers(frames) {
  for (const frame of frames) {
    const buffer = typeof frame.data === 'string'
      ? Buffer.from(frame.data, 'base64')
      : Buffer.from(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);
    for (let d = 0; d < frame.duration; d++) {
      yield buffer;
    }
  }
}

async function writeBuffers(stream, buffers) {
  for (const buffer of buffers) {
    if (!stream.write(buffer)) {
      await new Promise((resolve, reject) => {
        const onDrain = () => {
          stream.off('error', onError);
          resolve();
        };
        const onError = (error) => {
          stream.off('drain', onDrain);
          reject(error);
        };
        stream.once('drain', onDrain);
        stream.once('error', onError);
      });
    }
  }
  stream.end();
}

function encodePiped(frames, savePath, fps, outputArgs) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-f', 'image2pipe',
      '-framerate', String(fps),
      '-vcodec', 'mjpeg',
      '-i', 'pipe:0',
      ...outputArgs,
      savePath
    ];
    const proc = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    let settled = false;
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      settled = true;
      if (code === 0) resolve(savePath);
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
    writeBuffers(proc.stdin, encodedFrameBuffers(frames)).catch((error) => {
      if (!settled) proc.kill();
      reject(error);
    });
  });
}

function encodeMov(frames, savePath, fps, width, height) {
  return encodePiped(frames, savePath, fps, [
    '-s', `${width}x${height}`,
    '-c:v', 'prores_ks', '-profile:v', '3',
    '-pix_fmt', 'yuva444p10le', '-vendor', 'ap10',
  ]);
}

function encodeWebm(frames, savePath, fps) {
  return encodePiped(frames, savePath, fps, [
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
    '-auto-alt-ref', '0', '-crf', '18', '-b:v', '0',
  ]);
}

function encode(frames, savePath, fps, width, height, format = 'mp4') {
  switch (format) {
    case 'mov': return encodeMov(frames, savePath, fps, width, height);
    case 'webm': return encodeWebm(frames, savePath, fps);
    default: return encodeMp4(frames, savePath, fps, width, height);
  }
}

module.exports = {
  encodeMp4,
  encodeMov,
  encodeWebm,
  encode,
  encodedFrameBuffers,
  writeBuffers,
};
