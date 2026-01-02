$(document).ready(function () {

	const today = new Date();
	const formattedDate = today.toISOString().split('T')[0];

	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
	const formattedOneWeekAgo = oneWeekAgo.toISOString().split('T')[0];

	document.getElementById("endDate").value = formattedDate;
	document.getElementById("startDate").value = formattedOneWeekAgo;

	const table = new DataTable("#LoginHistoryTable", {
		columns: [
			{data: "id", title: "No.", className: "dt-head-center dt-body-center"}, // 넘버링 열
			{data: "userLoginedId", title: "User ID"},
			{data: "userEventType", title: "Event"},
			{
				data: "userEventCategory",
				title: "Event Category",
				visible: false
			},
			{
				data: "ipAddress",
				title: "IP Address",
				render: function (data) {
					if (data == null) return "-";
					return data === "0:0:0:0:0:0:0:1" ? "localhost" : data;
				}
			},
			{
				data: "logTime",
				title: "Date",
				render: function (data) {
					return moment(data).format("YYYY-MM-DD HH:mm:ss");
				}, className: "dt-head-center dt-body-center"
			},
			{
				data: "userEventUpdateDetail",
				title: "Changes Detail",
				visible: false,
			},
			{
				data: "status",
				title: "Status",
				render: function (data) {
					return data ? data : "Not logged";
				}
			},

		],
		rowCallback: function (row, data, index) {
			// 행 번호를 역순으로 표시
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		},
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		paging: true,
		searching: false,
		order:[[4, "desc"]],
	});

	const fetchLogData = (startDate, endDate) => {
		const userEvent = [];
		$(".searchStatus:checked").each(function () {
			userEvent.push($(this).val());
		})
		const status = $("#statusSelect").val();
		$.ajax({
			url: "/api/user/loginHistory",
			type: "GET",
			data: {
				startDate: startDate,
				endDate: endDate,
				userEvent: userEvent,
				status: status
			},
			success: function (data) {
				table.clear();
				table.rows.add(data);
				table.draw();

				$("#userEvent").val(userEvent);
				$("#startDate").datepicker('update', startDate);
				$("#endDate").datepicker('update', endDate);
			},
			error: function (xhr, error, thrown) {
				console.error("Error:", error);
				alert("An error occurred while fetching the data.");
			}
		})
	}

	fetchLogData(formattedOneWeekAgo, formattedDate);

	$("#searchBtn").on("click", function() {
		const startDate = $("#startDate").val();
		const endDate = $("#endDate").val();

		fetchLogData(startDate, endDate);
	})

	$(document).on("keypress", function(event) {
		if (event.key === "Enter" || event.keyCode === 13) {
			event.preventDefault();
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