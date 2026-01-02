$(document).ready(function() {
    /**
     * **파트너 목록 불러오기**
     * 서버에서 "Payout Partner" 데이터를 요청하고 드롭다운에서 표시.
     */
    $.ajax({
        url: '/payoutPartner/',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            const selectedId = $("#payoutPartner").val()
            getPayoutType(selectedId)

            let options = "<option value=''>Select</option>";
            response.forEach(item => {
                options += `<option ${selectedId == item.id ? 'selected' : ''} value="${item.id}" data-type="${item.type}">${item.payoutPartner}</option>`;
            });

            $("#payoutPartnerSelect").html(options);
        },
        error: function (xhr, status, error) {
            console.error(xhr, status, error);
        }
    });

    /**
     * **파트너 변경 이벤트**
     * 사용자가 파트너를 변경할 때 실행. 해당 파트너의 정보 데이터를 로드.
     */
    $("#payoutPartnerSelect").on("change", function() {
        const payoutPartnerSelect = $(this).val();
        $("#payoutPartner").val(payoutPartnerSelect)
        if (payoutPartnerSelect) {
            getPayoutType(payoutPartnerSelect)
        }
    })

    let payoutPartnerInfoList = [];
    function getPayoutType(payoutPartner) {
        const payoutType = $("#payoutType").val()

        let typeOptions= "<option value=''>Select</option>";
        $.ajax({
            url: `/transaction/transactionOutboundHistorySend/${payoutPartner}`,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                payoutPartnerInfoList = response;
                if (payoutType) {
                    getBank(payoutType)
                }
                if (Array.isArray(response)) {
                    response.forEach(item => {
                        typeOptions += `<option ${payoutType === item.payoutType ? 'selected' : ''} value="${item.payoutType}">${item.payoutType}</option>`;
                    });
                }
                $("#payoutTypeSelect").html(typeOptions);
            },
            error: function (xhr, status, error) {
                console.error(xhr, status, error);
            }
        });
    }

    /**
     * **파트너 타입 변경 이벤트**
     * 사용자가 파트너타입을 변경할 때 실행. 해당 파트너 타입의 정보 데이터를 로드.
     */
    $("#payoutTypeSelect").on("change", function() {
        const payoutTypeValue = $(this).val();

        // 1. 전체 초기화
        resetRequired();

        $("#payoutType").val($(this).val());

        // 2. 송금 타입에 따라 화면 구분
        if (payoutTypeValue) {
            const payoutPartnerType = $("#payoutPartnerSelect option:selected").data('type');
            const isTranglo = payoutPartnerType === 'TRANGLO';
            isRequired(payoutPartnerType);

            if ($(this).val() === 'ACCOUNT_DEPOSIT') {
                $(".payout-bank-outer").show();
                $(".payout-branch-outer").show();
                $(".register-account-outer").show();

                $("#payoutBank").attr("required", true);
                $("#payoutBankSelect").attr("required", true);
                $("#payoutBranch").attr("required", true);
                $("#payoutBranchSelect").attr("required", true);
                $("#accountNumber").attr("required", true);
            } else if ($(this).val() === 'CASH_PAYMENT') {
                /**
                 * Tranglo 예외 처리
                 * CASH_PAYMENT: bank 필수
                 */
                if (isTranglo) {
                    $(".payout-bank-outer").show();
                    $("#payoutBank").attr("required", true);
                    $("#payoutBankSelect").attr("required", true);
                } else {
                    $("#payoutBankSelect").val("CASH_PAYMENT");
                    $("#payoutBank").val("CASH_PAYMENT");
                }
                $(".payout-branch-outer").show();
                !isTranglo ? $(".payout-branch-outer label").attr("style", "padding-left: 0px !important;") : null;
                $("#payoutBranch").attr("required", true);
                $("#payoutBranchSelect").attr("required", true);

                getBranch($(this).val());
            } else if ($(this).val() === 'E_WALLET') {
                $(".payout-bank-outer").show();
                $(".register-account-outer").show();

                $("#payoutBank").attr("required", true);
                $("#payoutBankSelect").attr("required", true);
                $("#accountNumber").attr("required", true);
            }
            getBank($(this).val());
        }
    })
    const resetRequired = () => {
        $(".payout-bank-outer").hide();
        $(".payout-branch-outer").hide();
        $(".register-account-outer").hide();
        $(".payout-branch-outer label").removeAttr("style");

        $("#payoutBank").removeAttr("required");
        $("#payoutBankSelect").removeAttr("required");
        $("#payoutBranch").removeAttr("required");
        $("#payoutBranchSelect").removeAttr("required");
        $("#accountNumber").removeAttr("required");
    }

    let bankList = []
    function getBank(payoutType) {
        const payoutBank = $("#payoutBank").val().trim()

        let bankOptions= '<option value="">Select</option>'

        payoutPartnerInfoList.forEach(item => {
            if (item.payoutType == payoutType) {
                bankList = item.banks
            }
        })

        bankList.forEach(bank => {
            bankOptions += `<option ${payoutBank === bank.bankId ? 'selected' : ''} value="${bank.bankId}">${bank.bankName}</option>`
        })

        $("#payoutBankSelect").html(bankOptions);
        getBranch(payoutBank)
    }
    bindSelectToInput("payoutBankSelect", "payoutBank");

    /**
     * **은행 변경 이벤트**
     * 사용자가 은행 (`payoutBank`)을 변경했을 때 실행되는 이벤트 핸들러.
     */
    $("#payoutBankSelect").on("change", function() {
        const payoutBank = $(this).val();
        getBranch(payoutBank);
    })

    function getBranch(payoutBank) {
        const payoutBranch = $("#payoutBranch").val()

        let branchOptions= '<option value="-">Select</option>'

        let branchList = [];
        bankList.forEach(item => {
            if (item.bankId == payoutBank || item.bankCode == payoutBank) {
                branchList = item.branches
            }
        })

        branchList.forEach(branch => {
            branchOptions += `<option ${payoutBranch === branch.branchId ? 'selected' : ''} value="${branch.branchId}">${branch.branchName}</option>`
        })

        $("#payoutBranchSelect").html(branchOptions);
    }
    bindSelectToInput("payoutBranchSelect", "payoutBranch");


    function bindSelectToInput(selectId, inputId) {
        $(`#${selectId}`).on("change", function () {
            $(`#${inputId}`).val($(this).val());
        });
    }

    // 조건부 파라미터 필수 값으로 지정
    const isRequired = (partnerType) => {
        const $beneficiaryIdTypeLabel = $(`label[for="idType"]`);
        const $beneficiaryIdTypeRequiredMark = $beneficiaryIdTypeLabel.find('.text-danger');
        if (partnerType === 'TRANGLO') {
            if ($beneficiaryIdTypeRequiredMark.length === 0) {
                $beneficiaryIdTypeLabel.append('<span class="text-danger">*</span>');
            }
            $("#beneficiaryIdType").attr('required', 'required');
            $("#beneficiaryIdNumber").attr('required', 'required');
        } else {
            $beneficiaryIdTypeRequiredMark.remove();
            $("#beneficiaryIdType").removeAttr('required');
            $("#beneficiaryIdNumber").removeAttr('required');
        }
    }
});