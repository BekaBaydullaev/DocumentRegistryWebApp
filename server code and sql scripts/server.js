const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());const PORT = 3000;

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json()); // parse JSON bodies

// 2. DB CONNECTION
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  options: {
    trustServerCertificate: true, // for local dev
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // The "files" folder is in the same dir as server.js
    cb(null, path.join(__dirname, 'files'));
  },
  filename: (req, file, cb) => {
    // Generate a unique name or keep original name
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/* 3) Serve static files from "files/" so we can open them in the browser */
app.use('/files', express.static(path.join(__dirname, 'files')));

// 3. ROUTES
app.get('/', (req, res) => {
  res.send('Node.js + Express + MySQL server is running!');
});

// 4. START THE SERVER
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/* 4) Upload Endpoint: POST /api/upload */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = '/files/' + req.file.filename;

  const fileName = req.file.originalname;

  return res.json({
    fileName,
    filePath
  });
});

// GET /api/documents
app.get('/api/documents', async (req, res) => {
  try {
    // 1. Establish a connection
    let pool = await sql.connect(dbConfig);
    // 2. Run the query
    let result = await pool.request().query('SELECT * FROM dbo.documents');
    // 3. Return the rows
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/documents/:id
app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let pool = await sql.connect(dbConfig);
    let request = pool.request();
    request.input('docId', sql.Int, id);

    let result = await request.query(
      'SELECT * FROM dbo.documents WHERE id = @docId'
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching document by Id:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/documents
app.post('/api/documents', async (req, res) => {
  const {
    regNumber,
    regDate,
    docNumber,
    docDate,
    deliveryType,
    correspondent,
    subject,
    description,
    dueDate,
    isAccessible,
    isUnderControl,
    fileName,
    filePath
  } = req.body;

  // Minimal check
  if (!regNumber || !regDate || !correspondent || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let pool = await sql.connect(dbConfig);
    let request = pool.request();

    request.input('regNumber', sql.NVarChar(50), regNumber);
    request.input('regDate', sql.Date, regDate);
    request.input('docNumber', sql.NVarChar(50), docNumber || null);
    request.input('docDate', sql.Date, docDate || null);
    request.input('deliveryType', sql.NVarChar(50), deliveryType || null);
    request.input('correspondent', sql.NVarChar(50), correspondent);
    request.input('subject', sql.NVarChar(100), subject);
    request.input('description', sql.NVarChar(1000), description || null);
    request.input('dueDate', sql.Date, dueDate || null);
    request.input('isAccessible', sql.Bit, isAccessible ? 1 : 0);
    request.input('isUnderControl', sql.Bit, isUnderControl ? 1 : 0);
    request.input('fileName', sql.NVarChar(255), fileName || null);
    request.input('filePath', sql.NVarChar(500), filePath || null);

    // Insert + return the newly inserted row's ID:
    const insertQuery = `
      INSERT INTO dbo.documents
        (regNumber, regDate, docNumber, docDate, deliveryType, correspondent, subject, description, dueDate, isAccessible, isUnderControl, fileName, filePath)
      OUTPUT Inserted.id
      VALUES
        (@regNumber, @regDate, @docNumber, @docDate, @deliveryType, @correspondent, @subject, @description, @dueDate, @isAccessible, @isUnderControl, @fileName, @filePath)
    `;

    let result = await request.query(insertQuery);
    const insertedId = result.recordset[0].id;

    res.status(201).json({ id: insertedId, ...req.body });
  } catch (err) {
    console.error('Error inserting document:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/documents/:id
app.put('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const {
    regNumber,
    regDate,
    docNumber,
    docDate,
    deliveryType,
    correspondent,
    subject,
    description,
    dueDate,
    isAccessible,
    isUnderControl,
    fileName,
    filePath
  } = req.body;

  try {
    let pool = await sql.connect(dbConfig);
    let request = pool.request();

    request.input('docId', sql.Int, id);
    request.input('regNumber', sql.NVarChar(50), regNumber);
    request.input('regDate', sql.Date, regDate);
    request.input('docNumber', sql.NVarChar(50), docNumber || null);
    request.input('docDate', sql.Date, docDate || null);
    request.input('deliveryType', sql.NVarChar(50), deliveryType || null);
    request.input('correspondent', sql.NVarChar(50), correspondent);
    request.input('subject', sql.NVarChar(100), subject);
    request.input('description', sql.NVarChar(1000), description || null);
    request.input('dueDate', sql.Date, dueDate || null);
    request.input('isAccessible', sql.Bit, isAccessible ? 1 : 0);
    request.input('isUnderControl', sql.Bit, isUnderControl ? 1 : 0);
    request.input('fileName', sql.NVarChar(255), fileName || null);
    request.input('filePath', sql.NVarChar(500), filePath || null);

    const updateQuery = `
      UPDATE dbo.documents
      SET
        regNumber = @regNumber,
        regDate = @regDate,
        docNumber = @docNumber,
        docDate = @docDate,
        deliveryType = @deliveryType,
        correspondent = @correspondent,
        subject = @subject,
        description = @description,
        dueDate = @dueDate,
        isAccessible = @isAccessible,
        isUnderControl = @isUnderControl,
        fileName = @fileName,
        filePath = @filePath
      WHERE id = @docId
    `;

    let result = await request.query(updateQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document updated successfully' });
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/documents/:id
app.delete('/api/documents/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let pool = await sql.connect(dbConfig);
    let request = pool.request();
    request.input('docId', sql.Int, id);

    let result = await request.query('DELETE FROM dbo.documents WHERE id = @docId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

