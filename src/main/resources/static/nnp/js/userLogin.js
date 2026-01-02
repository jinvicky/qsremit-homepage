$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);

    if (params.has('timeout')) {
        Cookies.remove('user');
        const $alert = $('<div class="login-timeout-alert text-center" style="color:#ef7133;">Your session has expired. Please log in again.</div>');

        const $target = $('#loginForm');

        if ($target.length) {
            $target.prepend($alert);
        } else {
            $('body').prepend($alert);
        }
    }

    $("#loginForm").submit(function (event) {
        event.preventDefault(); // 기본 폼 제출 막기

        const formData = $(this).serialize(); // 폼 데이터 직렬화
        $.ajax({
            type: "POST",
            url: "/processLogin", // 로그인 요청 URL
            data: formData, // 폼 데이터
            dataType: "json",
            xhrFields: { withCredentials: true }, // 쿠키 포함
            success: function (data) {
                Cookies.set('user', JSON.stringify(data));
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 50);
            },
            error: function (xhr) {
                if (xhr.status === 403) {
                    alert(xhr.responseText);
                } else {
                    alert("Login failed! Please check your username and password.");
                }
            }
        });
    });

    $("[data-password]").on('click', function () {
        if ($(this).attr('data-password') == "false") {
            $(this).siblings("input").attr("type", "text");
            $(this).attr('data-password', 'true');
            $(this).addClass("show-password");
        } else {
            $(this).siblings("input").attr("type", "password");
            $(this).attr('data-password', 'false');
            $(this).removeClass("show-password");
        }
    });
})