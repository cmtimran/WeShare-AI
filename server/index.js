import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

app.use(cors({
    origin: '*', // Allow all origins (for local dev)
    exposedHeaders: ['Content-Disposition'] // allow client to see filename
}));
app.use(bodyParser.json({ limit: '500mb' }));

// Stats (Mock)
app.get('/api/stats', (req, res) => {
    res.json({
        filesShared: 12543,
        totalSize: '845 TB',
        activeUsers: 8421
    });
});

// In-memory file storage
const uploads = {};

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Use raw parser for EVERYTHING at /api/upload to ensure we capture the file
// Increase limit to 500mb
app.use('/api/upload', bodyParser.raw({ type: '*/*', limit: '500mb' }));



// Upload (Mock)
app.post('/api/upload', (req, res) => {
    const filename = req.query.filename;
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    console.log(`Mock upload: ${filename}, Type: ${contentType}, Size: ${req.body.length}`);

    // Store content and metadata
    uploads[filename] = {
        data: req.body,
        contentType: contentType
    };

    res.json({
        url: `/uploads/${filename}`,
        pathname: `uploads/${filename}`,
        contentType: contentType,
        contentDisposition: `attachment; filename="${filename}"`
    });
});

// Serve Uploads
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const fileRecord = uploads[filename];

    if (fileRecord) {
        res.setHeader('Content-Type', fileRecord.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(fileRecord.data);
    } else {
        res.status(404).send('File not found');
    }
});

// Transfer Metadata (Mock In-Memory DB)
const transfers = {};

app.post('/api/transfer', (req, res) => {
    const data = req.body;
    const { action } = req.query;

    if (action === 'verify') {
        // Password verification logic
        const { id, password } = data; // Actually passed in body usually? 
        // Wait, current implementation sends password in body?
        // store.ts: fetch('/api/transfer?action=verify', body: { id, password })? 
        // No, store.ts doesn't have verify logic. DownloadView.tsx handles it.
        // DownloadView sends: JSON.stringify({ action: 'verify', password }) to '/api/transfer?action=verify&id=...' 
        // Actually api/transfer.ts handles all methods.

        // Let's implement the logic from api/transfer.ts in Express.

        // But first, let's just handle specific "save" call.
        if (data.id) {
            transfers[data.id] = data;
            console.log(`Saved transfer ${data.id}`);
            return res.json({ success: true, id: data.id });
        }
    }

    // Default POST = Create
    if (data.id) {
        transfers[data.id] = data;
        return res.json({ success: true, id: data.id });
    }

    res.status(400).json({ error: 'Missing ID' });
});

app.get('/api/transfer', (req, res) => {
    const { id } = req.query;
    if (transfers[id]) {
        return res.json(transfers[id]);
    }
    res.status(404).json({ error: 'Transfer not found' });
});

app.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}`);
});
