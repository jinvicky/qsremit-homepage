$(document).ready(function () {
	document.addEventListener("input", function(e) {
		if (e.target.classList.contains("format-number")) {
			const cleanValue = e.target.value.replace(/[^\d]/g, '');
			e.target.value = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
	});

	$('form').on('submit', function(e) {
		// --- ① 서버 전송 전에 콤마 제거 ---
		$('.format-number').each(function () {
			$(this).val($(this).val().replace(/,/g, ''));
		});
	});

	const inputGroupText = $(".currency-amount .input-group-text");

	$("#selectedPayoutCountry").on("change", function() {
		const currency = $("#selectedPayoutCountry").val();
		inputGroupText.text(currency);

		const selectedPartner = $("#selectedPayoutPartner");

		if (currency == "") {
			inputGroupText.text("");

			selectedPartner.empty();
			selectedPartner.append(`<option value="">Select Partner</option>`);
		}

		if (currency) {
			$.ajax({
				url: `/payoutPartner/${currency}`,
				method: 'GET',
				success: function (partners) {
					selectedPartner.empty();
					selectedPartner.append(`<option value="">Select Partner</option>`);

					partners.forEach(partner => {
						selectedPartner.append(
							`<option value="${partner.id}"> 
                         		${partner.payoutPartner}
                            </option>`
						);
					});
				},
				error: function (xhr, status, error) {
					console.error("Failed to get partner list:", error);
				}
			});
		}
	})
});