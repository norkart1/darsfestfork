const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

async function createAdmin() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL 
  });

  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || '123@Admin';
    
    if (password === '123@Admin' && process.env.NODE_ENV === 'production') {
      console.error('ERROR: Cannot use default password in production');
      process.exit(1);
    }

    // Check if admin already exists
    const existingResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    
    if (existingResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password and create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hashedPassword, 'admin']
    );
    
    console.log(`Admin user '${username}' created successfully`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();