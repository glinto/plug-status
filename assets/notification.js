export class NotificationWrapper {
    constructor(registration) {
        if (registration.constructor.name !== 'ServiceWorkerRegistration') {
            throw new Error('Invalid argument, must be ServieWorkerRegistration class');
        }
        this._registration = registration;
    }

    notify(str) {
        if (!("Notification" in window)) {
            return Promise.reject("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            return this._registration.showNotification(str);
        } else if (Notification.permission !== "denied") {
            // We need to ask the user for permission
            return Notification.requestPermission()
                .then((permission) => {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        return this._registration.showNotification(str);
                    }
                });
        }
        return Promise.reject('Notification permission denied');
    }
}