if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('/service-worker.js').then(function (reg) {
        reg.update();
        console.log(':^)', reg);
    }).catch(function (error) {
        console.log(':^(', error);
    });
}