from pydantic import BaseModel
from typing import Optional, List

class AIRecommendRequest(BaseModel):
    mold_id: int
    branch_id: Optional[int] = None

class AIRecommendResponse(BaseModel):
    recommended_machine_id: int
    machine_code: str
    tonnage: int
    efficiency_gain_percent: float
    reasons: List[str]
