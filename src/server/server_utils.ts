import path from 'path'
import dotenv from 'dotenv'
dotenv.config()


// Path of the dir where server is running
const EXEC_DIR = process.cwd()


const SRC_DIR = EXEC_DIR + process.env.URL_SRC

// public directory
const PUBLIC_DIR = path.join(SRC_DIR, 'public')


/**
 * Return a safe path preventing directory trasversal attack
 * @param reqPath Req coming from browser
 */
export function getSafePath(reqPath: string)
{
    if (!reqPath) { return { success: false, error: "Path is null", status: 400, path: "" }; }

    //  { return { success: false, error: "Env src not defined", status: 500, path: "" } }

    // remove %20 %40 etc
    const decodedPath = decodeURIComponent(reqPath);

    const cleanPath = decodedPath.startsWith('/') ? decodedPath.substring(1) : decodedPath;

    // Normalize path
    const normalizedPath = path.normalize(cleanPath)

    // Compose the path by adding before the exec dir
    const resolvPath = path.resolve(EXEC_DIR, normalizedPath)

    console.log(resolvPath)

    // Check that resolve is inside the public path
    if (!resolvPath.startsWith(EXEC_DIR))
    {
        return { success: false, error: "Trying trasversal attack, fuck you", status: 300, path: "" }
    }

    // Add public url
    const resolvePublic = path.resolve(PUBLIC_DIR, normalizedPath)

    if (!resolvePublic.startsWith(PUBLIC_DIR))
    {
        return { success: false, error: "trying trasversal attack, fuck you mf", status: 300, path: "" }
    }


    return { success: true, error: "", status: 200, path: resolvePublic };;
}
