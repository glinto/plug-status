export class SubscriptionWrapper {
    constructor(registration) {
        if (registration.constructor.name !== 'ServiceWorkerRegistration') {
            throw new Error('Invalid argument, must be ServieWorkerRegistration class');
        }
        this._registration = registration;
    }

    subscribe() {
        return this._registration.pushManager.subscribe({
            userVisibleOnly: true
        });
    }

    /*unsubscribe() {
        return this._registration.pushManager.getSubscription()
            .then((subscription) => {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            });
    }*/
}