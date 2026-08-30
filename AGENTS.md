# CallDine project rules

- Write clean, simple, short code. Do not over-engineer or add unnecessary abstractions or patterns.
- Build only what the user requests. Do not add unrequested features, error handling, or edge cases.
- Explain Python and FastAPI code in simple terms because the project owner is learning.
- Respect layer boundaries: API controllers never access AWS or the database directly. Services may call repositories, AI, and AWS modules.
- Use SQLModel and SQLite for database work.
- Prefer fewer lines when readability stays good.
- Do not install or suggest libraries unless the user asks for them.
- When a requirement is ambiguous, ask before making an assumption or expanding scope.
