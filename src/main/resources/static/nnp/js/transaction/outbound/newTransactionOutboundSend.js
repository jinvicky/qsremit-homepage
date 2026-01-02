$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    /**
     * 전역 변수 및 URL 파라미터 설정
     */
    let mappedSenders = [];
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step') || '1';
    let currencyDecimalMap = {};

    /**
     * 통화 자릿수 정보를 서버에서 로드
     */
    $.ajax({
        type: "GET",
        url: "/transaction/currency/decimal-places",
        success: function (data) {
            currencyDecimalMap = data;
        },
        error: function () {
            console.error("통화 자릿수 정보를 불러오지 못했습니다.");
        }
    });

    /**
     * 통화별 소수점 자리수 설정 함수
     */
    function getDecimalPlacesForCurrency(currency) {
        return currencyDecimalMap[currency] ?? 2;
    }

    // alert 클릭 시 모달 열기
    $("#alertNote").on('click', function() {
        $("#transactionCreationGuideModal").modal("show");
    });
    // close 버튼 클릭 시 alert만 닫기
    $("#alertCloseButton").on('click', function(event) {
        event.stopPropagation();
        $("#alertNote").alert('close');
    });

    /**
     * Sender 이름에서 고객ID와 이름을 분리하는 함수
     */
    function parseSenderField() {
        const senderCombined = $("#senderName").val().trim();
        const match = senderCombined.match(/^(.*?)\s*\(\s*(.*?)\s*\)$/);
        if (match) {
            return {
                fullName: match[1].trim(),
                customerId: match[2].trim()
            };
        } else {
            return {fullName: senderCombined, customerId: null};
        }
    }

    /**
     * AutoNumeric 초기화 (입력 페이지: step 1)
     */
    let anTransferAmount,
        anCustomerRate,
        anReceiveAmount,
        anPayoutAmount,
        anServiceCharge,
        anCollectedAmount;

    if (step === "1") {
        // \u2705 초기엔 전부 decimalPlaces:0로 설정 (임시)
        anTransferAmount = initAutoNumeric("#transferAmount", {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0,
        });
        anCustomerRate = initAutoNumeric("#customerRate", {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0,
        });
        anReceiveAmount = initAutoNumeric("#receiveAmount", {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0,
        });
        anPayoutAmount = initAutoNumeric("#payoutAmount", {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0,
        });
        anServiceCharge = initAutoNumeric("#serviceCharge", {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0,
        });
        anCollectedAmount = initAutoNumeric("#collectedAmount", {
            digitGroupSeparator: ",",
            decimalCharacter: ".",
            decimalPlaces: 0,
        });

        $.ajax({
            type: "GET",
            url: "/transaction/transactionOutboundHistorySend/formOptions",
            success: function (data) {
                sessionStorage.setItem("partnersCountry",  JSON.stringify(data.countryToPartners));
                sessionStorage.setItem("purposeOfRemittances",  JSON.stringify(data.purposeOfRemittances));
                sessionStorage.setItem("relationToBeneficiaries",  JSON.stringify(data.relationToBeneficiaries));
                sessionStorage.setItem("sourceOfIncomes",  JSON.stringify(data.sourceOfIncomes));

                SelectBox("#depositType", data.depositBranchesNames, "#depositTypeInput");
                SelectBox("#depositMethod", data.depositMethods, "#depositMethodInput");
                SelectBox("#partnerNationality", Object.keys(data.countryToPartners).sort(), "#dpartnerNationalityInput", "Select the receiving country");
                SelectBoxByMap("#nationalitySelect", data.countries, "#nationality", "Select the nationality of the receiver");
                SelectBoxByMap("#transactionReason", data.purposeOfRemittances, "#transactionReasonInput");
                SelectBoxByMap("#relation", data.relationToBeneficiaries, "#relationInput");
                SelectBoxByMap("#incomeSource", data.sourceOfIncomes, "#incomeSourceInput");
                SelectBoxByMap("#gmeReasons", data.gmeReasons, "#gmeReasonsInput");

                if ($("#beneficiaryId").val() || $("#senderId").val() ) {
                    $("#beneficiaryFieldset").show();
                    $("#remittanceFieldset").show();
                    $("#allowButton").show();
                }

                if (sessionStorage.getItem("reloadData")) {
                    reloadSecondStepData();
                }
            },
            error: function () {
                alert("**Failed to fetch data.");
            }
        });
        handleChange("#depositType", "#depositTypeInput")
        handleChange("#depositMethod", "#depositMethodInput")

        function handleChange(select, input) {
            $(select).on("change", function () {
                $(input).val($(this).val())
            })
        }

        /**
         * 환율 계산
         */
        let transferDebounceTimer;
        let serviceChargeChange = false;
        const transferDebounceDelay = 1000;
        let isBeneficiarySelected = false;
        let isAlert = false;
        $("#transferAmount").on("input change", function () {
            checkSelectedBeneficiary();
            if (!isBeneficiarySelected) return;

            calculateAmount(parseFloat(anTransferAmount.getNumber()), 0, 0);
        });
        $("#payoutAmount").on("input change", function () {
            checkSelectedBeneficiary();
            if (!isBeneficiarySelected) return;

            calculateAmount(0, parseFloat(anPayoutAmount.getNumber()), 0);
        })
        $("#receiveAmount").on("input change", function () {
            checkSelectedBeneficiary();
            if (!isBeneficiarySelected) return;

            calculateAmount(0, parseFloat(anReceiveAmount.getNumber()), 0);
        })
        $("#collectedAmount").on("input change", function () {
            checkSelectedBeneficiary();
            if (!isBeneficiarySelected) return;

            calculateAmount(0, 0, parseFloat(anCollectedAmount.getNumber()));
        })
        $("#serviceCharge").on("input change", function () {
            checkSelectedBeneficiary();
            if (!isBeneficiarySelected) return;

            calculateAmount(parseFloat(anReceiveAmount.getNumber()), parseFloat(anReceiveAmount.getNumber()), 0);
            serviceChargeChange = true;
        })

        function checkSelectedBeneficiary() {
            const selectedBeneficiary = $("#beneficiaryId").val();
            if (!selectedBeneficiary && !isAlert) {
                isBeneficiarySelected = false;
                alert("Please select a Beneficiary before calculating the amount.");
                isAlert = true;
            } else if (selectedBeneficiary) {
                isBeneficiarySelected = true;
                isAlert = false
            }
        }
        function calculateAmount(transferAmount, receiveAmount, collectedAmount) {
            clearTimeout(transferDebounceTimer);
            transferDebounceTimer = setTimeout(function () {
                let transferAmountValue = transferAmount;
                let receiveAmountValue = receiveAmount;
                let collectAmountValue = collectedAmount;
                let serviceChargeValue = parseFloat(anServiceCharge.getNumber());

                if (isNaN(transferAmountValue) || transferAmountValue < 0) {
                    alert("Transfer Amount must be a valid number and cannot be negative.");
                    return;
                }

                const selectedCurrency = $("#currencyCode").text() || 'USD';
                const decimalPlaces = getDecimalPlacesForCurrency(selectedCurrency);

                /**
                 * 송금액 계산 요청
                 * (response)을 AutoNumeric 인스턴스에 set 메서드로 반영
                 * @type {{transferAmount: string, paymentType: (*|jQuery), payoutPartnerId: number}}
                 */
                let dto = {
                    transferAmount: transferAmountValue.toFixed(decimalPlaces),
                    receiveAmount: receiveAmountValue.toFixed(decimalPlaces),
                    paymentType: $("#paymentType").val(),
                    payoutPartnerId: parseInt($("#payoutPartnerId").val(), 10),
                    collectedAmount: collectAmountValue.toFixed(decimalPlaces),
                };

                if (serviceChargeChange) dto.serviceCharge = serviceChargeValue.toFixed(decimalPlaces);

                $.ajax({
                    type: "POST",
                    url: "/transaction/transactionOutboundHistorySend/transferAmount",
                    contentType: "application/json",
                    data: JSON.stringify(dto),
                    xhrFields: {
                        withCredentials: true
                    },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(header, token);
                    },
                    success: function (response) {

                        const sourceDecPlaces = getDecimalPlacesForCurrency(response.sourceCurrency || "JPY");
                        const targetDecPlaces = getDecimalPlacesForCurrency(response.targetCurrency || "USD");

                        // ------------------------------
                        // 3) Service Charge / Collected Amount (원래 입력 통화로 처리)
                        // ------------------------------
                        if (anTransferAmount) {
                            anTransferAmount.clear();
                            // transferAmount = 원래 입력 통화로 표시 (예: JPY)
                            anTransferAmount.set(
                                parseFloat(response.transferAmount || 0).toFixed(sourceDecPlaces)
                            );
                        }

                        if (anServiceCharge) {
                            anServiceCharge.clear();
                            // totalCharge = 원래 입력 통화로 표시 (예: JPY)
                            anServiceCharge.set(
                                parseFloat(response.totalCharge || 0).toFixed(sourceDecPlaces)
                            );
                        }

                        if (anCollectedAmount) {
                            anCollectedAmount.clear();
                            // collectedAmount = 원래 입력 통화로 표시 (예: JPY)
                            anCollectedAmount.set(
                                parseFloat(response.collectedAmount || 0).toFixed(sourceDecPlaces)
                            );
                        }

                        // ------------------------------
                        // 4) Payout Amount / Receive Amount / Customer Rate (환율 적용 후 통화)
                        // ------------------------------
                        if (anPayoutAmount) {
                            anPayoutAmount.clear();
                            // payoutAmount = 환율 적용 후 통화로 표시 (예: USD)
                            anPayoutAmount.set(
                                parseFloat(response.payoutAmount || 0).toFixed(targetDecPlaces)
                            );
                        }

                        if (anReceiveAmount) {
                            anReceiveAmount.clear();
                            // receiveAmount = 환율 적용 후 통화로 표시 (예: USD)
                            anReceiveAmount.set(
                                parseFloat(response.receiveAmount || 0).toFixed(targetDecPlaces)
                            );
                        }

                        if (AutoNumeric.getAutoNumericElement("#customerRate")) {
                            AutoNumeric.getAutoNumericElement("#customerRate").remove();
                        }

                        $("#customerRate").val(response.customerRate || 0);

                        $(".currency-code").text(response.targetCurrency);

                        $('#transferAmount').parsley().reset();
                        $('#serviceCharge').parsley().reset();
                        $('#collectedAmount').parsley().reset();
                        $('#payoutAmount').parsley().reset();
                        $('#customerRate').parsley().reset();
                        $('#receiveAmount').parsley().reset();
                    },
                    error: function () {
                        alert("Failed to send data. Please check your connection and try again.");
                    }
                });
            }, transferDebounceDelay);
        }

        $("#accountCheck").on("click", function () {
            // 수령자 계좌 검증 Api
            let type = $("#typeSelect").val();
            let bankCode = $("#bank").val();
            let lastName = $("#lastName").val();
            let middleName = $("#middleName").val();
            let firstName = $("#firstName").val();
            let accountNumber = $("#accountNo").val();

            // 입력 유효성 검사 추가
            if (!type) {
                alert("Bank selection is required. Please select a bank.");
                return;
            } else if (type !== "2") {
                alert("Account Check currently supports only Himal accounts.");
                return;
            }

            if (!lastName || !firstName) {
                alert("Beneficiary name is required. Please enter the beneficiary name.");
                return;
            }

            if (!accountNumber) {
                alert("Account number verification is required. Please check the account number.");
                return;
            }

            // 이름 조합 (빈 값 처리 포함)
            let beneficiaryName = [lastName, middleName, firstName]
                .filter(name => name && name.trim() !== '' && name.trim().toUpperCase() !== 'N/A')
                .join(' ');


            let req = {
                partnerId: type,
                bankCode: bankCode,
                beneficiaryName: beneficiaryName,
                accountNumber: accountNumber
            };

            $.ajax({
                type: "POST",
                url: "/transaction/transactionOutboundHistorySend/validateBankAccount",
                contentType: "application/json",
                data: JSON.stringify(req),
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(header, token);
                },
                success: function (response) {
                    // 성공 응답 처리
                    if (response.valid) {
                        alert("Account verification successful.");
                    } else {
                        alert("Account verification failed. Please verify the information again.");
                    }
                },
                error: function (xhr, status, error) {
                    console.error("계좌 검증 중 오류 발생:", error);
                    alert("Account verification is currently unavailable.");
                }
            });
        })
    }

    /**
     * 최종 데이터 수집 및 sessionStorage 저장 (입력 페이지)
     */
    let newAccount = 'Y'; // IME 필수값
    const singleTransactionLimit = 1000000; // 100만엔
    $("#outboundSendForm").on("submit", function (e) {
        e.preventDefault();

        const currency = $("#currencyCode").text() || "USD";
        const transferAmountValue = anTransferAmount ? anTransferAmount.getNumber() : 0;
        const payoutAmountValue = anPayoutAmount ? anPayoutAmount.getNumber() : 0;
        const receiveAmountValue = anReceiveAmount ? anReceiveAmount.getNumber() : 0;
        const serviceChargeValue = anServiceCharge ? anServiceCharge.getNumber() : 0;
        const collectedAmountValue = anCollectedAmount ? anCollectedAmount.getNumber() : 0;

        if (transferAmountValue > singleTransactionLimit) {
            alert('Single transaction limit of 1,000,000 yen exceeded.')
            return
        }

        // senderName 에서 고객 ID와 이름을 분리 (div 요소이므로 .text() 사용)
        const senderData = parseSenderField();

        const requestData = {
            partnerId: $("#payoutPartnerId").val() || null,
            beneficiaryPayoutPartner: $("#beneficiaryPayoutPartner").text() || null,
            senderId: $("#senderId").val() || null, // id
            customerId: senderData.customerId || null, // string id
            senderName: senderData.fullName || null,
            senderMobile: $("#phoneNumber").val() || null,
            senderGender: $("#gender").val() || null,
            senderAddress: $("#addressSender").val() || null,
            senderCustomerType: $("#customerType").val() || null,
            senderNationality: $("#senderNationality").val() || null,
            depositType: $("#depositType").val() || null,
            depositMethod: $("#depositMethod").val() || null,
            beneficiaryId: $("#beneficiaryId").val() || null,
            beneficiaryName: $("#beneficiaryName").val() || "",
            beneficiaryGender: $("#beneficiaryGender").val() || null,
            chooseType: $("#beneficiaryRegistrationType").val() || null,
            beneficiaryNationality: $("#beneficiaryNationality").val() || null,
            address: $("#beneficiaryAddress").val() || "",
            mobile: $("#beneficiaryMobile").val() || "",
            idType: $("#beneficiaryIdType").val() || "",
            idNumber: $("#beneficiaryIdNumber").val() || "",
            purposeOfRemittance: $("#beneficiaryTransactionReason").val() || null,
            sourceOfIncome: $("#beneficiaryIncomeSource").val() || null,
            relationToBeneficiary: $("#beneficiaryRelation").val() || null,
            payment: $("#paymentType").val() || null,
            branch: $("#branch").val() || "",
            branchName: $("#branchName").val() || "",
            beneficiaryPayoutInfo: $("#beneficiaryPayoutInfo").val() || "",
            transferAmount: parseFloat(transferAmountValue),
            customerRate: $("#customerRate").val(),
            payoutAmount: parseFloat(payoutAmountValue),
            receiveAmount: parseFloat(receiveAmountValue),
            totalCharge: parseFloat(serviceChargeValue),
            collectedAmount: parseFloat(collectedAmountValue),
            remark: $("#remark").val() || "",
            currency: currency,
            newAccount: newAccount
        };

        //거래 타입을 가져옴
        const paymentType = $("#paymentType").val();

        switch (paymentType) {
            case 'ACCOUNT_DEPOSIT':
                // 계좌 입금 관련 추가 필드들 추가
                requestData.bank =  $("#bank").val() || "";
                requestData.bankId =  $("#bankId").val() || "";
                requestData.bankName =  $("#bankName").val() || "";
                requestData.accountNo = $("#accountNo").val() || "";

                break;
            case 'CASH_PAYMENT':
                // 현금 지급 관련 추가 필드들 추가
                requestData.bank = 'CASH_PAYMENT';
                break;
            default:
                break;
        }

        const isTranglo = !!$("#beneficiaryPayoutPartner").val()
            && String($("#beneficiaryPayoutPartner").val()).toLowerCase().includes('tranglo');
        if (isTranglo && (requestData.senderMobile === 'N/A' || !requestData.senderMobile)) {
            alert('Please enter the sender mobile number.');
        } else {
            sessionStorage.setItem("requestData", JSON.stringify(requestData));
            window.location.href = "/transaction/transactionOutboundHistorySend?step=2";
        }
    })

    /**
     * 이하 Sender 검색, Beneficiary, DataTable 관련 코드 (중복 제거)
     */
    $("#senderSearchButton").on("click", async function () {
        const searchField = $("#SenderSearchFieldSelect").val();
        const keyword = $("#senderSearchInput").val().trim();
        const size = 10; // 페이지 사이즈

        if (!keyword) {
            alert("Please enter a search term.");
            return;
        }

        try {
            mappedSenders = await loadPage(0, searchField, keyword, size);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    });

    /**
     * "Select" 버튼 클릭 시 Sender 정보 반영
     */
    $(document).on("click", "#searchResultsTable .btn-primary", function () {
        const selectedId = $(this).data("id");
        const selectedSender = mappedSenders.find(s => s.id === selectedId);
        if (!selectedSender) return;

        $("#senderId").val(selectedSender.id);
        $("#customerIdString").val(selectedSender.customerId);
        $("#senderName")
            .val(`${unescapeSpecialCharacters(selectedSender.fullName)} ${selectedSender.optionName && selectedSender.optionName !== "" ? ` | ${unescapeSpecialCharacters(selectedSender.optionName)}` : ""} (${unescapeSpecialCharacters(selectedSender.customerId)})`)
            .css({
                width: "150px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            });
        $("#phoneNumber").val(unescapeSpecialCharacters(selectedSender.mobile) || "N/A");
        $("#addressSender").val(unescapeSpecialCharacters(selectedSender.address) || "N/A");
        $("#gender").val(unescapeSpecialCharacters(selectedSender.gender) || "N/A");
        $("#senderNationality").val(unescapeSpecialCharacters(selectedSender.nationality) || "N/A");
        $("#customerType").val(unescapeSpecialCharacters(selectedSender.customerType) || "N/A");
        fetchBeneficiaries(selectedSender.id);
        importBeneficiaryHistory(selectedSender.id);
        $("#searchResultsContainer").addClass("d-none");
        $("#beneficiaryFieldset").show();

        removeBeneficiaryInfo();
    });

    if ($("#senderId").val()) {
        fetchBeneficiaries($("#senderId").val());
        importBeneficiaryHistory($("#senderId").val());
    }

    $("#senderSearchFieldSelect, #senderSearchSelect").on("click", function () {
        let selectizeInstance = $('#senderSearchSelect')[0]?.selectize;
        if (selectizeInstance) {
            selectizeInstance.clear();
            selectizeInstance.clearOptions();
        }
    });

    /**
     * Beneficiry Outbound History 조회
     */
    const beneficiaryHistoryContentTable =  $('#beneficiaryHistoryContent table').DataTable({
        searching: false,
        serverSide: true,
        processing: true,
        rowId: "transactionId",
        data: [],
        columns: [
            {data: "transactionId", title: "Tran ID"},
            {
                data: "beneficiaryName", title: "Beneficiary's Name",
                render: function (data) {
                    return `<p class="m-0 text-truncate" style="width: 180px">${data}</p>`;
                }
            },
            {
                data: "type", title: "Type", width: "150px",
                render: function (data) {
                    if (!data) return "";
                    return data.toLowerCase().replace(/_/g, " ").replace(/\b[a-z]/g, letter => letter.toUpperCase());
                }
            },
            {data: "countryName", title: "Country", width: "150px"},
            {data: "collected", title: "Collected"},
            {data: "received", title: "Received"},
            {data: "fee", title: "Fee"},
            {
                data: "transactionDate", title: "TXN Date",
                render: function (data) {
                    if (!data) return "";
                    return  moment(data).format("yyyy-mm-dd hh:mm:ss");
                }
            },
            {data: 'country', visible: false}
        ],
        autoWidth: false,
        select: true,
        columnDefs: [{targets: [2, 3, 4], width: "150px"}]
    });

    $(document).on("click", ".select-beneficiary-btn", function () {
        const beneficiaryDataEncoded = $(this).attr("data-beneficiary");
        const rowDataEncoded = $(this).attr("data-row");
        if (!beneficiaryDataEncoded) return;

        const b = JSON.parse(decodeURIComponent(beneficiaryDataEncoded));
        const r = JSON.parse(decodeURIComponent(rowDataEncoded));
        $("#beneficiaryId").val(b.id);
        $("#beneficiaryName").val(`
            ${b.beneficiaryName?.lastName || ""}
            ${b.beneficiaryName?.middleName || ""}
            ${b.beneficiaryName?.firstName || ""}
        `);
        $("#beneficiaryRegistrationType").val(b.chooseType || "");
        $("#beneficiaryGender").val(b.chooseType || "");
        $("#beneficiaryMobile").val(b.gender || "");
        $("#beneficiaryNationality").val(b.nationality || "");
        $("#beneficiaryAddress").val(b.beneficiaryAddress || "");
        $("#beneficiaryIdType").val(b.idType || "");
        $("#beneficiaryIdNumber").val(b.idNumber || "");
        $("#beneficiaryPayoutPartner").val(r.idNumber || "");
    });

    $("#senderSearchFieldSelect, #senderSearchSelect").on("click", function () {
        let selectizeInstance = $('#senderSearchSelect')[0]?.selectize;
        if (selectizeInstance) {
            selectizeInstance.clear();
            selectizeInstance.clearOptions();
        }
    });

    beneficiaryHistoryContentTable.off('click', 'tbody tr').on('click', 'tbody tr', function () {
        const rowData = beneficiaryHistoryContentTable.row(this).data();

        if (rowData) {
            const beneficiary = rowData.beneficiary;
            $("#receiverFieldset").show();
            $("#beneficiaryId").val(rowData.id);
            $("#beneficiaryName").val(`${beneficiary.name.lastName} ${beneficiary.name.middleName} ${beneficiary.name.firstName}`);
            $("#beneficiaryRegistrationType").val(beneficiary.registrationType);
            $("#beneficiaryMobile").val(beneficiary.phone);
            $("#beneficiaryNationality").val(beneficiary.nationality);
            $("#beneficiaryGender").val(beneficiary.gender);
            $("#beneficiaryIdType").val(beneficiary.idType);
            $("#beneficiaryIdNumber").val(beneficiary.idNumber);
            $("#beneficiaryAddress").val(beneficiary.address);
            $("#beneficiaryPayoutPartner").val(rowData.payoutPartner);

            const beneficiaryPayoutType = [
                `Payout Type: ${rowData.payoutType.replace(/_/g, " ")}`,
            ];
            const bankName = `Payout Bank:  ${rowData.payoutBankName}`
            const branchName = `Payout Branch:  ${rowData.payoutBranchName || ""}`
            const accountNumber = `Account Number:  ${rowData.accountNumber || ""}`
            const isTranglo = rowData.payoutPartnerType === 'TRANGLO';
            if (rowData.payoutType === 'ACCOUNT_DEPOSIT') {
                beneficiaryPayoutType.push(bankName, branchName, accountNumber);
            } else if (rowData.payoutType === 'CASH_PAYMENT') {
                if (isTranglo) {
                    beneficiaryPayoutType.push(bankName, branchName);
                } else {
                    beneficiaryPayoutType.push(branchName);
                }
            } else if (rowData.payoutType === 'E_WALLET') {
                if (isTranglo) {
                    beneficiaryPayoutType.push(bankName, accountNumber);
                }
            }
            $("#beneficiaryPayoutInfo").val(beneficiaryPayoutType.join(" | ").replaceAll("null", "-"));
            
            $("#beneficiaryRelation").val(rowData.relationName);
            $("#beneficiaryTransactionReason").val(rowData.transactionReasonName);
            $("#beneficiaryIncomeSource").val(rowData.incomeSourceName);

            if (pathname.includes("transaction")) {
                $("#remittanceFieldset").show();
                $("#allowButton").show();
                $("#paymentType").val(rowData.payoutType);
                $("#payoutPartnerId").val(rowData.payoutPartnerId);
                $("#bank").val(rowData.payoutBankCode);
                $("#bankId").val(rowData.payoutBankId);
                $("#bankName").val(rowData.payoutBankName);
                $("#accountNo").val(rowData.accountNumber);
                $("#branch").val(rowData.payoutBranchCode);
                $("#branchName").val(rowData.payoutBranchName);
            }

            bootstrap.Modal.getInstance(document.getElementById('beneficiaryManagement')).hide();
            const modal = bootstrap.Modal.getInstance(document.getElementById('beneficiaryManagement'));
            modal.hide();
        }
    });

    /**
     * Confirm 페이지 최종 전송
     */
    if (step === '2') {
        const requestDataString = sessionStorage.getItem("requestData");
        if (!requestDataString) {
            alert("Please enter data on the previous page.");
            window.location.href = "/transaction/transactionOutboundHistorySend?step=1";
            return;
        }
        const requestData = JSON.parse(requestDataString);
        getDecimalPlacesForCurrency(requestData.currency || "USD");
        const currency = requestData.currency

        // senderName과 customerId를 합쳐서 보여줌
        $("#customerIdString").val(requestData.customerId);
        $("#senderName").text(
            requestData.senderName && requestData.customerId
                ? `${requestData.senderName} (${requestData.customerId})`
                : ""
        );
        $("#senderNationality").text(requestData.senderNationality || "");
        $("#senderMobile").text(requestData.senderMobile || "");
        $("#senderGender").text(requestData.senderGender || "");
        $("#senderAddress").text(requestData.senderAddress || "");
        $("#customerType").text(requestData.senderCustomerType || "");

        $("#beneficiaryName").text(requestData.beneficiaryName || "");
        $("#beneficiaryNationality").text(requestData.beneficiaryNationality || "");
        $("#beneficiaryPhone").text(requestData.mobile || "");
        $("#beneficiaryGender").text(requestData.beneficiaryGender || "");
        $("#beneficiaryAddress").text(requestData.address || "");

        const beneficiaryTableBody = document.querySelector("#beneficiaryTable > tbody");
        if (requestData.payment === "ACCOUNT_DEPOSIT") {
            const newRow = `
            <tr>
                <th class="col-2 table-light">Payout Bank</th>
                <td id="beneficiaryPayoutBankName">${requestData.bankName}</td>
                <input type="hidden" id="beneficiaryPayoutBank" value="${requestData.bank}">
                <th class="col-2 table-light">Payout Branch</th>
                <td id="beneficiaryPayoutBranchName">${requestData.branchName || ""}</td>
                <input type="hidden" id="beneficiaryPayoutBranch" value="${requestData.branch}">
            </tr>
            <tr>
                <th class="col-2 table-light">A/C No.</th>
                <td id="beneficiaryAC">${requestData.accountNo}</td>
            </tr>`;

            beneficiaryTableBody.insertAdjacentHTML("beforeend", newRow);
        } else if (requestData.payment === "CASH_PAYMENT") {
            const newRow = `
            <tr>
                <th class="col-2 table-light">Payout Branch</th>
                <td id="beneficiaryPayoutBranchName">${requestData.branchName || ""}</td>
                <input type="hidden" id="beneficiaryPayoutBranch" value="${requestData.branch}">
            </tr>
            <tr>
                <th className="col-2 table-light">ID Type</th>
                <td id="beneficiaryIDType">${requestData.idType}</td>
                <th className="col-2 table-light">ID Number</th>
                <td id="beneficiaryIDNumber">${requestData.idNumber}</td>
            </tr>
           `;

            beneficiaryTableBody.insertAdjacentHTML("beforeend", newRow);
        }

        $("#transferAmount").text(`${formatNumberWithCommasCurrency(requestData.transferAmount, 'JPY')}`);
        $("#payoutAmount").text(`${formatNumberWithCommasCurrency(requestData.payoutAmount, currency)}`);
        $("#serviceCharge").text(`${formatNumberWithCommasCurrency(requestData.totalCharge, 'JPY')}`);
        $("#customerRate").text(`1 JPY = ${formatNumberWithCommasCurrency(requestData.customerRate, currency)}`); // 숫자로도 처리 가능
        $("#collectedAmount").text(`${formatNumberWithCommasCurrency(requestData.collectedAmount, 'JPY')}`);
        $("#receiveAmount").text(`${formatNumberWithCommasCurrency(requestData.receiveAmount, currency)}`);
        $("#purposeOfRemittance").text(requestData.purposeOfRemittance || "");
        $("#sourceOfIncome").text(requestData.sourceOfIncome || "");
        $("#RelToBeneficiary").text(requestData.relationToBeneficiary || "");

        $("#backButton").off("click").on("click", function (event) {
            event.preventDefault();

            sessionStorage.setItem("reloadData", JSON.stringify(requestData));
            window.location.href = "/transaction/transactionOutboundHistorySend?step=1";
        });

        const createData = {
            customerId: requestData.customerId,
            depositType: requestData.depositType,
            depositMethod: requestData.depositMethod,
            transferAmount: requestData.transferAmount,
            customerRate: requestData.customerRate,
            payoutAmount: requestData.payoutAmount,
            receiveAmount: requestData.receiveAmount,
            totalCharge: requestData.totalCharge,
            collectedAmount: requestData.collectedAmount,
            beneficiaryId: requestData.beneficiaryId,
            remark: requestData.remark,
            newAccount: requestData.newAccount,
        };

        /**
         * Transaction 생성
         */
        let isRequestInProgress = false;
        $("#finalSaveButton").off("click").on("click", function (event) {
            event.preventDefault();
            if (isRequestInProgress) return;
            isRequestInProgress = true;
            $("#loadingSpinner").show();
            $.ajax({
                type: "POST",
                url: "/transaction/transactionOutboundHistorySend/",
                contentType: "application/json",
                data: JSON.stringify(createData),
                xhrFields: {
                    withCredentials: true
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(header, token);
                },
                success: function (response) {
                    alert("Data has been transmitted successfully.");
                    sessionStorage.removeItem("requestData");
                    sessionStorage.setItem("txnId", JSON.stringify(response));
                    window.location.href = "/transaction/transactionOutboundHistorySend?step=3";
                },
                error: function (xhr, status, error) {
                    console.error("에러:", error);
                    console.error("상태 코드:", xhr.status);
                    console.error("응답 텍스트:", xhr.responseText);
                    const res = JSON.parse(xhr.responseText);
                    alert(res.message || "An error occurred while transmitting data.");
                },
                complete: function () {
                    $("#loadingSpinner").hide();
                    isRequestInProgress = false;
                }
            });
        });
    }

    /**
     * 이전 스텝으로 돌아갔을 때 데이터를 불러오는 메소드
     */
    function reloadSecondStepData() {

        $("#beneficiaryFieldset").show();
        $("#remittanceFieldset").show();
        $("#allowButton").show();

        const requestDataString = sessionStorage.getItem("reloadData");

        if (requestDataString) {
            const requestData = JSON.parse(requestDataString);
            $("beneficiaryId").val(requestData.beneficiaryId);

            $("#senderId").val(requestData.senderNationality || "");
            $("#customerIdString").val(requestData.customerId || "");
            $("#senderName")
                .val(`${requestData.senderName} (${requestData.customerId})`)
                .css({
                    width: "150px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                });
            $("#senderNationality").val(requestData.senderNationality || "");
            $("#phoneNumber").val(requestData.senderMobile || "");
            $("#gender").val(requestData.senderGender || "");
            $("#addressSender").val(requestData.senderAddress || "");
            $("#customerType").val(requestData.senderCustomerType || "");
            $("#depositType").val(requestData.depositType || "");
            $("#depositMethod").val(requestData.depositMethod || "");

            $("#beneficiaryId").val(requestData.beneficiaryId || "");
            $("#beneficiaryName").val(requestData.beneficiaryName || "");
            $("#beneficiaryNationality").val(requestData.beneficiaryNationality || "");
            $("#beneficiaryAddress").val(requestData.address || "");
            $("#beneficiaryMobile").val(requestData.mobile || "");
            $("#beneficiaryGender").val(requestData.beneficiaryGender || "");
            $("#beneficiaryRegistrationType").val(requestData.chooseType || "");

            $("#paymentType").val(requestData.payment || "");
            $("#payoutPartnerId").val(requestData.partnerId || "");
            $("#beneficiaryPayoutPartner").val(requestData.beneficiaryPayoutPartner || "");
            $("#bank").val(requestData.bank || "");
            $("#bankId").val(requestData.bankId || "");
            $("#bankName").val(requestData.bankName || "");
            $("#accountNo").val(requestData.accountNo || "");
            $("#branch").val(requestData.branch || "");
            $("#branchName").val(requestData.branchName || "");

            anTransferAmount.set(requestData.transferAmount || 0);
            $("#transferAmount").trigger("input");

            $("#remark").val(requestData.remark || "");
            $("#beneficiaryTransactionReason").text(requestData.purposeOfRemittance || "");
            $("#beneficiaryIncomeSource").text(requestData.sourceOfIncome || "");
            $("#beneficiaryRelation").text(requestData.relationToBeneficiary || "");

            $("#beneficiaryIdType").text(requestData.idType || "");
            $("#beneficiaryIdNumber").text(requestData.idNumber || "");
            $("#beneficiaryPayoutInfo").text(requestData.beneficiaryPayoutInfo || "");

            sessionStorage.removeItem("reloadData");
        }
    }

    /**
     * 최종 확인된 거래 내역 인쇄
     */
    $('#outboundSendPrintButton').on("click", function () {
        const requestTxnIdString = sessionStorage.getItem("txnId");

        if (requestTxnIdString) {
            const requestTxnId = JSON.parse(requestTxnIdString);
            const transactionId = requestTxnId.txnId;
            sessionStorage.removeItem("txnId");

            window.location.href = `/transaction/transactionOutboundHistoryDetail/${transactionId}?print=true`;
        } else {
            console.error('transactionId가 URL에서 추출되지 않았습니다.');
        }
    })

    function initAutonumeric() {
        $("#transferAmount").val("");
        $("#payoutAmount").val("");
        $("#receiveAmount").val("");
        $("#collectedAmount").val("");
        $("#serviceCharge").val("");
        $("#customerRate").val("");

        anTransferAmount.set(0);
        anCustomerRate.set(0);
        anPayoutAmount.set(0);
        anServiceCharge.set(0);
        anCollectedAmount.set(0);
        anReceiveAmount.set(0);
    }

});
