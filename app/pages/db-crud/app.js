const http = require('http');
const url = require('url');
const sql = require('mssql');

// Connection configuration
const config = {
    server: 'BONGADU\\SQLEXPRESS',
    database: 'BibleApp',
    authentication: {
      type: 'default',
    },
  };
  

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Parse URL
    const { pathname, query } = url.parse(req.url, true);

    // Create database connection pool
    const pool = await sql.connect(config);

    if (req.method === 'GET') {
        if (pathname === '/verses') {
            // Get all verses from the database
            const result = await pool.request().query('SELECT * FROM VERSES');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(result.recordset));
            res.end();
        } else if (pathname === '/favorites') {
            // Get all favorite verses from the database
            const result = await pool.request().query('SELECT * FROM VERSES WHERE id IN (SELECT verse_id FROM FAVORITES)');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify(result.recordset));
            res.end();
        } else {
            // Invalid endpoint
            res.writeHead(404);
            res.write('Invalid endpoint');
            res.end();
        }
    } else if (req.method === 'POST') {
        if (pathname === '/favorites') {
            // Add a verse to favorites
            const { user_id, verse_id } = query;
            const result = await pool.request()
                .input('user_id', sql.Int, user_id)
                .input('verse_id', sql.Int, verse_id)
                .query('INSERT INTO FAVORITES (user_id, verse_id) VALUES (@user_id, @verse_id)');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ success: true }));
            res.end();
        } else if (pathname === '/verses') {
            // Add a new verse to the database
            const { text, reference } = query;
            const result = await pool.request()
                .input('text', sql.Text, text)
                .input('reference', sql.VarChar(255), reference)
                .query('INSERT INTO VERSES (text, reference) VALUES (@text, @reference)');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ success: true }));
            res.end();
        } else {
            // Invalid endpoint
            res.writeHead(404);
            res.write('Invalid endpoint');
            res.end();
        }
    } else if (req.method === 'DELETE') {
        if (pathname === '/favorites') {
            // Remove a verse from favorites
            const { user_id, verse_id } = query;
            const result = await pool.request()
                .input('user_id', sql.Int, user_id)
                .input('verse_id', sql.Int, verse_id)
                .query('DELETE FROM FAVORITES WHERE user_id = @user_id AND verse_id = @verse_id');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ success: true }));
            res.end();
        } else {
            // Invalid endpoint
            res.writeHead(404);
            res.write('Invalid endpoint');
            res.end();
        }
    } else {
        // Invalid request method
        res.writeHead(405);
        res.write('Method not allowed');
        res.end();
    }
});


server.listen(8080, () => {
console.log('Server is listening on port 8080');
});
