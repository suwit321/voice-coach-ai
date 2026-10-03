import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LLMAdapter(ABC):
    @abstractmethod
    def generate_feedback(self, prompt: str, metrics: dict, transcript: str, preset_config: dict) -> dict:
        pass

class OpenAIAdapter(LLMAdapter):
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        from openai import OpenAI
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    def generate_feedback(self, prompt: str, metrics: dict, transcript: str, preset_config: dict) -> dict:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful Voice Coach AI. Please format your response in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            raise e

class AnthropicAdapter(LLMAdapter):
    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20240620"):
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
    
    def generate_feedback(self, prompt: str, metrics: dict, transcript: str, preset_config: dict) -> dict:
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system="You are a helpful Voice Coach AI. Please format your response in valid JSON.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return json.loads(response.content[0].text)
        except Exception as e:
            logger.error(f"Anthropic error: {e}")
            raise e

class GeminiAdapter(LLMAdapter):
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)
    
    def generate_feedback(self, prompt: str, metrics: dict, transcript: str, preset_config: dict) -> dict:
        try:
            response = self.model.generate_content(prompt)
            # Assuming the prompt asks for JSON output
            text = response.text
            # Basic cleanup if markdown backticks are present
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            raise e

def create_llm_adapter(provider: str, api_key: str, model: str) -> LLMAdapter:
    """Factory function to create the right adapter."""
    adapters = {
        'openai': OpenAIAdapter,
        'anthropic': AnthropicAdapter,
        'gemini': GeminiAdapter,
    }
    if provider not in adapters:
        raise ValueError(f"Unknown provider: {provider}")
    return adapters[provider](api_key=api_key, model=model)
