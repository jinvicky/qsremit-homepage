$(document).ready(function() {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');
	const url = window.location.pathname;
	const userInfo = JSON.parse(Cookies.get("user"));
	
	const customerId = url.match(/customerDetail\/([A-Za-z0-9]+)/)[1];
	$("#customerIdString").val(customerId);
	const customerRegistrationType = url.split("/")[4];

	const year = moment().get("year");

	const originalDate = $('#createdAt').text().trim();

	if (originalDate) {
		const formattedDate = moment(originalDate).format("YYYY.MM.DD HH:mm");
		$('#createdAt').text(formattedDate);
	}

	customerTabsInit()
	$("#customerTabs").on("click", "button", function() {
		$("#selectedTab").val($(this).text()).trigger("change")
	})
	$("#selectedTab").on("change", function() {
		customerTabsInit()
	})
	function customerTabsInit() {
		let selectedIndex = 0

		if ($("#selectedTab").val() == "Customers") {
			selectedIndex = 0
			$("#customerDetail").show()
			$("#transactionDetail").hide()
			$("#beneficiaryDetail").hide()
		} else if ($("#selectedTab").val() == "Transactions") {
			selectedIndex = 1
			$("#customerDetail").hide()
			$("#transactionDetail").show()
			$("#beneficiaryDetail").hide()

			transactionTableInit()
		}

		$("#customerTabs > button").eq(selectedIndex).siblings().removeClass("btn-primary").addClass("btn-outline-primary")
		$("#customerTabs > button").eq(selectedIndex).removeClass("btn-outline-primary").addClass("btn-primary")
	}

	/**
	 * Customer Detail
	 */
	checkIdCardVal()
	$("#customerIdCardtype").on("change", function() {
		checkIdCardVal()
	})

	function checkIdCardVal() {
		if ($("#customerIdCardtype").val()) {
			$("#idCardForm").show()		
		}
		if ($("#customerIdCardtype").val() === "RESIDENCE_CARD") {
			$("#idCardIssuerInput").hide()
			$("#idCardNationalityInput").show()
			$("#idCardIssueDateInput").show()
		} else {
			$("#idCardIssuerInput").show()
			$("#idCardNationalityInput").hide()
			$("#idCardIssueDateInput").hide()
		}
	}

	$("#kycStatusSelect").change(function() {
		$("#customerKycStatus").val($(this).val())
	})
	if ($("#customerKycStatus").val() === "COMPLETED") {
		$("#customerKycStatus").attr("readOnly", true)
		$("#customerKycStatus").attr("hidden", false)
		if (userInfo.userType === "AGENT" || userInfo.userType === "SUPER_AGENT") {
			$("#kycStatusSelect").hide()
			$('#customerFirstName').prop("readOnly", true).css("border", "none")
			$('#customerMiddleName').prop("readOnly", true).css("border", "none")
			$('#customerLastName').prop("readOnly", true).css("border", "none")
			$('#customerBirth').prop("readOnly", true).addClass("fixed-birth").css("border", "none")

			$('#datepickerBirth input').each(function() {
				$.each(this.attributes, function(index, attribute) {
					if (attribute && attribute.name.startsWith('data-')) {
						$(attribute.ownerElement).removeAttr(attribute.name);
					}
				});
			});
			$('#datepickerBirth .input-group-text').hide();
		} else {
			$("#kycStatusSelect").val($("#customerKycStatus").val())
			$("#customerKycStatus").prop("hidden", true)
		}
	} else {
		$("#kycStatusSelect").val($("#customerKycStatus").val())
		$("#customerKycStatus").prop("hidden", true)

		if (window.location.href.includes("INDIVIDUAL")) {
			const adultAge = 18;
			const birth = $("#customerBirth").val();
			$("#customerBirth").datepicker({
				dateFormat: "yy-mm-dd",
				autoclose: true,
				maxDate: getBirthdateForAge(adultAge)
			}).on("changeDate", function (e) {
				let selectedDate = e.date;
				let maxDate = getBirthdateForAge(adultAge)
				if (selectedDate > maxDate) {
					alert(`Customer must be at least ${adultAge} years old to sign up.`);
					$("#customerBirth").datepicker("update", getBirthdateForAge(adultAge));
				}
			}).datepicker("setDate", birth);
		}
	}

	function getBirthdateForAge(age) {
		const today = new Date();
		const birthDate = new Date(today);
		birthDate.setFullYear(today.getFullYear() - age);
		return new Date(birthDate.toISOString().split('T')[0]);
	}

	// New Customer Submit
	// 중복이 있지만 허용해야 하는지 여부를 판단
	let submitting = false;
	let allowIfDuplicateExists = false
	const originFirstName = $("input[name='customerFirstName']").val().trim()
	const originMiddleName = $("input[name='customerMiddleName']").val().trim()
	const originLastName = $("input[name='customerLastName']").val().trim()
	const originBirth = String($("input[name='customerBirth']").val().trim())
	const originEmail = $("#customerEmail").val().trim()
	const originContact = $("#customerContact").val().trim()
	const originIdCardCustomerId = $("#customerIdCardCustomerId").val()
	const originKycStatus = $("#customerKycStatus").val()

	$("form").on("submit", function (e) {
		if (submitting) {
			e.preventDefault();
			return;
		}
		e.preventDefault();

		if (($("input[name='customerFirstName']").val() && originFirstName !== $("input[name='customerFirstName']").val().trim())
		|| ($("input[name='customerMiddleName']").val() && originMiddleName !== $("input[name='customerMiddleName']").val().trim())
		|| ($("input[name='customerLastName']").val() && originLastName !== $("input[name='customerLastName']").val().trim())
		|| ($("input[name='customerBirth']").val() && originBirth !== $("input[name='customerBirth']").val().trim())
		) {
			checkDuplicateOptional(function (isAllowed, duplicateFields) {
				if (isAllowed) {
					allowIfDuplicateExists = true;
				} else if (duplicateFields && confirm(`${duplicateFields} already exists. Do you want to continue?`)) {
					allowIfDuplicateExists = true;
				}
				if (allowIfDuplicateExists) {
					updateCustomer();
				}
			});
		} else allowIfDuplicateExists = true;

		if (originKycStatus !== 'COMPLETED' && $('#customerKycStatus').val() === 'COMPLETED') {
			$('#allowButton').on('click', function() {
				if(allowIfDuplicateExists === true) {
					submitting = true;
					updateCustomer();
				}
			});
		} else {
			if(allowIfDuplicateExists === true) {
				updateCustomer();
			}
		}
	})

	function checkDuplicateOptional(callback) {
		$.ajax({
			url: "/customer/checkDuplicate",
			method: "POST",
			data: {
				firstName: originFirstName === $("input[name='customerFirstName']").val().trim() ? '' : $("input[name='customerFirstName']").val().trim(),
				middleName: originMiddleName === $("input[name='customerMiddleName']").val().trim() ? '' : $("input[name='customerMiddleName']").val().trim(),
				lastName: originLastName === $("input[name='customerLastName']").val().trim() ? '' : $("input[name='customerLastName']").val().trim(),
				birth: originBirth === $("input[name='customerBirth']").val().trim() ? '' : String($("input[name='customerBirth']").val().trim())
			},
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function(xhr){
				xhr.setRequestHeader(header, token);
			},
			success: function (response) {
				const duplicateFields = response.duplicateFields

				if (duplicateFields.length === 0) {
					callback(true)
				} else {
					callback(false, duplicateFields.join(', '))
				}
			},
			error: function (xhr, status, error) {
				console.log("실패", xhr, status, error)
				alert("Failed to create customer. Please try again.");
			}
		});
	}

	function updateCustomer() {

		let query = `id=${$("#id").val().trim()}`
		if (originEmail !== $("#customerEmail").val().trim()) {
			query += `&validEmail=${$("#customerEmail").val().trim()}`
		}
		if (originContact !== $("#customerContact").val().trim()) {
			query += `&validContact=${$("#customerContact").val().trim()}`
		}
		if (originIdCardCustomerId !== $("#customerIdCardCustomerId").val()) {
			query += `&validIdCardCustomerId=${$("#customerIdCardCustomerId").val()}`
		}

		if ($("#newMobilePassword").val() !== "" || $("#newMobilePassword").val() !== null) {
			$("#customerMobilePassword").val($("#newMobilePassword").val())
		}
		if ($("#newMobileRemitPin").val() !== "" || $("#newMobileRemitPin").val() !== null) {
			$("#customerMobileRemitPin").val($("#newMobileRemitPin").val())
		}

		const formData = $("form").serialize();

		$.ajax({
			url: `/customer/customerDetail?${query}`,
			method: "POST",
			data: formData,
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function(xhr){
				$("#loadingSpinner").show();
				xhr.setRequestHeader(header, token);
			},
			success: function (response){
				const tabs = JSON.parse(sessionStorage.getItem("tabs"))
				const title = $(".page-title").text()
				const withoutTab = tabs.filter(tab => tab.title !== title)
				sessionStorage.setItem("tabs", JSON.stringify(withoutTab))
				window.location.href = "/customer/customerSearch";
			},
			error: function (xhr, status, error) {
				console.log("XHR : ", xhr);
				console.log("STATUS : ", status);
				console.log("ERROR : ", error);
				if (xhr.status === 409) {
					alert("This customer information already exists. Please try again.");
				} else {
					alert(xhr.responseText || "Failed to create customer. Please try again.");
				}
			},
			complete: function () {
				$("#loadingSpinner").hide();
				submitting = false;
			}
		});
	}

	/**
	 * Customer Transaction Detail
	 */

	let transactionDataUrl = `/customer/customerDetail/transactionData?customerId=${customerId}&type=outbound`
	let type = 'customerTransactionOutbound'
	$("#customerTransactionTabs button").on("click", function() {
		$(this).siblings().removeClass("btn-primary").addClass("btn-outline-primary")
		$(this).removeClass("btn-outline-primary").addClass("btn-primary")

		if (this.id === "customerTransactionOutbound") {
			$("#printButton").show()
			transactionDataUrl = `/customer/customerDetail/transactionData?customerId=${customerId}&type=outbound`
		} else {
			$("#printButton").hide()
			transactionDataUrl = `/customer/customerDetail/transactionData?customerId=${customerId}&type=inbound`
		}
		if (type !== this.id) {
			transactionTableInit()
			type = this.id;
		}
	})

	function monthFilterInit(month) {
		switch (month) {
			case 1:
				return "Jan";
			case 2:
				return "Feb";
			case 3:
				return "Mar";
			case 4:
				return "Apr";
			case 5:
				return "May";
			case 6:
				return "Jun";
			case 7:
				return "Jul";
			case 8:
				return "Aug";
			case 9:
				return "Sep";
			case 10:
				return "Oct";
			case 11:
				return "Nov";
			case 12:
				return "Dec";
			default:
				return "-";
		}
	}

	const now = new Date();
	const thisYear = now.getFullYear();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	const formatted = `${thisYear}年 ${String(month).padStart(2, '0')}月 ${String(day).padStart(2, '0')}日`;
	document.getElementById("printDate").textContent = formatted;

	let selectedYear;
	function transactionTableInit() {
		$("#yearFiled").text(year)

		if ($.fn.DataTable.isDataTable("#transactionsTable")) {
			let table = $("#transactionsTable").DataTable();
			table.ajax.url(transactionDataUrl + '&year=' + year).load();
		} else {
			new DataTable("#transactionsTable", {
				processing: true,
				ajax: {
					url: transactionDataUrl + '&year=' + year,
					method: "GET",
					dataSrc: "",
					xhrFields: {
						withCredentials: true
					},
					beforeSend: function(xhr){
						xhr.setRequestHeader(header, token);
					}
				},
				pageLength: 12,
				lengthChange: false,
				ordering: false,
				columns: [
					{
						data: "month",
						render: function(data) {
							return monthFilterInit(data);
						}},
					{data: "totalAmount"},
					{data: "transactionCount"},
					{data: "year", visible: false},
				],
				layout: {topEnd: {}},
				initComplete: function () {
					this.api()
						.columns()
						.every(function (index) {
							if (index === 3) { // colum - year

								let column = this;

								let select = document.createElement('select');
								$("#yearFilter div").append(select);

								select.addEventListener('change', function () {
									selectedYear = select.value;

									const currentUrl = new URL(window.location);
									currentUrl.searchParams.set('year', selectedYear);
									window.history.replaceState({}, '', currentUrl.toString());

									column.search(selectedYear, {exact: true}).draw();
									table.ajax.url(transactionDataUrl + '?year=' + selectedYear).load();

								});

								column.data().unique().sort().each(function (d) {
									select.add(new Option(d));
								});

								select.value = year;
								if (year) {
									column.search(year, {exact: true}).draw();
								}
							}
						});
				}
			});
		}
		let certificateTable;
		if (!$.fn.DataTable.isDataTable("#certificateTable")) {
			const purpose = $("#purposeSelect").val() || ""
			const relation = $("#relationSelect").val() || ""

			const searchYear = selectedYear || year;
			// Modal Certificate Print
			certificateTable = new DataTable("#certificateTable", {
				ajax: {
					url: `/customer/customerDetail/transactionDetailData?customerId=${customerId}&year=${searchYear}&purpose=${purpose}&relation=${relation}`,
					method: "GET",
					dataSrc: "",
					xhrFields: {
						withCredentials: true
					},
					beforeSend: function(xhr){
						xhr.setRequestHeader(header, token);
					}
				},
				searching: false,
				ordering: false,
				columns: [
					{
						data: null,
						render: DataTable.render.select()
					},
					{
						title: "No.", data: null,
						render: function (data, type, row, meta) {
							return meta.row + 1
						}
					},
					{
						title: "Date<br><span class='jp'>日付</span>", data: "approveDate",
						render: function (data) {
							return moment(data).format("YYYY-MM-DD");
						}
					},
					{ title: "Transfer Amount<br><span class='jp'>送金額 (円)</span>", data: "transferAmount",
						render: function (data) {
							if (data == null) return "";
							return Number(data).toLocaleString("en-US") + " JPY";
						}
					},
					{title: "Rate<br><span class='jp'>レート</span>", data: "customerRate"},
					{title: "Receive Amount<br><span class='jp'>受取金額</span>", data: "receiveAmount"},
					{title: "Receiver<br><span class='jp'>受取人</span>", data: "receiverName"},
					{
						title: "Purpose of Remittance<br><span class='jp'>送金目的</span>",
						data: "purpose",
						render: function (data, type, row) {
							if (type === "display") {
								const options = window.purposeOptions || [];
								let html = `<select class="form-select form-select-sm purpose-select">`;

								html += `<option value="" ${!data ? "selected" : ""}>Select</option>`;

								options.forEach(opt => {
									const selected = opt === data ? "selected" : "";
									html += `<option value="${opt}" ${selected}>${opt}</option>`;
								});

								html += `</select>`;
								return html;
							}
							return data;
						}
					},
					{
						title: "Relation<br><span class='jp'>ご関係</span>",
						data: "relation",
						render: function (data, type, row) {
							if (type === "display") {
								const options = window.relationOptions || [];
								let html = `<select class="form-select form-select-sm relation-select">`;

								html += `<option value="" ${!data ? "selected" : ""}>Select</option>`;

								options.forEach(opt => {
									const selected = opt === data ? "selected" : "";
									html += `<option value="${opt}" ${selected}>${opt}</option>`;
								});

								html += `</select>`;
								return html;
							}
							return data;
						}
					}
				],
				select: {
					style: 'multi',
					selector: 'td:first-child'
				},
			});
		}

		$("#purposeSelect").on("change", function () {
			reloadTable()
		})

		$("#relationSelect").on("change", function () {
			reloadTable()
		})

		function reloadTable() {
			const purpose = $("#purposeSelect").val() || ""
			const relation = $("#relationSelect").val() || ""
			const searchYear = $("#yearFiled").text()
			console.log("purpose : ", purpose)
			console.log("relation : ", relation)

			certificateTable.ajax.url(`/customer/customerDetail/transactionDetailData?customerId=${customerId}&year=${searchYear}&purpose=${purpose}&relation=${relation}`).load();
		}


		$("#printSelected").on("click", function () {
			const table = $("#certificateTable").DataTable();
			const selected = table.rows({ selected: true }).nodes();

			if (selected.length === 0) {
				alert("Please select at least one row to print.");
				return;
			}

			$(".dataTables_scrollHead, .dataTables_scrollBody").hide();

			$("#certificateTable tbody tr").hide();
			$(selected).show();

			window.print();

			$(".dataTables_scrollHead, .dataTables_scrollBody").show();
			$("#certificateTable tbody tr").show();
		});

		$.ajax({
			url: '/customer/customerDetail/printInfo',
			method: 'GET',
			xhrFields: { withCredentials: true },
			beforeSend: function (xhr) {
				xhr.setRequestHeader(header, token);
			},
			success: function (response) {
				console.log("printInfo response:", response);

				// 전역 변수에 저장해서 DataTable에서 접근 가능하게
				window.purposeOptions = response.purpose || [];
				window.relationOptions = response.relation || [];

				// select box 초기화
				$("#purposeSelect").empty().append('<option value="">Select</option>');
				$("#relationSelect").empty().append('<option value="">Select</option>');

				response.purpose.forEach(p => $("#purposeSelect").append(`<option value="${p}">${p}</option>`));
				response.relation.forEach(r => $("#relationSelect").append(`<option value="${r}">${r}</option>`));
			},
			error: function (xhr, status, error) {
				console.error("printInfo load failed:", error);
			}
		});
	}


	/**
	 * Zipcode
	 */
	$("#searchZipcodeButton").on("click", function() {
		const zipcode = $("#customerZipcode").val().trim();

		if (!zipcode) {
			alert("검색어를 입력해주세요.");
			return;
		}

		$.ajax({
			url: "/customer/searchZipcodeAll",
			method: "GET",
			data: {
				searchTerm: zipcode
			},
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function(xhr){
				xhr.setRequestHeader(header, token);
			},
			success: function(response) {
				var resultHtml = "";

				if (response.length > 0) {
					resultHtml += "<ul class='list-group'>";
					response.forEach(function(item) {
						resultHtml += "<li class='list-group-item' data-id='" + item.id + "'> (" + item.zipcode + ") Japan, " + item.state + " " + item.city + " " + item.street + "</li>";
					});
					resultHtml += "</ul>";
				} else {
					resultHtml = "검색 결과가 없습니다.";
				}

				$("#searchResults").html(resultHtml);
			},
			error: function() {
				alert("검색에 실패했습니다. 다시 시도해 주세요.");
			}
		});
	});
	$(document).on("click", "#searchResults .list-group-item", function() {
		const id = $(this).data("id");

		$.ajax({
			url: "/customer/searchZipcode",
			method: "GET",
			data: {
				id: id 
			},
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function(xhr){
				xhr.setRequestHeader(header, token);
			},
			success: function(response) {
				if (response) {
					$("input#searchTerm").val(response.zipcode).change()
					$("input#customerCity").val(response.city)
					$("input#customerCityJp").val(response.cityJp)
					$("select#customerState").val(response.state).change()
					$("input#customerStreet").val(response.street)
					$("input#customerStreetJp").val(response.streetJp)
					$("input#customerZipcode").val(response.zipcode)

					$("#searchResults").html(" ")
				}
			},
			error: function() {
				alert("실패했습니다. 다시 시도해 주세요.");
			}
		});
	});

	$.ajax({
		type: "GET",
		url: "/transaction/transactionOutboundHistorySend/formOptions",
		success: function (data) {
			sessionStorage.setItem("partnersCountry",  JSON.stringify(data.countryToPartners));
			sessionStorage.setItem("purposeOfRemittances",  JSON.stringify(data.purposeOfRemittances));
			sessionStorage.setItem("relationToBeneficiaries",  JSON.stringify(data.relationToBeneficiaries));
			sessionStorage.setItem("sourceOfIncomes",  JSON.stringify(data.sourceOfIncomes));

			SelectBox("#partnerNationality", Object.keys(data.countryToPartners).sort(), "#dpartnerNationalityInput", "Select the receiving country");
			SelectBoxByMap("#nationalitySelect", data.countries, "#nationality", "Select the nationality of the receiver");
			SelectBoxByMap("#transactionReason", data.purposeOfRemittances, "#transactionReasonInput");
			SelectBoxByMap("#relation", data.relationToBeneficiaries, "#relationInput");
			SelectBoxByMap("#incomeSource", data.sourceOfIncomes, "#incomeSourceInput");
			SelectBoxByMap("#gmeReasons", data.gmeReasons, "#gmeReasonsInput");
		},
		error: function () {
			alert("**Failed to fetch data.");
		}
	});

});