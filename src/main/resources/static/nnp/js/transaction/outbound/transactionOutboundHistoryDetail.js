
$(document).ready(function() {
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	$.ajaxSetup({
		headers: {
			"Content-Type": "application/json"
		},
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function(xhr){
			xhr.setRequestHeader(header, token);

			$("#detailLoadingSpinner").show();
		},
		complete: function () {
			$("#detailLoadingSpinner").hide();
		}
	})

	const user = JSON.parse(Cookies.get("user"));
	let status;
	const css = `
        select:disabled, input:disabled {
            background-color: #e9ecef !important;
            color: #6c757d !important;
            cursor: not-allowed !important;
        }
    `;
	const style = $('<style>').text(css);
	$('head').append(style);

	let beneficiaryNameData = {};
	let transactionId;

	// 인쇄 기능 구현
	if (!$('#printModalStyles').length) {
		$('head').append(`<style id="printModalStyles">${transactionPrintStyles}</style>`);
	}

	let printPartnerId;
	$("#printButton").on("click", function () {
		$('#printOptionsModal').modal('show');
		const printDate = dateHtml
			.replace(/<div\b[^>]*>/gi, '')
			.replace(/<\/div>/gi, "<br>");
		formatTransactionPrint(printDate, printPartnerId);
	})

	$("#confirmPrint").on("click", function () {
		const printArea = $('#printOptionsModal .print-preview').html();

		const printContent = transactionPrintContent(printArea);

		// 새 창 열기
		const printWindow = window.open('', '_blank', 'width=800,height=600');
		printWindow.document.write(printContent);
		printWindow.document.close();

		// 모달 닫기
		$('#printOptionsModal').modal('hide');
	});

	function formatNumberWithCommasCurrency(value, currency) {
		if (value === null || value === undefined) return "";

		const num = Number(value);
		if (num === 0) return `0 ${currency}`;

		const formattedNum = num
			.toFixed(10) // 소수점 이하 10자리까지 표시
			.replace(/\.?0+$/, ""); // 불필요한 0 제거

		// 정수와 소수 부분 분리
		const [integerPart, decimalPart] = formattedNum.split(".");

		const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return decimalPart ? `${formattedInteger}.${decimalPart} ${currency}` : `${formattedInteger} ${currency}`;
	}

	// 현재 URL에서 transactionId 추출
	const pathSegments = window.location.pathname.split('/');
	transactionId = pathSegments[pathSegments.length - 1];
	let transferAmount = 0;
	let customerId;
	if (transactionId) {
		// AJAX 요청을 보내 거래 세부 정보를 가져옵니다.
		$.ajax({
			url: `/api/transaction/detail/${transactionId}`,
			method: 'GET',
			dataType: 'json',
			success: function (data) {
				SelectBox("#depositTypeSelect", data.outboundDetailOption.depositBranchesNames, data.depositType);
				SelectBox("#depositMethodSelect", data.outboundDetailOption.depositMethods, data.depositMethod);
				transferAmount = data.transferAmount;
				customerId = data.customer.id;
				console.log(data);
				populateTransactionDetails(data);
				printPartnerId = data.partnerId;

				const params = new URLSearchParams(window.location.search);
				const requestTxnIdString = params.get('print');
				if (requestTxnIdString) {
					$("#printButton").trigger("click");
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error('Error:', textStatus, errorThrown);
				// 에러 메시지 표시 (선택 사항)
				$('#transactionTable tbody').html(`<tr><td colspan="4">Failed to retrieve transaction information.</td></tr>`);
			}
		});
	} else {
		console.error('transactionId가 URL에서 추출되지 않았습니다.');
	}

	/**
	 * 거래 세부 정보를 HTML 요소에 채우는 함수
	 * @param {Object} data - 서버로부터 받은 거래 세부 정보
	 */
	// 트랜잭션 날짜 정보 표시
	let dateHtml = '';
	function populateTransactionDetails(data) {
		const currency = data.partnerCurrency;
		const defaultCurrency = 'JPY';
		const isMigration = data.userId === 'migration';

		data.createUser = data.createUser && data.createUser !== "" ? data.createUser : (isMigration ? data.userId : "-");
		data.approveUser = data.approveUser && data.approveUser !== "" ? data.approveUser : (isMigration ? data.userId : "-");
		data.paidUser = data.paidUser && data.paidUser !== "" ? data.createUser : (isMigration ? data.userId : "-");
		data.cancelUser = data.cancelUser && data.cancelUser !== "" ? data.cancelUser : (isMigration ? data.userId : "-");

		// 생성 시간
		if (data.transactionDate) {
			dateHtml += `<div>${formatCustomDate(data.transactionDate)} | ${data.createUser}</div>`;
		}

		// 승인 시간
		if (data.approveDate) {
			dateHtml += `<div>${formatCustomDate(data.approveDate)} | ${data.approveUser}</div>`;
		}

		// 승인 시간
		if (data.paidDate) {
			dateHtml += `<div style="color: blue;">${formatCustomDate(data.paidDate)} | ${data.paidUser}</div>`;
		}

		if ((data.status === 'Unpaid Cancel' || data.status === 'Cancelled') && data.cancelDate) {
			dateHtml += `<div style="color: red;">${formatCustomDate(data.cancelDate)} | ${data.cancelUser}</div>`;
		}

		if (data.refundDate) {
			dateHtml += `<div style="color: red;">${formatCustomDate(data.refundDate)} | Refund</div>`;
		}


		// 기본 필드 채우기
		$('#transactionDate').html(dateHtml || formatCustomDate(data.transactionDate) || '');
		$('#transactionStatus').html(() => {
			const statusHtml = valueOrEmpty(data.status, "-");
			const cancelMessageHtml = (['Unpaid Cancel', 'Cancelled', 'Cancel'].includes(data.status) && data.cancelMessage && data.cancelMessage.trim())
				? `<div style="color: blue; font-size: 0.9em; margin-top: 5px;">${data.cancelMessage.trim()}</div>`
				: '';

			return `${statusHtml}${cancelMessageHtml}`;
		});
		$('#transactionId').html((valueOrEmpty(data.txnId, "-"))
			+ (data.partnerId ? ` / (P : ${data.partnerId})` : ''));
		$('#paymentCountryPartner').html(
			`${valueOrEmpty(data.payoutCountry, '-')} / ${data.type}`
		);
		$('#transferAgency').html(valueOrEmpty(data.depositMethod, '-'));
		$('#paymentType').html(valueOrEmpty(data.payment, '-'));
		$('#depositType').html(valueOrEmpty(data.depositType, 'Select'))
		$('#depositMethod').html(valueOrEmpty(data.depositMethod, 'Select'))
		$('#remarkInput').val(data.remark && data.remark !== '' ? unescapeSpecialCharacters(data.remark) : '-');

		$("#senderCustomerId").html(data.customer.customerId);
		status = data.status;

		// Post Payment
		if (status === 'Post Payment' && user.userType.includes("ADMIN")) {
			const statusHtml = `
			<span>${data.status}</span>
			<button type="button" class="btn btn-outline-danger btn-sm ms-2" id="cancelBtn2">Cancel</button>
			`;

			$('#transactionStatus').html(statusHtml);

			document.getElementById('cancelBtn2').addEventListener('click', function() {
				if (confirm('Are you sure you want to cancel the transaction?')) {
					let reason;
					if(data.type === "SendMN NBFI") {
						reason = prompt("Please enter the reason why you want to cancel this Transaction.");
					} else reason = '';

					$.ajax({
						url: `/api/transaction/post/cancel/${transactionId}`,
						method: 'PUT',
						contentType: "application/json",
						data: JSON.stringify({
							memo: reason
						}),
						success: function () {
							alert('Transaction cancelled.');
							location.reload();
						},
						error: function (e) {
							console.error("Error", e);
							alert(e.responseText ? e.responseText : 'Error while cancelling');
						}
					});
				}
			});
		}

		// Cancelled
		if(status === 'Cancelled' && user.userType.includes("ADMIN")) {
			$('#RefundButton').removeClass('d-none');
			const RefundButton = document.getElementById('RefundButton');

			RefundButton.addEventListener('click', function() {
					$.ajax({
						url: `/api/transaction/refundCancel/${transactionId}`,
						method: 'PUT',
						success: function () {
							alert('Transaction refunded.');
							location.reload();
						},
						error: function () {
							alert('Failed to cancel transaction.');
						}
					});
			});
		} else {
			$('#RefundButton').addClass('d-none');

		}

		if (status === 'Refunded' && user.userType.includes("ADMIN")) {
			// 상태가 Refunded일 경우 버튼 보여주기
			$('#CancelRefundButton').removeClass('d-none');
			const CancelRefundButton = document.getElementById('CancelRefundButton');
			CancelRefundButton.addEventListener('click', function () {
				$.ajax({
					url: `/api/transaction/cancelRefund/${transactionId}`,
					method: 'PUT',
					success: function () {
						alert('Transaction refund cancelled.');
						location.reload();
					},
					error: function () {
						alert('Failed to cancel transaction.');
					}
				});
			});
		} else {
			// 상태가 Refunded가 아닐 경우 버튼 숨기기
			$('#CancelRefundButton').addClass('d-none');
		}

		//
		if (status === 'Waiting For Deposit' && user.userType.includes("ADMIN")) {

			const isCash = (data.depositMethod && data.depositMethod !== '' ? data.depositMethod : '-').toUpperCase() === 'CASH';
			const depositHistoryBtn = isCash
				? `<button type="button" class="btn btn-outline-warning btn-sm ms-2" id="fApproveBtn">F.Approve</button>`
				: `<button type="button" class="btn btn-outline-warning btn-sm ms-2"
						data-bs-toggle="modal" data-bs-target="#depositHistoryModal" id="depositHistoryBtn">
						Deposit History
					</button>`;

			const statusHtml = `
            <span>${data.status}</span>
            <button type="button" class="btn btn-outline-danger btn-sm ms-2" id="cancelBtn">Cancel</button>
         	${depositHistoryBtn}
        `;

			$('#transactionStatus').html(statusHtml);

			// Cancel 버튼 클릭 이벤트 등록
			$('#cancelBtn').on('click', function() {
				if (confirm('Are you sure you want to cancel the transaction?')) {
					$.ajax({
						url: `/api/transaction/waiting/cancel/${transactionId}`,
						method: 'PUT',
						success: function() {
							alert('Transaction cancelled.');
							location.reload();
						},
						error: function(e) {
							console.error(e);
							alert('Error while cancelling');
						}
					});
				}
			});

			// fApprove 버튼 클릭 이벤트 등록
			$('#fApproveBtn').on('click', async function() {
				if (confirm('Are you sure you want to F.approve the transaction?')) {
					await FapproveTransaction()
				}
			});
		}

		// 모달 안의 버튼 클릭 핸들러
		const validateTransferData = {
			customerId,
			txnId: transactionId,
			transferAmount
		}
		const singleTransactionLimit = 1000000; // 100만엔
		$('#approveBtn').on('click', async function() {

			if (!transactionId) {
				alert('Transaction ID does not exist.');
				return;
			}
			if (transferAmount > singleTransactionLimit) {
				alert('Single transaction limit of 1,000,000 yen exceeded.')
				return
			}

			$('#loadingSpinner').show();
			const isProgress = await validateTransfer(validateTransferData);
			if (!isProgress) return;

			const table = $('#txnDepositHistorySearchTable').DataTable();
			const selectedData = table.rows({selected: true}).data();

			if (selectedData.length === 0) {
				alert('Please select at least one deposit history row.');
				return;
			}

			const ischecked = document.getElementById('saveAccount').checked;
			const requestDtoList = [];
			for (let i = 0; i < selectedData.length; i++) {
				const row = selectedData[i];
				const depositId = row.id;
				const depositMethod = row.depositMethod;
				const accountHolder = row.accountHolder;

				requestDtoList.push({
					id: depositId,
					depositMethod: depositMethod,
					accountHolder: ischecked ? accountHolder : ""
				});
			}

			const isMultiple = requestDtoList.length > 1;
			const url = isMultiple
				? `/api/transaction/approve/multiple/${transactionId}`
				: `/api/transaction/approve/${transactionId}`;
			const payload = isMultiple ? JSON.stringify(requestDtoList) : JSON.stringify(requestDtoList[0]);

			$('#allowButton').on('click', function () {
				$.ajax({
					url: url,
					type: "POST",
					data: payload,
					success: function () {
						alert("Transaction(s) approved successfully.");
						$('#depositHistoryModal').modal('hide');
						location.reload();
					},
					error: function (jqXHR, textStatus) {
						console.error('❌ Error approving transaction');
						console.log("▶ Status:", textStatus);
						console.log("▶ HTTP status code:", jqXHR.status);
						console.log("▶ ResponseText:", jqXHR.responseText);
						console.log("▶ 요청한 데이터:", payload);
						alert(xhr.responseText || "Error occurred while approving the transaction.");
					},
					complete: function () {
						$('#loadingSpinner').hide();
					}
				});
			});
		});

		$('#finalApproveBtn').on('click', async function() {
			if (confirm('Are you sure you want to F.approve the transaction?')) {
				await FapproveTransaction()
			}
		});

		async function FapproveTransaction(){
			if (!transactionId) {
				alert('Transaction ID does not exist.');
				return;
			}

			if (transferAmount > singleTransactionLimit) {
				alert('Single transaction limit of 1,000,000 yen exceeded.')
				return
			}

			const isProgress = await validateTransfer(validateTransferData);
			if (!isProgress) return;

			$.ajax({
				url: '/api/transaction/Fapprove/' + transactionId,
				method: 'POST',
				dataType: 'text',
				success: function () {
					alert('Transaction approved successfully.');

					$('#depositHistoryModal').modal('hide');
					location.reload();
				},
				error: function (xhr, textStatus, errorThrown) {
					console.error('Error approving transaction:', xhr, textStatus, errorThrown);
					alert(xhr.responseText || "Error occurred while approving the transaction.");
				}
			});
		}

		// 송금 제한
		function validateTransfer(data) {
			return $.ajax({
				url: "/transaction/transactionOutboundHistorySend/validateTransfer",
				method: "POST",
				data: JSON.stringify(data),
				contentType: "application/json",
			}).then(response => {
				if (response.status == 400) {
					alert(response.limitReason);
					return false;
				}
				if (response.limitReason !== null) {
					return confirm(response.limitReason);
				}
				if (response.status == 200 && response.limitReason == null) {
					return true;
				}
				return false;
			}).catch(() => false);
		}

		$('#refreshBtn').on('click', function() {
			alert('Refresh 버튼 클릭 시 Deposit History 데이터를 갱신하거나, 화면 갱신');
			// 예를 들어 다시 한 번 deposit history 목록을 불러오는 Ajax 처리 등을 작성
		});
		const $editButton = $('a.btn.btn-primary.width-xl');
		if ($editButton.length && data.txnId) {
			$editButton.attr('href', `/transaction/transactionOutboundHistoryEdit?id=${data.txnId}`);
		}

		//상태에 따라 버튼 표시 + postpayment 추가
		if (data.status === 'Post Payment' || data.status === 'Waiting For Deposit') {
			$editButton.removeClass('d-none').show();
		} else if (data.status === 'PAID') {
			$editButton.addClass('d-none').hide();
		}
		//Information on Applicant
		const senderName = data.customer.senderName;
		const addressFull = formatFullNAddress(data.customer.address)
		$('#senderName').html(`${valueOrEmpty(senderName, 'N/A')} (${valueOrEmpty(data.customer.customerId, 'N/A')})`);
		$('#senderNationality').html(valueOrEmpty(data.customer.nationality, 'N/A'));
		$('#senderMobile').html(valueOrEmpty(data.customer.contact, '-'));
		$('#senderGender').html(valueOrEmpty(data.customer.gender, 'N/A'))
		$('#senderAddress').html(valueOrEmpty(addressFull, 'N/A'))
		$('#customerType').html(valueOrEmpty(data.customer.registrationType, 'N/A'));

		//Information on Beneficiary
		const beneficiaryName = formatFullName(data.beneficiary.beneficiaryName)
		beneficiaryNameData = data.beneficiary.beneficiaryName;
		$('#beneficiaryName').html(beneficiaryName);
		$('#beneficiaryNationality').html(valueOrEmpty(data?.beneficiary?.nationality, '-'));
		$('#beneficiaryPhone').html(valueOrEmpty(data?.beneficiary?.mobile, '-'));
		$('#beneficiaryGender').html(valueOrEmpty(data?.beneficiary?.gender, '-'));
		$('#beneficiaryAddress').html(valueOrEmpty(data?.beneficiary?.address, '-'));
		$('#beneficiaryPayoutBank').val(unescapeSpecialCharacters(data?.bank) && data.bank !== '' ? unescapeSpecialCharacters(data.bank) : '-');
		$('#beneficiaryPayoutBankName').html(valueOrEmpty(data?.bankName, '-'));
		$('#beneficiaryAC').html(valueOrEmpty(data?.beneficiary?.accountNumber, '-'));

		const beneficiaryTableBody = document.querySelector("#beneficiaryTable > tbody");
		let newRow = '';
		if (data.payment === "ACCOUNT_DEPOSIT") {
			newRow = `
            <tr>
                <th class="col-2 table-light">Payout Bank</th>
                <td id="beneficiaryPayoutBankName">${valueOrEmpty(data?.bankName, '-')}</td>
                <th class="col-2 table-light">Payout Branch</th>
                <td id="beneficiaryPayoutBranchName">${valueOrEmpty(data?.branchName, '-')}</td>
            </tr>
            <tr>
                <th class="col-2 table-light">Account Number</th>
                <td id="beneficiaryAC">${valueOrEmpty(data?.beneficiary?.accountNumber, '-')}</td>
            </tr>`;
		} else if (data.payment === "CASH_PAYMENT") {
			newRow = `
            <tr>
                ${data.partnerType === 'TRANGLO' ?
				`<th class="col-2 table-light">Payout Bank</th>
					<td id="beneficiaryPayoutBankName">${valueOrEmpty(data?.bankName, '-')}</td>`
				: ''}
                <th class="coltxnId-2 table-light">Payout Branch</th>
                <td id="beneficiaryPayoutBranchName">${valueOrEmpty(data.branchName, '-')}</td>
                <input type="hidden" id="beneficiaryPayoutBranch" value="${data.branch}">
            </tr>
            <tr>
                <th class="col-2 table-light">ID Type</th>
                <td id="beneficiaryIDType">${valueOrEmpty(data.idType, '-')}</td>
                <th class="col-2 table-light">ID Number</th>
                <td id="beneficiaryIDNumber">${valueOrEmpty(data.idNumber, '-')}</td>
            </tr>`;
		} else if (data.payment === "E_WALLET") {
			newRow = `
            <tr>
                <th class="col-2 table-light">Payout Bank</th>
                <td id="beneficiaryPayoutBankName">${valueOrEmpty(data?.bankName, '-')}</td>
                <th class="col-2 table-light">Account Number</th>
                <td id="beneficiaryAC">${valueOrEmpty(data?.beneficiary?.accountNumber, '-')}</td>
            </tr>`;
		}
		beneficiaryTableBody.insertAdjacentHTML("beforeend", newRow);

		//Information on Remittance
		$('#transferAmount').html(formatNumberWithCommasCurrency(data.transferAmount, defaultCurrency));
		$('#serviceCharge').html(formatNumberWithCommasCurrency(data.totalCharge || 0, defaultCurrency));
		$('#customerRate').html(`1 ${defaultCurrency} = ${formatNumberWithCommasCurrency(data.customerRate || 0, currency)}`);
		$('#payoutAmount').html(formatNumberWithCommasCurrency(data.payoutAmount || 0, currency));
		$('#collectedAmount').html(formatNumberWithCommasCurrency(data.collectedAmount || 0, defaultCurrency));
		$('#receiveAmount').html(formatNumberWithCommasCurrency(data.receiveAmount || 0, currency));

		$('#purposeOfRemittance').html(valueOrEmpty(data.purposeOfRemittance, '-'));
		$('#sourceOfIncome').html(valueOrEmpty(data.sourceOfIncome, '-'));
		$('#RelToBeneficiary').html(valueOrEmpty(data.relationToBeneficiary, '-'));

		status = data.status;

	}

	// "Save"
	$('#transactionDetailForm').on('submit', function (event) {
		event.preventDefault();

		// 폼 데이터 수집
		const depositType = $('#depositTypeSelect').val();
		const depositMethod = $('#depositMethodSelect').val();
		const remark = $('#remarkInput').val();

		// 데이터 유효성 검사 (필수 필드 확인)
		if (!depositType || !depositMethod) {
			alert('Deposit Type과 Deposit Method를 선택해주세요.');
			return;
		}

		// 전송할 데이터 객체 생성
		const formData = {
			depositType: depositType,
			depositMethod: depositMethod,
			remark: remark
		};

		$.ajax({
			url: `/api/transaction/detail/${transactionId}`, // 서버 엔드포인트
			method: 'POST',
			data: JSON.stringify(formData),
			success: function () {
				alert('Remark has been successfully updated.');
				location.reload();
			},
			error: function (xhr, textStatus, errorThrown) {
				console.error('Error approving transaction:', xhr, textStatus, errorThrown);
				alert(xhr.responseText || "Error occurred while approving the transaction.");
			}
		});


	});


	$('#ChargeDetailForm').on('submit', function (event) {
		event.preventDefault();

		const serviceChargeInput = $('#serviceCharge').val();
		const serviceCharge = serviceChargeInput ? parseFloat(serviceChargeInput) : null;

		if (serviceCharge === null || isNaN(serviceCharge)) {
			alert('유효한 Service Charge 값을 입력해주세요.');
			return;
		}

		const formData = {
			serviceCharge: serviceCharge,
		};

		$.ajax({
			url: `/api/transaction/detail/Charge/${transactionId}`, // 서버 엔드포인트
			method: 'POST',
			data: JSON.stringify(formData),
			success: function () {
				alert('Service charge has been successfully updated.');
				location.reload();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error('Error updating serviceCharge:', textStatus, errorThrown);
				alert('serviceCharge 업데이트에 실패했습니다.');
			}
		});
	});



	/**
	 * Transaction Detail 전용
	 * 날짜 문자열을 YYYY.MM.DD HH:MM:SS 형식으로 포맷팅합니다.
	 *
	 * @param {string} dateString - 변환할 날짜 문자열 (ISO 형식 또는 Date 객체가 파싱할 수 있는 형식)
	 * @returns {string} 포맷팅된 날짜 문자열 (YYYY.MM.DD HH:MM:SS) 또는 'Invalid Date'
	 * @example
	 * // "2025.03.11 17:20:03" 반환
	 * formatCustomDate("2025-03-11T08:20:03.155416Z");
	 */
	function formatCustomDate(dateString) {
		const date = new Date(dateString);

		// 유효한 날짜인지 확인
		if (isNaN(date.getTime())) {
			return 'Invalid Date';
		}

		// YYYY.MM.DD HH:MM:SS 형식으로 포맷팅
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');

		return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
	}


	/**
	 * 이름 객체를 전체 이름 문자열로 변환하는 함수
	 * @param {Object} nameObj - 이름 객체 (firstName, middleName, lastName)
	 * @returns {String} 전체 이름
	 */
	function formatFullName(nameObj) {
		if (!nameObj) return '';
		const firstName = nameObj.firstName && nameObj.firstName !== '' ? nameObj.firstName : '';
		const middleName = nameObj.middleName && nameObj.middleName !== '' ? nameObj.middleName : '';
		const lastName = nameObj.lastName && nameObj.lastName !== '' ? nameObj.lastName : '';
		return [firstName, middleName, lastName].filter(Boolean).join(' ');
	}

	function formatFullNAddress(addressObj) {
		if (!addressObj) return 'N/A';

		const zipcode = valueOrEmpty(`〒${addressObj.zipcode}`, '-');
		const street = valueOrEmpty(addressObj.street, '-');
		const city = valueOrEmpty(addressObj.city, '-');
		const state = valueOrEmpty(addressObj.state, '-');

		// 조합하여 전체 주소 문자열 생성
		const formattedAddressParts = [
			zipcode,
			state,
			city,
			street
		];

		// 빈 문자열 제거 후 공백으로 연결
		const formattedAddress = formattedAddressParts.filter(part => part.trim() !== '').join(' ');

		return formattedAddress || 'N/A';
	}



	// SelectBox 초기화 함수
	function SelectBox(selector, options, selectedValue) {
		if (!Array.isArray(options)) {
			console.error(`SelectBox: options is not an array for selector ${selector}`, options);
			options = [];
		}

		const $select = $(selector);
		if ($select.length === 0) {
			console.error(`SelectBox: No element found for selector ${selector}`);
			return;
		}

		// 기존 옵션 제거 (기본 옵션은 유지)
		$select.find('option:not(:first)').remove();

		options.forEach(function (option) {
			if (option === selectedValue) {
				$select.append(`<option value="${option}" selected>${option}</option>`);
			} else {
				$select.append(`<option value="${option}">${option}</option>`);
			}
		});
	}

	/**
	 * "Edit" 버튼 클릭 시 beneficiaryName을 인풋 창으로 전환하고, "Save"와 "Cancel" 버튼을 생성하는 함수
	 */
	$('#editButton').on('click', function (event) {
		event.preventDefault();
		var $editBtn = $(this);

		// 이미 편집 중인 경우 중복 실행 방지
		if ($editBtn.data('editing')) {
			return;
		}

		// 상태에 따라 편집 가능한 필드 설정
		if (status === 'Post Payment') {
			enablePostPaymentEditMode();
		} else if (status === 'Waiting For Deposit') {
			window.location.href = `/transaction/transactionOutboundHistoryEdit?id=${transactionId}`;
		} else {
			alert('이 상태에서는 편집할 수 없습니다.');
			return;
		}

		// "Edit" 버튼을 숨기고 "Save"와 "Cancel" 버튼을 생성
		$editBtn.data('editing', true);
		$editBtn.hide();

		// "Save" 버튼 생성
		var $saveButton = $('<button></button>', {
			id: 'saveButton',
			class: 'btn btn-primary width-xl',
			text: 'Save'
		});

		// "Cancel" 버튼 생성
		var $cancelButton = $('<button></button>', {
			id: 'cancelButton',
			class: 'btn btn-outline-primary width-xl',
			text: 'Edit Cancel'
		});

		// "Save"와 "Cancel" 버튼을 "Edit" 버튼이 있는 div에 추가
		$editBtn.parent().append($saveButton, $cancelButton);

		// "Save" 버튼 클릭 핸들러
		$('#saveButton').on('click', function () {
			saveEdits(status);
		});

		// "Cancel" 버튼 클릭 핸들러
		$('#cancelButton').on('click', function () {
			cancelEdits(status);
		});
	});

	/**
	 * 상태에 따라 편집 가능한 필드를 활성화하는 함수들
	 */
	function enablePostPaymentEditMode() {
		// depositType과 depositMethod를 수정 불가능하게 설정 (이미 편집 중이므로 비활성화)
		$('#depositTypeSelect').prop('disabled', true);
		$('#depositMethodSelect').prop('disabled', true);
		$('#remarkInput').prop('disabled', true);

		// beneficiaryName을 수정 가능하도록 입력 필드로 전환
		let firstName = valueOrEmpty(beneficiaryNameData.firstName, '');
		let middleName = valueOrEmpty(beneficiaryNameData.middleName, '');
		let lastName = valueOrEmpty(beneficiaryNameData.lastName, '');

		$('#beneficiaryName').html(`
            <div class="row g-2">
                <div class="col">
                    <input type="text" id="beneficiaryLastNameInput" class="form-control" placeholder="Last Name" value="${lastName}">
                </div>
                <div class="col">
                    <input type="text" id="beneficiaryMiddleNameInput" class="form-control" placeholder="Middle Name" value="${middleName}">
                </div>
                <div class="col">
                    <input type="text" id="beneficiaryFirstNameInput" class="form-control" placeholder="First Name" value="${firstName}">
                </div>
            </div>
        `);
	}

	function enableWaitingForDepositEditMode() {
		// beneficiaryName을 수정 가능하도록 입력 필드로 전환
		let firstName = beneficiaryNameData.firstName && beneficiaryNameData.firstName !== '' ? beneficiaryNameData.firstName : '';
		let middleName = beneficiaryNameData.middleName && beneficiaryNameData.middleName !== '' ? beneficiaryNameData.middleName : '';
		let lastName = beneficiaryNameData.lastName && beneficiaryNameData.lastName !== '' ? beneficiaryNameData.lastName : '';

		$('#beneficiaryName').html(`
            <div class="row g-2">
            	<div class="col">
                    <input type="text" id="beneficiaryLastNameInput" class="form-control" placeholder="Last Name" value="${lastName}">
                </div>
                <div class="col">
                    <input type="text" id="beneficiaryMiddleNameInput" class="form-control" placeholder="Middle Name" value="${middleName}">
                </div>
                <div class="col">
                    <input type="text" id="beneficiaryFirstNameInput" class="form-control" placeholder="First Name" value="${firstName}">
                </div>
            </div>
        `);

		// 추가로 편집 가능한 필드 활성화 (예: depositType, depositMethod, remark)
		$('#depositTypeSelect').prop('disabled', false);
		$('#depositMethodSelect').prop('disabled', false);
		$('#remarkInput').prop('disabled', false);
	}

	/**
	 * 상태에 따라 저장하는 함수
	 */
	function saveEdits(status) {
		if (status === 'Post Payment') {
			savePostPaymentEdits();
		} else if (status === 'Waiting For Deposit') {
			window.location.href = `/transaction/transactionOutboundHistoryEdit?id=${transactionId}`;
		}
	}

	function savePostPaymentEdits() {
		// beneficiaryName 수집
		const newFirstName = $('#beneficiaryFirstNameInput').val().trim();
		const newMiddleName = $('#beneficiaryMiddleNameInput').val().trim();
		const newLastName = $('#beneficiaryLastNameInput').val().trim();

		// 데이터 유효성 검사
		if (newFirstName === '' || newLastName === '') {
			alert('First Name과 Last Name은 비워둘 수 없습니다.');
			return;
		}

		const formData = {
			firstName: newFirstName,
			middleName: newMiddleName,
			lastName: newLastName
		};

		// POST 요청
		$.ajax({
			url: `/api/transaction/detail/beneficiaryName/${transactionId}`,
			method: 'POST',
			data: JSON.stringify(formData),
			success: function () {
				// beneficiaryName 데이터를 업데이트
				beneficiaryNameData = {
					firstName: newFirstName,
					middleName: newMiddleName,
					lastName: newLastName
				};

				// beneficiaryName 셀을 새로운 이름으로 업데이트
				var updatedFullName = formatFullName(beneficiaryNameData);
				$('#beneficiaryName').text(updatedFullName);

				// "Save"와 "Cancel" 버튼 제거
				$('#saveButton').remove();
				$('#cancelButton').remove();

				// "Edit" 버튼 다시 표시
				var $editBtn = $('#editButton');
				$editBtn.data('editing', false);
				$editBtn.show();

				alert('Beneficiary Name has been successfully updated.');
				// 입력 폼 요소들 다시 활성화
				$('#depositTypeSelect').prop('disabled', false);
				$('#depositMethodSelect').prop('disabled', false);
				$('#remarkInput').prop('disabled', false);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error('Beneficiary Name 업데이트 오류:', textStatus, errorThrown);
				alert('Failed to update beneficiary name.');
				// 버튼 다시 활성화
				$('#saveButton').prop('disabled', false);
				$('#cancelButton').prop('disabled', false);
			}
		});
	}


	/**
	 * 상태에 따라 취소하는 함수
	 */
	function cancelEdits(status) {
		if (status === 'Post Payment') {
			cancelPostPaymentEdits();
		} else if (status === 'Waiting For Deposit') {
			cancelWaitingForDepositEdits();
		}
	}

	function cancelPostPaymentEdits() {
		// beneficiaryName을 원래 텍스트로 복원
		var originalFullName = formatFullName(beneficiaryNameData);
		$('#beneficiaryName').text(originalFullName);

		// "Save"와 "Cancel" 버튼 제거
		$('#saveButton').remove();
		$('#cancelButton').remove();

		// "Edit" 버튼 다시 표시
		var $editBtn = $('#editButton');
		$editBtn.data('editing', false);
		$editBtn.show();

		// 입력 폼 요소들 다시 활성화
		$('#depositTypeSelect').prop('disabled', false);
		$('#depositMethodSelect').prop('disabled', false);
		$('#remarkInput').prop('disabled', false);
	}

	function cancelWaitingForDepositEdits() {
		// beneficiaryName을 원래 텍스트로 복원
		var originalFullName = formatFullName(beneficiaryNameData);
		$('#beneficiaryName').text(originalFullName);

		// Deposit Type과 Deposit Method를 원래 텍스트로 복원
		$('#depositType').text($('#depositTypeSelect').val());
		$('#depositMethod').text($('#depositMethodSelect').val());

		// "Save"와 "Cancel" 버튼 제거
		$('#saveButton').remove();
		$('#cancelButton').remove();

		// "Edit" 버튼 다시 표시
		var $editBtn = $('#editButton');
		$editBtn.data('editing', false);
		$editBtn.show();

		// 입력 폼 요소들 다시 활성화
		$('#depositTypeSelect').prop('disabled', false);
		$('#depositMethodSelect').prop('disabled', false);
		$('#remarkInput').prop('disabled', false);
	}

	function valueOrEmpty(val, str) {
		return (val && val !== '') ? val : str;
	}
});