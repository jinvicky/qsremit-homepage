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

	const params = new URLSearchParams(window.location.search);
	const firstName = params.get('firstName');
	const middleName = params.get('middleName');
	const lastName = params.get('lastName');

	const table = new DataTable("#strDetailTable" , {
		ajax: {
			url: '/api/str/strManagementDetail',
			type: 'GET',
			data: {
				firstName: firstName,
				middleName: middleName,
				lastName: lastName,
			},
			dataSrc: ''
		},
		columns: [
			{ title: "No.", data: null, className: "dt-head-center dt-body-center", width: "8%", orderable: false }, // 0
			{ title: "Transaction ID", data: "txnId" }, // 1
			{ title: "Transaction Date", data: "transactionDate",
				render: function(data) {
					return moment(data).format("YYYY-MM-DD");
				}, className: 'text-start'
			}, // 2
			{ title: "Sender Name", data: null,
				render: function (data) {
					return `
					<p class="m-0">${data.lastName && data.lastName !== 'N/A' && data.lastName !== null ? data.lastName : ''}
                       ${data.middleName && data.middleName !== 'N/A' && data.middleName !== null ? data.middleName : ''}
                       ${data.firstName && data.firstName !== 'N/A' && data.firstName !== null ? data.firstName : ''}
                    </p>
				`;
				}
			}, // 3
			{ title: "Collected Amount", data: "collectedAmount" }, // 4
			{ title: "Receive Amount", data: "receiveAmount" }, // 5
		],
		order: [[2 , "desc"]],
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		searching: false,
		rowCallback: function (row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		},
	});
	
	table.on("click", "tbody tr", function (e) {
		const row = table.row($(this).closest("tr")).data();
		window.location.href = `/transaction/transactionOutboundHistoryDetail/${row.txnId}`
	});

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);
});