from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scraper import search_products

from openai import OpenAI

import os


# =========================
# FASTAPI
# =========================

app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



# =========================
# PRODUCT SEARCH
# =========================

@app.get("/search")

def search(q: str):

    results = search_products(q)

    return {

        "results": results

    }


# =========================
# AI CHAT
# =========================

import requests


HF_TOKEN = "Your_HF_Token"


@app.post("/chat")
async def chat(data: dict):

    message = data.get("message", "")

    try:

        API_URL = (
            "https://api-inference.huggingface.co/models/"
            "mistralai/Mistral-7B-Instruct-v0.2"
        )

        headers = {
            "Authorization":
            f"Bearer {HF_TOKEN}"
        }

        payload = {
            "inputs":
            f"""
            You are an AI shopping assistant.

            User:
            {message}
            """
        }

        response = requests.post(

            API_URL,

            headers=headers,

            json=payload

        )

        result = response.json()

        if isinstance(result, list):

            reply = result[0]["generated_text"]

        else:

            reply = "AI unavailable"

        return {

            "reply": reply

        }

    except Exception as e:

        return {

            "reply": str(e)

        }