export class Strings {
    static titleize(str): string {
        if (!str.split) return str;

        str = str.replace(/([A-Z])/g, (c) => { return ' ' + c.toUpperCase(); });
        const _titleizeWord = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };
        const result = [];
        str.split(' ').forEach(function (w) {
            result.push(_titleizeWord(w));
        });
        return result.join(' ');
    }
}