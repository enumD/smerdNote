import { createStream } from 'rotating-file-stream';
import fs from 'fs';
import path from 'path';

export enum LogLevel
{
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

// Create log dir
const logsDir = path.join(process.cwd(), 'log_files');
if (!fs.existsSync(logsDir))
{
    fs.mkdirSync(logsDir, { recursive: true });
}

// Crea stream with rotation 
const stream = createStream('app.log', {
    size: '10M',
    maxFiles: 6,
    path: logsDir
});


/**
 * Log to a file 
 * @param level Log level
 * @param message message to log
 * @returns un cazz
 */
export async function logga(level: LogLevel, message: string): Promise<void>
{
    try
    {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] [${level}] ${message}\n`;

        return new Promise((resolve) =>
        {
            if (stream.write(logLine))
            {
                resolve();
            } else
            {
                stream.once('drain', resolve);
            }
        });
    } catch (error)
    {
        console.log("Log error ")
    }

}

