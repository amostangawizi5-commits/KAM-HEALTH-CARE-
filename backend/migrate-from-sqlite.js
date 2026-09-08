const sqlite3 = require('sqlite3').verbose();
const { Sequelize } = require('sequelize');

// SQLite database
const sqliteDb = new sqlite3.Database('./database.sqlite');

// PostgreSQL database
const pgSequelize = new Sequelize('kazimili_care', 'mordern_developer', 'Cive@2004', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function migrateFromSQLite() {
  try {
    // Connect to PostgreSQL
    await pgSequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Get all tables from SQLite
    const tables = await new Promise((resolve, reject) => {
      sqliteDb.all(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name;
      `, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (tables.length === 0) {
      console.log('ℹ️ No tables found in SQLite database');
      return;
    }

    console.log(`📊 Found ${tables.length} tables in SQLite:\n`);
    tables.forEach((t, i) => console.log(`  ${i + 1}. ${t.name}`));

    // Migrate each table
    for (const table of tables) {
      const tableName = table.name;
      console.log(`\n📋 Migrating: ${tableName}`);

      // Get schema from SQLite
      const schema = await new Promise((resolve, reject) => {
        sqliteDb.all(`PRAGMA table_info("${tableName}")`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });

      // Get data from SQLite
      const data = await new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM "${tableName}"`, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });

      console.log(`  Schema: ${schema.length} columns`);
      console.log(`  Data: ${data.length} rows`);

      if (data.length === 0) {
        console.log(`  ⚠️ No data to migrate for ${tableName}`);
        continue;
      }

      // Build CREATE TABLE statement for PostgreSQL
      const columns = schema.map(col => {
        let pgType = col.type.toUpperCase();
        // Map SQLite types to PostgreSQL types
        if (pgType.includes('INTEGER')) pgType = 'INTEGER';
        else if (pgType.includes('TEXT') || pgType.includes('VARCHAR')) pgType = 'TEXT';
        else if (pgType.includes('REAL') || pgType.includes('FLOAT') || pgType.includes('DOUBLE')) pgType = 'REAL';
        else if (pgType.includes('BLOB')) pgType = 'BYTEA';
        else if (pgType.includes('DATETIME') || pgType.includes('DATE') || pgType.includes('TIMESTAMP')) pgType = 'TIMESTAMP';
        else if (pgType.includes('BOOLEAN')) pgType = 'BOOLEAN';
        else pgType = 'TEXT';

        let def = `"${col.name}" ${pgType}`;
        if (col.pk) def += ' PRIMARY KEY';
        if (col.notnull) def += ' NOT NULL';
        return def;
      });

      // Drop table if exists and create new
      await pgSequelize.query(`DROP TABLE IF EXISTS "${tableName}"`);
      await pgSequelize.query(`CREATE TABLE "${tableName}" (${columns.join(', ')})`);
      console.log(`  ✅ Table created in PostgreSQL`);

      // Insert data
      if (data.length > 0) {
        const keys = Object.keys(data[0]);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const insertSQL = `
          INSERT INTO "${tableName}" (${keys.map(k => `"${k}"`).join(', ')}) 
          VALUES (${placeholders})
        `;

        let inserted = 0;
        for (const row of data) {
          try {
            const values = keys.map(key => row[key]);
            await pgSequelize.query(insertSQL, { bind: values });
            inserted++;
          } catch (err) {
            console.log(`  ⚠️ Failed to insert row: ${err.message}`);
          }
        }
        console.log(`  ✅ ${inserted}/${data.length} rows inserted`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pgSequelize.close();
    sqliteDb.close();
  }
}

migrateFromSQLite();

