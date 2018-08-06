import axios from "axios";
import _ from 'lodash-es';

window.onload = () => {
    const url = "https://nominatim.openstreetmap.org/search";
    // const url = "https://maps.googleapis.com/maps/api/geocode/json";
    const params = {
        format: "json",
        countrycode: 'tn'
        // region: 'tn',
        // key: 'AIzaSyBhNOzK8XBVvqnzfZKu9_3vTKsEXsRXGAs'
    };
    const download = document.getElementById('download');
    const status = document.getElementById('status');
    download.onclick = (fetchElemEvent) => {
        fetchElemEvent.preventDefault();
        status.innerText = 'Parsing file...';
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const data = readerEvent.target.result.split('\r\n');
            status.innerText = 'Fetching data...';
            axios.all(data.map((line) => {
                return axios.get(url, {
                    params: {
                        ...params,
                        q: `${line}, Tunisia`
                        // address: `${line}, Tunisia`
                    }
                })
            })).then(result => {
                status.innerText = 'Creating CSV...';

                let countNA = 0;
                let csv = result.map((aResult, index) => {
                    const label = data[ index ];
                    // const location = _.get(aResult, 'data.results.0.geometry.location', {});
                    const location = _.get(aResult, 'data.0', {});
                    const {
                        lat = 'NA',
                        lon: lng = 'NA',
                    } = location;
                    if (lat === 'NA' || lng === 'NA') countNA++;

                    return `\n${label},${lat},${lng}`;
                });

                csv.unshift('lbgouver,lbdeleg,lat,lng');
                const finalTxt = csv.join('');
                download.onclick = (dlElemEvent) => {
                    dlElemEvent.target.href = 'data:text/plain;charset=utf-8,'
                        + encodeURIComponent(finalTxt);
                };
                status.innerText = 'Finished';

                download.innerText = 'Now download the file!';

                document.getElementById('result').innerText = finalTxt;
                status.innerText = `${countNA} geolocations failed to be found. Check the generated file :-)`;
            }).catch(error => {
                console.log("error", error);
            });
        };
        reader.readAsText(document.getElementById('input').files[ 0 ]);
    };
}

