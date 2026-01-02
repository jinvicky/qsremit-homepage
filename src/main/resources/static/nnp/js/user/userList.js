$(document).ready(function () {
	const table = new DataTable("#userTable" , {
		ajax: {
			url: "/user/list",
			method: "GET",
			dataSrc: "",
		},
		columns: [
			{ data: null, width: '5%'}, // 넘버링을 위해 넣어둠
			{ data: "userType" },
			{ data: "userId" },
			{ data: "name" },
			{ 
				data: "createAt",
				render: function (data) {
					return moment(data).format("YYYY-MM-DD hh:mm:ss");
				}
			},
			{
				data: null,
				render: function () {
					return `
						<button class="btn btn-danger btn-sm btn-delete">Delete</button>
					`;
				}
			},
			{
				data: null,
				render: function () {
					return `<button class="btn btn-secondary btn-sm btn-reset-password">Reset Password</button>`;
				}
			},
			{ data: "id", visible: false },
			{ data: "accountLocked", visible: false },
		],
		searching: false,
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		columnDefs: [
			{ targets: [0, 4, 5, 6], className: "dt-head-center dt-body-center" }
		],
		rowCallback: function(row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);

			const RED = "rgb(255,219,219)"
			if (data.accountLocked) {
				$(row).css("background-color", RED);
			}
		},
		initComplete: function () {
			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		}
	});

	table.on("click", "tbody tr", function () {
		const row = table.row($(this).closest("tr")).data();
		window.location.href = `/user/editUser?id=${row.id}`
	});

	table.on("click", "tbody tr button.btn-delete", function (event) {
		event.stopPropagation();
		event.preventDefault();

		const row = table.row($(this).closest("tr"));
		const rowData = row.data();

		if (!rowData) return;

		if (confirm("Are you sure you want to delete this user?")) {
			$.ajax({
				url: `/user/delete/${rowData.id}`,
				type: "PUT",
				xhrFields: {
					withCredentials: true
				},
				beforeSend: function(xhr){
					const header = $("meta[name='_csrf_header']").attr('content');
					const token = $("meta[name='_csrf']").attr('content');
					xhr.setRequestHeader(header, token);
				},
				success: function (response) {
					row.remove().draw();
				},
				error: function (xhr, status, error) {
					console.error("Error deleting user:", error); // 에러 로그 출력
					alert("Failed to delete the user. Please try again.");
				}
			});
		}
	})

	table.on("click", "tbody tr button.btn-reset-password", function (event) {
		event.stopPropagation();
		event.preventDefault();

		const row = table.row($(this).closest("tr"));
		const rowData = row.data();

		if (!rowData) return;

		if (confirm("Are you sure you want to reset password this user?\nA temporary password will be sent to the registered email address.")) {
			$.ajax({
				url: `/user/resetPassword/${rowData.id}`,
				type: "POST",
				xhrFields: {
					withCredentials: true
				},
				beforeSend: function(xhr){
					const header = $("meta[name='_csrf_header']").attr('content');
					const token = $("meta[name='_csrf']").attr('content');
					xhr.setRequestHeader(header, token);
					$('#loadingSpinner').show();
				},
				success: function (response) {
					alert(`Password has been reset successfully. A temporary password has been sent to ${response}.`);
				},
				error: function (xhr, status, error) {
					console.error("Error deleting user:", error);
					alert("Failed to reset password. Please try again.");
				},
				complete: function () {
					$('#loadingSpinner').hide();
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