self.addEventListener("notificationclick", (event) => {
    console.log(`On notification click: ${event.notification.tag}`);
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true
            })
            .then((clientList) => {
                for (const client of clientList) {
                    if ("focus" in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow("/");
            })
    );
});