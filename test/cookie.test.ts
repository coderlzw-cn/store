import {
    clearCookies,
    getCookie,
    getCookies,
    removeCookie,
    removeCookies,
    setCookie,
    setCookies
} from "../src/cookie";

beforeEach(() => {
    const mockCookieStore: { [key: string]: string } = {};
    Object.defineProperty(document, "cookie", {
        get() {
            return Object.entries(mockCookieStore)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join("; ");
        },
        set(cookieString: string) {
            const [keyValue, ...attributes] = cookieString.split(";");
            const [key, value] = keyValue.split("=").map(decodeURIComponent);
            if (attributes.some(attr => attr.trim().startsWith("expires="))) {
                const expiresAttr = attributes.find(attr => attr.trim().startsWith("expires="));
                if (expiresAttr && new Date(expiresAttr.trim().split("=")[1]) <= new Date()) {
                    delete mockCookieStore[key];
                } else {
                    mockCookieStore[key] = value;
                }
            } else if (value === "") {
                delete mockCookieStore[key];
            } else {
                mockCookieStore[key] = value;
            }
        },
        configurable: true
    });
});

describe("Cookie 操作测试", () => {
    test("应正确设置和获取单个 cookies", () => {
        setCookie({
            key: "testKey",
            value: "testValue",
            expires: "Fri, 01 Jan 2025 00:00:00 GMT",
            path: "/",
            domain: "example.com",
            secure: true
        });

        const result = getCookie("testKey");
        expect(result).toBe("testValue");
    });

    test("应正确批量设置 cookies", () => {
        setCookies([
            {
                key: "testKey1",
                value: "testValue1",
                expires: new Date(Date.now() + 3600 * 1000).toUTCString() // 1 hour from now
            },
            {
                key: "testKey2",
                value: "testValue2"
            }
        ]);

        const result1 = getCookie("testKey1");
        const result2 = getCookie("testKey2");
        expect(result1).toBe("testValue1");
        expect(result2).toBe("testValue2");
    });

    test("应正确获取指定键名的 cookies", () => {
        setCookie({
            key: "testKey1",
            value: "testValue1"
        });
        setCookie({
            key: "testKey2",
            value: "testValue2"
        });

        const results = getCookies(["testKey1", "testKey2"]);
        expect(results).toEqual(["testValue1", "testValue2"]);
    });

    test("应正确删除单个 cookies", () => {
        setCookie({
            key: "testKeyToRemove",
            value: "testValueToRemove",
            expires: new Date(Date.now() + 3600 * 1000).toUTCString() // 设置为当前时间+1小时
        });

        expect(getCookie("testKeyToRemove")).toBe("testValueToRemove");

        removeCookie("testKeyToRemove");

        expect(getCookie("testKeyToRemove")).toBeNull();
        expect(document.cookie.includes("testKeyToRemove")).toBe(false);
    });

    test("应正确删除多个 cookies", () => {
        setCookie({
            key: "testKey1",
            value: "testValue1"
        });
        setCookie({
            key: "testKey2",
            value: "testValue2"
        });

        removeCookies(["testKey1", "testKey2"]);

        const result1 = getCookie("testKey1");
        const result2 = getCookie("testKey2");
        expect(result1).toBeNull();
        expect(result2).toBeNull();
    });

    test("应正确清空所有 cookies", () => {
        setCookie({
            key: "testKey1",
            value: "testValue1"
        });
        setCookie({
            key: "testKey2",
            value: "testValue2"
        });

        clearCookies();

        const result1 = getCookie("testKey1");
        const result2 = getCookie("testKey2");
        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(document.cookie).toBe("");
    });

    test("应正确处理加密 cookies", () => {
        const secretKey = "mySecretKey";

        setCookie({
            key: "encryptedKey",
            value: "encryptedValue",
            encrypt: true,
            secretKey,
            expires: "Fri, 01 Jan 2025 00:00:00 GMT"
        });

        const encryptedValue = getCookie("encryptedKey", secretKey);
        expect(encryptedValue).toBe("encryptedValue");
    });

    test("应正确处理无效的 cookie 选项", () => {
        // 设置时缺少必需选项
        expect(() => setCookie({ key: "", value: "" })).toThrowError("Cookie key and value are required.");

        // 设置时使用无效的过期时间
        // 设置时使用无效的过期时间
        expect(() => setCookie({
            key: "invalidExpire",
            value: "value",
            expires: "invalid-date"
        })).toThrowError("Invalid expires date.");
    });

    test("应正确处理不带过期时间的 cookie", () => {
        setCookie({
            key: "noExpireKey",
            value: "noExpireValue"
        });

        const result = getCookie("noExpireKey");
        expect(result).toBe("noExpireValue");
    });
});