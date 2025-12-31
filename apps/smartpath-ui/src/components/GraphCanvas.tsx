import { useRef, useEffect, useState } from 'react';
import { Node, Edge } from '../api/graphService';
import './GraphCanvas.css';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: number) => void;
  onNodeDrag: (nodeId: number, x: number, y: number) => void;
  onNodeDelete: (nodeId: number) => void;
  selectedFromNode: number | null;
  'data-testid'?: string;
}

export default function GraphCanvas({
  nodes,
  edges,
  onNodeClick,
  onNodeDrag,
  onNodeDelete,
  selectedFromNode,
  'data-testid': testId,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const nodeRadius = 25;
  const canvasWidth = 600;
  const canvasHeight = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvasWidth; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }

    for (let i = 0; i <= canvasHeight; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }

    edges.forEach((edge) => {
      const fromNode = nodes.find(n => n.id === edge.fromNodeId);
      const toNode = nodes.find(n => n.id === edge.toNodeId);

      if (!fromNode || !toNode) return;

      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const arrowSize = 12;
      const arrowX = toNode.x - Math.cos(angle) * nodeRadius;
      const arrowY = toNode.y - Math.sin(angle) * nodeRadius;

      ctx.fillStyle = '#999';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY - 10);
    });

    nodes.forEach((node) => {
      const isSelected = selectedFromNode === node.id;
      const isHovered = hoveredNode === node.id;

      ctx.fillStyle = isSelected ? '#4CAF50' : isHovered ? '#2196F3' : '#fff';
      ctx.strokeStyle = isSelected ? '#2E7D32' : '#333';
      ctx.lineWidth = isSelected ? 3 : 2;

      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    });
  }, [nodes, edges, selectedFromNode, hoveredNode]);

  const getNodeAtPoint = (x: number, y: number): number | null => {
    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= nodeRadius) {
        return node.id;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeId = getNodeAtPoint(x, y);

    if (nodeId !== null) {
      if (e.button === 2) {
        onNodeDelete(nodeId);
      } else {
        setDraggingNode(nodeId);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNodeId = getNodeAtPoint(x, y);
    setHoveredNode(hoveredNodeId);

    if (draggingNode !== null) {
      const node = nodes.find(n => n.id === draggingNode);
      if (node) {
        const newX = Math.max(nodeRadius, Math.min(canvasWidth - nodeRadius, x));
        const newY = Math.max(nodeRadius, Math.min(canvasHeight - nodeRadius, y));
        onNodeDrag(draggingNode, newX, newY);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingNode !== null) {
      setDraggingNode(null);
    } else if (e.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nodeId = getNodeAtPoint(x, y);

      if (nodeId !== null) {
        onNodeClick(nodeId);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setHoveredNode(null)}
      onContextMenu={handleContextMenu}
      className="graph-canvas"
      data-testid={testId}
    />
  );
}
