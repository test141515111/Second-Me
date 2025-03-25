from flask import Blueprint, request, jsonify
import logging
from lpm_kernel.L2.vibe_coding import VibeCoding

# Create blueprint
vibecoding_bp = Blueprint('vibecoding', __name__, url_prefix='/api/vibecoding')
logger = logging.getLogger(__name__)

@vibecoding_bp.route('/analyze', methods=['POST'])
def analyze_coding_style():
    """
    Analyze user's coding style from provided code samples.
    
    Request body:
    {
        "code_samples": [string],
        "preferred_language": string (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'code_samples' not in data:
            return jsonify({
                "status": "error",
                "message": "Missing required parameter: code_samples"
            }), 400
            
        code_samples = data.get('code_samples', [])
        preferred_language = data.get('preferred_language', 'English')
        
        # Create VibeCoding instance
        vibe_coding = VibeCoding(preferred_language=preferred_language)
        
        # Analyze coding style
        result = vibe_coding.analyze_coding_style(code_samples)
        
        if 'error' in result:
            return jsonify({
                "status": "error",
                "message": result['error']
            }), 500
            
        return jsonify({
            "status": "success",
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error analyzing coding style: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error analyzing coding style: {str(e)}"
        }), 500

@vibecoding_bp.route('/suggest', methods=['POST'])
def generate_code_suggestion():
    """
    Generate code suggestions based on user's task description.
    
    Request body:
    {
        "task_description": string,
        "context": string (optional),
        "preferred_language": string (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'task_description' not in data:
            return jsonify({
                "status": "error",
                "message": "Missing required parameter: task_description"
            }), 400
            
        task_description = data.get('task_description')
        context = data.get('context')
        preferred_language = data.get('preferred_language', 'English')
        
        # Create VibeCoding instance
        vibe_coding = VibeCoding(preferred_language=preferred_language)
        
        # Generate code suggestion
        result = vibe_coding.generate_code_suggestion(task_description, context)
        
        if 'error' in result:
            return jsonify({
                "status": "error",
                "message": result['error']
            }), 500
            
        return jsonify({
            "status": "success",
            "data": result
        })
        
    except Exception as e:
        logger.error(f"Error generating code suggestion: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error generating code suggestion: {str(e)}"
        }), 500

@vibecoding_bp.route('/preferences', methods=['POST'])
def save_coding_preferences():
    """
    Save user's coding preferences.
    
    Request body:
    {
        "preferences": object,
        "output_path": string (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'preferences' not in data:
            return jsonify({
                "status": "error",
                "message": "Missing required parameter: preferences"
            }), 400
            
        preferences = data.get('preferences')
        output_path = data.get('output_path', 'resources/coding_preferences.json')
        
        # Create VibeCoding instance
        vibe_coding = VibeCoding()
        
        # Save coding preferences
        result = vibe_coding.save_coding_preferences(preferences, output_path)
        
        if result['status'] == 'error':
            return jsonify({
                "status": "error",
                "message": result['message']
            }), 500
            
        return jsonify({
            "status": "success",
            "data": {
                "message": result['message'],
                "path": result['path']
            }
        })
        
    except Exception as e:
        logger.error(f"Error saving coding preferences: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error saving coding preferences: {str(e)}"
        }), 500
