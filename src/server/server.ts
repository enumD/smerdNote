import { createServer, IncomingMessage, ServerResponse } from 'http';
import { formatError } from '../lib/exception';
import { getSafePath } from './server_utils';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises'

// Get the directory name based on where it's running:
// Local: src
// Develop : dist


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


let count = 0;

const server = createServer(async (req: IncomingMessage, res: ServerResponse) =>
{
    try
    {
        // If url is "/" return "index.html" else do nothing
        const urlPath = req.url === "/" ? "index.html" : req.url;

        // const reqMethod = req.method ? req.method : "No method";
        // const rawHeader = req.headers;
        // const accept = req.headers.accept

        if (!urlPath)
        {
            console.log("Bad Request, url path not found")
            res.writeHead(400);
            res.end('Bad Request, path not found');
            return;
        }

        const filePath = getSafePath(urlPath);

        if (!filePath.success)
        {
            console.log(filePath.error);
            res.writeHead(filePath.status)
            res.end(filePath.error)
            return;
        }

        // non serve, se sta
        // if (!fs.existsSync(filePath.path))
        // {
        //     console.log("file requested not found");
        //     res.writeHead(404);
        //     res.end(`File not found: ${filePath}`)
        //     return;
        // }

        const stats = await fs.promises.stat(filePath.path);

        if (!stats.isFile())
        {
            console.log("Not a file")
            res.writeHead(403);
            res.end("not a file")
            return;
        }

        const fileExtension = path.extname(filePath.path).toLowerCase()
        const contentType = MIME_TYPES[ fileExtension ];

        if (!contentType)
        {
            console.log("file not supported")
            res.writeHead(405)
            res.end("file not supported")
            return;
        }

        // serve file as a stream
        const stream = fs.createReadStream(filePath.path)

        stream.on('error', (error: NodeJS.ErrnoException) =>
        {
            if (error.code === 'ENOENT')
            {
                res.writeHead(404);
                res.end("file not found")
            }
            else
            {
                console.log("Stream error:", error)
                res.writeHead(500)
                res.end(`Internal server error: ${error}`)
            }
        });

        stream.on('open', () =>
        {
            res.writeHead(200, { 'content-type': contentType })
            stream.pipe(res)
        });



        console.log("------------------------");
        console.log("Url: ", urlPath);
        console.log("Absolute file:", filePath.path)




        // // Check if it's a directory
        // const stats = await stat(filePath).catch(() => null);

        // if (stats?.isDirectory())
        // {0
        //     // Serve index.html for directories
        //     const indexPath = join(filePath, 'index.html');
        //     console.log(`📁 Is directory, trying: ${indexPath}`);

        //     const indexContent = await readFile(indexPath);
        //     const ext = extname(indexPath);
        //     const contentType = MIME_TYPES[ ext ] || 'application/octet-stream';

        //     res.writeHead(200, {
        //         'Content-Type': contentType,
        //         'Cache-Control': 'no-cache'
        //     });
        //     res.end(indexContent);
        //     return;
        // }

        // // Serve file
        // const content = await readFile(filePath);
        // const ext = extname(filePath);
        // const contentType = MIME_TYPES[ ext ] || 'application/octet-stream';


        // res.writeHead(200, {
        //     'Content-Type': contentType,
        //     'Cache-Control': 'no-cache'
        // });
        // res.end(content);

        // res.end();

    } catch (error: unknown)
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





