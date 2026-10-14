import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_api_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["engine_ready"] is True
    assert data["catalog_size"] > 0

def test_get_movies(client):
    response = client.get("/api/movies?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 10
    assert data["total"] >= 50

def test_genre_filter(client):
    response = client.get("/api/movies?genre=Animation")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for item in data["items"]:
        assert "Animation" in item["genres_list"]

def test_search_endpoint(client):
    response = client.get("/api/search?q=Inception")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    titles = [m["title"] for m in data["results"]]
    assert any("Inception" in t for t in titles)

def test_movie_details_and_not_found(client):
    # Valid movie ID (Inception = 1)
    response = client.get("/api/movies/1")
    assert response.status_code == 200
    data = response.json()
    assert data["movie_id"] == 1
    assert "Inception" in data["title"]
    assert len(data["genres_list"]) > 0

    # Invalid movie ID
    res_404 = client.get("/api/movies/99999999")
    assert res_404.status_code == 404

def test_recommendation_endpoint(client):
    # Movie 1 (Inception) should recommend sci-fi / mind / heist movies
    response = client.get("/api/recommendations/similar/1?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["source_movie"]["movie_id"] == 1
    assert len(data["recommendations"]) == 5
    
    # Self-exclusion
    rec_ids = [r["movie_id"] for r in data["recommendations"]]
    assert 1 not in rec_ids

    # Similarity score should be positive float
    for r in data["recommendations"]:
        assert 0.0 <= r["similarity_score"] <= 1.0
        assert r["similarity_percentage"] >= 0.0

def test_compare_endpoint(client):
    # Compare Inception (1) and Interstellar (2)
    response = client.get("/api/recommendations/compare?source_id=1&target_id=2")
    assert response.status_code == 200
    data = response.json()
    assert data["source_movie"]["movie_id"] == 1
    assert data["target_movie"]["movie_id"] == 2
    assert "similarity_score" in data
    assert "top_contributing_terms" in data
    assert len(data["top_contributing_terms"]) > 0

def test_watchlist_crud_lifecycle(client):
    movie_id = 4  # The Matrix
    
    # 1. Add to watchlist
    add_res = client.post("/api/watchlist", json={"movie_id": movie_id})
    assert add_res.status_code == 201
    assert add_res.json()["success"] is True

    # 2. Check watchlist listing
    list_res = client.get("/api/watchlist")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(item["movie_id"] == movie_id for item in items)

    # 3. Duplicate addition should be idempotent
    dup_res = client.post("/api/watchlist", json={"movie_id": movie_id})
    assert dup_res.status_code == 201

    # 4. Remove from watchlist
    del_res = client.delete(f"/api/watchlist/{movie_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. Delete again should return 404
    del_404 = client.delete(f"/api/watchlist/{movie_id}")
    assert del_404.status_code == 404

def test_analytics_summary(client):
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_movies"] > 0
    assert data["vocabulary_size"] > 0
    assert len(data["matrix_shape"]) == 2
    assert "top_tfidf_terms" in data
    assert len(data["top_tfidf_terms"]) > 0
