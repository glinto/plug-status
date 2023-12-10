export function log(...args) {
    console.log(new Date().toISOString(), ...args);
    //document.querySelector('div[data-label="log"]').innerHTML = args.join(' ');
}