import CryptoJS from "crypto-js";

interface CookieOptions {
    key: string;
    value: string;
    expires?: string;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    encrypt?: boolean;
    secretKey?: string;
}

interface DefaultCookieOptions {
    path?: string;
    domain?: string;
    secure?: boolean;
}

const defaultCookieOptions: DefaultCookieOptions = {};

/**
 * 设置 cookies
 * @param options Cookie 选项
 * @returns 是否成功设置
 */
export const setCookie = (options: CookieOptions): boolean => {
    if (!options.key || !options.value) {
        throw new Error("Cookie key and value are required.");
    }

    let cookieStr = `${encodeURIComponent(options.key)}=${encodeURIComponent(options.value)}`;

    if (options.expires) {
        const expiresDate = new Date(options.expires);
        if (isNaN(expiresDate.getTime())) {
            throw new Error("Invalid expires date.");
        }
        cookieStr += `;expires=${expiresDate.toUTCString()}`;
    }

    if (options.maxAge !== undefined) {
        if (isNaN(options.maxAge) || options.maxAge < 0) {
            throw new Error("Invalid maxAge value.");
        }
        cookieStr += `;max-age=${options.maxAge}`;
    }

    if (options.encrypt) {
        if (!options.secretKey) {
            throw new Error("Secret key must be provided for encryption.");
        }
        const encryptedValue = CryptoJS.AES.encrypt(options.value, options.secretKey).toString();
        cookieStr = `${encodeURIComponent(options.key)}=${encodeURIComponent(encryptedValue)}`;
    }

    if (options.path || defaultCookieOptions.path) {
        cookieStr += `;path=${options.path || defaultCookieOptions.path}`;
    }
    if (options.domain || defaultCookieOptions.domain) {
        cookieStr += `;domain=${options.domain || defaultCookieOptions.domain}`;
    }
    if (options.secure || defaultCookieOptions.secure) {
        cookieStr += ";secure";
    }
    document.cookie = cookieStr;
    return true;
};

/**
 * 批量设置 cookies
 * @param optionsArray CookieOptions 数组
 * @returns 是否成功设置所有 cookies
 */
export const setCookies = (optionsArray: CookieOptions[]): boolean => optionsArray.every(options => setCookie(options));

/**
 * 根据键名获取 cookies
 * @param key 键名
 * @param secretKey 可选，解密密钥
 * @returns 返回 cookies 的值或 null
 */
export const getCookie = (key: string, secretKey?: string): string | null => {
    if (!key) {
        throw new Error("Cookie key is required.");
    }

    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.split("=");
        if (decodeURIComponent(cookieKey) === key) {
            let value = decodeURIComponent(cookieValue);
            if (secretKey) {
                try {
                    const bytes = CryptoJS.AES.decrypt(value, secretKey);
                    value = bytes.toString(CryptoJS.enc.Utf8);
                } catch {
                    throw new Error("Failed to decrypt cookie value.");
                }
            }
            return value;
        }
    }
    return null;
};

/**
 * 根据键名列表获取 cookies
 * @param keys 键名列表
 * @param secretKey 可选，解密密钥
 * @returns 返回对应键名的 cookies 值数组
 */
export const getCookies = (keys: string[], secretKey?: string): string[] => {
    if (!Array.isArray(keys) || keys.some(key => !key)) {
        throw new Error("Keys must be a non-empty array of strings.");
    }

    const cookies: string[] = [];
    const cookieArray = document.cookie.split("; ");

    for (const cookie of cookieArray) {
        const [cookieKey, cookieValue] = cookie.split("=");
        if (keys.includes(decodeURIComponent(cookieKey))) {
            let value = decodeURIComponent(cookieValue);
            if (secretKey) {
                const bytes = CryptoJS.AES.decrypt(value, secretKey);
                value = bytes.toString(CryptoJS.enc.Utf8);
            }
            cookies.push(value);
        }
    }

    return cookies;
};
/**
 * 根据键名删除 cookies
 * @param key 键名
 * @returns 是否成功删除
 */
export const removeCookie = (key: string): boolean => {
    if (!key) {
        throw new Error("Cookie key is required.");
    }
    try {
        setCookie({
            key,
            value: "null",
            expires: new Date(0).toUTCString(),
            path: "/"
        });
        return true;
    } catch (e) {
        console.error("Failed to remove cookie:", e);
        return false;
    }
};

/**
 * 根据键名列表删除 cookies
 * @param keys 键名列表
 * @returns 是否成功删除所有 cookies
 */
export const removeCookies = (keys: string[]): boolean => {
    if (!Array.isArray(keys) || keys.some(key => !key)) {
        throw new Error("Keys must be a non-empty array of strings.");
    }

    return keys.every(key => {
        try {
            return removeCookie(key);
        } catch (e) {
            console.error("Failed to remove cookie:", e);
            return false;
        }
    });
};

/**
 * 清空所有 cookies
 * @returns 是否成功清空所有 cookies
 */
export const clearCookies = (): boolean => {
    try {
        const cookies = document.cookie.split("; ");
        if (cookies.length === 0) {
            return true;
        }

        cookies.forEach(cookie => {
            const [key] = cookie.split("=");
            if (key) {
                document.cookie = `${key}=;expires=${new Date(0).toUTCString()};path=/`;
            }
        });

        return true;
    } catch (e) {
        console.error("Failed to clear cookies:", e);
        return false;
    }
};