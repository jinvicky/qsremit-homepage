$(document).ready(function () {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	/**
	 * ajax 초기화
	 */
	$.ajaxSetup({
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		}
	});

	const BENEFICIARY_NAME_INDEX = 1;
	const BENEFICIARY_PHONE_INDEX = 2;

	if (!$('#startDateInput').val()) {
		$('#startDateInput').val($("#startDate").val());
	} else {
		$('#startDate').val($('#startDateInput').val());
	}
	$("#startDate, #endDate").on("change", function () {
		$('#startDateInput').val($("#startDate").val());
	})

	const table = new DataTable("#strTable", {
		ajax: function (data, callback) {
			fetchData(data, callback)
		},
		columns: [
	        { title: "No.", data: null, className: "dt-head-center dt-body-center", width: "8%" }, // 0
			{ title: "Beneficiary", data: null,
				render: function (data) {
					return `
					<p class="m-0">${data.lastName && data.lastName !== 'N/A' && data.lastName !== null && data.lastName !== '' ? data.lastName : ''}
                       ${data.middleName && data.middleName !== 'N/A' && data.middleName !== null && data.middleName !== '' ? data.middleName : ''}
                       ${data.firstName && data.firstName !== 'N/A' && data.firstName !== null && data.firstName !== '' ? data.firstName : ''}
                    </p>
				`;
				} }, // 1
			{ title: "Phone", data: "beneficiaryPhone", className: 'text-start', width: "20%" }, // 2
	        { title: "Number of Sender", data: "senderCount", width: "12%" }, // 3
	        { title: "Receiver Amount", data: "totalTransferAmount", width: "12%" }, // 4
			{ title: "Transaction Block", data: null, render: function() { return ""; }, width: "10%" }, // 5
	    ],
		createdRow: function(row, data) {
			const firstName = data.firstName && data.firstName !== 'N/A' && data.firstName !== null && data.firstName !== '' ? data.firstName : '';
			const middleName = data.middleName && data.middleName !== 'N/A' && data.middleName !== null && data.middleName !== '' ? data.middleName : '';
			const lastName = data.lastName && data.lastName !== 'N/A' && data.lastName !== null && data.lastName !== '' ? data.lastName : '';

			$(row).on('click', function() {
				window.location.href = `/str/strManagementDetail?firstName=${firstName}&middleName=${middleName}&lastName=${lastName}`;
			});
		},
		layout: {
	        topEnd: {
	            buttons: [
					{	extend: "excel",
						className: 'btn btn-soft-secondary',
						text: "Export to Excel",
						title: null,
						filename: function () {
							const date = moment().format('YYMMDD');
							const randomNumber = Math.floor(Math.random() * 10000);
							return `strManagement_${date}_${randomNumber}`;
						},
						exportOptions: {
							format: {
								body: function(data, row, column, node) {
									if (column === 0) {
										return row + 1;
									}
									return data;
								}
							}
						}
	                }
	            ]
	        }
	    },
		rowCallback: function(row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		},
		ordering: false,
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		initComplete: function () {
			$('.dt-button').removeClass('dt-button');
		}
	});

	function fetchData(data, callback) {
		const startDate = $('#startDateInput').val();
		const endDate = $('#endDate').val();

		$.ajax({
			url: '/api/str/strManagement',
			type: 'GET',
			data: {
				startDate: startDate,
				endDate: endDate,
			},
			dataType: 'json',
			success: function (response) {
				callback({
					data: response
				});
			},
			error: function (xhr, status, error) {
				console.log("Error Message:", error);
			}
		})
	}

	$("#searchBtn").on("click", function() {
		const name = $('#beneficiaryName').val().trim().replace(/\s+/g, '').toUpperCase();
		table.column(BENEFICIARY_NAME_INDEX).search(d => d.trim().replace(/\s+/g, '').includes(name)).draw();

		searchTable(table, "#beneficiaryPhone", BENEFICIARY_PHONE_INDEX);

		table.ajax.reload();
	})
	$(document).on("keypress", function(e) {
		if (e.keyCode === 13 || e.which === 13) {
			e.preventDefault();
			$("#searchBtn").trigger("click");
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