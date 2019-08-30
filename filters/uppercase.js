export default function  (str) {
    if (str && typeof str === 'string') {
        return str.toUpperCase();
    }
    return '';
}