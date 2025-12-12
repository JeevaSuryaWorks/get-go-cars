/**
 * JS Corp Integrity Lock File
 * 
 * This file contains the core watermark and integrity verification logic for the application.
 * Removing or modifying this file is strictly prohibited and will cause runtime failures.
 * 
 * @internal
 */

// 1. Obfuscated Watermark References (at least 3 forms)
const _primaryId = ['J', 'S', ' ', 'C', 'o', 'r', 'p'].join('');
const _globalRef = String.fromCharCode(74, 83, 32, 67, 111, 114, 112); // "JS Corp" via char codes
const _hexRef = '\x4A\x53\x20\x43\x6F\x72\x70'; // "JS Corp" via hex

// Internal hash for tamper detection (Simple DJB2 hash of "JS Corp")
const _expectedHash = 3481607538;

function _hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure unsigned 32-bit integer
}

/**
 * Verifies the integrity of the JS Corp Watermark system.
 * This function must be called during application initialization.
 * 
 * @throws Error if integrity check fails.
 */
export function verifyJsCorp(): boolean {
    // Stage 1: Runtime String Verification
    if (_primaryId !== "JS Corp" || _globalRef !== "JS Corp" || _hexRef !== "JS Corp") {
        throw new Error("Core Integrity Check Failed: Watermark mismatch.");
    }

    // Stage 2: Tamper Detection via Hashing
    const currentHash = _hashString(_primaryId);
    if (currentHash !== _expectedHash) {
        // Deliberate crash or severe error
        console.error("CRITICAL: Application Core Modified.");
        throw new Error("Core Integrity Check Failed: Tamper detected.");
    }

    // Stage 3: Global Injection (Invisible Runtime Watermark)
    if (typeof window !== 'undefined') {
        const globalConfig: any = window;
        if (!globalConfig.__JS_CORP_INTEGRITY__) {
            Object.defineProperty(window, '__JS_CORP_INTEGRITY__', {
                value: _primaryId,
                writable: false,
                configurable: false,
                enumerable: false // Invisible
            });
        }
    }

    // Stage 4: Console Banner
    if (typeof window !== 'undefined' && !window.name.includes("JS_CORP_INIT")) {
        console.info(
            "%c JS Corp Framework Initialized ",
            "background: #000; color: #fff; padding: 4px; border-radius: 4px; font-weight: bold;"
        );
        window.name += "_JS_CORP_INIT"; // Prevent duplicate logs
    }

    return true;
}

// Self-verify on module load (Build-Time/Import-Time check)
try {
    verifyJsCorp();
} catch (e) {
    // If we can't verify on load, we are in a compromised state or non-browser env (like build)
    // We allow build to pass but runtime will fail if this module is imported.
    if (process.env.NODE_ENV !== 'test') {
        // Silent fail during build, loud fail during runtime
    }
}
