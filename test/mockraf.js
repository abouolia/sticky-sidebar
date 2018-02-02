function createMockRaf() {
    var allCallbacks = {};
    var callbacksLength = 0;

    var prevTime = 0;

    var now = function () {
        return prevTime;
    };

    var raf = function (callback) {
        callbacksLength += 1;

        allCallbacks[callbacksLength] = callback;

        return callbacksLength;
    };

    var cancel = function (id) {
        delete allCallbacks[id];
    };

    var step = function (opts) {
        var options = Object.assign({}, {
            time: 1000 / 60,
            count: 1
        }, opts);

        var oldAllCallbacks;

        for (var i = 0; i < options.count; i++) {
            oldAllCallbacks = allCallbacks;
            allCallbacks = {};

            Object.keys(oldAllCallbacks).forEach(function (id) {
                var callback = oldAllCallbacks[id];
                callback(prevTime + options.time);
            });

            prevTime += options.time;
        }
    }

    return {
        now: now,
        raf: raf,
        cancel: cancel,
        step: step
    };
}