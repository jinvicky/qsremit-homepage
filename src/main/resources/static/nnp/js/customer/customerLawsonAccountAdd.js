$(document).ready(function() {
	/**
	 * csrf token
	 * */
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	$.ajaxSetup({
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader(header, token);
		}
	})
	if ($("#customerId").val() && $("#searchCustomerText").val()) {
		$("#accountInfo").show();
		$(".account-table-outer").show();
	} else if ($("#customerId").val() && !$("#searchCustomerText").val()) {
		$("#accountInfo").show();
		$(".account-table-outer").hide();
	} else if ($("#searchCustomerText").val()) {
		$("#accountInfo").hide();
		$(".account-table-outer").show();
	}

	if ($("#beneficiaryId").val()) {
		$("#accountInfo").show();
		$("#receiverFieldset").show();
		$(".account-table-outer").hide();
	}

	const accountNewTable = new DataTable("#accountNewTable", {
		ajax: {
			url: "/customer/searchCustomers",
			method: "GET",
			dataSrc: ""
		},
		columns: [
			{data: null, title: "No."},
			{data: "customerId", title: "Customer ID"},
			{data: "mobile", title: "Mobile"},
			{
				data: null, title: "Sender Name",
				render: function (data, type, row) {
					const senderName = `${data.lastName ? data.lastName : ''} ${data.middleName ? data.middleName : ''} ${data.firstName ? data.firstName : ''}`;
					return `<p class="m-0 text-truncate" style="width: 180px">${row.companyName ? row.companyName : senderName}</p>`
				}
			},
			{data: "id", visible: false},
			{data: "lastName", visible: false },
			{data: "middleName", visible: false},
			{data: "firstName", visible: false},
			{data: "email", visible: false}
		],
		layout: {topEnd: {}, topStart: {}},
		select: true,
		rowCallback: function (row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		}
	});
	/**
	 * **검색 버튼 클릭 이벤트**
	 * 사용자가 검색 버튼 클릭 시 실행.
	 */
	const SENDER_NAME_INDEX = 5;
	const MIDDLE_NAME_INDEX = 6;
	const LAST_NAME_INDEX = 7;

	const multiColumnSearchFilter = function (settings, data) {
		const searchText = $("#searchCustomerText").val().toLowerCase();
		if (!searchText) return true;

		const sender = (data[SENDER_NAME_INDEX] || "").toLowerCase();
		const middle = (data[MIDDLE_NAME_INDEX] || "").toLowerCase();
		const last = (data[LAST_NAME_INDEX] || "").toLowerCase();

		return (
			sender.includes(searchText) ||
			middle.includes(searchText) ||
			last.includes(searchText)
		);
	};

	$("#searchCustomerButton").on("click", function () {
		accountNewTable.search("").columns().search("").draw()
		$(".account-table-outer").show();

		const COLUMN_INDEX = parseInt($("#columnSelect").val());

		$.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(f => f !== multiColumnSearchFilter);
		if (COLUMN_INDEX === SENDER_NAME_INDEX) {
			$.fn.dataTable.ext.search.push(multiColumnSearchFilter);
		} else {
			accountNewTable.column(COLUMN_INDEX).search(d => d.includes($("#searchCustomerText").val().trim()));
		}
		accountNewTable.draw()
	});
	$("#searchCustomerText").on("keypress", function (e) {
		if (e.keyCode === 13 || e.which === 13) {
			e.preventDefault();
			$("#searchCustomerButton").trigger("click");
		}
	});

	/**
	 * **테이블 행 클릭 이벤트**
	 * 사용자가 테이블 행을 클릭하면 선택된 데이터를 DOM 요소에 바인딩.
	 */
	const formData = {};
	let customerIdString;
	let customerId;
	if (accountNewTable) {
		accountNewTable.on("click", "tbody tr", function () {
			if ($(this).hasClass("selected")) {
				$("#accountInfo").hide();
				$(".account-table-outer").show();
			} else {
				$("#accountInfo").show();
				$(".account-table-outer").hide();
			}

			const value = accountNewTable.row(this).data();
			if (value.id) {
				customerIdString = value.customerId;
				customerId = value.id;
				$("#searchCustomerText").val("")
				$("#customerId").val(value.id)
				$("#customerIdString").val(value.customerId);
				$("#senderName").val(`${value.lastName ? value.lastName : ''} ${value.middleName ? value.middleName : ''} ${value.firstName ? value.firstName : ''}`);
			}
		})
	}

	// Submit Lawson Account
	$("#accountInfo").on("submit", function(event) {
		event.preventDefault();
		formData.customerId = $("#customerId").val();
		formData.lawsonAccount = $("#lawsonAccount").val();
		formData.accountHolder = $("#accountHolder").val();
		formData.beneficiaryId = $("#beneficiaryId").val();

		$.ajax({
			url: "/customer/customerLawsonAccount",
			method: "POST",
			data: formData,
			success: function () {
				const tabs = JSON.parse(sessionStorage.getItem("tabs"))
				const title = $(".page-title").text()
				const withoutTab = tabs.filter(tab => tab.title !== title)
				sessionStorage.setItem("tabs", JSON.stringify(withoutTab))
				window.location.href = "/customer/customerLawsonAccount";
			},
			error: function (error) {
				alert(error.responseText);
			}
		})
	})
});