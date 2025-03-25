"""Vibe Coding module for AI-assisted software development.

This module provides the VibeCoding class which is responsible for
understanding user's coding style, preferences, and assisting in
software development tasks.
"""

from typing import Dict, List, Optional
import logging
import json
import os

from lpm_kernel.L1.bio import Note
from lpm_kernel.api.services.user_llm_config_service import UserLLMConfigService
import openai

class VibeCoding:
    """Vibe Coding for AI-assisted software development.
    
    This class analyzes user's coding style and preferences to provide
    personalized coding assistance.
    
    Attributes:
        preferred_language: User's preferred natural language.
        coding_languages: List of programming languages the user works with.
        client: OpenAI client for generating code suggestions.
    """
    
    def __init__(self, preferred_language: str = "English", coding_languages: Optional[List[str]] = None):
        """Initialize the VibeCoding instance.
        
        Args:
            preferred_language: User's preferred natural language, default is 'English'.
            coding_languages: List of programming languages the user works with.
        """
        self.preferred_language = preferred_language
        self.coding_languages = coding_languages or ["Python", "JavaScript", "TypeScript"]
        
        # Initialize OpenAI client
        user_llm_config_service = UserLLMConfigService()
        user_llm_config = user_llm_config_service.get_available_llm()
        if user_llm_config is None:
            self.client = None
            self.model_name = None
        else:
            self.model_name = user_llm_config.chat_model_name
            self.client = openai.OpenAI(
                api_key=user_llm_config.chat_api_key,
                base_url=user_llm_config.chat_endpoint,
            )
    
    def analyze_coding_style(self, code_samples: List[str]) -> Dict:
        """Analyze user's coding style from provided code samples.
        
        Args:
            code_samples: List of code snippets to analyze.
            
        Returns:
            Dictionary containing analysis of coding style.
        """
        if not self.client:
            logging.error("OpenAI client not initialized")
            return {"error": "OpenAI client not initialized"}
        
        try:
            # Combine code samples for analysis
            combined_code = "\n\n".join(code_samples)
            
            # Generate prompt for analysis
            prompt = f"Analyze the following code and describe the coding style, patterns, and preferences:\n\n{combined_code}"
            
            # Get analysis from OpenAI
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a code analysis expert. Analyze the given code and describe the coding style, patterns, and preferences."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "status": "success",
                "analysis": analysis,
                "coding_languages": self.coding_languages
            }
            
        except Exception as e:
            logging.error(f"Error analyzing coding style: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def generate_code_suggestion(self, task_description: str, context: Optional[str] = None) -> Dict:
        """Generate code suggestions based on user's task description.
        
        Args:
            task_description: Description of the coding task.
            context: Optional context or existing code.
            
        Returns:
            Dictionary containing generated code suggestions.
        """
        if not self.client:
            logging.error("OpenAI client not initialized")
            return {"error": "OpenAI client not initialized"}
        
        try:
            # Prepare prompt
            prompt = f"Task: {task_description}\n"
            if context:
                prompt += f"Context/Existing Code:\n{context}\n"
            
            prompt += "\nPlease generate code for this task that matches my coding style."
            
            # Get code suggestion from OpenAI
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert programmer who understands the user's coding style and preferences. Generate code that matches their style."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            suggestion = response.choices[0].message.content
            
            return {
                "status": "success",
                "suggestion": suggestion
            }
            
        except Exception as e:
            logging.error(f"Error generating code suggestion: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def save_coding_preferences(self, preferences: Dict, output_path: str) -> Dict:
        """Save user's coding preferences to a file.
        
        Args:
            preferences: Dictionary containing coding preferences.
            output_path: Path to save the preferences.
            
        Returns:
            Dictionary indicating success or failure.
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(preferences, f, ensure_ascii=False, indent=4)
                
            return {
                "status": "success",
                "message": "Coding preferences saved successfully",
                "path": output_path
            }
            
        except Exception as e:
            logging.error(f"Error saving coding preferences: {str(e)}")
            return {"status": "error", "message": str(e)}
