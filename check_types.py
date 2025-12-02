import shapefile

sf = shapefile.Reader("data/shapes/ZonaAzulVagasNaoRotativas.shp", encoding="latin1")

types = set()
for shape in sf.iterRecords():
    types.add(shape['Tipo'])

print(f"Unique Types: {types}")
