$(document).ready(function () {
	const query = window.location.search;
	/**
	 * csrf token
	 * */
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	/**
	 * parsley.js 초기화
	 * */
	$('#editUserForm').parsley();
	$('#editUserForm input, #editUserForm select').on('keyup change', function() {
		$(this).parsley().validate();
	});


	/**
	 * 비밀번호 리셋 후 화면 진입시
	 * */
	if (query.includes("resetPassword=true")) {
		alert("For your security, you need to set a new password.\n" +
			"Please create your own password.");
	}

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

	 const newPasswordValid = $('#newPassword').parsley();
	 const confirmNewPasswordValid = $('#confirmNewPassword').parsley();

 	$("#selectUserType").val($("#userType").val())
	$("#selectUserType").on("change", function() {
		$("#userType").val($(this).val())
	})

	$('#newPassword').on('keyup change', function() {
		newPasswordValid.validate();
	})
	$('#confirmNewPassword').on('keyup change', function() {
		confirmNewPasswordValid.validate();
	})
   
   $('#changePasswordButton').on('click', function() {
		 newPasswordValid.validate();
		 confirmNewPasswordValid.validate();

		 if (newPasswordValid.isValid()
		&& confirmNewPasswordValid.isValid()) {
		   $("#password").val($('#newPassword').val())
		   $("#currentPassword").val($('#confirmCurrentPassword').val())

		   $("#newPassword").val("")
		   $("#confirmNewPassword").val("")
		   $("#confirmCurrentPassword").val("")
		   $("#closeButton").click()
         }
   });

	/**
	 * 이메일 유효성 검사
	 * */
	$("#email").on("change", function() {
		validateEmail()
	})
	validateEmail()
	function validateEmail() {
		const isValidEmail = $("#email").val() === "" || !$("#email").parsley().isValid();
		$("#transactionReport").prop("disabled", isValidEmail);

		if ($("#email").val() === "") {
			$(".transaction-report-error-message").text("If you enter your email, it will be activated.");
			$("#transactionReport").val(false);
		} else if (!$("#email").parsley().isValid()) {
			$(".transaction-report-error-message").text("Please enter a valid email address.");
			$("#transactionReport").val(false);
		} else {
			$(".transaction-report-error-message").text("");
		}
	}

	/**
	 * 이메일 중복체크
	 * 1. 기존 이메일 저장
	 * 2. 기존 이메일 이랑 변경된 이메일이랑 다르면 중복체크
	 * */
	const initialEmail = $("#email").val();
	let checkEmail = { email: '', hasEmail: true };
	$("#emailCheckAvailability").click(function(event) {
		event.preventDefault();
		const email = $("#email").val();

		if (email === initialEmail) { return; }

		if (email === "") { return alert( "Please enter your email."); }
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { return alert( "Please enter a valid email address."); }

		initAjax(
			"/user/exists/email",
			{
				email
			},
			function(response) {
				checkEmail.email = $("#email").val();
				checkEmail.hasEmail = response;

				if (response) {
					alert("This Email is already taken. Please choose another one.");
				} else {
					alert("This Email is available.");
				}
			},
			function() {
				alert("This Email is already taken. Please choose another one.");
			}
		)
	})

	/**
	 * User 업데이트
	 * */
	const id = $("#id").val();
	$("#editUserForm").on("submit", function(event) {
		event.preventDefault();
		const formData = $(this).serialize();
		const email = $("#email").val();

		// Email 중복 체크 확인
		if (email !== initialEmail && checkEmail.email !== email) {
			alert("Please check Email availability.");
			return;
		}
		// Email 중복
		if (email !== initialEmail && checkEmail.hasEmail) {
			alert("This Email is already taken. Please choose another one.");
			return;
		}

		initAjax(
			`/user/editUser?id=${id}`,
			formData,
			function() {
				alert( "User Creation Successful.")
				window.location.href = "/user/userList";
			},
			function(xhr, status, error) {
				alert("Failed to update user : " + xhr.responseText);
				console.error("Form submission failed: " + error);
			})
	});

	function initAjax(endPoint, data, callback, errorCallback) {
		$.ajax({
			url: endPoint,
			method: "POST",
			data: data,
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader(header, token);
			},
			success: callback,
			error: errorCallback
		})
	}
});