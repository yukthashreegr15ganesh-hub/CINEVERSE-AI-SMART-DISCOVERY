import sqlite3
import logging
from typing import List, Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with Row factory enabled."""
    conn = sqlite3.connect(settings.SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema for persistent watchlist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS watchlist (
                movie_id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                overview TEXT,
                poster_path TEXT,
                backdrop_path TEXT,
                release_date TEXT,
                vote_average REAL,
                genres TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
    logger.info("Watchlist SQLite database initialized at %s", settings.SQLITE_PATH)

def fetch_all_watchlist() -> List[Dict[str, Any]]:
    """Retrieves all movies currently in the user's watchlist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM watchlist ORDER BY added_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def insert_watchlist(movie: Dict[str, Any]) -> bool:
    """Inserts a movie into the watchlist. Returns True if added, False if duplicate."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO watchlist (movie_id, title, overview, poster_path, backdrop_path, release_date, vote_average, genres)
                VALUES (:movie_id, :title, :overview, :poster_path, :backdrop_path, :release_date, :vote_average, :genres)
                """,
                {
                    "movie_id": movie["movie_id"],
                    "title": movie.get("title", "Untitled"),
                    "overview": movie.get("overview", ""),
                    "poster_path": movie.get("poster_path", ""),
                    "backdrop_path": movie.get("backdrop_path", ""),
                    "release_date": movie.get("release_date", ""),
                    "vote_average": movie.get("vote_average", 0.0),
                    "genres": movie.get("genres", "")
                }
            )
            conn.commit()
            return True
    except sqlite3.IntegrityError:
        # Already exists in watchlist
        return False

def delete_watchlist(movie_id: int) -> bool:
    """Removes a movie from the watchlist. Returns True if removed, False if not found."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM watchlist WHERE movie_id = ?", (movie_id,))
        conn.commit()
        return cursor.rowcount > 0

def check_watchlist_exists(movie_id: int) -> bool:
    """Checks if a movie is already present in the watchlist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM watchlist WHERE movie_id = ?", (movie_id,))
        return cursor.fetchone() is not None
