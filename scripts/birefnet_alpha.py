import sys
import os
import argparse


def resolve_device(device):
    if device is None or device == "auto":
        try:
            import torch
            if torch.cuda.is_available():
                return "cuda"
            if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                return "mps"
        except Exception:
            pass
        return "cpu"
    return device


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-path", required=True)
    parser.add_argument("--device", default=None)
    parser.add_argument("--usage", default="General")
    args = parser.parse_args()

    os.chdir(args.repo_path)
    sys.path.insert(0, args.repo_path)

    import torch
    device = resolve_device(args.device)
    if device == "cpu":
        n = os.cpu_count() or 4
        torch.set_num_threads(n)
        print(f"CPU mode — using {n} threads")

    print(f"PyTorch CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    from clip_manager import scan_clips, run_birefnet

    clips = scan_clips()
    if not clips:
        print("No clips found in ClipsForInference/")
        return

    print(f"Found {len(clips)} clip(s). Running BiRefNet ({args.usage}) on {device}...")
    run_birefnet(clips, device=device, usage=args.usage)
    print("BiRefNet alpha generation complete.")


if __name__ == "__main__":
    main()
