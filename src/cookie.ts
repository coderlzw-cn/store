interface CookieOptions {
    key: string;
    value: string;
    expires?: string;
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
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
        console.error("Cookie key and value are required.");
        return false;
    }

    let cookieStr = `${encodeURIComponent(options.key)}=${encodeURIComponent(options.value)}`;

    if (options.expires) {
        cookieStr += `;expires=${new Date(options.expires).toUTCString()}`;
    }
    if (options.maxAge !== undefined) {
        cookieStr += `;max-age=${options.maxAge}`;
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
 * @returns 返回 cookies 的值或 null
 */
export const getCookie = (key: string): string | null => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.split("=");
        if (decodeURIComponent(cookieKey) === key) {
            return decodeURIComponent(cookieValue);
        }
    }

    return null;
};

/**
 * 根据键名列表获取 cookies
 * @param keys 键名列表
 * @returns 返回对应键名的 cookies 值数组
 */
export const getCookies = (keys: string[]): string[] => {
    const cookies: string[] = [],
     cookieArray = document.cookie.split("; ");

    for (const cookie of cookieArray) {
        const [cookieKey, cookieValue] = cookie.split("=");
        if (keys.includes(decodeURIComponent(cookieKey))) {
            cookies.push(decodeURIComponent(cookieValue));
        }
    }

    return cookies;
};

/**
 * 根据键名删除 cookies
 * @param key 键名
 * @returns 是否成功删除
 */
export const removeCookie = (key: string): boolean => setCookie({
        key,
        value: "null",
        expires: new Date(0).toUTCString(),
        path: "/"
    });

/**
 * 根据键名列表删除 cookies
 * @param keys 键名列表
 * @returns 是否成功删除所有 cookies
 */
export const removeCookies = (keys: string[]): boolean => keys.every(key => removeCookie(key));

/**
 * 清空所有 cookies
 * @returns 是否成功清空所有 cookies
 */
export const clearCookies = (): boolean => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key] = cookie.split("=");
        document.cookie = `${key}=;expires=${new Date(0).toUTCString()};path=/`;
    }
    return true;
};