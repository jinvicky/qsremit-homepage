$(document).ready(async function(){
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('depositId');

    let reference = "";
    let status = "";

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

    await getBankAndReason();

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

    if (id) {
        $.ajax({
            url: `/pgManagement/bankDepositDetail/${id}`,
            method: "GET",
            contentType: "application/json",
            success: function(data) {
                const formData = {
                    bankName: data.bankName,
                    accountNo: data.accountNo,
                    holderName: data.holderName,
                    depositDate: data.depositDate,
                    amount: `${data.amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    type: data.type,
                    sender: data.sender,
                    senderType: data.senderType,
                    senderName: data.senderName,
                    reason: data.reason,
                    receiver: data.receiver,
                    receiverType: data.receiverType,
                    companyName: data.companyName,
                    companyAddress: data.companyAddress,
                    settlement: `${data.settlement}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    settlementAmount: `${data.settlementAmount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    payout: `${data.payout}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    payoutAmount: `${data.payoutAmount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    reference: data.reference,
                    status: data.status,
                    memo: data.memo
                };

                if (formData.status === "PAID") {
                    // 모든 입력 필드 비활성화
                    $('input, select').prop('disabled', true);

                    // 날짜 선택기 비활성화
                    $('#depositDate').attr('disabled', true);
                    $('.input-group-text').css('pointer-events', 'none');
                } else if (formData.status === "CANCELLED") {
                    // 모든 입력 필드 비활성화
                    $('input, select').prop('disabled', true);
                    $("#memo").prop('disabled', false);

                    // 날짜 선택기 비활성화
                    $('#depositDate').attr('disabled', true);
                    $('.input-group-text').css('pointer-events', 'none');

                    $('#saveButton').show();
                    $('#saveButton').prop('disabled', false).css('cursor', 'pointer');
                } else {
                    $('#searchButton').show();
                    $('#searchButton').prop('disabled', false).css('cursor', 'pointer');

                    $('#searchInfo').show();

                    $('#saveButton').show();
                    $('#saveButton').prop('disabled', false).css('cursor', 'pointer');

                    $(document).on('click', '.disabled-overlay', function() {
                        alert('Please select EC Customer data by pressing "EC Customer Search" button.');
                    });
                }

                function formatDate(isoDateString) {
                    const date = new Date(isoDateString);

                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');

                    return `${year}-${month}-${day}`;
                }

                $(".status").show();
                $(".status").html(formData.status);

                $("#bankName").val(unescapeSpecialCharacters(formData.bankName));
                $("#accountNo").val(unescapeSpecialCharacters(formData.accountNo));
                $("#holderName").val(unescapeSpecialCharacters(formData.holderName));
                $("#depositDate").val(formatDate(formData.depositDate));
                $("#amount").val(unescapeSpecialCharacters(formData.amount));

                $("input[name='gmeType'][value='" + formData.type + "']").prop("checked", true);

                $("#senderSelect option").each(function() {
                    if ($(this).val() === `${unescapeSpecialCharacters(formData.sender)}`) {
                        $(this).prop("selected", true);
                    }
                })

                $("#senderNameSelect option").each(function() {
                    if ($(this).val() === `${unescapeSpecialCharacters(formData.senderName)}`) {
                        $(this).prop("selected", true);
                    }
                })

                $("#reasonInput").val(unescapeSpecialCharacters(formData.reason));
                $("#reasonSelect option").each(function() {
                    if ($(this).val() === $("#reasonInput").val()) {
                        $('#reasonSelect').val(unescapeSpecialCharacters(formData.reason)).prop('disabled', true)
                            .css('display', 'block');
                    }
                })

                $("#receiver").val(unescapeSpecialCharacters(formData.receiver));
                $("#companyName").val(unescapeSpecialCharacters(formData.companyName));
                $("#address").val(unescapeSpecialCharacters(formData.companyAddress));
                $("#settlement").val(unescapeSpecialCharacters(formData.settlement));
                $("#settlementAmount").val(unescapeSpecialCharacters(formData.settlementAmount));
                $("#payout").val(unescapeSpecialCharacters(formData.payout));
                $("#payoutAmount").val(unescapeSpecialCharacters(formData.payoutAmount));

                $("#memo").val(unescapeSpecialCharacters(formData.memo));

                // 숫자 포맷팅을 처리하는 공통 함수
                function formatNumberWithCommas(element) {
                    $(element).on("input", function() {
                        let value = this.value.replace(/,/g, "");
                        value = value.replace(/[^\d]/g, "");
                        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        this.value = value;
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

                reference = formData.reference;
                status = formData.status;
            },
            error: function() {
                console.log("Error");
            }
        })
    }

    $("form").on("submit", function(e) {
        e.preventDefault();

        if (status === "PAID") {
            alert("This deposit is already paid.");
            return;
        }

        const date = $('#depositDate').val();
        const convertToISO8601 = (dateString) => {
            const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/;
            if (dateRegex.test(dateString)) {
                return new Date(`${dateString}T00:00:00Z`).toISOString();
            } else return dateString
        };

        const updateData = {
            bankName: $("#bankName").val(),
            accountNo: $("#accountNo").val(),
            holderName: $("#holderName").val(),
            depositDate: convertToISO8601(date),
            amount: Number($("#amount").val().replace(/,/g, "")),
            type: $("input[name='gmeType']:checked").val(),
            sender: $("#senderSelect").val(),
            senderType: "COMPANY",  // 고정값
            senderName: $("#senderNameSelect").val(),
            reason: $("#reasonSelect").val() || $("#reasonInput").val(),
            receiver: $("#receiver").val(),
            receiverType: "COMPANY",  // 고정값
            companyName: $("#companyName").val(),
            companyAddress: $("#address").val(),
            settlement: Number($("#settlement").val().replace(/,/g, "")),
            settlementAmount: Number($("#settlementAmount").val().replace(/,/g, "")),
            payout: Number($("#payout").val().replace(/,/g, "")),
            payoutAmount: Number($("#payoutAmount").val().replace(/,/g, "")),
            reference: reference,
            status: status,
            memo: $("#memo").val()
        };

        $.ajax({
            url: `/pgManagement/bankDepositDetail/update/${id}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updateData),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader(header, token);
            },
            success: function (res){
                if (res) window.location.href = "/pgManagement/bankDepositManagement";
            },
            error: function (xhr, status, error) {
                console.log("Error Message:", error);
            }
        });
    })
})