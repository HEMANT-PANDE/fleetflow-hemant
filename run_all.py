import subprocess
import os
import sys

# Adjust paths if needed
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BACKEND_PATH = os.path.join(BASE_DIR, "backend")
AUTH_PATH = os.path.join(BASE_DIR, "Login-Auth", "backend")
FRONTEND_PATH = os.path.join(BASE_DIR, "frontend")


def start_process(command, cwd):
    return subprocess.Popen(
        command,
        cwd=cwd,
        shell=True
    )


def main():
    print("🚀 Starting All Services...\n")

    processes = []

    # 🔹 Start Main Backend
    print("Starting Main Backend...")
    processes.append(
        start_process(
            "uvicorn app.main:app --reload --port 8000",
            BACKEND_PATH
        )
    )

    # 🔹 Start Auth Backend
    print("Starting Auth Backend...")
    processes.append(
        start_process(
            "uvicorn app.main:app --reload --port 8001",
            AUTH_PATH
        )
    )

    # 🔹 Start Frontend
    print("Starting Frontend...")
    processes.append(
        start_process(
            "npm run dev",
            FRONTEND_PATH
        )
    )

    print("\n✅ All services started.\n")
    print("Press CTRL+C to stop everything.\n")

    try:
        for p in processes:
            p.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all services...")
        for p in processes:
            p.terminate()
        sys.exit(0)


if __name__ == "__main__":
    main()