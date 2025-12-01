import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { formatError } from '../lib/exception';

// __dirname funziona direttamente in CommonJS
const PUBLIC_DIR = join(__dirname, '../public');

const MIME_TYPES: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = createServer(async (req: IncomingMessage, res: ServerResponse) =>
{
    try
    {
        const urlPath = req.url === '/' ? '/index.html' : req.url;

        console.log(`📁 Requested path: ${urlPath}`);
        console.log(`📁 PUBLIC_DIR: ${PUBLIC_DIR}`);

        if (!urlPath)
        {
            res.writeHead(400);
            res.end('Bad Request');
            return;
        }



        const sanitizedPath = urlPath.replace(/\.\.\//g, '');
        const filePath = join(PUBLIC_DIR, sanitizedPath);
        console.log(`📁 Resolved path: ${filePath}`);

        // Security check
        const normalizedFilePath = join(filePath);
        const normalizedPublicDir = join(PUBLIC_DIR);

        if (!normalizedFilePath.startsWith(normalizedPublicDir))
        {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access Forbidden');
            return;
        }

        // Check if it's a directory
        const stats = await stat(filePath).catch(() => null);

        if (stats?.isDirectory())
        {
            // Serve index.html for directories
            const indexPath = join(filePath, 'index.html');
            console.log(`📁 Is directory, trying: ${indexPath}`);

            const indexContent = await readFile(indexPath);
            const ext = extname(indexPath);
            const contentType = MIME_TYPES[ ext ] || 'application/octet-stream';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(indexContent);
            return;
        }

        // Serve file
        const content = await readFile(filePath);
        const ext = extname(filePath);
        const contentType = MIME_TYPES[ ext ] || 'application/octet-stream';

        console.log(`✅ Serving: ${filePath} as ${contentType}`);

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(content);

    } catch (error: any)
    {
        const error_str = formatError(error)
        res.writeHead(555);
        res.end(`Generic error: ${error_str}`);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
{
    console.log(`Server running at http://localhost:3000`);
});