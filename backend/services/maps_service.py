import aiohttp
import json
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class GoogleMapsService:
    """
    Serviço de integração com Google Maps API
    Para otimização de rotas e geocodificação
    """
    
    def __init__(self):
        self.api_key = "AIzaSyAaX8tnFvJxgAVBULK-3m__dTkOa1kgT2Q"
        self.base_url = "https://maps.googleapis.com/maps/api"
        
    async def geocode_address(self, address: str) -> Dict:
        """
        Converte endereço em coordenadas
        """
        try:
            url = f"{self.base_url}/geocode/json"
            params = {
                "address": address,
                "key": self.api_key,
                "region": "br",
                "language": "pt-BR"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data["status"] == "OK" and data["results"]:
                            result = data["results"][0]
                            location = result["geometry"]["location"]
                            
                            return {
                                "success": True,
                                "coordinates": {
                                    "lat": location["lat"],
                                    "lng": location["lng"]
                                },
                                "formatted_address": result["formatted_address"],
                                "place_id": result.get("place_id"),
                                "address_components": result.get("address_components", [])
                            }
                        else:
                            return {
                                "success": False,
                                "error": f"Geocoding failed: {data['status']}"
                            }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP Error: {response.status}"
                        }
                        
        except Exception as e:
            logger.error(f"Error in geocode_address: {e}")
            return {"success": False, "error": str(e)}
    
    async def reverse_geocode(self, lat: float, lng: float) -> Dict:
        """
        Converte coordenadas em endereço
        """
        try:
            url = f"{self.base_url}/geocode/json"
            params = {
                "latlng": f"{lat},{lng}",
                "key": self.api_key,
                "language": "pt-BR"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data["status"] == "OK" and data["results"]:
                            result = data["results"][0]
                            
                            return {
                                "success": True,
                                "address": result["formatted_address"],
                                "place_id": result.get("place_id"),
                                "address_components": result.get("address_components", [])
                            }
                        else:
                            return {
                                "success": False,
                                "error": f"Reverse geocoding failed: {data['status']}"
                            }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP Error: {response.status}"
                        }
                        
        except Exception as e:
            logger.error(f"Error in reverse_geocode: {e}")
            return {"success": False, "error": str(e)}
    
    async def calculate_route(self, origin: str, destination: str, waypoints: List[str] = None) -> Dict:
        """
        Calcula rota otimizada entre pontos
        """
        try:
            url = f"{self.base_url}/directions/json"
            params = {
                "origin": origin,
                "destination": destination,
                "key": self.api_key,
                "language": "pt-BR",
                "region": "br",
                "units": "metric"
            }
            
            if waypoints:
                # Otimizar ordem dos waypoints
                waypoints_str = "optimize:true|" + "|".join(waypoints)
                params["waypoints"] = waypoints_str
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data["status"] == "OK" and data["routes"]:
                            route = data["routes"][0]
                            
                            # Extrair informações da rota
                            leg_info = []
                            total_distance = 0
                            total_duration = 0
                            
                            for leg in route["legs"]:
                                leg_data = {
                                    "distance": leg["distance"]["value"],  # metros
                                    "duration": leg["duration"]["value"],  # segundos
                                    "start_address": leg["start_address"],
                                    "end_address": leg["end_address"],
                                    "start_location": leg["start_location"],
                                    "end_location": leg["end_location"]
                                }
                                leg_info.append(leg_data)
                                total_distance += leg["distance"]["value"]
                                total_duration += leg["duration"]["value"]
                            
                            return {
                                "success": True,
                                "route": {
                                    "total_distance_meters": total_distance,
                                    "total_distance_km": round(total_distance / 1000, 2),
                                    "total_duration_seconds": total_duration,
                                    "total_duration_minutes": round(total_duration / 60, 1),
                                    "legs": leg_info,
                                    "polyline": route["overview_polyline"]["points"],
                                    "bounds": route["bounds"],
                                    "waypoint_order": route.get("waypoint_order", [])
                                }
                            }
                        else:
                            return {
                                "success": False,
                                "error": f"Route calculation failed: {data['status']}"
                            }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP Error: {response.status}"
                        }
                        
        except Exception as e:
            logger.error(f"Error in calculate_route: {e}")
            return {"success": False, "error": str(e)}
    
    async def optimize_multiple_routes(self, depot: str, stops: List[str], vehicles: int = 1) -> Dict:
        """
        Otimiza múltiplas rotas saindo de um depot
        """
        try:
            # Para otimização simples, dividir stops entre veículos
            if vehicles == 1:
                return await self.calculate_route(depot, depot, stops)
            
            # Dividir stops entre veículos de forma equilibrada
            stops_per_vehicle = len(stops) // vehicles
            routes = []
            
            for i in range(vehicles):
                start_idx = i * stops_per_vehicle
                if i == vehicles - 1:  # Último veículo pega o resto
                    vehicle_stops = stops[start_idx:]
                else:
                    vehicle_stops = stops[start_idx:start_idx + stops_per_vehicle]
                
                if vehicle_stops:
                    route_result = await self.calculate_route(depot, depot, vehicle_stops)
                    if route_result["success"]:
                        routes.append({
                            "vehicle_id": i + 1,
                            "route": route_result["route"],
                            "stops": vehicle_stops
                        })
            
            # Calcular totais
            total_distance = sum(r["route"]["total_distance_meters"] for r in routes)
            total_duration = sum(r["route"]["total_duration_seconds"] for r in routes)
            
            return {
                "success": True,
                "optimization": {
                    "vehicles_used": len(routes),
                    "total_distance_km": round(total_distance / 1000, 2),
                    "total_duration_minutes": round(total_duration / 60, 1),
                    "routes": routes,
                    "efficiency_score": self._calculate_efficiency_score(routes)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in optimize_multiple_routes: {e}")
            return {"success": False, "error": str(e)}
    
    def _calculate_efficiency_score(self, routes: List[Dict]) -> float:
        """
        Calcula score de eficiência das rotas (0-100)
        """
        try:
            if not routes:
                return 0.0
            
            # Fatores de eficiência
            total_stops = sum(len(r["stops"]) for r in routes)
            total_distance = sum(r["route"]["total_distance_meters"] for r in routes)
            total_duration = sum(r["route"]["total_duration_seconds"] for r in routes)
            
            # Score baseado em distância por parada e tempo por parada
            avg_distance_per_stop = total_distance / total_stops if total_stops > 0 else 0
            avg_time_per_stop = total_duration / total_stops if total_stops > 0 else 0
            
            # Normalizar scores (valores menores = mais eficiente)
            distance_score = max(0, 100 - (avg_distance_per_stop / 1000))  # Penalizar > 1km por parada
            time_score = max(0, 100 - (avg_time_per_stop / 300))  # Penalizar > 5min por parada
            
            # Score final (média ponderada)
            efficiency_score = (distance_score * 0.6 + time_score * 0.4)
            return round(min(100, max(0, efficiency_score)), 1)
            
        except Exception as e:
            logger.error(f"Error calculating efficiency score: {e}")
            return 50.0  # Score neutro em caso de erro
    
    async def get_distance_matrix(self, origins: List[str], destinations: List[str]) -> Dict:
        """
        Calcula matriz de distâncias entre múltiplos pontos
        """
        try:
            url = f"{self.base_url}/distancematrix/json"
            params = {
                "origins": "|".join(origins),
                "destinations": "|".join(destinations),
                "key": self.api_key,
                "language": "pt-BR",
                "units": "metric"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data["status"] == "OK":
                            matrix = []
                            
                            for i, row in enumerate(data["rows"]):
                                matrix_row = []
                                for j, element in enumerate(row["elements"]):
                                    if element["status"] == "OK":
                                        matrix_row.append({
                                            "distance_meters": element["distance"]["value"],
                                            "distance_km": round(element["distance"]["value"] / 1000, 2),
                                            "duration_seconds": element["duration"]["value"],
                                            "duration_minutes": round(element["duration"]["value"] / 60, 1)
                                        })
                                    else:
                                        matrix_row.append({
                                            "distance_meters": 0,
                                            "distance_km": 0,
                                            "duration_seconds": 0,
                                            "duration_minutes": 0,
                                            "error": element["status"]
                                        })
                                matrix.append(matrix_row)
                            
                            return {
                                "success": True,
                                "matrix": matrix,
                                "origin_addresses": data["origin_addresses"],
                                "destination_addresses": data["destination_addresses"]
                            }
                        else:
                            return {
                                "success": False,
                                "error": f"Distance matrix failed: {data['status']}"
                            }
                    else:
                        return {
                            "success": False,
                            "error": f"HTTP Error: {response.status}"
                        }
                        
        except Exception as e:
            logger.error(f"Error in get_distance_matrix: {e}")
            return {"success": False, "error": str(e)}
    
    async def validate_addresses(self, addresses: List[str]) -> Dict:
        """
        Valida lista de endereços em lote
        """
        try:
            results = []
            
            for address in addresses:
                geocode_result = await self.geocode_address(address)
                results.append({
                    "original_address": address,
                    "is_valid": geocode_result["success"],
                    "formatted_address": geocode_result.get("formatted_address"),
                    "coordinates": geocode_result.get("coordinates"),
                    "error": geocode_result.get("error")
                })
            
            valid_count = sum(1 for r in results if r["is_valid"])
            
            return {
                "success": True,
                "validation": {
                    "total_addresses": len(addresses),
                    "valid_addresses": valid_count,
                    "invalid_addresses": len(addresses) - valid_count,
                    "validation_rate": round(valid_count / len(addresses) * 100, 1) if addresses else 0,
                    "results": results
                }
            }
            
        except Exception as e:
            logger.error(f"Error in validate_addresses: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_static_map_url(self, center: str, markers: List[Dict] = None, zoom: int = 13, size: str = "600x400") -> str:
        """
        Gera URL para mapa estático do Google
        """
        try:
            url = f"{self.base_url}/staticmap"
            params = [
                f"center={center}",
                f"zoom={zoom}",
                f"size={size}",
                f"key={self.api_key}"
            ]
            
            if markers:
                for marker in markers:
                    marker_str = f"color:{marker.get('color', 'red')}|"
                    marker_str += f"label:{marker.get('label', '')}|"
                    marker_str += marker.get('location', '')
                    params.append(f"markers={marker_str}")
            
            return f"{url}?" + "&".join(params)
            
        except Exception as e:
            logger.error(f"Error generating static map URL: {e}")
            return ""