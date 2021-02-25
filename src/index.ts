import { Clipboard } from "./clipboard";
import { Strings } from "./strings";
import { deepCopy } from "./copy";

export const appBaseTranslations = {};
export const appTranslations = {};

const setTranslationArray = (propertyName, langIndex) => {
    let baseValue = appBaseTranslations[propertyName];
    let value = appTranslations[propertyName];
    const props = Object.getOwnPropertyNames(baseValue);
    for (const prop of props) {
        // if (baseValue[prop].length == 1) continue;
        if (typeof value[prop] === "function") {
            try {
                value[prop] = (...args) => {
                    return baseValue[prop](args)[langIndex];
                }
            } catch (c) { }
        } else if (baseValue[prop])
            value[prop] = baseValue[prop][langIndex];
    }
};

export function setTranslationLanguage(langIndex: number) {
    const prototypes = Object.getOwnPropertyNames(appTranslations);
    for (const prototype of prototypes) {
        setTranslationArray(prototype, langIndex);
    }
}

var showMissingTranslations = false;
var currentLanguageIndex = 0;

var languagesCount: number = 2;
interface Enum {
    [id: number]: string
}
var languagesEnum: Enum;

export function configTranslations(options: { showMissingTranslations?: boolean, languagesEnum?: Enum }) {
    if (typeof (options?.showMissingTranslations) !== 'undefined')
        showMissingTranslations = options?.showMissingTranslations;

    if (typeof (options?.languagesEnum) !== 'undefined') {
        languagesEnum = options?.languagesEnum;
        languagesCount = Object.keys(languagesEnum).length / 2;
    }
    console.log(languagesCount);
}
export function Translations() {
    const missingTranslations = {};
    let missingTranslationsTimeout;
    return (prototype: any, key: string) => {
        Object.defineProperty(prototype, key, {
            set(value: any) {
                let baseValue = value;

                if (!baseValue._translated) {
                    prototype.constructor._uid = prototype.constructor._uid || Date.now();

                    appTranslations[prototype.constructor._uid] = value;
                    appBaseTranslations[prototype.constructor._uid] = deepCopy(value);

                    // if (Settings.isLanguageApplied) {
                    setTranslationArray(prototype.constructor._uid, currentLanguageIndex)
                    // } else {
                    // Settings.languageAsync.subscribe(langIndex => localizeTranslationArray(prototype.constructor._uid, langIndex));
                    // }
                }

                if (showMissingTranslations) {
                    value = new Proxy(value, {
                        get: (target, propName) => {
                            if (baseValue[propName]) return baseValue[propName];
                            else {
                                const suggested = Strings.titleize(
                                    propName.toString().replace("_", " ")
                                );
                                const suggestedArray = [];
                                for (let i = 0; i < languagesCount; i++) {
                                    const element = languagesCount[i];
                                    if (languagesEnum[i].toLowerCase() == 'english')
                                        suggestedArray.push(suggested);
                                    else
                                        suggestedArray.push('');
                                }
                                missingTranslations[propName.toString()] = suggestedArray;
                                if (missingTranslationsTimeout)
                                    clearTimeout(missingTranslationsTimeout);
                                missingTranslationsTimeout = setTimeout(() => {
                                    let output = "Translations = {\n";

                                    console.warn("Missing Translations");
                                    // tslint:disable-next-line:forin
                                    const missingKeys = Object.getOwnPropertyNames(
                                        missingTranslations
                                    );
                                    for (let i = 0; i < missingKeys.length; i++) {
                                        const missingKey = missingKeys[i];
                                        const missingValue = missingTranslations[missingKey];

                                        output += `\t${missingKey} = [${missingValue.map(s => `'${s}'`).join(', ')}]`;
                                        output += `;`;
                                        output += `\n`;
                                    }
                                    output += "};\n";
                                    console.log(output);
                                    Clipboard.copy(output);
                                }, 1000);
                                return (baseValue[
                                    propName
                                ] = `🎃 missingTranslation (${propName.toString()}) 🎃`);
                            }
                        },
                    });
                }

                baseValue._translated = true;
                Object.defineProperty(this, key, {
                    value,
                    enumerable: true,
                });
            },
            enumerable: true,
            configurable: true,
        });
    };
}
