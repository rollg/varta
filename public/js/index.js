var sock = new SockJS('/sockjs/agent');
go();

function go(){
    sock.onopen = function() {
        console.log('open');
    };
    sock.onmessage = function(e) {
        console.log('message', e.data);
    };
    sock.onclose = function() {
        console.log('close');
    };

    var options = { timeout: 30000 };
    var watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);

    var element = document.getElementById('geolocation');

    function onSuccess(position) {
        element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                            'Longitude: ' + position.coords.longitude     + '<br />' +
                            'Heading: ' + position.coords.heading     + '<br />' +
                            'Speed: ' + position.coords.speed     + '<br />' +
                            'Timestamp: '          + position.timestamp;

        sock.send( JSON.stringify(position) );
    }
    function onError(error) {
        element.innerHTML = 'Error';
    }
}
