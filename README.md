# CINEVERSE DISCOVERY

> **Project Number:** 22  
> **Category:** Machine Learning + Full-Stack Web Development  
> **Roadmap Level:** AIML Level 2 Portfolio Project  
> **Architecture:** Decoupled FastAPI ML Backend + React 19 / TypeScript / Vite Cinematic Frontend  

---

## 1. Project Overview

**CINEVERSE DISCOVERY** is a full-stack, content-based movie recommendation platform that computes mathematical similarity scores between movies using real textual metadata. Unlike basic dashboards or mockup interfaces, Cineverse Discovery delivers an entertainment-grade, cinematic user experience backed by genuine Scikit-Learn machine learning algorithms, persistent SQLite storage, and a robust FastAPI backend.

### Problem Statement
Modern streaming platforms often rely on opaque black-box recommendations or collaborative filtering techniques that suffer from the *cold start problem* (inability to recommend items with few or no user ratings). Content-Based Filtering solves this by analyzing the intrinsic properties of the items themselves—extracting linguistic features from plot synopses, genre tags, and thematic keywords to compute high-dimensional feature vectors and recommend films that genuinely match the thematic DNA of a selected movie.

---

## 2. Key Features

- **Genuine Content-Based Filtering:**
  - Employs **TF-IDF Vectorization** (with unigrams and bigrams) across combined textual metadata (genres, narrative overviews, and keyword tags).
  - Computes cosine similarity scores bounded strictly between `0.0` and `1.0`.
  - Self-exclusion guarantee: The selected reference movie is automatically omitted from its own recommendation rankings.
  - Returns ranking position, exact score, percentage match, shared genres, and shared thematic tags.

- **Cinematic Frontend (React 19 + TypeScript + Tailwind CSS):**
  - Near-black cinematic aesthetic with subtle golden glow accents and glassmorphic panels.
  - Large featured artwork with multi-stage gradient vignettes.
  - Smooth hover interactions, card elevation, and poster zoom.
  - Horizontal movie carousels with arrow controls and responsive touch scrolling.
  - Graceful SVG/gradient poster fallbacks so no image ever displays broken icons.

- **Interactive Similarity Explorer:**
  - Dedicated recommendation studio to search and select any reference movie.
  - Dynamic slider to adjust returned recommendation count (4, 8, 12, or 16).
  - "Chain" button allowing immediate recursive exploration of recommended movies.
  - **Deep Vector Breakdown Modal**: Inspect the individual term dot products contributing to the cosine similarity score.

- **Multifaceted Search & Discovery:**
  - Real-time debounced search by title, overview snippets, and keyword descriptors.
  - Genre filter chips with multi-genre catalog support.
  - Minimum rating threshold filters (e.g. 7.5+ ★, 8.0+ ★).
  - Sorting by Popularity, Rating, Release Date, and Alphabetical order.

- **Persistent Watchlist (SQLite):**
  - Add and remove movies with optimistic UI updates and toast notifications.
  - Watchlist data is saved permanently to local SQLite (`watchlist.db`), persisting across browser sessions and tab refreshes.
  - Duplicate addition prevention and instant synchronized badge counts in the navigation bar.

- **Visual Analytics & Algorithm Mechanics:**
  - Comprehensive mathematical explanations of TF-IDF and Cosine Similarity.
  - Live vector space metrics: vocabulary size, document count, matrix shape, and sparsity percentage.
  - Interactive two-movie vector comparison simulator: pick any two movies and inspect their angle $\theta$ and term-by-term weights.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7 |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn (ASGI), Pydantic v2 |
| **Machine Learning** | Scikit-Learn (`TfidfVectorizer`, `linear_kernel`), Pandas, NumPy |
| **Database** | SQLite3 (Persistent local relational storage) |
| **Testing** | Pytest 8, FastAPI TestClient (HTTPX) |

---

## 4. Mathematical Algorithm Mechanics

### 4.1 Feature Vector Construction
For each movie $i$ in the dataset, a consolidated textual document $D_i$ is constructed by concatenating its cleaned metadata fields:

$$\text{CombinedFeatures}_i = \text{Clean}(\text{Genres}) \mathbin{\Vert} \text{Clean}(\text{Keywords}) \mathbin{\Vert} \text{Clean}(\text{Overview})$$

Genres are given double weighting to ensure categorical alignment remains prominent alongside rich plot synopses.

### 4.2 TF-IDF (Term Frequency - Inverse Document Frequency)
The vocabulary of $N$-grams ($1 \le n \le 2$) is converted into numerical weights using Scikit-Learn's `TfidfVectorizer`:

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \left( \ln\left( \frac{1 + |D|}{1 + \text{DF}(t, D)} \right) + 1 \right)$$

- **$\text{TF}(t, d)$**: The frequency of term $t$ in movie document $d$.
- **$\text{DF}(t, D)$**: Number of movies across the entire catalog containing term $t$.
- **Sublinear TF Scaling**: Replaces $\text{TF}$ with $1 + \ln(\text{TF})$ to dampen the effect of repetitive words.

