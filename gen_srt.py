import os, httpx, json

with open('.env') as f:
    for line in f:
        if line.startswith('GROQ_API_KEY'):
            key = line.strip().split('=', 1)[1]
            break

url = 'https://api.groq.com/openai/v1/audio/transcriptions'
files = {'file': (r'2026-05-27_17-55-10.mp3', open(r'E:\!!promptuj\kursy\free\Wprowadzenie do AI\2026-05-27_17-55-10.mp3', 'rb'), 'audio/mpeg')}
data = {'model': 'whisper-large-v3-turbo', 'language': 'pl', 'response_format': 'verbose_json', 'timestamp_granularities[]': 'word'}
headers = {'Authorization': f'Bearer {key}'}

resp = httpx.post(url, files=files, data=data, headers=headers, timeout=120)
result = resp.json()

words = result.get('words', [])
lines = []
i = 0
sub_num = 1
while i < len(words):
    start = words[i]['start']
    end = words[i]['end']
    parts = [words[i]['word']]
    i += 1

    while i < len(words) and (words[i]['start'] - start) < 5.0:
        end = words[i]['end']
        parts.append(words[i]['word'])
        i += 1

    text = ' '.join(parts)

    sh, ss = divmod(int(start), 60)
    sm = int(round((start % 1) * 1000))
    eh, es = divmod(int(end), 60)
    em = int(round((end % 1) * 1000))

    lines.append(str(sub_num))
    lines.append(f'{sh:02d}:{ss:02d},{sm:03d} --> {eh:02d}:{es:02d},{em:03d}')
    lines.append(text.strip())
    lines.append('')
    sub_num += 1

srt_content = '\r\n'.join(lines)

path = r'E:\!!promptuj\kursy\free\Wprowadzenie do AI\napisy.srt'
enc = srt_content.encode('utf-8')
with open(path, 'wb') as f:
    f.write(enc)

print(f'Done! {sub_num - 1} subtitles, file size: {len(enc)} bytes')
