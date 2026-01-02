$(document).ready(async function (){
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    // disabled 입력 필드 클릭 시 경고창 표시
    $('input[disabled], select[disabled]').each(function() {
        $(this).parent('div').css({
            'position': 'relative',
            'pointer-events': 'all'
        }).append('<div class="disabled-overlay"></div>');
    });
    $('<style>')
        .text(`
            .disabled-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                cursor: not-allowed;
            }
        `)
        .appendTo('head');
    $(document).on('click', '.disabled-overlay', function() {
        alert('Please select EC Customer data by pressing "EC Customer Search" button.');
    });

    await getBankAndReason();

    // 숫자 포맷팅을 처리하는 공통 함수
    const applyFormat = (val) => {
        let value = val.replace(/,/g, "");
        value = value.replace(/[^\d]/g, "");
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return value
    }
    function formatNumberWithCommas(element) {
        $(element).on("input", function() {
            this.value = applyFormat(this.value);
        });
    }

    // 숫자 포맷팅이 필요한 모든 입력 필드에 적용
    const numberFormatFields = [
        "#amount",
        "#settlement",
        "#settlementAmount",
        "#payout",
        "#payoutAmount"
    ];
    numberFormatFields.forEach(fieldId => {
        formatNumberWithCommas(fieldId);
    });

    // 실제 숫자 값을 서버에 전송하기 전에 쉼표를 제거하는 함수
    function getNumericValue(elementId) {
        return $(elementId).val().replace(/,/g, "");
    }

    function validateFormData(data) {
        if (!data.bankName || !data.accountNo || !data.holderName || !data.reason || !data.receiver || !data.companyName || !data.companyAddress) {
            alert('Please select EC Customer by pressing "EC Customer Search" button.');
            return false;
        }

        return true;
    }

    // ajax 초기화
    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        },
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
        }
    })

    // Daily Summary 에서 이동했을 시
    const params = new URLSearchParams(window.location.search);
    const requestECId = params.get('ecId');
    const requestAmount = params.get('amount');

    if (requestECId) {
        $.ajax({
            url: `/pgManagement/ECCustomerDetail/${requestECId}`,
            method: "GET",
            contentType: "application/json",
            success: function(data) {
                const ecData = {
                    ecBankName: data.ecBankName,
                    ecAccountNo: data.ecAccountNo,
                    ecHolderName: data.ecHolderName,
                    ecType: data.ecType,
                    ecReason: data.ecReason,
                    ecReceiver: data.ecReceiver,
                    ecCompanyName: data.ecCompanyName,
                    ecCompanyAddress: data.ecCompanyAddress
                }

                // EC 데이터
                $('#bankName').val(unescapeSpecialCharacters(ecData.ecBankName));
                $('#accountNo').val(unescapeSpecialCharacters(ecData.ecAccountNo));
                $('#holderName').val(unescapeSpecialCharacters(ecData.ecHolderName));

                // 라디오 버튼 설정
                $('input[name="gmeType"]').val([ecData.ecType]);

                $('#receiver').val(unescapeSpecialCharacters(ecData.ecReceiver));
                $('#companyName').val(unescapeSpecialCharacters(ecData.ecCompanyName));
                $('#companyAddress').val(unescapeSpecialCharacters(ecData.ecCompanyAddress));

                // select 박스 설정
                $('#reasonInput').val(unescapeSpecialCharacters(ecData.ecReason));
                $('#reasonSelect').val(unescapeSpecialCharacters(ecData.ecReason)).prop('disabled', true)
                    .css('display', 'block');

                // 금액 데이터
                if (requestAmount) {
                    numberFormatFields.forEach(fieldId => {
                        $(`${fieldId}`).val(applyFormat(requestAmount));
                    });
                }
            },
            error: function() {
                console.log("Error");
            }
        });
    }

    // New Bank Deposit Submit
    $("form").on("submit", function(e) {
        e.preventDefault();

        // 모든 금액 필드의 쉼표 제거
        numberFormatFields.forEach(fieldId => {
            const numericValue = getNumericValue(fieldId);
            $(fieldId).val(numericValue);
        });

        const date = $('input[name="depositDate"]').val();
        const convertToISO8601 = (dateString) => {
            const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
            if (dateRegex.test(dateString)) {
                return new Date(`${dateString}T00:00:00Z`).toISOString();
            } else return dateString
        };

        const createRef = function(date) {
            const data = date.split('-');
            const randomNumber = Math.floor(Math.random() * 900) + 100;

            return `QSSPK${data[0]}${data[1]}${data[2]}${randomNumber}`;
        }
        const ref = createRef(date);

        const formData = {
            bankName: $('#bankName').val(),
            accountNo: $('input[name="accountNo"]').val(),
            holderName: $('input[name="holderName"]').val(),
            depositDate: convertToISO8601(date),
            amount: Number($('input[name="amount"]').val()),
            type: $('input[name="gmeType"]:checked').val(),
            sender: $('#senderSelect').val(),
            senderType: "COMPANY",  // 기본값
            senderName: $('#senderSelect').val(),
            reason: $('#reasonSelect').val() || $('input[name="reasonInput"]').val(),
            receiver: $('input[name="receiver"]').val(),
            receiverType: "COMPANY", // 기본값
            companyName: $('input[name="companyName"]').val(),
            companyAddress: $('input[name="companyAddress"]').val(),
            settlement: Number($('input[name="settlement"]').val()),
            settlementAmount: Number($('input[name="settlementAmount"]').val()),
            payout: Number($('input[name="payout"]').val()),
            payoutAmount: Number($('input[name="payoutAmount"]').val()),
            reference: ref,
            status: "PENDING"
        };

        if (!validateFormData(formData)) {
            return;
        }

        // AJAX 요청
        $.ajax({
            url: "/pgManagement/newBankDepositManagement/create",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(formData),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function(res) {
                if (res) {
                    window.location.href = "/pgManagement/bankDepositManagement";
                }
            },
            error: function(xhr, status, error) {
                alert("Failed to create bank deposit. Please try again.");
                console.error("Error details:", error);
            }
        });

    });
})