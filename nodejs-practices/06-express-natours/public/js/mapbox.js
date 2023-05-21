

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Fpdm5jdCIsImEiOiJjbGRrY25yajUxemZkM29xemNnYnFhbDE0In0.K77uPTCBI3635xOu0DzT3A';
    var map = new mapboxgl.Map({
        container: 'map',   //put the map on the element with id = 'map'
        style: 'mapbox://styles/saivnct/cldkdrtuw000q01o09de55y4d',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
          .setLngLat([loc.lng,loc.lat])
          .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
          .setLngLat([loc.lng,loc.lat])
          .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
          .addTo(map);

        // Extend map bounds to include current location
        bounds.extend([loc.lng,loc.lat]);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}



