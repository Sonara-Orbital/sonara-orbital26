from fastapi import APIRouter

router = APIRouter()

## MOOD RECOMMENDER ##
@router.post("/mood")
async def get_recomendations():
    result = ["I want it that way", "Glory of love", "I want to break free", "I want to hold your hand", "I want you back"]
    return {"status": "success", "data": result}
