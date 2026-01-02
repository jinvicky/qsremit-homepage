$(document).ready(function() {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	$.ajaxSetup({
		headers: {
			"Content-Type": "application/json"
		},
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		}
	})

	const table = new DataTable("#amlUploadTable", {
		columns: [
			{ data: "id", width: "5%", title: "ID" },
			{ data: "fileType", width: "20%", title: "File Type",
				render: function (data) {return formatEnumString(data) } },
			{ data: "fileName", title: "File Name" },
			{
				data: "logTime", title: "Upload Time",
				render: function (data) {
					return moment(data).format('YYYY-MM-DD HH:mm:ss');
				},
				width: "15%"
			},
			{ data: "uploadType", visible: false }
		],
		columnDefs: [
			{ targets: [0, 4], className: "dt-head-center dt-body-center" }
		],
		rowCallback: function (row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		},
		order: [[ 3, "desc" ]],
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		searching: false,
		initComplete: function () {
			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		}
	})

    $.ajax({
        url: "/amlManagement/getUploadList",
        type: "GET",
        success: function (response) {
			console.log(response);

            table.clear();
            table.rows.add(response.uploadHistory);
            table.draw();
            fetchLastestLogData(response.lastestUpload);
        }
    })

    function fetchLastestLogData (response) {
		const fileLinks = {
			'US_OFAC_SDN_LIST': {
				link: 'https://sanctionslist.ofac.treas.gov/Home/SdnList',
			},
			'UN_SECURITY_COUNCIL_LIST': {
				link: 'https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list',
			},
			'UN_ISIL_AQ_LIST': {
				link: 'https://main.un.org/securitycouncil/en/sanctions/1267/aq_sanctions_list',
			},
			'UN_1718_SANCTIONS_LIST': {
				link: 'https://main.un.org/securitycouncil/en/sanctions/1718/materials',
			},
			'UN_IRAN_IRAQ_LIST': {
				link: 'https://main.un.org/securitycouncil/en/sanctions/1518/materials',
			},
			'OPEN_SANCTION_LIST': {
				link: 'https://www.opensanctions.org/pep/',
			},
			'EU_FINANCIAL_SANCTIONS_LIST': {
				link: 'https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-%09entities-subject-to-eu-financial-sanctions?locale=en',
			},
			'JAPAN_GANG_LIST': {
			},
			'JAPAN_MINISTRY_OF_FINANCE': {
				link: 'https://www.mof.go.jp/policy/international_policy/gaitame_kawase/gaitame/economic_sanctions/list.html',
			},
		};

		const collectionCycle = 'Daily 00:00 AM';
		const upload = 'Crawling';

        const tableBody = document.querySelector("#amlUploadLastestLogTable tbody");
        tableBody.textContent = "";

		response.forEach(row => {
			const tableRow = document.createElement("tr");
			const formattedLogTime = moment(row.logTime).format('YYYY-MM-DD HH:mm:ss');

			const linkData = fileLinks[row.fileType] || {};
			const link = linkData.link;

			const fileTypeCell = link
				? `<a href="${link}" style="text-decoration: none;">${formatEnumString(row.fileType)}</a>`
				: `<a href="/amlManagement/download/${row.fileType}" style="text-decoration: none;">${formatEnumString(row.fileType)}</a>`;

			tableRow.innerHTML = `
		<td>${(row.fileType === 'JAPAN_GANG_LIST') ? 'Check Email' : upload}</td>
        <td>${fileTypeCell}</td>
        <td>${row.fileName}</td>
		<td>${collectionCycle}</td>
        <td class="text-center">
            ${formattedLogTime}
        </td>
        `;
			tableBody.appendChild(tableRow);
		});
	}

	function formatEnumString(input) {
		if(input === null) return 'Unknown';
		if(typeof input !== 'string') return input;
		const formatted = input
			.toLowerCase()
			.replace(/_/g, ' ');

		return formatted
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);

	// 파일 업로드 코드
	// document.getElementById("uploadForm")
	// 	.addEventListener("submit", async (event)=>{
	// 		event.preventDefault();
	// 		const overlay = document.createElement("div");
	// 		overlay.id = "overlay";
	// 		overlay.style.position = "fixed";
	// 		overlay.style.top = "0";
	// 		overlay.style.left = "0";
	// 		overlay.style.width = "100%";
	// 		overlay.style.height = "100%";
	// 		overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	// 		overlay.style.zIndex = "999"; // 최상위 z-index 설정
	// 		document.body.appendChild(overlay);
	// 		const loadingIndicator = document.createElement("div");
	// 		loadingIndicator.id = "loadingIndicator";
	// 		loadingIndicator.textContent = "Data is being processed. Please wait, this may take a few minutes.";
	// 		loadingIndicator.style.position = "fixed";
	// 		loadingIndicator.style.top = "50%";
	// 		loadingIndicator.style.left = "50%";
	// 		loadingIndicator.style.transform = "translate(-50%, -50%)";
	// 		loadingIndicator.style.backgroundColor = "rgba(0,0,0,0.8)";
	// 		loadingIndicator.style.color = "white";
	// 		loadingIndicator.style.padding = "20px";
	// 		loadingIndicator.style.zIndex = "1000";
	// 		loadingIndicator.style.borderRadius = "5px";
	// 		document.body.appendChild(loadingIndicator);
	//
	// 		try {
	// 			const formData = new FormData();
	// 			const file = document.getElementById("file");
	// 			const fileType = document.getElementById("fileType").value;
	//
	// 			if (!file.files[0]) {
	// 				alert("No File Selected");
	// 				return;
	// 			}
	// 			const allowedExtensions = ["xml", "xls", "xlsx", "csv"];
	// 			const fileExtension = file.files[0].name.split('.').pop().toLowerCase();
	// 			if (!allowedExtensions.includes(fileExtension)) {
	// 				alert("Invalid file type. Only XML, XLS, XLSX, CSV files are allowed.");
	// 				return;
	// 			}
	//
	// 			formData.append("file", file.files[0]);
	// 			formData.append("fileType", fileType);
	// 			const response = await fetch("/amlManagement/upload", {
	// 				method: "POST",
	// 				body: formData,
	// 				headers: {
	// 					[header]: token,
	// 				}
	// 			});
	// 			if (response.ok) {
	// 				const result = await response.text();
	// 				alert(result);
	// 				location.reload();
	// 			} else {
	// 				const error = await response.json();
	// 				alert(`Error: ${error.message || response.statusText}`);
	// 			}
	// 		} catch (error) {
	// 			console.error("An error occurred:", error);
	// 			alert("An unexpected error occurred. Please try again.");
	// 		} finally {
	// 			const overlayElement = document.getElementById("overlay");
	// 			const loadingElement = document.getElementById("loadingIndicator");
	// 			if (overlayElement) overlayElement.remove();
	// 			if (loadingElement) {
	// 				loadingElement.remove();
	// 			}
	// 		}
	// 	})

	// document.getElementById('file').addEventListener('change', function () {
	// 	const fileName = this.files[0]?.name || '';
	// 	document.getElementById('fileName').value = fileName;
	// });

});