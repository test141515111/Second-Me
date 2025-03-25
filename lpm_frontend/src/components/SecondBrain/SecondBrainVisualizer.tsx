'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface KnowledgeNode {
  id: string;
  name: string;
  type: 'topic' | 'entity' | 'document';
  size: number;
  color: string;
  position: [number, number, number];
  connections: string[];
}

interface SecondBrainVisualizerProps {
  nodes?: KnowledgeNode[];
  onNodeClick?: (nodeId: string) => void;
  onInitialized?: () => void;
}

const SecondBrainVisualizer: React.FC<SecondBrainVisualizerProps> = ({
  nodes = [],
  onNodeClick,
  onInitialized
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkWebGLAvailability = (): boolean => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch {
        return false;
      }
    };

    // Store animation frame ID for cleanup
    let animationFrameId: number;
    // Store scene and renderer references for cleanup
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;

    // Function to initialize the visualization
    const initializeVisualization = () => {
      if (!containerRef.current) return;

      // Create scene
      scene = new THREE.Scene();
      sceneRef.current = scene;
      scene.background = new THREE.Color(0xf0f0f0);

      // Create camera
      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.z = 650;

      // Create renderer
      try {
        if (!checkWebGLAvailability()) {
          throw new Error('Your browser does not support WebGL');
        }

        renderer = new THREE.WebGLRenderer({ antialias: true });
        rendererRef.current = renderer;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        
        // Add orbit controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
      } catch (error) {
        console.error('WebGL renderer creation failed:', error);
        onInitialized?.();
        return;
      }

      // Define sphere radius
      const radius = 320;

      // Create default nodes if none provided
      const visualizationNodes = nodes.length > 0 ? nodes : generateDefaultNodes(radius);

      // Create materials for different node types
      const nodeMaterials = {
        'topic': new THREE.MeshBasicMaterial({ color: 0x4ecdc4 }),
        'entity': new THREE.MeshBasicMaterial({ color: 0xff6b6b }),
        'document': new THREE.MeshBasicMaterial({ color: 0xffd93d })
      };

      // Create geometries for different node sizes
      const nodeGeometries = {
        small: new THREE.SphereGeometry(3, 16, 16),
        medium: new THREE.SphereGeometry(4, 16, 16),
        large: new THREE.SphereGeometry(5, 16, 16)
      };

      // Create nodes
      visualizationNodes.forEach((node) => {
        // Determine geometry based on node size
        let geometry;
        if (node.size <= 0.9) {
          geometry = nodeGeometries.small;
        } else if (node.size <= 1.1) {
          geometry = nodeGeometries.medium;
        } else {
          geometry = nodeGeometries.large;
        }

        // Get material based on node type
        const material = nodeMaterials[node.type];
        
        // Create mesh
        const nodeMesh = new THREE.Mesh(geometry, material);
        nodeMesh.position.set(...node.position);
        
        // Store reference to the node object
        nodeObjectsRef.current.set(node.id, nodeMesh);
        
        // Add to scene
        scene.add(nodeMesh);
        
        // Add text label for the node
        addTextLabel(node, scene, camera);
      });

      // Create connections between nodes
      visualizationNodes.forEach((node) => {
        node.connections.forEach((connectedNodeId) => {
          const connectedNode = visualizationNodes.find(n => n.id === connectedNodeId);
          if (connectedNode && node.id < connectedNodeId) { // Prevent duplicate connections
            createConnection(node, connectedNode, scene, radius);
          }
        });
      });

      // Add raycaster for node interaction
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      // Handle mouse click
      const handleMouseClick = (event: MouseEvent) => {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const nodeObjects = Array.from(nodeObjectsRef.current.values());
        const intersects = raycaster.intersectObjects(nodeObjects);

        if (intersects.length > 0) {
          // Find the clicked node
          const clickedObject = intersects[0].object;
          const clickedNodeEntry = Array.from(nodeObjectsRef.current.entries())
            .find(([_, obj]) => obj === clickedObject);
          
          if (clickedNodeEntry && onNodeClick) {
            onNodeClick(clickedNodeEntry[0]);
          }
        }
      };

      // Add click event listener
      if (onNodeClick) {
        window.addEventListener('click', handleMouseClick);
      }

      // Animation
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, camera);
      };

      animate();

      // Mark as initialized
      setIsInitialized(true);

      // Notify parent component that initialization is complete
      if (onInitialized) {
        setTimeout(() => {
          onInitialized();
        }, 0);
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Initialize the visualization
    initializeVisualization();

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);

      // Remove click event listener if it was added
      if (onNodeClick) {
        window.removeEventListener('click', handleMouseClick);
      }

      // Cancel any pending animation frames
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Remove renderer from DOM
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }

      // Release resources
      if (sceneRef.current) {
        sceneRef.current.clear();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [nodes, onNodeClick, onInitialized]);

  // Generate random points on a sphere
  function randomSpherePoint(radius: number): [number, number, number] {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    return [x, y, z];
  }

  // Generate default nodes for visualization
  function generateDefaultNodes(radius: number): KnowledgeNode[] {
    const defaultNodes: KnowledgeNode[] = [];
    const nodeTypes: ('topic' | 'entity' | 'document')[] = ['topic', 'entity', 'document'];
    const sizes = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];

    // Create 30 nodes
    for (let i = 0; i < 30; i++) {
      defaultNodes.push({
        id: `node-${i}`,
        name: `Node ${i}`,
        type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        color: '',
        position: randomSpherePoint(radius),
        connections: []
      });
    }

    // Add random connections
    defaultNodes.forEach((node, index) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1; // 1-3 connections
      
      for (let i = 0; i < connectionCount; i++) {
        // Select a random node to connect to
        const targetIndex = Math.floor(Math.random() * defaultNodes.length);
        
        // Don't connect to self and avoid duplicate connections
        if (targetIndex !== index && !node.connections.includes(defaultNodes[targetIndex].id)) {
          node.connections.push(defaultNodes[targetIndex].id);
        }
      }
    });

    return defaultNodes;
  }

  // Create a connection between two nodes
  function createConnection(
    node1: KnowledgeNode,
    node2: KnowledgeNode,
    scene: THREE.Scene,
    radius: number
  ) {
    // Create curved arc geometry that follows the sphere's surface
    const points = [];

    // Calculate the great circle arc between the two points
    // First, normalize the positions to get direction vectors
    const startPos = new THREE.Vector3(...node1.position).normalize();
    const endPos = new THREE.Vector3(...node2.position).normalize();

    // Create intermediate points along the great circle arc
    const segments = 12; // More segments for smoother curves

    for (let j = 0; j <= segments; j++) {
      // Interpolation factor
      const t = j / segments;

      // Spherical linear interpolation (SLERP) between the two points
      const interpVec = new THREE.Vector3().copy(startPos).lerp(endPos, t).normalize();

      // Scale to the sphere radius
      const pointOnSphere = interpVec.multiplyScalar(radius);

      points.push(pointOnSphere);
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create connection with varying opacity based on distance
    const distance = new THREE.Vector3(...node1.position).distanceTo(new THREE.Vector3(...node2.position));
    const maxDistance = radius * 1.5;
    const opacity = Math.max(0.25, 0.45 - (distance / maxDistance) * 0.2);
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xadd8e6, // Light blue color
      transparent: true,
      opacity: opacity
    });

    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
  }

  // Add text label for a node
  function addTextLabel(node: KnowledgeNode, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw text
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '24px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.fillText(node.name, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    
    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(...node.position);
    sprite.position.multiplyScalar(1.1); // Position slightly outside the node
    sprite.scale.set(40, 20, 1);
    
    // Add to scene
    scene.add(sprite);
    
    // Update sprite to face camera
    sprite.userData.update = () => {
      sprite.lookAt(camera.position);
    };
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        opacity: isInitialized ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    />
  );
};

export default SecondBrainVisualizer;
