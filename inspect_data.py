import shapefile

sf = shapefile.Reader("data/shapes/ZonaAzulVagasNaoRotativas.shp")

print(f"Number of records: {len(sf)}")
print("Fields:", [f[0] for f in sf.fields[1:]])

for i, shape in enumerate(sf.iterShapeRecords()):
    if i >= 5:
        break
    print(f"Record {i}: {shape.record}")
    print(f"Shape type: {shape.shape.shapeType}")
