const sqlite3 = require('sqlite3').verbose();

const dbPath = './foms_mes.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('Checking production_runs columns...');

db.all("PRAGMA table_info(production_runs)", (err, columns) => {
  if (err) {
    console.error('Error:', err.message);
    db.close();
    return;
  }
  
  const existingCols = columns.map(c => c.name);
  console.log('Existing columns:', existingCols);
  
  const ops = [];
  
  if (!existingCols.includes('material_type')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN material_type VARCHAR(10)");
  }
  if (!existingCols.includes('total_production_minutes')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN total_production_minutes REAL DEFAULT 0.0");
  }
  if (!existingCols.includes('net_production_minutes')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN net_production_minutes REAL DEFAULT 0.0");
  }
  if (!existingCols.includes('mold_change_2_time')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN mold_change_2_time VARCHAR(20)");
  }
  
  if (ops.length === 0) {
    console.log('✓ production_runs already has all new columns');
    db.close();
    return;
  }
  
  console.log('Adding columns:', ops);
  
  let completed = 0;
  ops.forEach(sql => {
    db.exec(sql, (err) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log('✓ Added column');
      }
      completed++;
      if (completed === ops.length) {
        console.log('✓ Migration completed');
        db.close();
      }
    });
  });
});