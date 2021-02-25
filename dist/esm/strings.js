var Strings = /** @class */ (function () {
    function Strings() {
    }
    Strings.titleize = function (str) {
        if (!str.split)
            return str;
        str = str.replace(/([A-Z])/g, function (c) { return ' ' + c.toUpperCase(); });
        var _titleizeWord = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };
        var result = [];
        str.split(' ').forEach(function (w) {
            result.push(_titleizeWord(w));
        });
        return result.join(' ');
    };
    return Strings;
}());
export { Strings };
