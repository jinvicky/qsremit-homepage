$(document).ready(function () {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	/* ------- 옵션 로딩 & 필터 UI (변경 없음) -------- */
	function loadOptions() {
		lastUpdateDate();
		$.ajax({
			type: "GET",
			url: "/transaction/transactionOutboundHistory/options",
			success: function (response) {
				// Payout Country/Partner
				const countries = (response.payoutCountry || []).sort((a, b) =>
					a.localeCompare(b, 'ko')
				);
				const countrySelect = $("#countrySelect");
				countrySelect.empty().append('<option value="">Country All</option>');
				countries.forEach(function (country) {
					countrySelect.append(`<option value="${country}">${country}</option>`);
				});

				const partners = (response.type || []).sort((a, b) =>
					a.localeCompare(b, 'ko')
				);
				const partnerSelect = $("#partnerSelect");
				partnerSelect.empty().append('<option value="">Partner All</option>');
				partners.forEach(function (partner) {
					partnerSelect.append(`<option value="${partner}">${partner}</option>`);
				});

				// Deposit Branch Names
				const depositBranches = response.depositBranchesNames || [];
				const depositBranchesSelect = $("#depositTypeSelect");
				depositBranchesSelect.empty().append('<option value="">All</option>');
				depositBranches.forEach(function (branch) {
					depositBranchesSelect.append(`<option value="${branch}">${branch}</option>`);
				});

				// Deposit Methods
				const depositMethods = response.depositMethods || [];
				const depositMethodsSelect = $("#depositMethodSelect");
				depositMethodsSelect.empty().append('<option value="">All</option>');
				depositMethods.forEach(function (method) {
					depositMethodsSelect.append(`<option value="${method}">${method}</option>`);
				});
			},
			error: function (error) {
				console.error("Error fetching options:", error);
				alert("Failed to fetch option data.");
			}
		});
	}
	loadOptions();

	$("#countryPartnerSelect").change(function () {
		const selectedValue = $(this).val();
		if (selectedValue === "Country") {
			$("#countrySelect").show();
			$("#partnerSelect").hide();
			$("#partnerSelect").val("");
		} else if (selectedValue === "Partner") {
			$("#countrySelect").hide();
			$("#partnerSelect").show();
			$("#countrySelect").val("");
		}
	});

	/* ------- DataTable 초기화 -------- */
	const columns = [
		{ title: "No.", data: null }, // 0
		{ title: `Transaction ID\n(Pin Number)`, data: null,
			render: function (data, type, rowData) {
				let pinNumber = null;

				if (rowData) {
					if (rowData.uniqueId == null) {
						pinNumber = rowData.partnerId || "-";
					} else if (String(rowData.uniqueId).includes('G')) {
						pinNumber = rowData.uniqueId;
					} else {
						pinNumber = rowData.partnerId || "-";
					}
				}

				return `
					<a href="/transaction/transactionOutboundHistoryDetail/${rowData.txnId}"
					   class="text-primary text-decoration-none fw-semibold"
					   style="cursor: pointer;">
						<p class="m-0">${rowData.txnId}</p>
						${pinNumber ? `<p class="m-0 text-muted small">(${pinNumber || ""})</p>` : ""}
					</a>
				`;
			}
		}, // 1
		{
			title: `Sender Name\n(Customer ID)`, data: null, // 2
			render: function (data, type, rowData) {
				const senderNames = rowData.customer.senderName.split(' ');  // 풀네임이 이미 포함된 값
				const customerId = rowData.customer.customerId || "-";
				const optionName = rowData.customer.senderOptionName.trim();
				const optionSenderName = optionName && optionName !== "" ? `(${optionName})` : "";
				return `
					<div class="m-0" style="width: 100px">
						<div class="text-truncate">${senderNames[0] && senderNames[2] !== '' ? senderNames[0] : ''}</div>
						<div class="text-truncate">${senderNames[1] && senderNames[1] !== '' ? senderNames[1] : ''}</div>
						<div class="text-truncate">${senderNames[2] && senderNames[0] !== '' ? senderNames[2] : ''}</div>
						<div class="text-truncate">${optionSenderName}</div>
						${customerId ? `<div class="text-muted" style="font-size: 12px;">(${customerId})</div>` : ""}
					</div>`;
			}
		},
		{
			title: "Beneficiary", // 3
			data: null,
			render: function (rowData) {
				if (!rowData.beneficiary || !rowData.beneficiary.beneficiaryName) {
					return "-";
				}
				const { firstName = "", middleName = "", lastName = "" } = rowData.beneficiary.beneficiaryName;
				return `
					<p class="m-0 text-truncate" style="width: 70px">${lastName && lastName !== 'N/A' ? lastName : ''}</p>
					<p class="m-0 text-truncate" style="width: 70px">${middleName && middleName !== 'N/A' ? middleName : ''}</p>
					<p class="m-0 text-truncate" style="width: 70px">${firstName && firstName !== 'N/A' ? firstName : ''}</p>
				`;
			}
		},
		{
			title: `Payout Country\nPayout Partner`, // 4
			data: null,
			render: function (data, type, rowData) {
				return `
					<p class="m-0">${rowData.payoutCountry}</p>
					<p class="m-0">${rowData.type}</p>
				`;
			}
		},
		{ title: "Collected Amount", data: "collectedAmount",
			render: function(data) {
				return trimTrailingZeros(data);
			} }, // 5
		{ title: "Total Charge", data: "totalCharge" ,
			render: function(data) {
				return trimTrailingZeros(data);
			}}, // 6
		{ title: "Transfer Amount", data: "transferAmount" ,
			render: function(data) {
				return trimTrailingZeros(data);
			}}, // 7
		{ title: "Customer Rate", data: "customerRate" ,
			render: function(data) {
				return trimTrailingZeros(data);
			}}, // 8
		{ title: "Receive Amount", data: "receiveAmount" ,
			render: function(data) {
				return trimTrailingZeros(data);
			}}, // 9
		{
			title: `Deposit Type\nDeposit Method\nPayment Type`, // 10
			data: "depositType",
			render: function (data, type, rowData) {
				let payment = "";
				if (rowData.payment) {
					const words = rowData.payment.toLowerCase().split("_");
					const formatted = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
					payment = formatted.join(" ");
				}
				return `
					<p class="m-0">${rowData.depositType && rowData.depositType !== "" ? rowData.depositType : "-" }</p>
					<p class="m-0">${rowData.depositMethod && rowData.depositMethod !== "" ? rowData.depositMethod.replace("_", " ") : "-" }</p>
					<p class="m-0">${payment}</p>
				`;
			}
		},
		{ title: "Deposit Method", data: "depositMethod", visible: false }, // 11
		{ title: "Payment Type", data: "payment", visible: false }, // 12
		{ title: "Type", data: "type", visible: false }, // 13
		{
			title: `TransactionDate\nApproveDate\nEndDate`, // 14
			data: "transactionDate",
			exportable: false,
			render: function (data, type, rowData) {
				return `
					<p class="m-0">${rowData.transactionDate ? '(T) ' + moment(rowData.transactionDate).format('YYYY-MM-DD HH:mm') : ''}</p>
					<p class="m-0">${rowData.approveDate ? '(A) ' + moment(rowData.approveDate).format('YYYY-MM-DD HH:mm') : ''}</p>
					<p class="m-0">${rowData.paidDate ? '(E) ' + moment(rowData.paidDate).format('YYYY-MM-DD HH:mm') : ''}</p>
				`;
			}
		},
		{ title: "ApproveDate", data: "approveDate", visible: false },  // 15
		{ title: "EndDate", data: "paidDate", visible: false }, // 16
		{ title: "Status", data: "status" ,
			render: function(data) {
				return data ? data : "";
			}}, // 17
		{ title: "User ID", data: "userId",
			render: function(data) {
				if (!data) return ""; // null 또는 undefined 값은 빈 문자열 반환
				return data.includes("(") && data.includes(")")
					? data.replace(/\(/g, "<br>(") // "(" 앞에 <br> 태그 추가
					: data; // ()가 없으면 그대로 반환
			}
		}, // 18
		{
			title: "Sender Phone", // 19
			data: null,
			visible: false,
			render: function (data) {
				return data.customer.contact ? data.customer.contact : "";
			}
		},
		{
			title: "Beneficiary Phone", // 20
			data: null,
			visible: false,
			render: function (data) {
				return data.beneficiary.mobile ? data.beneficiary.mobile : "";
			}
		},
		{
			title: "Customer ID", // 21
			data: null,
			visible: false,
			render: function (data) {
				return data.customer.customerId ? data.customer.customerId : "";
			}
		},
		{
			title: "Sender Phone", // 22
			data: "customer.contact",
			visible: false
		},
		{
			title: "Beneficiary Phone", //23
			data: "beneficiary.mobile",
			visible: false
		},
		{ title: "Customer Sender Name", data: "customer.senderName", visible: false, exportable: false }, //24
		{ title: "Payout Country", data: "payoutCountry", visible: false, exportable: false }, //25
		{ title: "Deposit Type", data: "depositType", visible: false, exportable: false }, //26
		{ title: "Transaction Date", data: "transactionDate",
			visible: false, type: "date",
			render: function (data, type) {
				// sort 기준에서는 raw 데이터 그대로 사용
				if (type === 'sort' || type === 'type') return data;
				return moment(data).format("YYYY-MM-DD HH:mm:ss");
			}
		}, //27
		{
			title: "Beneficiary Name",
			data: "beneficiary.beneficiaryName",
			visible: false,
			exportable: false,
			render: function (data) {
				return data.firstName + data.middleName + data.lastName;
			}
		} //28
	];

	let rowNum = 1; // 전역 카운터 변수 선언

	const table = new DataTable("#transactionOutboundTable", {
		data: [],
		columns: columns,
		searching: true,
		order: [[27, "desc"]],
		serverSide: true,
		processing: true,
		pageLength: 50,
		lengthMenu: [
			[50, 100, -1],
			[50, 100, 'All']
		],
		ajax: function (data, callback) {
			loadHistory(data, callback)
		},
		autoWidth: true,
		rowId: "txnId",
		layout: {
			topEnd: {
				buttons: [
					{
						extend: "excel",
						text: "Export to Excel",
						className: 'btn btn-soft-secondary',
						title: null,
						filename: function () {
							const date = moment().format('YYMMDD');
							const randomNumber = Math.floor(Math.random() * 10000);
							return `transactions_${date}_${randomNumber}`;
						},
						exportOptions: {
							columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 26, 27],
							format: {
								body: function(data, row, column) {
									// No 컬럼 처리
									if (column === 0) {
										return rowNum++;
									}
									// approveDate 컬럼 (index 15)
									if (column === 15) {
										if (!data) return '';
										const date = data.replace('(A)', ' ');
										return moment(date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
									}
									// paidDate 컬럼 (index 16)
									if (column === 16) {
										if (!data) return '';
										const date = data.replace('(E)', ' ');
										return moment(date, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm');
									}

									// HTML 태그 제거
									if(typeof data === 'string') {
										return data.replace(/<[^>]+>/g, ' ')
											.replace(/\n/g, ' ')
											.trim();
									}
									return data;
								}
							}
						},
						customize: function (xlsx) {
							// 모든 셀 왼쪽 정렬
							const sheet = xlsx.xl.worksheets['sheet1.xml'];
							$('row c', sheet).attr('s', '50');  // style 50은 왼쪽 정렬을 의미

							// 왼쪽 정렬 스타일 생성
							const styleSheet = xlsx.xl['styles.xml'];
							const $styles = $('cellXfs', styleSheet);
							const $newStyle = $($('xf', styleSheet)[0]).clone();
							$newStyle.attr('applyAlignment', 1);
							$newStyle.append('<alignment horizontal="left"/>');
							$styles.append($newStyle);

							rowNum = 1;
						}
					},
					{
						text: "New Transaction",
						className: 'btn btn-outline-primary width-xl',
						action: function () {
							window.location.href = "/transaction/transactionOutboundHistorySend?step=1";
						}

					}
				]
			}
		},
		columnDefs: [
			{ targets: [0, 14], className: "dt-head-center dt-body-center" },
			{
				targets: 27,
				type: "datetime",
				render: function (data, type) {
					if (!data) return '';
					if (type === 'sort' || type === 'type') return data;
					return moment(data).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		],
		rowCallback: function(row, data, index) {
			const pageInfo = this.api().page.info();
			const reverseIndex = pageInfo.recordsDisplay - (pageInfo.page * pageInfo.length) - index;
			$('td:eq(0)', row).html(reverseIndex);
		},
		initComplete: function () {
			$('.dt-button').removeClass('dt-button');

			initializeTableResize(this, {
				minWidth: 40,
				excludeLastColumns: 1
			})
		}
	});

	// Summary Load
	table.on('draw.dt', function () {
		const api = table;
		const tableNode = $(api.table().node());
		tableNode.find("tbody.summary-body").remove();

		if (outboundSummary) {
			const collected = trimTrailingZeros(outboundSummary.totalCollectedAmount);
			const transfer  = trimTrailingZeros(outboundSummary.totalTransferAmount);
			const service   = trimTrailingZeros(outboundSummary.totalServiceCharge);
			const receive   = trimTrailingZeros(outboundSummary.totalReceiveAmount);

			const summaryBody = `
			<tbody class="summary-body">
				<tr class="table-summary-row fw-bold bg-light">
					<td colspan="5" class="text-end text-secondary"></td>
					<td class="text-primary text-end">${collected || 0}</td>
					<td class="text-danger text-end">${service || 0}</td>
					<td class="text-success text-end">${transfer || 0}</td>
					<td></td>
					<td class="text-primary text-end">${receive || 0}</td>
					<td colspan="${api.columns().count() - 10}"></td>
				</tr>
			</tbody>
		`;
			tableNode.find("thead").after(summaryBody);
		}
	});

	let outboundSummary;
	function loadHistory(data, callback) {
		const startDate   = $("#startDate").val();
		const endDate     = $("#endDate").val();
		const txnDateType = $("#TXNDateSelect").val(); // transactionDate | ApproveDate | EndDate

		const rawStart  = Number.isFinite(data?.start)  ? Number(data.start)  : 0;
		const rawLength = Number.isFinite(data?.length) ? Number(data.length) : 10;

		const size = (rawLength === -1 || rawLength <= 0) ? 10000 : rawLength;
		const page = (rawLength === -1 || rawLength <= 0) ? 0 : Math.max(0, Math.floor(rawStart / rawLength));

		// 상세 필터
		const statusValue        = $("#statusSelect").val();            // transactionStatus
		const countryPartnerType = $("#countryPartnerSelect").val();    // Country | Partner
		const countryValue       = $("#countrySelect").val();           // country
		const partnerValue       = $("#partnerSelect").val();           // payoutPartnerId (id를 value로 쓰는 걸 권장)
		const depositType        = $("#depositTypeSelect").val();
		const depositMethod      = $("#depositMethodSelect").val();
		const payoutType         = $("#payoutTypeSelect").val();
		const excludeCanceled    = $("#excludeCanceled").is(':checked');

		// 텍스트 검색 → 필드 파라미터로 맵
		const textParams = pickupTextSearchParams();

		const isPinNumber = $("#columnSelect").val() === 'Pin Number';

		if (!isPinNumber) {
			$.ajax({
				url: "/transaction/transactionOutboundHistory/",
				type: "GET",
				data: {
					page: page,
					size: size,
					startDate: startDate,
					endDate: endDate,
					txnDateType: txnDateType,         // server Enum: transactionDate | approveDate | paidDate
					transactionStatus: statusValue || null,
					txnId: textParams.txnId,
					customerName: textParams.customerName,
					customerMobile: textParams.customerMobile,
					beneficiaryName: textParams.beneficiaryName,
					beneficiaryMobile: textParams.beneficiaryMobile,
					customerId: textParams.customerId,
					country: (countryPartnerType === "Country" ? countryValue : null),
					payoutPartner: (countryPartnerType === "Partner" ? partnerValue : null),
					depositType: depositType || null,
					depositMethod: depositMethod || null,
					payoutType: payoutType || null,
					excludeCanceled: excludeCanceled
				},
				dataType: "json",
				success: function (response) {
					console.log(response);
					outboundSummary = response.summary || null;

					callback({
						draw: data.draw,
						recordsTotal: response.page.totalElements, // 전체 데이터 개수
						recordsFiltered: response.page.totalElements, // 필터링된 데이터 개수
						data: response.page.content // 실제 데이터
					});
				},
				error: function () {
					callback({
						draw: data.draw,
						recordsTotal: 0,
						recordsFiltered: 0,
						data: []
					});
				}
			});
		} else {
			$.ajax({
				url: "/transaction/transactionOutboundHistory/pinNumber",
				type: "GET",
				data: {
					pinNumber: textParams.pinNumber,
				},
				dataType: "json",
				success: function (response) {
					callback({
						draw: data.draw,
						recordsTotal: response.totalElements, // 전체 데이터 개수
						recordsFiltered: response.totalElements, // 필터링된 데이터 개수
						data: response.content // 실제 데이터
					});
				},
				error: function () {
					callback({
						draw: data.draw,
						recordsTotal: 0,
						recordsFiltered: 0,
						data: []
					});
				}
			});
		}
	}

	function pickupTextSearchParams() {
		const searchValue  = $("#searchText").val();
		const searchColumn = $("#columnSelect").val();

		const out = {
			txnId: null,
			customerName: null,
			customerMobile: null,
			beneficiaryName: null,
			beneficiaryMobile: null,
			customerId: null,
			pinNumber: null,
		};

		if (!searchValue || !searchColumn) return out;

		switch (searchColumn) {
			case "Transaction ID":
				out.txnId = searchValue;
				break;
			case "Sender's Name":
				out.customerName = searchValue;
				break;
			case "Beneficiary's Name":
				out.beneficiaryName = searchValue;
				break;
			case "Sender's Phone":
				out.customerMobile = searchValue;
				break;
			case "Beneficiary's Phone":
				out.beneficiaryMobile = searchValue;
				break;
			case "Customer ID":
				out.customerId = searchValue;
				break;
			case "Pin Number":
				out.pinNumber = searchValue;
				break;
		}
		return out;
	}

	$("#columnSelect").on("change", function () {
		if ($(this).val() === "Pin Number") {
			changeDisable(true);
		} else {
			changeDisable(false);
		}
	})
	const changeDisable = (disable) => {
		$('#statusSelect').prop('disabled', disable);
		$('#depositTypeSelect').prop('disabled', disable);
		$('#depositMethodSelect').prop('disabled', disable);
		$('#payoutTypeSelect').prop('disabled', disable);
		$('#countryPartnerSelect').prop('disabled', disable);
		$('#countrySelect').prop('disabled', disable);
		$('#partnerSelect').prop('disabled', disable);
		$('#TXNDateSelect').prop('disabled', disable);
		$('#startDate').prop('disabled', disable);
		$('#endDate').prop('disabled', disable);
	}

	$("#search-btn").click(function () {
		table.ajax.reload();
	});

	$.fn.dataTable.ext.search.push(function (settings, data) {
		const txnDateType = $("#TXNDateSelect").val(); // transactionDate, ApproveDate, EndDate
		const start = $("#startDate").val();
		const end = $("#endDate").val();

		if (!txnDateType || !start || !end) return true;

		// column index for each date type
		const dateIndexMap = {
			transactionDate: 27,
			ApproveDate: 15,
			EndDate: 16
		};
		const columnIndex = dateIndexMap[txnDateType];
		if (columnIndex === undefined) return true;

		const dateStr = data[columnIndex]; // formatted as 'YYYY-MM-DD HH:mm'
		if (!dateStr) return false;

		const rowDate = moment(dateStr, 'YYYY-MM-DD HH:mm').toDate();
		const startDate = moment(start, 'YYYY-MM-DD').startOf('day').toDate();
		const endDate = moment(end, 'YYYY-MM-DD').endOf('day').toDate();

		return rowDate >= startDate && rowDate <= endDate;
	});

	$(document).on("keypress", function(e) {
		if (e.keyCode === 13 || e.which === 13) {
			e.preventDefault();
			$("#search-btn").trigger("click");
		}
	});


	function lastUpdateDate() {
		$.ajax({
			url : "/systemManagement/apiSchedule/outbound",
			type : "GET",
			dataType: "json",
			success : function(response) {
				const offsetDate = new Date(response.lastUpdate);

				const formattedDate = `${offsetDate.getFullYear()}-${(offsetDate.getMonth()+1).toString().padStart(2,'0')}-${offsetDate.getDate().toString().padStart(2,'0')} `
					+ `${offsetDate.getHours().toString().padStart(2,'0')}:${offsetDate.getMinutes().toString().padStart(2,'0')}:${offsetDate.getSeconds().toString().padStart(2,'0')}`;

				$("#last-updated-date").text(formattedDate);
			},
			error : function(xhr, status, error) {
				console.log("Error Message:", error);
				$("#last-updated-date").text("Error loading date");
			}
		});

	}
	function trimTrailingZeros(value) {
		if (value === null || value === undefined) return "";

		const num = Number(value);
		if (isNaN(num)) return value;

		const [integerPart, decimalPart] = num.toString().split(".");
		const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
	}

	table.on('length.dt', function(e, settings, len) {
		$("#tablePageInput").val(len);
	});

	setTimeout(() => {
		const pageLength = $("#tablePageInput").val() || 50;
		table.page.len(pageLength);
	}, 0);
});