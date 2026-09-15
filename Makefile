.PHONY: backend frontend dev install clean reset-demo

# Start the FastAPI backend with hot reload on http://localhost:8000.
backend:
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Start the Next.js frontend development server.
frontend:
	cd Frontend && npm run dev

# Start backend and frontend together. Ctrl+C stops both child processes.
dev:
	@set -e; \
	cleanup() { kill "$$backend_pid" "$$frontend_pid" 2>/dev/null || true; wait "$$backend_pid" "$$frontend_pid" 2>/dev/null || true; }; \
	trap 'cleanup; exit 130' INT TERM; \
	trap cleanup EXIT; \
	(cd backend && . venv/bin/activate && exec uvicorn app.main:app --reload --port 8000) & backend_pid=$$!; \
	(cd Frontend && exec npm run dev) & frontend_pid=$$!; \
	wait "$$backend_pid" "$$frontend_pid"

# Create the backend virtual environment if needed, then install both apps' dependencies.
install:
	@test -d backend/venv || python3 -m venv backend/venv
	backend/venv/bin/python -m pip install -r backend/requirements.txt
	cd Frontend && npm install

# Remove generated local dependencies and Python bytecode caches.
clean:
	rm -rf backend/venv Frontend/node_modules
	find backend -type d -name __pycache__ -prune -exec rm -rf {} +

# Remove only demo orders and reservations; users, menu items, and tables stay.
reset-demo:
	cd backend && . venv/bin/activate && python reset_demo_data.py
