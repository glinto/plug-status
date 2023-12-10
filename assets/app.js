import { LocalStorageMap } from './storage.js';
const $spotstatus = {
    sentinel: undefined,
    available: false,
    interval: undefined,
    registration: undefined,
    storage: new LocalStorageMap('state')
};
const SPOT_URL = 'https://hr.rechargespots.eu/DuskyWebApi//noauthlocation?Id=275&isOldApi=false&UiCulture=en-GB&userActualGPSLatitude=43.51330215622098&userActualGPSLongitude=16.503646714095122';

function notify(str) {
    if ($spotstatus.registration === undefined) {
        return;
    }
    if (!("Notification" in window)) {
        // Check if the browser supports notifications
        log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        const notification = $spotstatus.registration.showNotification(str);
        // …
    } else if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission()
            .then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    const notification = $spotstatus.registration.showNotification(str);
                }
            })
            .catch((err) => {
                log('Notification permission', err);
            });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.
}

function getWakeLock() {
    if ($spotstatus.sentinel !== undefined)
        return Promise.resolve($spotstatus.sentinel);
    if ('wakeLock' in navigator) {
        return navigator.wakeLock.request('screen')
            .then(wakeLock => {
                log('Wake lock is active');
                showStatus('Wake lock is active');
                $spotstatus.sentinel = wakeLock;
                $spotstatus.sentinel.addEventListener('release', () => {
                    log('Wake lock was released');
                    $spotstatus.sentinel = undefined;
                });
                return wakeLock;
            });
    } else {
        console.warn('Wake lock API not supported.');
        return Promise.reject('Wake lock API not supported.');
    }
}

function fetchStatus() {
    fetch(SPOT_URL, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Accept': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    }).then((response) => {
        return response.json();
    }).then((data) => {
        let freeSpots = 0;
        let totalSpots = 0;
        if (Array.isArray(data.ChargePoints)) {
            for (const cp of data.ChargePoints) {
                if (Array.isArray(cp.Evses)) {
                    for (const evse of cp.Evses) {
                        if (Array.isArray(evse.Connectors)) {
                            for (const connector of evse.Connectors) {
                                //console.log(connector.Status);
                                totalSpots++;
                                if (connector.Status.Id === 3) {
                                    freeSpots++;
                                }
                            }
                        }
                    }
                }
            }
        }
        document.querySelector('div[data-label="spot-count"]').innerHTML = `${freeSpots}/${totalSpots}`;
        if (freeSpots > 0) {
            log(`${freeSpots} of ${totalSpots} spots are free!`);
            if (!$spotstatus.storage.get('available')) {
                notify(`${freeSpots} of ${totalSpots} spots are available`);
            }
            $spotstatus.storage.set('available', true);
            document.querySelector('div.donut').classList.add('donut-free');
        }
        else {
            log(`All ${totalSpots} spots are taken`);
            $spotstatus.storage.set('available', false);
            document.querySelector('div.donut').classList.remove('donut-free');
        }
        document.querySelector('div.donut-content').classList.remove('v-hidden');
        const d = new Date();
        showStatus(`Updated at ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }).catch((err) => {
        log(err);
    })
}

function log(...args) {
    console.log(new Date().toISOString(), ...args);
    //document.querySelector('div[data-label="log"]').innerHTML = args.join(' ');
}

function registerWorker() {
    if ('serviceWorker' in navigator) {
        return navigator.serviceWorker.register('assets/sw.js');
    }
    else {
        return Promise.reject('ServiceWorker not supported');
    }
}

document.addEventListener('DOMContentLoaded', () => {

    registerWorker()
        .then((registration) => {
            log('ServiceWorker registration successful', registration);
            $spotstatus.registration = registration;
        })
        .catch((err) => {
            log('ServiceWorker registration failed: ', err);
        })
        .then(() => getWakeLock())
        .catch((err) => {
            log('WakeLock request failed: ', err);
        })
        .then(() => subscribe())
        .catch((err) => {
            log('Subscripton error', err);
        })
        .finally(() => {
            fetchStatus();
            $spotstatus.interval = setInterval(fetchStatus, 15000 * Math.random() + 45000);
        });
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        getWakeLock()
            .catch((err) => {
                log('WakeLock request failed: ', err);
            });
    }
});

function showStatus(str) {
    document.querySelector('div[data-label="log"]').textContent = str;
}