### 4.3 Cosine Similarity
Because feature vectors are L2-normalized ($\|\mathbf{v}\|_2 = 1$), the cosine similarity between movie vector $\mathbf{A}$ and candidate movie vector $\mathbf{B}$ equals their dot product:

$$\text{Similarity}(\mathbf{A}, \mathbf{B}) = \cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\|_2 \|\mathbf{B}\|_2} = \sum_{k=1}^{M} A_k B_k$$

Where:
- Score ranges strictly from $0.0$ (orthogonal vectors, no shared features) to $1.0$ (identical feature distribution).
- **Transparency Note:** Cosine similarity measures textual metadata alignment between curated records; it does not represent a subjective viewer preference probability.

---

## 5. Project Architecture & Structure

```
cineverse-discovery/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── analytics.py        # Vector space metrics & analytics
│   │   │   │   ├── movies.py           # Catalog listing, details, genres, search
│   │   │   │   ├── recommendations.py  # Similar movie calculation & vector comparison
│   │   │   │   └── watchlist.py        # SQLite persistent watchlist CRUD
│   │   │   └── api.py                  # Router aggregation
│   │   ├── core/
│   │   │   ├── config.py               # Paths, CORS configuration & settings
│   │   │   └── database.py             # SQLite database connection & schema
│   │   ├── schemas/
│   │   │   └── movie.py                # Pydantic validation models
│   │   ├── services/
│   │   │   └── recommender.py          # Content-based recommendation engine
│   │   └── main.py                     # FastAPI application entry point
│   ├── data/
│   │   └── sample_movies.csv           # 70 curated movies with genres, overviews, artwork
│   ├── tests/
│   │   ├── test_api.py                 # 9 API integration tests
│   │   └── test_recommender.py         # 7 Recommender unit tests (math, ordering, edge cases)
│   ├── .env.example                    # Environment template
│   ├── pytest.ini                      # Pytest configuration
│   ├── requirements.txt                # Python backend dependencies
│   └── run_backend.ps1                 # Windows PowerShell backend launcher
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.tsx              # Technical credits & metadata notes
│   │   │   ├── HeroSection.tsx         # Featured movie banner with CTA buttons
│   │   │   ├── MovieCard.tsx           # Poster card with hover actions & similarity badge
│   │   │   ├── MovieCarousel.tsx       # Horizontal carousel with arrow controls
│   │   │   ├── MovieModal.tsx          # Full cinematic detail view & inline recs
│   │   │   ├── Navbar.tsx              # Logo, nav links, live badge, search trigger
│   │   │   ├── PosterFallback.tsx      # SVG/gradient placeholder for missing artwork
│   │   │   ├── SearchModal.tsx         # Debounced search dialog
│   │   │   └── SimilarityBadge.tsx     # Color-coded metric pill
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.tsx       # TF-IDF & Cosine Similarity visualizer
│   │   │   ├── DiscoverPage.tsx        # Filterable catalog grid with ratings & genres
│   │   │   ├── HomePage.tsx            # Cinematic hero + categorized streams
│   │   │   ├── SimilarMoviesPage.tsx   # Dedicated recommendation studio
│   │   │   └── WatchlistPage.tsx       # Saved movies persisted via SQLite
│   │   ├── services/
│   │   │   └── api.ts                  # Fetch API client
│   │   ├── types/
│   │   │   └── movie.ts                # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── styles.ts               # Tailwind merge utility
│   │   ├── App.tsx                     # Routing and global modal state
│   │   ├── index.css                   # Cinematic styling & glassmorphism
│   │   └── main.tsx                    # React DOM root
│   ├── package.json                    # Frontend dependencies
│   ├── vite.config.ts                  # Vite + Tailwind v4 configuration
│   └── run_frontend.ps1                # Windows PowerShell frontend launcher
│
├── .gitignore                          # Standard clean gitignore
└── README.md                           # Documentation
```

---

## 6. Local Setup and Execution (Windows PowerShell)

### Prerequisites
- **Python 3.10+** (verified on Python 3.10.11)
- **Node.js 18+** (verified on Node.js v25.8.2 / npm 11.11.1)
- Windows PowerShell

---

### Step 1: Backend Setup & Launch

Open a PowerShell terminal:

```powershell
# Navigate to the backend directory
cd backend

# Create Python virtual environment
python -m venv .venv

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install all backend requirements
python -m pip install --upgrade pip
pip install -r requirements.txt

# Start the FastAPI server using Uvicorn
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`
- **API Health Check:** `http://127.0.0.1:8000/api/health`

Alternatively, you can simply run the provided launcher script:
```powershell
.\run_backend.ps1
```

---

### Step 2: Frontend Setup & Launch

Open a second PowerShell terminal:

```powershell
# Navigate to the frontend directory
cd frontend

# Install node dependencies
npm install

# Start the Vite development server
npm run dev
```

