$(document).ready(function() {
	const REMITTER_INDEX = 0;
	const PAYOUT_COUNTY_INDEX = 1;
	const PAYOUT_PARTNER_INDEX = 2;

	const today = moment();
	const formattedDate = today.format('YYYY-MM-DD');

	const formattedOneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD');

	document.getElementById("startDate").value = formattedOneWeekAgo;
	document.getElementById("endDate").value = formattedDate;

	const table = new DataTable("#fxRateHistoryTable", {
		columns: [
		    { data: "id" },
			{ data: "payoutCountry" },
			{ data: "payoutPartner" },
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
			{
				data: "createAt", className:"text-center", render: function (data) {
					return `<span style="white-space: nowrap">${moment(data).format("YYYY-MM-DD hh:mm:ss")}</span>`;
				}
			},
		],
		rowId: "id",
		ordering: false,
		searching: false,
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		rowCallback: function(row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		},
		initComplete: function () {
			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		}
	})

	const fetchData = (startDate, endDate, remitter, payoutCountry, payoutPartner) => {
		$.ajax({
			url: "/api/fxRateManagement/fxRateManagementHistory",
			method: "GET",
			dataType: "json",
			data: {
				startDate: startDate,
				endDate: endDate,
				remitter: remitter,
				country: payoutCountry,
				partner: payoutPartner
			},
			success: function(data) {
				table.clear().rows.add(data).draw();

				$("#startDate").datepicker('update', startDate);
				$("#endDate").datepicker('update', endDate);
				$("#remmitterSelect").val(remitter);
				$("#payoutCountrySelect").val(payoutCountry);
				$("#payoutPartnerSelect").val(payoutPartner);

				table.columns().every(function (index) {
					if (index === PAYOUT_COUNTY_INDEX || index === PAYOUT_PARTNER_INDEX) {
						let column = this;
						let currentSelect = createNewSelect()

						column.data().unique().sort((a, b) => {
							const aStr = (a || "").toString().toLowerCase();
							const bStr = (b || "").toString().toLowerCase();
							return aStr.localeCompare(bStr);
						}).each(function (data, index) {
							const optionValue = data && data.replace(/&amp;/g, "&");
							const option = new Option(optionValue, optionValue);
							currentSelect.add(option);
						});

						// if (index === REMITTER_INDEX && $("#remmitterSelect select").length === 0) {
						// 	$("#remmitterSelect").append(currentSelect);
						if (index === PAYOUT_COUNTY_INDEX && $("#payoutCountrySelect select").length === 0) {
							$("#payoutCountrySelect").append(currentSelect);
						} else if (index === PAYOUT_PARTNER_INDEX && $("#payoutPartnerSelect select").length === 0) {
							$("#payoutPartnerSelect").append(currentSelect);
						}
					}
				});
			},
			error: function(error) {
				console.log(error);
				alert("An error occurred while fetching the data.");
			}
		})
	}

	fetchData(formattedOneWeekAgo, formattedDate);
	function createNewSelect() {
		let select = document.createElement("select");
		select.add(new Option("Select", ""));
		select.classList.add("form-select");
		return select;
	}

	$("#fxRateSearchBtn").on("click", function() {
		const startDate = $("#startDate").val();
		const endDate = $("#endDate").val();
		const remitter = $("#remmitterSelect select").val();
		const payoutCountry = $("#payoutCountrySelect select").val();
		const payoutPartner = $("#payoutPartnerSelect select").val();

		fetchData(startDate, endDate, remitter, payoutCountry, payoutPartner);
	})
	$(document).on("keypress", function(e) {
		if (e.keyCode === 13 || e.which === 13) {
			e.preventDefault();
			$("#fxRateSearchBtn").trigger("click");
		}
	});

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

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);
});