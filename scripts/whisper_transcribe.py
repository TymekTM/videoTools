import sys
import json
import argparse


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True)
    parser.add_argument("--model", default="base")
    args = parser.parse_args()

    try:
        import whisper

        model = whisper.load_model(args.model)
        result = model.transcribe(args.audio, word_timestamps=True)

        words = []
        for segment in result.get("segments", []):
            for w in segment.get("words", []):
                word_text = w.get("word", "").strip()
                if not word_text:
                    continue
                words.append({
                    "word": word_text,
                    "start": round(w.get("start", 0), 3),
                    "end": round(w.get("end", 0), 3),
                })

        duration = 0
        if result.get("segments"):
            duration = round(result["segments"][-1].get("end", 0), 3)

        json.dump({
            "text": result.get("text", ""),
            "words": words,
            "duration": duration,
        }, sys.stdout)
    except Exception as e:
        json.dump({"error": str(e)}, sys.stdout)
        sys.exit(1)


if __name__ == "__main__":
    main()
