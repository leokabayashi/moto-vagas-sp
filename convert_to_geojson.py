import shapefile
import json
import os

# Ensure output directory exists
os.makedirs("data", exist_ok=True)

sf = shapefile.Reader("data/shapes/ZonaAzulVagasNaoRotativas.shp", encoding="latin1")

features = []
for shapeRecord in sf.iterShapeRecords():
    record = shapeRecord.record
    shape = shapeRecord.shape
    
    # Filter for Motorcycle (MO)
    if record['Tipo'] == 'MO':
        # Create GeoJSON feature
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": list(shape.points[0]) # Assuming single point
            },
            "properties": record.as_dict()
        }
        features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("data/parking_spots.json", "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2)

print(f"Converted {len(features)} motorcycle parking spots to GeoJSON.")
