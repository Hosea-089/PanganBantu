"""Idempotently seed sourced BPS 2025 and TKPI 2020 catalog observations."""
import json
from sqlalchemy import select
from .main import Sessions
from .models import Ingredient, Recipe, RecipeIngredient
BPS = 'BPS Statistik Harga Konsumen Perdesaan Kelompok Makanan 2025 (Publikasi 06200.26006)'
BPS_URL = 'https://www.bps.go.id/id/publication/2026/04/24/bf06c6b8d3adfdefce0a9032/statistik-harga-konsumen-perdesaan-kelompok-makanan-2025.html'
TKPI = 'Tabel Komposisi Pangan Indonesia 2020, Kementerian Kesehatan RI'
TKPI_URL = 'https://repository.kemkes.go.id/book/668'
SI_SOURCE = 'SI conversion: 1 kg = 1000 g'
SI_URL = 'https://www.nist.gov/pml/owm/si-units'
EGG_SOURCE = 'USDA FoodData Central: 50 g edible egg; TKPI 2020 BDD: 89%'
EGG_URL = 'https://fdc.nal.usda.gov/food-search/?query=egg%20whole%20raw&type=SR%20Legacy'
BPS_TABLE={'Beras':'Tabel 1.1','Telur':'Tabel 1.41','Bayam':'Tabel 1.50','Kubis':'Tabel 1.51','Kentang':'Tabel 1.53','Wortel':'Tabel 1.65','Tempe':'Tabel 1.82','Tahu':'Tabel 1.83'}
ROWS=[
('Beras','beras','g','Bahan Pokok',15588,16198,'AR001',357,8.4,77.1,1.7,.2,1,.001,SI_SOURCE,SI_URL),
('Telur','telur','butir','Protein',33732,35833,'ER002',154,12.4,.7,10.8,0,1,.05618,EGG_SOURCE,EGG_URL),
('Tahu','tahu','g','Protein',13052,13220,'CP024',148,13.8,4,8.8,.6,1,.001,SI_SOURCE,SI_URL),
('Tempe','tempe','g','Protein',15804,16080,'CP017',201,20.8,13.5,8.8,1.4,1,.001,SI_SOURCE,SI_URL),
('Wortel','wortel','g','Sayuran',19813,23085,'DR166',36,1,7.9,.6,1,1,.001,SI_SOURCE,SI_URL),
('Bayam','bayam','g','Sayuran',11521,11992,'DR008',16,.9,2.9,.4,.7,1,.001,SI_SOURCE,SI_URL),
('Kubis','kol','g','Sayuran',13485,14315,'DR113',25,2.4,4.9,.2,1.6,1,.001,SI_SOURCE,SI_URL),
('Kentang','kentang','g','Sayuran',21254,22520,'BR013',62,2.1,13.5,.2,.4,1,.001,SI_SOURCE,SI_URL)]
def seed(session_factory=Sessions):
 with session_factory() as s:
  for name,slug,unit,cat,pmin,pmax,record,energy,protein,carb,fat,fiber,ref,factor,conversion_source,conversion_url in ROWS:
   obj=s.scalar(select(Ingredient).where(Ingredient.slug==slug))
   if obj: continue
   s.add(Ingredient(slug=slug,name=name,unit=unit,category=cat,allergens=json.dumps({'Telur':['Telur'],'Tahu':['Kedelai'],'Tempe':['Kedelai']}.get(name,[])),animal=False,price_min=pmin,price_max=pmax,price_raw_unit='kg',price_reference_quantity=ref,price_to_unit_factor=factor,price_conversion_source=conversion_source,price_conversion_source_url=conversion_url,price_source=f'{BPS}; {BPS_TABLE[name]}: {name}',price_source_url=BPS_URL,price_region='Nasional (perdesaan)',price_from='2025-01-01',price_to='2025-12-31',price_updated='2026-04-24',nutrition_source=TKPI,nutrition_source_url=TKPI_URL,nutrition_record=record,serving_size_g=100,bdd_percent={'ER002':89,'DR008':71,'DR113':57,'BR013':85}.get(record,100),energy=energy,protein=protein,carbohydrate=carb,fat=fat,fiber=fiber))
  recipe_data=[('Bubur Beras & Sayuran','breakfast',1,'/assets/bubur-sayur.jpg',30,'Cuci beras. Rebus dengan air sekitar 6 kali volume beras sambil diaduk hingga menjadi bubur. Cuci dan potong wortel serta bayam. Masukkan wortel ke bubur, masak sampai empuk. Tambahkan bayam, masak sebentar sampai matang, lalu bagi ke mangkuk.',{'Beras':70,'Wortel':60,'Bayam':40}),('Nasi Tumis Tempe Wortel','breakfast',1,'/assets/nasi-tempe.jpg',20,'Masak beras hingga matang. Potong tempe dan wortel kecil-kecil. Tambahkan wortel dan sedikit air, masak sampai empuk. Masukkan tempe dan masak hingga seluruh bahan matang. Sajikan bersama nasi sesuai jumlah porsi.',{'Beras':75,'Tempe':80,'Wortel':50}),('Tumis Tahu Sayur & Nasi','lunch',1,'/assets/tumis-tahu.jpg',25,'Masak beras. Cuci sayuran dan potong bersama tahu. Masak wortel dengan sedikit air hingga empuk. Tambahkan kubis dan tahu. Aduk perlahan sampai matang. Sajikan dengan nasi dan bagi rata sesuai jumlah porsi.',{'Beras':85,'Tahu':120,'Wortel':60,'Kubis':60}),('Sup Telur Sayuran & Nasi','lunch',1,'/assets/soto-ayam.jpg',25,'Masak beras. Cuci dan potong wortel serta kubis. Rebus wortel hingga empuk. Masukkan kubis dan telur kocok sedikit demi sedikit. Aduk hingga telur matang. Sajikan dengan nasi sesuai jumlah porsi.',{'Beras':85,'Telur':1,'Wortel':60,'Kubis':60}),('Tempe panggang & sayur bening','dinner',1,'/assets/tempe.jpg',25,'Masak beras. Iris tempe, cuci dan potong bayam serta wortel. Panggang tempe di wajan sampai matang di kedua sisi. Rebus air dengan wortel. Tambahkan bayam, masak sampai matang. Sajikan nasi, tempe, dan sayur bening sesuai jumlah porsi.',{'Beras':80,'Tempe':100,'Bayam':80,'Wortel':40}),('Sup Kentang Sayur & Nasi','dinner',1,'/assets/sup-sayur.jpg',30,'Masak beras. Kupas kentang, cuci dan potong semua sayuran. Rebus kentang dan wortel hingga empuk. Masukkan kubis. Masak hingga semua sayuran matang. Bagi sup dan nasi sesuai jumlah porsi, sajikan hangat.',{'Beras':70,'Kentang':100,'Wortel':60,'Kubis':60})]
  for rid,(name,slot,servings,image,time,instructions,items) in enumerate(recipe_data,1):
   if s.get(Recipe,rid): continue
   recipe=Recipe(id=rid,name=name,slot=slot,servings=servings,image=image,time=time,instructions=instructions)
   s.add(recipe)
   s.flush()
   for ingredient_name,quantity in items.items():
    ingredient=s.scalar(select(Ingredient).where(Ingredient.name==ingredient_name))
    s.add(RecipeIngredient(recipe_id=rid,ingredient_id=ingredient.id,quantity=quantity,unit=ingredient.unit,grams=quantity*(56.18 if ingredient_name=='Telur' else 1)))
  s.commit()
if __name__=='__main__': seed()
