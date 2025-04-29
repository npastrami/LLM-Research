import json
import os
from IPython.display import IFrame, display, HTML

def convert_mcts_to_json(mcts, max_nodes=300):
    """Convert MCTS tree to JSON format for D3.js visualization."""
    node_counter = [0]
    
    def process_node(node, parent_id=None):
        if node_counter[0] >= max_nodes:
            return None
            
        current_id = node_counter[0]
        node_counter[0] += 1
        
        # Get node data
        visits = getattr(node, 'visits', 0)
        value = getattr(node, 'value', 0.0)
        
        # For display purposes, truncate the answer text
        answer_text = getattr(node, 'answer', '')
        display_text = answer_text[:100] + '...' if len(answer_text) > 100 else answer_text
        
        # Create current node data
        current_node = {
            "id": current_id,
            "visits": visits,
            "value": float(value),
            "answer": answer_text,
            "children": []
        }
        
        # Process children
        for child in getattr(node, 'children', []):
            child_node = process_node(child, current_id)
            if child_node:
                current_node["children"].append(child_node)
                
        return current_node
    
    # Start with the root node
    root_data = process_node(mcts.root)
    return json.dumps(root_data)

def visualize_mcts_tree_d3(mcts, max_nodes=300):
    """Visualize MCTS tree using D3.js in a React component."""
    # Convert to JSON
    tree_data_json = convert_mcts_to_json(mcts, max_nodes)
    
    # Write JSON to a file
    with open("mcts_tree_data.json", "w") as f:
        f.write(tree_data_json)
    
    # Create HTML file that references the MCTSTreeVisualizer.jsx component
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>MCTS Tree Visualization</title>
        <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/d3@7"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .tree-container { width: 100%; height: 800px; }
        </style>
    </head>
    <body>
        <div id="root"></div>
        
        <script type="text/babel" src="MCTSTreeVisualizer.jsx"></script>
        <script type="text/babel">
            ReactDOM.render(
                <MCTSTreeVisualizer jsonFilePath="mcts_tree_data.json" />,
                document.getElementById('root')
            );
        </script>
    </body>
    </html>
    """
    
    with open("mcts_visualizer.html", "w") as f:
        f.write(html_content)
    
    print("Visualization files created. Open 'mcts_visualizer.html' in your browser to view.")
    print("Make sure MCTSTreeVisualizer.jsx is in the same directory.")