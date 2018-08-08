import axios from "axios";

window.onload = () => {
	const url = "https://eu1.locationiq.com/v1/search.php?";
	const params = {
		format: "json",
		countrycode: 'tn',
		viewbox: [
			"7.5219807",
			"30.230236",
			"11.8801133",
			"37.7612052",
		].join(','),
		bounded: 1,
		limit: 1,
		"accept-language": 'fr'
	};
	const parse = document.getElementById('parse');
	const download = document.getElementById('download');
	const status = document.getElementById('status');
	const fileInput = document.getElementById('input');
	const key = document.getElementById('key');
	const rate = document.getElementById('rate');

	fileInput.onchange = () => {
		if (fileInput.files[ 0 ] && key) {
			parse.disabled = false;
		}
	}
	parse.onclick = (fetchElemEvent) => {
		fetchElemEvent.preventDefault();
		download.innerText = '';
		status.innerText = 'Parsing file...';
		const reader = new FileReader();
		reader.onload = (readerEvent) => {
			let data = [];
			try {
				data = readerEvent.target.result.split('\n');
			} catch (error) {
				status.innerText = error;
				throw new Error(error);
			}

			status.innerText = `Fetching data... 0/${data.length}`;
			let firstLineNbValues = null;
			const result = [];
			let index = 0;
			const interval = setInterval(sendRequest, (60 / rate.value * 1000))
			let countNA = 0;

			const callback = () => {
				status.innerText = 'Creating CSV...';

				let csv = result.map(({
					res,
					line
				}) => {
					const [
						{
							lat = 'NA',
							lon: lng = 'NA',
							display_name
						} = {}
					] = res.data;
					if (lat === 'NA' || lng === 'NA') countNA++;

					return `\n${line},${lat},${lng},${display_name}`;
				});

				csv.unshift(`${Array(firstLineNbValues).join(',')},lat,lng,display_name`);
				const finalTxt = csv.join('');
				download.onclick = (dlElemEvent) => {
					dlElemEvent.target.href = 'data:text/plain;charset=utf-8,'
						+ encodeURIComponent(finalTxt);
				};
				status.innerText = 'Finished';

				download.innerText = 'Now download the file!';

				document.getElementById('result').innerText = finalTxt;
				status.innerText = countNA ? `❌ ${countNA} lines in ${data.length} failed to be geocoded.` : '✔ All lines with content were geocoded.';
			}
			function sendRequest() {
				status.innerText = `Fetching data... ${index + 1}/${data.length}`;
				const line = data[ index ];
				if (index === 0) {
					firstLineNbValues = line.split(',').length
				}
				if (index + 1 === data.length) clearInterval(interval);
				index++
				if (line.length) {
					axios.get(url, {
						params: {
							...params,
							q: line,
							key: key.value
						}
					}).then((res) => {
						result.push({
							res,
							line
						});
					}).catch((error) => {
						countNA++;
					}).finally(() => {
						if (index === data.length) {
							callback();
						}
					});
				} else if (index === data.length) {
					callback();
				}
			}
		};
		reader.readAsText(fileInput.files[ 0 ]);
	};
}


