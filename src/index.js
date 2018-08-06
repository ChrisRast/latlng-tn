import axios from "axios";

window.onload = () => {
    const url = "https://nominatim.openstreetmap.org/search?";
    const params = {
        format: "json",
        countrycode: 'tn'
    };
    const download = document.getElementById('download');
    const status = document.getElementById('status');
    download.onclick = (fetchElemEvent) => {
        fetchElemEvent.preventDefault();
        status.innerText = 'Parsing file...';
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const data = readerEvent.target.result.split('\n');
            status.innerText = 'Fetching data...';
            axios.all(data.map((line) => {
                return axios.get(url, {
                    params: {
                        ...params,
                        q: `${line}, Tunisia`
                    }
                })
            }))
            .then(result => {
                status.innerText = 'Creating CSV...';

                let countNA = 0;
                let csv = result.map((aResult, index) => {
                    const label = data[ index ];
                    const [
                        {
                            lat = 'NA',
                            lon: lng = 'NA',
                        } = {}
                    ] = aResult.data;
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


