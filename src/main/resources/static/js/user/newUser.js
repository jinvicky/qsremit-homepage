// 회원가입 폼 JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // 비밀번호 토글 기능
    const passwordToggles = document.querySelectorAll('.input-group-text[data-password]');

    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const inputGroup = this.closest('.input-group');
            const passwordInput = inputGroup.querySelector('input[type="password"], input[type="text"]');

            if (passwordInput) {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                this.setAttribute('data-password', isPassword ? 'true' : 'false');
            }
        });
    });

    // 폼 유효성 검사
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            const userId = document.getElementById('userId').value.trim();
            const userName = document.getElementById('userName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const password2 = document.getElementById('password2').value;

            // 간단한 유효성 검사
            if (userId.length < 3) {
                e.preventDefault();
                alert('아이디는 3자 이상이어야 합니다.');
                return false;
            }

            if (userName.length < 2) {
                e.preventDefault();
                alert('이름은 2자 이상이어야 합니다.');
                return false;
            }

            if (!isValidEmail(email)) {
                e.preventDefault();
                alert('올바른 이메일 주소를 입력해주세요.');
                return false;
            }

            if (password.length < 6) {
                e.preventDefault();
                alert('비밀번호는 6자 이상이어야 합니다.');
                return false;
            }

            // 비밀번호 확인 검증
            if (password !== password2) {
                e.preventDefault();
                alert('비밀번호가 일치하지 않습니다.');
                document.getElementById('password2').focus();
                return false;
            }
        });
    }

    // 비밀번호 실시간 일치 확인
    const password2Input = document.getElementById('password2');
    if (password2Input) {
        password2Input.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            const password2 = this.value;

            if (password2.length > 0) {
                if (password === password2) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            } else {
                this.classList.remove('is-valid', 'is-invalid');
            }
        });
    }

    // 이메일 유효성 검사 함수
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 알림 자동 닫기
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000); // 5초 후 자동으로 닫힘
    });
});

