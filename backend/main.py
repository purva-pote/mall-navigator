from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import heapq

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Store Floor Registry
# 1. Store Registry with Categories and Floors
store_registry = {
    "Nike": {"floor": "Ground Floor", "category": "Apparel"},
    "Adidas": {"floor": "Ground Floor", "category": "Apparel"},
    "AM_PM": {"floor": "Ground Floor", "category": "Food"},
    "Shaheen_Grocers": {"floor": "Ground Floor", "category": "Groceries"},
    "Elevator_GF": {"floor": "Ground Floor", "category": "Services"},
    "Elevator_1F": {"floor": "1st Floor", "category": "Services"},
    "Reebok": {"floor": "1st Floor", "category": "Apparel"},
    "Limelight": {"floor": "1st Floor", "category": "Apparel"},
    "Zara": {"floor": "1st Floor", "category": "Apparel"}
}

# 2. Multi-Floor Graph Blueprint
mall_graph = {
    # --- GROUND FLOOR ---
    'Nike': {
        'Adidas': {'weight': 25, 'instruction': 'Turn left from Nike and walk down the atrium toward Adidas'},
        'Shaheen_Grocers': {'weight': 40, 'instruction': 'Walk straight past the main entrance toward Shaheen Grocers'}
    },
    'Adidas': {
        'Nike': {'weight': 25, 'instruction': 'Walk back down the central hallway toward Nike'},
        'AM_PM': {'weight': 20, 'instruction': 'Keep straight past Adidas toward the AM_PM store'},
        'Elevator_GF': {'weight': 15, 'instruction': 'Turn right past Adidas toward the Ground Floor Elevator bank'}
    },
    'AM_PM': {
        'Adidas': {'weight': 20, 'instruction': 'Walk past AM_PM back toward Adidas'},
        'Elevator_GF': {'weight': 10, 'instruction': 'Head straight to the Ground Floor Elevator bank'}
    },
    'Shaheen_Grocers': {
        'Nike': {'weight': 40, 'instruction': 'Walk past the main entrance toward Nike'}
    },
    
    # --- VERTICAL TRANSIT BRIDGE (Ground Floor <-> 1st Floor) ---
    'Elevator_GF': {
        'Adidas': {'weight': 15, 'instruction': 'Exit the elevator and walk toward Adidas'},
        'AM_PM': {'weight': 10, 'instruction': 'Exit the elevator and head right to AM_PM'},
        'Elevator_1F': {'weight': 15, 'instruction': 'Take the Elevator up to the 1st Floor'} # Vertical Bridge
    },
    'Elevator_1F': {
        'Elevator_GF': {'weight': 15, 'instruction': 'Take the Elevator down to the Ground Floor'}, # Vertical Bridge
        'Reebok': {'weight': 20, 'instruction': 'Exit the 1st Floor elevator and turn left toward Reebok'},
        'Zara': {'weight': 30, 'instruction': 'Exit the 1st Floor elevator and head straight to Zara'}
    },
    
    # --- 1ST FLOOR ---
    'Reebok': {
        'Elevator_1F': {'weight': 20, 'instruction': 'Walk back toward the 1st Floor Elevator bank'},
        'Limelight': {'weight': 25, 'instruction': 'Walk straight past Reebok down the upper corridor to Limelight'}
    },
    'Limelight': {
        'Reebok': {'weight': 25, 'instruction': 'Head back down the upper corridor toward Reebok'}
    },
    'Zara': {
        'Elevator_1F': {'weight': 30, 'instruction': 'Walk toward the 1st Floor Elevator bank'}
    }
}

def find_shortest_path(graph, start, destination):
    distances = {store: float('inf') for store in graph}
    distances[start] = 0
    previous_stores = {store: None for store in graph}
    priority_queue = [(0, start)]
    
    while priority_queue:
        current_distance, current_store = heapq.heappop(priority_queue)
        
        if current_store == destination:
            break
        if current_distance > distances[current_store]:
            continue
            
        for neighbor, edge_data in graph[current_store].items():
            weight = edge_data['weight']
            distance = current_distance + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous_stores[neighbor] = current_store
                heapq.heappush(priority_queue, (distance, neighbor))
                
    path = []
    current = destination
    while current is not None:
        path.append(current)
        current = previous_stores[current]
    path.reverse()
    
    return path, distances[destination]

@app.get("/stores")
def get_stores():
    """Returns store directory with category and floor metadata."""
    return [
        {
            "name": store, 
            "floor": info["floor"], 
            "category": info["category"]
        } 
        for store, info in store_registry.items() 
        if not store.startswith("Elevator")  # Exclude internal elevator nodes from selection
    ]

@app.get("/navigate")
def get_route(start: str, destination: str):
    if start not in mall_graph or destination not in mall_graph:
        raise HTTPException(status_code=400, detail="Store location not found in mall database.")
        
    route, total_distance = find_shortest_path(mall_graph, start, destination)
    
    human_directions = []
    for i in range(len(route) - 1):
        curr_node = route[i]
        next_node = route[i+1]
        human_directions.append(mall_graph[curr_node][next_node]['instruction'])
        
    # Detect if path requires a floor transition
    start_floor = store_registry[start]["floor"]
    dest_floor = store_registry[destination]["floor"]
    requires_floor_change = start_floor != dest_floor
    
    return {
        "status": "success",
        "start_floor": start_floor,
        "destination_floor": dest_floor,
        "requires_floor_change": requires_floor_change,
        "shortest_path": route,
        "distance": total_distance,
        "directions": human_directions
    }