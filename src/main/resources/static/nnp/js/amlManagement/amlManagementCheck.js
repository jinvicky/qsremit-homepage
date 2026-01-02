$.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
	if (message.includes("Requested unknown parameter")) {
		console.warn("Skipped unknown parameter warning."); // 메시지 무시
	} else {
		console.error("Unhandled DataTables error: ", message); // 다른 에러 로그 처리
	}
};

$(document).ready(function () {
	$("#fullNameInput").focus();

	const table = new DataTable("#amlCheckTable", {
		rowId: "No.",
		columns: [
			{ data: "id", title: "No." },
			{ data: "name", title: "Name" },
			{ data: "score", title: "Match (%)" },
	    ],
		rowCallback: function (row, data, index) {
			const currentRowIndex = index + 1;
			$('td:eq(0)', row).html(currentRowIndex);
		},
		searching: false,
		order:[[3, "desc"]],
		paging: false,
		language: {
			emptyTable: " Loading... "
		},
	});

	const fetchCheckResult = (fullName) => {
		$.ajax({
			url: "/amlManagement/checkNameSimilarity/full",
			method: "GET",
			data: {
				fullname: fullName,
			},
			beforeSend: () => {
				$('#amlResultCard').removeClass("d-none");
			},
			dataSrc: function(data) {
				return data.slice(0, 10);
			},
			success: (data) => {
				if (data.length === 0) { table.settings()[0].oLanguage.sEmptyTable = `"${escapeSpecialCharacters(fullName)}" No matching results.` }
				table.clear();
				table.rows.add(data);
				table.draw();

				if (data.length === 0) {
					$('#amlCheckTable tbody tr')
						.css('background-color', 'rgb(188, 230, 201)');
				} else {
					$('#amlCheckTable tbody tr').each( function () {
						const row = $(this);
						const columnValue= row.find('td:eq(2)').text();
						const MATCH = '100';

						if (columnValue === MATCH) row.css('background-color', 'rgb(251,164,164)');
						else row.css('background-color', '');
					});
				}
			},
			error: (xhr, error, thrown) => {
				console.error("Error:", error);
				alert("An error occurred while fetching the data.");
			},
			complete: function () {
				$('#loadingSpinner').hide();
			}
		})
	}

	 $("#checkBtn").on("click", function() {
		const fullName = $("#fullNameInput").val();

		if (!fullName) {
			alert("Please enter name.");
			return;
		}
		 $('#loadingSpinner').show();
		fetchCheckResult(fullName);

	     const fullNameEl = document.getElementById("fullname");
		 fullNameEl.textContent = '';
		 fullNameEl.appendChild(document.createTextNode('Check with '));
		 const strongEl = document.createElement('strong');
		 strongEl.textContent = fullName;
		 fullNameEl.appendChild(strongEl);
	})

	$(document).on("keypress", function(event) {
		if (event.key === "Enter" || event.keyCode === 13) {
			event.preventDefault();
			$("#checkBtn").trigger("click");
		}
	});

	$('#amlCheckTable tbody').on('click', 'tr', function () {
		const row = table.row(this);
		const isExpanded = $(this).hasClass('shown');

		$('#amlCheckTable tbody tr').removeClass('shown');
		$('.detail-row').remove();

		if (isExpanded) {
			$(this).removeClass('shown');
		} else {
			const rowData = row.data();
			if(rowData == null) return;
			const detailRow = `
            <tr class="detail-row">
                <td colspan="3" class="loading">Loading...</td>
            </tr>`;
			$(this).after(detailRow);
			$(this).addClass('shown');

			$.ajax({
				url: "/amlManagement/detail",
				method: "GET",
				data: {fullName: rowData.name},
				success: function (res) {
					console.log(res, "response");
					let detailContent = "";

					// `res`가 배열이고 비어 있지 않은지 확인
					if (Array.isArray(res) && res.length) {
						res.forEach(response => {
							if (!response) {
								return;  // 개별 response 값이 유효하지 않은 경우 무시
							}

							detailContent += `
<tr class="detail-row">
    <td colspan="3">
        <table class="table mb-0 table-bordered">
            <tbody>
                <tr>
                    <th class="col-2 table-light">Type</th>
                    <td id="type">${response.type || '-'}</td>
                    <th class="col-2 table-light">Check List</th>
                    <td id="listType">${response.listType || '-'}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Full Name</th>
                    <td id="fullName">${response.fullName || '-'}</td>
                    <th class="col-2 table-light">Unique ID</th>
                    <td id="listType">${response.uniqueId || '-'}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Date of Birth</th>
                    <td id="birthDate">${response.birthDate || '-'}</td>
                    <th class="col-2 table-light">Place of Birth</th>
                    <td id="birthPlace">${response.birthPlace || '-'}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Aliases</th>
                    <td id="aliases">${response.aliases || '-'}</td>
                    <th class="col-2 table-light">Remark</th>
                    <td id="remark">${response.remark || '-'}</td>
                </tr>
            </tbody>
        </table>
    </td>
</tr>`;

							// Identification 처리
							if (response.identifications && response.identifications.length > 0) {
								detailContent += `
<tr class="detail-row">
    <td colspan="3">
        <table class="table mb-0 table-bordered">
            <thead>
                <tr class="table-info">
                    <th colspan="6" class="table-light">Identification</th>
                </tr>
                <tr class="table-light">
                    <th>Type</th>
                    <th>Country</th>
                    <th>Expire Date</th>
                    <th>Identification ID</th>
                    <th>Issue Date</th>
                    <th>Note</th>
                </tr>
            </thead>
            <tbody>`;

								response.identifications.forEach(identification => {
									detailContent += `
<tr>
    <td>${identification.type || '-'}</td>
    <td>${identification.country || '-'}</td>
    <td>${identification.expireDate || '-'}</td>
    <td>${identification.identificationId || '-'}</td>
    <td>${identification.issueDate || '-'}</td>
    <td>${identification.note || '-'}</td>
</tr>`;
								});

								detailContent += `
            </tbody>
        </table>
    </td>
</tr>`;
							}

						});

						// `.detail-row` 제거
						$('.detail-row').remove();

						// row.node()가 유효한지 확인
						const rowNode = row?.node ? row.node() : null;

						if (rowNode) {
							$(rowNode).after(detailContent); // detailContent 추가
						} else {
							console.error("Row node is not available or invalid.");
						}

					} else {
						// `.detail-row` 제거
						$('.detail-row').remove();

						// 데이터가 없는 경우 처리
						const noDataContent = `
<tr class="detail-row">
    <td colspan="3" class="error">No details available for this entry.</td>
</tr>`;

						const rowNode = row?.node ? row.node() : null;

						if (rowNode) {
							$(rowNode).after(noDataContent); // noDataContent 추가
						} else {
							console.error("Row node is not available for no-data content.");
						}
					}
				},
				error: function () {
					$('.detail-row').remove();
					const errorContent = `
                    <tr class="detail-row">
                        <td colspan="3" class="error">Failed to load details. Please try again.</td>
                    </tr>`;
					$(row.node()).after(errorContent);
				}
			});
		}
	});

});