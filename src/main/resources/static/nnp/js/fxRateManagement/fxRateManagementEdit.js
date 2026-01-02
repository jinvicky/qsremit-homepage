$(document).ready(function() {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	const urlParams = new URLSearchParams(window.location.search);
	const remitterId = urlParams.get('remitterId');

	/* === Partner Table === */
	const partnerEditor = new DataTable.Editor({
		ajax: {
			edit: {
				type: 'PUT',
				url: `/fxRateManagement/fxRateManagementPartnerData?remitterId=${remitterId}&id={id}`,
				contentType: 'application/json',
				data: function (data) {
					const updateData = Object.values(data.data)[0];
					return JSON.stringify(updateData);
				},
				xhrFields: {
					withCredentials: true
				},
				beforeSend: function (xhr) {
					xhr.setRequestHeader(header, token);
				},
				success: function () {
					fetchData();
				},
				error: function (xhr, status, error) {
					console.error("Error Message:", error);
				}
			},
		},
		table: "#partnerTable",
		idSrc: "id",
		fields: [
			{label: "headOfficeUsdJpy", name: "headOfficeUsdJpy"},
			{label: "headOfficeCost", name: "headOfficeCost"},
			{label: "headOfficeMargin", name: "headOfficeMargin"},
			{label: "agentMargin", name: "agentMargin"},
			{label: "customerRateCust", name: "customerRateCust"},
		],
	})
	const partnerTable = new DataTable("#partnerTable", {
		order: [[2, 'asc'], [3, 'asc']],
		searching: false,
		rowId: "id",
		columnDefs: [
			{
				targets: [1],
				visible: false
			}
		],
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		columns: [
			{ data: null, orderable: false, render: DataTable.render.select() },
			{ data: "id" },
			{ data: "payoutCountry", orderable: true },
			{ data: "payoutPartner", orderable: true },
			{ data: "headOfficeUsdJpy", orderable: false, render: formatDecimal },
			{
				data: "headOfficeCost",
				orderable: false,
				width: "100px",
				className: "text-end",
				render: function (data, type, rowData) {
					return `
					<div class="d-flex justify-content-between align-items-center">
					<span class="text-end fw-bold badge bg-secondary text-light">${rowData.currencyCode}</span>
					<p class="mb-0">${formatDecimal(data)}</p>
					</div>
					`;
				},
			},
			{ data: "headOfficeMargin", className: "text-end", orderable: false, render: formatDecimal },
			{ data: "agentMarginSettle", className: "text-end", orderable: false, render: formatDecimal },
			{ data: "agentMargin", className: "text-end", orderable: false, render: formatDecimal },
			{
				data: "agentMarginCust",
				orderable: false,
				className: "text-end",
				render: function (data, type, rowData) {
					return `
					<div class="d-flex justify-content-between align-items-center">
					<span class="text-end fw-bold badge bg-secondary text-light">${rowData.currencyCode}</span>
					<p class="mb-0">${formatDecimal(data)}</p>
					</div>
					`;
				},
			},
			{ data: "customerRateSettle", className: "text-end", orderable: false, render: formatDecimal },
			{ data: "customerRateMargin", className: "text-end", orderable: false, render: formatDecimal },
			{
				data: "customerRateCust",
				orderable: false,
				className: "text-end",
				render: function (data, type, rowData) {
					return `
					<div class="d-flex justify-content-between align-items-center">
					<span class="text-end fw-bold badge bg-secondary text-light">${rowData.currencyCode}</span>
					<p class="mb-0">${formatDecimal(data)}</p>
					</div>
					`;
				},
			},
			{
				data: "customerRateMobile", className: "text-end", orderable: false, render: function (data, type, rowData) {
					return `
					<div class="d-flex justify-content-between align-items-center">
					<span class="text-end fw-bold badge bg-secondary text-light">${rowData.currencyCode}</span>
					<p class="text-end mb-0" style="white-space: nowrap;">${formatDecimal(data)} %</p>
					</div>`;
				}
			},
		],
		layout: {
			topEnd: {
				buttons: [
					{
						text: "Partner's FXRate",
						attr: {
							"data-bs-toggle": "modal",
							"data-bs-target": "#con-close-modal"
						},
						className: "btn btn-soft-secondary partners-fx-rate-button"
					},
					{
						text: 'Reload',
						action: function () {
							fetchData();
						},
						className: 'btn btn-soft-secondary'
					},
					{
						text: 'Delete',
						action: function () {
							deleteData();
						},
						className: 'btn btn-danger'
					},
					{
						text: "New FX Rate",
						action: function () {
							window.location.href = `/fxRateManagement/fxRateManagementAddRate?remitterId=${remitterId}`
						},
						className: 'btn btn-outline-primary width-l'
					},
				],
			}
		},
		select: {
			style: 'multi',
			selector: 'td:first-child'
		},
		initComplete: function () {
			$('.dt-button').removeClass('dt-button');

			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		},
		createdRow: function (row, data, dataIndex) {
			const targetColumns = [3, 4, 5, 7, 11];

			targetColumns.forEach((columnIndex) => {
				$(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
			});
		}
	});

	// inline editor
	partnerTable.on('click', 'tbody td', function (e) {
		try {
			partnerEditor.inline(this);
		} catch (error) {
			return;
		}
	});

	// mobile rate 편집
	$("#discountRateButton").on("click", function () {
		const discountRateValue = $("#discountRateValue").val();
		const selectedIds = partnerTable.rows({ selected: true }).data().toArray().map(row => row.id);

		if (!discountRateValue) {
			window.alert("Please enter your Mobile Discount Rate to continue.")
			return
		}
		if (selectedIds.length === 0) {
			window.alert("Please select a partner to apply the mobile discount.");
			return;
		}

		updateMobileRate(selectedIds, discountRateValue);
	});
	function updateMobileRate(ids, mobileRate) {
		$.ajax({
			url: `/api/fxRateManagement/updateMobileRate`,
			type: "PUT",
			xhrFields: {
				withCredentials: true
			},
			contentType: "application/json",
			data: JSON.stringify({
				ids: ids,
				mobileRate: mobileRate,
			}),
			beforeSend: function (xhr) {
				xhr.setRequestHeader(header, token);
			},
			success : function() {
				if (confirm("Mobile Discount Rate updated successfully.")) {
					fetchData();
				}
			},
			error : function(xhr, status, error) {
			}
		});
	}

	// Partner's FXRate 모달창
	$(".partners-fx-rate-button").off("click").on("click", function () {
		const modalBody = $("#con-close-modal .modal-body");
		lastUpdateDate();
		// 로딩 스피너
		modalBody.html('<div class="text-center my-4">' +
			'<div class="spinner-border text-primary" role="status"></div>' +
			'<p class="mt-2">Loading exchange rate information...</p>' +
			'</div>');

		setTimeout(function () {
			try {
				// 테이블  추가
				modalBody.html('<table id="partnersFxRateTable" class="table">' +
					'<thead><tr><th>Partner</th><th>Rate</th></tr></thead>' +
					'<tbody></tbody>' +
					'</table>');

				if ($.fn.DataTable.isDataTable('#partnersFxRateTable')) {
					$('#partnersFxRateTable').DataTable().destroy();
				}

				// DataTable 초기화
				$('#partnersFxRateTable').DataTable({
					ajax: {
						url: "/fxRateManagement/partnersFxRateData",
						type: "GET",
						dataSrc: "",
						error: function (xhr, error, thrown) {
							console.error("DataTable ajax 오류:", error, thrown);
							modalBody.html('<div class="alert alert-danger">Failed to load the exchange rate information.</div>');
						}
					},
					rowId: "id",
					columns: [
						{
							data: "partner",
							render: function(data, type, row) {
								if (data.includes('(')) {
									const name = data.split('(')[0].trim();
									return `${name} (${row.currencyCode})`;
								} else return `${data} (${row.currencyCode})`;
							}
						},
						{
							data: "rate",
							render: function(data, type, row) {
								// 소수점 8자리까지 표시
								if (data === null || data === undefined) return "0.00000000";
								return parseFloat(data).toFixed(8);
							}
						}
					],
					ordering: false,
					searching: false,
					paging: false,
					info: false
				});

			} catch (e) {
				console.error("An error occurred while initializing the table:", e);
				modalBody.html('<div class="alert alert-danger">An error occurred while initializing the table: ' + e.message + '</div>');
			}
		}, 100);
	});
	function lastUpdateDate() {
		$.ajax({
			url : "/systemManagement/apiSchedule/rate",
			type : "GET",
			dataType: "json",
			success : function(response) {
				const dateIds = ["#last-update", "#last-update-tranglo"];
				response.forEach((item, index) => {
					if (index < dateIds.length) {
						const offsetDate = new Date(item.lastUpdate);

						if (dateIds[index] === "#last-update-tranglo") {
							const minutesRounded = Math.floor(offsetDate.getMinutes() / 10) * 10;
							const formattedDate = `${offsetDate.getFullYear()}-${(offsetDate.getMonth() + 1).toString().padStart(2, '0')}-${offsetDate.getDate().toString().padStart(2, '0')} `
								+ `${offsetDate.getHours().toString().padStart(2, '0')}:${offsetDate.getMinutes().toString().padStart(2, '0')}:00`;
							$(dateIds[index]).text(formattedDate);
						} else {
							const formattedDate = `${offsetDate.getFullYear()}-${(offsetDate.getMonth() + 1).toString().padStart(2, '0')}-${offsetDate.getDate().toString().padStart(2, '0')} `
								+ `${offsetDate.getHours().toString().padStart(2, '0')}:${offsetDate.getMinutes().toString().padStart(2, '0')}:${offsetDate.getSeconds().toString().padStart(2, '0')}`;
							$(dateIds[index]).text(formattedDate);
						}
					}
				});
			},
			error : function() {
				$("#last-updated-date").text("Error loading date");
			}
		});
	}

	/**
	 * 남은 0 포맷 함수
	 * @param value
	 * @returns {string}
	 */
	function formatDecimal(value) {
		if (value === null || value === undefined) return "0";

		const num = Number(value);
		if (num === 0) return "0";

		// if (Number.isInteger(num)) {
		// 	return num.toLocaleString();
		// } else {
			const formattedNum = num.toFixed(10); // 소수점 10자리 고정
			const [integerPart, decimalPart] = formattedNum.split(".");

			const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return `${formattedInteger}.${decimalPart}`;
		// }
	}

	const fetchData = () => {
		$('#loadingSpinner').show();

		$.ajax({
			url: "/api/fxRateManagement/",
			method: "GET",
			data: {
				remitterId: remitterId,
			},
			dataType: "json",
			success: function(data) {
				partnerTable.clear().rows.add(data).draw();
			},
			error: function(error) {
				console.error(error);
				alert("An error occurred while fetching the data.");
			},
			complete: function () {
				$('#loadingSpinner').hide();
			}
		})
	}

	fetchData();

	function deleteData() {
		const selectedIds = partnerTable.rows({ selected: true }).data().toArray().map(row => row.id);

		if (selectedIds.length === 0) {
			alert('Please select at least one row to delete.');
			return;
		}

		$.ajax({
			method: 'DELETE',
			url: `/fxRateManagement/fxRateManagementPartnerData?remitterId=${remitterId}`,
			contentType: 'application/json',
			data: JSON.stringify({
				ids: selectedIds
			}),
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader(header, token);
			},
			success: function () {
				alert("FxRate delete successfully.")
				fetchData();
			},
			error: function (xhr, status, error) {
				console.error("Error Message:", error);
				alert("Error occurred while deleting data. Please try again.");
			}
		});
	}

	partnerTable.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		partnerTable.page.len(pageLength);
	}, 0);
});


