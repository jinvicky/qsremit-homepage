$(document).ready(function() {
	/**
	 * csrf token
	 * */
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	/**
	 * DataTable 초기화
	 * - ID가 `#lawsonAccountTable`인 테이블을 DataTable로 초기화.
	 * - 검색, 정렬, 컬럼 렌더링 등을 설정함.
	 */
	const NATIONALITY_INDEX = 5;
	const PAYOUT_PARTNER_INDEX = 6;
	const SENDER_NAME_INDEX = 10;
	const RECEIVER_NAME_INDEX = 11;

	const table = new DataTable('#lawsonAccountTable', {
		ajax: {
			url: "/customer/customerLawsonAccountList",
			type: "GET",
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader(header, token);
			},
			dataSrc: function (response) {
				return response;
			}
		},
		searching: true,
		rowId: "id",
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		columns: [
			{ data: null, title: "No.", width: '5%' }, // 0
			{ data: "id", visible: false }, // 1
			{ data: "cardNumber", title: "Card Number" }, // 2
			{
				data: null, // 3
				title: "Sender Name",
				render: function (data, type, row) {
					let senderName = `${row.companyName ? row.companyName : row.senderName.replace('null', '')}`
					if (row.optionalSenderName) senderName += ` ${row.optionalSenderName}`
					return `<div class="go-customer-detail" style="color: #3295b9; cursor:pointer;">
						<p class="m-0 text-truncate" style="width: 180px">${senderName}</p>
						<p class="m-0">${row.customerId}</p>
					</div>`
				}
			},
			{
				data: null, // 4
				title: "Receiver Name",
				render: function (data, type, row) {
					return `<p class="m-0 text-truncate" style="width: 180px">${row.receiverName.replace('null', '')}</p>`
				}
			},
			{ data: "nationality", title: "Receiver Nationality" }, // 5
			{ data: "payoutPartnerName", title: "Payout Partner" }, // 6
			{ data: "payoutBank", title: "Payout Bank" }, // 7
			{ data: "accountNumber", title: "Account Number" }, // 8
			{ data: "customerId", visible: false },  // 9
			{ data: "senderName", visible: false,},  // 10
			{ data: "receiverName", visible: false }, // 11
			{ data: "optionalSenderName", visible: false}, // 12
			{ data: "registrationType", visible: false }, // 13
			{ data: "companyName", visible: false }, // 14
			{ data: "payoutBank", visible: false }, // 15
			{ data: null, orderable: false, title: "Delete", render: function () { return `<button class="btn btn-danger btn-sm">Delete</button>`; }} // 16
		],
		columnDefs: [
			{ targets: [0, 16], className: "dt-head-center dt-body-center" }
		],
		rowCallback: function(row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);

			$('td:eq(2)', row).css("background-color", "#f9e0cd");
		},
		layout: {
				topEnd: {}
		},
		initComplete: function () {
			/**
			 * 필터링을 위한 드롭다운 초기화
			 * - 지급 파트너와 국적 컬럼에 대해 드롭다운 생성.
			 */

			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		},
	});

	/**
	 * 검색 버튼 이벤트
	 * - `#search-btn` 버튼 클릭 시 테이블 검색 동작 수행.
	 */
	$("#search-btn").on("click", function() {
		table.search('').columns().search('').draw();
		const COLUMN_INDEX = parseInt($("#column-select").val())

		if (COLUMN_INDEX === SENDER_NAME_INDEX
			|| COLUMN_INDEX === RECEIVER_NAME_INDEX) {
			const searchText = $("#search-text").val().trim().toUpperCase();
			table.column(COLUMN_INDEX).search(d => d.toUpperCase().includes(searchText)).draw();
		} else {
			searchTable(table, "#search-text", COLUMN_INDEX)
		}
		searchTableWithText(table, "#lawsonAccountNationalitySelect option:selected", NATIONALITY_INDEX);
		searchTableWithText(table, "#payoutPartnerSelect option:selected", PAYOUT_PARTNER_INDEX);
	})
	$(document).on("keypress", function(e) {
		if (e.keyCode === 13 || e.which === 13) {
			e.preventDefault();
			$("#search-btn").trigger("click");
		}
	});

	/**
	 * 테이블 행 클릭 이벤트
	 * - 특정 행 클릭 시 상세 페이지로 이동.
	 */
	table.on("click", "tbody tr", function () {
		$(this).css("cursor", "pointer");
		window.location.href = `/customer/customerLawsonAccountEdit?id=${$(this).attr("id")}`
	});

	/**
	 * 고객 상세 이동 버튼 클릭 이벤트
	 * - `go-customer-detail` 클래스가 있는 열 클릭 시 실행됨.
	 */
	table.on("click", "tbody tr td .go-customer-detail", function (e) {
		e.stopPropagation();
		e.preventDefault();
		const row = table.row($(this).closest("tr")).data();
		window.location.href = `/customer/customerDetail/${row.customerId}/${row.registrationType}`
	});

	/**
	 * 삭제 버튼 클릭 이벤트
	 * - Lawson Account 삭제 요청을 처리.
	 */
	table.on("click", "tbody tr button", function (event) {
		event.stopPropagation();
		event.preventDefault();

		const row = table.row($(this).closest("tr"));
		const rowData = row.data();

		if (!rowData) return;

		if (confirm("Are you sure you want to delete this Lawson Account?")) {
			$.ajax({
				url: `/customer/lawsonAccountDelete/${rowData.id}`,
				type: "PUT",
				xhrFields: {
					withCredentials: true
				},
				beforeSend: function (xhr) {
					xhr.setRequestHeader(header, token);
				},
				success: function () {
					row.remove().draw();
				},
				error: function (xhr, status, error) {
					console.error("Error deleting Lawson Account:", error); // 에러 로그 출력
					alert("Failed to delete the Lawson Account. Please try again.");
				}
			});
		}
	})

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);
});