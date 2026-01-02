$(document).ready(function () {
	/**
	 * csrf token
	 * */
	const header = $("meta[name='_csrf_header']").attr('content');
	const token = $("meta[name='_csrf']").attr('content');

	/**
	 * parsley.js 초기화
	 * */
	$('#newUserForm').parsley();
	$('#newUserForm input, #newUserForm select').on('keyup change', function() {
		$(this).parsley().validate();
	});

	$("#registrationDate").text(moment().format("YYYY-MM-DD"));
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

	/**
	 * 이메일 유효성 검사
	 * */
	$("#email").on("change", function() {
		validateEmail()
	})
	$("#transactionReport").on("change", function() {
		$("#transactionReport").val(($("#transactionReport").is(":checked")))
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
	 * 중복 체크 변수
	 * */
	let checkUserId = { userId: '', hasUserId: true };
	let checkEmail = { email: '', hasEmail: true };

	/**
	 * User Id 중복 체크
	 * */
	$("#userIdCheckAvailability").click(function(event) {
		event.preventDefault();

		if ($("#userId").val() === "") { return alert( "Please enter your User Id."); }

		initAjax(
			"/user/exists/userId",
			{
				userId: $("#userId").val()
			},
			function(response) {
				checkUserId.userId = $("#userId").val();
				checkUserId.hasUserId = response;

				if (response) {
					alert("This user Id is already taken. Please choose another one.");
				} else {
					alert("This user Id is available.");
				}
			},
			function() {
				alert("This user Id is already taken. Please choose another one.");
			}
		)
	})

	/**
	 * Email 중복 체크
	 * */
	$("#emailCheckAvailability").click(function(event) {
		event.preventDefault();
		const email = $("#email").val();

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

				console.log("Email Response", response);

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
	 * User 생성
	 * */
	$("#newUserForm").on("submit", function(event) {
		event.preventDefault();
		const formData = $(this).serialize();

		// User Id 중복 체크 확인
		if (checkUserId.userId !== $("#userId").val()) {
			alert("Please check User ID availability.");
			return;
		}
		// User Id 중복
		if (checkUserId.hasUserId) {
			alert("This user Id is already taken. Please choose another one.");
			return;
		}
		// Email 중복 체크 확인
		if (checkEmail.email !== $("#email").val()) {
			alert("Please check Email availability.");
			return;
		}
		// Email 중복
		if (checkEmail.hasEmail) {
			alert("This Email is already taken. Please choose another one.");
			return;
		}

		initAjax(
			"/user/newUser",
			formData,
			function() {
				alert( "User Creation Successful.")
				window.location.href = "/user/userList";
			},
			function(xhr) {
				alert("User Creation Failed : " + xhr.responseText);
				console.error("Form submission failed: " + xhr.responseText);
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