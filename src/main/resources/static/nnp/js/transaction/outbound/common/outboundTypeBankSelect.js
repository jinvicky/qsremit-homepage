// ------------------------------
// Payment Type 관련 함수
// ------------------------------

function isTrangloSelected() {
    return $("#typeSelect").find('option:selected')
        .text()
        .toLowerCase()
        .includes("tranglo");
}

function disablePaymentType() {
    $("#paymentType").prop("disabled", true)
        .val('')
        .find("option").css("color", "gray");
    $("#paymentTypeHelper").show();
    $("#bankFields, #partnerFields, #RoshanDigitalAccountDepositFields, #aliPayFields").addClass("d-none");
}

function resetPaymentType() {
    disablePaymentType();
}

function togglePaymentFields(paymentType) {
    $("#bankFields, #partnerFields, #RoshanDigitalAccountDepositFields, #aliPayFields").addClass("d-none");
    switch (unescapeSpecialCharacters(paymentType)) {
        case "ACCOUNT_DEPOSIT":
            $("#bankFields").removeClass("d-none");

            $("#bank").attr("required", true);
            $("#accountNo").attr("required", true);

            // 다른 payment type 필드 required 조건 해제
            $("#branch").attr("required", false);
            $("#trangloCashBank").attr("required", false);
            $("#idType").attr("required", false);
            $("#idNumber").attr("required", false);

            break;
        case "CASH_PAYMENT":
            $("#partnerFields").removeClass("d-none");

            if (!isTrangloSelected()) {
                $("#branchField").removeClass("d-none");
                $("#branch").attr("required", true);
                $("#trangloCashBankField").addClass("d-none");
                $("#trangloCashBank").attr("required", false);
            } else {
                $("#branchField").addClass("d-none");
                $("#branch").attr("required", false);
                $("#trangloCashBankField").removeClass("d-none");
                $("#trangloCashBank").attr("required", true);
            }
            $("#idType").attr("required", true);
            $("#idNumber").attr("required", true);

            if ( $("#payoutCountrySelect").val() === "Nepal") {
                $("#idType").val("CITIZENSHIP");
                $("#idNumber").val("0000")
            }

            // 다른 payment type 필드 required 조건 해제
            $("#bank").attr("required", false);
            $("#accountNo").attr("required", false);

            break;
        case "ROSHAN_DIGITAL_ACCOUNT_DEPOSIT_FIELDS":
            $("#RoshanDigitalAccountDepositFields").removeClass("d-none");
            break;
        default:
            break;
    }
}

function updateBranchList(banks, selectedBankCode, branchId) {
    const branchSelect = $(`#${branchId}`);
    branchSelect.prop("disabled", false);
    branchSelect.empty().append('<option value="">Select</option>');

    const selectedBank = banks.find(bank => bank.bankCode === selectedBankCode);

    if (selectedBank && Array.isArray(selectedBank.branches) && selectedBank.branches.length === 0) {
        branchSelect.empty().append('<option value="">No Branches found</option>');
        branchSelect.prop("disabled", true);
        branchSelect.val("");
    } else if (selectedBank && Array.isArray(selectedBank.branches) && selectedBank.branches.length === 1) {
        const branch = selectedBank.branches[0];
        branchSelect.append(`<option ${$("#bankBranchInput").val() === branch.branchCode ? 'selected' : ''} value="${branch.branchCode}">${branch.branchName}</option>`)
        branchSelect.val(branch.branchCode);
    } else if (selectedBank && Array.isArray(selectedBank.branches)) {
        selectedBank.branches.forEach(function (branch) {
            branchSelect.append(`<option ${$("#bankBranchInput").val() === branch.branchCode ? 'selected' : ''} value="${branch.branchCode}">${branch.branchName}</option>`);
        });
    }
}

function updateBankList(data) {
    const bankSelect = $("#bank");
    resetBankList("#bank");

    const accountDeposit = data.find(opt => opt.payoutType === "ACCOUNT_DEPOSIT");
    if (accountDeposit && Array.isArray(accountDeposit.banks)) {
        accountDeposit.banks.forEach(function (bank) {
            bankSelect.append(
                `<option value="${bank.bankCode}" ${$("#bankInput").val() === bank.bankCode ? 'selected' : ''}>
							${bank.bankName}
						  </option>`
            );
        });

        if ($("#bankInput").val()) {
            updateBranchList(accountDeposit.banks, $("#bankInput").val(), "bank-branch");
        }

        bankSelect.off("change").on("change", function () {
            const selectedBankCode = $(this).val();
            $("#bankInput").val(selectedBankCode); // 서버 전송용 hidden input
            updateBranchList(accountDeposit.banks, selectedBankCode, "bank-branch");
        });
    }

    // "CASH_PAYMENT" 처리
    const cashPayment = data.find(opt => opt.payoutType === "CASH_PAYMENT");

    // Tranglo 목록
    const trangloCashBankSelect = $("#trangloCashBank");
    resetBankList("#trangloCashBank");

    if (cashPayment?.banks) {
        if (!isTrangloSelected()) {
            updateBranchList(cashPayment.banks, "CASH_PAYMENT", "branch");
        } else {
            cashPayment.banks.forEach(function (bank) {
                trangloCashBankSelect.append(
                    `<option value="${bank.bankCode}" ${$("#trangloCashBankInput").val() === bank.bankCode ? 'selected' : ''}>
                            ${bank.bankName}
                        </option>`
                );
            });

            trangloCashBankSelect.off("change").on("change", function () {
                const selectedBankCode = $(this).val();
                $("#trangloCashBankInput").val(selectedBankCode); // 서버 전송용 hidden input
            });
        }
    }
}

function resetBankList(selectId) {
    $(selectId).empty().append('<option value="">Select</option>');
    resetBranchList();
}

function resetBranchList() {
    $("#bank-branch").empty().append('<option value="">Select</option>');
}

function selectBankAndBranch(requestData) {
    setTimeout(() => {
        switch (requestData.payment) {
            case 'ACCOUNT_DEPOSIT':
                // 1. `paymentType`이 선택되면 `bank`를 동기적으로 설정
                waitForSelectOptions("#bank", 100, 3000).then(() => {
                    $("#bank").val(requestData.bank || "").trigger("change");

                    // 2. `bank`가 설정되면 `branch`를 동기적으로 설정
                    waitForSelectOptions("#bank-branch", 100, 3000).then(() => {
                        $("#bank-branch").val(requestData.branch || "");
                    }).catch(() => {
                        console.warn("Bank branch select box options did not load in time.");
                    });
                }).catch(() => {
                    console.warn("Bank select box options did not load in time.");
                });

                if(requestData.accountNo != null && requestData.accountNo !== "") {
                    $("#accountNo").val(requestData.accountNo);
                }
                break;

            case 'CASH_PAYMENT':
                $("#branch").val(requestData.branch || "");
                $("idType").val(unescapeSpecialCharacters(requestData.idType) || "");
                $("idNumber").val(unescapeSpecialCharacters(requestData.idNumber) || "");
                break;

            default:
                break;
        }
    }, 100);
}

function waitForSelectOptions(selector, interval, timeout) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkOptions = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            if ($(selector + " option").length > 0) {
                clearInterval(checkOptions);
                resolve();
            } else if (elapsedTime >= timeout) {
                clearInterval(checkOptions);
                reject();
            }
        }, interval);
    });
}
