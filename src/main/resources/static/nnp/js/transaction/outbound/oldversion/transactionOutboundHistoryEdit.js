$(document).ready(function () {
    const header = $("meta[name='_csrf_header']").attr('content');
    const token = $("meta[name='_csrf']").attr('content');
    // ------------------------------
    // 전역 변수 및 URL 파라미터 설정
    // ------------------------------
    const transactionId = new URLSearchParams(window.location.search).get("id");
    let customerId;
    let beneficiaryId;
    let countryToPartners;

    if (!transactionId) {
        alert("Transaction ID가 없습니다.");
        return;
    }

    // 통화 자릿수 정보를 서버에서 로드
    let currencyDecimalMap = {};
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

    function formatTimestamp(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('sv-SE').replace('T', ' ');
    }

    function formatFullAddress(addr) {
        if (!addr) return '';
        const {zipcode = '', street = '', streetJp = '', city = '', cityJp = '', state = ''} = addr;
        return [zipcode, street, streetJp, city, cityJp, state].filter(Boolean).join(' ');
    }

    // AutoNumeric 초기화
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
        minimumValue: "0",
        maximumValue: "9999999999",
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
    // 은행, 브랜치 정보
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

            loadDetailData();
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

    // ------------------------------
    // 이하 Sender 검색, Beneficiary, DataTable 관련 코드 (중복 제거)
    // ------------------------------

    /**
     * 조회해온 데이터 row에 반영
     * @type {jQuery|*}
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
            alert("Please select a bank.");
            return;
        } else if (type !== "2") {
            alert("Account Check currently supports only Himal accounts.");
            return;
        }

        if (!accountNumber) {
            alert("Please verify the account number.");
            return;
        }

        // 이름 조합 (빈 값 처리 포함)
        let beneficiaryName = [lastName, middleName, firstName]
            .filter(name => name && name.trim() !== '' && name.trim().toUpperCase() !== 'N/A')
            .join(' ');


        let req = {
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
                if (response.isValid) {
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

    // ------------------------------
    //  Detail 데이터 로딩
    // ------------------------------
    function loadDetailData() {

        $.ajax({
            url: `/api/transaction/detail/${transactionId}`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                globalData = data;

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

                $("#payoutCountrySelect").val(data.payoutCountry || "").trigger("change");
                $("#typeSelect").val(data.payoutId || "").trigger("change");

                $("#depositType").val(unescapeSpecialCharacters(data.depositType) || "");
                $("#depositMethod").val(unescapeSpecialCharacters(data.depositMethod) || "");
                $("#remark").val(unescapeSpecialCharacters(data.remark) || '');

                if (data.beneficiary) {
                    const b = data.beneficiary;

                    $("#firstName").val(unescapeSpecialCharacters(b.beneficiaryName.firstName) || '');
                    $("#middleName").val(unescapeSpecialCharacters(b.beneficiaryName.middleName) || '');
                    $("#lastName").val(unescapeSpecialCharacters(b.beneficiaryName.lastName) || '');
                    $("#phone").val(unescapeSpecialCharacters(b.mobile) || '');
                    $("#address").val(unescapeSpecialCharacters(b.address) || '');
                    $("#bank").val(unescapeSpecialCharacters(b.payoutBank) || '');
                    $("#beneficiaryNationality").val(unescapeSpecialCharacters(b.nationality) || "");

                    const gender = b.gender;
                    if (gender === 'MALE') $("#male").prop("checked", true);
                    else if (gender === "FEMALE") $("#female").prop("checked", true);
                    const regType = b.chooseType;
                    if (regType === "INDIVIDUAL") $("#individual").prop("checked", true);
                    else if (regType === 'COMPANY') $("#company").prop("checked", true);

                    $("#accountNo").val(unescapeSpecialCharacters(b.accountNumber) || '');
                }

                $("#paymentType").val(data.payment || "").trigger("change");

                anTransferAmount.set(data.transferAmount || 0);
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

                selectBankAndBranch(data);
            },
            error: function (err) {
                console.error("❌ 거래 정보 조회 실패:", err);
                alert("거래 정보를 불러오지 못했습니다.");
            }
        });

    }

    // ------------------------------
    // 최종 데이터 수집 및 저장
    // ------------------------------
    const singleTransactionLimit = 1000000; // 100만엔

    $("#updateTransaction").on("click", function (e) {
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

        //  화면의 값들을 DTO 형태로 구성
        //  CreateTransactionRequestDto 의 필드들과 동일하게 세팅
        const updateDto = {
            // 예시: 서버에서 요구하는 필드(수정 필요 시 아래 필드 참조)
            customerId: customerId, // 필요 시 세팅
            partnerId: $("#typeSelect").val(),
            payment: paymentType,

            // 화면에서 선택한 depositType, depositMethod
            depositType: $("#depositType").val(),
            depositMethod: $("#depositMethod").val(),

            // Beneficiary 정보
            beneficiaryId: beneficiaryId,
            beneficiaryFirstName: $("#firstName").val() || "",
            beneficiaryMiddleName: $("#middleName").val() || "",
            beneficiaryLastName: $("#lastName").val() || "",
            beneficiaryGender: $("input[name='gender']:checked").val() || null,
            chooseType: $("input[name='chooseType']:checked").val() || null,
            beneficiaryNationality: $("#beneficiaryNationality").val() || null,
            address: $("#address").val() || "",
            mobile: $("#phone").val() || "",

            // 금액 정보
            transferAmount: parseFloat(transferAmountValue),
            customerRate: $("#customerRate").val(),
            payoutAmount: parseFloat(payoutAmountValue),
            receiveAmount: parseFloat(receiveAmountValue),
            totalCharge: parseFloat(serviceChargeValue),
            collectedAmount: parseFloat(collectedAmountValue),
            currency: currency,

            // 기타 정보
            remark: $("#remark").val() || null,
            purposeOfRemittance: $("#purposeOfRemittance").val() || null,
            sourceOfIncome: $("#sourceOfIncome").val() || null,
            relationToBeneficiary: $("#relToBeneficiary").val() || null,

            // Roshan Digital Account Deposit Fields
            // RoshanDigitalAccountDepositBank: $("#RoshanDigitalAccountDepositBank").val() || null,
            // aNo: $("#aNo").val() || null
        };

        switch (paymentType) {
            case 'ACCOUNT_DEPOSIT':
                // 계좌 입금 관련 추가 필드들 추가
                updateDto.bank = selectedBankCode;
                updateDto.bankName = selectedBankName;
                updateDto.accountNo = $("#accountNo").val() || "";
                updateDto.branch = selectedBranch;
                updateDto.branchName = selectedBranchName;
                break;
            case 'CASH_PAYMENT':
                // 현금 지급 관련 추가 필드들 추가
                updateDto.bank = 'CASH_PAYMENT';
                updateDto.branch = $("#branch").val() || "";
                updateDto.branchName = $("#branch option:selected").text() || "";
                updateDto.idType = $("#idType").val() || "";
                updateDto.idNumber = $("#idNumber").val() || "";
                break;
            default:
                break;
        }

        // (2-2) PUT
        $.ajax({
            url: `/api/transaction/waiting/${transactionId}`, // 실제 엔드포인트에 맞춰 수정
            method: "PUT", // 또는 PATCH
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(updateDto),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader(header, token);
            },
            success: function (response) {
                alert("**Successfully updated");
                window.location.href = `/transaction/transactionOutboundHistoryDetail/${transactionId}`;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("업데이트 실패:", textStatus, errorThrown);
                alert("**An error occurred while updating.");
            }
        });

    });

    let prevSelectedText = $('#typeSelect').find('option:selected').text().trim();

    // GME Bank를 선택했을 경우, gme의 송금 reason 내용을 purposeOfRemittance에 표시하도록 하는 메소드
    $('#typeSelect').on('change', function () {
        const selectedText = $(this).find('option:selected').text().trim();
        const findTranglo = $(this).find('option:selected').text().toLowerCase().includes("tranglo")

        if (selectedText === 'GME Bank' && prevSelectedText !== selectedText) {
            const hiddenOptions = $('#gmeReason').html();
            $('#purposeOfRemittance').html(hiddenOptions);
            $('#purposeOfRemittance').val('');
        } else if (findTranglo) {
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
