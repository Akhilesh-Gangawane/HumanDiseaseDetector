"""
Launcher for the Disease Prediction API on Windows.
Sets up the DLL search path before uvicorn imports torch.
Run with: python run_server.py
"""
import os
import sys

# ── Windows DLL fix ──────────────────────────────────────────────
# vcruntime140.dll lives in the Python install dir, not System32.
# Prepend it to PATH so uvicorn's subprocess can find it.
if sys.platform == "win32":
    python_dir = os.path.dirname(sys.executable)
    current_path = os.environ.get("PATH", "")
    if python_dir not in current_path:
        os.environ["PATH"] = python_dir + os.pathsep + current_path

    import site
    for sp in site.getsitepackages():
        torch_lib = os.path.join(sp, "torch", "lib")
        if os.path.isdir(torch_lib):
            os.environ["PATH"] = torch_lib + os.pathsep + os.environ["PATH"]
            break

# ── Start uvicorn ────────────────────────────────────────────────
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
