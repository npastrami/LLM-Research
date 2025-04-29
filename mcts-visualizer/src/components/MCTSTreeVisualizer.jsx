// src/components/MCTSTreeVisualizer.jsx
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './MCTSTreeVisualizer.css';

const MCTSTreeVisualizer = ({ treeData }) => {
  const [activeNode, setActiveNode] = useState(null);
  const [activeNodeParent, setActiveNodeParent] = useState(null);
  const [activeNodeChildren, setActiveNodeChildren] = useState([]);
  const svgRef = useRef(null);

  // Find parent and children when active node changes
  useEffect(() => {
    if (!activeNode || !treeData) return;
    
    // Find parent
    const findParent = (node, targetId, parent = null) => {
      if (!node) return null;
      if (node.id === targetId) return parent;
      
      if (node.children) {
        for (const child of node.children) {
          const result = findParent(child, targetId, node);
          if (result) return result;
        }
      }
      return null;
    };
    
    // Set parent and children
    setActiveNodeParent(findParent(treeData, activeNode.id));
    setActiveNodeChildren(activeNode.children || []);
  }, [activeNode, treeData]);

  useEffect(() => {
    if (!treeData || !svgRef.current) return;
    
    // Clear any existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = 700;
    
    // Get total number of nodes to adjust spacing
    const countNodes = (node) => {
      let count = 1;
      if (node.children) {
        node.children.forEach(child => {
          count += countNodes(child);
        });
      }
      return count;
    };
    
    const totalNodes = countNodes(treeData);
    const suggestedHeight = Math.max(700, totalNodes * 25);
    
    // Create a tree layout with adjusted size based on node count
    const treeLayout = d3.tree()
        .size([suggestedHeight - 100, width - 200]);
    
    // Create a hierarchy from the data
    const root = d3.hierarchy(treeData);
    
    // Count descendants for each node to adjust spacing
    root.count();
    
    // Assign x and y coordinates to each node
    treeLayout(root);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", suggestedHeight);
    
    // Main group for panning/zooming
    const g = svg.append("g")
        .attr("transform", "translate(100, 50)");
    
    // Add zoom functionality
    const zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    // Initialize with a centered view
    svg.call(zoom)
       .call(zoom.transform, d3.zoomIdentity
         .translate(width / 4, suggestedHeight / 4)
         .scale(0.8));
    
    // Add links between nodes
    g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
        .attr("fill", "none")
        .attr("stroke", "#999")
        .attr("stroke-width", 1.5);
    
    // Create node groups
    const nodes = g.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", (event, d) => {
            setActiveNode(d.data);
        });
    
    // Add circles to the nodes
    nodes.append("circle")
        .attr("r", d => Math.max(5, Math.min(15, Math.sqrt(d.data.visits || 1) * 2)))
        .attr("fill", d => d3.interpolateViridis(d.data.value || 0))
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);
    
    // Add labels to the nodes
    nodes.append("text")
        .attr("dy", -15)
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .text(d => `V:${d.data.visits || 0} Q:${(d.data.value || 0).toFixed(2)}`);

  }, [treeData]);

  return (
    <div className="tree-visualizer">
      <div className="instructions">
        <p>Click on nodes to see details. Use mouse wheel to zoom in/out and drag to pan.</p>
      </div>
      
      <div className="visualization-layout">
        <div className="tree-container">
          <svg ref={svgRef}></svg>
        </div>
        
        {activeNode && (
          <div className="node-details-container">
            <div className="node-details">
              <h3>Node Details</h3>
              
              <div className="detail-section">
                <h4>Current Node</h4>
                <p><strong>ID:</strong> {activeNode.id}</p>
                <p><strong>Visits:</strong> {activeNode.visits || 0}</p>
                <p><strong>Value:</strong> {(activeNode.value || 0).toFixed(4)}</p>
              </div>
              
              {activeNodeParent && (
                <div className="detail-section">
                  <h4>Parent Node</h4>
                  <p><strong>ID:</strong> {activeNodeParent.id}</p>
                  <p><strong>Visits:</strong> {activeNodeParent.visits || 0}</p>
                  <p><strong>Value:</strong> {(activeNodeParent.value || 0).toFixed(4)}</p>
                </div>
              )}
              
              {activeNodeChildren.length > 0 && (
                <div className="detail-section">
                  <h4>Children Nodes ({activeNodeChildren.length})</h4>
                  <div className="children-list">
                    {activeNodeChildren.map(child => (
                      <div key={child.id} className="child-node" onClick={() => setActiveNode(child)}>
                        ID: {child.id} | V: {child.visits || 0} | Q: {(child.value || 0).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeNode.answer && (
                <div className="detail-section answer-section">
                  <h4>Answer</h4>
                  <div className="answer-text">
                    {activeNode.answer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCTSTreeVisualizer;