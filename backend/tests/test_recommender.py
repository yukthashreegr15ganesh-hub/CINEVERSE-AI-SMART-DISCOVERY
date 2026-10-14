import os
import tempfile
import pytest
import pandas as pd
import numpy as np
from app.services.recommender import ContentBasedRecommender, clean_text, parse_pipe_list

def test_clean_text_normalizes():
    assert clean_text("Action | Sci-Fi, Adventure") == "action sci-fi adventure"
    assert clean_text(None) == ""
    assert clean_text(123) == ""
    assert clean_text("  SPACED   OUT  ") == "spaced out"

def test_parse_pipe_list():
    assert parse_pipe_list("Action|Sci-Fi|Adventure") == ["Action", "Adventure", "Sci-Fi"]
    assert parse_pipe_list("Drama, Crime, Mystery") == ["Crime", "Drama", "Mystery"]
    assert parse_pipe_list("") == []
    assert parse_pipe_list(None) == []

def test_recommender_fit_and_tfidf_generation():
    # Valid CSV with quoted keyword strings containing commas
    data = (
        'movie_id,title,overview,genres,keywords,release_date,vote_average,vote_count,poster_path,backdrop_path\n'
        '1,Space Heist,A group of astronauts steal a secret prototype from a space station.,Science Fiction|Action,"astronaut,heist,space",2020-01-01,8.0,100,,\n'
        '2,Interstellar Journey,Explorers travel across space to find a habitable new planet.,Adventure|Science Fiction,"space,astronaut,planet",2021-01-01,8.5,200,,\n'
        '3,Romantic Paris,Two lovers meet in Paris and share passionate moments.,Romance|Drama,"love,paris,dating",2019-05-01,7.0,50,,\n'
        '4,Deep Cosmos,Astronauts journey into deep space confronting an alien anomaly.,Science Fiction|Mystery,"space,astronaut,anomaly",2022-03-01,7.8,120,,\n'
    )
    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".csv") as tf:
        tf.write(data)
        tf_path = tf.name
    tf.close()

    try:
        engine = ContentBasedRecommender(data_path=tf_path)
        engine.fit()

        assert engine.is_ready() is True
        assert len(engine.df) == 4
        assert engine.tfidf_matrix is not None
        assert engine.tfidf_matrix.shape[0] == 4
        # Verify vocabulary contains terms
        assert any(t in engine.feature_names for t in ["astronaut", "space", "heist"])
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)

def test_recommendation_ordering_and_exclusion():
    data = (
        'movie_id,title,overview,genres,keywords,release_date,vote_average,vote_count,poster_path,backdrop_path\n'
        '10,Space Heist,A team of elite astronauts embark on a cosmic heist in space.,Science Fiction|Action,"space,astronaut,heist",2020-01-01,8.0,100,,\n'
        '20,Deep Space,Explorers travel across the galaxy in a spaceship.,Adventure|Science Fiction,"space,astronaut,galaxy",2021-01-01,8.5,200,,\n'
        '30,Paris Sunset,A couple falls in love under the Eiffel tower in Paris.,Romance|Drama,"love,paris,romance",2019-05-01,7.0,50,,\n'
    )
    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".csv") as tf:
        tf.write(data)
        tf_path = tf.name
    tf.close()

    try:
        engine = ContentBasedRecommender(data_path=tf_path)
        engine.fit()

        source, recs = engine.get_similar_movies(movie_id=10, top_n=2)
        assert source is not None
        assert source["movie_id"] == 10

        # Step 7 Check: Exclude the selected movie itself
        rec_ids = [r["movie_id"] for r in recs]
        assert 10 not in rec_ids

        # Step 8 Check: Sorted in descending order
        scores = [r["similarity_score"] for r in recs]
        assert scores == sorted(scores, reverse=True)

        # Deep Space (movie 20) should have higher similarity than Paris Sunset (movie 30)
        assert rec_ids[0] == 20
        assert scores[0] > scores[1]
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)

def test_empty_dataset_handling():
    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".csv") as tf:
        tf.write("movie_id,title,overview,genres,keywords,release_date,vote_average,vote_count,poster_path,backdrop_path\n")
        tf_path = tf.name
    tf.close()

    try:
        engine = ContentBasedRecommender(data_path=tf_path)
        engine.fit()
        assert engine.is_ready() is False
        src, recs = engine.get_similar_movies(movie_id=999)
        assert src is None
        assert recs == []
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)

def test_missing_metadata_and_duplicates():
    # Has empty overview, missing keywords, and duplicate movie_id
    data = (
        'movie_id,title,overview,genres,keywords,release_date,vote_average,vote_count,poster_path,backdrop_path\n'
        '1,Incomplete Movie,,Action,,2020-01-01,7.0,10,,\n'
        '1,Incomplete Duplicate,,Action,,2020-01-01,7.0,10,,\n'
        '2,Another Movie,Some description here,Drama,life,2021-01-01,8.0,20,,\n'
    )
    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".csv") as tf:
        tf.write(data)
        tf_path = tf.name
    tf.close()

    try:
        engine = ContentBasedRecommender(data_path=tf_path)
        engine.fit()
        assert engine.is_ready() is True
        # Deduplication check: should only have 2 unique movies
        assert len(engine.df) == 2
        # Verify empty overview doesn't break recommender
        src, recs = engine.get_similar_movies(movie_id=1, top_n=2)
        assert src is not None
        assert src["title"] == "Incomplete Movie"
    finally:
        if os.path.exists(tf_path):
            os.remove(tf_path)

def test_invalid_movie_id():
    engine = ContentBasedRecommender()
    engine.fit()
    src, recs = engine.get_similar_movies(movie_id=9999999)
    assert src is None
    assert recs == []
