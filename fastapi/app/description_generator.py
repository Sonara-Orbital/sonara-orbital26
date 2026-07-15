from ollama import chat
from pydantic import BaseModel

class SongDescriptionInput(BaseModel):
    description_string: str

def generate_song_description(title: str, artist: str, tags: list[str]) -> str:
    tag_list_str = ", ".join(tags)
    prompt = f"""
    Analyze these user-submitted music tags for the song '{title}' by '{artist}':
    Tags: {tag_list_str}
    
    Write a single, highly dense, descriptive paragraph summarizing the song's musical identity. 
    Incorporate the primary genres, historical era/decade, core instrumentation, and overall emotional mood or vibe implied by the tags.
    Keep it strictly factual to the context of the tags, avoiding dynamic filler or marketing hype.
    """

    response = chat("ollama/llama3.1", 
                    messages=[{'role': 'user', 'content': prompt}],
                    format=SongDescriptionInput.model_json_schema(),
                    options={'temperature': 0.1, 'max_tokens': 300})

    result = SongDescriptionInput.model_validate_json(response.message.content)
    return result.description_string

raw_tags = ["pop", "2000s", "guitar", "upbeat", "catchy"]
description = generate_song_description("Shape of You", "Ed Sheeran", raw_tags)
print(description)