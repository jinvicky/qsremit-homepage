$(document).ready(function () {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	const urlParams = new URLSearchParams(window.location.search);
	const remitterId = urlParams.get('remitterId');
	const payoutPartnerId = urlParams.get('payoutPartnerId');
	if ($("#partnerTable")) {
		$("#listButton").addClass("d-none");
		const partnerTable = new DataTable("#partnerTable", {
			searching: false,
			ordering: true,
			lengthMenu: [
				[50, 100, -1],
				[50, 100, 'All']
			],
			rowCallback: function(row, data, index) {
				const pageInfo = this.api().page.info();
				const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
				$('td:eq(0)', row).html(reverseIndex);
			}
		});
	}

	if ($("#partnerDetailTable")) {
		$("#listButton").removeClass("d-none");

		// partner payout Type 불러오기
		$.ajax({
			url: `/api/serviceChargeManagement/partner/${payoutPartnerId}`,
			method: "GET",
			success: function(data) {
				const editorOptions = data
					.map(type => {
						return { label: type, value: type };
					});
				partnerDetailEditor.field("chargeType").update(editorOptions);
			},
			error: function(error) {
				console.error(error);
				alert("An error occurred while fetching payoutTypes data.");
			}
		})

		const partnerDetailTable = new DataTable("#partnerDetailTable", {
		    searching: false,
			ordering: true,
		    rowId: "id",
		    order: [
		        [1, 'asc'],  // chargeType으로 1차 정렬
		        [2, 'asc']   // minAmt로 2차 정렬
		    ],
			lengthMenu: [
				[10, 25, 50, 100, -1],
				[10, 25, 50, 100, 'All']
			],
			columns: [
				{ data: null, orderable: false, render: DataTable.render.select() },
				{ data: null },
				{ data: "chargeType", orderable: true },
				{ data: "minAmt", orderable: true, className: "text-end",
                    render: function(data) { return format(data); } },
				{ data: "maxAmt", orderable: true, className: "text-end",
                    render: function(data) { return format(data); } },
				{ data: "serviceChargeRateType", className: "text-center", render: formatFlatPercent, orderable: false },
				{ data: "serviceCharge", className: "text-end",
                    render: function(data) { return format(data); } },
				{ data: "serviceChargeRateTypeMobile", className: "text-center", render: formatFlatPercent, orderable: false },
				{ data: "serviceChargeMobile", className: "text-end",
                    render: function(data) { return format(data); } },
				{
					data: "mobileDiscountRate", className: "text-end", orderable: false, render: function (data) {
						return `
					<div class="d-flex justify-content-end align-items-center">
					<p class="mb-0 text-end" style="white-space: nowrap;">${format(data)} %</p>
					</div>`;
					}
				},
				{ data: "additionalFeeRateType", className: "text-center", render: formatFlatPercent, orderable: false },
				{ data: "additionalFee", className: "text-end",
                    render: function(data) { return format(data); } },
				{ data: "sendCommissionRateType", className: "text-center", render: formatFlatPercent, orderable: false },
				{ data: "sendCommission", className: "text-end",
                    render: function(data) { return format(data); } },
				{ data: "paidCommissionRateType", className: "text-center", render: formatFlatPercent, orderable: false },
				{ data: "paidCommission", className: "text-end",
                    render: function(data) { return format(data); } },
				{ data: "id", visible: false },
			],
			rowCallback: function(row, data, index) {
				const pageInfo = this.api().page.info();
				const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
				$('td:eq(1)', row).html(reverseIndex);
			},
			layout: {
				topEnd: {
					buttons: [
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
							text: "New Charge",
							action: function () {
								window.location.href = `/serviceChargeManagement/serviceChargeManagementCreate?mode=partner&remitterId=${encodeURIComponent(remitterId)}&payoutPartnerId=${encodeURIComponent(payoutPartnerId)}`;
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
			createdRow: function (row) {
				const targetColumns = [2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15];

				targetColumns.forEach((columnIndex) => {
					$(row).find(`td:eq(${columnIndex})`).css('background-color', '#fff4cc');
				});
			}
		});

		$("#discountRateButton").on("click", function () {

			const discountRateValue = $("#discountRateValue").val();
			const selectedIds = partnerDetailTable.rows({ selected: true }).data().toArray().map(row => row.id);

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
				url: `/api/serviceChargeManagement/updateMobileRate`,
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

		const fetchData = () => {
			$('#loadingSpinner').show();

			$.ajax({
				url: "/api/serviceChargeManagement/",
				method: "GET",
				data: {
					payoutPartnerId: payoutPartnerId
				},
				dataType: "json",
				success: function(data) {
					partnerDetailTable.clear().rows.add(data).draw();
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

		if (payoutPartnerId!=null && payoutPartnerId !== "") {
			fetchData();
		}

		function deleteData() {
			const selectedIds = partnerDetailTable.rows({ selected: true }).data().toArray().map(row => row.id);

			if (selectedIds.length === 0) {
				alert('Please select at least one row to delete.');
				return;
			}

			$.ajax({
				method: 'DELETE',
				url: `/serviceChargeManagement/serviceChargeManagementEditDetail`,
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
					alert("Service Charge delete successfully.")
					fetchData();
				},
				error: function (xhr, status, error) {
					console.error("Error Message:", error);
					alert("Error occurred while deleting data. Please try again.");
				}
			});
		}

		// editor
		const partnerDetailEditor = new DataTable.Editor({
			ajax: {
				edit: {
					type: 'PUT',
					url: `/api/serviceChargeManagement/update/{id}`,
					contentType: 'application/json',
					data: function (data) {
						const id = Number(Object.keys(data.data)[0]);

						const originalData = partnerDetailTable
							.rows()
							.data()
							.toArray()
							.find((row) => row.id === id);
						const editedItem = Object.values(data.data)[0];
						const fullUpdateData = {...originalData, ...editedItem};

						if (fullUpdateData.minAmt > fullUpdateData.maxAmt) {
							alert('Minimum amount cannot be greater than maximum amount.');
							return false;
						}

						return JSON.stringify(fullUpdateData);
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
			table: "#partnerDetailTable",
			idSrc: "id",
			fields: [
				{
					label: "chargeType",
					name: "chargeType",
					type: "select",
				},
				{ label: "minAmt", name: "minAmt" },
				{ label: "maxAmt", name: "maxAmt" },
				{ label: "serviceCharge", name: "serviceCharge" },
				{
					label: "serviceChargeRateType",
					name: "serviceChargeRateType",
					type: "select",
					options: [
						{ label: "FLAT", value: "FLAT" },
						{ label: "PERCENT", value: "PERCENT" }
					],
					def: "FLAT"
				},
				{ label: "additionalFee", name: "additionalFee" },
				{
					label: "additionalFeeRateType",
					name: "additionalFeeRateType",
					type: "select",
					options: [
						{ label: "FLAT", value: "FLAT" },
						{ label: "PERCENT", value: "PERCENT" }
					],
					def: "FLAT"
				},
				{ label: "sendCommission", name: "sendCommission" },
				{
					label: "sendCommissionRateType",
					name: "sendCommissionRateType",
					type: "select",
					options: [
						{ label: "FLAT", value: "FLAT" },
						{ label: "PERCENT", value: "PERCENT" }
					],
					def: "FLAT"
				},
				{ label: "paidCommission", name: "paidCommission" },
				{
					label: "paidCommissionRateType",
					name: "paidCommissionRateType",
					type: "select",
					options: [
						{ label: "FLAT", value: "FLAT" },
						{ label: "PERCENT", value: "PERCENT" }
					],
					def: "FLAT"
				},
			],
		})

		// inline editor
		partnerDetailTable.on('click', 'tbody td', function () {
			try {
				partnerDetailEditor.inline(this);
			} catch (error) {
				console.error(error);
			}
		});

		partnerDetailTable.on('length.dt', function(e, settings, len) {
			$("#tablePageInput").val(len);
		});

		setTimeout(() => {
			const pageLength = $("#tablePageInput").val() || 50;
			partnerDetailTable.page.len(pageLength);
		}, 0);
	}
});

function format(data) {
    if (data === null || data === 0) {
        return 0;
    }
    return Number(data).toLocaleString(); // 숫자를 3자리 단위로 반점 표시
}

function formatFlatPercent(data) {
	if (data === 'FLAT') {
		return `<span class="badge bg-danger rounded-pill">FLAT</span>`
		// return 'FLAT'
	} else if (data === 'PERCENT') {
		return `<span class="badge bg-info rounded-pill">PERCENT</span>`
		// return 'PERCENT'
	} else return '';
}