- **Frontend Application URL:** `http://localhost:5173`

Alternatively, run:
```powershell
.\run_frontend.ps1
```

---

### Step 3: Run Automated Test Suite

In your backend terminal with the virtual environment activated:

```powershell
cd backend
.\.venv\Scripts\pytest -v
```

**Verified Test Results:**
```
======================== 16 passed, 1 warning in 1.77s ========================
tests/test_api.py::test_api_health PASSED                         [  6%]
tests/test_api.py::test_get_movies PASSED                         [ 12%]
tests/test_api.py::test_genre_filter PASSED                       [ 18%]
tests/test_api.py::test_search_endpoint PASSED                    [ 25%]
tests/test_api.py::test_movie_details_and_not_found PASSED        [ 31%]
tests/test_api.py::test_recommendation_endpoint PASSED            [ 37%]
tests/test_api.py::test_compare_endpoint PASSED                   [ 43%]
tests/test_api.py::test_watchlist_crud_lifecycle PASSED           [ 50%]
tests/test_api.py::test_analytics_summary PASSED                  [ 56%]
tests/test_recommender.py::test_clean_text_normalizes PASSED      [ 62%]
tests/test_recommender.py::test_parse_pipe_list PASSED            [ 68%]
tests/test_recommender.py::test_recommender_fit_and_tfidf_generation PASSED [ 75%]
tests/test_recommender.py::test_recommendation_ordering_and_exclusion PASSED [ 81%]
tests/test_recommender.py::test_empty_dataset_handling PASSED     [ 87%]
tests/test_recommender.py::test_missing_metadata_and_duplicates PASSED [ 93%]
tests/test_recommender.py::test_invalid_movie_id PASSED           [100%]
```

To run TypeScript verification and production build on the frontend:
```powershell
cd frontend
npm run build
```
*(Produces a production bundle in `frontend/dist` with 0 type errors).*

---

## 7. API Endpoints Reference

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, catalog size, and engine status |
| `GET` | `/api/movies` | Paginated movie catalog with genre, min_rating, and sort filters |
| `GET` | `/api/movies/{movie_id}` | Detailed metadata for a specific movie |
| `GET` | `/api/search?q={query}` | Debounced title & keyword search |
| `GET` | `/api/genres` | Distinct genre categories available in catalog |
| `GET` | `/api/recommendations/similar/{movie_id}?limit={n}` | Top-N content-based recommendations excluding self |
| `GET` | `/api/recommendations/compare?source_id={a}&target_id={b}` | Mathematical dot product breakdown of two movie vectors |
| `GET` | `/api/watchlist` | Retrieve all movies saved in SQLite watchlist |
| `POST` | `/api/watchlist` | Add movie to watchlist (`{ "movie_id": int }`) |
| `DELETE` | `/api/watchlist/{movie_id}` | Remove movie from SQLite watchlist |
| `GET` | `/api/analytics/summary` | Vector space statistics, matrix sparsity, and top TF-IDF words |

---

## 8. Limitations & Future Roadmap

### Current Limitations:
1. **Cold Metadata Dependency:** Recommendations are strictly based on textual metadata (genres, synopses, and keywords). Movies with sparse or generic synopses have lower discriminative power.
2. **Lexical Matching:** While TF-IDF captures exact term and bigram frequencies, it does not capture deep semantic analogies (e.g. knowing that "astronaut" and "cosmonaut" are synonymous) without dense vector embeddings.
3. **Local Catalog Scope:** Operates on the included 70-movie curated dataset to ensure complete offline independence without mandatory external API keys.

### Future Roadmap:
- **Dense Embeddings:** Incorporate Sentence-BERT (`all-MiniLM-L6-v2`) or HuggingFace embeddings for semantic representation alongside TF-IDF.
- **Hybrid Recommender:** Merge Content-Based Filtering with Collaborative Filtering (Matrix Factorization / SVD) as user rating interactions accumulate.
- **Live TMDB Streaming:** Enable optional live TMDB API key streaming via the backend proxy to dynamically fetch posters and trailer video clips.

---

## 9. GitHub Version Control Instructions

To initialize git and prepare your local repository:

```powershell
# In the project root directory
git init
git add .
git commit -m "feat: complete functional implementation of Cineverse Discovery movie recommender"

# Set remote origin (replace with your personal GitHub repository URL)
# git remote add origin https://github.com/<your-username>/cineverse-discovery.git
# git branch -M main
# git push -u origin main
```
*(Note: As per guidelines, this repository has not been pushed to GitHub without explicit authorization).*

---

## 10. Attribution & Licensing

- **Dataset & Metadata:** Curated for educational purposes based on public film descriptions from [The Movie Database (TMDB)](https://www.themoviedb.org/). This product uses the TMDB API and metadata but is not endorsed or certified by TMDB.
- **License:** Educational Open-Source. Created as part of the AIML Engineering Level 2 portfolio.
