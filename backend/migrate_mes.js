const sqlite3 = require('sqlite3').verbose();

const dbPath = './foms_mes.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('Checking existing columns...');

db.all("PRAGMA table_info(production_runs)", (err, columns) => {
  if (err) {
    console.error('Error:', err.message);
    db.close();
    return;
  }
  
  const existingCols = columns.map(c => c.name);
  console.log('Existing columns:', existingCols);
  
  const ops = [];
  
  if (!existingCols.includes('operator_id')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN operator_id INTEGER");
  }
  if (!existingCols.includes('date')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN date VARCHAR(10)");
  }
  if (!existingCols.includes('total_change_minutes')) {
    ops.push("ALTER TABLE production_runs ADD COLUMN total_change_minutes REAL DEFAULT 0.0");
  }
  
  if (ops.length === 0) {
    console.log('✓ production_runs already up to date');
  } else {
    console.log('Adding columns:', ops);
    db.exec(ops.join('; '), (err) => {
      if (err) {
        console.error('Error adding columns:', err.message);
      } else {
        console.log('✓ Added missing columns');
      }
    });
  }
  
  db.exec("SELECT COUNT(*) as cnt FROM operators", (err, row) => {
    if (row && row[0] && row[0].cnt > 0) {
      console.log('✓ Operators already seeded');
      db.close();
      return;
    }
    
    db.exec(`
      INSERT INTO operators (name, employee_id, department, is_active) VALUES
      ('Ahmed Hassan', 'EMP001', 'Production', 1),
      ('Mohamed Ali', 'EMP002', 'Production', 1),
      ('Said Mohamed', 'EMP003', 'Production', 1),
      ('Youssef Ahmed', 'EMP004', 'Production', 1),
      ('Ali Salem', 'EMP005', 'Quality', 1)
    `, (err) => {
      if (err) console.error('Error seeding:', err.message);
      else console.log('✓ Seeded operators');
      db.close();
    });
  });
});