from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from google.cloud import speech
from google.oauth2 import service_account

from config import GOOGLE_STT_KEY

router = APIRouter()


def _get_client():
    credentials = service_account.Credentials.from_service_account_file(GOOGLE_STT_KEY)
    return speech.SpeechClient(credentials=credentials)


class STTResponse(BaseModel):
    transcript: str


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    content = await audio.read()
    if not content:
        raise HTTPException(status_code=400, detail="오디오 파일이 비어있습니다.")

    client = _get_client()

    audio_data = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code="ko-KR",
    )

    try:
        response = client.recognize(config=config, audio=audio_data)
        transcript = " ".join(
            result.alternatives[0].transcript
            for result in response.results
            if result.alternatives
        )
        return STTResponse(transcript=transcript or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"음성 인식 오류: {str(e)}")
