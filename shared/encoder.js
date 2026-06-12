const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const X264_PRESET = 'veryfast';
const VP9_CPU_USED = '5';

function frameBuffer(frame) {
  return typeof frame.data === 'string'
    ? Buffer.from(frame.data, 'base64')
    : Buffer.from(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);
}

function countFrames(frames) {
  return frames.reduce((sum, frame) => sum + frame.duration, 0);
}

function detectFrameCodec(frames) {
  if (!frames.length) throw new Error('Cannot encode an empty frame list');
  const buffer = frameBuffer(frames[0]);
  const isPng = buffer.length >= 8
    && buffer[0] === 0x89
    && buffer.subarray(1, 4).toString('ascii') === 'PNG';
  return isPng ? 'png' : 'mjpeg';
}

function runFfmpeg(args, stdinBuffers) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, {
      stdio: [stdinBuffers ? 'pipe' : 'ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    let settled = false;
    proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', (code) => {
      settled = true;
      if (code === 0) resolve();
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
    if (stdinBuffers) {
      writeBuffers(proc.stdin, stdinBuffers).catch((error) => {
        if (!settled) proc.kill();
        reject(error);
      });
    }
  });
}

function* encodedFrameBuffers(frames) {
  for (const frame of frames) {
    const buffer = frameBuffer(frame);
    for (let i = 0; i < frame.duration; i++) yield buffer;
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

function createMp4Stream(savePath, fps, inputCodec = 'mjpeg') {
  const proc = spawn(ffmpegPath, [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-vcodec', inputCodec,
    '-i', 'pipe:0',
    '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', X264_PRESET,
    '-crf', '18',
    '-movflags', '+faststart',
    savePath,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  let ended = false;
  proc.stderr.on('data', (chunk) => (stderr += chunk.toString()));
  const done = new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve(savePath);
      else reject(new Error('ffmpeg exited ' + code + ': ' + stderr));
    });
  });

  return {
    async write(frames) {
      if (ended) throw new Error('Cannot write to a finished MP4 stream');
      for (const buffer of encodedFrameBuffers(frames)) {
        if (!proc.stdin.write(buffer)) {
          await new Promise((resolve, reject) => {
            const onDrain = () => {
              proc.stdin.off('error', onError);
              resolve();
            };
            const onError = (error) => {
              proc.stdin.off('drain', onDrain);
              reject(error);
            };
            proc.stdin.once('drain', onDrain);
            proc.stdin.once('error', onError);
          });
        }
      }
    },
    async finish() {
      if (!ended) {
        ended = true;
        proc.stdin.end();
      }
      return done;
    },
    abort() {
      if (ended) return;
      ended = true;
      done.catch(() => {});
      proc.stdin.destroy();
      proc.kill();
    },
  };
}

async function encodeMp4(frames, savePath, fps) {
  if (!frames.length) throw new Error('Cannot encode an empty frame list');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-tools-mp4-'));
  try {
    let concat = 'ffconcat version 1.0\n';
    frames.forEach((frame, index) => {
      const name = `f_${String(index).padStart(6, '0')}.jpg`;
      fs.writeFileSync(path.join(tmpDir, name), frameBuffer(frame));
      concat += `file '${name}'\noption framerate ${fps}\nduration ${(frame.duration / fps).toFixed(9)}\n`;
    });
    const lastName = `f_${String(frames.length - 1).padStart(6, '0')}.jpg`;
    concat += `file '${lastName}'\noption framerate ${fps}\n`;
    const concatPath = path.join(tmpDir, 'concat.txt');
    fs.writeFileSync(concatPath, concat);
    await runFfmpeg([
      '-y', '-f', 'concat', '-safe', '0',
      '-i', concatPath,
      '-vf', `fps=${fps},trim=end_frame=${countFrames(frames)},crop=trunc(iw/2)*2:trunc(ih/2)*2`,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
      '-preset', X264_PRESET, '-crf', '18', '-movflags', '+faststart',
      savePath,
    ]);
    return savePath;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function encodePiped(frames, savePath, fps, outputArgs) {
  const inputCodec = detectFrameCodec(frames);
  await runFfmpeg([
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-vcodec', inputCodec,
    '-i', 'pipe:0',
    ...outputArgs,
    savePath,
  ], encodedFrameBuffers(frames));
  return savePath;
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
    '-deadline', 'good', '-cpu-used', VP9_CPU_USED,
  ]);
}

function encode(frames, savePath, fps, width, height, format = 'mp4') {
  switch (format) {
    case 'mov': return encodeMov(frames, savePath, fps, width, height);
    case 'webm': return encodeWebm(frames, savePath, fps);
    default: return encodeMp4(frames, savePath, fps);
  }
}

module.exports = {
  encodeMp4,
  encodeMov,
  encodeWebm,
  encode,
  frameBuffer,
  encodedFrameBuffers,
  countFrames,
  detectFrameCodec,
  writeBuffers,
  createMp4Stream,
  X264_PRESET,
  VP9_CPU_USED,
};
