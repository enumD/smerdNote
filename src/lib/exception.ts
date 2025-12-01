// 1. Definisce l'interfaccia per gli errori di sistema Node (es. errori di I/O)
export interface NodeSystemError extends Error
{
    code?: string;
    message: string;
}

/**
 * Predicato di tipo per verificare se un oggetto è un NodeSystemError (ha 'code').
 */
function isNodeSystemError(error: unknown): error is NodeSystemError
{
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error
    );
}

/**
 * Converte un errore di tipo 'unknown' in una stringa di errore leggibile.
 * @param error L'oggetto errore catturato nel blocco catch.
 * @returns Una stringa formattata con la descrizione più utile.
 */
export function formatError(error: unknown): string
{
    // Caso 1: È un errore di sistema Node (ha la proprietà 'code')
    if (isNodeSystemError(error))
    {
        // Ritorna il codice se presente, altrimenti il messaggio
        return error.code
            ? `System Error: ${error.code} - ${error.message}`
            : `Error: ${error.message}`;
    }

    // Caso 2: È un oggetto Error standard (ma non ha la proprietà 'code')
    if (error instanceof Error)
    {
        return `Error: ${error.message}`;
    }

    // Caso 3: Non è né un oggetto Error, né ha un codice (è una stringa, numero, ecc.)
    // Utilizza JSON.stringify per una rappresentazione più robusta degli oggetti sconosciuti
    if (typeof error === 'object' && error !== null)
    {
        try
        {
            return `Unknown Object Error: ${JSON.stringify(error)}`;
        } catch
        {
            return `Unknown Object Error: (Cannot be serialized)`;
        }
    }

    // Caso 4: È un tipo primitivo (stringa, numero, boolean)
    return `Unknown Primitive Error: ${String(error)}`;
}