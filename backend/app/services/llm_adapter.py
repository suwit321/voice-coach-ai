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
        self.client = OpenAI(api_key=api_key, timeout=25.0)
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
                temperature=0.7,
                timeout=25.0
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            raise e

class AnthropicAdapter(LLMAdapter):
    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20240620"):
        import anthropic
        self.client = anthropic.Anthropic(api_key=api_key, timeout=25.0)
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
            response = self.model.generate_content(
                prompt,
                request_options={"timeout": 25.0}
            )
            raw = (response.text or "").strip()
            # Strip markdown formatting
            if raw.startswith("```json"):
                raw = raw[7:]
            elif raw.startswith("```"):
                raw = raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()
            
            # Extract between first { and last }
            s_idx = raw.find("{")
            e_idx = raw.rfind("}")
            if s_idx != -1 and e_idx != -1:
                raw = raw[s_idx:e_idx + 1]

            return json.loads(raw)
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            raise e

class OllamaAdapter(LLMAdapter):
    def __init__(self, api_key: str = "ollama", model: str = "llama3.2"):
        from openai import OpenAI
        base_url = "http://localhost:11434/v1"
        clean_key = (api_key or "").strip()
        if clean_key.startswith("http://") or clean_key.startswith("https://"):
            base_url = clean_key
            clean_key = "ollama"
        if not base_url.endswith("/v1"):
            base_url = f"{base_url.rstrip('/')}/v1"
            
        self.client = OpenAI(base_url=base_url, api_key=clean_key or "ollama", timeout=45.0)
        self.model = model or "llama3.2"

    def generate_feedback(self, prompt: str, metrics: dict, transcript: str, preset_config: dict) -> dict:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful Voice Coach AI. Please format your response in valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                timeout=45.0
            )
            raw = (response.choices[0].message.content or "").strip()
            # Extract JSON if extra text returned
            s_idx = raw.find("{")
            e_idx = raw.rfind("}")
            if s_idx != -1 and e_idx != -1:
                raw = raw[s_idx:e_idx + 1]
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Local Ollama error: {e}")
            raise e

def create_llm_adapter(provider: str, api_key: str, model: str) -> LLMAdapter:
    """Factory function to create the right adapter."""
    adapters = {
        'openai': OpenAIAdapter,
        'anthropic': AnthropicAdapter,
        'gemini': GeminiAdapter,
        'ollama': OllamaAdapter,
    }
    if provider not in adapters:
        raise ValueError(f"Unknown provider: {provider}")
    return adapters[provider](api_key=api_key, model=model)
