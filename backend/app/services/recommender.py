import logging
import re
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

from app.core.config import settings

logger = logging.getLogger(__name__)

def clean_text(text: Any) -> str:
    """Sanitizes text by removing special punctuation while preserving alphanumeric tokens."""
    if not isinstance(text, str) or pd.isna(text):
        return ""
    # Replace separators like | with spaces
    text = text.replace("|", " ").replace(",", " ")
    # Lowercase and strip redundant spaces
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text

def parse_pipe_list(value: Any) -> List[str]:
    """Splits pipe or comma separated strings into a clean list of unique tokens."""
    if not isinstance(value, str) or pd.isna(value):
        return []
    # If contains pipes
    if "|" in value:
        items = [x.strip() for x in value.split("|") if x.strip()]
    else:
        items = [x.strip() for x in value.split(",") if x.strip()]
    return sorted(list(set(items)))

class ContentBasedRecommender:
    """
    Production-grade Content-Based Movie Recommendation Engine.
    Employs TF-IDF Vectorization over combined metadata (Genres, Overview, Keywords)
    and Cosine Similarity for metric computation.
    """

    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or settings.DATASET_PATH
        self.df: pd.DataFrame = pd.DataFrame()
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.movie_id_to_idx: Dict[int, int] = {}
        self.idx_to_movie_id: Dict[int, int] = {}
        self.feature_names: List[str] = []
        self._is_initialized = False

    def load_and_prepare_dataset(self) -> pd.DataFrame:
        """Loads and cleans the movie dataset from CSV."""
        try:
            df = pd.read_csv(self.data_path)
            logger.info("Loaded raw dataset from %s with %d rows", self.data_path, len(df))
        except Exception as e:
            logger.error("Failed to read dataset from %s: %s", self.data_path, e)
            df = pd.DataFrame(columns=[
                "movie_id", "title", "overview", "genres", "keywords",
                "release_date", "vote_average", "vote_count", "poster_path", "backdrop_path"
            ])

        # Ensure required columns exist
        required_cols = [
            "movie_id", "title", "overview", "genres", "keywords",
            "release_date", "vote_average", "vote_count", "poster_path", "backdrop_path"
        ]
        for col in required_cols:
            if col not in df.columns:
                df[col] = ""

        # Drop duplicate movie_ids if any, keeping first
        df = df.drop_duplicates(subset=["movie_id"]).copy()
        
        # Coerce types
        df["movie_id"] = pd.to_numeric(df["movie_id"], errors="coerce").fillna(0).astype(int)
        df = df[df["movie_id"] > 0].copy()
        
        df["vote_average"] = pd.to_numeric(df["vote_average"], errors="coerce").fillna(0.0)
        df["vote_count"] = pd.to_numeric(df["vote_count"], errors="coerce").fillna(0).astype(int)
        df["title"] = df["title"].fillna("Untitled Movie").astype(str)
        df["overview"] = df["overview"].fillna("").astype(str)
        df["genres"] = df["genres"].fillna("").astype(str)
        df["keywords"] = df["keywords"].fillna("").astype(str)
        df["release_date"] = df["release_date"].fillna("").astype(str)
        df["poster_path"] = df["poster_path"].fillna("").astype(str)
        df["backdrop_path"] = df["backdrop_path"].fillna("").astype(str)

        # Reset index
        df = df.reset_index(drop=True)
        return df

    def fit(self):
        """Builds TF-IDF feature space and index maps."""
        self.df = self.load_and_prepare_dataset()
        if self.df.empty:
            logger.warning("Movie dataset is empty. Recommender cannot fit.")
            self._is_initialized = False
            return

        # Build index lookups
        self.movie_id_to_idx = {int(row["movie_id"]): idx for idx, row in self.df.iterrows()}
        self.idx_to_movie_id = {idx: int(row["movie_id"]) for idx, row in self.df.iterrows()}

        # Create combined content representation
        # Weighting strategy: Repeat genres twice so genre matches carry substantial weight
        # alongside rich narrative overviews and specific plot keywords.
        combined_texts = []
        for _, row in self.df.iterrows():
            genres_clean = clean_text(row["genres"])
            keywords_clean = clean_text(row["keywords"])
            overview_clean = clean_text(row["overview"])
            # Combined feature string
            content_str = f"{genres_clean} {genres_clean} {keywords_clean} {keywords_clean} {overview_clean}"
            combined_texts.append(content_str.strip())

        self.df["combined_features"] = combined_texts

        # Initialize and fit TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(combined_texts)
        self.feature_names = self.vectorizer.get_feature_names_out().tolist()
        self._is_initialized = True
        logger.info(
            "TF-IDF Vectorizer fitted successfully. Matrix shape: %s, Vocab size: %d",
            self.tfidf_matrix.shape, len(self.feature_names)
        )

    def is_ready(self) -> bool:
        return self._is_initialized and self.tfidf_matrix is not None and not self.df.empty

    def get_movie_by_id(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Finds a movie dictionary by stable movie_id."""
        if not self.is_ready():
            return None
        idx = self.movie_id_to_idx.get(movie_id)
        if idx is None:
            return None
        return self._format_movie_dict(idx)

    def _format_movie_dict(self, idx: int) -> Dict[str, Any]:
        """Formats a movie row into an API-ready dictionary with parsed lists."""
        row = self.df.iloc[idx]
        genres_list = parse_pipe_list(row["genres"])
        keywords_list = parse_pipe_list(row["keywords"])
        return {
            "movie_id": int(row["movie_id"]),
            "title": str(row["title"]),
            "overview": str(row["overview"]),
            "genres": str(row["genres"]),
            "keywords": str(row["keywords"]),
            "genres_list": genres_list,
            "keywords_list": keywords_list,
            "release_date": str(row["release_date"]),
            "vote_average": round(float(row["vote_average"]), 1),
            "vote_count": int(row["vote_count"]),
            "poster_path": str(row["poster_path"]),
            "backdrop_path": str(row["backdrop_path"]),
        }

    def get_all_movies(
        self,
        genre: Optional[str] = None,
        min_rating: Optional[float] = None,
        search_query: Optional[str] = None,
        sort_by: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Filters and retrieves movies with pagination."""
        if not self.is_ready():
            return [], 0

        filtered = self.df.copy()

        # Genre filter
        if genre and genre.strip().lower() != "all":
            clean_g = genre.strip().lower()
            filtered = filtered[filtered["genres"].str.lower().str.contains(clean_g, na=False)]

        # Min rating filter
        if min_rating is not None and min_rating > 0:
            filtered = filtered[filtered["vote_average"] >= min_rating]

        # Search query filter (title or keywords)
        if search_query and search_query.strip():
            sq = search_query.strip().lower()
            title_match = filtered["title"].str.lower().str.contains(sq, na=False)
            kw_match = filtered["keywords"].str.lower().str.contains(sq, na=False)
            filtered = filtered[title_match | kw_match]

        # Sorting
        if sort_by == "rating_desc":
            filtered = filtered.sort_values(by="vote_average", ascending=False)
        elif sort_by == "rating_asc":
            filtered = filtered.sort_values(by="vote_average", ascending=True)
        elif sort_by == "release_desc":
            filtered = filtered.sort_values(by="release_date", ascending=False)
        elif sort_by == "release_asc":
            filtered = filtered.sort_values(by="release_date", ascending=True)
        elif sort_by == "title_asc":
            filtered = filtered.sort_values(by="title", ascending=True)
        elif sort_by == "popularity_desc":
            filtered = filtered.sort_values(by="vote_count", ascending=False)
        else:
            # Default: popular movies first
            filtered = filtered.sort_values(by="vote_count", ascending=False)

        total_count = len(filtered)
        paginated = filtered.iloc[offset : offset + limit]

        results = [self._format_movie_dict(idx) for idx in paginated.index]
        return results, total_count

    def get_all_genres(self) -> List[str]:
        """Extracts sorted distinct genres present in the dataset."""
        if not self.is_ready():
            return []
        all_genres = set()
        for g_str in self.df["genres"]:
            for g in parse_pipe_list(g_str):
                all_genres.add(g)
        return sorted(list(all_genres))

    def get_similar_movies(
        self,
        movie_id: int,
        top_n: int = 8,
        min_score: float = 0.01
    ) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Calculates cosine similarity between the selected movie's TF-IDF vector
        and all other movies in the dataset.
        
        Guarantees:
        - Excludes the selected movie itself.
        - Sorts eligible candidates in descending order by similarity.
        - Identifies shared keywords & genres for transparency.
        - Calculates exact cosine similarity bounded [0, 1].
        """
        if not self.is_ready():
            return None, []

        source_idx = self.movie_id_to_idx.get(movie_id)
        if source_idx is None:
            return None, []

        source_movie = self._format_movie_dict(source_idx)

        # Compute cosine similarity between source movie vector and all movie vectors
        # Since linear_kernel(A, B) on normalized TF-IDF equals cosine_similarity
        source_vector = self.tfidf_matrix[source_idx]
        similarity_scores = linear_kernel(source_vector, self.tfidf_matrix).flatten()

        # Build list of (index, score) pairs excluding the source movie itself
        eligible_pairs = []
        for idx, score in enumerate(similarity_scores):
            if idx == source_idx:
                continue  # Step 7: Exclude the selected movie itself
            eligible_pairs.append((idx, float(score)))

        # Step 8: Sort eligible movies by similarity score in descending order
        eligible_pairs.sort(key=lambda x: x[1], reverse=True)

        # Step 9: Take top N
        recommendations = []
        source_genres_set = set(source_movie["genres_list"])
        source_keywords_set = set(k.lower() for k in source_movie["keywords_list"])

        for idx, score in eligible_pairs[:top_n]:
            rec_dict = self._format_movie_dict(idx)
            
            # Find shared genres and keywords
            target_genres_set = set(rec_dict["genres_list"])
            target_keywords_set = set(k.lower() for k in rec_dict["keywords_list"])
            
            shared_g = sorted(list(source_genres_set.intersection(target_genres_set)))
            shared_k = sorted(list(source_keywords_set.intersection(target_keywords_set)))

            # Round similarity score to 4 decimal places
            clean_score = round(max(0.0, min(1.0, score)), 4)
            similarity_pct = round(clean_score * 100, 1)

            rec_dict["similarity_score"] = clean_score
            rec_dict["similarity_percentage"] = similarity_pct
            rec_dict["shared_genres"] = shared_g
            rec_dict["shared_keywords"] = shared_k

            recommendations.append(rec_dict)

        return source_movie, recommendations

    def compare_movies(self, source_id: int, target_id: int) -> Optional[Dict[str, Any]]:
        """
        Deep-dive mathematical vector comparison between two movies.
        Breaks down the dot product contribution of individual terms.
        """
        if not self.is_ready():
            return None

        src_idx = self.movie_id_to_idx.get(source_id)
        tgt_idx = self.movie_id_to_idx.get(target_id)
        if src_idx is None or tgt_idx is None:
            return None

        src_movie = self._format_movie_dict(src_idx)
        tgt_movie = self._format_movie_dict(tgt_idx)

        # Sparse vectors
        v1 = self.tfidf_matrix[src_idx].toarray().flatten()
        v2 = self.tfidf_matrix[tgt_idx].toarray().flatten()

        # Dot product element-wise
        element_product = v1 * v2
        cosine_sim = float(np.sum(element_product))
        cosine_sim = round(max(0.0, min(1.0, cosine_sim)), 4)

        # Top contributing terms
        contributing_indices = np.argsort(element_product)[::-1]
        top_terms = []
        for idx in contributing_indices:
            weight = element_product[idx]
            if weight <= 0.0001:
                break
            top_terms.append({
                "term": self.feature_names[idx],
                "source_weight": round(float(v1[idx]), 4),
                "target_weight": round(float(v2[idx]), 4),
                "contribution": round(float(weight), 4)
            })
            if len(top_terms) >= 12:
                break

        shared_genres = sorted(list(set(src_movie["genres_list"]).intersection(set(tgt_movie["genres_list"]))))
        shared_keywords = sorted(list(
            set(k.lower() for k in src_movie["keywords_list"]).intersection(
                set(k.lower() for k in tgt_movie["keywords_list"])
            )
        ))

        explanation = (
            f"Cosine similarity between '{src_movie['title']}' and '{tgt_movie['title']}' is "
            f"{cosine_sim} ({cosine_sim * 100:.1f}%). This score is determined by the dot product of their L2-normalized "
            f"TF-IDF feature vectors, where matching genre and keyword terms produce the highest directional alignment."
        )

        return {
            "source_movie": src_movie,
            "target_movie": tgt_movie,
            "similarity_score": cosine_sim,
            "similarity_percentage": round(cosine_sim * 100, 1),
            "shared_genres": shared_genres,
            "shared_keywords": shared_keywords,
            "top_contributing_terms": top_terms,
            "cosine_formula": "cos(θ) = (A · B) / (||A|| ||B||)",
            "explanation": explanation
        }

    def get_analytics_summary(self) -> Dict[str, Any]:
        """Returns statistics regarding the vector space, sparsity, and terms."""
        if not self.is_ready():
            return {
                "total_movies": 0,
                "vocabulary_size": 0,
                "matrix_shape": [0, 0],
                "sparsity_percentage": 100.0,
                "top_tfidf_terms": [],
                "genre_distribution": {},
                "score_distribution_samples": [],
                "algorithm_info": {}
            }

        total_movies = len(self.df)
        vocab_size = len(self.feature_names)
        shape = list(self.tfidf_matrix.shape)
        
        # Sparsity
        non_zeros = self.tfidf_matrix.nnz
        total_elements = shape[0] * shape[1] if shape[0] and shape[1] else 1
        sparsity = round((1.0 - (non_zeros / total_elements)) * 100, 2)

        # Top IDF terms (rarest, most distinctive) and highest average TF-IDF
        mean_tfidf = np.asarray(self.tfidf_matrix.mean(axis=0)).flatten()
        top_indices = np.argsort(mean_tfidf)[::-1][:15]
        top_terms = [
            {"term": self.feature_names[i], "mean_tfidf": round(float(mean_tfidf[i]), 4)}
            for i in top_indices
        ]

        # Genre distribution
        genre_dist: Dict[str, int] = {}
        for g_list in self.df["genres"]:
            for g in parse_pipe_list(g_list):
                genre_dist[g] = genre_dist.get(g, 0) + 1

        # Sample score distribution from first movie
        sample_scores = []
        if total_movies > 1:
            first_vec = self.tfidf_matrix[0]
            sims = linear_kernel(first_vec, self.tfidf_matrix).flatten()
            for s in sorted(sims[1:], reverse=True)[:10]:
                sample_scores.append(round(float(s), 4))

        return {
            "total_movies": total_movies,
            "vocabulary_size": vocab_size,
            "matrix_shape": shape,
            "sparsity_percentage": sparsity,
            "top_tfidf_terms": top_terms,
            "genre_distribution": genre_dist,
            "score_distribution_samples": sample_scores,
            "algorithm_info": {
                "vectorizer": "Scikit-Learn TfidfVectorizer",
                "stop_words": "English standard stopword dictionary",
                "ngram_range": "(1, 2) Unigram + Bigram feature capture",
                "sublinear_tf": True,
                "similarity_metric": "Cosine Similarity / Linear Kernel on L2-normalized vectors"
            }
        }

recommender = ContentBasedRecommender()
