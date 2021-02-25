export declare const appBaseTranslations: {};
export declare const appTranslations: {};
export declare function setTranslationLanguage(langIndex: number): void;
interface Enum {
    [id: number]: string;
}
export declare function configTranslations(options: {
    showMissingTranslations?: boolean;
    languagesEnum?: Enum;
}): void;
export declare function Translations(): (prototype: any, key: string) => void;
export {};
