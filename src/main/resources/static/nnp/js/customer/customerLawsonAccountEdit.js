$(document).ready(function() {
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

	const urlParams = new URLSearchParams(window.location.search);
	const id = urlParams.get('id');

	let customerIdString;
	let customerId;

	$.ajax({
		url: `/customer/customerLawsonAccountEdit/${id}`,
		method: "GET",
		success: function (response) {
			$("#lawsonAccount").val(response.lawsonDetail.lawsonAccount)
			$("#accountHolder").val(response.lawsonDetail.accountHolder)
			$("#customerId").val(response.lawsonDetail.customerEntityId)
			$("#customerIdString").val(response.lawsonDetail.customerId);
			$("#senderName").val(response.lawsonDetail.customerName);

			customerIdString = response.lawsonDetail.customerId;
			customerId = response.lawsonDetail.customerEntityId;

			mapBeneficiaryData(response.beneficiary);
		},
		error: function (error) {
			alert(error.responseText);
		}
	})

	$("#accountInfo").on("submit", function(event) {
		event.preventDefault();

		$.ajax({
			url: `/customer/customerLawsonAccountEdit?id=${id}`,
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({
				beneficiaryId: $("#beneficiaryId").val(),
				customerId: customerId,
				lawsonAccount: $("#lawsonAccount").val(),
				accountHolder: $("#accountHolder").val(),
			}),
			success: function() {
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

	function mapBeneficiaryData(rowData) {
		$("#receiverFieldset").show();
		$("#beneficiaryId").val(rowData.id);
		$("#beneficiaryName").val(`${rowData.lastName} ${rowData.firstName} ${rowData.middleName}`);
		$("#beneficiaryMobile").val(rowData.mobile);
		$("#beneficiaryRegistrationType").val(rowData.registrationType);
		$("#beneficiaryNationality").val(rowData.nationality);
		$("#beneficiaryGender").val(rowData.gender);
		$("#beneficiaryIdType").val(rowData.idType);
		$("#beneficiaryIdNumber").val(rowData.idNumber);
		$("#beneficiaryAddress").val(rowData.address);
		$("#beneficiaryPayoutPartner").val(rowData.payoutPartner);

		const beneficiaryPayoutType = [
			`Payout Type: ${rowData.payoutType.replace(/_/g, " ")}`,
		];
		const branchName = `Payout Branch:  ${rowData.payoutBranchName}`
		if (rowData.payoutType == 'ACCOUNT_DEPOSIT') {
			const bankName = `Payout Bank:  ${rowData.payoutBankName}`
			const accountNumber = `Account Number:  ${rowData.accountNumber}`
			beneficiaryPayoutType.push(bankName, branchName, accountNumber)
		} else if (rowData.payoutType == 'CASH_PAYMENT') {
			beneficiaryPayoutType.push(branchName)
		}
		$("#beneficiaryPayoutInfo").val(beneficiaryPayoutType.join(" / ").replaceAll("null", "-"));

		$("#beneficiaryRelation").val(rowData.relationName);
		$("#beneficiaryTransactionReason").val(rowData.transactionReasonName);
		$("#beneficiaryIncomeSource").val(rowData.incomeSourceName);
	}

});