const fs = require('fs');
const { Pool } = require('pg');

async function importData() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });

  try {
    console.log('Starting JSON data import...');
    
    // Read the JSON data
    const jsonData = JSON.parse(fs.readFileSync('./data/FullData.json', 'utf8'));
    console.log(`Found ${jsonData.length} candidates to import`);

    // Clear existing data
    await pool.query('DELETE FROM candidates');
    console.log('Cleared existing candidate data');

    // Import candidates
    let imported = 0;
    for (const candidate of jsonData) {
      try {
        await pool.query(`
          INSERT INTO candidates (
            code, name, darsname, darsplace, zone, slug, category,
            stage1, stage2, stage3, groupstage1, groupstage2, groupstage3,
            offstage1, offstage2, offstage3, groupoffstage
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          candidate.code,
          candidate.name,
          candidate.darsname,
          candidate.darsplace || null,
          candidate.zone,
          candidate.slug || null,
          candidate.category,
          candidate.stage1 || null,
          candidate.stage2 || null,
          candidate.stage3 || null,
          candidate.groupstage1 || null,
          candidate.groupstage2 || null,
          candidate.groupstage3 || null,
          candidate.offstage1 || null,
          candidate.offstage2 || null,
          candidate.offstage3 || null,
          candidate.groupoffstage || null
        ]);
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`Imported ${imported} candidates...`);
        }
      } catch (error) {
        console.error(`Error importing candidate ${candidate.code}:`, error.message);
      }
    }

    // Create dars data from candidates
    console.log('Creating dars data...');
    await pool.query('DELETE FROM dars_data');
    
    const darsQuery = `
      INSERT INTO dars_data (darsname, darsplace, zone, slug, total_candidates)
      SELECT 
        darsname,
        darsplace,
        zone,
        slug,
        COUNT(*) as total_candidates
      FROM candidates 
      GROUP BY darsname, darsplace, zone, slug
    `;
    await pool.query(darsQuery);

    // Get final counts
    const candidateCount = await pool.query('SELECT COUNT(*) FROM candidates');
    const darsCount = await pool.query('SELECT COUNT(*) FROM dars_data');

    console.log(`Import completed successfully!`);
    console.log(`- Imported ${candidateCount.rows[0].count} candidates`);
    console.log(`- Created ${darsCount.rows[0].count} dars records`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

importData();