const express = require('express');
const sql = require('mssql/msnodesqlv8');

// Connection configuration
// const config = {
//   server: 'BONGADU\\SQLEXPRESS',
//   database: 'BibleApp',
//   authentication: {
//     type: 'Windows',
//   },
// };


// const config = 'server=BONGADU\\SQLEXPRESS;Database=BibleApp;Trusted_Connection=Yes;Driver={SQL Server}'

const config = {
    server: 'BONGADU\\SQLEXPRESS',
    database: 'BibleApp',
    options: {
      trustedConnection: true,
      enableArithAbort: true,
    },
  };

const app = express();

//(${req.params.theID})

app.get('/verses/:theID', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM VERSES WHERE id = @theID');
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
  }
});

app.get('/favorites/:user_id', async (req, res) => {
  try {
    const pool =  await sql.connect(config);    
    const result = await pool.request().query('SELECT * FROM VERSES WHERE id IN (SELECT verse_id FROM FAVORITES WHERE user_id IN (@user_id)');
    res.json(result.recordset);
  } catch (error) {
    console.log(error);
  }
});
//
app.post('/favorites/:user_id/:verse_id', async (req, res) => {
  const { user_id, verse_id } = req.query;
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input('user_id', sql.Int, user_id)
      .input('verse_id', sql.Int, verse_id)
      .query('INSERT INTO FAVORITES (user_id, verse_id) VALUES (@user_id, @verse_id)');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
//
app.post('/verses/:text/:reference', async (req, res) => {
  const { text, reference } = req.query;
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input('text', sql.Text, text)
      .input('reference', sql.VarChar(255), reference)
      .query('INSERT INTO VERSES (text, reference) VALUES (@text, @reference)');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.delete('/favorites/:user_id/:verse_id', async (req, res) => {
  const { user_id, verse_id } = req.query;
  try {
    const pool = await sql.connect(config);
    await pool
      .request()
      .input('user_id', sql.Int, user_id)
      .input('verse_id', sql.Int, verse_id)
      .query('DELETE FROM FAVORITES WHERE user_id = @user_id AND verse_id = @verse_id');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.use((req, res) => {
  res.status(404).send('Invalid endpoint');
});

const server = app.listen(8080, () => {
  console.log('Server is listening on port 8080');
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});
