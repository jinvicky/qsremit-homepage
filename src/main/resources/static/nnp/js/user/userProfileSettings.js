$(document).ready(function () {
	const query = window.location.search;
	/**
	 * csrf token
	 * */
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	/**
	 * 비밀번호 리셋 후 화면 진입시
	 * */
	if (query.includes("resetPassword=true")) {
		alert("For your security, you need to set a new password.\n" +
			"Please create your own password.");
	}

	/**
	 * parsley.js 초기화
	 * */
	$('#profileSettingsForm').parsley();
	$('#profileSettingsForm input').on('keyup change', function() {
		$(this).parsley().validate();
	});

	/**
	 * 비밀번호 유효성 검사
	 * 연속된 3자리 제한
	 * */
	Parsley.addValidator('custom', {
		validateString: function(value) {
			let numbers = value.split('').map(Number);
			let containCount = 0;
			for (let i = 1; i < numbers.length; i++) {
				if (numbers[i] === numbers[i - 1] + 1) {
					containCount++
				} else {
					containCount = 0;
				}
				if (containCount >= 2) {
					return false;
				}
			}
			return true;
		},
		messages: {
			en: "The value should not contain consecutive numbers.",
		}
	});

	const $newPassword = $('#newPassword');
	 const newPasswordValid = $newPassword.parsley();
	 const confirmNewPasswordValid = $newPassword.parsley();


	$newPassword.on('keyup change', function() {
		newPasswordValid.validate();
	})
	$('#confirmNewPassword').on('keyup change', function() {
		confirmNewPasswordValid.validate();
	})


	/**
	 * EC User 비밀번호 변경
	 * */
	$("#profileSettingsForm").on("submit", function(event) {
		event.preventDefault();
		event.stopPropagation();

		const formData = {
			userId: $("#userId").val(),
			currentPassword: $("#confirmCurrentPassword").val(),
			newPassword: $("#newPassword").val()
		};

		console.log(formData);

		$.ajax({
			url: "/profileSettings/changePassword",
			type: "PUT",
			contentType: "application/json",
			data: JSON.stringify(formData),
			xhrFields: { withCredentials: true },
			beforeSend: function(xhr) {
				xhr.setRequestHeader(header, token);
			},
			success: function() {
				alert("Password has been changed successfully.");
				$("#profileSettingsForm")[0].reset();
			},
			error: function(xhr, status, error) {
				alert("Failed to change password: " + xhr.responseText);
				console.error("Form submission failed:", error);
			}
		});
	});
});