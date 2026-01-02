$(document).on('click', '#allowButton', function () {


	$("#aml-inbound-modal").modal('hide');
	setTimeout(function () {
		$("#inbound-approve-modal").modal('show');
	}, 500);

	$("#modalButYes").on("click", function () {
		updateInboundHistoryApprove();
	})

	$("#modalButNo").on("click", function () {
		$("#inbound-approve-modal").modal('hide');
	})

	function updateInboundHistoryApprove() {
		const header = $("meta[name='_csrf_header']").attr('content');
		const token = $("meta[name='_csrf']").attr('content');
		$("#inbound-approve-modal").modal('hide');
		$.ajax({
			url: `/transaction/transactionInboundHistory/approve/${transactionId}`,
			method:"PUT",
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function(xhr){
				xhr.setRequestHeader(header, token);
			},
			success: function (response) {
				alert("Payment Completed");
				location.reload();
			},
			error: function (err) {
				console.error("Error fetching data:", err);
			}
		})
	}
});



