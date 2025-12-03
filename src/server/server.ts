import { createServer, IncomingMessage, ServerResponse } from 'http';
import { formatError } from '../lib/exception';
import { getSafePath } from './server_utils';
import { logga, LogLevel } from "../log/logModule"
import fs, { write } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises'
import { getSystemErrorMap } from 'util';
import { log } from 'console';
import { url } from 'inspector';

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
        const urlPath = req.url === "/" ? "/index.html" : req.url;

        // const reqMethod = req.method ? req.method : "No method";
        // const rawHeader = req.headers;
        // const accept = req.headers.accept

        if (!urlPath || urlPath.length < 4)
        {
            console.log("Bad Request, url path not found")
            res.writeHead(400);
            res.end('Bad Request, path not found');
            return;
        }

        if (urlPath.includes('dev'))
        {
            res.writeHead(404)
            res.end("sfaccim")
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

        // const stats = await fs.promises.stat(filePath.path);

        // if (!stats.isFile())
        // {
        //     console.log("Not a file")
        //     res.writeHead(403);
        //     res.end("not a file")
        //     return;
        // }




        // serve file as a stream
        const stream = fs.createReadStream(filePath.path)

        const headers = await writeHeaders(filePath.path)

        res.writeHead(200, headers)

        await pipeline(stream, res)

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
        console.log(error_str)
        await logga(LogLevel.ERROR, error_str)
        if (!res.headersSent)
        {
            res.writeHead(555);
        }
        res.end(`Generic error mf`);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
{
    console.log(`Server running at http://localhost:3000`);
});







async function writeHeaders(filePath: string)
{
    const fileExtension = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ fileExtension ];

    if (!contentType)
    {
        throw new Error("writeHeader() - file not supported")
    }

    const headers: Record<string, string> = { 'content-type': contentType };

    if (process.env.ENV_NAME === 'production')
    {
        headers[ 'cache-control' ] = 'public'
    }
    else
    {
        headers[ 'cache-control' ] = 'no-cache, no-store, must-revalidate'
        headers[ 'pragma' ] = 'no-cache';
        headers[ 'expires' ] = '0';
    }

    return headers;
}