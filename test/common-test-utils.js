import { isMoment } from "moment";

export function log(title,obj) {
    if (typeof(title) == 'object' || obj == null) {
        console.log(printAny(title))
    } else {
        console.log(`${title} ->`,printAny(obj))
    }
}

export function printAny(obj,indent=2) {
    const b = (obj instanceof Array ? '[]' : '{}')
    let out = (`${b[0]}\n`.padStart(indent > 2 ? 2 : 0, ' '));
    let keys = (typeof(obj)=='object' ? Object.keys(obj) : [])
    
    for (let i=0; i<keys.length; i++) {
        const key = keys[i];
        const item = obj[key];
        const type = typeof(item);
        if (isMoment(item)) {
            out += ''.padStart(indent+2, ' ') + key + ': ' + item.format('YYYY-MM-DD HH:mm:ss.SSS ZZ, ddd, MMM') + " (moment)\n"
        } else if (item instanceof Object) {
            out += ''.padStart(indent+2, ' ') + key + ': ' + printAny(item, indent+4)
        } else {
            out += ''.padStart(indent+2, ' ') + key +
                (type == 'string'
                    ? `: '${item}',\n`
                    : `: ${item},\n`
                )
        }

    }

    out += (`${b[1]}`.padStart(indent-1, ' '));
    out += (indent == 2 ? "\n" : ",\n")

    return out;
}