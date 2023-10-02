1. In Data Migration Service There is a main Function Migrate data that used to migrate Basic data 
    a) migrateCategory()
    b) migrateBrand()
    c) migrateAttribute()
    d) migrateAttributeValue()

2. Product Migration Service is used to migrate product from Portonics to GNG Database
    a) migrateData() is used to handle the whole migration
    b) migrateBasicData()
    c) migrateSku()
    d) migrateSkuAttribute()
    e) migrateSpecification()
    f) migrateStock()
    g) migrateImage()

3. Mediasoft Migration Service is used to collect Data from Mediasoft, store detail and stock
    a) storeData()      // Basic Info like category, brand, modelName
    b) storeDetail()   // Product Detail like pBarCode, sBarCode
    c) storeStock()    // store stock based on Store ID



4. For migrate the Data from Portonics and Mediasoft to GNG Database call the following api
    a) 127.0.0.1:3000/migrate-data      // This will migrate Basic Data Like Category, Brand, Attribute, Attribute Value
    b) 127.0.0.1:3000/product-data      // This will migrate the product from Portonics to GNG and then will gather data
                                         // From Mediasoft and store them to DATABASE


5. API Service is used to communicate with Mediasoft For Login, Mediasoft Basic Data and Stock Data

   
   
  
