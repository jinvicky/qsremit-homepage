$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');

    // ------------------------------
    // 전역 변수 및 URL 파라미터 설정
    // ------------------------------
    let mappedSenders = [];
    let countryToPartners;
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step') || '1';
    let currencyDecimalMap = {};

    // 통화 자릿수 정보를 서버에서 로드
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

    // 통화별 소수점 자리수 설정 함수
    function getDecimalPlacesForCurrency(currency) {
        return currencyDecimalMap[currency] ?? 2;
    }

    // Sender 이름에서 고객ID와 이름을 분리하는 함수
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

    // AutoNumeric 초기화 (입력 페이지: step 1)
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
    }

    // ------------------------------
    // typeSelect -> 파트너 통화 업데이트
    // ------------------------------
    $("#typeSelect").on("change", function () {
        const selectTypeId = $(this).val();
        $("#payoutPartner").val(selectTypeId);
        if (!selectTypeId) {
            disablePaymentType();
            return;
        }
        getPayoutType(selectTypeId)
    });

    if ($("#payoutPartner").val()) {
        getPayoutType($("#payoutPartner").val())
    }

    function getPayoutType(selectTypeId) {
        $.ajax({
            type: "GET",
            url: `/transaction/transactionOutboundHistorySend/${selectTypeId}`,
            dataType: "json",
            success: function (res) {
                if (Array.isArray(res)) {
                    // 파트너 통화(단일)
                    const partnerCurrency = res[0]?.currency || "USD";
                    $(".currency-code").text(partnerCurrency);

                    // 선택된 통화 코드에 맞는 소수점 자릿수를 구함
                    const decPlaces = getDecimalPlacesForCurrency(partnerCurrency);

                    // \u2705 ServiceCharge / CollectedAmount는 sourceCurrency 기준(Always JPY=0)라 가정 -> 여기서는 건드리지 않음
                    // \u2705 나머지 필드만 partnerCurrency로 업데이트
                    /*	if (anTransferAmount) anTransferAmount.update({ decimalPlaces: decPlaces });*/
                    if (anCustomerRate) anCustomerRate.update({decimalPlaces: decPlaces});
                    if (anReceiveAmount) anReceiveAmount.update({decimalPlaces: decPlaces});
                    if (anPayoutAmount) anPayoutAmount.update({decimalPlaces: decPlaces});

                    // 차후에 동적으로 반영할 때 적용될 코드
                    const allowedTypes = res.map(item => item.payoutType);

                    $("#paymentType option").each(function () {
                        const val = $(this).val();
                        if (allowedTypes.includes(val)) {
                            $(this).css("color", "black").prop("disabled", false);
                        } else {
                            $(this).css("color", "gray").prop("disabled", true);
                        }
                    });

                    $("#paymentType").prop("disabled", false);
                    $("#paymentTypeHelper").hide();
                    $("#customerRate").prop("readonly", true);
                    updateBankList(res);
                } else {
                    console.error("응답 데이터가 배열 형식이 아닙니다:", res);
                    disablePaymentType();
                }
            },
            error: function (err) {
                console.error("Error fetching data:", err);
                disablePaymentType();
            },
        });
    }

    // ------------------------------
    // 은행, 브랜치 정보 변동
    // ------------------------------
    $("#bank-branch").on("change", function () {
        $("#bankBranchInput").val($(this).val())
    })

    // PaymentType 관련 이벤트
    $("#paymentType").on("change", function () {
        initAutonumeric();
        $("#paymentTypeInput").val($(this).val());
        togglePaymentFields($(this).val());
    }).on("click", function (e) {
        if ($(this).prop("disabled")) {
            e.preventDefault();
            $("#paymentTypeHelper").show();
        }
    }).on("focus", function () {
        $(this).prop("disabled") ? $("#paymentTypeHelper").show() : $("#paymentTypeHelper").hide();
    });

    disablePaymentType();

    if ($("#paymentTypeInput").val()) {
        togglePaymentFields($("#paymentTypeInput").val());
    }

    // ------------------------------
    // AJAX 호출: 초기 데이터 로딩 (국가별 파트너, Deposit, Remittance 등)
    // ------------------------------
    let sourceOfIncomes = [];
    let relationToBeneficiaries = [];
    if (step === '1') {

        $.ajax({
            type: "GET",
            url: "/transaction/transactionOutboundHistorySend/formOptions",
            success: function (data) {
                countryToPartners = Object.keys(data.countryToPartners)
                    .sort((a, b) => a.localeCompare(b, 'ko'))
                    .reduce((obj, key) => {
                        obj[key] = data.countryToPartners[key];
                        return obj;
                    }, {});
                $("#payoutCountrySelect").empty().append('<option value="">Select Country</option>');
                Object.keys(countryToPartners).forEach(function (country) {
                    $("#payoutCountrySelect").append(`<option ${$("#payoutCountry").val() == country ? 'selected' : ''} value="${country}">${country}</option>`);
                });

                SelectBox("#depositType", data.depositBranchesNames, "#depositTypeInput");
                SelectBox("#depositMethod", data.depositMethods, "#depositMethodInput");
                SelectBox("#purposeOfRemittanceData", data.purposeOfRemittances, "#purposeOfRemittanceInput");
                SelectBox("#purposeOfRemittance", data.purposeOfRemittances, "#purposeOfRemittanceInput");
                SelectBox("#sourceOfIncome", data.sourceOfIncomes, "#sourceOfIncomeInput");
                SelectBox("#relToBeneficiary", data.relationToBeneficiaries, "#relToBeneficiaryInput");
                SelectBox("#gmeReason", data.gmeReasons, "#purposeOfRemittanceInput");

                sourceOfIncomes = data.sourceOfIncomes;
                relationToBeneficiaries = data.relationToBeneficiaries;

                let options = '<option value="">Select</option>';
                data.countries.forEach(function (item) {
                    options += `<option ${$("#beneficiaryNationalityInput").val() == item.name ? 'selected' : ''} value="${item.name}">${item.name}</option>`;
                });
                $("#beneficiaryNationality").html(options);

                if ($("#payoutCountry").val()) {
                    getTypeOption($("#payoutCountry").val())
                }

                reloadSecondStepData();
            },
            error: function () {
                alert("**Failed to fetch data.");
            }
        });
        setupValidationListeners();
        handleChange("#depositType", "#depositTypeInput")
        handleChange("#depositMethod", "#depositMethodInput")
        handleChange("#purposeOfRemittance", "#purposeOfRemittanceInput")
        handleChange("#sourceOfIncome", "#sourceOfIncomeInput")
        handleChange("#relToBeneficiary", "#relToBeneficiaryInput")

        function handleChange(select, input) {
            $(select).on("change", function () {
                $(input).val($(this).val())
            })
        }

        $("#payoutCountrySelect").on("change", function () {
            const selectedCountry = $(this).val();
            $("#payoutCountry").val($(this).val())
            getTypeOption(selectedCountry)
            resetPaymentType();
        });

        function getTypeOption(selectedCountry) {
            const $typeSelect = $("#typeSelect");

            $typeSelect.empty().append('<option value="">Select Partner</option>');
            if (selectedCountry && countryToPartners[selectedCountry]) {
                countryToPartners[selectedCountry].forEach(({id, name, currencyCode}) => {
                    $typeSelect.append(`<option ${$("#payoutPartner").val() == id ? 'selected' : ''} value="${id}" data-currency="${currencyCode}">${name}</option>`);
                });
            } else {
                console.error("No partners found for selected country:", selectedCountry);
            }
        }

        // Transfer Amount debounce (서버에 전송)
        let transferDebounceTimer;
        let serviceChargeChange = false;
        const transferDebounceDelay = 1000;
        $("#transferAmount").on("input change", function () {
            calculateAmount(parseFloat(anTransferAmount.getNumber()), 0, 0);
        });
        $("#payoutAmount").on("input change", function () {
            calculateAmount(0, parseFloat(anPayoutAmount.getNumber()), 0);
        })
        $("#receiveAmount").on("input change", function () {
            calculateAmount(0, parseFloat(anReceiveAmount.getNumber()), 0);
        })
        $("#collectedAmount").on("input change", function () {
            calculateAmount(0, 0, parseFloat(anCollectedAmount.getNumber()));
        })
        $("#serviceCharge").on("input change", function () {
            calculateAmount(parseFloat(anReceiveAmount.getNumber()), parseFloat(anReceiveAmount.getNumber()), 0);
            serviceChargeChange = true;
        })

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
                const selectedTypeId = $("#typeSelect").val();
                if (!selectedTypeId) {
                    alert("Please select a type.");
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
                    payoutPartnerId: parseInt(selectedTypeId, 10),
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

        // ------------------------------
        // Beneficiary 관련 함수 (fetch & import)
        // ------------------------------
        handleChange("#beneficiaryNationality", "#beneficiaryNationalityInput")

        /**
         * 실시간 검증
         */
        function setupValidationListeners() {
            $("#phone").on("input", function () {
                const phoneValue = $(this).val().trim();
                const phoneRegex = /^[0-9]*$/; // ← 빈값도 허용

                const errorEl = $("#phone-error");

                if (!phoneRegex.test(phoneValue) || phoneValue === "") {
                    $(this).addClass("is-invalid");
                    errorEl.show();
                } else {
                    $(this).removeClass("is-invalid");
                    errorEl.hide();
                }
            });
        }
    }

    // ------------------------------
    // 최종 데이터 수집 및 sessionStorage 저장 (입력 페이지)
    // ------------------------------
    let newAccount = 'Y';
    const singleTransactionLimit = 1000000; // 100만엔
    $("form").on("submit", function (e) {
        e.preventDefault();

        const currency = $("#currencyCode").text() || "USD";
        const transferAmountValue = anTransferAmount ? anTransferAmount.getNumber() : 0;
        const customerRateValue = anCustomerRate ? anCustomerRate.getNumber() : 0;
        const payoutAmountValue = anPayoutAmount ? anPayoutAmount.getNumber() : 0;
        const receiveAmountValue = anReceiveAmount ? anReceiveAmount.getNumber() : 0;
        const serviceChargeValue = anServiceCharge ? anServiceCharge.getNumber() : 0;
        const collectedAmountValue = anCollectedAmount ? anCollectedAmount.getNumber() : 0;
        const selectedBankCode = $("#bank").val();
        const selectedBankName = $("#bank option:selected").text();
        const selectedBranch = $("#bank-branch").val();
        const selectedBranchName = $("#bank-branch option:selected").text();

        if (transferAmountValue > singleTransactionLimit) {
            alert('Single transaction limit of 1,000,000 yen exceeded.')
            return
        }

        // senderName 에서 고객 ID와 이름을 분리 (div 요소이므로 .text() 사용)
        const senderData = parseSenderField();
        const requestData = {
            partnerId: $("#typeSelect").val() || null,
            customerId: senderData.customerId || null,
            senderName: senderData.fullName || null,
            senderMobile: $("#phoneNumber").val() || null,
            senderGender: $("#gender").val() || null,
            senderAddress: $("#addressSender").val() || null,
            senderCustomerType: $("#customerType").val() || null,
            depositType: $("#depositType").val() || null,
            depositMethod: $("#depositMethod").val() || null,
            payment: $("#paymentType").val() || null,
            senderNationality: $("#senderNationality").val() || null,
            transferAmount: parseFloat(transferAmountValue),
            customerRate: $("#customerRate").val(),
            payoutAmount: parseFloat(payoutAmountValue),
            receiveAmount: parseFloat(receiveAmountValue),
            totalCharge: parseFloat(serviceChargeValue),
            collectedAmount: parseFloat(collectedAmountValue),
            remark: $("#remark").text() || "",
            purposeOfRemittance: $("#purposeOfRemittance").val() || null,
            sourceOfIncome: $("#sourceOfIncome").val() || null,
            relationToBeneficiary: $("#relToBeneficiary").val() || null,
            beneficiaryId: $("#beneficiaryId").val() || null,
            beneficiaryFirstName: $("#firstName").val() || "",
            beneficiaryMiddleName: $("#middleName").val() || "",
            beneficiaryLastName: $("#lastName").val() || "",
            beneficiaryGender: $("input[name='gender']:checked").val() || null,
            chooseType: $("input[name='chooseType']:checked").val() || null,
            beneficiaryNationality: $("#beneficiaryNationality").val() || null,
            address: $("#address").val() || "",
            mobile: $("#phone").val() || "",
            currency: currency,
            country: $("#payoutCountrySelect").val() || "",
            newAccount: newAccount,
            idType: $("#idType").val() || "",
            idNumber: $("#idNumber").val() || "",
        };

        if ($('#typeSelect').text().toLowerCase().includes("tranglo")
            && (!requestData.senderMobile || requestData.senderMobile === "N/A")) {
            alert("Tranglo Transaction must include Customer's Mobile Number.");
            return
        }

        // 거래 타입을 가져옴
        const paymentType = $("#paymentType").val();

        switch (paymentType) {
            case 'ACCOUNT_DEPOSIT':
                // 계좌 입금 관련 추가 필드들 추가
                requestData.bank = selectedBankCode;
                requestData.bankName = selectedBankName;
                requestData.accountNo = $("#accountNo").val() || "";
                requestData.branch = selectedBranch;
                requestData.branchName = selectedBranchName;
                break;
            case 'CASH_PAYMENT':
                // 현금 지급 관련 추가 필드들 추가
                requestData.bank = !isTrangloSelected() ? 'CASH_PAYMENT' : $("#trangloCashBank").val() || "";
                requestData.branch = $("#branch").val() || "";
                requestData.branchName = $("#branch option:selected").text() || "";
                requestData.idType = $("#idType").val() || "";
                requestData.idNumber = $("#idNumber").val() || "";
                break;
            default:
                break;
        }

        sessionStorage.setItem("requestData", JSON.stringify(requestData));
        window.location.href = "/transaction/transactionOutboundHistorySend?step=2";
    })


    // ------------------------------
    // 이하 Sender 검색, Beneficiary, DataTable 관련 코드 (중복 제거)
    // ------------------------------
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

    // "Select" 버튼 클릭 시 Sender 정보 반영
    $(document).on("click", "#searchResultsTable .btn-primary", function () {
        const selectedId = $(this).data("id");
        const selectedSender = mappedSenders.find(s => s.id === selectedId);
        if (!selectedSender) return;

        $("#senderId").val(selectedSender.id);
        $("#senderName")
            .val(`${unescapeSpecialCharacters(selectedSender.fullName)} (${unescapeSpecialCharacters(selectedSender.customerId)})`)
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
        $("#beneficiaryButton").removeClass("d-none").show();
        fetchBeneficiaries(selectedSender.id);
        importBeneficiaryHistory(selectedSender.id);
        $("#searchResultsContainer").addClass("d-none");

        removeBeneficiaryInfo();
    });

    if ($("#senderId").val()) {
        $("#beneficiaryButton").removeClass("d-none").show();
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
     * 조회해온 데이터 row에 반영
     */
    const beneficiaryHistoryTable = $('#beneficiaryHistoryContent table').DataTable({
        searching: false,
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
            // {data: "point", title: "Point", width: "150px"},
            {data: "countryName", title: "Country", width: "150px"},
            {data: "collected", title: "Collected"},
            {data: "received", title: "Received"},
            {data: "fee", title: "Fee"},
            {
                data: "transactionDate", title: "Transaction Date",
                render: function (data) {
                    if (!data) return "";
                    const dateObj = new Date(data);
                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    const hh = String(dateObj.getHours()).padStart(2, '0');
                    const mm = String(dateObj.getMinutes()).padStart(2, '0');
                    const ss = String(dateObj.getSeconds()).padStart(2, '0');
                    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
                }
            },
            {
                data: null, title: "Select", orderable: false, width: "50px",
                render: function (data, type, row) {
                    const beneficiaryData = encodeURIComponent(JSON.stringify(row.beneficiary));
                    return `
					<button type="button" data-bs-dismiss="modal"
							class="select-beneficiary-btn btn btn-sm btn-primary"
							data-beneficiary="${beneficiaryData}">
					 Select
					</button>`;
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
        if (!beneficiaryDataEncoded) return;

        const b = JSON.parse(decodeURIComponent(beneficiaryDataEncoded));
        $("#beneficiaryId").val(b.id);
        $("#firstName").val(b.beneficiaryName?.firstName || "");
        $("#middleName").val(b.beneficiaryName?.middleName || "");
        $("#lastName").val(b.beneficiaryName?.lastName || "");
        $("#phone").val(b.beneficiaryPhone || "");
        $("#address").val(b.beneficiaryAddress || "");
        $("#beneficiaryNationalityInput").val(b.nationality || "");
        $("#beneficiaryNationality").val(b.nationality || "");
        $("#idType").val(b.idType || "");
        $("#idNumber").val(b.idNumber || "");

        if (b.chooseType === "INDIVIDUAL") {
            $("#individual").prop("checked", true)
        } else if (b.chooseType === "COMPANY") {
            $("#company").prop("checked", true)
        }

        if (b.gender === "MALE") {
            $("#male").prop("checked", true);
        } else if (b.gender === "FEMALE") {
            $("#female").prop("checked", true);
        }

        if ($('#lastName').val()) {
            $('#lastName').parsley().reset();
        }
        if ($('#beneficiaryNationality').val()) {
            $('#beneficiaryNationality').parsley().reset();
        }
        if ($('#address').val()) {
            $('#address').parsley().reset();
        }
        if ($('#phone').val()) {
            $('#phone').parsley().reset();
        }
        if ($('#idType').val()) {
            $('#idType').parsley().reset();
        }
        if ($('#idNumber').val()) {
            $('#idNumber').parsley().reset();
        }
    });

    $("#senderSearchFieldSelect, #senderSearchSelect").on("click", function () {
        let selectizeInstance = $('#senderSearchSelect')[0]?.selectize;
        if (selectizeInstance) {
            selectizeInstance.clear();
            selectizeInstance.clearOptions();
        }
    });

    //-------------------------------
    //remark
    //-------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        const remarkEl = document.getElementById('remark');
        if (remarkEl) {
            remarkEl.addEventListener('input', function () {
                const errorSpan = document.getElementById('remark-error');
                if (this.value.length > 500) {
                    errorSpan.style.display = 'inline';
                } else {
                    errorSpan.style.display = 'none';
                }
            });
        } else {
            console.warn('ID "remark"');
        }
    });

    // ------------------------------
    //  Confirm 페이지 최종 전송
    // ------------------------------
    if (step === '2') {
        const requestDataString = sessionStorage.getItem("requestData");
        if (!requestDataString) {
            alert("Please enter data on the previous page.");
            window.location.href = "/transaction/transactionOutboundHistorySend?step=1";
            return;
        }
        const requestData = JSON.parse(requestDataString);
        console.log(requestData)
        const decPlaces = getDecimalPlacesForCurrency(requestData.currency || "USD");

        // senderName과 customerId를 합쳐서 보여줌
        $("#senderName").text(
            requestData.senderName && requestData.customerId
                ? `${requestData.senderName} (${requestData.customerId})`
                : ""
        );
        $("#senderNationality").text(requestData.senderNationality || "");
        $("#senderMobile").text(requestData.senderMobile || "");
        $("#senderGender").text(requestData.beneficiaryGender || "");
        $("#senderAddress").text(requestData.address || "");
        $("#customerType").text(requestData.chooseType || "");

        $("#beneficiaryName").text(
            `${requestData.beneficiaryFirstName} ${requestData.beneficiaryMiddleName} ${requestData.beneficiaryLastName}`
        );
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
                <th class="col-2 table-light">Account Number</th>
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


        $("#transferAmount").text(`${formatNumberWithCommas(requestData.transferAmount)}`);
        $("#payoutAmount").text(`${formatNumberWithCommas(requestData.payoutAmount)}`);
        $("#serviceCharge").text(`${formatNumberWithCommas(requestData.totalCharge)}`);
        $("#customerRate").text(`${formatNumberWithCommas(requestData.customerRate)}`); // 숫자로도 처리 가능
        $("#collectedAmount").text(`${formatNumberWithCommas(requestData.collectedAmount)}`);
        $("#receiveAmount").text(`${formatNumberWithCommas(requestData.receiveAmount)}`);
        $("#purposeOfRemittance").text(requestData.purposeOfRemittance || "");
        $("#sourceOfIncome").text(requestData.sourceOfIncome || "");
        $("#RelToBeneficiary").text(requestData.sourceOfIncome || "");

        if (isNumeric(requestData.sourceOfIncome)) {
            $('#sourceOfIncome').text(FindTranglo('#sourceOfIncome', requestData.sourceOfIncome));
        } else {
            $('#sourceOfIncome').text(requestData.sourceOfIncome || "");
        }
        if (isNumeric(requestData.relationToBeneficiary)) {
            $('#RelToBeneficiary').text(FindTranglo('#RelToBeneficiary', requestData.relationToBeneficiary));
        } else {
            $('#RelToBeneficiary').text(requestData.sourceOfIncome || "");
        }

        $("#backButton").off("click").on("click", function (event) {
            event.preventDefault();

            sessionStorage.setItem("reloadData", JSON.stringify(requestData));
            window.location.href = "/transaction/transactionOutboundHistorySend?step=1";
        });

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
                data: JSON.stringify(requestData),
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
                    alert("An error occurred while transmitting data.");
                },
                complete: function () {
                    $("#loadingSpinner").hide();
                    isRequestInProgress = false;
                }
            });
        });
    }

    // ------------------------------
    // 최종 확인된 거래 내역 인쇄
    // ------------------------------

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

    // 이전 스텝으로 돌아갔을 때 데이터를 불러오는 메소드
    function reloadSecondStepData() {
        const requestDataString = sessionStorage.getItem("reloadData");

        if (requestDataString) {
            const requestData = JSON.parse(requestDataString);
            $("beneficiaryId").val(requestData.beneficiaryId);


            console.log("Restoring data from sessionStorage", requestData);

            $("#payoutCountrySelect").val(requestData.country || "").trigger("change");
            $("#typeSelect").val(requestData.partnerId || "").trigger("change");

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

            $("#firstName").val(requestData.beneficiaryFirstName || "");
            $("#middleName").val(requestData.beneficiaryMiddleName || "");
            $("#lastName").val(requestData.beneficiaryLastName || "");
            $("#beneficiaryNationality").val(requestData.beneficiaryNationality || "");
            $("#address").val(requestData.address || "");
            $("#phone").val(requestData.mobile || "");
            $("input[name='gender'][value='" + (requestData.beneficiaryGender || "") + "']").prop("checked", true);
            $("input[name='chooseType'][value='" + (requestData.chooseType || "") + "']").prop("checked", true);

            $("#paymentType").val(requestData.payment || "").trigger("change");

            anTransferAmount.set(requestData.transferAmount || 0);
            $("#transferAmount").trigger("input");

            $("#remark").text(requestData.remark || "");
            $("#purposeOfRemittance").val(requestData.purposeOfRemittance || "");
            $("#sourceOfIncome").val(requestData.sourceOfIncome || "");
            $("#relToBeneficiary").val(requestData.relationToBeneficiary || "");

            $("#branch").val(requestData.branch || "");
            $("#idType").val(requestData.idType || "");
            $("#idNumber").val(requestData.idNumber || "");

            // `paymentType`에 따라 처리 분기
            selectBankAndBranch(requestData);

            sessionStorage.removeItem("reloadData");
        }
    }

    let prevSelectedText = $('#typeSelect').find('option:selected').text().trim();

    // GME Bank를 선택했을 경우, gme의 송금 reason 내용을 purposeOfRemittance에 표시하도록 하는 메소드
    $('#typeSelect').on('change', function () {
        const selectedText = $(this).find('option:selected').text().trim();

        if (selectedText === 'GME Bank' && prevSelectedText !== selectedText) {
            const hiddenOptions = $('#gmeReason').html();
            $('#purposeOfRemittance').html(hiddenOptions);
            $('#purposeOfRemittance').val('');
        } else if (isTrangloSelected()) {
            // Tranglo인 경우
            TrangloSelectBox("#sourceOfIncome", sourceOfIncomes, "#sourceOfIncomeInput");
            TrangloSelectBox("#relToBeneficiary", relationToBeneficiaries, "#relToBeneficiaryInput");
        } else if (selectedText !== prevSelectedText && prevSelectedText === 'GME Bank') {
            // 둘다 아닌 경우
            const hiddenOptions = $('#purposeOfRemittanceData').html();
            $('#purposeOfRemittance').html(hiddenOptions);
            $('#purposeOfRemittance').val('');
        }
        prevSelectedText = selectedText;
    });

    // 고객 검색 input 활성화 시 Enter 검색 이벤트 활성화
    $("#senderSearchInput").on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#senderSearchButton").trigger("click");
        }
    });
    $(document).on("keypress", function (e) {
        if (e.keyCode === 13 || e.which === 13) {
            e.preventDefault();
            $("#allowButton").trigger("click");
        }
    });

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

    function isNumeric(str) {
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }
    function FindTranglo(selector, data) {
        const source = ['11', '23', '7', '1', '2', '18', '3'];
        const rel = ['4', '9', '2', '5', '11', '16', '8', '5', '5', '3', '6', '1', '5'];
        const sourceName = ['Salary', 'Savings', 'Tax Return', 'Business Income', 'Loan(Borrow from others)',
            'Part time job', 'Pension'];
        const relName = ['Brother/Sister', 'Business Partner', 'Children', 'Cousin',
            'Employee', 'Employer', 'Friends/Acquaintance', 'GrandFather/GrandMother', 'Nephew/Niece',
            'Parents', 'Self', 'Spouse', 'Uncle/Auntie'];

        if (selector === '#sourceOfIncome') {
            return sourceName[source.indexOf(data)];
        }
        if (selector === '#RelToBeneficiary') {
            return relName[rel.indexOf(data)];
        }
    }
});
