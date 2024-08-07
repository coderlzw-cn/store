import {
    clearCookies,
    getCookie,
    getCookies,
    removeCookie,
    removeCookies,
    setCookie,
    setCookies
} from "../src/cookie";

// 使用本地存储对象模拟document.cookies

beforeEach(() => {
    // 每次测试前重置模拟cookie存储
    const mockCookieStore: { [key: string]: string } = {};
    // 用与模拟存储交互的getter和setter覆盖document.cookies
    Object.defineProperty(document, "cookie", {
        get() {
            return Object.entries(mockCookieStore)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join("; ");
        },
        set(cookieString: string) {
            const [keyValue, ...attributes] = cookieString.split(";"),
             [key, value] = keyValue.split("=").map(decodeURIComponent);
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

        const result1 = getCookie("testKey1"),
         result2 = getCookie("testKey2");
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

        // 验证 cookies 已被设置
        expect(getCookie("testKeyToRemove")).toBe("testValueToRemove");

        // 删除 cookies
        removeCookie("testKeyToRemove");

        // 验证 cookies 已被删除
        expect(getCookie("testKeyToRemove")).toBeNull();
        // 验证 document.cookies 中不再包含该 cookies
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

        const result1 = getCookie("testKey1"),
         result2 = getCookie("testKey2");
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

        // 验证所有 cookies 已被清空
        const result1 = getCookie("testKey1"),
         result2 = getCookie("testKey2");
        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(document.cookie).toBe("");
    });
});