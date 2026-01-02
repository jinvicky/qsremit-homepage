$(document).ready(function () {
    $('.format-number').each(function () {
        let value = $(this).val().replace(/,/g, '');
        if (!isNaN(value) && value !== "") {
            $(this).val(Number(value).toLocaleString());
        }
    });

    document.addEventListener("input", function(e) {
        if (e.target.classList.contains("format-number")) {
            const cleanValue = e.target.value.replace(/[^\d]/g, '');
            e.target.value = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    });

    $('form').on('submit', function(e) {
        // --- ① 서버 전송 전에 콤마 제거 ---
        $('.format-number').each(function() {
            $(this).val($(this).val().replace(/,/g, ''));
        });

        // --- ② 금액 비교 검증 ---
        const minAmt = parseFloat($('[name="minAmt"]').val());
        const maxAmt = parseFloat($('[name="maxAmt"]').val());

        if (minAmt > maxAmt) {
            $('.alert.alert-danger').text('Minimum amount cannot be greater than maximum amount.');
            $('.alert.alert-danger').parent().show();
            $('.alert.alert-danger')[0].scrollIntoView({ behavior: 'smooth' });
            e.preventDefault();
            return false;
        }

        $('.alert.alert-danger').parent().hide();
        return true;
    });
});