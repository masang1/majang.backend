declare global {
    interface String {
        format(vars: { [key: string]: any }): string
    }
}

export { }

String.prototype.format = function (vars: { [key: string]: any }): string {
    return this.replace(/{(\w+)}/g, function (match, key) {
        return vars[key] || match;
    });
}