// MongoDB Geospatial Index Setup Script
// Copy and paste these commands into MongoDB shell (mongosh or mongo)

// 1. Use the correct database
use hack4safety

// 2. Create geospatial indexes
print("Creating geospatial indexes...");

db.sos.createIndex({ "location": "2dsphere" });
print("✓ Created index on sos.location");

db.rescue_team_location.createIndex({ "current_location": "2dsphere" });
print("✓ Created index on rescue_team_location.current_location");

db.operations.createIndex({ "sos_location": "2dsphere" });
print("✓ Created index on operations.sos_location");

// 3. Create additional performance indexes
print("\nCreating performance indexes...");

db.operations.createIndex({ "created_at": -1 });
print("✓ Created index on operations.created_at");

db.operations.createIndex({ "status": 1, "taskStatus": 1 });
print("✓ Created index on operations.status and taskStatus");

db.sos.createIndex({ "created_at": -1 });
print("✓ Created index on sos.created_at");

// 4. Verify all indexes
print("\n=== Verifying Indexes ===\n");

print("Indexes on 'sos' collection:");
db.sos.getIndexes().forEach(idx => print(JSON.stringify(idx, null, 2)));

print("\nIndexes on 'rescue_team_location' collection:");
db.rescue_team_location.getIndexes().forEach(idx => print(JSON.stringify(idx, null, 2)));

print("\nIndexes on 'operations' collection:");
db.operations.getIndexes().forEach(idx => print(JSON.stringify(idx, null, 2)));

// 5. Check data samples
print("\n=== Data Samples ===\n");

print("Sample SOS document:");
var sosSample = db.sos.findOne();
if (sosSample) {
    print(JSON.stringify(sosSample, null, 2));
} else {
    print("⚠️  No SOS documents found - create some for testing");
}

print("\nSample rescue_team_location document:");
var teamLocSample = db.rescue_team_location.findOne();
if (teamLocSample) {
    print(JSON.stringify(teamLocSample, null, 2));
} else {
    print("⚠️  No rescue_team_location documents found");
}

// 6. Test geospatial query
print("\n=== Testing Geospatial Query ===\n");

try {
    var result = db.sos.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [85.3240, 27.7172]
                },
                $maxDistance: 10000
            }
        }
    }).limit(5);
    
    var count = result.count();
    print("✓ Geospatial query successful! Found " + count + " documents");
} catch (e) {
    print("✗ Geospatial query failed: " + e.message);
}

print("\n=== Setup Complete ===");
print("All geospatial indexes have been created successfully!");
