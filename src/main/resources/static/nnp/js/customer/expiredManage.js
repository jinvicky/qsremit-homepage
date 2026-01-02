$(document).ready(function () {
	const table = new DataTable("#expiredManageTable", {
		ajax: function(data, callback) {
			let contact = null;
			let customerId = null;

			if ($("#columnSelect").val() == 'contact') {
				contact = $("#searchText").val()
			} else {
				customerId = $("#searchText").val()
			}

			const paramData = {
				days: $("#rangeSelect").val(),
				nationality: $("#nationality").val() || null,
				status: $("#statusSelect").val() || null,
				page: Math.floor(data.start / data.length),
				size: data.length
			};

			if (contact) paramData.contact = contact;
			if (customerId) paramData.customerId = customerId;


			$.ajax({
				url: "/customer/expiredCustomers",
				method: "GET",
				data: paramData,
				success: function(response) {
					callback({
						draw: data.draw,
						recordsTotal: response.totalElements,
						recordsFiltered: response.totalElements,
						data: response.content
					});
				},
				error: function(xhr, status, error) {
					console.error("Ajax 오류: ", error, xhr.responseText);
					callback({
						draw: data.draw,
						data: [],
						recordsTotal: 0,
						recordsFiltered: 0,
					})
				}
			})
		},
		processing: true,
		serverSide: true,
		layout: {
			topEnd: {}
		},
		pageLength: 50,
		rowId: "id",
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		columns: [
	        { data: null, title: "No.", width: "5%" }, // 0
	        { 
				data: null,
				render: function(data, type, row) {
	                return `<a href="/customer/customerDetail/${row.customerId}/${row.registrationType}">${row.customerId}</a>`;
	            },
				title: "Customer ID"
			}, // 1
	        {
                data: null,
                render: function(data, type, row) {
					const senderName = `${data.lastName ? data.lastName : ''} ${data.middleName ? data.middleName : ''} ${data.firstName ? data.firstName : ''}`;
    				return `<p class="m-0 text-truncate" style="width: 180px">${row.companyName ? row.companyName : senderName}</p>`;
			    },
                title: "Sender Name"
            }, // 2
			{ data: "nationality", title: "Nationality" }, // 3
			{ data: "mobile", title: "Phone Number",
				render: function (data, type, row) {
					const double = (row.contact && row.contact !== "") && (data && data !== "")
					return double ? `${row.contact} / ${data}` : row.contact || data || "-";
				}
			}, // 4
			{ data: "idCardType", title: "ID Card Type",
				render: function (data) {
					return data && data !== "" ? data : "-";
				}
			}, // 5
	        {
				data: null,
				render: function(data, type, row) {
					if (row.expirationDate > 0) {
						if (row.expirationDate === 1) {
							return `${row.expirationDate} Day left`;
						} else
							return `${row.expirationDate} Days left`;
					} else if (row.expirationDate < 0) {
						const expirationDate = Math.abs(row.expirationDate);
						if (expirationDate === 1) {
							return `${expirationDate} Day passed`;
						} else
							return `${expirationDate} Days passed`;
					} else if (row.expirationDate === 0) {
						return "EXPIRED";
					}
				},
				title: "Expiration Date"
			}, // 6
	        { data: "kycStatus", title: "KYC Status" }, // 7
			{ data: "id", visible: false }, // 8
			{ data: "customerId", visible: false }, // 9
			{ data: "registrationType", visible: false }, // 10
			{ data: "expirationDate", visible: false }, // 11
	    ],
		columnDefs: [
			{ targets: [0], className: "dt-head-center dt-body-center" }
		],
		rowCallback: function(row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);

			const ONE_DAY = 1;
			const ONE_WEEK = 7;
			const ONE_MONTH = 30;
			const RED = "rgb(251,164,164)"
			const YELLOW = "#f4e4b3"
			const GREEN = "#bce6c9"

			if (data.expirationDate === ONE_DAY) {
				$('td:eq(6)', row).css("background-color", RED);
			} else if (data.expirationDate <= ONE_WEEK && data.expirationDate > ONE_DAY) {
				$('td:eq(6)', row).css("background-color", YELLOW);
			} else if (data.expirationDate <= ONE_MONTH && data.expirationDate > ONE_WEEK) {
				$('td:eq(6)', row).css("background-color", GREEN);
			}
		},
		initComplete: function () {
			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		}
	});

	$("#searchBtn").on("click", function() {
		table.ajax.reload()
	})

	$("#columnSelect").on("change", function() {
		$("#searchText").val("")
	})

	$(document).on("keypress", function(e) {
		if (e.keyCode === 13 || e.which === 13) {
			e.preventDefault();
			$("#searchBtn").trigger("click");
		}
	});

	document.getElementById('rangeSelect').addEventListener('change', function () {
		const selectedValue = this.value;
		const selectDayElement = document.getElementById('selectDay'); // selectDay 요소 가져오기

		if (selectedValue === "1") {
			selectDayElement.textContent = "Day";
		} else {
			selectDayElement.textContent = "Days";
		}
	});

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);
});