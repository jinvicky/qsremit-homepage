$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    $.ajaxSetup({
        headers: {
            "Content-Type": "application/json"
        },
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(header, token);
            $("#loadingSpinner").show();
        },
        complete: function () {
            $("#loadingSpinner").hide();
        }
    })

    /**
     * 전역 변수 및 URL 파라미터 설정
     */
    const transactionId = new URLSearchParams(window.location.search).get("id");
    let customerId;
    let beneficiaryId;
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

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('sv-SE').replace('T', ' ');
    }

    function formatFullAddress(addr) {
        if (!addr) return '';
        const {zipcode = '', street = '', streetJp = '', city = '', cityJp = '', state = ''} = addr;
        return [`〒${zipcode}`, street, streetJp, city, cityJp, state].filter(Boolean).join(' ');
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

    // \u2705 초기엔 전부 decimalPlaces:0로 설정 (임시)
    anTransferAmount = initAutoNumeric("#transferAmount", {
        digitGroupSeparator: ",",
        decimalCharacter: ".",
        decimalPlaces: 0,
    });
    anCustomerRate = initAutoNumeric("#customerRate", {
        digitGroupSeparator: ",",
        decimalCharacter: ".",
        decimalPlaces: 10,
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
            sessionStorage.setItem("partnersCountry", JSON.stringify(data.countryToPartners));
            sessionStorage.setItem("purposeOfRemittances", JSON.stringify(data.purposeOfRemittances));
            sessionStorage.setItem("relationToBeneficiaries", JSON.stringify(data.relationToBeneficiaries));
            sessionStorage.setItem("sourceOfIncomes", JSON.stringify(data.sourceOfIncomes));

            SelectBox("#depositType", data.depositBranchesNames, "#depositTypeInput");
            SelectBox("#depositMethod", data.depositMethods, "#depositMethodInput");
            SelectBox("#partnerNationality", Object.keys(data.countryToPartners).sort(), "#dpartnerNationalityInput", "Select the receiving country");
            SelectBoxByMap("#nationalitySelect", data.countries, "#nationality", "Select the nationality of the receiver");
            SelectBoxByMap("#transactionReason", data.purposeOfRemittances, "#transactionReasonInput");
            SelectBoxByMap("#relation", data.relationToBeneficiaries, "#relationInput");
            SelectBoxByMap("#incomeSource", data.sourceOfIncomes, "#incomeSourceInput");
            SelectBoxByMap("#gmeReasons", data.gmeReasons, "#gmeReasonsInput");

            loadDetailData();
        },
        error: function () {
            alert("Failed to fetch data.");
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

    /**
     * Detail 데이터 로딩
     */
    function loadDetailData() {
        $.ajax({
            url: `/api/transaction/detail/${transactionId}`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                globalData = data;
                console.log(data)

                customerId = data.customer.customerId;
                fetchBeneficiaries(data.customer.id);
                importBeneficiaryHistory(data.customer.id);
                $("#beneficiaryButton").removeClass("d-none").show();

                beneficiaryId = data.beneficiary.id;

                $("#transactionDate").html(formatTimestamp(data.transactionDate));
                $("#transactionStatus").html(data.status);
                $("#transactionId").html(data.txnId);
                $("#transferAgency").html(data.depositMethod || 'N/A');

                $("#senderName").html(data.customer.senderName);
                $("#senderMobile").html(data.customer.contact || '');
                $("#senderAddress").html(formatFullAddress(data.customer.address));
                $("#senderNationality").html(data.customer.nationality || '');
                $("#senderGender").html(data.customer.gender || '');
                $("#senderId").val(data.customer.id);
                $("#customerIdString").val(data.customer.customerId);

                $("#payoutCountrySelect").val(data.payoutCountry || "").trigger("change");
                $("#typeSelect").val(data.payoutId || "").trigger("change");

                $("#depositType").val(unescapeSpecialCharacters(data.depositType) || "");
                $("#depositMethod").val(unescapeSpecialCharacters(data.depositMethod) || "");
                $("#remark").val(unescapeSpecialCharacters(data.remark) || '');

                if (data.beneficiary) {
                    const rowData = data.beneficiary;

                    $("#beneficiaryId").val(rowData.id);
                    $("#beneficiaryName").val(`${rowData.beneficiaryName.lastName} ${rowData.beneficiaryName.firstName} ${rowData.beneficiaryName.middleName}`);
                    $("#beneficiaryRegistrationType").val(rowData.chooseType);
                    $("#beneficiaryMobile").val(rowData.mobile);
                    $("#beneficiaryNationality").val(rowData.nationality);
                    $("#beneficiaryGender").val(rowData.gender);
                    $("#beneficiaryIdType").val(rowData.idType);
                    $("#beneficiaryIdNumber").val(rowData.idNumber);
                    $("#beneficiaryAddress").val(rowData.address);
                    $("#beneficiaryPayoutPartner").val(data.payoutPartnerName);

                    const beneficiaryPayoutType = [
                        `Payout Type: ${rowData.payoutType.replace(/_/g, " ")}`,
                    ];
                    const branchName = `Payout Branch:  ${rowData.payoutBranchName}`
                    if (rowData.payoutType == 'ACCOUNT_DEPOSIT') {
                        const bankName = `Payout Bank:  ${rowData.payoutBankName}`
                        const accountNumber = `Account Number:  ${rowData.accountNumber}`
                        beneficiaryPayoutType.push(bankName, branchName, accountNumber)
                    } else if (rowData.payoutType == 'CASH_PAYMENT') {
                        beneficiaryPayoutType.push(branchName)
                    }
                    $("#beneficiaryPayoutInfo").val(beneficiaryPayoutType.join(" | ").replaceAll("null", "-"));

                    $("#beneficiaryRelation").val(data.relationToBeneficiary);
                    $("#beneficiaryTransactionReason").val(data.purposeOfRemittance);
                    $("#beneficiaryIncomeSource").val(data.sourceOfIncome);
                }

                anTransferAmount.set(data.transferAmount || 0);
                console.log("data.customerRatedata.customerRate", data.customerRate)
                anCustomerRate.set(data.customerRate || 0);
                anReceiveAmount.set(data.receiveAmount || 0);
                anPayoutAmount.set(data.payoutAmount || 0);
                anServiceCharge.set(data.totalCharge || 0);
                anCollectedAmount.set(data.collectedAmount || 0);

                $("#remark").text(unescapeSpecialCharacters(data.remark) || "");
                $("#purposeOfRemittance").val(unescapeSpecialCharacters(data.purposeOfRemittance) || "");
                $("#sourceOfIncome").val(unescapeSpecialCharacters(data.sourceOfIncome) || "");
                $("#relToBeneficiary").val(unescapeSpecialCharacters(data.relationToBeneficiary) || "");

                $("#branch").val(data.branch || "");
                $("#idType").val(data.idType || "");
                $("#idNumber").val(data.idNumber || "");

                $("#paymentType").val(data.payment);
                $("#payoutPartnerId").val(data.payoutId);
                $("#bank").val(data.payoutType);
                // $("#bankId").val(data.payoutPartnerId);
                $("#bankName").val(data.bankName);
                $("#accountNo").val(data.accountNo);
                // $("#branch").val(data.payoutType);
                $("#branchName").val(data.branchName);
            },
            error: function (err) {
                console.error("❌ 거래 정보 조회 실패:", err);
                alert("거래 정보를 불러오지 못했습니다.");
            }
        });

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
        const customerRateValue = anCustomerRate ? anCustomerRate.getNumber() : 0;
        const payoutAmountValue = anPayoutAmount ? anPayoutAmount.getNumber() : 0;
        const receiveAmountValue = anReceiveAmount ? anReceiveAmount.getNumber() : 0;
        const serviceChargeValue = anServiceCharge ? anServiceCharge.getNumber() : 0;
        const collectedAmountValue = anCollectedAmount ? anCollectedAmount.getNumber() : 0;

        if (transferAmountValue > singleTransactionLimit) {
            alert('Single transaction limit of 1,000,000 yen exceeded.')
            return
        }

        const updateDto = {
            customerId: customerId,
            depositType: $("#depositType").val() || null,
            depositMethod: $("#depositMethod").val() || null,
            transferAmount: parseFloat(transferAmountValue),
            customerRate: parseFloat(customerRateValue),
            payoutAmount: parseFloat(payoutAmountValue),
            receiveAmount: parseFloat(receiveAmountValue),
            totalCharge: parseFloat(serviceChargeValue),
            collectedAmount: parseFloat(collectedAmountValue),
            beneficiaryId: $("#beneficiaryId").val() || null,
            remark: $("#remark").val() || "",
            newAccount: newAccount
        };

        $.ajax({
            url: `/api/transaction/waiting/${transactionId}`,
            method: "PUT",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(updateDto),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function (response) {
                alert("Successfully updated");
                window.location.href = `/transaction/transactionOutboundHistoryDetail/${transactionId}`;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("업데이트 실패:", textStatus, errorThrown);
                alert("An error occurred while updating.");
            }
        });
    })

    /**
     * 이하 Sender 검색, Beneficiary, DataTable 관련 코드 (중복 제거)
     */
    if ($("#senderId").val()) {
        fetchBeneficiaries($("#senderId").val());
        importBeneficiaryHistory($("#senderId").val());
    }

    /**
     * Beneficiry Outbound History 조회
     */
    const beneficiaryHistoryContentTable = $('#beneficiaryHistoryContent table').DataTable({
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
                    return moment(data).format("yyyy-mm-dd hh:mm:ss");
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
            const branchName = `Payout Branch:  ${rowData.payoutBranchName}`
            if (rowData.payoutType == 'ACCOUNT_DEPOSIT') {
                const bankName = `Payout Bank:  ${rowData.payoutBankName}`
                const accountNumber = `Account Number:  ${beneficiary.accountNumber}`
                beneficiaryPayoutType.push(bankName, branchName, accountNumber)
            } else if (rowData.payoutType == 'CASH_PAYMENT') {
                beneficiaryPayoutType.push(branchName)
            }
            $("#beneficiaryPayoutInfo").val(beneficiaryPayoutType.join(" | ").replaceAll("null", "-"));

            $("#beneficiaryRelation").val(rowData.relationName);
            $("#beneficiaryTransactionReason").val(rowData.transactionReasonName);
            $("#beneficiaryIncomeSource").val(rowData.incomeSourceName);

            if (pathname.includes("transaction")) {
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

    let prevSelectedText = $('#typeSelect').find('option:selected').text().trim();

    /**
     * GME Bank를 선택했을 경우, gme의 송금 reason 내용을 purposeOfRemittance에 표시하도록 하는 메소드
     */
    $('#typeSelect').on('change', function () {

        const selectedText = $(this).find('option:selected').text().trim();

        if (selectedText === 'GME Bank' && prevSelectedText !== selectedText) {
            const hiddenOptions = $('#gmeReason').html();
            $('#purposeOfRemittance').html(hiddenOptions);
            $('#purposeOfRemittance').val('');
        } else if (selectedText !== prevSelectedText && prevSelectedText === 'GME Bank') {
            // GME Bank가 아닌 경우
            const hiddenOptions = $('#purposeOfRemittanceData').html();
            $('#purposeOfRemittance').html(hiddenOptions);
            $('#purposeOfRemittance').val('');
        }
        prevSelectedText = selectedText;
    });

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
