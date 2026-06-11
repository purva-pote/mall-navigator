from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import heapq

app = FastAPI()

# Secure CORS permissions
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

# 1. Enriched Blueprint Data Network
mall_graph = {
    'Nike': {
        'Adidas': {'weight': 25, 'instruction': 'Turn left from Nike and walk down the central atrium past the fountain'},
        'Shaheen_Grocers': {'weight': 40, 'instruction': 'Walk straight from Nike down the east corridor past the seating area'}
    },
    'Adidas': {
        'Nike': {'weight': 25, 'instruction': 'Walk straight back towards the central atrium'},
        'AM_PM': {'weight': 25, 'instruction': 'Keep moving straight past Adidas, then take a sharp right at the corner elevator block'}
    },
    'AM_PM': {
        'Adidas': {'weight': 25, 'instruction': 'Head back to the corner elevator block and turn left'},
        'Reebok': {'weight': 60, 'instruction': 'Take the elevator next to AM_PM up to the 1st Floor, exit right, and walk 60 meters'}
    },
    'Reebok': {
        'AM_PM': {'weight': 60, 'instruction': 'Walk down the 1st Floor corridor, take the elevator down to the Ground Floor'},
        'Limelight': {'weight': 20, 'instruction': 'Turn right from Reebok and walk past the escalators'}
    },
    'Limelight': {
        'Reebok': {'weight': 20, 'instruction': 'Walk past the escalators towards Reebok'},
        'Shaheen_Grocers': {'weight': 30, 'instruction': 'Take the stairs next to Limelight down to the Ground Floor exit'}
    },
    'Shaheen_Grocers': {
        'Limelight': {'weight': 30, 'instruction': 'Go through the Ground Floor exit and take the stairs up to Limelight'},
        'Nike': {'weight': 40, 'instruction': 'Walk straight past the seating area toward the Nike storefront'}
    }
}

# 2. Upgraded Dijkstra Engine for Nested Dictionaries
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
            
        # FIX: Loop through the dictionary entries using .items()
        for neighbor, edge_data in graph[current_store].items():
            weight = edge_data['weight'] # Safely pull the numerical weight
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


# 3. The Enriched API Route
@app.get("/navigate")
def get_route(start: str, destination: str):
    if start not in mall_graph or destination not in mall_graph:
        raise HTTPException(status_code=400, detail="Store name not found in this mall database.")
        
    # Run the math router
    route, total_distance = find_shortest_path(mall_graph, start, destination)
    
    # 4. Human Direction Translation Layer
    # Loop through our completed path and grab the specific text strings connecting them
    human_directions = []
    for i in range(len(route) - 1):
        current_node = route[i]
        next_node = route[i+1]
        step_instruction = mall_graph[current_node][next_node]['instruction']
        human_directions.append(step_instruction)
        
    # Return the enriched dataset down to React
    return {
        "status": "success",
        "shortest_path": route,
        "distance": total_distance,
        "directions": human_directions  # Added text list!
    }