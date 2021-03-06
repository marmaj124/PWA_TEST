self.addEventListener("install", function(e) {
    console.log("Eagle has landed");
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log("It is a small step for man but a huge leap for humankind ");
            initialCache.map(function(url) {
                return cache.add(url).catch(function(reason) {
                    );
                });
            });
        })
    );
});


self.addEventListener("activate", function(e) {
    console.log("Eagle was activated");
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(
                keyList.map(function(key) {
                    if (key !== cacheName) {
                        console.log("Old cache removed", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});



self.addEventListener("fetch", function(e) {
    if (new URL(e.request.url).origin !== location.origin) return;

    if (e.request.mode === "navigate" && navigator.onLine) {
        e.respondWith(
            fetch(e.request).then(function(response) {
                return caches.open(cacheName).then(function(cache) {
                    cache.put(e.request, response.clone());
                    return response;
                });
            })
        );
        return;
    }

    e.respondWith(
        caches
            .match(e.request)
            .then(function(response) {
                return (
                    response ||
                    fetch(e.request).then(function(response) {
                        return caches.open(cacheName).then(function(cache) {
                            cache.put(e.request, response.clone());
                            return response;
                        });
                    })
                );
            })
            .catch(function() {
                return caches.match(offlinePage);
            })
    );
});