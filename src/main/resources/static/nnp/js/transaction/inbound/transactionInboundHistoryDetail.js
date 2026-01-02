let transactionId;

$(document).ready(function () {
	// URL에서 transactionId 추출
	const path = window.location.pathname;
	const segments = path.split("/").filter((segment) => segment);
	transactionId = segments[segments.length - 1];
	console.log(transactionId);

	getInboundHistoryDetail();

	$("#printPage").on("click", function () {
		window.print();
	});
});

function getInboundHistoryDetail() {
	$.ajax({
		url: `/transaction/transactionInboundHistory/detail/${transactionId}`,
		method: "GET",
		success: function (data) {
			console.log("Fetched Data:", data);
			console.log("Inbound List Status:", data.inboundList.status);
			console.log("Status Action Btns Exists:", $("#status-action-btns").length);

			// Information 테이블 데이터 삽입
			$("table#Information-inbound-table tbody").html(`
                <tr>
                    <th class="col-2 table-light">Transaction Date/End Date</th>
                    <td>${moment(data.inboundList.transactionDate).format('YYYY-MM-DD H:mm:ss') || ""}
                     <div id="paidDate"></div>
					</td>
                    <th class="col-2 table-light">Status</th>
                    <td>
                        ${data.inboundList.status || ""}
                        <span id="status-action-btns"></span>
                    </td>
                </tr>
                <tr>
                    <th class="table-light">TXN ID (P : Partner Txn ID)</th>
                    <td colspan="3">${data.inboundList.txnId || ""}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Deposit Type</th>
                    <td>${data.inboundList.depositType || ""}</td>
                    <th class="col-2 table-light">Deposit Method</th>
                    <td>${data.inboundList.depositMethod || ""}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Receive Amount</th>
                    <td>${data.inboundList.receiveAmount || ""}</td>
                    <th class="col-2 table-light">Sender Country / Partner</th>
                    <td>${data.inboundList.senderCountry || ""} / ${data.inboundList.senderPartner || ""}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Payment Type</th>
                    <td>${data.inboundList.payoutType || ""}</td>
                    <th class="col-2 table-light">Account No</th>
                    <td>${data.inboundList.accountNumber || ""}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Purpose of remittance</th>
                    <td>${data.inboundList.reason || ""}</td>
                    <th class="col-2 table-light">Source of Income</th>
                    <td>${data.inboundList.fundSource || ""}</td>
                </tr>
                <tr>
                    <th class="table-light">Rel. to Beneficiary</th>
                    <td colspan="3">${data.inboundList.relation || ""}</td>
                </tr>
            `);

			if (data.inboundList.status === "Paid") {
				$("#paidDate").html(`<span style="color: blue;">( ${moment(data.inboundList.endDate).format('YYYY-MM-DD H:mm:ss')} | ${moment(data.inboundList.endDateUser).format('YYYY.MM.DD H:mm:ss')})</span>`);
			}

			if (data.inboundList.status === "Ready to Pay") {

				$("#pending-btn").removeClass("d-none");
				$("#cancelled-btn").removeClass("d-none");
				$("#approve-btn").removeClass("d-none");
				} else {
					$("#approve-btn").addClass("d-none");
					$("#cancelled-btn").addClass("d-none");
					$("#pending-btn").addClass("d-none");
				}


			// Sender 테이블 데이터 삽입
			$("table#sender-inbound-table tbody").html(`
                <tr>
                    <th class="col-2 table-light">Sender Name</th>
                    <td>${data.sender.senderName || ""}</td>
                    <th class="col-2 table-light">Nationality</th>
                    <td>${data.sender.senderNationality || ""}</td>
                </tr>
                <tr>
                    <th class="col-2 table-light">Mobile</th>
                    <td>${data.sender.senderMobile || ""}</td>
                    <th class="col-2 table-light">Email</th>
                    <td>${data.sender.senderEmail || ""}</td>
                </tr>
                <tr>
                    <th class="table-light">Gender</th>
                    <td colspan="3">${data.sender.senderGender || ""}</td>
                </tr>
                <tr>
                    <th class="table-light">Address</th>
                    <td colspan="3">${data.sender.senderAddress || ""}</td>
                </tr>
            `);

			// Beneficiary 테이블 데이터 삽입
			$("table#beneficiary-inbound-table tbody").html(`
                <tr>
                    <th class="col-2 table-light">Beneficiary's Name</th>
                    <td>${data.beneficiary.beneficiaryName || ""}</td>
                    <th class="col-2 table-light">Nationality</th>
                    <td>${data.beneficiary.beneficiaryNationality || ""}</td>
                </tr>
                <tr>
                    <th class="table-light">Mobile</th>
                    <td>${data.beneficiary.beneficiaryMobile || ""}</td>
                    <th class="table-light">Email</th>
                    <td>${data.beneficiary.beneficiaryEmail || ""}</td>
                </tr>
                <tr>
                    <th class="table-light">Gender</th>
                    <td colspan="3">${data.beneficiary.beneficiaryGender || ""}</td>
                </tr>
                <tr>
                    <th class="table-light">Address</th>
                    <td colspan="3">${data.beneficiary.beneficiaryAddress || ""}</td>
                </tr>
            `);

			// 버튼 이벤트 핸들러 (이벤트 위임 방식)
			$(document).on("click", "#pending-btn", function () {
				alert("Transaction pending");
			});

			$(document).on("click", "#cancelled-btn", function () {
				alert("Transaction cancelled");
			});

		},
		error: function (err) {
			console.error("Error:", err);
			alert("Failed to fetch data.");
		},
	});





}



