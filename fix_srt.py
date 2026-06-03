import os, httpx, json, re

def load_key():
    with open(r'F:\projects\videoTools\.env') as f:
        for line in f:
            if line.startswith('GROQ_API_KEY'):
                return line.strip().split('=', 1)[1]
    raise Exception('No GROQ key')

KEY = load_key()
BASE = r'E:\!!promptuj\kursy\free\Wprowadzenie do AI'

FOLDERS = {
    '1': {'mp3': r'1\2026-05-27_17-55-10.mp3', 'srt': r'1\napisy.srt'},
    '2': {'mp3': r'2\audio.mp3', 'srt': r'2\subtitles.srt'},
    '3': {'mp3': r'3\audio.mp3', 'srt': r'3\subtitles.srt'},
    '4': {'mp3': r'4\audio.mp3', 'srt': r'4\subtitles.srt'},
}

MAX_BYTES = 20 * 1024 * 1024
CHUNK_SEC = 300


def get_duration(audio_path):
    import subprocess
    proc = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-show_entries', 'format=duration',
         '-of', 'csv=p=0', audio_path],
        capture_output=True, text=True, timeout=30
    )
    return float(proc.stdout.strip()) if proc.stdout.strip() else 0


def split_audio(audio_path, tmp_dir, chunk_sec):
    import subprocess as sp
    duration = get_duration(audio_path)
    num_chunks = max(1, int((duration + chunk_sec - 1) // chunk_sec))
    chunks = []
    for i in range(num_chunks):
        start = i * chunk_sec
        chunk_path = os.path.join(tmp_dir, f'chunk_{i:03d}.mp3')
        sp.run([
            'ffmpeg', '-y', '-i', audio_path,
            '-ss', str(start), '-t', str(chunk_sec),
            '-acodec', 'libmp3lame', '-ar', '16000', '-ac', '1',
            '-b:a', '64k', chunk_path
        ], capture_output=True, timeout=120)
        chunks.append((chunk_path, start))
    return chunks


def transcribe_chunk(chunk_path, api_key):
    url = 'https://api.groq.com/openai/v1/audio/transcriptions'
    with open(chunk_path, 'rb') as f:
        files = {'file': (os.path.basename(chunk_path), f, 'audio/mpeg')}
        data = {
            'model': 'whisper-large-v3-turbo',
            'language': 'pl',
            'response_format': 'verbose_json',
            'timestamp_granularities[]': 'word'
        }
        headers = {'Authorization': f'Bearer {api_key}'}
        resp = httpx.post(url, files=files, data=data, headers=headers, timeout=180)
    result = resp.json()
    words = []
    for w in result.get('words', []):
        t = w.get('word', '').strip()
        if t:
            words.append({'word': t, 'start': round(w['start'], 3), 'end': round(w['end'], 3)})
    return words


def transcribe_full(audio_path, api_key):
    size = os.path.getsize(audio_path)
    if size <= MAX_BYTES:
        return transcribe_chunk(audio_path, api_key)

    print(f'  Large file ({size // 1024 // 1024}MB), splitting...')
    tmp_dir = os.path.join(os.environ.get('TEMP', '/tmp'), f'vt-srt-{os.getpid()}')
    os.makedirs(tmp_dir, exist_ok=True)
    try:
        chunks = split_audio(audio_path, tmp_dir, CHUNK_SEC)
        all_words = []
        for i, (cp, offset) in enumerate(chunks):
            print(f'  Chunk {i+1}/{len(chunks)}...')
            words = transcribe_chunk(cp, api_key)
            for w in words:
                w['start'] += offset
                w['end'] += offset
            all_words.extend(words)
            os.unlink(cp)
        return all_words
    finally:
        os.rmdir(tmp_dir)


def fmt_ts(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds % 1) * 1000))
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def generate_srt(words, max_line_sec=5.0):
    lines = []
    idx = 0
    sub_num = 1

    while idx < len(words):
        start = words[idx]['start']
        end = words[idx]['end']
        parts = [words[idx]['word']]
        idx += 1

        while idx < len(words) and (words[idx]['start'] - start) < max_line_sec:
            end = words[idx]['end']
            parts.append(words[idx]['word'])
            idx += 1

        text = ' '.join(parts)
        lines.append(str(sub_num))
        lines.append(f'{fmt_ts(start)} --> {fmt_ts(end)}')
        lines.append(text)
        lines.append('')
        sub_num += 1

    content = '\r\n'.join(lines)
    return content.encode('utf-8')


for fid, info in FOLDERS.items():
    mp3_path = os.path.join(BASE, info['mp3'])
    srt_path = os.path.join(BASE, info['srt'])

    if not os.path.exists(mp3_path):
        print(f'Folder {fid}: MP3 not found, skipping')
        continue

    print(f'\n=== Folder {fid}: {os.path.basename(mp3_path)} ===')
    print(f'  Size: {os.path.getsize(mp3_path) // 1024 // 1024}MB')

    words = transcribe_full(mp3_path, KEY)
    if not words:
        print(f'  ERROR: no words returned')
        continue

    srt_data = generate_srt(words)
    with open(srt_path, 'wb') as f:
        f.write(srt_data)

    dur = words[-1]['end'] if words else 0
    print(f'  Done: {len(words)} words -> {srt_path}')
    print(f'  Duration: {int(dur//60)}:{int(dur%60):02d}, file size: {len(srt_data)} bytes')
