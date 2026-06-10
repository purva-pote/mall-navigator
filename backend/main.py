from fastapi import FastAPI, HTTPException
import heapq

# 1. Initialize the web server application
app = FastAPI()

# Our blueprint database graph from the image
mall_graph = {
    'Nike': [('Adidas', 25), ('Shaheen_Grocers', 40)],
    'Adidas': [('Nike', 25), ('AM_PM', 25)],
    'AM_PM': [('Adidas', 25), ('Reebok', 60)],
    'Reebok': [('AM_PM', 60), ('Limelight', 20)],
    'Limelight': [('Reebok', 20), ('Shaheen_Grocers', 30)],
    'Shaheen_Grocers': [('Limelight', 30), ('Nike', 40)]
}

# (Your exact Dijkstra function from earlier remains unchanged here)
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
        for neighbor, weight in graph[current_store]:
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


# 2. Create the "Navigate" route/endpoint
# This exposes our function to the internet at the URL path: /navigate
@app.get("/navigate")
def get_route(start: str, destination: str):
    # Error Handling: What if a user inputs a store that doesn't exist?
    if start not in mall_graph or destination not in mall_graph:
        raise HTTPException(status_code=400, detail="Store name not found in this mall database.")
        
    # Run our core algorithm
    route, total_distance = find_shortest_path(mall_graph, start, destination)
    
    # Return the data as a clean JSON package to the frontend
    return {
        "status": "success",
        "shortest_path": route,
        "distance": total_distance
    }