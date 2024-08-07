import { clearStorage, getAllStorage, getStorage, removeStorage, setStorage } from "../src/storage";
import { StorageTypeEnum } from "../src/storage";

// 模拟存储
beforeEach(() => {
    // 在每个测试之前清除所有存储
    window.localStorage.clear();
    window.sessionStorage.clear();
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

describe("存储功能测试", () => {
    test("应设置和获取未加密的存储数据", () => {
        setStorage({
            key: "testKey",
            value: "testValue",
            type: StorageTypeEnum.Local
        });

        const result = getStorage({ key: "testKey", type: StorageTypeEnum.Local });
        expect(result).toBe("testValue");
    });

    test("应设置和获取加密的存储数据", () => {
        const secretKey = "mySecretKey";
        setStorage({
            key: "testKeyEncrypted",
            value: "testValueEncrypted",
            type: StorageTypeEnum.Local,
            encrypt: true,
            secretKey
        });

        const result = getStorage({ key: "testKeyEncrypted", type: StorageTypeEnum.Local, secretKey });
        expect(result).toBe("testValueEncrypted");
    });

    test("应正确处理过期的数据", () => {
        setStorage({
            key: "testKeyExpired",
            value: "testValueExpired",
            type: StorageTypeEnum.Local,
            expire: 1 // 1毫秒后过期
        });

        // 等待过期
        jest.advanceTimersByTime(2);

        const result = getStorage({ key: "testKeyExpired", type: StorageTypeEnum.Local });
        expect(result).toBeNull();
    });

    test("应返回所有存储项", () => {
        setStorage({
            key: "testKey1",
            value: "testValue1",
            type: StorageTypeEnum.Local
        });
        setStorage({
            key: "testKey2",
            value: "testValue2",
            type: StorageTypeEnum.Local
        });

        const allStorage = getAllStorage(StorageTypeEnum.Local);
        expect(allStorage).toEqual({
            testKey1: "testValue1",
            testKey2: "testValue2"
        });
    });

    test("应删除指定的存储项", () => {
        setStorage({
            key: "testKeyToRemove",
            value: "testValueToRemove",
            type: StorageTypeEnum.Local
        });

        removeStorage({ key: "testKeyToRemove", type: StorageTypeEnum.Local });

        const result = getStorage({ key: "testKeyToRemove", type: StorageTypeEnum.Local });
        expect(result).toBeNull();
    });

    test("应清空所有存储项", () => {
        setStorage({
            key: "testKeyToClear1",
            value: "testValueToClear1",
            type: StorageTypeEnum.Local
        });
        setStorage({
            key: "testKeyToClear2",
            value: "testValueToClear2",
            type: StorageTypeEnum.Local
        });

        clearStorage(StorageTypeEnum.Local);

        const allStorage = getAllStorage(StorageTypeEnum.Local);
        expect(allStorage).toEqual({});
    });
});