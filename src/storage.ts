import CryptoJS from "crypto-js";

// 定义存储类型的枚举
export enum StorageTypeEnum {
    Session = "sessionStorage",
    Local = "localStorage"
}

// 定义存储类型的字面量
export type StorageTypeVal = StorageTypeEnum | "sessionStorage" | "localStorage";

// 定义加密存储数据接口
interface EncryptedStorageData<K, V> {
    key: K;
    value: V;
    type: StorageTypeVal;
    expire?: number;
    encrypt: true;
    secretKey: string;
}

// 定义未加密存储数据接口
interface UnencryptedStorageData<K, V> {
    key: K;
    value: V;
    type: StorageTypeVal;
    expire?: number;
    encrypt?: false;
    secretKey?: never;
}

// 定义存储数据类型
type StorageData<K, V> = EncryptedStorageData<K, V> | UnencryptedStorageData<K, V>;

// 定义存储数据结构（包含时间和过期时间）
interface StorageDataWithTime {
    value: unknown;
    expire?: number;
    time?: number;
}

// 类型保护函数，用于检查是否为有效的存储类型
const isValidStorageType = (type: unknown): type is "sessionStorage" | "localStorage" => {
    return type === "sessionStorage" || type === "localStorage";
};

/**
 * 存储值到指定存储类型
 * @param data 存储数据
 */
export const setStorage = <V = unknown, K extends string = never>(data: StorageData<K, V>): void => {
    const {
        key,
        value,
        type,
        expire,
        encrypt = false,
        secretKey
    } = data;

    if (expire != null && isNaN(expire)) {
        throw new Error("expire must be a number");
    }
    if (expire != null && expire <= 0) {
        throw new Error("expire must be greater than 0");
    }

    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storageData = expire != null
        ? {value, time: Date.now(), expire}
        : {value};

    let stringValue: string;
    if (encrypt) {
        if (!secretKey) {
            throw new Error("secretKey must be provided when encrypt is true");
        }
        const string = JSON.stringify(storageData);
        stringValue = CryptoJS.AES.encrypt(string, secretKey).toString();
    } else {
        stringValue = JSON.stringify(storageData);
    }

    (window[type] as Storage).setItem(key, stringValue);
};

/**
 * 获取指定存储类型中的值
 * @param key 键名
 * @param type 存储类型
 * @param secretKey 可选，解密密钥
 * @returns 返回存储的值或 null
 */
export const getStorage = <V = unknown, K extends string = string>({
                                                                       key,
                                                                       type,
                                                                       secretKey
                                                                   }: {
    key: K;
    secretKey?: string;
    type: StorageTypeVal;
}): V | null => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storageValue = (window[type] as Storage).getItem(key);
    if (storageValue === null) {
        return null;
    }

    let jsonData: StorageDataWithTime;
    try {
        let decryptedValue = storageValue;
        if (secretKey) {
            const bytes = CryptoJS.AES.decrypt(storageValue, secretKey);
            decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
        }
        jsonData = JSON.parse(decryptedValue) as StorageDataWithTime;
    } catch (e) {
        console.error("Failed to decrypt or parse storage value:", e);
        return null;
    }

    const nowTime = Date.now();

    // 如果存有过期时间，过期删除
    if (jsonData.expire != null && jsonData.time != null && jsonData.expire < nowTime - jsonData.time) {
        (window[type] as Storage).removeItem(key);
        return null;
    }
    return jsonData.value as V;
};

/**
 * 获取指定存储类型中的所有键值对
 * @param type 存储类型
 * @returns 返回存储项的键值对对象
 */
export const getAllStorage = (type: StorageTypeVal): Record<string, unknown> => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    const storage = window[type] as Storage;
    const storageObject: Record<string, unknown> = {};
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key != null) {
            const value = getStorage({key, type});
            if (value !== null) {
                storageObject[key] = value;
            }
        }
    }
    return storageObject;
};

/**
 * 根据键名删除存储项
 * @param key 键名
 * @param type 存储类型
 */
export const removeStorage = ({key, type}: { key: string; type: StorageTypeVal }): void => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    (window[type] as Storage).removeItem(key);
};

/**
 * 清空指定存储类型中的所有项
 * @param type 存储类型
 */
export const clearStorage = (type: StorageTypeVal): void => {
    if (!isValidStorageType(type)) {
        throw new Error("Invalid storage type. Must be 'sessionStorage' or 'localStorage'.");
    }

    (window[type] as Storage).clear();
};
