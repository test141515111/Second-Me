from flask import Blueprint, request, jsonify
import logging
from lpm_kernel.L2.l2_generator import L2Generator
from lpm_kernel.file_data.trainprocess_service import TrainProcessService, ProcessStep

# Create blueprint
secondbrain_bp = Blueprint('secondbrain', __name__, url_prefix='/api/secondbrain')
logger = logging.getLogger(__name__)

@secondbrain_bp.route('/build', methods=['POST'])
def build_second_brain():
    """
    Build a Second Brain from user's data.
    
    This endpoint triggers the Second Brain building process.
    """
    try:
        # Get train process service
        train_process_service = TrainProcessService()
        
        # Check if the required steps are completed
        if not train_process_service.is_step_completed(ProcessStep.MAP_ENTITY_NETWORK):
            return jsonify({
                "status": "error",
                "message": "Entity network mapping must be completed before building Second Brain"
            }), 400
            
        # Start the Second Brain building process
        success = train_process_service.build_second_brain()
        
        if success:
            return jsonify({
                "status": "success",
                "message": "Second Brain building process started successfully"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to start Second Brain building process"
            }), 500
            
    except Exception as e:
        logger.error(f"Error building Second Brain: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error building Second Brain: {str(e)}"
        }), 500

@secondbrain_bp.route('/status', methods=['GET'])
def get_second_brain_status():
    """
    Get the status of the Second Brain building process.
    """
    try:
        # Get train process service
        train_process_service = TrainProcessService()
        
        # Check if the Second Brain building step is completed
        is_completed = train_process_service.is_step_completed(ProcessStep.BUILD_SECOND_BRAIN)
        
        return jsonify({
            "status": "success",
            "data": {
                "is_completed": is_completed
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting Second Brain status: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error getting Second Brain status: {str(e)}"
        }), 500

@secondbrain_bp.route('/graph', methods=['GET'])
def get_knowledge_graph():
    """
    Get the knowledge graph data for visualization.
    """
    try:
        # Get L2Generator instance
        l2_generator = L2Generator()
        
        # Get graph data
        graph_data = l2_generator.get_knowledge_graph()
        
        return jsonify({
            "status": "success",
            "data": graph_data
        })
        
    except Exception as e:
        logger.error(f"Error getting knowledge graph: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error getting knowledge graph: {str(e)}"
        }), 500

@secondbrain_bp.route('/node/<node_id>', methods=['GET'])
def get_node_details(node_id):
    """
    Get details for a specific node in the knowledge graph.
    """
    try:
        # Get L2Generator instance
        l2_generator = L2Generator()
        
        # Get node details
        node_details = l2_generator.get_node_details(node_id)
        
        if node_details:
            return jsonify({
                "status": "success",
                "data": node_details
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Node with ID {node_id} not found"
            }), 404
            
    except Exception as e:
        logger.error(f"Error getting node details: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Error getting node details: {str(e)}"
        }), 500
