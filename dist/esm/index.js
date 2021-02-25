import { Clipboard } from "./clipboard";
import { Strings } from "./strings";
import { deepCopy } from "./copy";
export var appBaseTranslations = {};
export var appTranslations = {};
var setTranslationArray = function (propertyName, langIndex) {
    var baseValue = appBaseTranslations[propertyName];
    var value = appTranslations[propertyName];
    var props = Object.getOwnPropertyNames(baseValue);
    var _loop_1 = function (prop) {
        // if (baseValue[prop].length == 1) continue;
        if (typeof value[prop] === "function") {
            try {
                value[prop] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return baseValue[prop](args)[langIndex];
                };
            }
            catch (c) { }
        }
        else if (baseValue[prop])
            value[prop] = baseValue[prop][langIndex];
    };
    for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
        var prop = props_1[_i];
        _loop_1(prop);
    }
};
export function setTranslationLanguage(langIndex) {
    var prototypes = Object.getOwnPropertyNames(appTranslations);
    for (var _i = 0, prototypes_1 = prototypes; _i < prototypes_1.length; _i++) {
        var prototype = prototypes_1[_i];
        setTranslationArray(prototype, langIndex);
    }
}
var showMissingTranslations = false;
var currentLanguageIndex = 0;
var languagesCount = 2;
var languagesEnum;
export function configTranslations(options) {
    if (typeof (options === null || options === void 0 ? void 0 : options.showMissingTranslations) !== 'undefined')
        showMissingTranslations = options === null || options === void 0 ? void 0 : options.showMissingTranslations;
    if (typeof (options === null || options === void 0 ? void 0 : options.languagesEnum) !== 'undefined') {
        languagesEnum = options === null || options === void 0 ? void 0 : options.languagesEnum;
        languagesCount = Object.keys(languagesEnum).length / 2;
    }
    console.log(languagesCount);
}
export function Translations() {
    var missingTranslations = {};
    var missingTranslationsTimeout;
    return function (prototype, key) {
        Object.defineProperty(prototype, key, {
            set: function (value) {
                var baseValue = value;
                if (!baseValue._translated) {
                    prototype.constructor._uid = prototype.constructor._uid || Date.now();
                    appTranslations[prototype.constructor._uid] = value;
                    appBaseTranslations[prototype.constructor._uid] = deepCopy(value);
                    // if (Settings.isLanguageApplied) {
                    setTranslationArray(prototype.constructor._uid, currentLanguageIndex);
                    // } else {
                    // Settings.languageAsync.subscribe(langIndex => localizeTranslationArray(prototype.constructor._uid, langIndex));
                    // }
                }
                if (showMissingTranslations) {
                    value = new Proxy(value, {
                        get: function (target, propName) {
                            if (baseValue[propName])
                                return baseValue[propName];
                            else {
                                var suggested = Strings.titleize(propName.toString().replace("_", " "));
                                var suggestedArray = [];
                                for (var i = 0; i < languagesCount; i++) {
                                    var element = languagesCount[i];
                                    if (languagesEnum[i].toLowerCase() == 'english')
                                        suggestedArray.push(suggested);
                                    else
                                        suggestedArray.push('');
                                }
                                missingTranslations[propName.toString()] = suggestedArray;
                                if (missingTranslationsTimeout)
                                    clearTimeout(missingTranslationsTimeout);
                                missingTranslationsTimeout = setTimeout(function () {
                                    var output = "Translations = {\n";
                                    console.warn("Missing Translations");
                                    // tslint:disable-next-line:forin
                                    var missingKeys = Object.getOwnPropertyNames(missingTranslations);
                                    for (var i = 0; i < missingKeys.length; i++) {
                                        var missingKey = missingKeys[i];
                                        var missingValue = missingTranslations[missingKey];
                                        output += "\t" + missingKey + " = [" + missingValue.map(function (s) { return "'" + s + "'"; }).join(', ') + "]";
                                        output += ";";
                                        output += "\n";
                                    }
                                    output += "};\n";
                                    console.log(output);
                                    Clipboard.copy(output);
                                }, 1000);
                                return (baseValue[propName] = "\uD83C\uDF83 missingTranslation (" + propName.toString() + ") \uD83C\uDF83");
                            }
                        },
                    });
                }
                baseValue._translated = true;
                Object.defineProperty(this, key, {
                    value: value,
                    enumerable: true,
                });
            },
            enumerable: true,
            configurable: true,
        });
    };
}
