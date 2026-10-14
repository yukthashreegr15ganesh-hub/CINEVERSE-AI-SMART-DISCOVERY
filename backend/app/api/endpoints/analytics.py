from fastapi import APIRouter
from app.schemas.movie import AnalyticsSummary
from app.services.recommender import recommender

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics():
    """Returns analytics and metrics about the TF-IDF feature space and dataset."""
    return recommender.get_analytics_summary()
